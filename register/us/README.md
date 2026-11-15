# United States front-door register

This folder covers the 50 US states, the District of Columbia and tribal nations. It records where someone can ask about fostering or adopting and who runs that front door. Later phases add what each first-contact form asks, what reply each front door promises, what the full application asks, and each state's rules for fostering and adopting.

**Status: first pass, November 2026. Every row is `unverified`.** Rows come from a desk review. Most were found through web search results and the page itself was not opened (see `evidence_level`). Treat every row as a lead to check, not a fact.

The register holds neutral facts only. It contains no scores or judgements, no named staff, and no phone numbers or email addresses.

The method is in [`docs/us-survey-plan.md`](../../docs/us-survey-plan.md).

## Files

| File | One row per | Status |
|---|---|---|
| `states.csv` | State, DC | First pass |
| `front-doors.csv` | Public place to enquire: a state, county, city, contracted regional or tribal front door | First pass |
| `form-questions.csv` | Question on a front door's first-contact form | Header only |
| `response-promises.csv` | Published promise about when or how an enquirer will hear back | Header only |
| `application-forms.csv` | Form in a state's or agency's foster or adoption application packet | Header only |
| `application-questions.csv` | Question on an application form | Header only |
| `policies.csv` | Published rule on who can foster or adopt and what licensing involves, per state | Header only |
| `question-topics.md` | The topic codes used in `form-questions.csv` and `application-questions.csv` | Draft |
| `policy-topics.md` | The topic codes used in `policies.csv` | Draft |
| `notes/` | Search notes from each research pass | Working notes |

Private licensed agencies (non-profit and for-profit child-placing agencies) are a later phase. They will go in `front-doors.csv` with the matching `sector` value.

## Shared conventions

- `state_code` is the two-letter USPS code. DC is `DC`.
- `date_checked` is `YYYY-MM-DD`.
- `evidence_level` says how close the check got to the page:
  - `search_result`: the URL and the facts came from web search results; the page was not opened
  - `page_read`: the page was opened and read
  - `form_read`: the form itself was opened and its fields read
- `verification` is `unverified` until a named contributor has checked the row against the live page, when it becomes `verified`.
- Every row needs a `source_url`: the page that supports the row.
- A blank cell means "not found yet", not "does not exist".

## `states.csv`

| Column | Meaning |
|---|---|
| `state_code` | USPS code |
| `state_name` | Full name |
| `administration` | `state_administered`, `county_administered` or `hybrid`: who runs child welfare services day to day |
| `local_units` | For county-administered and hybrid states, the number of local public agencies that take foster or adoption enquiries. Blank for state-administered |
| `lead_agency` | Official name of the state child welfare agency |
| `lead_agency_website` | The agency's home page |
| `foster_info_url` | The state's main "become a foster parent" page |
| `adoption_info_url` | The state's main page on adopting from foster care |
| `licensing_lookup_url` | A public search or list of licensed child-placing agencies, if one exists |
| `source_url` | Page that supports the administration model and lead agency |
| `date_checked` | Date of the check |
| `evidence_level` | See above |
| `verification` | See above |
| `notes` | Anything a reader needs to know |

## `front-doors.csv`

| Column | Meaning |
|---|---|
| `front_door_id` | `us-<state>-<slug>`, lower case with hyphens, for example `us-oh-franklin-county` |
| `name` | Public name of the front door |
| `state_code` | USPS code. A tribal nation that crosses state lines uses the state of its headquarters and says so in `notes` |
| `level` | `state`, `county`, `city`, `regional` or `tribal` |
| `sector` | `public`, `tribal`, `private_nonprofit` or `private_for_profit`. For a contracted front door this is the operator's sector |
| `operator` | The organisation that runs the front door |
| `contracted` | `yes` if a private organisation runs it under contract to a public agency, otherwise `no` |
| `services` | `fostering`, `adoption` or `both` |
| `coverage` | The area served, in words |
| `website` | The front door's main page about fostering or adopting |
| `form_url` | Direct link to the enquiry or interest form, if a stable one was found |
| `first_step` | What the page asks people to do first: `web_form`, `phone_or_email`, `info_session`, `online_portal` or `not_recorded` |
| `stated_response_time` | The response promise as published, in the front door's own words. Blank means none was found |
| `form_fields_observed` | `yes` if the form's fields were read directly, otherwise `no` |
| `source_url` | Page that supports the row |
| `date_checked` | Date of the check |
| `evidence_level` | See above |
| `verification` | See above |
| `notes` | Anything a reader needs to know |

## `form-questions.csv`

One row per question on a first-contact form. Questions are paraphrased in a few plain words and tagged with a topic code from `question-topics.md`. Whole forms are not copied.

