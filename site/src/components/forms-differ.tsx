// "How first-contact forms differ": the census on /research, with no names.
// Static HTML only. Hover text uses the title attribute; the table view uses <details>.
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { FormsDiffer as Data, Measure } from "@/lib/forms-differ"

// The site's Content-Security-Policy blocks inline styles, so positions use fixed classes.
const AXIS_MAX = 20
const TICKS: [number, string][] = [
  [0, "col-start-1"],
  [5, "col-start-6"],
  [10, "col-start-11"],
  [15, "col-start-16"],
  [20, "col-start-21"],
]

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

const formsWord = (n: number) => (n === 1 ? "form" : "forms")

function describe(values: number[]): string {
  if (!values.length) return "No forms read"
  const lo = values[0]
  const hi = values[values.length - 1]
  const range = lo === hi ? `all ${lo} questions` : `${lo} to ${hi} questions`
  return `${values.length} ${formsWord(values.length)}, ${range}, typically ${median(values)}`
}

// One row of the dot plot: a column per number of questions, dots stacked where forms tie.
function Strip({ group, values }: { group: string; values: number[] }) {
  const counts = Array.from({ length: AXIS_MAX + 1 }, (_, n) => values.filter((v) => v === n).length)
  const summary = describe(values)
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="text-sm font-medium">{group}</h4>
        <p className="text-sm text-muted-foreground tabular-nums">{summary}</p>
      </div>
      <div
        role="img"
        aria-label={`${group}: ${summary}.`}
        className="grid h-16 grid-cols-[repeat(21,minmax(0,1fr))] border-b border-border"
      >
        {counts.map((n, i) => (
          <div key={i} className="flex flex-col-reverse items-center gap-0.5 pb-0.5">
            {Array.from({ length: n }, (_, j) => (
              <span
                key={j}
                title={`${i} questions`}
                className="size-2 rounded-full bg-primary ring-2 ring-card sm:size-2.5"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Axis() {
  return (
    <div aria-hidden="true" className="space-y-1">
      <div className="grid grid-cols-[repeat(21,minmax(0,1fr))] text-xs text-muted-foreground tabular-nums">
        {TICKS.map(([t, col]) => (
          <span key={t} className={`row-start-1 text-center ${col}`}>
            {t}
          </span>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Number of questions on the form</p>
    </div>
  )
}

function QuestionsTable({ rows }: { rows: Data["questions"] }) {
  const seen = [...new Set(rows.flatMap((r) => r.values))].sort((a, b) => a - b)
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-medium underline underline-offset-4">Show as a table</summary>
      <Table className="mt-3">
        <TableHeader>
          <TableRow>
            <TableHead>Questions</TableHead>
            {rows.map((r) => (
              <TableHead key={r.group} className="text-right">
                {r.group}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {seen.map((n) => (
            <TableRow key={n}>
              <TableCell className="tabular-nums">{n}</TableCell>
              {rows.map((r) => {
                const k = r.values.filter((v) => v === n).length
                return (
                  <TableCell key={r.group} className="text-right tabular-nums">
                    {k ? `${k} ${formsWord(k)}` : "–"}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </details>
  )
}

// A meter list: one row per group, a bar and a figure, bars aligned.
// Each bar has one segment per form, filled where the answer is yes, with a 2px gap between.
function MeterCard({ m }: { m: Measure }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base leading-snug">{m.label}</CardTitle>
        <CardDescription>{m.note}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {m.rows.map((r) => {
            return (
              <li
                key={r.group}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[10rem_minmax(0,1fr)_4.5rem]"
              >
                <span>{r.group}</span>
                <span className="text-right tabular-nums sm:order-last">
                  {r.of ? `${r.yes} of ${r.of}` : "Not checked"}
                </span>
                <span
                  role="img"
                  aria-label={r.of ? `${r.yes} of ${r.of} forms` : "Not checked"}
                  title={r.of ? `${r.yes} of ${r.of} forms` : "Not checked"}
                  className="col-span-2 flex h-2 gap-0.5 sm:col-span-1"
                >
                  {Array.from({ length: r.of }, (_, i) => (
                    <span
                      key={i}
                      className={`flex-1 first:rounded-l-full last:rounded-r-full ${i < r.yes ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function FormsDiffer({ data }: { data: Data }) {
  const d = data
  const allQ = d.questions.flatMap((r) => r.values).sort((a, b) => a - b)
  const reply = d.measures.find((m) => m.id === "reply-time")?.rows ?? []
  const replyYes = reply.reduce((n, r) => n + r.yes, 0)
  const replyOf = reply.reduce((n, r) => n + r.of, 0)
  return (
    <section aria-labelledby="how-forms-differ" className="scroll-m-20 space-y-6">
      <div className="max-w-3xl space-y-4">
        <h2 id="how-forms-differ" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          How first-contact forms differ
        </h2>
        <p className="leading-7">
          We read {d.read} first-contact forms from fostering and adoption services across the UK, straight from their
          live pages, on {longDate(d.checked)}. The shortest form asks {allQ[0]} questions and the longest asks{" "}
          {allQ[allQ.length - 1]}. Of the {replyOf} forms we checked, {replyYes} say when you will hear back.
        </p>
        <p className="leading-7 text-muted-foreground">
          We do not name the services here, and each chart stands on its own, so a form cannot be traced from one chart
          to the next. Each service will see its own results privately first, with time to correct them.
        </p>
      </div>

      <Alert className="max-w-3xl">
        <AlertTitle>First pass, not yet checked by a person</AlertTitle>
        <AlertDescription>
          <p>
            An automated reader turned each page into text. That does not always show which questions are required, so
            some counts may be out by one or two. We left out {d.leftOut} more {formsWord(d.leftOut)} that we saw only
            through a search engine&rsquo;s copy. The scoring method is on{" "}
            <a href="/form-check" className="font-medium text-foreground underline underline-offset-4">
              Form check
            </a>
            .
          </p>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-snug">How many questions each form asks</CardTitle>
          <CardDescription>
            Each dot is one form. Consent boxes, and questions that appear only after an earlier answer, are not
            counted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {d.questions.map((r) => (
            <Strip key={r.group} group={r.group} values={r.values} />
          ))}
          <Axis />
          <QuestionsTable rows={d.questions} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {d.measures.map((m) => (
          <MeterCard key={m.id} m={m} />
        ))}
      </div>

      <p className="max-w-3xl text-sm text-muted-foreground">
        Councils and hubs includes regional services. Adoption agencies work under different regulations from fostering
        services, so their forms are shown for comparison. Where a service has a form for an information pack and a
        separate enquiry form, each is counted. The figures beside each bar count only the forms where we could tell; a form we
        could not check for that question is left out of that bar.
      </p>
    </section>
  )
}
