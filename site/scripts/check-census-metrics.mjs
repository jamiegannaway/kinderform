// Exercise the real analytical functions, not a second implementation of their rules.
import { build } from "esbuild"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..")
process.chdir(site)
const lib = (name) => JSON.stringify(resolve(site, "src/lib", `${name}.ts`))
const contents = `
import assert from "node:assert/strict";
import { loadCensus, formKey, uniqueForms, isCountedQuestion, hasUnknownBranching } from ${lib("census")};
import { countries } from ${lib("countries")};
import { formsDiffer } from ${lib("forms-differ")};
import { factsFor } from ${lib("form-check")};
const c = loadCensus();
const world = countries(c);
const uk = world.countries.find((x) => x.code === "UK");
const ukChart = formsDiffer(c);
const sensitive = ukChart.measures.find((x) => x.id === "sensitive");
assert.equal(ukChart.read, uk.forms, "UK presentations need the same cohort");
assert.equal(sensitive.rows.reduce((n, row) => n + row.yes, 0), uk.asksSensitive,
  "UK sensitivity must agree across presentations");
for (const country of world.countries) {
  const facts = factsFor(c, [country.code], true).filter((f) => f.form.observed === "direct_fetch");
  assert.equal(new Set(facts.map((f) => formKey(f.form))).size, country.forms,
    "each source URL contributes one statistical form per country");
  assert.equal(country.asksSensitive, facts.filter((f) => f.sensitive.length).length);
}
const childAge = c.questions.find((q) => q.question_id === "au-wa-lifestyle-solutions-enquiry:q01");
assert.equal(childAge.topic, "child_preferences", "the recorded child-age choices are not applicant age");
assert.equal(c.questions.find((q) => q.question_id === "au-qld-taihs-enquiry:q10").topic, "religion");
assert.equal(world.formLocations - world.allForms, world.duplicateFormLocations);
assert(world.branchingUnknownQuestions > 0, "the unreviewed corpus must disclose unknown branching");

// A location alias must not weight one form twice. Known follow-ups are excluded;
// unknown branching remains counted as recorded questions and is disclosed.
const form = (id, url) => ({form_id:id, country:"UK", region:"England", form_stage:"primary",
  access_route:"online_form", operator_type:"council", observed:"direct_fetch",
  form_url:url, source_url:url, date_checked:"2026-11-26", notes:""});
const question = (id, topic, status="unknown") => ({question_id:id, form_id:id.split(":")[0],
  category: topic === "health" ? "health" : "contact_identity", topic,
  input_type:"text", required:"yes", conditional_on:"", branching_status:status});
const fixture = {forms:[form("one","https://example.org/form"),form("alias","https://example.org/form/#top"),
  form("two","https://example.org/second")], questions:[
  question("one:1","age"),question("one:2","name","unconditional"),question("one:3","email"),
  question("alias:1","age"),question("alias:2","name"),question("alias:3","email"),
  question("two:1","name","unconditional"),question("two:2","email"),question("two:3","phone"),
  question("two:4","health","conditional")], options:[], guidance:[], taxonomy:[]};
fixture.guidance = ["privacy_notice_link", "response_time", "alternative_contact", "marketing_consent"].map((guidance_type)=>
  ({form_id:"two", guidance_type, present:"unknown", value:""}));
const unknownFacts = factsFor(fixture, ["UK"], true).find((f)=>f.form.form_id === "two");
assert.equal(unknownFacts.privacyNotice, "not checked", "unknown privacy detection is not a negative finding");
assert.equal(unknownFacts.replyChecked, false, "unknown reply-time detection is not checked absence");
assert.equal(unknownFacts.channels, null);
assert.equal(unknownFacts.marketing, "not checked");
const measured = countries(fixture);
assert.equal(measured.allForms, 2);
assert.equal(measured.formLocations, 3);
assert.equal(measured.asksSensitive.yes, 1, "conditional health must not become a base-path sensitive question");
assert.equal(measured.branchingUnknownForms, 2);
assert.equal(isCountedQuestion(question("two:4","health","conditional")), false);
assert.equal(isCountedQuestion(question("two:4","health","unknown")), true);
assert.equal(hasUnknownBranching(question("two:4","health","unknown")), true);
assert.equal(uniqueForms([form("one","https://example.org/form?a=1"),form("two","https://example.org/form?a=2")]).length, 2,
  "query parameters may choose different forms and must survive canonicalisation");
console.log("OK: shared census measures, unique source forms, topic corrections and explicit branching uncertainty");
console.log(JSON.stringify({forms:world.allForms, locations:world.formLocations, sensitive:world.asksSensitive,
  branchingUnknownQuestions:world.branchingUnknownQuestions,
  countries:world.countries.map((x)=>({country:x.code, forms:x.forms, sensitive:x.asksSensitive, median:x.median}))}));
`
const result = await build({stdin:{contents, loader:"ts", resolveDir:site}, bundle:true, platform:"node",
  format:"esm", write:false, alias:{"@":resolve(site,"src")}})
await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`)
