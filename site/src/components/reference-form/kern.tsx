// KERN UX markup for the reference form (Germany).
// Plain HTML that follows the markup and classes of @kern-ux/native 2.9.0 (kern-ux.de): Form
// Input (text), Fieldset, Radio, Checkbox, Hint, the error message (kern-error), Button, Link,
// Alert, Progress, Summary with Description List, Details, Heading, Title, Body and List.
// KERN is plain HTML and CSS. Its published stylesheet also styles html, body and every element
// on the page, so the rules the form needs are ported and scoped to .kern-form in
// site/src/styles/kern.scss (EUPL-1.2).
// KERN has no error summary, so the one here is an Alert (danger) that lists each problem as a
// link to its field.
// No branding reserved for public bodies: no header strip (Kopfzeile), no eagle word mark
// (Bildwortmarke) and no kern-kopfzeile.js. Kinderform is not a government service.
// Every visible word comes from schema/ui/enquiry-submission.de.json, except the fixed sentences
// of the confirmation page, which are in the DONE table below.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// The fixed sentences of the confirmation page, in German. As in the other themes, they live in
// code rather than in the wording file.
const DONE = {
  ack: { email: "eine E-Mail", text: "eine SMS" },
  now: "Jetzt.",
  nowBody: (ack: string) =>
    `Wir haben Ihnen ${ack} geschickt. Darin bestätigen wir, dass Ihre Anfrage angekommen ist. Dort steht auch, wer sich wann bei Ihnen meldet.`,
  by: (day: string) => `Spätestens am ${day}.`,
  how: { email: "Ihnen eine E-Mail schreiben", text_message: "Ihnen eine SMS schicken", phone_call: "Sie anrufen" } as Record<
    string,
    string
  >,
  who: (team: string, how: string) => `Eine feste Ansprechperson von ${team} wird ${how}`,
  times: ", zu einer der Zeiten, die Sie gewählt haben",
  talk: "Im Gespräch.",
  talkBody: "Sie können Fragen stellen, ohne sich zu einer Bewerbung zu verpflichten.",
  notSure: " Wir erklären Ihnen Pflegefamilie, Adoption und andere Wege, wie Sie helfen können.",
  plans: "Wenn sich Ihre Pläne ändern, ist das in Ordnung. Sie können es uns jederzeit sagen.",
  record: "Datensatz anzeigen",
}

// ---- Small parts ------------------------------------------------------------------

// KERN icons are spans masked with an SVG (kern-icon--<name>), hidden from screen readers.
const Icon = ({ name }: { name: string }) => <span className={`kern-icon kern-icon--${name}`} aria-hidden="true" />

// KERN marks a field that is not required after its label, in the muted, regular style
// (kern-label__optional). The wording file ends those labels with "(optional)", so split it off
// and show it the KERN way. Every other field is required.
function splitLabel(label: string) {
  const m = label.match(/^(.*?)\s*(\(optional\))\s*$/i)
  return m ? { text: m[1], optional: m[2] } : { text: label, optional: undefined }
}

function LabelText({ label }: { label: string }) {
  const l = splitLabel(label)
  return (
    <>
      {l.text}
      {l.optional && (
        <>
          {" "}
          <span className="kern-label__optional">{l.optional}</span>
        </>
      )}
    </>
  )
}

function Hint({ c }: { c: C }) {
  return c.hint ? (
    <div className="kern-hint" id={`${c.id}-hint`}>
      {c.hint}
    </div>
  ) : null
}

// As in KERN, the message sits after the field, and aria-describedby names the hint first,
// then the message (shared.tsx builds it in that order).
function ErrorMessage({ c }: { c: C }) {
  return c.error ? (
    <p className="kern-error" id={`${c.id}-error`}>
      <Icon name="danger" />
      <span className="kern-body">{c.error}</span>
    </p>
  ) : null
}

// Input widths: KERN offers 2, 4, 5, 10, 20 and 30 characters.
const widthClass = (n?: number) =>
  n ? ` kern-form-input__input--width-${n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 10 ? 10 : n <= 20 ? 20 : 30}` : ""

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Renderers --------------------------------------------------------------------

