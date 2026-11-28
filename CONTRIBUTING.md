# Contributing

Thank you for helping. You do not need to write code or have a GitHub account to contribute. [Choose a public or private way to get in touch](SUPPORT.md).

## Ways to help

- **Correct the registers.** If a front door or a rule is wrong or out of date, open an issue or a pull request against the file in `register/` (the UK) or `register/us/`, `ca/`, `au/`, `de/`, `fr/` or `es/`. Give the source link and the date you checked it. Services can also email corrections to [jamie.gannaway@gmail.com](mailto:jamie.gannaway@gmail.com).
- **Comment on the rubric.** Tell us what is unfair, missing or impractical in `rubric/rubric.md`. This matters most from people who run recruitment teams.
- **Add evidence.** Suggest a paper or report for `evidence/library.md`, with a link and a two-sentence summary in your own words.
- **Review the schema.** Compare the field names in your system with the [enquiry schema](schema/enquiry.schema.json). Work locally, try [made-up records](docs/one-enquiry.md), and send only fictional examples.
- **Share lived experience.** If you have enquired about fostering, foster now, or grew up in care, we would like to hear what made the first reply helpful or difficult. [Send private feedback](SUPPORT.md) and leave out names or identifying details.

## Ground rules

1. **Never commit real personal data.** No names, contact details, case notes or exports from live systems. Use synthetic data only. If you spot real data in the repository, tell us privately straight away (see [SECURITY.md](SECURITY.md)).
2. **Write about systems, not individuals.** Do not name or criticise individual staff.
3. **Cite sources.** Any factual claim about a service or a statistic needs a link and the date you checked it.
4. **Plain English.** Write so that a foster carer and a developer can both follow it.
5. **Do not copy licensed forms.** Assessment forms such as Form F are licensed. Describe evidence and structure; do not reproduce the forms.

## Pull requests

- Keep each pull request to one change.
- Run every check before you open a pull request: `pip install -r requirements.txt`, then `for t in tests/*.py; do python3 "$t" || exit 1; done`. GitHub runs the same checks on every pull request.
- If you changed the site, build it (`npm ci --prefix site && npm run build --prefix site`) and run `python3 tools/plain_check.py site/dist`. Everything on the site follows the plain-language guide in `docs/plain-language.md`.
- Schema first: change the schema, then add a valid and an invalid example in `schema/examples/`, then change the code.
- Describe what changed and why in the pull request description.

## Licence for what you contribute

When you send code, writing, data or corrections, you agree that code is licensed under the [MIT licence](LICENSE) and everything else under [CC BY 4.0](LICENSE-CONTENT.md). You confirm you have the right to give it under those licences, and that it holds no real personal data. See section 8 of the [terms of use](https://www.kinderform.org/terms).

## Conduct

Everyone taking part is expected to follow the [code of conduct](CODE_OF_CONDUCT.md).
