"""Check an interaction log: structure, hash chain and the order of events.

A log is a JSON Lines file with one event on each line, in the order the events
were written. JSON Schema checks each event. This second step checks what JSON
Schema cannot: the hash chain, unique identifiers, time order, corrections and
reverts, and deletion.

The hash of an event is SHA-256 over its canonical JSON, including its own
prev_hash. Each event's prev_hash is "sha256:" and the hash of the event on the
line before. The first event of a first segment has prev_hash null. A later
segment starts with the last hash of the segment before it, so an old segment
can be deleted whole when its retention ends.

Passing these checks does not make a log anonymous or safe to share.

Run: python3 schema/validate_interactions.py log.jsonl [--systems a,b] [--continuation]
Messages contain line numbers, field names and rule names, never submitted values.
"""

import hashlib
import json
import re
import sys
from datetime import datetime
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

SCHEMA = json.loads(Path(__file__).with_name("interaction.schema.json").read_text(encoding="utf-8"))
VALIDATOR = Draft202012Validator(SCHEMA, format_checker=FormatChecker())
TIMESTAMP = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:[Zz]|[+-][0-9]{2}:[0-9]{2})")


def canonical(event):
    """The exact bytes that are hashed."""
    return json.dumps(event, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def event_hash(event):
    """The value the next event carries in prev_hash."""
    return "sha256:" + hashlib.sha256(canonical(event)).hexdigest()


def _instant(text):
    if not isinstance(text, str) or not TIMESTAMP.fullmatch(text):
        return None
    try:
        return datetime.fromisoformat(text.upper().replace("Z", "+00:00"))
    except ValueError:
        return None


def problems(events, expected_systems=None, continuation=False):
    """Return content-free messages for a list of events in file order.

    expected_systems: codes of every system that must confirm a deletion.
    continuation: the file is a later segment. Enquiries opened in an earlier
        segment are then allowed to appear without their first event.
    """
    errors = []
    structural = False
    for number, event in enumerate(events, 1):
        if not isinstance(event, dict):
            errors.append(f"event {number}: not an object")
            structural = True
            continue
        for error in VALIDATOR.iter_errors(event):
            path = ".".join(map(str, error.absolute_path)) or "event"
            errors.append(f"event {number}: {path}: {error.validator}")
            structural = True
    if structural:
        return errors

    times = []
    for number, event in enumerate(events, 1):
        when = _instant(event["occurred_at"])
        if when is None:
            errors.append(f"event {number}: occurred_at: unsupported date-time")
        times.append(when)
        if event.get("ai"):
            approved = _instant(event["ai"]["approved_at"])
            if approved is None:
                errors.append(f"event {number}: ai.approved_at: unsupported date-time")
            elif when is not None and approved > when:
                errors.append(f"event {number}: ai.approved_at: must not be after occurred_at")
    if errors:
        return errors

    # Hash chain. The first event may start a first segment (null) or carry a
    # hash over from an earlier segment, which this file cannot check.
    for number in range(2, len(events) + 1):
        if events[number - 1]["prev_hash"] != event_hash(events[number - 2]):
            errors.append(f"event {number}: prev_hash: chain broken")

    seen = {}
    for number, event in enumerate(events, 1):
        if event["event_id"] in seen:
            errors.append(f"event {number}: event_id: duplicate")
        else:
            seen[event["event_id"]] = number

    by_enquiry = {}
    for number, event in enumerate(events, 1):
        by_enquiry.setdefault(event["enquiry_id"], []).append(number)

    carried = set()  # enquiries opened in an earlier segment
    for enquiry, numbers in by_enquiry.items():
        first = events[numbers[0] - 1]
        received = [n for n in numbers if events[n - 1]["event_type"] == "enquiry_received"]
        if first["event_type"] != "enquiry_received":
            if continuation and not received:
                carried.add(enquiry)
            else:
                errors.append(f"event {numbers[0]}: event_type: first event for an enquiry must be enquiry_received")
        if len(received) > 1:
            errors.append(f"event {received[1]}: event_type: enquiry_received repeated")
        if received:
            start = times[received[0] - 1]
            for n in numbers:
                if times[n - 1] < start:
                    errors.append(f"event {n}: occurred_at: must not be earlier than enquiry_received")

    reverted = set()
    for number, event in enumerate(events, 1):
        target = event.get("supersedes")
        if target is None:
            continue
        where = seen.get(target)
        if where is None:
            if event["enquiry_id"] not in carried:
                errors.append(f"event {number}: supersedes: no such event")
            continue
        if where >= number:
            errors.append(f"event {number}: supersedes: must point to an earlier event")
        elif events[where - 1]["enquiry_id"] != event["enquiry_id"]:
            errors.append(f"event {number}: supersedes: must be the same enquiry")
        elif event["event_type"] == "event_reverted":
            if target in reverted:
                errors.append(f"event {number}: supersedes: event already reverted")
            reverted.add(target)

    expected = set(expected_systems) if expected_systems is not None else None
    for enquiry, numbers in by_enquiry.items():
        requested = False
        completed = set()
        finished = False
        for n in numbers:
            kind = events[n - 1]["event_type"]
            system = events[n - 1].get("data", {}).get("system")
            if finished:
                errors.append(f"event {n}: event_type: no events are allowed after deletion is complete")
                continue
            if kind == "deletion_requested":
                requested = True
            elif kind == "deletion_completed":
                if not requested and enquiry not in carried:
                    errors.append(f"event {n}: event_type: deletion_completed needs an earlier deletion_requested")
                if expected is None:
                    # Without a list of systems, the first completion ends
                    # the record. Further completions are still allowed.
                    completed.add(system)
                    for later in numbers[numbers.index(n) + 1:]:
                        if events[later - 1]["event_type"] != "deletion_completed":
                            errors.append(f"event {later}: event_type: no events are allowed after deletion is complete")
                    break
                if system not in expected:
                    errors.append(f"event {n}: data.system: not an expected system")
                elif system in completed:
                    errors.append(f"event {n}: data.system: deletion already completed for this system")
                completed.add(system)
                if expected <= completed:
                    finished = True
        if expected is not None and requested and not expected <= completed:
            errors.append(f"enquiry with event {numbers[0]}: deletion_completed: missing for an expected system")
    return errors


def read_events(path):
    """Read a JSON Lines file. Raises ValueError without quoting content."""
    events = []
    text = Path(path).read_text(encoding="utf-8")
    for number, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            raise ValueError(f"line {number}: blank line")
        try:
            events.append(json.loads(line))
        except ValueError:
            raise ValueError(f"line {number}: not JSON") from None
    return events


def main(argv):
    systems = None
    continuation = False
    files = []
    args = list(argv)
    while args:
        arg = args.pop(0)
        if arg == "--systems" and args:
            systems = [s for s in args.pop(0).split(",") if s]
        elif arg == "--continuation":
            continuation = True
        elif arg.startswith("--"):
            files = []
            break
        else:
            files.append(arg)
    if not files:
        print("Use: python3 schema/validate_interactions.py log.jsonl [--systems a,b] [--continuation]", file=sys.stderr)
        return 2
    failed = False
    for filename in files:
        try:
            events = read_events(filename)
        except (OSError, UnicodeError, ValueError) as error:
            print(str(error) if isinstance(error, ValueError) else "Could not read the log.", file=sys.stderr)
            return 2
        errors = problems(events, systems, continuation)
        if errors:
            failed = True
            print("\n".join(errors))
    if not failed:
        print("The supplied logs pass structure, chain and event-order checks. Keep real logs private.")
    return int(failed)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
