"""Check the interaction log examples and rules.

- schema/examples/interaction/valid/*.jsonl must pass.
- schema/examples/interaction/invalid/*.jsonl must fail, each with the rule in its name.
- A few rules are also tried on small inline logs.
Run from the repository root:  python tests/validate_interactions.py
"""

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "schema"))
sys.path.insert(0, str(ROOT / "tools"))
from validate_interactions import event_hash, problems, read_events  # noqa: E402
from interaction_log import append, link  # noqa: E402

EXAMPLES = ROOT / "schema" / "examples" / "interaction"
BOTH = ["example-council-crm", "example-email-archive"]
# invalid file -> (text its messages must contain, systems to check or None)
EXPECTED = {
    "broken-chain": ("chain broken", None),
    "ai-assisted-without-approval": ("ai.human_approved: const", None),
    "conversation-held-by-ai": ("actor.kind: const", None),
    "ai-approved-after-event": ("ai.approved_at: must not be after occurred_at", None),
    "event-after-deletion": ("no events are allowed after deletion is complete", None),
    "revert-of-missing-event": ("supersedes: no such event", None),
    "free-text-in-data": ("data: additionalProperties", None),
    "duplicate-event-id": ("event_id: duplicate", None),
    "first-event-not-enquiry-received": ("first event for an enquiry must be enquiry_received", None),
    "event-reverted-twice": ("event already reverted", None),
    "deletion-incomplete-for-listed-systems": ("missing for an expected system", BOTH),
    "deletion-completed-without-request": ("needs an earlier deletion_requested", None),
}
failures = 0


def check(ok, label, detail=""):
    global failures
    print(f"  {'ok  ' if ok else 'FAIL'} {label}")
    if not ok:
        failures += 1
        if detail:
            print(f"         {detail}")


Draft202012Validator.check_schema(json.loads((ROOT / "schema" / "interaction.schema.json").read_text(encoding="utf-8")))
print("valid")
for path in sorted((EXAMPLES / "valid").glob("*.jsonl")):
    systems = BOTH if path.stem == "deletion-two-systems" else None
    errors = problems(read_events(path), systems)
    check(not errors, path.name, "; ".join(errors))
print("invalid")
files = sorted((EXAMPLES / "invalid").glob("*.jsonl"))
check({p.stem for p in files} == set(EXPECTED), "every invalid file has an expected rule")
for path in files:
    text, systems = EXPECTED.get(path.stem, ("", None))
    errors = problems(read_events(path), systems)
    check(any(text in e for e in errors) and len(errors) >= 1, path.name, "; ".join(errors) or "no errors")

print("inline rules")
base = [
    {"schema_version": "0.1", "event_id": "evt-test-0001", "enquiry_id": "example-t1", "occurred_at": "2026-11-16T09:00:00Z",
     "source": "example-council-crm", "event_type": "enquiry_received", "actor": {"kind": "automated"}},
    {"schema_version": "0.1", "event_id": "evt-test-0002", "enquiry_id": "example-t1", "occurred_at": "2026-11-16T09:05:00Z",
     "source": "example-council-crm", "event_type": "contact_attempted", "actor": {"kind": "human"}},
]
check(not problems(link(base)), "a short log passes")
check(not problems(link(base), []), "an empty system list is allowed when nothing is deleted")
check(problems(link([base[0], {**base[1], "occurred_at": "2026-11-16T08:00:00Z"}])), "an event earlier than enquiry_received fails")
check(problems(link([{**base[0], "occurred_at": "2026-11-16T09:00:00"}])), "a time without a zone fails")
check(problems([{**base[0], "prev_hash": "sha256:" + "0" * 64}, link(base)[1]]) , "a second event that does not follow the first fails")
check(problems(link([base[0], {**base[1], "ai": {}}])), "ai on a non-AI event fails")
check(problems(link([base[0], {**base[1], "actor": {"kind": "human", "name": "x"}}])), "a name in actor fails")
check(problems(link([base[0], {**base[1], "event_type": "record_corrected"}])), "a correction needs supersedes")
check(any("earlier event" in e for e in problems(link([base[0], {**base[1], "event_id": "evt-test-0003", "event_type": "record_corrected", "supersedes": "evt-test-0003"}]))),
      "supersedes must point to an earlier event")
