// "The US picture" on /research: counts from the US front-door register, with no names.
// Static HTML only. The site's Content-Security-Policy blocks inline styles, so every
// size comes from a fixed class: bars are rows of equal segments, filled in proportion.
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Bar, Share, Tile, UsPicture as Data } from "@/lib/us-register"

const fmt = (n: number) => n.toLocaleString("en-GB")
const pct = (yes: number, of: number) => (of ? Math.round((100 * yes) / of) : 0)

// A bar made of `total` equal segments, `filled` of them dark. Proportions without inline styles.
export function SegmentBar({ filled, total = 20, label }: { filled: number; total?: number; label: string }) {
  return (
    <span role="img" aria-label={label} title={label} className="flex h-2.5 w-full gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`flex-1 first:rounded-l-full last:rounded-r-full ${i < filled ? "bg-primary" : "bg-muted"}`}
        />
      ))}
    </span>
  )
}

export function Stat({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <Card className="gap-1 py-5">
      <CardContent className="space-y-1 px-5">
        <p className="text-3xl font-bold tracking-tight tabular-nums md:text-4xl">{value}</p>
        <p className="text-sm font-medium">{label}</p>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  )
}

function BarList({
  rows,
  unit,
  max,
  stacked = false,
}: {
  rows: Bar[]
  unit: (n: number) => string
  max?: number
  stacked?: boolean // label and figure above the bar, for narrow cards
}) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value))
  const layout = stacked
    ? "grid-cols-[minmax(0,1fr)_auto]"
    : "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[11rem_minmax(0,1fr)_7rem]"
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label} className={`grid items-center gap-x-4 gap-y-1.5 text-sm ${layout}`}>
          <span>{r.label}</span>
          <span className={`text-right tabular-nums text-muted-foreground ${stacked ? "" : "sm:order-last"}`}>
            {unit(r.value)}
          </span>
          <span className={stacked ? "col-span-2" : "col-span-2 sm:col-span-1"}>
            <SegmentBar filled={Math.round((20 * r.value) / top)} label={`${r.label}: ${unit(r.value)}`} />
          </span>
        </li>
      ))}
    </ul>
  )
}

function ShareList({ rows }: { rows: Share[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li
          key={r.label}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[13rem_minmax(0,1fr)_3.5rem]"
        >
          <span>{r.label}</span>
          <span className="text-right tabular-nums text-muted-foreground sm:order-last">{pct(r.yes, r.of)}%</span>
          <span className="col-span-2 sm:col-span-1">
            <SegmentBar filled={Math.round(pct(r.yes, r.of) / 5)} label={`${r.label}: ${r.yes} of ${r.of} forms`} />
          </span>
        </li>
      ))}
    </ul>
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
                  {typeof c === "number" ? fmt(c) : c}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </details>
  )
}

// Three greys from the theme, each with its own text colour, plus a dashed edge on the
// lightest so the three models differ by more than shade. Each tile is also labelled.
const TILE: Record<Tile["model"], string> = {
  state: "bg-primary text-primary-foreground",
  county: "bg-chart-2 text-white",
  hybrid: "border-2 border-dashed border-foreground/60 bg-muted text-foreground",
  unknown: "bg-muted text-muted-foreground",
}

function TileMap({ data }: { data: Data }) {
  return (
    <div className="space-y-4">
      <div
        role="img"
        aria-label={`Map of US states. ${data.models.map((m) => `${m.label}: ${m.count}`).join(". ")}. Each square shows the number of front doors found.`}
        className="mx-auto grid max-w-3xl grid-cols-11 gap-1 sm:gap-1.5"
      >
        {data.tiles.flatMap((row, r) =>
          row.map((t, c) =>
            t ? (
              <div
                key={t.code}
                title={`${t.code}: ${t.doors} front ${t.doors === 1 ? "door" : "doors"}`}
                className={`flex aspect-square flex-col items-center justify-center rounded-md ${TILE[t.model]}`}
              >
                <span className="text-[0.6rem] font-bold leading-none sm:text-sm">{t.code}</span>
                <span className="hidden text-xs leading-tight tabular-nums opacity-90 sm:block">{t.doors}</span>
              </div>
            ) : (
              <div key={`${r}-${c}`} aria-hidden="true" />
            ),
          ),
        )}
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {data.models.map((m) => (
          <li key={m.model} className="flex items-center gap-2">
            <span aria-hidden="true" className={`size-4 rounded ${TILE[m.model]}`} />
            {m.label} ({m.count})
          </li>
        ))}
      </ul>
    </div>
  )
}

