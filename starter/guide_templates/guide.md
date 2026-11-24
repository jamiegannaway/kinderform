# Use Kinderform with your own form

Start by opening [the offline example](form.html) with made-up details. This edition is $edition. Its questions use $locale. The same steps work in your website, a form builder or an existing case system.

## If you already have a form

1. Make a private copy with messages, integrations and delivery turned off. Keep your public form working while you test.
2. Open the [questions](questions.md) and [field map](field-map.csv) beside it. For each field, mark **keep**, **change**, **add** or **move to a later conversation**. Keep a working question if its meaning and exported answer already match.
3. Remove extra questions from the enquiry form. Ask what the adult would like to know and how to reply. For kinship enquiries, route to the right team without asking about the child. Leave assessment, household history and case notes for the service’s later process.
4. Match each remaining question to the output field in the map. Keep any existing internal identifiers your system needs outside the Kinderform submission.
5. Compare the copy with the example on a phone and using just a keyboard. Ask someone from the receiving team to walk each route with made-up details.

## If you are starting from scratch

Use [questions.md](questions.md) to build the questions in order. For a hosted builder you can follow the [Tally](tally.md) or [Typeform](typeform.md) recipe. For a local prototype, open [form.html](form.html). To work with an assistant, use [ai-prompt.txt](ai-prompt.txt) with the blank files.

Offer one choice for interest and contact method. Allow more than one topic or call time. Use the listed “something else” choice as a fixed option. Do not open a free-text box. Keep the updates choice optional, separate and off by default.

## Set up contact and routing

At “$contact_prompt”, use these three routes:

| Answer | Ask only for | Export |
| --- | --- | --- |
| $email_choice | Email address, required | `contact_method=email` and `email` |
| $call_choice | Phone number, required. Offer optional call times. | `contact_method=phone_call`, `phone`, and selected `best_times` |
| $text_choice | Phone number, required | `contact_method=text_message` and `phone` |

Rejoin the routes at “$rejoin_label”. Allow people to go back before sending. If the contact choice changes, remove any earlier, unused details from the outgoing record.

If your tool cannot branch or discard hidden answers, offer three entry links to short forms, one per contact method. Include only that route’s questions. If your tool cannot support those forms, offer a service-approved phone number or contact page for a person to help. Do not require both phone and email or put placeholder contact details into a record.

## Adapt the wording locally

Ask the receiving team and a local-language reviewer to check the title, kinship terms, choices, privacy text, contact route and promised reply time. The edition selects a starting point for a country or service area. The language tag identifies the words actually supplied. A local edition can still use English.

$location_note

$language_note

For a new country, start with the smallest set of questions you need for a first reply. A change to a label or translation can keep its field and stored value. A new location format, field, answer code or meaning needs a versioned local schema, a matching field map and new examples. Record the change and test it before describing the new output as compatible.

## Test the record

Open [test-cases.json](test-cases.json) for examples. Test all three contact routes, a kinship enquiry, optional fields skipped, and updates both ticked and unticked. Switch contact method after filling a field. Confirm the outgoing record contains only the current choice. Test invalid email, phone and any location value against the rules in this edition.

Save one made-up export locally as `synthetic.json`. Translate provider question IDs and answer labels with the field map. Use real JSON booleans, arrays for selected topics/times and strings for contact details. Leave empty optional fields out. Only an explicit opt-in can produce `updates_opt_in: true`.

For a developer with Python, run these commands from the unpacked kit, preferably in a virtual environment. The first command installs the checker’s dependency. The second checks the supplied examples. The third checks your own made-up record.

```sh
python3 -m pip install -r requirements.txt
python3 check.py
python3 check.py synthetic.json
```

## Before sharing with the public

Use the name of the team that will read the enquiry and a response time it can meet. Arrange access, retention, deletion and a fallback when nobody is available. Give enquirers the service’s privacy notice and a way to contact a person. Test delivery in an approved test environment, with a separate test destination. Keep test details out of live services and public feedback. Keep the credit and licences when sharing your own version.
