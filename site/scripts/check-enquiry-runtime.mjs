// Run after npm run validators. Exercise the real compiled browser validator,
// offline script, and demo calendar with synthetic answers only.
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import vm from "node:vm"
import validate from "../src/generated/validate-submission.js"
import { nextReplyDay } from "../src/components/reference-form/reply-day.ts"

const root = fileURLToPath(new URL("../../", import.meta.url))
const read = (path) => readFileSync(new URL(path, `file://${root}`), "utf8")
const examples = new URL("schema/examples/submission/", `file://${root}`)
let checked = 0
for (const [directory, expected] of [["valid", true], ["invalid", false]]) {
  for (const file of readdirSync(new URL(`${directory}/`, examples))) {
    if (!file.endsWith(".json")) continue
    const record = JSON.parse(readFileSync(new URL(`${directory}/${file}`, examples), "utf8"))
    assert.equal(validate(record), expected, `Compiled browser validator: ${directory}/${file}`)
    checked++
  }
}

const thursday = new Date(2026, 10, 26, 12)
const date = (day) => [day.getFullYear(), day.getMonth(), day.getDate()]
assert.deepEqual(date(nextReplyDay(thursday, { contact_method: "phone_call", best_times: ["saturday"] })), [2026, 10, 28])
assert.deepEqual(date(nextReplyDay(thursday, { contact_method: "phone_call", best_times: ["weekday_evening"] })), [2026, 10, 27])
assert.deepEqual(date(nextReplyDay(new Date(2026, 10, 28, 12), { contact_method: "phone_call", best_times: ["saturday"] })), [2026, 11, 5])
assert.deepEqual(date(nextReplyDay(new Date(2026, 10, 27, 12), { contact_method: "email" })), [2026, 10, 30])
assert.deepEqual(date(nextReplyDay(thursday, { contact_method: "phone_call", best_times: [] })), [2026, 10, 27])
assert.deepEqual(date(nextReplyDay(thursday, { contact_method: "phone_call", best_times: ["unknown"] })), [2026, 10, 27])

// The offline example is a self-contained script. Run its real event handlers
// against minimal DOM controls; the HTML relationship/CSP tests run separately.
function offline(record, variant) {
  const ui = JSON.parse(read(`schema/ui/enquiry-submission.${variant}.json`))
  const schema = JSON.parse(read("schema/enquiry-submission.schema.json"))
  const pages = ui.pages.map((page) => ({ id: page.id, when: page.showIf ?? {}, fields: page.elements.map((control) => ({
    field: control.scope.split("/").pop(), label: control.label, choices: control.options?.optionLabels ?? {},
    transform: control.options?.transform, errors: control.options?.errors ?? {},
  })) }))
  const nodes = new Map()
  const element = (id) => {
    if (!nodes.has(id)) nodes.set(id, {
      id, dataset: {}, handlers: {}, hidden: false, checked: false, value: "", textContent: "", attributes: {},
      addEventListener(event, callback) { this.handlers[event] = callback },
      click() { this.handlers.click?.() },
      focus() {}, append() {}, replaceChildren() {}, remove() {},
      setAttribute(key, value) { this.attributes[key] = value },
      removeAttribute(key) { delete this.attributes[key] },
      querySelector() { return { focus() {} } },
    })
    return nodes.get(id)
  }
  const inputs = []
  for (const page of ui.pages) {
    for (const control of page.elements) {
      const name = control.scope.split("/").pop()
      const type = schema.properties[name].type
      const grouped = control.options?.format === "radio" || type === "array"
      if (grouped) {
        for (const [index, value] of Object.keys(control.options.optionLabels).entries()) {
          inputs.push(Object.assign(element(`${name}-${index}`), { name, type: type === "array" ? "checkbox" : "radio", value }))
        }
      } else inputs.push(Object.assign(element(name), { name, type: control.options?.format === "checkbox" ? "checkbox" : "text" }))
    }
  }
  const document = {
    getElementById: element,
    createElement: () => element(`created-${nodes.size}`),
    querySelectorAll(selector) {
      const field = selector.match(/^input\[name="([^"]+)"\]$/)?.[1]
      if (field) return inputs.filter((input) => input.name === field)
      if (selector === "input") return inputs
      if (selector === ".error") return [...nodes.values()].filter((node) => node.id.startsWith("error-"))
      if (selector === "[aria-invalid]") return inputs.filter((input) => "aria-invalid" in input.attributes)
      throw new Error(`Unexpected DOM selector: ${selector}`)
    },
  }
  const config = { variant, schema, pages, labels: { ...ui.progress, change: ui.check.change } }
  const script = read("starter/offline.js").replace("/*CONFIG*/ {}", JSON.stringify(config))
  vm.runInNewContext(script, { document })
  for (const [field, value] of Object.entries(record)) {
    for (const input of inputs.filter((control) => control.name === field)) {
      if (input.type === "radio") input.checked = input.value === String(value)
      else if (input.type === "checkbox") {
        input.checked = Array.isArray(value) ? value.includes(input.value) : value === true
        input.dataset.changed = "true"
      } else input.value = value
    }
  }
  element("start").click()
  for (let step = 0; step < 20; step++) element("next").click()
  element("finish").click()
  return element("done").hidden ? null : JSON.parse(element("record").textContent)
}

const phone = { full_name: "Synthetic Example", interest: "fostering", knows_child: false,
  contact_method: "phone_call", phone: "+44 (0)7700 900 982", best_times: ["saturday"] }
for (const variant of readdirSync(new URL("schema/ui/", `file://${root}`)).map((name) => name.split(".")[1])) {
  const output = offline(phone, variant)
  assert.ok(output && validate(output), `Offline valid call: ${variant}`)
  assert.equal(offline({ ...phone, phone: "-------" }, variant), null, `Offline missing digits: ${variant}`)
  assert.equal(offline({ ...phone, full_name: "   " }, variant), null, `Offline whitespace name: ${variant}`)
  const emailOutput = offline({ ...phone, contact_method: "email", email: "synthetic@example.org" }, variant)
  assert.ok(emailOutput && validate(emailOutput), `Offline email route: ${variant}`)
  assert.ok(!("phone" in emailOutput) && !("best_times" in emailOutput), `Offline hidden contact cleanup: ${variant}`)
}
console.log(`Browser validator: ${checked} cases; offline routes in every locale; compatible illustrative reply days pass.`)
