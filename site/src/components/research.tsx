import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SiteFooter, SiteHeader } from "@/components/site-header"

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
  if (!checked) return <Badge variant="secondary">Not yet checked</Badge>
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

export default function ResearchIndex({
  updated,
  findings,
  updates,
  reports,
  library,
}: {
  updated: string
  findings: Finding[]
  updates: Doc[]
  reports: Doc[]
  library: Doc
}) {
  const sources = findings.flatMap((f) => f.sources)
  const checkedCount = sources.filter((s) => s.checked).length
  return (
    <>
      <SiteHeader current="/research" />
      <main id="main" className="mx-auto max-w-6xl space-y-16 px-6 pt-6 pb-20 md:pt-10">
        <section className="max-w-3xl space-y-5">
          <Badge variant="secondary">Updated {longDate(updated)}</Badge>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            What we know about the first step
          </h1>
          <p className="text-xl leading-8 text-muted-foreground">
            What research says about the time between someone getting in touch about fostering or adoption and their
            application. We add to this as we learn more, and we say which claims a person has checked against the
            original source.
          </p>
        </section>

        <Alert className="max-w-3xl">
          <AlertTitle>How to read this page</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              <Badge variant="outline">Checked</Badge> means a person has compared the claim with the original source,
              on the date shown. <Badge variant="secondary">Not yet checked</Badge> means the summary comes from an
              abstract or from our AI-assisted review. Check the source before you quote it.
            </p>
            <p>
              So far, {checkedCount} of {sources.length} sources on this page have been checked.
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

        <section aria-labelledby="deeper" className="space-y-6">
          <H2 id="deeper">Read more</H2>
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
            If you know of research we have missed, or you find a claim here that does not match its source, please tell
            us. Corrections are listed in the monthly update. We would especially like to hear about studies from
            Scotland, Wales, Northern Ireland and beyond the UK.
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
