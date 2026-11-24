"""Make, and later score, the sheets a person uses to check the computer's work.

Every figure on /research and /for-services rests on two things a computer did: sorting each form
question into a topic (census/questions.csv), and reading the law into register/assessment.csv.
Nobody has checked either yet. This tool draws a fixed sample for a person to check in a spreadsheet,
then says how often the computer was right.

    python tools/check_sample.py make     # writes docs/checks/topic-sample.csv and law-sample-england.csv
    python tools/check_sample.py score    # reads the filled-in sheets and reports the results

`make` will not overwrite a sheet that already has answers. The sample is drawn with a fixed seed, so
anyone can draw the same one again. Standard library only.
"""

import argparse
import csv
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "checks"
TOPICS = OUT / "topic-sample.csv"
LAW = OUT / "law-sample-england.csv"
SEED = 20261124
PER_STAGE = 30  # questions from enquiry forms, and the same number from applications
ANSWERS = {"yes", "no", "unsure"}


def read(path: Path) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def write(path: Path, header: list[str], rows: list[dict]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=header, lineterminator="\n")
        w.writeheader()
        w.writerows(rows)


def answered(path: Path) -> bool:
    return path.exists() and any(r.get("correct", "").strip() for r in read(path))


def make(force: bool) -> int:
    for path in (TOPICS, LAW):
        if answered(path) and not force:
            print(f"{path.relative_to(ROOT)} already has answers; not overwriting it (use --force to start again)")
            return 1
    OUT.mkdir(parents=True, exist_ok=True)
    forms = {f["form_id"]: f for f in read(ROOT / "census" / "forms.csv")}
    describe = {(t["category"], t["topic"]): t["description"] for t in read(ROOT / "census" / "taxonomy.csv")}
    rng = random.Random(SEED)
    rows = []
    for stage, label in (("primary", "enquiry"), ("application", "application")):
        # Questions a person answers, not consent ticks or fields for staff.
        pool = [
            q for q in read(ROOT / "census" / "questions.csv")
            if forms.get(q["form_id"], {}).get("form_stage") == stage
            and q["category"] not in ("consent", "staff_recorded")
            and q.get("input_type") != "statement"
        ]
        for q in sorted(rng.sample(pool, min(PER_STAGE, len(pool))), key=lambda q: q["question_id"]):
            f = forms[q["form_id"]]
            rows.append({
                "question_id": q["question_id"], "stage": label, "country": f["country"],
                "question": q["label_paraphrased"], "section": q["section"],
                "computer_topic": f"{q['category']}/{q['topic']}",
                "topic_means": describe.get((q["category"], q["topic"]), ""),
                "form_link": f["form_url"] or f["source_url"],
                "correct": "", "better_topic": "", "notes": "",
            })
    write(TOPICS, ["question_id", "stage", "country", "question", "section", "computer_topic", "topic_means",
                   "form_link", "correct", "better_topic", "notes"], rows)
    law = [r for r in read(ROOT / "register" / "assessment.csv") if r["jurisdiction"] == "ENG"]
    write(LAW, ["assessment_id", "applies_to", "stage", "topic", "requirement_summary", "legal_citation",
                "source_url", "correct", "notes"],
          [{"assessment_id": r["assessment_id"], "applies_to": r["applies_to"], "stage": r["stage"],
            "topic": f"{r['category']}/{r['topic']}", "requirement_summary": r["requirement_summary"],
            "legal_citation": r["legal_citation"], "source_url": r["source_url"],
            "correct": "", "notes": ""} for r in law])
    print(f"wrote {len(rows)} questions to {TOPICS.relative_to(ROOT)} and {len(law)} law rows to {LAW.relative_to(ROOT)}")
    return 0


def tally(rows: list[dict], key: str | None = None) -> list[str]:
    groups: dict[str, list[dict]] = {}
    for r in rows:
        groups.setdefault(r[key] if key else "all", []).append(r)
    out = []
    for name, rs in sorted(groups.items()):
        done = [r for r in rs if r["correct"] in ("yes", "no")]
        yes = sum(r["correct"] == "yes" for r in done)
        unsure = sum(r["correct"] == "unsure" for r in rs)
        share = f"{round(100 * yes / len(done))}% right" if done else "none checked yet"
        out.append(f"  {name}: {yes} of {len(done)} checked rows right ({share}); {unsure} unsure; "
                   f"{len(rs) - len(done) - unsure} not checked")
    return out


def score() -> int:
    errors = []
    for path in (TOPICS, LAW):
        if not path.exists():
            print(f"{path.relative_to(ROOT)} not found; run `make` first")
            return 1
        for n, r in enumerate(read(path), start=2):
            r["correct"] = r["correct"].strip().lower()
            if r["correct"] and r["correct"] not in ANSWERS:
                errors.append(f"{path.name} line {n}: 'correct' should be yes, no or unsure, not '{r['correct']}'")
    if errors:
        print("\n".join(errors))
        return 1
    topics = [dict(r, correct=r["correct"].strip().lower()) for r in read(TOPICS)]
    law = [dict(r, correct=r["correct"].strip().lower()) for r in read(LAW)]
    print("Topic tags, by stage:")
    print("\n".join(tally(topics, "stage")))
    print("England law rows, by service:")
    print("\n".join(tally(law, "applies_to")))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("action", choices=["make", "score"])
    ap.add_argument("--force", action="store_true", help="make: overwrite sheets that already have answers")
    args = ap.parse_args()
    return make(args.force) if args.action == "make" else score()


if __name__ == "__main__":
    sys.exit(main())
