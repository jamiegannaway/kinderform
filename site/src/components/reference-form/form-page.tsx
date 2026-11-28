// The example form on a country page (/example-form/<country>), in the browser.
//
// The page around it is static HTML (src/components/example-form-page.tsx). This loads the design
// the address asks for: the country's own (load-<country>.ts) by default, or the neutral one with
// ?design=neutral (load-neutral.ts, with the country's wording). Each design's styles and scripts
// load only when it is shown. A form with more than one language (Canada) switches language in
// place, keeping the answers, and keeps ?lang= in the address so the link can be shared.
import { useEffect, useState } from "react"

import { ReferenceForm, type Theme, type UiConfig } from "./engine"

type Language = { code: string; label: string; ui: UiConfig }
type National = { default: { ui: UiConfig; theme: Theme; rootClass: string; languages?: Language[] } }
type Neutral = { default: { theme: Theme; rootClass: string } }
type Shown = { theme: Theme; rootClass: string; languages: { code: string; ui: UiConfig }[] }

// Every country's own design, found by file name, so a new country needs only its load-<code>.ts.
const NATIONAL = import.meta.glob<National>("./load-*.ts")
const WORDING = import.meta.glob<{ default: UiConfig }>("../../../../schema/ui/enquiry-submission.*.json")

/** One wording file of this country, as the page lists it in data-variants. */
export type PageVariant = { key: string; lang: string }

export type Design = "national" | "neutral"

export const wantedDesign = (hasNational: boolean): Design =>
  hasNational && new URLSearchParams(location.search).get("design") !== "neutral" ? "national" : "neutral"

async function load(country: string, design: Design, variants: PageVariant[]): Promise<Shown> {
  if (design === "national") {
    const loader = NATIONAL[`./load-${country}.ts`]
    if (!loader) throw new Error(`No load-${country}.ts`)
    const { default: m } = await loader()
    return { ...m, languages: m.languages ?? [{ code: variants[0].lang, ui: m.ui }] }
  }
  const [{ default: m }, ...wordings] = await Promise.all([
    import("./load-neutral") as Promise<Neutral>,
    ...variants.map((v) => WORDING[`../../../../schema/ui/enquiry-submission.${v.key}.json`]()),
  ])
  return { ...m, languages: variants.map((v, i) => ({ code: v.lang, ui: wordings[i].default })) }
}

export function FormPage({
  country,
  design,
  variants,
  lang,
}: {
  country: string
  design: Design
  variants: PageVariant[]
  lang: string
}) {
  const [shown, setShown] = useState<Shown | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    load(country, design, variants)
      .then(setShown)
      .catch(() => setFailed(true))
  }, [country, design])

  if (failed) return <p className="p-5 md:p-8">The form did not load. Check your connection and try again.</p>
  if (!shown) return <p className="p-5 md:p-8" aria-live="polite">Loading the form…</p>
  const ui = (shown.languages.find((l) => l.code === lang) ?? shown.languages[0]).ui
  // The same form for every language, so switching language keeps the answers.
  return (
    <div className={`p-5 md:p-8 ${shown.rootClass}`}>
      <ReferenceForm ui={ui} theme={shown.theme} />
    </div>
  )
}
