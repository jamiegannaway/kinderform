// "For services" (/for-services): what our reading of public forms and published research could mean
// for a fostering or adoption service. Numbers come from src/lib/insights.ts and name no service.
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Illustration } from "@/components/illustration"
import { SiteFooter, SiteHeader } from "@/components/site-header"
import { NATIONS, type InsightsData, type RuleQuote, type Share } from "@/lib/insights"

export type Withdrawals = { share: number; notExpected: number; year: string } | null

const link = "font-medium text-foreground underline underline-offset-4"
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const monthOf = (iso: string) => (/^\d{4}-\d{2}/.test(iso) ? `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : "2026")
const pct = (s: Share) => (s.of ? Math.round((100 * s.yes) / s.of) : 0)
const of = (s: Share) => `${s.yes} of ${s.of}`

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
      {children}
    </h2>
  )
}

// Method detail, out of the way of the main text. A native <details>, so it needs no JavaScript.
function HowWeDidThis({ children }: { children: React.ReactNode }) {
  return (
    <details className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
      <summary className="cursor-pointer font-medium text-foreground underline-offset-4 hover:underline">
        How we did this
      </summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  )
}

type Part = { label: string; body: React.ReactNode }

function Insight({ n, id, title, parts, tryThis }: { n: number; id: string; title: string; parts: Part[]; tryThis: React.ReactNode }) {
  return (
    <Card id={id} className="scroll-m-20">
      <CardHeader>
        <CardDescription className="tabular-nums">{n}</CardDescription>
        <CardTitle className="text-xl leading-snug">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-5 md:grid-cols-3">
          {parts.map((p) => (
            <div key={p.label} className="space-y-2">
              <dt className="font-medium">{p.label}</dt>
              <dd className="text-sm leading-6 text-muted-foreground">{p.body}</dd>
            </div>
          ))}
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <dt className="font-medium">Try this</dt>
            <dd className="text-sm leading-6">{tryThis}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

function Cell({ s }: { s: Share | null }) {
  if (!s || !s.of) return <TableCell className="text-right text-muted-foreground">No data</TableCell>
  return (
    <TableCell className="text-right tabular-nums">
      {pct(s)}%<span className="sr-only"> ({of(s)})</span>
    </TableCell>
  )
}

export function ForServices({
  data,
  bedrooms,
  withdrawals,
}: {
  data: InsightsData
  bedrooms: RuleQuote[]
  withdrawals: Withdrawals
}) {
  const d = data
  const england = bedrooms.find((b) => b.place === "England")
  const law = d.lawRows > 0
  // Wales, Scotland and Northern Ireland, where we have read enquiry forms.
  const others = (d.early?.nations ?? []).filter((n) => n.code !== "ENG" && n.enquiry.share.of > 0 && n.link)
  const insights = [
    {
      id: "ask-less",
      title: "Ask only what you need to reply",
      parts: [
        {
          label: "We found",
          body: (
            <>
              A typical UK enquiry form asks {d.ukFirst.median} questions. Across {d.first.countries} countries, forms
              ask {d.first.shortest} to {d.first.longest}.
            </>
          ),
        },
        {
          label: "Research",
          body: (
            <>
              Many people see an enquiry as the start of an application, and worry about asking the wrong
              question.{" "}
              <a href="/research#first-contact-feeling" className={link}>
                How the first contact feels
              </a>
            </>
          ),
        },
      ] satisfies Part[],
      tryThis: (
        <>
          Ask only for a name, one way to reach the person and roughly where they live, as our{" "}
          <a href="/example-form" className={link}>
            example forms
          </a>{" "}
          do.
        </>
      ),
    },
    {
      id: "sensitive-later",
      title: "Save sensitive questions until after a conversation",
      parts: [
        {
          label: "We found",
          body: (
            <>
              {of(d.ukFirst.sensitive)} UK enquiry forms ask a sensitive question, such as date of birth, health or
              ethnicity.
            </>
          ),
        },
        law && d.lawLinks
          ? {
              label: "The law",
              body: (
                <>
                  In England, the law puts health, past relationships and the criminal record check in stage 1 of
                  the fostering assessment.{" "}
                  <a href={d.lawLinks.fostering} className={link}>
                    Fostering Services (England) Regulations 2011, Schedule 3
                  </a>
                </>
              ),
            }
          : {
              label: "Research",
              body: (
                <>
                  A service has to check health, convictions and the home before it approves anyone.{" "}
                  <a href="/research#applications" className={link}>
                    What applications ask
                  </a>
                </>
              ),
            },
      ] satisfies Part[],
      tryThis: (
        <>
          Ask sensitive questions in the application, after a conversation, and say why you need each one.
        </>
      ),
    },
    ...(d.early && d.lawLinks
      ? [
          {
            id: "law-stages",
            title: "Ask each question at the stage the law sets",
            parts: [
              {
                label: "We found",
                body: (
                  <>
                    In England, {of(d.early.application.share)} application forms and {of(d.early.enquiry.share)}{" "}
                    enquiry forms ask something the law leaves to stage 2.
                    {others.length > 0 && (
                      <>
                        {" "}
                        Elsewhere, enquiry forms that ask assessment questions:{" "}
                        {others.map((n) => `${n.name} ${of(n.enquiry.share)}`).join(", ")}.
                      </>
                    )}
                  </>
                ),
              },
              {
                label: "The law",
                body: (
                  <>
                    In England, stage 2 covers personality, religion, ethnicity, work and experience.{" "}
                    <a href={d.lawLinks.fostering} className={link}>
                      Schedule 3
                    </a>
                    . Adoption agencies must not refuse a first form because of ethnicity, age, health, sexual
                    orientation or religion.{" "}
                    <a href={d.lawLinks.adoptionGuidance} className={link}>
                      Adoption statutory guidance, paragraphs 3.13 to 3.15
                    </a>
                  </>
                ),
              },
            ] satisfies Part[],
            tryThis: (
              <>
                Check each question against the{" "}
                <a href="#law-by-nation" className={link}>
                  law in your nation
                </a>
                , and move later questions to the assessment. If you monitor ethnicity or religion, make it optional
                and keep it apart from the decision.
              </>
            ),
          },
        ]
      : []),
    {
      id: "say-when",
      title: "Say when you will reply, and who from",
      parts: [
        {
          label: "We found",
          body: (
            <>
              {of(d.reply.uk)} UK enquiry forms we checked give a reply time, as do {of(d.reply.us)} in the United
              States.
            </>
          ),
        },
        {
          label: "Research",
          body: (
            <>
              Some people give up because of how a service replied, or because contact stopped.{" "}
              <a href="/research#put-off" className={link}>
                How replies put people off
              </a>
            </>
          ),
        },
      ] satisfies Part[],
      tryThis: <>On the form and in the automatic reply, say when you will reply, who from, and what happens next.</>,
    },
    ...(england
      ? [
          {
            id: "spare-room",
            title: "If you ask about a spare room, explain the rule",
            parts: [
              {
                label: "We found",
                body: (
                  <>
                    {of(d.spareRoom.agencies)} UK enquiry forms from independent agencies ask about a spare room,
                    against {of(d.spareRoom.councils)} from councils and hubs.
                  </>
                ),
              },
              {
                label: "The rules",
                body: (
                  <>
                    England: {england.rule}{" "}
                    <a href={england.url} className={link}>
                      {england.source}
                    </a>
                  </>
                ),
              },
            ] satisfies Part[],
            tryThis: <>Say when children can share a room, so people who could foster do not rule themselves out.</>,
          },
        ]
      : []),
    {
      id: "preview-application",
      title: "Tell people early what the application will ask",
      parts: [
        {
          label: "We found",
          body: d.app.uk ? (
            <>
              A typical UK application form asks {d.app.uk.median} questions, against {d.ukFirst.median} on an enquiry
              form.
            </>
          ) : (
            <>We have not yet read enough application forms.</>
          ),
        },
        {
          label: "Research",
          body: withdrawals ? (
            <>
              In England in {withdrawals.year}, {withdrawals.share}% of finished fostering applications ended in
              withdrawal. Of those who withdrew, {withdrawals.notExpected}% said the process was not what they
              expected.{" "}
              <a href="/research#withdrawals" className={link}>
                Withdrawals
              </a>
            </>
          ) : (
            <>
              Most fostering applications that finish end in withdrawal, not approval.{" "}
              <a href="/research#withdrawals" className={link}>
                Withdrawals
              </a>
            </>
          ),
        },
      ] satisfies Part[],
      tryThis: (
        <>At the first conversation, share a plain list of what the application and assessment will ask, and why.</>
      ),
    },
    {
      id: "one-contact",
      title: "Keep one person in touch from enquiry to application",
      parts: [
        {
          label: "Research",
          body: (
            <>
              People drop out when one team hands them to another and nobody answers their questions.{" "}
              <a href="/research#hand-offs" className={link}>
                Hand-offs
              </a>
            </>
          ),
        },
        {
          label: "Other fields",
          body: (
            <>
              Blood and stem cell services lose the most people right after the first form, when nobody reaches
              them.{" "}
              <a href="/research/log" className={link}>
                Research log
              </a>
            </>
          ),
        },
      ] satisfies Part[],
      tryThis: (
        <>
          Give each person one named contact. If you cannot reach someone, record it and try another way within 1
          working day.
        </>
      ),
    },
    {
      id: "test",
      title: "Test one change at a time, and share what you learn",
      parts: [
        {
          label: "Research",
          body: (
            <>
              We found no trial of follow-up with real people who enquire, in any country.{" "}
              <a href="/research#no-trials" className={link}>
                The gap
              </a>
            </>
          ),
        },
        {
          label: "A warning",
          body: (
            <>
              One regional hub made first visits much quicker, but approvals did not rise.{" "}
              <a href="/research#speed-alone" className={link}>
                Speed alone
              </a>
            </>
          ),
        },
      ] satisfies Part[],
      tryThis: (
        <>
          Compare the months before and after one change, and{" "}
          <a href="/#get-involved" className={link}>
            tell us what you find
          </a>
          . We will not name you without asking.
        </>
      ),
    },
  ]

  return (
    <>
      <SiteHeader current="/for-services" />
      <main id="main" className="mx-auto max-w-6xl px-6">
        <section aria-labelledby="fs-title" className="relative pt-8 pb-12 md:pt-14">
          <Illustration
            name="details"
            className="mb-6 block w-36 lg:absolute lg:top-8 lg:right-0 lg:mb-0 lg:w-56 xl:w-64"
          />
          <Badge variant="secondary">First look, not yet checked by a person</Badge>
          <h1 id="fs-title" className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            What services can do
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            Here are {insights.length} ideas for recruitment teams, each with one thing to try.
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            We read the forms in {monthOf(d.checked)}. The{" "}
            <a href="/research" className={link}>
              research page
            </a>{" "}
            gives the source and date of each finding.
          </p>
          <Alert className="mt-8 max-w-3xl">
            <AlertTitle>Nothing here names or scores a service</AlertTitle>
            <AlertDescription>
              <p>
                The numbers count forms, not services. To see your own form, use the{" "}
                <a href="/compare/forms" className={link}>
                  compare page
                </a>
                .
              </p>
            </AlertDescription>
          </Alert>
        </section>

        <section aria-labelledby="fs-ideas" className="space-y-6 pb-12">
          <H2 id="fs-ideas">{insights.length} things to try</H2>
          {insights.map((x, i) => (
            <Insight key={x.id} n={i + 1} id={x.id} title={x.title} parts={x.parts} tryThis={x.tryThis} />
          ))}
        </section>

        <Separator />

        <section aria-labelledby="check-your-form" className="py-12">
          <H2 id="check-your-form">Check your own form, topic by topic</H2>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
            If your form asks something few others ask, check that you need it before a conversation.
          </p>
          <Table className="mt-6">
            <TableCaption className="text-left">
              The share of forms that ask about each topic. Our{" "}
              <a href="/form-check" className={link}>
                draft checklist
              </a>{" "}
              says &ldquo;sensitive&rdquo; topics should wait until after a conversation.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead className="text-right whitespace-normal">UK enquiry forms</TableHead>
                <TableHead className="text-right whitespace-normal">Enquiry forms, all countries</TableHead>
                <TableHead className="text-right whitespace-normal">UK applications</TableHead>
                <TableHead className="text-right whitespace-normal">US applications</TableHead>
                <TableHead className="text-right whitespace-normal">Applications, all countries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.topics.map((t) => (
                <TableRow key={t.label}>
                  <TableCell className="min-w-40 font-medium whitespace-normal">
                    {t.label}
                    {t.sensitive && (
                      <Badge variant="outline" className="ml-2 font-normal">
                        sensitive
                      </Badge>
                    )}
                  </TableCell>
                  <Cell s={t.ukFirst} />
                  <Cell s={t.allFirst} />
                  <Cell s={t.ukApp} />
                  <Cell s={t.usApp} />
                  <Cell s={t.allApp} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4">
            <a href="/for-services/topics.csv" className={link}>
              Download this table and the law by nation (CSV)
            </a>
          </p>
          <HowWeDidThis>
            <p>
              We counted {d.ukFirst.forms} UK enquiry forms and {d.first.forms} in all {d.first.countries} countries.
              {` We counted ${d.app.all.units} applications in all ${d.app.all.countries} countries`}
              {d.app.uk && `, ${d.app.uk.forms} of them in the UK`}
              {d.app.us && `${d.app.uk ? " and" : ","} ${d.app.us.packets} in the United States`}.
              {d.app.us && " A US application is one service’s set of forms."}
            </p>
          </HowWeDidThis>
        </section>

        {law && (
          <>
            <Separator />
            <section aria-labelledby="law-by-nation" className="py-12">
              <H2 id="law-by-nation">Where the law puts each topic, in each UK nation</H2>
              <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
                England, and adoption in Wales, split the assessment into 2 stages.{" "}
                {others.length > 0 ? (
                  <>
                    Fostering law in{" "}
                    {others.map((n, i) => (
                      <span key={n.code}>
                        {i > 0 && (i === others.length - 1 ? " and " : ", ")}
                        <a href={n.link} className={link}>
                          {n.name}
                        </a>
                      </span>
                    ))}{" "}
                    sets one assessment, plus checks.
                  </>
                ) : (
                  "Elsewhere there is one assessment, plus checks."
                )}
              </p>
              <Table className="mt-6 min-w-[44rem]">
                <TableCaption className="text-left">
                  Stage 1 or Stage 2: the stage where the law puts the topic. Assessment: the assessment covers it. Check: a
                  check the service must make. A dash: the law&rsquo;s list does not name it.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2} className="align-bottom">
                      Topic
                    </TableHead>
                    {NATIONS.map((n) => (
                      <TableHead key={n.code} colSpan={2} className="border-l text-center">
                        {n.name}
                      </TableHead>
                    ))}
                  </TableRow>
                  <TableRow>
                    {NATIONS.flatMap((n) => [
                      <TableHead key={`${n.code}-f`} className="border-l text-xs font-normal">
                        Fostering
                      </TableHead>,
                      <TableHead key={`${n.code}-a`} className="text-xs font-normal">
                        Adoption
                      </TableHead>,
                    ])}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.topics.map((t) => (
                    <TableRow key={t.label}>
                      <TableCell className="min-w-40 font-medium whitespace-normal">{t.label}</TableCell>
                      {NATIONS.flatMap((n) => [
                        <TableCell key={`${n.code}-f`} className="border-l text-xs whitespace-normal">
                          {t.law?.[n.code]?.fostering.join(", ") || "–"}
                        </TableCell>,
                        <TableCell key={`${n.code}-a`} className="text-xs whitespace-normal">
                          {t.law?.[n.code]?.adoption.join(", ") || "–"}
                        </TableCell>,
                      ])}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <HowWeDidThis>
                <p>
                  We read the law on legislation.gov.uk and GOV.UK in November 2026. Some laws online may miss later
                  changes. Our{" "}
                  <a href="https://github.com/jamiegannaway/kinderform/blob/main/register/assessment.csv" className={link}>
                    map of the law
                  </a>{" "}
                  gives the source of each row.
                </p>
              </HowWeDidThis>
            </section>
          </>
        )}

        <Separator />

        <section aria-labelledby="fs-next" className="py-12">
          <H2 id="fs-next">Next steps</H2>
          <ul className="mt-6 ml-5 max-w-3xl list-disc space-y-3 leading-7">
            <li>
              Comment on our{" "}
              <a href="/form-check" className={link}>
                draft checklist
              </a>
              .
            </li>
            <li>
              Compare the{" "}
              <a href="/compare/rules" className={link}>
                rules on who can foster or adopt
              </a>
              .
            </li>
            <li>
              <a href="/#get-involved" className={link}>
                Tell us
              </a>{" "}
              if something here is wrong, or if you try an idea.
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