// One column per day, a dot per front door that publishes a reply time.
function DayStrip({ days }: { days: number[] }) {
  const max = Math.max(14, ...days.map((d) => Math.ceil(d)))
  const cols = Array.from({ length: max + 1 }, (_, d) => days.filter((x) => Math.round(x) === d).length)
  return (
    <div className="space-y-1">
      <div
        role="img"
        aria-label={`${days.length} front doors publish a reply time, from ${days[0]} to ${days.at(-1)} days.`}
        className="grid h-24 grid-cols-[repeat(15,minmax(0,1fr))] border-b border-border"
      >
        {cols.slice(0, 15).map((n, d) => (
          <div key={d} className="flex flex-col-reverse items-center gap-0.5 pb-0.5">
            {Array.from({ length: n }, (_, j) => (
              <span key={j} title={`${d} ${d === 1 ? "day" : "days"}`} className="size-2.5 rounded-full bg-primary ring-2 ring-card" />
            ))}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="grid grid-cols-[repeat(15,minmax(0,1fr))] text-xs text-muted-foreground tabular-nums">
        {[0, 7, 14].map((t) => (
          <span key={t} className={`row-start-1 text-center ${t === 0 ? "col-start-1" : t === 7 ? "col-start-8" : "col-start-15"}`}>
            {t}
          </span>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Days within which the front door says it will make contact</p>
    </div>
  )
}

function EvidenceRows({ rows }: { rows: Data["evidence"] }) {
  return (
    <ul className="space-y-4">
      {rows.map((r) => {
        const seg = 40
        const opened = Math.round((seg * r.opened) / (r.rows || 1))
        const verified = Math.round((seg * r.verified) / (r.rows || 1))
        return (
          <li key={r.label} className="space-y-1.5 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="font-medium">{r.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {fmt(r.opened + r.verified)} of {fmt(r.rows)} opened, {fmt(r.verified)} verified
              </span>
            </div>
            <span
              role="img"
              aria-label={`${r.label}: ${r.opened} rows opened, ${r.verified} verified, ${r.searchOnly} from search results only`}
              className="flex h-2.5 gap-0.5"
            >
              {Array.from({ length: seg }, (_, i) => (
                <span
                  key={i}
                  className={`flex-1 first:rounded-l-full last:rounded-r-full ${
                    i < verified ? "bg-primary" : i < verified + opened ? "bg-chart-2" : "bg-muted"
                  }`}
                />
              ))}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default function UsPicture({ data }: { data: Data }) {
  const enquiry = data.enquiry
  const share = (label: string) => enquiry.topics.find((t) => t.label === label)
  const phone = share("Phone number")
  const dob = share("Date of birth or age")
  const commonAge = [...data.minAge].sort((a, b) => b.value - a.value)[0]
  return (
    <section aria-labelledby="us-picture" className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <Badge variant="secondary">United States, first pass</Badge>
        <h2 id="us-picture" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          The US picture
        </h2>
        <p className="leading-7">
          We are mapping every public place in the United States where someone can ask about fostering or adoption: state
          agencies, county agencies where counties run child welfare, tribal programmes and a first sample of private
          licensed agencies. We record what their forms ask, what they promise and each state's published rules.
        </p>
        <p className="leading-7 text-muted-foreground">
          These are counts, with no service named. Nearly every row comes from a desk review or a first automated read of
          the public page, and none has yet been checked by a second person, so treat them as early patterns.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat value={fmt(data.jurisdictions)} label="States and DC" note="all covered" />
        <Stat value={fmt(data.doors)} label="Front doors found" note={`${fmt(data.privateAgencies)} private, ${fmt(data.tribal)} tribal`} />
        <Stat value={fmt(data.policies)} label="Published rules" note="age, training, licence and more" />
        <Stat value={fmt(data.questions)} label="Form questions read" note={`from ${fmt(data.questionForms)} forms`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who runs child welfare, and front doors found in each state</CardTitle>
          <CardDescription>
            Each square is a state, placed roughly where it sits on the map. Where counties run child welfare, each county
            has its own front door, so those states have many more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TileMap data={data} />
          <TableView
            title="front doors by state"
            head={["State", "Who runs it", "Front doors"]}
            rows={data.tiles
              .flat()
              .filter((t): t is Tile => !!t)
              .sort((a, b) => a.code.localeCompare(b.code))
              .map((t) => [t.code, data.models.find((m) => m.model === t.model)?.label ?? "Not recorded", t.doors])}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where the front door sits</CardTitle>
            <CardDescription>Front doors by level.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList rows={data.levels} unit={fmt} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Who runs it</CardTitle>
            <CardDescription>Includes private organisations a state pays to run its front door.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList rows={data.sectors} unit={fmt} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What first-contact forms ask</CardTitle>
            <CardDescription>
              Share of the {enquiry.of} enquiry forms read that ask about each topic.
              {phone && dob && ` ${pct(phone.yes, phone.of)}% ask for a phone number and ${pct(dob.yes, dob.of)}% for a date of birth or age.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ShareList rows={enquiry.topics} />
            <TableView
              title="enquiry form topics"
              head={["Topic", "Forms", "Share"]}
              rows={enquiry.topics.map((t) => [t.label, `${t.yes} of ${t.of}`, `${pct(t.yes, t.of)}%`])}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What application forms ask, beyond contact details</CardTitle>
            <CardDescription>
              Share of the {data.application.of} fillable application forms read that ask about each topic. A full
              application properly goes further than a first enquiry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ShareList rows={data.application.topics} />
            <TableView
              title="application form topics"
              head={["Topic", "Forms", "Share"]}
              rows={data.application.topics.map((t) => [t.label, `${t.yes} of ${t.of}`, `${pct(t.yes, t.of)}%`])}
            />
          </CardContent>
        </Card>
      </div>

      {data.replyDays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How quickly front doors say they will reply</CardTitle>
            <CardDescription>
              {data.replyDays.length} of the {fmt(data.pagesOpened)} front-door pages read publish a reply time. Each dot
              is one front door.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DayStrip days={data.replyDays} />
            <TableView
              title="reply times"
              head={["Days", "Front doors"]}
              rows={[...new Set(data.replyDays)].map((d) => [String(d), data.replyDays.filter((x) => x === d).length])}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minimum age to foster</CardTitle>
            <CardDescription>
              {commonAge ? `${commonAge.label} in most states with a recorded figure.` : "States with a recorded figure."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList rows={data.minAge} unit={(n) => `${n} ${n === 1 ? "state" : "states"}`} stacked />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Training before licensing</CardTitle>
            <CardDescription>Pre-service training hours, states with a recorded figure.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList rows={data.training} unit={(n) => `${n} ${n === 1 ? "state" : "states"}`} stacked />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How long a licence lasts</CardTitle>
            <CardDescription>Licence term, states with a recorded figure.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList rows={data.licenceTerm} unit={(n) => `${n} ${n === 1 ? "state" : "states"}`} stacked />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How far we have checked</CardTitle>
          <CardDescription>
            Dark: verified by a second person. Middle: the page or form was opened and read. Light: from a desk review only.
            {` ${fmt(data.verified)} of ${fmt(data.totalRows)} rows are verified so far.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvidenceRows rows={data.evidence} />
        </CardContent>
      </Card>

      <p className="max-w-3xl text-sm text-muted-foreground">
        The data is open: the register, its column guide and the method are in the{" "}
        <a href="https://github.com/jamiegannaway/OUCM/tree/main/register/us" className="underline underline-offset-4">
          project repository
        </a>
        . Agencies are welcome to correct their own rows.
      </p>
    </section>
  )
}
