"""Validate fictional submissions using the files beside this script."""
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def problems(record, validator, wording):
    # Report rule names without including values from submitted records.
    errors = [
        f"{'.'.join(map(str, err.absolute_path)) or 'submission'}: {err.validator}"
        for err in validator.iter_errors(record)
    ]
    if not isinstance(record, dict):
        return errors
    active = set()
    for page in wording["pages"]:
        if all(record.get(key) in values for key, values in page.get("showIf", {}).items()):
            active.update(c["scope"].rsplit("/", 1)[1] for c in page["elements"])
    if set(record) - active:
        errors.append("The record contains fields outside the selected form or contact route.")
    return errors


def main(args):
    folder = Path(__file__).resolve().parent
    try:
        schema = load(folder / "submission-schema.json")
        wording = load(folder / "wording.json")
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema)
        if args:
            for filename in args:
                errors = problems(load(Path(filename)), validator, wording)
                if errors:
                    print("\n".join(errors))
                    return 1
            print("The supplied records pass.")
            return 0
        cases = load(folder / "test-cases.json")
        for case in cases:
            passed = not problems(case["record"], validator, wording)
            if passed != case["valid"]:
                print("Unexpected result for " + case["name"])
                return 1
            print(case["name"] + (" — accepted" if passed else " — rejected as expected"))
    except (OSError, UnicodeError, ValueError):
        print("Could not read a required file as JSON.", file=sys.stderr)
        return 2
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
