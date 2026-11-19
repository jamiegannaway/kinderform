# Intake-form census (v0.1, November 2026)

A list of fostering and adoption intake forms in the UK, the United States, Canada and Australia: what each form asks, what answers it offers, and what guidance sits around it. It covers **primary** forms (the first thing someone fills in) and **secondary** forms (anything after first contact and before assessment starts).

> **Status: draft for analysis. Every row is unverified.** The data describes public pages and processes. It is not a score, and nothing here should be published as a named comparison until the method has been consulted on and each service has seen its own rows privately, with a right of reply.

## Files

| File | One row per | What it holds |
|---|---|---|
| [`forms.csv`](forms.csv) | form | Who runs it, nation, fostering or adoption, stage, how you reach it, how it was seen |
| [`questions.csv`](questions.csv) | question on a form | Paraphrased label, topic, required or not, input type, conditions, hint text |
| [`answer_options.csv`](answer_options.csv) | answer option | The choices offered, and any message shown when a choice is picked |
| [`guidance.csv`](guidance.csv) | piece of guidance | Response times, what happens next, privacy, consent, eligibility and similar, at form level |
| [`taxonomy.csv`](taxonomy.csv) | topic | Plain description, sensitivity, a draft stage under the English fostering regulations, and the matching field in the [Enquiry schema](../schema/) |
| [`summary.md`](summary.md) | – | Counts generated from the files above. Names no services |
| [`reports/`](reports/) | – | The written census report that this dataset started from |

IDs link the files: `questions.form_id` → `forms.form_id`, `answer_options.question_id` → `questions.question_id`, `guidance.form_id` → `forms.form_id`, and `questions.category` + `topic` → `taxonomy.csv`. Where a form belongs to a front door in the [register](../register/front-doors.csv), `forms.front_door_id` links to it.

## Columns

### forms.csv

