// /example-form/<country>: one country's example enquiry form, with a switch between the country's
// own design system and the neutral design, facts about the design system, the two downloads and
// a link to the starter kit. Rendered at build time with shadcn/ui; only the form itself runs in the
// browser (reference-form/mount-page.tsx, which also shows the parts for the form's language).
//
// The design switch is two links: none for the country's design, ?design=neutral for the neutral
// one, so a choice can be shared. public/example-form.js marks <html data-design="neutral"> before
// the page is drawn, and the [html[data-design=neutral]_&] classes below show the matching state.
import { ArrowLeft, ArrowRight, Download } from "lucide-react"

import { SiteFooter, SiteHeader } from "@/components/site-header"
import { Tag } from "@/components/tag"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { DESIGN_SYSTEMS, NEUTRAL, type DesignSystem } from "@/lib/design-systems"
import { formatSize, type Download as File, type ExampleForm } from "@/lib/example-forms"

const LINK = "font-medium text-foreground underline underline-offset-4 hover:decoration-2"
// When the neutral design is shown, or not: the attribute public/example-form.js sets.
const IF_NEUTRAL_HIDE = "[html[data-design=neutral]_&]:hidden"
const IF_NEUTRAL_SHOW = "hidden [html[data-design=neutral]_&]:block"

// The shadcn/ui Tabs look (TabsList and TabsTrigger), on links.
const TABS = "inline-flex h-9 w-fit max-w-full items-center rounded-lg bg-muted p-[3px] text-muted-foreground"
const TAB =
  "inline-flex h-full min-w-0 items-center justify-center rounded-md border border-transparent px-3 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-muted-foreground"
const TAB_ON = "bg-background shadow-sm dark:border-input dark:bg-input/30 dark:text-foreground"
const TAB_LANG =
  "aria-[current=true]:bg-background aria-[current=true]:shadow-sm dark:aria-[current=true]:border-input dark:aria-[current=true]:bg-input/30 dark:aria-[current=true]:text-foreground"

function DesignSwitch({ code, system }: { code: string; system: DesignSystem }) {
  const base = `/example-form/${code}`
  // Two copies, one for each choice, so the chosen link carries aria-current="page" from the start.
  const tabs = (on: "national" | "neutral", className: string) => (
    <nav aria-label="Form design" className={className}>
      <div className={TABS}>
        <a href={base} data-design-link className={`${TAB} ${on === "national" ? TAB_ON : ""}`} aria-current={on === "national" ? "page" : undefined}>
          <span className="truncate">{system.short}</span>
        </a>
        <a href={`${base}?design=neutral`} data-design-link className={`${TAB} ${on === "neutral" ? TAB_ON : ""}`} aria-current={on === "neutral" ? "page" : undefined}>
          Neutral
        </a>
      </div>
    </nav>
  )
  return (
    <>
      {tabs("national", IF_NEUTRAL_HIDE)}
      {tabs("neutral", IF_NEUTRAL_SHOW)}
    </>
  )
}

