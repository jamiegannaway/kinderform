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
.card{fill:#ffffff;stroke:#e5e5e5}.t1{fill:#0a0a0a}.t2{fill:#737373}.grid{stroke:#e5e5e5}.base{stroke:#e5e5e5}
.s1{fill:#737373}.st{fill:#171717}.stx{fill:#fafafa}.co{fill:#737373}.cox{fill:#ffffff}
.hy{fill:#f5f5f5;stroke:#737373}.hyx{fill:#0a0a0a}
.o1{fill:#d4d4d4}.o2{fill:#737373}.o4{fill:#171717}.ox{fill:#fafafa}
text{font-family:"Geist","Geist Variable",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
@media (prefers-color-scheme:dark){
.card{fill:#171717;stroke:#2e2e2e}.t1{fill:#fafafa}.t2{fill:#a1a1a1}.grid{stroke:#2e2e2e}.base{stroke:#2e2e2e}
.st{fill:#e5e5e5}.stx{fill:#171717}.hy{fill:#262626;stroke:#a1a1a1}.hyx{fill:#fafafa}
.o1{fill:#404040}.o4{fill:#e5e5e5}.ox{fill:#171717}}
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
            f'<rect class="card" x="0.5" y="0.5" width="{width - 1}" height="{height - 1}" rx="12" stroke-width="1"/>{body}</svg>\n')


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


def footer_lines(body, y, footer):
    """shadcn CardFooter: a medium-weight lead line and a muted note."""
    if not footer:
        return y
    lead, note = footer
    body.append(text(24, y + 20, lead, "t1", 13, weight="600"))
    if note:
        body.append(text(24, y + 40, note, "t2", 13))
        return y + 52
    return y + 32


def hbar_chart(title, subtitle, rows, unit="", width=760, label_w=230, value_fmt=str, max_value=None, footer=None):
    """shadcn "Bar Chart - Horizontal": muted category labels, rounded bars, value past the bar end."""
    row_h, top = 34, 78
    plot_w = width - label_w - 150
    top_value = max_value or max((v for _, v in rows), default=1) or 1
    body = [text(24, 34, title, size=16, weight="600"), text(24, 56, subtitle, "t2", 13)]
    for i, (label, value) in enumerate(rows):
        y = top + i * row_h
        w = plot_w * value / top_value
        body.append(text(label_w - 12, y + 17, label, "t2", 12, "end"))
        body.append(bar(label_w, y + 2, max(w, 2), 24, "s1"))
        shown = value_fmt(value) + unit
        if value == 1:
            shown = shown.replace(" days", " day").replace(" jurisdictions", " jurisdiction")
        body.append(text(label_w + max(w, 2) + 8, y + 18, shown, "t1", 12, weight="500"))
    y = top + row_h * len(rows)
    height = footer_lines(body, y, footer) + 16
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
    """shadcn section cards: label, large figure, muted note, each in its own card."""
    per_row, gap = 4, 12
    cell_w = (760 - 48 - gap * (per_row - 1)) / per_row
    rows = (len(stats) + per_row - 1) // per_row
    width, height = 760, 60 + rows * 104
    body = [text(24, 34, "The US survey in numbers", size=16, weight="600")]
    for i, (label, value, note) in enumerate(stats):
        col, row = i % per_row, i // per_row
        x, y = 24 + col * (cell_w + gap), 50 + row * 104
        body.append(f'<rect class="card" x="{x:.1f}" y="{y}" width="{cell_w:.1f}" height="92" rx="10" stroke-width="1"/>')
        body.append(text(x + 14, y + 24, label, "t2", 12))
        body.append(text(x + 14, y + 56, f"{value:,}", "t1", 26, weight="600"))
        body.append(text(x + 14, y + 78, note, "t2", 11))
    return svg(width, height, "".join(body), "The US survey in numbers")


def tile_map(admin, counts):
    size, gap, left, top = 60, 6, 24, 74
    width = left * 2 + 11 * (size + gap)
    height = top + 8 * (size + gap) + 44
    cls = {"state_administered": ("st", "stx"), "county_administered": ("co", "cox"), "hybrid": ("hy", "hyx")}
    names = [("st", "State-run"), ("co", "County-run"), ("hy", "Mixed state and county")]
    body = [text(24, 34, "Who runs child welfare, and front doors found per state", size=16, weight="600"),
            text(24, 56, "Each square is a state, placed roughly where it sits on the map. The number is front doors in the register.", "t2", 13)]
    for r, row in enumerate(TILES):
        for c, code in enumerate(row):
            if not code:
                continue
            x, y = left + c * (size + gap), top + r * (size + gap)
            fill, ink = cls.get(admin.get(code, ""), ("hy", "hyx"))
            dash = ' stroke-width="1.5" stroke-dasharray="4 3"' if fill == "hy" else ""
            body.append(f'<rect class="{fill}" x="{x}" y="{y}" width="{size}" height="{size}" rx="8"{dash}/>')
            body.append(text(x + size / 2, y + 27, code, ink, 15, "middle", "600"))
            body.append(text(x + size / 2, y + 45, counts.get(code, 0), ink, 12, "middle"))
    ly = top + 8 * (size + gap) + 20
    total_w = sum(18 + len(n) * 6.6 + 18 for _, n in names)
    lx = (width - total_w) / 2
    for key, name in names:
        dash = ' stroke-width="1" stroke-dasharray="2 2"' if key == "hy" else ""
        body.append(f'<rect class="{key}" x="{lx:.1f}" y="{ly - 10}" width="10" height="10" rx="2"{dash}/>')
        body.append(text(lx + 16, ly, name, "t1", 12))
        lx += 18 + len(name) * 6.6 + 18
    return svg(width, height, "".join(body), "Tile map of US states by who runs child welfare")


def evidence_chart(tables):
    """shadcn "Bar Chart - Stacked + Legend": one rounded stacked bar per data set."""
    steps = [("search", "Desk review only", "o1", "t1"), ("opened", "Page or form opened", "o2", "cox"),
             ("verified", "Verified by a person", "o4", "ox")]
    width, label_w, top, row_h = 760, 230, 78, 36
    plot_w = width - label_w - 40
    body = [text(24, 34, "How far each data set has been checked", size=16, weight="600"),
            text(24, 56, "Rows by the closest look taken so far.", "t2", 13)]
    for i, (label, rows) in enumerate(tables):
        y = top + i * row_h
        total = len(rows) or 1
        parts = Counter()
        for r in rows:
            if r.get("verification") == "verified":
                parts["verified"] += 1
            elif r.get("evidence_level") in ("page_read", "form_read"):
                parts["opened"] += 1
            else:
                parts["search"] += 1
        body.append(text(label_w - 12, y + 16, f"{label} ({len(rows):,})", "t2", 12, "end"))
        body.append(f'<clipPath id="c{i}"><rect x="{label_w}" y="{y + 2}" width="{plot_w}" height="20" rx="4"/></clipPath>')
        x = label_w
        seg = []
        for key, _, c, ink in steps:
            w = plot_w * parts.get(key, 0) / total
            if w <= 0:
                continue
            seg.append(f'<rect class="{c}" x="{x:.1f}" y="{y + 2}" width="{w:.1f}" height="20"/>')
            if w > 44:
                seg.append(text(x + 8, y + 16, f"{round(100 * parts[key] / total)}%", ink, 11, weight="600"))
            x += w
        body.append(f'<g clip-path="url(#c{i})">' + "".join(seg) + "</g>")
    ly = top + row_h * len(tables) + 14
    total_w = sum(18 + len(n) * 6.6 + 18 for _, n, _, _ in steps)
    lx = (width - total_w) / 2
    for _, name, c, _ in steps:
        body.append(f'<rect class="{c}" x="{lx:.1f}" y="{ly - 10}" width="10" height="10" rx="2"/>')
        body.append(text(lx + 16, ly, name, "t1", 12))
        lx += 18 + len(name) * 6.6 + 18
    verified = sum(r.get("verification") == "verified" for _, rows in tables for r in rows)
    total_rows = sum(len(rows) for _, rows in tables)
    height = footer_lines(body, ly + 8, (f"{verified:,} of {total_rows:,} rows verified by a second person",
                                          "Verification is the next phase.")) + 16
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
    charts["levels.svg"] = hbar_chart("Front doors by level", "Where the front door sits: a county, a region, the whole state, a tribe or a city.", level_rows,
                                      footer=(f"{level_rows[0][1]:,} are county agencies", f"Of {len(doors):,} front doors found."))
    tables["levels"] = level_rows

    sectors = Counter(d["sector"] for d in doors)
    names = {"public": "Public", "private_nonprofit": "Private non-profit", "tribal": "Tribal", "private_for_profit": "Private for-profit"}
    sector_rows = [(names[k], sectors.get(k, 0)) for k in names]
    charts["sectors.svg"] = hbar_chart("Front doors by who runs them", "Includes private organisations a state contracts to run its front door.", sector_rows,
                                       footer=(f"{len(private):,} private licensed agencies so far", "A first sample of up to 10 per state."))
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
            promise_rows, " days", label_w=310, value_fmt=lambda v: f"{v:g}",
            footer=(f"{len(promise_rows)} front doors publish a reply time", "As written on the page; not measured."))
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
            enquiry_rows, "%", max_value=100,
            footer=(f"{enquiry_rows[0][0]} is asked on {enquiry_rows[0][1]}% of forms", "Topics are tagged by keyword rules and need review."))
    tables["enquiry"] = (enquiry_rows, n_enquiry)

    app_rows, n_app = share_by_topic(aq, "form_id", skip | {"name", "location", "postal_address", "contact_phone", "contact_email"})
    if app_rows:
        charts["application-topics.svg"] = hbar_chart(
            "What application forms ask, beyond contact details",
            f"Share of the {n_app} fillable application forms read that ask about each topic.", app_rows, "%", max_value=100,
            footer=("A full application asks much more than an enquiry", "Name, address and contact details are left out here."))
    tables["application"] = (app_rows, n_app)

    ages = first_value(policies, "min_age", {"years"})
    age_rows = sorted(Counter(int(v) for v in ages.values()).items())
    if age_rows:
        charts["min-age.svg"] = hbar_chart(
            "Minimum age to foster", f"Number of jurisdictions by the minimum age recorded ({len(ages)} with a figure).",
            [(f"{a} years", n) for a, n in age_rows], " jurisdictions", label_w=120,
            footer=(f"{max(age_rows, key=lambda r: r[1])[0]} years is most common", None))
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
            train_rows, " jurisdictions", label_w=140,
            footer=(f"{max(train_rows, key=lambda r: r[1])[0]} is most common", None))
    tables["training"] = train_rows

    terms = first_value(policies, "licence_term", {"years", "months"})
    term_rows = sorted(Counter(f"{v:g} year" + ("" if v == 1 else "s") for v in terms.values()).items(),
                       key=lambda r: float(r[0].split()[0]))
    if term_rows:
        charts["licence-term.svg"] = hbar_chart(
            "How long a foster licence lasts", f"Number of jurisdictions by licence term recorded ({len(terms)} with a figure).",
            term_rows, " jurisdictions", label_w=120,
            footer=(f"{max(term_rows, key=lambda r: r[1])[0]} is most common", None))
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
