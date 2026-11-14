# OUCM

**Orphan UnCrushing Machine** (working title)

> Everyone who offers to care for a child deserves a quick, kind and considered reply.

OUCM is a free, open project to improve the first step of becoming a foster carer: the moment someone raises their hand and asks. It publishes an open standard for the enquiry-to-approval pipeline, a public picture of how fostering "front doors" work today, and a living library of the evidence.

It starts in England, where almost 150,000 fostering enquiries in 2024–25 led to 7,365 newly approved carers, and where the government has said plainly that interest is not the problem. The work is designed to be adapted for other countries.

## What is in this repository

| Folder | What it holds | Status |
|---|---|---|
| [`schema/`](schema/) | The Enquiry record: a vendor-neutral JSON Schema for a fostering enquiry, with synthetic examples. Also the shorter schema for what a person fills in, and the wording for the UK and US reference forms (`schema/ui/`) | v0.1 draft |
| [`register/`](register/) | A register of UK fostering front doors: who runs each one and where it lives | Seed, unverified |
| [`rubric/`](rubric/) | A 100-point rubric for assessing a front door, published for comment before it is used | v0.1 draft |
| [`census/`](census/) | An inventory of UK fostering and adoption intake forms: every question, answer option and piece of guidance recorded so far | v0.1 draft, unverified |
| [`evidence/`](evidence/) | A living library of research and policy on carer recruitment and retention, published at [kinderform.org/research](https://www.kinderform.org/research) | Seeded |
| [`site/`](site/) | The public site for [kinderform.org](https://www.kinderform.org): Astro and shadcn/ui, built and deployed by Vercel using `vercel.json`. Includes a working example of the reference enquiry form at `/example-form` | Draft |
| [`docs/`](docs/) | Roadmap, principles and working notes | Draft |

## Principles

1. **Adult-side only.** This project deals with people enquiring about fostering. It holds no data about children and makes no decisions about children.
2. **No real personal data, ever.** Every example in this repository is synthetic.
3. **Systems, not staff.** Recruitment teams are small and stretched. Where the project compares front doors, it assesses the system and the page, not the people.
4. **Method before findings.** The rubric is published for comment before anyone is scored against it. Each service sees its own results privately, with a right of reply, before anything is named publicly.
5. **Neutral infrastructure.** The schema works alongside any form platform or CRM. It is not a product and does not replace one.
6. **No scoring of applicants.** Nothing here ranks, predicts or screens people.

## Who is behind this

OUCM was started by Jamie Gannaway, co-founder of Deployed, a company that builds intake and routing systems for large enterprises. This project is that expertise given to the fostering sector for free. It is not a Deployed product, it is not commercial, and it will not become a sales channel. Everything is openly licensed so that anyone can use it without asking.

## Licence

- Code: [MIT](LICENSE)
- Schema, register, rubric, evidence notes and documentation: [CC BY 4.0](LICENSE-CONTENT.md)

## Contributing

Foster carers, care-experienced people, recruitment teams, researchers and developers are all welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md).
