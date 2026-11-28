"""Produce a single portable HTML example from the published question and submission schemas."""

import base64
import hashlib
from html import escape
import json
from pathlib import Path
from string import Template

ASSETS = Path(__file__).parent
REGION = {"uk": "United Kingdom", "us": "United States", "ca": "Canada", "ca-fr": "Canada",
          "au": "Australia", "de": "Deutschland", "fr": "France", "es": "España", "ie": "Ireland",
          "nl": "Nederland", "nz": "New Zealand", "sg": "Singapore", "no": "Norge",
          "dk": "Danmark", "fi": "Suomi", "global": "Global"}


def _question(page, schema):
    """Render native controls from the same labels, options and rules as the site."""
    title = page.get("title", page["elements"][0]["label"])
    pid = escape(page["id"])
    html = [f'<section hidden id="page-{pid}" aria-labelledby="title-{pid}">',
            f'<p class="section-label">{escape(page["section"])}</p>',
            f'<h2 id="title-{pid}" tabindex="-1">{escape(title)}</h2>']
    metadata = []
    for control in page["elements"]:
        key = control["scope"].split("/")[-1]
        kind = schema["properties"][key]["type"]
        options = control.get("options", {})
        labels = options.get("optionLabels", {})
        field = escape(key)
        label = escape(control["label"])
        label_class = ' class="sr"' if control["label"] == title else ""
        described_by = f"error-{field}"
        if options.get("hint"):
            described_by = f"hint-{field} {described_by}"
        group = options.get("format") == "radio" or kind == "array"
        if group:
            html.append(f'<fieldset aria-describedby="{described_by}"><legend{label_class}>{label}</legend>')
        elif options.get("format") != "checkbox":
            html.append(f'<label for="{field}"{label_class}>{label}</label>')
        if options.get("hint"):
            html.append(f'<p class="hint" id="hint-{field}">{escape(options["hint"])}</p>')
        html.append(f'<p class="error" id="error-{field}" hidden></p>')
        if group:
            input_type = "checkbox" if kind == "array" else "radio"
            for i, (value, name) in enumerate(labels.items()):
                ident = f"{field}-{i}"
                hint = options.get("optionHints", {}).get(value)
                desc = f"{described_by} {ident}-hint" if hint else described_by
                html.append(f'<label class="choice"><input type="{input_type}" name="{field}" '
                            f'value="{escape(value)}" id="{ident}" aria-describedby="{desc}">'
                            f'<span>{escape(name)}')
                if hint:
                    html.append(f'<small id="{ident}-hint">{escape(hint)}</small>')
                html.append('</span></label>')
            html.append('</fieldset>')
        elif options.get("format") == "checkbox":
            html.append(f'<label class="choice"><input type="checkbox" id="{field}" name="{field}" '
                        f'aria-describedby="{described_by}"><span>{escape(options["checkboxLabel"])}</span></label>')
        else:
            input_type = {"email": "email", "phone": "tel"}.get(key, "text")
            mode = escape(options.get("inputmode", "text"))
            html.append(f'<input type="{input_type}" id="{field}" name="{field}" inputmode="{mode}" '
                        f'autocomplete="off" aria-describedby="{described_by}">')
        metadata.append({"field": key, "label": control["label"], "choices": labels,
                         "transform": options.get("transform"), "errors": options.get("errors", {})})
    html.append("</section>")
    return "\n".join(html), {"id": page["id"], "when": page.get("showIf", {}), "fields": metadata}


def _hash(text):
    value = hashlib.sha256(text.encode("utf-8")).digest()
    return "'sha256-" + base64.b64encode(value).decode("ascii") + "'"


def render_html(ui: dict, schema: dict, lang: str) -> str:
    """Return one offline file. lang is the source variant key, e.g. ca-fr or global."""
    wording = json.loads((ASSETS / "offline-copy.json").read_text(encoding="utf-8"))[ui["locale"].split("-")[0]]
    questions = [_question(page, schema) for page in ui["pages"]]
    labels = dict(wording, **ui["progress"], change=ui["check"]["change"])
    config = {"variant": lang, "pages": [q[1] for q in questions], "schema": schema, "labels": labels}
    # Escaping '<' prevents even a quoted '</script>' in source wording from closing the element.
    encoded = json.dumps(config, ensure_ascii=True, separators=(",", ":")).replace("<", "\\u003c")
    script = (ASSETS / "offline.js").read_text(encoding="utf-8").replace("/*CONFIG*/ {}", encoded)
    css = (ASSETS / "offline.css").read_text(encoding="utf-8")
    template = Template((ASSETS / "offline.html").read_text(encoding="utf-8"))
    return template.substitute(**{k: escape(v) for k, v in wording.items()}, locale=escape(ui["locale"]),
                               region=escape(REGION[lang]), heading=escape(ui["start"]["title"]),
                               start=escape(ui["start"]["button"]), continue_label=escape(ui["progress"]["continue"]),
                               back=escape(ui["progress"]["back"]), restart=escape(ui["confirmation"]["restart"]),
                               questions="\n".join(q[0] for q in questions), script=script, css=css,
                               script_hash=_hash(script), style_hash=_hash(css))
