// DESY markup for the reference form (Spain). DESY is the open design system of the Gobierno de
// Aragón: desy-html 17.0.2, licensed EUPL-1.2. Spain's central-government system is not open.
// Plain HTML that follows the markup of DESY's Nunjucks templates for label, hint, error-message,
// input, fieldset, radios, checkboxes, error-summary, button, notification, details and
// description-list. The templates write Tailwind utility classes; here each part carries a plain
// class name instead, and the styles they stand for are ported to site/src/styles/desy.scss,
// scoped under .desy-form. Nothing here sets a style attribute, so the Content-Security-Policy
// (style-src 'self') holds.
// No branding: no Gobierno de Aragón logo, no EU funding logos, no coat of arms, no header or
// footer. Kinderform is not a government service.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// Words the DESY templates supply themselves: the hidden "Error" before each error message and
// the names of the notification icons (aria-label="Éxito", "Error", "Información").
const WORDS = {
  error: "Error:",
  icon: { success: "Éxito", warning: "Aviso", primary: "Información" },
}

// The fixed sentences on the confirmation page. As in the other themes, they live in code rather
// than in the wording file. The team names in the wording file start with "nuestro", so they
// follow "de" without needing "del".
const DONE = {
  ack: { email: "un correo electrónico", text: "un SMS" },
  now: "Ahora.",
  nowBody: (ack: string) =>
    `Le hemos enviado ${ack} para confirmar que hemos recibido su consulta. En él le decimos quién se pondrá en contacto con usted y cuándo.`,
  by: (day: string) => `Antes del final del ${day}.`,
  how: { email: "le escribirá un correo electrónico", text_message: "le enviará un SMS", phone_call: "le llamará" } as Record<string, string>,
  who: (team: string, how: string) => `Una persona de ${team} ${how}`,
  times: ", en uno de los momentos que ha elegido",
  talk: "Cuando hablemos.",
  talkBody: "Puede hacer preguntas sin comprometerse a presentar una solicitud.",
  notSure: " Le explicaremos el acogimiento familiar, la adopción y otras formas de ayudar.",
  plans: "Si sus planes cambian, no pasa nada. Puede decírnoslo en cualquier momento.",
  record: "Mostrar los datos",
}

// ---- Icons (paths from the DESY notification and breadcrumbs templates) --------------------

function Icon({ d, label }: { d: string; label?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 140"
      width="1em"
      height="1em"
      focusable="false"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={d} fill="currentColor" />
    </svg>
  )
}
const ICONS = {
  success:
    "M39.94 125a19.88 19.88 0 01-15.53-7.81L2.48 92.26a10 10 0 0115-13.2l20.55 23.39a2.5 2.5 0 003.68.08l81-84.42a10.002 10.002 0 1114.5 13.78l-82.02 86.33A19.41 19.41 0 0139.94 125z",
  warning:
    "M138.42 118.29l-55-110a15 15 0 00-26.84 0l-55 110A15 15 0 0015 140h110a15 15 0 0013.42-21.71zM62.5 50a7.5 7.5 0 0115 0v30a7.5 7.5 0 01-15 0zm7.5 70a10 10 0 1110-10 10 10 0 01-10 10z",
  primary:
    "M70 0a70 70 0 1070 70A70.08 70.08 0 0070 0zm7.5 105a7.5 7.5 0 01-15 0V70a7.5 7.5 0 0115 0zM70 50a10 10 0 1110-10 10 10 0 01-10 10z",
  back: "M37.93 27.93l-35 35a10 10 0 000 14.14l35 35a10 10 0 1014.14-14.14L38.41 84.27A2.5 2.5 0 0140.18 80H130a10 10 0 000-20H40.18a2.5 2.5 0 01-1.77-4.27l13.66-13.66a10 10 0 00-14.14-14.14z",
}

// ---- Field parts: label, hint, error message --------------------------------------------

// DESY marks required fields with an asterisk; this form, like the other countries' forms, marks
// the optional ones instead. The wording file ends optional labels with "(opcional)": show it in
// the hint colour and normal weight, so the question reads first. Every other field is required.
const OPTIONAL = /\s*\(opcional\)\s*$/i
const splitLabel = (label: string) => {
  const m = label.match(OPTIONAL)
  return m ? { text: label.slice(0, m.index), optional: m[0].trim(), required: false } : { text: label, optional: "", required: true }
}

function LabelText({ label }: { label: string }) {
  const l = splitLabel(label)
  return (
    <>
      {l.text}
      {l.optional && <span className="c-label__optional"> {l.optional}</span>}
    </>
  )
}

function Hint({ id, text, className = "" }: { id: string; text?: string; className?: string }) {
  return text ? (
    <p id={id} className={`c-hint${className}`}>
      {text}
    </p>
  ) : null
}

// error-message: the message in bold red, with "Error:" for screen readers, as DESY writes it.
// DESY links the message to the field with aria-errormessage only, which screen readers support
// unevenly. Here, as in GOV.UK Frontend, the message is in aria-describedby after the hint, and
// aria-errormessage is left out so the message is not read twice.
function ErrorMessage({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p id={`${id}-error`} className="c-error-message">
      <span className="c-visually-hidden">{WORDS.error} </span>
      {text}
    </p>
  ) : null
}

