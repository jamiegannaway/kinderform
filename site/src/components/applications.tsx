// "What applications ask" on /research: first contact against the application, topic by topic.
// Built from src/lib/applications.ts. Numbers and topic labels only: no service is named here.
// The named application forms are on /compare/applications.
import { Badge } from "@/components/ui/badge"
import { ChartCard, HeatGrid, StatCard } from "@/components/charts"
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
  return (
    <section aria-labelledby="applications" className="space-y-8">
      <div className="max-w-3xl space-y-4">
        <Badge variant="secondary" className="whitespace-normal">
          First pass: {data.countries.map((c) => c.name).join(" and ")}
        </Badge>
        <h2 id="applications" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
          What applications ask
        </h2>
        <p className="leading-7">
          After the first enquiry, most services send an application form. It asks much more. We read{" "}
          {data.appForms} application documents and sorted every question into the same topics as the enquiry forms
          above. This shows which questions come at which step.
        </p>
        <p className="leading-7">
          Some questions belong in an application: a service has to check health, convictions and the home before it
          can approve anyone. What matters is how early they come, and whether someone has talked to the person
          first.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.countries.map((c) => (
          <StatCard
            key={c.code}
            label={`${c.name}: a typical application`}
            value={`${c.appMedian} questions`}
            note={`A typical enquiry form asks ${c.firstMedian}. Based on ${c.first} enquiry forms and ${c.apps} ${c.unit === "forms" ? "application forms" : "application packets, each the set of forms one state, county or tribe gives applicants"}.${c.unit === "forms" && c.found > c.apps ? ` We found ${c.found} application forms but could read only ${c.apps}: most are given out after a first visit or behind a sign-in.` : ""}`}
          />
        ))}
      </div>

      <ChartCard
        title="What enquiry forms and applications ask about"
        description="The share of forms that ask about each topic, at first contact (E) and in the application (A). Darker means more forms ask."
        footer={{
          lead: data.countries
            .map(
              (c) =>
                `${c.name}: ${c.sensitiveFirst.yes} of ${c.sensitiveFirst.of} enquiry forms ask a sensitive question, against ${c.sensitiveApp.yes} of ${c.sensitiveApp.of} applications`,
            )
            .join(". "),
          note: `${packets.length ? `A US application is one service's packet of forms, counted once. ` : ""}A computer read the forms and sorted the questions. It could not sort ${unsorted}% of the application questions. Not yet checked by a person.`,
        }}
      >
        <HeatGrid columns={cols} rows={rows} />
      </ChartCard>

      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        The{" "}
        <a href="/compare/applications" className="font-medium text-foreground underline underline-offset-4">
          compare page
        </a>{" "}
        lists each application form with its link. Assessment forms that are licensed, such as Form F in England, are
        not read or copied.
      </p>
    </section>
  )
}
