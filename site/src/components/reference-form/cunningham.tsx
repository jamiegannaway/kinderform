// Cunningham markup for the reference form (France).
// Plain HTML that follows the markup and classes of @gouvfr-lasuite/cunningham-react 4.4.0 (MIT,
// France Université Numérique, now maintained by La Suite numérique at DINUM): Field, Input
// (classic variant, label above the box), Radio, RadioGroup, Checkbox, CheckboxGroup, Button and
// Alert. The React components are not used: they bring many dependencies and a stylesheet with
// global rules, their Field does not link help text to its input, and their icons need the
// Material Icons font. The styles are ported to site/src/styles/cunningham.scss.
// Cunningham has no error summary, summary list, details or headings: those are built in its
// style from its tokens.
// Not the French State design system (DSFR), and no government branding: Kinderform is not a
// government service.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// French typography: a no-break space before a colon.
const COLON = " :"

// The few words that are not in the wording file: read only by screen readers, or the fixed
// sentences of the confirmation page (as in the other themes, these live in code).
const WORDS = {
  errorPrefix: "Erreur : ",
  record: "Afficher les données",
}
const DONE = {
  ack: { email: "un e-mail", text: "un SMS" },
  now: "Maintenant.",
  nowBody: (ack: string) =>
    `Nous vous avons envoyé ${ack} pour confirmer que nous avons bien reçu votre demande. Il indique qui va vous contacter et quand.`,
  by: (day: string) => `D'ici la fin de la journée du ${day}.`,
  how: { email: "vous écrire par e-mail", text_message: "vous envoyer un SMS", phone_call: "vous appeler" } as Record<
    string,
    string
  >,
  who: (team: string, how: string) => `Une personne de ${team} va ${how}`,
  times: ", à l'un des moments que vous avez choisis",
  talk: "Pendant l'échange.",
  talkBody: "Vous pouvez poser des questions sans vous engager à déposer une candidature.",
  notSure: " Nous vous parlerons de l'accueil familial, de l'adoption et d'autres façons d'aider.",
  plans: "Si vos projets changent, ce n'est pas grave. Vous pouvez nous le dire à tout moment.",
}

// ---- Icons ---------------------------------------------------------------------
// Cunningham draws icons with the Material Icons font. These are the same glyphs as inline SVG,
// from Material Symbols (Outlined, weight 400; @material-symbols/svg-400 0.49.0, Apache-2.0,
// Google). The tick in a checkbox is Cunningham's own (Checkbox/index.tsx, MIT).

const ICONS = {
  info: "M453-280h60v-240h-60v240Zm50.5-323.2q9.5-9.2 9.5-22.8 0-14.45-9.48-24.22-9.48-9.78-23.5-9.78t-23.52 9.78Q447-640.45 447-626q0 13.6 9.48 22.8 9.48 9.2 23.5 9.2t23.52-9.2ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z",
  // check_circle
  success:
    "m421-298 283-283-46-45-237 237-120-120-45 45 165 166Zm59 218q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z",
  // error (error_outline in Material Icons)
  warning:
    "M503.5-289.48q9.5-9.48 9.5-23.5t-9.48-23.52q-9.48-9.5-23.5-9.5t-23.52 9.48q-9.5 9.48-9.5 23.5t9.48 23.52q9.48 9.5 23.5 9.5t23.52-9.48ZM453-433h60v-253h-60v253Zm27.27 353q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z",
  // cancel
  error:
    "m330-288 150-150 150 150 42-42-150-150 150-150-42-42-150 150-150-150-42 42 150 150-150 150 42 42ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z",
  arrowBack: "m274-450 248 248-42 42-320-320 320-320 42 42-248 248h526v60H274Z",
  // keyboard_arrow_down
  chevronDown: "M480-344 240-584l43-43 197 197 197-197 43 43-240 240Z",
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="cf-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  )
}

