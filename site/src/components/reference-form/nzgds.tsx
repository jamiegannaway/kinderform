// New Zealand Government Design System (alpha) markup for the reference form (New Zealand).
// Plain HTML that follows the markup of @govtnz/ds 0.2.2 (build/html and the react-ts
// components): InputBlock, FieldsetBlock, RadioBlock in Radios (the small radios), CheckboxBlock,
// Button, A (link), Alert, CaptionM, H1 and H2 (the heading classes), P, Ol, Ul and InsetText.
// The styled-components React variants are not used: they add styles at run time, which the
// Content-Security-Policy (style-src 'self') blocks. The package's plain CSS is ported, scoped
// to .nzgds-form, in site/src/styles/nzgds.scss.
// The design system has no back link, error summary, summary list or details. Here the back
// link is a Link, the error summary is an Alert (error) that lists each problem with the
// system's error summary links, and the check page and record use its type, links and tokens.
// No government branding: no New Zealand Government wordmark or logo, no Department of Internal
// Affairs logo, no coat of arms, no Header and no Footer brand lockup. Kinderform is not a
// government service.
// Every visible word comes from schema/ui/enquiry-submission.nz.json, except the fixed sentences
// of the confirmation page and the hidden "Error:", which are in the WORDS table below.
import { Fragment } from "react"
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// Words the design system's components supply themselves (the hidden "Error:" before each error
// message), and the fixed sentences of the confirmation page. As in the other themes, they live
// in code rather than in the wording file.
const WORDS = {
  error: "Error:",
  ack: { email: "an email", text: "a text message" },
  now: "Now.",
  nowBody: (ack: string) => `We have sent you ${ack} to confirm we have your message. It says who will contact you and when.`,
  by: (day: string) => `By the end of ${day}.`,
  how: { email: "email you", text_message: "text you", phone_call: "call you" } as Record<string, string>,
  who: (team: string, how: string) => `A named person from ${team} will ${how}`,
  times: ", at one of the times you chose",
  talk: "When you talk.",
  talkBody: "You can ask questions without committing to an application.",
  notSure: " We will talk you through caregiving, adoption and other ways to help.",
  plans: "If your plans change, that's fine. You can tell us at any time.",
  record: "Show the record",
}

// ---- Field parts ----------------------------------------------------------------------

// InputBlock and FieldsetBlock widths: 2, 3, 4, 5, 10, 20 and 30 characters.
const widthClass = (n?: number) =>
  n ? ` g-inputBlock-input--width-${n <= 2 ? 2 : n <= 3 ? 3 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 10 ? 10 : n <= 20 ? 20 : 30}` : ""

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Renderers --------------------------------------------------------------------------

// InputBlock: label, hint, error message, then the input. When the question is the page heading,
// the label sits inside a Heading (large).
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  return (
    <div className={`g-inputBlock-form-group${c.error ? " g-inputBlock-form-group--error" : ""}`}>
      {c.asHeading ? (
        <h1 className="g-heading g-heading-l nzgds-form__heading" tabIndex={-1} ref={c.headingRef}>
          <label className="g-inputBlock-label nzgds-form__heading-label" htmlFor={c.id}>
            {c.label}
          </label>
        </h1>
      ) : (
        <label className="g-inputBlock-label" htmlFor={c.id}>
          {c.label}
        </label>
      )}
      {c.hint && (
        <div className="g-inputBlock-hint" id={`${c.id}-hint`}>
          {c.hint}
        </div>
      )}
      {c.error && (
        <div className="g-inputBlock-error-message" id={`${c.id}-error`}>
          <span className="g-inputBlock-visually-hidden">{WORDS.error} </span>
          {c.error}
        </div>
      )}
      <input
        className={`g-inputBlock-input${widthClass(c.o.inputWidth)}${c.error ? " g-inputBlock-input--error" : ""}`}
        id={c.id}
        name={c.field}
        type={type}
        value={c.current}
        autoComplete={c.o.autocomplete}
        inputMode={c.o.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
        spellCheck={c.o.spellcheck}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={c.describedBy}
        onChange={(e) => c.setFromString(e.target.value)}
        onBlur={c.onBlur}
      />
    </div>
  )
})

