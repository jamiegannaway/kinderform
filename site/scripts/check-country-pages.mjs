import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { parseCsv } from "../src/lib/census.ts"

const read = (file) => readFileSync(file, "utf8")
const page = (route) => read(`dist/${route}/index.html`)
const names = new Intl.DisplayNames(["en"], { type: "region" })
const name = (code) => names.of(code === "UK" ? "GB" : code)

// A region must appear under its own country. Check every row, including regions
// whose names occur in more than one country, without pinning today's row counts.
const forms = parseCsv(read("../census/forms.csv")).filter((row) => row.operator_type !== "platform_vendor")
const coverage = page("form-check").match(/<section\b[^>]*aria-labelledby="fc-coverage"[^>]*>([\s\S]*?)<\/section>/)?.[1]
assert.ok(coverage, "Form check coverage section is missing")
const found = new Set()
for (const row of coverage.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
  const cells = Array.from(row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g), (match) => match[1].trim())
  if (cells.length >= 2) found.add(`${cells[0]}|${cells[1]}`)
}
function escapeText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#x27;")
}
for (const { country, region } of forms.filter((row) => row.form_stage === "primary")) {
  assert.ok(found.has(`${name(country)}|${escapeText(region)}`), `Coverage row missing for ${country}: ${region}`)
}

// Descriptions should list just the countries represented on that page.
const rules = parseCsv(read("dist/compare/rules.csv"))
const examples = readdirSync("dist/example-form", { withFileTypes: true }).filter((entry) => entry.isDirectory())
const active = new Set([...forms, ...rules].map((row) => row.country))
for (const entry of examples) active.add(entry.name.toUpperCase())

function checkDescription(route, countries) {
  const description = page(route).match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1]
  assert.ok(description, `No description for /${route}`)
  const expected = new Set(countries)
  for (const code of active) {
    const label = code === "UK" || code === "US" ? code : name(code)
    assert.equal(description.includes(label), expected.has(code), `Wrong country list for /${route}: ${label}`)
  }
}
checkDescription("compare/forms", forms.map((row) => row.country))
checkDescription("example-form", examples.map((entry) => entry.name.toUpperCase()))
for (const topic of new Set(rules.map((row) => row.topic))) {
  checkDescription(`compare/rules/${topic}`, rules.filter((row) => row.topic === topic).map((row) => row.country))
}
console.log("Country labels and page descriptions match the published coverage.")
