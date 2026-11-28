// Suomi.fi design system markup for the reference form (Finland).
// Plain HTML that follows the markup and class names of suomifi-ui-components 19.0.0
// (designsystem.suomi.fi): Heading, Paragraph, Text, Link, Button, Label, HintText, StatusText,
// TextInput, RadioButtonGroup and RadioButton, CheckboxGroup and Checkbox, InlineAlert,
// ErrorSummary, Details and VisuallyHidden. The React components are not used: they are built
// with styled-components, which writes their CSS into the page at runtime, and the
// Content-Security-Policy blocks that. Their styles and the design tokens are ported and scoped
// to .suomifi-form in site/src/styles/suomifi.scss.
// The order in a field follows Suomi.fi: label, hint, the field, then the status text (the error
// message). Optional questions say "(vapaaehtoinen)" after the label, in the regular weight;
// required ones carry no mark.
// Icons are suomifi-icons 8.1.0 (MIT), as inline SVG paths.
// No Suomi.fi branding: no Suomi.fi logo or brand mark, which only the Suomi.fi brand family may
// use, no Finnish state lion or coat of arms, and no Suomi.fi header or login. Kinderform is not
// a government service.
// Every visible word comes from schema/ui/enquiry-submission.fi.json, except the fixed sentences
// of the confirmation page, which are in the DONE table below, and the engine's Finnish phrases
// and example reply.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// "maanantai 30. marraskuuta" becomes "maanantaina 30. marraskuuta" (on Monday 30 November):
// every Finnish weekday takes -na.
const onDay = (day: string) => day.replace(/^(\S+)/, "$1na")

// The fixed sentences of the confirmation page, in Finnish. As in the other themes, they live in
// code rather than in the wording file. The team names in the wording file are in the elative
// case ("perhehoidon tiimistä"), to follow "yhteyshenkilösi".
const DONE = {
  ack: { email: "sähköpostin", text: "tekstiviestin" },
  now: "Nyt.",
  nowBody: (ack: string) =>
    `Lähetimme sinulle ${ack}. Siinä kerrotaan, että saimme kysymyksesi. Siinä kerrotaan myös, kuka ottaa sinuun yhteyttä ja milloin.`,
  by: (day: string) => `Viimeistään ${onDay(day)}.`,
  how: {
    email: "lähettää sinulle sähköpostia",
    text_message: "lähettää sinulle tekstiviestin",
    phone_call: "soittaa sinulle",
  } as Record<string, string>,
  who: (team: string, how: string) => `Oma yhteyshenkilösi ${team} ${how}`,
  times: " jonakin valitsemanasi aikana",
  talk: "Kun puhumme.",
  // The same words as the engine's Finnish example reply.
  talkBody: "Voit kysyä mitä haluat. Kysyminen ei sido sinua mihinkään.",
  notSure: " Kerromme sinulle sijaisperheistä, adoptiosta ja muista tavoista auttaa.",
  plans: "Jos suunnitelmasi muuttuvat, se ei haittaa. Voit kertoa siitä meille milloin tahansa.",
  record: "Näytä tiedot",
}

// ---- Icons (suomifi-icons 8.1.0) -------------------------------------------------------------

