// The dialog that opens each country's example form from the map on /example-form.
//
// Links on the page carry data-country (and data-about for "How the forms are built"). Without
// JavaScript they go to /example-form/<country>; with it, the click opens the dialog instead and
// the address changes, so the link can be shared and the browser's back button closes it.
// Each country's design system, wording and theme load only when its form is opened.
import { useEffect, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { countryOf, isFormCountry, type FormCountry } from "./countries"
import { ReferenceForm, type Theme, type UiConfig } from "./engine"

// A country can offer its form in more than one language (Canada: English and French).
type Language = { code: string; label: string; ui: UiConfig }
type Loaded = { ui: UiConfig; theme: Theme; rootClass: string; languages?: Language[] }

const LOADERS: Record<FormCountry, () => Promise<{ default: Loaded }>> = {
  uk: () => import("./load-uk"),
  us: () => import("./load-us"),
  ca: () => import("./load-ca"),
  au: () => import("./load-au"),
  de: () => import("./load-de"),
  fr: () => import("./load-fr"),
  es: () => import("./load-es"),
}

const BASE = "/example-form"
const langFromUrl = () => new URLSearchParams(location.search).get("lang") ?? "en"
const countryFromPath = (path: string): FormCountry | null => {
  const code = path.replace(/\/+$/, "").split("/").pop()
  return isFormCountry(code) ? code : null
}

export function FormDialog({ initial, pageTitle }: { initial: FormCountry | null; pageTitle: string }) {
  const [country, setCountry] = useState<FormCountry | null>(initial)
  const [about, setAbout] = useState(false)
  const [loaded, setLoaded] = useState<Partial<Record<FormCountry, Loaded>>>({})
  const [failed, setFailed] = useState(false)
  const [lang, setLang] = useState(langFromUrl)

  // Open from any link on the page, and follow the browser's back and forward buttons.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element).closest<HTMLElement>("[data-country], [data-about]")
      if (!link) return
      e.preventDefault()
      if (link.dataset.about !== undefined) return setAbout(true)
      const code = link.dataset.country
      if (!isFormCountry(code)) return
      history.pushState({ country: code }, "", `${BASE}/${code}`)
      setCountry(code)
    }
    const onPop = () => {
      setCountry(countryFromPath(location.pathname))
      setLang(langFromUrl())
    }
    document.addEventListener("click", onClick)
    window.addEventListener("popstate", onPop)
    return () => {
      document.removeEventListener("click", onClick)
      window.removeEventListener("popstate", onPop)
    }
  }, [])

  useEffect(() => {
    if (!country || loaded[country]) return
    setFailed(false)
    LOADERS[country]()
      .then((m) => setLoaded((l) => ({ ...l, [country]: m.default })))
      .catch(() => setFailed(true))
  }, [country, loaded])

  // The form sets the tab title as you move through it; put the page's own title back on close.
  useEffect(() => {
    if (!country) document.title = pageTitle
  }, [country, pageTitle])

  const close = () => {
    if (countryFromPath(location.pathname)) history.pushState({}, "", BASE)
    setCountry(null)
  }

  const meta = country ? countryOf(country) : null
  const form = country ? loaded[country] : undefined
  const languages = form?.languages
  const current = languages?.find((l) => l.code === lang) ?? languages?.[0]
  const ui = current?.ui ?? form?.ui
  const other = languages?.find((l) => l !== current)

  // Keep ?lang= in the address while a form with several languages is open, so a link to the
  // French form opens in French.
  useEffect(() => {
    if (!country || !languages) return
    const url = new URL(location.href)
    if (current && current !== languages[0]) url.searchParams.set("lang", current.code)
    else url.searchParams.delete("lang")
    if (url.href !== location.href) history.replaceState(history.state, "", url)
  }, [country, languages, current])

  return (
    <>
      <Dialog open={!!country} onOpenChange={(open) => !open && close()}>
        {/* Phones: the whole screen, with a slim header. Larger screens: a centred card. */}
        {meta && (
          <DialogContent className="top-0 left-0 flex h-dvh max-h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:top-[50%] sm:left-[50%] sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border">
            <DialogHeader className="shrink-0 flex-row items-start gap-3 border-b py-3 pr-12 pl-5 text-left sm:py-4 sm:pr-14 sm:pl-6">
              <div className="grid min-w-0 flex-1 gap-1 sm:gap-2">
                <DialogTitle className="text-base sm:text-lg">{meta.name}: example enquiry form</DialogTitle>
                <DialogDescription className="sr-only sm:not-sr-only">
                  Built with the {meta.system}, without government branding. Nothing you enter is sent or stored.
                </DialogDescription>
              </div>
              {other && (
                // Switching language keeps your answers: the form stays the same, only its wording changes.
                <Button variant="outline" size="sm" lang={other.code} onClick={() => setLang(other.code)}>
                  {other.label}
                </Button>
              )}
            </DialogHeader>
            {/* relative: the forms' visually hidden text is absolutely positioned and must stay inside
                this scroll area, or scrolling the form into view shifts the whole dialog. */}
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white text-black">
              <div className={`p-5 md:p-8 ${form?.rootClass ?? ""}`}>
                {form && ui ? (
                  <ReferenceForm key={country} ui={ui} theme={form.theme} />
                ) : failed ? (
                  <p>The form did not load. Check your connection and try again.</p>
                ) : (
                  <p aria-live="polite">Loading the form…</p>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={about} onOpenChange={setAbout}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader className="text-left">
            <DialogTitle>How the forms are built</DialogTitle>
            <DialogDescription>The same short form, in each country's public-sector design system.</DialogDescription>
          </DialogHeader>
          <ul className="ml-5 list-disc space-y-3 text-sm leading-6">
            <li>
              The questions and rules come from one schema: a file that describes what the record holds. The same
              schema checks the record before the last page.
            </li>
            <li>
              The wording is in a separate file for each country. A service can change it without changing any code.
            </li>
            <li>
              Each country's form uses a public-sector design system from that country: GOV.UK, the U.S. Web Design
              System, the GC Design System, the Australian Government Design System and, in Germany, KERN UX.
            </li>
            <li>
              France's State design system may only be used by State services. So the French form uses Cunningham,
              an open design system from the French State's digital office. Spain's central system is not open, so the
              Spanish form uses DESY, the open design system of the Government of Aragon.
            </li>
            <li>None of the forms carries government branding, because Kinderform is not a government service.</li>
            <li>
              Each page asks one question and says where you are. Focus moves to the new question, and there is always
              a way back. At the end, you can check your answers. When something needs fixing, an error message
              appears at the top.
            </li>
            <li>
              The forms ask nothing about health, home, money or family. They ask only what a service needs to reply
              quickly and kindly.
            </li>
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
