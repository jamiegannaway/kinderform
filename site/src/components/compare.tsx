// The compare pages: tables of enquiry forms, US application forms and rules, for fostering
// and adoption services to compare their own with others. Facts only: what a form asks and
// what a rule says, with the link and two dates. No scores, no rankings.
import { ArrowUpRight, Download } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Illustration } from "@/components/illustration"
import { SiteFooter, SiteHeader } from "@/components/site-header"
import {
  COUNTRY_NAMES,
  COUNTRY_ORDER,
  shortDate,
  type ApplicationRow,
  type FormRow,
  type PageDate,
  type RuleRow,
  type TopicInfo,
} from "@/lib/compare"

const LINK = "font-medium text-foreground underline underline-offset-4"
const WRAP = "whitespace-normal align-top"
const CORRECT = "mailto:jamie.gannaway@gmail.com?subject="

function Crumbs({ here }: { here?: string }) {
  return (
    <p className="mb-6 text-sm text-muted-foreground">
      <a href="/compare" className={LINK}>
        Compare
      </a>
      {here && (
        <>
          <span aria-hidden="true"> / </span>
          <span>{here}</span>
        </>
      )}
    </p>
  )
}

// The two dates every row carries: the date the page gives, and when we last read it. Where the
// date came from the page's metadata or a PDF rather than the words on the page, we say so.
const FROM: Record<string, string> = { metadata: "from the page's metadata", "pdf metadata": "from the PDF file" }

function Dates({ page, checked }: { page: PageDate | null; checked: string }) {
  const from = page?.from ? FROM[page.from.split(":")[0]] : ""
  return (
    <div className="grid gap-0.5 text-xs">
      {page?.broken ? (
        <span className="font-medium">Link did not work on {shortDate(page.read)}</span>
      ) : (
        <span>
          <span className="text-muted-foreground">Page updated: </span>
          {page?.updated ? shortDate(page.updated) : <span className="text-muted-foreground">not shown</span>}
          {page?.updated && from && <span className="block text-muted-foreground">{from}</span>}
        </span>
      )}
      <span>
        <span className="text-muted-foreground">We checked: </span>
        {shortDate(checked)}
      </span>
    </div>
  )
}

function Source({ href, label, note }: { href: string; label: string; note?: string }) {
  return (
    <div className="grid gap-0.5">
      <a href={href} className={`${LINK} inline-flex items-center gap-1 break-all`}>
        {label}
        <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
      </a>
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
  )
}

function SwipeHint() {
  return <p className="text-xs text-muted-foreground md:hidden">Swipe the table sideways to see every column.</p>
}

function FactsNotice() {
  return (
    <Alert className="max-w-3xl">
      <AlertTitle>Facts, not scores</AlertTitle>
      <AlertDescription>
        <p>
          These tables say what each form asks and what each rule says. They do not rate or rank anyone. A computer
          read most of the pages, and nobody has checked the rows yet.
        </p>
        <p>
          Is a row wrong or out of date?{" "}
          <a href={`${CORRECT}Correction%20to%20the%20compare%20tables`} className={LINK}>
            Email jamie.gannaway@gmail.com
          </a>{" "}
          with the row, the public source, what changed and the date you checked. Leave out personal details.
        </p>
      </AlertDescription>
    </Alert>
  )
}

function Downloads({ files }: { files: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((f) => (
        <Button key={f.href} asChild variant="outline" size="sm">
          <a href={f.href} download>
            <Download aria-hidden="true" />
            {f.label}
          </a>
        </Button>
      ))}
    </div>
  )
}

function Intro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="max-w-3xl space-y-5">
      <Badge variant="secondary">For fostering and adoption services</Badge>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">{title}</h1>
      {children}
    </section>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader current="/compare" />
      <main id="main" className="mx-auto max-w-6xl space-y-10 px-6 pt-6 pb-20 md:pt-10">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}

// ---- /compare ----------------------------------------------------------------------

