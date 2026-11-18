// "Across four countries" on /research, and the insight cards at the top of the page.
// Counts only, no services named. Static HTML; shadcn chart look from charts.tsx.
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartCard, DotStrips, HeatGrid, HorizontalBars, StackedBars } from "@/components/charts"
import { ANSWER_KINDS, type CountriesData } from "@/lib/countries"

const pct = (yes: number, of: number) => (of ? Math.round((100 * yes) / of) : 0)

// "1 in 5" reads better than "21%" for small shares; large shares stay as a percentage.
export function oneIn(yes: number, of: number): string {
  if (!of || !yes) return "None"
  const share = yes / of
  if (share >= 0.45) return `${Math.round(share * 100)}%`
  return `1 in ${Math.round(1 / share)}`
}

export type Withdrawals = { completed: number; approved: number; withdrawn: number; share: number; source: string }

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
  footer: string
}) {
  return (
    <Card className="gap-4">
      <CardHeader className="gap-2">
        <CardDescription>{eyebrow}</CardDescription>
        <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">{figure}</CardTitle>
        <p className="text-sm leading-snug font-medium">{claim}</p>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      <CardFooter className="mt-auto text-xs leading-snug text-muted-foreground">{footer}</CardFooter>
    </Card>
  )
}

export function InsightCards({ data, withdrawals }: { data: CountriesData; withdrawals?: Withdrawals }) {
  const byCountry = (f: (c: CountriesData["countries"][number]) => { yes: number; of: number }) =>
    data.countries
      .filter((c) => f(c).of > 0)
      .map((c) => ({ label: c.name, value: pct(f(c).yes, f(c).of), display: `${pct(f(c).yes, f(c).of)}%` }))
  const nCountries = data.countries.length
  const scope = `Across ${data.allForms} first-contact forms in ${nCountries} ${nCountries === 1 ? "country" : "countries"}, read from the live page. Not yet checked by a person.`
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <InsightCard
        eyebrow="Before anyone has spoken to you"
        figure={`${data.allMedian} questions`}
        claim="is what a typical first-contact form asks"
        footer={`From ${data.shortest} to ${data.longest} questions. ${scope}`}
      >
        <HorizontalBars
          compact
          data={data.countries.map((c) => ({ label: c.name, value: c.median, display: String(c.median) }))}
          labelWidth="grid-cols-[7.5rem_minmax(0,1fr)]"
        />
      </InsightCard>
      <InsightCard
        eyebrow="Personal details, early"
        figure={oneIn(data.asksSensitive.yes, data.asksSensitive.of)}
        claim="forms ask for a date of birth, or about health, ethnicity, faith or a criminal record, at first contact"
        footer={scope}
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
        claim="forms tell you when you will hear back"
        footer={`Of ${data.reply.of} forms where we looked for a reply time on the page.`}
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
          footer={withdrawals.source}
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
  const cols = data.countries.map((c) => ({ key: c.code, label: c.name, n: c.forms }))
  const kindClass: Record<string, string> = {
    typed: "bg-chart-5",
    pick: "bg-chart-3",
    tick: "bg-chart-2",
    date: "bg-chart-1",
    unknown: "bg-muted-foreground/30",
  }
  const topicRows = data.countries[0]?.topics.map((t, i) => ({
    label: t.label,
    note: t.sensitive ? "sensitive" : undefined,
    cells: Object.fromEntries(data.countries.map((c) => [c.code, { yes: c.topics[i].yes, of: c.topics[i].of }])),
  }))
  const sensitiveRows = topicRows?.filter((r) => r.note)
  const sum = (f: (c: CountriesData["countries"][number]) => number) => data.countries.reduce((n, c) => n + f(c), 0)
  const totalQs = sum((c) => c.totalQuestions)
  const typed = sum((c) => c.answerKinds.typed)
  const reqYes = sum((c) => c.required.yes)
  const reqOf = sum((c) => c.required.of)
  const topicShare = (label: string) => {
    const yes = sum((c) => c.topics.find((x) => x.label === label)?.yes ?? 0)
    return pct(yes, data.allForms)
  }
  return (
    <section aria-labelledby="countries" className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <Badge variant="secondary">United Kingdom, United States, Canada and Australia</Badge>
        <h2 id="countries" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          What the first form asks, in four countries
        </h2>
        <p className="leading-7">
          The first form someone fills in is often the first thing a service learns about them. We read{" "}
          {data.allForms} of these forms from the live page and measured each one the same way: how many questions
          it asks, what about, what kind of answer it wants, and whether it says when you will hear back.
        </p>
        <p className="leading-7 text-muted-foreground">
          No service is named. A computer read the forms and sorted each question into a topic, and nobody has checked
          the result yet, so read these as early patterns.
        </p>
      </div>

      <ChartCard
        title="How many questions"
        description="Each dot is one form"
        footer={{
          lead: `A typical form asks ${data.allMedian} questions`,
          note: `From ${data.shortest} to ${data.longest} across ${data.allForms} forms.`,
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
          title="What the forms ask about"
          description="Share of forms in each country that ask about each topic. Darker means more forms ask."
          footer={{
            lead: `${topicShare("Email address")}% ask for an email address and ${topicShare("Phone number")}% for a phone number`,
            note: "Topics marked sensitive are ones the rubric says should wait until after a conversation.",
          }}
        >
          <HeatGrid columns={cols} rows={topicRows} />
        </ChartCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="What kind of answer"
          description="All questions on the forms read, by the kind of answer they ask for"
          footer={{
            lead: `${pct(typed, totalQs)}% of ${totalQs.toLocaleString("en-GB")} questions ask for a typed answer`,
            note: "Pick one: a drop-down or a set of radio buttons.",
          }}
        >
          <StackedBars
            segments={ANSWER_KINDS.map((k) => ({ key: k.key, label: k.label, className: kindClass[k.key] }))}
            rows={data.countries.map((c) => ({
              label: c.name,
              total: c.totalQuestions,
              parts: c.answerKinds,
              note: `${c.totalQuestions} questions`,
            }))}
          />
        </ChartCard>
        <ChartCard
          title="Questions you must answer"
          description="Share of questions marked required, on forms that mark any"
          footer={{
            lead: reqOf ? `${pct(reqYes, reqOf)}% of questions are marked required` : "No form read marks its required questions",
            note: "Forms that do not mark required questions are left out.",
          }}
        >
          <HorizontalBars
            max={100}
            data={data.countries
              .filter((c) => c.required.of > 0)
              .map((c) => ({ label: c.name, value: pct(c.required.yes, c.required.of), display: `${pct(c.required.yes, c.required.of)}%` }))}
            labelWidth="sm:grid-cols-[8rem_minmax(0,1fr)]"
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sensitiveRows && (
          <ChartCard
            title="Sensitive questions at first contact"
            description="Share of forms asking each, by country"
            footer={{
              lead: `${data.asksSensitive.of - data.asksSensitive.yes} of ${data.asksSensitive.of} forms ask none of these`,
              note: "A service may still have good reason to ask; this counts, it does not judge.",
            }}
          >
            <HeatGrid columns={cols} rows={sensitiveRows} />
          </ChartCard>
        )}
        <ChartCard
          title="Saying when you will hear back"
          description="Share of forms that state a reply time on the page"
          footer={{
            lead: `${data.reply.yes} of ${data.reply.of} forms state one`,
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
        title="the measures by country"
        head={["Country", "Forms", "Typical questions", "Required", "Ask something sensitive", "State a reply time"]}
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
