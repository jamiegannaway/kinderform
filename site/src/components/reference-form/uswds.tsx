// U.S. Web Design System (USWDS) markup for the reference form (US).
// No federal banner and no identifier: those are for official .gov and .mil sites.
import { useState } from "react"
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

function Hint({ id, text }: { id: string; text?: string }) {
  return text ? (
    <div id={`${id}-hint`} className="usa-hint">
      {text}
    </div>
  ) : null
}
function ErrorMessage({ id, text }: { id: string; text?: string }) {
  return text ? (
    <span id={`${id}-error`} className="usa-error-message">
      <span className="usa-sr-only">Error:</span> {text}
    </span>
  ) : null
}
function Legend({ c }: { c: ReturnType<typeof useControl> }) {
  return c.asHeading ? (
    <legend className="usa-legend usa-legend--large">
      <h1 className="kf-us-title" tabIndex={-1} ref={c.headingRef}>
        {c.label}
      </h1>
    </legend>
  ) : (
    <legend className="usa-legend">{c.label}</legend>
  )
}

const width = (n?: number) => (n && n <= 5 ? " usa-input--small" : n && n <= 20 ? " usa-input--md" : "")

const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  return (
    <div className={`usa-form-group${c.error ? " usa-form-group--error" : ""}`}>
      {c.asHeading ? (
        <h1 className="kf-us-title" tabIndex={-1} ref={c.headingRef}>
          <label htmlFor={c.id}>
            {c.label}
          </label>
        </h1>
      ) : (
        <label className={`usa-label${c.error ? " usa-label--error" : ""}`} htmlFor={c.id}>
          {c.label}
        </label>
      )}
      <Hint id={c.id} text={c.hint} />
      <ErrorMessage id={c.id} text={c.error} />
      <input
        className={`usa-input${width(c.o.inputWidth)}${c.error ? " usa-input--error" : ""}`}
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
    <div className={`usa-form-group${c.error ? " usa-form-group--error" : ""}`}>
      <fieldset className="usa-fieldset" aria-describedby={c.describedBy}>
        <Legend c={c} />
        <Hint id={c.id} text={c.hint} />
        <ErrorMessage id={c.id} text={c.error} />
        {c.options.map((opt, i) => {
          const id = i === 0 ? c.id : `${c.id}-${i + 1}`
          return (
            <div className="usa-radio" key={opt.value}>
              <input
                className="usa-radio__input usa-radio__input--tile"
                id={id}
                name={c.field}
                type="radio"
                value={opt.value}
                checked={c.current === opt.value}
                onChange={() => c.setFromString(opt.value)}
              />
              <label className="usa-radio__label" htmlFor={id}>
                {opt.label}
                {opt.hint && <span className="usa-checkbox__label-description">{opt.hint}</span>}
              </label>
            </div>
          )
        })}
      </fieldset>
    </div>
  )
})

const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <div className={`usa-form-group${c.error ? " usa-form-group--error" : ""}`}>
      <fieldset className="usa-fieldset" aria-describedby={c.describedBy}>
        <Legend c={c} />
        <Hint id={c.id} text={c.hint} />
        <ErrorMessage id={c.id} text={c.error} />
        {c.options.map((opt, i) => {
          const id = i === 0 ? c.id : `${c.id}-${i + 1}`
          return (
            <div className="usa-checkbox" key={opt.value}>
              <input
                className="usa-checkbox__input usa-checkbox__input--tile"
                id={id}
                name={c.field}
                type="checkbox"
                value={opt.value}
                checked={c.checked(opt.value)}
                onChange={(e) => c.toggle(opt.value, e.target.checked)}
              />
              <label className="usa-checkbox__label" htmlFor={id}>
                {opt.label}
              </label>
            </div>
          )
        })}
      </fieldset>
    </div>
  )
})

const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <div className="usa-form-group">
      <fieldset className="usa-fieldset" aria-describedby={c.describedBy}>
        <Legend c={c} />
        <Hint id={c.id} text={c.hint} />
        <div className="usa-checkbox">
          <input
            className="usa-checkbox__input"
            id={c.id}
            name={c.field}
            type="checkbox"
            checked={props.data === true}
            onChange={(e) => c.set(e.target.checked ? true : undefined)}
          />
          <label className="usa-checkbox__label" htmlFor={c.id}>
            {c.o.checkboxLabel}
          </label>
        </div>
      </fieldset>
    </div>
  )
})

