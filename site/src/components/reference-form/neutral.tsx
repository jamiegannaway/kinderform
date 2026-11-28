// The neutral design for the reference form: the site's own shadcn/ui look (new-york style,
// neutral theme tokens), for any country and language. It is the other side of the design switch
// on each country page, the only design for a country with no national design system, and the
// look of the neutral download. Same engine, questions and wording as the national designs.
//
// Built from the shadcn/ui components in src/components/ui/ (Button, Input, Label, Alert). Radios
// and tick boxes are native inputs drawn in the shadcn/ui look, so they work without extra
// script. Everything is Tailwind classes on the form's own elements, plus a few rules under
// .kf-neutral in neutral.css, so nothing reaches the rest of the page. It follows the site's light
// and dark themes.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"
import { ArrowRight, Check, ChevronLeft, CircleAlert, CircleCheck, Info } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { exampleMessage, formatDay, type Theme } from "./engine"
import { doneWords } from "./neutral-words"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

const HEADING = "text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl"
// A field's width follows the answer it expects ("inputWidth" in the wording, in characters).
const width = (n?: number) => (!n ? "max-w-md" : n <= 5 ? "max-w-32" : n <= 10 ? "max-w-48" : n <= 20 ? "max-w-xs" : "max-w-md")
// One answer in a list of radios or tick boxes: a bordered row, marked when chosen.
const CHOICE =
  "flex cursor-pointer items-start gap-3 rounded-md border bg-background px-4 py-3 shadow-xs transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-accent has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 dark:bg-input/30 dark:has-[:checked]:bg-accent"
// The control itself: shadcn/ui's radio and checkbox, drawn on a native input.
const BOX =
  "peer size-4 shrink-0 appearance-none border border-input bg-background shadow-xs outline-none dark:bg-input/30 checked:border-primary"

function Hint({ c }: { c: C }) {
  return c.hint ? (
    <p id={`${c.id}-hint`} className="text-sm text-muted-foreground">
      {c.hint}
    </p>
  ) : null
}

function ErrorText({ c, prefix }: { c: C; prefix: string }) {
  return c.error ? (
    <p id={`${c.id}-error`} className="text-sm font-medium text-destructive">
      <span className="sr-only">{prefix} </span>
      {c.error}
    </p>
  ) : null
}

function Legend({ c }: { c: C }) {
  return c.asHeading ? (
    <legend className="mb-1">
      <h1 className={HEADING} tabIndex={-1} ref={c.headingRef}>
        {c.label}
      </h1>
    </legend>
  ) : (
    <legend className="mb-1 text-sm font-medium">{c.label}</legend>
  )
}

function Radio(props: React.ComponentProps<"input">) {
  return (
    <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
      <input type="radio" className={cn(BOX, "rounded-full")} {...props} />
      <span className="pointer-events-none absolute hidden size-2 rounded-full bg-primary peer-checked:block" aria-hidden="true" />
    </span>
  )
}

function Checkbox(props: React.ComponentProps<"input">) {
  return (
    <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
      <input type="checkbox" className={cn(BOX, "rounded-[4px] checked:bg-primary")} {...props} />
      <Check className="pointer-events-none absolute hidden size-3.5 text-primary-foreground peer-checked:block" aria-hidden="true" />
    </span>
  )
}

