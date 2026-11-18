// "The US picture" on /research: counts from the US front-door register, with no names.
// Static HTML only. The site's Content-Security-Policy blocks inline styles, so every
// size comes from a fixed class: bars are rows of equal segments, filled in proportion.
import { Badge } from "@/components/ui/badge"
import {
  ChartCard,
  ColumnBars,
  HorizontalBars,
  Legend,
  StackedBars,
  StatCard,
  type BarDatum,
} from "@/components/charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Share, Tile, UsPicture as Data } from "@/lib/us-register"

const fmt = (n: number) => n.toLocaleString("en-GB")
const pct = (yes: number, of: number) => (of ? Math.round((100 * yes) / of) : 0)
const states = (n: number) => `${n} ${n === 1 ? "state" : "states"}`

const shareBars = (rows: Share[]): BarDatum[] =>
  rows.map((r) => ({ label: r.label, value: pct(r.yes, r.of), display: `${pct(r.yes, r.of)}%` }))

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
      <Legend
        items={data.models.map((m) => ({ key: m.model, label: `${m.label} (${m.count})`, className: TILE[m.model] }))}
      />
    </div>
  )
}

export default function UsPicture({ data }: { data: Data }) {
  const share = (label: string) => data.enquiry.topics.find((t) => t.label === label)
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
        <StatCard label="States and DC" value={fmt(data.jurisdictions)} note="All covered" />
        <StatCard label="Front doors found" value={fmt(data.doors)} note={`${fmt(data.privateAgencies)} private, ${fmt(data.tribal)} tribal`} />
        <StatCard label="Published rules" value={fmt(data.policies)} note="Age, training, licence and more" />
        <StatCard label="Form questions read" value={fmt(data.questions)} note={`From ${fmt(data.questionForms)} forms`} />
      </div>

      <ChartCard
        title="Who runs child welfare, and front doors found in each state"
        description="Each square is a state, placed roughly where it sits on the map. Where counties run child welfare, each county has its own front door."
        footer={{
          lead: `${data.models.find((m) => m.model === "county")?.count ?? 0} states run child welfare through their counties`,
          note: "So those states have many more front doors.",
        }}
      >
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
      </ChartCard>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Where the front door sits"
          description="Front doors by level"
          footer={{ lead: `${fmt(data.levels[0].value)} are county agencies`, note: `Of ${fmt(data.doors)} front doors found.` }}
        >
          <HorizontalBars data={data.levels} labelWidth="sm:grid-cols-[7rem_minmax(0,1fr)]" />
        </ChartCard>
        <ChartCard
          title="Who runs it"
          description="Includes private organisations a state pays to run its front door"
          footer={{ lead: `${fmt(data.privateAgencies)} private licensed agencies so far`, note: "A first sample of up to 10 per state." }}
        >
          <HorizontalBars data={data.sectors} labelWidth="sm:grid-cols-[9rem_minmax(0,1fr)]" />
        </ChartCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="What first-contact forms ask"
          description={`Share of the ${data.enquiry.of} enquiry forms read`}
          footer={
            phone
              ? {
                  lead: `${pct(phone.yes, phone.of)}% ask for a phone number`,
                  note: dob ? `${pct(dob.yes, dob.of)}% ask for a date of birth or age.` : "Topics are tagged by keyword rules and need review.",
                }
              : undefined
          }
        >
          <HorizontalBars data={shareBars(data.enquiry.topics)} max={100} labelWidth="sm:grid-cols-[14rem_minmax(0,1fr)]" />
          <TableView
            title="enquiry form topics"
            head={["Topic", "Forms", "Share"]}
            rows={data.enquiry.topics.map((t) => [t.label, `${t.yes} of ${t.of}`, `${pct(t.yes, t.of)}%`])}
          />
        </ChartCard>
        <ChartCard
          title="What application forms ask"
          description={`Beyond contact details. Share of the ${data.application.of} fillable application forms read`}
          footer={{ lead: "A full application asks much more than an enquiry", note: "Name, address and contact details are left out here." }}
        >
          <HorizontalBars data={shareBars(data.application.topics)} max={100} labelWidth="sm:grid-cols-[14rem_minmax(0,1fr)]" />
          <TableView
            title="application form topics"
            head={["Topic", "Forms", "Share"]}
            rows={data.application.topics.map((t) => [t.label, `${t.yes} of ${t.of}`, `${pct(t.yes, t.of)}%`])}
          />
        </ChartCard>
      </div>

      {data.replyDays.length > 0 && (
        <ChartCard
          title="How quickly front doors say they will reply"
          description="Front doors that publish a reply time, by the time they state"
          footer={{
            lead: `${data.replyDays.length} of ${fmt(data.pagesOpened)} front-door pages read publish a reply time`,
            note: `From ${data.replyDays[0]} to ${data.replyDays.at(-1)} days.`,
          }}
        >
          <ColumnBars
            data={[
              ["1 day", (d: number) => d <= 1],
              ["2 days", (d: number) => d > 1 && d <= 2],
              ["3 to 5 days", (d: number) => d > 2 && d <= 5],
              ["6 to 10 days", (d: number) => d > 5 && d <= 10],
              ["11 to 14 days", (d: number) => d > 10 && d <= 14],
            ].map(([label, test]) => ({
              label: label as string,
              value: data.replyDays.filter(test as (d: number) => boolean).length,
            }))}
            axisLabel="Stated time to first contact"
          />
          <TableView
            title="reply times"
            head={["Days", "Front doors"]}
            rows={[...new Set(data.replyDays)].map((d) => [String(d), data.replyDays.filter((x) => x === d).length])}
          />
        </ChartCard>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <ChartCard
          title="Minimum age to foster"
          description="States with a recorded figure"
          footer={commonAge ? { lead: `${commonAge.label} in ${states(commonAge.value)}` } : undefined}
        >
          <HorizontalBars
            data={data.minAge.map((b) => ({ ...b, display: states(b.value) }))}
            labelWidth="sm:grid-cols-[4.5rem_minmax(0,1fr)]"
          />
        </ChartCard>
        <ChartCard
          title="Training before licensing"
          description="Pre-service hours, states with a recorded figure"
          footer={(() => {
            const top = [...data.training].sort((a, b) => b.value - a.value)[0]
            return top ? { lead: `${top.label} is most common` } : undefined
          })()}
        >
          <HorizontalBars
            data={data.training.map((b) => ({ ...b, display: states(b.value) }))}
            labelWidth="sm:grid-cols-[7.5rem_minmax(0,1fr)]"
          />
        </ChartCard>
        <ChartCard
          title="How long a licence lasts"
          description="Licence term, states with a recorded figure"
          footer={(() => {
            const top = [...data.licenceTerm].sort((a, b) => b.value - a.value)[0]
            return top ? { lead: `${top.label} is most common` } : undefined
          })()}
        >
          <HorizontalBars
            data={data.licenceTerm.map((b) => ({ ...b, display: states(b.value) }))}
            labelWidth="sm:grid-cols-[4.5rem_minmax(0,1fr)]"
          />
        </ChartCard>
      </div>

      <ChartCard
        title="How far we have checked"
        description="Rows by the closest look taken so far"
        footer={{
          lead: `${fmt(data.verified)} of ${fmt(data.totalRows)} rows verified by a second person`,
          note: "Verification is the next phase.",
        }}
      >
        <StackedBars
          segments={[
            { key: "verified", label: "Verified by a person", className: "bg-primary" },
            { key: "opened", label: "Page or form opened", className: "bg-chart-2" },
            { key: "search", label: "Desk review only", className: "bg-chart-1" },
          ]}
          rows={data.evidence.map((r) => ({
            label: r.label,
            total: r.rows,
            parts: { verified: r.verified, opened: r.opened, search: r.searchOnly },
            note: `${fmt(r.opened + r.verified)} of ${fmt(r.rows)} opened`,
          }))}
        />
      </ChartCard>

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
