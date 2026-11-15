// "How first-contact forms differ" on /research: the census as evidence, with no names.
//
// What leaves this file is numbers and group labels only. No form name, ID, URL or
// nation is passed to the page, and each measure is given on its own, so a reader
// cannot line up one form's answers across measures and recognise it. Services see
// their own rows privately first (census/README.md, rule 5).
//
// Only forms read straight from the live page are counted. Forms seen through a
// search engine's copy or a description are left out until someone checks them.
import { GROUPS, type Census, type Group } from "@/lib/census"
import { factsFor } from "@/lib/form-check"

export type Meter = { group: Group; yes: number; of: number }
export type Measure = { id: string; label: string; note: string; rows: Meter[] }
export type FormsDiffer = {
  read: number // forms counted here
  leftOut: number // readable forms left out because they were not read from the live page
  checked: string // ISO date of the latest direct read
  questions: { group: Group; values: number[] }[] // one number per form, sorted
  measures: Measure[]
}

// Newsletter handling the person cannot skip: a required yes or no, a required tick
// box, or a sign-up that comes with sending the form.
const CANNOT_SKIP = new Set(["required_choice", "required_checkbox_ambiguous", "bundled_on_submit"])

// Short plain names for the taxonomy descriptions that read awkwardly in a list.
const SHORT: Record<string, string> = {
  "Immigration status or right to remain": "right to remain",
  "Whether the enquirer is a British citizen": "citizenship",
}
const short = (s: string) => SHORT[s] ?? s.charAt(0).toLowerCase() + s.slice(1)

function list(xs: string[]): string {
  if (xs.length < 2) return xs.join("")
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`
}

// "1 working day; visit within 5 working days" -> "1 working day"
const firstReply = (v: string) => v.split(";")[0].trim().replace(/(\d)-(\d)/, "$1 to $2")

function daysOf(v: string): number {
  const n = Number(v.match(/\d+/)?.[0] ?? NaN)
  return /working/.test(v) ? n * 1.4 : n
}

export function formsDiffer(c: Census): FormsDiffer {
  const all = factsFor(c)
  const facts = all.filter((x) => x.form.observed === "direct_fetch")
  const by = (g: Group) => facts.filter((x) => x.group === g)
  const groups = GROUPS.filter((g) => by(g).length > 0)

  const meter = (test: (x: (typeof facts)[number]) => boolean | null): Meter[] =>
    groups.map((g) => {
      const judged = by(g)
        .map(test)
        .filter((v): v is boolean => v !== null)
      return { group: g, yes: judged.filter(Boolean).length, of: judged.length }
    })

  const sensitiveTopics = [...new Set(facts.flatMap((x) => [...(x.dateOfBirth ? ["Date of birth"] : []), ...x.sensitive]))]
  const replies = [...new Set(facts.map((x) => x.replyPromise).filter((v): v is string => !!v).map(firstReply))].sort(
    (a, b) => daysOf(a) - daysOf(b),
  )
  const replyNote =
    replies.length > 1
      ? `Where a time was given, it ranged from ${replies[0]} to ${replies[replies.length - 1]}.`
      : replies.length === 1
        ? `Where a time was given, it was ${replies[0]}.`
        : "None of the forms we checked gave a time."

  return {
    read: facts.length,
    leftOut: all.length - facts.length,
    checked: facts.map((x) => x.form.date_checked).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().at(-1) ?? "",
    questions: groups.map((g) => ({ group: g, values: by(g).map((x) => x.questions).sort((a, b) => a - b) })),
    measures: [
      {
        id: "spare-room",
        label: "Ask about a spare room",
        note: "Asked before anyone from the service has spoken to the person.",
        rows: meter((x) => x.spareRoom),
      },
      {
        id: "sensitive",
        label: "Ask a sensitive question",
        note: sensitiveTopics.length
          ? `The questions were about ${list(sensitiveTopics.map(short))}.`
          : "None of these forms asked one.",
        rows: meter((x) => x.sensitive.length > 0 || x.dateOfBirth),
      },
      {
        id: "reply-time",
        label: "Say when you will hear back",
        note: replyNote,
        rows: meter((x) => (x.replyChecked ? x.replyPromise !== null : null)),
      },
      {
        id: "newsletter",
        label: "Ask about newsletters in a way you cannot skip",
        note: "A required yes or no, a required tick box, or a sign-up that comes with sending the form.",
        rows: meter((x) => (x.marketing === "not checked" ? null : CANNOT_SKIP.has(x.marketing))),
      },
    ],
  }
}
