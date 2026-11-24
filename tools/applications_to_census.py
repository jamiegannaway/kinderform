"""Add the application forms whose questions have been read to the census, as form_stage "application".

The census holds first-contact enquiry forms. To compare what services ask at first contact with
what they ask in the application, application forms go into the same census files and are tagged
with the same taxonomy (census/taxonomy.csv). That way "health" or "criminal record" means the same
thing at both stages.

Sources:
- US: register/us/application-forms.csv and application-questions.csv, read from fillable PDFs
  by tools/pdf_fields.py. Each document becomes one census form. The question labels there are
  the PDFs' own field names, so this tool drops fields that are not questions (bare tick boxes,
  page furniture) and marks fields for staff as staff_recorded.
- UK (and later other countries): a forms.csv and questions.csv in the census format, recorded by
  reading the public documents, passed with --forms and --questions.

Rows this tool wrote before (notes starting with MARK) are replaced; rows a person recorded are kept.

Usage (from the repository root):
    python tools/applications_to_census.py --us
    python tools/applications_to_census.py --forms uk-forms.csv --questions uk-questions.csv
Standard library only.
"""

import argparse
import csv
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from crawl_to_census import topic_of  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
C = ROOT / "census"
US = ROOT / "register" / "us"
MARK = "Application form added by applications_to_census.py"

# Fields that are not questions: tick-box halves, page furniture, numbering.
NOISE = re.compile(
    r"^(?:yes|no|yes no|n/?a|not applicable|other|none|neg|pos|check ?box\d*|text\d*|button\d*|reset|print|submit|"
    r"clear(?: form)?|page \d+|\d+|[a-z]|[a-z]\d*|provider #?\d+|#\d+|\(?[a-z]\)|[ivx]+\.?|date|please explain\.?|"
    r"explain|if yes,? (?:please )?explain\.?|select or enter (?:a )?date\.?|comments?|specify|one|two|three|four|"
    r"consumed|[a-z]\. [a-z]{2,6}|undefined|choose an item|yes/no|dual(?: n/a)?|n/a n/a|both|full|initial|renewal|"
    r"temp|returnee|unknown|declined|between|and|own|family|together|contact|child|parent|applicant|number|year|"
    r"day of|a\.d\. 20|l w m|cog|oti|booking|child ?\(ren\)|parent i+|prospective parent|parent/guardian|home|"
    r"other \(specify\)|other - explain|other reason|acceptable|dates?|this child|with it|you do|their part)$"
    r"|\bcheck ?box\b|^(?:neg|pos|yes|no)\b.*\bbox\b",
    re.I,
)
# Fields the service fills in, not the applicant.
STAFF = re.compile(
    r"office use|agency use|staff use|for (?:the )?(?:agency|department|county|licensing)|worker|caseworker|"
    r"supervisor|approved by|reviewed by|received by|date received|initials of completer|completed by staff|"
    r"\bcheck completed\b|\bdph check\b|licens(?:ing|e) (?:specialist|staff|number)|case (?:number|id)|"
    r"provider (?:number|id)|county use|district use|\bresults?\b|date completed|\bdmv\b|attendance|observations|"
    r"^certification$|application change|^strengths/needs$|^(?:approved|disapproved|closed|home approved)$|disposition|"
    r"waiver|appeal|registering agency|previous agency|restrictions to approval|number of children approved|"
    r"date (?:home approved|training completed|referred|request submitted|of next court hearing)|request date|"
    r"requesting organi[sz]ation|attention to|re-?submission|livescan|swan id|pae id|carematch id|nexus path|"
    r"licensing (?:unit|agent|agency)|department file|^(?:date )?conducted$|findings|substantiation|dates of visits|"
    r"individuals present|agency'?s plan|annual review|relicense|new hh member|^capacity|^specialist$|inv comm|"
    r"ch ct police|ch local pd|fcd ps|^progress$|to whom it may concern|property owner|this is to verify|"
    r"by and between|program manager|^(?:correct|incorrect)$|with the following changes|^skill \d|ncac|"
    r"(?:pre|in)-service training|identified relative|^copy of|agency received|submit fingerprints|"
    r"^form \d|other verification|court ordered case",
    re.I,
)
# Sections marked in register/us/application-questions.csv: a table of the children a family would accept
# lists conditions such as "diabetes", which are about the child, not the applicant.
SECTIONS = [
    (re.compile(r"children the family would accept", re.I), ("interest", "child_preferences")),
    (re.compile(r"^for the agency$", re.I), ("staff_recorded", "logged_by")),
]
# Screen-reader prompts in some PDFs ("Enter the city.", "Select for yes.", "Marriage info Ck").
PROMPT = re.compile(r"^(?:select or enter|select for:?|select|enter(?: the| your)?)\s+|\s+ck$", re.I)
SIGNATURE = re.compile(r"signature|signed|\binitials\b|^date signed|print(?:ed)? name", re.I)

