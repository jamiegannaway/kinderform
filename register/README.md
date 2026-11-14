# Front-door register

`front-doors.csv` lists the public places where someone in the UK can enquire about fostering with a local authority: regional hubs, single-authority services and national brands. One row per front door, not per council, because most English councils now share a regional hub.

**Status: seed data from a first-pass desk review in November 2026. Every row is marked `unverified` until someone has checked it against the live page.** Scottish councils, English councils outside the hubs and independent fostering agencies are not yet included.

The register holds neutral facts only. It contains no scores or judgements.

The United States register is in [`us/`](us/), with its own column guide.

## Columns

| Column | Meaning |
|---|---|
| `front_door_id` | Short stable identifier, lower case with hyphens |
| `name` | Public name of the front door |
| `type` | `regional_hub`, `single_authority`, `national_brand`, `regional_service` |
| `nation` | England, Wales, Scotland or Northern Ireland |
| `coverage` | Authorities covered, in words |
| `website` | Home page |
| `form_url` | Direct link to the enquiry form, if there is a stable one |
| `stated_response_time` | The response promise as published near the form, in the service's own terms. Blank means none was found, not that none exists |
| `form_fields_observed` | `yes` if the form's fields were read directly, `no` if only the landing page was seen |
| `date_checked` | Year and month of the last check |
| `verification` | `unverified`, or `verified` once checked against the live page by a named contributor |
| `notes` | Anything a reader needs to know |

## Planned columns

`la_gss_codes` (ONS codes for each authority covered), `phone`, `opening_hours` and `platform`. These are left out of the seed because the first pass found conflicting values across partner pages, and the register should only publish what has been verified.

## How to correct a row

Open a pull request changing the row, set `date_checked`, and put the source link in the pull request description. Services are warmly invited to correct their own entries.
