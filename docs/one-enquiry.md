# Follow one fostering enquiry

Sam Example would like to talk about fostering. A made-up council team receives Sam’s enquiry on Monday. They first speak on Wednesday. This example shows which parts of that wait a team can measure.

## What the service needs to reply

Try the [UK example form](https://www.kinderform.org/example-form/uk) with made-up details. The example runs in your browser and sends nothing.

A service using the [submission schema](../schema/enquiry-submission.schema.json) can receive a record like this. A schema sets out which fields a record can hold.

```json
{
  "full_name": "Sam Example",
  "interest": "fostering",
  "knows_child": false,
  "contact_method": "email",
  "email": "sam@example.org"
}
```

The service keeps the contact details in its own system. The form does not ask for an intent tier. Leave `intent_tier` out until Sam says what would help; do not infer it from “fostering” or the choice of email.

In this example, Sam later says a conversation would help. The team records that choice when Sam tells them. Both schemas remain v0.1 drafts.

## What happened and how long Sam waited

| Time (UTC) | What happened | Time since the enquiry |
| --- | --- | --- |
| Monday 16 November 2026, 09:00 | The enquiry arrived. | Start |
| Monday 16 November, 09:01 | An automatic message confirmed receipt. | 1 minute |
| Tuesday 17 November, 09:00 | A team member emailed Sam to arrange a conversation. | 24 hours |
| Wednesday 18 November, 09:00 | Sam and the team member spoke for the first time. | 48 hours |

If the team reported only the automatic message, the wait would appear to be 1 minute. Sam waited 2 days for a conversation. These are elapsed times in a made-up example. They measure the service’s reply process.

## Map your service's events

| Event in the service's system | Monitoring field | What it means |
| --- | --- | --- |
| Enquiry accepted into the receiving queue | `received_at` | When the service received it, not when an export ran. |
| Automatic receipt confirmation sent | `acknowledged_at` | Receipt confirmed; no personal contact claimed. |
| A person sent a reply or tried to call | `first_contact_attempt_at` | A personal attempt, whether or not Sam responded. |
| Sam and the service had a two-way conversation | `first_contact_made_at` | Contact made, not merely a delivered message or open email. |

Agree the source event for each field. Leave missing times out; do not replace them with an export time or a deadline. Check event order and time zones before measuring a wait.

Developers can use the [local fostering adapter](../schema/enquiry_adapter.py) for an initial record. The [synthetic trace](../tests/validate_enquiry_adapter.py) follows it through acknowledgement, attempt and conversation. Use the [event-order validator](../schema/validate_enquiry.py) alongside JSON Schema.

## What goes in the record used for measurement

The [enquiry schema](../schema/enquiry.schema.json) uses a separate identifier for the record. The team leaves out Sam’s name and contact details. Here is the record after the conversation.

```json
{
  "schema_version": "0.1",
  "enquiry_id": "example-001",
  "received_at": "2026-11-16T09:00:00Z",
  "channel": "web_form",
  "intent_tier": "conversation",
  "acknowledged_at": "2026-11-16T09:01:00Z",
  "first_contact_attempt_at": "2026-11-17T09:00:00Z",
  "first_contact_made_at": "2026-11-18T09:00:00Z",
  "status": "conversation_held"
}
```

If the team has only tried to reach someone, use `contact_attempted` and leave `first_contact_made_at` out. Add that time once a two-way conversation takes place. Treat the service’s real records as private, including records with names removed.

## Agree who replies

Before using a new form, agree these tasks with the receiving team. The [starter setup guide](../starter/guide_templates/guide.md#plan-the-first-reply) has a worksheet you can copy.

- One person accepts each enquiry; someone covers absence and out-of-hours arrivals.
- Failed delivery and missed deadlines are visible, with a person responsible for the next action.
- The current owner keeps a handoff until the next team accepts it, including a kinship enquiry.
- A request to stop ends follow-up. Record a return date only when the person asks to reconnect.

Keep queue, ownership and handoff history in the service's own system. They are not fields in the draft monitoring record. State a reply time the team can meet, and how someone can get help if it passes.

## Try it with your team

1. Write down which event in your system records an automatic acknowledgement, a personal attempt and a two-way conversation.
2. Map the events to the matching fields above using made-up times. Leave gaps where your system cannot tell you what happened.
3. Rehearse email, phone and text in an approved test system with a separate test destination. Do not send test messages to a live service.
4. Try failed delivery, an absent owner, a kinship handoff and an overdue reply. Check who sees each case and takes responsibility.
5. Try a request to stop and a later agreed return. Check that contact stops and the person's choices are respected.
6. To check the draft schemas, use the [made-up records](../schema/examples/). From the repository root, run the commands below with Python 3.11 or later.

```bash
python3 -m pip install -r requirements.txt
python3 tests/validate_examples.py
```

The script checks that valid examples pass and invalid ones fail. On success it prints `All examples behave as expected`. If a field is unclear, [ask a question](../SUPPORT.md) using made-up details.

## Review the reply, not just the form

Agree a local review before a pilot. For **quick**, count all arrivals and time to an attempt and conversation. Include people still waiting and overdue replies. Say whether times use elapsed or working hours and which calendar applies.

For **kind**, ask whether the person felt respected and could choose how to respond. For **considered**, check whether the right team answered their question. Record staff time, failed attempts and repeat work too.

Keep real records inside the service. Share only agreed summaries after checking that small counts cannot identify anyone. Compare like periods and note changes in campaigns, staffing and demand. This made-up example proves no pilot result, improvement or effect on approvals.
