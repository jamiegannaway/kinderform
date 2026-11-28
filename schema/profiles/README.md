# Profiles (v0.1 draft)

The core Kinderform schemas are law-neutral. A profile maps the core to one country's legal names.

- A country gets a profile only when a local reviewer can check it.
- The UK profile, `uk.json`, is a first draft waiting for that reviewer. It is unverified. Every entry says so, links to legislation.gov.uk and has `"checked": null` until a person has checked it.
- `lawful_basis` stays in the enquiry schema for now. It is planned to move into profiles in v0.2.
- Nothing here is legal advice.

`tests/validate_data_handling.py` checks the field tags that these names attach to.
