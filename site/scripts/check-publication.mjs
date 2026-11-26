// Check the publishable artifact, not a hosting label or robots meta tag.
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"

assert.equal(existsSync("dist/form-check/named"), false, "Named draft scores must not be in a static build")
assert.equal(existsSync("dist/form-check/named.html"), false, "Named draft scores must not be in a static build")
const publicPage = readFileSync("dist/form-check/index.html", "utf8")
assert.doesNotMatch(publicPage, /href=["']\/form-check\/named(?:["'/])/, "Public checklist must not link to named results")
console.log("No named draft score route or link in the static build.")
