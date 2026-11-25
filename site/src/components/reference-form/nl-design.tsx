// NL Design System markup for the reference form (Netherlands).
// Plain HTML with the classes of the NL Design System candidate components (button-css 2.0.0,
// heading-css 2.0.0, link-css 3.0.0, paragraph-css 3.0.0, form-field-description-css 1.0.0,
// form-field-error-message-css 1.0.0, code-block-css 2.0.0) and, where there is no candidate
// yet, of @utrecht/component-library-css 9.0.16: Form Field, Form Fieldset, Form Label,
// Textbox, Radio Button, Checkbox, Alert, Icon, Unordered and Ordered List, and Pre-heading.
// The look comes from the neutral Start theme (@nl-design-system-unstable/start-design-tokens
// 9.2.0). The styles are ported and scoped to .nlds-form in site/src/styles/nl-design.scss
// (EUPL-1.2). Nothing here sets a style attribute, so the Content-Security-Policy holds.
// The order in a form field follows NL Design System: label, description, error message, then
// the field. Optional questions say "(niet verplicht)" after the label; required ones carry no mark.
// NL Design System has no error summary in Utrecht or the candidates, so the one here is an Alert
// (error) that lists each problem as a link to its field.
// Icons are Tabler Icons 3.35.0 (MIT, © Paweł Kuna), the set NL Design System uses, as inline
// SVG paths.
// No branding reserved for public bodies: no Rijkshuisstijl, no government logo, no RO fonts, no
// city's theme and no coat of arms. Kinderform is not a government service.
// Every visible word comes from schema/ui/enquiry-submission.nl.json, except the fixed sentences
// of the confirmation page and the hidden word before an error message, which are in the tables
// below, and the engine's own Dutch phrases and example reply.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// The hidden word before each error message, which the wording file does not hold.
const WORDS = {
  error: "Fout:",
}

// The fixed sentences of the confirmation page, in Dutch. As in the other themes, they live in
// code rather than in the wording file.
const DONE = {
  ack: { email: "een e-mail", text: "een sms" },
  now: "Nu.",
  nowBody: (ack: string) =>
    `We hebben je ${ack} gestuurd. Daarin staat dat we je vraag hebben gekregen. Je leest er ook in wie contact met je opneemt, en wanneer.`,
  by: (day: string) => `Uiterlijk op ${day}.`,
  how: { email: "je een e-mail sturen", text_message: "je een sms sturen", phone_call: "je bellen" } as Record<string, string>,
  who: (team: string, how: string) => `Een vaste contactpersoon van ${team} gaat ${how}`,
  times: ", op een van de momenten die je hebt gekozen",
  talk: "In het gesprek.",
  // The same words as the engine's Dutch example reply.
  talkBody: "Vraag alles wat je wilt weten. Er zijn geen domme vragen, en geen enkele vraag wordt tegen je gebruikt.",
  notSure: " We vertellen je over pleegzorg, adoptie en andere manieren om te helpen.",
  plans: "Veranderen je plannen? Dat is goed. Je kunt het ons altijd laten weten.",
  record: "Gegevens bekijken",
}

// ---- Icons (Tabler Icons 3.35.0, outline, MIT) -------------------------------------------------

