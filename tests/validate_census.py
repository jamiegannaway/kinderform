"""Check the intake-form census files in census/.

Checks that every file has the expected columns, that IDs are unique and link
up, that coded columns use the agreed values, and that no personal data or
market language has slipped in. Standard library only.

Run: python tests/validate_census.py
"""
import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CENSUS = ROOT / "census"
# Front doors can come from any country's register.
REGISTERS = [ROOT / "register" / "front-doors.csv", ROOT / "register" / "us" / "front-doors.csv",
             ROOT / "register" / "ca" / "front-doors.csv", ROOT / "register" / "au" / "front-doors.csv",
             ROOT / "register" / "de" / "front-doors.csv", ROOT / "register" / "fr" / "front-doors.csv",
             ROOT / "register" / "es" / "front-doors.csv"]

COLUMNS = {
    "forms.csv": ["form_id", "front_door_id", "name", "operator_type", "service_type", "country", "region", "form_stage",
                  "access_route", "form_url", "platform", "template_group", "fields_observed", "observed",
                  "date_checked", "source_url", "notes"],
    "questions.csv": ["question_id", "form_id", "order", "section", "label_paraphrased", "category", "topic",
                      "required", "input_type", "type_inferred", "conditional_on", "hint_paraphrased",
                      "observed", "date_checked"],
    "answer_options.csv": ["option_id", "question_id", "order", "option_label", "option_guidance"],
    "guidance.csv": ["guidance_id", "form_id", "guidance_type", "present", "summary_paraphrased", "value",
                     "source_url", "observed", "date_checked"],
    "taxonomy.csv": ["category", "topic", "description", "sensitivity", "england_fostering_stage_draft",
                     "kinderform_enquiry_field", "note"],
}

ALLOWED = {
    ("forms.csv", "operator_type"): {"regional_hub", "single_authority", "council", "council_consortium",
                                     "national_brand_council", "regional_service", "regional_adoption_agency",
                                     "voluntary_adoption_agency", "independent_fostering_agency", "platform_vendor",
                                     "state_agency", "county_agency", "private_agency", "child_welfare_agency",
                                     "indigenous_agency", "local_authority", "voluntary_agency"},
    ("forms.csv", "service_type"): {"fostering", "adoption", "fostering_and_adoption"},
    ("forms.csv", "country"): {"UK", "US", "CA", "AU", "DE", "FR", "ES"},
    ("forms.csv", "form_stage"): {"primary", "secondary"},
    ("forms.csv", "access_route"): {"online_form", "downloadable_form", "phone_conversation", "sent_after_first_contact",
                                    "email_only", "signposting_only", "described_not_public", "council_portal"},
    ("forms.csv", "fields_observed"): {"yes", "partial", "no"},
    ("questions.csv", "required"): {"yes", "no", "unknown", "n/a"},
    ("questions.csv", "input_type"): {"text", "email", "tel", "textarea", "select", "radio", "checkbox", "date",
                                      "statement", "calendar", "unknown"},
    ("questions.csv", "type_inferred"): {"yes", "no"},
    ("guidance.csv", "present"): {"yes", "no", "unknown"},
    ("guidance.csv", "guidance_type"): {"response_time", "later_step_time", "what_happens_next", "not_an_application",
                                        "eligibility", "privacy_notice_link", "data_controller", "lawful_basis",
                                        "data_sharing", "retention", "records_check", "marketing_consent",
                                        "declaration", "alternative_contact", "opening_hours",
                                        "accessibility_statement", "language_option", "technical_requirement",
                                        "information_pack", "information_event", "geographic_scope",
                                        "acknowledgement", "other"},
}
OBSERVED = {"direct_fetch", "index_snapshot", "search_snippet", "secondhand", "vendor_documentation"}
DATE = re.compile(r"^\d{4}-\d{2}(-\d{2})?$")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE = re.compile(
    r"(?<![\d/])(?:\+44\s?|0)\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}(?!\d)"  # UK and Australian landlines
    r"|(?<![\d/])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)"  # US and Canada
    r"|\b1[38]00[\s-]?\d{3}[\s-]?\d{3}\b")  # Australian 1300 and 1800 numbers
MARKET = re.compile(r"\b(supply|demand|leads?|conversion|funnel)\b", re.IGNORECASE)

errors = []


def err(msg):
    errors.append(msg)


def load(name):
    path = CENSUS / name
    if not path.exists():
        err(f"{name}: missing")
        return []
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames != COLUMNS[name]:
            err(f"{name}: columns are {reader.fieldnames}, expected {COLUMNS[name]}")
        return list(reader)


