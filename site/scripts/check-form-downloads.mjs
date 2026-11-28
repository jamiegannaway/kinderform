// Run after the build. Checks the example form pages and their single-file downloads:
// - every country page links to its downloads, and offers the design switch when the country has
//   a design system of its own;
// - every download holds its own CSS and JavaScript only, allowed by hash in a strict
//   Content-Security-Policy, and loads nothing: no web fonts, no outside files, no form target;
// - every download says it is an example that sends nothing, links back to its page and starter
//   kit, and names the licence of its styles (EUPL-1.2 where the styles are under it);
// - every download stays reasonably small.
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFileSync, statSync } from "node:fs"

import { DESIGN_SYSTEMS } from "../src/lib/design-systems.ts"
import { downloadFile, exampleForms } from "../src/lib/example-forms.ts"

const MAX_BYTES = 700 * 1024
const sha = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`
let files = 0

for (const form of exampleForms()) {
  const page = readFileSync(`dist/example-form/${form.code}/index.html`, "utf8")
  if (form.system) {
    assert.ok(page.includes(`href="/example-form/${form.code}?design=neutral"`), `${form.code}: no link to the neutral design`)
    assert.ok(page.includes(`href="/example-form/${form.code}"`), `${form.code}: no link to the country's own design`)
  } else {
    assert.ok(!page.includes("?design=neutral"), `${form.code}: a design switch, but the country has only the neutral design`)
  }
  for (const variant of form.variants) {
    for (const design of form.system ? [form.system, "neutral"] : ["neutral"]) {
      const name = downloadFile(variant.key, design)
      assert.ok(page.includes(`href="/downloads/forms/${name}"`), `${form.code}: the page does not link to ${name}`)
      const path = `dist/downloads/forms/${name}`
      const html = readFileSync(path, "utf8")
      const size = statSync(path).size
      assert.ok(size < MAX_BYTES, `${name} is ${Math.round(size / 1024)} KB`)

      const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
      const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
      assert.equal(scripts.length, 1, `${name}: one inline script`)
      assert.equal(styles.length, 1, `${name}: one inline stylesheet`)
      assert.equal(scripts[0][1].trim(), "", `${name}: the script must be inline`)
      const policy = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(html)?.[1]
      assert.ok(policy, `${name}: no Content-Security-Policy`)
      for (const rule of ["default-src 'none'", "connect-src 'none'", "form-action 'none'", "base-uri 'none'"]) {
        assert.ok(policy.includes(rule), `${name}: the policy lacks ${rule}`)
      }
      assert.ok(policy.includes(`script-src ${sha(scripts[0][2])}`), `${name}: the script hash does not match`)
      assert.ok(policy.includes(`style-src ${sha(styles[0][1])}`), `${name}: the stylesheet hash does not match`)
      const markup = html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, "")
      assert.doesNotMatch(markup, /<(link|img|iframe|object|embed|form)\b|\ssrc=|\saction=/i, `${name}: loads or sends something`)
      const css = styles[0][1].replace(/\/\*[\s\S]*?\*\//g, "")
      assert.doesNotMatch(css, /@font-face|@import/, `${name}: web fonts or imported styles`)
      for (const [, url] of css.matchAll(/url\(\s*["']?([^"')]*)/g)) {
        assert.ok(!url || url.startsWith("data:"), `${name}: the styles link to ${url}`)
      }

      assert.ok(html.includes("An example that sends nothing."), `${name}: no notice that it sends nothing`)
      assert.ok(html.includes("test it with your service"), `${name}: no advice to test it before live use`)
      assert.ok(html.includes(`https://www.kinderform.org/example-form/${form.code}`), `${name}: no link back to its page`)
      assert.ok(html.includes(`https://www.kinderform.org${variant.kit}`), `${name}: no link to its starter kit`)
      assert.ok(html.includes(`<html lang="${variant.locale}">`), `${name}: wrong language`)
      if (design !== "neutral") {
        const system = DESIGN_SYSTEMS[design]
        assert.ok(html.includes(system.licence.name), `${name}: does not name the licence of its styles`)
        if (system.licence.copyleft) {
          assert.ok(html.includes("EUPL-1.2"), `${name}: does not say its styles are under the EUPL-1.2`)
          assert.ok(html.includes(`/blob/main/${system.stylesheet}`), `${name}: does not link to the source of its styles`)
        }
      }
      files++
    }
  }
}
console.log(`${files} downloadable example forms are self-contained, strict and linked from their pages.`)