const ICONS = {
  arrowLeft:
    "M22.999 11H3.413l4.293-4.293a.999.999 0 1 0-1.414-1.414l-6 6a1.001 1.001 0 0 0 0 1.416l6 5.998a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L3.413 13h19.586a1 1 0 0 0 0-2",
  arrowRight:
    "M23.923 11.617a.999.999 0 0 0-.216-.325l-6-6a1 1 0 0 0-1.414 1.415l4.293 4.292H1a1 1 0 0 0 0 2h19.586l-4.293 4.293a.999.999 0 1 0 1.414 1.414l6-5.998a1.004 1.004 0 0 0 .216-1.09",
  errorFilled:
    "M12 0c6.617 0 12 5.383 12 12s-5.383 12-12 12S0 18.617 0 12 5.383 0 12 0Zm.71 17.29c-.38-.37-1.05-.37-1.42 0-.181.19-.29.44-.29.71 0 .26.109.52.29.71.189.18.45.29.71.29.26 0 .52-.11.71-.29.18-.19.29-.45.29-.71 0-.27-.11-.52-.29-.71ZM12 5a1 1 0 0 0-1 1v8a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z",
  warning:
    "m12.876 1.48 10.915 19.844a1 1 0 0 1-.771 1.637H1a1 1 0 0 1-.876-1.482l11-20c.35-.639 1.401-.639 1.752 0ZM12 4.035 2.691 20.961h18.617L12 4.036Zm.712 13.215c.18.19.29.45.29.71a1.009 1.009 0 0 1-1 1c-.27 0-.52-.11-.71-.29-.19-.19-.29-.45-.29-.71 0-.26.1-.52.29-.71.37-.37 1.05-.37 1.42 0ZM12 8.961a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1Z",
  check:
    "M19.447 5.384 8 17.42a1.82 1.82 0 0 1-2.667 0L.552 12.394a2.059 2.059 0 0 1 0-2.805 1.822 1.822 0 0 1 2.666 0l3.449 3.625L16.78 2.581a1.82 1.82 0 0 1 2.666 0 2.053 2.053 0 0 1 0 2.803",
}