const Checkmark = () => (
  <svg
    className="checkmark"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M17.5685 6.34318L9.8751 14.0366L7.07184 11.2333C6.84127 11.0106 6.53245 10.8874 6.21191 10.8902C5.89137 10.893 5.58474 11.0215 5.35807 11.2482C5.1314 11.4749 5.00283 11.7815 5.00005 12.102C4.99726 12.4226 5.12048 12.7314 5.34318 12.962L9.01077 16.6296C9.24003 16.8587 9.55093 16.9875 9.8751 16.9875C10.1993 16.9875 10.5102 16.8587 10.7394 16.6296L19.2972 8.07184C19.5198 7.84127 19.6431 7.53245 19.6403 7.21191C19.6375 6.89136 19.5089 6.58474 19.2823 6.35807C19.0556 6.1314 18.749 6.00283 18.4284 6.00005C18.1079 5.99726 17.7991 6.12048 17.5685 6.34318Z"
      fill="currentColor"
    />
  </svg>
)

// ---- Field parts (Field footer, classic label) --------------------------------------

// The wording file ends optional labels with "(facultatif)". Show it in the muted colour, after the
// label. Every other field is required.
function splitLabel(label: string) {
  const m = label.match(/^(.*?)\s*(\(facultatif\))\s*$/i)
  return m ? { text: m[1], optional: m[2], required: false } : { text: label, optional: undefined, required: true }
}

function LabelText({ label }: { label: string }) {
  const l = splitLabel(label)
  return (
    <>
      {l.text}
      {l.optional && <span className="cf-optional"> {l.optional}</span>}
    </>
  )
}

// As in agds.tsx, the error message comes before the help text in aria-describedby.
const describedBy = (c: C) => [c.error && `${c.id}-error`, c.hint && `${c.id}-hint`].filter(Boolean).join(" ") || undefined

// Field's footer: the text under the field. Cunningham shows its help text and its error here.
// The error comes first, with a hidden "Erreur :" so screen readers say what it is.
function Footer({ c }: { c: C }) {
  if (!c.error && !c.hint) return null
  return (
    <div className="c__field__footer">
      {c.error && (
        <p id={`${c.id}-error`} className="c__field__text cf-error">
          <Icon d={ICONS.error} />
          <span>
            <span className="c__offscreen">{WORDS.errorPrefix}</span>
            {c.error}
          </span>
        </p>
      )}
      {c.hint && (
        <p id={`${c.id}-hint`} className="c__field__text cf-hint">
          {c.hint}
        </p>
      )}
    </div>
  )
}

const state = (c: C) => (c.error ? "error" : "default")

// The input box takes the width of the answer it expects.
const width = (n?: number) => (!n ? "full" : n <= 5 ? "xs" : n <= 10 ? "sm" : n <= 20 ? "md" : "full")

// ---- Renderers ---------------------------------------------------------------

// Input, classic variant, in a Field: label, the box, then the footer. When the question is the
// page heading, the label sits inside the H1.
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { required } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className="c__input__label" htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className={`c__field c__field--${state(c)} c__field--full-width`}>
      {c.asHeading ? (
        <h1 className="cf-h1 cf-label-heading" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      {/* As in Cunningham, a click anywhere in the box puts the cursor in the field. */}
      <div
        className={`c__input__wrapper c__input__wrapper--classic cf-input--${width(c.o.inputWidth)}${c.error ? " c__input__wrapper--error" : ""}`}
        onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
      >
        <input
          className="c__input"
          id={c.id}
          name={c.field}
          type={type}
          value={c.current}
          autoComplete={c.o.autocomplete}
          inputMode={c.o.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
          spellCheck={c.o.spellcheck}
          aria-required={required}
          aria-invalid={!!c.error}
          aria-describedby={describedBy(c)}
          onChange={(e) => c.setFromString(e.target.value)}
          onBlur={c.onBlur}
        />
      </div>
      <Footer c={c} />
    </div>
  )
})

// RadioGroup and CheckboxGroup in a fieldset. Cunningham's groups have no legend of their own, so
// the question is the legend (an H1 when it is the page heading).
function Group({ c, kind, children }: { c: C; kind: "radio" | "checkbox"; children: React.ReactNode }) {
  return (
    <fieldset className="cf-fieldset" aria-describedby={describedBy(c)}>
      {c.asHeading ? (
        <legend className="cf-legend cf-legend--heading">
          <h1 className="cf-h1" tabIndex={-1} ref={c.headingRef}>
            <LabelText label={c.label} />
          </h1>
        </legend>
      ) : (
        <legend className="cf-legend c__input__label">
          <LabelText label={c.label} />
        </legend>
      )}
      <div
        className={`c__field c__field--${state(c)} c__field--compact${kind === "radio" ? " c__radio__group" : ""} c__checkbox__group`}
      >
        <div className="c__checkbox__group__list">{children}</div>
        <Footer c={c} />
      </div>
    </fieldset>
  )
}

