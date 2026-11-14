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
import { CAPS, DOMAINS } from "@/lib/form-check"

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
        <section aria-labelledby="fc-title" className="pt-8 pb-12 md:pt-14">
          <Badge variant="secondary">Draft method, shared for comment</Badge>
          <h1 id="fc-title" className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Form check
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            How do fostering and adoption enquiry forms treat the people who fill them in? Form check
            looks at each form from the side of the person enquiring: how much it asks, whether it says
            when you will hear back, and how it handles your details.
          </p>
          <Alert className="mt-8 max-w-3xl">
            <AlertTitle>No service is named or scored here yet</AlertTitle>
            <AlertDescription>
              Each service will see its own results privately, with time to correct them, before anything
              is published by name. The counts below come from a first pass, read by an automated reader
              and not yet checked by hand.
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
          <H2 id="fc-patterns">What the first pass found</H2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            First-contact forms in the UK whose questions we could read. Checked {checked}.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat value={String(p.readable)} label="Forms read" />
            <Stat value={`${p.replyStated} of ${p.replyChecked}`} label="Say when you will hear back" />
            <Stat value={`${p.sensitive} of ${p.readable}`} label="Ask sensitive questions at first contact" />
            <Stat value={`${p.spareRoom} of ${p.readable}`} label="Ask about a spare room at first contact" />
          </div>
          <Table className="mt-8">
            <TableCaption>
              Sensitive questions means date of birth, ethnicity, health, criminal record or immigration
              status. Councils and hubs includes regional services.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Who runs the form</TableHead>
                <TableHead className="text-right">Forms read</TableHead>
                <TableHead className="text-right">Typical number of questions</TableHead>
                <TableHead className="text-right">Sensitive questions</TableHead>
                <TableHead className="text-right">Spare room question</TableHead>
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
          <H2 id="fc-method">What we look at</H2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Nine areas, weighted to 100 points. Some can be judged from a web page. Others need
            information from the service itself, so a page alone cannot score them.
          </p>
          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>What we look for</TableHead>
                <TableHead className="text-right">Weight</TableHead>
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
                    <Badge variant="outline">{d.seen ? "The public page" : "The service's own data"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Card className="mt-8 max-w-3xl">
            <CardHeader>
              <CardTitle>Things that need fixing first</CardTitle>
              <CardDescription>
                Any one of these limits a form to half marks, because each can stop someone at the door
                or break their trust.
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
          <H2 id="fc-coverage">Where we have looked</H2>
          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Nation or state</TableHead>
                <TableHead className="text-right">First-contact forms found</TableHead>
                <TableHead className="text-right">Questions read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverage.map((r) => (
                <TableRow key={`${r.country}-${r.region}`}>
                  <TableCell>{r.country === "UK" ? "United Kingdom" : "United States"}</TableCell>
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
            In the United States, foster care runs through state agencies, and in some states through
            counties and private agencies. Form check is built to cover each state and, where needed, each
            county.
          </p>
        </section>

        <Separator />

        <section aria-labelledby="fc-results" className="py-12">
          <H2 id="fc-results">How results will be shared</H2>
          <ol className="mt-6 ml-5 max-w-2xl list-decimal space-y-3 leading-7">
            <li>We publish this method and invite comment from carers, services and sector bodies.</li>
            <li>Each service gets its own results privately, with time to correct errors and make changes.</li>
            <li>Public reporting starts with patterns across the sector and named examples of good practice.</li>
            <li>Named results for every service come last, always about the page and process, never the staff.</li>
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
