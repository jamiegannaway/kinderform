"""Record the questions on fillable PDF application forms.

Usage (from the repository root):
    python -I tools/pdf_fields.py CRAWL.jsonl [--date YYYY-MM-DD]

CRAWL.jsonl comes from tools/polite_fetch.py run with --save-dir, with each
line's key set to a form_id from application-forms.csv. For each saved PDF
that has fillable fields, each field becomes a row in
application-questions.csv: its tooltip (or cleaned field name) as a short
paraphrase, tagged with a topic from question-topics.md. Forms marked as a
licensed instrument are never read. PDFs with no fillable fields are listed
for reading by hand.

Downloaded PDFs are untrusted: run this with `python -I`, and keep the PDFs
outside the repository. Needs pypdf (the one non-standard dependency).
"""

import argparse
import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from crawl_to_register import TOPIC_RULES  # noqa: E402

from pypdf import PdfReader  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
US = ROOT / "register" / "us"

APPLICATION_RULES = [
    ("background_check_consent", r"fingerprint|background check|release of information|authori[sz]ation for"),
    ("signature", None),  # handled below
    ("motivation", r"why do you want|reason(?:s)? for|motivat"),
    ("references", r"reference"),
    ("education", r"school|education|degree|grade completed"),
    ("relationship_history", r"divorce|previous marri|prior marri|former spouse"),
    ("parenting_approach", r"disciplin|parenting style|rules in your home"),
    ("parenting_history", r"your (?:own )?children|biological child|raised|parenting experience"),
    ("support_network", r"support (?:system|network)|babysit|child ?care provider|emergency contact"),
    ("substance_use", r"alcohol|drug|substance"),
    ("household_adults_checks", r"other adults|household members? (?:over|18)|adult household"),
    ("transport", r"driver|licen[cs]e number|vehicle|insurance"),
    ("home_safety", r"smoke detector|fire extinguisher|firearm|weapon|pool|medication storage"),
]

GENERIC = re.compile(r"^(?:text|check ?box|checkbox|field|untitled|button|group|radio|combo ?box|list ?box)\s*\d*$", re.I)


def topic_of(label: str) -> str:
    low = label.lower()
    for topic, pattern in APPLICATION_RULES:
        if pattern and re.search(pattern, low):
            return topic
    if re.search(r"signature|sign here|\bdate\b$", low):
        return "other"
    for topic, pattern in TOPIC_RULES:
        if re.search(pattern, low):
            return topic
    return "other"


def clean(name: str) -> str:
    name = re.sub(r"\[\d+\]", "", name)
    name = name.split(".")[-1]
    name = re.sub(r"[_\-]+", " ", name)
    name = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", name)
    name = re.sub(r"\s+\d+$", "", name).strip()
    return " ".join(name.split())


def fields_of(path: str):
    reader = PdfReader(path)
    fields = reader.get_fields() or {}
    out = []
    for name, field in fields.items():
        ftype = str(field.get("/FT", ""))
        if ftype not in ("/Tx", "/Btn", "/Ch"):
            continue
        label = str(field.get("/TU") or "").strip() or clean(name)
        label = " ".join(label.split())
        if not label or GENERIC.match(label) or len(label) < 3:
            continue
        kind = {"/Tx": "free_text", "/Btn": "yes_no", "/Ch": "single_choice"}[ftype]
        out.append((label[:120], kind))
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("crawl")
    ap.add_argument("--date", default="")
    args = ap.parse_args()

    with (US / "application-forms.csv").open(encoding="utf-8", newline="") as handle:
        forms = {row["form_id"]: row for row in csv.DictReader(handle)}
    qpath = US / "application-questions.csv"
    with qpath.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        header, questions = reader.fieldnames, list(reader)

    touched, new, manual = set(), [], []
    for line in open(args.crawl, encoding="utf-8"):
        record = json.loads(line)
        form_id = record["key"]
        form = forms.get(form_id)
        if not form or form["licensed_instrument"] == "yes" or not record.get("saved_pdf"):
            continue
        try:
            found = fields_of(record["saved_pdf"])
        except Exception as error:  # damaged or encrypted PDF
            manual.append(f"{form_id}: could not read ({type(error).__name__})")
            continue
        if not found:
            manual.append(f"{form_id}: no fillable fields; read by hand")
            continue
        touched.add(form_id)
        seen = set()
        order = 0
        for label, kind in found:
            if label.lower() in seen:
                continue
            seen.add(label.lower())
            order += 1
            new.append({
                "form_id": form_id, "question_order": str(order), "section": "",
                "question_paraphrase": label, "topic": topic_of(label), "required": "unknown",
                "answer_type": kind, "source_url": record.get("final_url") or record["url"],
                "date_checked": args.date or record.get("fetched_at", ""),
                "evidence_level": "form_read", "verification": "unverified",
            })
    questions = [q for q in questions if q["form_id"] not in touched] + new
    questions.sort(key=lambda q: (q["form_id"], int(q["question_order"])))
    with qpath.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=header, lineterminator="\n")
        writer.writeheader()
        writer.writerows(questions)
    print(f"forms read: {len(touched)}, questions: {len(new)}, for reading by hand: {len(manual)}")
    for line in manual:
        print("  " + line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
