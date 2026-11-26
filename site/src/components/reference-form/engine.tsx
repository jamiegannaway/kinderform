// The reference enquiry form.
// Questions and rules come from schema/enquiry-submission.schema.json; wording comes from the
// UI schema (schema/ui/enquiry-submission.<locale>.json). JSON Forms renders each page with the
// renderers of the chosen design system (GOV.UK Frontend or USWDS).
// Nothing is sent or stored: the "record" shown at the end stays in the browser.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { JsonForms } from "@jsonforms/react"
import type { JsonFormsRendererRegistryEntry } from "@jsonforms/core"
import type { ValidateFunction } from "ajv"

import schema from "../../../../schema/enquiry-submission.schema.json"
import compiledValidate from "@/generated/validate-submission.js"
import { nextReplyDay } from "./reply-day"

// The generated JavaScript is AJV's standalone ValidateFunction, including its
// error list. Keep that contract when TypeScript infers the generated module.
const validate = compiledValidate as ValidateFunction

// ---- Types ------------------------------------------------------------------

export type Control = {
  type: "Control"
  scope: string
  label: string
  options?: {
    asHeading?: boolean
    format?: "radio" | "checkbox"
    hint?: string
    optionLabels?: Record<string, string>
    optionHints?: Record<string, string>
    checkboxLabel?: string
    errors?: Record<string, string>
    autocomplete?: string
    inputmode?: string
    spellcheck?: boolean
    inputWidth?: number
    transform?:
      | "postcode_area"
      | "zip_prefix"
      | "postal_code_fsa"
      | "au_postcode"
      | "de_postcode"
      | "fr_postcode"
      | "es_postcode"
      | "eircode_routing_key"
      | "nl_postcode"
      | "nz_postcode"
  }
}
export type Page = {
  id: string
  section: string
  title?: string
  showIf?: Record<string, string[]>
  elements: Control[]
}
export type UiConfig = {
  locale: string
  design_system: "govuk" | "uswds" | "gcds" | "agds" | "kern" | "cunningham" | "desy" | "govie" | "nl-design" | "nzgds" | "sgds"
  sections: string[]
  start: { title: string; body: string[]; button: string }
  pages: Page[]
  check: { title: string; change: string; send_heading: string; send_body: string; button: string }
  confirmation: {
    title: string
    reference: string
    next_heading: string
    team: string
    kinship_team: string
    day_word: string
    example_label: string
    builders_heading: string
    builders_body: string
    restart: string
  }
  progress: { question: string; of: string; back: string; continue: string; error_title: string; error_prefix: string }
  demo_notice: string
}
export type Data = Record<string, unknown>
export type Errors = Record<string, string>

export type Step =
  | { kind: "start" }
  | { kind: "page"; index: number }
  | { kind: "check" }
  | { kind: "done"; reference: string; due: Date; record: Data }

// What a design system has to provide besides the JSON Forms renderers.
export type Theme = {
  renderers: JsonFormsRendererRegistryEntry[]
  Start: (p: { ui: UiConfig; onStart: () => void; headingRef: React.Ref<HTMLHeadingElement> }) => React.ReactNode
  Progress: (p: { ui: UiConfig; sectionIndex: number; question?: { n: number; total: number }; section: string }) => React.ReactNode
  Back: (p: { label: string; onBack: () => void }) => React.ReactNode
  ErrorSummary: (p: { title: string; errors: { id: string; message: string }[]; boxRef: React.Ref<HTMLDivElement> }) => React.ReactNode
  PageHeading: (p: { text: string; headingRef: React.Ref<HTMLHeadingElement> }) => React.ReactNode
  Continue: (p: { label: string }) => React.ReactNode
  Check: (p: {
    ui: UiConfig
    rows: { key: string; label: string; value: string; pageIndex: number }[]
    onChange: (pageIndex: number) => void
    headingRef: React.Ref<HTMLHeadingElement>
  }) => React.ReactNode
  Done: (p: {
    ui: UiConfig
    step: Extract<Step, { kind: "done" }>
    headingRef: React.Ref<HTMLHeadingElement>
    onRestart: () => void
  }) => React.ReactNode
}

