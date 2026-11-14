# US survey plan

A survey of where people in the United States can ask about fostering or adopting, what each first-contact form asks, and what reply each front door promises. It is the project's first adaptation outside England (see "Later: adopt" in the [roadmap](roadmap.md)).

Data lives in [`register/us/`](../register/us/). Column definitions are in its [README](../register/us/README.md).

## Scope

- **In:** the 50 states, the District of Columbia and tribal nations.
- **Front doors:** every public place to enquire: the state agency, county or city agencies where they run services, private organisations contracted by a state to recruit or license families for it, and tribal child welfare programmes.
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
| 3 | `front-doors.csv`: state, regional contracted, county or city, and tribal front doors | State and regional rows first pass; county and tribal in progress |
| 4 | Open each front-door page and form; fill `form-questions.csv` and `response-promises.csv` | Not started |
| 5 | Private licensed agencies, starting from each state's licensing list | Not started |
| 6 | Neutral patterns summary (counts across front doors, no names ranked) | Not started |
| 7 | Verification by a second person, and an invitation to agencies to correct their rows | Not started |

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

### Phase 5: private agencies

Start from each state's public list of licensed child-placing agencies (`licensing_lookup_url` in `states.csv`). First take a sample per state, chosen by a written rule such as the first ten alphabetically within each region. Then widen.

## Rules that apply throughout

These come from [`CLAUDE.md`](../CLAUDE.md):

- No personal data. No staff names, phone numbers or email addresses. The test checks for phone numbers and email addresses.
- Neutral facts only. No scores for named agencies until the rubric has been consulted on and each agency has had a right of reply.
- Every row has a source link and a date checked.
- Licensed forms are not reproduced.

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

Points to check in the next pass include Maryland (its 2025–2029 plan calls it state-supervised and state-administered, with 24 local departments), Ohio's agency count (85 against 88 counties), Minnesota's (79 agencies for 87 counties) and North Dakota (19 human service zones, licensing moved to the state in 2022).

## Known limits of the first pass

- Every row is unverified, and most come from search results only.
- Search results can be out of date. Agencies change contractors, rename programmes and move pages.
- County coverage depends on what search turned up. Where a county's own page was not found, the row still lists the county as a front door, with the state directory as its source and a blank `website`.
- Tribal coverage is partial by design (see above).
