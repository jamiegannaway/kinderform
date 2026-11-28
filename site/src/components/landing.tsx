import { ArrowUpRight, CalendarCheck, Code, FileText, Mail, Send } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Illustration, type IllustrationName } from "@/components/illustration"
import { Tag } from "@/components/tag"
import { StepPath, StepsTheme } from "@/components/steps"
import { COUNTRY_ORDER, countryList } from "@/lib/compare"
import { steps } from "@/lib/steps"

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
    body: "A shared way to record enquiries, so services can measure how fast people hear back.",
  },
  {
    title: "A record of enquiry forms",
    status: "Method in draft",
    body: "What each enquiry form asks, and when it promises a reply.",
  },
  {
    title: "A library of research",
    status: "Growing",
    body: "Why people start, stop or stay in fostering and adoption.",
  },
]

const principles = [
  ["About adults who offer to care.", "No children's records, and no decisions about children."],
  ["No real personal data.", "Every example is made up."],
  ["Nothing scores people.", "No tool ranks or screens anyone."],
  ["Pages and processes, not staff.", "Teams are small and stretched, not the problem."],
  ["No public scores yet.", "No service gets a public score until it has seen its results and had time to correct them."],
]

function Section({
  id,
  title,
  art,
  children,
}: {
  id: string
  title: string
  art?: IllustrationName
  children: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className={`py-12 md:py-16 ${art ? "grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]" : ""}`}
    >
      <div className="min-w-0">
        <h2 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
      {/* On phones the drawing comes first, small; from the md width it sits beside the text. */}
      {art && <Illustration name={art} className="order-first w-36 md:order-none md:mx-auto md:w-full" />}
    </section>
  )
}

/* Under "What we are making": a made-up enquiry form, and the same enquiry as code (the record
   the Kinderform enquiry standard defines). Readers switch views with two radio buttons styled
   as shadcn Tabs: the stylesheet shows the chosen view, so it needs no JavaScript and works under
   the Content-Security-Policy. The form is an illustration: inert, so it cannot be filled in. */
const RECORD = `{
  "full_name": "Sam Example",
  "interest": "not_sure",
  "knows_child": false,
  "contact_method": "email",
  "email": "sam@example.org",
  "postcode_area": "ZZ99"
}`

const VIEW_TAB =
  "inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-3 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] dark:text-muted-foreground has-[:checked]:bg-background has-[:checked]:text-foreground has-[:checked]:shadow-sm has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 dark:has-[:checked]:border-input dark:has-[:checked]:bg-input/30"

