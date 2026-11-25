// "What applications ask" on /research: first contact against the application, topic by topic.
// Built from src/lib/applications.ts. Numbers and topic labels only: no service is named here.
// The named application forms are on /compare/applications.
import { ChartCard, HeatGrid, StatCard } from "@/components/charts"
import { HowWeDidThis } from "@/components/countries"
import type { ApplicationsData } from "@/lib/applications"

const pct = (yes: number, of: number) => (of ? Math.round((100 * yes) / of) : 0)

export function Applications({ data }: { data: ApplicationsData }) {
  const cols = data.countries.flatMap((c) => [
    { key: `${c.code}-first`, label: `${c.code} enquiry`, short: `${c.code} E`, n: c.first },
    { key: `${c.code}-app`, label: `${c.code} application`, short: `${c.code} A`, n: c.apps, unit: c.unit },
  ])
  const rows = data.countries[0].topics.map((t, i) => ({
    label: t.label,
    note: t.sensitive ? "sensitive" : undefined,
    cells: Object.fromEntries(
      data.countries.flatMap((c) => [
        [`${c.code}-first`, c.topics[i].first],
        [`${c.code}-app`, c.topics[i].app],
      ]),
    ),
  }))
  const packets = data.countries.filter((c) => c.unit !== "forms")
  const unsorted = pct(data.unclassified, data.appQuestions)
  const small = data.countries.filter((c) => c.apps < 5)
  const hidden = data.countries.filter((c) => c.unit === "forms" && c.found > c.apps)
  const the = (name: string) => (/^United /.test(name) ? `the ${name}` : name)
  const countryNames = (cs: typeof small) => {
    const names = cs.map((c) => the(c.name))
    return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
  }
  const n = data.countries.length
  // The lead sentence quotes the UK, where most of our readers work.
  const lead = data.countries.find((c) => c.code === "UK") ?? data.countries[0]
  return (
    <section aria-labelledby="applications" className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <h2 id="applications" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          Applications ask far more than enquiry forms
        </h2>
        <p className="leading-7">
          In {the(lead.name)}, a typical application asks {lead.appMedian} questions, against {lead.firstMedian} on a
          typical enquiry form. Most services send the application after the first enquiry.
        </p>
        <p className="leading-7">
          A service must check health, criminal records and the home before it approves anyone. What matters is when it
          asks, and whether someone has talked to the person first.
        </p>
        <p className="leading-7 text-muted-foreground">
          We read {data.appForms} application forms and packets in {n} {n === 1 ? "country" : "countries"}. The{" "}
          <a href="/compare/applications" className="font-medium text-foreground underline underline-offset-4">
            compare page
          </a>{" "}
          lists each form with its link. These results are not yet checked by a person.
        </p>
        <HowWeDidThis>
          <p>
            A computer read the forms and sorted every question into the same topics as the enquiry forms. It could not
            sort {unsorted}% of the application questions.
          </p>
          <p>
            We did not count documents to attach, or checks the service runs itself.
            {packets.length > 0 && (
              <>
                {" "}
                A US application is a packet: the set of forms one state, county, tribe or agency gives applicants. We
                count each packet once.
              </>
            )}
          </p>
          {small.length > 0 && (
            <p>
              We read only a few application forms for {countryNames(small)}, so treat their shares as examples.
            </p>
          )}
          {hidden.map((c) => (
            <p key={c.code}>
              In {the(c.name)}, we found {c.found} application forms but could read only {c.apps}. Most are given out
              after a first visit or behind a sign-in.
            </p>
          ))}
          <p>We do not read or copy licensed assessment forms, such as Form F in England.</p>
        </HowWeDidThis>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.countries.map((c) => (
          <StatCard
            key={c.code}
            label={`${c.name}: a typical application`}
            value={`${c.appMedian} questions`}
            note={`A typical enquiry form asks ${c.firstMedian}. Ask something sensitive: ${c.sensitiveFirst.yes} of ${c.sensitiveFirst.of} enquiry forms and ${c.sensitiveApp.yes} of ${c.sensitiveApp.of} ${c.unit === "forms" ? "applications" : "packets"}.`}
          />
        ))}
      </div>

      <ChartCard
        title="What enquiry forms and applications ask about"
        description="The share of forms that ask about each topic. E is the enquiry form and A is the application. Darker means more. The number under each column is how many forms it counts."
        footer={{
          lead: data.countries.every(
            (c) => pct(c.sensitiveFirst.yes, c.sensitiveFirst.of) <= 30 && pct(c.sensitiveApp.yes, c.sensitiveApp.of) >= 50,
          )
            ? "In every country, few enquiry forms ask a sensitive question, and most applications do."
            : "How many forms ask a sensitive question differs by country. Each country's card gives the counts.",
        }}
      >
        <HeatGrid columns={cols} rows={rows} shortOnly={cols.length > 8} />
      </ChartCard>
    </section>
  )
}
