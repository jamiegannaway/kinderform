"""Append events to an interaction log and verify the log.

The log is a JSON Lines file: one event on each line, only ever added to. This
tool adds the right prev_hash for you, checks the whole log with the schema and
the order rules in schema/validate_interactions.py, and then adds the line.

  python3 tools/interaction_log.py append LOG.jsonl [EVENT.json | -] [--prev-hash HASH] [--continuation]
  python3 tools/interaction_log.py verify LOG.jsonl [--systems a,b] [--continuation]

Give append an event without prev_hash. A new, empty log starts with prev_hash
null. To start a later segment, give the last hash of the segment before with
--prev-hash. Messages never contain submitted values. Keep real logs private.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "schema"))
from validate_interactions import event_hash, problems, read_events  # noqa: E402


def link(events, prev_hash=None):
    """Return copies of events with prev_hash set, in order. For making fixtures."""
    linked = []
    for event in events:
        event = {**{k: v for k, v in event.items() if k != "prev_hash"}, "prev_hash": prev_hash}
        linked.append(event)
        prev_hash = event_hash(event)
    return linked


def append(path, event, prev_hash=None, continuation=False):
    """Add one event to the log at path. Raises ValueError with content-free text.

    prev_hash is used only when the log is new or empty (a later segment).
    """
    if not isinstance(event, dict) or "prev_hash" in event:
        raise ValueError("Give an event object without prev_hash.")
    path = Path(path)
    existing = read_events(path) if path.exists() and path.stat().st_size else []
    if existing:
        if prev_hash is not None:
            raise ValueError("--prev-hash is only for the first event of a new segment.")
        prev_hash = event_hash(existing[-1])
    event = {**event, "prev_hash": prev_hash}
    errors = problems([*existing, event], continuation=continuation)
    if errors:
        raise ValueError("The event does not fit the log:\n" + "\n".join(errors[-5:]))
    line = json.dumps(event, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    with path.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(line + "\n")
    return event


def verify(path, systems=None, continuation=False):
    """Return the validator's messages for the log at path."""
    return problems(read_events(path), systems, continuation)


def main(argv):
    usage = "Use: interaction_log.py append LOG [EVENT.json | -] [--prev-hash H] [--continuation] | verify LOG [--systems a,b] [--continuation]"
    if len(argv) < 2 or argv[0] not in ("append", "verify"):
        print(usage, file=sys.stderr)
        return 2
    command, log, rest = argv[0], argv[1], list(argv[2:])
    options = {"prev_hash": None, "systems": None, "continuation": False}
    positional = []
    while rest:
        arg = rest.pop(0)
        if arg == "--continuation":
            options["continuation"] = True
        elif arg == "--prev-hash" and rest:
            options["prev_hash"] = rest.pop(0)
        elif arg == "--systems" and rest:
            options["systems"] = [s for s in rest.pop(0).split(",") if s]
        elif arg == "-" or not arg.startswith("--"):
            positional.append(arg)
        else:
            print(usage, file=sys.stderr)
            return 2
    try:
        if command == "verify":
            errors = verify(log, options["systems"], options["continuation"])
            if errors:
                print("\n".join(errors))
                return 1
            print("The log passes structure, chain and event-order checks. Keep real logs private.")
            return 0
        source = positional[0] if positional else "-"
        text = sys.stdin.read() if source == "-" else Path(source).read_text(encoding="utf-8")
        try:
            event = json.loads(text)
        except ValueError:
            print("The event is not JSON.", file=sys.stderr)
            return 2
        added = append(log, event, options["prev_hash"], options["continuation"])
        print("Added one event. Its hash is " + event_hash(added))
        return 0
    except (OSError, UnicodeError, ValueError) as error:
        print(str(error) if isinstance(error, ValueError) else "Could not read or write a file.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
