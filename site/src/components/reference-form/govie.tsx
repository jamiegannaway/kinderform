// Government of Ireland Design System (GOV.IE) markup for the reference form (Ireland).
// Plain HTML that follows the markup and classes of @ogcio/design-system-react 1.52.0
// (ds.services.gov.ie): Heading, Paragraph, FormField (label, hint, error and its error state),
// InputText, InputRadio, InputCheckbox, Button, Link, Alert, ProgressBar, SummaryList, Details and
// List. The React components are not used: they are styled for Tailwind, and some set styles inline
// (the progress bar's width), which the Content-Security-Policy blocks. The styles the form needs
// are ported and scoped to .govie-form in site/src/styles/govie.scss.
// GOV.IE has no error summary, so the one here is an Alert (danger) that lists each problem as a
// link to its field.
// No government branding: no GOV.IE header, no gov.ie logo, no Harp and no Government of Ireland
// logos, in the footer or anywhere else. Kinderform is not a government service.
// Every visible word comes from schema/ui/enquiry-submission.ie.json, except the fixed sentences
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
  nowBody: (ack: string) => `We have sent you ${ack} to confirm we have your message. It says who will contact you and when.`,
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

// ---- Icons (the design system's inline SVGs: Material Symbols paths) -------------------------

const ICONS = {
  arrowBack: "m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z",
  arrowForward: "M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z",
  keyboardArrowDown: "M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z",
  warning:
    "m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm330.5-51.5Q520-263 520-280t-11.5-28.5Q497-320 480-320t-28.5 11.5Q440-297 440-280t11.5 28.5Q463-240 480-240t28.5-11.5ZM440-360h80v-200h-80v200Zm40-100Z",
  danger:
    "M508.5-291.5Q520-303 520-320t-11.5-28.5Q497-360 480-360t-28.5 11.5Q440-337 440-320t11.5 28.5Q463-280 480-280t28.5-11.5ZM440-440h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
  info: "M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
  success:
    "m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
}

// Decorative: hidden from screen readers, coloured by the text around it.
const Icon = ({ d, size = 24 }: { d: string; size?: number }) => (
  <svg
    className="gi-shrink-0 gi-block"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d={d} />
  </svg>
)

// ---- Small parts ------------------------------------------------------------------

// GOV.IE shows "(optional)" as the label's secondary label: muted and regular, after the label.
// The wording file ends those labels with "(optional)", so split it off. Every other field is
// required.
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
          <span className="gi-secondary-label">{l.optional}</span>
        </>
      )}
    </>
  )
}

function Hint({ c }: { c: C }) {
  return c.hint ? (
    <div className="gi-hint-text gi-hint-text-md" id={`${c.id}-hint`}>
      {c.hint}
    </div>
  ) : null
}

// As in GOV.IE's FormField, the message sits under the label and hint, above the field.
// aria-describedby names the hint first, then the message (shared.tsx builds it in that order).
function ErrorMessage({ c }: { c: C }) {
  return c.error ? (
    <div className="gi-error-text gi-error-text-md govie-form__error" id={`${c.id}-error`}>
      {c.error}
    </div>
  ) : null
}

// Field widths: short answers get a narrow field, a phone number half the width (GOV.IE's
// halfFluid), everything else the full width.
const innerClass = (n?: number) => (n && n > 10 && n <= 20 ? " gi-input-half-width" : "")
const containerClass = (n?: number) => (!n ? "" : n <= 5 ? " govie-form__input--5" : n <= 10 ? " govie-form__input--10" : "")

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Renderers --------------------------------------------------------------------

// FormField with an InputText: the label (bold), the hint, the message, then the field. When the
// question is the page heading, the label sits inside a Heading (large).
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { optional } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className={`gi-label${c.asHeading ? "" : " gi-text-md gi-font-bold"}`} htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className={`govie-form__field${c.error ? " gi-error-state" : ""}`}>
      {c.asHeading ? (
        <h1 className="gi-heading-lg govie-form__heading" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      <Hint c={c} />
      <ErrorMessage c={c} />
      <div className={`gi-input-text-container govie-form__control${containerClass(c.o.inputWidth)}`}>
        <div className={`gi-input-text-inner${innerClass(c.o.inputWidth)}`}>
          <input
            className="gi-input-text"
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
    </div>
  )
})

