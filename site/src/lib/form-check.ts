// Form check: what we can say about each primary form from the census.
// The draft partial score is computed only for explicitly enabled local review.
// It is never written to the repository or included in a static build.
import {
  askedBy,
  groupOf,
  guidanceFor,
  isReadable,
  formKey,
  uniqueForms,
  isCountedQuestion,
  hasUnknownBranching,
  type Census,
  type Group,
  type Row,
} from "@/lib/census"
import { isSensitive } from "@/lib/sensitive"

// Rubric v0.1 domains (rubric/rubric.md). `seen` says whether the census can see it.
export const DOMAINS = [
  { id: "findability", name: "Finding the form and the right service", weight: 10, seen: false,
    looks: "The form is easy to find, and old forms are taken down. Councils point people to the right place to get in touch." },
  { id: "ease", name: "Easy to enquire", weight: 15, seen: true,
    looks: "The form has no more than 6 required questions, works on a phone and takes about 2 minutes." },
  { id: "minimisation", name: "Personal details and consent", weight: 15, seen: true,
    looks: "No questions about health, criminal record, date of birth or other sensitive matters when someone first enquires. Any newsletter sign-up is separate and not already ticked, and the form links to its privacy notice." },
  { id: "accessibility", name: "Accessibility", weight: 10, seen: true,
    looks: "An accessibility statement, clear labels, plain English, a choice of languages and a way to enquire without going online." },
  { id: "expectations", name: "Saying what happens next", weight: 15, seen: true,
    looks: "A specific time for the first reply, who will be in touch, and what happens next." },
  { id: "responsiveness", name: "How quickly people hear back", weight: 15, seen: false,
    looks: "How quickly people really get a first reply. This needs data from services, because a web page cannot show it." },
  { id: "channels", name: "Other ways to get in touch", weight: 5, seen: true,
    looks: "A phone line with its opening hours, call-backs, chat, information sessions and a chance to talk to a carer." },
  { id: "inclusion", name: "Inclusion and openness", weight: 5, seen: true,
    looks: "Clear, welcoming answers about renting, being single, LGBTQ+ carers, work, disability and faith." },
  { id: "data_quality", name: "Keeping good records", weight: 10, seen: false,
    looks: "The service records when each enquiry arrived, where it came from and where it was sent. It has one written definition of an enquiry." },
] as const

export const CAPS = [
  "Asking about criminal convictions or health, including disability, when someone first enquires",
  "Making people agree to a newsletter or marketing before they can enquire",
  "Conflicting phone numbers for the same place to get in touch",
  "An old form still online next to the current one",
]

export type FormFacts = {
  form: Row
  group: Group
  locations: number // source service-location entries sharing this form URL
  branchingUnknownQuestions: number
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

// Forms written by tools/crawl_to_census.py carry this note.
export const CRAWLER_NOTE = "Read by the polite crawler"

// UK only, and the forms a person recorded, by default: the rubric and the named draft scores
// were written from those. "How UK enquiry forms differ" also passes the crawler's UK forms,
// and the comparison across countries passes all four countries and the crawler's forms.
export function factsFor(c: Census, countries: string[] = ["UK"], includeCrawler = false): FormFacts[] {
  const asked = askedBy(c)
  const tax = new Map(c.taxonomy.map((t) => [`${t.category}/${t.topic}`, t]))
  const out: FormFacts[] = []
  const eligible = c.forms.filter((f) => groupOf(f) && countries.includes(f.country) && isReadable(f, asked) &&
    (includeCrawler || !f.notes.startsWith(CRAWLER_NOTE)))
  for (const f of uniqueForms(eligible)) {
    const group = groupOf(f)!
    const qs = (asked.get(f.form_id) ?? []).filter(isCountedQuestion)
    const g = guidanceFor(c, f.form_id)
    const has = (type: string) => g.filter((x) => x.guidance_type === type)
    const sensitive = new Set<string>()
    for (const q of qs.filter(isSensitive)) {
      const t = tax.get(`${q.category}/${q.topic}`)
      sensitive.add(t?.description ?? q.topic)
    }
    const rt = has("response_time")
    const mk = has("marketing_consent")
    const pn = has("privacy_notice_link")
    const flag = (type: string): boolean | null => {
      const rows = has(type)
      if (rows.some((x) => x.present === "yes")) return true
      return rows.some((x) => x.present === "no") ? false : null
    }
    out.push({
      form: f,
      group,
      locations: eligible.filter((row) => formKey(row) === formKey(f)).length,
      branchingUnknownQuestions: qs.filter(hasUnknownBranching).length,
      questions: qs.length,
      required: qs.filter((q) => q.required === "yes").length,
      requiredKnown: qs.some((q) => q.required === "yes"),
      sensitive: [...sensitive],
      dateOfBirth: qs.some((q) => q.topic === "date_of_birth"),
      spareRoom: qs.some((q) => q.topic === "spare_bedroom"),
      replyPromise: rt.find((x) => x.present === "yes")?.value || null,
      replyChecked: rt.some((x) => x.present === "yes" || x.present === "no"),
      marketing: mk.find((x) => x.present === "yes")?.value || (mk.some((x) => x.present === "no") ? "none" : "not checked"),
      privacyNotice: pn.some((x) => x.present === "yes") ? "yes" : pn.some((x) => x.present === "no") ? "no" : "not checked",
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
  if (x.sensitive.some((s) => /criminal|health|disability/i.test(s))) capped.push("Asks sensitive questions")
  if (x.marketing === "bundled_on_submit") capped.push("Enquiring signs you up to a newsletter")
  if (x.legacy) capped.push("Old form still online")
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

// Pattern counts for the public page. No names. Every count uses the same forms: the UK forms a
// person recorded, which the checklist was written from. "Sensitive" is the site's one definition
// (src/lib/sensitive.ts).
export function patterns(c: Census) {
  const facts = factsFor(c)
  const sensitive = (x: FormFacts) => x.sensitive.length > 0
  const checked = facts.filter((x) => x.replyChecked)
  return {
    readable: facts.length,
    sensitive: facts.filter(sensitive).length,
    spareRoom: facts.filter((x) => x.spareRoom).length,
    replyChecked: checked.length,
    replyStated: checked.filter((x) => x.replyPromise).length,
    byGroup: Object.fromEntries(
      (["Councils and hubs", "Independent agencies", "Adoption agencies"] as Group[]).map((g) => {
        const xs = facts.filter((x) => x.group === g)
        return [
          g,
          {
            n: xs.length,
            medianQuestions: median(xs.map((x) => x.questions)),
            sensitive: xs.filter(sensitive).length,
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
