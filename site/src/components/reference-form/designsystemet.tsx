// Designsystemet markup for the reference form (Norway).
// Plain HTML with the markup and classes of @digdir/designsystemet-react 1.24.1 and
// @digdir/designsystemet-css 1.24.1 (designsystemet.no, MIT, © Digitaliseringsdirektoratet):
// Heading, Paragraph, Label, Field (as Textfield builds it, with Field.Affixes), Input, Radio,
// Checkbox, Fieldset, ValidationMessage, ErrorSummary, Alert, Button, Link, List, Card and Details.
// The React components are not used: Field, Fieldset and ErrorSummary rely on the custom elements of
// @digdir/designsystemet-web, which set ids, labels and ARIA attributes at runtime (and, for some
// fields, inline styles). Here the markup carries those attributes itself, so no script changes it
// and nothing sets a style attribute, and the Content-Security-Policy holds. The styles are ported
// and scoped to .dsn-form in site/src/styles/designsystemet.scss, with a neutral theme of our own
// built with @digdir/designsystemet 1.24.1.
// The order in a field follows Designsystemet: label, description, the field, then the validation
// message under it. Optional questions say "(valgfritt)" after the label; required ones carry no
// mark. As the ds-field element does, an input's aria-describedby names the validation message
// first, then the descriptions.
// Icons are Aksel icons (@navikt/aksel-icons 8.23.2, MIT), the set Designsystemet uses, as inline
// SVG paths. The alert, validation and details icons are Designsystemet's own, in its CSS.
// No government branding: no Digdir, Altinn or agency theme, no logo, no coat of arms and no
// ID-porten header. Kinderform is not a government service.
// Every visible word comes from schema/ui/enquiry-submission.no.json, except the fixed sentences of
// the confirmation page and the hidden word before an error message, which are in the tables below,
// and the engine's own Norwegian phrases and example reply.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// The hidden word before each error message, which the wording file does not hold.
const WORDS = {
  error: "Feil:",
}

// The fixed sentences of the confirmation page, in Norwegian (Bokmål). As in the other themes,
// they live in code rather than in the wording file.
const DONE = {
  ack: { email: "en e-post", text: "en SMS" },
  now: "Nå.",
  nowBody: (ack: string) =>
    `Vi har sendt deg ${ack} som bekrefter at vi har fått spørsmålet ditt. Der står det hvem som tar kontakt med deg, og når.`,
  by: (day: string) => `Senest ${day}.`,
  how: { email: "sende deg en e-post", text_message: "sende deg en SMS", phone_call: "ringe deg" } as Record<string, string>,
  who: (team: string, how: string) => `En fast kontaktperson fra ${team} skal ${how}`,
  times: ", på et av tidspunktene du valgte",
  talk: "Når dere snakker sammen.",
  // The same words as the engine's Norwegian example reply.
  talkBody: "Du kan stille spørsmål uten å forplikte deg til å søke.",
  notSure: " Vi forteller deg om fosterhjem, adopsjon og andre måter å hjelpe på.",
  plans: "Endrer planene dine seg? Det går fint. Du kan si fra når som helst.",
  record: "Vis opplysningene",
}

// ---- Icons (Aksel icons 8.23.2, MIT) ---------------------------------------------------------