// Radio and Checkbox: the label wraps the input and its text, as in Cunningham. A hint for one
// option sits under it, outside the label, so it is not read as part of the option's name.
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
  const invalid = !!p.c.error
  const { required } = splitLabel(p.c.label)
  const hintId = p.hint ? `${p.id}-item-hint` : undefined
  const describedBy = [invalid && `${p.c.id}-error`, hintId].filter(Boolean).join(" ") || undefined
  const input = (
    <input
      type={p.type}
      id={p.id}
      name={p.c.field}
      value={p.value}
      checked={p.checked}
      aria-invalid={invalid || undefined}
      aria-required={p.type === "radio" ? required : undefined}
      aria-describedby={describedBy}
      onChange={(e) => p.onChange(e.target.checked)}
    />
  )
  return (
    <div>
      <label className={`c__checkbox${p.type === "radio" ? " c__radio" : ""}`} htmlFor={p.id}>
        <div className="c__field c__field--default c__field--compact">
          <div className="c__checkbox__container">
            {p.type === "radio" ? (
              input
            ) : (
              <div className="c__checkbox__wrapper">
                {input}
                <Checkmark />
              </div>
            )}
            <div className="c__checkbox__label">{p.label}</div>
          </div>
        </div>
      </label>
      {p.hint && (
        <div className="c__field__footer">
          <p id={hintId} className="c__field__text cf-hint">
            {p.hint}
          </p>
        </div>
      )}
    </div>
  )
}

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Group c={c} kind="radio">
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
    <Group c={c} kind="checkbox">
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
    </Group>
  )
})

// A yes-or-no question with one box to tick: a CheckboxGroup with one Checkbox.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Group c={c} kind="checkbox">
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

// ---- Page parts --------------------------------------------------------------

type AlertType = "info" | "success" | "warning" | "error" | "neutral"

// Alert with additional content: the title line with its icon, then the additional text, which
// lines up after the icon. A neutral Alert has no icon.
function Alert(p: {
  type: AlertType
  title: React.ReactNode
  className?: string
  role?: string
  tabIndex?: number
  boxRef?: React.Ref<HTMLDivElement>
  children?: React.ReactNode
}) {
  return (
    <div
      className={`c__alert c__alert--${p.type}${p.className ? ` ${p.className}` : ""}`}
      role={p.role}
      tabIndex={p.tabIndex}
      ref={p.boxRef}
    >
      <div className="c__alert__content">
        <div className="c__alert__content__left">
          {p.title}
          {p.type !== "neutral" && (
            <div className="c__alert__icon">
              <Icon d={ICONS[p.type]} />
            </div>
          )}
        </div>
      </div>
      {p.children && <div className="c__alert__additional">{p.children}</div>}
    </div>
  )
}

const buttonClass = (variant: "primary" | "secondary" | "tertiary", size: "medium" | "small" = "medium") =>
  `c__button c__button--brand c__button--brand--${variant} c__button--${size}`

// Move to the field, with its label or legend in view, without changing the page address.
function focusField(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.hash.slice(1)
  const field = id ? document.getElementById(id) : null
  if (!field) return
  e.preventDefault()
  const label = field.closest("fieldset")?.querySelector("legend") ?? document.querySelector(`label[for="${id}"]`)
  label?.scrollIntoView({ block: "start" })
  field.focus({ preventScroll: !!label })
}

// ---- Theme -------------------------------------------------------------------

