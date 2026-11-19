// GC Design System (GCDS) markup for the reference form (Canada).
// It follows the markup and behaviour of the gcds-* web components (@cdssnc/gcds-components 0.47),
// written as plain HTML: the web components add styles at runtime, which the Content-Security-Policy
// blocks. Styles are in site/src/styles/gcds.scss and apply only inside the .gcds-form root class.
// No government branding: no Canada wordmark, no flag symbol, no "Government of Canada" signature,
// no header or footer. Kinderform is not a government service.
import { useState } from "react"
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, formatDay, type Theme, type UiConfig } from "./engine"
import { Layout, testers, useControl } from "./shared"

// Put this class on the element that holds the form. Every GCDS style is scoped to it.
export const GCDS_ROOT_CLASS = "gcds-form"

// Words the GCDS components supply themselves (from their en and fr i18n files).
const I18N = {
  en: { step: "Step", success: "Success: ", info: "Information: ", warning: "Warning: " },
  fr: { step: "Étape", success: "Succès : ", info: "Information : ", warning: "Avertissement : " },
}
const words = (ui: UiConfig) => I18N[ui.locale.toLowerCase().startsWith("fr") ? "fr" : "en"]

// ---- Icons ----------------------------------------------------------------
// GCDS draws icons with its own icon font. These inline SVGs stand in for the same glyphs.

const Svg = ({ d, className = "" }: { d: string; className?: string }) => (
  <svg
    className={`gcds-icon ${className}`}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path fillRule="evenodd" d={d} />
  </svg>
)
const ICONS = {
  warning: "M12 1.5 23.5 21.5H.5Zm-1 7v6.5h2V8.5Zm0 8.5v2h2v-2Z",
  success: "M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm-1.5 15.6L5.9 12l1.4-1.4 3.2 3.2L17.3 7l1.4 1.4Z",
  info: "M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm-1 5v2h2V6Zm0 4v8h2v-8Z",
  chevronLeft: "M15.5 3.5 17 5l-7 7 7 7-1.5 1.5L7 12Z",
}

// ---- Pieces of each question (gcds-label, gcds-hint, gcds-error-message) -----------------

function Hint({ id, text, className = "" }: { id: string; text?: string; className?: string }) {
  return text ? (
    <p id={id} className={`gcds-hint ${className}`}>
      {text}
    </p>
  ) : null
}

// gcds-error-message: a warning icon and the message in bold, linked to the field by aria-describedby.
// GCDS also gives each message role="alert" because it checks fields as you leave them. Here errors
// appear only when you press Continue, together with the error summary, which takes focus and is
// announced, so the message in the field does not announce itself a second time.
function ErrorMessage({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={`${id}-error`} className="gcds-error-message">
      <Svg d={ICONS.warning} className="gcds-error-message__icon" />
      <strong>{text}</strong>
    </p>
  ) : null
}

type C = ReturnType<typeof useControl>

// The question becomes the page heading when the wording file says asHeading.
function Question({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <h1 className="gcds-heading gcds-heading--page" tabIndex={-1} ref={c.headingRef}>
      {children}
    </h1>
  )
}

// Legend of gcds-radios and gcds-checkboxes. GCDS spaces the legend differently with and without a hint.
function Legend({ c, block }: { c: C; block: "gcds-radios" | "gcds-checkboxes" }) {
  const cls = `${block}__legend${c.hint ? "" : ` ${block}__legend--no-hint`}${c.asHeading ? " gcds-legend--heading" : ""}`
  return <legend className={cls}>{c.asHeading ? <Question c={c}>{c.label}</Question> : c.label}</legend>
}

// ---- Renderers ------------------------------------------------------------

// gcds-input: label, hint, error message, then the field.
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className={`gcds-label${c.asHeading ? " gcds-label--heading" : ""}`} htmlFor={c.id}>
      {c.label}
    </label>
  )
  return (
    <div className={`gcds-input-wrapper${c.error ? " gcds-error" : ""}`}>
      {c.asHeading ? <Question c={c}>{label}</Question> : label}
      <Hint id={`${c.id}-hint`} text={c.hint} />
      <ErrorMessage id={c.id} text={c.error} />
      <input
        className={`gcds-input${c.o.inputWidth ? ` gcds-input--size-${c.o.inputWidth}` : ""}${c.error ? " gcds-error" : ""}`}
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

// gcds-radios: a fieldset with a legend, the hint and error message, then one gcds-radio per option.
const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <div className="gcds-radios">
      <fieldset className="gcds-radios__fieldset" aria-describedby={c.describedBy}>
        <Legend c={c} block="gcds-radios" />
        <Hint id={`${c.id}-hint`} text={c.hint} />
        <ErrorMessage id={c.id} text={c.error} />
        {c.options.map((opt, i) => {
          const id = i === 0 ? c.id : `${c.id}-${i + 1}`
          return (
            <div className={`gcds-radio${c.error ? " gcds-radio--error" : ""}`} key={opt.value}>
              <input
                className="gcds-radio__input"
                id={id}
                name={c.field}
                type="radio"
                value={opt.value}
                checked={c.current === opt.value}
                aria-invalid={c.error ? true : undefined}
                aria-describedby={opt.hint ? `${id}-item-hint` : undefined}
                onChange={() => c.setFromString(opt.value)}
              />
              <label className="gcds-label gcds-radio__label" htmlFor={id}>
                {opt.label}
              </label>
              <Hint id={`${id}-item-hint`} text={opt.hint} className="gcds-radio__hint" />
            </div>
          )
        })}
      </fieldset>
    </div>
  )
})

