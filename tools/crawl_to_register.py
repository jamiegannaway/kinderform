"""Turn polite_fetch.py output into register rows.

Usage (from the repository root):
    python tools/crawl_to_register.py CRAWL.jsonl [--date YYYY-MM-DD]

What it does, conservatively:
- front-doors.csv: a row whose website or form page loaded and names the
  front door (a distinctive word from its name or operator appears in the page)
  moves from `search_result` to `page_read`. A dead link (404 or 410) is noted.
  If an enquiry form was read, `first_step` becomes `web_form`, `form_url` is
  filled if blank and `form_fields_observed` becomes `yes` with `form_read`.
- form-questions.csv: one row per field of an enquiry form, paraphrased from
  its label and tagged with a topic code. Search boxes, newsletter sign-ups and
  log-in forms are skipped. Existing rows for a front door are replaced.
- response-promises.csv: sentences on the page that promise contact within a
  time ("we will call you within two business days"). Sentences containing a
  phone number or email address are skipped.

Nothing is marked `verified`: that needs a person.
Standard library only.
"""

import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
US = ROOT / "register" / "us"

TOPIC_RULES = [
    ("captcha", r"captcha|recaptcha|not a robot"),
    ("consent_marketing", r"newsletter|subscribe|mailing list|marketing|updates? (?:by|via) (?:e-?mail|text)"),
    ("privacy_ack", r"privacy|terms"),
    ("consent_contact", r"consent|agree|permission|authori[sz]e|text messages?|sms|opt.?in"),
    ("contact_email", r"e-?mail"),
    ("contact_phone", r"phone|mobile|cell|telephone"),
    ("contact_preference", r"best (?:time|way)|prefer(?:red)? (?:contact|method|time)|contact (?:method|time)"),
    ("child_preferences", r"child(?:ren)?'?s? age|age range|sibling|special needs|gender of"),
    ("date_of_birth", r"birth|\bdob\b|\bage\b"),
    ("postal_address", r"address|street|apt|unit"),
    ("location", r"zip|postal|county|city|state\b|town"),
    ("name", r"name"),
    ("interest_type", r"interest|foster|adopt|respite|kinship|type of (?:care|service)|program"),
    ("readiness", r"when|timeline|how soon|ready|stage"),
    ("prior_experience", r"experience|previously|licen[cs]ed|before"),
    ("source", r"hear about|how did you|referr|find us|learn about"),
    ("household_members", r"household|spouse|partner|children in (?:the|your) home|live with"),
    ("relationship_status", r"marital|married|single|relationship"),
    ("housing", r"rent|own|bedroom|home type|housing"),
    ("employment", r"employ|work|occupation|job"),
    ("income", r"income|salary|financial"),
    ("language", r"language|spanish|interpreter"),
    ("demographics", r"race|ethnic|religio|faith|gender|sexual|lgbt|pronoun"),
    ("criminal_history", r"criminal|arrest|convict|felony"),
    ("child_protection_history", r"abuse|neglect|cps|registry"),
    ("health", r"health|medical|disabilit"),
    ("free_text", r"question|comment|message|tell us|anything else|additional"),
]

ANSWER_TYPE = {"email": "free_text", "tel": "free_text", "text": "free_text", "textarea": "free_text",
               "number": "number", "date": "date", "checkbox": "multi_choice", "radio": "single_choice",
               "select": "single_choice"}

CONTACT_WORDS = re.compile(r"\b(call|contact|respond|response|reach out|hear (?:back )?from|get back|follow[- ]up|"
                           r"be in touch|reply|return your)\b", re.I)
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE = re.compile(r"\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}")
NUMBERS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "seven": 7, "ten": 10}
STOP = {"county", "department", "services", "service", "of", "the", "and", "for", "family", "families",
        "children", "child", "human", "social", "foster", "care", "adoption", "inc", "agency", "state",
        "division", "program", "office", "health", "center", "home", "homes", "youth", "&", "-", "dss",
        "dhs", "city", "local", "public", "parent", "parents", "resource", "fostering"}


def read(name):
    with (US / name).open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return reader.fieldnames, list(reader)


def write(name, header, rows):
    with (US / name).open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=header, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def label_of(field):
    for key in ("label", "aria_label", "placeholder"):
        text = " ".join(field.get(key, "").split()).strip(" *:")
        if text:
            return text
    name = re.sub(r"[_\-\[\]\.]+", " ", field.get("name", "")).strip()
    name = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", name)
    if name and not re.fullmatch(r"(?:input|field|item|q|wpforms|fields?)?\s*\d*[\s\d]*", name, re.I):
        return name
    return ""


def topic_of(text):
    low = text.lower()
    for topic, pattern in TOPIC_RULES:
        if re.search(pattern, low):
            return topic
    return "other"


def is_enquiry_form(form):
    labels = " ".join(label_of(f).lower() + " " + f.get("name", "").lower() for f in form["fields"])
    if len(form["fields"]) < 3:
        return False
    if re.search(r"password|username|log ?in|sign ?in", labels):
        return False
    if not re.search(r"name", labels):
        return False
    return bool(re.search(r"e-?mail|phone", labels))


