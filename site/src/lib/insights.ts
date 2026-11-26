// "For services" (/for-services): what our reading of public forms and published research could mean
// for a fostering or adoption service, with one thing to try for each.
//
// What leaves this file is numbers, country names, topic labels and links to sources. No form,
// service or URL from the census is passed to the page, and nothing is scored or ranked (CLAUDE.md,
// hard rules 3 and 5). The named facts for each form are on /compare. Every figure from the census is
// unverified until a person has checked the rows.
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { askedBy, groupOf, parseCsv, type Census, type Row } from "@/lib/census"
import { APPLICATION_TOPICS, applications } from "@/lib/applications"
import { countries } from "@/lib/countries"
import { factsFor } from "@/lib/form-check"

const ROOT = resolve(process.cwd(), "..")

export type Share = { yes: number; of: number }

// Where the law in England puts a topic in the fostering or adoption assessment, read from
// register/assessment.csv (the map of what the law says an assessment must cover). Empty until
// that file exists.
export type LawStage = { fostering: string[]; adoption: string[] }

export type TopicCheck = {
  label: string
  sensitive: boolean
  ukFirst: Share
  allFirst: Share
  ukApp: Share | null
  usApp: Share | null
  allApp: Share // every country's applications together (a US packet counts once)
  // Where the law in each UK nation puts the topic, by nation code (ENG, WLS, SCT, NIR).
  law: Record<string, LawStage> | null
}

export const NATIONS = [
  { code: "ENG", name: "England" },
  { code: "WLS", name: "Wales" },
  { code: "SCT", name: "Scotland" },
  { code: "NIR", name: "Northern Ireland" },
] as const

export type InsightsData = {
  checked: string // latest date a first-contact form was read
  first: { forms: number; countries: number; median: number; shortest: number; longest: number }
  ukFirst: { forms: number; median: number; sensitive: Share }
  allSensitive: Share
  reply: { uk: Share; us: Share; all: Share }
  spareRoom: { agencies: Share; councils: Share }
  // UK enquiry forms for fostering that ask whether the person already knows the child, or offer
  // care by relatives and friends (kinship care) as a choice.
  knownChild: Share
  app: {
    all: { units: number; countries: number }
    uk: { median: number; forms: number; health: Share; partners: Share; criminal: Share } | null
    us: { median: number; packets: number; health: Share } | null
  }
  topics: TopicCheck[]
  lawRows: number // rows read from register/assessment.csv
  // Questions the law leaves until later, asked earlier. Where the law has two stages (England,
  // adoption in Wales), "later" means stage 2; where it has one assessment, it means the assessment.
  // Applications count only in England: elsewhere the application starts the assessment.
  // Null until register/assessment.csv exists.
  early: {
    enquiry: Early // England's enquiry forms
    application: Early // England's application forms
    nations: { code: string; name: string; enquiry: Early; link: string; citation: string }[]
  } | null
  lawLinks: { fostering: string; adoptionGuidance: string } | null
}

export type Early = { share: Share; top: string[] }

// Words that show a form recognises kinship care: it asks whether the person already knows the
// child, or offers care by relatives and friends as a choice. Matched against our paraphrased
// labels, hints and answer options. "How did you hear about us" is left out, because "a friend or
// relative" there is not about the child.
const KNOWN_CHILD =
  /kinship|family and friends|friends and family|connected person|relative (?:foster|adopt|care)|child (?:you|i|they) (?:already )?know/i

// Stage 2 topics worth flagging when asked early. An open "about you" box and interest in early
// permanence are left out: asking them early is not intrusive. The spare room has its own idea.
const EARLY: Record<string, string> = {
  ethnicity: "ethnicity",
  religion: "religion",
  employment_history: "past jobs",
  employment_status: "work",
  income: "income",
  motivation: "why they want to do this",
  life_story: "their own childhood",
  education: "schooling",
  parenting_approach: "views on parenting",
  childcare_experience: "experience with children",
  child_preferences: "which children they could care for",
}

const STAGE_ORDER = ["stage_1", "stage_2", "assessment", "checks"]
const STAGE_NAMES: Record<string, string> = {
  stage_1: "Stage 1",
  stage_2: "Stage 2",
  assessment: "Assessment",
  checks: "Check",
}

function lawMap(): Row[] {
  const path = resolve(ROOT, "register/assessment.csv")
  return existsSync(path) ? parseCsv(readFileSync(path, "utf-8")) : []
}

const median = (xs: number[]) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