// FieldsetBlock: the question is the legend (with a Heading inside when it is the page heading),
// then the hint, the error message and the options.
function Fieldset({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <div className={`g-fieldsetBlock-form-group${c.error ? " g-fieldsetBlock-form-group--error" : ""}`}>
      <fieldset className="g-fieldsetBlock-fieldset" aria-describedby={c.describedBy}>
        {c.asHeading ? (
          <legend className="g-fieldsetBlock-fieldset__legend nzgds-form__legend">
            <h1 className="g-heading g-heading-l" tabIndex={-1} ref={c.headingRef}>
              {c.label}
            </h1>
          </legend>
        ) : (
          <legend className="g-fieldsetBlock-fieldset__legend">{c.label}</legend>
        )}
        {c.hint && (
          <div className="g-fieldsetBlock-hint" id={`${c.id}-hint`}>
            {c.hint}
          </div>
        )}
        {c.error && (
          <div className="g-fieldsetBlock-error-message" id={`${c.id}-error`}>
            <span className="g-fieldsetBlock-visually-hidden">{WORDS.error} </span>
            {c.error}
          </div>
        )}
        {children}
      </fieldset>
    </div>
  )
}

// RadioBlock: the hidden native input, its drawn label, then its hint (linked by aria-describedby).
function Radio(p: { c: C; id: string; value: string; label: string; hint?: string; checked: boolean; onChange: () => void }) {
  const hintId = p.hint ? `${p.id}-item-hint` : undefined
  return (
    <div className="g-radios__item">
      <input
        className="g-radios__input"
        id={p.id}
        name={p.c.field}
        type="radio"
        value={p.value}
        checked={p.checked}
        aria-describedby={hintId}
        onChange={p.onChange}
      />
      <label className="g-radios__label" htmlFor={p.id}>
        {p.label}
      </label>
      {p.hint && (
        <div className="g-radios__hint" id={hintId}>
          {p.hint}
        </div>
      )}
    </div>
  )
}

// CheckboxBlock: the hidden native input, then its drawn label.
function Checkbox(p: { c: C; id: string; value?: string; label: React.ReactNode; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="g-checkboxes__item">
      <input
        className="g-checkboxes__input"
        id={p.id}
        name={p.c.field}
        type="checkbox"
        value={p.value}
        checked={p.checked}
        onChange={(e) => p.onChange(e.target.checked)}
      />
      <label className="g-checkboxes__label" htmlFor={p.id}>
        {p.label}
      </label>
    </div>
  )
}

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      <div className="g-radios">
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
      </div>
    </Fieldset>
  )
})

const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      <div className="g-checkboxes">
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
      </div>
    </Fieldset>
  )
})

// A yes-or-no question with one box to tick (updates): the question in a FieldsetBlock, one
// CheckboxBlock.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Fieldset c={c}>
      <div className="g-checkboxes">
        <Checkbox
          c={c}
          id={c.id}
          label={c.o.checkboxLabel}
          checked={props.data === true}
          onChange={(on) => c.set(on ? true : undefined)}
        />
      </div>
    </Fieldset>
  )
})

// ---- Page parts -------------------------------------------------------------------------

// From the error summary to the field: focus it, with its label or legend in view.
function focusField(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.hash.slice(1)
  const field = id ? document.getElementById(id) : null
  if (!field) return
  e.preventDefault()
  ;(field.closest(".g-fieldsetBlock-form-group, .g-inputBlock-form-group") ?? field).scrollIntoView({ block: "start" })
  field.focus({ preventScroll: true })
}

// ---- Theme ------------------------------------------------------------------------------

