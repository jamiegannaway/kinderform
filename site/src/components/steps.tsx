// "What the research says, step by step": the steps from src/lib/steps.ts. On /research they are
// shadcn/ui Cards, each linking to its findings. On the home page they are a short list. Plain
// HTML: no client JavaScript.
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CAVEAT, THEME, THREAD, type Step } from "@/lib/steps"

const link = "font-medium text-foreground underline underline-offset-4"

// The theme, with its caveat always beside it.
export function StepsTheme() {
  return (
    <>
      <p className="text-lg leading-8">{THEME}</p>
      <p className="leading-7 text-muted-foreground">{CAVEAT}</p>
    </>
  )
}

// On the muted card the text stays in the main colour: the muted text colour on the muted
// background does not pass 4.5:1 contrast in the light theme.
function Evidence({ step, onMuted = false }: { step: Step; onMuted?: boolean }) {
  const dd = onMuted ? "" : "text-muted-foreground"
  return (
    <dl className="space-y-3 text-sm leading-6">
      <div>
        <dt className="font-medium">What the research says</dt>
        <dd className={dd}>{step.says}</dd>
      </div>
      <div>
        <dt className="font-medium">How strong the evidence is</dt>
        <dd className={dd}>{step.strength}</dd>
      </div>
    </dl>
  )
}

const seeFindings = (n: number) => (n === 1 ? "See the 1 finding" : `See the ${n} findings`)

// For /research. `found` gives the number of findings for each step, by step name.
export function StepCards({ steps, found }: { steps: Step[]; found: (name: string) => number }) {
  return (
    <div className="space-y-6">
      <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.id} className="flex">
            <Card className="w-full gap-4">
              <CardHeader>
                <CardDescription className="tabular-nums">Step {i + 1}</CardDescription>
                <CardTitle className="text-xl">{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-7">{s.does}</p>
                <Evidence step={s} />
              </CardContent>
              {found(s.name) > 0 && (
                <CardFooter className="mt-auto text-sm">
                  <a href={`#step-${s.id}`} className={link}>
                    {seeFindings(found(s.name))}
                    <span className="sr-only"> for {s.name}</span>
                  </a>
                </CardFooter>
              )}
            </Card>
          </li>
        ))}
      </ol>
      <Card className="gap-4 bg-muted">
        <CardHeader>
          <CardDescription className="text-foreground">Between every step</CardDescription>
          <CardTitle className="text-xl">{THREAD.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
          <p className="leading-7">{THREAD.does}</p>
          <Evidence step={THREAD} onMuted />
        </CardContent>
        {found(THREAD.name) > 0 && (
          <CardFooter className="text-sm">
            <a href={`#step-${THREAD.id}`} className={link}>
              {seeFindings(found(THREAD.name))}
              <span className="sr-only"> for {THREAD.name}</span>
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

// For the home page: each step in two short lines.
export function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.id} className="border-l-2 pl-4">
          <p className="font-medium">
            <span className="tabular-nums text-muted-foreground">{i + 1}.</span> {s.name}
          </p>
          <p className="mt-1 leading-7">{s.does}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.says}</p>
        </li>
      ))}
    </ol>
  )
}

// The thread, for the home page, in one short paragraph.
export function ThreadLine() {
  return (
    <p className="max-w-2xl leading-7">
      <span className="font-medium">{THREAD.name}</span> is not a step. {THREAD.does}
    </p>
  )
}