// ---- Shared state for renderers -----------------------------------------------

type PageCtx = {
  errors: Errors
  headingField: string | null
  onBlurField: (field: string, value?: string) => void
  onValue: (field: string, value: unknown) => void
}
export const PageContext = createContext<PageCtx>({
  errors: {},
  headingField: null,
  onBlurField: () => {},
  onValue: () => {},
})
export const usePage = () => useContext(PageContext)

export const fieldOf = (scope: string) => scope.split("/").pop() as string
export const idFor = (field: string) => `kf-${field}`

// ---- Helpers --------------------------------------------------------------

const isVisible = (p: Page, data: Data) =>
  !p.showIf || Object.entries(p.showIf).every(([k, vals]) => vals.includes(String(data[k])))

// The total in "question 5 of 9". Before a branching answer is given, each branch
// counts as one question, so the total stays steady instead of jumping.
function totalQuestions(pages: Page[], data: Data): number {
  let total = 0
  const pending = new Set<string>()
  for (const p of pages) {
    if (!p.showIf) total++
    else if (Object.keys(p.showIf).every((k) => data[k] !== undefined)) total += isVisible(p, data) ? 1 : 0
    else pending.add(Object.keys(p.showIf).sort().join("+"))
  }
  return total + pending.size
}

function clean(data: Data, pages: Page[]): Data {
  const keep = new Set(
    pages.filter((p) => isVisible(p, data)).flatMap((p) => p.elements.map((e) => fieldOf(e.scope))),
  )
  const out: Data = {}
  for (const [k, v] of Object.entries(data)) {
    if (!keep.has(k)) continue
    if (v === "" || v === undefined || v === null) continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v
  }
  return out
}

export function transform(kind: string | undefined, value: string): string {
  const v = value.trim()
  if (!v) return v
  if (kind === "postcode_area") {
    const up = v.toUpperCase().replace(/\s+/g, " ")
    if (up.includes(" ")) return up.split(" ")[0]
    // Full postcode typed without a space, like SW1A1AA: keep all but the last 3 characters.
    return /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/.test(up) ? up.slice(0, -3) : up
  }
  if (kind === "zip_prefix") {
    const digits = v.replace(/\D/g, "")
    return digits.length >= 3 ? digits.slice(0, 3) : digits
  }
  if (kind === "postal_code_fsa") {
    // A full postal code, like K1A 0B1, keeps only its first 3 characters.
    const up = v.toUpperCase().replace(/\s+/g, "")
    return up.length === 6 ? up.slice(0, 3) : up
  }
  if (kind === "au_postcode") return v.replace(/\s+/g, "")
  // German, French and Spanish postcodes: five digits. Drop spaces and an old country prefix ("D-10115").
  if (kind === "de_postcode" || kind === "fr_postcode" || kind === "es_postcode")
    return v.replace(/^[A-Za-z]{1,2}-/, "").replace(/\s+/g, "")
  // A full Eircode, like A65 F4E2, keeps only its routing key: the first 3 characters.
  if (kind === "eircode_routing_key") {
    const up = v.toUpperCase().replace(/\s+/g, "")
    return up.length === 7 ? up.slice(0, 3) : up
  }
  // A full Dutch postcode, like 1234 AB, keeps only its 4 digits.
  if (kind === "nl_postcode") {
    const up = v.toUpperCase().replace(/\s+/g, "")
    return /^[0-9]{4}[A-Z]{2}$/.test(up) ? up.slice(0, 4) : up
  }
  if (kind === "nz_postcode") return v.replace(/\s+/g, "")
  return v
}

function errorsFor(page: Page, data: Data, locale: string): Errors {
  const fields = new Set(page.elements.map((e) => fieldOf(e.scope)))
  const controls = Object.fromEntries(page.elements.map((e) => [fieldOf(e.scope), e]))
  const out: Errors = {}
  if (validate(data)) return out
  for (const e of validate.errors ?? []) {
    const field =
      e.keyword === "required" ? (e.params as { missingProperty: string }).missingProperty : e.instancePath.split("/")[1]
    if (!field || !fields.has(field) || out[field]) continue
    if (["if", "not", "additionalProperties"].includes(e.keyword)) continue
    out[field] = controls[field].options?.errors?.[e.keyword] ?? phrases(locale).check
  }
  return out
}

