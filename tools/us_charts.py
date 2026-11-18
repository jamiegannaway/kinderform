"""Build the SVG charts for docs/us-survey-plan.md from register/us/.

Called by tools/us_summary.py. Standard library only. Each chart is a static
SVG that follows the viewer's light or dark theme, carries direct labels (so no
reading depends on colour alone) and has a matching table on the page.

Palette: the validated reference palette (categorical slots 1-3 pass all-pairs
in light and dark mode; slot 3 is below 3:1 on the light surface, so every
coloured mark is directly labelled).
"""

import csv
import re
from collections import Counter, defaultdict
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
US = ROOT / "register" / "us"
IMG = ROOT / "docs" / "img" / "us"

STYLE = """<style>
.bg{fill:#fcfcfb}.t1{fill:#0b0b0b}.t2{fill:#52514e}.grid{stroke:#e2e1dc}.base{stroke:#b9b8b2}
.s1{fill:#2a78d6}.s2{fill:#eb6834}.s3{fill:#1baf7a}.ink{fill:#0b0b0b}
.o1{fill:#cde2fb}.o2{fill:#86b6ef}.o3{fill:#2a78d6}.o4{fill:#104281}
text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
@media (prefers-color-scheme:dark){
.bg{fill:#1a1a19}.t1{fill:#f0efec}.t2{fill:#c3c2b7}.grid{stroke:#34332f}.base{stroke:#5b5a55}
.s1{fill:#3987e5}.s2{fill:#d95926}.s3{fill:#199e70}
.o1{fill:#2b3a4f}.o2{fill:#256abf}.o3{fill:#5598e7}.o4{fill:#b7d3f6}}
</style>"""

TILES = [
    ["AK", "", "", "", "", "", "", "", "", "", "ME"],
    ["", "", "", "", "", "", "", "", "", "VT", "NH"],
    ["WA", "ID", "MT", "ND", "MN", "IL", "WI", "MI", "NY", "RI", "MA"],
    ["OR", "NV", "WY", "SD", "IA", "IN", "OH", "PA", "NJ", "CT", ""],
    ["CA", "UT", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "DE", ""],
    ["", "AZ", "NM", "KS", "AR", "TN", "NC", "SC", "DC", "", ""],
    ["", "", "", "OK", "LA", "MS", "AL", "GA", "", "", ""],
    ["HI", "", "", "TX", "", "", "", "", "FL", "", ""],
]


def read(name):
    with (US / name).open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def svg(width, height, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" '
            f'height="{height}" role="img" aria-label="{escape(title)}">{STYLE}'
            f'<rect class="bg" width="{width}" height="{height}" rx="8"/>{body}</svg>\n')


def text(x, y, value, cls="t1", size=13, anchor="start", weight="400"):
    return (f'<text x="{x}" y="{y}" class="{cls}" font-size="{size}" text-anchor="{anchor}" '
            f'font-weight="{weight}">{escape(str(value))}</text>')


def bar(x, y, w, h, cls):
    """Horizontal bar with a 4px rounded data end and a square baseline end."""
    if w <= 0:
        return ""
    r = min(4, w, h / 2)
    return (f'<path class="{cls}" d="M{x},{y} h{w - r:.1f} a{r},{r} 0 0 1 {r},{r} v{h - 2 * r:.1f} '
            f'a{r},{r} 0 0 1 -{r},{r} h-{w - r:.1f} z"/>')


def hbar_chart(title, subtitle, rows, unit="", width=760, label_w=230, value_fmt=str, max_value=None):
    """rows: list of (label, value). One series, so no legend; the title names it."""
    row_h, top = 30, 74
    height = top + row_h * len(rows) + 20
    plot_w = width - label_w - 150
    top_value = max_value or max((v for _, v in rows), default=1) or 1
    body = [text(24, 32, title, size=17, weight="600"), text(24, 54, subtitle, "t2", 13)]
    for i, (label, value) in enumerate(rows):
        y = top + i * row_h
        w = plot_w * value / top_value
        body.append(text(label_w - 10, y + 15, label, "t1", 13, "end"))
        body.append(f'<line class="base" x1="{label_w}" x2="{label_w}" y1="{y - 2}" y2="{y + 22}" stroke-width="1"/>')
        body.append(bar(label_w, y + 2, max(w, 2), 16, "s1"))
        shown = value_fmt(value) + unit
        if value == 1:
            shown = shown.replace(" days", " day").replace(" jurisdictions", " jurisdiction")
        body.append(text(label_w + max(w, 2) + 8, y + 15, shown, "t2", 12))
    return svg(width, height, "".join(body), title)


