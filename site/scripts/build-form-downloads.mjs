// Builds the downloadable example forms: for each country (and each language of its form), one
// single HTML file in the country's design system and one in the neutral design. Each file holds
// its own CSS and JavaScript, with a Content-Security-Policy that allows only those (by hash), so
// it works offline and loads nothing from anywhere. It uses the reader's system fonts.
//
// Run after `npm run validators` (the form's checks come from src/generated/) and before
// `astro build`, which copies public/ into the site. The files go to public/downloads/forms/
// (not committed) and are served from /downloads/forms/.
//
// How: esbuild bundles the same React engine, renderer, wording and stylesheet that the country
// page loads (load-<country>.ts, or load-neutral.ts with the country's wording). Sass compiles the
// ported stylesheet, without its @font-face rules. For the neutral design, Tailwind builds only the
// classes that the bundled files use, from the site's own theme (src/styles/globals.css).
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

import * as esbuild from "esbuild"
import * as sass from "sass"
import { compile, optimize } from "@tailwindcss/node"
import { Scanner } from "@tailwindcss/oxide"

import { DESIGN_SYSTEMS, NEUTRAL, REPO, SITE } from "../src/lib/design-systems.ts"
import { DOWNLOAD_DIR, downloadFile, exampleForms } from "../src/lib/example-forms.ts"

const SITE_DIR = process.cwd()
const SRC = resolve(SITE_DIR, "src")
const FORM_DIR = resolve(SRC, "components/reference-form")
const UI_DIR = resolve(SITE_DIR, "../schema/ui")

// ---- esbuild plugins ---------------------------------------------------------------------

// JSON Forms builds an Ajv validator when the form starts, but the form never asks it to check
// anything (validationMode "NoValidation", and the wording has no rules): the engine checks answers
// with the validator compiled at build time. A stand-in keeps about 130 KB of Ajv out of the file.
const ajvStub = {
  name: "ajv-stub",
  setup(build) {
    build.onResolve({ filter: /^ajv(-formats)?$/ }, (args) => ({ path: args.path, namespace: "ajv-stub" }))
    build.onLoad({ filter: /.*/, namespace: "ajv-stub" }, (args) => ({
      contents:
        args.path === "ajv"
          ? "export default class Ajv { compile() { return () => true } validate() { return true } addFormat() { return this } addKeyword() { return this } addSchema() { return this } }"
          : "export default function addFormats(ajv) { return ajv }",
      loader: "js",
    }))
  },
}

// The ported stylesheets, compiled as on the site but without web fonts: the file falls back to
// each design's own system font stack. Icons the stylesheet links to (USWDS) go into the file as
// data URLs, as the site's build does with small files. Any other outside link is an error.
const MIME = { svg: "image/svg+xml", png: "image/png", gif: "image/gif" }
function compileScss(file) {
  const { css } = sass.compile(file, {
    style: "compressed",
    loadPaths: [resolve(SITE_DIR, "node_modules/@uswds/uswds/packages")],
    quietDeps: true,
    logger: sass.Logger.silent,
  })
  return css.replace(/@font-face\s*\{[^}]*\}/g, "").replace(/url\(\s*(["']?)([^"')]*)\1\s*\)/g, (whole, _q, url) => {
    if (!url || url.startsWith("data:")) return whole
    const path = resolve(dirname(file), url)
    const type = MIME[path.split(".").pop()]
    if (!type || !existsSync(path)) throw new Error(`${relative(SITE_DIR, file)} links to a file outside the page: ${url}`)
    return `url("data:${type};base64,${readFileSync(path).toString("base64")}")`
  })
}
const scss = {
  name: "scss",
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, (args) => ({ contents: compileScss(args.path), loader: "css" }))
  },
}

// ---- Tailwind for the neutral design -------------------------------------------------------

