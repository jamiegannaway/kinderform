import { Button } from "@/components/ui/button"

const TABS = [
  { href: "/", label: "Home" },
  { href: "/form-check", label: "Form check" },
  { href: "/example-form", label: "Example form" },
  { href: "/research", label: "Research" },
]

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
        <nav aria-label="Main">
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
        <p>This site sets no cookies, does not track you and loads nothing from other sites.</p>
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
