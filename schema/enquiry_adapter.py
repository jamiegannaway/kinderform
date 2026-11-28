"""Map a private fostering submission to an initial monitoring record.

The service must supply an independently generated random UUIDv4 and the actual
arrival time. This function never derives identity or intent from contact data.
It omits names, contact details and free text, but the result is still private,
potentially identifiable personal data. It is not a publication export.
"""

import json
from pathlib import Path
from uuid import UUID

from jsonschema import Draft202012Validator

if __package__:
    from .validate_enquiry import problems
else:
    from validate_enquiry import problems

SUBMISSION_SCHEMA = json.loads(Path(__file__).with_name("enquiry-submission.schema.json").read_text(encoding="utf-8"))
SUBMISSION_VALIDATOR = Draft202012Validator(SUBMISSION_SCHEMA)


def initial_enquiry(submission, *, enquiry_id, received_at, declared_intent=None):
    """Create the known initial fields, or raise a content-free ValueError.

    This first adapter covers fostering only. Adoption and undecided enquiries
    need their own agreed monitoring scope. Add acknowledgement/attempt/conversation
    timestamps only when those events happen, checking problems() after updates.
    """
    if not SUBMISSION_VALIDATOR.is_valid(submission):
        raise ValueError("Submission does not meet the submission schema.")
    if submission["interest"] != "fostering":
        raise ValueError("This monitoring adapter covers fostering submissions only.")
    try:
        if not isinstance(enquiry_id, str):
            raise ValueError
        identifier = UUID(enquiry_id)
        if identifier.version != 4 or str(identifier) != enquiry_id.lower():
            raise ValueError
    except (ValueError, AttributeError):
        raise ValueError("Supply an independently generated random UUIDv4.") from None
    record = {
        "schema_version": "0.1", "enquiry_id": enquiry_id, "received_at": received_at,
        "channel": "web_form", "status": "received",
    }
    if declared_intent is not None:
        record["intent_tier"] = declared_intent
    if "postcode_area" in submission:
        record["postcode_outward"] = submission["postcode_area"]
    if "updates_opt_in" in submission:
        record["marketing_consent"] = {"given": submission["updates_opt_in"]}
    if problems(record):
        raise ValueError("Initial enquiry does not meet monitoring validation rules.")
    return record
