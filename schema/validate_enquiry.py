"""Check a private enquiry record's structure and event order.

JSON Schema checks individual values and required milestone fields. This second
step compares timestamps as instants, including their time zones. Passing these
checks does not make a record anonymous or suitable for publication.

Run: python3 schema/validate_enquiry.py synthetic.json
Error messages contain field names and rule names, never submitted values.
"""

import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

SCHEMA = json.loads(Path(__file__).with_name("enquiry.schema.json").read_text(encoding="utf-8"))
VALIDATOR = Draft202012Validator(SCHEMA, format_checker=FormatChecker())
EVENTS = (
    "acknowledged_at", "first_contact_attempt_at", "first_contact_made_at", "status_updated_at",
    "deletion_requested_at",
)
TIMESTAMP = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?(?:[Zz]|[+-][0-9]{2}:[0-9]{2})")


def problems(record):
    """Return content-free validation messages for one monitoring record."""
    errors = [
        f"{'.'.join(map(str, error.absolute_path)) or 'enquiry'}: {error.validator}"
        for error in VALIDATOR.iter_errors(record)
    ]
    if errors:
        return errors

    times = {}
    for field in ("received_at", *EVENTS):
        if field not in record:
            continue
        try:
            # jsonschema's date-time format checker has optional dependencies;
            # enforce the timezone-bearing RFC 3339 shape even without them.
            if not TIMESTAMP.fullmatch(record[field]):
                raise ValueError
            times[field] = datetime.fromisoformat(record[field].upper().replace("Z", "+00:00"))
        except ValueError:
            errors.append(f"{field}: unsupported date-time")
    if errors:
        return errors

    for field in EVENTS:
        if field in times and times[field] < times["received_at"]:
            errors.append(f"{field}: must not precede received_at")

    attempt, made, updated = (times.get(field) for field in (
        "first_contact_attempt_at", "first_contact_made_at", "status_updated_at"
    ))
    if attempt is not None and made is not None and made < attempt:
        errors.append("first_contact_made_at: must not precede first_contact_attempt_at")
    # An acknowledgement is independent of the status change. It can follow the
    # initial 'received' status, so do not force it before status_updated_at.
    if updated is not None:
        if attempt is not None and updated < attempt:
            errors.append("status_updated_at: must not precede first_contact_attempt_at")
        if made is not None and updated < made:
            errors.append("status_updated_at: must not precede first_contact_made_at")

    # Retention: compare the date as written in received_at, so a record
    # received late in the evening keeps its own calendar day.
    if "retain_until" in record:
        try:
            retain_until = date.fromisoformat(record["retain_until"])
        except ValueError:
            errors.append("retain_until: unsupported date")
        else:
            if retain_until < times["received_at"].date():
                errors.append("retain_until: must not be before the date of received_at")
    return errors


def main(filenames):
    if not filenames:
        print("Use: python3 schema/validate_enquiry.py synthetic.json", file=sys.stderr)
        return 2
    failed = False
    for filename in filenames:
        try:
            record = json.loads(Path(filename).read_text(encoding="utf-8"))
        except (OSError, UnicodeError, ValueError):
            print("Could not read a record as JSON.", file=sys.stderr)
            return 2
        errors = problems(record)
        if errors:
            failed = True
            print("\n".join(errors))
    if not failed:
        print("The supplied records pass structure and event-order checks. Keep real records private.")
    return int(failed)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
