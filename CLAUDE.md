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
- British English, plain words, short sentences. Everything on the public site follows ISO 24495-1 plain language as set out in `docs/plain-language.md`, including its word list. After building, run `python tools/plain_check.py site/dist`.
- Code is MIT; everything else is CC BY 4.0.

## Design

- **Everything uses the [shadcn/ui](https://ui.shadcn.com) design system**: its components, the new-york style, the neutral theme tokens and its typography. Add components from the shadcn registry or its GitHub source into `site/src/components/ui/`. Do not restyle them by hand or mix in another design system.
- **One exception: the questionnaire** (the reference enquiry form) uses [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) components and patterns, as set out in Decision 0001. It carries no GOV.UK branding: no crown, no GOV.UK logotype and no GDS Transport typeface. Kinderform is not a government service and must not look like one.
- **The US version of the questionnaire** uses the [U.S. Web Design System](https://designsystem.digital.gov/) (USWDS) components, built from its Sass packages in `site/src/styles/uswds.scss`. It carries no federal branding: no "official website of the United States government" banner and no identifier, which are for .gov and .mil sites only. Do not load USWDS utility classes; their names clash with Tailwind.
- **Charts use the shadcn/ui chart look**: Card with title, description and the two-line muted footer, the theme's `--chart-*` and `--primary` tokens, 4px rounded bar ends, shadcn-style legends and Progress. On the site, build them from `site/src/components/charts.tsx` (plain HTML sized with the `w-[n%]` and `h-[n%]` classes that `globals.css` generates), not the shadcn `ChartContainer`: it relies on inline styles, which the Content-Security-Policy blocks, and on client JavaScript. The SVG charts for GitHub pages (`tools/us_charts.py`) use the same neutral tokens.
- Both questionnaire styles stay inside the form. Everything around the form (header, intro, footer) stays shadcn/ui.
- Public pages ship no tracking, set no cookies and load nothing from other sites. Fonts are self-hosted.

## Layout

- `schema/` Enquiry schema and synthetic examples; `enquiry-submission.schema.json` is what a person fills in, and `schema/ui/` holds the wording for each country's reference form
- `register/` front-door registers (CSV) and column guides: the UK in `front-doors.csv`, then `us/`, `ca/` and `au/`
- `rubric/` audit rubric in Markdown and JSON
- `census/` intake-form census: forms, questions, answer options, guidance (CSV)
- `evidence/` evidence library; `findings.json` is "What we know so far". Everything here except the README is published at `/research` on the site, so a merge updates the public page
- `docs/` roadmap and project notes
- `site/` public site for kinderform.org: Astro with shadcn/ui components rendered to static HTML (no client JavaScript, except the reference form at `/example-form`, which runs its own script from the same site; `vercel.json` allows script only on those pages); `vercel.json` builds it. `/research` is built from `evidence/`, plus the census as unnamed patterns (`site/src/lib/forms-differ.ts`) the US register as counts with no names (`site/src/lib/us-register.ts`), and the comparison of first-contact forms across the UK, the US, Canada and Australia (`site/src/lib/countries.ts`). UK-only sections use only census rows a person recorded; the comparison across countries also uses the crawler's. `/form-check` shows the method and patterns without names. `/form-check/named` (named draft scores) is built only when `VERCEL_ENV` is not `production`, so it exists only in private previews; scores are computed at build time and never committed
- `tests/` validation scripts
- `tools/` helper scripts: the census summary, the US register summary and charts, the polite crawler, and `crawl_to_census.py`, which turns crawler reads into census rows, and `plain_check.py`, which checks site text against the plain language rules

## Before finishing a task

Run the tests, check that no real data slipped in, and update `docs/roadmap.md` if a milestone moved.
