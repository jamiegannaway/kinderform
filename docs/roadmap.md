# Roadmap

## Now: foundations (v0.1)

- [x] Repository, licences and working rules
- [x] Enquiry schema v0.1 draft with synthetic examples and a validation test
- [x] Front-door register seeded (unverified)
- [x] Rubric v0.1 draft for comment
- [x] Evidence library seeded
- [x] Landing page for kinderform.org (`site/`, deployed by Vercel)
- [x] Review of intake interactions after the first enquiry, fostering and adoption (November 2026; most figures still to be checked against the originals)
- [x] Research page on the site (`/research`), built from `evidence/`, with each claim marked as checked or not yet checked
- [x] Plain language: site text rewritten to ISO 24495-1, with a house guide (`docs/plain-language.md`) and a check (`tools/plain_check.py`)
- [x] Reviews of other fields (November 2026): reminders and missed appointments, and giving blood, stem cells and kidneys (not yet checked by a person)
- [x] Research log on the site (`/research/log`, linked from the footer), built from `evidence/research-log.json`: each review and what it could mean for the project, as tables
- [x] Rewrite the two reviews of other fields in plain language (20 November 2026): no sentences of 25 words or more, and terms explained
- [ ] Work through the two reviews' "Check before public use" lists, and add their key sources to the library
- [ ] Decide each idea in the research log in the open, starting with the time limits, reciprocity and the 2-week keeping-in-touch rule
- [ ] Test the home, research and form check pages with readers from each group in the plain language guide
- [ ] Check the remaining findings and the intake interactions review against their original sources
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
- [x] US register on the site's research page (`/research#us-picture`): counts, no names, with a table view for each chart
- [ ] Second-person verification and invitation to agencies to correct their rows

## Now: four countries (first pass)

- [x] Census extended to Canada and Australia: operator types, regions and validation
- [x] Canada register: 153 front doors, from provincial agencies to Children's Aid Societies and Indigenous agencies (unverified; 40 still need a website)
- [x] Australia register: 151 front doors, state agencies, accredited agencies and Aboriginal community-controlled organisations (unverified; 58 still need a website)
- [x] UK register: Scottish councils, Foster Wales local authorities, Northern Ireland trusts, more English councils and regional adoption agencies (154 front doors in all, unverified)
- [x] Crawler follows enquiry links; `tools/crawl_to_census.py` writes its reads into the census (136 forms across the four countries, unverified)
- [x] Comparison on `/research` across four countries: questions per form, topics, kinds of answer, required questions, sensitive questions and reply times, with no names
- [ ] Review the machine-tagged topics, country by country
- [ ] Read by hand the forms the crawler cannot reach: forms that load in the browser, portals, bot checks and PDFs
- [ ] Find the missing websites in the Canada and Australia registers

## Now: Germany, France and Spain (first pass)

- [x] Front-door registers: Germany 95 (every Land), France 146 (fostering pages for 97 of 101 départements), Spain 87 (every community and both cities) (unverified)
- [x] Rules registers: Germany 129, France 79, Spain 136, with the same topics as the other countries (unverified)
- [x] The polite crawler and the question tagger read German, Spanish and Catalan; 16 enquiry forms added to the census
- [x] The compare tables and the comparison across countries include all three
- [x] Example forms: Germany in KERN UX, France in Cunningham, Spain in DESY (Aragon), without government branding, on the map
- [ ] Have native speakers review the German, French and Spanish wording
- [ ] Fill the gaps: foster payment rates for most German Länder and Spanish communities, Ceuta and Melilla, and the sites that refused automated reading
- [ ] Read Legifrance and the BOE directly; both refused the research tools

## Now: compare tables for services

- [x] Rules registers for the UK nations, Canada's provinces and territories and Australia's states and territories, with the same topics as the US (unverified)
- [x] The date each source page gives for its last update, read by the polite crawler (`register/page-dates.csv`)
- [x] `/compare`: enquiry forms, rules by topic and US application forms, each with the link and two dates, plus CSV downloads; facts only, no scores
- [x] Each enquiry form shows what it asks beyond the Kinderform enquiry standard
- [ ] Check a sample of the computer's topic tags by hand, and say how accurate they are
- [ ] Re-read the sources every few months, and flag links that stop working
- [ ] Invite services to correct their rows

## Next: listen, then measure

- [ ] Eight to ten conversations with carers, care-experienced adults, a hub manager and sector bodies
- [ ] Publish the rubric for comment and revise it
- [x] Intake-form census v0.1: fostering and adoption forms, questions, answer options and guidance (`census/`, unverified)
- [ ] Check census rows by hand in a browser, starting with the forms that would not render
- [x] Form check tab on the site: public method and patterns without names; named draft scores in private previews only
- [x] Census as evidence on the research page (`/research#how-forms-differ`): forms read from the live page, no names, each measure shown on its own so no form can be traced across them
- [x] US census first pass from the crawler: 54 enquiry forms (unverified)
- [ ] US census: forms the crawler could not read, state agencies first, then counties where counties run child welfare
- [ ] Share each service's census rows with it privately before any named analysis
- [x] Polite crawler that reads public front-door pages and extracts form fields, consent wording and response-time promises (`tools/polite_fetch.py`)
- [ ] Extend the register to the remaining English councils outside hubs (Scottish councils added November 2026)
- [ ] Baseline report on patterns and good examples
- [ ] Discuss the first-contact standard and the draft `Interaction` record proposed in the intake interactions review, then decide what goes into the schema

## Later: adopt

- [x] Reference enquiry form on the site (`/example-form`): GOV.UK Frontend for the UK and USWDS for the US, both without government branding, driven by `schema/enquiry-submission.schema.json` and per-country wording in `schema/ui/`
- [x] Example forms for Canada (GC Design System) and Australia (Australian Government Design System), without government branding, opened from a world map on one screen
- [x] Example forms work on phones: full screen, with Continue kept in reach on every question
- [x] Light by default, with a Light/Dark switch in the header (the choice stays on the reader's device)
- [x] A French version of the Canadian example form (switch between English and French in the form's dialog; answers are kept)
- [ ] A version of the reference form that works without JavaScript, for services whose platforms cannot run it
- [ ] Test the reference form with people who have enquired, and with screen reader users
- [ ] Browser-only funnel tool that reads an export in the schema format; no data leaves the service
- [ ] One pilot hub maps its export to the schema; publish the mapping guide as v0.2
- [ ] Pipeline slices beyond enquiry: application, assessment, approval, leaving
- [ ] Adaptation for a second country (US survey under way, see above)

## Not on the roadmap

A hosted form product, a CRM, any scoring of applicants, any child-level data, predictive models.
