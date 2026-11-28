# Kinderform

Kinderform helps councils, fostering services and adoption agencies give a kinder first reply to people who enquire. It is a free, independent project started by Jamie Gannaway, co-founder of Deployed.

## Start here

| What would you like to do? | First step |
| --- | --- |
| Enquire about fostering or adoption | [Find an official service](https://www.kinderform.org/about#find-a-service). A real enquiry goes to the service you choose. The Kinderform examples send nothing. |
| Build or update an enquiry form in our own system | [Use Kinderform in your organisation](https://www.kinderform.org/build). Start with the shared questions for any country or use a local version. Download the questions, rules, HTML example and AI prompt for your own form builder. |
| Improve your service's first form or reply | [See what services can do](https://www.kinderform.org/for-services): ideas that put our reading of public forms next to published research. Then [try an example form for your country](https://www.kinderform.org/example-form) and [review your form with the draft checklist](https://www.kinderform.org/form-check). |
| Check or correct your service's entry | [Compare forms and published rules](https://www.kinderform.org/compare). For a correction, give the public source, what changed and when you checked. [Get in touch with or without a GitHub account](SUPPORT.md). |
| Share what the first reply felt like | What helped, or what would you change? [Send private feedback](SUPPORT.md). Please leave out names and case details. |
| Try the data standard | [Follow one made-up enquiry](docs/one-enquiry.md) from an automatic acknowledgement to a two-way conversation. Then [try the schemas and sample records](schema/). |
| Use the research or cite a version | [Read the evidence and its review status](https://www.kinderform.org/research), [see what changed](CHANGELOG.md) or [cite this work](CITATION.cff). |

The enquiry standard and checklist are drafts for comment. The comparison tables describe public pages. Check the source and date on a row before using it to make a decision.

The [26 November 2026 audit note](docs/audits/2026-11-26.md) records the adversarial review, the repairs and the independent checks still needed.

## What is in this repository

| Folder | What it holds | Status |
|---|---|---|
| [`starter/`](starter/) | Portable kits for people creating or updating a form, with a field map, offline HTML, branching rules and synthetic tests | [Download a kit](https://www.kinderform.org/build) |
| [`schema/`](schema/) | The Enquiry record: a vendor-neutral JSON Schema for a fostering enquiry, with synthetic examples. Also the shorter schema for what a person fills in, and the wording for each country's example form (`schema/ui/`) | v0.1 draft |
| [`register/`](register/) | Front doors (who people contact first) and published rules on who can foster or adopt, organised by country. [See coverage, sources and dates](https://www.kinderform.org/compare) | First pass, not yet checked by a person |
| [`census/`](census/) | An inventory of first-contact enquiry forms: every question, answer option and piece of guidance recorded so far | v0.1 draft, not yet checked by a person |
| [`rubric/`](rubric/) | A rubric for assessing a front door, published for comment before it is used | v0.1 draft |
| [`evidence/`](evidence/) | A living library of research and policy, published at [kinderform.org/research](https://www.kinderform.org/research) | Growing |
| [`site/`](site/) | The public site: Astro and shadcn/ui, built and deployed by Vercel using `vercel.json`. Includes example enquiry forms at `/example-form`, one page per country, in that country's public-sector design system or a neutral design, each also as a single-file download, and comparison tables for services at `/compare` | Live |
| [`tools/`](tools/) | Helper scripts: the polite crawler, the converters that turn its reads into register and census rows, the page-date reader and the plain-language checker | Working |
| [`tests/`](tests/) | Checks for the schema, registers, rules, census, form wording and research log | Working |
| [`docs/`](docs/) | Roadmap, principles, the plain-language guide and working notes | Draft |

## Run it yourself

You need Python 3.11 or later and Node.js 22 or later.

Install the one Python package the checks need, then run every check:

```bash
pip install -r requirements.txt
```

```bash
for t in tests/*.py; do python3 "$t" || exit 1; done
```

Build the site and check its wording against the plain-language guide:

```bash
npm ci --prefix site && npm run build --prefix site
```

```bash
python3 tools/plain_check.py site/dist
```

Run the analytical and form-runtime regressions too:

```bash
npm test --prefix site
```

[`CLAUDE.md`](CLAUDE.md) holds the working rules for this repository, including the hard rules below.

## Principles

1. **Adult-side only.** This project deals with people enquiring about fostering and adoption. It holds no data about children and makes no decisions about children.
2. **No real personal data, ever.** Every example in this repository is synthetic.
3. **Systems, not staff.** Recruitment teams are small and stretched. Where the project compares front doors, it describes the system and the page, not the people.
4. **Method before findings.** The rubric is published for comment before anyone is scored against it. Each service sees its own results privately, with a right of reply, before anything is named publicly.
5. **Neutral infrastructure.** The schema works alongside any form platform or CRM. It is not a product and does not replace one.
6. **No scoring of applicants.** Nothing here ranks, predicts or screens people.

## Who's behind Kinderform

Jamie Gannaway is a co-founder of Deployed, a document assembly and decision intelligence platform. Deployed builds intake and routing systems for large organisations. This project gives that experience to the fostering and adoption sector for free.

Kinderform is independent and non-commercial. Its code, research and original data are available to reuse under the licences below. Third-party assets have their own terms.

The project began in England. For 2024–25 the Department for Education reported almost 150,000 fostering enquiries. It also reported 7,365 newly approved foster carers. People may enquire more than once, and the figures count different things. [Renewing Fostering, page 14](https://assets.publishing.service.gov.uk/media/6982286fe833d031a3158ff1/Renewing_Fostering_-_homes_for_10_000_more_children_-_February_2026_Print_ready.pdf) (checked 24 November 2026).

For questions, corrections and private feedback, see [Get help with Kinderform](SUPPORT.md).

## Licence

This project is open source.

- Code: [MIT](LICENSE)
- Schema, registers, census, rubric, evidence notes and documentation: [CC BY 4.0](LICENSE-CONTENT.md)
- Exceptions:
  - The example form styles ported from KERN UX (`site/src/styles/kern.scss`) and DESY (`site/src/styles/desy.scss`) stay under the [EUPL-1.2](LICENSE-EUPL-1.2.txt), as their sources are.
  - The self-hosted fonts in `site/public/fonts/` keep their own licences, which sit beside them.
  - The illustrations in `site/public/illustrations/` are used under a paid licence and are **not** open. Do not reuse them (see the `LICENCE.md` there).

The site's [licences page](https://www.kinderform.org/licences) explains what you can reuse, how to give credit and what is not open. Using the site is covered by the [terms of use](https://www.kinderform.org/terms) and the [privacy policy](https://www.kinderform.org/privacy).

[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) lists the design systems, fonts, icons and map data the site uses, with their licences.

## Contributing

Foster carers, adopters, care-experienced people, recruitment teams, researchers and developers are all welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md). To report real personal data in the repository, or a security problem, see [SECURITY.md](SECURITY.md).
