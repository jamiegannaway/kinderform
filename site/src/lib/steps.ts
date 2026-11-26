// The steps we sort the research by: the home page, /research and /for-services all read them
// from here. The names are drafts. Change a name here and every page follows.
//
// A finding in evidence/findings.json carries one of these names in "stage". The test
// tests/validate_findings.py reads the names from this file, so keep each name and its text on
// one line. Every research line below is taken from the findings or the research log; add no
// new facts here.

import type { IllustrationName } from "@/components/illustration"

// How strong the evidence is, as three levels, so a reader can see it at a glance.
export type Level = 1 | 2 | 3
export const LEVELS: Record<Level, string> = { 1: "Thin evidence", 2: "Some evidence", 3: "Strong evidence" }

export type Step = {
  id: string // the anchor on /research is "step-" + id
  name: string
  art: IllustrationName // the drawing for the step
  short: string // the step in a few words, for the picture of the steps
  level: Level
  does: string // what the service does at this step
  says: string // what the research says
  strength: string // how strong the evidence is, in a few plain words
}

// What our reviews keep finding, and the limits of it. The caveat goes wherever the theme goes.
export const THEME =
  "People are most often lost in the gaps between steps, when contact lapses or nobody reaches them. What seems to help is a named person, a clear next step and no long silence."
export const CAVEAT =
  "This is our way of sorting what we found. Nobody has tested these steps together. In the one place that measured it, quicker first visits alone did not lead to more approvals."

// Counts from the census, so the text never states a number the data does not give.
export type StepCounts = { forms: number; countries: number }

export function steps(counts?: StepCounts): Step[] {
  const read =
    counts && counts.forms > 0
      ? `Our own reading of ${counts.forms} enquiry forms in ${counts.countries} countries`
      : "Our own reading of enquiry forms"
  return [
    {
      id: "ask",
      name: "Ask",
      art: "faqs",
      short: "Ask only what you need to reply.",
      level: 2,
      does: "The enquiry form asks only what is needed to reply.",
      says: "Enquiry forms differ a lot in what they ask. Pages with few questions, made for phones, lost fewer people.",
      strength: `${read}, plus experiments with online surveys.`,
    },
    {
      id: "reply",
      name: "Reply",
      art: "call",
      short: "Say who will be in touch, and when.",
      level: 2,
      does: "Say who will be in touch, when, and what happens next.",
      says: "How the first contact feels is what people remember. What a message says has better evidence than how fast it arrives.",
      strength: "Interviews and surveys in fostering, plus trials in other fields. No trial in fostering.",
    },
    {
      id: "route",
      name: "Route",
      art: "crossroad",
      short: "Get the enquiry to the right team.",
      level: 1,
      does: "Get the enquiry to the right team, and confirm the hand-over. We route the enquiry, never the person.",
      says: "Some people who withdrew said contact stopped after one service handed them on to another. Relatives and friends of a child can arrive at a general fostering form.",
      strength: "One evaluation of one hub in England, surveys of kinship carers and our own count of forms. The evidence for this step is still thin.",
    },
    {
      id: "prepare",
      name: "Prepare",
      art: "studying",
      short: "Give an honest picture of what comes next.",
      level: 2,
      does: "Offer a first conversation, and an honest picture of what the application asks.",
      says: "Applications ask far more than enquiry forms. Some applicants who withdrew said the process was not what they expected.",
      strength: "Ofsted’s figures for England, plus our own reading of application forms.",
    },
    {
      id: "apply",
      name: "Apply",
      art: "check",
      short: "Know who withdrew, and who was turned down.",
      level: 3,
      does: "Keep “the person withdrew” apart from “the service said no”.",
      says: "Most fostering applications that finish end in withdrawal, not approval. Most people who leave choose to.",
      strength: "Official figures for England, and counts from other countries that cannot be compared fairly.",
    },
    {
      id: "stay",
      name: "Stay",
      art: "plant-seed",
      short: "Keep the same promise after approval.",
      level: 2,
      does: "Keep the same promise after approval.",
      says: "Carers stay when the service supports them reliably. Leaving within two years of approval is the clearest link to the first step.",
      strength: "Official figures and surveys of carers. The best-known programme was not tested in a trial.",
    },
  ]
}

// Not a step: it runs between every step.
export const THREAD: Step = {
  id: "keep-in-touch",
  name: "Keep in touch",
  art: "paper-airplane",
  short: "Nobody should have to chase for news.",
  level: 2,
  does: "Between every step, the service gets back in touch itself. Nobody should have to chase for news.",
  says: "Long silences go with losing touch. Help from a person did more than information or reminders.",
  strength: "Mostly from other fields, such as giving blood and stem cells. Some of it comes from trials.",
}

// Findings that sit outside the steps.
export const BEFORE = { id: "before", name: "Before the first step" }
export const UNTESTED = { id: "untested", name: "Not yet tested" }

// For an idea on /for-services that applies at every step. Not a finding's stage.
export const EVERY_STEP = "Every step"

// The findings on /research, grouped in this order.
export type Group = { id: string; name: string; label: string }
export function groups(): Group[] {
  return [
    ...steps().map((s, i) => ({ id: s.id, name: s.name, label: `Step ${i + 1}: ${s.name}` })),
    { id: THREAD.id, name: THREAD.name, label: `Between every step: ${THREAD.name}` },
    { ...BEFORE, label: BEFORE.name },
    { ...UNTESTED, label: UNTESTED.name },
  ]
}