def words(text):
    return {w for w in re.findall(r"[a-z]{4,}", text.lower()) if w not in STOP}


def stated_hours(text):
    m = re.search(r"within\s+(\w+)\s*(?:-\s*\w+\s*)?(business\s+|working\s+)?(hours?|days?|weeks?)", text, re.I)
    if not m:
        return ""
    raw = m.group(1).lower()
    n = int(raw) if raw.isdigit() else NUMBERS.get(raw)
    if not n:
        return ""
    unit = m.group(3).lower()
    hours = n if unit.startswith("hour") else n * 24 if unit.startswith("day") else n * 24 * 7
    return str(hours)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("crawl")
    ap.add_argument("--date", default="")
    args = ap.parse_args()

    records = {}
    for line in open(args.crawl, encoding="utf-8"):
        r = json.loads(line)
        records.setdefault(r["key"].split("|")[0], []).append(r)

    fh, doors = read("front-doors.csv")
    qh, questions = read("form-questions.csv")
    ph, promises = read("response-promises.csv")
    touched_q, touched_p = set(), set()
    new_q, new_p = [], []
    counts = {"page_read": 0, "form_read": 0, "dead": 0, "questions": 0, "promises": 0}

    for door in doors:
        recs = records.get(door["front_door_id"])
        if not recs:
            continue
        date = args.date or recs[0].get("fetched_at", "")
        key_words = words(door["name"] + " " + door["operator"])
        confirmed = False
        form_rec, form = None, None
        for r in recs:
            if r.get("status") in (404, 410):
                note = f"Link returned {r['status']} on {date}: {r['url']}"
                if note not in door["notes"]:
                    door["notes"] = (door["notes"] + " " + note).strip()
                counts["dead"] += 1
            if r.get("status") != 200:
                continue
            page = (r.get("title", "") + " " + r.get("text", "")).lower()
            if key_words and any(w in page for w in key_words):
                confirmed = True
            for f in r.get("forms", []):
                if is_enquiry_form(f) and (form is None or len(f["fields"]) > len(form["fields"])):
                    form_rec, form = r, f
        if not confirmed:
            continue
        door["evidence_level"] = "page_read"
        door["date_checked"] = date
        door["source_url"] = door["source_url"] or recs[0]["url"]
        counts["page_read"] += 1
        page_rec = next(r for r in recs if r.get("status") == 200)

        if form:
            door["first_step"] = "web_form"
            door["form_fields_observed"] = "yes"
            door["evidence_level"] = "form_read"
            if not door["form_url"]:
                door["form_url"] = form_rec.get("final_url") or form_rec["url"]
            counts["form_read"] += 1
            touched_q.add(door["front_door_id"])
            order = 0
            seen = set()
            for field in form["fields"]:
                label = label_of(field)
                if not label:
                    continue
                if field["type"] in ("radio", "checkbox") and label.lower() in seen:
                    continue
                seen.add(label.lower())
                order += 1
                paraphrase = re.sub(r"\s+", " ", label)[:120]
                if EMAIL.search(paraphrase) or PHONE.search(paraphrase):
                    paraphrase = topic_of(label).replace("_", " ")
                new_q.append({
                    "front_door_id": door["front_door_id"], "question_order": str(order),
                    "question_paraphrase": paraphrase, "topic": topic_of(label + " " + field.get("name", "")),
                    "required": "yes" if field.get("required") else "unknown",
                    "answer_type": ANSWER_TYPE.get(field["type"], "other"),
                    "source_url": form_rec.get("final_url") or form_rec["url"], "date_checked": date,
                    "evidence_level": "form_read", "verification": "unverified",
                })
                counts["questions"] += 1

        for r in recs:
            for sentence in r.get("promises", []) if r.get("status") == 200 else []:
                if not CONTACT_WORDS.search(sentence) or EMAIL.search(sentence) or PHONE.search(sentence):
                    continue
                touched_p.add(door["front_door_id"])
                low = sentence.lower()
                channel = "phone" if re.search(r"\bcall\b|phone", low) else "email" if "email" in low else "unknown"
                new_p.append({
                    "front_door_id": door["front_door_id"], "promise_quote": sentence[:300],
                    "stage": "first_contact", "channel": channel, "stated_hours": stated_hours(sentence),
                    "source_url": r.get("final_url") or r["url"], "date_checked": date,
                    "evidence_level": "page_read", "verification": "unverified",
                })
                counts["promises"] += 1
                if not door["stated_response_time"]:
                    door["stated_response_time"] = sentence[:200]

    questions = [q for q in questions if q["front_door_id"] not in touched_q] + new_q
    promises = [p for p in promises if p["front_door_id"] not in touched_p] + new_p
    questions.sort(key=lambda q: (q["front_door_id"], int(q["question_order"])))
    promises.sort(key=lambda p: p["front_door_id"])
    write("front-doors.csv", fh, doors)
    write("form-questions.csv", qh, questions)
    write("response-promises.csv", ph, promises)
    print(counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