export function CompareIndex({
  forms,
  formServices,
  rules,
  rulePlaces,
  topics,
  applications,
  formCountries,
  ruleCountries,
}: {
  formCountries: string
  ruleCountries: string
  forms: number
  formServices: number
  rules: number
  rulePlaces: number
  topics: number
  applications: number
}) {
  const cards = [
    {
      href: "/compare/forms",
      title: "Enquiry forms",
      figure: `${forms} forms`,
      body: `The first form someone fills in, from ${formServices} services in ${formCountries}. What each asks, what it asks beyond what a first reply needs, and any reply time it states.`,
    },
    {
      href: "/compare/rules",
      title: "Rules on who can foster",
      figure: `${rules} rules`,
      body: `Published rules from ${rulePlaces} countries and regions in ${ruleCountries}. They are grouped into ${topics} topics, such as minimum age, bedrooms, checks, training and allowances.`,
    },
    {
      href: "/compare/applications",
      title: "Application forms",
      figure: `${applications} forms`,
      body: "The forms that come after the first enquiry, in the UK and the US: what each is for, how many questions it asks and which sensitive topics.",
    },
  ]
  return (
    <Page>
      <section className="grid items-center gap-8 md:grid-cols-[minmax(0,48rem)_14rem] md:justify-between">
        <div className="space-y-5">
          <Badge variant="secondary">For fostering and adoption services</Badge>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            Compare forms and rules
          </h1>
          <p className="text-xl leading-8 text-muted-foreground">
            See how your enquiry form and your rules compare with other places. Each table links to the source and
            shows two dates: when the page says it was last updated, and when we last checked it.
          </p>
        </div>
        <Illustration name="details" className="mx-auto hidden w-full md:block" />
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <a key={c.href} href={c.href} className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <Card className="h-full transition-colors group-hover:bg-accent">
              <CardHeader>
                <CardDescription>{c.title}</CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums">{c.figure}</CardTitle>
                <p className="pt-2 text-sm leading-6 text-muted-foreground">{c.body}</p>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>

      <section aria-labelledby="downloads" className="space-y-3">
        <h2 id="downloads" className="text-xl font-semibold tracking-tight">
          Download the tables
        </h2>
        <p className="max-w-3xl leading-7 text-muted-foreground">
          Each table is also a spreadsheet file (CSV), with every column, so you can sort and filter it yourself.
        </p>
        <Downloads
          files={[
            { href: "/compare/forms.csv", label: "Enquiry forms (CSV)" },
            { href: "/compare/rules.csv", label: "Rules (CSV)" },
            { href: "/compare/applications.csv", label: "US application forms (CSV)" },
          ]}
        />
      </section>

      <FactsNotice />
    </Page>
  )
}

// ---- /compare/forms ----------------------------------------------------------------

