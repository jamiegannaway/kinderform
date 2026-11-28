// The example forms, one per country, worked out at build time from the wording files in
// schema/ui/ and the facts in design-systems.ts. Used by the country pages
// (src/pages/example-form/[country].astro) and by scripts/build-form-downloads.mjs.
// Nothing here reaches the browser.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { resolve } from "node:path"

import { FORM_COUNTRIES } from "../components/reference-form/countries.ts"
import { DESIGN_SYSTEMS, NEUTRAL, isDesignSystem, neutralOnlyReason, type DesignSystemKey } from "./design-systems.ts"

const ROOT = resolve(process.cwd(), "..")
const UI_DIR = resolve(ROOT, "schema/ui")

export const DOWNLOAD_PATH = "/downloads/forms"
export const DOWNLOAD_DIR = resolve(process.cwd(), "public/downloads/forms")

/** One wording file: the country's main language, or a translation such as ca-fr. */
export type Variant = {
  /** "de", or "ca-fr" for the French version of the Canadian form. */
  key: string
  locale: string
  /** The language code used in ?lang= ("en", "fr"). */
  lang: string
  /** The language's name in that language, for the switch: "English", "Français". */
  label: string
  /** The language's name in English, for the page around the form. */
  english: string
  /** The wording is in English, so it needs no review by a native speaker. */
  isEnglish: boolean
  /** The starter kit for this wording on /build. */
  kit: string
}

export type Download = { design: DesignSystemKey | "neutral"; label: string; href: string; file: string; bytes?: number }

export type ExampleForm = {
  code: string
  name: string
  /** The name inside a sentence: "the United States", "the Netherlands", "Germany". */
  inSentence: string
  /** The country's design system, or null when it has none that the form can use. */
  system: DesignSystemKey | null
  /** Why there is only the neutral version, when system is null. */
  neutralReason?: string
  variants: Variant[]
}

const capitalise = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1)

function wording(key: string): { locale: string; design_system: string } {
  return JSON.parse(readFileSync(resolve(UI_DIR, `enquiry-submission.${key}.json`), "utf-8"))
}

export function exampleForms(): ExampleForm[] {
  const keys = readdirSync(UI_DIR)
    .map((f) => /^enquiry-submission\.([a-z]{2}(?:-[a-z]{2})?)\.json$/.exec(f)?.[1])
    .filter((k): k is string => !!k)
  return FORM_COUNTRIES.map(({ code, name }) => {
    // The main file first, then its translations (ca, then ca-fr).
    const own = keys.filter((k) => k === code || k.startsWith(`${code}-`)).sort((a, b) => a.length - b.length || a.localeCompare(b))
    if (!own.includes(code)) throw new Error(`No wording file schema/ui/enquiry-submission.${code}.json`)
    const variants = own.map((key) => {
      const { locale } = wording(key)
      const lang = locale.split("-")[0].toLowerCase()
      return {
        key,
        locale,
        lang,
        label: capitalise(new Intl.DisplayNames([locale], { type: "language" }).of(lang) ?? lang),
        english: new Intl.DisplayNames(["en"], { type: "language" }).of(lang) ?? lang,
        isEnglish: lang === "en",
        kit: `/build/${key}`,
      }
    })
    const ds = wording(code).design_system
    if (ds !== "neutral" && !isDesignSystem(ds)) {
      throw new Error(`enquiry-submission.${code}.json: add "${ds}" to DESIGN_SYSTEMS in src/lib/design-systems.ts`)
    }
    const system = ds === "neutral" ? null : ds
    const inSentence = /^(United |Netherlands)/.test(name) ? `the ${name}` : name
    return { code, name, inSentence, system, neutralReason: system ? undefined : neutralOnlyReason(code, name), variants }
  })
}

export const designLabel = (design: DesignSystemKey | "neutral") =>
  design === "neutral" ? NEUTRAL.short : DESIGN_SYSTEMS[design].short

export const downloadFile = (variant: string, design: DesignSystemKey | "neutral") => `kinderform-${variant}-${design}.html`

/** The two downloads for one wording file: the country's design system (if any), then the neutral one. */
export function downloads(form: ExampleForm, variant: Variant): Download[] {
  const designs: (DesignSystemKey | "neutral")[] = form.system ? [form.system, "neutral"] : ["neutral"]
  return designs.map((design) => {
    const file = downloadFile(variant.key, design)
    const path = resolve(DOWNLOAD_DIR, file)
    return {
      design,
      label: `Download the ${designLabel(design)} version`,
      href: `${DOWNLOAD_PATH}/${file}`,
      file,
      bytes: existsSync(path) ? statSync(path).size : undefined,
    }
  })
}

export const formatSize = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`
