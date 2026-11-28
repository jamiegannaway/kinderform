// Starts the example form on a country page and keeps the page around it in step with it.
//
// The page marks what depends on the form's language with data-form-variant="<wording key>" (the tag
// for wording not yet reviewed, the downloads and the starter kit link), and the language links
// with data-lang-link. The design links (?design=neutral or none) are plain links; this only adds
// ?lang= to them, so a reader who switched to French stays in French. public/example-form.js has
// already marked <html data-design="neutral"> before the page was drawn, so the design switch
// showed the right choice from the start.
import { createRoot, type Root } from "react-dom/client"

import { FormPage, wantedDesign, type PageVariant } from "./form-page"

const el = document.getElementById("kf-form-root")
if (el) {
  const country = el.dataset.country ?? ""
  const variants = JSON.parse(el.dataset.variants ?? "[]") as PageVariant[]
  const design = wantedDesign(el.dataset.national === "true")
  const fromUrl = new URLSearchParams(location.search).get("lang")
  let lang = variants.some((v) => v.lang === fromUrl) ? fromUrl! : variants[0].lang
  let root: Root | null = null

  const render = () => {
    root ??= createRoot(el)
    root.render(<FormPage country={country} design={design} variants={variants} lang={lang} />)
  }

  // Show the parts of the page for this language, and keep ?lang= in every link and the address.
  const sync = () => {
    const key = variants.find((v) => v.lang === lang)!.key
    for (const block of document.querySelectorAll<HTMLElement>("[data-form-variant]")) block.hidden = block.dataset.formVariant !== key
    for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-lang-link]")) {
      if (link.dataset.langLink === lang) link.setAttribute("aria-current", "true")
      else link.removeAttribute("aria-current")
    }
    for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-design-link], [data-lang-link]")) {
      const url = new URL(link.href)
      const linkLang = link.dataset.langLink ?? lang
      if (linkLang === variants[0].lang) url.searchParams.delete("lang")
      else url.searchParams.set("lang", linkLang)
      if (link.dataset.langLink && design === "neutral" && el.dataset.national === "true") url.searchParams.set("design", "neutral")
      link.href = url.href
    }
    const url = new URL(location.href)
    if (lang === variants[0].lang) url.searchParams.delete("lang")
    else url.searchParams.set("lang", lang)
    if (url.href !== location.href) history.replaceState(history.state, "", url)
  }

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = (e.target as Element).closest<HTMLAnchorElement>("[data-lang-link]")
    if (!link) return
    e.preventDefault()
    lang = link.dataset.langLink!
    sync()
    render()
  })

  sync()
  render()
}