export function CompareForms({ rows }: { rows: FormRow[] }) {
  const read = rows.filter((r) => r.questions !== null)
  const beyond = read.filter((r) => r.beyond.length)
  const counts = new Map<string, number>()
  for (const r of read) for (const b of r.beyond) counts.set(b, (counts.get(b) ?? 0) + 1)
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 4)
  const countries = COUNTRY_ORDER.filter((c) => rows.some((r) => r.country === c))
  return (
    <Page>
      <div>
        <Crumbs here="Enquiry forms" />
        <Intro title="Enquiry forms compared">
          <p className="text-xl leading-8 text-muted-foreground">
            The first form someone fills in to ask about fostering or adoption, from {rows.length} forms. Each row
            shows what the form asks, any reply time it states, a link, and two dates.
          </p>
          <p className="leading-7">
            {beyond.length} of the {read.length} forms we could read ask for something the{" "}
            <a href="/example-form" className={LINK}>
              Kinderform enquiry standard
            </a>{" "}
            leaves out. A first reply does not need these. The most common:{" "}
            {top.map(([label, n], i) => (
              <span key={label}>
                {i > 0 && (i === top.length - 1 ? " and " : ", ")}
                {label.toLowerCase()} ({n})
              </span>
            ))}
            .
          </p>
        </Intro>
      </div>

      <nav aria-label="Countries" className="flex flex-wrap items-center gap-2">
        {countries.map((c) => (
          <Button key={c} asChild variant="outline" size="sm">
            <a href={`#${c.toLowerCase()}`}>
              {COUNTRY_NAMES[c]} ({rows.filter((r) => r.country === c).length})
            </a>
          </Button>
        ))}
        <Downloads files={[{ href: "/compare/forms.csv", label: "Download (CSV)" }]} />
      </nav>

      <FactsNotice />

      {countries.map((c) => {
        const mine = rows.filter((r) => r.country === c)
        return (
          <section key={c} id={c.toLowerCase()} aria-labelledby={`${c}-title`} className="scroll-mt-6 space-y-4">
            <h2 id={`${c}-title`} className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {COUNTRY_NAMES[c]}{" "}
              <span className="text-base font-normal text-muted-foreground">{mine.length} forms</span>
            </h2>
            <SwipeHint />
            <Table className="min-w-[56rem]">
              <TableCaption className="sr-only">Enquiry forms in {COUNTRY_NAMES[c]}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-56">Service</TableHead>
                  <TableHead className="w-20 text-right">Questions</TableHead>
                  <TableHead>What it asks</TableHead>
                  <TableHead className="w-48">Beyond the standard</TableHead>
                  <TableHead className="w-32">Reply time stated</TableHead>
                  <TableHead className="w-40">Source</TableHead>
                  <TableHead className="w-40">Dates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mine.map((r) => (
                  <TableRow key={r.id}>
                    <TableHead scope="row" className={`${WRAP} font-normal`}>
                      <span className="font-medium">{r.service}</span>{" "}
                      <span className="block text-xs text-muted-foreground">
                        {[r.area, r.type, r.stage === "First contact" ? "" : r.stage].filter(Boolean).join(" · ")}
                      </span>
                    </TableHead>
                    <TableCell className="text-right align-top tabular-nums">
                      {r.questions ?? <span className="text-muted-foreground">Not read</span>}
                    </TableCell>
                    <TableCell className={`${WRAP} text-xs`}>{r.asks.join(", ") || "Not read"}</TableCell>
                    <TableCell className={`${WRAP} text-xs`}>
                      {r.questions === null ? "" : r.beyond.length ? r.beyond.join(", ") : "Nothing"}
                    </TableCell>
                    <TableCell className={`${WRAP} text-xs`}>
                      {r.reply || <span className="text-muted-foreground">{r.replyChecked ? "None" : "Not checked"}</span>}
                    </TableCell>
                    <TableCell className={`${WRAP} text-xs`}>
                      <Source href={r.link} label="Form" note={r.readFrom} />
                    </TableCell>
                    <TableCell className={WRAP}>
                      <Dates page={r.page} checked={r.checked} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )
      })}
    </Page>
  )
}

// ---- /compare/rules ----------------------------------------------------------------

export type TopicSummary = TopicInfo & { rules: number; places: number; byCountry: Record<string, number> }

export function CompareRulesIndex({
  topics,
  rules,
  places,
  countries,
}: {
  topics: TopicSummary[]
  rules: number
  places: number
  countries: string
}) {
  const groups = [...new Set(topics.map((t) => t.group))]
  return (
    <Page>
      <div>
        <Crumbs here="Rules" />
        <Intro title="Rules on who can foster, compared">
          <p className="text-xl leading-8 text-muted-foreground">
            {rules} published rules from {places} countries and regions in {countries}. Pick a topic to see every place side by side, with the source and two dates.
          </p>
        </Intro>
      </div>
      <Downloads files={[{ href: "/compare/rules.csv", label: "Download all rules (CSV)" }]} />
      <FactsNotice />
      {groups.map((g) => (
        <section key={g} aria-label={g} className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">{g}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics
              .filter((t) => t.group === g)
              .map((t) => (
                <a
                  key={t.code}
                  href={`/compare/rules/${t.code}`}
                  className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <Card className="h-full gap-2 transition-colors group-hover:bg-accent">
                    <CardHeader>
                      <CardTitle>{t.label}</CardTitle>
                      <CardDescription>{t.covers}</CardDescription>
                      <p className="pt-2 text-xs text-muted-foreground tabular-nums">
                        {t.rules} rules from {t.places} places:{" "}
                        {COUNTRY_ORDER.filter((c) => t.byCountry[c])
                          .map((c) => `${c} ${t.byCountry[c]}`)
                          .join(", ")}
                      </p>
                    </CardHeader>
                  </Card>
                </a>
              ))}
          </div>
        </section>
      ))}
    </Page>
  )
}

const APPLIES: Record<string, string> = { fostering: "Fostering", adoption: "Adoption", both: "Fostering and adoption" }

