import { ArrowUpRight, Mail } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SiteFooter, SiteHeader } from "@/components/site-header"

const SOURCE_URL =
  "https://assets.publishing.service.gov.uk/media/6982286fe833d031a3158ff1/Renewing_Fostering_-_homes_for_10_000_more_children_-_February_2026_Print_ready.pdf"

const nations = [
  { name: "England", href: "https://www.gov.uk/apply-foster-child-council" },
  { name: "Wales", href: "https://fosterwales.gov.wales/" },
  { name: "Scotland", href: "https://www.mygov.scot/foster-care/become-foster-carer" },
  { name: "Northern Ireland", href: "https://adoptionandfostercare.hscni.net/" },
]

const making = [
  {
    title: "An open standard for enquiries",
    status: "Draft 0.1",
    body: "A shared description of what an enquiry record holds, so any council, hub or agency can see how quickly people hear back. It holds no names and nothing about children, and it works with whatever form or case system a service already uses.",
  },
  {
    title: "A picture of fostering front doors",
    status: "Method in draft",
    body: "A register of where people enquire across the UK, and a record of what each form asks and promises. It looks at pages and processes from the side of the person enquiring. Each service sees its own results first.",
  },
  {
    title: "The evidence",
    status: "Growing",
    body: "A living library of research on how people come to foster and adopt, why some stop along the way, and why carers stay.",
  },
]

const principles = [
  ["About adults who offer to care.", "Never children's records, and never decisions about children."],
  ["No real personal data.", "Every example is made up."],
  ["Nothing scores people.", "No tool here ranks, screens or predicts anyone who enquires."],
  ["Pages and processes, not staff.", "Recruitment teams are small and stretched, and they are not the problem."],
  ["Method first, then findings.", "Each service sees its own results privately, with time to reply, before anything is named."],
  ["Free and open.", "Everything is openly licensed, so anyone can use it without asking."],
]

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="py-12 md:py-16">
      <h2 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

/* A made-up enquiry and the reply it deserves. It is an illustration:
   inert, so it cannot be focused or filled in, and described by its caption. */
function Exchange() {
  return (
    <figure aria-labelledby="exchange-caption" className="w-full max-w-md justify-self-center md:justify-self-end">
      <div inert aria-hidden="true" className="grid gap-3">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Ask about fostering</CardTitle>
            <CardDescription>Sent Tuesday, 7.42pm</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ex-name">Your name</Label>
              <Input id="ex-name" defaultValue="Sam Example" readOnly tabIndex={-1} />
            </div>
            <div className="grid gap-2">
              <Label>What would help most?</Label>
              <div className="flex items-center gap-2 text-sm">
                <span className="grid size-4 place-items-center rounded-full border border-primary">
                  <span className="size-2 rounded-full bg-primary" />
                </span>
                A chat first
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-4 rounded-full border border-input" />
                I'm ready to apply
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ex-time">Best time to call</Label>
              <Input id="ex-time" defaultValue="Weekday evenings" readOnly tabIndex={-1} />
            </div>
          </CardContent>
        </Card>

        <Card className="ml-8 gap-3 border-transparent bg-primary py-5 text-primary-foreground md:ml-12">
          <CardHeader>
            <CardDescription className="text-primary-foreground/70">Reply Wednesday, 9.10am</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            Hi Sam, thanks for getting in touch. You said evenings suit you, so I'll ring tomorrow
            between 6 and 7pm. There's nothing to prepare. It's just a chat.
          </CardContent>
          <CardFooter className="text-sm text-primary-foreground/70">Ali, fostering team</CardFooter>
        </Card>
      </div>
      <figcaption id="exchange-caption" className="mt-4 text-sm text-muted-foreground">
        An example of a quick, kind and considered reply: Sam enquires on Tuesday evening and hears
        back the next morning, with a call at the time Sam asked for. Sam and Ali are made up, and
        this is not a real form.
      </figcaption>
    </figure>
  )
}

