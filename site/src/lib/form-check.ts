// Form check: what we can say about each primary form from the census.
// The draft partial score is computed at build time for private previews only.
// It is never written to the repository and never built into production.
import {
  askedBy,
  groupOf,
  guidanceFor,
  isReadable,
  type Census,
  type Group,
  type Row,
} from "@/lib/census"

// Rubric v0.1 domains (rubric/rubric.md). `seen` says whether the census can see it.
export const DOMAINS = [
  { id: "findability", name: "Findability and routing", weight: 10, seen: false,
    looks: "The form is easy to find, councils point to the right front door, and old forms are retired." },
  { id: "ease", name: "Ease of enquiring", weight: 15, seen: true,
    looks: "Six or fewer required questions, works on a phone, takes about two minutes." },
  { id: "minimisation", name: "Data minimisation and consent", weight: 15, seen: true,
    looks: "No health, criminal record, date of birth or other sensitive questions at first contact; newsletter opt-in separate and unticked; privacy notice at the form." },
  { id: "accessibility", name: "Accessibility", weight: 10, seen: true,
    looks: "An accessibility statement, clear labels, plain English, language options and a non-digital route." },
  { id: "expectations", name: "Setting expectations", weight: 15, seen: true,
    looks: "A concrete reply time, who will be in touch, and what happens next." },
  { id: "responsiveness", name: "Responsiveness", weight: 15, seen: false,
    looks: "How quickly people actually hear back. This needs data from services; a web page cannot show it." },
  { id: "channels", name: "Other ways to get in touch", weight: 5, seen: true,
    looks: "Phone with stated hours, call-back, chat, information sessions, a chance to speak to a carer." },
  { id: "inclusion", name: "Inclusion and openness", weight: 5, seen: true,
    looks: "Clear, welcoming answers on renting, being single, LGBTQ+ carers, work, disability and faith." },
  { id: "data_quality", name: "Data quality", weight: 10, seen: false,
    looks: "The service records arrival time, source and routing, with one written definition of an enquiry." },
] as const

export const CAPS = [
  "Questions about criminal convictions, health or other sensitive matters at first contact",
  "Newsletter or marketing consent made a condition of enquiring",
  "Conflicting phone numbers for the same front door",
  "An old form still live alongside the current one",
]

const SENSITIVE = new Set(["special_category", "criminal_offence", "immigration", "health_related"])

export type FormFacts = {
  form: Row
  group: Group
  questions: number
  required: number
  requiredKnown: boolean
  sensitive: string[] // short topic labels asked at first contact
  dateOfBirth: boolean
  spareRoom: boolean
  replyPromise: string | null // null = looked and none found
  replyChecked: boolean
  marketing: string // coded handling or "not checked"
  privacyNotice: "yes" | "no" | "not checked"
  whatNext: boolean
  accessibility: boolean | null
  channels: boolean | null
  inclusion: boolean | null
  legacy: boolean
}

export function factsFor(c: Census): FormFacts[] {
  const asked = askedBy(c)
  const tax = new Map(c.taxonomy.map((t) => [`${t.category}/${t.topic}`, t]))
  const out: FormFacts[] = []
  for (const f of c.forms) {
    const group = groupOf(f)
    if (!group || f.form_stage !== "primary" || !isReadable(f, asked)) continue
    const qs = (asked.get(f.form_id) ?? []).filter((q) => !q.conditional_on && q.category !== "consent")
    const all = asked.get(f.form_id) ?? []
    const g = guidanceFor(c, f.form_id)
    const has = (type: string) => g.filter((x) => x.guidance_type === type)
    const sensitive = new Set<string>()
    for (const q of all) {
      const t = tax.get(`${q.category}/${q.topic}`)
      if (t && SENSITIVE.has(t.sensitivity)) sensitive.add(t.description)
    }
    const rt = has("response_time")
    const mk = has("marketing_consent")
    const pn = has("privacy_notice_link")
    const flag = (type: string) => (has(type).length ? has(type).some((x) => x.present === "yes") : null)
    out.push({
      form: f,
      group,
      questions: qs.length,
      required: qs.filter((q) => q.required === "yes").length,
      requiredKnown: qs.some((q) => q.required === "yes"),
      sensitive: [...sensitive],
      dateOfBirth: all.some((q) => q.topic === "date_of_birth" && !q.conditional_on),
      spareRoom: all.some((q) => q.topic === "spare_bedroom"),
      replyPromise: rt.find((x) => x.present === "yes")?.value || null,
      replyChecked: rt.length > 0,
      marketing: mk[0]?.value || (mk.length ? "none" : "not checked"),
      privacyNotice: pn.length ? (pn.some((x) => x.present === "yes") ? "yes" : "no") : "not checked",
      whatNext: has("what_happens_next").some((x) => x.present === "yes"),
      accessibility: flag("accessibility_statement"),
      channels: flag("alternative_contact") ?? flag("opening_hours"),
      inclusion: flag("eligibility"),
      legacy: f.form_id.includes("legacy"),
    })
  }
  return out
}

