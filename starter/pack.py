"""Build a fixed release snapshot and publish its static downloads using Python's standard library."""
import argparse
import csv
import io
import json
import shutil
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
STARTER = ROOT / "starter"
SCHEMAS = ROOT / "schema"
ARCHIVE = "kinderform-all-starters.zip"
VERSION = (STARTER / "VERSION").read_text().strip()


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def serialise(data):
    return (json.dumps(data, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def global_wording():
    """Use the shared English questions with neutral service wording and no location field."""
    ui = read_json(SCHEMAS / "ui/enquiry-submission.uk.json")
    ui.update(locale="en", design_system="neutral")
    ui["$comment"] = "Country-neutral starter. Agree local wording, routing and reply commitments with your service."
    ui["pages"] = [p for p in ui["pages"] if p["id"] != "postcode"]
    ui["start"]["body"] = [
        "Use this form to ask about fostering or adoption.",
        "You can ask for information even if you have yet to decide.",
        "Use made-up answers to try this example.",
    ]
    for page in ui["pages"]:
        for field in page["elements"]:
            key = field["scope"].rsplit("/", 1)[1]
            options = field["options"]
            if key == "knows_child":
                options["hint"] = "For example, you may be a relative or family friend. Please leave out details about the child."
            elif key == "phone":
                options["hint"] = "Enter the number you would like the service to use."
                options["errors"]["pattern"] = "Enter a phone number in the requested format."
            elif key == "heard_from":
                options["optionLabels"]["council_or_agency_website"] = "A service website"
    ui["confirmation"].update(team="the local service", kinship_team="the service for relatives and family friends")
    return ui


def question_assets(ui, schema):
    questions = []
    table = io.StringIO(newline="")
    writer = csv.writer(table)
    writer.writerow(["Page", "Question", "Field key", "JSON type", "Required", "Show when",
                     "Answer labels to stored values (JSON)", "Validation (JSON)", "Hint"])
    for page in ui["pages"]:
        condition = page.get("showIf", {})
        for field in page["elements"]:
            key = field["scope"].rsplit("/", 1)[1]
            rule = schema["properties"][key]
            opt = field["options"]
            labels = opt.get("optionLabels", {})
            # An English checkbox label may be translated. Keep its stored value boolean.
            choices = {label: value for value, label in labels.items()}
            if rule["type"] == "boolean":
                choices = {label: value == "true" for value, label in labels.items()}
            if opt.get("checkboxLabel"):
                choices = {opt["checkboxLabel"]: True}
            required = "yes" if key in schema["required"] else "no"
            if key in ("email", "phone"):
                required = "when shown"
            writer.writerow([page["id"], field["label"], key, rule["type"], required,
                             json.dumps(condition, ensure_ascii=False) if condition else "always",
                             json.dumps(choices, ensure_ascii=False), json.dumps(
                                 {k: v for k, v in rule.items() if k not in ("description", "type")},
                                 ensure_ascii=False), opt.get("hint", "")])
            questions.append("## " + field["label"])
            if opt.get("hint"):
                questions.append(opt["hint"])
            questions.extend("- " + label for label in choices)
            questions.append("")
    return "\n".join(questions).encode("utf-8"), table.getvalue().encode("utf-8-sig")


def test_cases(key):
    email = {"full_name": "Sam Example", "interest": "not_sure", "knows_child": False,
             "contact_method": "email", "email": "sam@example.org"}
    phone = {"full_name": "Kim Example", "interest": "fostering", "knows_child": True,
             "contact_method": "phone_call", "phone": "+1 202 555 0147", "best_times": ["saturday"]}
    sms = {k: v for k, v in phone.items() if k != "best_times"}
    sms.update(contact_method="text_message", knows_child=False)
    cases = [
        ("Email with optional fields skipped", True, email),
        ("Call about kinship", True, phone),
        ("Text with updates left unticked", True, dict(sms, updates_opt_in=False)),
        ("Email route missing an email address", False, {k: v for k, v in email.items() if k != "email"}),
        ("Call times left over after switching to text", False, dict(sms, best_times=["saturday"])),
        ("Phone left over after switching to email", False, dict(email, phone=phone["phone"])),
        ("Extra assessment question", False, dict(email, application_score=2)),
    ]
    if key == "global":
        cases.append(("Location omitted from the neutral form", False, dict(email, postcode_area="ZZ99")))
    else:
        code = key.split("-")[0]
        path, = sorted((SCHEMAS / "examples/submission/valid").glob(f"{code}-*.json"))
        cases.append(("Fictional local example from the Kinderform standard", True, read_json(path)))
    return [{"name": n, "valid": valid, "record": r} for n, valid, r in cases]


def zip_bytes(files):
    buf = io.BytesIO()
    with ZipFile(buf, "w") as archive:
        for name in sorted(files):
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            # ZIP_STORED in the maintained snapshot would be unnecessarily large.
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, files[name])
    return buf.getvalue()


def kit(key, wording_bytes, schema_bytes):
    from guides import guide_files
    from offline import render_html

    ui = json.loads(wording_bytes)
    schema = json.loads(schema_bytes)
    questions, mapping = question_assets(ui, schema)
    files = {name: text.encode("utf-8") for name, text in guide_files(ui, schema, key).items()}
    files.update({
        "form.html": render_html(ui, schema, key).encode("utf-8"),
        "questions.md": questions, "wording.json": wording_bytes,
        "field-map.csv": mapping, "submission-schema.json": schema_bytes,
        "test-cases.json": serialise(test_cases(key)), "check.py": (STARTER / "check.py").read_bytes(),
        "requirements.txt": b"jsonschema==4.26.0\n", "LICENSE-code.txt": (ROOT / "LICENSE").read_bytes(),
        "CREDITS.txt": (
            f"Kinderform contributors — {VERSION}\n"
            "Wording, documentation, schema and sample data: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).\n"
            "Code: MIT (LICENSE-code.txt). When reusing this pack, credit Kinderform and identify your changes.\n"
            f"Source: https://github.com/jamiegannaway/kinderform/tree/{VERSION}\n"
            "The portable form has independent styling. The setup guides are written in English.\n"
        ).encode(),
    })
    return files


def snapshot():
    schema = (SCHEMAS / "enquiry-submission.schema.json").read_bytes()
    locales = {"global": serialise(global_wording())}
    for path in sorted((SCHEMAS / "ui").glob("enquiry-submission.*.json")):
        locales[path.name.split(".")[1]] = path.read_bytes()
    files = {}
    names = {"global": "Any country", "uk": "United Kingdom", "us": "United States",
             "au": "Australia", "ca": "Canada (English)", "ca-fr": "Canada (français)",
             "de": "Deutschland", "fr": "France", "es": "España"}
    links = []
    for key, wording in locales.items():
        items = kit(key, wording, schema)
        files.update({f"{key}/{name}": value for name, value in items.items()})
        links.append(f'<li><a href="{key}/START-HERE.html">{escape(names.get(key, key))}</a></li>')
    files["START-HERE.html"] = (
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Choose your Kinderform starter</title><main><h1>Build a fostering or adoption enquiry form</h1>'
        '<p>Choose your starter. Each one works with your own form or question builder.</p><ul>'
        + "".join(links) + f'</ul><p>Kinderform {escape(VERSION)}</p></main></html>\n'
    ).encode()
    return zip_bytes(files)


def publish(destination):
    """Expand each preserved release. Older version URLs continue to serve their original bytes."""
    for archive_path in sorted((STARTER / "releases").glob(f"v*/{ARCHIVE}")):
        output = destination / "downloads/starter" / archive_path.parent.name
        output.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(archive_path, output / ARCHIVE)
        with ZipFile(archive_path) as archive:
            kits = {}
            for name in archive.namelist():
                rel = Path(name)
                if rel.is_absolute() or ".." in rel.parts:
                    raise ValueError(f"Invalid archive path {name}")
                file = output / rel
                file.parent.mkdir(parents=True, exist_ok=True)
                contents = archive.read(name)
                file.write_bytes(contents)
                if len(rel.parts) == 2:
                    kits.setdefault(rel.parts[0], {})[rel.parts[1]] = contents
            for key, files in kits.items():
                (output / f"kinderform-{key}-starter.zip").write_bytes(zip_bytes(files))
    if not (destination / "downloads/starter" / VERSION / ARCHIVE).exists():
        raise FileNotFoundError("Build the starter snapshot before publishing.")
    for name in ["enquiry", "enquiry-submission"]:
        dest = destination / "schema" / name / "0.1.json"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(SCHEMAS / f"{name}.schema.json", dest)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["snapshot", "publish"])
    args = parser.parse_args()
    if args.action == "snapshot":
        target = STARTER / "releases" / VERSION / ARCHIVE
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(snapshot())
        print(target)
    else:
        publish(ROOT / "site/public")
