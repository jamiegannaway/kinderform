"""Check the rules registers for every country except the United States.

Files:
- register/policies.csv     (England, Wales, Scotland, Northern Ireland)
- register/ca/policies.csv  (Canadian provinces and territories)
- register/au/policies.csv  (Australian states and territories)
- register/de/policies.csv  (Germany: federal law and the 16 Länder)
- register/fr/policies.csv  (France: national law and the regions)
- register/es/policies.csv  (Spain: national law and the autonomous communities and cities)
- register/ie/policies.csv, register/nl/policies.csv, register/nz/policies.csv and
  register/sg/policies.csv  (Ireland, the Netherlands, New Zealand and Singapore: national law)

The US rules are in register/us/policies.csv and are checked by validate_us_register.py.
Each row records what a published rule says, where it is written and when we checked it.
It never judges the rule.

Run from the repository root:  python tests/validate_policies.py
"""

import csv
import re
import sys
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HEADER = [
    "policy_id", "jurisdiction", "applies_to", "topic", "rule_summary", "value", "unit", "legal_citation",
    "source_type", "effective_date", "source_url", "date_checked", "evidence_level", "verification", "notes",
]
FILES = {
    "register/policies.csv": ("uk", {"ENG", "WLS", "SCT", "NIR"}),
    "register/ca/policies.csv": ("ca", {"AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"}),
    "register/au/policies.csv": ("au", {"NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"}),
    "register/de/policies.csv": ("de", {"DE", "BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL",
                                        "SN", "ST", "SH", "TH"}),
    "register/fr/policies.csv": ("fr", {"FR", "ARA", "BFC", "BRE", "CVL", "COR", "GES", "HDF", "IDF", "NOR", "NAQ",
                                        "OCC", "PDL", "PAC", "GP", "MQ", "GF", "RE", "YT"}),
    "register/es/policies.csv": ("es", {"ES", "AN", "AR", "AS", "IB", "PV", "CN", "CB", "CL", "CM", "CT", "EX", "GA",
                                        "RI", "MD", "MC", "NC", "VC", "CE", "ML"}),
    "register/ie/policies.csv": ("ie", {"IE"}),
    "register/nl/policies.csv": ("nl", {"NL"}),
    "register/nz/policies.csv": ("nz", {"NZ"}),
    "register/sg/policies.csv": ("sg", {"SG"}),
    "register/no/policies.csv": ("no", {"NO"}),
    "register/se/policies.csv": ("se", {"SE"}),
    "register/dk/policies.csv": ("dk", {"DK"}),
    "register/fi/policies.csv": ("fi", {"FI"}),
}
TOPICS = set(re.findall(r"^\| `([a-z_]+)` \|", (ROOT / "register/us/policy-topics.md").read_text(encoding="utf-8"), re.M))
APPLIES = {"fostering", "adoption", "both"}
SOURCE_TYPES = {"legislation", "statutory_guidance", "standards", "government_page", "agency_page", "sector_body"}
EVIDENCE = {"page_read", "search_result"}
VERIFICATION = {"unverified", "verified"}
UNITS = {
    "", "years", "months", "weeks", "days", "percent", "working_days", "hours", "children", "people", "sessions",
    "GBP_per_week", "CAD_per_day", "CAD_per_month", "AUD_per_fortnight", "AUD_per_week",
    "EUR_per_month", "EUR_per_week", "EUR_per_day", "EUR", "NZD_per_week", "NZD_per_fortnight", "SGD_per_month", "SGD",
    "NOK_per_month", "NOK",
    "SEK_per_month",
    "DKK_per_month", "DKK_per_day", "DKK_per_year", "DKK",
}
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE = re.compile(
    r"(?<![\d/])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)"
    r"|(?<![\d/])(?:\+61\s?|\+44\s?|0)\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4}(?!\d)"
    r"|\b1[38]00[\s-]?\d{3}[\s-]?\d{3}\b"
    r"|\+(?:49|33|34)[\s\d/.()-]{7,}"
    r"|\+(?:353|31|64|65)[\s\d()-]{7,}"
    r"|(?<![\d/.,])0800[\s-]?\d{3}[\s-]?\d{3,4}(?!\d)"
    r"|(?<![\d/.])0[1-9](?:[\s.]\d{2}){4}(?!\d)"
)

errors: list[str] = []


def is_date(s: str) -> bool:
    try:
        date.fromisoformat(s)
        return True
    except ValueError:
        return False


total = 0
checked = []
for rel, (prefix, places) in FILES.items():
    path = ROOT / rel
    if not path.exists():
        print(f"{rel}: not added yet")
        continue
    with open(path, encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        rows = list(reader)
    if reader.fieldnames != HEADER:
        errors.append(f"{rel}: header must be {','.join(HEADER)}")
        continue
    total += len(rows)
    checked.append(prefix.upper())
    for pid, n in Counter(r["policy_id"] for r in rows).items():
        if n > 1:
            errors.append(f"{rel}: duplicate policy_id {pid}")
    for r in rows:
        pid = r["policy_id"]
        where = f"{rel} {pid}"
        place = r["jurisdiction"]
        if place not in places:
            errors.append(f"{where}: unknown jurisdiction '{place}'")
        if not pid.startswith(f"{prefix}-{place.lower()}-{r['topic']}-"):
            errors.append(f"{where}: id should start {prefix}-{place.lower()}-{r['topic']}-")
        if r["topic"] not in TOPICS:
            errors.append(f"{where}: topic '{r['topic']}' is not in register/us/policy-topics.md")
        if r["applies_to"] not in APPLIES:
            errors.append(f"{where}: applies_to must be one of {sorted(APPLIES)}")
        if r["source_type"] not in SOURCE_TYPES:
            errors.append(f"{where}: source_type must be one of {sorted(SOURCE_TYPES)}")
        if r["evidence_level"] not in EVIDENCE:
            errors.append(f"{where}: evidence_level must be one of {sorted(EVIDENCE)}")
        if r["verification"] not in VERIFICATION:
            errors.append(f"{where}: verification must be one of {sorted(VERIFICATION)}")
        if r["unit"] not in UNITS:
            errors.append(f"{where}: unit '{r['unit']}' is not one of {sorted(u for u in UNITS if u)}")
        if r["unit"] and not re.fullmatch(r"\d+(\.\d+)?", r["value"]):
            errors.append(f"{where}: a unit needs a number in value")
        if not r["source_url"].startswith("https://"):
            errors.append(f"{where}: source_url must be an https:// link")
        if not is_date(r["date_checked"]):
            errors.append(f"{where}: date_checked must be a date like 2026-11-20")
        if not r["rule_summary"].strip():
            errors.append(f"{where}: rule_summary is empty")
        text = f"{r['rule_summary']} {r['notes']}"
        if EMAIL.search(text) or PHONE.search(text):
            errors.append(f"{where}: no email addresses or phone numbers")

for e in errors:
    print("FAIL", e)
if errors:
    sys.exit(1)
print(f"OK: {total} rules for {', '.join(checked)}")
