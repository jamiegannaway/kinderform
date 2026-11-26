import { Applications } from "@/components/applications"
import type { ApplicationsData } from "@/lib/applications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteFooter, SiteHeader } from "@/components/site-header"
import FormsDiffer from "@/components/forms-differ"
import Countries, { HowWeDidThis, InsightCards, type Withdrawals } from "@/components/countries"
import type { CountriesData } from "@/lib/countries"
import type { FormsDiffer as FormsDifferData } from "@/lib/forms-differ"
import type { UsPicture as UsPictureData } from "@/lib/us-register"
import { Illustration } from "@/components/illustration"
import { Tag } from "@/components/tag"
import { StepIntro, StepPath, StepsTheme } from "@/components/steps"
import { THREAD, groups, steps } from "@/lib/steps"

export type Checked = { date: string; against: string; note?: string } | null
export type Source = { title: string; by: string; year: string; url: string; checked: Checked; note?: string }
export type Finding = { id: string; stage: string; title: string; summary: string; sources: Source[] }
export type Doc = { href: string; title: string; when: string; blurb?: string }

export const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
      {children}
    </h2>
  )
}

// One line per source, each with its check status (CLAUDE.md, hard rule 6): the date a person
// checked it, and "abstract" when the check was against the abstract alone. A source nobody has
// checked gets no tag: the About page says once how the site was made.
function SourceItem({ s }: { s: Source }) {
  return (
    <li className="space-y-1">
      <a href={s.url} className="font-medium underline underline-offset-4">
        {s.title}
      </a>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
        <span>
          {s.by}, {s.year}
        </span>
        {s.checked ? (
          <Tag tone="green" className="whitespace-normal">
            Checked {longDate(s.checked.date)}
            {s.checked.against === "full text" ? "" : `, against the ${s.checked.against}`}
          </Tag>
        ) : null}
      </p>
    </li>
  )
}