def short(name, limit=40):
    """Shorten a label at a word boundary."""
    if len(name) <= limit:
        return name
    return name[:limit].rsplit(" ", 1)[0].rstrip(" ,:;-") + "…"


TOPIC_LABELS = {
    "contact_email": "Email address", "contact_phone": "Phone number", "name": "Name",
    "free_text": "Open comment box", "location": "ZIP, county or city", "postal_address": "Street address",
    "source": "How they heard of us", "demographics": "Race, gender or faith", "interest_type": "Fostering or adopting",
    "contact_preference": "Best time or way to contact", "date_of_birth": "Date of birth or age",
    "housing": "Housing", "consent_marketing": "Marketing opt-in", "consent_contact": "Consent to contact",
    "relationship_status": "Relationship status", "household_members": "Who lives in the home",
    "employment": "Work", "income": "Income", "language": "Language", "readiness": "How soon",
    "child_preferences": "Children they could care for", "education": "Education",
    "criminal_history": "Criminal history", "health": "Health", "references": "References",
    "motivation": "Why they want to foster", "parenting_history": "Parenting history",
    "background_check_consent": "Consent to background checks", "transport": "Driving and vehicle",
    "support_network": "Support network", "relationship_history": "Earlier marriages",
    "household_adults_checks": "Other adults in the home", "substance_use": "Alcohol or drugs",
    "parenting_approach": "Discipline and parenting", "home_safety": "Home safety",
    "prior_experience": "Earlier fostering", "child_protection_history": "Child protection history",
    "eligibility_other": "Other eligibility", "age_check": "Over minimum age",
}


