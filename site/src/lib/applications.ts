// "What applications ask" on /research: what services ask at first contact against what they ask in
// the application that follows, topic by topic, for each country with application forms in the
// census (form_stage "application"; see tools/applications_to_census.py).
//
// What leaves this file is numbers, country names and topic labels only. No form, service or URL.
// First-contact forms are counted the same way as "What enquiry forms ask": forms read straight
// from the live page. A US application is a packet: the documents one service (a state, a county or a
// tribe) gives applicants, taken together. Every figure is unverified until a person has checked the rows.
import { askedBy, type Census, type Row } from "@/lib/census"
import { factsFor } from "@/lib/form-check"
import { COUNTRIES } from "@/lib/countries"

// Topics in reading order. Sensitive ones are the questions our draft checklist says should wait
// until after a conversation.
export const APPLICATION_TOPICS: { label: string; match: (q: Row) => boolean; sensitive?: boolean }[] = [
  { label: "Name", match: (q) => q.topic === "name" },
  { label: "Email or phone", match: (q) => q.topic === "email" || q.topic === "phone" },
  { label: "Street address", match: (q) => q.topic === "address" || q.topic === "address_history" },
  { label: "Date of birth or age", match: (q) => q.topic === "date_of_birth" || q.topic === "age", sensitive: true },
  { label: "ID numbers, such as a social security number", match: (q) => q.topic === "id_number", sensitive: true },
  { label: "Who lives in the home", match: (q) => ["household_composition", "children_in_household", "partner", "partner_details", "partner_date_of_birth"].includes(q.topic) },
  { label: "Past partners or marriages", match: (q) => q.topic === "previous_partners", sensitive: true },
  { label: "Work or income", match: (q) => q.category === "work" },
  { label: "Bedrooms or housing", match: (q) => q.topic === "spare_bedroom" || q.topic === "tenure" },
  { label: "Home safety", match: (q) => q.topic === "home_safety" || q.topic === "firearms" },
  { label: "Health or disability", match: (q) => q.category === "health", sensitive: true },
  { label: "Criminal record", match: (q) => q.category === "criminal_record", sensitive: true },
  { label: "Past contact with child protection", match: (q) => q.category === "prior_involvement", sensitive: true },
  { label: "Ethnicity, gender or faith", match: (q) => q.category === "equality", sensitive: true },
  { label: "Which children they could care for", match: (q) => q.topic === "child_preferences" },
  { label: "Parenting and discipline", match: (q) => q.topic === "parenting_approach" },
  { label: "Why they want to do this", match: (q) => q.topic === "motivation" },
  { label: "Referees", match: (q) => q.category === "references" },
]

type Share = { yes: number; of: number }
export type StageCountry = {
  code: string
  name: string
  first: number // first-contact forms counted
  apps: number // applications counted
  unit: string // what one application is ("forms", "packets")
  firstMedian: number
  appMedian: number
  topics: { label: string; sensitive: boolean; first: Share; app: Share }[]
  sensitiveFirst: Share // first-contact forms asking any sensitive topic
  sensitiveApp: Share
}
export type ApplicationsData = { countries: StageCountry[]; appForms: number; appQuestions: number; unclassified: number }

const median = (xs: number[]) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

// Questions the person answers: not consent ticks, not fields for staff.
const answered = (q: Row) => q.category !== "consent" && q.category !== "staff_recorded" && !q.conditional_on

export function applications(c: Census): ApplicationsData {
  const asked = askedBy(c)
  const appForms = c.forms.filter((f) => f.form_stage === "application" && f.fields_observed !== "no")
  const appQs = appForms.flatMap((f) => (asked.get(f.form_id) ?? []).filter(answered))
  const out: StageCountry[] = []
  for (const { code, name } of COUNTRIES) {
    const mine = appForms.filter((f) => f.country === code)
    if (!mine.length) continue
    // A US application is a packet of documents from one service: count the packet once.
    const byPacket = code === "US"
    const packetOf = (f: Row) => `${f.region}|${f.name.split(": ")[0]}`
    const groups = new Map<string, Row[]>()
    for (const f of mine) {
      const key = byPacket ? packetOf(f) : f.form_id
      groups.set(key, [...(groups.get(key) ?? []), ...(asked.get(f.form_id) ?? []).filter(answered)])
    }
    // A US packet counts only if it includes an application form, not just a medical or
    // background-check form, and gives enough questions to describe.
    const isApplication = (key: string) =>
      !byPacket || mine.some((f) => packetOf(f) === key && /packet \(application\)/.test(f.notes))
    const units = [...groups.entries()]
      .filter(([key, qs]) => isApplication(key) && qs.length >= 3)
      .map(([, qs]) => qs)
    if (!units.length) continue
    const first = factsFor(c, [code], true).filter((f) => f.form.observed === "direct_fetch")
    const firstQs = first.map((f) => (asked.get(f.form.form_id) ?? []).filter(answered))
    const share = (sets: Row[][], match: (q: Row) => boolean): Share => ({
      yes: sets.filter((qs) => qs.some(match)).length,
      of: sets.length,
    })
    const anySensitive = (q: Row) => APPLICATION_TOPICS.some((t) => t.sensitive && t.match(q))
    out.push({
      code,
      name,
      first: first.length,
      apps: units.length,
      unit: byPacket ? "packets" : "forms",
      firstMedian: median(first.map((f) => f.questions)),
      appMedian: median(units.map((qs) => qs.length)),
      topics: APPLICATION_TOPICS.map((t) => ({
        label: t.label,
        sensitive: !!t.sensitive,
        first: share(firstQs, t.match),
        app: share(units, t.match),
      })),
      sensitiveFirst: share(firstQs, anySensitive),
      sensitiveApp: share(units, anySensitive),
    })
  }
  return {
    countries: out,
    appForms: appForms.length,
    appQuestions: appQs.length,
    unclassified: appQs.filter((q) => q.topic === "unclassified").length,
  }
}
