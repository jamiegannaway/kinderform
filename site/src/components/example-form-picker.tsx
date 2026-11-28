// /example-form: a world map with the countries that have an example form. Picking a
// country opens its form in a dialog (see reference-form/form-dialog.tsx), so the page itself
// never needs to scroll. Rendered at build time; the links work without JavaScript too.
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { FORM_COUNTRIES } from "@/components/reference-form/countries"
import { LAND, MAP, MAP_COUNTRIES } from "@/lib/world-map"
import { Tag } from "@/components/tag"

const href = (code: string) => `/example-form/${code}`

// Large countries carry their label in the middle. The European countries are too small, so
// their labels sit out at sea, joined to the country by a thin line (see tools/world_map.mjs).
const LABEL_ALIGN: Record<string, string> = {
  center: "-translate-x-1/2 -translate-y-1/2",
  right: "-translate-x-full -translate-y-1/2",
  left: "-translate-y-1/2",
}
// "The United Kingdom, the United States, Canada and Spain": country names in a sentence.
function names(list: readonly { name: string }[]) {
  const named = list.map((c) => (c.name.startsWith("United") ? `the ${c.name}` : c.name))
  const text = named.length < 2 ? named.join("") : `${named.slice(0, -1).join(", ")} and ${named.at(-1)}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function WorldMap() {
  // The map keeps its shape (MAP.height / MAP.width = 0.436) and fits the space left on the
  // screen, using container query units. The labels sit over the map at fixed shares of its size.
  return (
    <div className="relative min-h-0 flex-1 [container-type:size]">
      <p className="sr-only">World map. {names(FORM_COUNTRIES)} are highlighted. Choose a country from the list below.</p>
      <div className="absolute inset-0 m-auto h-[min(100cqh,calc(100cqw*0.436))] w-[min(100cqw,calc(100cqh/0.436))]">
        <svg
          viewBox={`0 0 ${MAP.width} ${MAP.height}`}
          className="size-full"
          aria-hidden="true"
          focusable="false"
        >
          <path d={LAND} className="fill-muted stroke-background" strokeWidth={0.6} />
          {MAP_COUNTRIES.map((c) =>
            c.line ? (
              <line
                key={`line-${c.code}`}
                x1={c.line[0]}
                y1={c.line[1]}
                x2={c.line[2]}
                y2={c.line[3]}
                className="stroke-muted-foreground"
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
                aria-hidden="true"
              />
            ) : null,
          )}
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
            className={`absolute ${c.pos} ${LABEL_ALIGN[c.align]} hidden rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground sm:block`}
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
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1 basis-96 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Tag tone="blue">Draft 0.1</Tag>
              <Tag tone="amber">Not real forms</Tag>
            </div>
            <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight md:text-4xl">Example enquiry forms</h1>
            <p className="max-w-3xl text-muted-foreground md:text-lg">
              Pick a country to try its form, styled with that country’s public design system. Nothing you enter
              is sent or stored.
            </p>
          </div>
          <Button asChild variant="outline">
            <a href={open ? `/build/${open}` : "/build"}>Use this form in my organisation</a>
          </Button>
        </div>

        <WorldMap />

        <nav aria-label="Example forms by country" className="shrink-0">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
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
          No cookies and no tracking.
          <span aria-hidden="true"> · </span>
          Does a form read well in your language?{" "}
          <a
            href="mailto:jamie.gannaway@gmail.com?subject=Example%20form%20wording"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Tell us
          </a>
        </p>
        <noscript>
          <p className="text-sm">These examples need JavaScript. A real form built to the Kinderform standard should work without it.</p>
        </noscript>
      </main>
      <div id="kf-dialog-root" data-open={open ?? ""} />
    </div>
  )
}
