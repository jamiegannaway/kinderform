// Det Fælles Designsystem (DKFDS) markup for the reference form (Denmark).
// Plain HTML with the markup and classes of the components in the dkfds package 11.3.0
// (src/components, designsystem.dk): Form group with Label, Help text (form-hint) and Error
// message, Text input with its widths, Radio buttons, Checkboxes, Button, Back link, Alert,
// Details, Structured list (a table) and the simple Step indicator's subheading. DKFDS's error
// summary (Fejlopsummering) is an error Alert that lists each problem as a link to its field;
// focusField below does what the package's error-summary.js does. DKFDS's JavaScript is not
// loaded. The styles are ported and scoped to .dkfds-form in site/src/styles/dkfds.scss (MIT).
// Nothing here sets a style attribute, so the Content-Security-Policy holds.
// The order in a form group follows DKFDS: label, help text, error message, then the field.
// Optional questions say "(frivilligt)" after the label in the regular weight, as DKFDS's Label
// does; required ones carry no mark.
// Icons are the package's own (src/img/svg-icons): Material Symbols, Apache License 2.0, as
// inline SVG paths. Alert icons carry DKFDS's Danish labels (Information, Succes, Advarsel, Fejl).
// No branding that belongs to the portals or to public bodies: no borger.dk or Virk theme or logo,
// no MitID or NemLog-in header, no authority's logo and no coat of arms. Kinderform is not a
// government service.
// Every visible word comes from schema/ui/enquiry-submission.dk.json, except the fixed sentences
// of the confirmation page and the hidden words for errors and icons, which are in the tables
// below, and the engine's own Danish phrases and example reply.
import { Fragment } from "react"
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// Hidden words that the wording file does not hold: DKFDS's own, from its Error message and
// Alert components.
const WORDS = {
  error: "Fejl:",
  icon: { info: "Information", success: "Succes", warning: "Advarsel", error: "Fejl" },
}

// The fixed sentences of the confirmation page, in Danish. As in the other themes, they live in
// code rather than in the wording file.
const DONE = {
  ack: { email: "en e-mail", text: "en sms" },
  now: "Nu.",
  nowBody: (ack: string) =>
    `Vi har sendt dig ${ack}. Den bekræfter, at vi har fået din henvendelse. Der står også, hvem der kontakter dig, og hvornår.`,
  by: (day: string) => `Senest ${day}.`,
  how: { email: "skriver til dig", text_message: "sender dig en sms", phone_call: "ringer til dig" } as Record<string, string>,
  who: (team: string, how: string) => `En fast kontaktperson fra ${team} ${how}`,
  times: " på et af de tidspunkter, du har valgt",
  talk: "Når I taler sammen.",
  // The same words as the engine's Danish example reply.
  talkBody: "Du kan stille spørgsmål uden at forpligte dig til at søge.",
  notSure: " Vi fortæller dig om at blive plejefamilie, om adoption og om andre måder at hjælpe på.",
  plans: "Ændrer dine planer sig? Det er helt i orden. Du kan altid give os besked.",
  record: "Vis oplysningerne",
}

// ---- Icons (dkfds 11.3.0, src/img/svg-icons: Material Symbols, Apache License 2.0) ----------

const ICONS = {
  "chevron-left": "M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z",
  info: "M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
  success:
    "m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
  warning:
    "m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z",
  error:
    "M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
} as const

