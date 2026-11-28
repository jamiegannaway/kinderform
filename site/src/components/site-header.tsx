import { CodeXml, Menu, MessageCircle, Moon, Sun, X } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export const REPO_URL = "https://github.com/jamiegannaway/kinderform"
// The project's WhatsApp community, where services and carers can say what they need. A plain link:
// the site loads nothing from WhatsApp.
export const COMMUNITY_URL = "https://chat.whatsapp.com/D7JeyNvLvtT8QIUAetXgzY"
// The project's research, loaded into a Gemini Notebook (Google) so people can ask questions about
// it. A plain link: the site loads nothing from Google.
export const NOTEBOOK_URL = "https://notebook.google.com/notebook/7990cbcd-38ea-45a7-b56e-681c86e81e74"

// The main pages, in the order a service would want them. The logo is the link home.
const TABS = [
  { href: "/for-services", label: "For services" },
  { href: "/example-form", label: "Example forms" },
  { href: "/form-check", label: "Form check" },
  { href: "/research", label: "Research" },
  { href: "/compare", label: "Compare" },
]
// The one main action, with the same words as the home page's main button. On wide screens it is
// the only solid button in the bar; in the Menu on smaller screens it is the first item.
const ACTION = { href: "/build", label: "Get the starter kit" }
const CONTACT = { href: "/#get-involved", label: "Get in touch" }

// Light or dark, in the shadcn/ui toggle group look: the chosen one has the quiet accent
// background, so the switch does not compete with the main action. public/theme.js does the
// switching and sets aria-pressed. Which button looks selected comes from <html data-theme>, which
// that script sets before the page is drawn, so the control never shows the wrong state. It stays
// hidden when JavaScript is off (<html data-js> is missing), because it could not work.
// The icons carry the choice; the words "Light" and "Dark" are there for screen readers and as the
// tooltip, so the bar has room for the main action.
const THEMES = [
  { value: "light", label: "Light", Icon: Sun, on: "bg-accent text-accent-foreground dark:bg-transparent dark:text-muted-foreground" },
  { value: "dark", label: "Dark", Icon: Moon, on: "dark:bg-accent dark:text-accent-foreground" },
] as const

