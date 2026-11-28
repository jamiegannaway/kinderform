// The compare pages (/compare): tables of enquiry forms, US application forms and the rules
// on who can foster, for fostering and adoption services to compare their own with others.
//
// These pages name services and places. They hold facts only: what a form asks and what a
// rule says, with the link, the date the page gives and the date we checked. No scores and
// no rankings (CLAUDE.md, hard rule 5). Every row is unverified until a person has checked it.
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

import { isCountedQuestion, isKnownFollowUp, askedBy, loadCensus, parseCsv, type Census, type Row } from "@/lib/census"
import { APPLICATION_TOPICS } from "@/lib/applications"
import { TOPIC_ROWS } from "@/lib/countries"

const ROOT = resolve(process.cwd(), "..")
const read = (rel: string): Row[] => parseCsv(readFileSync(resolve(ROOT, rel), "utf-8"))

export const COUNTRY_NAMES: Record<string, string> = {
  UK: "United Kingdom",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IE: "Ireland",
  NL: "Netherlands",
  NZ: "New Zealand",
  SG: "Singapore",
  NO: "Norway",
  DK: "Denmark",
  SE: "Sweden",
  FI: "Finland",
}
export const COUNTRY_ORDER = ["UK", "US", "CA", "AU", "DE", "FR", "ES", "IE", "NL", "NZ", "SG", "NO", "DK", "SE", "FI"]

// "the UK, the US, Canada and Germany": the countries given, in the usual order.
export function countryList(codes: Iterable<string>): string {
  const have = new Set(codes)
  const names = COUNTRY_ORDER.filter((c) => have.has(c)).map((c) =>
    c === "UK" || c === "US" ? `the ${c}` : c === "NL" ? "the Netherlands" : COUNTRY_NAMES[c],
  )
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
}

// For running text: the list of countries while it is short, otherwise just the count, so a
// sentence stays under 25 words. Page descriptions keep the full list (see check-country-pages.mjs).
export function countriesInText(codes: Iterable<string>, most = 8): string {
  const n = new Set(codes).size
  return n > most ? `${n} countries` : countryList(codes)
}

// Place codes in the rules files, by country. Codes repeat across countries (NT is the Northwest
// Territories in Canada and the Northern Territory in Australia), so each country has its own list.
// US states come from register/us/states.csv.
const PLACES: Record<string, Record<string, string>> = {
  UK: { ENG: "England", WLS: "Wales", SCT: "Scotland", NIR: "Northern Ireland" },
  CA: {
    AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick", NL: "Newfoundland and Labrador",
    NS: "Nova Scotia", NT: "Northwest Territories", NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island",
    QC: "Quebec", SK: "Saskatchewan", YT: "Yukon",
  },
  AU: {
    NSW: "New South Wales", VIC: "Victoria", QLD: "Queensland", WA: "Western Australia", SA: "South Australia",
    TAS: "Tasmania", ACT: "Australian Capital Territory", NT: "Northern Territory",
  },
  DE: {
    DE: "All of Germany", BW: "Baden-Württemberg", BY: "Bavaria", BE: "Berlin", BB: "Brandenburg", HB: "Bremen",
    HH: "Hamburg", HE: "Hesse", MV: "Mecklenburg-Western Pomerania", NI: "Lower Saxony", NW: "North Rhine-Westphalia",
    RP: "Rhineland-Palatinate", SL: "Saarland", SN: "Saxony", ST: "Saxony-Anhalt", SH: "Schleswig-Holstein",
    TH: "Thuringia",
  },
  FR: {
    FR: "All of France", ARA: "Auvergne-Rhône-Alpes", BFC: "Bourgogne-Franche-Comté", BRE: "Brittany",
    CVL: "Centre-Val de Loire", COR: "Corsica", GES: "Grand Est", HDF: "Hauts-de-France", IDF: "Île-de-France",
    NOR: "Normandy", NAQ: "Nouvelle-Aquitaine", OCC: "Occitanie", PDL: "Pays de la Loire",
    PAC: "Provence-Alpes-Côte d'Azur", GP: "Guadeloupe", MQ: "Martinique", GF: "French Guiana", RE: "Réunion",
    YT: "Mayotte",
  },
  ES: {
    ES: "All of Spain", AN: "Andalusia", AR: "Aragon", AS: "Asturias", IB: "Balearic Islands", PV: "Basque Country",
    CN: "Canary Islands", CB: "Cantabria", CL: "Castile and León", CM: "Castilla-La Mancha", CT: "Catalonia",
    EX: "Extremadura", GA: "Galicia", RI: "La Rioja", MD: "Madrid", MC: "Murcia", NC: "Navarre",
    VC: "Valencian Community", CE: "Ceuta", ML: "Melilla",
  },
  // Rules in these countries are national.
  IE: { IE: "All of Ireland" },
  NL: { NL: "All of the Netherlands" },
  NZ: { NZ: "All of New Zealand" },
  SG: { SG: "Singapore" },
  NO: { NO: "All of Norway" },
  DK: { DK: "All of Denmark" },
  SE: { SE: "All of Sweden" },
  FI: { FI: "All of Finland" },
}

