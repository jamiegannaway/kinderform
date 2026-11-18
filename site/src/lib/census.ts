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
])

export type Group = "Councils and hubs" | "Independent agencies" | "Adoption agencies"
export const GROUPS: Group[] = ["Councils and hubs", "Independent agencies", "Adoption agencies"]

export function groupOf(f: Row): Group | null {
  if (f.operator_type === "independent_fostering_agency" || f.operator_type === "private_agency")
    return "Independent agencies"
  if (f.operator_type === "regional_adoption_agency" || f.operator_type === "voluntary_adoption_agency")
    return "Adoption agencies"
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
