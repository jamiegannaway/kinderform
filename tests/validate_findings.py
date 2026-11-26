"""Check evidence/findings.json, which feeds the research page on kinderform.org.

Every finding needs at least one source with a link, and every source must say
whether a person has checked it (a date and what it was checked against) or not
(null). Public wording must avoid market language about carers and children.

Run: python tests/validate_findings.py
"""

import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from evidence_review import check_is_current, claim_digest

PATH = ROOT / "evidence" / "findings.json"

AGAINST = {"full text", "abstract", "key findings", "chart"}
# "leads" as a noun for people; "leads to" and "leads people" are ordinary verbs.
MARKET = re.compile(
    r"\b(supply|demand|funnel|conversion|prospects?|customers?|leads(?!\s+(?:to|people|someone|us|them)\b))\b",
    re.I,
)
FINDING_KEYS = {"id", "stage", "title", "summary", "sources"}
SOURCE_KEYS = {"title", "by", "year", "url", "checked"}

errors: list[str] = []


def fail(msg: str) -> None:
    errors.append(msg)


def is_date(s: object) -> bool:
    try:
        date.fromisoformat(str(s))
        return True
    except ValueError:
        return False


data = json.loads(PATH.read_text(encoding="utf-8"))
if not is_date(data.get("updated")):
    fail("'updated' must be a date like 2026-11-14")

ids = set()
checked = 0
for f in data.get("findings", []):
    fid = f.get("id", "?")
    missing = FINDING_KEYS - f.keys()
    if missing:
        fail(f"{fid}: missing {sorted(missing)}")
        continue
    if fid in ids:
        fail(f"{fid}: duplicate id")
    ids.add(fid)
    for field in ("title", "summary"):
        m = MARKET.search(f[field])
        if m:
            fail(f"{fid}: market word '{m.group(0)}' in {field}")
    if not f["sources"]:
        fail(f"{fid}: needs at least one source")
    for i, s in enumerate(f["sources"], 1):
        where = f"{fid} source {i}"
        missing = SOURCE_KEYS - s.keys()
        if missing:
            fail(f"{where}: missing {sorted(missing)}")
            continue
        if not (s["url"].startswith("https://") or s["url"].startswith("/research")):
            fail(f"{where}: url must be https:// or a /research page")
        if "utm_" in s["url"]:
            fail(f"{where}: remove tracking parameters from the url")
        c = s["checked"]
        if c is None:
            continue
        if not isinstance(c, dict) or not is_date(c.get("date")):
            fail(f"{where}: 'checked' must be null or have a date")
        elif c.get("against") not in AGAINST:
            fail(f"{where}: 'against' must be one of {sorted(AGAINST)}")
        elif not check_is_current(f, s):
            fail(f"{where}: finding changed since its check; clear checked until this version is reviewed")
        else:
            checked += 1

# A real regression case: adding an unchecked claim to a checked summary must fail.
fixture = {"title": "Example finding", "summary": "A reviewed sentence."}
source = {"url": "https://example.org/study", "checked": {"date": "2026-11-14", "against": "full text"}}
source["checked"]["claim_sha256"] = claim_digest(fixture, source)
assert check_is_current(fixture, source)
assert not check_is_current({**fixture, "summary": fixture["summary"] + " A new claim."}, source)
assert not check_is_current(fixture, {**source, "url": "https://example.org/other-study"})
assert check_is_current(fixture, {**source, "checked": None})

if errors:
    print("\n".join("FAIL " + e for e in errors))
    sys.exit(1)
print(f"OK: {len(ids)} findings, {checked} source checks recorded")