// DKFDS's icon_svg: hidden from screen readers unless it has a label (the alert icons do).
function Icon({ name, className, label }: { name: keyof typeof ICONS; className?: string; label?: string }) {
  return (
    <svg
      className={`icon-svg${className ? ` ${className}` : ""}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      focusable="false"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

// ---- Small parts ------------------------------------------------------------------

// DKFDS's Label marks a question that is not required with "(frivilligt)" after it, in the
// regular weight. The wording file ends those labels with it; split it off.
const OPTIONAL = /\s*\(frivilligt\)\s*$/i
function splitLabel(label: string) {
  const m = label.match(OPTIONAL)
  return m ? { text: label.slice(0, m.index), optional: m[0].trim() } : { text: label, optional: undefined }
}

function LabelText({ label }: { label: string }) {
  const l = splitLabel(label)
  return (
    <>
      {l.text}
      {l.optional && <span className="weight-normal"> {l.optional}</span>}
    </>
  )
}

function Hint({ c }: { c: C }) {
  return c.hint ? (
    <span className="form-hint" id={`${c.id}-hint`}>
      {c.hint}
    </span>
  ) : null
}

// DKFDS's Error message: under the label and help text, above the field, with a hidden "Fejl:".
// aria-describedby names the help text first, then the message (shared.tsx builds it in that order).
function ErrorMessage({ c }: { c: C }) {
  return c.error ? (
    <span className="form-error-message" id={`${c.id}-error`}>
      <span className="sr-only">{WORDS.error} </span>
      {c.error}
    </span>
  ) : null
}

// Field widths by the characters expected: DKFDS's input-char-* for short answers (a postcode
// is input-char-4) and input-width-s for a name or phone number. Everything else keeps the
// Text input's own width.
const widthClass = (n?: number) => {
  if (!n) return ""
  if (n <= 4) return " input-char-4"
  if (n <= 8) return " input-char-8"
  if (n <= 11) return " input-char-11"
  return n <= 20 ? " input-width-s" : ""
}

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Renderers --------------------------------------------------------------------

// Form group with a Text input. When the question is the page heading, the label sits inside
// the heading (an h1 in the h2 look).
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { optional } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className="form-label" htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className={`form-group${c.error ? " form-error" : ""}`}>
      {c.asHeading ? (
        <h1 className="h2 dkfds-form__heading" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      <Hint c={c} />
      <ErrorMessage c={c} />
      <input
        className={`form-input${widthClass(c.o.inputWidth)}`}
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
  )
})

// Form group with a fieldset: the question is the legend (with the heading inside when it is
// the page heading), then the help text, the error message and the options.
function Fieldset({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <div className={`form-group${c.error ? " form-error" : ""}`}>
      <fieldset aria-describedby={c.describedBy}>
        {c.asHeading ? (
          <legend>
            <h1 className="h2 dkfds-form__heading" tabIndex={-1} ref={c.headingRef}>
              <LabelText label={c.label} />
            </h1>
          </legend>
        ) : (
          <legend className="form-label">
            <LabelText label={c.label} />
          </legend>
        )}
        <Hint c={c} />
        <ErrorMessage c={c} />
        {children}
      </fieldset>
    </div>
  )
}

// One Radio button or Checkbox: the native input (invisible, drawn by the label), its label, then
// its help text, linked with aria-describedby.
function Option(p: {
  c: C
  type: "radio" | "checkbox"
  id: string
  value?: string
  label: React.ReactNode
  hint?: string
  checked: boolean
  onChange: (on: boolean) => void
}) {
  const radio = p.type === "radio"
  const hintId = p.hint ? `${p.id}-hint` : undefined
  return (
    <div className={radio ? "form-group-radio" : "form-group-checkbox"}>
      <input
        className={radio ? "form-radio" : "form-checkbox"}
        id={p.id}
        name={p.c.field}
        type={p.type}
        value={p.value}
        checked={p.checked}
        aria-invalid={p.c.error ? true : undefined}
        aria-describedby={hintId}
        onChange={(e) => p.onChange(e.target.checked)}
      />
      <label className="form-label" htmlFor={p.id}>
        {p.label}
      </label>
      {p.hint && (
        <span className="form-hint" id={hintId}>
          {p.hint}
        </span>
      )}
    </div>
  )
}

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      {c.options.map((opt, i) => (
        <Option
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
        <Option
          key={opt.value}
          c={c}
          type="checkbox"
          id={optionId(c, i)}
          value={opt.value}
          label={opt.label}
          hint={opt.hint}
          checked={c.checked(opt.value)}
          onChange={(on) => c.toggle(opt.value, on)}
        />
      ))}
    </Fieldset>
  )
})

// A yes-or-no question with one box to tick (updates): the question in a fieldset, one Checkbox.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      <Option
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

// DKFDS's Alert: the labelled icon, then the body with a heading and text. DKFDS gives warning
// and error alerts role="alert"; here only the error summary has it, so the other alerts are not
// read out when a page opens.
function Alert(p: {
  variant: "info" | "success" | "warning" | "error"
  role?: string
  tabIndex?: number
  boxRef?: React.Ref<HTMLDivElement>
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`alert alert-${p.variant}${p.className ? ` ${p.className}` : ""}`}
      role={p.role}
      tabIndex={p.tabIndex}
      ref={p.boxRef}
    >
      <Icon name={p.variant} className="alert-icon" label={WORDS.icon[p.variant]} />
      <div className="alert-body">{p.children}</div>
    </div>
  )
}

// From the error summary to the field: focus it, with its label or legend in view (as DKFDS's
// error-summary.js does).
function focusField(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.hash.slice(1)
  const field = id ? document.getElementById(id) : null
  if (!field) return
  e.preventDefault()
  ;(field.closest(".form-group") ?? field).scrollIntoView({ block: "start" })
  field.focus({ preventScroll: true })
}

// ---- Theme ------------------------------------------------------------------------

export const dkfdsTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // The heading, a lead paragraph, the other paragraphs, the example notice as a warning Alert
  // (its first sentence is the heading), then a primary Button.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [title, more] =
      cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <>
        <h1 className="h2" tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        {intro && <p className="font-lead dkfds-form__lead">{intro}</p>}
        {rest.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <Alert variant="warning">
          <p className="alert-heading">{title}</p>
          {more && <p className="alert-text">{more}</p>}
        </Alert>
        <div className="dkfds-form__buttons">
          <button type="button" className="button button-primary" onClick={onStart}>
            {ui.start.button}
          </button>
        </div>
      </>
    )
  },

  // The simple Step indicator's subheading: the section, then "Spørgsmål 2 af 9". On the check
  // page, the last section alone.
  Progress: ({ ui, section, question }) => (
    <p className="step-subheading dkfds-form__progress">
      {section}
      {question && (
        <span className="dkfds-form__progress-count">
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          {ui.progress.question} {question.n} {ui.progress.of} {question.total}
        </span>
      )}
    </p>
  ),

  // DKFDS's Back link, at the top of each page.
  Back: ({ label, onBack }) => (
    <div>
      <a href="#" className="back-link" onClick={linkTo(onBack)}>
        <Icon name="chevron-left" />
        {label}
      </a>
    </div>
  ),

  // The error summary: an error Alert with a heading and each problem as a link to its field.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <Alert variant="error" className="dkfds-form__error-summary" role="alert" tabIndex={-1} boxRef={boxRef}>
      <h2 className="alert-heading">{title}</h2>
      <ul className="alert-text nobullet-list">
        {errors.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} onClick={focusField}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="h2" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="button button-primary">
      {label}
    </button>
  ),

  // A Structured list for each section, under a small heading: the question, the answer and an
  // edit link with the question in hidden text, as DKFDS's Structured list has it. Below 768px
  // each row shows the question over the answer (table-sm-responsive-headers).
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
        <h1 className="h2" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <Fragment key={g.section}>
            <h2 className="h4">{g.section}</h2>
            <table className="table structured-list table-sm-responsive-headers dkfds-form__summary">
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.key}>
                    <th scope="row">{r.label}</th>
                    <td>{r.value}</td>
                    <td className="dkfds-form__summary-action">
                      <a href="#" onClick={linkTo(() => onChange(r.pageIndex))}>
                        {ui.check.change}
                        <span className="sr-only"> {r.label.toLowerCase()}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Fragment>
        ))}
        <h2 className="h3">{ui.check.send_heading}</h2>
        <p>{ui.check.send_body}</p>
        <div className="dkfds-form__buttons">
          <button type="submit" className="button button-primary">
            {ui.check.button}
          </button>
        </div>
      </>
    )
  },

  // The heading, the reference in a success Alert, "Det sker der nu" as a numbered list, the
  // example reply in an info Alert, the record in Details, then a secondary Button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <>
        <h1 className="h2" tabIndex={-1} ref={headingRef}>
          {ui.confirmation.title}
        </h1>
        <Alert variant="success">
          <p className="alert-heading">{ui.confirmation.reference}</p>
          <p className="alert-text">
            <strong className="dkfds-form__reference">{step.reference}</strong>
          </p>
        </Alert>
        <h2 className="h3">{ui.confirmation.next_heading}</h2>
        <ol className="dkfds-form__next">
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
        <p>{DONE.plans}</p>
        <Alert variant="info">
          <h3 className="alert-heading">{ui.confirmation.example_label}</h3>
          <p className="alert-text">{exampleMessage(ui, r, step.due)}</p>
        </Alert>
        <h2 className="h3">{ui.confirmation.builders_heading}</h2>
        <details className="details">
          <summary className="details-summary">{DONE.record}</summary>
          <div className="details-text">
            <p>{ui.confirmation.builders_body}</p>
            <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
          </div>
        </details>
        <div className="dkfds-form__buttons">
          <button type="button" className="button button-secondary" onClick={onRestart}>
            {ui.confirmation.restart}
          </button>
        </div>
      </>
    )
  },
}
