"""Exercise monitoring records that affect waiting-time measurements."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "schema"))
from validate_enquiry import problems

base = {
    "schema_version": "0.1", "enquiry_id": "SYN-EVENT-CHECK",
    "received_at": "2026-11-26T12:00:00Z", "channel": "web_form", "status": "received",
}
assert not problems(base), "An arrival can be recorded before intent is declared"
assert not problems({**base, "intent_tier": "information"})
assert problems({**base, "intent_tier": "inferred"})
assert problems({**base, "status": "contact_attempted"}), "An attempted milestone needs its time"
assert problems({**base, "status": "conversation_held"}), "A conversation needs its time"
assert problems({**base, "first_contact_made_at": "2026-11-26T11:59:59Z"})
assert problems({**base, "acknowledged_at": "2026-11-26T12:59:59+01:00"})
assert problems({**base, "status_updated_at": "2026-11-26T11:00:00Z"})
assert problems({**base, "first_contact_made_at": "not a date"})
assert problems({**base, "first_contact_made_at": "2026-11-26T13:00:00"}), "Time zone is required"
assert not problems({**base, "acknowledged_at": "2026-11-26T13:00:00+01:00"}), "Compare instants, not clock text"
assert not problems({**base, "status_updated_at": base["received_at"],
                     "acknowledged_at": "2026-11-26T12:00:30Z"}), "Acknowledgement can follow initial status"
conversation = {
    **base, "status": "conversation_held", "first_contact_attempt_at": "2026-11-26T13:00:00+01:00",
    "first_contact_made_at": "2026-11-26T12:05:00Z", "status_updated_at": "2026-11-26T12:05:00Z",
}
assert not problems(conversation)
assert problems({**conversation, "first_contact_attempt_at": "2026-11-26T12:06:00Z"})
assert problems({**conversation, "status_updated_at": "2026-11-26T12:04:00Z"})
assert not problems({**base, "status": "conversation_held", "first_contact_made_at": base["received_at"]}), "Inbound conversation needs no invented attempt"
assert problems({**base, "full_name": "Synthetic Example"})
assert all("Synthetic Example" not in message for message in problems({**base, "full_name": "Synthetic Example"}))
print("Monitoring intent, milestone, time-zone and event-order checks pass.")