function Choice({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className={CHOICE}>
      {children}
      <span className="grid gap-1">
        <span className="text-sm leading-snug font-medium">{label}</span>
        {hint && (
          <span id={`${id}-item-hint`} className="text-sm text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
    </label>
  )
}

// The error prefix ("Error:") comes from the wording, so screen readers hear it in the form's language.
const usePrefix = (props: ControlProps) =>
  (props.config as { errorPrefix?: string } | undefined)?.errorPrefix ?? "Error:"

const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const label = (
    <Label htmlFor={c.id} className={c.asHeading ? cn(HEADING, "block") : undefined}>
      {c.label}
    </Label>
  )
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  return (
    <div className="mb-6 grid gap-2">
      {c.asHeading ? (
        <h1 tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      <Hint c={c} />
      <ErrorText c={c} prefix={usePrefix(props)} />
      <Input
        className={cn("h-10", width(c.o.inputWidth))}
        id={c.id}
        name={c.field}
        type={type}
        value={c.current}
        autoComplete={c.o.autocomplete}
        inputMode={c.o.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
        spellCheck={c.o.spellcheck}
        aria-describedby={c.describedBy}
        aria-invalid={c.error ? true : undefined}
        onChange={(e) => c.setFromString(e.target.value)}
        onBlur={c.onBlur}
      />
    </div>
  )
})

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <fieldset className="mb-6 grid gap-2" aria-describedby={c.describedBy}>
      <Legend c={c} />
      <Hint c={c} />
      <ErrorText c={c} prefix={usePrefix(props)} />
      <div className="mt-1 grid gap-2">
        {c.options.map((opt, i) => {
          const id = i === 0 ? c.id : `${c.id}-${i + 1}`
          return (
            <Choice key={opt.value} id={id} label={opt.label} hint={opt.hint}>
              <Radio
                id={id}
                name={c.field}
                value={opt.value}
                checked={c.current === opt.value}
                aria-describedby={opt.hint ? `${id}-item-hint` : undefined}
                onChange={() => c.setFromString(opt.value)}
              />
            </Choice>
          )
        })}
      </div>
    </fieldset>
  )
})

const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <fieldset className="mb-6 grid gap-2" aria-describedby={c.describedBy}>
      <Legend c={c} />
      <Hint c={c} />
      <ErrorText c={c} prefix={usePrefix(props)} />
      <div className="mt-1 grid gap-2">
        {c.options.map((opt, i) => {
          const id = i === 0 ? c.id : `${c.id}-${i + 1}`
          return (
            <Choice key={opt.value} id={id} label={opt.label}>
              <Checkbox
                id={id}
                name={c.field}
                value={opt.value}
                checked={c.checked(opt.value)}
                onChange={(e) => c.toggle(opt.value, e.target.checked)}
              />
            </Choice>
          )
        })}
      </div>
    </fieldset>
  )
})

const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <fieldset className="mb-6 grid gap-2" aria-describedby={c.describedBy}>
      <Legend c={c} />
      <Hint c={c} />
      <div className="mt-1 grid gap-2">
        <Choice id={c.id} label={c.o.checkboxLabel ?? ""}>
          <Checkbox id={c.id} name={c.field} checked={props.data === true} onChange={(e) => c.set(e.target.checked ? true : undefined)} />
        </Choice>
      </div>
    </fieldset>
  )
})

const Paragraph = ({ children }: { children: React.ReactNode }) => <p className="leading-7">{children}</p>

