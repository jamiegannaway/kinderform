import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Tag } from "@/components/tag"

type Patterns = {
  readable: number
  sensitive: number
  spareRoom: number
  replyChecked: number
  replyStated: number
  byGroup: Record<Group, { n: number; medianQuestions: number; sensitive: number; spareRoom: number }>
}
type CoverageRow = { country: string; region: string; primary: number; read: number }

const link = "font-medium text-foreground underline underline-offset-4"

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
          <Illustration
            name="details"
            className="mb-6 block w-36 lg:absolute lg:top-8 lg:right-0 lg:mb-0 lg:w-56 xl:w-64"
          />
          <Tag tone="blue">Draft for comment</Tag>
          <h1 id="fc-title" className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Form check
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Form check is our draft checklist for enquiry forms. It gives a form points out of 100, from the side of the person filling it in. We have not published any service&rsquo;s result.
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            It looks at pages and processes, never at staff, and we would like your comments.
          </p>
          <Alert className="mt-8 max-w-3xl">
            <AlertTitle>No service is named or scored here yet</AlertTitle>
            <AlertDescription>
              <p>
                We will follow{" "}
                <a href="#fc-results" className={link}>
                  4 steps
                </a>{" "}
                before we name anyone. The facts about each form are on the{" "}
                <a href="/compare/forms" className={link}>
                  compare page
                </a>
                .
              </p>
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
          <H2 id="fc-patterns">What we found so far</H2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            These counts use the {p.readable} UK enquiry forms a person recorded in {checked}, which we wrote the
            checklist from. The research page also counts forms a computer program read, so its numbers differ. The
            counts are not yet checked by a person.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat value={String(p.readable)} label="UK enquiry forms read" />
            <Stat value={`${p.replyStated} of ${p.replyChecked}`} label="Say when you will hear back (where we looked)" />
            <Stat value={`${p.sensitive} of ${p.readable}`} label="Ask sensitive questions" />
            <Stat value={`${p.spareRoom} of ${p.readable}`} label="Ask about a spare room" />
          </div>
          <Table className="mt-8">
            <TableCaption>
              Sensitive questions ask about things such as date of birth, ethnicity, health, criminal record or
              immigration status. Councils and hubs include regional services.
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
            It lists what a good enquiry form and first reply do, worth 100 points in all. Some areas need the
            service&rsquo;s own data.
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
                    <Tag tone={d.seen ? "teal" : "violet"}>{d.seen ? "The public web page" : "The service's own data"}</Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Card className="mt-8 max-w-3xl">
            <CardHeader>
              <CardTitle>Things that need fixing first</CardTitle>
              <CardDescription>
                Any one of these limits a form to 50 out of 100, as it can put people off.
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

        <section aria-labelledby="fc-results" className="scroll-m-20 py-12">
          <H2 id="fc-results">Services will see their own results before we publish any names</H2>
          <ol className="mt-6 ml-5 max-w-2xl list-decimal space-y-3 leading-7">
            <li>We publish this draft method and ask carers, services and sector bodies for comments.</li>
            <li>Each service gets its own results in private, with time to correct them.</li>
            <li>We report patterns across the sector, and name examples of good practice.</li>
            <li>Named results for every service come last.</li>
          </ol>
        </section>

        <Separator />

        <section aria-labelledby="fc-coverage" className="py-12">
          <details className="max-w-3xl leading-7 text-muted-foreground">
            <summary
              id="fc-coverage"
              className="cursor-pointer font-medium text-foreground underline-offset-4 hover:underline"
            >
              How we did this
            </summary>
            <p className="mt-2">How many enquiry forms we found, and could read, in each place.</p>
            <Table className="mt-4 text-foreground">
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
                      <Tag tone="amber">Not started</Tag>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <p className="mt-4 text-sm">
              In the United States, we plan to cover every state, and every county where counties run fostering.
            </p>
          </details>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