// FormField as a fieldset: the question is the legend (with a Heading inside when it is the page
// heading), then the hint, the message and the options. GOV.IE's FormField wraps its legend in a
// div; here it is the fieldset's first child, so it names the group for screen readers.
function Fieldset({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <fieldset className={`govie-form__field${c.error ? " gi-error-state" : ""}`} aria-describedby={c.describedBy}>
      {c.asHeading ? (
        <legend className="govie-form__legend">
          <h1 className="gi-heading-lg govie-form__heading" tabIndex={-1} ref={c.headingRef}>
            <LabelText label={c.label} />
          </h1>
        </legend>
      ) : (
        <legend className="govie-form__legend gi-label gi-text-md gi-font-bold">
          <LabelText label={c.label} />
        </legend>
      )}
      <Hint c={c} />
      <ErrorMessage c={c} />
      <div className="govie-form__options govie-form__control">{children}</div>
    </fieldset>
  )
}

// InputRadio (medium): the native input, drawn by GOV.IE, then its label, with an option's hint
// under the label, linked to the input with aria-describedby.
function Radio(p: { c: C; id: string; value: string; label: string; hint?: string; checked: boolean; onChange: () => void }) {
  const hintId = p.hint ? `${p.id}-item-hint` : undefined
  return (
    <div className="gi-input-radio-container">
      <input
        className="gi-input-radio-medium"
        id={p.id}
        name={p.c.field}
        type="radio"
        value={p.value}
        checked={p.checked}
        aria-invalid={p.c.error ? true : undefined}
        aria-describedby={hintId}
        onChange={p.onChange}
      />
      <div className="gi-mt-1">
        <label className="gi-label gi-text-md" htmlFor={p.id}>
          {p.label}
        </label>
        {p.hint && (
          <div className="gi-hint-text gi-hint-text-md" id={hintId}>
            {p.hint}
          </div>
        )}
      </div>
    </div>
  )
}

// InputCheckbox (medium): the native input, drawn by GOV.IE, then its label.
function Checkbox(p: { c: C; id: string; value?: string; label: React.ReactNode; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="gi-input-checkbox-container">
      <input
        className="gi-input-checkbox-medium"
        id={p.id}
        name={p.c.field}
        type="checkbox"
        value={p.value}
        checked={p.checked}
        aria-invalid={p.c.error ? true : undefined}
        onChange={(e) => p.onChange(e.target.checked)}
      />
      <label className="gi-label gi-text-md" htmlFor={p.id}>
        {p.label}
      </label>
    </div>
  )
}

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      {c.options.map((opt, i) => (
        <Radio
          key={opt.value}
          c={c}
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
        <Checkbox
          key={opt.value}
          c={c}
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

// A yes-or-no question with one box to tick (updates): the question in a fieldset, one checkbox.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      <Checkbox
        c={c}
        id={c.id}
        label={c.o.checkboxLabel}
        checked={props.data === true}
        onChange={(on) => c.set(on ? true : undefined)}
      />
    </Fieldset>
  )
})

// ---- Page parts -------------------------------------------------------------------

