// GOV.UK Frontend markup for the reference form (UK).
// GOV.UK patterns without GOV.UK branding: no crown, no GOV.UK logotype, no GDS Transport.
import { useState } from "react"
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

function Hint({ id, text }: { id: string; text?: string }) {
  return text ? (
    <div id={`${id}-hint`} className="govuk-hint">
      {text}
    </div>
  ) : null
}
function ErrorMessage({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={`${id}-error`} className="govuk-error-message">
      <span className="govuk-visually-hidden">Error:</span> {text}
    </p>
  ) : null
}
function Legend({ c }: { c: ReturnType<typeof useControl> }) {
  return c.asHeading ? (
    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
      <h1 className="govuk-fieldset__heading" tabIndex={-1} ref={c.headingRef}>
        {c.label}
      </h1>
    </legend>
  ) : (
    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">{c.label}</legend>
  )
}

const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const label = (
    <label className={`govuk-label${c.asHeading ? " govuk-label--l" : ""}`} htmlFor={c.id}>
      {c.label}
    </label>
  )
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  return (
    <div className={`govuk-form-group${c.error ? " govuk-form-group--error" : ""}`}>
      {c.asHeading ? (
        <h1 className="govuk-label-wrapper" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      <Hint id={c.id} text={c.hint} />
      <ErrorMessage id={c.id} text={c.error} />
      <input
        className={`govuk-input${c.o.inputWidth ? ` govuk-input--width-${c.o.inputWidth}` : ""}${c.error ? " govuk-input--error" : ""}`}
        id={c.id}
        name={c.field}
        type={type}
        value={c.current}
        autoComplete={c.o.autocomplete}
        inputMode={c.o.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
        spellCheck={c.o.spellcheck}
        aria-describedby={c.describedBy}
        onChange={(e) => c.setFromString(e.target.value)}
        onBlur={c.onBlur}
      />
    </div>
  )
})

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <div className={`govuk-form-group${c.error ? " govuk-form-group--error" : ""}`}>
      <fieldset className="govuk-fieldset" aria-describedby={c.describedBy}>
        <Legend c={c} />
        <Hint id={c.id} text={c.hint} />
        <ErrorMessage id={c.id} text={c.error} />
        <div className="govuk-radios" data-module="govuk-radios">
          {c.options.map((opt, i) => {
            const id = i === 0 ? c.id : `${c.id}-${i + 1}`
            return (
              <div className="govuk-radios__item" key={opt.value}>
                <input
                  className="govuk-radios__input"
                  id={id}
                  name={c.field}
                  type="radio"
                  value={opt.value}
                  checked={c.current === opt.value}
                  aria-describedby={opt.hint ? `${id}-item-hint` : undefined}
                  onChange={() => c.setFromString(opt.value)}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={id}>
                  {opt.label}
                </label>
                {opt.hint && (
                  <div id={`${id}-item-hint`} className="govuk-hint govuk-radios__hint">
                    {opt.hint}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
})

const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <div className={`govuk-form-group${c.error ? " govuk-form-group--error" : ""}`}>
      <fieldset className="govuk-fieldset" aria-describedby={c.describedBy}>
        <Legend c={c} />
        <Hint id={c.id} text={c.hint} />
        <ErrorMessage id={c.id} text={c.error} />
        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
          {c.options.map((opt, i) => {
            const id = i === 0 ? c.id : `${c.id}-${i + 1}`
            return (
              <div className="govuk-checkboxes__item" key={opt.value}>
                <input
                  className="govuk-checkboxes__input"
                  id={id}
                  name={c.field}
                  type="checkbox"
                  value={opt.value}
                  checked={c.checked(opt.value)}
                  onChange={(e) => c.toggle(opt.value, e.target.checked)}
                />
                <label className="govuk-label govuk-checkboxes__label" htmlFor={id}>
                  {opt.label}
                </label>
              </div>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
})

const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <div className="govuk-form-group">
      <fieldset className="govuk-fieldset" aria-describedby={c.describedBy}>
        <Legend c={c} />
        <Hint id={c.id} text={c.hint} />
        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id={c.id}
              name={c.field}
              type="checkbox"
              checked={props.data === true}
              onChange={(e) => c.set(e.target.checked ? true : undefined)}
            />
            <label className="govuk-label govuk-checkboxes__label" htmlFor={c.id}>
              {c.o.checkboxLabel}
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  )
})

const Arrow = () => (
  <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
  </svg>
)

function Warning({ text }: { text: string }) {
  return (
    <div className="govuk-warning-text">
      <span className="govuk-warning-text__icon" aria-hidden="true">
        !
      </span>
      <strong className="govuk-warning-text__text">
        <span className="govuk-visually-hidden">Warning</span>
        {text}
      </strong>
    </div>
  )
}

export const govukTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  Start: ({ ui, onStart, headingRef }) => (
    <>
      <h1 className="govuk-heading-xl" tabIndex={-1} ref={headingRef}>
        {ui.start.title}
      </h1>
      {ui.start.body.map((p) => (
        <p className="govuk-body" key={p}>
          {p}
        </p>
      ))}
      <Warning text={ui.demo_notice} />
      <button type="button" className="govuk-button govuk-button--start" data-module="govuk-button" onClick={onStart}>
        {ui.start.button}
        <Arrow />
      </button>
    </>
  ),

  // GOV.UK has no progress bar. A caption naming the section and the question number,
  // above every question, is the clearest way to show where you are.
  Progress: ({ ui, section, question }) => (
    <span className="govuk-caption-l kf-caption">
      {section}
      {question && (
        <>
          <span aria-hidden="true">: </span>
          <span className="govuk-visually-hidden">, </span>
          {ui.progress.question.toLowerCase()} {question.n} {ui.progress.of} {question.total}
        </>
      )}
    </span>
  ),

  Back: ({ label, onBack }) => (
    <a
      href="#"
      className="govuk-back-link"
      onClick={(e) => {
        e.preventDefault()
        onBack()
      }}
    >
      {label}
    </a>
  ),

  ErrorSummary: ({ title, errors, boxRef }) => (
    <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} ref={boxRef}>
      <div role="alert">
        <h2 className="govuk-error-summary__title">{title}</h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {errors.map((e) => (
              <li key={e.id}>
                <a href={`#${e.id}`}>{e.message}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="govuk-heading-l" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="govuk-button" data-module="govuk-button">
      {label}
    </button>
  ),

  Check: ({ ui, rows, onChange, headingRef }) => (
    <>
      <h1 className="govuk-heading-l" tabIndex={-1} ref={headingRef}>
        {ui.check.title}
      </h1>
      <dl className="govuk-summary-list">
        {rows.map((r) => (
          <div className="govuk-summary-list__row" key={r.key}>
            <dt className="govuk-summary-list__key">{r.label}</dt>
            <dd className="govuk-summary-list__value">{r.value}</dd>
            <dd className="govuk-summary-list__actions">
              <a
                className="govuk-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onChange(r.pageIndex)
                }}
              >
                {ui.check.change}
                <span className="govuk-visually-hidden"> {r.label.toLowerCase()}</span>
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <h2 className="govuk-heading-m">{ui.check.send_heading}</h2>
      <p className="govuk-body">{ui.check.send_body}</p>
      <button type="submit" className="govuk-button" data-module="govuk-button">
        {ui.check.button}
      </button>
    </>
  ),

  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? "an email" : "a text message"
    const how = r.contact_method === "email" ? "email you" : r.contact_method === "text_message" ? "text you" : "call you"
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    const [open, setOpen] = useState(false)
    return (
      <>
        <div className="govuk-panel govuk-panel--confirmation">
          <h1 className="govuk-panel__title" tabIndex={-1} ref={headingRef}>
            {ui.confirmation.title}
          </h1>
          <div className="govuk-panel__body">
            {ui.confirmation.reference}
            <br />
            <strong>{step.reference}</strong>
          </div>
        </div>
        <h2 className="govuk-heading-m">{ui.confirmation.next_heading}</h2>
        <ol className="govuk-list govuk-list--number govuk-list--spaced">
          <li>
            <strong>Now.</strong> We have sent {ack} to confirm we have your message. It says who will contact you and when.
          </li>
          <li>
            <strong>By the end of {day}.</strong> A named person from {team} will {how}
            {r.best_times ? ", at one of the times you chose" : ""}.
          </li>
          <li>
            <strong>When you talk.</strong> Ask anything. There are no wrong questions, and nothing you ask counts against you.
            {r.interest === "not_sure" && !r.knows_child ? " We will talk you through fostering, adoption and other ways to help." : ""}
          </li>
        </ol>
        <p className="govuk-body">If your plans change, that's fine. You can tell us at any time.</p>
        <div className="govuk-inset-text">
          <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-2">{ui.confirmation.example_label}</p>
          <p className="govuk-body govuk-!-margin-bottom-0">{exampleMessage(ui, r, step.due)}</p>
        </div>
        <h2 className="govuk-heading-m">{ui.confirmation.builders_heading}</h2>
        <details className="govuk-details" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">Show the record</span>
          </summary>
          <div className="govuk-details__text">
            <p className="govuk-body">{ui.confirmation.builders_body}</p>
            <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
          </div>
        </details>
        <p className="govuk-body">
          <a
            className="govuk-link"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onRestart()
            }}
          >
            {ui.confirmation.restart}
          </a>
        </p>
      </>
    )
  },
}
