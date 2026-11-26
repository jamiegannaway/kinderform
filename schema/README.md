# Enquiry schema (v0.1 draft)

`enquiry.schema.json` describes one fostering enquiry as it moves from first contact towards application. It is the first slice of a wider open standard for the carer pipeline; later slices will cover application, assessment, approval and leaving.

## Build a form or use the data standard

If your team wants a working form, [choose a starter](https://www.kinderform.org/build). The [any-country version](https://www.kinderform.org/build/global) uses the shared questions and leaves location open for your service to decide. Each kit includes wording, answer choices and branching rules for any form builder.

- [Submission schema, version 0.1](https://www.kinderform.org/schema/enquiry-submission/0.1.json). Use this to validate the answers a person gives to the service. The kit’s wording file adds the rules for when to ask each question.
- [Monitoring schema, version 0.1](https://www.kinderform.org/schema/enquiry/0.1.json). Use this for the service's own events after an enquiry arrives. The record excludes the person's name and contact details.

[Follow one made-up enquiry](../docs/one-enquiry.md) for an event map and a synthetic rehearsal. The kit's setup guide includes a first-reply worksheet. Keep ownership, cover and handoff history in the service's own system; those are not fields in this draft record.

## Definitions

- **Enquiry in this draft:** a record with an arrival time, a channel and a status. The service holds the person's name and contact details separately.
- **Qualified enquiry in this draft:** an enquiry where `first_contact_made_at` is set, meaning a two-way conversation has taken place. Agree how this maps to your service's reporting definitions.

## Design choices

- **Names and contact details stay out.** These records are still private. Times, location, identifiers and free text can identify a person when combined. Do not publish or send real records to Kinderform.
- **Intent is self-declared and optional.** `intent_tier` records what the person said would help. The submission form does not ask this. Omit it until declared; do not infer it from interest, topics or contact method.
- **Timestamps make response time measurable.** `received_at`, `acknowledged_at`, `first_contact_attempt_at` and `first_contact_made_at` allow time to first contact to be reported consistently.
- **Marketing consent is separate.** It is optional and never a condition of enquiring.

## Open questions

1. `closure_reason_code` is a provisional list. It needs mapping to the withdrawal categories in Ofsted's annual fostering return before v0.2.
2. Should `source` become a controlled vocabulary?
3. How should one person enquiring to several services be handled without sharing identity between them?
4. Field names for devolved nations (HSC Trusts in Northern Ireland use different codes).

## Examples

`examples/valid/` and `examples/invalid/` hold synthetic records. Run `python tests/validate_examples.py` to check them.

## Check event order and map a submission

JSON Schema checks the structure. It cannot compare event times. Use the [semantic validator](validate_enquiry.py) too:

```sh
python3 schema/validate_enquiry.py schema/examples/valid/conversation-timezones.json
```

The [local adapter](enquiry_adapter.py) creates an initial fostering record from a valid submission. It copies only allowed monitoring fields. Your service supplies a new random identifier and the actual arrival time. Intent stays absent unless the person declares it. The adapter rejects adoption and undecided interest; this monitoring slice covers fostering only.

Run `python3 tests/validate_enquiry_adapter.py` for the synthetic mapping and event trace. These checks do not make real records anonymous or suitable for sharing.
