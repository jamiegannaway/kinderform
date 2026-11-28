import assert from "node:assert/strict"
import { allowLocalNamedReview, publicationBoundary } from "../config/publication.mjs"

const optIn = { KINDERFORM_PRIVATE_NAMED_RESULTS: "true" }
assert.equal(allowLocalNamedReview("dev", {}), false)
assert.equal(allowLocalNamedReview("dev", optIn), true)
for (const command of ["build", "preview", "sync"]) {
  for (const env of [{}, optIn, { ...optIn, NODE_ENV: "development" }, { ...optIn, VERCEL_ENV: "preview" }]) {
    assert.equal(allowLocalNamedReview(command, env), false, `${command} must never publish named scores`)
  }
}
assert.equal(allowLocalNamedReview("dev", { ...optIn, VERCEL: "1" }), false)
assert.equal(allowLocalNamedReview("dev", { ...optIn, VERCEL_ENV: "production" }), false)

// Confirm the hook passes a compile-time false into a build even under a dev NODE_ENV.
const before = process.env.KINDERFORM_PRIVATE_NAMED_RESULTS
process.env.KINDERFORM_PRIVATE_NAMED_RESULTS = "true"
try {
  let config
  publicationBoundary().hooks["astro:config:setup"]({ command: "build", updateConfig: (value) => { config = value } })
  assert.equal(config.vite.define.__KINDERFORM_LOCAL_NAMED_REVIEW__, "false")
} finally {
  if (before === undefined) delete process.env.KINDERFORM_PRIVATE_NAMED_RESULTS
  else process.env.KINDERFORM_PRIVATE_NAMED_RESULTS = before
}
console.log("Named review requires the actual local dev command and explicit opt-in.")
