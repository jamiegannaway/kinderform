import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

const TABS = [
  { href: "/", label: "Home" },
  { href: "/for-services", label: "For services" },
  { href: "/form-check", label: "Form check" },
  { href: "/example-form", label: "Example form" },
  { href: "/research", label: "Research" },
  { href: "/compare", label: "Compare" },
]

// Light or dark, in the shadcn/ui toggle group look. public/theme.js does the switching and
// sets aria-pressed. Which button looks selected comes from <html data-theme>, which that
// script sets before the page is drawn, so the control never shows the wrong state. It stays
// hidden when JavaScript is off (<html data-js> is missing), because it could not work.
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
          className={`inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 ${on}`}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}

export function SiteHeader({ current }: { current: string }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
        <a href="/" className="text-lg font-semibold tracking-tight" aria-label="Kinderform home">
          kinderform
        </a>
        <ThemeSwitch className="md:order-last" />
        <nav aria-label="Main" className="w-full md:ml-auto md:w-auto">
          <ul className="flex flex-wrap items-center gap-1">
            {TABS.map((t) => {
              const active = t.href === current
              return (
                <li key={t.href}>
                  <Button asChild variant={active ? "secondary" : "ghost"} size="sm">
                    <a href={t.href} aria-current={active ? "page" : undefined}>
                      {t.label}
                    </a>
                  </Button>
                </li>
              )
            })}
            <li>
              <Button asChild variant="ghost" size="sm">
                <a href="/#get-involved">Get in touch</a>
              </Button>
            </li>
          </ul>
        </nav>
      </header>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl space-y-2 px-6 py-8 text-sm text-muted-foreground">
        <p>
          <a href="/research/log" className="font-medium text-foreground underline underline-offset-4">
            Research log
          </a>
          : each piece of research we have done, and what it could mean for the project.
        </p>
        <p>
          This site sets no cookies, does not track you and loads nothing from other sites. If you choose dark mode,
          your browser remembers it on this device only.
        </p>
        <p>
          Our code is under the MIT licence. Our writing and data are under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="font-medium text-foreground underline underline-offset-4"
          >
            CC BY 4.0
          </a>
          . We built the site with the{" "}
          <a href="https://ui.shadcn.com" className="font-medium text-foreground underline underline-offset-4">
            shadcn/ui
          </a>{" "}
          design system.
        </p>
        <p>
          The drawings are by Notioly. We use them under a paid licence, so they are not openly licensed
          and you cannot reuse them.
        </p>
      </div>
    </footer>
  )
}
