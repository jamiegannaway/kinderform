// Reads the intake-form census (../census/*.csv) at build time.
// Runs only during `astro build`; nothing here reaches the browser.
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

export type Row = Record<string, string>

const CENSUS_DIR = resolve(process.cwd(), "..", "census")

// Small RFC 4180 parser: quoted fields, doubled quotes, commas and newlines inside quotes.
export function parseCsv(text: string): Row[] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += c
  }
  if (field !== "" || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [head, ...body] = rows.filter((r) => r.length > 1 || r[0] !== "")
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])))
}

function load(name: string): Row[] {
  try {
    return parseCsv(readFileSync(resolve(CENSUS_DIR, name), "utf-8"))
  } catch {
    return []
  }
}

export type Census = {
  forms: Row[]
  questions: Row[]
  options: Row[]
  guidance: Row[]
  taxonomy: Row[]
}

export function loadCensus(): Census {
  return {
    forms: load("forms.csv"),
    questions: load("questions.csv"),
    options: load("answer_options.csv"),
    guidance: load("guidance.csv"),
    taxonomy: load("taxonomy.csv"),
  }
}

const PUBLIC = new Set([
  "regional_hub",
  "single_authority",
  "council",
  "council_consortium",
  "national_brand_council",
  "regional_service",
  "state_agency",
  "county_agency",
  "child_welfare_agency",
  "indigenous_agency",
  "local_authority",
])

export type Group = "Councils and hubs" | "Independent agencies" | "Adoption agencies"
export const GROUPS: Group[] = ["Councils and hubs", "Independent agencies", "Adoption agencies"]

export function groupOf(f: Row): Group | null {
  if (f.operator_type === "independent_fostering_agency" || f.operator_type === "private_agency")
    return "Independent agencies"
  if (f.operator_type === "regional_adoption_agency" || f.operator_type === "voluntary_adoption_agency")
    return "Adoption agencies"
  // Non-profit providers in Germany, France and Spain (freie Träger, associations, entidades colaboradoras)
  if (f.operator_type === "voluntary_agency")
    return f.service_type === "adoption" ? "Adoption agencies" : "Independent agencies"
  if (PUBLIC.has(f.operator_type)) return f.service_type === "adoption" ? "Adoption agencies" : "Councils and hubs"
  return null
}

// Questions asked of the person enquiring (not staff fields).
export function askedBy(c: Census): Map<string, Row[]> {
  const m = new Map<string, Row[]>()
  for (const q of c.questions) {
    if (q.category === "staff_recorded") continue
    m.set(q.form_id, [...(m.get(q.form_id) ?? []), q])
  }
  return m
}

// Blank conditional_on never establishes that a question is always shown. Unknown
// branching remains in recorded-question counts, and is reported separately.
export const isKnownFollowUp = (q: Row): boolean => !!q.conditional_on || q.branching_status === "conditional"
export const isCountedQuestion = (q: Row): boolean =>
  q.category !== "consent" && q.category !== "staff_recorded" && q.input_type !== "statement" && !isKnownFollowUp(q)
export const hasUnknownBranching = (q: Row): boolean =>
  !isKnownFollowUp(q) && q.branching_status !== "unconditional"

// One statistical unit per country, stage and exact form URL (ignoring fragments
// and a trailing slash). Keep query parameters: they may select a different form.
// The original service-location rows and their sources stay in the census.
export function formKey(f: Row): string {
  const source = f.form_url || f.source_url
  let url = source
  try {
    const parsed = new URL(source)
    parsed.hash = ""
    parsed.pathname = parsed.pathname.replace(/\/$/, "") || "/"
    url = parsed.toString()
  } catch { /* Rows without a usable URL retain their individual identity. */ }
  return `${f.country}|${f.form_stage}|${url || f.form_id}`
}

export function uniqueForms(forms: Row[]): Row[] {
  const byUrl = new Map<string, Row>()
  const preferred = (a: Row, b: Row) =>
    Number(b.observed === "direct_fetch") - Number(a.observed === "direct_fetch") ||
    b.date_checked.localeCompare(a.date_checked) || a.form_id.localeCompare(b.form_id)
  for (const f of [...forms].sort(preferred)) if (!byUrl.has(formKey(f))) byUrl.set(formKey(f), f)
  return [...byUrl.values()]
}

export const MIN_QUESTIONS = 3

// A primary form whose questions we have seen well enough to describe.
export function isReadable(f: Row, asked: Map<string, Row[]>): boolean {
  return (
    f.form_stage === "primary" &&
    f.access_route !== "signposting_only" &&
    f.operator_type !== "platform_vendor" &&
    (asked.get(f.form_id)?.length ?? 0) >= MIN_QUESTIONS
  )
}

export function guidanceFor(c: Census, formId: string): Row[] {
  return c.guidance.filter((g) => g.form_id === formId)
}
