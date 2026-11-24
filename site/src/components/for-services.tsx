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
import type { InsightsData, RuleQuote, Share } from "@/lib/insights"

export type Withdrawals = { share: number; notExpected: number; year: string } | null

const link = "font-medium text-foreground underline underline-offset-4"
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const monthOf = (iso: string) => (/^\d{4}-\d{2}/.test(iso) ? `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}` : "2026")
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} or ${xs.at(-1)}`)
const pct = (s: Share) => (s.of ? Math.round((100 * s.yes) / s.of) : 0)
const of = (s: Share) => `${s.yes} of ${s.of}`

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
      {children}
    </h2>
  )
}

type Part = { label: string; kind: "ours" | "research" | "rules"; body: React.ReactNode }
const KIND: Record<Part["kind"], string> = {
  ours: "Our reading of public forms",
  research: "Published research",
  rules: "Published rules",
}

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
              <dt className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.label}</span>
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {KIND[p.kind]}
                </Badge>
              </dt>
              <dd className="text-sm leading-6 text-muted-foreground">{p.body}</dd>
            </div>
          ))}
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <dt className="font-medium">What to try</dt>
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
  const ni = bedrooms.find((b) => b.place === "Northern Ireland")
  const law = d.lawRows > 0
  const insights = [
    {
      id: "ask-less",
      title: "Ask only what you need to reply",
      parts: [
        {
          label: "What we found",
          kind: "ours",
          body: (
            <>
              A typical enquiry form in the UK asks {d.ukFirst.median} questions. Across {d.first.forms} forms in{" "}
              {d.first.countries} countries, the shortest asks {d.first.shortest} and the longest asks {d.first.longest}.
            </>
          ),
        },
        {
          label: "What research says",
          kind: "research",
          body: (
            <>
              Many people see getting in touch as the start of an application. They worry about asking the wrong
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
          Ask for a name, one way to reach the person and roughly where they live. Everything else can wait for a
          conversation. Our{" "}
          <a href="/example-form" className={link}>
            example forms
          </a>{" "}
          show what that looks like.
        </>
      ),
    },
    {
      id: "personal-later",
      title: "Save personal questions until after a conversation",
      parts: [
        {
          label: "What we found",
          kind: "ours",
          body: (
            <>
              {of(d.ukFirst.sensitive)} UK enquiry forms ask a personal question, such as date of birth, health or
              ethnicity.
              {d.app.uk && (
                <>
                  {" "}
                  {d.app.uk.health.yes === d.app.uk.health.of
                    ? "Every UK application form we read asks about health."
                    : `${of(d.app.uk.health)} UK application forms ask about health.`}{" "}
                  {of(d.app.uk.partners)} ask about past partners and {of(d.app.uk.criminal)} about criminal records.
                </>
              )}
            </>
          ),
        },
        law && d.lawLinks
          ? {
              label: "What the law says",
              kind: "rules",
              body: (
                <>
                  In England, the law puts health, past relationships and the criminal record check in stage 1 of the
                  assessment. None of them is needed to reply to an enquiry.{" "}
                  <a href={d.lawLinks.fostering} className={link}>
                    Fostering Services (England) Regulations 2011, Schedule 3
                  </a>
                </>
              ),
            }
          : {
              label: "What research says",
              kind: "research",
              body: (
                <>
                  A service has to check health, convictions and the home before it approves anyone. These questions
                  belong in the application, after someone has talked to the person.{" "}
                  <a href="/research#applications" className={link}>
                    What applications ask
                  </a>
                </>
              ),
            },
      ] satisfies Part[],
      tryThis: (
        <>
          Move personal questions to the application. Ask them after you have spoken to the person, and say why you
          need each one.
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
                label: "What we found",
                kind: "ours",
                body: (
                  <>
                    {of(d.early.application.share)} application forms we read in England ask something the law leaves
                    to stage 2
                    {d.early.application.top.length ? `, such as ${listOf(d.early.application.top)}` : ""}. So do{" "}
                    {of(d.early.enquiry.share)} enquiry forms in England.
                  </>
                ),
              },
              {
                label: "What the law says",
                kind: "rules",
                body: (
                  <>
                    In England, stage 1 covers identity, health, the household, referees and checks. Stage 2 covers
                    personality, religion, ethnicity, work and experience.{" "}
                    <a href={d.lawLinks.fostering} className={link}>
                      Schedule 3
                    </a>
                    . For adoption, statutory guidance says the first form should be short. It must not be refused
                    because of ethnicity, age, health, sexual orientation or religion.{" "}
                    <a href={d.lawLinks.adoptionGuidance} className={link}>
                      Adoption statutory guidance, paragraphs 3.13 to 3.15
                    </a>
                  </>
                ),
              },
            ] satisfies Part[],
            tryThis: (
              <>
                Check each question on your forms against the{" "}
                <a href="#check-your-form" className={link}>
                  table below
                </a>
                . Move stage 2 questions to the assessment, where a social worker can explain why they matter. If you
                ask about ethnicity or religion for monitoring, make it optional and keep it apart from the decision.
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
          label: "What we found",
          kind: "ours",
          body: (
            <>
              {of(d.reply.uk)} UK enquiry forms we checked say when you will hear back. In the United States it is{" "}
              {of(d.reply.us)}.
            </>
          ),
        },
        {
          label: "What research says",
          kind: "research",
          body: (
            <>
              Some people who go no further say the way the service replied put them off. People also drop out when
              contact stops.{" "}
              <a href="/research#put-off" className={link}>
                How replies put people off
              </a>
            </>
          ),
        },
      ] satisfies Part[],
      tryThis: (
        <>
          Put a reply time on the form and in the automatic reply. Say who will be in touch and what happens next.
        </>
      ),
    },
    ...(england
      ? [
          {
            id: "spare-room",
            title: "If you ask about a spare room, explain the rule",
            parts: [
              {
                label: "What we found",
                kind: "ours",
                body: (
                  <>
                    {of(d.spareRoom.agencies)} UK independent agency enquiry forms ask about a spare room. Among
                    council and hub forms it is {of(d.spareRoom.councils)}.
                  </>
                ),
              },
              {
                label: "What the rules say",
                kind: "rules",
                body: (
                  <>
                    England: {england.rule}{" "}
                    <a href={england.url} className={link}>
                      {england.source}
                    </a>
                    .{ni && <> Northern Ireland: {ni.rule}</>}
                  </>
                ),
              },
            ] satisfies Part[],
            tryThis: (
              <>
                If you ask, say what counts as a spare room and when children can share. Then people who could foster
                do not rule themselves out.
              </>
            ),
          },
        ]
      : []),
    {
      id: "preview-application",
      title: "Tell people early what the application will ask",
      parts: [
        {
          label: "What we found",
          kind: "ours",
          body: d.app.uk ? (
            <>
              A typical UK application form asks {d.app.uk.median} questions, against {d.ukFirst.median} on an enquiry
              form.
              {d.app.us && <> A typical US application packet asks {d.app.us.median}.</>}
            </>
          ) : (
            <>We have not yet read enough application forms.</>
          ),
        },
        {
          label: "What research says",
          kind: "research",
          body: withdrawals ? (
            <>
              In England in {withdrawals.year}, {withdrawals.share}% of fostering applications that finished ended in
              withdrawal. Of the applicants who withdrew, {withdrawals.notExpected}% said the process was not what they
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
        <>
          At the first conversation, share a plain list of what the application and assessment will ask, and why.
        </>
      ),
    },
    {
      id: "one-contact",
      title: "Keep one person in touch from enquiry to application",
      parts: [
        {
          label: "What research says",
          kind: "research",
          body: (
            <>
              People drop out when one team hands them on to another and nobody answers their questions.{" "}
              <a href="/research#hand-offs" className={link}>
                Hand-offs
              </a>
            </>
          ),
        },
        {
          label: "From other fields",
          kind: "research",
          body: (
            <>
              In blood and stem cell donation, the biggest loss comes straight after the first form, when nobody manages
              to speak to the person.{" "}
              <a href="/research/log" className={link}>
                Research log
              </a>
            </>
          ),
        },
      ] satisfies Part[],
      tryThis: (
        <>
          Give each person one named contact. Record &ldquo;not yet reached&rdquo; as its own outcome, and try another
          way to reach them within 1 working day.
        </>
      ),
    },
    {
      id: "test",
      title: "Test one change at a time, and share what you learn",
      parts: [
        {
          label: "What research says",
          kind: "research",
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
          kind: "research",
          body: (
            <>
              One regional hub made first visits much quicker, but approvals did not rise. Speed alone was not enough.{" "}
              <a href="/research#speed-alone" className={link}>
                Speed alone
              </a>
            </>
          ),
        },
      ] satisfies Part[],
      tryThis: (
        <>
          Change one thing, such as a shorter form or a clearer automatic reply. Compare the months before and after.{" "}
          <a href="/#get-involved" className={link}>
            Tell us what you find
          </a>
          , and we will share it without naming you unless you want us to.
        </>
      ),
    },
  ]

  return (
    <>
      <SiteHeader current="/for-services" />
      <main id="main" className="mx-auto max-w-6xl px-6">
        <section aria-labelledby="fs-title" className="relative pt-8 pb-12 md:pt-14">
          <Illustration name="details" className="absolute top-8 right-0 hidden w-56 lg:block xl:w-64" />
          <Badge variant="secondary">First look, not yet checked by a person</Badge>
          <h1 id="fs-title" className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            What services can do
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
            This page is for recruitment teams and managers in councils, hubs and agencies. Each idea puts what we found
            in public forms next to published research, and suggests one thing to try.
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            We read the forms in {monthOf(d.checked)}. A computer program read most of them, and a
            person has not yet checked the results. The research has its own sources and dates on the{" "}
            <a href="/research" className={link}>
              research page
            </a>
            .
          </p>
          <Alert className="mt-8 max-w-3xl">
            <AlertTitle>Nothing here names or scores a service</AlertTitle>
            <AlertDescription>
              <p>
                The numbers count forms, not services. To see the facts about your own form, with its link and the date
                we checked, use the{" "}
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
            Go down the list and note what your enquiry form asks. If it asks something few enquiry forms ask, check
            whether you need it before you have spoken to the person.
            {law &&
              " The last columns show where the law in England puts each topic in the assessment. Stage 1 is the first part, mostly checks. Stage 2 is the full assessment."}
          </p>
          <Table className="mt-6">
            <TableCaption className="text-left">The share of forms that ask about each topic.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead className="text-right whitespace-normal">UK enquiry forms</TableHead>
                <TableHead className="text-right whitespace-normal">Enquiry forms, all countries</TableHead>
                <TableHead className="text-right whitespace-normal">UK applications</TableHead>
                <TableHead className="text-right whitespace-normal">US applications</TableHead>
                <TableHead className="text-right whitespace-normal">Applications, all countries</TableHead>
                {law && <TableHead className="whitespace-normal">England, fostering assessment</TableHead>}
                {law && <TableHead className="whitespace-normal">England, adoption assessment</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.topics.map((t) => (
                <TableRow key={t.label}>
                  <TableCell className="min-w-40 font-medium whitespace-normal">
                    {t.label}
                    {t.sensitive && (
                      <Badge variant="outline" className="ml-2 font-normal">
                        personal
                      </Badge>
                    )}
                  </TableCell>
                  <Cell s={t.ukFirst} />
                  <Cell s={t.allFirst} />
                  <Cell s={t.ukApp} />
                  <Cell s={t.usApp} />
                  <Cell s={t.allApp} />
                  {law && (
                    <TableCell className="whitespace-normal">{t.england?.fostering.join(", ") || "Not named"}</TableCell>
                  )}
                  {law && (
                    <TableCell className="whitespace-normal">{t.england?.adoption.join(", ") || "Not named"}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            We counted {d.ukFirst.forms} UK enquiry forms and {d.first.forms} enquiry forms in all {d.first.countries}{" "}
            countries.
            {d.app.uk && ` We counted ${d.app.uk.forms} UK application forms.`}
            {d.app.us && ` We counted ${d.app.us.packets} US application packets.`}
            {` Across all ${d.app.all.countries} countries we counted ${d.app.all.units} applications.`} A person has not yet checked these
            counts. &ldquo;Personal&rdquo; marks topics our{" "}
            <a href="/form-check" className={link}>
              draft checklist
            </a>{" "}
            says should wait until after a conversation. A US application is one service&rsquo;s set of forms, counted
            once.
          </p>
          {law && (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              &ldquo;Not named&rdquo; means the law&rsquo;s list does not name the topic. A person has not yet checked our
              reading of the law. Our{" "}
              <a href="https://github.com/jamiegannaway/kinderform/blob/main/register/assessment.csv" className={link}>
                map of the law in all four UK nations
              </a>{" "}
              gives the source for each row.
            </p>
          )}
          <p className="mt-4">
            <a href="/for-services/topics.csv" className={link}>
              Download this table (CSV)
            </a>
          </p>
        </section>

        <Separator />

        <section aria-labelledby="fs-next" className="py-12">
          <H2 id="fs-next">Use this with your own data</H2>
          <ul className="mt-6 ml-5 max-w-3xl list-disc space-y-3 leading-7">
            <li>
              Find your own form on the{" "}
              <a href="/compare/forms" className={link}>
                compare page
              </a>
              . It lists what each form asks, with the link and the date we checked.
            </li>
            <li>
              Read our{" "}
              <a href="/form-check" className={link}>
                draft checklist
              </a>{" "}
              for enquiry forms and first replies, and tell us what you think of it.
            </li>
            <li>
              Look up the published rules on who can foster or adopt in your area on the{" "}
              <a href="/compare/rules" className={link}>
                rules page
              </a>
              .
            </li>
            <li>
              If something here is wrong, or you have tried one of these ideas,{" "}
              <a href="/#get-involved" className={link}>
                get in touch
              </a>
              .
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