export function CompareTopic({ topic, rows }: { topic: TopicInfo; rows: RuleRow[] }) {
  const countries = COUNTRY_ORDER.filter((c) => rows.some((r) => r.country === c))
  return (
    <Page>
      <div>
        <Crumbs here={topic.label} />
        <Intro title={topic.label}>
          <p className="text-xl leading-8 text-muted-foreground">
            {topic.covers}. {rows.length} rules from {new Set(rows.map((r) => `${r.country}-${r.place}`)).size}{" "}
            places, with the source and two dates for each.
          </p>
        </Intro>
      </div>
      <nav aria-label="Countries" className="flex flex-wrap gap-2">
        {countries.map((c) => (
          <Button key={c} asChild variant="outline" size="sm">
            <a href={`#${c.toLowerCase()}`}>
              {COUNTRY_NAMES[c]} ({rows.filter((r) => r.country === c).length})
            </a>
          </Button>
        ))}
        <Button asChild variant="ghost" size="sm">
          <a href="/compare/rules">All topics</a>
        </Button>
      </nav>
      {countries.map((c) => {
        const mine = rows.filter((r) => r.country === c)
        return (
          <section key={c} id={c.toLowerCase()} aria-labelledby={`${c}-title`} className="scroll-mt-6 space-y-4">
            <h2 id={`${c}-title`} className="text-2xl font-semibold tracking-tight">
              {COUNTRY_NAMES[c]}
            </h2>
            <SwipeHint />
            <Table className="min-w-[48rem]">
              <TableCaption className="sr-only">
                {topic.label}: rules in {COUNTRY_NAMES[c]}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Place</TableHead>
                  <TableHead>What the rule says</TableHead>
                  <TableHead className="w-56">Source</TableHead>
                  <TableHead className="w-40">Dates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mine.map((r) => (
                  <TableRow key={r.id}>
                    <TableHead scope="row" className={`${WRAP} font-medium`}>
                      {r.place}
                      {r.appliesTo !== "fostering" && (
                        <span className="block text-xs font-normal text-muted-foreground">{APPLIES[r.appliesTo]}</span>
                      )}
                    </TableHead>
                    <TableCell className={`${WRAP} text-sm leading-6`}>
                      {r.value && (
                        <>
                          <span className="font-semibold tabular-nums">{r.value}.</span>{" "}
                        </>
                      )}
                      {r.summary}
                      {r.notes && <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>}
                    </TableCell>
                    <TableCell className={`${WRAP} text-xs`}>
                      <Source href={r.link} label={r.citation || "Source"} />
                    </TableCell>
                    <TableCell className={WRAP}>
                      <Dates page={r.page} checked={r.checked} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )
      })}
      <FactsNotice />
    </Page>
  )
}

// ---- /compare/applications ---------------------------------------------------------

export function CompareApplications({ rows }: { rows: ApplicationRow[] }) {
  const uk = rows.filter((r) => r.country === "UK")
  const us = rows.filter((r) => r.country === "US")
  const read = rows.filter((r) => r.questions !== null).length
  return (
    <Page>
      <div>
        <Crumbs here="Application forms" />
        <Intro title="Application forms compared">
          <p className="text-xl leading-8 text-muted-foreground">
            The forms that come after the first enquiry: {uk.length ? `${uk.length} from UK services and ` : ""}
            {us.length} from US states' application packets. We have read the questions on {read} of them. Licensed
            forms are named, not copied.
          </p>
        </Intro>
      </div>
      <Downloads files={[{ href: "/compare/applications.csv", label: "Download (CSV)" }]} />
      <FactsNotice />
      <SwipeHint />
      <Table className="min-w-[52rem]">
        <TableCaption className="sr-only">Application forms by country and place</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Place</TableHead>
            <TableHead>Form</TableHead>
            <TableHead className="w-36">What it is for</TableHead>
            <TableHead className="w-24">Questions</TableHead>
            <TableHead className="w-48">Sensitive topics it asks about</TableHead>
            <TableHead className="w-40">Source</TableHead>
            <TableHead className="w-40">Dates</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableHead scope="row" className={`${WRAP} font-medium`}>
                {r.state}
                <span className="block text-xs font-normal text-muted-foreground">{COUNTRY_NAMES[r.country]}</span>
              </TableHead>
              <TableCell className={`${WRAP} text-sm`}>
                {r.name}
                <span className="block text-xs text-muted-foreground">
                  {[r.body, r.licensed ? "Licensed: named, not copied" : ""].filter(Boolean).join(" · ")}
                </span>
              </TableCell>
              <TableCell className={`${WRAP} text-xs`}>{r.step}</TableCell>
              <TableCell className="text-sm tabular-nums">
                {r.questions ?? <span className="text-xs text-muted-foreground">Not read yet</span>}
              </TableCell>
              <TableCell className={`${WRAP} text-xs`}>
                {r.questions === null ? "" : r.sensitive.length ? r.sensitive.join(", ") : "None found"}
              </TableCell>
              <TableCell className={`${WRAP} text-xs`}>
                {r.link ? <Source href={r.link} label={r.format ? `Form (${r.format})` : "Form"} /> : "No link found"}
              </TableCell>
              <TableCell className={WRAP}>
                <Dates page={r.page} checked={r.checked} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Page>
  )
}
