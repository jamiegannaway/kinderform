// Charts styled after the shadcn/ui chart examples (bar chart: horizontal and
// with labels, stacked bar, legend, progress), built from plain HTML.
//
// Why not the shadcn <ChartContainer> (Recharts)? It sets inline styles and a
// <style> tag, which the site's Content-Security-Policy blocks, and it expects
// client JavaScript, which /research does not ship. These components keep the
// same look with Card, the theme's chart tokens, 4px radii and the muted
// two-line footer, and size bars with fixed width and height classes that
// globals.css generates from 0% to 100%.
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Fixed classes so Tailwind can see every one at build time (globals.css also
// generates them, in case a value is computed).
const W = (p: number) => `w-[${Math.max(0, Math.min(100, Math.round(p)))}%]`
const H = (p: number) => `h-[${Math.max(0, Math.min(100, Math.round(p)))}%]`

export type BarDatum = { label: string; value: number; display?: string }
export type Footer = { lead: string; note?: string }

export function ChartFooter({ footer }: { footer?: Footer }) {
  if (!footer) return null
  return (
    <CardFooter className="flex-col items-start gap-2 text-sm">
      <div className="flex gap-2 leading-none font-medium">{footer.lead}</div>
      {footer.note && <div className="leading-none text-muted-foreground">{footer.note}</div>}
    </CardFooter>
  )
}

export function ChartCard({
  title,
  description,
  footer,
  children,
  className = "",
}: {
  title: string
  description?: string
  footer?: Footer
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      <ChartFooter footer={footer} />
    </Card>
  )
}

// Horizontal bar chart: a category axis on the left, rounded bars, the value just
// past the end of each bar (shadcn "Bar Chart - Custom Label").
export function HorizontalBars({
  data,
  max,
  labelWidth = "sm:grid-cols-[11rem_minmax(0,1fr)]",
  compact = false,
}: {
  data: BarDatum[]
  max?: number
  labelWidth?: string
  compact?: boolean // smaller bars and text, for cards in a row
}) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value))
  const barHeight = compact ? "h-4" : "h-7"
  return (
    <ul className={compact ? "space-y-1.5" : "space-y-2"} role="list">
      {data.map((d) => {
        const shown = d.display ?? d.value.toLocaleString("en-GB")
        return (
          <li key={d.label} className={`grid grid-cols-1 items-center gap-x-3 gap-y-1 text-sm ${labelWidth}`}>
            <span className="truncate text-muted-foreground sm:text-right" title={d.label}>
              {d.label}
            </span>
            <span className="flex items-center gap-2" role="img" aria-label={`${d.label}: ${shown}`}>
              <span className={`relative flex-1 ${barHeight}`}>
                <span className={`absolute inset-y-0 left-0 rounded-r-[4px] bg-chart-2 ${W((100 * d.value) / top)} ${d.value ? "min-w-1" : ""}`} />
              </span>
              <span className={`shrink-0 text-xs font-medium tabular-nums text-foreground ${compact ? "w-10" : "w-24"}`}>
                {shown}
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// Vertical bar chart with an x axis (shadcn "Bar Chart"). One column per category.
export function ColumnBars({ data, axisLabel }: { data: BarDatum[]; axisLabel?: string }) {
  const top = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="space-y-2">
      <div className="flex h-44 items-end gap-1 border-b border-border sm:gap-2">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            role="img"
            aria-label={`${d.label}: ${d.display ?? d.value}`}
            title={`${d.label}: ${d.display ?? d.value}`}
          >
            {d.value > 0 && <span className="text-xs font-medium tabular-nums">{d.value}</span>}
            <span className={`w-full rounded-t-[4px] bg-chart-2 ${H((88 * d.value) / top)}`} />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="flex gap-1 text-center text-xs text-muted-foreground tabular-nums sm:gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate">
            {d.label}
          </span>
        ))}
      </div>
      {axisLabel && <p className="text-center text-xs text-muted-foreground">{axisLabel}</p>}
    </div>
  )
}

export type Segment = { key: string; label: string; className: string }

// shadcn ChartLegend: small rounded squares with labels, centred under the chart.
export function Legend({ items }: { items: Segment[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs" role="list">
      {items.map((i) => (
        <li key={i.key} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-[2px] ${i.className}`} />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

// Stacked horizontal bar, one row per item (shadcn "Bar Chart - Stacked + Legend").
export function StackedBars({
  rows,
  segments,
}: {
  rows: { label: string; total: number; parts: Record<string, number>; note?: string }[]
  segments: Segment[]
}) {
  return (
    <div className="space-y-4">
      <ul className="space-y-3" role="list">
        {rows.map((r) => (
          <li key={r.label} className="space-y-1.5 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="font-medium">{r.label}</span>
              {r.note && <span className="text-xs tabular-nums text-muted-foreground">{r.note}</span>}
            </div>
            <span
              role="img"
              aria-label={`${r.label}: ${segments.map((s) => `${s.label} ${r.parts[s.key] ?? 0}`).join(", ")}`}
              className="flex h-3 w-full overflow-hidden rounded-[4px] bg-muted"
            >
              {segments.map((s) => {
                const v = r.parts[s.key] ?? 0
                return v > 0 ? <span key={s.key} className={`h-full ${s.className} ${W((100 * v) / (r.total || 1))}`} /> : null
              })}
            </span>
          </li>
        ))}
      </ul>
      <Legend items={segments} />
    </div>
  )
}

// shadcn Progress look: a rounded track in primary at 20%, filled in primary.
export function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="relative block h-2 w-full overflow-hidden rounded-full bg-primary/20"
    >
      <span className={`absolute inset-y-0 left-0 bg-primary ${W((100 * value) / (max || 1))}`} />
    </span>
  )
}

// shadcn "section cards": a description label, a large figure and a muted footer.
export function StatCard({
  label,
  value,
  note,
  children,
}: {
  label: string
  value: string
  note?: string
  children?: React.ReactNode
}) {
  return (
    <Card className="gap-3 py-5">
      <CardHeader className="gap-1 px-5">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">{value}</CardTitle>
      </CardHeader>
      {(note || children) && (
        <CardFooter className="flex-col items-start gap-2 px-5 text-sm">
          {children}
          {note && <span className="text-muted-foreground">{note}</span>}
        </CardFooter>
      )}
    </Card>
  )
}

// Dot strip: one row per group, a column per number of questions, a dot per form,
// stacked where forms tie (shadcn scatter look). Values above the axis go in the last column.
const STRIP_MAX = 30
export function DotStrips({ rows, axisLabel }: { rows: { label: string; values: number[]; note?: string }[]; axisLabel: string }) {
  return (
    <div className="space-y-5">
      {rows.map((r) => {
        const counts = Array.from({ length: STRIP_MAX + 1 }, (_, n) =>
          r.values.filter((v) => (n === STRIP_MAX ? v >= n : v === n)).length,
        )
        return (
          <div key={r.label} className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
              <span className="font-medium">{r.label}</span>
              {r.note && <span className="text-xs tabular-nums text-muted-foreground">{r.note}</span>}
            </div>
            <div
              role="img"
              aria-label={`${r.label}: ${r.note ?? r.values.join(", ")}`}
              className="grid h-24 grid-cols-[repeat(31,minmax(0,1fr))] border-b border-border"
            >
              {counts.map((n, i) => (
                <div key={i} className="flex flex-col-reverse items-center gap-0.5 pb-0.5">
                  {Array.from({ length: Math.min(n, 12) }, (_, j) => (
                    <span
                      key={j}
                      title={`${n} ${n === 1 ? "form" : "forms"} with ${i === STRIP_MAX ? `${i} or more` : i} questions`}
                      className="size-1.5 rounded-full bg-chart-2 ring-1 ring-card"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <div aria-hidden="true" className="grid grid-cols-[repeat(31,minmax(0,1fr))] text-xs text-muted-foreground tabular-nums">
        <span className="col-start-1 text-center">0</span>
        <span className="col-start-11 text-center">10</span>
        <span className="col-start-21 text-center">20</span>
        <span className="col-start-31 text-center">30+</span>
      </div>
      <p className="text-center text-xs text-muted-foreground">{axisLabel}</p>
    </div>
  )
}

// "1 form", not "1 forms".
const one = (n: number, unit: string) => (n === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit)

// Heat grid: rows are topics, columns are groups, each cell the share of forms that ask.
// Shade comes from the primary token at fixed opacity steps; the figure is always shown.
// The cell shade, in steps of 10. The /60 step is skipped: neither dark nor light text reaches
// 4.5:1 contrast on it, so it uses /70 with light text. Checked with axe-core in both themes.
const STEP = (p: number) => {
  const r = Math.round(p / 10) * 10
  return r === 60 ? 70 : r
}
// In dark mode the light primary makes /50 a mid grey on which no text passes, so it drops to /40.
const SHADE = (p: number) => `bg-primary/${STEP(p)}${STEP(p) === 50 ? " dark:bg-primary/40" : ""}`
// Each column needs about 2.9rem, so "100%" fits; the topic column takes 8rem on small screens.
// A grid wider than the screen scrolls sideways, with the topics pinned on the left. Written out
// in full so Tailwind generates the classes (the Content-Security-Policy rules out inline styles).
const gridWidth = (n: number) =>
  n <= 4 ? "min-w-[20rem]" : n <= 7 ? "min-w-[30rem]" : n <= 11 ? "min-w-[40rem]" : "min-w-[50rem]"

export function HeatGrid({
  columns,
  rows,
  unit = "forms",
  shortOnly = false,
}: {
  unit?: string
  columns: { key: string; label: string; short?: string; n: number; unit?: string }[]
  rows: { label: string; note?: string; cells: Record<string, { yes: number; of: number }> }[]
  // Use the short column labels at every width, for grids with many columns. The full label
  // stays in each header's title.
  shortOnly?: boolean
}) {
  return (
    <div>
      <div
        tabIndex={0}
        className="overflow-x-auto rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <table className={`w-full table-fixed border-separate border-spacing-1 text-sm ${gridWidth(columns.length)}`}>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 w-32 bg-card text-left font-medium text-muted-foreground sm:w-[30%]"
            >
              <span className="sr-only">Topic</span>
            </th>
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-1 pb-1 text-center align-bottom text-xs font-medium">
                {c.short && shortOnly ? (
                  <abbr title={`${c.label}: ${c.n} ${one(c.n, c.unit ?? unit)}`} className="block no-underline">
                    {c.short}
                  </abbr>
                ) : c.short ? (
                  <>
                    <abbr title={c.label} className="no-underline sm:hidden">
                      {c.short}
                    </abbr>
                    <span className="hidden sm:inline">{c.label}</span>
                  </>
                ) : (
                  c.label
                )}
                <span className="block font-normal text-muted-foreground tabular-nums">
                  {c.n}
                  {!shortOnly && <span className="hidden sm:inline"> {one(c.n, c.unit ?? unit)}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="sticky left-0 z-10 bg-card pr-2 text-left font-normal">
                {r.label}
                {r.note && <span className="ml-1 text-xs text-muted-foreground">{r.note}</span>}
              </th>
              {columns.map((c) => {
                const cell = r.cells[c.key]
                const p = cell && cell.of ? Math.round((100 * cell.yes) / cell.of) : 0
                // Light text on /70 and darker, dark text on /50 and lighter: 4.5:1 or more either way.
                const dark = STEP(p) >= 70
                return (
                  <td
                    key={c.key}
                    title={cell ? `${cell.yes} of ${cell.of} ${one(cell.of, c.unit ?? unit)}` : `No ${c.unit ?? unit}`}
                    className={`h-9 rounded-[4px] text-center text-xs font-medium tabular-nums ring-1 ring-inset ring-border ${SHADE(p)} ${
                      dark ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {cell && cell.of ? `${p}%` : "–"}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      {columns.length > 5 && (
        <p className="mt-2 text-xs text-muted-foreground sm:hidden">Swipe the table sideways to see every column.</p>
      )}
    </div>
  )
}
