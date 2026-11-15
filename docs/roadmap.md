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
- [ ] Check the remaining findings and the intake interactions review against their original sources
- [ ] Verify every register row against the live page
- [ ] Add ONS local authority codes to the register
- [ ] Map `closure_reason_code` to Ofsted's fostering return categories

## Next: listen, then measure

- [ ] Eight to ten conversations with carers, care-experienced adults, a hub manager and sector bodies
- [ ] Publish the rubric for comment and revise it
- [x] Intake-form census v0.1: fostering and adoption forms, questions, answer options and guidance (`census/`, unverified)
- [ ] Check census rows by hand in a browser, starting with the forms that would not render
- [x] Form check tab on the site: public method and patterns without names; named draft scores in private previews only
- [x] Census as evidence on the research page (`/research#how-forms-differ`): forms read from the live page, no names, each measure shown on its own so no form can be traced across them
- [ ] US census pass: state agencies first, then counties where counties run child welfare
- [ ] Share each service's census rows with it privately before any named analysis
- [ ] Polite crawler that reads public front-door pages and extracts form fields, consent wording and response-time promises
- [ ] Extend the register to Scottish councils and English councils outside hubs
- [ ] Baseline report on patterns and good examples
- [ ] Discuss the first-contact standard and the draft `Interaction` record proposed in the intake interactions review, then decide what goes into the schema

## Later: adopt

- [x] Reference enquiry form on the site (`/example-form`): GOV.UK Frontend for the UK and USWDS for the US, both without government branding, driven by `schema/enquiry-submission.schema.json` and per-country wording in `schema/ui/`
- [ ] A version of the reference form that works without JavaScript, for services whose platforms cannot run it
- [ ] Test the reference form with people who have enquired, and with screen reader users
- [ ] Browser-only funnel tool that reads an export in the schema format; no data leaves the service
- [ ] One pilot hub maps its export to the schema; publish the mapping guide as v0.2
- [ ] Pipeline slices beyond enquiry: application, assessment, approval, leaving
- [ ] Adaptation for a second country

## Not on the roadmap

A hosted form product, a CRM, any scoring of applicants, any child-level data, predictive models.