// Widths from DESY's input examples: w-full; w-full with max-w-xs (20rem); w-32 for short codes.
const width = (n?: number) => (!n ? "full" : n <= 5 ? "short" : "xs")

// ---- Renderers ------------------------------------------------------------------------

// input: c-form-group, then label, hint, error message and the field. When the question is the
// page heading, the label (with c-h1) sits inside the h1, as DESY's isPageHeading does.
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className={`c-label${c.asHeading ? " c-h1" : ""}`} htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className={`c-form-group${c.error ? " c-form-group--error" : ""}`}>
      {c.asHeading ? (
        <h1 tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      <Hint id={`${c.id}-hint`} text={c.hint} />
      <ErrorMessage id={c.id} text={c.error} />
      <input
        className={`c-input c-input--${width(c.o.inputWidth)}${c.error ? " c-input--error" : ""}`}
        id={c.id}
        name={c.field}
        type={type}
        value={c.current}
        autoComplete={c.o.autocomplete}
        inputMode={c.o.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
        spellCheck={c.o.spellcheck}
        aria-required={splitLabel(c.label).required || undefined}
        aria-invalid={c.error ? true : undefined}
        aria-describedby={c.describedBy}
        onChange={(e) => c.setFromString(e.target.value)}
        onBlur={c.onBlur}
      />
    </div>
  )
})

// fieldset: the question is the legend (an h1 inside it when it is the page heading, with the
// legend taking c-h1), then the hint and the error message, as in DESY's radios and checkboxes.
function Group({ c, block, children }: { c: C; block: "c-radios" | "c-checkboxes"; children: React.ReactNode }) {
  return (
    <div className={`c-form-group${c.error ? " c-form-group--error" : ""}`}>
      <fieldset aria-describedby={c.describedBy}>
        {c.asHeading ? (
          <legend className="c-legend c-h1">
            <h1 tabIndex={-1} ref={c.headingRef}>
              <LabelText label={c.label} />
            </h1>
          </legend>
        ) : (
          <legend className="c-legend">
            <LabelText label={c.label} />
          </legend>
        )}
        <Hint id={`${c.id}-hint`} text={c.hint} />
        <ErrorMessage id={c.id} text={c.error} />
        <div className={block}>{children}</div>
      </fieldset>
    </div>
  )
}

// One option of DESY's radios or checkboxes: the input, then its label and any hint, which is
// linked to the input with aria-describedby (the template's "-item-hint").
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
  const block = p.type === "radio" ? "c-radios" : "c-checkboxes"
  const hintId = p.hint ? `${p.id}-item-hint` : undefined
  return (
    <div className={`${block}__item`}>
      <div className={`${block}__control`}>
        <input
          className={`${block}__input`}
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
      <div className={`${block}__text`}>
        <label className={`c-label ${block}__label`} htmlFor={p.id}>
          {p.label}
        </label>
        {hintId && <Hint id={hintId} text={p.hint} className={` ${block}__hint`} />}
      </div>
    </div>
  )
}

// As in DESY, the first option's id has no number, so the error summary can link to it.
const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Group c={c} block="c-radios">
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
    </Group>
  )
})

const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Group c={c} block="c-checkboxes">
      {c.options.map((opt, i) => (
        <Option
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
    </Group>
  )
})

// A yes-or-no question with one box to tick (updates): DESY's checkboxes with one item.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Group c={c} block="c-checkboxes">
      <Option
        c={c}
        type="checkbox"
        id={c.id}
        label={c.o.checkboxLabel}
        checked={props.data === true}
        onChange={(on) => c.set(on ? true : undefined)}
      />
    </Group>
  )
})

// ---- Page parts ------------------------------------------------------------------------

// notification: a coloured border, the icon, then the title and its text. DESY gives the title
// tabindex="-1" so a page can move focus to it, and underlines it while it has focus.
function Notification(p: {
  type: "success" | "warning" | "primary"
  title: string
  level?: 1 | 2 | 3
  titleClass?: string
  titleRef?: React.Ref<HTMLHeadingElement>
  children?: React.ReactNode
}) {
  const cls = `c-notification__title${p.titleClass ? ` ${p.titleClass}` : ""}`
  const Tag = p.level ? (`h${p.level}` as const) : null
  return (
    <div className={`c-notification c-notification--${p.type}`}>
      <div className="c-notification__icon">
        <Icon d={ICONS[p.type]} label={WORDS.icon[p.type]} />
      </div>
      <div className="c-notification__body">
        {Tag ? (
          <Tag className={cls} tabIndex={-1} ref={p.titleRef}>
            {p.title}
          </Tag>
        ) : (
          <p className={cls} tabIndex={-1}>
            {p.title}
          </p>
        )}
        {p.children}
      </div>
    </div>
  )
}

