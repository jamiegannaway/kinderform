"""Append events to an interaction log and verify the log.

The log is a JSON Lines file: one event on each line, only ever added to. This
tool adds the right prev_hash for you, checks the whole log with the schema and
the order rules in schema/validate_interactions.py, and then adds the line.

  python3 tools/interaction_log.py append LOG.jsonl [EVENT.json | -] [--prev-hash HASH] [--continuation]
  python3 tools/interaction_log.py verify LOG.jsonl [--systems a,b] [--continuation]

Give append an event without prev_hash. A new, empty log starts with prev_hash
null. To start a later segment, give the last hash of the segment before with
--prev-hash. Messages never contain submitted values. Keep real logs private.

Two programs may add to one log at the same time. append holds a lock on the
file while it reads the last hash and writes the new line, so each waits its
turn and the chain stays whole. The lock is the operating system's advisory
file lock: it works between programs that use this tool, on one machine. It
does not stop a program that writes to the file without it. On a network drive
file locks are not dependable, so keep one writer there.
"""

import json
import os
import sys
from contextlib import contextmanager
from pathlib import Path

try:
    import fcntl
except ImportError:  # Windows
    fcntl = None
    import msvcrt

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


@contextmanager
def _locked(path):
    """Open the log for adding and hold an exclusive lock until the block ends.

    Another program that calls this waits here. The file is made if it is
    missing, and is never removed: a waiting program may already hold it open.
    """
    with path.open("a", encoding="utf-8", newline="\n") as handle:
        if fcntl:
            fcntl.flock(handle, fcntl.LOCK_EX)
        else:  # Windows: lock the first byte. msvcrt waits about 10 seconds, then raises OSError.
            handle.seek(0)
            msvcrt.locking(handle.fileno(), msvcrt.LK_LOCK, 1)
        try:
            yield handle
        finally:
            if fcntl:
                fcntl.flock(handle, fcntl.LOCK_UN)
            else:
                handle.seek(0)
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)


def append(path, event, prev_hash=None, continuation=False):
    """Add one event to the log at path. Raises ValueError with content-free text.

    prev_hash is used only when the log is new or empty (a later segment).
    The log is read, checked and added to under one lock, so two programs
    cannot both link to the same last event.
    """
    if not isinstance(event, dict) or "prev_hash" in event:
        raise ValueError("Give an event object without prev_hash.")
    path = Path(path)
    with _locked(path) as handle:
        existing = read_events(path) if path.stat().st_size else []
        if existing:
            if prev_hash is not None:
                raise ValueError("--prev-hash is only for the first event of a new segment.")
            prev_hash = event_hash(existing[-1])
        event = {**event, "prev_hash": prev_hash}
        errors = problems([*existing, event], continuation=continuation)
        if errors:
            raise ValueError("The event does not fit the log:\n" + "\n".join(errors[-5:]))
        line = json.dumps(event, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        handle.write(line + "\n")
        handle.flush()
        os.fsync(handle.fileno())  # on disk before the lock is released
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