function Choice({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${checked ? "" : "text-muted-foreground"}`}>
      {checked ? (
        <span className="grid size-4 place-items-center rounded-full border border-primary">
          <span className="size-2 rounded-full bg-primary" />
        </span>
      ) : (
        <span className="size-4 rounded-full border border-input" />
      )}
      {label}
    </div>
  )
}

function FormOrCode() {
  return (
    <figure aria-labelledby="form-example-caption" className="group/view w-full max-w-md justify-self-center md:justify-self-end">
      <fieldset className="mb-3 inline-flex h-9 w-fit items-center rounded-lg bg-muted p-[3px] text-muted-foreground">
        <legend className="sr-only">Show the example as</legend>
        <label className={VIEW_TAB}>
          <input type="radio" name="example-view" value="form" defaultChecked className="sr-only" />
          <FileText aria-hidden="true" className="size-4" />
          Form
        </label>
        <label className={VIEW_TAB}>
          <input type="radio" name="example-view" value="code" id="example-view-code" className="sr-only" />
          <Code aria-hidden="true" className="size-4" />
          Code
        </label>
      </fieldset>

      {/* Both views share one grid cell, so the box keeps the form's size and the page does not jump.
          The view not chosen is invisible (it still takes up its space) rather than removed. */}
      <div className="grid">
        <Card inert aria-hidden="true" className="col-start-1 row-start-1 min-w-0 gap-4 group-has-[#example-view-code:checked]/view:invisible">
          <CardHeader>
            <CardTitle>Ask about fostering or adoption</CardTitle>
            <CardDescription>It takes about 2 minutes</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ex-name">Full name</Label>
              <Input id="ex-name" defaultValue="Sam Example" readOnly tabIndex={-1} />
            </div>
            <div className="grid gap-2">
              <Label>What would you like to find out about?</Label>
              <Choice label="Fostering" />
              <Choice label="Adoption" />
              <Choice label="I'm not sure yet" checked />
            </div>
            <div className="grid gap-2">
              <Label>Are you asking about a child you already know?</Label>
              <div className="flex gap-6">
                <Choice label="Yes" />
                <Choice label="No" checked />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>How should we contact you?</Label>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Choice label="Email" checked />
                <Choice label="Phone call" />
                <Choice label="Text message" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ex-email">Email address</Label>
              <Input id="ex-email" defaultValue="sam@example.org" readOnly tabIndex={-1} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ex-postcode">First part of your postcode</Label>
              <Input id="ex-postcode" defaultValue="ZZ99" readOnly tabIndex={-1} className="w-28" />
            </div>
            <Button tabIndex={-1} className="w-fit">
              Send enquiry
            </Button>
          </CardContent>
        </Card>

        <Card className="invisible col-start-1 row-start-1 min-w-0 gap-0 overflow-hidden py-0 group-has-[#example-view-code:checked]/view:visible">
          <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
            <span className="font-mono">enquiry.json</span>
            <span>Kinderform enquiry standard, draft 0.1</span>
          </div>
          <pre tabIndex={0} className="flex-1 overflow-x-auto bg-muted/50 p-4 font-mono text-sm leading-6 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <code>{RECORD}</code>
          </pre>
        </Card>
      </div>

      <figcaption id="form-example-caption" className="mt-4 text-sm text-muted-foreground">
        A made-up enquiry form, and the same enquiry as a record in our open standard. It asks only what a service
        needs to reply. Sam is made up, and this is not a real form.
      </figcaption>
    </figure>
  )
}

/* The hero: a made-up reply, because the reply is what the page is about. A form here looked like
   somewhere to enquire, and Kinderform takes no enquiries. The three labelled parts are the Reply
   step in src/lib/steps.ts ("Say who will be in touch, when, and what happens next"), so the
   picture adds no new claim. The times stay vague on purpose: what a reply says has better
   evidence than how fast it arrives. Real text, not an image, so a screen reader reads it. */
const REPLY_PARTS = [
  ["Who", "I'm Alex, in the fostering and adoption team. I will be your contact."],
  ["When", "I will email you by Thursday."],
  ["What happens next", "We will pick a time for a first chat. You do not need to do anything until then."],
]

function Moment({ icon, what, when }: { icon: React.ReactNode; what: string; when: string }) {
  return (
    <li className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3 text-sm">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-background text-muted-foreground [&>svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-medium">{what}</span>
        <span className="block text-muted-foreground">{when}</span>
      </span>
    </li>
  )
}

// The short line that joins one moment to the next. Decoration only.
function Join() {
  return <li aria-hidden="true" className="ml-8 h-5 w-px bg-border" />
}

function ReplyExample() {
  return (
    <figure aria-labelledby="hero-example-caption" className="w-full max-w-md justify-self-center md:justify-self-end">
      <ol>
        <Moment icon={<Send aria-hidden="true" />} what="Sam asks about fostering or adoption" when="Monday morning" />
        <Join />
        <li>
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Example Council replies</CardTitle>
              <CardDescription>Monday afternoon</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="leading-7">Thank you for getting in touch, Sam.</p>
              <dl className="grid gap-4">
                {REPLY_PARTS.map(([part, words]) => (
                  <div key={part} className="border-l-2 border-primary pl-4">
                    <dt className="text-xs font-medium text-muted-foreground">{part}</dt>
                    <dd className="mt-1 leading-7">{words}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </li>
        <Join />
        <Moment icon={<CalendarCheck aria-hidden="true" />} what="Alex emails Sam, as promised" when="Thursday" />
      </ol>

      <figcaption id="hero-example-caption" className="mt-4 text-sm text-muted-foreground">
        A made-up reply, to show what we mean. It says who will be in touch, when, and what happens next. Sam, Alex
        and Example Council are not real.
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
            {/* On phones the hero's form example comes after the text, so a drawing opens the page. */}
            <Illustration name="notification" className="mb-6 w-36 md:hidden" />
            <Tag tone="blue">Early days: drafts for comment</Tag>
            <h1
              id="hero-title"
              className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight text-balance lg:text-5xl"
            >
              Everyone who offers to care for a child deserves a quick, kind and considered reply.
            </h1>
            <p className="mt-6 max-w-xl text-xl text-muted-foreground">
              For services under pressure, Kinderform makes the first step easier, with free code, starter
              kits and research. Services are the councils, hubs and agencies that find and approve foster
              carers and adopters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="/build">Get the free starter kit</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/for-services">Ideas for services</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="/example-form">Try the example form</a>
              </Button>
            </div>
          </div>
          <ReplyExample />
        </section>

        <div className="mx-auto max-w-6xl px-6">
          <Alert id="find-a-service">
            <AlertTitle>Thinking of fostering or adopting?</AlertTitle>
            <AlertDescription>
              <p>Kinderform cannot take enquiries. Contact a service where you live:</p>
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
                <li>
                  <a href="https://www.gov.uk/child-adoption/early-stages-of-adoption" className="font-medium text-foreground underline underline-offset-4">
                    How to contact an adoption agency
                  </a>
                </li>
              </ul>
              <p>
                Outside the UK, see our{" "}
                <a href="/compare/forms" className="font-medium text-foreground underline underline-offset-4">list of enquiry forms</a>.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <Section id="why-title" title="Interest is not the problem" art="clock-is-ticking">
            <div className="max-w-2xl space-y-4 leading-7">
              <p>
                People who offer to help can wait weeks or months for a reply, says the government’s
                fostering plan.
              </p>
              <p>
                England recorded almost 150,000 fostering enquiries in 2024–25. That year, 7,365
                foster carers were approved. This counts people, not households, and people can enquire more than once.
              </p>
              <p>
                No shared tool shows how long people wait. Kinderform works on that.
              </p>
              <p className="text-sm text-muted-foreground">
                Source: Department for Education,{" "}
                <a href={SOURCE_URL} className="font-medium text-foreground underline underline-offset-4">
                  Renewing Fostering
                </a>
                , February 2026, page 14. Checked 24 November 2026.
              </p>
            </div>
          </Section>

          <Separator />

          <Section id="research-steps" title="What the research says, step by step">
            <div className="space-y-8">
              <div className="max-w-2xl space-y-4">
                <StepsTheme />
              </div>
              <StepPath steps={steps()} base="/research" />
              <Button asChild variant="outline">
                <a href="/research#steps">See the research for each step</a>
              </Button>
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
                      <Tag tone={/draft/i.test(m.status) ? "blue" : "green"}>{m.status}</Tag>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">{m.body}</CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-12 grid items-start gap-8 md:grid-cols-2 md:gap-12">
              <div className="max-w-xl space-y-4">
                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">One enquiry, as a form and as a record</h3>
                <p className="leading-7">
                  The form asks only what a service needs to reply. The record is the same enquiry in our open
                  standard, so any system can read it.
                </p>
                <Button asChild variant="outline">
                  <a href="/example-form">Try the example form</a>
                </Button>
              </div>
              <FormOrCode />
            </div>
          </Section>

          <Separator />

          <Section id="how-title" title="How we work" art="peace">
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

          <Section id="who-title" title="Who's behind Kinderform" art="plant-seed">
            <div className="max-w-2xl space-y-4 leading-7">
              <p>
                Jamie Gannaway is a co-founder of Deployed, a document assembly and decision intelligence
                platform. Deployed builds intake and routing systems for large organisations. This project
                gives that experience to the fostering and adoption sector for free.
              </p>
              <p>Kinderform is not a Deployed product and is not commercial. It will never be a sales channel.</p>
              <p>
                You can find the code, data, research and their licences on{" "}
                <a
                  href="https://github.com/jamiegannaway/kinderform"
                  className="font-medium underline underline-offset-4"
                >
                  GitHub
                </a>
                . To get in touch, email{" "}
                <a href="mailto:jamie.gannaway@gmail.com" className="font-medium underline underline-offset-4">
                  jamie.gannaway@gmail.com
                </a>
                .
              </p>
            </div>
          </Section>

          <Separator />

          <section id="get-involved" aria-labelledby="involve-title" className="py-12 md:py-16">
            <Card className="max-w-4xl md:grid md:grid-cols-[minmax(0,1fr)_13rem] md:items-center">
              <div className="grid gap-6">
              <CardHeader>
                <CardTitle id="involve-title" className="text-2xl">
                  Get involved
                </CardTitle>
                <CardDescription className="text-base">
                  We look at the first step in {COUNTRY_ORDER.length} countries. We’d like to hear from anyone who
                  knows it:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="ml-5 list-disc space-y-2 leading-7">
                  <li>people thinking about fostering or adoption, and people who got in touch but did not go on</li>
                  <li>foster carers, kinship carers and adopters</li>
                  <li>people who have been in care</li>
                  <li>recruitment and assessment teams in councils, agencies and charities</li>
                  <li>researchers, regulators and policy teams</li>
                  <li>people who build public service forms</li>
                  <li>
                    native speakers who can check our Dutch, French, German or Spanish wording, or the te reo Māori in the
                    New Zealand form
                  </li>
                </ul>
                <p className="leading-7">
                  Tell us about a service, rule or study we have missed, or a fact we got wrong. We cover{" "}
                  {countryList(COUNTRY_ORDER)}. Please leave out personal details about anyone else.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <a href="mailto:jamie.gannaway@gmail.com">
                    <Mail aria-hidden="true" />
                    Email jamie.gannaway@gmail.com
                  </a>
                </Button>
              </CardFooter>
              </div>
              <Illustration name="paper-airplane" className="order-first ml-6 w-32 md:order-none md:mx-auto md:w-48" />
            </Card>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