function reference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return "KF-" + Array.from(bytes, (b) => chars[b % chars.length]).join("")
}

export function displayValue(c: Control, value: unknown, locale: string): string {
  const labels = c.options?.optionLabels ?? {}
  const t = phrases(locale)
  if (value === undefined || value === "" || (Array.isArray(value) && !value.length)) return t.notGiven
  if (c.options?.format === "checkbox") return value ? t.yes : t.no
  if (Array.isArray(value)) return value.map((v) => labels[String(v)] ?? String(v)).join(", ")
  return labels[String(value)] ?? String(value)
}

// ---- Layout renderer shared by both design systems -------------------------

// Layout is plain: each control is dispatched to the design system's renderer.
export { JsonFormsDispatch } from "@jsonforms/react"

// ---- The form -----------------------------------------------------------

export function ReferenceForm({ ui, theme }: { ui: UiConfig; theme: Theme }) {
  const [data, setData] = useState<Data>({})
  // The latest answers, updated the moment the form library reports a change. Handlers read this,
  // not the last rendered copy: a change reported just before Continue or a blur has not been
  // rendered yet, and saving the rendered copy would overwrite it.
  const latest = useRef<Data>({})
  const put = (d: Data) => {
    latest.current = d
    setData(d)
  }
  // Each field reports its new value here as it is set, before the form library passes it on.
  const onValue = (field: string, value: unknown) => {
    latest.current = { ...latest.current, [field]: value }
  }
  const [step, setStep] = useState<Step>({ kind: "start" })
  const [errors, setErrors] = useState<Errors>({})
  const [returnToCheck, setReturnToCheck] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  const visible = useMemo(() => ui.pages.filter((p) => isVisible(p, data)), [ui.pages, data])
  const page = step.kind === "page" ? visible[step.index] : null

  // Make each move between steps obvious: scroll to the form, update the tab title,
  // and move keyboard and screen reader focus to the new heading (or the error summary).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const hasErrors = Object.keys(errors).length > 0
    topRef.current?.scrollIntoView({ block: "start" })
    ;(hasErrors ? errorRef.current : headingRef.current)?.focus()
    const base = ui.start.title
    const label =
      step.kind === "page" && page
        ? `${ui.progress.question} ${step.index + 1} ${ui.progress.of} ${totalQuestions(ui.pages, data)}: ${page.title ?? page.elements[0].label}`
        : step.kind === "check"
          ? ui.check.title
          : step.kind === "done"
            ? ui.confirmation.title
            : base
    document.title = `${hasErrors ? ui.progress.error_prefix + " " : ""}${label} | ${phrases(ui.locale).example}`
  }, [step, errors])

  const go = (s: Step) => {
    setErrors({})
    setStep(s)
  }

  // Tidy a postcode as the person leaves the field. Use the value the field holds at that moment:
  // the form library reports a change a moment after the event, so state may still hold the old
  // value. Without one, fall back to the latest answers.
  const onBlurField = (field: string, value?: string) => {
    const c = page?.elements.find((e) => fieldOf(e.scope) === field)
    const kind = c?.options?.transform
    if (!kind) return
    const d = latest.current
    const current = typeof value === "string" ? value : d[field]
    if (typeof current === "string") put({ ...d, [field]: transform(kind, current) || undefined })
  }

  const onContinue = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!page || step.kind !== "page") return
    // Apply any tidy-up (postcode, ZIP) before checking.
    const next = { ...latest.current }
    for (const c of page.elements) {
      const f = fieldOf(c.scope)
      if (typeof next[f] === "string") next[f] = (next[f] as string).trim()
      if (c.options?.transform && typeof next[f] === "string") next[f] = transform(c.options.transform, next[f] as string) || undefined
      if (next[f] === "") delete next[f]
    }
    const errs = errorsFor(page, clean(next, ui.pages), ui.locale)
    put(next)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    const nextVisible = ui.pages.filter((p) => isVisible(p, next))
    const i = nextVisible.findIndex((p) => p.id === page.id)
    if (returnToCheck) {
      // A changed answer can open a follow-up question (for example, a new contact method).
      const follow = nextVisible[i + 1]
      if (follow?.showIf && follow.elements.some((e) => next[fieldOf(e.scope)] === undefined)) {
        go({ kind: "page", index: i + 1 })
        return
      }
      setReturnToCheck(false)
      go({ kind: "check" })
      return
    }
    go(i + 1 < nextVisible.length ? { kind: "page", index: i + 1 } : { kind: "check" })
  }

  const onBack = () => {
    if (step.kind === "page") go(step.index === 0 ? { kind: "start" } : { kind: "page", index: step.index - 1 })
    if (step.kind === "check") go({ kind: "page", index: visible.length - 1 })
  }

  const onSend = (ev: React.FormEvent) => {
    ev.preventDefault()
    const record = clean(data, ui.pages)
    if (!validate(record)) {
      // Should not happen: every page was checked. Send the person to the first problem.
      const bad = visible.findIndex((p) => Object.keys(errorsFor(p, record, ui.locale)).length)
      go({ kind: "page", index: Math.max(0, bad) })
      return
    }
    go({ kind: "done", reference: reference(), due: nextReplyDay(new Date(), record), record })
  }

  const sectionIndex = (name: string) => Math.max(0, ui.sections.indexOf(name))
  const T = theme

  return (
    <div ref={topRef} className="kf-form" lang={ui.locale}>
      <div key={step.kind === "page" ? page?.id : step.kind} className="kf-step">
        {step.kind === "start" && <T.Start ui={ui} onStart={() => go({ kind: "page", index: 0 })} headingRef={headingRef} />}

        {step.kind === "page" && page && (
          <>
            <T.Back label={ui.progress.back} onBack={onBack} />
            <T.Progress
              ui={ui}
              sectionIndex={sectionIndex(page.section)}
              section={page.section}
              question={{ n: step.index + 1, total: totalQuestions(ui.pages, data) }}
            />
            {Object.keys(errors).length > 0 && (
              <T.ErrorSummary
                title={ui.progress.error_title}
                boxRef={errorRef}
                errors={Object.entries(errors).map(([f, m]) => ({ id: idFor(f), message: m }))}
              />
            )}
            <form noValidate onSubmit={onContinue}>
              {page.title && <T.PageHeading text={page.title} headingRef={headingRef} />}
              <PageContext.Provider
                value={{ errors, headingField: page.title ? null : fieldOf(page.elements[0].scope), onBlurField, onValue }}
              >
                <HeadingRefContext.Provider value={page.title ? null : headingRef}>
                  <JsonForms
                    schema={schema as object}
                    uischema={{ type: "VerticalLayout", elements: page.elements } as never}
                    data={data}
                    renderers={T.renderers}
                    cells={[]}
                    validationMode="NoValidation"
                    // Every field reports to onValue as it is set, so latest is always the newest copy.
                    // The library's own copy can lag a change behind, so it is not saved back.
                    onChange={() => put(latest.current)}
                  />
                </HeadingRefContext.Provider>
              </PageContext.Provider>
              {/* On phones this bar stays at the bottom of the screen (kf-form.css). */}
              <div className="kf-actions">
                <T.Continue label={ui.progress.continue} />
              </div>
            </form>
          </>
        )}

        {step.kind === "check" && (
          <>
            <T.Back label={ui.progress.back} onBack={onBack} />
            <T.Progress ui={ui} sectionIndex={ui.sections.length - 1} section={ui.sections[ui.sections.length - 1]} />
            <form noValidate onSubmit={onSend}>
              <T.Check
                ui={ui}
                headingRef={headingRef}
                rows={visible.flatMap((p, pageIndex) =>
                  p.elements.map((c) => ({
                    key: fieldOf(c.scope),
                    label: c.label.replace(/\s*\((optional|facultatif|opcional|niet verplicht)\)$/i, ""),
                    value: displayValue(c, data[fieldOf(c.scope)], ui.locale),
                    pageIndex,
                  })),
                )}
                onChange={(i) => {
                  setReturnToCheck(true)
                  go({ kind: "page", index: i })
                }}
              />
            </form>
          </>
        )}

        {step.kind === "done" && (
          <T.Done
            ui={ui}
            step={step}
            headingRef={headingRef}
            onRestart={() => {
              put({})
              setReturnToCheck(false)
              go({ kind: "start" })
            }}
          />
        )}
      </div>
    </div>
  )
}

