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
import { countryOf, isFormCountry, type FormCountry } from "./countries"
import { ReferenceForm, type Theme, type UiConfig } from "./engine"

type Loaded = { ui: UiConfig; theme: Theme; rootClass: string }

const LOADERS: Record<FormCountry, () => Promise<{ default: Loaded }>> = {
  uk: () => import("./load-uk"),
  us: () => import("./load-us"),
  ca: () => import("./load-ca"),
  au: () => import("./load-au"),
}

const BASE = "/example-form"
const countryFromPath = (path: string): FormCountry | null => {
  const code = path.replace(/\/+$/, "").split("/").pop()
  return isFormCountry(code) ? code : null
}

export function FormDialog({ initial, pageTitle }: { initial: FormCountry | null; pageTitle: string }) {
  const [country, setCountry] = useState<FormCountry | null>(initial)
  const [about, setAbout] = useState(false)
  const [loaded, setLoaded] = useState<Partial<Record<FormCountry, Loaded>>>({})
  const [failed, setFailed] = useState(false)

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
    const onPop = () => setCountry(countryFromPath(location.pathname))
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

  return (
    <>
      <Dialog open={!!country} onOpenChange={(open) => !open && close()}>
        {meta && (
          <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
            <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12 text-left">
              <DialogTitle>{meta.name}: example enquiry form</DialogTitle>
              <DialogDescription>
                Built with the {meta.system}, without government branding. Nothing you enter is sent or stored.
              </DialogDescription>
            </DialogHeader>
            {/* relative: the forms' visually hidden text is absolutely positioned and must stay inside
                this scroll area, or scrolling the form into view shifts the whole dialog. */}
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white text-black">
              <div className={`p-5 md:p-8 ${form?.rootClass ?? ""}`}>
                {form ? (
                  <ReferenceForm key={country} ui={form.ui} theme={form.theme} />
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
            <DialogDescription>The same short form, in four countries' design systems.</DialogDescription>
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
              Each country's form uses that country's government design system: GOV.UK, the U.S. Web Design System,
              the GC Design System and the Australian Government Design System. None carries government branding,
              because Kinderform is not a government service.
            </li>
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