// ---- Page dates ------------------------------------------------------------------

// updated: the date the page gives ("" if none); from: where that came from; read: when we read
// the page for this; broken: the link did not work then (not found or gone).
export type PageDate = { updated: string; from: string; read: string; broken: boolean }

// register/page-dates.csv, built by tools/page_dates.py: the date each source page gives.
export function loadPageDates(): Map<string, PageDate> {
  const path = resolve(ROOT, "register/page-dates.csv")
  if (!existsSync(path)) return new Map()
  return new Map(
    read("register/page-dates.csv").map((r) => [
      r.url,
      { updated: r.page_updated, from: r.page_updated_from, read: r.date_read, broken: ["404", "410"].includes(r.status) },
    ]),
  )
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
// 2025-03-03 -> "3 Mar 2025"; 2025-03 -> "Mar 2025"; "" -> "".
export function shortDate(d: string): string {
  const m = d.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/)
  if (!m) return ""
  const month = MONTHS[Number(m[2]) - 1]
  return m[3] ? `${Number(m[3])} ${month} ${m[1]}` : `${month} ${m[1]}`
}

// ---- Enquiry forms ---------------------------------------------------------------

const SERVICE_TYPES: Record<string, string> = {
  regional_hub: "Council hub",
  single_authority: "Council",
  council: "Council",
  council_consortium: "Councils together",
  national_brand_council: "Council (national brand)",
  regional_service: "Regional service",
  regional_adoption_agency: "Regional adoption agency",
  voluntary_adoption_agency: "Voluntary adoption agency",
  independent_fostering_agency: "Independent agency",
  state_agency: "State or provincial agency",
  county_agency: "County agency",
  private_agency: "Private or non-profit agency",
  child_welfare_agency: "Child welfare agency",
  indigenous_agency: "Indigenous agency",
  local_authority: "Council or youth welfare office",
  voluntary_agency: "Non-profit agency",
}

// 1203 -> "1,203"; 11.66 stays "11.66"
const withCommas = (v: string) => v.replace(/^\d{4,}/, (n) => Number(n).toLocaleString("en-GB"))

const READ_FROM: Record<string, string> = {
  direct_fetch: "Read from the live page",
  index_snapshot: "Read from a search engine's copy",
  search_snippet: "Seen in a search result only",
  secondhand: "Described in another document",
  vendor_documentation: "From the supplier's documentation",
}

// What the Kinderform enquiry standard (schema/enquiry-submission.schema.json) leaves out on
// purpose, because a first reply does not need it. A form that asks these asks beyond the standard.
export const BEYOND_STANDARD = new Set([
  "Street address",
  "Date of birth or age",
  "Who lives in the home",
  "Spare bedroom or housing",
  "Work or income",
  "Ethnicity, gender, sexuality or faith",
  "Health or disability",
  "Criminal record",
  "Citizenship or residency",
  "An open comment box",
])