// As GOV.UK Frontend's error summary does (DESY has no script for it): move to the field, with
// its label or legend in view, without changing the page address.
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

// ---- Theme ----------------------------------------------------------------------------

export const desyTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // The title, a lead paragraph (c-paragraph-lg), the body text, a notification saying this is an
  // example, then a large primary button. The notice's first sentence is the notification title.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [title, more] = cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <>
        <h1 className="c-h1" tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        {intro && <p className="c-paragraph-lg">{intro}</p>}
        {rest.map((p) => (
          <p className="c-paragraph-base" key={p}>
            {p}
          </p>
        ))}
        <Notification type="warning" title={title}>
          {more && <p>{more}</p>}
        </Notification>
        <button type="button" className="c-button c-button--primary c-button--lg" onClick={onStart}>
          {ui.start.button}
        </button>
      </>
    )
  },

  // Where you are, above each question: the section and the question number, in the hint colour.
  Progress: ({ ui, section, question }) => (
    <p className="c-caption">
      {section}
      {question && (
        <>
          <span aria-hidden="true"> · </span>
          <span className="c-visually-hidden">, </span>
          <span className="c-caption__count">
            {ui.progress.question} {question.n} {ui.progress.of} {question.total}
          </span>
        </>
      )}
    </p>
  ),

  // The back arrow from DESY's breadcrumbs, with the word beside it, as a c-link.
  Back: ({ label, onBack }) => (
    <button type="button" className="c-back c-link" onClick={onBack}>
      <Icon d={ICONS.back} />
      {label}
    </button>
  ),

  // error-summary: a red box with role="alert" and tabindex="-1", the title, and one link for
  // each problem.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <div className="c-error-summary" aria-labelledby="kf-error-summary-title" role="alert" tabIndex={-1} ref={boxRef}>
      <h2 className="c-error-summary__title" id="kf-error-summary-title">
        {title}
      </h2>
      <div>
        <ul className="c-error-summary__list">
          {errors.map((e) => (
            <li key={e.id}>
              <a className="c-link c-link--alert c-error-summary__link" href={`#${e.id}`} onClick={linkTo(() => focusField(e.id))}>
                {e.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="c-h1" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="c-button c-button--primary">
      {label}
    </button>
  ),

  // The answers by section, each section a description list in DESY's "con apariencia de tabla"
  // style, with a third cell for "Cambiar".
  Check: ({ ui, rows, onChange, headingRef }) => {
    const sectionOf = (key: string) => ui.pages.find((p) => p.elements.some((e) => fieldOf(e.scope) === key))?.section ?? ""
    const groups: { section: string; rows: typeof rows }[] = []
    for (const r of rows) {
      const s = sectionOf(r.key)
      const g = groups.find((x) => x.section === s)
      if (g) g.rows.push(r)
      else groups.push({ section: s, rows: [r] })
    }
    // The engine takes "(optional)" off the labels; take off "(opcional)" here.
    const question = (label: string) => label.replace(OPTIONAL, "")
    return (
      <>
        <h1 className="c-h1" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <div key={g.section}>
            <h2 className="c-h3">{g.section}</h2>
            <dl className="c-description-list">
              {g.rows.map((r) => (
                <div className="c-description-list__row" key={r.key}>
                  <dt className="c-description-list__term">{question(r.label)}</dt>
                  <dd className="c-description-list__definition">{r.value}</dd>
                  <dd className="c-description-list__action">
                    <a className="c-link" href="#" onClick={linkTo(() => onChange(r.pageIndex))}>
                      {ui.check.change}
                      <span className="c-visually-hidden"> {question(r.label).toLowerCase()}</span>
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        <h2 className="c-h2">{ui.check.send_heading}</h2>
        <p className="c-paragraph-base">{ui.check.send_body}</p>
        <button type="submit" className="c-button c-button--primary">
          {ui.check.button}
        </button>
      </>
    )
  },

  // A success notification whose title is the page heading, what happens next, the example reply
  // in an information notification, the record in DESY's details, and a button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <>
        <Notification type="success" level={1} titleClass="c-h2" title={ui.confirmation.title} titleRef={headingRef}>
          <p>
            {ui.confirmation.reference}: <strong className="c-reference">{step.reference}</strong>
          </p>
        </Notification>
        <h2 className="c-h2">{ui.confirmation.next_heading}</h2>
        <ol className="c-ol">
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
        <p className="c-paragraph-base">{DONE.plans}</p>
        <Notification type="primary" level={3} title={ui.confirmation.example_label}>
          <p>{exampleMessage(ui, r, step.due)}</p>
        </Notification>
        <h2 className="c-h2">{ui.confirmation.builders_heading}</h2>
        <details className="c-details">
          <summary className="c-details__summary">
            <span className="c-link">{DONE.record}</span>
          </summary>
          <div className="c-details__body">
            <p className="c-paragraph-base">{ui.confirmation.builders_body}</p>
            <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
          </div>
        </details>
        <button type="button" className="c-button" onClick={onRestart}>
          {ui.confirmation.restart}
        </button>
      </>
    )
  },
}