const ICONS = {
  ChevronLeft:
    "M14.5303 5.96967C14.8232 6.26256 14.8232 6.73744 14.5303 7.03033L9.56066 12L14.5303 16.9697C14.8232 17.2626 14.8232 17.7374 14.5303 18.0303C14.2374 18.3232 13.7626 18.3232 13.4697 18.0303L7.96967 12.5303C7.82902 12.3897 7.75 12.1989 7.75 12C7.75 11.8011 7.82902 11.6103 7.96967 11.4697L13.4697 5.96967C13.7626 5.67678 14.2374 5.67678 14.5303 5.96967Z",
  ArrowRight:
    "M14.0878 6.87338C14.3788 6.68148 14.774 6.7139 15.0302 6.97006L19.5302 11.4701C19.6707 11.6107 19.7499 11.8015 19.7499 12.0003C19.7498 12.1991 19.6707 12.39 19.5302 12.5306L15.0302 17.0306C14.7739 17.2866 14.3788 17.3183 14.0878 17.1263C14.0462 17.0989 14.0062 17.0672 13.9696 17.0306C13.7133 16.7743 13.6817 16.3784 13.8739 16.0873C13.9013 16.0458 13.9331 16.0066 13.9696 15.9701L17.1893 12.7503H4.99988C4.58909 12.7503 4.25528 12.4196 4.24988 12.0101C4.24984 12.007 4.24988 12.0035 4.24988 12.0003C4.24988 11.5862 4.58572 11.2504 4.99988 11.2503H17.1893L13.9696 8.03061C13.7133 7.77433 13.6817 7.37837 13.8739 7.08725C13.9013 7.04583 13.9331 7.00655 13.9696 6.97006C14.0062 6.93345 14.0462 6.90084 14.0878 6.87338Z",
}

