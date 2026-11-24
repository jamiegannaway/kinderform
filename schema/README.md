# Enquiry schema (v0.1 draft)

`enquiry.schema.json` describes one fostering enquiry as it moves from first contact towards application. It is the first slice of a wider open standard for the carer pipeline; later slices will cover application, assessment, approval and leaving.

## Build a form or use the data standard

If your team wants a working form, [choose a starter](https://www.kinderform.org/build). The [any-country version](https://www.kinderform.org/build/global) uses the shared questions and leaves location open for your service to decide. Each kit includes wording, answer choices and branching rules for any form builder.

- [Submission schema, version 0.1](https://www.kinderform.org/schema/enquiry-submission/0.1.json). Use this to validate the answers a person gives to the service. The kit’s wording file adds the rules for when to ask each question.
- [Monitoring schema, version 0.1](https://www.kinderform.org/schema/enquiry/0.1.json). Use this for the service's own events after an enquiry arrives. The record excludes the person's name and contact details.

## Definitions

- **Enquiry:** a record with an arrival time, a channel and an intent tier chosen by the enquirer. This sits alongside Ofsted's guidance that an initial enquiry must be actionable and include a name and contact details. The service holds those details in its own system; they are deliberately left out of this record.
- **Qualified enquiry:** an enquiry where `first_contact_made_at` is set, meaning a two-way conversation has taken place.

## Design choices

- **Pseudonymous by design.** No name, phone, email, address or full postcode. Only the outward postcode and the routed local authority code are kept, which is enough for routing analysis.
- **Intent is self-declared.** `intent_tier` records what the person said would help. It is never a score.
- **Timestamps make response time measurable.** `received_at`, `acknowledged_at`, `first_contact_attempt_at` and `first_contact_made_at` allow time to first contact to be reported consistently.
- **Marketing consent is separate.** It is optional and never a condition of enquiring.

## Open questions

1. `closure_reason_code` is a provisional list. It needs mapping to the withdrawal categories in Ofsted's annual fostering return before v0.2.
2. Should `source` become a controlled vocabulary?
3. How should one person enquiring to several services be handled without sharing identity between them?
4. Field names for devolved nations (HSC Trusts in Northern Ireland use different codes).

## Examples

`examples/valid/` and `examples/invalid/` hold synthetic records. Run `python tests/validate_examples.py` to check them.