// gcds-checkboxes with more than one option: a group in a fieldset.
const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <fieldset className="gcds-checkboxes__fieldset" aria-describedby={c.describedBy}>
      <Legend c={c} block="gcds-checkboxes" />
      <Hint id={`${c.id}-hint`} text={c.hint} />
      <ErrorMessage id={c.id} text={c.error} />
      {c.options.map((opt, i) => {
        const id = i === 0 ? c.id : `${c.id}-${i + 1}`
        return (
          <div className={`gcds-checkbox${c.error ? " gcds-checkbox--error" : ""}`} key={opt.value}>
            <input
              className="gcds-checkbox__input"
              id={id}
              name={c.field}
              type="checkbox"
              value={opt.value}
              checked={c.checked(opt.value)}
              aria-invalid={c.error ? true : undefined}
              onChange={(e) => c.toggle(opt.value, e.target.checked)}
            />
            <label className="gcds-label gcds-checkbox__label" htmlFor={id}>
              {opt.label}
            </label>
          </div>
        )
      })}
    </fieldset>
  )
})

// A yes-or-no question with one box to tick, such as updates: the question in a gcds-fieldset,
// with one gcds-checkbox inside.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <fieldset className="gcds-checkboxes__fieldset" aria-describedby={c.describedBy}>
      <Legend c={c} block="gcds-checkboxes" />
      <Hint id={`${c.id}-hint`} text={c.hint} />
      <ErrorMessage id={c.id} text={c.error} />
      <div className={`gcds-checkbox${c.error ? " gcds-checkbox--error" : ""}`}>
        <input
          className="gcds-checkbox__input"
          id={c.id}
          name={c.field}
          type="checkbox"
          checked={props.data === true}
          aria-invalid={c.error ? true : undefined}
          onChange={(e) => c.set(e.target.checked ? true : undefined)}
        />
        <label className="gcds-label gcds-checkbox__label" htmlFor={c.id}>
          {c.o.checkboxLabel}
        </label>
      </div>
    </fieldset>
  )
})

// ---- Page parts -------------------------------------------------------------

// gcds-notice: a coloured bar with an icon, a heading and a short message.
function Notice({
  ui,
  type,
  title,
  tag: Tag = "h2",
  headingRef,
  children,
}: {
  ui: UiConfig
  type: "success" | "info" | "warning"
  title: string
  tag?: "h1" | "h2" | "h3"
  headingRef?: React.Ref<HTMLHeadingElement>
  children?: React.ReactNode
}) {
  return (
    <section className={`gcds-notice notice--type-${type}`}>
      <span className="notice__icon">
        <Svg d={ICONS[type]} className="notice__glyph" />
      </span>
      <div className="notice__content">
        <Tag className="notice__heading" tabIndex={headingRef ? -1 : undefined} ref={headingRef}>
          <span className="gcds-sr-only">{words(ui)[type]}</span>
          {title}
        </Tag>
        {children}
      </div>
    </section>
  )
}