// USWDS step indicator, the component USWDS recommends for forms that span several pages.
function StepIndicator({ sections, current, done }: { sections: string[]; current: number; done?: boolean }) {
  return (
    <div className="usa-step-indicator usa-step-indicator--counters-sm" aria-label="Progress">
      <ol className="usa-step-indicator__segments">
        {sections.map((s, i) => {
          const state = done || i < current ? "complete" : i === current ? "current" : "incomplete"
          return (
            <li
              key={s}
              className={`usa-step-indicator__segment${state === "complete" ? " usa-step-indicator__segment--complete" : state === "current" ? " usa-step-indicator__segment--current" : ""}`}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className="usa-step-indicator__segment-label">
                {s}
                {state !== "current" && (
                  <span className="usa-sr-only">{state === "complete" ? " completed" : " not completed"}</span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
      {!done && (
        <div className="usa-step-indicator__header">
          <p className="usa-step-indicator__heading">
            <span className="usa-step-indicator__heading-counter">
              <span className="usa-sr-only">Step</span>
              <span className="usa-step-indicator__current-step">{current + 1}</span>
              <span className="usa-step-indicator__total-steps">of {sections.length}</span>
            </span>
            <span className="usa-step-indicator__heading-text">{sections[current]}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export const uswdsTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  Start: ({ ui, onStart, headingRef }) => (
    <>
      <h1 className="kf-us-start-title" tabIndex={-1} ref={headingRef}>
        {ui.start.title}
      </h1>
      <div className="usa-prose">
        {ui.start.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <div className="usa-alert usa-alert--warning usa-alert--slim kf-us-block">
        <div className="usa-alert__body">
          <p className="usa-alert__text">{ui.demo_notice}</p>
        </div>
      </div>
      <button type="button" className="usa-button usa-button--big" onClick={onStart}>
        {ui.start.button}
      </button>
    </>
  ),

  Progress: ({ ui, sectionIndex, question }) => (
    <>
      <StepIndicator sections={ui.sections} current={sectionIndex} />
      {question && (
        <p className="kf-us-small">
          {ui.progress.question} {question.n} {ui.progress.of} {question.total}
        </p>
      )}
    </>
  ),

  Back: ({ label, onBack }) => (
    <p className="kf-us-flush">
      <a
        href="#"
        className="usa-link"
        onClick={(e) => {
          e.preventDefault()
          onBack()
        }}
      >
        <span aria-hidden="true">‹ </span>
        {label}
      </a>
    </p>
  ),

  ErrorSummary: ({ title, errors, boxRef }) => (
    <div className="usa-alert usa-alert--error kf-us-block" tabIndex={-1} ref={boxRef}>
      <div className="usa-alert__body" role="alert">
        <h2 className="usa-alert__heading">{title}</h2>
        <ul className="usa-list">
          {errors.map((e) => (
            <li key={e.id}>
              <a className="usa-link" href={`#${e.id}`}>
                {e.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="kf-us-title" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="usa-button kf-us-continue">
      {label}
    </button>
  ),

  Check: ({ ui, rows, onChange, headingRef }) => (
    <>
      <h1 className="kf-us-title" tabIndex={-1} ref={headingRef}>
        {ui.check.title}
      </h1>
      <table className="usa-table usa-table--borderless usa-table--stacked-header kf-us-table">
        <caption className="usa-sr-only">Your answers</caption>
        <thead>
          <tr>
            <th scope="col">Question</th>
            <th scope="col">Your answer</th>
            <th scope="col">
              <span className="usa-sr-only">Change</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" data-label="Question">
                {r.label}
              </th>
              <td>{r.value}</td>
              <td data-label="">
                <a
                  className="usa-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    onChange(r.pageIndex)
                  }}
                >
                  {ui.check.change}
                  <span className="usa-sr-only"> {r.label.toLowerCase()}</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="kf-us-h2">{ui.check.send_heading}</h2>
      <p>{ui.check.send_body}</p>
      <button type="submit" className="usa-button">
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
        <StepIndicator sections={ui.sections} current={ui.sections.length - 1} done />
        <div className="usa-alert usa-alert--success kf-us-block">
          <div className="usa-alert__body">
            <h1 className="usa-alert__heading" tabIndex={-1} ref={headingRef}>
              {ui.confirmation.title}
            </h1>
            <p className="usa-alert__text">
              {ui.confirmation.reference}: <strong>{step.reference}</strong>
            </p>
          </div>
        </div>
        <h2 className="kf-us-h2">{ui.confirmation.next_heading}</h2>
        <ol className="usa-process-list">
          <li className="usa-process-list__item">
            <h3 className="usa-process-list__heading">Now</h3>
            <p>We sent you {ack} to confirm we have your question. It says who will contact you and when.</p>
          </li>
          <li className="usa-process-list__item">
            <h3 className="usa-process-list__heading">By the end of {day}</h3>
            <p>
              A named person from {team} will {how}
              {r.best_times ? ", at one of the times you chose" : ""}.
            </p>
          </li>
          <li className="usa-process-list__item">
            <h3 className="usa-process-list__heading">When you talk</h3>
            <p>
              You can ask questions without committing to an application.
              {r.interest === "not_sure" && !r.knows_child ? " We'll talk you through foster care, adoption and other ways to help." : ""}
            </p>
          </li>
        </ol>
        <p>If your plans change, that's fine. You can tell us at any time.</p>
        <div className="usa-summary-box kf-us-block">
          <div className="usa-summary-box__body">
            <h3 className="usa-summary-box__heading">{ui.confirmation.example_label}</h3>
            <div className="usa-summary-box__text">
              <p>{exampleMessage(ui, r, step.due)}</p>
            </div>
          </div>
        </div>
        <h2 className="kf-us-h2">{ui.confirmation.builders_heading}</h2>
        <div className="usa-accordion usa-accordion--bordered">
          <h3 className="usa-accordion__heading">
            <button
              type="button"
              className="usa-accordion__button"
              aria-expanded={open}
              aria-controls="kf-record"
              onClick={() => setOpen(!open)}
            >
              Show the record
            </button>
          </h3>
          <div id="kf-record" className="usa-accordion__content" hidden={!open}>
            <p>{ui.confirmation.builders_body}</p>
            <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
          </div>
        </div>
        <p className="kf-us-after">
          <a
            className="usa-link"
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
