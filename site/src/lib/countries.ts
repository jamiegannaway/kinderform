// "Across countries" on /research: first-contact forms in the UK, the US, Canada, Australia,
// Germany, France and Spain, measured the same way, with no names. A country shows only once
// the census holds forms for it.
//
// What leaves this file is numbers, country names and topic labels only. No form,
// service or URL is passed to the page. Only forms read straight from the live page
// are counted (observed = direct_fetch), the same rule as "How first-contact forms
// differ". Every figure is unverified until a person has checked the rows.
import { askedBy, type Census, type Row } from "@/lib/census"
import { factsFor, type FormFacts } from "@/lib/form-check"
import { isSensitive } from "@/lib/sensitive"

export const COUNTRIES = [
  { code: "UK", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
] as const
export type CountryCode = (typeof COUNTRIES)[number]["code"]

// Kinds of answer a question asks for, from the input type on the page.
export const ANSWER_KINDS = [
  { key: "typed", label: "Typed answer", types: ["text", "email", "tel", "textarea"] },
  { key: "pick", label: "Pick one", types: ["select", "radio"] },
  { key: "tick", label: "Tick boxes", types: ["checkbox"] },
  { key: "date", label: "Date", types: ["date", "calendar"] },
  { key: "unknown", label: "Not shown", types: ["unknown", "statement"] },
] as const
export type AnswerKind = (typeof ANSWER_KINDS)[number]["key"]

// Topics shown in the "what forms ask" grid, in reading order.
export const TOPIC_ROWS: { label: string; match: (q: Row) => boolean; sensitive?: boolean }[] = [
  { label: "Name", match: (q) => q.topic === "name" },
  { label: "Email address", match: (q) => q.topic === "email" },
  { label: "Phone number", match: (q) => q.topic === "phone" },
  { label: "Postcode or ZIP code", match: (q) => q.topic === "postcode" },
  { label: "Street address", match: (q) => q.topic === "address" },
  { label: "Date of birth or age", match: (q) => q.topic === "date_of_birth" || q.topic === "age", sensitive: true },
  { label: "How they heard about the service", match: (q) => q.category === "source" },
  { label: "Fostering, adoption or type of care", match: (q) => q.category === "interest" },
  { label: "Who lives in the home", match: (q) => ["household_composition", "children_in_household", "partner", "partner_details", "partner_date_of_birth"].includes(q.topic) },
  { label: "Spare bedroom or housing", match: (q) => q.category === "housing" },
  { label: "Work or income", match: (q) => q.category === "work" },
  { label: "Ethnicity, gender, sexuality or faith", match: (q) => q.category === "equality", sensitive: true },
  { label: "Health or disability", match: (q) => q.category === "health", sensitive: true },
  { label: "Criminal record", match: (q) => q.category === "criminal_record", sensitive: true },
  { label: "Citizenship or residency", match: (q) => q.topic === "citizenship" || q.topic === "residency", sensitive: true },
  { label: "An open comment box", match: (q) => q.category === "free_text" },
  { label: "Newsletter opt-in", match: (q) => q.topic === "marketing" },
]

export type CountryStats = {
  code: CountryCode
  name: string
  forms: number // forms counted
  questions: number[] // questions per form, sorted
  median: number
  answerKinds: Record<AnswerKind, number> // questions of each kind, all forms together
  totalQuestions: number
  required: { yes: number; of: number } // questions marked required, on forms that mark any
  topics: { label: string; yes: number; of: number; sensitive: boolean }[]
  asksSensitive: number // forms asking a sensitive question (src/lib/sensitive.ts)
  reply: { stated: number; of: number } // forms that state a reply time, of those checked
  replyRange: string[] // the reply times stated, quickest first
}

export type CountriesData = {
  countries: CountryStats[] // only countries with at least one form
  allForms: number
  allMedian: number
  shortest: number
  longest: number
  asksSensitive: { yes: number; of: number }
  reply: { yes: number; of: number }
  checked: string // latest date a form was read
}

const median = (xs: number[]) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }
const hours = (v: string) => {
  const word = v.toLowerCase().match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/)?.[1]
  const n = Number(v.match(/\d+/)?.[0] ?? (word ? WORDS[word] : NaN))
  if (/hour/.test(v)) return n
  if (/week/.test(v)) return n * 168
  return n * (/working|business/.test(v) ? 34 : 24)
}

export function countries(c: Census): CountriesData {
  const asked = askedBy(c)
  // The site's one definition of a sensitive question (src/lib/sensitive.ts).
  const asksSensitive = (formId: string) => (asked.get(formId) ?? []).some((q) => !q.conditional_on && isSensitive(q))
  const facts = factsFor(c, COUNTRIES.map((x) => x.code), true).filter((f) => f.form.observed === "direct_fetch")
  const stats: CountryStats[] = []
  for (const { code, name } of COUNTRIES) {
    const mine: FormFacts[] = facts.filter((f) => f.form.country === code)
    if (!mine.length) continue
    const qs = mine.flatMap((f) => (asked.get(f.form.form_id) ?? []).filter((q) => !q.conditional_on))
    const kinds = Object.fromEntries(ANSWER_KINDS.map((k) => [k.key, 0])) as Record<AnswerKind, number>
    for (const q of qs) {
      const kind = ANSWER_KINDS.find((k) => (k.types as readonly string[]).includes(q.input_type))?.key ?? "unknown"
      kinds[kind]++
    }
    const marking = mine.filter((f) => f.requiredKnown)
    const markingQs = marking.flatMap((f) => (asked.get(f.form.form_id) ?? []).filter((q) => q.category !== "consent"))
    const replyChecked = mine.filter((f) => f.replyChecked)
    const replies = [...new Set(mine.map((f) => f.replyPromise).filter((v): v is string => !!v))].sort(
      (a, b) => hours(a) - hours(b),
    )
    stats.push({
      code,
      name,
      forms: mine.length,
      questions: mine.map((f) => f.questions).sort((a, b) => a - b),
      median: median(mine.map((f) => f.questions)),
      answerKinds: kinds,
      totalQuestions: qs.length,
      required: { yes: markingQs.filter((q) => q.required === "yes").length, of: markingQs.length },
      topics: TOPIC_ROWS.map((t) => ({
        label: t.label,
        yes: mine.filter((f) => (asked.get(f.form.form_id) ?? []).some(t.match)).length,
        of: mine.length,
        sensitive: !!t.sensitive,
      })),
      asksSensitive: mine.filter((f) => asksSensitive(f.form.form_id)).length,
      reply: { stated: replyChecked.filter((f) => f.replyPromise).length, of: replyChecked.length },
      replyRange: replies,
    })
  }
  const all = facts.map((f) => f.questions)
  const replyChecked = facts.filter((f) => f.replyChecked)
  return {
    countries: stats,
    allForms: facts.length,
    allMedian: median(all),
    shortest: all.length ? Math.min(...all) : 0,
    longest: all.length ? Math.max(...all) : 0,
    asksSensitive: { yes: facts.filter((f) => asksSensitive(f.form.form_id)).length, of: facts.length },
    reply: { yes: replyChecked.filter((f) => f.replyPromise).length, of: replyChecked.length },
    checked: facts.map((f) => f.form.date_checked).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().at(-1) ?? "",
  }
}
