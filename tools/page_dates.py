"""When was each source page last updated? Builds register/page-dates.csv.

The compare tables on kinderform.org show two dates for every form and rule: when we last
read the page (date_checked in each data file) and when the page says it was last updated
or reviewed. This tool finds the second date.

1. List every source link in the forms and rules data:
       python tools/page_dates.py list > urls.txt
2. Read the pages politely (robots.txt, at least 5 seconds per site, GET only):
       python tools/polite_fetch.py urls.txt crawl.jsonl --delay 5 --workers 8
   polite_fetch records each page's own date: the words on the page ("Last updated",
   "Page last reviewed", "Date modified"), then the page's metadata, then a PDF's
   modified date.
3. Write the results:
       python tools/page_dates.py build crawl.jsonl
   Rows for links not in this crawl are kept, so a partial re-crawl updates only what it read.

Keep urls.txt and crawl.jsonl out of the repository. Standard library only.
"""

import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "register" / "page-dates.csv"
HEADER = ["url", "page_updated", "page_updated_from", "date_read", "status"]

# (file, the columns that hold its source link, first non-empty wins)
SOURCES = [
    ("census/forms.csv", ["form_url", "source_url"]),
    ("register/us/application-forms.csv", ["url", "source_url"]),
    ("register/us/policies.csv", ["source_url"]),
    ("register/policies.csv", ["source_url"]),
    ("register/ca/policies.csv", ["source_url"]),
    ("register/au/policies.csv", ["source_url"]),
]


def links() -> list[str]:
    seen: dict[str, None] = {}
    for rel, cols in SOURCES:
        with open(ROOT / rel, encoding="utf-8", newline="") as fh:
            for row in csv.DictReader(fh):
                url = next((row[c].strip() for c in cols if row.get(c, "").strip()), "")
                if url.startswith("http"):
                    seen.setdefault(url, None)
    return list(seen)


def build(crawl_files: list[str]) -> None:
    rows: dict[str, dict] = {}
    if OUT.exists():
        with open(OUT, encoding="utf-8", newline="") as fh:
            rows = {r["url"]: r for r in csv.DictReader(fh)}
    for path in crawl_files:
        for line in open(path, encoding="utf-8"):
            rec = json.loads(line)
            if "|follow" in rec.get("key", ""):
                continue
            rows[rec["url"]] = {
                "url": rec["url"],
                "page_updated": rec.get("page_updated", ""),
                "page_updated_from": rec.get("page_updated_from", ""),
                "date_read": rec.get("fetched_at", ""),
                "status": str(rec.get("status", "")),
            }
    wanted = set(links())
    out = [rows[u] for u in sorted(rows) if u in wanted]
    with open(OUT, "w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=HEADER, lineterminator="\n")
        writer.writeheader()
        writer.writerows(out)
    dated = sum(1 for r in out if r["page_updated"])
    print(f"{OUT.relative_to(ROOT)}: {len(out)} links, {dated} with a date the page gives")


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "list":
        for i, url in enumerate(links()):
            print(f"p{i}\t{url}")
    elif len(sys.argv) >= 3 and sys.argv[1] == "build":
        build(sys.argv[2:])
    else:
        sys.exit(__doc__)
