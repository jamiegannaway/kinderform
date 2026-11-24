# Use this edition in Tally

1. Start a private test copy in your workspace. For an existing form, first compare it with [the field map](field-map.csv). For a new form choose **+ New form → Import from** and upload [questions.md](questions.md) as Markdown. Tally creates editable questions. Add the branches yourself after import. [File import](https://tally.so/help/import)
2. Check the question order, choice labels and hints against [wording.json](wording.json). Use Short text for the names, Multiple choice for a single answer, and Checkboxes for topics and call times. Use Email and Phone number inputs for the respective contact routes. Make only full name, interest, the kinship question, contact choice and the chosen contact field required. [Input blocks](https://tally.so/help/input-blocks)
3. For updates, add one optional checkbox labelled “$updates_label”. Leave it clear. Use fixed topic choices without an open text box.
4. Place the contact fields below “$contact_prompt”. Hide email, phone and call times at first. Add conditional logic to show and require email for “$email_choice”. Show and require phone for “$call_choice” and “$text_choice”. Show optional call times only for “$call_choice”. Rejoin at “$rejoin_label”. When a person changes route, check that a hidden question stops being required. [Conditional logic](https://tally.so/help/conditional-form-logic)

$location_note

$language_note

## Check the export

Try the flow in Preview. To see a real export, use a separate access-controlled test form with made-up answers. Keep delivery and integrations off. Submitting a published form stores data in the form owner’s **Submissions** tab. Use its CSV export to check the answers. [Export and manage responses](https://tally.so/help/form-submissions) · [Access settings](https://tally.so/help/form-settings)

Map each column to the matching field. Translate single choices to one code and selected checkbox options to an array. For example, “$call_choice” becomes `"contact_method": "phone_call"`. For `knows_child`, translate the local Yes or No to a JSON boolean. Only a tick in the updates checkbox means `true`. Unticked or missing means `false` or leave the field out.

If a developer uses a webhook, map each entry in `data.fields` by its `key`. For choices, look up each selected ID from `value` in `options[].id`, then map that option to its Kinderform code. Tally can supply both a checkbox group and individual option entries. Use the group once. Keep unknown IDs for review. [Webhook example](https://tally.so/help/webhooks)

Export only the active contact route. Omit empty optional answers and provider metadata. Recheck the mapping after editing or copying a form. Use the [test and go-live steps](guide.md) before accepting real enquiries. This independent recipe follows Tally’s documentation. The kit includes a builder input file. It does not create a Tally account or a hosted template.