data = {name: load(name) for name in COLUMNS}
forms, questions, options, guidance, taxonomy = (data[n] for n in
                                                 ["forms.csv", "questions.csv", "answer_options.csv",
                                                  "guidance.csv", "taxonomy.csv"])

# Unique IDs
for name, key in [("forms.csv", "form_id"), ("questions.csv", "question_id"),
                  ("answer_options.csv", "option_id"), ("guidance.csv", "guidance_id")]:
    seen = set()
    for row in data[name]:
        if row[key] in seen:
            err(f"{name}: duplicate {key} {row[key]}")
        seen.add(row[key])

form_ids = {r["form_id"] for r in forms}
question_ids = {r["question_id"] for r in questions}
tax_keys = {(r["category"], r["topic"]) for r in taxonomy}

register_ids = set()
for path in REGISTERS:
    if path.exists():
        with open(path, newline="", encoding="utf-8") as fh:
            register_ids |= {r["front_door_id"] for r in csv.DictReader(fh)}

# Links
for r in forms:
    if r["front_door_id"] and r["front_door_id"] not in register_ids:
        err(f"forms.csv {r['form_id']}: front_door_id {r['front_door_id']} not in register")
for r in questions:
    if r["form_id"] not in form_ids:
        err(f"questions.csv {r['question_id']}: unknown form_id {r['form_id']}")
    if (r["category"], r["topic"]) not in tax_keys:
        err(f"questions.csv {r['question_id']}: {r['category']}/{r['topic']} not in taxonomy.csv")
for r in options:
    if r["question_id"] not in question_ids:
        err(f"answer_options.csv {r['option_id']}: unknown question_id {r['question_id']}")
for r in guidance:
    if r["form_id"] not in form_ids:
        err(f"guidance.csv {r['guidance_id']}: unknown form_id {r['form_id']}")

# Region must fit the country: a UK nation, a US state or DC, a Canadian province or territory,
# an Australian state or territory, a German Land, a French region or a Spanish autonomous community
UK_REGIONS = {"England", "Wales", "Scotland", "Northern Ireland", "UK"}
US_REGIONS = {"Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
              "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
              "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
              "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
              "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
              "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah",
              "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"}
CA_REGIONS = {"Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia",
              "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island", "Yukon", "Northwest Territories",
              "Nunavut", "Canada"}
AU_REGIONS = {"New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania",
              "Australian Capital Territory", "Northern Territory", "Australia"}
# Germany, France and Spain use the same region names as their front-door registers.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_world_register import COUNTRIES as WORLD  # noqa: E402

REGIONS = {"UK": UK_REGIONS, "US": US_REGIONS, "CA": CA_REGIONS, "AU": AU_REGIONS,
           "DE": set(WORLD["de"]), "FR": set(WORLD["fr"]), "ES": set(WORLD["es"])}
for r in forms:
    allowed = REGIONS.get(r["country"], set())
    if r["region"] not in allowed:
        err(f"forms.csv {r['form_id']}: region '{r['region']}' does not fit country {r['country']}")

# Coded values, dates and URLs
for (name, col), allowed in ALLOWED.items():
    for row in data[name]:
        if row[col] not in allowed:
            err(f"{name}: {col} value '{row[col]}' not allowed")
for name in ["forms.csv", "questions.csv", "guidance.csv"]:
    for row in data[name]:
        if row["observed"] not in OBSERVED:
            err(f"{name}: observed value '{row['observed']}' not allowed")
        if not DATE.match(row["date_checked"]):
            err(f"{name}: bad date_checked '{row['date_checked']}'")
for name, cols in [("forms.csv", ["form_url", "source_url"]), ("guidance.csv", ["source_url"])]:
    for row in data[name]:
        for col in cols:
            if row[col] and not row[col].startswith("https://"):
                err(f"{name}: {col} must start with https:// ({row[col]})")
for r in forms:
    if not r["source_url"]:
        err(f"forms.csv {r['form_id']}: source_url is required")

# No personal data, no market language
for name, rows in data.items():
    for row in rows:
        for col, val in row.items():
            if col.endswith("url"):
                continue
            if EMAIL.search(val):
                err(f"{name}: email-like text in {col}: {val[:60]}")
            if PHONE.search(val):
                err(f"{name}: phone-like text in {col}: {val[:60]}")
            if col not in ("option_label",) and MARKET.search(val):
                err(f"{name}: market language in {col}: {val[:60]}")

if errors:
    print(f"{len(errors)} problem(s):")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print(f"OK: {len(forms)} forms, {len(questions)} questions, {len(options)} answer options, "
      f"{len(guidance)} guidance rows, {len(taxonomy)} taxonomy topics")
