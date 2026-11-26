// "What the research says, step by step": the steps from src/lib/steps.ts, as a picture. Each step
// has a drawing, a number, a name and one short line, joined by a line on wide screens. The detail
// for a step sits beside its findings on /research (StepIntro), so the picture stays light. Plain
// HTML: no client JavaScript.
import { Illustration } from "@/components/illustration"
import { CAVEAT, LEVELS, THEME, THREAD, type Level, type Step } from "@/lib/steps"

// The theme, with its caveat always beside it.
export function StepsTheme() {
  return (
    <>
      <p className="text-lg leading-8">{THEME}</p>
      <p className="leading-7 text-muted-foreground">{CAVEAT}</p>
    </>
  )
}

// How strong the evidence is: three small bars, with the words beside them. Neutral colours, as
// for charts. The bars are decoration; the words carry the meaning.
// `stacked` puts the words under the bars on a phone, where a step's tile is narrow.
export function EvidenceMeter({
  level,
  stacked = false,
  className = "",
}: {
  level: Level
  stacked?: boolean
  className?: string
}) {
  const layout = stacked ? "flex-col items-start gap-1 md:flex-row md:items-center md:gap-2" : "items-center gap-2"
  return (
    <span className={`inline-flex font-medium text-foreground ${layout} ${className}`}>
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-2 w-4 rounded-sm ${n <= level ? "bg-primary" : "bg-muted-foreground/25"}`} />
        ))}
      </span>
      {LEVELS[level]}
    </span>
  )
}

// The picture of the steps, for the home page and the top of /research. `base` is the page the
// step names link to: "" on /research itself, "/research" elsewhere.
export function StepPath({ steps, base = "" }: { steps: Step[]; base?: string }) {
  return (
    <div className="space-y-4 lg:space-y-8">
      <ol className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-0">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className="flex flex-col rounded-xl border bg-card p-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
          >
            <Illustration name={s.art} className="w-16 lg:w-24" />
            <div className="mt-3 flex items-center">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground tabular-nums">
                {i + 1}
              </span>
              {i < steps.length - 1 && <span aria-hidden="true" className="mx-2 hidden h-px flex-1 bg-border lg:block" />}
            </div>
            <a
              href={`${base}#step-${s.id}`}
              className="mt-3 text-lg font-semibold underline underline-offset-4 lg:pr-4"
            >
              {s.name}
            </a>
            <p className="mt-1 text-sm leading-6 text-muted-foreground lg:pr-4">{s.short}</p>
            <EvidenceMeter level={s.level} stacked className="mt-auto pt-3 text-xs" />
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-4 rounded-xl bg-muted p-4 md:px-6">
        <Illustration name={THREAD.art} className="w-14 shrink-0 md:w-16" />
        <p className="leading-7">
          <a href={`${base}#step-${THREAD.id}`} className="font-semibold underline underline-offset-4">
            {THREAD.name}
          </a>{" "}
          between every step. {THREAD.short}
        </p>
      </div>
    </div>
  )
}

// For /research: what a step means and how strong its evidence is, beside the step's findings.
export function StepIntro({ step }: { step: Step }) {
  return (
    <div className="max-w-3xl space-y-2">
      <p className="leading-7">
        {step.does} <span className="text-muted-foreground">{step.says}</span>
      </p>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-6 text-muted-foreground">
        <EvidenceMeter level={step.level} />
        <span>{step.strength}</span>
      </p>
    </div>
  )
}