| Column | Meaning |
|---|---|
| `front_door_id` | Matches `front-doors.csv` |
| `question_order` | Position on the form, starting at 1 |
| `question_paraphrase` | A short paraphrase, 120 characters or fewer |
| `topic` | Topic code from `question-topics.md` |
| `required` | `yes`, `no` or `unknown` |
| `answer_type` | `free_text`, `single_choice`, `multi_choice`, `date`, `number`, `yes_no`, `consent` or `other` |
| `source_url` | The form's URL |
| `date_checked` | Date of the check |
| `evidence_level` | Must be `form_read` |
| `verification` | See above |

## `response-promises.csv`

One row per published promise about a reply, such as "we will call you within two working days".

| Column | Meaning |
|---|---|
| `front_door_id` | Matches `front-doors.csv` |
| `promise_quote` | The promise as published, quoted briefly, 300 characters or fewer |
| `stage` | `acknowledgement`, `first_contact`, `info_session`, `application` or `other` |
| `channel` | How the reply comes: `phone`, `email`, `letter`, `any` or `unknown` |
| `stated_hours` | The promise converted to hours, if it can be (two working days is `48`), otherwise blank |
| `source_url` | Page where the promise appears |
| `date_checked` | Date of the check |
| `evidence_level` | See above |
| `verification` | See above |

## `application-forms.csv`

One row per form. A state's application packet usually has several. Forms are described, never copied.

| Column | Meaning |
|---|---|
| `form_id` | `us-<state>-form-<slug>`, for example `us-tx-form-foster-adopt-application` |
| `state_code` | USPS code |
| `front_door_id` | The local, regional or tribal front door that issues the form, matching `front-doors.csv`. Blank for a state agency's own form |
| `issuing_body` | The organisation that publishes the form |
| `form_name` | The form's title |
| `form_number` | The form's official number, if it has one |
| `step` | `application`, `background_check`, `medical`, `references`, `financial`, `home_safety`, `home_study`, `training`, `agreement` or `other` |
| `services` | `fostering`, `adoption` or `both` |
| `format` | `pdf`, `web_form`, `online_portal`, `document` or `unknown` |
| `licensed_instrument` | `yes` if the form belongs to a licensed model such as the SAFE home study. Its questions are never recorded |
| `url` | Direct link to the blank form |
| `source_url` | Page that lists or links the form |
| `date_checked` | Date of the check |
| `evidence_level` | See above |
| `verification` | See above |
| `notes` | Anything a reader needs to know |

## `application-questions.csv`

One row per question on an application form, paraphrased and tagged with a topic code from `question-topics.md`. Blank forms only: never a completed form or any answer.

| Column | Meaning |
|---|---|
| `form_id` | Matches `application-forms.csv` |
| `question_order` | Position on the form, starting at 1 |
| `section` | The form's section heading, paraphrased, if it has sections |
| `question_paraphrase` | A short paraphrase, 120 characters or fewer |
| `topic` | Topic code from `question-topics.md` |
| `required` | `yes`, `no` or `unknown` |
| `answer_type` | As in `form-questions.csv` |
| `source_url` | The form's URL |
| `date_checked` | Date of the check |
| `evidence_level` | Must be `form_read` |
| `verification` | See above |

## `policies.csv`

One row per published rule. The register records what the rule says, not whether it is right.

| Column | Meaning |
|---|---|
| `policy_id` | `us-<state>-policy-<slug>`, for example `us-ca-policy-min-age-foster` |
| `state_code` | USPS code |
| `front_door_id` | Blank for a statewide rule. Set it only for a rule that one local or tribal agency adds on top of the state's |
| `applies_to` | `fostering`, `adoption` or `both` |
| `topic` | Topic code from `policy-topics.md` |
| `rule_summary` | The rule in plain words, 240 characters or fewer |
| `value` | The rule as a number, where it is one, for example `21` |
| `unit` | The unit for `value`: `years`, `months`, `days`, `hours`, `children`, `bedrooms`, `square_feet`, `usd_per_month`, `usd_per_day` or `other` |
| `legal_citation` | The statute or regulation, for example a section of the state administrative code, if the source gives one |
| `source_type` | `statute`, `regulation`, `policy_manual`, `agency_page` or `other` |
| `effective_date` | `YYYY-MM-DD`, if the source gives one |
| `source_url` | Page that supports the row |
| `date_checked` | Date of the check |
| `evidence_level` | See above |
| `verification` | See above |
| `notes` | Anything a reader needs to know |

## How to correct a row

Open a pull request changing the row, set `date_checked` and `evidence_level`, and put the source link in the pull request description. Agencies are warmly invited to correct their own entries.
