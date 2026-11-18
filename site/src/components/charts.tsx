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
}: {
  data: BarDatum[]
  max?: number
  labelWidth?: string
}) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value))
  return (
    <ul className="space-y-2" role="list">
      {data.map((d) => {
        const shown = d.display ?? d.value.toLocaleString("en-GB")
        return (
          <li key={d.label} className={`grid grid-cols-1 items-center gap-x-3 gap-y-1 text-sm ${labelWidth}`}>
            <span className="truncate text-muted-foreground sm:text-right" title={d.label}>
              {d.label}
            </span>
            <span className="flex items-center gap-2" role="img" aria-label={`${d.label}: ${shown}`}>
              <span className="relative h-7 flex-1">
                <span className={`absolute inset-y-0 left-0 rounded-r-[4px] bg-chart-2 ${W((100 * d.value) / top)} ${d.value ? "min-w-1" : ""}`} />
              </span>
              <span className="w-24 shrink-0 text-xs font-medium tabular-nums text-foreground">{shown}</span>
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