// The title states the finding. The summary, with its figures, opens on demand; the
// sources stay in view.
function FindingCard({ f }: { f: Finding }) {
  const notes = f.sources.flatMap((s) => {
    const note = s.checked?.note ?? s.note
    return note ? [{ key: s.url + s.title, title: s.title, note }] : []
  })
  return (
    <Card id={f.id} className="scroll-m-20 gap-4">
      <CardHeader>
        <CardDescription>{f.stage}</CardDescription>
        <CardTitle className="text-lg leading-snug">{f.title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <details className="text-sm">
          <summary className="cursor-pointer font-medium underline-offset-4 hover:underline">Read the evidence</summary>
          <p className="mt-2 text-base leading-7">{f.summary}</p>
          {notes.map((n) => (
            <p key={n.key} className="mt-2 leading-6 text-muted-foreground">
              {f.sources.length > 1 ? `About ${n.title}: ` : "About the source: "}
              {n.note}
            </p>
          ))}
        </details>
        <ul aria-label={f.sources.length === 1 ? "Source" : "Sources"} className="space-y-3 border-t pt-4 text-sm">
          {f.sources.map((s) => (
            <SourceItem key={s.url + s.title} s={s} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// Plain words for the terms on this page, kept out of the way of the main text.
const WORDS: [string, string][] = [
  ["Enquiry", "The first time someone gets in touch to ask about fostering or adopting."],
  ["Enquiry form", "The form someone fills in to make an enquiry."],
  ["First reply", "The first answer a person gets after they enquire."],
  ["Service", "A council, hub or agency that finds and approves foster carers or adopters."],
  ["Council", "A local council that runs fostering or adoption itself."],
  ["Hub", "A group of councils that recruit foster carers together. Also called a regional hub."],
  ["Independent agency", "A charity or company that finds and supports foster carers."],
  ["Adoption agency", "A service that finds and approves adopters. Some are councils working together."],
  ["Place to get in touch", "The page, form, phone line or email address someone uses to enquire."],
  ["Checklist", "Our draft list of what a good enquiry form and first reply do."],
  ["Typical", "The middle value: half of the forms ask more, and half ask fewer."],
  ["Sensitive question", "A question about date of birth, health, a criminal record, ethnicity, faith, immigration status or past partners."],
]

export default function ResearchIndex({
  updated,
  findings,
  updates,
  reports,
  library,
  formsDiffer,
  us,
  world,
  apps,
  withdrawals,
}: {
  updated: string
  findings: Finding[]
  updates: Doc[]
  reports: Doc[]
  library: Doc
  formsDiffer?: FormsDifferData
  us?: UsPictureData
  world?: CountriesData
  apps?: ApplicationsData
  withdrawals?: Withdrawals
}) {
  const sources = findings.flatMap((f) => f.sources)
  // Each source once, even when two findings cite it. A source counts as checked when a person
  // checked it for any finding.
  const byUrl = new Map<string, Source>()
  for (const src of sources) if (!byUrl.get(src.url)?.checked) byUrl.set(src.url, src)
  const unique = [...byUrl.values()]
  // The steps we sort the findings by (src/lib/steps.ts), and the findings under each.
  const stepList = steps(
    world && world.allForms > 0 ? { forms: world.allForms, countries: world.countries.length } : undefined,
  )
  const stepOf = new Map([...stepList, THREAD].map((x) => [x.id, x]))
  const named = new Set(groups().map((g) => g.name))
  const grouped = [
    ...groups().map((g) => ({ id: g.id, label: g.label, findings: findings.filter((f) => f.stage === g.name) })),
    // A finding with a stage we do not know still shows, at the end.
    { id: "other", label: "Other findings", findings: findings.filter((f) => !named.has(f.stage)) },
  ].filter((g) => g.findings.length > 0)
  const fullText = unique.filter((s) => s.checked && s.checked.against === "full text").length
  const otherCheck = unique.filter((s) => s.checked && s.checked.against !== "full text").length
  return (
    <>
      <SiteHeader current="/research" />
      <main id="main" className="mx-auto max-w-6xl space-y-16 px-6 pt-6 pb-20 md:pt-10">
        <section className="grid items-center gap-6 md:grid-cols-[minmax(0,48rem)_14rem] md:justify-between md:gap-8">
          <Illustration name="examining" className="w-36 md:order-last md:mx-auto md:w-full" />
          <div className="space-y-5">
            <Tag tone="blue">Updated {longDate(updated)}</Tag>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
              What we know about the first step
            </h1>
            <p className="text-xl leading-8 text-muted-foreground">
              In England, most fostering applications that finish end in withdrawal, not approval. Quicker first visits
              alone did not lead to more approvals. And few enquiry forms say when you will hear back.
            </p>
            <p className="leading-7">
              We do not name or score any service from our own reading of forms. Studies we cite may name the
              services they studied. The{" "}
              <a href="/compare" className="font-medium underline underline-offset-4">
                compare pages
              </a>{" "}
              list each form, with its link.
            </p>
            <details id="words" className="scroll-m-20 text-sm leading-6">
              <summary className="cursor-pointer font-medium underline-offset-4 hover:underline">
                Words we use on this page
              </summary>
              <dl className="mt-3 space-y-2">
                {WORDS.map(([term, meaning]) => (
                  <div key={term}>
                    <dt className="font-medium">{term}</dt>
                    <dd className="text-muted-foreground">{meaning}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
        </section>

        {world && world.allForms > 0 && (
          <section aria-labelledby="glance">
            <h2 id="glance" className="sr-only">
              Main findings at a glance
            </h2>
            <InsightCards data={world} withdrawals={withdrawals} />
          </section>
        )}

        <section aria-labelledby="steps" className="space-y-6">
          <div className="max-w-3xl space-y-4">
            <H2 id="steps">What the research says, step by step</H2>
            <StepsTheme />
          </div>
          <StepPath steps={stepList} />
        </section>

        <section aria-labelledby="known" className="space-y-6">
          <div className="max-w-3xl space-y-4">
            <H2 id="known">Research and our own reading give {findings.length} findings so far</H2>
            <p className="leading-7">
              A person has checked {fullText} of the {unique.length} sources against the full text
              {otherCheck ? `, and ${otherCheck} more against the abstract only` : ""}.{" "}
              <a href="/about#how" className="font-medium underline underline-offset-4">
                How we made this site
              </a>
              .
            </p>
            <HowWeDidThis>
              <p>
                A checked source means a person compared our summary with the original, on the date shown. A summary not
                yet checked comes from an abstract, from our AI-assisted review or from our own reading of public pages.
                Findings by Kinderform come from our own reading of public forms, not from published research.
              </p>
            </HowWeDidThis>
          </div>
          {grouped.map((g) => (
            <div key={g.id} className="space-y-4">
              <div className="flex items-center gap-4">
                {stepOf.has(g.id) && <Illustration name={stepOf.get(g.id)!.art} className="w-14 shrink-0" />}
                <h3 id={`step-${g.id}`} className="scroll-m-20 text-xl font-semibold tracking-tight">
                  {g.label}
                </h3>
              </div>
              {stepOf.has(g.id) && <StepIntro step={stepOf.get(g.id)!} />}
              <div className="grid gap-6 md:grid-cols-2">
                {g.findings.map((f) => (
                  <FindingCard key={f.id} f={f} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {formsDiffer && formsDiffer.read > 0 && <FormsDiffer data={formsDiffer} />}

        {world && world.allForms > 0 && <Countries data={world} />}

        {apps && apps.countries.length > 0 && <Applications data={apps} />}

        {us && us.doors > 0 && (
          <section aria-labelledby="us-picture" className="max-w-3xl space-y-4">
            <H2 id="us-picture">In the United States, we found {us.doors.toLocaleString("en-GB")} places to get in touch</H2>
            <p className="leading-7">
              In many states each county runs its own child welfare service, so each county has its own place to get in
              touch. The United States page has the map, each state&rsquo;s count and what state rules say.
            </p>
            <Button asChild variant="outline">
              <a href="/research/united-states">See the United States in detail</a>
            </Button>
          </section>
        )}

        <section aria-labelledby="deeper" className="space-y-6">
          <div className="max-w-3xl space-y-4">
            <H2 id="deeper">Each source and review has its own page</H2>
            <p className="leading-7">
              The{" "}
              <a href="/research/log" className="font-medium underline underline-offset-4">
                research log
              </a>{" "}
              shows what each review found and what it could mean for the project. We made each review with an
              AI-assisted research tool.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>{library.when}</CardDescription>
                <CardTitle className="text-lg">
                  <a href={library.href} className="underline-offset-4 hover:underline">
                    {library.title}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{library.blurb}</CardContent>
              <CardFooter className="mt-auto">
                <Button asChild variant="outline" size="sm">
                  <a href={library.href}>Open the library</a>
                </Button>
              </CardFooter>
            </Card>
            {reports.map((r) => (
              <Card key={r.href}>
                <CardHeader>
                  <CardDescription>Report, {r.when}</CardDescription>
                  <CardTitle className="text-lg">
                    <a href={r.href} className="underline-offset-4 hover:underline">
                      {r.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">{r.blurb}</CardContent>
                <CardFooter className="mt-auto">
                  <Button asChild variant="outline" size="sm">
                    <a href={r.href}>Read the report</a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <Card>
              <CardHeader>
                <CardDescription>Monthly</CardDescription>
                <CardTitle className="text-lg">Updates</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6">
                <p className="text-muted-foreground">What we added, checked and corrected each month.</p>
                <ul className="mt-4 space-y-2">
                  {updates.map((u) => (
                    <li key={u.href}>
                      <a href={u.href} className="font-medium underline underline-offset-4">
                        {u.when}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section aria-labelledby="help" className="max-w-3xl space-y-4">
          <H2 id="help">We want to hear about research we have missed</H2>
          <p className="leading-7">
            Please also tell us if a claim here does not match its source. We would most like to hear about studies from
            Scotland, Wales, Northern Ireland and the other countries we cover. Studies not written in English are welcome.
          </p>
          <Button asChild>
            <a href="/#get-involved">Get in touch</a>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
