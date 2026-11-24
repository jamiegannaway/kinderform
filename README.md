# Kinderform

The open project behind [kinderform.org](https://www.kinderform.org). It started under the working title OUCM (Orphan UnCrushing Machine), which you will still see in some older documents.

> Everyone who offers to care for a child deserves a quick, kind and considered reply.

Kinderform is a free, open project to improve the first step of fostering and adoption: the moment someone raises their hand and asks. It publishes:

- an open standard for the enquiry record, and example enquiry forms built to it
- a public picture of how fostering and adoption "front doors" work today: who people contact, what the first form asks and what the published rules say
- a living library of the evidence

It started in England, where almost 150,000 fostering enquiries in 2024–25 led to 7,365 newly approved carers, and where the government has said plainly that interest is not the problem. It now covers seven countries: the UK, the US, Canada, Australia, Germany, France and Spain.

## What is in this repository

| Folder | What it holds | Status |
|---|---|---|
| [`schema/`](schema/) | The Enquiry record: a vendor-neutral JSON Schema for a fostering enquiry, with synthetic examples. Also the shorter schema for what a person fills in, and the wording for each country's example form (`schema/ui/`) | v0.1 draft |
| [`register/`](register/) | Front doors (who people contact first) and published rules on who can foster or adopt, for the UK and in `us/`, `ca/`, `au/`, `de/`, `fr/` and `es/`. Each row has a source link and the date checked | First pass, not yet checked by a person |
| [`census/`](census/) | An inventory of first-contact enquiry forms: every question, answer option and piece of guidance recorded so far | v0.1 draft, not yet checked by a person |
| [`rubric/`](rubric/) | A rubric for assessing a front door, published for comment before it is used | v0.1 draft |
| [`evidence/`](evidence/) | A living library of research and policy, published at [kinderform.org/research](https://www.kinderform.org/research) | Growing |
| [`site/`](site/) | The public site: Astro and shadcn/ui, built and deployed by Vercel using `vercel.json`. Includes example enquiry forms in each country's public-sector design system at `/example-form`, and comparison tables for services at `/compare` | Live |
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

Kinderform is not a Deployed product and is not commercial. It will never be a sales channel. Everything is openly licensed so that anyone can use it without asking.

To get in touch, email [jamie.gannaway@gmail.com](mailto:jamie.gannaway@gmail.com).

## Licence

This project is open source.

- Code: [MIT](LICENSE)
- Schema, registers, census, rubric, evidence notes and documentation: [CC BY 4.0](LICENSE-CONTENT.md)
- Exceptions:
  - The example form styles ported from KERN UX (`site/src/styles/kern.scss`) and DESY (`site/src/styles/desy.scss`) stay under the [EUPL-1.2](LICENSE-EUPL-1.2.txt), as their sources are.
  - The self-hosted fonts in `site/public/fonts/` keep their own licences, which sit beside them.
  - The illustrations in `site/public/illustrations/` are used under a paid licence and are **not** open. Do not reuse them (see the `LICENCE.md` there).

[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) lists the design systems, fonts, icons and map data the site uses, with their licences.

## Contributing

Foster carers, adopters, care-experienced people, recruitment teams, researchers and developers are all welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md). To report real personal data in the repository, or a security problem, see [SECURITY.md](SECURITY.md).
