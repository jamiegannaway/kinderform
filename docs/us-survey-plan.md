# US survey plan

A survey of where people in the United States can ask about fostering or adopting, what each first-contact form asks, what reply each front door promises, what the full application asks, and what the rules for becoming a foster or adoptive parent are in each state. It is the project's first adaptation outside England (see "Later: adopt" in the [roadmap](roadmap.md)).

Data lives in [`register/us/`](../register/us/). Column definitions are in its [README](../register/us/README.md).

## Scope

- **In:** the 50 states, the District of Columbia and tribal nations.
- **Front doors:** every public place to enquire: the state agency, county or city agencies where they run services, private organisations contracted by a state to recruit or license families for it, and tribal child welfare programmes.
- **Applications and policies:** the forms that make up a foster or adoption application after the first enquiry, and each state's published rules on who can foster or adopt and what licensing involves.
- **Later phase:** private licensed child-placing agencies that are not contracted front doors.
- **Out:** territories (for now), any child-level data, any scoring or ranking of named agencies.

## Why counties matter

In most states the state agency runs child welfare. In county-administered states, counties (or cities, or human service zones) run it. Each has its own front door. Those states are recorded as `county_administered` or `hybrid` in `states.csv`, and their local agencies appear in `front-doors.csv` at `level` `county` or `city`.

In some state-administered states, the state contracts private organisations by region to recruit and license families (for example Florida's Community-Based Care lead agencies). Those organisations are the front door for that region, so they are recorded at `level` `regional` with `contracted` set to `yes`.

## Tribal nations

Tribes are sovereign nations, and many run their own child welfare programmes. The first pass lists:

1. every tribe or consortium with an approved Title IV-E plan to run foster care directly, then
2. tribal programmes that publicly recruit or license foster or adoptive homes, found by searching state by state.

Each row's `notes` says which rule selected it. The list is not complete. Many tribes work with families through state or county agencies under the Indian Child Welfare Act, or recruit by word of mouth. A tribe missing from the register does not mean it has no programme.

## Phases

| Phase | What | Status |
|---|---|---|
| 1 | Structure: folders, column guide, topic codes, validation test | Done |
| 2 | `states.csv`: 50 states and DC, administration model, lead agency, main pages | First pass |
| 3 | `front-doors.csv`: state, regional contracted, county or city, and tribal front doors | First pass |
| 4 | Open each front-door page and form; fill `form-questions.csv` and `response-promises.csv` | Not started |
| 5 | Application forms: list each state's (and each local or tribal agency's own) application forms in `application-forms.csv`; record their questions in `application-questions.csv` | Structure ready |
| 6 | Policies: each state's published rules for fostering and adopting in `policies.csv`, with the legal citation | Structure ready |
| 7 | Private licensed agencies, starting from each state's licensing list | Not started |
| 8 | Neutral patterns summary (counts across front doors and states, no names ranked) | Not started |
| 9 | Verification by a second person, and an invitation to agencies to correct their rows | Not started |

## Method

### Phases 2 and 3: desk review by web search

Research ran in batches: five batches of about ten states each, one tribal batch, then batches for the county-administered states.

The first pass was done from a cloud sandbox whose network policy blocks direct page fetches. So every row comes from **web search results**: the URL appeared in the results, and the facts come from the result text. The page itself was not opened. Those rows carry `evidence_level` `search_result`. Researchers used only URLs that appeared in search results and never built or guessed a URL.

This is the same standing as the English register's seed: leads to check, not facts.

### Phase 4: forms and response promises

Phase 4 needs the pages opened. Two routes:

- **By hand**, one form at a time, recording fields with `evidence_level` `form_read`.
- **A polite crawler** (the roadmap's planned crawler). It must respect robots.txt, identify itself with a project URL, wait several seconds between requests to the same site, read public pages only and never submit a form.

Questions are paraphrased in a few words and tagged with a topic from [`question-topics.md`](../register/us/question-topics.md). Forms are never copied whole. Consent text and response promises may be quoted briefly with their source.

"SLA" here means **only what a front door publishes**: for example "a recruiter will call you within 48 hours". The survey does not measure whether agencies keep those promises. That would need their own data, and would come later and only by agreement.

### Phase 5: application forms

An application is usually a packet, not one form: an application, then forms for background checks, a medical statement, references, finances, a home safety check and a home study. Phase 5 records them in two steps.

1. **Find the forms.** For each state, list the forms in the state's licensing or adoption application packet in [`application-forms.csv`](../register/us/application-forms.csv): name, form number, issuing body, which step it belongs to, format and link. In county-run states, list the state's standard forms first, then any local agency that publishes its own. Tribal agencies that publish their own forms are listed too. This step can be done from search results.
2. **Record the questions.** Open each form and record each question in [`application-questions.csv`](../register/us/application-questions.csv), paraphrased in a few words and tagged with a topic from [`question-topics.md`](../register/us/question-topics.md). This step needs the form opened (`evidence_level` `form_read`).

Rules for this phase:

- **Describe, do not copy.** Forms are paraphrased question by question and never republished, even where a state form is in the public domain.
- **Licensed instruments stay out.** Several states use licensed home study and training models, for example the SAFE home study, PRIDE and the National Training and Development Curriculum (NTDC). Record that a state uses one, with a link to the publisher. Do not record their questions or content. This follows the rule on CoramBAAF's Form F in England.
- **Sensitive questions are expected here.** A full application properly asks about criminal history, health and finances. The rubric's first-contact rule on sensitive questions does not apply to this stage. The topic codes still mark these questions, so the summary can say what is asked and when.
- **No applicant data.** Blank forms only. Never a completed form, an example answer or anything an applicant has written.

### Phase 6: policies

[`policies.csv`](../register/us/policies.csv) holds one row per rule, per state: for example the minimum age to foster, whether renting is allowed, bedroom and space rules, training hours, background checks, the home study, licence length, and the stated time from application to licence. Topics are listed in [`policy-topics.md`](../register/us/policy-topics.md).

- **Primary source first.** Each rule should cite the statute or regulation (for example a section of the state administrative code) where one exists, then the agency page that explains it. `source_type` says which.
- **Plain paraphrase.** `rule_summary` says the rule in plain words. A machine-readable `value` and `unit` are added where the rule is a number, such as `21` `years`.
- **Fostering and adoption kept apart.** Rules often differ, so `applies_to` says which.
- **Rules, not judgements.** The register records what a state's rule is. It does not say whether a rule is good or bad, and it does not assess any person against the rules.
- **Dates matter.** Rules change. `effective_date` is recorded when the source gives one.

Policies can be found through search results, but the wording of a regulation should be checked against the code itself before a row is marked `page_read`.

### Phase 7: private agencies

Start from each state's public list of licensed child-placing agencies (`licensing_lookup_url` in `states.csv`). First take a sample per state, chosen by a written rule such as the first ten alphabetically within each region. Then widen.

## Rules that apply throughout

These come from [`CLAUDE.md`](../CLAUDE.md):

- No personal data. No staff names, phone numbers or email addresses. The test checks for phone numbers and email addresses.
- Neutral facts only. No scores for named agencies until the rubric has been consulted on and each agency has had a right of reply.
- Every row has a source link and a date checked.
- Licensed forms and licensed assessment or training models are not reproduced.

## Checks

```
python tests/validate_us_register.py
```

The test checks headers, allowed values, required cells, URL shape, dates, unique IDs, links between files, and the personal-data guards.

## Progress log

**2026-11-14, wave 1.** Five state batches and a tribal batch. Result: 51 rows in `states.csv`, 120 in `front-doors.csv` (71 state, 32 regional, 1 county, 16 tribal). The session allows 200 web searches per turn, shared by all agents, and that ran out part way through. So:

- several lead-agency home pages and most licensing lookups are blank
- many `administration` values for state-administered states rest on the Child Welfare Information Gateway factsheet without the state map being visible; the row notes say so
- the five county batches started after the budget was spent and wrote nothing; they will rerun one or two at a time
- the tribal batch finished the Title IV-E pass (10 of about 22 approved tribes identified) but not the state-by-state search; see [`register/us/notes/tribal-search-2026-11-14.md`](../register/us/notes/tribal-search-2026-11-14.md)

**2026-11-14, wave 2.** County batches rerun two at a time, each agent capped at 90 searches and told to write directory-sourced rows first. Then a second tribal pass. Result: 935 front doors in all.

| Level | Rows |
|---|---|
| state | 71 |
| regional (contracted regions, multi-county agencies, North Dakota zones, joint county-city departments) | 71 |
| county | 673 |
| city | 31 |
| tribal | 89 |

Every county-run state now has a row for each local agency the sources list: CA 58, CO 61 (64 counties), MD 24, MN 78 (the state source says 79), NV 2 plus the state rural region, NY 58, NC 100, ND 19 zones, OH 85, PA 66 (67 counties), VA 120, WI 71 plus Milwaukee. 415 of the 935 rows have the front door's own page as `website`; the rest cite a state directory or another source. Four rows carry a published response time.

Tribal rows: 10 selected from the Title IV-E list and 79 from search. About 10 approved Title IV-E tribes are still unnamed because the Children's Bureau list never showed its names in search results; opening that page by hand is the quickest fix. Notes: [`register/us/notes/tribal-search-2026-11-14-pass-2.md`](../register/us/notes/tribal-search-2026-11-14-pass-2.md).

Points raised by the county batches, recorded in row notes: several counties route foster enquiries to private partner agencies (for example Franklin OH, Allegheny PA, Westchester NY, Boulder CO, Kenosha WI); Burke County NC moved to a single contractor in 2025–26; North Dakota moved foster licensing from zones to the state in 2022; some Virginia joint departments are unclear.

Points to check in the next pass include Maryland (its 2025–2029 plan calls it state-supervised and state-administered, with 24 local departments), Ohio's agency count (85 against 88 counties), Minnesota's (79 agencies for 87 counties) and North Dakota (19 human service zones, licensing moved to the state in 2022).

## Known limits of the first pass

- Every row is unverified, and most come from search results only.
- Search results can be out of date. Agencies change contractors, rename programmes and move pages.
- County coverage depends on what search turned up. Where a county's own page was not found, the row still lists the county as a front door, with the state directory as its source and a blank `website`.
- Tribal coverage is partial by design (see above).