def headline(stats):
    width, height = 760, 70 + 92 * ((len(stats) + 3) // 4)
    body = [text(24, 32, "The US survey in numbers", size=17, weight="600")]
    per_row = 4
    cell_w = (width - 48) / per_row
    for i, (label, value, note) in enumerate(stats):
        col, row = i % per_row, i // per_row
        x, y = 24 + col * cell_w, 52 + row * 92
        body.append(text(x, y + 34, f"{value:,}", "t1", 34, weight="700"))
        body.append(text(x, y + 56, label, "t1", 13, weight="600"))
        body.append(text(x, y + 74, note, "t2", 12))
    return svg(width, height, "".join(body), "The US survey in numbers")


def tile_map(admin, counts):
    size, gap, left, top = 60, 6, 24, 70
    width = left * 2 + 11 * (size + gap)
    height = top + 8 * (size + gap) + 40
    cls = {"state_administered": "s1", "county_administered": "s2", "hybrid": "s3"}
    names = {"s1": "State-run", "s2": "County-run", "s3": "Mixed state and county"}
    body = [text(24, 32, "Who runs child welfare, and front doors found per state", size=17, weight="600"),
            text(24, 54, "Each square is a state, placed roughly where it sits on the map. The number is front doors in the register.", "t2", 13)]
    for r, row in enumerate(TILES):
        for c, code in enumerate(row):
            if not code:
                continue
            x, y = left + c * (size + gap), top + r * (size + gap)
            fill = cls.get(admin.get(code, ""), "t2")
            body.append(f'<rect class="{fill}" x="{x}" y="{y}" width="{size}" height="{size}" rx="6"/>')
            body.append(text(x + size / 2, y + 26, code, "ink", 15, "middle", "700"))
            body.append(text(x + size / 2, y + 46, counts.get(code, 0), "ink", 13, "middle"))
    ly = top + 8 * (size + gap) + 14
    lx = left
    for key in ("s1", "s2", "s3"):
        body.append(f'<rect class="{key}" x="{lx}" y="{ly - 11}" width="14" height="14" rx="3"/>')
        body.append(text(lx + 20, ly + 1, names[key], "t1", 13))
        lx += 20 + len(names[key]) * 7.4 + 26
    return svg(width, height, "".join(body), "Tile map of US states by who runs child welfare")


def evidence_chart(tables):
    """One stacked bar per data set: how far its rows have been checked (ordinal blues)."""
    steps = [("search_result", "Search result only", "o1"), ("page_read", "Page opened", "o2"),
             ("form_read", "Form opened", "o3"), ("verified", "Verified by a person", "o4")]
    width, label_w, top, row_h = 760, 230, 96, 34
    plot_w = width - label_w - 40
    height = top + row_h * len(tables) + 24
    body = [text(24, 32, "How far each data set has been checked", size=17, weight="600"),
            text(24, 54, "Share of rows by the closest look taken so far. Nothing is verified by a second person yet.", "t2", 13)]
    lx = 24
    for _, name, c in steps:
        body.append(f'<rect class="{c}" x="{lx}" y="66" width="14" height="14" rx="3"/>')
        body.append(text(lx + 20, 78, name, "t1", 12))
        lx += 20 + len(name) * 6.8 + 22
    for i, (label, rows) in enumerate(tables):
        y = top + i * row_h
        total = len(rows) or 1
        counts = Counter("verified" if r.get("verification") == "verified" else r.get("evidence_level", "") for r in rows)
        body.append(text(label_w - 10, y + 16, f"{label} ({len(rows):,})", "t1", 13, "end"))
        x = label_w
        for key, _, c in steps:
            w = plot_w * counts.get(key, 0) / total
            if w <= 0:
                continue
            body.append(f'<rect class="{c}" x="{x:.1f}" y="{y + 2}" width="{max(w - 2, 1):.1f}" height="18"/>')
            if w > 44:
                share = round(100 * counts[key] / total)
                tc = "t1" if c in ("o1", "o2") else "bg"
                body.append(text(x + 6, y + 15, f"{share}%", tc, 11, weight="600"))
            x += w
    return svg(width, height, "".join(body), "How far each data set has been checked")


def first_value(policies, topic, unit_ok, applies=("fostering", "both")):
    per_state = {}
    for row in policies:
        if row["topic"] != topic or not row["value"] or row["applies_to"] not in applies:
            continue
        if row["unit"] not in unit_ok:
            continue
        value = float(row["value"])
        if row["unit"] == "months":
            value = value / 12
        per_state.setdefault(row["state_code"], value)
    return per_state


def build():
    states = read("states.csv")
    doors = read("front-doors.csv")
    policies = read("policies.csv")
    forms = read("application-forms.csv")
    fq = read("form-questions.csv")
    aq = read("application-questions.csv")
    promises = read("response-promises.csv")

    charts, tables = {}, {}
    private = [d for d in doors if d["sector"].startswith("private") and d["contracted"] == "no"]
    stats = [
        ("Jurisdictions", len(states), "50 states and DC"),
        ("Front doors", len(doors), f"{len(private):,} of them private agencies"),
        ("Policy rules", len(policies), f"{len({p['state_code'] for p in policies})} jurisdictions"),
        ("Form questions", len(fq) + len(aq), f"from {len({q['front_door_id'] for q in fq}) + len({q['form_id'] for q in aq})} forms"),
        ("Application forms", len(forms), f"{sum(1 for f in forms if f['url'])} with a direct link"),
        ("Reply promises", len(promises), "published on front-door pages"),
        ("Pages opened", sum(d["evidence_level"] in ("page_read", "form_read") for d in doors), "front doors checked live"),
        ("Verified rows", sum(r.get("verification") == "verified" for t in (states, doors, policies, forms) for r in t), "by a second person"),
    ]
    charts["headline.svg"] = headline(stats)

    admin = {s["state_code"]: s["administration"] for s in states}
    per_state = Counter(d["state_code"] for d in doors)
    charts["map.svg"] = tile_map(admin, per_state)

    levels = Counter(d["level"] for d in doors)
    level_rows = [(n.capitalize(), levels.get(n, 0)) for n in ("county", "regional", "state", "tribal", "city")]
    charts["levels.svg"] = hbar_chart("Front doors by level", "Where the front door sits: a county, a region, the whole state, a tribe or a city.", level_rows)
    tables["levels"] = level_rows

    sectors = Counter(d["sector"] for d in doors)
    names = {"public": "Public", "private_nonprofit": "Private non-profit", "tribal": "Tribal", "private_for_profit": "Private for-profit"}
    sector_rows = [(names[k], sectors.get(k, 0)) for k in names]
    charts["sectors.svg"] = hbar_chart("Front doors by who runs them", "Includes private organisations a state contracts to run its front door.", sector_rows)
    tables["sectors"] = sector_rows

    data_sets = [("States", states), ("Front doors", doors), ("Policy rules", policies),
                 ("Application forms", forms), ("Enquiry questions", fq), ("Application questions", aq),
                 ("Reply promises", promises)]
    charts["evidence.svg"] = evidence_chart(data_sets)
    tables["evidence"] = [(label, len(rows), sum(r.get("evidence_level") in ("page_read", "form_read") for r in rows),
                           sum(r.get("verification") == "verified" for r in rows)) for label, rows in data_sets]

    door_name = {d["front_door_id"]: (d["name"], d["state_code"]) for d in doors}
    best = {}
    for p in promises:
        if p["stated_hours"]:
            hours = float(p["stated_hours"])
            if p["front_door_id"] not in best or hours < best[p["front_door_id"]]:
                best[p["front_door_id"]] = hours
    promise_rows = sorted(((f"{short(door_name[k][0], 34)} ({door_name[k][1]})", v / 24) for k, v in best.items()),
                          key=lambda r: (r[1], r[0]))
    if promise_rows:
        charts["promises.svg"] = hbar_chart(
            "Published reply promises", "Days within which a front door says it will make contact, as written on its page.",
            promise_rows, " days", label_w=310, value_fmt=lambda v: f"{v:g}")
    tables["promises"] = promise_rows

    def share_by_topic(rows, key, skip):
        forms_ = defaultdict(set)
        for r in rows:
            if r["topic"] not in skip:
                forms_[r["topic"]].add(r[key])
        total = len({r[key] for r in rows}) or 1
        out = sorted(((TOPIC_LABELS.get(t, t.replace("_", " ").capitalize()), round(100 * len(s) / total)) for t, s in forms_.items()),
                     key=lambda r: (-r[1], r[0]))
        return out[:12], total

    skip = {"other", "captcha", "privacy_ack"}
    enquiry_rows, n_enquiry = share_by_topic(fq, "front_door_id", skip)
    if enquiry_rows:
        charts["enquiry-topics.svg"] = hbar_chart(
            "What first-contact enquiry forms ask", f"Share of the {n_enquiry} enquiry forms read that ask about each topic.",
            enquiry_rows, "%", max_value=100)
    tables["enquiry"] = (enquiry_rows, n_enquiry)

    app_rows, n_app = share_by_topic(aq, "form_id", skip | {"name", "location", "postal_address", "contact_phone", "contact_email"})
    if app_rows:
        charts["application-topics.svg"] = hbar_chart(
            "What application forms ask, beyond contact details",
            f"Share of the {n_app} fillable application forms read that ask about each topic.", app_rows, "%", max_value=100)
    tables["application"] = (app_rows, n_app)

    ages = first_value(policies, "min_age", {"years"})
    age_rows = sorted(Counter(int(v) for v in ages.values()).items())
    if age_rows:
        charts["min-age.svg"] = hbar_chart(
            "Minimum age to foster", f"Number of jurisdictions by the minimum age recorded ({len(ages)} with a figure).",
            [(f"{a} years", n) for a, n in age_rows], " jurisdictions", label_w=120)
    tables["min_age"] = age_rows

    training = first_value(policies, "training_preservice", {"hours"})
    bins = [(0, 10), (10, 20), (20, 30), (30, 40), (40, 1000)]
    train_rows = []
    for lo, hi in bins:
        label = f"{lo}+ hours" if hi == 1000 else f"{lo}-{hi - 1} hours"
        train_rows.append((label, sum(lo <= v < hi for v in training.values())))
    if training:
        charts["training.svg"] = hbar_chart(
            "Training before licensing", f"Number of jurisdictions by pre-service training hours recorded ({len(training)} with a figure).",
            train_rows, " jurisdictions", label_w=140)
    tables["training"] = train_rows

    terms = first_value(policies, "licence_term", {"years", "months"})
    term_rows = sorted(Counter(f"{v:g} year" + ("" if v == 1 else "s") for v in terms.values()).items(),
                       key=lambda r: float(r[0].split()[0]))
    if term_rows:
        charts["licence-term.svg"] = hbar_chart(
            "How long a foster licence lasts", f"Number of jurisdictions by licence term recorded ({len(terms)} with a figure).",
            term_rows, " jurisdictions", label_w=120)
    tables["licence_term"] = term_rows
    return charts, tables


def write(charts):
    IMG.mkdir(parents=True, exist_ok=True)
    for name, content in charts.items():
        (IMG / name).write_text(content, encoding="utf-8")


if __name__ == "__main__":
    charts, _ = build()
    write(charts)
    print(f"wrote {len(charts)} charts to {IMG.relative_to(ROOT)}")
