"""Check the US front-door register for shape, sources and personal data.

Run from the repository root:  python tests/validate_us_register.py
Standard library only.
"""

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
US = ROOT / "register" / "us"

STATE_CODES = set(
    "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS "
    "MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split()
)

HEADERS = {
    "states.csv": [
        "state_code", "state_name", "administration", "local_units", "lead_agency",
        "lead_agency_website", "foster_info_url", "adoption_info_url",
        "licensing_lookup_url", "source_url", "date_checked", "evidence_level",
        "verification", "notes",
    ],
    "front-doors.csv": [
        "front_door_id", "name", "state_code", "level", "sector", "operator",
        "contracted", "services", "coverage", "website", "form_url", "first_step",
        "stated_response_time", "form_fields_observed", "source_url", "date_checked",
        "evidence_level", "verification", "notes",
    ],
    "form-questions.csv": [
        "front_door_id", "question_order", "question_paraphrase", "topic", "required",
        "answer_type", "source_url", "date_checked", "evidence_level", "verification",
    ],
    "response-promises.csv": [
        "front_door_id", "promise_quote", "stage", "channel", "stated_hours",
        "source_url", "date_checked", "evidence_level", "verification",
    ],
}

ENUMS = {
    "administration": {"state_administered", "county_administered", "hybrid"},
    "level": {"state", "county", "city", "regional", "tribal"},
    "sector": {"public", "tribal", "private_nonprofit", "private_for_profit"},
    "contracted": {"yes", "no"},
    "services": {"fostering", "adoption", "both"},
    "first_step": {"web_form", "phone_or_email", "info_session", "online_portal", "not_recorded"},
    "form_fields_observed": {"yes", "no"},
    "evidence_level": {"search_result", "page_read", "form_read"},
    "verification": {"unverified", "verified"},
    "required": {"yes", "no", "unknown"},
    "answer_type": {
        "free_text", "single_choice", "multi_choice", "date", "number", "yes_no",
        "consent", "other",
    },
    "stage": {"acknowledgement", "first_contact", "info_session", "application", "other"},
    "channel": {"phone", "email", "letter", "any", "unknown"},
}

REQUIRED = {
    "states.csv": ["state_code", "state_name", "administration", "lead_agency",
                   "source_url", "date_checked", "evidence_level", "verification"],
    "front-doors.csv": ["front_door_id", "name", "state_code", "level", "sector",
                        "operator", "contracted", "services", "first_step",
                        "form_fields_observed", "source_url", "date_checked",
                        "evidence_level", "verification"],
    "form-questions.csv": ["front_door_id", "question_order", "question_paraphrase",
                           "topic", "required", "answer_type", "source_url",
                           "date_checked", "evidence_level", "verification"],
    "response-promises.csv": ["front_door_id", "promise_quote", "stage", "channel",
                              "source_url", "date_checked", "evidence_level",
                              "verification"],
}

URL_COLUMNS = {"lead_agency_website", "foster_info_url", "adoption_info_url",
               "licensing_lookup_url", "source_url", "website", "form_url"}

DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
URL = re.compile(r"^https?://[^\s/]+\.[^\s]+$")
FRONT_DOOR_ID = re.compile(r"^us-[a-z]{2}-[a-z0-9]+(-[a-z0-9]+)*$")
# Personal-data guards: no email addresses or phone numbers anywhere in the register.
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE = re.compile(r"(?<!\d)(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)")


def topic_codes() -> set[str]:
    text = (US / "question-topics.md").read_text(encoding="utf-8")
    return set(re.findall(r"^\| `([a-z_]+)` \|", text, flags=re.M))


def read(name: str):
    with (US / name).open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return reader.fieldnames, list(reader)