export const cunninghamTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // The title, the introduction, the example notice (a warning Alert), then a primary Button.
  Start: ({ ui, onStart, headingRef }) => {
    // The notice's first sentence is its title line; the rest is the additional text.
    const cut = ui.demo_notice.indexOf(". ")
    const [title, rest] = cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <div className="cf-stack cf-stack--lg">
        <h1 className="cf-h1" tabIndex={-1} ref={headingRef}>
          {ui.start.title}
        </h1>
        <div className="cf-prose">
          {ui.start.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <Alert type="warning" title={<p>{title}</p>}>
          {rest && <p>{rest}</p>}
        </Alert>
        <div className="cf-actions">
          <button type="button" className={buttonClass("primary")} onClick={onStart}>
            {ui.start.button}
          </button>
        </div>
      </div>
    )
  },

  // The section and the question number, in small muted text above the question.
  Progress: ({ ui, section, question }) => (
    <p className="cf-progress">
      {section}
      {question && (
        <>
          <span aria-hidden="true"> · </span>
          <span className="c__offscreen">, </span>
          <span className="cf-nowrap">
            {ui.progress.question} {question.n} {ui.progress.of} {question.total}
          </span>
        </>
      )}
    </p>
  ),

  // Button, brand tertiary, small, with the arrow icon on the left.
  Back: ({ label, onBack }) => (
    <button type="button" className={`${buttonClass("tertiary", "small")} c__button--with-icon--left cf-back`} onClick={onBack}>
      <span className="c__button__icon">
        <Icon d={ICONS.arrowBack} />
      </span>
      {label}
    </button>
  ),

  // Cunningham has no error summary: an error Alert, with each problem as a link that moves
  // focus to its field.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <Alert
      type="error"
      className="cf-error-summary"
      role="alert"
      tabIndex={-1}
      boxRef={boxRef}
      title={<h2 className="cf-alert-title">{title}</h2>}
    >
      <ul className="cf-error-summary__list">
        {errors.map((e) => (
          <li key={e.id}>
            <a className="cf-link" href={`#${e.id}`} onClick={focusField}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="cf-h1" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className={buttonClass("primary")}>
      {label}
    </button>
  ),

  // A heading and a description list for each section, with a "Modifier" Button (brand
  // tertiary, small) on each answer.
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
      <div className="cf-stack cf-stack--lg">
        <h1 className="cf-h1" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <div className="cf-stack cf-stack--sm" key={g.section}>
            <h2 className="cf-h2">{g.section}</h2>
            <dl className="cf-summary">
              {g.rows.map((r) => (
                <div className="cf-summary__row" key={r.key}>
                  <dt className="cf-summary__key">{r.label}</dt>
                  <dd className="cf-summary__value">{r.value}</dd>
                  <dd className="cf-summary__action">
                    <button type="button" className={buttonClass("tertiary", "small")} onClick={() => onChange(r.pageIndex)}>
                      {ui.check.change}
                      <span className="c__offscreen"> {r.label.toLowerCase()}</span>
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        <div className="cf-stack cf-stack--sm">
          <h2 className="cf-h2">{ui.check.send_heading}</h2>
          <p>{ui.check.send_body}</p>
        </div>
        <div className="cf-actions">
          <button type="submit" className={buttonClass("primary")}>
            {ui.check.button}
          </button>
        </div>
      </div>
    )
  },

  // A success Alert with the reference, what happens next, the example reply in a neutral Alert,
  // the record in a Details, then a secondary Button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <div className="cf-stack cf-stack--lg">
        <Alert
          type="success"
          title={
            <h1 className="cf-alert-title cf-alert-title--page" tabIndex={-1} ref={headingRef}>
              {ui.confirmation.title}
            </h1>
          }
        >
          <p>
            {ui.confirmation.reference}
            {COLON} <strong className="cf-reference">{step.reference}</strong>
          </p>
        </Alert>
        <div className="cf-stack cf-stack--sm">
          <h2 className="cf-h2">{ui.confirmation.next_heading}</h2>
          <ol className="cf-steps">
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
        </div>
        <Alert type="neutral" title={<h2 className="cf-alert-title">{ui.confirmation.example_label}</h2>}>
          <p>{exampleMessage(ui, r, step.due)}</p>
        </Alert>
        <div className="cf-stack cf-stack--sm">
          <h2 className="cf-h2">{ui.confirmation.builders_heading}</h2>
          <details className="cf-details">
            <summary className={`${buttonClass("tertiary", "small")} c__button--with-icon--right cf-details__summary`}>
              {WORDS.record}
              <span className="c__button__icon">
                <Icon d={ICONS.chevronDown} />
              </span>
            </summary>
            <div className="cf-details__body cf-stack cf-stack--sm">
              <p>{ui.confirmation.builders_body}</p>
              <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
            </div>
          </details>
        </div>
        <div>
          <button type="button" className={buttonClass("secondary")} onClick={onRestart}>
            {ui.confirmation.restart}
          </button>
        </div>
      </div>
    )
  },
}