# Application topics, checked before the census tagger (first match wins).
APP_RULES = [
    ("work", "income", r"social security/disability|social security benefits|retirement|\bssi\b|\bssb\b|tanf|afdc|"
                       r"^(?:gas|electricity|oil|cable|food|entertainment|telephone)$|property payments|car payment|"
                       r"take home|source of income|financ|self-employment"),
    ("interest", "child_preferences", r"will (?:not )?(?:accept|consider|except)|birth (?:parents?|family)|"
                                      r"what would the child look like|know about the child|childhood ages do you"),
    ("experience", "own_children", r"teacher|name of school|^grade level$|child'?s (?:name|last name|first)|"
                                   r"school or child care|your child(?:ren)?'?s?\b|children (?:now )?in your|"
                                   r"children by birth|what does this child|with this child|^appearance/hygiene$|"
                                   r"^behaviou?r$|contacts with parent"),
    ("experience", "life_story", r"childhood|your (?:mother|father|parents)|like your parents|different from your "
                                 r"parents|growing up|left home|why did you leave|family traditions|happier or less "
                                 r"happy|cope with|emotions?\b|^(?:[a-h]\. )?(?:anger|disappointment|frustration|"
                                 r"sadness/depression|happiness|love/affection|stress)$|five words|meet your spouse|"
                                 r"known each other|been married or coupled|partner likes|spouse or partner would|"
                                 r"aware of this loss|spirituality|role models|important adults|decisions (?:are )?made|"
                                 r"privacy|neighbou?rs|free time|chores|people who most|turn to for help|"
                                 r"were you adopted|been in foster care|how did (?:you|your) .*(?:react|feel)|"
                                 r"what do you (?:most |least )?like (?:most |least )?about|disappointment"),
    ("work", "education", r"grade (?:level )?complet|highest grade|education level|advanced degree|college|"
                          r"high school|diploma|\bged\b|parts of school|school expectations"),
    ("free_text", "motivation", r"what made you think about|desire to become|interested in (?:only|becoming|both|pos)|"
                                r"what do you think (?:you|others).*like|having a (?:new )?child in your home|"
                                r"what would make you want"),
    ("experience", "parenting_approach", r"rules can|forms of discipline|disliked most about being a parent|"
                                        r"parenting experience|help the child fit"),
    ("work", "employment_history", r"armed forces|branch of service|service dates"),
    ("work", "occupation", r"child care in your home|in-home day care|day care center"),
    ("criminal_record", "criminal_record", r"guilty|nolo"),
    ("prior_involvement", "social_services", r"^investigated$"),
    ("housing", "home_safety", r"body of water|describe the barriers|locking mechanisms|how often is it tested"),
    ("housing", "spare_bedroom", r"describe house|drawer space|basement: there are"),
    ("health", "health", r"date (?:of )?exam|examined|prognosis|^(?:physical|emotional)$|how does it manifest|"
                         r"what are the symptoms"),
    ("experience", "childcare_experience", r"parent to someone else"),
    ("household", "relationships", r"marriage (?:info|certificate)"),
    ("eligibility", "residency", r"radius of|reside in section|^citizen$|country of citizenship"),
    ("contact_identity", "id_number", r"type of id|photo id|enrollment number"),
    ("household", "previous_partners", r"relationship #?[2-9]|relationship ended|previous mar|copy of all divo"),
    ("household", "relationships", r"marriage or relationship|place of marriage|marit ?al|dom\. partner|"
                                   r"^(?:single|married|widowed)$|lgbt individual|how long have you been a single"),
    ("household", "household_composition", r"^relationship(?: \d\.?)?$|relationship to (?:family|parent|you)|"
                                           r"relation to applicant|list everyone in the home|name/age of child|"
                                           r"^(?:biological|adopted|step|legal)$"),
    ("equality", "gender", r"^(?:male|female|male/female|sex|gender: m f|sex: male)$"),
    ("health", "health", r"blood pressure|\bheart\b|diabetes|epilep|seizure|\bhiv\b|physical activity|"
                         r"insurance|medicaid|primary care|policy number|^health$|^medical$"),
    ("housing", "smoking", r"packs? per day|tobacco|vap(?:e|ing)"),
    ("interest", "care_type", r"^(?:first time|foster care|adoption|kinship(?: care)?|traditional|adoptive|"
                              r"foster home|kinship foster home|adoptive home|therapeutic home|dhs home|"
                              r"supported agency home)$"),
    ("housing", "tenure", r"^(?:owner|renter|rent own|duplex|mortgage|rent)$|name\(s\) on (?:deed|lease)|"
                          r"how long have you lived in"),
    ("contact_identity", "address", r"^(?:ward|rural|urban|suburban)$|directions to your home|finding directions|"
                                    r"floor: there are|my house has|apartment is located"),
    ("references", "referees", r"\breferen(?:ce|ces)\b|\breferee|allow the applicant|known the applicant|"
                               r"relationship to (?:the )?applicant|how long have you known"),
    ("contact_identity", "id_number", r"social security|\bssn\b|licen[cs]e number|passport|national insurance|"
                                      r"alien (?:registration|number)|\bitin\b"),
    ("contact_identity", "physical_description", r"eye colou?r|hair colou?r|\bheight\b|\bweight\b|"
                                                 r"distinguishing|\bmarks\b|tattoo"),
    ("equality", "ethnicity", r"american indian|alaska(?:n)? native|tribal|hispanic|latin[oa]|ethnic|\brace\b|"
                              r"pacific islander|\basian\b|\bblack\b|\bwhite\b|biracial|multiracial|african american|\btribe\b|\btrib\b"),
    ("equality", "religion", r"place of worship|church|relig|faith|synagogue|mosque"),
    ("housing", "home_safety", r"safety|smoke (?:detector|alarm)|fire (?:extinguisher|escape|drill)|carbon monoxide|"
                               r"lead paint|\bpool\b|fence|water (?:quality|supply|heater)|sanitation|outlet|gates?\b|"
                               r"poison|chemical|locked|first aid|emergency (?:plan|exit)|well water|septic|"
                               r"evacuation"),
    ("household", "household_composition", r"visit your home|regularly visit|frequent visitor"),
    ("work", "employment_history", r"military|dd ?form|discharge|employer|start date/end date|job title"),
    ("housing", "firearms", r"firearm|\bguns?\b|weapon|ammunition|rifle|handgun"),
    ("experience", "parenting_approach", r"disciplin|parenting (?:style|approach)|house rules|rules in (?:your|the) home|"
                                         r"punish|spank|affection|reward"),
    ("interest", "child_preferences", r"will (?:not )?accept|accept(?:ing)? (?:a )?child|willing to (?:care|accept|take)|"
                                      r"age range|ages? of child|sibling|behaviou?r(?:al)? (?:problem|need)|"
                                      r"special needs|eating (?:problem|disorder)|bed.?wett|fire.?setting|destructive|"
                                      r"runaway|describe this child|stealing|hyperactiv|outgoing|withdrawn|aggress|"
                                      r"\blying\b|cruelty|tantrum|acting out|failure to follow|truan|self.?harm"),
    ("prior_involvement", "social_services", r"child (?:protection|abuse|neglect) regist|central regist|"
                                             r"protective services|\bcps\b|substantiated|abuse or neglect"),
    ("criminal_record", "criminal_record", r"arrest|convict|felon|misdemeanou?r|charged|crime|criminal|offen[cs]e|"
                                           r"sex offender|probation|parole|court order|protective order|restraining"),
    ("health", "health", r"medical|medication|diagnos|illness|condition|hospital|mental|psychiatr|counsel|therap|"
                         r"alcohol|drug|substance|physician|doctor|tuberculosis|\btb\b|immuni[sz]|allerg|pregnan"),
    ("household", "previous_partners", r"divorc|previous marri|prior marri|former spouse|ex-?spouse|separated|"
                                       r"widow|annul"),
    ("household", "relationships", r"marriage date|date of marriage|\bmarried\b|marital|cohabit|civil (?:union|partner)"),
    ("work", "income", r"\bincome\b|salary|wages|\bmonthly\b|expenses?|\bdebts?\b|bankrupt|assets|\bbills?\b|"
                       r"utilities|mortgage payment|rent amount|loan|child support|alimony|public assistance|"
                       r"benefits received|food stamps|\bsnap\b|\btanf\b|^amount\b|\bamount (?:of|for)\b"),
    ("housing", "spare_bedroom", r"bedroom|\brooms?\b|square f|sleep|\bbeds?\b"),
    ("household", "household_composition", r"household member|other (?:adults?|persons?|people) (?:in|living)|"
                                           r"who (?:lives|resides)|residing in the home|persons? in the home"),
    ("household", "partner", r"spouse|co-?applicant|second applicant|applicant (?:2|two|b)\b|partner"),
]
APP_RULES = [(c, t, re.compile(p, re.I)) for c, t, p in APP_RULES]