export function ThemeSwitch({ className = "" }: { className?: string }) {
  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={`hidden items-center gap-0.5 rounded-md border bg-background p-0.5 [html[data-js]_&]:inline-flex ${className}`}
    >
      {THEMES.map(({ value, label, Icon, on }) => (
        <button
          key={value}
          type="button"
          data-theme-choice={value}
          aria-pressed={value === "light"}
          title={label}
          className={`inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 ${on}`}
        >
          <Icon className="size-4" aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}

function NavLinks({ current, stacked = false }: { current: string; stacked?: boolean }) {
  const items = stacked ? [ACTION, ...TABS, CONTACT] : TABS
  return (
    <ul className={stacked ? "grid gap-1" : "flex items-center gap-1"}>
      {items.map((t) => {
        const active = t.href === current
        return (
          <li key={t.href}>
            <Button
              asChild
              variant={active ? "secondary" : "ghost"}
              size="sm"
              className={stacked ? "w-full justify-start" : undefined}
            >
              <a href={t.href} aria-current={active ? "page" : undefined}>
                {t.label}
              </a>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

// A strip above the header on every page, in the blue tag colours (a draft or information), saying
// that the site is a first draft. It links to the About page, which says who made the site, how
// it was made and where to send comments. It is an <aside> with a name, so screen readers find it
// as a landmark and no content sits outside one.
function DraftBanner() {
  return (
    <aside aria-label="About this draft" className="bg-tag-blue text-tag-blue-foreground">
      <p className="mx-auto max-w-6xl px-6 py-2 text-center text-sm font-medium">
        First draft – feedback welcome.{" "}
        <a href="/about" className="underline underline-offset-4">
          Who made this, and how
        </a>
      </p>
    </aside>
  )
}

// One row at every width, with a line under it so it reads as a bar. From the xl width it has
// three parts: the pages on the left, the quiet links (get in touch, GitHub, light or dark) on the
// right, and after a divider the one main action. Below xl the pages and the action open from a
// Menu button, built on <details> so it works without JavaScript, in the shadcn/ui dropdown look.
export function SiteHeader({ current }: { current: string }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <DraftBanner />
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
          <a
            href="/"
            className="mr-2 text-lg font-semibold tracking-tight"
            aria-label="Kinderform home"
            aria-current={current === "/" ? "page" : undefined}
          >
            kinderform
          </a>
          <nav aria-label="Main" className="hidden xl:block">
            <NavLinks current={current} />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground xl:inline-flex">
              <a href={CONTACT.href}>{CONTACT.label}</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <a href={REPO_URL} title="The code, data and research on GitHub">
                <CodeXml aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">GitHub</span>
                <span className="sr-only">: Kinderform's code and data</span>
              </a>
            </Button>
            <ThemeSwitch />
            <Separator orientation="vertical" className="mx-1 hidden data-[orientation=vertical]:h-5 xl:block" />
            <Button asChild size="sm" className="hidden xl:inline-flex">
              <a href={ACTION.href} aria-current={current === ACTION.href ? "page" : undefined}>
                {ACTION.label}
              </a>
            </Button>
            <details className="group relative xl:hidden">
              <summary
                className={`${buttonVariants({ variant: "outline", size: "sm" })} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
              >
                <Menu className="group-open:hidden" aria-hidden="true" />
                <X className="hidden group-open:block" aria-hidden="true" />
                Menu
              </summary>
              <nav
                aria-label="Main"
                className="absolute top-full right-0 z-50 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
              >
                <NavLinks current={current} stacked />
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  )
}

// The footer on every page, on the light grey of the theme's muted colour so it reads as the end
// of the page. Three short parts: the community, with a QR code for people reading on a computer;
// the project's pages and the legal pages as plain lists; and one line on privacy and licences,
// with the detail left to the pages it links to. The QR code is a plain SVG made from COMMUNITY_URL
// (public/images/community-qr.svg says how to remake it). It stays dark on white in dark mode, so
// phones can read it.
const PROJECT_LINKS = [
  { href: "/about", label: "About" },
  { href: "/about#find-a-service", label: "Find a fostering or adoption service" },
  { href: "/research/log", label: "Research log" },
  { href: NOTEBOOK_URL, label: "Ask the research (Google\u2019s AI)" },
  { href: REPO_URL, label: "Code and data on GitHub" },
  { href: "/build/data-handling", label: "Data handling layer (draft)" },
]
const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
  { href: "/licences", label: "Licences" },
]

function FooterList({ id, title, links }: { id: string; title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="font-medium text-foreground">
        {title}
      </h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="text-foreground underline-offset-4 hover:underline">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function SiteFooter() {
  const link = "font-medium text-foreground underline underline-offset-4"
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <section aria-labelledby="footer-community" className="flex max-w-md items-start gap-5">
            {/* Hidden on phones: you cannot scan the screen you are reading. */}
            <img
              src="/images/community-qr.svg"
              alt="QR code that opens the Kinderform community on WhatsApp"
              width={96}
              height={96}
              className="hidden size-24 shrink-0 rounded-md bg-white p-1.5 ring-1 ring-border md:block"
            />
            <div className="space-y-3">
              <h2 id="footer-community" className="font-medium text-foreground">
                What do you really need?
              </h2>
              <p className="leading-6">
                Tell us in the Kinderform community on WhatsApp, for people who work in fostering and adoption
                services.
              </p>
              <Button asChild size="sm">
                <a href={COMMUNITY_URL}>
                  <MessageCircle aria-hidden="true" />
                  Join on WhatsApp
                </a>
              </Button>
              <p className="text-xs leading-5">
                Other members may see your phone number. Do not share any information about children.{" "}
                <a href="/privacy#whatsapp" className={link}>
                  How we use what you share
                </a>
              </p>
            </div>
          </section>
          {/* The link lists, with the site note at the bottom, level with the community note. w-0 and
              min-w-full stop the note from widening the link columns. */}
          <div className="flex flex-col justify-between gap-8 md:gap-6">
            <div className="grid gap-8 md:grid-cols-[auto_auto] md:gap-16">
              <FooterList id="footer-project" title="Kinderform" links={PROJECT_LINKS} />
              <FooterList id="footer-legal" title="Legal" links={LEGAL_LINKS} />
            </div>
            <p className="text-xs leading-5 md:w-0 md:min-w-full">
              We do not use cookies or track you, and we load nothing from other sites. Code: MIT. Writing and
              data:{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/" className={link}>
                CC BY 4.0
              </a>
              . Design:{" "}
              <a href="https://ui.shadcn.com" className={link}>
                shadcn/ui
              </a>
              . Drawings: Notioly, not free to reuse.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