def main() -> int:
    errors: list[str] = []
    topics = topic_codes()
    tables = {}

    for name, header in HEADERS.items():
        fields, rows = read(name)
        tables[name] = rows
        if fields != header:
            errors.append(f"{name}: header does not match register/us/README.md")
            continue
        for number, row in enumerate(rows, start=2):
            where = f"{name}:{number}"
            if None in row:
                errors.append(f"{where}: more cells than columns")
                continue
            for column in REQUIRED[name]:
                if not row[column].strip():
                    errors.append(f"{where}: {column} is empty")
            for column, value in row.items():
                if column in ENUMS and value and value not in ENUMS[column]:
                    errors.append(f"{where}: {column} '{value}' is not an allowed value")
                if column in URL_COLUMNS and value and not URL.match(value):
                    errors.append(f"{where}: {column} is not a URL: {value}")
                if EMAIL.search(value):
                    errors.append(f"{where}: {column} looks like it holds an email address")
                if column not in URL_COLUMNS and PHONE.search(value):
                    errors.append(f"{where}: {column} looks like it holds a phone number")
                if value != value.strip():
                    errors.append(f"{where}: {column} has leading or trailing spaces")
            if row.get("date_checked") and not DATE.match(row["date_checked"]):
                errors.append(f"{where}: date_checked must be YYYY-MM-DD")
            if "state_code" in row and row["state_code"] not in STATE_CODES:
                errors.append(f"{where}: unknown state_code '{row['state_code']}'")
            if row.get("verification") == "verified" and row.get("evidence_level") == "search_result":
                errors.append(f"{where}: a verified row needs page_read or form_read")

    states = tables["states.csv"]
    doors = tables["front-doors.csv"]

    # states.csv: one row per state and DC, no more
    codes = [row["state_code"] for row in states]
    for code in sorted({c for c in codes if codes.count(c) > 1}):
        errors.append(f"states.csv: {code} appears more than once")
    if states:
        missing = STATE_CODES - set(codes)
        if missing:
            print(f"note states.csv: not yet covered: {', '.join(sorted(missing))}")
    for row in states:
        if row["administration"] in {"county_administered", "hybrid"} and not row["local_units"].strip():
            errors.append(f"states.csv: {row['state_code']} needs local_units")
        if row["local_units"] and not row["local_units"].isdigit():
            errors.append(f"states.csv: {row['state_code']} local_units must be a whole number")

    # front-doors.csv
    ids = [row["front_door_id"] for row in doors]
    for front_door_id in sorted({i for i in ids if ids.count(i) > 1}):
        errors.append(f"front-doors.csv: {front_door_id} appears more than once")
    for row in doors:
        fid = row["front_door_id"]
        if not FRONT_DOOR_ID.match(fid):
            errors.append(f"front-doors.csv: bad front_door_id '{fid}'")
        elif fid[3:5] != row["state_code"].lower():
            errors.append(f"front-doors.csv: {fid} does not start with its state code")
        if row["level"] == "tribal" and row["sector"] != "tribal" and row["contracted"] != "yes":
            errors.append(f"front-doors.csv: {fid} is tribal level but not tribal sector")
        if row["contracted"] == "yes" and row["sector"] in {"public", "tribal"}:
            errors.append(f"front-doors.csv: {fid} is contracted, so sector should be the operator's")
        if row["form_fields_observed"] == "yes" and row["evidence_level"] != "form_read":
            errors.append(f"front-doors.csv: {fid} says fields observed but evidence_level is not form_read")

    # child tables
    known = set(ids)
    for row in tables["form-questions.csv"]:
        if row["front_door_id"] not in known:
            errors.append(f"form-questions.csv: unknown front_door_id {row['front_door_id']}")
        if row["topic"] not in topics:
            errors.append(f"form-questions.csv: unknown topic '{row['topic']}'")
        if len(row["question_paraphrase"]) > 120:
            errors.append(f"form-questions.csv: paraphrase over 120 characters for {row['front_door_id']}")
        if row["evidence_level"] != "form_read":
            errors.append(f"form-questions.csv: {row['front_door_id']} evidence_level must be form_read")
        if not row["question_order"].isdigit():
            errors.append(f"form-questions.csv: question_order must be a whole number")
    for row in tables["response-promises.csv"]:
        if row["front_door_id"] not in known:
            errors.append(f"response-promises.csv: unknown front_door_id {row['front_door_id']}")
        if len(row["promise_quote"]) > 300:
            errors.append(f"response-promises.csv: quote over 300 characters for {row['front_door_id']}")
        if row["stated_hours"] and not row["stated_hours"].replace(".", "", 1).isdigit():
            errors.append(f"response-promises.csv: stated_hours must be a number")

    by_level: dict[str, int] = {}
    for row in doors:
        by_level[row["level"]] = by_level.get(row["level"], 0) + 1
    print(f"states.csv: {len(states)} rows")
    print(f"front-doors.csv: {len(doors)} rows " + str(dict(sorted(by_level.items()))))
    print(f"form-questions.csv: {len(tables['form-questions.csv'])} rows")
    print(f"response-promises.csv: {len(tables['response-promises.csv'])} rows")

    if errors:
        for error in errors:
            print(f"FAIL {error}")
        print(f"\n{len(errors)} problem(s) found")
        return 1
    print("\nUS register checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
