# Working rules for Claude Code in this repository

## Mission

Everyone who offers to care for a child deserves a quick, kind and considered reply. This repository builds free, open tools to make that true, starting with fostering enquiries in England.

## Hard rules

1. **No real personal data.** Never write, commit or log real names, contact details or records. All examples are synthetic and must look synthetic (use `example.org` addresses and obviously fictional values).
2. **Adult-side only.** No child-level data, no child-matching logic, no predictive risk models.
3. **No applicant scoring.** Do not build anything that ranks, screens or predicts people.
4. **Systems, not staff.** Any text about a service assesses the page or process. Never name individual workers.
5. **No named public scores yet.** The register holds neutral facts only. Rubric scores for named services stay out of the repository until the method has been consulted on and each service has had a right of reply.
6. **Sources and dates.** Every factual claim about a service or a statistic carries a source link and a date checked. Mark anything unverified as unverified.
7. **Do not reproduce licensed forms** (for example CoramBAAF's Form F).
8. **Polite crawling only.** Any crawler must respect robots.txt, identify itself, rate-limit to one request every few seconds per site, read public pages only and never submit a form.

## Conventions

- Schema first: change `schema/enquiry.schema.json`, then examples, then code.
- JSON Schema draft 2020-12. Field names in `snake_case`.
- Every schema change needs a valid and an invalid example in `schema/examples/` and must pass `python tests/validate_examples.py`.
- Python 3.11+, standard library where possible. Keep dependencies few.
- British English, plain words, short sentences.
- Code is MIT; everything else is CC BY 4.0.

## Layout

- `schema/` Enquiry schema and synthetic examples
- `register/` front-door register (CSV) and its column guide
- `rubric/` audit rubric in Markdown and JSON
- `evidence/` evidence library
- `docs/` roadmap and project notes
- `tools/` scripts that build summaries from the register
- `tests/` validation scripts

## Before finishing a task

Run the tests, check that no real data slipped in, and update `docs/roadmap.md` if a milestone moved.