// Form Input: label, hint, the field, then the message. When the question is the page heading,
// the label sits inside a Heading (large).
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { optional } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className="kern-label" htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className={`kern-form-input${c.error ? " kern-form-input--error" : ""}`}>
      {c.asHeading ? (
        <h1 className="kern-heading-large kern-form__heading" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      <Hint c={c} />
      <input
        className={`kern-form-input__input${widthClass(c.o.inputWidth)}${c.error ? " kern-form-input__input--error" : ""}`}
        id={c.id}
        name={c.field}
        type={type}
        value={c.current}
        autoComplete={c.o.autocomplete}
        inputMode={c.o.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
        spellCheck={c.o.spellcheck}
        aria-required={!optional}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={c.describedBy}
        onChange={(e) => c.setFromString(e.target.value)}
        onBlur={c.onBlur}
      />
      <ErrorMessage c={c} />
    </div>
  )
})

// Fieldset: the question is the legend (with a Heading inside when it is the page heading), then
// the hint, the options and the message.
function Fieldset({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <fieldset className={`kern-fieldset${c.error ? " kern-fieldset--error" : ""}`} aria-describedby={c.describedBy}>
      {c.asHeading ? (
        <legend className="kern-form__legend">
          <h1 className="kern-heading-large kern-form__heading" tabIndex={-1} ref={c.headingRef}>
            <LabelText label={c.label} />
          </h1>
        </legend>
      ) : (
        <legend className="kern-label">
          <LabelText label={c.label} />
        </legend>
      )}
      <Hint c={c} />
      <div className="kern-fieldset__body">{children}</div>
      <ErrorMessage c={c} />
    </fieldset>
  )
}

// Radio and Checkbox (kern-form-check): the native input, drawn by KERN, then its label.
// KERN has no hint for a single option; where the wording has one, it sits under the option
// label and is linked to the input with aria-describedby.
function Check(p: {
  c: C
  type: "radio" | "checkbox"
  id: string
  value?: string
  label: React.ReactNode
  hint?: string
  checked: boolean
  onChange: (on: boolean) => void
}) {
  const cls = p.type === "radio" ? "kern-form-check__radio" : "kern-form-check__checkbox"
  const hintId = p.hint ? `${p.id}-item-hint` : undefined
  return (
    <div className="kern-form-check">
      <input
        className={`${cls}${p.c.error ? ` ${cls}--error` : ""}`}
        id={p.id}
        name={p.c.field}
        type={p.type}
        value={p.value}
        checked={p.checked}
        aria-invalid={p.c.error ? true : undefined}
        aria-describedby={hintId}
        onChange={(e) => p.onChange(e.target.checked)}
      />
      <label className="kern-label" htmlFor={p.id}>
        {p.label}
      </label>
      {p.hint && (
        <div className="kern-hint kern-form__option-hint" id={hintId}>
          {p.hint}
        </div>
      )}
    </div>
  )
}

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      {c.options.map((opt, i) => (
        <Check
          key={opt.value}
          c={c}
          type="radio"
          id={optionId(c, i)}
          value={opt.value}
          label={opt.label}
          hint={opt.hint}
          checked={c.current === opt.value}
          onChange={() => c.setFromString(opt.value)}
        />
      ))}
    </Fieldset>
  )
})

const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      {c.options.map((opt, i) => (
        <Check
          key={opt.value}
          c={c}
          type="checkbox"
          id={optionId(c, i)}
          value={opt.value}
          label={opt.label}
          checked={c.checked(opt.value)}
          onChange={(on) => c.toggle(opt.value, on)}
        />
      ))}
    </Fieldset>
  )
})

// A yes-or-no question with one box to tick (updates): the question in a Fieldset, one Checkbox.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      <Check
        c={c}
        type="checkbox"
        id={c.id}
        label={c.o.checkboxLabel}
        checked={props.data === true}
        onChange={(on) => c.set(on ? true : undefined)}
      />
    </Fieldset>
  )
})