export const nzgdsTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // Heading (large), the introduction as a large paragraph, the other paragraphs, the example
  // notice in a warning Alert, then a Button.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [first, more] =
      cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <>
        <h1 className="g-heading g-heading-l" tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        {intro && <p className="g-body g-body-l">{intro}</p>}
        {rest.map((p) => (
          <p className="g-body" key={p}>
            {p}
          </p>
        ))}
        <div role="note">
          <div className="g-alert g-alert--warning">
            <p className="g-body">
              <strong>{first}</strong>
              {more && ` ${more}`}
            </p>
          </div>
        </div>
        <button type="button" className="g-button" onClick={onStart}>
          {ui.start.button}
        </button>
      </>
    )
  },

  // The design system has no progress indicator. A Caption (medium) above the question names the
  // section and the question number, the way its captions sit above a heading.
  Progress: ({ ui, section, question }) => (
    <span className="g-caption g-caption-m nzgds-form__progress">
      {section}
      {question && (
        <>
          <span aria-hidden="true"> · </span>
          <span className="g-visually-hidden">, </span>
          <span className="nzgds-form__progress-count">
            {ui.progress.question} {question.n} {ui.progress.of} {question.total}
          </span>
        </>
      )}
    </span>
  ),

  Back: ({ label, onBack }) => (
    <div>
      <a href="#" className="g-link nzgds-form__back" onClick={linkTo(onBack)}>
        {label}
      </a>
    </div>
  ),

  // An Alert (error) with a heading and the error summary list: each problem links to its field.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <div className="nzgds-form__error" role="alert" tabIndex={-1} ref={boxRef}>
      <div className="g-alert g-alert--error">
        <h2 className="g-heading g-heading-m">{title}</h2>
        <ul className="g-ul g-ul--no-bullet g-skipLink-error-summary__list">
          {errors.map((e) => (
            <li key={e.id}>
              <a className="g-link" href={`#${e.id}`} onClick={focusField}>
                {e.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="g-heading g-heading-l" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="g-button">
      {label}
    </button>
  ),

  // A Heading (medium) for each section and a list of its answers, each with a Change link that
  // goes straight back to the question.
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
        <h1 className="g-heading g-heading-l" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <Fragment key={g.section}>
            <h2 className="g-heading g-heading-m">{g.section}</h2>
            <dl className="nzgds-form__summary">
              {g.rows.map((r) => (
                <div className="nzgds-form__summary-row" key={r.key}>
                  <dt className="nzgds-form__summary-key">{r.label}</dt>
                  <dd className="nzgds-form__summary-value">{r.value}</dd>
                  <dd className="nzgds-form__summary-action">
                    <a className="g-link" href="#" onClick={linkTo(() => onChange(r.pageIndex))}>
                      {ui.check.change}
                      <span className="g-visually-hidden"> {r.label.toLowerCase()}</span>
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </Fragment>
        ))}
        <h2 className="g-heading g-heading-m">{ui.check.send_heading}</h2>
        <p className="g-body">{ui.check.send_body}</p>
        <button type="submit" className="g-button">
          {ui.check.button}
        </button>
      </>
    )
  },

  // A success Alert with the reference (its heading is the page heading), "What happens next" as
  // a numbered list, the example reply in Inset text, the record in a Details, then a secondary
  // Button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? WORDS.ack.email : WORDS.ack.text
    const how = WORDS.how[String(r.contact_method)] ?? WORDS.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <>
        <div role="note">
          <div className="g-alert g-alert--success">
            <h1 className="g-heading g-heading-m" tabIndex={-1} ref={headingRef}>
              {ui.confirmation.title}
            </h1>
            <p className="g-body">
              {ui.confirmation.reference}: <strong className="nzgds-form__reference">{step.reference}</strong>
            </p>
          </div>
        </div>
        <h2 className="g-heading g-heading-m">{ui.confirmation.next_heading}</h2>
        <ol className="g-ol nzgds-form__steps">
          <li>
            <strong>{WORDS.now}</strong> {WORDS.nowBody(ack)}
          </li>
          <li>
            <strong>{WORDS.by(day)}</strong> {WORDS.who(team, how)}
            {r.best_times ? WORDS.times : ""}.
          </li>
          <li>
            <strong>{WORDS.talk}</strong> {WORDS.talkBody}
            {r.interest === "not_sure" && !r.knows_child ? WORDS.notSure : ""}
          </li>
        </ol>
        <p className="g-body">{WORDS.plans}</p>
        <div className="g-inset-text">
          <h3 className="g-heading g-heading-s">{ui.confirmation.example_label}</h3>
          <p>{exampleMessage(ui, r, step.due)}</p>
        </div>
        <h2 className="g-heading g-heading-m">{ui.confirmation.builders_heading}</h2>
        <details className="nzgds-form__details">
          <summary className="nzgds-form__details-summary">
            <span className="nzgds-form__details-summary-text">{WORDS.record}</span>
          </summary>
          <div className="nzgds-form__details-body">
            <p>{ui.confirmation.builders_body}</p>
            <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
          </div>
        </details>
        <button type="button" className="g-button g-button--secondary" onClick={onRestart}>
          {ui.confirmation.restart}
        </button>
      </>
    )
  },
}
