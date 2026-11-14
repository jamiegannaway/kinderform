# Contributing

Thank you for helping. You do not need to write code to contribute.

## Ways to help

- **Correct the register.** If a front door's details are wrong or out of date, open an issue or a pull request against `register/front-doors.csv`.
- **Comment on the rubric.** Tell us what is unfair, missing or impractical in `rubric/rubric.md`. This matters most from people who run recruitment teams.
- **Add evidence.** Suggest a paper or report for `evidence/library.md`, with a link and a two-sentence summary in your own words.
- **Review the schema.** Try mapping your own enquiry export to `schema/enquiry.schema.json` and tell us what does not fit.
- **Share lived experience.** If you have enquired about fostering, foster now, or grew up in care, your view of what a good first reply looks like is the most useful input this project can get.

## Ground rules

1. **Never commit real personal data.** No names, contact details, case notes or exports from live systems. Use synthetic data only. If you spot real data in the repository, tell a maintainer privately straight away.
2. **Write about systems, not individuals.** Do not name or criticise individual staff.
3. **Cite sources.** Any factual claim about a service or a statistic needs a link and the date you checked it.
4. **Plain English.** Write so that a foster carer and a developer can both follow it.
5. **Do not copy licensed forms.** Assessment forms such as Form F are licensed. Describe evidence and structure; do not reproduce the forms.

## Pull requests

- Keep each pull request to one change.
- Run `python tests/validate_examples.py` if you touched the schema or its examples.
- Describe what changed and why in the pull request description.

## Conduct

Everyone taking part is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).
