"""Check evidence/research-log.json, which feeds the research log on kinderform.org.

Each entry is one piece of research and must point to a report in evidence/reports/.
Each meaning is one idea for the project, says which research it comes from, and is
for discussion until the project decides it. Public wording must avoid market
language about carers and children.

Run: python tests/validate_research_log.py
"""

import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVIDENCE = ROOT / "evidence"
PATH = EVIDENCE / "research-log.json"

KINDS = {"keep", "tighten", "change", "add", "avoid", "test"}
ENTRY_KEYS = {"id", "date", "title", "report", "question", "looked_at", "how", "checked", "learned"}
MEANING_KEYS = {"id", "part", "kind", "idea", "why", "from"}
# The same list as tests/validate_findings.py.
MARKET = re.compile(
    r"\b(supply|demand|funnel|conversion|prospects?|customers?|leads(?!\s+(?:to|people|someone|us|them)\b))\b",
    re.I,
)

errors: list[str] = []


def fail(msg: str) -> None:
    errors.append(msg)


def is_date(s: object) -> bool:
    try:
        date.fromisoformat(str(s))
        return True
    except ValueError:
        return False


def words(where: str, *texts: str) -> None:
    for t in texts:
        m = MARKET.search(t)
        if m:
            fail(f"{where}: market word '{m.group(0)}'")


data = json.loads(PATH.read_text(encoding="utf-8"))
if not is_date(data.get("updated")):
    fail("'updated' must be a date like 2026-11-19")

entries = set()
for e in data.get("entries", []):
    eid = e.get("id", "?")
    missing = ENTRY_KEYS - e.keys()
    if missing:
        fail(f"{eid}: missing {sorted(missing)}")
        continue
    if eid in entries:
        fail(f"{eid}: duplicate id")
    entries.add(eid)
    if not is_date(e["date"]):
        fail(f"{eid}: 'date' must be a date like 2026-11-19")
    if not re.fullmatch(r"reports/[a-z0-9-]+\.md", e["report"]) or not (EVIDENCE / e["report"]).is_file():
        fail(f"{eid}: 'report' must be a file in evidence/reports/")
    if not e["looked_at"] or not e["learned"]:
        fail(f"{eid}: needs at least one field looked at and one thing learned")
    words(eid, e["title"], e["question"], e["how"], e["checked"], *e["looked_at"], *e["learned"])

reports = {p.relative_to(EVIDENCE).as_posix() for p in (EVIDENCE / "reports").glob("*.md")}
logged = {e["report"] for e in data.get("entries", []) if "report" in e}
for r in sorted(reports - logged):
    fail(f"{r}: every report needs an entry in the research log")

meanings = set()
for m in data.get("meanings", []):
    mid = m.get("id", "?")
    missing = MEANING_KEYS - m.keys()
    if missing:
        fail(f"{mid}: missing {sorted(missing)}")
        continue
    if mid in meanings:
        fail(f"{mid}: duplicate id")
    meanings.add(mid)
    if m["kind"] not in KINDS:
        fail(f"{mid}: 'kind' must be one of {sorted(KINDS)}")
    if not m["from"]:
        fail(f"{mid}: must say which research it comes from")
    for src in m["from"]:
        if src not in entries:
            fail(f"{mid}: 'from' names '{src}', which is not an entry")
    words(mid, m["part"], m["idea"], m["why"])

if errors:
    print("\n".join("FAIL " + e for e in errors))
    sys.exit(1)
print(f"OK: {len(entries)} pieces of research, {len(meanings)} ideas for the project")
