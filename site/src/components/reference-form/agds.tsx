// Australian Government Design System (AGDS) markup for the reference form (Australia).
// Plain HTML that follows the markup and behaviour of @ag.ds-next/react 1.36.0: Field, TextInput,
// ControlGroup, Radio, Checkbox, PageAlert, Button, ButtonLink, DirectionButton, Callout, Details,
// SummaryList, Divider and the multi-page form templates. The AGDS React components are not used:
// they add their styles at run time with Emotion, which the Content-Security-Policy
// (style-src 'self') blocks. The styles are ported to site/src/styles/agds.scss.
// No government branding: no Coat of Arms, no "Australian Government" lockup, no header or footer.
import type { ControlProps } from "@jsonforms/core"
import { withJsonFormsControlProps } from "@jsonforms/react"

import { exampleMessage, fieldOf, formatDay, type Theme } from "./engine"
import { Layout, testers, useControl } from "./shared"

type C = ReturnType<typeof useControl>

// ---- Icons (paths from @ag.ds-next/react/icon) ------------------------------

function Icon({ size = "md", bold, label, children }: { size?: "sm" | "md"; bold?: boolean; label?: string; children: React.ReactNode }) {
  return (
    <svg
      className={`agds-icon agds-icon--${size}${bold ? " agds-icon--bold" : ""}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fillRule="evenodd"
      clipRule="evenodd"
      focusable="false"
      role="img"
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {children}
    </svg>
  )
}
const AlertFilledIcon = ({ label }: { label?: string }) => (
  <Icon label={label}>
    <path
      fill="currentColor"
      stroke="none"
      d="M8.472 1h7.056c.19 0 .43-.001.665.055.204.05.399.13.578.24.206.126.375.296.509.43l.036.037 4.922 4.922.037.036c.134.134.304.303.43.51.11.178.19.373.24.577.056.236.055.475.055.665v7.056c0 .19.001.43-.055.665-.05.204-.13.399-.24.578a2.799 2.799 0 0 1-.43.509l-.037.036-4.922 4.922-.036.037a2.799 2.799 0 0 1-.51.43c-.178.11-.373.19-.577.24a2.795 2.795 0 0 1-.665.055H8.472c-.19 0-.43.001-.665-.055-.204-.05-.399-.13-.578-.24-.206-.126-.375-.296-.509-.43l-.036-.037-4.922-4.922-.036-.036c-.135-.134-.305-.303-.431-.51a1.999 1.999 0 0 1-.24-.577A2.795 2.795 0 0 1 1 15.528V8.472c0-.19-.001-.43.055-.665a2 2 0 0 1 .24-.578c.126-.206.296-.375.43-.509l.037-.036 4.922-4.922.036-.036c.134-.135.303-.305.51-.431a2 2 0 0 1 .577-.24C8.043 1 8.282 1 8.472 1Zm.235 6.293a1 1 0 1 0-1.414 1.414L10.586 12l-3.293 3.293a1 1 0 0 0 1.414 1.414L12 13.414l3.293 3.293a1 1 0 0 0 1.414-1.414L13.414 12l3.293-3.293a1 1 0 0 0-1.414-1.414L12 10.586 8.707 7.293Z"
    />
  </Icon>
)
const SuccessFilledIcon = ({ label }: { label?: string }) => (
  <Icon label={label}>
    <path
      fill="currentColor"
      stroke="none"
      d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11Zm5.707-13.293a1 1 0 0 0-1.414-1.414L10 14.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l7-7Z"
    />
  </Icon>
)
const WarningFilledIcon = ({ label }: { label?: string }) => (
  <Icon label={label}>
    <path
      fill="currentColor"
      stroke="none"
      d="m23.1 20.1-9.3-18C13.4 1.4 12.7 1 12 1s-1.4.4-1.8 1.1l-9.3 18c-.3.6-.3 1.4.1 2 .4.6 1 1 1.7 1h18.7c.7 0 1.31-.33 1.7-1 .36-.6.3-1.4 0-2ZM12 19c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1Zm1-5c0 .6-.4 1-1 1s-1-.4-1-1V9c0-.6.4-1 1-1s1 .4 1 1v5Z"
    />
  </Icon>
)
const CheckIcon = () => (
  <Icon bold>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)
const ArrowLeftIcon = () => (
  <Icon size="sm">
    <path d="M21 12H4M8 17l-5-5 5-5" />
  </Icon>
)
const ChevronDownIcon = () => (
  <Icon bold>
    <path d="m6 9 6 6 6-6" />
  </Icon>
)

// ---- Field parts (field/FieldLabel, FieldHint, FieldMessage) ------------------

// AGDS writes "(optional)" after the label, in the muted colour, when a field is not required.
// The wording file already ends optional labels with "(optional)", so split it off and show it
// the AGDS way. Every other field is required.
function splitLabel(label: string) {
  const m = label.match(/^(.*?)\s*(\(optional\))\s*$/i)
  return m ? { text: m[1], secondary: m[2], required: false } : { text: label, secondary: undefined, required: true }
}

function LabelText({ label }: { label: string }) {
  const l = splitLabel(label)
  return (
    <>
      <span className="agds-field__label-text">{l.text}</span>
      {l.secondary && <span className="agds-field__secondary"> {l.secondary}</span>}
    </>
  )
}

// As in AGDS, the error message comes before the hint in aria-describedby.
const describedBy = (c: C) => [c.error && `${c.id}-error`, c.hint && `${c.id}-hint`].filter(Boolean).join(" ") || undefined

function Hint({ c }: { c: C }) {
  return c.hint ? (
    <span id={`${c.id}-hint`} className="agds-field__hint">
      {c.hint}
    </span>
  ) : null
}

function Message({ c }: { c: C }) {
  return c.error ? (
    <div className="agds-field__message">
      <AlertFilledIcon label="Error" />
      <span id={`${c.id}-error`} className="agds-field__message-text">
        {c.error}
      </span>
    </div>
  ) : null
}

// TextInput maxWidth: xs 5rem, sm 8rem, md 13rem, lg 18rem, xl 24rem.
const maxWidth = (n?: number) => (!n ? "xl" : n <= 5 ? "xs" : n <= 10 ? "sm" : n <= 20 ? "md" : n <= 30 ? "lg" : "xl")

// ---- Renderers ------------------------------------------------------------

// TextInput inside Field. When the question is the page heading, the label sits inside the H1.
const TextControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  const { required } = splitLabel(c.label)
  const type = c.field === "email" ? "email" : c.field === "phone" ? "tel" : "text"
  const label = (
    <label className="agds-field__label" htmlFor={c.id}>
      <LabelText label={c.label} />
    </label>
  )
  return (
    <div className={`agds-field${c.error ? " agds-field--invalid" : ""}`}>
      {c.asHeading ? (
        <h1 className="agds-h1 agds-field__heading" tabIndex={-1} ref={c.headingRef}>
          {label}
        </h1>
      ) : (
        label
      )}
      <Hint c={c} />
      <Message c={c} />
      <input
        className={`agds-text-input agds-text-input--${maxWidth(c.o.inputWidth)}`}
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
  )
})

// ControlGroup: a fieldset whose legend is the question (an H1 when it is the page heading).
function ControlGroup({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <div className={`agds-field${c.error ? " agds-field--invalid" : ""}`}>
      <fieldset className="agds-control-group" aria-describedby={describedBy(c)}>
        {c.asHeading ? (
          <legend className="agds-control-group__legend agds-control-group__legend--heading">
            <h1 className="agds-h1" tabIndex={-1} ref={c.headingRef}>
              <LabelText label={c.label} />
            </h1>
          </legend>
        ) : (
          <legend className="agds-control-group__legend agds-field__label">
            <LabelText label={c.label} />
          </legend>
        )}
        <div className="agds-control-group__body">
          <Hint c={c} />
          <Message c={c} />
          <div className="agds-control-group__options">{children}</div>
        </div>
      </fieldset>
    </div>
  )
}

// Radio and Checkbox: the label wraps a hidden native input and the drawn indicator.
// AGDS has no hint for a single option; where the wording has one, it sits under the
// option label in the hint style and is linked to the input with aria-describedby.
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
  return (
    <div className="agds-control-option">
      <label className={`agds-control agds-control--${p.type}`} htmlFor={p.id}>
        <span className="agds-control__box">
          <input
            className="agds-control__input"
            id={p.id}
            name={p.c.field}
            type={p.type}
            value={p.value}
            checked={p.checked}
            aria-invalid={invalid || undefined}
            aria-required={required}
            aria-describedby={describedBy}
            onChange={(e) => p.onChange(e.target.checked)}
          />
          <span className="agds-control__indicator">
            {p.type === "radio" ? <span className="agds-control__dot" /> : <CheckIcon />}
          </span>
        </span>
        <span className="agds-control__label">{p.label}</span>
      </label>
      {p.hint && (
        <span id={hintId} className="agds-control__hint">
          {p.hint}
        </span>
      )}
    </div>
  )
}

const optionId = (c: C, i: number) => (i === 0 ? c.id : `${c.id}-${i + 1}`)

const RadioControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <ControlGroup c={c}>
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
    </ControlGroup>
  )
})

const CheckboxesControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <ControlGroup c={c}>
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
    </ControlGroup>
  )
})

// One checkbox in a ControlGroup, as in the AGDS declaration pattern.
const SingleCheckboxControl = withJsonFormsControlProps((props: ControlProps) => {
  const c = useControl(props)
  return (
    <ControlGroup c={c}>
      <Option
        c={c}
        type="checkbox"
        id={c.id}
        label={c.o.checkboxLabel}
        checked={props.data === true}
        onChange={(on) => c.set(on ? true : undefined)}
      />
    </ControlGroup>
  )
})

// ---- Page parts -----------------------------------------------------------

// PageAlert: a coloured icon column, then the title and content.
function PageAlert(p: {
  tone: "error" | "success" | "warning"
  className?: string
  role?: string
  tabIndex?: number
  boxRef?: React.Ref<HTMLDivElement>
  children: React.ReactNode
}) {
  const icon =
    p.tone === "error" ? (
      <AlertFilledIcon label="Error" />
    ) : p.tone === "success" ? (
      <SuccessFilledIcon label="Success" />
    ) : (
      <WarningFilledIcon label="Warning" />
    )
  return (
    <div
      className={`agds-page-alert agds-page-alert--${p.tone}${p.className ? ` ${p.className}` : ""}`}
      role={p.role}
      tabIndex={p.tabIndex}
      ref={p.boxRef}
    >
      <div className="agds-page-alert__icon">{icon}</div>
      <div className="agds-page-alert__content">
        <div className="agds-page-alert__body">{p.children}</div>
      </div>
    </div>
  )
}

// Divider and ButtonGroup at the foot of each form page, as in the AGDS multi-page form template.
function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div className="agds-form__actions">
      <hr className="agds-divider" aria-hidden="true" />
      <div className="agds-button-group">{children}</div>
    </div>
  )
}

// useScrollToField from @ag.ds-next/react/field: focus the field and bring it into view
// without changing the page address.
function scrollToField(e: React.MouseEvent<HTMLAnchorElement>) {
  const id = e.currentTarget.hash.slice(1)
  const target = id ? document.getElementById(id) : null
  if (!target) return
  e.preventDefault()
  target.focus()
  ;(target.closest(".agds-field") ?? target).scrollIntoView()
}

function linkAction(fn: () => void) {
  return (e: React.MouseEvent) => {
    e.preventDefault()
    fn()
  }
}

// ---- Theme ------------------------------------------------------------------

export const agdsTheme: Theme = {
  renderers: [
    { tester: testers.layout, renderer: Layout },
    { tester: testers.text, renderer: TextControl },
    { tester: testers.radio, renderer: RadioControl },
    { tester: testers.checkbox, renderer: SingleCheckboxControl },
    { tester: testers.checkboxes, renderer: CheckboxesControl },
  ],

  // Introduction page of the AGDS multi-page form template: PageTitle with an introduction,
  // body text, then a primary button.
  Start: ({ ui, onStart, headingRef }) => {
    const [intro, ...rest] = ui.start.body
    return (
      <div className="agds-stack agds-stack--lg">
        <div className="agds-stack agds-stack--md">
          <h1 className="agds-h1" tabIndex={-1} ref={headingRef}>
            {ui.start.title}
          </h1>
          {intro && <p className="agds-form__intro">{intro}</p>}
        </div>
        {rest.length > 0 && (
          <div className="agds-prose">
            {rest.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}
        <PageAlert tone="warning">
          <p>{ui.demo_notice}</p>
        </PageAlert>
        <div>
          <button type="button" className="agds-button agds-button--primary" onClick={onStart}>
            {ui.start.button}
          </button>
        </div>
      </div>
    )
  },

  // The pretext above each H1 in the AGDS form step title: muted, bold, small.
  // AGDS asks for a Progress indicator in a left column; inside a dialog there is no room for
  // one, so the section and the question number take its place.
  Progress: ({ ui, section, question }) => (
    <p className="agds-form__pretext">
      {section}
      {question && (
        <>
          <span aria-hidden="true"> · </span>
          <span className="agds-sr-only">, </span>
          <span className="agds-form__pretext-count">
            {ui.progress.question} {question.n} {ui.progress.of} {question.total}
          </span>
        </>
      )}
    </p>
  ),

  // DirectionButton, direction left: the "back" link at the top of each form page.
  Back: ({ label, onBack }) => (
    <button type="button" className="agds-direction-link agds-form__back" onClick={onBack}>
      <ArrowLeftIcon />
      {label}
    </button>
  ),

  // PageAlert, tone error, listing each problem as a link that moves focus to the field.
  ErrorSummary: ({ title, errors, boxRef }) => (
    <PageAlert tone="error" className="agds-form__error" role="alert" tabIndex={-1} boxRef={boxRef}>
      <h2 className="agds-page-alert__title">{title}</h2>
      <ul className="agds-list">
        {errors.map((e) => (
          <li key={e.id}>
            <a className="agds-text-link" href={`#${e.id}`} onClick={scrollToField}>
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </PageAlert>
  ),

  PageHeading: ({ text, headingRef }) => (
    <h1 className="agds-h1" tabIndex={-1} ref={headingRef}>
      {text}
    </h1>
  ),

  Continue: ({ label }) => (
    <Actions>
      <button type="submit" className="agds-button agds-button--primary">
        {label}
      </button>
    </Actions>
  ),

  // Review page of the AGDS multi-page form template: an H2 and a SummaryList for each
  // section, with a "Change" TextLink in a SummaryListItemAction on each answer.
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
        <h1 className="agds-h1" tabIndex={-1} ref={headingRef}>
          {ui.check.title}
        </h1>
        {groups.map((g) => (
          <div className="agds-stack agds-stack--sm" key={g.section}>
            <h2 className="agds-h2">{g.section}</h2>
            <dl className="agds-summary-list">
              {g.rows.map((r) => (
                <div className="agds-summary-list__item" key={r.key}>
                  <dt className="agds-summary-list__term">{r.label}</dt>
                  <dd className="agds-summary-list__description">{r.value}</dd>
                  <dd className="agds-summary-list__action">
                    <a className="agds-text-link" href="#" onClick={linkAction(() => onChange(r.pageIndex))}>
                      {ui.check.change}
                      <span className="agds-sr-only"> {r.label.toLowerCase()}</span>
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        <div className="agds-stack agds-stack--sm">
          <h2 className="agds-h2">{ui.check.send_heading}</h2>
          <p>{ui.check.send_body}</p>
        </div>
        <Actions>
          <button type="submit" className="agds-button agds-button--primary">
            {ui.check.button}
          </button>
        </Actions>
      </>
    )
  },

  // Success page of the AGDS multi-page form template: the form title as H1, a success
  // PageAlert with the reference, "What happens next", a Callout and Details.
  Done: ({ ui, step, headingRef, onRestart }) => {
    const r = step.record
    const day = formatDay(step.due, ui.locale)
    const ack = r.contact_method === "email" ? "an email" : "a text message"
    const how = r.contact_method === "email" ? "email you" : r.contact_method === "text_message" ? "text you" : "call you"
    const team = r.knows_child ? ui.confirmation.kinship_team : ui.confirmation.team
    return (
      <div className="agds-stack agds-stack--lg">
        <h1 className="agds-h1">{ui.start.title}</h1>
        <PageAlert tone="success">
          <h2 className="agds-page-alert__title" tabIndex={-1} ref={headingRef}>
            {ui.confirmation.title}
          </h2>
          <p>
            {ui.confirmation.reference}: <strong className="agds-form__reference">{step.reference}</strong>
          </p>
        </PageAlert>
        <div className="agds-prose">
          <h2>{ui.confirmation.next_heading}</h2>
          <ol>
            <li>
              <strong>Now.</strong> We have sent you {ack} to confirm we have your message. It says who will contact you
              and when.
            </li>
            <li>
              <strong>By the end of {day}.</strong> A named person from {team} will {how}
              {r.best_times ? ", at one of the times you chose" : ""}.
            </li>
            <li>
              <strong>When you talk.</strong> Ask anything. There are no wrong questions, and nothing you ask counts
              against you.
              {r.interest === "not_sure" && !r.knows_child ? " We will talk you through fostering, adoption and other ways to help." : ""}
            </li>
          </ol>
          <p>If your plans change, that's fine. You can tell us at any time.</p>
        </div>
        <div className="agds-callout">
          <div className="agds-callout__body">
            <h3 className="agds-callout__title">{ui.confirmation.example_label}</h3>
            <p>{exampleMessage(ui, r, step.due)}</p>
          </div>
        </div>
        <div className="agds-stack agds-stack--sm">
          <h2 className="agds-h2">{ui.confirmation.builders_heading}</h2>
          <details className="agds-details">
            <summary className="agds-details__summary">
              Show the record
              <ChevronDownIcon />
            </summary>
            <div className="agds-details__body agds-stack agds-stack--sm">
              <p>{ui.confirmation.builders_body}</p>
              <pre className="kf-code">{JSON.stringify(r, null, 2)}</pre>
            </div>
          </details>
        </div>
        <div>
          <a className="agds-button agds-button--secondary" href="#" onClick={linkAction(onRestart)}>
            {ui.confirmation.restart}
          </a>
        </div>
      </div>
    )
  },
}
