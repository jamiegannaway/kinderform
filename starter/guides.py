"""Build the reader guides from the same wording and schema as the example form."""

from html import escape
from pathlib import Path
from string import Template


TEMPLATES = Path(__file__).with_name("guide_templates")
GUIDES = ("START-HERE.html", "guide.md", "tally.md", "typeform.md", "ai-prompt.txt")


def guide_files(ui: dict, schema: dict, key: str) -> dict[str, str]:
    """Render self-contained guidance for one locale, including the global starter."""
    fields = {
        element["scope"].rsplit("/", 1)[-1]: element
        for page in ui["pages"]
        for element in page["elements"]
        if element.get("type") == "Control"
    }
    methods = fields["contact_method"]["options"]["optionLabels"]
    location = next(
        (element["scope"].rsplit("/", 1)[-1]
         for page in ui["pages"] if page["id"] in ("postcode", "zip")
         for element in page["elements"] if element.get("type") == "Control"),
        None,
    )
    location_note = "This edition collects no location field. Keep it out of the form and the export."
    if location:
        rule = schema["properties"][location]
        location_note = (f'Use “{fields[location]["label"]}” as an optional text question. '
                         f'Keep the answer as a string, including leading zeroes. '
                         f'Export it as `{location}` and check it against `{rule["pattern"]}`.')
    language_note = "This edition has no separate reply-language question."
    if "contact_language" in fields:
        languages = fields["contact_language"]["options"]["optionLabels"]
        choices = ", ".join(f"“{label}” → `{value}`" for value, label in languages.items())
        language_note = f"Offer the optional reply-language question. Export the chosen value under `contact_language` ({choices})."
    field_names = list(fields)
    rejoin = fields[field_names[field_names.index("best_times") + 1]]["label"]
    values = {
        "edition": "Any country" if key == "global" else key.upper(),
        "locale": ui["locale"],
        "form_title": ui["start"]["title"],
        "contact_prompt": fields["contact_method"]["label"],
        "email_choice": methods["email"],
        "call_choice": methods["phone_call"],
        "text_choice": methods["text_message"],
        "updates_label": fields["updates_opt_in"]["options"]["checkboxLabel"],
        "location_note": location_note,
        "language_note": language_note,
        "rejoin_label": rejoin,
    }
    files = {}
    for name in GUIDES:
        context = {key: escape(value) for key, value in values.items()} if name.endswith(".html") else values
        files[name] = Template((TEMPLATES / name).read_text(encoding="utf-8")).substitute(context)
    return files