// Alert: the icon, then the title and the text, in the colours of its variant. GOV.IE's Alert
// always has role="alert"; here only the error summary has it, so the other alerts are not read
// out twice when a page opens.
function Alert(p: {
  variant: "danger" | "success" | "warning" | "info"
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
      className={`gi-alert-base gi-alert-${p.variant}${p.className ? ` ${p.className}` : ""}`}
      role={p.role}
      tabIndex={p.tabIndex}
      ref={p.boxRef}
    >
      <Icon d={ICONS[p.variant]} />
      <div className="gi-alert-container">
        <Title className="gi-alert-title" tabIndex={p.headingRef ? -1 : undefined} ref={p.headingRef as never}>
          {p.title}
        </Title>
        {p.children}
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
  ;(field.closest(".govie-form__field") ?? field).scrollIntoView({ block: "start" })
  field.focus({ preventScroll: true })
}

// ---- Theme ------------------------------------------------------------------------

export const govieTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // Heading, an introduction in Paragraph (large), the other paragraphs, the example notice as a
  // warning Alert (its first sentence is the title), then a primary Button.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [title, more] =
      cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <div className="govie-form__stack govie-form__stack--xl">
        <h1 className="gi-heading-lg" tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        <div className="govie-form__stack govie-form__stack--sm">
          {intro && <p className="gi-paragraph-lg">{intro}</p>}
          {rest.map((p) => (
            <p className="gi-paragraph-md" key={p}>
              {p}
            </p>
          ))}
        </div>
        <Alert variant="warning" title={title}>
          {more && <p className="gi-paragraph-md">{more}</p>}
        </Alert>
        <button type="button" className="gi-btn gi-btn-primary gi-btn-large" onClick={onStart}>
          {ui.start.button}
          <Icon d={ICONS.arrowForward} />
        </button>
      </div>
    )
  },

  // ProgressBar: the bar, then the section and "Question 2 of 9" under it. On the check page,
  // the last section and a full bar.
  Progress: ({ ui, section, question }) => (
    <div className="gi-progress-bar-container govie-form__progress">
      <progress
        className="gi-progress-bar"
        id="kf-progress"
        value={question ? question.n : 1}
        max={question ? question.total : 1}
        aria-labelledby="kf-progress-label"
      />
      <span id="kf-progress-label">
        {section}
        {question && (
          <>
            <span aria-hidden="true"> · </span>
            <span className="gi-sr-only">, </span>
            {ui.progress.question} {question.n} {ui.progress.of} {question.total}
          </>
        )}
      </span>
    </div>
  ),

  // A Link with the back arrow at its start (GOV.IE's iconStart), at the top of each page.
  Back: ({ label, onBack }) => (
    <div className="govie-form__back">
      <a href="#" className="gi-link gi-link-no-visited gi-text-md" onClick={linkTo(onBack)}>
        <span className="gi-link-icon gi-link-icon-start" data-size="md">
          <Icon d={ICONS.arrowBack} size={16} />
        </span>
        <span className="gi-pl-5 gi-pr-5">{label}</span>
      </a>
    </div>
  ),

  // GOV.IE has no error summary: an Alert (danger) that lists each problem as a link to its
  // field, in the alert's own colour (the Link's noColor).
  ErrorSummary: ({ title, errors, boxRef }) => (
    <Alert
      variant="danger"
      title={title}
      titleTag="h2"
      className="govie-form__error-summary"
      role="alert"
      tabIndex={-1}
      boxRef={boxRef}
    >
      <ul className="gi-list">
        {errors.map((e) => (
          <li key={e.id}>
            <a className="gi-link gi-link-inherit gi-text-md" href={`#${e.id}`} onClick={focusField}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="gi-heading-lg" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="gi-btn gi-btn-primary gi-btn-large">
      {label}
    </button>
  ),

  // A SummaryList for each section, under a small heading: the question, the answer and a
  // Change link, with a border under each row.
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
        <h1 className="gi-heading-lg" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <div className="govie-form__stack govie-form__stack--sm" key={g.section}>
            <h2 className="gi-heading-sm">{g.section}</h2>
            <div className="gi-summary-list">
              <table>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.key}>
                      <th scope="row">{r.label}</th>
                      <td className="govie-form__summary-value">{r.value}</td>
                      <td>
                        <div className="gi-summary-list-action">
                          <a
                            className="gi-link gi-link-no-visited"
                            href="#"
                            onClick={linkTo(() => onChange(r.pageIndex))}
                          >
                            {ui.check.change}
                            <span className="gi-sr-only"> {r.label}</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        <div className="govie-form__stack govie-form__stack--sm">
          <h2 className="gi-heading-md">{ui.check.send_heading}</h2>
          <p className="gi-paragraph-md">{ui.check.send_body}</p>
        </div>
        <div>
          <button type="submit" className="gi-btn gi-btn-primary gi-btn-large">
            {ui.check.button}
          </button>
        </div>
      </>
    )
  },

  // The heading, the reference in a success Alert, "What happens next" as a numbered List, the
  // example reply in an info Alert, the record in Details, then a secondary Button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <div className="govie-form__stack govie-form__stack--xl">
        <div className="govie-form__stack">
          <h1 className="gi-heading-lg" tabIndex={-1} ref={headingRef}>
            {ui.confirmation.title}
          </h1>
          <Alert variant="success" title={ui.confirmation.reference}>
            <p className="gi-paragraph-lg">
              <strong className="govie-form__reference">{step.reference}</strong>
            </p>
          </Alert>
        </div>
        <div className="govie-form__stack">
          <h2 className="gi-heading-md">{ui.confirmation.next_heading}</h2>
          <ol className="gi-list-number gi-list-spaced">
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
          <p className="gi-paragraph-md">{DONE.plans}</p>
          <Alert variant="info" title={ui.confirmation.example_label} titleTag="h3">
            <p className="gi-paragraph-md">{exampleMessage(ui, r, step.due)}</p>
          </Alert>
        </div>
        <div className="govie-form__stack govie-form__stack--sm">
          <h2 className="gi-heading-md">{ui.confirmation.builders_heading}</h2>
          <details className="gi-details">
            <summary className="gi-details-summary">
              <Icon d={ICONS.keyboardArrowDown} />
              <span className="gi-details-summary-text">{DONE.record}</span>
            </summary>
            <div className="gi-details-text govie-form__stack govie-form__stack--sm">
              <p className="gi-paragraph-md">{ui.confirmation.builders_body}</p>
              <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
            </div>
          </details>
        </div>
        <button type="button" className="gi-btn gi-btn-secondary gi-btn-regular" onClick={onRestart}>
          {ui.confirmation.restart}
        </button>
      </div>
    )
  },
}