INPUT = {"free_text": "text", "yes_no": "radio", "single_choice": "radio", "multi_choice": "checkbox", "date": "date"}
SERVICES = {"both": "fostering_and_adoption", "foster": "fostering", "fostering": "fostering", "adoption": "adoption"}


def tag(label: str, section: str = "") -> tuple[str, str] | None:
    """(category, topic) for a field the applicant fills in, or None for a field to leave out."""
    raw = " ".join(label.split())
    text = PROMPT.sub("", raw).strip(" .:")
    if not text or NOISE.search(text):
        return None
    for pattern, topic in SECTIONS:
        if section and pattern.search(section):
            return topic
    if STAFF.search(text):
        return ("staff_recorded", "records_check") if re.search(r"check|regist|clear", text, re.I) else (
            "staff_recorded", "logged_by")
    if SIGNATURE.search(text):
        return ("consent", "declaration_and_checks")
    # A PDF field named after the middle of a sentence ("within the next few years") is not a question.
    if re.match(r"[a-z]", raw) and "?" not in raw:
        return None
    for category, topic, pattern in APP_RULES:
        if pattern.search(text):
            return (category, topic)
    return topic_of(text)


def load(name):
    with open(C / name, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        return reader.fieldnames, list(reader)


def write(name, header, rows):
    with open(C / name, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=header, lineterminator="\n")
        w.writeheader()
        w.writerows(rows)


def us_sources():
    """Census-format forms and questions from the US application register."""
    states = {r["state_code"]: r["state_name"] for r in csv.DictReader(open(US / "states.csv", encoding="utf-8"))}
    forms = {r["form_id"]: r for r in csv.DictReader(open(US / "application-forms.csv", encoding="utf-8"))}
    qs = list(csv.DictReader(open(US / "application-questions.csv", encoding="utf-8")))
    out_forms, out_q = [], []
    for form_id in sorted({q["form_id"] for q in qs}):
        f = forms[form_id]
        body = f["issuing_body"]
        operator = ("indigenous_agency" if re.search(r"tribe|nation|tribal", body, re.I) else
                    "county_agency" if re.search(r"\bcounty\b", body, re.I) else "state_agency")
        out_forms.append({
            "form_id": form_id, "front_door_id": f["front_door_id"], "name": f"{body}: {f['form_name']}",
            "operator_type": operator, "service_type": SERVICES.get(f["services"], "fostering_and_adoption"),
            "country": "US", "region": states.get(f["state_code"], f["state_code"]), "form_stage": "application",
            "access_route": "downloadable_form", "form_url": f["url"] or f["source_url"], "platform": "",
            "template_group": "", "fields_observed": "yes", "observed": "direct_fetch",
            "date_checked": f["date_checked"], "source_url": f["source_url"] or f["url"],
            "notes": f"{MARK}: read from the fillable PDF's fields; part of the application packet ({f['step']}). "
                     "Topics tagged by keyword rules. Not yet checked by a person.",
        })
        for q in (q for q in qs if q["form_id"] == form_id):
            out_q.append({"form_id": form_id, "label_paraphrased": q["question_paraphrase"],
                          "input_type": INPUT.get(q["answer_type"], "unknown"), "required": q["required"],
                          "section": q.get("section", ""), "date_checked": q["date_checked"]})
    return out_forms, out_q


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--us", action="store_true", help="add the US application forms from register/us")
    ap.add_argument("--forms", help="a forms.csv in the census format, with form_stage application")
    ap.add_argument("--questions", help="its questions.csv; category and topic are kept where given")
    args = ap.parse_args()

    fh, forms = load("forms.csv")
    qh, questions = load("questions.csv")
    taxonomy = {(r["category"], r["topic"]) for r in load("taxonomy.csv")[1]}

    new_forms, new_q = [], []
    if args.us:
        new_forms, new_q = us_sources()
    if args.forms:
        given = list(csv.DictReader(open(args.forms, encoding="utf-8")))
        for f in given:
            f["form_stage"] = "application"
            f["notes"] = f"{MARK}: {f.get('notes', '')}".strip()
        new_forms += given
        new_q += list(csv.DictReader(open(args.questions, encoding="utf-8")))

    ids = {f["form_id"] for f in new_forms}
    form_date = {f["form_id"]: f.get("date_checked", "") for f in new_forms}
    # Replace earlier rows for the same forms; keep everything else.
    forms = [f for f in forms if f["form_id"] not in ids]
    questions = [q for q in questions if q["form_id"] not in ids]

    added_q, dropped, kept_labels = [], 0, set()
    order = {}
    for q in new_q:
        label = " ".join(q["label_paraphrased"].split())
        given = (q.get("category", ""), q.get("topic", ""))
        ct = given if given[0] and given in taxonomy else tag(label, q.get("section", ""))
        if ct is None:
            dropped += 1
            continue
        # A packet repeats blocks (for each child, each adult): record each question once per form.
        key = (q["form_id"], label.lower())
        if key in kept_labels:
            continue
        kept_labels.add(key)
        if ct not in taxonomy:
            ct = ("other", "unclassified")
        n = order[q["form_id"]] = order.get(q["form_id"], 0) + 1
        added_q.append({
            "question_id": f"{q['form_id']}-q{n:03d}", "form_id": q["form_id"], "order": str(n),
            "section": q.get("section", ""), "label_paraphrased": label[:200], "category": ct[0], "topic": ct[1],
            "required": q.get("required") or "unknown", "input_type": q.get("input_type") or "unknown",
            "type_inferred": "no", "conditional_on": "", "hint_paraphrased": "", "observed": "direct_fetch",
            "date_checked": q.get("date_checked") or form_date.get(q["form_id"], ""),
        })

    for f in new_forms:
        for col in fh:
            f.setdefault(col, "")
    write("forms.csv", fh, forms + [{k: f.get(k, "") for k in fh} for f in new_forms])
    write("questions.csv", qh, questions + [{k: q.get(k, "") for k in qh} for q in added_q])
    unclassified = sum(1 for q in added_q if q["topic"] == "unclassified")
    print(f"application forms: {len(new_forms)}, questions kept: {len(added_q)}, "
          f"left out (not questions): {dropped}, unclassified: {unclassified}")


if __name__ == "__main__":
    main()