| Column | Meaning |
|---|---|
| `form_id` | Short ID, unique in this file |
| `front_door_id` | Register ID, if the front door is in the register |
| `operator_type` | UK: `regional_hub`, `single_authority`, `council`, `council_consortium`, `national_brand_council`, `regional_service`, `regional_adoption_agency`, `voluntary_adoption_agency`, `independent_fostering_agency`. US, Canada and Australia: `state_agency` (state, provincial or territorial government), `county_agency` (US counties and cities), `child_welfare_agency` (a mandated or delegated body that runs statutory child welfare, such as an Ontario Children's Aid Society), `indigenous_agency` (tribal, First Nations, Métis, Inuit or Aboriginal community-controlled), `private_agency` (licensed or accredited non-government agency). Any: `platform_vendor` |
| `country` | `UK`, `US`, `CA` (Canada) or `AU` (Australia) |
| `region` | A UK nation (`England`, `Wales`, `Scotland`, `Northern Ireland`), a US state or `District of Columbia`, a Canadian province or territory, or an Australian state or territory, written out in full |
| `service_type` | `fostering`, `adoption` or `fostering_and_adoption` |
| `form_stage` | `primary` (first contact) or `secondary` (after first contact, before assessment) |
| `access_route` | `online_form`, `downloadable_form`, `phone_conversation`, `sent_after_first_contact`, `email_only`, `signposting_only`, `described_not_public`, `council_portal` |
| `template_group` | Forms that share one template. Questions are recorded once, on one form in the group |
| `fields_observed` | `yes` (fields read), `partial` (some fields, or topics described), `no` (guidance only) |
| `observed` | How the form was seen; see below |
| `date_checked` | `YYYY-MM-DD` for checks made for this dataset, `YYYY-MM` for rows carried over from the research report |

### questions.csv

| Column | Meaning |
|---|---|
| `question_id` | `form_id:qNN` |
| `order`, `section` | Position on the form, and the section heading if there is one |
| `label_paraphrased` | The question in plain words. Not the exact wording; follow `forms.source_url` for that |
| `category`, `topic` | From `taxonomy.csv` |
| `required` | `yes`, `no`, `unknown` or `n/a` (a statement, not a question) |
| `input_type` | `text`, `email`, `tel`, `textarea`, `select`, `radio`, `checkbox`, `date`, `statement`, `calendar`, `unknown` |
| `type_inferred` | `yes` if the input type was worked out from the layout rather than seen in the page |
| `conditional_on` | When the question only appears after another answer, for example `q09=Website` |
| `hint_paraphrased` | Any help text shown with the question, in plain words |

### answer_options.csv

| Column | Meaning |
|---|---|
| `option_id` | `question_id:oNN` |
| `option_label` | The choice as shown. Short standard options (Yes, No, Facebook) are as written. Long sentences are shortened. Nested lists are written `Parent > Option` |
| `option_guidance` | A message the form shows when this option is picked, in plain words |

Very long lists (for example every UK council) are recorded as one summary row.

### guidance.csv

| Column | Meaning |
|---|---|
| `guidance_type` | `response_time`, `later_step_time`, `what_happens_next`, `not_an_application`, `eligibility`, `privacy_notice_link`, `data_controller`, `lawful_basis`, `data_sharing`, `retention`, `records_check`, `marketing_consent`, `declaration`, `alternative_contact`, `opening_hours`, `accessibility_statement`, `language_option`, `technical_requirement`, `information_pack`, `information_event`, `geographic_scope`, `acknowledgement`, `other` |
| `present` | `yes` found, `no` looked for and not found, `unknown` |
| `summary_paraphrased` | What the guidance says, in plain words |
| `value` | A short coded value where useful: a response time such as `1 working day`, or a marketing consent pattern such as `separate_unticked`, `pre_ticked`, `required_choice`, `required_checkbox_ambiguous`, `bundled_on_submit`, `separate_form`, `none` |

A form with no row for a guidance type was not checked for it. That is different from `present = no`.

### taxonomy.csv

`sensitivity` is one of `none`, `personal_identifier`, `household_third_party`, `eligibility_gate`, `special_category`, `criminal_offence`, `immigration`, `equality_monitoring`, `health_related`, `free_text`, `sensitive`, `staff_identifier`, `child_data`.

`england_fostering_stage_draft` is OUCM's **draft** reading of where each topic first becomes necessary under the Fostering Services (England) Regulations 2011, regulation 26 and Schedule 3, as summarised in the census report: `enquiry`, `stage_1`, `stage_2`, `not_in_schedule_3`, `service_operation` or `out_of_scope`. Check it against [legislation.gov.uk](https://legislation.gov.uk/uksi/2011/581/schedule/3) before relying on it. Adoption follows different regulations; see the report.

`oucm_enquiry_field` says which field in `schema/enquiry.schema.json` the topic maps to, or why it is kept out (`kept_out_identifier`, `kept_out_later_slice`, `kept_out_free_text`).

## How the data was gathered

- **Crawler reads (`direct_fetch`, from 17 November 2026).** `tools/polite_fetch.py` read each front door's page and, where there was no form, followed up to two links that read like an enquiry form. `tools/crawl_to_census.py` then wrote the form, its questions, choices and guidance. Labels and choices are taken from the page and shortened where long; `required` is `yes` only where the page marks it; each question's topic comes from keyword rules in English and French, and questions the rules cannot place are tagged `other`/`unclassified` for a person to tag. These rows carry a note starting "Read by the polite crawler", and re-running the tool replaces them without touching rows a person recorded. The tool skips a front door, or a site, where a person has already recorded the form. It also leaves out pages whose address names an application (for example `foster-application` or `how-to-apply`), because those hold the full application rather than a first-contact form; pages about "the application process" and "inquiry" pages are kept.
- **Direct reads (`direct_fetch`, 14 November 2026).** Public pages were fetched by an automated reader that turns the page into text and lists the form fields. Nobody has yet checked these visually in a browser. Required markers and input types are often not visible in page text. Where a type was guessed from the layout, `type_inferred` says so.
- **Index snapshots (`index_snapshot`, November 2026).** Rows from the census report, which saw some forms through a search engine's copy of the page. They may be out of date.
- **Search snippets (`search_snippet`).** A short extract shown by a search engine. Weakest evidence.
- **Secondhand (`secondhand`).** A procedures manual, privacy notice, statement of purpose or council page describing a form that is not public.
- **Vendor documentation.** One row describes a form product's default fields, from the supplier's public documentation.

No forms were submitted. No test enquiries were made. Where a site's robots.txt asked automated readers to stay out, it was not read. That applies to Aberdeen City, the Foster for East Midlands form app, adoption.wales, Scotland's Adoption, Adopt Thames Valley and the Adopt North East portal. Bot checks, forms that load in the browser and council portals stopped several more.

Labels, hints and guidance are paraphrased, to keep the dataset short and to avoid copying services' wording wholesale.

## Coverage and gaps

**United States, Canada and Australia.** Forms come from the crawler, starting from the front-door registers in [`register/us/`](../register/us/), [`register/ca/`](../register/ca/) and [`register/au/`](../register/au/). Only forms that load as ordinary web pages can be read: forms that load in the browser with JavaScript, sit behind a portal or a bot check, or are PDFs are not yet recorded. Coverage is therefore uneven, and every crawler row is unverified.

**UK.** Most UK rows were recorded by a person from 14 November 2026. On 18 November the crawler added 32 more forms from front doors new to the register: 15 in Wales (mostly Foster Wales local authorities), 4 in Scotland, 1 in Northern Ireland and 12 in England. On the site, the form check and the rubric use only the rows a person recorded. "How UK enquiry forms differ" and the comparison across four countries on `/research` use the crawler's forms as well.

This is a first pass, not a full census. See [`summary.md`](summary.md) for counts.

Not yet covered, or covered by guidance only:

- English hub forms that load in the browser: Foster for Greater Manchester, Fostering South West, LA Fostering South East, Foster for East Midlands, Foster with North East, Foster East, Foster with West London and Foster North London
- The Black Country, South East London and South West London hubs, and most English councils outside hubs
- Most of Scotland's 32 councils (the crawler read 3), and most Scottish and Northern Irish adoption services
- Most regional adoption agency enquiry forms, which load in the browser or sit in council portals
- Per-agency topics for adoption registration of interest forms. These are described only in total in the report
- Any blank secondary fostering form: none was found published

The best next step is a browser-based pass by a person on the forms that would not render, recorded straight into these files.

## Rules for this data

1. **Adult-side only.** Where a form asks about a child (for example a child-specific appeal, or details of children at home), the question is recorded so its existence can be counted. No answers are ever recorded.
2. **No personal data.** The files hold form structure only. No names of staff or enquirers, and no phone numbers or email addresses. The test checks for these.
3. **Systems, not staff.** Rows describe pages and processes.
4. **No scores, no rankings.** This is an inventory. The [rubric](../rubric/) is separate and still a draft for comment.
5. **Right of reply before publication.** Each service should see its own rows before any named analysis goes public.
6. **Plain words, and no market language.** The test checks for this too.

## How to add or correct a row

1. Edit the CSV directly. Keep IDs stable; add new questions at the end of a form's list or renumber that form only.
2. Set `observed` and `date_checked` to how and when you checked it.
3. Run `python tests/validate_census.py`, then `python tools/census_summary.py` to refresh the counts.
4. Build the site. The research page shows these files as unnamed patterns, and the "forms-differ" finding in `evidence/findings.json` quotes some of the figures. If a change alters those figures, the build stops and says what the finding should now say.
5. Open a pull request with the source link in the description. Services are warmly invited to correct their own rows.

## Starting the analysis

`summary.md` gives the first counts. To go further, load the CSV files into a spreadsheet or any data tool and join on the IDs. For example, to list every primary form that asks for a date of birth, join `questions.csv` (topic `date_of_birth`) to `forms.csv` (stage `primary`).