export function insights(c: Census): InsightsData {
  const asked = askedBy(c)
  const world = countries(c)
  const apps = applications(c)
  const uk = world.countries.find((x) => x.code === "UK")
  const us = world.countries.find((x) => x.code === "US")
  const ukApp = apps.countries.find((x) => x.code === "UK")
  const usApp = apps.countries.find((x) => x.code === "US")
  const topicShare = (a: typeof ukApp, label: string) => a?.topics.find((t) => t.label === label)?.app ?? null

  // First-contact forms in every country, read straight from the live page: the same forms as
  // "Across countries" on /research.
  const first = factsFor(c, world.countries.map((x) => x.code), true).filter((f) => f.form.observed === "direct_fetch")
  const firstQs = (country?: string) =>
    first.filter((f) => !country || f.form.country === country).map((f) => asked.get(f.form.form_id) ?? [])
  const shareOf = (sets: Row[][], match: (q: Row) => boolean): Share => ({
    yes: sets.filter((qs) => qs.some((q) => !q.conditional_on && match(q))).length,
    of: sets.length,
  })

  // Spare room by who runs the form, UK only.
  const ukFirst = first.filter((f) => f.form.country === "UK")
  const byGroup = (g: string): Share => {
    const xs = ukFirst.filter((f) => groupOf(f.form) === g)
    return { yes: xs.filter((f) => f.spareRoom).length, of: xs.length }
  }

  // Kinship care on UK enquiry forms for fostering (adoption-only forms are left out).
  const optionText = new Map<string, string>()
  for (const o of c.options) optionText.set(o.question_id, `${optionText.get(o.question_id) ?? ""} ${o.option_label}`)
  const asksKnownChild = (q: Row) =>
    q.topic !== "how_heard" &&
    KNOWN_CHILD.test(`${q.label_paraphrased} ${q.hint_paraphrased} ${optionText.get(q.question_id) ?? ""}`)
  const ukFostering = ukFirst.filter((f) => f.form.service_type !== "adoption")
  const knownChild: Share = {
    yes: ukFostering.filter((f) => (asked.get(f.form.form_id) ?? []).some(asksKnownChild)).length,
    of: ukFostering.length,
  }

  // The law map. The stage-2 check below uses England; the table shows every nation.
  const allLaw = lawMap()
  const law = allLaw.filter((r) => r.jurisdiction === "ENG")
  const stagesFor = (match: (q: Row) => boolean, service: string, nation = "ENG") =>
    [...new Set(allLaw.filter((r) => r.jurisdiction === nation && r.applies_to === service && match(r)).map((r) => r.stage))]
      .sort((a, b) => STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b))
      .map((x) => STAGE_NAMES[x] ?? x)

  // Topics the law leaves until later, for each nation and service. Where the law has two stages,
  // topics it names only in stage 2; where it has one assessment, topics it names in the assessment.
  const later = new Map<string, Set<string>>()
  const laterTopics = (nation: string, service: string) => {
    const key = `${nation}|${service}`
    if (later.has(key)) return later.get(key)!
    const rows = allLaw.filter((r) => r.jurisdiction === nation && r.applies_to === service)
    const twoStage = rows.some((r) => r.stage === "stage_1" || r.stage === "stage_2")
    const stages = new Map<string, Set<string>>()
    for (const r of rows.filter((r) => r.topic in EARLY)) {
      const k = `${r.category}/${r.topic}`
      stages.set(k, (stages.get(k) ?? new Set()).add(r.stage))
    }
    const out = new Set(
      [...stages]
        .filter(([, v]) => (twoStage ? v.size === 1 && v.has("stage_2") : v.has("assessment")))
        .map(([k]) => k),
    )
    later.set(key, out)
    return out
  }
  const NATION_OF: Record<string, string> = Object.fromEntries(NATIONS.map((n) => [n.name, n.code]))
  const s2For = (f: Row) => {
    const nation = NATION_OF[f.region] ?? "ENG"
    const fostering = laterTopics(nation, "fostering")
    const adoption = laterTopics(nation, "adoption")
    return f.service_type === "adoption"
      ? adoption
      : f.service_type === "fostering"
        ? fostering
        : new Set([...fostering].filter((k) => adoption.has(k)))
  }
  const answered = (q: Row) =>
    q.category !== "consent" && q.category !== "staff_recorded" && !q.conditional_on && q.input_type !== "statement"
  const earlyIn = (forms: Row[]) => {
    const hits = forms.map((f) => {
      const s2 = s2For(f)
      return new Set((asked.get(f.form_id) ?? []).filter(answered).map((q) => `${q.category}/${q.topic}`).filter((k) => s2.has(k)))
    })
    const counts = new Map<string, number>()
    for (const h of hits) for (const k of h) counts.set(k, (counts.get(k) ?? 0) + 1)
    const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => EARLY[k.split("/")[1]])
    return { share: { yes: hits.filter((h) => h.size).length, of: forms.length }, top }
  }
  const englandApps = c.forms.filter(
    (f) => f.form_stage === "application" && f.country === "UK" && f.region === "England" &&
      (asked.get(f.form_id) ?? []).filter(answered).length >= 3,
  )
  const firstIn = (region: string) => ukFirst.filter((f) => f.form.region === region).map((f) => f.form)
  const englandFirst = firstIn("England")
  const guidance = law.find((r) => r.applies_to === "adoption" && /3\.13/.test(r.legal_citation))
  const schedule = law.find((r) => r.applies_to === "fostering" && r.source_type === "legislation")
  // The fostering law each nation's map mostly cites: its main schedule.
  const mainLaw = (nation: string) => {
    const counts = new Map<string, { n: number; row: Row }>()
    for (const r of allLaw.filter((r) => r.jurisdiction === nation && r.applies_to === "fostering" && r.source_type === "legislation")) {
      const x = counts.get(r.source_url) ?? { n: 0, row: r }
      counts.set(r.source_url, { n: x.n + 1, row: x.row })
    }
    const top = [...counts.values()].sort((a, b) => b.n - a.n)[0]?.row
    return top ? { link: top.source_url, citation: top.legal_citation.split(", para")[0] } : { link: "", citation: "" }
  }

  const topics: TopicCheck[] = APPLICATION_TOPICS.map((t) => {
    return {
      label: t.label,
      sensitive: !!t.sensitive,
      ukFirst: shareOf(firstQs("UK"), t.match),
      allFirst: shareOf(firstQs(), t.match),
      ukApp: topicShare(ukApp, t.label),
      usApp: topicShare(usApp, t.label),
      allApp: apps.countries.reduce(
        (sum, a) => {
          const x = topicShare(a, t.label)
          return x ? { yes: sum.yes + x.yes, of: sum.of + x.of } : sum
        },
        { yes: 0, of: 0 },
      ),
      law: allLaw.length
        ? Object.fromEntries(
            NATIONS.map((n) => [
              n.code,
              { fostering: stagesFor(t.match, "fostering", n.code), adoption: stagesFor(t.match, "adoption", n.code) },
            ]),
          )
        : null,
    }
  })

  return {
    checked: world.checked,
    first: {
      forms: world.allForms,
      countries: world.countries.length,
      median: world.allMedian,
      shortest: world.shortest,
      longest: world.longest,
    },
    ukFirst: {
      forms: uk?.forms ?? 0,
      median: uk ? median(uk.questions) : 0,
      // The same "personal" topics as the table below and "What applications ask" on /research.
      sensitive: ukApp?.sensitiveFirst ?? { yes: uk?.asksSensitive ?? 0, of: uk?.forms ?? 0 },
    },
    allSensitive: world.asksSensitive,
    reply: {
      uk: { yes: uk?.reply.stated ?? 0, of: uk?.reply.of ?? 0 },
      us: { yes: us?.reply.stated ?? 0, of: us?.reply.of ?? 0 },
      all: world.reply,
    },
    spareRoom: { agencies: byGroup("Independent agencies"), councils: byGroup("Councils and hubs") },
    knownChild,
    app: {
      all: { units: apps.countries.reduce((n, a) => n + a.apps, 0), countries: apps.countries.length },
      uk: ukApp
        ? {
            median: ukApp.appMedian,
            forms: ukApp.apps,
            health: topicShare(ukApp, "Health or disability")!,
            partners: topicShare(ukApp, "Past partners or marriages")!,
            criminal: topicShare(ukApp, "Criminal record")!,
          }
        : null,
      us: usApp ? { median: usApp.appMedian, packets: usApp.apps, health: topicShare(usApp, "Health or disability")! } : null,
    },
    topics,
    lawRows: law.length,
    early: law.length
      ? {
          enquiry: earlyIn(englandFirst),
          application: earlyIn(englandApps),
          nations: NATIONS.map((n) => ({ code: n.code, name: n.name, enquiry: earlyIn(firstIn(n.name)), ...mainLaw(n.code) })),
        }
      : null,
    lawLinks: guidance && schedule ? { fostering: schedule.source_url, adoptionGuidance: guidance.source_url } : null,
  }
}

// The rules a service may quote about a spare room, from the UK rules register (register/policies.csv).
export type RuleQuote = { place: string; rule: string; source: string; url: string; checked: string }
export function bedroomRules(): RuleQuote[] {
  const rows = parseCsv(readFileSync(resolve(ROOT, "register/policies.csv"), "utf-8"))
  const place: Record<string, string> = { ENG: "England", WLS: "Wales", SCT: "Scotland", NIR: "Northern Ireland" }
  return rows
    .filter((r) => r.topic === "bedroom_space" && r.applies_to === "fostering")
    .map((r) => ({
      place: place[r.jurisdiction] ?? r.jurisdiction,
      rule: r.rule_summary,
      source: r.legal_citation || r.source_type.replace(/_/g, " "),
      url: r.source_url,
      checked: r.date_checked,
    }))
}
