// "The US picture" on /research: counts from the US front-door register, with no names.
// Static HTML only. The site's Content-Security-Policy blocks inline styles, so every
// size comes from a fixed class: bars are rows of equal segments, filled in proportion.
import {
  ChartCard,
  ColumnBars,
  HorizontalBars,
  Legend,
  StackedBars,
  StatCard,
} from "@/components/charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Tile, UsPicture as Data } from "@/lib/us-register"
import { HowWeDidThis } from "@/components/countries"

const fmt = (n: number) => n.toLocaleString("en-GB")
const states = (n: number) => `${n} ${n === 1 ? "state" : "states"}`

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

// Three greys from the theme, each with its own text colour at 4.5:1 contrast or more, plus a
// dashed edge on the lightest so the three models differ by more than shade. Each tile is labelled.
const TILE: Record<Tile["model"], string> = {
  state: "bg-primary text-primary-foreground",
  county: "bg-primary/70 text-primary-foreground",
  hybrid: "border-2 border-dashed border-foreground/60 bg-muted text-foreground",
  unknown: "bg-muted text-muted-foreground",
}

function TileMap({ data }: { data: Data }) {
  return (
    <div className="space-y-4">
      <div
        role="img"
        aria-label={`Map of US states. ${data.models.map((m) => `${m.label}: ${m.count}`).join(". ")}. The number on each square is how many places to get in touch we found there.`}
        className="mx-auto grid max-w-3xl grid-cols-11 gap-1 sm:gap-1.5"
      >
        {data.tiles.flatMap((row, r) =>
          row.map((t, c) =>
            t ? (
              <div
                key={t.code}
                title={`${t.code}: ${t.doors} ${t.doors === 1 ? "place" : "places"} to get in touch`}
                className={`flex aspect-square flex-col items-center justify-center rounded-md ${TILE[t.model]}`}
              >
                <span className="text-[0.6rem] font-bold leading-none sm:text-sm">{t.code}</span>
                <span className="hidden text-xs leading-tight tabular-nums sm:block">{t.doors}</span>
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
  const commonAge = [...data.minAge].sort((a, b) => b.value - a.value)[0]
  const countyStates = data.models.find((m) => m.model === "county")?.count ?? 0
  const replies = data.replyDays.length
  return (
    <section aria-labelledby="us-picture" className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <h2 id="us-picture" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          In the United States, we found {fmt(data.doors)} places to get in touch
        </h2>
        <p className="leading-7">
          In {states(countyStates)}, each county runs its own child welfare service. So each county has its own place
          to get in touch. {replies ? `Only ${replies}` : "None"} of the {fmt(data.pagesOpened)} web pages we read say
          when they will reply. This counts pages, not forms.
        </p>
        <p className="leading-7 text-muted-foreground">
          {data.verified
            ? `A person has checked ${fmt(data.verified)} of the ${fmt(data.totalRows)} rows so far.`
            : "These results are not yet checked by a person."}{" "}
          The data is open in the{" "}
          <a
            href="https://github.com/jamiegannaway/kinderform/tree/main/register/us"
            className="font-medium text-foreground underline underline-offset-4"
          >
            project repository
          </a>
          .
        </p>
        <HowWeDidThis>
          <p>
            We are mapping every public place in the United States where someone can ask about fostering or adoption.
            That means state and county agencies, tribal programmes and a first sample of private licensed agencies. We
            also record what their forms ask, what they promise and each state&rsquo;s published rules.
          </p>
          <p>
            Nearly every row comes from search results or a first read of the page by a computer program. The
            repository holds the register, its column guide and the method. There, a place to get in touch is called a
            front door. Agencies are welcome to correct their own rows.
          </p>
          <div className="pt-2 text-base leading-normal">
            <ChartCard
              title="How closely we have looked at the US data"
              description="Rows in each part of our data, by the closest look we have taken so far"
              footer={{ lead: `${fmt(data.verified)} of ${fmt(data.totalRows)} rows checked by a person so far` }}
            >
              <StackedBars
                segments={[
                  { key: "verified", label: "Checked by a person", className: "bg-primary" },
                  { key: "opened", label: "Page or form opened", className: "bg-chart-2" },
                  { key: "search", label: "Search results only", className: "bg-chart-1" },
                ]}
                rows={data.evidence.map((r) => ({
                  label: r.label,
                  total: r.rows,
                  parts: { verified: r.verified, opened: r.opened, search: r.searchOnly },
                  note: `${fmt(r.opened + r.verified)} of ${fmt(r.rows)} opened`,
                }))}
              />
            </ChartCard>
          </div>
        </HowWeDidThis>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="States and Washington, DC" value={fmt(data.jurisdictions)} note="All included" />
        <StatCard label="Places to get in touch" value={fmt(data.doors)} note={`${fmt(data.privateAgencies)} private agencies, ${fmt(data.tribal)} tribal programmes`} />
        <StatCard label="Published state rules" value={fmt(data.policies)} note="On age, training, licences and more" />
        <StatCard label="Form questions read" value={fmt(data.questions)} note={`From ${fmt(data.questionForms)} forms`} />
      </div>

      <ChartCard
        title="Who runs child welfare in each state"
        description="Each square is a state, placed roughly where it is on a map."
        footer={{
          lead: `${countyStates} states run child welfare through their counties`,
          note: "So those states have many more places to get in touch.",
        }}
      >
        <TileMap data={data} />
        <TableView
          title="places to get in touch by state"
          head={["State", "Who runs child welfare", "Places to get in touch"]}
          rows={data.tiles
            .flat()
            .filter((t): t is Tile => !!t)
            .sort((a, b) => a.code.localeCompare(b.code))
            .map((t) => [t.code, data.models.find((m) => m.model === t.model)?.label ?? "Not recorded", t.doors])}
        />
      </ChartCard>

      {replies > 0 && (
        <ChartCard
          title="How soon places to get in touch say they will reply"
          description="Pages that give a reply time, by the time they give"
          footer={{
            lead: `${replies} of the ${fmt(data.pagesOpened)} pages we read give a reply time`,
            note: `The times range from ${data.replyDays[0]} to ${data.replyDays.at(-1)} days.`,
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
            axisLabel="Time to first reply, as stated on the page"
          />
          <TableView
            title="reply times"
            head={["Days", "Places to get in touch"]}
            rows={[...new Set(data.replyDays)].map((d) => [String(d), data.replyDays.filter((x) => x === d).length])}
          />
        </ChartCard>
      )}

      <details>
        <summary className="cursor-pointer text-sm font-medium underline-offset-4 hover:underline">
          More charts: who runs each place to get in touch, and what state rules say
        </summary>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ChartCard
            title="Places to get in touch, by level"
            description="Whether each one works for a county, a region, a whole state, a tribe or a city"
            footer={{ lead: `${fmt(data.levels[0].value)} of ${fmt(data.doors)} are county agencies` }}
          >
            <HorizontalBars data={data.levels} labelWidth="sm:grid-cols-[7rem_minmax(0,1fr)]" />
          </ChartCard>
          <ChartCard
            title="Who runs each place to get in touch"
            description="Includes private organisations that a state pays to run its place to get in touch"
            footer={{ lead: `${fmt(data.privateAgencies)} private licensed agencies so far`, note: "A first sample of up to 10 per state." }}
          >
            <HorizontalBars data={data.sectors} labelWidth="sm:grid-cols-[9rem_minmax(0,1fr)]" />
          </ChartCard>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
          The state rules below come from search results. We have not yet opened most of the pages they come from. The{" "}
          <a href="/compare/rules" className="font-medium text-foreground underline underline-offset-4">
            compare page
          </a>{" "}
          sets out the rules in every country, topic by topic.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <ChartCard
            title="Minimum age to foster"
            description="Number of states, where we recorded a figure"
            footer={commonAge ? { lead: `The minimum age is ${commonAge.label} in ${states(commonAge.value)}` } : undefined}
          >
            <HorizontalBars
              data={data.minAge.map((b) => ({ ...b, display: states(b.value) }))}
              labelWidth="sm:grid-cols-[4.5rem_minmax(0,1fr)]"
            />
          </ChartCard>
          <ChartCard
            title="Hours of training before a licence"
            description="Number of states, where we recorded a figure"
            footer={(() => {
              const top = [...data.training].sort((a, b) => b.value - a.value)[0]
              return top ? { lead: `${top.label} is the most common` } : undefined
            })()}
          >
            <HorizontalBars
              data={data.training.map((b) => ({ ...b, display: states(b.value) }))}
              labelWidth="sm:grid-cols-[7.5rem_minmax(0,1fr)]"
            />
          </ChartCard>
          <ChartCard
            title="How long a foster care licence lasts"
            description="Number of states, where we recorded a figure"
            footer={(() => {
              const top = [...data.licenceTerm].sort((a, b) => b.value - a.value)[0]
              return top ? { lead: `${top.label} is the most common` } : undefined
            })()}
          >
            <HorizontalBars
              data={data.licenceTerm.map((b) => ({ ...b, display: states(b.value) }))}
              labelWidth="sm:grid-cols-[4.5rem_minmax(0,1fr)]"
            />
          </ChartCard>
        </div>
      </details>
    </section>
  )
}
