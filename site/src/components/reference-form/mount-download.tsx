// Starts the form in a downloaded single-file example (built by scripts/build-form-downloads.mjs).
// The same engine, design and wording as the country page, with nothing loaded from anywhere.
import { createRoot } from "react-dom/client"

import { ReferenceForm, type Theme, type UiConfig } from "./engine"

type Loaded = { ui: UiConfig; theme: Theme; rootClass: string; languages?: { code: string; ui: UiConfig }[] }

export function mountDownload(form: Loaded, lang: string) {
  const ui = form.languages?.find((l) => l.code === lang)?.ui ?? form.ui
  const el = document.getElementById("kf-root")
  if (!el) return
  createRoot(el).render(
    <div className={`kf-file__form ${form.rootClass}`}>
      <ReferenceForm ui={ui} theme={form.theme} />
    </div>,
  )
}