// Lets a renderer that shows its question as the page heading take the focus ref.
export const HeadingRefContext = createContext<React.Ref<HTMLHeadingElement> | null>(null)
export const useHeadingRef = () => useContext(HeadingRefContext)

export function formatDay(d: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d)
}

// The Canadian form also comes in French (fr-CA): the few phrases that live in code follow it.
export const isFrench = (locale: string) => locale.toLowerCase().startsWith("fr")

// The few phrases that live in code, by language. Everything else is in the wording files.
const PHRASES = {
  en: { check: "Check this answer", notGiven: "Not given", yes: "Yes", no: "No", example: "Kinderform example" },
  fr: { check: "Vérifiez cette réponse", notGiven: "Non fourni", yes: "Oui", no: "Non", example: "Exemple Kinderform" },
  de: { check: "Bitte prüfen Sie diese Angabe", notGiven: "Nicht angegeben", yes: "Ja", no: "Nein", example: "Kinderform-Beispiel" },
  es: { check: "Revise esta respuesta", notGiven: "No indicado", yes: "Sí", no: "No", example: "Ejemplo de Kinderform" },
  nl: { check: "Controleer dit antwoord", notGiven: "Niet ingevuld", yes: "Ja", no: "Nee", example: "Kinderform-voorbeeld" },
}
export const phrases = (locale: string) =>
  PHRASES[locale.slice(0, 2).toLowerCase() as keyof typeof PHRASES] ?? PHRASES.en