// The site's theme (tokens, dark variant, base styles), without its web font, its animations or
// the classes generated for charts and the research pages, which the form does not use.
function neutralThemeCss() {
  let css = readFileSync(resolve(SRC, "styles/globals.css"), "utf-8")
    .replace(/^@import "@fontsource-variable\/geist";\n/m, "")
    .replace(/^@import "tw-animate-css";\n/m, "")
    .replace(/^@source inline\(.*\);\n/gm, "")
  const start = css.indexOf("\n@layer components {")
  if (start >= 0) {
    let depth = 0
    for (let i = css.indexOf("{", start); i < css.length; i++) {
      if (css[i] === "{") depth++
      else if (css[i] === "}" && --depth === 0) {
        css = css.slice(0, start) + css.slice(i + 1)
        break
      }
    }
  }
  return css
}

const tailwindCache = new Map()
async function tailwindFor(files) {
  const key = files.join("\n")
  if (tailwindCache.has(key)) return tailwindCache.get(key)
  const compiler = await compile(neutralThemeCss(), { base: resolve(SRC, "styles"), onDependency: () => {} })
  const scanner = new Scanner({})
  const candidates = scanner.scanFiles(files.map((file) => ({ content: readFileSync(file, "utf-8"), extension: file.split(".").pop() })))
  const css = optimize(compiler.build(candidates), { minify: true }).code
  tailwindCache.set(key, css)
  return css
}

// ---- Licence notices -------------------------------------------------------------------------

const MIT_TEXT = `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.`

// The comment at the top of a ported stylesheet: where it comes from, its licence and what was
// left out. Kept in the file, as the EUPL-1.2 and the MIT licence ask.
function stylesheetHeader(path) {
  const lines = []
  for (const line of readFileSync(resolve(SITE_DIR, "..", path), "utf-8").split("\n")) {
    if (!line.startsWith("//")) break
    lines.push(line.replace(/^\/\/ ?/, ""))
  }
  return lines.join("\n")
}