other = {**base[1], "event_id": "evt-test-0003", "enquiry_id": "example-t2"}
other_start = {**base[0], "event_id": "evt-test-0004", "enquiry_id": "example-t2"}
check(any("same enquiry" in e for e in problems(link([base[0], other_start, {**base[1], "event_id": "evt-test-0005", "event_type": "event_reverted", "supersedes": "evt-test-0001", "enquiry_id": "example-t2"}]))),
      "supersedes must be the same enquiry")

# Deletion without a list of systems: further completions are allowed, other events are not.
dele = [*base, {**base[1], "event_id": "evt-test-0005", "event_type": "deletion_requested"},
        {**base[1], "event_id": "evt-test-0006", "event_type": "deletion_completed", "data": {"system": "example-council-crm"}},
        {**base[1], "event_id": "evt-test-0007", "event_type": "deletion_completed", "data": {"system": "example-email-archive"}}]
check(not problems(link(dele)), "more completions may follow the first")
check(problems(link([*dele, {**base[1], "event_id": "evt-test-0008"}])), "no other event may follow a completion")
check(not problems(link(dele), BOTH), "both systems complete")
check(problems(link(dele), [*BOTH, "example-backup"]), "a listed system that never completes fails")
check(problems(link(dele), ["example-council-crm"]), "an unexpected system fails")
check(problems(link([*dele, {**dele[-1], "event_id": "evt-test-0008"}]), BOTH), "an event after all systems complete fails")
check(problems(link([*dele[:4], {**dele[3], "event_id": "evt-test-0009"}]), BOTH),
      "the same system twice fails")

# Continuation segment: enquiries opened earlier are allowed only when asked for.
tail = link([{**base[1], "event_id": "evt-test-0010"}], "sha256:" + "1" * 64)
check(problems(tail), "an enquiry with no start fails by default")
check(not problems(tail, continuation=True), "an open enquiry passes in a continuation segment")

# Messages never quote values.
leak = {**base[1], "source": "SecretValue-123"}
check(all("SecretValue" not in e for e in problems(link([base[0], leak]))), "messages hold no values")

print("append tool")
import tempfile
with tempfile.TemporaryDirectory() as folder:
    log = Path(folder) / "log.jsonl"
    first = append(log, base[0])
    second = append(log, base[1])
    check(first["prev_hash"] is None and second["prev_hash"] == event_hash(first), "append sets prev_hash from the line before")
    check(not problems(read_events(log)), "an appended log passes")
    try:
        append(log, {**base[1], "event_id": "evt-test-0020", "actor": {"kind": "ai_assisted"}})
        check(False, "append refuses an event that fails the schema")
    except ValueError:
        check(len(read_events(log)) == 2, "append refuses an event that fails the schema and leaves the log alone")
    try:
        append(log, {**base[1], "event_id": "evt-test-0021", "prev_hash": None})
        check(False, "append refuses an event that brings its own prev_hash")
    except ValueError:
        check(True, "append refuses an event that brings its own prev_hash")
    segment = Path(folder) / "segment.jsonl"
    carried = append(segment, {**base[0], "event_id": "evt-test-0030", "enquiry_id": "example-t9"}, prev_hash=event_hash(second))
    check(carried["prev_hash"] == event_hash(second) and not problems(read_events(segment)), "append can start a segment from a carried hash")

if failures:
    print(f"\n{failures} check(s) did not behave as expected")
    sys.exit(1)
print("\nInteraction log examples and rules behave as expected")
