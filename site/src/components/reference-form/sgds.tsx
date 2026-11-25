// Singapore Government Design System (SGDS) markup for the reference form (Singapore).
// Plain HTML that follows the shadow DOM markup and classes of the sgds-* web components in
// @govtechsg/sgds-web-component 3.31.0 (designsystem.tech.gov.sg): Input, Radio group, Checkbox
// group, Button, Link, Alert, Stepper, Description list and Accordion. The web components attach
// their styles to a shadow root at runtime, which the Content-Security-Policy blocks, so their CSS
// is ported and scoped to .sgds-form in site/src/styles/sgds.scss.
// SGDS has no error summary, so the one here is a danger Alert that lists each problem as a link
// to its field.
// No government branding: no Official Government Banner or masthead ("A Singapore Government
// Agency Website"), no crest, no lion head or Merlion symbol, no agency identifiers. The SGDS
// licence keeps these out of its MIT grant, and Kinderform is not a government service.
// Every visible word comes from schema/ui/enquiry-submission.sg.json, except the fixed sentences
// of the confirmation page, which are in the DONE table below.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// The fixed sentences of the confirmation page. As in the other themes, they live in code rather
// than in the wording file.
const DONE = {
  ack: { email: "an email", text: "a text message" },
  now: "Now.",
  nowBody: (ack: string) => `We have sent you ${ack} to confirm we have your enquiry. It says who will contact you and when.`,
  by: (day: string) => `By the end of ${day}.`,
  how: { email: "email you", text_message: "text you", phone_call: "call you" } as Record<string, string>,
  who: (team: string, how: string) => `A named person from ${team} will ${how}`,
  times: ", at one of the times you chose",
  talk: "When you talk.",
  talkBody: "Ask anything. There are no wrong questions, and nothing you ask counts against you.",
  notSure: " We will talk you through fostering, adoption and other ways to help.",
  plans: "If your plans change, that's fine. You can tell us at any time.",
  record: "Show the record",
}

// ---- Icons ------------------------------------------------------------------------
// SGDS icons (components/Icon/icons), as inline SVG. sgds-icon loads them at runtime.

const ICONS = {
  "arrow-left":
    "M12.424 5.576a.6.6 0 0 1 0 .848L7.448 11.4H18a.6.6 0 1 1 0 1.2H7.448l4.976 4.976a.6.6 0 0 1-.848.848l-6-6a.6.6 0 0 1 0-.848l6-6a.6.6 0 0 1 .848 0Z",
  "arrow-right":
    "M11.576 5.576a.6.6 0 0 1 .848 0l6 6a.6.6 0 0 1 0 .848l-6 6a.6.6 0 0 1-.848-.848L16.55 12.6H6a.6.6 0 1 1 0-1.2h10.55l-4.975-4.976a.6.6 0 0 1 0-.848Z",
  "exclamation-circle-fill":
    "M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-7.976a.876.876 0 0 0-.875.876V13a.875.875 0 0 0 1.75 0V7.9A.876.876 0 0 0 12 7.024Z",
  "exclamation-triangle-fill":
    "M11.36 2.286a1.574 1.574 0 0 1 1.279 0c.295.13.5.368.665.6.163.23.34.537.55.899l8.043 13.891c.21.363.388.67.507.927.12.26.223.556.19.878a1.575 1.575 0 0 1-.64 1.11c-.262.19-.571.249-.856.275-.281.025-.637.026-1.056.026H3.957c-.419 0-.775 0-1.056-.026-.285-.026-.593-.085-.855-.275a1.575 1.575 0 0 1-.64-1.11c-.033-.322.07-.619.19-.878.119-.256.297-.564.507-.927l8.043-13.891c.209-.362.387-.669.55-.899.164-.232.369-.47.664-.6ZM12 15.75a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-7.975a.875.875 0 0 0-.875.875v5.1a.875.875 0 0 0 1.75 0v-5.1A.875.875 0 0 0 12 7.775Z",
  "check-circle-fill":
    "M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm4.907 6.593a.875.875 0 0 0-1.237 0l-5.17 5.17-2.182-2.183a.876.876 0 0 0-1.238 1.238l2.802 2.801a.875.875 0 0 0 1.237 0l5.788-5.788a.876.876 0 0 0 0-1.238Z",
  "info-circle-fill":
    "M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 8.125a.875.875 0 0 0-.875.875v5.1a.875.875 0 1 0 1.75 0V11a.875.875 0 0 0-.875-.875ZM12 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  "chevron-down":
    "M5.576 8.576a.6.6 0 0 1 .848 0L12 14.15l5.576-5.575a.6.6 0 0 1 .848.848l-6 6a.6.6 0 0 1-.848 0l-6-6a.6.6 0 0 1 0-.848Z",
}

