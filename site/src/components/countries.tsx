// "Across countries" on /research, and the insight cards at the top of the page.
// Counts only, no services named. Static HTML; shadcn chart look from charts.tsx.
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartCard, DotStrips, HeatGrid, HorizontalBars, StackedBars } from "@/components/charts"
import { type CountriesData } from "@/lib/countries"

const pct = (yes: number, of: number) => (of ? Math.round((100 * yes) / of) : 0)
const listNames = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`)
const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

// "1 in 5" reads better than "21%" for small shares; large shares stay as a percentage.
export function oneIn(yes: number, of: number): string {
  if (!of || !yes) return "None"
  const share = yes / of
  if (share >= 0.45) return `${Math.round(share * 100)}%`
  return `1 in ${Math.round(1 / share)}`
}

// Method detail for a section on /research: closed until the reader opens it, with no JavaScript.
export function HowWeDidThis({ children }: { children: React.ReactNode }) {
  return (
    <details className="max-w-3xl text-sm leading-6">
      <summary className="cursor-pointer font-medium underline-offset-4 hover:underline">How we did this</summary>
      <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
    </details>
  )
}

export type Withdrawals = {
  completed: number
  approved: number
  withdrawn: number
  share: number
  source: { label: string; url: string; checked: string | null }
}

// A finding card: what it means in one line, the figure, a small chart, and where it comes from.
function InsightCard({
  eyebrow,
  figure,
  claim,
  children,
  footer,
}: {
  eyebrow: string
  figure: string
  claim: string
  children?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card className="gap-4">
      <CardHeader className="gap-2">
        <CardDescription>{eyebrow}</CardDescription>
        <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">{figure}</CardTitle>
        <p className="text-sm leading-snug font-medium">{claim}</p>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter className="mt-auto text-xs leading-snug text-muted-foreground">{footer}</CardFooter>}
    </Card>
  )
}

export function InsightCards({ data, withdrawals }: { data: CountriesData; withdrawals?: Withdrawals }) {
  const byCountry = (f: (c: CountriesData["countries"][number]) => { yes: number; of: number }) =>
    data.countries
      .filter((c) => f(c).of > 0)
      .map((c) => ({ label: c.name, value: pct(f(c).yes, f(c).of), display: `${pct(f(c).yes, f(c).of)}%` }))
  const nCountries = data.countries.length
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          eyebrow="Before anyone has spoken to you"
          figure={`${data.allMedian} questions`}
          claim="is what a typical enquiry form asks"
          footer={`Forms ask from ${data.shortest} to ${data.longest} questions.`}
        >
          <HorizontalBars
            compact
            data={data.countries.map((c) => ({ label: c.name, value: c.median, display: String(c.median) }))}
            labelWidth="grid-cols-[7.5rem_minmax(0,1fr)]"
          />
        </InsightCard>
        <InsightCard
          eyebrow="Sensitive questions, early"
          figure={oneIn(data.asksSensitive.yes, data.asksSensitive.of)}
          claim="enquiry forms ask something sensitive, most often date of birth or ethnicity"
        >
          <HorizontalBars
            compact
            max={100}
            data={byCountry((c) => ({ yes: c.asksSensitive, of: c.forms }))}
            labelWidth="grid-cols-[7.5rem_minmax(0,1fr)]"
          />
        </InsightCard>
        <InsightCard
          eyebrow="Knowing what happens next"
          figure={oneIn(data.reply.yes, data.reply.of)}
          claim="enquiry forms say when you will hear back"
          footer={`Of ${data.reply.of} forms where we looked for a reply time.`}
        >
          <HorizontalBars
            compact
            max={100}
            data={byCountry((c) => ({ yes: c.reply.stated, of: c.reply.of }))}
            labelWidth="grid-cols-[7.5rem_minmax(0,1fr)]"
          />
        </InsightCard>
        {withdrawals && (
          <InsightCard
            eyebrow="After applying, in England"
            figure={`${withdrawals.share}%`}
            claim="of finished fostering applications ended in withdrawal, not approval"
            footer={
              <p>
                Source:{" "}
                <a href={withdrawals.source.url} className="underline underline-offset-4">
                  {withdrawals.source.label}
                </a>
                .{" "}
                {withdrawals.source.checked
                  ? `A person checked it on ${longDate(withdrawals.source.checked)}.`
                  : "Not yet checked by a person."}
              </p>
            }
          >
            <StackedBars
              segments={[
                { key: "withdrawn", label: "Withdrawn", className: "bg-primary" },
                { key: "approved", label: "Approved", className: "bg-chart-2" },
              ]}
              rows={[
                {
                  label: `${withdrawals.completed.toLocaleString("en-GB")} finished applications`,
                  total: withdrawals.completed,
                  parts: { withdrawn: withdrawals.withdrawn, approved: withdrawals.approved },
                },
              ]}
            />
          </InsightCard>
        )}
      </div>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        The first 3 figures come from {data.allForms} enquiry forms in {nCountries}{" "}
        {nCountries === 1 ? "country" : "countries"}. We read them on their live web pages
        {data.checked ? `, most recently on ${longDate(data.checked)}` : ""}. They are not yet checked by a person. The{" "}
        <a href="/compare/forms" className="font-medium text-foreground underline underline-offset-4">
          compare page
        </a>{" "}
        lists every form.
      </p>
    </div>
  )
}

function TableView({ title, head, rows }: { title: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-medium underline underline-offset-4">Show {title} as a table</summary>
      <Table className="mt-3">
        <TableHeader>
          <TableRow>
            {head.map((h, i) => (
              <TableHead key={h} className={i ? "text-right" : ""}>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={String(r[0])}>
              {r.map((c, i) => (
                <TableCell key={i} className={i ? "text-right tabular-nums" : ""}>
                  {c}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </details>
  )
}

export default function Countries({ data }: { data: CountriesData }) {
  const cols = data.countries.map((c) => ({ key: c.code, label: c.name, short: c.code, n: c.forms }))
  const topicRows = data.countries[0]?.topics.map((t, i) => ({
    label: t.label,
    note: t.sensitive ? "sensitive" : undefined,
    cells: Object.fromEntries(data.countries.map((c) => [c.code, { yes: c.topics[i].yes, of: c.topics[i].of }])),
  }))
  const sensitiveRows = topicRows?.filter((r) => r.note)
  // Answer kinds as a heat grid too: five kinds are too many for the grey chart tokens to keep
  // apart in a stacked bar, in both themes.
  const sum = (f: (c: CountriesData["countries"][number]) => number) => data.countries.reduce((n, c) => n + f(c), 0)
  const topicShare = (label: string) => {
    const yes = sum((c) => c.topics.find((x) => x.label === label)?.yes ?? 0)
    return pct(yes, data.allForms)
  }
  const n = data.countries.length
  // Side by side, two heat grids fit four countries. With more, each card takes the full width.
  const pairs = n > 4 ? "grid gap-6 *:min-w-0" : "grid gap-6 *:min-w-0 lg:grid-cols-2"
  return (
    <section aria-labelledby="countries" className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <h2 id="countries" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          In {n} {n === 1 ? "country" : "countries"}, a typical enquiry form asks {data.allMedian} questions
        </h2>
        <p className="leading-7">
          Only {data.reply.yes} of {data.reply.of} forms say when you will hear back. We read {data.allForms} enquiry
          forms in {listNames(data.countries.map((c) => (/^United /.test(c.name) ? `the ${c.name}` : c.name)))}.
        </p>
        <p className="leading-7 text-muted-foreground">
          These results are not yet checked by a person. The{" "}
          <a href="/compare/forms" className="font-medium text-foreground underline underline-offset-4">
            compare page
          </a>{" "}
          lists each form.
        </p>
        <HowWeDidThis>
          <p>
            A computer program read each form on its live web page. It counted the questions and sorted each one into a
            topic. It also noted what kind of answer each question wants, and whether the form says when you will hear
            back. We measured every form the same way.
          </p>
        </HowWeDidThis>
      </div>

      <ChartCard
        title="How many questions each enquiry form asks"
        description="Each dot is one form"
        footer={{
          lead: `A typical form asks ${data.allMedian} questions`,
          note: `The ${data.allForms} forms ask from ${data.shortest} to ${data.longest}.`,
        }}
      >
        <DotStrips
          rows={data.countries.map((c) => ({
            label: c.name,
            values: c.questions,
            note: `${c.forms} forms, typically ${c.median} questions`,
          }))}
          axisLabel="Questions on the form"
        />
      </ChartCard>

      {topicRows && (
        <ChartCard
          title="What enquiry forms ask about"
          description="The share of forms in each country that ask about each topic. Darker means more."
          footer={{
            lead: `${topicShare("Email address")}% ask for an email address and ${topicShare("Phone number")}% for a phone number`,
            note: "Our draft checklist says sensitive topics should wait until after a conversation.",
          }}
        >
          <HeatGrid columns={cols} rows={topicRows} />
        </ChartCard>
      )}


      <div className={pairs}>
        {sensitiveRows && (
          <ChartCard
            title="Which sensitive questions enquiry forms ask"
            description="The share of forms in each country that ask each one"
            footer={{
              lead: `${data.asksSensitive.of - data.asksSensitive.yes} of ${data.asksSensitive.of} forms ask none of these`,
              note: "We count these questions. We do not judge them.",
            }}
          >
            <HeatGrid columns={cols} rows={sensitiveRows} />
          </ChartCard>
        )}
        <ChartCard
          title="How many enquiry forms say when you will hear back"
          description="The share of forms in each country that give a reply time"
          footer={{
            lead: `${data.reply.yes} of ${data.reply.of} forms give a reply time`,
            note: data.countries
              .filter((c) => c.replyRange.length)
              .map((c) => `${c.name}: ${c.replyRange[0]}${c.replyRange.length > 1 ? ` to ${c.replyRange.at(-1)}` : ""}`)
              .join(". "),
          }}
        >
          <HorizontalBars
            max={100}
            data={data.countries
              .filter((c) => c.reply.of > 0)
              .map((c) => ({ label: c.name, value: pct(c.reply.stated, c.reply.of), display: `${c.reply.stated} of ${c.reply.of}` }))}
            labelWidth="sm:grid-cols-[8rem_minmax(0,1fr)]"
          />
        </ChartCard>
      </div>

      <TableView
        title="these measures by country"
        head={["Country", "Forms", "Typical number of questions", "Questions marked as required", "Ask something sensitive", "Give a reply time"]}
        rows={data.countries.map((c) => [
          c.name,
          c.forms,
          c.median,
          c.required.of ? `${pct(c.required.yes, c.required.of)}%` : "Not marked",
          `${c.asksSensitive} of ${c.forms}`,
          `${c.reply.stated} of ${c.reply.of}`,
        ])}
      />
    </section>
  )
}
