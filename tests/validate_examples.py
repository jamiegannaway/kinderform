"""Check that the synthetic examples agree with the Enquiry schema.

Valid examples must pass and invalid examples must fail.
Run from the repository root:  python tests/validate_examples.py
Requires:  pip install jsonschema
"""

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = ROOT / "schema" / "enquiry.schema.json"
EXAMPLES = ROOT / "schema" / "examples"


def main() -> int:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())

    failures = 0
    for kind, should_pass in (("valid", True), ("invalid", False)):
        for path in sorted((EXAMPLES / kind).glob("*.json")):
            record = json.loads(path.read_text(encoding="utf-8"))
            errors = list(validator.iter_errors(record))
            passed = not errors
            ok = passed == should_pass
            print(f"{'ok  ' if ok else 'FAIL'} {kind}/{path.name}")
            if not ok:
                failures += 1
                for error in errors:
                    print(f"       {error.message}")

    if failures:
        print(f"\n{failures} example(s) did not behave as expected")
        return 1
    print("\nAll examples behave as expected")
    return 0


if __name__ == "__main__":
    sys.exit(main())
