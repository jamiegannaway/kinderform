# Use this edition in Typeform

1. Start a private test copy in your workspace. To adapt an existing form, first compare it with [the field map](field-map.csv). For a new form, choose **+ Create a new form → Start from scratch → Import questions** and paste the text of [questions.md](questions.md). You can also paste the questions into Typeform AI. [Import questions](https://help.typeform.com/hc/en-us/articles/19585703741332-Import-questions-into-Typeform-from-another-tool)
2. Review the draft against [wording.json](wording.json). Use Short Text for names, Email and Phone Number for contact, Yes/No for the kinship question and Multiple Choice for the other choices. Enable multiple selection only for topics and call times. Keep free-text Other off. Require full name, interest, the kinship question, contact choice and the chosen contact field.
3. For updates, use a separate optional **Checkbox** labelled “$updates_label”. Leave Required off. Set the names in **Settings → Block references** to match the field map. If publication is needed to edit references, use an access-controlled test copy. [Checkbox questions](https://help.typeform.com/hc/en-us/articles/36294683809940-Checkbox-question) · [Block references](https://help.typeform.com/hc/en-us/articles/360050447552-Block-references)
4. In **Workflow → Logic**, branch from “$contact_prompt”. “$email_choice” goes to email. Both “$call_choice” and “$text_choice” go to phone. After email, jump to “$rejoin_label”. After phone, show optional call times only if the person chose a call. All routes rejoin at “$rejoin_label”. [Branching logic](https://help.typeform.com/hc/en-us/articles/360029116392-What-is-branching-logic)

$location_note

$language_note

## Check the export

Preview lets you try the flow without creating a response. To test an actual export, submit a made-up entry to an access-controlled test copy. Keep follow-up emails, integrations and partial submit points off. A published submission is stored in **Results → Responses**. [Preview and response limits](https://help.typeform.com/hc/en-us/articles/8047347611540-Do-test-responses-count-towards-my-response-limit)

Export a synthetic response as CSV. Map each question heading to its Kinderform field. Yes/No questions export as `1` or `0`; convert these to JSON `true` or `false`. Multiple-selection answers can occupy separate columns. Collect only the chosen values in an array. Translate “$text_choice” to `"contact_method": "text_message"`. For updates, compare a checked and an unchecked test response. Only an explicit tick grants consent. Leave a skipped or unchecked answer out or set it to `false`. [Export responses](https://help.typeform.com/hc/en-us/articles/360029253572-Export-your-responses)

For a webhook, match entries in `form_response.answers` by `field.ref` or keep a map from Typeform’s `field.id`. Read the answer property matching its type. A single choice uses `choice.id` or `choice.label`. Multiple choices use `choices.ids` or `choices.labels`. Map those values within the question. Never rely on answer order. [Webhook example](https://www.typeform.com/developers/webhooks/example-payload/)

Export only the active contact route. Omit provider metadata and empty optional answers. Recheck IDs when you copy or edit a form. Use the [test and go-live steps](guide.md) before accepting real enquiries. This independent recipe follows Typeform’s documentation. The kit includes pasteable question text. It does not create a Typeform account or a hosted template.