// gcds-details: a button that shows and hides a panel. As in GCDS, the panel is a <details>
// element, so the browser can open it when someone searches the page for text inside.
function Details({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="gcds-details">
      <button
        type="button"
        className="details__summary"
        id={`${id}-summary`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {title}
      </button>
      <details
        className="details__panel"
        id={id}
        open={open}
        aria-labelledby={`${id}-summary`}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary>{title}</summary>
        {children}
      </details>
    </div>
  )
}

// As in gcds-error-summary: move to the field, with its label or legend in view.
function focusField(id: string) {
  const field = document.getElementById(id)
  if (!field) return
  const label = field.closest("fieldset")?.querySelector("legend") ?? document.querySelector(`label[for="${id}"]`)
  label?.scrollIntoView({ block: "start" })
  field.focus({ preventScroll: !!label })
}

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Theme ---------------------------------------------------------------

export const gcdsTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  Start: ({ ui, onStart, headingRef }) => {
    // The wording file has one notice sentence block: its first sentence becomes the notice heading.
    const cut = ui.demo_notice.indexOf(". ")
    const [title, rest] = cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut), ui.demo_notice.slice(cut + 2)]
    return (
      <>
        <h1 className="gcds-heading gcds-heading--start" tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        {ui.start.body.map((p) => (
          <p className="gcds-text" key={p}>
            {p}
          </p>
        ))}
        <Notice ui={ui} type="warning" title={title}>
          {rest && <p>{rest}</p>}
        </Notice>
        <button type="button" className="gcds-button button--role-start" onClick={onStart}>
          {ui.start.button}
        </button>
      </>
    )
  },

  // gcds-stepper shows "Step 2 of 4" above the heading. Here the question is the page heading,
  // so the stepper is a line of text above it rather than a heading of its own.
  Progress: ({ ui, sectionIndex, section }) => (
    <p className="gcds-stepper">
      <span className="gcds-stepper__steps">
        {words(ui).step} {sectionIndex + 1} {ui.progress.of} {ui.sections.length}:
      </span>{" "}
      {section}
    </p>
  ),

  Back: ({ label, onBack }) => (
    <p className="gcds-back">
      <a href="#" className="gcds-link link--small" onClick={linkTo(onBack)}>
        <Svg d={ICONS.chevronLeft} className="gcds-back__icon" />
        {label}
      </a>
    </p>
  ),

  ErrorSummary: ({ title, errors, boxRef }) => (
    <div className="gcds-error-summary-wrapper">
      <div className="gcds-error-summary" role="alert" tabIndex={-1} ref={boxRef}>
        <h2 className="gcds-heading gcds-error-summary__heading">{title}</h2>
        <ol className="summary__errorlist">
          {errors.map((e) => (
            <li className="summary__listitem" key={e.id}>
              <a className="gcds-link link--regular" href={`#${e.id}`} onClick={linkTo(() => focusField(e.id))}>
                {e.message}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="gcds-heading gcds-heading--page" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <div className="gcds-actions">
      <button type="submit" className="gcds-button button--role-primary">
        {label}
      </button>
    </div>
  ),

  // GCDS has no summary list component yet, so this is a description list built from GCDS tokens.
  Check: ({ ui, rows, onChange, headingRef }) => (
    <>
      <h1 className="gcds-heading gcds-heading--page" tabIndex={-1} ref={headingRef}>
        {ui.check.title}
      </h1>
      <dl className="gcds-summary-list">
        {rows.map((r) => (
          <div className="gcds-summary-list__row" key={r.key}>
            <dt className="gcds-summary-list__key">{r.label}</dt>
            <dd className="gcds-summary-list__value">{r.value}</dd>
            <dd className="gcds-summary-list__actions">
              <a className="gcds-link" href="#" onClick={linkTo(() => onChange(r.pageIndex))}>
                {ui.check.change}
                <span className="gcds-sr-only"> {r.label.toLowerCase()}</span>
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <h2 className="gcds-heading gcds-heading--section">{ui.check.send_heading}</h2>
      <p className="gcds-text">{ui.check.send_body}</p>
      <div className="gcds-actions">
        <button type="submit" className="gcds-button button--role-primary">
          {ui.check.button}
        </button>
      </div>
    </>
  ),

  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? "an email" : "a text message"
    const how = r.contact_method === "email" ? "email you" : r.contact_method === "text_message" ? "text you" : "call you"
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <>
        <Notice ui={ui} type="success" title={ui.confirmation.title} tag="h1" headingRef={headingRef}>
          <p>
            {ui.confirmation.reference}: <strong className="gcds-reference">{step.reference}</strong>
          </p>
        </Notice>
        <h2 className="gcds-heading gcds-heading--section">{ui.confirmation.next_heading}</h2>
        <ol className="gcds-list">
          <li>
            <strong>Now.</strong> We have sent you {ack} to confirm we have your enquiry. It says who will contact you and
            when.
          </li>
          <li>
            <strong>By the end of {day}.</strong> A named person from {team} will {how}
            {r.best_times ? ", at one of the times you chose" : ""}.
          </li>
          <li>
            <strong>When you talk.</strong> Ask anything. There are no wrong questions, and nothing you ask counts against
            you.
            {r.interest === "not_sure" && !r.knows_child ? " We will talk you through fostering, adoption and other ways to help." : ""}
          </li>
        </ol>
        <p className="gcds-text">If your plans change, that's fine. You can tell us at any time.</p>
        <Notice ui={ui} type="info" title={ui.confirmation.example_label} tag="h3">
          <p>{exampleMessage(ui, r, step.due)}</p>
        </Notice>
        <h2 className="gcds-heading gcds-heading--section">{ui.confirmation.builders_heading}</h2>
        <Details id="kf-record" title="Show the record">
          <p>{ui.confirmation.builders_body}</p>
          <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
        </Details>
        <p className="gcds-text gcds-after">
          <a className="gcds-link" href="#" onClick={linkTo(onRestart)}>
            {ui.confirmation.restart}
          </a>
        </p>
      </>
    )
  },
}