export default function Landing() {
  return (
    <>
      <SiteHeader current="/" />

      <main id="main">
        <section
          aria-labelledby="hero-title"
          className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-8 pb-16 md:grid-cols-[1.1fr_0.9fr] md:pt-16 md:pb-24"
        >
          <div>
            <Badge variant="secondary">Early days: drafts shared for comment</Badge>
            <h1
              id="hero-title"
              className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance lg:text-5xl"
            >
              Everyone who offers to care for a child deserves a quick, kind and considered reply.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-muted-foreground">
              Kinderform is a free, open project to make the first step of fostering and adoption
              kinder. It gives councils, hubs and agencies shared tools to reply well to the people
              who enquire.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#get-involved">Get involved</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#making">What we are making</a>
              </Button>
            </div>
          </div>
          <Exchange />
        </section>

        <div className="mx-auto max-w-6xl px-6">
          <Alert>
            <AlertTitle>Thinking of fostering or adopting?</AlertTitle>
            <AlertDescription>
              <p>
                Kinderform is not a fostering or adoption service and cannot take enquiries. Please
                contact your local council.
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                {nations.map((n) => (
                  <li key={n.name}>
                    <a
                      href={n.href}
                      className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
                    >
                      {n.name}
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <Section id="why-title" title="Interest is not the problem">
            <div className="max-w-2xl space-y-4 leading-7">
              <p>
                In England in 2024–25 there were almost 150,000 enquiries about fostering, and 7,365
                newly approved foster carers. Some people enquire more than once, and services count
                enquiries in different ways, so the gap is not exact. But the government's own plan
                for fostering says plainly that interest is not the problem. People who offer to help
                can wait weeks or months for a reply.
              </p>
              <p>
                Nobody designs it that way. Recruitment teams are small and stretched, systems differ
                from place to place, and there is no shared way to see how long people wait. That
                part can be fixed, and it is the part Kinderform works on.
              </p>
              <p className="text-sm text-muted-foreground">
                Source: Department for Education,{" "}
                <a href={SOURCE_URL} className="font-medium text-foreground underline underline-offset-4">
                  Renewing Fostering
                </a>
                , February 2026, page 14. Checked 14 November 2026.
              </p>
            </div>
          </Section>

          <Separator />

          <Section id="making" title="What we are making">
            <div className="grid gap-6 md:grid-cols-3">
              {making.map((m) => (
                <Card key={m.title}>
                  <CardHeader>
                    <CardTitle className="leading-snug">{m.title}</CardTitle>
                    <CardAction>
                      <Badge variant="outline">{m.status}</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">{m.body}</CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Separator />

          <Section id="how-title" title="How we work">
            <ul className="grid max-w-4xl gap-x-10 gap-y-5 md:grid-cols-2">
              {principles.map(([head, body]) => (
                <li key={head} className="border-l-2 pl-4">
                  <p className="font-medium">{head}</p>
                  <p className="text-muted-foreground">{body}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Separator />

          <Section id="who-title" title="Who is behind this">
            <div className="max-w-2xl space-y-4 leading-7">
              <p>
                Kinderform was started by Jamie Gannaway, co-founder of Deployed, which builds intake
                and routing systems for large organisations. This project gives that experience to the
                fostering and adoption sector for free.
              </p>
              <p>It is not a Deployed product, it is not commercial, and it will never be a sales channel.</p>
            </div>
          </Section>

          <Separator />

          <section id="get-involved" aria-labelledby="involve-title" className="py-12 md:py-16">
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle id="involve-title" className="text-2xl">
                  Get involved
                </CardTitle>
                <CardDescription className="text-base">
                  We would especially like to hear from foster carers and adopters about their first
                  contact, from people who have been in care, from recruitment teams in councils, hubs
                  and agencies, and from developers who build public-service forms.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <a href="mailto:hello@kinderform.org">
                    <Mail aria-hidden="true" />
                    Email hello@kinderform.org
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