function LanguageSwitch({ form }: { form: ExampleForm }) {
  if (form.variants.length < 2) return null
  return (
    <nav aria-label="Form language">
      <div className={TABS}>
        {form.variants.map((v, i) => (
          <a
            key={v.key}
            href={i === 0 ? `/example-form/${form.code}` : `/example-form/${form.code}?lang=${v.lang}`}
            data-lang-link={v.lang}
            lang={v.locale}
            aria-current={i === 0 ? "true" : undefined}
            className={`${TAB} ${TAB_LANG}`}
          >
            {v.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="text-sm leading-6">{children}</dd>
    </div>
  )
}

function AboutSystem({ system }: { system: DesignSystem }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <h2 className="leading-none font-semibold">About this design system</h2>
        <CardDescription>{system.name}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <dl className="grid gap-3">
          <Fact term="Made by">{system.maker}</Fact>
          <Fact term="Licence">
            <a href={system.licence.url} className={LINK}>
              {system.licence.name}
            </a>
          </Fact>
          <Fact term="Typeface">{system.typeface}</Fact>
          <Fact term="What we left out">
            We left out {system.leftOut}. Kinderform is not a government service.
          </Fact>
        </dl>
        <a href={system.link.href} className={`${LINK} inline-flex items-center gap-1.5 text-sm`}>
          {system.link.text}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </CardContent>
    </Card>
  )
}

function AboutNeutral() {
  return (
    <Card className="gap-4">
      <CardHeader>
        <h2 className="leading-none font-semibold">About this design</h2>
        <CardDescription>{NEUTRAL.about}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <dl className="grid gap-3">
          <Fact term="Made by">{NEUTRAL.maker}</Fact>
          <Fact term="Licence">
            <a href={NEUTRAL.licence.url} className={LINK}>
              {NEUTRAL.licence.name}
            </a>
          </Fact>
          <Fact term="Typeface">{NEUTRAL.typeface}</Fact>
        </dl>
        <a href={NEUTRAL.link.href} className={`${LINK} inline-flex items-center gap-1.5 text-sm`}>
          {NEUTRAL.link.text}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </CardContent>
    </Card>
  )
}

function Downloads({ form, files }: { form: ExampleForm; files: Record<string, File[]> }) {
  const system = form.system ? DESIGN_SYSTEMS[form.system] : null
  return (
    <Card className="gap-4">
      <CardHeader>
        <h2 className="leading-none font-semibold">Download this form</h2>
        <CardDescription>
          Each download is one web page that works offline. It sends nothing. Test it with your service before you
          use it with real people.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {form.variants.map((v, i) => (
          <ul key={v.key} data-form-variant={v.key} hidden={i > 0} className="grid gap-2">
            {files[v.key].map((f) => (
              <li key={f.file}>
                <a
                  href={f.href}
                  download={f.file}
                  className="group flex items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <Download aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span className="grid gap-0.5">
                    <span className="font-medium underline-offset-4 group-hover:underline">
                      {f.label}
                      {form.variants.length > 1 ? ` in ${v.english}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">HTML{f.bytes ? `, ${formatSize(f.bytes)}` : ""}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ))}
        {system?.licence.copyleft && (
          <p className="text-xs leading-5 text-muted-foreground">
            The {system.short} version keeps its styles under the EUPL-1.2. The file says so, and links to their source.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function StarterKit({ form }: { form: ExampleForm }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <h2 className="leading-none font-semibold">Use this form in your service</h2>
        <CardDescription>
          The starter kit has the questions, the wording, a plain HTML form and made-up test cases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {form.variants.map((v, i) => (
          <a key={v.key} data-form-variant={v.key} hidden={i > 0} href={v.kit} className={buttonVariants({ variant: "outline" })}>
            {form.variants.length > 1 ? `Get the starter kit in ${v.english}` : "Get the starter kit"}
            <ArrowRight aria-hidden="true" />
          </a>
        ))}
      </CardContent>
    </Card>
  )
}

const HOW = [
  "The questions and rules come from one schema: a file that describes what the record holds. The same schema checks the record before the last page.",
  "The wording is in a separate file for each country. A service can change it without changing any code.",
  "Each form comes in its country’s public design system, where there is an open one, and in a neutral design. None carries government branding, because Kinderform is not a government service.",
  "Each page asks one question and says where you are. Focus moves to the new question, and there is always a way back.",
  "At the end, you can check your answers. When something needs fixing, an error message appears at the top.",
  "The forms ask nothing about health, home, money or family. They ask only what a service needs to reply quickly and kindly.",
]

export function ExampleFormPage({ form, files }: { form: ExampleForm; files: Record<string, File[]> }) {
  const system = form.system ? DESIGN_SYSTEMS[form.system] : null
  const variants = form.variants.map(({ key, lang }) => ({ key, lang }))
  // National designs keep their own light colours in both site themes; the neutral one follows the theme.
  const frame = system
    ? "bg-white text-black [html[data-design=neutral]_&]:bg-card [html[data-design=neutral]_&]:text-card-foreground"
    : "bg-card text-card-foreground"
  return (
    <>
      <SiteHeader current="/example-form" />
      <main id="main" className="mx-auto w-full max-w-6xl px-6 pt-6 pb-16 sm:pt-8">
        <a href="/example-form" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
          <ArrowLeft aria-hidden="true" className="size-4" /> All example forms
        </a>
        <div className="mt-5 flex flex-wrap gap-2">
          <Tag tone="blue">Draft 0.1</Tag>
          <Tag tone="amber">Not a real form</Tag>
          {form.variants.map((v, i) =>
            v.isEnglish ? null : (
              <span key={v.key} data-form-variant={v.key} hidden={i > 0}>
                <Tag tone="amber">Not yet reviewed by a native speaker</Tag>
              </span>
            ),
          )}
        </div>
        <h1 className="mt-3 scroll-m-20 text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
          Example enquiry form: {form.name}
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground md:text-lg">
          Try a first enquiry about fostering or adoption, as a service in {form.inSentence} might ask it. It is only
          an example, so nothing you enter is sent or stored.
        </p>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-label={`Example form for ${form.inSentence}`} className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {system && <DesignSwitch code={form.code} system={system} />}
              <LanguageSwitch form={form} />
            </div>
            {system ? (
              <>
                <p className={`mt-3 text-sm text-muted-foreground ${IF_NEUTRAL_HIDE}`}>
                  This is the {system.short} version, without government branding.
                </p>
                <p className={`mt-3 text-sm text-muted-foreground ${IF_NEUTRAL_SHOW}`}>
                  This is the neutral version: {NEUTRAL.about}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{form.neutralReason}</p>
            )}
            {/* Phones: the form uses the full width of the screen. overflow-clip, not hidden, so the
                Continue bar can still stick to the bottom of the screen (kf-form.css). */}
            <div className={`-mx-6 mt-4 overflow-clip border-y shadow-sm sm:mx-0 sm:rounded-xl sm:border ${frame}`}>
              <div
                id="kf-form-root"
                data-country={form.code}
                data-national={system ? "true" : "false"}
                data-variants={JSON.stringify(variants)}
              >
                <p className="p-5 md:p-8">Loading the form…</p>
                <noscript>
                  <p className="px-5 pb-5 md:px-8 md:pb-8">
                    This example needs JavaScript. A real form built to the Kinderform standard should work without it.
                  </p>
                </noscript>
              </div>
            </div>
          </section>

          <aside className="grid gap-6" aria-label="About this form">
            {/* The design on show comes first. */}
            {system && <div className={IF_NEUTRAL_SHOW}><AboutNeutral /></div>}
            {system ? <AboutSystem system={system} /> : <AboutNeutral />}
            <Downloads form={form} files={files} />
            <StarterKit form={form} />
          </aside>
        </div>

        <section aria-labelledby="how-built" className="mt-14 max-w-3xl">
          <h2 id="how-built" className="scroll-m-20 text-2xl font-semibold tracking-tight">
            How the example forms are built
          </h2>
          <ul className="mt-4 ml-6 list-disc space-y-2 leading-7">
            {HOW.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Does this form read well in your language?{" "}
            <a href="/#get-involved" className={LINK}>
              Tell us
            </a>
            . We do not use cookies or track you.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
