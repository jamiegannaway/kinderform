# Evidence

`library.md` is the project's evidence base. It exists so that anyone working on carer recruitment can find the research in one place, and so that this project's claims stay honest.

`reports/` holds longer reviews that draw on many sources, such as the [November 2026 review of intake interactions](reports/2026-11-intake-interactions.md). Each report says how it was made and what has been checked. Its key sources are also added to `library.md` as single entries.

`digests/` holds a short monthly note on what was added and why it matters.

`findings.json` holds "What we know so far": short findings in plain words, each with its sources and whether a person has checked them against the original (the date, and whether against the full text, the abstract, the key findings or a chart). Use `null` for "not yet checked". Run `python tests/validate_findings.py` after editing it.

## The research page

Everything in this folder except this README is published at [kinderform.org/research](https://www.kinderform.org/research). The site is built from these files, so a merged change here updates the page. Links between evidence files become links between pages. Links to other files in the repository become plain text while the repository is private.

Before merging, check that nothing here names a service in a way that reports our own findings about it. Services see their own results privately first.

## Rules for entries

1. One entry per source, with authors, year, title, journal or publisher and a working link.
2. Two to four sentences in your own words. Do not paste abstracts.
3. Say what kind of study it is and how big. Small, old or self-selected samples must be labelled as such.
4. Record whether you read the full text or only the abstract.
5. Add to "Gaps we know about" when a search finds nothing. Absence is a finding.

## Monthly refresh

Once a month, search for new work on:

- foster carer recruitment, enquiry handling and conversion
- applicant withdrawal during assessment
- foster carer retention and reasons for leaving
- behavioural interventions in public-service intake and response time
- adopter recruitment, where the method transfers

Journals to watch: *Children and Youth Services Review*, *Child & Family Social Work*, *British Journal of Social Work*, *Adoption & Fostering*, *Journal of Public Child Welfare*, *European Journal of Social Work*.

Also check for new releases from the Department for Education, Ofsted, The Fostering Network, CoramBAAF, Foundations, the Australian Institute of Health and Welfare, and Spain's Ministry of Youth and Children.

Add new entries by pull request with a short note in `digests/YYYY-MM.md` saying what was added and why it matters.
