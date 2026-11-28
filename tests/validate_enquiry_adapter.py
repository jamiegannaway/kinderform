"""Follow synthetic submission, acknowledgement, attempt and conversation events."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "schema"))
from enquiry_adapter import initial_enquiry
from validate_enquiry import problems

# Also exercise the normal package import used by local service adapters.
sys.path.insert(0, str(ROOT))
from schema.enquiry_adapter import initial_enquiry as package_initial_enquiry

submission = {
    "full_name": "Synthetic Example", "interest": "fostering", "knows_child": False,
    "contact_method": "email", "email": "synthetic@example.org", "postcode_area": "ZZ99",
    "updates_opt_in": False,
}
metadata = {"enquiry_id": "00000000-0000-4000-8000-000000000001", "received_at": "2026-11-26T12:00:00Z"}
record = initial_enquiry(submission, **metadata)
assert package_initial_enquiry(submission, **metadata) == record
assert not problems(record)
assert "intent_tier" not in record
assert set(record) == {"schema_version", "enquiry_id", "received_at", "channel", "status", "postcode_outward", "marketing_consent"}
assert "synthetic@example.org" not in str(record)
assert record["marketing_consent"] == {"given": False}
assert initial_enquiry(submission, declared_intent="information", **metadata)["intent_tier"] == "information"

record["acknowledged_at"] = "2026-11-26T12:00:10Z"
assert not problems(record)
record.update(status="contact_attempted", first_contact_attempt_at="2026-11-27T10:00:00Z")
assert not problems(record)
record.update(status="conversation_held", first_contact_made_at="2026-11-28T10:00:00Z", intent_tier="conversation")
assert not problems(record)
assert problems({**record, "first_contact_made_at": "2026-11-26T12:05:00Z"})

for changed_submission, changed_metadata in [
    ({**submission, "interest": "adoption"}, metadata),
    ({**submission, "interest": "not_sure"}, metadata),
    ({**submission, "phone": "07700 900982"}, metadata),
    (submission, {**metadata, "enquiry_id": "synthetic@example.org"}),
    (submission, {**metadata, "enquiry_id": "00000000-0000-1000-8000-000000000001"}),
    (submission, {**metadata, "received_at": "not a time"}),
    (submission, {**metadata, "declared_intent": "inferred"}),
]:
    try:
        initial_enquiry(changed_submission, **changed_metadata)
        raise AssertionError("Invalid adapter input was accepted")
    except ValueError as error:
        assert "synthetic@example.org" not in str(error)
print("Synthetic form-to-reply trace, intent provenance and monitoring allowlist pass.")
