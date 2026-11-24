# Kinderform release notes

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