export function exampleMessage(ui: UiConfig, record: Data, due: Date) {
  const name = (record.preferred_name as string) || (record.full_name as string)
  const day = formatDay(due, ui.locale)
  const times = record.best_times && (record.best_times as string[]).length
  const by = record.contact_method
  // Made-up staff names for the example reply, one for each country version.
  const locale = ui.locale
  if (locale === "fr-FR") {
    const how = by === "email" ? "vous écrire par e-mail" : by === "text_message" ? "vous envoyer un SMS" : "vous appeler"
    if (record.knows_child)
      return `Bonjour ${name}, merci de nous avoir contactés. Comme votre demande concerne un enfant que vous connaissez déjà, nous l'avons transmise à Sam, de ${ui.confirmation.kinship_team}. Sam va ${how} d'ici la fin de la journée du ${day}. Vous pouvez poser des questions sans vous engager à déposer une candidature.`
    return `Bonjour ${name}, merci de nous avoir contactés. Je m'appelle Camille et je fais partie de ${ui.confirmation.team}. Je vais ${how} d'ici la fin de la journée du ${day}${times ? ", à l'un des moments que vous avez choisis" : ""}. Vous pouvez poser des questions sans vous engager à déposer une candidature.`
  }
  if (isFrench(locale)) {
    const how = by === "email" ? "vous écrire par courriel" : by === "text_message" ? "vous envoyer un message texte" : "vous appeler"
    if (record.knows_child)
      return `Bonjour ${name}, merci d'avoir communiqué avec nous. Comme votre demande concerne un enfant que vous connaissez déjà, nous l'avons transmise à Sam, de ${ui.confirmation.kinship_team}. Sam va ${how} d'ici la fin de la journée du ${day}. Vous pouvez poser des questions sans vous engager à déposer une candidature.`
    return `Bonjour ${name}, merci d'avoir communiqué avec nous. Je m'appelle Chantal et je fais partie de ${ui.confirmation.team}. Je vais ${how} d'ici la fin de la journée du ${day}${times ? ", à l'un des moments que vous avez choisis" : ""}. Vous pouvez poser des questions sans vous engager à déposer une candidature.`
  }
  if (locale.startsWith("de")) {
    const how = by === "email" ? "Ihnen eine E-Mail schreiben" : by === "text_message" ? "Ihnen eine SMS schicken" : "Sie anrufen"
    if (record.knows_child)
      return `Hallo ${name}, vielen Dank für Ihre Nachricht. Weil Sie nach einem Kind fragen, das Sie schon kennen, haben wir Ihre Nachricht an Sam von ${ui.confirmation.kinship_team} weitergegeben. Sam wird ${how}, spätestens am ${day}. Sie können Fragen stellen, ohne sich zu einer Bewerbung zu verpflichten.`
    return `Hallo ${name}, vielen Dank für Ihre Nachricht. Ich bin Lena von ${ui.confirmation.team}. Ich werde ${how}, spätestens am ${day}${times ? ", zu einer der Zeiten, die Sie gewählt haben" : ""}. Sie können Fragen stellen, ohne sich zu einer Bewerbung zu verpflichten.`
  }
  if (locale.startsWith("nl")) {
    // Dutch foster care providers address people as "je".
    const how = by === "email" ? "je een e-mail sturen" : by === "text_message" ? "je een sms sturen" : "je bellen"
    if (record.knows_child)
      return `Hoi ${name}, bedankt voor je bericht. Je vraagt naar een kind dat je al kent. Daarom hebben we je bericht doorgestuurd naar Sam van ${ui.confirmation.kinship_team}. Sam gaat ${how}, uiterlijk op ${day}. Je kunt vragen stellen zonder dat je je vastlegt op een aanvraag.`
    return `Hoi ${name}, bedankt voor je bericht. Ik ben Sanne van ${ui.confirmation.team}. Ik ga ${how}, uiterlijk op ${day}${times ? ", op een van de momenten die je hebt gekozen" : ""}. Je kunt vragen stellen zonder dat je je vastlegt op een aanvraag.`
  }
  if (locale.startsWith("es")) {
    // "I will" for the named worker, "Sam will" for the kinship team.
    const [me, sam] =
      by === "email"
        ? ["le escribiré un correo electrónico", "le escribirá un correo electrónico"]
        : by === "text_message"
          ? ["le enviaré un SMS", "le enviará un SMS"]
          : ["le llamaré", "le llamará"]
    if (record.knows_child)
      return `Hola, ${name}. Gracias por ponerse en contacto. Como pregunta por un niño o una niña que ya conoce, hemos pasado su mensaje a Sam, de ${ui.confirmation.kinship_team}. Sam ${sam} antes del final del ${day}. Puede hacer preguntas sin comprometerse a presentar una solicitud.`
    return `Hola, ${name}. Gracias por ponerse en contacto. Soy Lucía, de ${ui.confirmation.team}, y ${me} antes del final del ${day}${times ? ", en uno de los momentos que ha elegido" : ""}. Puede hacer preguntas sin comprometerse a presentar una solicitud.`
  }
  const sender: Record<string, string> = {
    "en-US": "Maria", "en-CA": "Chantal", "en-AU": "Mia", "en-IE": "Aoife", "en-NZ": "Aroha", "en-SG": "Mei",
  }
  const how = by === "email" ? "email you" : by === "text_message" ? "text you" : "call you"
  if (record.knows_child)
    return `Hi ${name}, thank you for getting in touch. Because you're asking about a child you already know, we've passed your message to Sam in ${ui.confirmation.kinship_team}. Sam will ${how} by the end of ${day}. You can ask questions without committing to an application.`
  return `Hi ${name}, thank you for getting in touch. I'm ${sender[locale] ?? "Priya"} from ${ui.confirmation.team}. I'll ${how} by the end of ${day}${times ? ", at one of the times you chose" : ""}. You can ask questions without committing to an application.`
}
