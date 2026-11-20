import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SiteFooter, SiteHeader } from "@/components/site-header"
import FormsDiffer from "@/components/forms-differ"
import UsPicture from "@/components/us-picture"
import Countries, { InsightCards, type Withdrawals } from "@/components/countries"
import type { CountriesData } from "@/lib/countries"
import type { FormsDiffer as FormsDifferData } from "@/lib/forms-differ"
import type { UsPicture as UsPictureData } from "@/lib/us-register"
import { Illustration } from "@/components/illustration"

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

function CheckBadge({ checked }: { checked: Checked }) {
  if (!checked) return <Badge variant="secondary">Not yet checked by a person</Badge>
  return <Badge variant="outline">Checked {longDate(checked.date)}</Badge>
}

function SourceItem({ s }: { s: Source }) {
  return (
    <li className="space-y-1.5">
      <a href={s.url} className="font-medium underline underline-offset-4">
        {s.title}
      </a>
      <p className="text-muted-foreground">
        {s.by}, {s.year}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <CheckBadge checked={s.checked} />
        {s.checked && <span className="text-muted-foreground">Against the {s.checked.against}.</span>}
      </div>
      {(s.checked?.note || s.note) && <p className="text-muted-foreground">{s.checked?.note ?? s.note}</p>}
    </li>
  )
}

