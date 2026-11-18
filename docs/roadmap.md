# Roadmap

## Now: foundations (v0.1)

- [x] Repository, licences and working rules
- [x] Enquiry schema v0.1 draft with synthetic examples and a validation test
- [x] Front-door register seeded (unverified)
- [x] Rubric v0.1 draft for comment
- [x] Evidence library seeded
- [ ] Verify every register row against the live page
- [ ] Add ONS local authority codes to the register
- [ ] Map `closure_reason_code` to Ofsted's fostering return categories

## Now: US survey (first pass)

See [us-survey-plan.md](us-survey-plan.md).

- [x] US register structure, column guide, question topics and validation test
- [x] 50 states and DC: administration model, lead agency and main pages (unverified)
- [x] State-level and contracted regional front doors (unverified, from search results)
- [x] County and city front doors in county-run states (CA, CO, MN, NV, NY, NC, ND, OH, PA, VA, WI) and Maryland's 24 local departments (unverified)
- [x] Tribal front doors, first pass: 89 rows across 26 states (unverified)
- [ ] Identify the remaining tribes with approved Title IV-E plans (about 10 of 22 still unnamed)
- [x] Open each front-door page and form; record questions and published response promises (crawler first pass)
- [ ] Review machine-tagged questions; read blocked sites and non-fillable forms by hand
- [x] Application forms: list each state's application packet (235 forms, unverified)
- [x] Application forms: record questions from fillable PDF forms (17 forms, first pass)
- [x] Policies: each state's published rules for fostering and adopting, with legal citations (663 rules, unverified)
- [x] Private licensed agencies, first sample of up to 10 per state (322 agencies, unverified)
- [ ] Private licensed agencies: complete lists from each state's licensing database
- [x] Visual research page and first neutral patterns summary (`tools/us_summary.py`, `tools/us_charts.py`)
- [ ] Second-person verification and invitation to agencies to correct their rows

## Next: listen, then measure

- [ ] Eight to ten conversations with carers, care-experienced adults, a hub manager and sector bodies
- [ ] Publish the rubric for comment and revise it
- [x] Polite crawler that reads public front-door pages and extracts form fields, consent wording and response-time promises (`tools/polite_fetch.py`)
- [ ] Extend the register to Scottish councils and English councils outside hubs
- [ ] Baseline report on patterns and good examples

## Later: adopt

- [ ] Model enquiry form (plain HTML) with a "what happens next" sequence
- [ ] Browser-only funnel tool that reads an export in the schema format; no data leaves the service
- [ ] One pilot hub maps its export to the schema; publish the mapping guide as v0.2
- [ ] Pipeline slices beyond enquiry: application, assessment, approval, leaving
- [ ] Adaptation for a second country (US survey under way, see above)

## Not on the roadmap

A hosted form product, a CRM, any scoring of applicants, any child-level data, predictive models.