function Icon({ name, size, className = "" }: { name: keyof typeof ICONS; size?: "sm" | "md"; className?: string }) {
  return (
    <svg
      className={`sgds-icon${size ? ` sgds-icon--${size}` : ""}${className ? ` ${className}` : ""}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d={ICONS[name]} />
    </svg>
  )
}

// ---- Small parts ------------------------------------------------------------------

// SGDS marks nothing as required, and the wording file ends optional labels with "(optional)".
// Show that part in the subtle, regular style, so the question itself stands out.
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
          <span className="sgds-form__optional">{l.optional}</span>
        </>
      )}
    </>
  )
}

function Hint({ c }: { c: C }) {
  return c.hint ? (
    <div className="form-text" id={`${c.id}-hint`}>
      {c.hint}
    </div>
  ) : null
}

// The invalid feedback of SGDS form controls: the exclamation icon, then the message.
function ErrorMessage({ c }: { c: C }) {
  return c.error ? (
    <div className="invalid-feedback-container">
      <Icon name="exclamation-circle-fill" size="md" />
      <div className="invalid-feedback" id={`${c.id}-error`}>
        {c.error}
      </div>
    </div>
  ) : null
}

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Renderers --------------------------------------------------------------------

// sgds-input: the label, the field, then the feedback. SGDS puts the hint under the field and
// shows the message in its place; here the message comes first and the hint stays, so an example
// such as the phone format is still there when it is needed. When the question is the page
// heading, the label sits inside the h1.
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { optional } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className="form-label" htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  const narrow = c.o.inputWidth && c.o.inputWidth <= 20
  return (
    <div className="form-control-container">
      {c.asHeading ? (
        <h1 className="sgds-form__heading" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      <div className="form-control-row">
        <div
          className={`form-control-group${narrow ? " sgds-form__width-narrow" : ""}${c.error ? " is-invalid" : ""}`}
        >
          <input
            className="form-control"
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
        </div>
      </div>
      <ErrorMessage c={c} />
      <Hint c={c} />
    </div>
  )
})

// sgds-radio-group and sgds-checkbox-group: the question (a legend here, so screen readers name the
// group), the hint, the options, then the feedback.
function Fieldset({ c, kind, children }: { c: C; kind: "radio" | "checkbox"; children: React.ReactNode }) {
  return (
    <fieldset className="sgds-fieldset" aria-describedby={c.describedBy}>
      {c.asHeading ? (
        <legend className="sgds-form__legend-heading">
          <h1 className="sgds-form__heading" tabIndex={-1} ref={c.headingRef}>
            <span className="form-label">
              <LabelText label={c.label} />
            </span>
          </h1>
        </legend>
      ) : (
        <legend className="form-label">
          <LabelText label={c.label} />
        </legend>
      )}
      <Hint c={c} />
      <div className={kind === "radio" ? "radio-container" : "checkbox-container"}>{children}</div>
      <ErrorMessage c={c} />
    </fieldset>
  )
}

// sgds-radio and sgds-checkbox: the native input, drawn by SGDS, then its label. SGDS has no hint
// for a single option; where the wording has one, it sits under the option label and is linked to
// the input with aria-describedby.
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
  const hintId = p.hint ? `${p.id}-item-hint` : undefined
  const label = (
    <label className="form-check-label" htmlFor={p.id}>
      {p.label}
    </label>
  )
  return (
    <div className={`form-check${p.type === "checkbox" ? " form-check--checkbox" : ""}`}>
      <input
        className={`form-check-input${p.c.error ? " is-invalid" : ""}`}
        id={p.id}
        name={p.c.field}
        type={p.type}
        value={p.value}
        checked={p.checked}
        aria-invalid={p.c.error ? true : undefined}
        aria-describedby={hintId}
        onChange={(e) => p.onChange(e.target.checked)}
      />
      {p.hint ? (
        <div className="sgds-form__check-text">
          {label}
          <div className="form-text" id={hintId}>
            {p.hint}
          </div>
        </div>
      ) : (
        label
      )}
    </div>
  )
}

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c} kind="radio">
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
    <Fieldset c={c} kind="checkbox">
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

// A yes-or-no question with one box to tick (updates): the question in a group, one Checkbox.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c} kind="checkbox">
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

const ALERT_ICON = {
  info: "info-circle-fill",
  success: "check-circle-fill",
  warning: "exclamation-triangle-fill",
  danger: "exclamation-circle-fill",
} as const

// sgds-alert, outlined: the icon, then the title and the description. SGDS gives every alert
// role="alert"; here only the error summary has it, so the other notes are not read out on arrival.
function Alert(p: {
  variant: keyof typeof ALERT_ICON
  title: React.ReactNode
  titleTag?: "div" | "h2" | "h3"
  role?: string
  tabIndex?: number
  boxRef?: React.Ref<HTMLDivElement>
  className?: string
  children?: React.ReactNode
}) {
  const Title = p.titleTag ?? "div"
  return (
    <div
      className={`alert alert--outlined alert--${p.variant}${p.className ? ` ${p.className}` : ""}`}
      role={p.role}
      tabIndex={p.tabIndex}
      ref={p.boxRef}
    >
      <Icon name={ALERT_ICON[p.variant]} className="alert__icon" />
      <div className="alert-content">
        <div className="alert-content__upper">
          <Title className="alert-title">{p.title}</Title>
          {p.children && <div className="alert-content__description">{p.children}</div>}
        </div>
      </div>
    </div>
  )
}

// From the error summary to the field: focus it, with its label or legend in view.
function focusField(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.hash.slice(1)
  const field = id ? document.getElementById(id) : null
  if (!field) return
  e.preventDefault()
  ;(field.closest(".sgds-fieldset, .form-control-container") ?? field).scrollIntoView({ block: "start" })
  field.focus({ preventScroll: true })
}

// ---- Theme ------------------------------------------------------------------------

export const sgdsTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // The heading, an introduction in the large body size, the other paragraphs, the example notice
  // as a warning Alert (its first sentence is the title), then a primary Button.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [title, more] =
      cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <div className="sgds-form__stack">
        <h1 tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        <div>
          {intro && <p className="sgds-form__intro">{intro}</p>}
          {rest.map((p, i) => (
            <p key={p} className={i === rest.length - 1 ? "sgds-form__last" : undefined}>
              {p}
            </p>
          ))}
        </div>
        <Alert variant="warning" title={title}>
          {more && <p>{more}</p>}
        </Alert>
        <button type="button" className="btn has-right-icon" onClick={onStart}>
          <span>{ui.start.button}</span>
          <Icon name="arrow-right" size="md" />
        </button>
      </div>
    )
  },

  // Stepper: one step for each section, with the current one marked. Under it, "Question 2 of 9".
  // On the check page, the last section and no count.
  Progress: ({ ui, sectionIndex, question }) => (
    <div className="sgds-form__progress">
      <ol className="stepper">
        {ui.sections.map((s, i) => {
          const state = i === sectionIndex ? "is-active" : i < sectionIndex ? "is-completed" : ""
          return (
            <li className="stepper-item-container" key={s}>
              <div className={`stepper-item${state ? ` ${state}` : ""}`} aria-current={i === sectionIndex ? "step" : undefined}>
                <span className="stepper-marker" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="stepper-detail">{s}</span>
              </div>
            </li>
          )
        })}
      </ol>
      {question && (
        <p className="sgds-form__progress-count">
          {ui.progress.question} {question.n} {ui.progress.of} {question.total}
        </p>
      )}
    </div>
  ),

  // sgds-link with the arrow-left icon, at the top of each page.
  Back: ({ label, onBack }) => (
    <div className="sgds-form__back">
      <a href="#" className="sgds-link" onClick={linkTo(onBack)}>
        <Icon name="arrow-left" size="md" className="icon-left" />
        {label}
      </a>
    </div>
  ),

  // SGDS has no error summary: a danger Alert that lists each problem as a link to its field.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <Alert variant="danger" title={title} titleTag="h2" className="sgds-form__error" role="alert" tabIndex={-1} boxRef={boxRef}>
      <ul>
        {errors.map((e) => (
          <li key={e.id}>
            <a className="alert-link" href={`#${e.id}`} onClick={focusField}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="btn no-icon">
      <span>{label}</span>
    </button>
  ),

  // A bordered Description list for each section, with the section as its title. SGDS has no
  // change link in the list; here each answer has its own, so a person goes straight to the
  // question they want to change.
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
      <div className="sgds-form__stack">
        <h1 tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <div className="description-list-group sgds-form__wide" key={g.section}>
            <div className="description-list-group__header">
              <h2 className="description-list-group__title">{g.section}</h2>
            </div>
            <dl className="description-list">
              {g.rows.map((r) => (
                <div className="description-list__item" key={r.key}>
                  <dt className="description-list__label">{r.label}</dt>
                  <dd className="description-list__data">{r.value}</dd>
                  <dd className="sgds-form__summary-action">
                    <a className="sgds-link" href="#" onClick={linkTo(() => onChange(r.pageIndex))}>
                      {ui.check.change}
                      <span className="sgds-sr-only">: {r.label}</span>
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        <div>
          <h2>{ui.check.send_heading}</h2>
          <p className="sgds-form__last">{ui.check.send_body}</p>
        </div>
        <button type="submit" className="btn no-icon">
          <span>{ui.check.button}</span>
        </button>
      </div>
    )
  },

  // The page heading, a success Alert with the reference, "What happens next" as a numbered list,
  // the example reply in an info Alert, the record in an Accordion, then an outline Button to start
  // again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <div className="sgds-form__stack">
        <h1 tabIndex={-1} ref={headingRef}>
          {ui.confirmation.title}
        </h1>
        <Alert variant="success" title={ui.confirmation.reference}>
          <p>
            <strong className="sgds-form__reference">{step.reference}</strong>
          </p>
        </Alert>
        <div className="sgds-form__wide">
          <h2>{ui.confirmation.next_heading}</h2>
          <ol>
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
          <p className="sgds-form__last">{DONE.plans}</p>
        </div>
        <Alert variant="info" title={ui.confirmation.example_label} titleTag="h3">
          <p>{exampleMessage(ui, r, step.due)}</p>
        </Alert>
        <div className="sgds-form__wide">
          <h2>{ui.confirmation.builders_heading}</h2>
          <details className="accordion">
            <summary className="accordion-btn">
              <span>{DONE.record}</span>
              <span className="accordion-header__trailing">
                <Icon name="chevron-down" />
              </span>
            </summary>
            <div className="accordion-body">
              <p className="sgds-form__last">{ui.confirmation.builders_body}</p>
              <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
            </div>
          </details>
        </div>
        <button type="button" className="btn btn--outline no-icon" onClick={onRestart}>
          <span>{ui.confirmation.restart}</span>
        </button>
      </div>
    )
  },
}