// ---- Page parts -------------------------------------------------------------------

// Alert: a coloured header with the icon and a title, then a white body.
function Alert(p: {
  tone: "danger" | "success" | "warning" | "info"
  title: React.ReactNode
  titleTag?: "p" | "h1" | "h2" | "h3"
  headingRef?: React.Ref<HTMLHeadingElement>
  role?: string
  tabIndex?: number
  boxRef?: React.Ref<HTMLDivElement>
  className?: string
  children?: React.ReactNode
}) {
  const Title = p.titleTag ?? "p"
  return (
    <div
      className={`kern-alert kern-alert--${p.tone}${p.className ? ` ${p.className}` : ""}`}
      role={p.role}
      tabIndex={p.tabIndex}
      ref={p.boxRef}
    >
      <div className="kern-alert__header">
        <Icon name={p.tone} />
        <Title className="kern-title" tabIndex={p.headingRef ? -1 : undefined} ref={p.headingRef as never}>
          {p.title}
        </Title>
      </div>
      {p.children && <div className="kern-alert__body">{p.children}</div>}
    </div>
  )
}

// From the error summary to the field: focus it, with its label or legend in view.
function focusField(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.hash.slice(1)
  const field = id ? document.getElementById(id) : null
  if (!field) return
  e.preventDefault()
  ;(field.closest(".kern-fieldset, .kern-form-input") ?? field).scrollIntoView({ block: "start" })
  field.focus({ preventScroll: true })
}

// ---- Theme ------------------------------------------------------------------------