export const neutralTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  Start: ({ ui, onStart, headingRef }) => (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl" tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        {ui.start.body.map((p) => (
          <Paragraph key={p}>{p}</Paragraph>
        ))}
      </div>
      <Alert role="note">
        <Info aria-hidden="true" />
        <AlertDescription className="text-card-foreground">{ui.demo_notice}</AlertDescription>
      </Alert>
      <div>
        <Button type="button" size="lg" onClick={onStart}>
          {ui.start.button}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  ),

  // Like GOV.UK: a caption naming the section and the question number, above every question.
  Progress: ({ ui, section, question }) => (
    <p className="mb-2 text-sm font-medium text-muted-foreground">
      {section}
      {question && (
        <>
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          {ui.progress.question} {question.n} {ui.progress.of} {question.total}
        </>
      )}
    </p>
  ),

  Back: ({ label, onBack }) => (
    <Button type="button" variant="ghost" size="sm" className="mb-4 -ml-2.5" onClick={onBack}>
      <ChevronLeft aria-hidden="true" />
      {label}
    </Button>
  ),

  ErrorSummary: ({ title, errors, boxRef }) => (
    <div className="mb-6" tabIndex={-1} ref={boxRef}>
      <Alert variant="destructive" className="border-destructive/50">
        <CircleAlert aria-hidden="true" />
        <AlertTitle className="line-clamp-none">{title}</AlertTitle>
        <AlertDescription>
          <ul className="ml-4 list-disc">
            {errors.map((e) => (
              <li key={e.id}>
                <a href={`#${e.id}`} className="font-medium underline underline-offset-4">
                  {e.message}
                </a>
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className={cn(HEADING, "mb-6")} tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <Button type="submit" size="lg">
      {label}
    </Button>
  ),

  Check: ({ ui, rows, onChange, headingRef }) => (
    <div className="grid gap-6">
      <h1 className={HEADING} tabIndex={-1} ref={headingRef}>
        {ui.check.title}
      </h1>
      <dl className="divide-y border-y">
        {rows.map((r) => (
          <div key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto]">
            <dt className="text-sm font-medium">{r.label}</dt>
            <dd className="col-start-1 text-sm break-words text-muted-foreground sm:col-start-2 sm:row-start-1">{r.value}</dd>
            <dd className="col-start-2 row-span-2 row-start-1 self-center sm:col-start-3 sm:row-span-1">
              <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => onChange(r.pageIndex)}>
                {ui.check.change}
                <span className="sr-only"> {r.label.toLocaleLowerCase(ui.locale)}</span>
              </Button>
            </dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{ui.check.send_heading}</h2>
        <Paragraph>{ui.check.send_body}</Paragraph>
      </div>
      <div>
        <Button type="submit" size="lg">
          {ui.check.button}
        </Button>
      </div>
    </div>
  ),

  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const w = doneWords(ui.locale)
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    const record = <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-5 break-words whitespace-pre-wrap">{JSON.stringify(r, null, 2)}</pre>
    return (
      <div className="grid gap-8">
        <div className="flex items-start gap-3 rounded-xl border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
          <CircleCheck className="mt-1 size-6 shrink-0" aria-hidden="true" />
          <div className="grid gap-2">
            <h1 className={HEADING} tabIndex={-1} ref={headingRef}>
              {ui.confirmation.title}
            </h1>
            <p className="text-muted-foreground">
              {ui.confirmation.reference}: <strong className="font-mono font-semibold text-foreground">{step.reference}</strong>
            </p>
          </div>
        </div>
        <section className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{ui.confirmation.next_heading}</h2>
          {w && (
            <>
              <ol className="ml-6 list-decimal space-y-2 leading-7">
                <li>
                  <strong className="font-semibold">{w.now}</strong> {w.nowBody(r.contact_method === "email" ? w.ack.email : w.ack.text)}
                </li>
                <li>
                  <strong className="font-semibold">{w.by(formatDay(step.due, ui.locale))}</strong>{" "}
                  {w.who(team, w.how[String(r.contact_method)] ?? w.how.phone_call)}
                  {r.best_times ? w.times : ""}.
                </li>
                <li>
                  <strong className="font-semibold">{w.talk}</strong> {w.talkBody}
                  {r.interest === "not_sure" && !r.knows_child ? w.notSure : ""}
                </li>
              </ol>
              <Paragraph>{w.plans}</Paragraph>
            </>
          )}
          <Alert role="note">
            <Info aria-hidden="true" />
            <AlertTitle className="line-clamp-none">{ui.confirmation.example_label}</AlertTitle>
            <AlertDescription className="text-card-foreground">
              <p>{exampleMessage(ui, r, step.due)}</p>
            </AlertDescription>
          </Alert>
        </section>
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold tracking-tight">{ui.confirmation.builders_heading}</h2>
          {w ? (
            <details className="rounded-md border">
              <summary className="cursor-pointer rounded-md px-4 py-3 text-sm font-medium outline-none hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50">
                {w.record}
              </summary>
              <div className="grid gap-3 border-t px-4 py-3">
                <p className="text-sm leading-6">{ui.confirmation.builders_body}</p>
                {record}
              </div>
            </details>
          ) : (
            <>
              <p className="text-sm leading-6">{ui.confirmation.builders_body}</p>
              {record}
            </>
          )}
        </section>
        <div>
          <Button type="button" variant="outline" onClick={onRestart}>
            {ui.confirmation.restart}
          </Button>
        </div>
      </div>
    )
  },
}
