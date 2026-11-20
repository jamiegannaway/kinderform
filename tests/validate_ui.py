"""Check the wording files for the reference forms (schema/ui/*.json).

- Every question points at a field that exists in schema/enquiry-submission.schema.json.
- Every answer a field allows has a label.
- Translations of one country's form (enquiry-submission.<country>-<lang>.json, for example
  ca-fr) have exactly the same pages, fields, options, hints and error messages as the main
  file (enquiry-submission.<country>.json), so the two cannot drift apart.

Run from the repository root:  python tests/validate_ui.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = json.loads((ROOT / "schema" / "enquiry-submission.schema.json").read_text(encoding="utf-8"))
PROPS = SCHEMA["properties"]
UI = sorted((ROOT / "schema" / "ui").glob("enquiry-submission.*.json"))

errors: list[str] = []


def allowed(field: str) -> list[str]:
    p = PROPS[field]
    if p.get("type") == "boolean":
        return ["true", "false"]
    return [str(v) for v in p.get("enum", p.get("items", {}).get("enum", []))]


def shape(ui: dict) -> list:
    """What must match between a form and its translation: everything except the words."""
    out = [len(ui["sections"]), ui["locale"].split("-")[1], ui["design_system"]]
    for page in ui["pages"]:
        els = []
        for el in page["elements"]:
            o = el.get("options", {})
            els.append((
                el["scope"],
                tuple(sorted(o)),
                tuple(sorted(o.get("optionLabels", {}))),
                tuple(sorted(o.get("optionHints", {}))),
                tuple(sorted(o.get("errors", {}))),
            ))
        out.append((page["id"], "title" in page, json.dumps(page.get("showIf"), sort_keys=True), tuple(els)))
    return out


files = {}
for path in UI:
    name = path.name.removeprefix("enquiry-submission.").removesuffix(".json")
    ui = json.loads(path.read_text(encoding="utf-8"))
    files[name] = ui
    for page in ui["pages"]:
        for el in page["elements"]:
            field = el["scope"].split("/")[-1]
            if field not in PROPS:
                errors.append(f"{path.name}: page '{page['id']}' asks for '{field}', which is not in the schema")
                continue
            labels = el.get("options", {}).get("optionLabels")
            if labels is not None:
                missing = [v for v in allowed(field) if v not in labels]
                if missing:
                    errors.append(f"{path.name}: page '{page['id']}' has no label for {missing}")

for name, ui in files.items():
    m = re.fullmatch(r"([a-z]{2})-([a-z]{2})", name)
    if not m:
        continue
    main = files.get(m.group(1))
    if main is None:
        errors.append(f"{name}: no main file enquiry-submission.{m.group(1)}.json to translate")
    elif shape(ui) != shape(main):
        errors.append(f"{name}: pages, fields, options or messages differ from enquiry-submission.{m.group(1)}.json")
    if not ui["locale"].lower().startswith(m.group(2)):
        errors.append(f"{name}: locale {ui['locale']} does not match the file name")

for e in errors:
    print("FAIL", e)
if errors:
    sys.exit(1)
print(f"OK: {len(files)} wording files ({', '.join(files)})")