function FindingCard({ f }: { f: Finding }) {
  return (
    <Card id={f.id} className="scroll-m-20">
      <CardHeader>
        <CardDescription>{f.stage}</CardDescription>
        <CardTitle className="text-lg leading-snug">{f.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="leading-7">{f.summary}</p>
        <Separator />
        <div className="space-y-3 text-sm">
          <h3 className="font-medium">{f.sources.length === 1 ? "Source" : "Sources"}</h3>
          <ul className="space-y-4">
            {f.sources.map((s) => (
              <SourceItem key={s.url + s.title} s={s} />
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// The stages findings belong to, in reading order, each linking to its first finding.
function Stages({ findings }: { findings: Finding[] }) {
  const stages: { stage: string; first: string; count: number }[] = []
  for (const f of findings) {
    const s = stages.find((x) => x.stage === f.stage)
    if (s) s.count++
    else stages.push({ stage: f.stage, first: f.id, count: 1 })
  }
  return (
    <nav aria-label="Findings by stage">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
        {stages.map((s, i) => (
          <li key={s.stage}>
            <a
              href={`#${s.first}`}
              className="flex h-full items-center gap-3 rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-muted"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground tabular-nums">
                {i + 1}
              </span>
              <span>
                <span className="block font-medium">{s.stage}</span>
                <span className="block text-muted-foreground">
                  {s.count} {s.count === 1 ? "finding" : "findings"}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function ResearchIndex({
  updated,
  findings,
  updates,
  reports,
  library,
  formsDiffer,
  us,
  world,
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
  withdrawals?: Withdrawals
}) {
  const sources = findings.flatMap((f) => f.sources)
  const checkedCount = sources.filter((s) => s.checked).length
  return (
    <>
      <SiteHeader current="/research" />
      <main id="main" className="mx-auto max-w-6xl space-y-16 px-6 pt-6 pb-20 md:pt-10">
        <section className="grid items-center gap-8 md:grid-cols-[minmax(0,48rem)_14rem] md:justify-between">
          <div className="space-y-5">
          <Badge variant="secondary">Updated {longDate(updated)}</Badge>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            What we know about the first step
          </h1>
          <p className="text-xl leading-8 text-muted-foreground">
            This page sets out what we know about the first step into fostering and adoption, from getting in touch to
            applying. In England, most fostering applications that finish end in withdrawal, not approval. Quicker first
            visits did not, on their own, lead to more approvals. And few enquiry forms say when you will hear back. For
            each claim, we say whether a person has checked it against the original source.
          </p>
          </div>
          <Illustration name="examining" className="mx-auto hidden w-full md:block" />
        </section>

        <section aria-labelledby="glance" className="space-y-5">
          <h2 id="glance" className="sr-only">
            Main findings at a glance
          </h2>
          {world && world.allForms > 0 && <InsightCards data={world} withdrawals={withdrawals} />}
          <Stages findings={findings} />
        </section>

        <Alert className="max-w-3xl">
          <AlertTitle>How sure we are</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              <Badge variant="outline">Checked</Badge> means a person has compared the claim with the original source,
              on the date shown. <Badge variant="secondary">Not yet checked by a person</Badge> means nobody has done
              that yet. The summary comes from an abstract, from our AI-assisted review or from our own reading of
              public pages. Check the source before you quote it.
            </p>
            <p>
              So far, a person has checked {checkedCount} of the {sources.length} sources on this page.
            </p>
            <p>
              We explain terms such as hub and independent agency in{" "}
              <a href="#words" className="font-medium text-foreground underline underline-offset-4">
                Words we use on this page
              </a>
              .
            </p>
          </AlertDescription>
        </Alert>

        <section aria-labelledby="known" className="space-y-6">
          <H2 id="known">What we know so far</H2>
          <div className="grid gap-6 md:grid-cols-2">
            {findings.map((f) => (
              <FindingCard key={f.id} f={f} />
            ))}
          </div>
        </section>

        {formsDiffer && formsDiffer.read > 0 && <FormsDiffer data={formsDiffer} />}

        {world && world.allForms > 0 && <Countries data={world} />}

        {us && us.doors > 0 && <UsPicture data={us} />}

        <section aria-labelledby="words" className="max-w-3xl space-y-4">
          <H2 id="words">Words we use on this page</H2>
          <dl className="space-y-3 leading-7">
            <div>
              <dt className="font-medium">Enquiry</dt>
              <dd className="text-muted-foreground">The first time someone gets in touch to ask about fostering or adopting.</dd>
            </div>
            <div>
              <dt className="font-medium">Enquiry form</dt>
              <dd className="text-muted-foreground">The form someone fills in to make an enquiry.</dd>
            </div>
            <div>
              <dt className="font-medium">First reply</dt>
              <dd className="text-muted-foreground">The first answer a person gets after they enquire.</dd>
            </div>
            <div>
              <dt className="font-medium">Service</dt>
              <dd className="text-muted-foreground">
                A council, hub or agency that finds and approves foster carers or adopters.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Council</dt>
              <dd className="text-muted-foreground">A local council that runs fostering or adoption itself.</dd>
            </div>
            <div>
              <dt className="font-medium">Hub</dt>
              <dd className="text-muted-foreground">
                A group of councils that recruit foster carers together. Also called a regional hub.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Independent agency</dt>
              <dd className="text-muted-foreground">A charity or company that finds and supports foster carers.</dd>
            </div>
            <div>
              <dt className="font-medium">Adoption agency</dt>
              <dd className="text-muted-foreground">
                A service that finds and approves adopters. This includes regional adoption agencies, where councils
                work together on adoption.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Place to get in touch</dt>
              <dd className="text-muted-foreground">
                The page, form, phone line or email address someone uses to enquire. Our data files call this a front
                door.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Checklist</dt>
              <dd className="text-muted-foreground">Our draft list of what a good enquiry form and first reply do.</dd>
            </div>
            <div>
              <dt className="font-medium">Not yet checked by a person</dt>
              <dd className="text-muted-foreground">
                A computer program or one person collected it, and nobody has checked it since.
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="deeper" className="space-y-6">
          <H2 id="deeper">Read more</H2>
          <p className="max-w-3xl leading-7">
            The{" "}
            <a href="/research/log" className="font-medium underline underline-offset-4">
              research log
            </a>{" "}
            lists each review as a table, with what it could mean for the project.
          </p>
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
                <p className="text-muted-foreground">What we added each month, what we checked and what we corrected.</p>
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
          <H2 id="help">Help us get this right</H2>
          <p className="leading-7">
            Please tell us about research we have missed, or a claim here that does not match its source. We list
            corrections in the monthly update. We would especially like to hear about studies from Scotland, Wales,
            Northern Ireland and outside the UK.
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