// A Suomi.fi icon: decorative, hidden from screen readers, coloured by its class.
function Icon({ name, className = "", box = 24 }: { name: keyof typeof ICONS; className?: string; box?: number }) {
  return (
    <svg
      className={`fi-icon${className ? ` ${className}` : ""}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${box} ${box}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className="fi-icon-base-fill" fillRule="evenodd" d={ICONS[name]} />
    </svg>
  )
}

// ---- Small parts ------------------------------------------------------------------

// Suomi.fi marks a question that is not required with its optionalText, "(vapaaehtoinen)", after
// the label in the regular weight. The wording file ends those labels with it; split it off.
const OPTIONAL = /\s*\(vapaaehtoinen\)\s*$/i
function splitLabel(label: string) {
  const m = label.match(OPTIONAL)
  return m ? { text: label.slice(0, m.index), optional: m[0].trim() } : { text: label, optional: undefined }
}

// Label: the text, then the optional text in its own span.
function LabelText({ label }: { label: string }) {
  const l = splitLabel(label)
  return (
    <>
      {l.text}
      {l.optional && <span className="fi-label_optional-text"> {l.optional}</span>}
    </>
  )
}

function Hint({ c, className = "" }: { c: C; className?: string }) {
  return c.hint ? (
    <span className={`fi-hint-text${className ? ` ${className}` : ""}`} id={`${c.id}-hint`}>
      {c.hint}
    </span>
  ) : null
}

// StatusText in the error state: the ErrorFilled icon, then the message.
function StatusText({ c, className }: { c: C; className: string }) {
  return c.error ? (
    <span className={`fi-status-text fi-status-text--error ${className}`} id={`${c.id}-error`}>
      <Icon name="errorFilled" />
      {c.error}
    </span>
  ) : null
}

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const linkTo = (go: () => void) => (e: React.MouseEvent) => {
  e.preventDefault()
  go()
}

// ---- Renderers --------------------------------------------------------------------

// TextInput: label, hint, the input, then the status text. When the question is the page
// heading, the label sits inside an h1 in the Heading h1 look. Width as in Suomi.fi: 290px for
// short answers, the full width for a name or an email address, narrower for a few digits.
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { optional } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const n = c.o.inputWidth
  const width = !n ? " fi-text-input--full-width" : n <= 5 ? " suomifi-form__input--narrow" : ""
  const label = (
    <label className="fi-label_label-span" htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className={`fi-text-input${width}${c.error ? " fi-text-input--error" : ""}`}>
      <div className="fi-text-input_wrapper">
        <div className="fi-text-input_label--visible fi-label">
          {c.asHeading ? (
            <h1 className="fi-heading fi-heading--h1 suomifi-form__heading" tabIndex={-1} ref={c.headingRef}>
              {label}
            </h1>
          ) : (
            label
          )}
        </div>
        <Hint c={c} />
        <div className="fi-text-input_input-element-container">
          <input
            className="fi-text-input_input"
            id={c.id}
            name={c.field}
            type={type}
            value={c.current}
            autoComplete={c.o.autocomplete}
            inputMode={c.o.inputmode as React.HTMLAttributes<HTMLInputElement>["inputMode"]}
            spellCheck={c.o.spellcheck}
            aria-required={!optional}
            aria-invalid={c.error ? true : false}
            aria-describedby={c.describedBy}
            onChange={(e) => c.setFromString(e.target.value)}
            onBlur={c.onBlur}
          />
        </div>
        {c.error && (
          <div className="fi-text-input_bottom-wrapper">
            <StatusText c={c} className="fi-text-input_statusText--has-content" />
          </div>
        )}
      </div>
    </div>
  )
})

// RadioButtonGroup and CheckboxGroup: the question is the legend (with an h1 inside when it is the
// page heading), then the hint, the options, and the group's status text after the fieldset.
function Group({ c, kind, children }: { c: C; kind: "radio-button" | "checkbox"; children: React.ReactNode }) {
  const text = (
    <span className="fi-label_label-span">
      <LabelText label={c.label} />
    </span>
  )
  return (
    <div className={`fi-${kind}-group`}>
      <fieldset aria-describedby={c.describedBy}>
        <legend className={`fi-${kind}-group_legend fi-${kind}-group_legend--with-margin`}>
          <div className="fi-label">
            {c.asHeading ? (
              <h1 className="fi-heading fi-heading--h1 suomifi-form__heading" tabIndex={-1} ref={c.headingRef}>
                {text}
              </h1>
            ) : (
              text
            )}
          </div>
        </legend>
        <Hint c={c} className="suomifi-form__group-hint" />
        <div className={`fi-${kind}-group_container`}>{children}</div>
      </fieldset>
      <StatusText c={c} className={`fi-${kind}-group_statusText--has-content`} />
    </div>
  )
}

// RadioButton: the native input (hidden, as in Suomi.fi), the drawn circle, the label, then the
// option's hint, linked with aria-describedby.
function Radio(p: { c: C; id: string; value: string; label: string; hint?: string; checked: boolean; onChange: () => void }) {
  const hintId = p.hint ? `${p.id}-hint` : undefined
  return (
    <div
      className={`fi-radio-button fi-radio-button_container${p.c.error ? " fi-radio-button--error" : ""}${p.checked ? " fi-radio-button--checked" : ""}`}
    >
      <input
        className="fi-radio-button_input"
        id={p.id}
        type="radio"
        name={p.c.field}
        value={p.value}
        checked={p.checked}
        aria-describedby={hintId}
        onChange={p.onChange}
      />
      <span className="fi-radio-button_icon_wrapper">
        <svg
          className="fi-icon fi-radio-button_icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18 18"
          aria-hidden="true"
          focusable="false"
        >
          <g fill="none" fillRule="evenodd">
            <circle className="fi-icon-radio-base" cx="9" cy="9" r="8.5" />
            <circle className="fi-icon-radio-checked" cx="9" cy="9" r="4" />
          </g>
        </svg>
      </span>
      <label className="fi-radio-button_label" htmlFor={p.id}>
        {p.label}
      </label>
      {p.hint && (
        <span className="fi-radio-button_hintText fi-hint-text" id={hintId}>
          {p.hint}
        </span>
      )}
    </div>
  )
}

// Checkbox: the native input (hidden, as in Suomi.fi), the label with the drawn box and, when
// ticked, the Check icon, then the option's hint.
function Checkbox(p: {
  c: C
  id: string
  value?: string
  label: React.ReactNode
  hint?: string
  checked: boolean
  onChange: (on: boolean) => void
}) {
  const hintId = p.hint ? `${p.id}-hint` : undefined
  return (
    <div
      className={`fi-checkbox_container fi-checkbox${p.checked ? " fi-checkbox--checked" : ""}${p.c.error ? " fi-checkbox--error" : ""}`}
    >
      <input
        className="fi-checkbox_input"
        id={p.id}
        type="checkbox"
        name={p.c.field}
        value={p.value}
        checked={p.checked}
        aria-invalid={p.c.error ? true : false}
        aria-describedby={hintId}
        onChange={(e) => p.onChange(e.target.checked)}
      />
      <label className="fi-checkbox_label" htmlFor={p.id}>
        {p.checked && <Icon name="check" box={20} className="fi-checkbox_icon" />}
        {p.label}
      </label>
      {p.hint && (
        <span className="fi-hint-text" id={hintId}>
          {p.hint}
        </span>
      )}
    </div>
  )
}

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Group c={c} kind="radio-button">
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
    </Group>
  )
})

const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Group c={c} kind="checkbox">
      {c.options.map((opt, i) => (
        <Checkbox
          key={opt.value}
          c={c}
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

// A yes-or-no question with one box to tick (updates): the question in a CheckboxGroup, one
// Checkbox.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <Group c={c} kind="checkbox">
      <Checkbox
        c={c}
        id={c.id}
        label={c.o.checkboxLabel}
        checked={props.data === true}
        onChange={(on) => c.set(on ? true : undefined)}
      />
    </Group>
  )
})

// ---- Page parts -------------------------------------------------------------------

// InlineAlert: an icon (none for neutral), then the label and the content.
function InlineAlert(p: {
  status: "neutral" | "warning"
  label?: React.ReactNode
  labelTag?: "div" | "h2" | "h3"
  children: React.ReactNode
}) {
  const Label = p.labelTag ?? "div"
  return (
    <section className={`fi-inline-alert fi-inline-alert--${p.status}`}>
      <div className="fi-inline-alert_style-wrapper">
        {p.status === "warning" && <Icon name="warning" className="fi-inline-alert_icon fi-inline-alert_icon--warning" />}
        <div className="fi-inline-alert_text-content-wrapper">
          {p.label && <Label className="fi-inline-alert_label">{p.label}</Label>}
          <div className="fi-inline-alert_content">{p.children}</div>
        </div>
      </div>
    </section>
  )
}

// From the error summary to the field: focus it, with its label or legend in view.
function focusField(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.hash.slice(1)
  const field = id ? document.getElementById(id) : null
  if (!field) return
  e.preventDefault()
  ;(field.closest(".fi-radio-button-group, .fi-checkbox-group, .fi-text-input") ?? field).scrollIntoView({ block: "start" })
  field.focus({ preventScroll: true })
}

// ---- Theme ------------------------------------------------------------------------

export const suomifiTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // Heading, a lead paragraph, the other paragraphs, the example notice as a warning InlineAlert
  // (its first sentence is the label), then a primary Button with an arrow.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    const cut = ui.demo_notice.indexOf(". ")
    const [title, more] =
      cut < 0 ? [ui.demo_notice, ""] : [ui.demo_notice.slice(0, cut + 1), ui.demo_notice.slice(cut + 2)]
    return (
      <div className="suomifi-form__stack">
        <div className="suomifi-form__stack-sm">
          <h1 className="fi-heading fi-heading--h1" tabIndex={-1} ref={headingRef}>
            {ui.start.title}
          </h1>
          {intro && (
            <p className="fi-paragraph">
              <span className="fi-text fi-text--lead">{intro}</span>
            </p>
          )}
          {rest.map((p) => (
            <p className="fi-paragraph" key={p}>
              {p}
            </p>
          ))}
        </div>
        <InlineAlert status="warning" label={title}>
          {more}
        </InlineAlert>
        <button type="button" className="fi-button" onClick={onStart}>
          {ui.start.button}
          <span className="fi-button_icon fi-button_icon--right">
            <Icon name="arrowRight" />
          </span>
        </button>
      </div>
    )
  },

  // A small Text with the section, then "Kysymys 2 / 9". On the check page, the last section
  // alone.
  Progress: ({ ui, section, question }) => (
    <p className="fi-text fi-text--small-screen suomifi-form__progress">
      {section}
      {question && (
        <>
          <span aria-hidden="true"> · </span>
          <span className="fi-visually-hidden">, </span>
          {ui.progress.question} {question.n} {ui.progress.of} {question.total}
        </>
      )}
    </p>
  ),

  // A Link with the ArrowLeft icon, at the top of each page.
  Back: ({ label, onBack }) => (
    <div className="suomifi-form__back">
      <a href="#" className="fi-link" onClick={linkTo(onBack)}>
        <Icon name="arrowLeft" />
        {label}
      </a>
    </div>
  ),

  // ErrorSummary: the ErrorFilled icon, the heading, then a Link to each field with a problem.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <div className="fi-error-summary suomifi-form__error" role="alert" tabIndex={-1} ref={boxRef}>
      <div className="fi-error-summary_style-wrapper">
        <Icon name="errorFilled" className="fi-error-summary_icon" />
        <div className="fi-error-summary_text-content-wrapper">
          <h2 className="fi-heading fi-error-summary_heading">{title}</h2>
          <div className="fi-error-summary_content">
            <ul>
              {errors.map((e) => (
                <li key={e.id}>
                  <a className="fi-link" href={`#${e.id}`} onClick={focusField}>
                    {e.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="fi-heading fi-heading--h1" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <button type="submit" className="fi-button">
      {label}
    </button>
  ),

  // A block for each section: a heading (Heading h3 look), then each question, its answer and a
  // Link to change it.
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
      <div className="suomifi-form__stack">
        <h1 className="fi-heading fi-heading--h1" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <section className="suomifi-form__stack-sm suomifi-form__wide" key={g.section}>
            <h2 className="fi-heading fi-heading--h3">{g.section}</h2>
            <dl className="suomifi-form__summary">
              {g.rows.map((r) => {
                const label = splitLabel(r.label).text
                return (
                  <div className="suomifi-form__summary-item" key={r.key}>
                    <dt className="suomifi-form__summary-key">{label}</dt>
                    <dd className="suomifi-form__summary-value">{r.value}</dd>
                    <dd className="suomifi-form__summary-action">
                      <a className="fi-link fi-link--small" href="#" onClick={linkTo(() => onChange(r.pageIndex))}>
                        {ui.check.change}
                        <span className="fi-visually-hidden">: {label}</span>
                      </a>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </section>
        ))}
        <div className="suomifi-form__stack-sm">
          <h2 className="fi-heading fi-heading--h3">{ui.check.send_heading}</h2>
          <p className="fi-paragraph">{ui.check.send_body}</p>
        </div>
        <button type="submit" className="fi-button">
          {ui.check.button}
        </button>
      </div>
    )
  },

  // The page heading, the reference in a neutral InlineAlert, "Mitä seuraavaksi tapahtuu" as a
  // numbered list, the example reply in a neutral InlineAlert, the record in Details, then a
  // secondary Button to start again.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? DONE.ack.email : DONE.ack.text
    const how = DONE.how[String(r.contact_method)] ?? DONE.how.phone_call
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <div className="suomifi-form__stack">
        <h1 className="fi-heading fi-heading--h1" tabIndex={-1} ref={headingRef}>
          {ui.confirmation.title}
        </h1>
        <InlineAlert status="neutral" label={ui.confirmation.reference}>
          <strong className="suomifi-form__reference">{step.reference}</strong>
        </InlineAlert>
        <div className="suomifi-form__stack-sm suomifi-form__wide">
          <h2 className="fi-heading fi-heading--h3">{ui.confirmation.next_heading}</h2>
          <ol className="fi-paragraph suomifi-form__list">
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
          <p className="fi-paragraph">{DONE.plans}</p>
        </div>
        <InlineAlert status="neutral" label={ui.confirmation.example_label} labelTag="h3">
          {exampleMessage(ui, r, step.due)}
        </InlineAlert>
        <div className="suomifi-form__stack-sm suomifi-form__wide">
          <h2 className="fi-heading fi-heading--h3">{ui.confirmation.builders_heading}</h2>
          <details className="fi-details">
            <summary className="fi-details_summary">{DONE.record}</summary>
            <div className="fi-details_content">
              <p className="fi-paragraph">{ui.confirmation.builders_body}</p>
              <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
            </div>
          </details>
        </div>
        <button type="button" className="fi-button fi-button--secondary" onClick={onRestart}>
          {ui.confirmation.restart}
        </button>
      </div>
    )
  },
}
