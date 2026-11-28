"""Check that the synthetic examples agree with their schemas.

- schema/enquiry.schema.json            against schema/examples/{valid,invalid}
- schema/enquiry-submission.schema.json against schema/examples/submission/{valid,invalid}
- schema/versions/enquiry-0.1.json      the monitoring schema as first published

Valid examples must pass and invalid examples must fail. A valid example marked 0.1 must also
pass the schema as first published, and one marked 0.2 must fail it.
Run from the repository root:  python tests/validate_examples.py
Requires:  pip install jsonschema
"""

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "schema"))
from validate_enquiry import problems as enquiry_problems
PAIRS = (
    (ROOT / "schema" / "enquiry.schema.json", ROOT / "schema" / "examples"),
    (ROOT / "schema" / "enquiry-submission.schema.json", ROOT / "schema" / "examples" / "submission"),
)


def main() -> int:
    failures = 0
    for schema_path, examples in PAIRS:
        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        print(f"{schema_path.name}")
        for kind, should_pass in (("valid", True), ("invalid", False)):
            for path in sorted((examples / kind).glob("*.json")):
                record = json.loads(path.read_text(encoding="utf-8"))
                # Monitoring records also need comparisons between timestamps;
                # JSON Schema alone cannot establish their chronological order.
                errors = (enquiry_problems(record) if schema_path.name == "enquiry.schema.json"
                          else list(validator.iter_errors(record)))
                passed = not errors
                ok = passed == should_pass
                print(f"  {'ok  ' if ok else 'FAIL'} {kind}/{path.name}")
                if not ok:
                    failures += 1
                    for error in errors:
                        print(f"         {getattr(error, 'message', error)}")

    # Versions: the first published schema still accepts every 0.1 record, and refuses a 0.2
    # record. So a system that only knows 0.1 is never handed fields it cannot read.
    first = json.loads((ROOT / "schema" / "versions" / "enquiry-0.1.json").read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(first)
    first_validator = Draft202012Validator(first, format_checker=FormatChecker())
    print("versions/enquiry-0.1.json")
    for path in sorted((ROOT / "schema" / "examples" / "valid").glob("*.json")):
        record = json.loads(path.read_text(encoding="utf-8"))
        version = record.get("schema_version")
        passed = not list(first_validator.iter_errors(record))
        ok = passed == (version == "0.1")
        print(f"  {'ok  ' if ok else 'FAIL'} {'accepts' if passed else 'refuses'} {version} valid/{path.name}")
        failures += not ok

    if failures:
        print(f"\n{failures} example(s) did not behave as expected")
        return 1
    print("\nAll examples behave as expected")
    return 0


if __name__ == "__main__":
    sys.exit(main())
