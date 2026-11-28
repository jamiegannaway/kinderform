"""Export monitoring records to CSV, keeping only the fields tagged for one purpose.

Reads JSON files (one record each, or a list of records) or JSON Lines files.
Writes only the fields that schema/data-handling.json tags with --purpose. It
refuses to export any column tagged personal, personal_contact,
special_category or criminal_offence. It checks each record against its schema.

  python3 tools/export_csv.py --purpose measure_service records.jsonl > out.csv
  python3 tools/export_csv.py --purpose measure_service --tags-row --dictionary dictionary.csv -o out.csv a.json b.json

--schema picks enquiry (the default), enquiry-submission or interaction.
--tags-row adds a second header row with each column's sensitivity tag.
--dictionary FILE writes a column dictionary (tags for each exported column).
A cell that starts with = + - @ gets a leading apostrophe so a spreadsheet does
not run it as a formula. An export of pseudonymous records is still private;
check it before it leaves the service. Messages never contain record values.
"""

import argparse
import csv
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "schema"))
REFUSED = ("personal", "personal_contact", "special_category", "criminal_offence")
SCHEMAS = {"enquiry": "enquiry.schema.json", "enquiry-submission": "enquiry-submission.schema.json",
           "interaction": "interaction.schema.json"}


class ExportError(ValueError):
    """A content-free reason the export was refused."""


def load_tags():
    return json.loads((ROOT / "schema" / "data-handling.json").read_text(encoding="utf-8"))


def columns(schema_name, purpose, tags=None):
    """Return [(dotted path, tag)] for the leaf fields tagged with purpose."""
    tags = tags or load_tags()
    if purpose not in tags["purposes"]:
        raise ExportError("Unknown purpose.")
    if schema_name not in tags["schemas"]:
        raise ExportError("Unknown schema.")
    tagged = tags["schemas"][schema_name]
    chosen = {path: tag for path, tag in tagged.items() if purpose in tag["purposes"]}
    # Export the leaves: skip an object when its children are also tagged.
    leaves = {path: tag for path, tag in chosen.items()
              if not any(other.startswith(path + ".") for other in tagged)}
    for path, tag in leaves.items():
        if tag["sensitivity"] in REFUSED:
            raise ExportError(f"{path}: tagged {tag['sensitivity']}, so it cannot be exported.")
    return list(leaves.items())


def read_records(path):
    text = Path(path).read_text(encoding="utf-8")
    if Path(path).suffix == ".jsonl":
        try:
            return [json.loads(line) for line in text.splitlines() if line.strip()]
        except ValueError:
            raise ExportError("A line is not JSON.") from None
    try:
        data = json.loads(text)
    except ValueError:
        raise ExportError("A file is not JSON.") from None
    return data if isinstance(data, list) else [data]


def check_record(schema_name, record, validator):
    if schema_name == "enquiry":
        from validate_enquiry import problems
        errors = problems(record)
    else:
        errors = [".".join(map(str, e.absolute_path)) + ": " + e.validator for e in validator.iter_errors(record)]
    if errors:
        raise ExportError("A record does not meet its schema: " + errors[0])


def cell(record, path):
    value = record
    for part in path.split("."):
        if not isinstance(value, dict) or part not in value:
            return ""
        value = value[part]
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, list):
        value = ";".join(str(item) for item in value)
    text = str(value)
    return "'" + text if text[:1] in ("=", "+", "-", "@", "\t", "\r") else text


def export(records, schema_name, purpose, out, tags_row=False, tags=None):
    """Write the CSV to the open file out. Returns the columns used."""
    cols = columns(schema_name, purpose, tags)
    schema = json.loads((ROOT / "schema" / SCHEMAS[schema_name]).read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    writer = csv.writer(out, lineterminator="\n")
    writer.writerow([path for path, _ in cols])
    if tags_row:
        writer.writerow([tag["sensitivity"] for _, tag in cols])
    for record in records:
        check_record(schema_name, record, validator)
        writer.writerow([cell(record, path) for path, _ in cols])
    return cols


def write_dictionary(cols, schema_name, path):
    with open(path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(["column", "sensitivity", "purposes", "retention", "ai_use", "untrusted_text"])
        for name, tag in cols:
            writer.writerow([name, tag["sensitivity"], ";".join(tag["purposes"]), tag["retention"],
                             tag["ai_use"], "true" if tag["untrusted_text"] else "false"])


def main(argv):
    parser = argparse.ArgumentParser(description="Export tagged fields of monitoring records to CSV.")
    parser.add_argument("files", nargs="+")
    parser.add_argument("--purpose", required=True)
    parser.add_argument("--schema", default="enquiry", choices=sorted(SCHEMAS))
    parser.add_argument("--tags-row", action="store_true")
    parser.add_argument("--dictionary")
    parser.add_argument("-o", "--output")
    args = parser.parse_args(argv)
    try:
        records = [r for f in args.files for r in read_records(f)]
        out = open(args.output, "w", encoding="utf-8", newline="") if args.output else sys.stdout
        try:
            cols = export(records, args.schema, args.purpose, out, args.tags_row)
        finally:
            if args.output:
                out.close()
        if args.dictionary:
            write_dictionary(cols, args.schema, args.dictionary)
    except ExportError as error:
        print(str(error), file=sys.stderr)
        return 1
    except OSError:
        print("Could not read or write a file.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
