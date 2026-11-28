"""Check that schema/data-handling.json tags every field of every schema.

- Every property (nested ones too) has a tag, and no tag names a missing field.
- Every tag uses only declared classes, purposes, retention classes and ai_use values.
- No field is special_category or criminal_offence.
- untrusted_text is true exactly when a string has no enum, const, pattern or format
  (a pattern that only demands one visible character, as full_name has, does not count),
  and such a field is never ai_use "yes". Contact details are never given to AI.
- No property of the interaction schema is an unconstrained string.
Run from the repository root:  python tests/validate_data_handling.py
"""

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

SCHEMA_DIR = Path(__file__).resolve().parent.parent / "schema"
FILES = {
    "enquiry-submission": "enquiry-submission.schema.json",
    "enquiry": "enquiry.schema.json",
    "interaction": "interaction.schema.json",
}
UNUSED = {"special_category", "criminal_offence"}
failures = []


def fail(message):
    failures.append(message)
    print(f"  FAIL {message}")


def fields(properties, prefix=""):
    """Yield (dotted path, definition) for every property, nested ones too."""
    for name, definition in properties.items():
        yield prefix + name, definition
        if definition.get("type") == "object" and "properties" in definition:
            yield from fields(definition["properties"], prefix + name + ".")


def is_unconstrained_string(definition):
    kinds = definition.get("type")
    kinds = kinds if isinstance(kinds, list) else [kinds]
    if "string" not in kinds:
        return False
    if any(key in definition for key in ("enum", "const", "format")):
        return False
    # A pattern that only demands one visible character does not restrict the text.
    return definition.get("pattern") in (None, "\\S")


tags = json.loads((SCHEMA_DIR / "data-handling.json").read_text(encoding="utf-8"))
classes = set(tags["sensitivity_classes"])
purposes = set(tags["purposes"])
retention = set(tags["retention_classes"])
ai_use = set(tags["ai_use"])
if not UNUSED <= classes:
    fail("sensitivity_classes must declare special_category and criminal_offence")
if ai_use != {"no", "as_data_only", "yes"}:
    fail("ai_use must be exactly no, as_data_only and yes")
if set(tags["schemas"]) != set(FILES):
    fail("schemas must be exactly " + ", ".join(sorted(FILES)))

for name, filename in FILES.items():
    print(name)
    schema = json.loads((SCHEMA_DIR / filename).read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    actual = dict(fields(schema["properties"]))
    tagged = tags["schemas"].get(name, {})
    for path in sorted(set(actual) - set(tagged)):
        fail(f"{name}: {path} has no tag")
    for path in sorted(set(tagged) - set(actual)):
        fail(f"{name}: {path} is tagged but is not a field")
    for path, tag in tagged.items():
        where = f"{name}: {path}"
        if set(tag) != {"sensitivity", "purposes", "retention", "ai_use", "untrusted_text"}:
            fail(f"{where} must have exactly sensitivity, purposes, retention, ai_use, untrusted_text")
            continue
        if tag["sensitivity"] not in classes:
            fail(f"{where} uses an undeclared sensitivity class")
        if tag["sensitivity"] in UNUSED:
            fail(f"{where} must not be {tag['sensitivity']}")
        if not tag["purposes"] or not set(tag["purposes"]) <= purposes or len(set(tag["purposes"])) != len(tag["purposes"]):
            fail(f"{where} must list one or more declared purposes once each")
        if tag["retention"] not in retention:
            fail(f"{where} uses an undeclared retention class")
        if tag["ai_use"] not in ai_use:
            fail(f"{where} uses an undeclared ai_use value")
        if not isinstance(tag["untrusted_text"], bool):
            fail(f"{where} untrusted_text must be true or false")
            continue
        if path in actual:
            expected = is_unconstrained_string(actual[path])
            if tag["untrusted_text"] != expected:
                fail(f"{where} untrusted_text must be {str(expected).lower()} to match the schema")
        if tag["untrusted_text"] and tag["ai_use"] == "yes":
            fail(f"{where} is untrusted text and must not be ai_use yes")
        if tag["sensitivity"] in ("personal", "personal_contact") and tag["ai_use"] == "yes":
            fail(f"{where} is personal and must not be ai_use yes")
        if tag["sensitivity"] == "personal_contact" and tag["ai_use"] != "no":
            fail(f"{where} is a contact detail and must be ai_use no")
    if name == "interaction":
        for path, definition in actual.items():
            if is_unconstrained_string(definition):
                fail(f"interaction: {path} is an unconstrained string")
        if any(tag["retention"] != "event_log" for tag in tagged.values()):
            fail("interaction: every field must use the event_log retention class")

if failures:
    print(f"\n{len(failures)} problem(s) in the data handling tags")
    sys.exit(1)
print("\nData handling tags cover every field and follow the rules")
