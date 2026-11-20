# Front-door register

`front-doors.csv` lists the public places where someone in the UK can enquire about fostering with a local authority: regional hubs, single-authority services and national brands. One row per front door, not per council, because most English councils now share a regional hub.

**Status: seed data from a first-pass desk review in November 2026. Every row is marked `unverified` until someone has checked it against the live page.** Scottish councils, English councils outside the hubs and independent fostering agencies are not yet included.

The register holds neutral facts only. It contains no scores or judgements.

The United States register is in [`us/`](us/), with its own column guide. Canada's is in [`ca/`](ca/), Australia's in [`au/`](au/), Germany's in [`de/`](de/), France's in [`fr/`](fr/) and Spain's in [`es/`](es/). Their front-door columns are checked by `tests/validate_world_register.py`.

For Germany, France and Spain:

- `region` is a German Land, a French region or a Spanish autonomous community or city, in English (see the test for the exact names). In France each département's council has its own row, named in `coverage`.
- `operator_type` adds `local_authority` (a youth welfare office or Jugendamt, a département council, or a provincial or island council in Spain) and `voluntary_agency` (non-profit providers, such as freie Träger, associations and entidades colaboradoras).
- Text is in English, with the local term in brackets the first time it helps, for example "foster care permit (Pflegeerlaubnis)".

## Rules: `policies.csv`

The published rules on who can foster and what approval involves, so services can compare their own rules with other places. `policies.csv` here covers the four UK nations. [`ca/policies.csv`](ca/policies.csv) covers Canada's 13 provinces and territories, and [`au/policies.csv`](au/policies.csv) Australia's 8 states and territories. [`de/policies.csv`](de/policies.csv), [`fr/policies.csv`](fr/policies.csv) and [`es/policies.csv`](es/policies.csv) cover Germany, France and Spain: national law, and regional rules where they differ. The US rules are in [`us/policies.csv`](us/policies.csv). One row per rule. A row records what the rule says, where it is written and when we checked it. It never judges the rule.

| Column | Meaning |
| --- | --- |
| `policy_id` | `<country>-<place>-<topic>-<n>`, for example `uk-eng-min_age-1` or `ca-on-board_rate-1` |
| `jurisdiction` | `ENG`, `WLS`, `SCT`, `NIR`; a Canadian province or territory code; an Australian state or territory code; `DE` or a Land code (`BY`, `NW`...); `FR` or a region code (`IDF`, `BRE`...); `ES` or an autonomous community or city code (`CT`, `MD`...) |
| `applies_to` | `fostering`, `adoption` or `both` |
| `topic` | A code from [`us/policy-topics.md`](us/policy-topics.md), shared by every country |
| `rule_summary` | What the rule says, in one or two plain sentences |
| `value`, `unit` | A number and its unit where the rule has one (for example `21`, `years`; `208`, `GBP_per_week`) |
| `legal_citation` | The act, regulation or standard and section; blank for guidance |
| `source_type` | `legislation`, `statutory_guidance`, `standards`, `government_page`, `agency_page` or `sector_body` |
| `effective_date` | When the rule or rate took effect, where stated |
| `source_url` | The page the rule was read from |
| `date_checked` | When we read it |
| `evidence_level` | `page_read` or `search_result` |
| `verification` | `unverified` until a person has checked the row against the source |
| `notes` | Anything a reader needs, for example where practice differs from the rule |

`tests/validate_policies.py` checks these three files. Every row is unverified until a person has checked it.

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
