// Pieces both design systems share: testers, the layout renderer and a hook that
// turns JSON Forms control props into what a question needs.
import {
  and,
  isControl,
  isStringControl,
  optionIs,
  rankWith,
  schemaMatches,
  uiTypeIs,
  type ControlProps,
  type LayoutProps,
  type UISchemaElement,
} from "@jsonforms/core"
import { JsonFormsDispatch, withJsonFormsLayoutProps } from "@jsonforms/react"

import { fieldOf, idFor, useHeadingRef, usePage, type Control } from "./engine"

export const testers = {
  layout: rankWith(1, uiTypeIs("VerticalLayout")),
  text: rankWith(1, isStringControl),
  radio: rankWith(5, and(isControl, optionIs("format", "radio"))),
  checkbox: rankWith(5, and(isControl, optionIs("format", "checkbox"))),
  checkboxes: rankWith(4, and(isControl, schemaMatches((s) => s.type === "array"))),
}

export const Layout = withJsonFormsLayoutProps(({ uischema, schema, path, renderers, cells }: LayoutProps) => (
  <>
    {(uischema as unknown as { elements: UISchemaElement[] }).elements.map((el, i) => (
      <JsonFormsDispatch key={i} uischema={el} schema={schema} path={path} renderers={renderers} cells={cells} />
    ))}
  </>
))

export type Option = { value: string; label: string; hint?: string }

export function useControl(props: ControlProps) {
  const ui = props.uischema as unknown as Control
  const field = fieldOf(ui.scope)
  const id = idFor(field)
  const { errors, headingField, onBlurField } = usePage()
  const headingRef = useHeadingRef()
  const o = ui.options ?? {}
  const error = errors[field]
  const hint = o.hint
  const asHeading = headingField === field && !!o.asHeading
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined

  const s = props.schema as { enum?: unknown[]; type?: string; items?: { enum?: string[] } }
  const values: string[] =
    s.type === "boolean" ? ["true", "false"] : ((s.enum ?? s.items?.enum ?? []) as string[]).map(String)
  const options: Option[] = values.map((v) => ({
    value: v,
    label: o.optionLabels?.[v] ?? v,
    hint: o.optionHints?.[v],
  }))

  const set = (value: unknown) => props.handleChange(props.path, value)
  const setFromString = (v: string) => {
    if (s.type === "boolean") set(v === "true")
    else set(v === "" ? undefined : v)
  }
  const toggle = (v: string, on: boolean) => {
    const cur = (Array.isArray(props.data) ? props.data : []) as string[]
    const next = on ? [...cur.filter((x) => x !== v), v] : cur.filter((x) => x !== v)
    set(next.length ? values.filter((x) => next.includes(x)) : undefined)
  }
  const current = props.data === undefined ? "" : String(props.data)
  const checked = (v: string) => Array.isArray(props.data) && (props.data as string[]).includes(v)

  return {
    ui,
    o,
    field,
    id,
    label: ui.label,
    error,
    hint,
    asHeading,
    headingRef: asHeading ? headingRef : null,
    describedBy,
    options,
    current,
    checked,
    set,
    setFromString,
    toggle,
    onBlur: () => onBlurField(field),
  }
}
