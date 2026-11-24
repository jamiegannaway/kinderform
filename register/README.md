# Front-door register

[`front-doors.csv`](front-doors.csv) lists public routes for fostering and adoption enquiries in England, Wales, Scotland and Northern Ireland. Each row describes one place to get in touch. A regional hub may serve several councils.

**Status: seed data from a first-pass desk review in November 2026. Every row is marked `unverified` until someone has checked it against the live page.** The UK register includes Scottish councils, Welsh local authorities, Northern Irish trusts, English councils and regional adoption agencies. In November 2026 we looked for the fostering page of every English council with children's services. 15 still have no row of their own. 14 of them recruit through a regional hub, which has a row, but their own sites refused our reader. The City of London appears to have no fostering recruitment page of its own (unverified). A council that recruits through a hub has its own row where it has its own page; its `notes` name the hub.

The register holds neutral facts only. It contains no scores or judgements.

The United States register is in [`us/`](us/), with its own column guide. Canada's is in [`ca/`](ca/), Australia's in [`au/`](au/), Germany's in [`de/`](de/), France's in [`fr/`](fr/) and Spain's in [`es/`](es/). The US rows are checked by `tests/validate_us_register.py`. The other five country folders are checked by `tests/validate_world_register.py`.

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

`tests/validate_policies.py` checks the UK, Canadian, Australian, German, French and Spanish rules. `tests/validate_us_register.py` checks the US rules. Every row is unverified until a person has checked it.

## What the assessment must cover: `assessment.csv`

What the law in each UK nation says a fostering or adoption assessment must cover, and at which stage. One row per requirement, in our own words, with the law or statutory guidance it comes from. Each row carries a census topic (see [`../census/taxonomy.csv`](../census/taxonomy.csv)), so the site can show which questions the law needs at which stage. The rows describe the law, never a licensed assessment form such as CoramBAAF's Form F.

| Column | Meaning |
| --- | --- |
| `assessment_id` | `uk-<nation>-<service>-<part>-<topic>-<n>`, for example `uk-eng-fostering-s3-health-1` |
| `jurisdiction` | `ENG`, `WLS`, `SCT` or `NIR` |
| `applies_to` | `fostering` or `adoption` |
| `stage` | `stage_1` or `stage_2` where the law has two stages (England, and adoption in Wales since 1 April 2020); `assessment` where it has one; `checks` for statutory checks |
| `category`, `topic` | The closest census topic; `other`, `unclassified` when none fits |
| `requirement_summary` | What the law requires, in one plain sentence |
| `legal_citation` | The instrument, schedule and paragraph, for example `SI 2011/581, Sch 3, para 2` |
| `source_type` | `legislation` or `statutory_guidance` |
| `source_url` | The legislation.gov.uk or government page it was read from |
| `date_checked` | When we read it |
| `evidence_level` | `page_read` or `search_result` |
| `verification` | `unverified` until a person has checked the row against the source |
| `notes` | Which version of the law was read, and anything unclear |

`tests/validate_assessment.py` checks it. The first pass (24 November 2026) read the revised text on legislation.gov.uk. Some instruments are online only in their original form, and the notes say so. `/for-services` shows the England stages beside what forms ask.

## Columns

| Column | Meaning |
|---|---|
| `front_door_id` | Short stable identifier, lower case with hyphens |
| `name` | Public name of the front door |
| `type` | `regional_hub`, `single_authority`, `national_brand`, `regional_service`, `regional_adoption_agency` |
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