export type FormRow = {
  id: string
  country: string
  service: string
  area: string
  type: string
  stage: string
  link: string
  readFrom: string
  questions: number | null // null: the fields were not seen
  asks: string[]
  beyond: string[]
  reply: string // the reply time the page states, or ""
  replyChecked: boolean
  checked: string
  page: PageDate | null
}

export function formRows(c: Census, dates = loadPageDates()): FormRow[] {
  const asked = askedBy(c)
  const out: FormRow[] = []
  for (const f of c.forms) {
    // Application forms are on /compare/applications.
    if (f.operator_type === "platform_vendor" || f.form_stage === "application") continue
    const all = asked.get(f.form_id) ?? []
    const qs = all.filter((q) => isCountedQuestion(q))
    const seen = f.fields_observed !== "no" && all.length > 0
    const asks = seen ? TOPIC_ROWS.filter((t) => all.some(t.match)).map((t) => t.label) : []
    const rt = c.guidance.filter((g) => g.form_id === f.form_id && g.guidance_type === "response_time")
    const link = f.form_url || f.source_url
    out.push({
      id: f.form_id,
      country: f.country,
      service: f.name.replace(/\s+(enquiry|inquiry|enquiries)(\s+form)?$/i, ""),
      area: f.region,
      type: SERVICE_TYPES[f.operator_type] ?? f.operator_type,
      stage: f.form_stage === "primary" ? "First contact" : "After first contact",
      link,
      readFrom: READ_FROM[f.observed] ?? f.observed,
      questions: seen ? qs.length : null,
      asks,
      beyond: asks.filter((a) => BEYOND_STANDARD.has(a)),
      reply: rt.find((g) => g.present === "yes")?.value ?? "",
      replyChecked: rt.some((g) => g.present === "yes" || g.present === "no"),
      checked: f.date_checked,
      page: dates.get(link) ?? null,
    })
  }
  const order = (r: FormRow) => COUNTRY_ORDER.indexOf(r.country)
  return out.sort((a, b) => order(a) - order(b) || a.area.localeCompare(b.area) || a.service.localeCompare(b.service))
}

// ---- Rules -----------------------------------------------------------------------

export type TopicInfo = { code: string; label: string; covers: string; group: string }

// Plain names for each topic code in register/us/policy-topics.md.
const TOPIC_LABELS: Record<string, string> = {
  min_age: "Minimum age",
  max_age: "Upper age limit",
  relationship_status: "Single people and couples",
  nondiscrimination: "Non-discrimination",
  residency: "Where you live, and citizenship",
  language: "Language",
  education: "Education",
  income: "Income",
  employment: "Working while fostering",
  health: "Health and medical report",
  housing_tenure: "Renting or owning your home",
  bedroom_space: "Bedrooms and space",
  home_safety: "Home safety",
  firearms: "Firearms",
  smoking: "Smoking",
  pets: "Pets",
  transport: "Transport",
  capacity: "How many children in a home",
  background_checks: "Criminal record checks",
  child_abuse_registry: "Child abuse register checks",
  references: "References",
  home_study: "Assessment (home study)",
  training_preservice: "Training before approval",
  training_ongoing: "Training after approval",
  licence_type: "Types of approval or licence",
  licence_term: "How long approval lasts, and reviews",
  renewal: "Renewing approval",
  timeline: "How long approval takes",
  kinship: "Rules for relatives and friends",
  waivers: "Waivers",
  board_rate: "Allowance paid to carers",
  adoption_assistance: "Adoption support payments",
  fees: "Fees",
  other: "Other rules",
}

