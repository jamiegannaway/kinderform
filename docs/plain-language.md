# Plain language on kinderform.org

Everything people read on kinderform.org follows the four principles of ISO 24495-1:2023, *Plain language — Part 1: Governing principles and guidelines*. This page turns them into rules for this site.

A text is in plain language when the people it is for can find what they need, understand it and use it. Short words help, but the standard asks for more: the right content, in the right order, for the right readers.

## Who reads this site

- **People in fostering and adoption services:** recruitment teams, managers and commissioners in councils, hubs and agencies. They want to know what we found, whether it applies to them, and what to do next.
- **Sector bodies, policy makers and researchers.** They want the evidence, its sources and how sure we are.
- **People thinking about fostering or adopting, and carers.** They may arrive by accident. They need to know quickly that we are not a fostering service, and where to go instead.
- **Developers and data people** who might use the schema or the reference form.

Most people read on a phone, in a short gap between other work. Many read in a second language or with a screen reader.

## Principle 1: readers get what they need

- Start each page and section with the point. Say what we found or what the page is for in the first sentence.
- Keep what helps readers act or understand. Move method detail, caveats and history lower down or into a "How we did this" part.
- Every claim about a service or a statistic keeps its source link and the date it was checked. Say plainly when something has not yet been checked by a person.

## Principle 2: readers can find what they need

- Use headings that tell readers what the section says, as a statement or a question. "Most forms do not say when you will hear back" is better than "Reply times".
- Put the most important thing first: in the page, in each section and in each list.
- Use lists for steps and for three or more parallel items.
- Long documents start with a short summary of the main points.
- Keep notes, definitions and method together, out of the way of the main text, and link to them.

## Principle 3: readers can understand what they find

**Words**

- Use everyday words. Write "use" not "utilise", "about" not "regarding", "help" not "facilitate", "start" not "commence".
- Use the same word for the same thing every time. See the word list below.
- Explain a technical term the first time it appears on a page, or replace it.
- Spell out abbreviations. Avoid them in running text where a short phrase works.
- Use numerals for numbers (7, not seven), and dates like 14 November 2026.

**Sentences**

- Aim for an average of 15 to 20 words. Keep every sentence under 25 words, except titles of sources and direct quotations.
- One main idea per sentence.
- Use the active voice and say who does what: "Councils count enquiries in different ways", not "Enquiries are counted in different ways".
- Prefer verbs to nouns made from verbs: "decide" not "make a decision".
- Avoid double negatives.

**Paragraphs**

- Keep paragraphs short: usually 1 to 4 sentences.
- Write to the reader as "you" where it fits, and about ourselves as "we".

**Tone**

- Be direct, warm and respectful. Do not talk down to readers.
- Write about pages and processes, never about individual staff.
- Never use market words about people who offer to care (the tests check for this).

**Charts and tables**

- Give every chart a title that states what it shows, and a footer that says the main finding in words.
- Offer the numbers as a table as well.

## Principle 4: readers can use the information

- Run the checks before publishing: `python tools/plain_check.py site/dist` after `npm run build` in `site/`. It flags sentences of 25 words or more and words from the "avoid" list.
- A checker cannot tell whether a page works for real people. Test key pages with readers from each group above, and fix what they struggle with.

## Word list

Use the words on the left. Explain the term the first time it appears on a page.

| Use | Meaning | Instead of |
| --- | --- | --- |
| service | A council, hub or agency that finds and approves foster carers or adopters | provider, organisation (when vague) |
| council | A local council that runs fostering or adoption itself | local authority, LA |
| hub | A group of councils that recruit foster carers together | regional hub (after first use) |
| independent agency | A charity or company that finds and supports foster carers | independent fostering agency, IFA |
| regional adoption agency | Councils working together on adoption | RAA |
| enquiry | The first time someone gets in touch to ask about fostering or adopting | lead, prospect, referral |
| enquiry form | The form someone fills in to make an enquiry | first-contact form, intake form |
| first reply | The first answer a person gets after they enquire | response, contact |
| where people get in touch | The page, form, phone line or email address someone uses to enquire | front door (if you must use it, explain it) |
| checklist | Our draft list of what a good enquiry form and first reply do | rubric, audit framework |
| not yet checked by a person | A machine or one person collected it and nobody has checked it | unverified |
| a computer program that reads public web pages | How we read forms at scale | crawler, scraper, bot |

## Before you publish

1. Build the site and run `python tools/plain_check.py site/dist`.
2. Read the page aloud. If you run out of breath, split the sentence.
3. Check that every number and source matches the original.
4. Run the tests listed in `CLAUDE.md`.
