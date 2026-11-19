// /example-form: a world map with the four countries that have an example form. Picking a
// country opens its form in a dialog (see reference-form/form-dialog.tsx), so the page itself
// never needs to scroll. Rendered at build time; the links work without JavaScript too.
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { FORM_COUNTRIES } from "@/components/reference-form/countries"
import { LAND, MAP, MAP_COUNTRIES } from "@/lib/world-map"

const href = (code: string) => `/example-form/${code}`

// Labels are centred on each country, except the UK's, which starts just to its right so the
// small highlighted shape stays visible.
const LABEL_ALIGN: Record<string, string> = {
  uk: "translate-x-3 -translate-y-1/2",
}

function WorldMap() {
  // The map keeps its shape (MAP.height / MAP.width = 0.436) and fits the space left on the
  // screen, using container query units. The labels sit over the map at fixed shares of its size.
  return (
    <div className="relative min-h-0 flex-1 [container-type:size]">
      <div className="absolute inset-0 m-auto h-[min(100cqh,calc(100cqw*0.436))] w-[min(100cqw,calc(100cqh/0.436))]">
        <svg
          viewBox={`0 0 ${MAP.width} ${MAP.height}`}
          className="size-full"
          role="img"
          aria-label="World map. The United Kingdom, the United States, Canada and Australia are highlighted."
        >
          <path d={LAND} className="fill-muted stroke-background" strokeWidth={0.6} />
          {MAP_COUNTRIES.map((c) => (
            <a key={c.code} href={href(c.code)} data-country={c.code} tabIndex={-1} aria-hidden="true" className="group">
              <path
                d={c.d}
                className="fill-primary/60 stroke-background transition-colors group-hover:fill-primary"
                strokeWidth={0.6}
              />
            </a>
          ))}
        </svg>
        {MAP_COUNTRIES.map((c) => (
          <a
            key={c.code}
            href={href(c.code)}
            data-country={c.code}
            tabIndex={-1}
            aria-hidden="true"
            className={`absolute ${c.pos} ${LABEL_ALIGN[c.code] ?? "-translate-x-1/2 -translate-y-1/2"} hidden rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground sm:block md:px-3 md:py-1 md:text-sm`}
          >
            {c.name}
          </a>
        ))}
      </div>
    </div>
  )
}

export function ExampleFormPicker({ open }: { open: string | null }) {
  return (
    <div className="flex h-dvh flex-col">
      {/* A wrapper so the header spans the width: in a flex column, its auto margins would shrink it. */}
      <div className="shrink-0">
        <SiteHeader current="/example-form" />
      </div>
      <main id="main" className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 px-6 pb-4">
        <div className="shrink-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Reference forms, draft 0.1</Badge>
            <Badge variant="outline">Not real forms</Badge>
          </div>
          <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight md:text-4xl">Example enquiry forms</h1>
          <p className="max-w-3xl text-muted-foreground md:text-lg">
            Pick a country to try its example form. Each asks the same few questions, in that country's government
            design system, without government branding. Nothing you enter is sent or stored.
          </p>
        </div>

        <WorldMap />

        <nav aria-label="Example forms by country" className="shrink-0">
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {FORM_COUNTRIES.map((c) => (
              <li key={c.code}>
                <a
                  href={href(c.code)}
                  data-country={c.code}
                  aria-current={open === c.code ? "page" : undefined}
                  className="flex h-full flex-col rounded-lg border bg-card px-3 py-2 transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.short}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="shrink-0 text-xs text-muted-foreground">
          <a href="#how-built" data-about className="font-medium text-foreground underline underline-offset-4">
            How the forms are built
          </a>
          <span aria-hidden="true"> · </span>
          This site sets no cookies and does not track you.
        </p>
        <noscript>
          <p className="text-sm">These examples need JavaScript. A real form built to the Kinderform standard should work without it.</p>
        </noscript>
      </main>
      <div id="kf-dialog-root" data-open={open ?? ""} />
    </div>
  )
}
