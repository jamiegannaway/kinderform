import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SiteFooter, SiteHeader } from "@/components/site-header"

type Variant = "uk" | "us"

const VERSIONS: { v: Variant; href: string; label: string; system: string }[] = [
  { v: "uk", href: "/example-form", label: "UK version", system: "patterns from the GOV.UK Design System" },
  { v: "us", href: "/example-form/us", label: "US version", system: "the U.S. Web Design System" },
]

export function ExampleIntro({ variant }: { variant: Variant }) {
  const current = VERSIONS.find((x) => x.v === variant)!
  return (
    <>
      <SiteHeader current="/example-form" />
      <section aria-labelledby="ef-title" className="mx-auto max-w-6xl px-6 pt-8 pb-8 md:pt-14">
        <Badge variant="secondary">Reference form, draft 0.1</Badge>
        <h1 id="ef-title" className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Example enquiry form
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
          This form shows our open standard for enquiries in use. It asks only what a fostering or adoption
          service needs to reply quickly and kindly. It asks nothing about health, home, money or family.
        </p>
        <nav aria-label="Form versions" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {VERSIONS.map((x) => (
              <li key={x.v}>
                <Button asChild variant={x.v === variant ? "default" : "outline"}>
                  <a href={x.href} aria-current={x.v === variant ? "page" : undefined}>
                    {x.label}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <Alert className="mt-6 max-w-3xl">
          <AlertTitle>This is not a real form</AlertTitle>
          <AlertDescription>
            Nothing you enter is sent or stored. This version uses {current.system}. It carries no
            government branding, because Kinderform is not a government service.
          </AlertDescription>
        </Alert>
      </section>
    </>
  )
}

export function ExampleOutro() {
  return (
    <>
      <section aria-labelledby="ef-how" className="mx-auto max-w-6xl px-6 py-12">
        <h2 id="ef-how" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          How the form is built
        </h2>
        <ul className="mt-6 ml-5 max-w-2xl list-disc space-y-3 leading-7">
          <li>
            The questions and rules come from one schema: a file that describes what the record holds. The same schema
            checks the record before the last page.
          </li>
          <li>The wording is in a separate file for each country. A service can change it without changing any code.</li>
          <li>
            You can always tell when you move to a new question. Every page says where you are, and the new question
            slides in. Keyboard and screen reader focus moves to it. There is always a way back.
          </li>
          <li>
            Each page asks one question. At the end, a page lets you check your answers. When something needs fixing, a
            clear error message appears at the top.
          </li>
        </ul>
      </section>
      <SiteFooter />
    </>
  )
}
