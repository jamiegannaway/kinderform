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
  england: LawStage | null
}

export type InsightsData = {
  checked: string // latest date a first-contact form was read
  first: { forms: number; countries: number; median: number; shortest: number; longest: number }
  ukFirst: { forms: number; median: number; sensitive: Share }
  allSensitive: Share
  reply: { uk: Share; us: Share; all: Share }
  spareRoom: { agencies: Share; councils: Share }
  app: {
    uk: { median: number; forms: number; health: Share; partners: Share; criminal: Share } | null
    us: { median: number; packets: number; health: Share } | null
  }
  topics: TopicCheck[]
  lawRows: number // rows read from register/assessment.csv
}

const STAGE_NAMES: Record<string, string> = {
  stage_1: "Stage 1",
  stage_2: "Stage 2",
  assessment: "Assessment",
  checks: "Checks",
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

  // The law map, England only for now.
  const law = lawMap().filter((r) => r.jurisdiction === "ENG")
  const stagesFor = (match: (q: Row) => boolean, service: string) =>
    [...new Set(law.filter((r) => r.applies_to === service && match(r)).map((r) => STAGE_NAMES[r.stage] ?? r.stage))]
      .sort()

  const topics: TopicCheck[] = APPLICATION_TOPICS.map((t) => {
    const fostering = stagesFor(t.match, "fostering")
    const adoption = stagesFor(t.match, "adoption")
    return {
      label: t.label,
      sensitive: !!t.sensitive,
      ukFirst: shareOf(firstQs("UK"), t.match),
      allFirst: shareOf(firstQs(), t.match),
      ukApp: topicShare(ukApp, t.label),
      usApp: topicShare(usApp, t.label),
      england: law.length ? { fostering, adoption } : null,
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
    app: {
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
