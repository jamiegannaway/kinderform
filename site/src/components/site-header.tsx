import { CodeXml, Menu, Moon, Sun, X } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"

export const REPO_URL = "https://github.com/jamiegannaway/kinderform"

// The main pages, in the order a service would want them. The logo is the link home.
const TABS = [
  { href: "/for-services", label: "For services" },
  { href: "/example-form", label: "Example forms" },
  { href: "/build", label: "Build a form" },
  { href: "/form-check", label: "Form check" },
  { href: "/research", label: "Research" },
  { href: "/compare", label: "Compare" },
]
const CONTACT = { href: "/#get-involved", label: "Get in touch" }

// Light or dark, in the shadcn/ui toggle group look. public/theme.js does the switching and
// sets aria-pressed. Which button looks selected comes from <html data-theme>, which that
// script sets before the page is drawn, so the control never shows the wrong state. It stays
// hidden when JavaScript is off (<html data-js> is missing), because it could not work.
// The words "Light" and "Dark" show from the 2xl width; below that the icons carry them.
const THEMES = [
  { value: "light", label: "Light", Icon: Sun, on: "bg-primary text-primary-foreground dark:bg-transparent dark:text-muted-foreground" },
  { value: "dark", label: "Dark", Icon: Moon, on: "dark:bg-primary dark:text-primary-foreground" },
] as const

export function ThemeSwitch({ className = "" }: { className?: string }) {
  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={`hidden items-center gap-0.5 rounded-md border bg-background p-0.5 shadow-xs [html[data-js]_&]:inline-flex ${className}`}
    >
      {THEMES.map(({ value, label, Icon, on }) => (
        <button
          key={value}
          type="button"
          data-theme-choice={value}
          aria-pressed={value === "light"}
          title={label}
          className={`inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 2xl:px-2.5 ${on}`}
        >
          <Icon className="size-4" aria-hidden="true" />
          <span className="sr-only 2xl:not-sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}

function NavLinks({ current, stacked = false }: { current: string; stacked?: boolean }) {
  const items = stacked ? [...TABS, CONTACT] : TABS
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
// far to trust it and where to send comments.
function DraftBanner() {
  return (
    <div className="bg-tag-blue text-tag-blue-foreground">
      <p className="mx-auto max-w-6xl px-6 py-2 text-center text-sm font-medium">
        First draft – feedback welcome.{" "}
        <a href="/about" className="underline underline-offset-4">
          Who made this, and how far to trust it
        </a>
      </p>
    </div>
  )
}

// One row at every width. From the xl width the links sit in the row. Below it they open from a
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
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
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
          <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex">
            <a href={CONTACT.href}>{CONTACT.label}</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={REPO_URL} title="The code, data and research on GitHub">
              <CodeXml aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">GitHub</span>
              <span className="sr-only">: Kinderform's code and data</span>
            </a>
          </Button>
          <ThemeSwitch />
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
      </header>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl space-y-2 px-6 py-8 text-sm text-muted-foreground">
        <p>
          <a href="/about" className="font-medium text-foreground underline underline-offset-4">
            About
          </a>
          : who made this, and how far to trust it.
        </p>
        <p>
          <a href="/research/log" className="font-medium text-foreground underline underline-offset-4">
            Research log
          </a>
          : what each piece of research could mean for the project.
        </p>
        <p>
          <a href={REPO_URL} className="font-medium text-foreground underline underline-offset-4">
            Kinderform on GitHub
          </a>
          : our code, data and research, free for anyone to use.
        </p>
        <p>
          This site sets no cookies, does not track you and loads nothing from other sites. A dark mode choice
          stays on your device.
        </p>
        <p>
          Code: MIT licence. Writing and data:{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="font-medium text-foreground underline underline-offset-4"
          >
            CC BY 4.0
          </a>
          . Design:{" "}
          <a href="https://ui.shadcn.com" className="font-medium text-foreground underline underline-offset-4">
            shadcn/ui
          </a>
          . Drawings: Notioly, under a paid licence, so you cannot reuse them.
        </p>
      </div>
    </footer>
  )
}