// Decorative: hidden from screen readers, coloured by the text around it. Designsystemet sizes
// an SVG inside a Button or Link itself (--ds-icon-size).
const Icon = ({ d }: { d: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" focusable="false">
    <path d={d} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
  </svg>
)

// ---- Small parts ------------------------------------------------------------------

// The wording file ends the labels of optional questions with "(valgfritt)". Split it off and show
// it in the regular weight, after the label.
const OPTIONAL = /\s*\(valgfritt\)\s*$/i
function splitLabel(label: string) {
  const m = label.match(OPTIONAL)
  return m ? { text: label.slice(0, m.index), optional: m[0].trim() } : { text: label, optional: undefined }
}

function LabelText({ label }: { label: string }) {
  const l = splitLabel(label)
  return (
    <>
      {l.text}
      {l.optional && (
        <>
          {" "}
          <span className="dsn-form__optional">{l.optional}</span>
        </>
      )}
    </>
  )
}

// As ds-field does: the validation message first, then the description.
const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined
const hintId = (c: C) => (c.hint ? `${c.id}-hint` : undefined)
const errorId = (c: C) => (c.error ? `${c.id}-error` : undefined)

// ValidationMessage, with a hidden "Feil:" before the message.
function Validation({ c }: { c: C }) {
  return c.error ? (
    <p className="ds-validation-message" data-field="validation" id={errorId(c)}>
      <span className="ds-sr-only">{WORDS.error} </span>
      {c.error}
    </p>
  ) : null
}

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Renderers --------------------------------------------------------------------

// Textfield: a Field with the Label, the description, the Input (in Field.Affixes, as Textfield
// renders it) and the ValidationMessage. When the question is the page heading, the label sits
// inside a Heading. Short answers get the size attribute, which Designsystemet uses for width.
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { optional } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className="ds-label" htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className="ds-field">
      {c.asHeading ? (
        <h1 className="ds-heading dsn-form__question" data-size="md" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      {c.hint && (
        <div data-field="description" id={hintId(c)}>
          {c.hint}
        </div>
      )}
      <div className="ds-field-affixes">
        <input
          className="ds-input"
          id={c.id}
          name={c.field}
          type={type}
          size={c.o.inputWidth}
          value={c.current}
          autoComplete={c.o.autocomplete}
          inputMode={c.o.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
          spellCheck={c.o.spellcheck}
          aria-required={!optional}
          aria-invalid={c.error ? true : undefined}
          aria-describedby={describedBy(errorId(c), hintId(c))}
          onChange={(e) => c.setFromString(e.target.value)}
          onBlur={c.onBlur}
        />
      </div>
      <Validation c={c} />
    </div>
  )
})

// Fieldset: the question is the legend (a Label; with a Heading inside when it is the page
// heading), then the description, the options and the ValidationMessage.
function Fieldset({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <fieldset className="ds-fieldset" aria-describedby={hintId(c)}>
      <legend className="ds-label">
        {c.asHeading ? (
          <h1 className="ds-heading dsn-form__question" data-size="md" tabIndex={-1} ref={c.headingRef}>
            <LabelText label={c.label} />
          </h1>
        ) : (
          <LabelText label={c.label} />
        )}
      </legend>
      {c.hint && (
        <p className="ds-paragraph" data-field="description" id={hintId(c)}>
          {c.hint}
        </p>
      )}
      {children}
      <Validation c={c} />
    </fieldset>
  )
}

// Radio or Checkbox: a Field with the Input, its Label (regular weight) and its description. As
// ds-field does inside a fieldset, each input names the group's validation message, then its own
// description.
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
  const itemHint = p.hint ? `${p.id}-item-hint` : undefined
  return (
    <div className="ds-field">
      <input
        className="ds-input"
        id={p.id}
        name={p.c.field}
        type={p.type}
        value={p.value}
        checked={p.checked}
        aria-invalid={p.c.error ? true : undefined}
        aria-describedby={describedBy(errorId(p.c), itemHint)}
        onChange={(e) => p.onChange(e.target.checked)}
      />
      <label className="ds-label" data-weight="regular" htmlFor={p.id}>
        {p.label}
      </label>
      {p.hint && (
        <div data-field="description" id={itemHint}>
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

// A yes-or-no question with one box to tick (updates): the question in a Fieldset, one Checkbox.
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

// From the error summary to the field: focus it, with its label or legend in view.
function focusField(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.hash.slice(1)
  const field = id ? document.getElementById(id) : null
  if (!field) return
  e.preventDefault()
  ;(field.closest(".ds-fieldset, .ds-field") ?? field).scrollIntoView({ block: "start" })
  field.focus({ preventScroll: true })
}

// The questions and answers of the check page, grouped by section.
function groupRows<T extends { key: string }>(pages: { section: string; elements: { scope: string }[] }[], rows: T[]) {
  const sectionOf = (key: string) => pages.find((p) => p.elements.some((e) => fieldOf(e.scope) === key))?.section ?? ""
  const groups: { section: string; rows: T[] }[] = []
  for (const r of rows) {
    const s = sectionOf(r.key)
    const g = groups.find((x) => x.section === s)
    if (g) g.rows.push(r)
    else groups.push({ section: s, rows: [r] })
  }
  return groups
}

// ---- Theme ------------------------------------------------------------------------

export const designsystemetTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // Heading, a lead Paragraph (large), the other paragraphs, the example notice as a warning
  // Alert (its first sentence is the heading), then a primary Button.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [title, more] =
      cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <div className="dsn-form__stack">
        <div className="dsn-form__stack-sm">
          <h1 className="ds-heading" data-size="md" tabIndex={-1} ref={headingRef}>
            {ui.start.title}
          </h1>
          {intro && (
            <p className="ds-paragraph" data-size="lg">
              {intro}
            </p>
          )}
          {rest.map((p) => (
            <p className="ds-paragraph" key={p}>
              {p}
            </p>
          ))}
        </div>
        <div className="ds-alert" data-color="warning">
          <h2 className="ds-heading" data-size="2xs">
            {title}
          </h2>
          {more && <p className="ds-paragraph">{more}</p>}
        </div>
        <div>
          <button type="button" className="ds-button" data-variant="primary" onClick={onStart}>
            {ui.start.button}
            <Icon d={ICONS.ArrowRight} />
          </button>
        </div>
      </div>
    )
  },

  // A small Paragraph: the section, then "Spørsmål 2 av 9" in the subtle colour. On the check
  // page, the last section alone.
  Progress: ({ ui, section, question }) => (
    <p className="ds-paragraph dsn-form__progress" data-size="sm">
      <span className="dsn-form__progress-section">{section}</span>
      {question && (
        <span className="dsn-form__progress-count">
          <span aria-hidden="true"> · </span>
          <span className="ds-sr-only">, </span>
          {ui.progress.question} {question.n} {ui.progress.of} {question.total}
        </span>
      )}
    </p>
  ),

  // A Link with a chevron at its start, at the top of each page.
  Back: ({ label, onBack }) => (
    <div className="dsn-form__back">
      <a href="#" className="ds-link" onClick={linkTo(onBack)}>
        <Icon d={ICONS.ChevronLeft} />
        <span>{label}</span>
      </a>
    </div>
  ),

  // ErrorSummary: a group named by its heading, with each problem as a Link to its field. The
  // engine moves focus to it, as the ds-error-summary element does.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <div
      className="ds-error-summary dsn-form__error-summary"
      role="group"
      aria-labelledby="kf-error-summary-heading"
      tabIndex={-1}
      ref={boxRef}
    >
      <h2 className="ds-heading" id="kf-error-summary-heading">
        {title}
      </h2>
      <ul className="ds-list">
        {errors.map((e) => (
          <li key={e.id}>
            <a className="ds-link" data-color="neutral" href={`#${e.id}`} onClick={focusField}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="ds-heading" data-size="md" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="ds-button" data-variant="primary">
      {label}
    </button>
  ),

  // A Card for each section, under a small heading: one Card block for each question, with the
  // answer and a change Link.
  Check: ({ ui, rows, onChange, headingRef }) => (
    <div className="dsn-form__stack">
      <h1 className="ds-heading" data-size="md" tabIndex={-1} ref={headingRef}>
        {ui.check.title}
      </h1>
      {groupRows(ui.pages, rows).map((g) => (
        <section className="dsn-form__stack-xs" key={g.section}>
          <h2 className="ds-heading" data-size="xs">
            {g.section}
          </h2>
          <dl className="ds-card dsn-form__summary">
            {g.rows.map((r) => {
              const label = splitLabel(r.label).text
              return (
                <div className="ds-card__block dsn-form__summary-row" key={r.key}>
                  <dt className="dsn-form__summary-key">{label}</dt>
                  <dd className="dsn-form__summary-value">{r.value}</dd>
                  <dd className="dsn-form__summary-action">
                    <a className="ds-link" href="#" onClick={linkTo(() => onChange(r.pageIndex))}>
                      {ui.check.change}
                      <span className="ds-sr-only">: {label}</span>
                    </a>
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>
      ))}
      <div className="dsn-form__stack-sm">
        <h2 className="ds-heading" data-size="sm">
          {ui.check.send_heading}
        </h2>
        <p className="ds-paragraph">{ui.check.send_body}</p>
      </div>
      <div>
        <button type="submit" className="ds-button" data-variant="primary">
          {ui.check.button}
        </button>
      </div>
    </div>
  ),

  // A success Alert with the reference (its heading is the page heading), "Dette skjer nå" as an
  // ordered List, the example reply in an info Alert, the record in Details, then a secondary
  // Button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <div className="dsn-form__stack">
        <div className="ds-alert" data-color="success">
          <h1 className="ds-heading" data-size="sm" tabIndex={-1} ref={headingRef}>
            {ui.confirmation.title}
          </h1>
          <p className="ds-paragraph">
            {ui.confirmation.reference}: <strong className="dsn-form__reference">{step.reference}</strong>
          </p>
        </div>
        <div className="dsn-form__stack-sm">
          <h2 className="ds-heading" data-size="sm">
            {ui.confirmation.next_heading}
          </h2>
          <ol className="ds-list">
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
          <p className="ds-paragraph">{DONE.plans}</p>
          <div className="ds-alert" data-color="info">
            <h3 className="ds-heading" data-size="2xs">
              {ui.confirmation.example_label}
            </h3>
            <p className="ds-paragraph">{exampleMessage(ui, r, step.due)}</p>
          </div>
        </div>
        <div className="dsn-form__stack-sm">
          <h2 className="ds-heading" data-size="sm">
            {ui.confirmation.builders_heading}
          </h2>
          <details className="ds-details">
            <summary>{DONE.record}</summary>
            <div className="dsn-form__stack-sm">
              <p className="ds-paragraph">{ui.confirmation.builders_body}</p>
              <pre className="dsn-form__code">
                <code>{JSON.stringify(r, null, 2)}</code>
              </pre>
            </div>
          </details>
        </div>
        <div>
          <button type="button" className="ds-button" data-variant="secondary" onClick={onRestart}>
            {ui.confirmation.restart}
          </button>
        </div>
      </div>
    )
  },
}