// Topics and their groups, read from the topic guide so there is one list for every country.
export function loadTopics(): TopicInfo[] {
  const md = readFileSync(resolve(ROOT, "register/us/policy-topics.md"), "utf-8")
  const out: TopicInfo[] = []
  let group = ""
  for (const line of md.split("\n")) {
    const h = line.match(/^## (.+)$/)
    if (h) group = h[1].trim()
    const m = line.match(/^\| `([a-z_]+)` \| (.+?) \|$/)
    if (m) out.push({ code: m[1], label: TOPIC_LABELS[m[1]] ?? m[1], covers: m[2], group })
  }
  return out
}

export type RuleRow = {
  id: string
  country: string
  place: string
  topic: string
  appliesTo: string
  summary: string
  value: string
  citation: string
  link: string
  sourceType: string
  checked: string
  page: PageDate | null
  notes: string
}

// How a rule's number reads: "21 years", "£208 a week", "CA$25.30 a day".
const MONEY: Record<string, [string, string]> = {
  gbp_per_week: ["£", "a week"],
  cad_per_day: ["CA$", "a day"],
  cad_per_month: ["CA$", "a month"],
  aud_per_fortnight: ["A$", "a fortnight"],
  aud_per_week: ["A$", "a week"],
  usd_per_month: ["US$", "a month"],
  usd_per_day: ["US$", "a day"],
  eur_per_month: ["€", "a month"],
  eur_per_week: ["€", "a week"],
  eur_per_day: ["€", "a day"],
  eur: ["€", ""],
  nzd_per_week: ["NZ$", "a week"],
  nzd_per_fortnight: ["NZ$", "a fortnight"],
  sgd_per_month: ["S$", "a month"],
  sgd: ["S$", ""],
  // Krone and krona: the currency code, as "kr" alone would not say which.
  nok_per_month: ["NOK ", "a month"],
  nok: ["NOK ", ""],
  dkk_per_month: ["DKK ", "a month"],
  dkk_per_day: ["DKK ", "a day"],
  dkk_per_year: ["DKK ", "a year"],
  dkk: ["DKK ", ""],
  sek_per_month: ["SEK ", "a month"],
}
const UNIT_WORDS: Record<string, string> = { working_days: "working days", square_feet: "sq ft", other: "" }
// "1 child", not "1 children".
const ONE: Record<string, string> = {
  years: "year", months: "month", weeks: "week", days: "day", "working days": "working day", hours: "hour",
  children: "child", people: "person", sessions: "session",
}
function valueText(v: string, unit: string): string {
  if (!v) return ""
  const u = unit.toLowerCase()
  const money = MONEY[u]
  if (money) return `${money[0]}${withCommas(v)} ${money[1]}`.trim()
  if (u === "percent") return `${v}%`
  const words = UNIT_WORDS[u] ?? u.replace(/_/g, " ")
  return `${v} ${Number(v) === 1 ? (ONE[words] ?? words) : words}`.trim()
}

export function ruleRows(dates = loadPageDates()): RuleRow[] {
  const states = new Map(read("register/us/states.csv").map((s) => [s.state_code, s.state_name]))
  const files: [string, string][] = [
    ["UK", "register/policies.csv"],
    ["US", "register/us/policies.csv"],
    ["CA", "register/ca/policies.csv"],
    ["AU", "register/au/policies.csv"],
    ["DE", "register/de/policies.csv"],
    ["FR", "register/fr/policies.csv"],
    ["ES", "register/es/policies.csv"],
    ["IE", "register/ie/policies.csv"],
    ["NL", "register/nl/policies.csv"],
    ["NZ", "register/nz/policies.csv"],
    ["SG", "register/sg/policies.csv"],
    ["NO", "register/no/policies.csv"],
    ["DK", "register/dk/policies.csv"],
    ["SE", "register/se/policies.csv"],
    ["FI", "register/fi/policies.csv"],
  ]
  const out: RuleRow[] = []
  for (const [country, rel] of files) {
    if (!existsSync(resolve(ROOT, rel))) continue
    for (const r of read(rel)) {
      const code = r.jurisdiction ?? r.state_code
      out.push({
        id: r.policy_id,
        country,
        place: (country === "US" ? states.get(code) : PLACES[country]?.[code]) ?? code,
        topic: r.topic,
        appliesTo: r.applies_to,
        summary: r.rule_summary,
        value: valueText(r.value, r.unit),
        citation: r.legal_citation,
        link: r.source_url,
        sourceType: r.source_type,
        checked: r.date_checked,
        page: dates.get(r.source_url) ?? null,
        notes: r.notes,
      })
    }
  }
  const order = (r: RuleRow) => COUNTRY_ORDER.indexOf(r.country)
  return out.sort((a, b) => order(a) - order(b) || a.place.localeCompare(b.place) || a.id.localeCompare(b.id))
}

// ---- Application forms -----------------------------------------------------------

export type ApplicationRow = {
  id: string
  country: string
  state: string // the US state, the UK nation, or the province, state or region
  body: string
  name: string
  step: string
  format: string
  licensed: boolean
  link: string
  checked: string
  page: PageDate | null
  questions: number | null // questions the person answers, where we have read them
  sensitive: string[] // sensitive topics it asks about (see src/lib/applications.ts)
}

const STEPS: Record<string, string> = {
  application: "Application",
  background_check: "Background check",
  medical: "Medical",
  references: "References",
  financial: "Financial",
  home_safety: "Home safety",
  home_study: "Home study",
  training: "Training",
  agreement: "Agreement",
  other: "Other",
}

// What we read of each application form in the census: how many questions, and which sensitive topics.
function readOf(c: Census, formId: string): Pick<ApplicationRow, "questions" | "sensitive"> {
  const qs = askedBy(c).get(formId)
  if (!qs?.length) return { questions: null, sensitive: [] }
  // The same questions as "What applications ask": not consent ticks, fields for staff, follow-up
  // questions or statements of what to attach.
  const answered = qs.filter(
    (q) => isCountedQuestion(q),
  )
  return {
    questions: answered.length,
    sensitive: APPLICATION_TOPICS.filter((t) => t.sensitive && answered.some(t.match)).map((t) => t.label),
  }
}

export function applicationRows(c: Census = loadCensus(), dates = loadPageDates()): ApplicationRow[] {
  const states = new Map(read("register/us/states.csv").map((s) => [s.state_code, s.state_name]))
  // Application forms outside the US, recorded in the census from the public documents.
  const uk: ApplicationRow[] = c.forms
    .filter((f) => f.form_stage === "application" && f.country !== "US")
    .map((f) => {
      const link = f.form_url || f.source_url
      return {
        id: f.form_id,
        country: f.country,
        state: f.region,
        body: f.name.split(": ")[0],
        name: f.name.split(": ").slice(1).join(": ") || "Application form",
        step: /registration of interest|expression of interest/i.test(f.name + " " + f.notes.slice(0, 200))
          ? "Registration of interest"
          : "Application",
        format: f.access_route === "online_form" ? "web" : f.access_route === "downloadable_form" ? "document" : "",
        licensed: /Licensed form/.test(f.notes),
        link,
        checked: f.date_checked,
        page: dates.get(link) ?? null,
        ...readOf(c, f.form_id),
      }
    })
  const us: ApplicationRow[] = read("register/us/application-forms.csv")
    .map((r) => {
      const link = r.url || r.source_url
      return {
        id: r.form_id,
        country: "US",
        state: states.get(r.state_code) ?? r.state_code,
        body: r.issuing_body,
        name: r.form_name + (r.form_number ? ` (${r.form_number})` : ""),
        step: STEPS[r.step] ?? r.step,
        format: r.format,
        licensed: r.licensed_instrument === "yes",
        link,
        checked: r.date_checked,
        page: dates.get(link) ?? null,
        ...readOf(c, r.form_id),
      }
    })
  const order = (r: ApplicationRow) => COUNTRY_ORDER.indexOf(r.country)
  return [...uk, ...us].sort(
    (a, b) => order(a) - order(b) || a.state.localeCompare(b.state) || a.name.localeCompare(b.name),
  )
}

// ---- Downloads -------------------------------------------------------------------

const cell = (v: unknown) => {
  const s = Array.isArray(v) ? v.join("; ") : v === null || v === undefined ? "" : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export function toCsv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((r) => r.map(cell).join(",")).join("\n") + "\n"
}
