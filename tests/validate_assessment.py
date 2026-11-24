"""Check register/assessment.csv: what the law in each UK nation says a fostering or adoption
assessment must cover.

Each row is one requirement, read from legislation or statutory guidance, tagged with the census
topics (census/taxonomy.csv) so the site can show which questions belong at which stage. The rows
describe the law in our own words. They never describe the contents of a licensed assessment form
such as CoramBAAF's Form F (CLAUDE.md, hard rule 7).

Run from the repository root:
    python tests/validate_assessment.py
Standard library only.
"""

import csv
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / "register" / "assessment.csv"
COLUMNS = [
    "assessment_id", "jurisdiction", "applies_to", "stage", "category", "topic", "requirement_summary",
    "legal_citation", "source_type", "source_url", "date_checked", "evidence_level", "verification", "notes",
]
JURISDICTIONS = {"ENG", "WLS", "SCT", "NIR"}
SERVICES = {"fostering", "adoption"}
STAGES = {"stage_1", "stage_2", "assessment", "checks"}
SOURCE_TYPES = {"legislation", "statutory_guidance"}
EVIDENCE = {"page_read", "search_result"}
VERIFICATION = {"unverified", "verified"}
# Official sources only: legislation and the four governments.
HOSTS = ("legislation.gov.uk", "gov.uk", "gov.wales", "gov.scot", "nidirect.gov.uk", "health-ni.gov.uk")
ID = re.compile(r"^uk-(eng|wls|sct|nir)-(fostering|adoption)-[a-z0-9-]+$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
LICENSED = re.compile(r"form f\b|corambaaf|\bbaaf\b|prospective adopter'?s report|\bform ar\b", re.I)


def main() -> int:
    if not PATH.exists():
        print("register/assessment.csv not found; nothing to check")
        return 0
    taxonomy = {(r["category"], r["topic"]) for r in csv.DictReader(open(ROOT / "census" / "taxonomy.csv", encoding="utf-8"))}
    with open(PATH, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        header = reader.fieldnames or []
        rows = list(reader)
    errors = []
    if header != COLUMNS:
        errors.append(f"columns should be {COLUMNS}, found {header}")
        print("\n".join(errors))
        return 1
    seen = set()
    for n, r in enumerate(rows, start=2):
        rid = r["assessment_id"]
        where = f"line {n} ({rid})"
        if rid in seen:
            errors.append(f"{where}: assessment_id appears more than once")
        seen.add(rid)
        m = ID.match(rid)
        if not m:
            errors.append(f"{where}: bad assessment_id")
        elif m.group(1).upper() != r["jurisdiction"] or m.group(2) != r["applies_to"]:
            errors.append(f"{where}: assessment_id does not match its jurisdiction and service")
        for col, allowed in (("jurisdiction", JURISDICTIONS), ("applies_to", SERVICES), ("stage", STAGES),
                             ("source_type", SOURCE_TYPES), ("evidence_level", EVIDENCE),
                             ("verification", VERIFICATION)):
            if r[col] not in allowed:
                errors.append(f"{where}: {col} '{r[col]}' is not one of {sorted(allowed)}")
        # Two named stages: England (fostering and adoption) and Welsh adoption since 1 April 2020.
        if r["stage"] in ("stage_1", "stage_2") and not (
            r["jurisdiction"] == "ENG" or (r["jurisdiction"] == "WLS" and r["applies_to"] == "adoption")
        ):
            errors.append(f"{where}: stage_1 and stage_2 are for England, and for adoption in Wales")
        if (r["category"], r["topic"]) not in taxonomy:
            errors.append(f"{where}: unknown topic {r['category']}/{r['topic']}")
        summary = r["requirement_summary"].strip()
        if not summary:
            errors.append(f"{where}: requirement_summary is empty")
        elif len(summary.split()) > 30:
            errors.append(f"{where}: requirement_summary is over 30 words")
        for col in ("requirement_summary", "notes"):
            if LICENSED.search(r[col]):
                errors.append(f"{where}: {col} mentions a licensed assessment form; describe the law, not the form")
        if not r["legal_citation"].strip():
            errors.append(f"{where}: legal_citation is empty")
        url = urlparse(r["source_url"])
        host = (url.hostname or "").lower()
        if url.scheme != "https" or not any(host == h or host.endswith("." + h) for h in HOSTS):
            errors.append(f"{where}: source_url must be an https link to legislation or a UK government site")
        if not DATE.match(r["date_checked"]):
            errors.append(f"{where}: date_checked must be YYYY-MM-DD")
        if r["verification"] == "verified" and r["evidence_level"] != "page_read":
            errors.append(f"{where}: a verified row must come from a page read")
    if errors:
        print("\n".join(errors))
        print(f"\n{len(errors)} problem(s) found")
        return 1
    by = {}
    for r in rows:
        k = f"{r['jurisdiction']} {r['applies_to']}"
        by[k] = by.get(k, 0) + 1
    print(f"OK: {len(rows)} assessment rows " + ", ".join(f"{k}: {v}" for k, v in sorted(by.items())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