export type Scored = FormFacts & {
  score: number
  capped: string[]
  domains: { id: string; points: number }[]
  assessedWeight: number
}

const clamp = (n: number) => Math.max(0, Math.min(3, n))

// Draft partial score: rubric v0.1 domains the census can see, scaled to 100.
export function score(x: FormFacts): Scored {
  const d: { id: string; s: number | null }[] = []
  const n = x.requiredKnown ? x.required : x.questions
  d.push({ id: "ease", s: n <= 6 ? 3 : n <= 8 ? 2 : n <= 11 ? 1 : 0 })
  let m = 3
  if (x.dateOfBirth) m -= 1
  m -= x.sensitive.length
  if (["bundled_on_submit", "required_choice", "required_checkbox_ambiguous"].includes(x.marketing)) m -= 1
  if (x.privacyNotice === "no") m -= 1
  d.push({ id: "minimisation", s: clamp(m) })
  d.push({ id: "expectations", s: x.replyChecked || x.whatNext ? clamp((x.replyPromise ? 2 : 0) + (x.whatNext ? 1 : 0)) : null })
  d.push({ id: "accessibility", s: x.accessibility === null ? null : x.accessibility ? 2 : 0 })
  d.push({ id: "channels", s: x.channels === null ? null : x.channels ? 3 : 0 })
  d.push({ id: "inclusion", s: x.inclusion === null ? null : x.inclusion ? 2 : 0 })

  let got = 0
  let weight = 0
  const domains: { id: string; points: number }[] = []
  for (const { id, s } of d) {
    if (s === null) continue
    const w = DOMAINS.find((z) => z.id === id)!.weight
    weight += w
    got += (w * s) / 3
    domains.push({ id, points: Math.round((w * s) / 3) })
  }
  let total = weight ? Math.round((got / weight) * 100) : 0
  const capped: string[] = []
  if (x.sensitive.some((s) => /criminal|health|disability/i.test(s))) capped.push("Sensitive questions at first contact")
  if (x.marketing === "bundled_on_submit") capped.push("Newsletter sign-up bundled into enquiring")
  if (x.legacy) capped.push("Old form still live")
  if (capped.length) total = Math.min(total, 50)
  return { ...x, score: total, capped, domains, assessedWeight: weight }
}

// Only forms read directly from the live page are ranked. Forms seen through a
// search copy or a description are listed, unranked, until someone checks them.
export type Ranking = { ranked: Scored[]; unranked: Scored[] }

export function ranked(c: Census): Record<Group, Ranking> {
  const out = {} as Record<Group, Ranking>
  for (const s of factsFor(c).map(score)) {
    const r = (out[s.group] ??= { ranked: [], unranked: [] })
    ;(s.form.observed === "direct_fetch" ? r.ranked : r.unranked).push(s)
  }
  for (const r of Object.values(out)) {
    r.ranked.sort((a, b) => b.score - a.score || a.form.name.localeCompare(b.form.name))
    r.unranked.sort((a, b) => a.form.name.localeCompare(b.form.name))
  }
  return out
}

// Pattern counts for the public page. No names.
export function patterns(c: Census) {
  const facts = factsFor(c)
  const primaryChecked = c.forms.filter((f) => f.form_stage === "primary").map((f) => f.form_id)
  const rtRows = c.guidance.filter((g) => g.guidance_type === "response_time" && primaryChecked.includes(g.form_id))
  const rtForms = new Set(rtRows.map((g) => g.form_id))
  const rtYes = new Set(rtRows.filter((g) => g.present === "yes").map((g) => g.form_id))
  return {
    readable: facts.length,
    sensitive: facts.filter((x) => x.sensitive.length || x.dateOfBirth).length,
    spareRoom: facts.filter((x) => x.spareRoom).length,
    replyChecked: rtForms.size,
    replyStated: rtYes.size,
    byGroup: Object.fromEntries(
      (["Councils and hubs", "Independent agencies", "Adoption agencies"] as Group[]).map((g) => {
        const xs = facts.filter((x) => x.group === g)
        return [
          g,
          {
            n: xs.length,
            medianQuestions: median(xs.map((x) => x.questions)),
            sensitive: xs.filter((x) => x.sensitive.length || x.dateOfBirth).length,
            spareRoom: xs.filter((x) => x.spareRoom).length,
          },
        ]
      }),
    ) as Record<Group, { n: number; medianQuestions: number; sensitive: number; spareRoom: number }>,
  }
}

function median(xs: number[]): number {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

export function coverage(c: Census) {
  const rows = new Map<string, { country: string; region: string; primary: number; read: number }>()
  const asked = askedBy(c)
  for (const f of c.forms) {
    if (f.form_stage !== "primary" || f.operator_type === "platform_vendor") continue
    const k = `${f.country}|${f.region}`
    const r = rows.get(k) ?? { country: f.country, region: f.region, primary: 0, read: 0 }
    r.primary++
    if (isReadable(f, asked)) r.read++
    rows.set(k, r)
  }
  return [...rows.values()].sort((a, b) => a.country.localeCompare(b.country) || a.region.localeCompare(b.region))
}
