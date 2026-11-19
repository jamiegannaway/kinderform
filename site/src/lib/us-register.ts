// "The US picture" on /research: the US front-door register as counts, with no names.
//
// Reads ../register/us/*.csv at build time. Only numbers, state codes and plain
// group labels leave this file: no front door, agency or form is named, so the
// page cannot be read as a score for any service (CLAUDE.md, hard rule 5).
// Every row in the register is unverified until a person checks it; the page says so.
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseCsv, type Row } from "@/lib/census"

const DIR = resolve(process.cwd(), "..", "register", "us")

function load(name: string): Row[] {
  try {
    return parseCsv(readFileSync(resolve(DIR, name), "utf-8"))
  } catch {
    return []
  }
}

export type Bar = { label: string; value: number }
export type Share = { label: string; yes: number; of: number }
export type Tile = { code: string; model: "state" | "county" | "hybrid" | "unknown"; doors: number }

export type UsPicture = {
  jurisdictions: number
  doors: number
  privateAgencies: number
  tribal: number
  policies: number
  forms: number
  questions: number
  questionForms: number
  promises: number
  pagesOpened: number
  verified: number
  totalRows: number
  tiles: (Tile | null)[][]
  models: { model: Tile["model"]; label: string; count: number }[]
  levels: Bar[]
  sectors: Bar[]
  enquiry: { of: number; topics: Share[] }
  application: { of: number; topics: Share[] }
  replyDays: number[] // one value per front door that publishes a reply time, sorted
  minAge: Bar[]
  training: Bar[]
  licenceTerm: Bar[]
  evidence: { label: string; rows: number; searchOnly: number; opened: number; verified: number }[]
}

// Tile map: one cell per state, laid out roughly where it sits on a map.
const TILES = [
  ["AK", "", "", "", "", "", "", "", "", "", "ME"],
  ["", "", "", "", "", "", "", "", "", "VT", "NH"],
  ["WA", "ID", "MT", "ND", "MN", "IL", "WI", "MI", "NY", "RI", "MA"],
  ["OR", "NV", "WY", "SD", "IA", "IN", "OH", "PA", "NJ", "CT", ""],
  ["CA", "UT", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "DE", ""],
  ["", "AZ", "NM", "KS", "AR", "TN", "NC", "SC", "DC", "", ""],
  ["", "", "", "OK", "LA", "MS", "AL", "GA", "", "", ""],
  ["HI", "", "", "TX", "", "", "", "", "FL", "", ""],
]

const TOPICS: Record<string, string> = {
  contact_email: "Email address",
  contact_phone: "Phone number",
  name: "Name",
  free_text: "An open comment box",
  location: "ZIP code, county or city",
  postal_address: "Street address",
  source: "How they heard about the service",
  demographics: "Race, gender or faith",
  interest_type: "Fostering or adopting",
  contact_preference: "Best time or way to contact",
  date_of_birth: "Date of birth or age",
  housing: "Housing",
  consent_marketing: "Marketing opt-in",
  consent_contact: "Consent to be contacted",
  relationship_status: "Relationship status",
  household_members: "Who lives in the home",
  employment: "Work",
  income: "Income",
  language: "Language",
  readiness: "How soon they could start",
  child_preferences: "Children they could care for",
  education: "Education",
  criminal_history: "Criminal history",
  health: "Health",
  references: "References",
  motivation: "Why they want to foster or adopt",
  parenting_history: "Parenting history",
  background_check_consent: "Consent to background checks",
  transport: "Driving and vehicle",
  support_network: "Support network",
  relationship_history: "Earlier marriages",
  household_adults_checks: "Other adults in the home",
  substance_use: "Alcohol or drugs",
  parenting_approach: "Discipline and parenting",
  home_safety: "Home safety",
  prior_experience: "Earlier fostering",
}

const CONTACT = new Set(["name", "contact_email", "contact_phone", "postal_address", "location"])
const NOT_TOPICS = new Set(["other", "captcha", "privacy_ack"])

function shares(rows: Row[], key: string, skip: Set<string>): { of: number; topics: Share[] } {
  const by = new Map<string, Set<string>>()
  for (const r of rows) {
    if (skip.has(r.topic)) continue
    if (!by.has(r.topic)) by.set(r.topic, new Set())
    by.get(r.topic)!.add(r[key])
  }
  const of = new Set(rows.map((r) => r[key])).size
  const topics = [...by.entries()]
    .map(([t, s]) => ({ label: TOPICS[t] ?? t.replace(/_/g, " "), yes: s.size, of }))
    .sort((a, b) => b.yes - a.yes || a.label.localeCompare(b.label))
    .slice(0, 12)
  return { of, topics }
}

// First recorded number per state for a policy topic, for fostering.
function perState(policies: Row[], topic: string, units: string[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const p of policies) {
    if (p.topic !== topic || !p.value || !units.includes(p.unit)) continue
    if (!["fostering", "both"].includes(p.applies_to) || out.has(p.state_code)) continue
    out.set(p.state_code, p.unit === "months" ? Number(p.value) / 12 : Number(p.value))
  }
  return out
}

const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many)

