// The research log: each piece of research the project has done, and what it could mean
// for our work. It is read from evidence/research-log.json, so a merge updates the page.
import logFile from "../../../evidence/research-log.json"
import { hrefOf } from "@/lib/research"

export type LogEntry = {
  id: string
  date: string
  title: string
  href: string
  question: string
  lookedAt: string[]
  how: string
  checked: string
  learned: string[]
}

export type Kind = "keep" | "tighten" | "change" | "add" | "avoid" | "test"

export type Meaning = {
  id: string
  part: string
  kind: Kind
  idea: string
  why: string
  from: { id: string; title: string; href: string }[]
}

export const KIND_LABEL: Record<Kind, string> = {
  keep: "Keep",
  tighten: "Tighten",
  change: "Change",
  add: "Add",
  avoid: "Do not use",
  test: "Test",
}

export function researchLog() {
  const entries: LogEntry[] = logFile.entries
    .map((e) => ({
      id: e.id,
      date: e.date,
      title: e.title,
      href: hrefOf(e.report.replace(/\.md$/, "")),
      question: e.question,
      lookedAt: e.looked_at,
      how: e.how,
      checked: e.checked,
      learned: e.learned,
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
  const byId = new Map(entries.map((e) => [e.id, e]))
  const meanings: Meaning[] = logFile.meanings.map((m) => ({
    id: m.id,
    part: m.part,
    kind: m.kind as Kind,
    idea: m.idea,
    why: m.why,
    from: m.from.map((id) => {
      const e = byId.get(id)
      if (!e) throw new Error(`evidence/research-log.json "${m.id}": "${id}" is not an entry.`)
      return { id, title: e.title, href: e.href }
    }),
  }))
  return { updated: logFile.updated, about: logFile.about, entries, meanings }
}

// The short text for a report's card on /research comes from its entry in the log.
export function blurbFor(reportId: string): string | undefined {
  const e = logFile.entries.find((x) => x.report === `${reportId}.md`)
  return e ? `${e.question} ${e.checked}` : undefined
}
