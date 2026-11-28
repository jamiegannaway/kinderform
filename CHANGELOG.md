# Kinderform release notes

## Unreleased · schema versions and a safer log

- **Monitoring schema version 0.2.** The four retention fields are now version 0.2, at [`/schema/enquiry/0.2.json`](https://www.kinderform.org/schema/enquiry/0.2.json). Version 0.1 is back as first published. A 0.1 record is still valid under 0.2. A record that uses a retention field must say 0.2.
- **A published schema keeps its content.** A changed schema gets a new version and a new address. The checks fail if version 0.1 changes.
- **The log tool locks the file.** Two programs can add to one log at once without breaking the chain. A new check runs 24 at once.
- **Fostering only, said plainly.** The guides now say that the monitoring record covers fostering for now.
- **Release tags.** A workflow now tags each kit release when its archive lands on main, so the source link in each kit's credits works. Releases draft.3 to draft.6 now have their tags.
- **A more technical data handling page.** `/build/data-handling` now reads like a reference page: a spec sheet, a list of sections that stays in view, file paths and field names in monospace, a picture of how the log links events, a table of the fields in one event, and the commands to try with the tool's real replies.

## Unreleased · country pages and downloads (starter candidate v0.1.0-draft.6)

- **A page for each country.** The map now leads to `/example-form/<country>`, not a pop-up. Each page shows the form and says which design system it uses. It also says who makes that system, its licence and typeface, and what we left out.
- **A neutral design.** Each form also comes in the site's own shadcn/ui look, and a switch on each page moves between the two. Answers are kept when you switch.
- **Downloads.** Each design of each form downloads as one HTML file. It works offline, sends nothing and keeps the licence notices.
- **Sweden.** Its form is in plain Swedish and uses only the neutral design, because Sweden has no open national design system that a non-government site may use. It has a starter kit in release v0.1.0-draft.6 and a place on the map.

## Unreleased · Nordic example forms (starter candidate v0.1.0-draft.5)

- **Three more example forms.** Norway, Denmark and Finland each have an example form in their own language, built with an open public-sector design system and no government branding. Norway uses Designsystemet, Denmark uses Det Fælles Designsystem and Finland uses the Suomi.fi design system. All three are MIT. Each has a starter kit in release v0.1.0-draft.5, and each is on the world map.
- **Sweden waits.** Its Swedish wording is written. Sweden has no open national design system that a non-government site may use, so its form will use the neutral design on the new country pages.
- **The map.** The European labels are spaced again so none overlap from tablet size up. The labels are now one size at every width.
- **The footer.** It says the WhatsApp community is for people who work in fostering and adoption services. The note on cookies and licences now sits on the right, level with the community note, and both speak directly: "Do not share any information about children" and "We do not use cookies or track you".
- A native speaker has not yet checked the Norwegian, Danish or Finnish wording.

## Unreleased · audit remediation (starter candidate v0.1.0-draft.4)

- Record the [26 November adversarial audit](docs/audits/2026-11-26.md), its fixes and the work that still needs independent review.
- Keep named draft scores out of every static build, including previews. Local development needs an explicit opt-in.
- Use one sensitive-question definition. Correct proven topic errors, count shared form URLs once, and record unknown branching instead of implying it was checked.
- Separate assessment requirements from Kinderform's proposed question timing. Mark draft extractions locally and bind recorded checks to the reviewed finding text.
- Strengthen phone and contact-route validation. Check monitoring event order, allow intent to remain absent until declared, and explain that pseudonymous records remain private.
- Add a first-reply worksheet, synthetic rehearsal and event-mapping guide to the starter kits. Use bounded reassurance in the reference forms.
- Home page: the first picture is now a made-up reply that says who will be in touch, when, and what happens next. The made-up form and its record moved down to "What we are making", so nobody takes the home page for a place to enquire.
- Header and footer: the header is a bar with one main button, "Get the starter kit", and quieter links for GitHub and light or dark. The footer is shorter and sits on light grey, with plain lists of links.
- **Data handling layer (v0.1 draft).** A technical foundation for storing enquiry data correctly in a service's own systems, including when staff use AI tools. Kinderform hosts nothing and holds no enquirer data. It is not legal advice and a person has not checked it. See `docs/data-handling.md`.
  - `schema/data-handling.json` tags every field with its sensitivity, purposes, retention class and AI use.
  - The enquiry schema gains four optional retention fields, with date checks in `schema/validate_enquiry.py`.
  - `schema/interaction.schema.json` and `schema/validate_interactions.py` describe and check an append-only, hash-chained event log with coded values only and no staff identifiers.
  - New tools: `tools/interaction_log.py`, `tools/webhook_sign.py`, `tools/export_csv.py` and `tools/untrusted_text.py`, with made-up logs and AI test cases.
  - `schema/profiles/uk.json`: an unverified map of two legal category names.
  - A site page, `/build/data-handling`, explains the layer to technical readers. It is linked from `/build` and the footer only.
- **Rules for crawlers and AI tools.** `robots.txt` keeps search engines, AI search and AI assistants, and turns away crawlers that collect pages to train AI models. Every page sends a `tdm-reservation` header. The terms of use gain section 10, "Automated tools, crawlers and AI". The open licences still apply to reuse. No lawyer has reviewed the wording.
- Preserve the earlier starter archives. The draft.4 candidate contains the revised rules and guide; no service pilot or independent legal review is claimed.

## v0.1.0-draft.3 · 25 November 2026

- **Four more countries.** Ireland, the Netherlands, New Zealand and Singapore each have an example form in their own public design system, without government branding, and a starter kit: the Government of Ireland Design System, NL Design System with its neutral theme, the New Zealand Government Design System and the Singapore Government Design System. The Dutch kit is in Dutch.
- **The least location a service needs.** The submission schema adds the first 3 characters of an Eircode, the 4 digits of a Dutch postcode and a New Zealand postcode. Singapore's form asks for no location, as its fostering scheme is national.
- **Registers and rules.** Places to get in touch and the published rules in all four countries, with 15 of their enquiry forms in the census. The compare tables and the comparison across countries include them.
- **Polite crawling.** The crawler and the headless reader check robots.txt for every address a redirect leads to.
- **For services.** A new page, [What services can do](https://www.kinderform.org/for-services), gives 8 ideas. Each puts what our reading of public forms shows next to published research or the law, with one thing to try. Its topic table, with a CSV download, lets a service check its own form.
- **What the law says.** `register/assessment.csv` sets out what the law in each UK nation says a fostering or adoption assessment must cover, and at which stage. It describes the law, never a licensed form.
- **What applications ask.** The census now holds application forms from all 7 countries, tagged with the same topics as enquiry forms. `/research` and `/compare/applications` compare the two steps.
- **More forms.** 78 English council fostering pages joined the register, and 8 more council enquiry forms joined the census. The site now counts 57 UK enquiry forms.
- **Simpler pages.** Every main page is shorter and plainer, to ISO 24495-1. Method detail sits behind "How we did this". On phones, each page's drawing comes first.
- **Header.** One row at every width, a Menu button on smaller screens, and a link to the code on GitHub.
- **Tools.** `tools/polite_render.mjs` reads forms built by JavaScript under the same polite crawling rules. `tools/check_sample.py` makes sample sheets so a person can check the computer's topic tags and the law map.

Every new row is a first pass, not yet checked by a person.

[All starter kits (ZIP)](https://www.kinderform.org/downloads/starter/v0.1.0-draft.3/kinderform-all-starters.zip)

## v0.1.0-draft.2 · 24 November 2026

- Services can now [take Kinderform into their own form or questionnaire builder](https://www.kinderform.org/build). One shared starter works as a starting point anywhere. Eight local wording sets cover seven countries, including Canada in English and French.
- Each kit includes copyable questions, a CSV field map, branching and validation rules, a working offline HTML example, an AI build prompt, optional Tally and Typeform guides, and fictional test records. The guide covers both an existing form and a new one.
- The site links from the example forms to their corresponding kits. [Versioned submission](https://www.kinderform.org/schema/enquiry-submission/0.1.json) and [monitoring](https://www.kinderform.org/schema/enquiry/0.1.json) schemas are available as direct downloads. The underlying enquiry standard remains at version 0.1.

[All starter kits (ZIP)](https://www.kinderform.org/downloads/starter/v0.1.0-draft.2/kinderform-all-starters.zip)

## v0.1.0-draft.1 · 24 November 2026

The first citable draft brings together the enquiry schemas, example forms, registers, checklist and research. The enquiry record uses schema version `0.1`.

- **For services.** Try a country example, see what your entry says and use the new correction form or email route. Form Check now labels regions with the country recorded in the source data.
- **For carers, adopters and people who have been in care.** The support guide gives a private route to share what helped or could have improved a first reply.
- **For people building with Kinderform.** A made-up enquiry follows the same person from submission to a two-way conversation. It distinguishes an acknowledgement, a personal contact attempt and a conversation.
- **For researchers.** The citation file names this version. The evidence library records which findings have been checked. Use the original source and date when citing a claim or an entry.
- **For census data users.** The column that maps topics to the enquiry schema is now called `kinderform_enquiry_field` in `census/taxonomy.csv`. Update scripts that read this column by name.
- **For reuse.** The repository sets out the licences for original work and lists third-party terms, including the paid illustrations.

The standard and checklist are open for comment. The registers and census include first-pass records still awaiting human review. Coverage varies by place. Each service can respond before Kinderform publishes a named score.

[Get help or suggest a correction](SUPPORT.md) · [Research and review status](https://www.kinderform.org/research) · [Roadmap](docs/roadmap.md)