export function usPicture(): UsPicture {
  const states = load("states.csv")
  const doors = load("front-doors.csv")
  const policies = load("policies.csv")
  const forms = load("application-forms.csv")
  const fq = load("form-questions.csv")
  const aq = load("application-questions.csv")
  const promises = load("response-promises.csv")
  const all = [states, doors, policies, forms, fq, aq, promises]

  const modelOf: Record<string, Tile["model"]> = {
    state_administered: "state",
    county_administered: "county",
    hybrid: "hybrid",
  }
  const admin = new Map(states.map((s) => [s.state_code, modelOf[s.administration] ?? "unknown"]))
  const perStateDoors = new Map<string, number>()
  for (const d of doors) perStateDoors.set(d.state_code, (perStateDoors.get(d.state_code) ?? 0) + 1)
  const tiles = TILES.map((row) =>
    row.map((code) => (code ? { code, model: admin.get(code) ?? "unknown", doors: perStateDoors.get(code) ?? 0 } : null)),
  )
  const modelCount = (m: Tile["model"]) => [...admin.values()].filter((v) => v === m).length

  const count = (rows: Row[], key: string, value: string) => rows.filter((r) => r[key] === value).length
  const opened = (r: Row) => r.evidence_level === "page_read" || r.evidence_level === "form_read"

  // Published reply times, one per front door (the quickest it states), in days.
  const quickest = new Map<string, number>()
  for (const p of promises) {
    if (!p.stated_hours) continue
    const days = Number(p.stated_hours) / 24
    quickest.set(p.front_door_id, Math.min(quickest.get(p.front_door_id) ?? Infinity, days))
  }

  const ages = perState(policies, "min_age", ["years"])
  const ageCounts = new Map<number, number>()
  for (const v of ages.values()) ageCounts.set(v, (ageCounts.get(v) ?? 0) + 1)

  const hours = [...perState(policies, "training_preservice", ["hours"]).values()]
  const bins: [number, number, string][] = [
    [0, 10, "Under 10 hours"],
    [10, 20, "10 to 19 hours"],
    [20, 30, "20 to 29 hours"],
    [30, 40, "30 to 39 hours"],
    [40, Infinity, "40 hours or more"],
  ]

  const terms = new Map<number, number>()
  for (const v of perState(policies, "licence_term", ["years", "months"]).values())
    terms.set(v, (terms.get(v) ?? 0) + 1)

  const evidenceRow = (label: string, rows: Row[]) => ({
    label,
    rows: rows.length,
    searchOnly: rows.filter((r) => r.evidence_level === "search_result" && r.verification !== "verified").length,
    opened: rows.filter((r) => opened(r) && r.verification !== "verified").length,
    verified: rows.filter((r) => r.verification === "verified").length,
  })

  return {
    jurisdictions: states.length,
    doors: doors.length,
    privateAgencies: doors.filter((d) => d.sector.startsWith("private") && d.contracted === "no").length,
    tribal: count(doors, "level", "tribal"),
    policies: policies.length,
    forms: forms.length,
    questions: fq.length + aq.length,
    questionForms: new Set(fq.map((q) => q.front_door_id)).size + new Set(aq.map((q) => q.form_id)).size,
    promises: quickest.size,
    pagesOpened: doors.filter(opened).length,
    verified: all.reduce((n, t) => n + t.filter((r) => r.verification === "verified").length, 0),
    totalRows: all.reduce((n, t) => n + t.length, 0),
    tiles,
    models: [
      { model: "state", label: "State-run", count: modelCount("state") },
      { model: "county", label: "County-run", count: modelCount("county") },
      { model: "hybrid", label: "Mixed state and county", count: modelCount("hybrid") },
    ],
    levels: [
      { label: "County", value: count(doors, "level", "county") },
      { label: "Regional", value: count(doors, "level", "regional") },
      { label: "Whole state", value: count(doors, "level", "state") },
      { label: "Tribal", value: count(doors, "level", "tribal") },
      { label: "City", value: count(doors, "level", "city") },
    ],
    sectors: [
      { label: "Public", value: count(doors, "sector", "public") },
      { label: "Private non-profit", value: count(doors, "sector", "private_nonprofit") },
      { label: "Tribal", value: count(doors, "sector", "tribal") },
      { label: "Private for-profit", value: count(doors, "sector", "private_for_profit") },
    ],
    enquiry: shares(fq, "front_door_id", NOT_TOPICS),
    application: shares(aq, "form_id", new Set([...NOT_TOPICS, ...CONTACT])),
    replyDays: [...quickest.values()].sort((a, b) => a - b),
    minAge: [...ageCounts.entries()].sort((a, b) => a[0] - b[0]).map(([a, n]) => ({ label: `${a} years`, value: n })),
    training: bins.map(([lo, hi, label]) => ({ label, value: hours.filter((h) => h >= lo && h < hi).length })),
    licenceTerm: [...terms.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([y, n]) => ({ label: `${y} ${plural(y, "year")}`, value: n })),
    evidence: [
      evidenceRow("Places to get in touch", doors),
      evidenceRow("State rules", policies),
      evidenceRow("Application forms", forms),
      evidenceRow("Form questions", [...fq, ...aq]),
    ],
  }
}