export const kernTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // Heading, an introduction in Body (large), the other paragraphs, the example notice as a
  // warning Alert (its first sentence is the title), then a primary Button.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [title, more] =
      cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <div className="kern-stack-lg">
        <h1 className="kern-heading-large" tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        <div className="kern-stack-sm">
          {intro && <p className="kern-body kern-body--large">{intro}</p>}
          {rest.map((p) => (
            <p className="kern-body" key={p}>
              {p}
            </p>
          ))}
        </div>
        <Alert tone="warning" title={title}>
          {more && <p className="kern-body">{more}</p>}
        </Alert>
        <div>
          <button type="button" className="kern-btn kern-btn--primary" onClick={onStart}>
            <span className="kern-label">{ui.start.button}</span>
            <Icon name="arrow-forward" />
          </button>
        </div>
      </div>
    )
  },

  // Progress: the section and "Frage 2 von 9" as the label, then the bar. On the check page,
  // the last section and a full bar.
  Progress: ({ ui, section, question }) => (
    <div className="kern-progress kern-form__progress">
      <label className="kern-label kern-label--small" htmlFor="kf-progress">
        {section}
        {question && (
          <span className="kern-form__progress-count">
            <span aria-hidden="true"> · </span>
            <span className="kern-sr-only">, </span>
            {ui.progress.question} {question.n} {ui.progress.of} {question.total}
          </span>
        )}
      </label>
      <progress id="kf-progress" value={question ? question.n : 1} max={question ? question.total : 1} />
    </div>
  ),

  // A Link with the back arrow, at the top of each page.
  Back: ({ label, onBack }) => (
    <div className="kern-form__back">
      <a href="#" className="kern-link kern-link--small kern-link--no-visited-state" onClick={linkTo(onBack)}>
        <Icon name="arrow-back" />
        {label}
      </a>
    </div>
  ),

  // KERN has no error summary: an Alert (danger) that lists each problem as a link to its field.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <Alert tone="danger" title={title} titleTag="h2" className="kern-form__error" role="alert" tabIndex={-1} boxRef={boxRef}>
      <ul className="kern-list">
        {errors.map((e) => (
          <li key={e.id}>
            <a className="kern-link kern-link--no-visited-state" href={`#${e.id}`} onClick={focusField}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="kern-heading-large" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="kern-btn kern-btn--primary">
      <span className="kern-label">{label}</span>
    </button>
  ),

  // KERN Summary: one numbered block for each section, with a Description List of the answers.
  // KERN puts one edit link under each block; here each answer has its own, so a person goes
  // straight to the question they want to change.
  Check: ({ ui, rows, onChange, headingRef }) => {
    const sectionOf = (key: string) =>
      ui.pages.find((p) => p.elements.some((e) => fieldOf(e.scope) === key))?.section ?? ""
    const groups: { section: string; rows: typeof rows }[] = []
    for (const r of rows) {
      const s = sectionOf(r.key)
      const g = groups.find((x) => x.section === s)
      if (g) g.rows.push(r)
      else groups.push({ section: s, rows: [r] })
    }
    return (
      <>
        <h1 className="kern-heading-large" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g, i) => (
          <div className="kern-summary kern-form__summary" key={g.section}>
            <div className="kern-summary__header">
              <h2 className="kern-title kern-title--small kern-summary__title-wrapper">
                <span className="kern-number">{i + 1}</span>
                <span>{g.section}</span>
              </h2>
            </div>
            <div className="kern-summary__body">
              <dl className="kern-description-list">
                {g.rows.map((r) => (
                  <div className="kern-description-list-item kern-form__summary-item" key={r.key}>
                    <dt className="kern-description-list-item__key">{r.label}</dt>
                    <dd className="kern-description-list-item__value">{r.value}</dd>
                    <dd className="kern-form__summary-action">
                      <a
                        className="kern-link kern-link--no-visited-state"
                        href="#"
                        onClick={linkTo(() => onChange(r.pageIndex))}
                      >
                        <Icon name="edit" />
                        {ui.check.change}
                        <span className="kern-sr-only">: {r.label}</span>
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
        <div className="kern-stack-sm">
          <h2 className="kern-heading-medium">{ui.check.send_heading}</h2>
          <p className="kern-body">{ui.check.send_body}</p>
        </div>
        <div>
          <button type="submit" className="kern-btn kern-btn--primary">
            <span className="kern-label">{ui.check.button}</span>
          </button>
        </div>
      </>
    )
  },

  // A success Alert with the reference (its title is the page heading), "So geht es weiter" as a
  // numbered List, the example reply in an info Alert, the record in Details, then a secondary
  // Button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <div className="kern-stack-xl">
        <Alert tone="success" title={ui.confirmation.title} titleTag="h1" headingRef={headingRef}>
          <p className="kern-body">
            {ui.confirmation.reference}: <strong className="kern-form__reference">{step.reference}</strong>
          </p>
        </Alert>
        <div className="kern-stack-md">
          <h2 className="kern-heading-medium">{ui.confirmation.next_heading}</h2>
          <ol className="kern-list kern-list--number">
            <li>
              <strong>{DONE.now}</strong> {DONE.nowBody(ack)}
            </li>
            <li>
              <strong>{DONE.by(day)}</strong> {DONE.who(team, how)}
              {r.best_times ? DONE.times : ""}.
            </li>
            <li>
              <strong>{DONE.talk}</strong> {DONE.talkBody}
              {r.interest === "not_sure" && !r.knows_child ? DONE.notSure : ""}
            </li>
          </ol>
          <p className="kern-body">{DONE.plans}</p>
          <Alert tone="info" title={ui.confirmation.example_label} titleTag="h3">
            <p className="kern-body">{exampleMessage(ui, r, step.due)}</p>
          </Alert>
        </div>
        <div className="kern-stack-sm">
          <h2 className="kern-heading-medium">{ui.confirmation.builders_heading}</h2>
          <details className="kern-details">
            <summary className="kern-details__header">
              <span className="kern-title kern-title--small">{DONE.record}</span>
            </summary>
            <div className="kern-details__body kern-stack-sm">
              <p className="kern-body">{ui.confirmation.builders_body}</p>
              <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
            </div>
          </details>
        </div>
        <div>
          <button type="button" className="kern-btn kern-btn--secondary" onClick={onRestart}>
            <span className="kern-label">{ui.confirmation.restart}</span>
          </button>
        </div>
      </div>
    )
  },
}