const ICONS = {
  "alert-circle": ["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "M12 8v4", "M12 16h.01"],
  "alert-triangle": [
    "M12 9v4",
    "M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z",
    "M12 16h.01",
  ],
  "info-circle": ["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "M12 9h.01", "M11 12h1v4h1"],
  "circle-check": ["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M9 12l2 2l4 -4"],
  "chevron-left": ["M15 6l-6 6l6 6"],
  "chevron-right": ["M9 6l6 6l-6 6"],
} as const

// A Utrecht Icon holding an SVG, hidden from screen readers.
function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <span className={`utrecht-icon${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {ICONS[name].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  )
}

// ---- Small parts ------------------------------------------------------------------

// NL Design System marks a question that is not required with "(niet verplicht)" after the
// label, in the regular weight. The wording file ends those labels with it; split it off. The
// suffix's own margin makes the gap, so no space goes between them.
const OPTIONAL = /\s*\(niet verplicht\)\s*$/i
function splitLabel(label: string) {
  const m = label.match(OPTIONAL)
  return m ? { text: label.slice(0, m.index), optional: m[0].trim() } : { text: label, optional: undefined }
}

function LabelText({ label }: { label: string }) {
  const l = splitLabel(label)
  return (
    <>
      {l.text}
      {l.optional && <span className="nlds-form__label-suffix">{l.optional}</span>}
    </>
  )
}

function Description({ c }: { c: C }) {
  return c.hint ? (
    <div className="nl-form-field-description utrecht-form-field__description" id={`${c.id}-hint`}>
      {c.hint}
    </div>
  ) : null
}

// The candidate Form Field Error Message: an icon, then the message, with a hidden "Fout:".
// It sits above the field, after the description; aria-describedby names the description first,
// then the message (shared.tsx builds it in that order).
function ErrorMessage({ c }: { c: C }) {
  return c.error ? (
    <div className="nl-form-field-error-message utrecht-form-field__error-message" id={`${c.id}-error`}>
      <span className="nl-form-field-error-message__icon">
        <Icon name="alert-circle" />
      </span>
      <span className="nl-form-field-error-message__content">
        <span className="nlds-form__sr-only">{WORDS.error} </span>
        {c.error}
      </span>
    </div>
  ) : null
}

// Text box widths by the characters expected. The phone number uses Utrecht's own size.
const sizeClass = (c: C) => {
  if (c.field === "phone") return " utrecht-textbox--tel-size"
  const n = c.o.inputWidth
  if (!n) return ""
  return ` nlds-form__textbox--${n <= 4 ? 4 : n <= 5 ? 5 : n <= 10 ? 10 : 20}`
}

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Renderers --------------------------------------------------------------------

// Form Field with a Textbox. When the question is the page heading, the label sits inside a
// Heading (level 1).
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { optional } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className="utrecht-form-label" htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className={`utrecht-form-field utrecht-form-field--text${c.error ? " utrecht-form-field--invalid" : ""}`}>
      {c.asHeading ? (
        <h1 className="nl-heading nl-heading--level-1 nlds-form__heading" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        <div className="utrecht-form-field__label">{label}</div>
      )}
      <Description c={c} />
      <ErrorMessage c={c} />
      <div className="utrecht-form-field__input">
        <input
          className={`utrecht-textbox utrecht-textbox--html-input${sizeClass(c)}`}
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
  )
})

// Form Fieldset: the question is the legend (with a Heading inside when it is the page heading),
// then the description, the error message and the options.
function Fieldset({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <div className={`utrecht-form-fieldset${c.error ? " utrecht-form-fieldset--invalid" : ""}`}>
      <fieldset className="utrecht-form-fieldset__fieldset utrecht-form-fieldset--html-fieldset" aria-describedby={c.describedBy}>
        <legend className="utrecht-form-fieldset__legend utrecht-form-fieldset__legend--html-legend">
          {c.asHeading ? (
            <h1 className="nl-heading nl-heading--level-1 nlds-form__heading" tabIndex={-1} ref={c.headingRef}>
              <LabelText label={c.label} />
            </h1>
          ) : (
            <LabelText label={c.label} />
          )}
        </legend>
        <Description c={c} />
        <ErrorMessage c={c} />
        <div className="nlds-form__options">{children}</div>
      </fieldset>
    </div>
  )
}

// One Radio Button or Checkbox in a Form Field: the input on the left, its label, then its
// description, linked with aria-describedby.
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
  const inputClass = radio
    ? "utrecht-radio-button utrecht-radio-button--html-input"
    : "utrecht-checkbox utrecht-checkbox--html-input utrecht-checkbox--custom"
  const hintId = p.hint ? `${p.id}-item-hint` : undefined
  return (
    <div className={`utrecht-form-field utrecht-form-field--${radio ? "radio" : "checkbox"}`}>
      <div className="utrecht-form-field__label">
        <label className={`utrecht-form-label utrecht-form-label--${radio ? "radio" : "checkbox"}`} htmlFor={p.id}>
          {p.label}
        </label>
      </div>
      {p.hint && (
        <div className="nl-form-field-description utrecht-form-field__description" id={hintId}>
          {p.hint}
        </div>
      )}
      <div className="utrecht-form-field__input">
        <input
          className={inputClass}
          id={p.id}
          name={p.c.field}
          type={p.type}
          value={p.value}
          checked={p.checked}
          aria-invalid={p.c.error ? true : undefined}
          aria-describedby={hintId}
          onChange={(e) => p.onChange(e.target.checked)}
        />
      </div>
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

// Utrecht Alert: the icon, then the content with its message.
function Alert(p: {
  tone: "error" | "ok" | "warning" | "info"
  icon: keyof typeof ICONS
  role?: string
  tabIndex?: number
  boxRef?: React.Ref<HTMLDivElement>
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`utrecht-alert utrecht-alert--${p.tone}${p.className ? ` ${p.className}` : ""}`}
      role={p.role}
      tabIndex={p.tabIndex}
      ref={p.boxRef}
    >
      <div className="utrecht-alert__icon">
        <Icon name={p.icon} />
      </div>
      <div className="utrecht-alert__content">
        <div className="utrecht-alert__message">{p.children}</div>
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
  ;(field.closest(".utrecht-form-fieldset, .utrecht-form-field--text") ?? field).scrollIntoView({ block: "start" })
  field.focus({ preventScroll: true })
}

// ---- Theme ------------------------------------------------------------------------

export const nlDesignTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // Heading, a lead Paragraph, the other paragraphs, the example notice as a warning Alert (its
  // first sentence in bold), then a primary Button.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [title, more] =
      cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <div className="nlds-form__stack">
        <div className="nlds-form__stack-sm">
          <h1 className="nl-heading nl-heading--level-1" tabIndex={-1} ref={headingRef}>
            {ui.start.title}
          </h1>
          {intro && <p className="nl-paragraph nl-paragraph--lead">{intro}</p>}
          {rest.map((p) => (
            <p className="nl-paragraph" key={p}>
              {p}
            </p>
          ))}
        </div>
        <Alert tone="warning" icon="alert-triangle">
          <p className="nl-paragraph">
            <strong>{title}</strong>
            {more && ` ${more}`}
          </p>
        </Alert>
        <div>
          <button type="button" className="nl-button nl-button--primary" onClick={onStart}>
            <span className="nl-button__label">{ui.start.button}</span>
            <span className="nl-button__icon-end">
              <Icon name="chevron-right" />
            </span>
          </button>
        </div>
      </div>
    )
  },

  // A Pre-heading with the section, then "Vraag 2 van 9" in the subtle colour. On the check
  // page, the last section alone.
  Progress: ({ ui, section, question }) => (
    <p className="utrecht-pre-heading nlds-form__progress">
      {section}
      {question && (
        <span className="nlds-form__progress-count">
          <span aria-hidden="true"> · </span>
          <span className="nlds-form__sr-only">, </span>
          {ui.progress.question} {question.n} {ui.progress.of} {question.total}
        </span>
      )}
    </p>
  ),

  // A Link with a chevron, at the top of each page.
  Back: ({ label, onBack }) => (
    <div>
      <a href="#" className="nl-link nlds-form__back" onClick={linkTo(onBack)}>
        <Icon name="chevron-left" className="nlds-form__link-icon" />
        {label}
      </a>
    </div>
  ),

  // An Alert (error) that lists each problem as a Link to its field.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <Alert tone="error" icon="alert-circle" className="nlds-form__error-summary" role="alert" tabIndex={-1} boxRef={boxRef}>
      <h2 className="nl-heading nl-heading--level-3">{title}</h2>
      <ul className="utrecht-unordered-list">
        {errors.map((e) => (
          <li className="utrecht-unordered-list__item" key={e.id}>
            <a className="nl-link" href={`#${e.id}`} onClick={focusField}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="nl-heading nl-heading--level-1" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="nl-button nl-button--primary">
      <span className="nl-button__label">{label}</span>
    </button>
  ),

  // One block for each section: a heading, then the questions and answers in Start's form
  // summary look, each with its own change Link.
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
      <div className="nlds-form__stack">
        <h1 className="nl-heading nl-heading--level-1" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <section className="nlds-form__stack-xs" key={g.section}>
            <h2 className="nl-heading nl-heading--level-3">{g.section}</h2>
            <dl className="nlds-form__summary">
              {g.rows.map((r) => {
                const label = splitLabel(r.label).text
                return (
                  <div className="nlds-form__summary-item" key={r.key}>
                    <dt className="nlds-form__summary-key">{label}</dt>
                    <dd className="nlds-form__summary-value">{r.value}</dd>
                    <dd className="nlds-form__summary-action">
                      <a className="nl-link" href="#" onClick={linkTo(() => onChange(r.pageIndex))}>
                        {ui.check.change}
                        <span className="nlds-form__sr-only">: {label}</span>
                      </a>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        ))}
        <div className="nlds-form__stack-sm">
          <h2 className="nl-heading nl-heading--level-2">{ui.check.send_heading}</h2>
          <p className="nl-paragraph">{ui.check.send_body}</p>
        </div>
        <div>
          <button type="submit" className="nl-button nl-button--primary">
            <span className="nl-button__label">{ui.check.button}</span>
          </button>
        </div>
      </div>
    )
  },

  // An ok Alert with the reference (its heading is the page heading), "Zo gaat het verder" as an
  // Ordered List, the example reply in an info Alert, the record in a Code Block inside a
  // disclosure, then a secondary Button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <div className="nlds-form__stack">
        <Alert tone="ok" icon="circle-check">
          <h1 className="nl-heading nl-heading--level-2" tabIndex={-1} ref={headingRef}>
            {ui.confirmation.title}
          </h1>
          <p className="nl-paragraph">
            {ui.confirmation.reference}: <strong className="nlds-form__reference">{step.reference}</strong>
          </p>
        </Alert>
        <div className="nlds-form__stack-sm">
          <h2 className="nl-heading nl-heading--level-2">{ui.confirmation.next_heading}</h2>
          <ol className="utrecht-ordered-list">
            <li className="utrecht-ordered-list__item">
              <strong>{DONE.now}</strong> {DONE.nowBody(ack)}
            </li>
            <li className="utrecht-ordered-list__item">
              <strong>{DONE.by(day)}</strong> {DONE.who(team, how)}
              {r.best_times ? DONE.times : ""}.
            </li>
            <li className="utrecht-ordered-list__item">
              <strong>{DONE.talk}</strong> {DONE.talkBody}
              {r.interest === "not_sure" && !r.knows_child ? DONE.notSure : ""}
            </li>
          </ol>
          <p className="nl-paragraph">{DONE.plans}</p>
          <Alert tone="info" icon="info-circle">
            <h3 className="nl-heading nl-heading--level-3">{ui.confirmation.example_label}</h3>
            <p className="nl-paragraph">{exampleMessage(ui, r, step.due)}</p>
          </Alert>
        </div>
        <div className="nlds-form__stack-sm">
          <h2 className="nl-heading nl-heading--level-2">{ui.confirmation.builders_heading}</h2>
          <details className="nlds-form__details">
            <summary>
              <Icon name="chevron-right" />
              {DONE.record}
            </summary>
            <div className="nlds-form__details-body nlds-form__stack-sm">
              <p className="nl-paragraph">{ui.confirmation.builders_body}</p>
              <pre className="nl-code-block">
                <code className="nl-code-block__code">{JSON.stringify(r, null, 2)}</code>
              </pre>
            </div>
          </details>
        </div>
        <div>
          <button type="button" className="nl-button nl-button--secondary" onClick={onRestart}>
            <span className="nl-button__label">{ui.confirmation.restart}</span>
          </button>
        </div>
      </div>
    )
  },
}
