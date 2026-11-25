# Kinderform release notes

## Unreleased

Changes since v0.1.0-draft.2, not yet part of a numbered version.

- **For services.** A new page, [What services can do](https://www.kinderform.org/for-services), gives 8 ideas. Each puts what our reading of public forms shows next to published research or the law, with one thing to try. Its topic table, with a CSV download, lets a service check its own form.
- **What the law says.** `register/assessment.csv` sets out what the law in each UK nation says a fostering or adoption assessment must cover, and at which stage. It describes the law, never a licensed form.
- **What applications ask.** The census now holds application forms from all 7 countries, tagged with the same topics as enquiry forms. `/research` and `/compare/applications` compare the two steps.
- **More forms.** 78 English council fostering pages joined the register, and 8 more council enquiry forms joined the census. The site now counts 57 UK enquiry forms.
- **Simpler pages.** Every main page is shorter and plainer, to ISO 24495-1. Method detail sits behind "How we did this". On phones, each page's drawing comes first.
- **Header.** One row at every width, a Menu button on smaller screens, and a link to the code on GitHub.
- **Tools.** `tools/polite_render.mjs` reads forms built by JavaScript under the same polite crawling rules. `tools/check_sample.py` makes sample sheets so a person can check the computer's topic tags and the law map.

Every new row is a first pass, not yet checked by a person.

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