// The licence of every npm package bundled into the file, from its own licence file.
function packageLicences(inputs) {
  const roots = new Set()
  for (const input of inputs) {
    const m = /^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//.exec(input)
    if (m) roots.add(resolve(SITE_DIR, m[1]))
  }
  return [...roots]
    .map((root) => {
      const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"))
      const file = readdirSync(root).find((f) => /^licen[cs]e/i.test(f))
      const text = file ? readFileSync(join(root, file), "utf-8").trim() : `${pkg.license} licence. No licence file in the package.`
      return { name: pkg.name, version: pkg.version, text }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Text placed inside an HTML or CSS comment must not close it early.
const htmlComment = (text) => text.replaceAll("-->", "-- >").replaceAll("<!--", "< !--")
const cssComment = (text) => text.replaceAll("*/", "* /")

const escape = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")
const hash = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`

// ---- The page around the form ---------------------------------------------------------------

// Plain styles for the notice and credits around the form, in the reader's system font.
const FRAME_CSS = `html,body{margin:0;background:#fff}
.kf-file{max-width:46rem;margin:0 auto;padding-bottom:2rem;color:#1f1f1f;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.5}
.kf-file__notice{margin:1rem 1rem 0;padding:.875rem 1rem;border:1px solid #d4d4d4;border-left:4px solid #525252;border-radius:.5rem;background:#f5f5f5;font-size:.9375rem}
.kf-file__notice p,.kf-file__credits p{margin:0 0 .5rem}
.kf-file__notice p:last-child,.kf-file__credits p:last-child{margin-bottom:0}
.kf-file__notice a,.kf-file__credits a{color:inherit;text-decoration:underline;text-underline-offset:.2em}
.kf-file__form{padding:1.25rem}
.kf-file__credits{margin:2rem 1rem 0;padding-top:1rem;border-top:1px solid #d4d4d4;color:#525252;font-size:.8125rem}
@media (min-width:768px){.kf-file__notice{margin:1.5rem 2rem 0}.kf-file__form{padding:2rem}.kf-file__credits{margin:2rem 2rem 0}}
`

function page({ form, variant, design, ui, js, css, styleNotice, credits, licences }) {
  const system = design === "neutral" ? null : DESIGN_SYSTEMS[design]
  const styleText = `${css}`
  const policy = [
    "default-src 'none'",
    `script-src ${hash(js)}`,
    `style-src ${hash(styleText)}`,
    "img-src data:",
    "connect-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "object-src 'none'",
  ].join("; ")
  const pageUrl = `${SITE}/example-form/${form.code}${design === "neutral" && form.system ? "?design=neutral" : ""}${variant.key !== form.code ? `${design === "neutral" && form.system ? "&" : "?"}lang=${variant.lang}` : ""}`
  const designName = system ? system.name : "the neutral design"
  return `<!doctype html>
<!--
${htmlComment(`Kinderform example enquiry form: ${form.name}${form.variants.length > 1 ? ` (${variant.english})` : ""}, in ${designName}.
An example that sends nothing. Test it with your service before you use it with real people.
From ${SITE}/example-form/${form.code}. Code: MIT licence. Wording: CC BY 4.0.
${styleNotice}
The licences of the open-source software bundled in this file are at the end of the file.`)}
-->
<html lang="${escape(variant.locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${policy}">
<meta name="referrer" content="no-referrer">
<title>${escape(ui.start.title)}</title>
<style>${styleText}</style>
</head>
<body>
<div class="kf-file">
<header class="kf-file__notice" lang="en">
<p><strong>An example that sends nothing.</strong> This is a Kinderform example of a first enquiry about fostering or adoption. Nothing you enter leaves this page.</p>
<p>Before you use it with real people, adapt it and test it with your service. Check the wording, the reply times and who handles each enquiry.</p>
<p><a href="${escape(pageUrl)}">See this form on kinderform.org</a> · <a href="${escape(`${SITE}${variant.kit}`)}">Get the starter kit</a></p>
</header>
<main id="kf-root"><noscript><p class="kf-file__form" lang="en">This example needs JavaScript. A real form built to the Kinderform standard should work without it.</p></noscript></main>
<footer class="kf-file__credits" lang="en">
${credits.map((p) => `<p>${p}</p>`).join("\n")}
</footer>
</div>
<script>${js}</script>
</body>
</html>
<!--
${htmlComment(licences)}
-->
`
}

// ---- Build ------------------------------------------------------------------------------------

async function bundle(entry) {
  const result = await esbuild.build({
    stdin: { contents: entry, resolveDir: FORM_DIR, sourcefile: "download-entry.tsx", loader: "tsx" },
    bundle: true,
    minify: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    jsx: "automatic",
    tsconfig: resolve(SITE_DIR, "tsconfig.json"),
    define: { "process.env.NODE_ENV": '"production"' },
    legalComments: "eof",
    charset: "utf8",
    write: false,
    outdir: resolve(SITE_DIR, "dist-downloads"),
    metafile: true,
    logLevel: "warning",
    plugins: [ajvStub, scss],
  })
  const js = result.outputFiles.find((f) => f.path.endsWith(".js")).text.trim()
  const css = result.outputFiles.find((f) => f.path.endsWith(".css"))?.text.trim() ?? ""
  // Inside an inline <script>, "</script" or "<!--" would end or confuse the element.
  if (/<\/script|<!--/i.test(js)) throw new Error("The bundled script contains </script or <!--")
  // Only the files that put code into the script or the styles: their licences go in the file.
  const inputs = new Set()
  for (const output of Object.values(result.metafile.outputs)) {
    for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) if (bytesInOutput > 0) inputs.add(input)
  }
  return { js, css, inputs: [...inputs] }
}

function licenceText(design, inputs) {
  const parts = []
  if (design !== "neutral") {
    const s = DESIGN_SYSTEMS[design]
    if (s.licence.copyleft) {
      parts.push(`${s.name}: ${s.version}. ${s.copyright}. Licensed under the ${s.licence.name}: ${s.licence.url}`)
    } else if (s.licence.name.startsWith("MIT")) {
      parts.push(`${s.name}: ${s.version}. MIT License\n\nCopyright ${s.copyright.replace(/^© ?/, "(c) ")}\n\n${MIT_TEXT}`)
    } else {
      parts.push(`${s.name}: ${s.version}. ${s.copyright}: ${s.licence.url}`)
    }
  } else {
    parts.push(`shadcn/ui: MIT License\n\nCopyright (c) shadcn\n\n${MIT_TEXT}`)
  }
  for (const p of packageLicences(inputs)) parts.push(`${p.name} ${p.version}\n\n${p.text}`)
  return `Licences of the open-source software in this file\n\n${parts.join("\n\n----------\n\n")}`
}

function creditsFor(design) {
  const lines = [
    "Kinderform made this example from its enquiry standard. Its code is under the MIT licence, and its wording under CC BY 4.0.",
  ]
  if (design === "neutral") {
    lines.push(
      `The neutral design uses <a href="https://ui.shadcn.com">shadcn/ui</a> and Tailwind CSS, both under the MIT licence.`,
    )
  } else {
    const s = DESIGN_SYSTEMS[design]
    lines.push(
      `Design system: ${escape(s.name)} (${escape(s.version)}).`,
      `${escape(s.copyright)}. Licence: <a href="${s.licence.url}">${escape(s.licence.name)}</a>.`,
    )
    if (s.licence.copyleft) {
      lines.push(
        `You can share and change these styles under the same licence. Their source is <a href="${REPO}/blob/main/${s.stylesheet}">${s.stylesheet.split("/").pop()}</a> in the Kinderform repository.`,
      )
    }
    lines.push(`We left out ${escape(s.leftOut)}. Kinderform is not a government service.`)
  }
  lines.push("The licences of the other open-source software in this file are at the end of its source.")
  return lines
}

async function build() {
  rmSync(DOWNLOAD_DIR, { recursive: true, force: true })
  mkdirSync(DOWNLOAD_DIR, { recursive: true })
  const made = []
  for (const form of exampleForms()) {
    for (const variant of form.variants) {
      const ui = JSON.parse(readFileSync(resolve(UI_DIR, `enquiry-submission.${variant.key}.json`), "utf-8"))
      for (const design of form.system ? [form.system, "neutral"] : ["neutral"]) {
        const mount = JSON.stringify(resolve(FORM_DIR, "mount-download.tsx"))
        const entry =
          design === "neutral"
            ? `import m from ${JSON.stringify(resolve(FORM_DIR, "load-neutral.ts"))}
               import ui from ${JSON.stringify(resolve(UI_DIR, `enquiry-submission.${variant.key}.json`))}
               import { mountDownload } from ${mount}
               mountDownload({ ...m, ui }, ${JSON.stringify(variant.lang)})`
            : `import m from ${JSON.stringify(resolve(FORM_DIR, `load-${form.code}.ts`))}
               import { mountDownload } from ${mount}
               mountDownload(m, ${JSON.stringify(variant.lang)})`
        const { js, css, inputs } = await bundle(entry)
        let styles
        let styleNotice
        if (design === "neutral") {
          const sources = inputs.filter((f) => f.startsWith("src/") && /\.(tsx?|jsx?)$/.test(f)).map((f) => resolve(SITE_DIR, f)).filter((f) => existsSync(f))
          styles = `/* Kinderform neutral design: shadcn/ui components (MIT licence) and Tailwind CSS (MIT licence). */\n${FRAME_CSS}${await tailwindFor(sources)}\n${css}`
          styleNotice = "Styles: the neutral design, with shadcn/ui and Tailwind CSS (MIT licence)."
        } else {
          const s = DESIGN_SYSTEMS[design]
          styles = `/*\n${cssComment(stylesheetHeader(s.stylesheet))}\n\nWeb fonts are left out of this file: it uses the system fonts of the device.\n*/\n${FRAME_CSS}${css}`
          styleNotice = `Styles: ${s.name} (${s.version}), ${s.copyright}, under the ${s.licence.name}.`
        }
        const html = page({
          form,
          variant,
          design,
          ui,
          js,
          css: styles,
          styleNotice,
          credits: creditsFor(design),
          // The neutral styles include Tailwind's own base styles, so its licence goes in too.
          licences: licenceText(design, design === "neutral" ? [...inputs, "node_modules/tailwindcss/index.css"] : inputs),
        })
        const file = downloadFile(variant.key, design)
        writeFileSync(resolve(DOWNLOAD_DIR, file), html)
        made.push([file, Buffer.byteLength(html)])
      }
    }
  }
  for (const [file, bytes] of made) console.log(`${String(Math.round(bytes / 1024)).padStart(4)} KB  ${file}`)
  console.log(`Built ${made.length} downloadable example forms in ${relative(SITE_DIR, DOWNLOAD_DIR)}/`)
}

await build()
