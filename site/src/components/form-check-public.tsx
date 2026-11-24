import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SiteFooter, SiteHeader } from "@/components/site-header"
import type { Group } from "@/lib/census"
import { COUNTRY_NAMES } from "@/lib/compare"
import { CAPS, DOMAINS } from "@/lib/form-check"
import { Illustration } from "@/components/illustration"

type Patterns = {
  readable: number
  sensitive: number
  spareRoom: number
  replyChecked: number
  replyStated: number
  byGroup: Record<Group, { n: number; medianQuestions: number; sensitive: number; spareRoom: number }>
}
type CoverageRow = { country: string; region: string; primary: number; read: number }

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card className="gap-2 py-5">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
      {children}
    </h2>
  )
}

export default function FormCheckPublic({
  patterns,
  coverage,
  checked,
  privatePreview,
}: {
  patterns: Patterns
  coverage: CoverageRow[]
  checked: string
  privatePreview: boolean
}) {
  const p = patterns
  return (
    <>
      <SiteHeader current="/form-check" />
      <main id="main" className="mx-auto max-w-6xl px-6">
        <section aria-labelledby="fc-title" className="relative pt-8 pb-12 md:pt-14">
          <Illustration name="details" className="absolute top-8 right-0 hidden w-56 lg:block xl:w-64" />
          <Badge variant="secondary">Draft for comment</Badge>
          <h1 id="fc-title" className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Form check
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Form check looks at how fostering and adoption enquiry forms treat the people who fill them
            in. We look at each form from the side of the person enquiring. That means how much it asks,
            whether it says when you will hear back, and how it handles your details.
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Form check is for recruitment teams and managers in councils, regional hubs and agencies, and
            for sector bodies. It looks at pages and processes, never at staff. The method is a draft, and we
            are sharing it so you can comment on it.
          </p>
          <p className="mt-4 max-w-2xl leading-7 font-medium">What we found so far:</p>
          <ul className="mt-2 ml-5 max-w-2xl list-disc space-y-2 leading-7">
            <li>
              {p.sensitive} of {p.readable} UK enquiry forms we could read ask sensitive questions, such as
              date of birth or health.
            </li>
            <li>
              {p.spareRoom} of {p.readable} ask about a spare room.
            </li>
            <li>
              {p.replyStated} of {p.replyChecked} forms we checked say when you will hear back.
            </li>
          </ul>
          <Alert className="mt-8 max-w-3xl">
            <AlertTitle>No service is named or scored here yet</AlertTitle>
            <AlertDescription>
              Each service will see its own results in private, with time to correct them, before we
              publish any score by name. The facts about each form are public on the{" "}
              <a href="/compare/forms" className="font-medium text-foreground underline underline-offset-4">
                compare page
              </a>
              . The counts on this page come from a first look by a computer
              program that reads public web pages. They are not yet checked by a person.
            </AlertDescription>
          </Alert>
          {privatePreview && (
            <p className="mt-4 text-sm">
              <a href="/form-check/named" className="font-medium underline underline-offset-4">
                Private preview: named results
              </a>
            </p>
          )}
        </section>

        <section aria-labelledby="fc-patterns" className="py-12">
          <H2 id="fc-patterns">What our first look at enquiry forms found</H2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            We could read the questions on {p.readable} enquiry forms in the UK, and looked at them in{" "}
            {checked}.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat value={String(p.readable)} label="Enquiry forms read" />
            <Stat value={`${p.replyStated} of ${p.replyChecked}`} label="Say when you will hear back" />
            <Stat value={`${p.sensitive} of ${p.readable}`} label="Ask sensitive questions on the enquiry form" />
            <Stat value={`${p.spareRoom} of ${p.readable}`} label="Ask about a spare room on the enquiry form" />
          </div>
          <Table className="mt-8">
            <TableCaption>
              Sensitive questions are about things such as date of birth, ethnicity, health, criminal record
              or immigration status. Councils and hubs includes regional services.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Who runs the form</TableHead>
                <TableHead className="text-right">Forms read</TableHead>
                <TableHead className="text-right">Typical number of questions</TableHead>
                <TableHead className="text-right">Ask sensitive questions</TableHead>
                <TableHead className="text-right">Ask about a spare room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Object.keys(p.byGroup) as Group[]).map((g) => {
                const r = p.byGroup[g]
                return (
                  <TableRow key={g}>
                    <TableCell className="font-medium">{g}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.n}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.medianQuestions}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.sensitive} of {r.n}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.spareRoom} of {r.n}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </section>

        <Separator />

        <section aria-labelledby="fc-method" className="py-12">
          <H2 id="fc-method">Our draft checklist looks at 9 areas</H2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            The checklist is our draft list of what a good enquiry form and first reply do. It has 9
            areas, worth 100 points in total. We can judge some areas from a public web page. Others need
            information from the service itself, because a page alone cannot show them.
          </p>
          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>What we look for</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Judged from</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DOMAINS.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium whitespace-normal">{d.name}</TableCell>
                  <TableCell className="min-w-64 whitespace-normal text-muted-foreground">{d.looks}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.weight}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.seen ? "The public web page" : "The service's own data"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Card className="mt-8 max-w-3xl">
            <CardHeader>
              <CardTitle>Things that need fixing first</CardTitle>
              <CardDescription>
                Any one of these means a form can score no more than 50 out of 100. Each one can stop
                someone from enquiring, or break their trust.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="ml-5 list-disc space-y-2">
                {CAPS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section aria-labelledby="fc-coverage" className="py-12">
          <H2 id="fc-coverage">Where we have looked for enquiry forms</H2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            This table shows how many enquiry forms we found in each place, and how many of those we could
            read.
          </p>
          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Part of the country</TableHead>
                <TableHead className="text-right">Enquiry forms found</TableHead>
                <TableHead className="text-right">Forms we could read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverage.map((r) => (
                <TableRow key={`${r.country}-${r.region}`}>
                  <TableCell>{COUNTRY_NAMES[r.country] ?? r.country}</TableCell>
                  <TableCell className="font-medium">{r.region}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.primary}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.read}</TableCell>
                </TableRow>
              ))}
              {!coverage.some((r) => r.country === "US") && (
                <TableRow>
                  <TableCell>United States</TableCell>
                  <TableCell className="font-medium">All states</TableCell>
                  <TableCell colSpan={2} className="text-right">
                    <Badge variant="outline">Not started</Badge>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            In the United States, foster care runs through state agencies and, in some states, through
            counties and private agencies. Form check is built to cover each state and, where needed, each
            county.
          </p>
        </section>

        <Separator />

        <section aria-labelledby="fc-results" className="py-12">
          <H2 id="fc-results">Services will see their own results before we publish any names</H2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">We will share results in 4 steps.</p>
          <ol className="mt-6 ml-5 max-w-2xl list-decimal space-y-3 leading-7">
            <li>We publish this draft method and ask carers, services and sector bodies to comment on it.</li>
            <li>Each service gets its own results in private, with time to correct errors and make changes.</li>
            <li>We start public reporting with patterns across the sector and named examples of good practice.</li>
            <li>Named results for every service come last, and always look at the page and process, never at staff.</li>
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
