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

The service keeps the contact details in its own system. Sam says a conversation would help. The team records that choice when Sam tells them.

## What happened and how long Sam waited

| Time (UTC) | What happened | Time since the enquiry |
| --- | --- | --- |
| Monday 16 November 2026, 09:00 | The enquiry arrived. | Start |
| Monday 16 November, 09:01 | An automatic message confirmed receipt. | 1 minute |
| Tuesday 17 November, 09:00 | A team member emailed Sam to arrange a conversation. | 24 hours |
| Wednesday 18 November, 09:00 | Sam and the team member spoke for the first time. | 48 hours |

If the team reported only the automatic message, the wait would appear to be 1 minute. Sam waited 2 days for a conversation. These are elapsed times in a made-up example. They measure the service’s reply process.

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

## Try it with your team

1. Write down which event in your system records an automatic acknowledgement, a personal attempt and a two-way conversation.
2. Map the events to the 3 fields above using made-up times. Leave gaps where your system cannot tell you what happened.
3. To check the draft schemas, use the [made-up records](../schema/examples/). From the repository root, run the commands below with Python 3.11 or later.

```bash
python3 -m pip install -r requirements.txt
python3 tests/validate_examples.py
```

The script checks that valid examples pass and invalid ones fail. On success it prints `All examples behave as expected`. If a field is unclear, [ask a question](../SUPPORT.md) using made-up details.
