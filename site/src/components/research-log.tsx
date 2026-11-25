import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SiteFooter, SiteHeader } from "@/components/site-header"
import { longDate } from "@/components/research"
import { KIND_LABEL, type Kind, type LogEntry, type Meaning } from "@/lib/research-log"

const cell = "align-top whitespace-normal py-3"
const KIND_VARIANT: Record<Kind, "default" | "secondary" | "outline" | "destructive"> = {
  keep: "outline",
  tighten: "secondary",
  change: "default",
  add: "secondary",
  avoid: "destructive",
  test: "outline",
}

export default function ResearchLog({
  updated,
  entries,
  meanings,
}: {
  updated: string
  entries: LogEntry[]
  meanings: Meaning[]
}) {
  return (
    <>
      <SiteHeader current="/research" />
      <main id="main" className="mx-auto max-w-6xl space-y-16 px-6 pt-6 pb-20 md:pt-10">
        <section className="max-w-3xl space-y-4">
          <p className="text-sm text-muted-foreground">
            <a href="/research" className="font-medium text-foreground underline underline-offset-4">
              Research
            </a>
            <span aria-hidden="true"> / </span>
            <span>Research log</span>
          </p>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
            Research log
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            We have done {entries.length} {entries.length === 1 ? "review" : "reviews"} of research so far. Together
            they give {meanings.length} ideas for our work. Last updated {longDate(updated)}.
          </p>
          <Alert>
            <AlertTitle>These are ideas for discussion, not decisions</AlertTitle>
            <AlertDescription>
              <p>
                We made each review with an AI-assisted research tool. Most figures are not yet checked by a person. We
                will decide each idea in the open.
              </p>
            </AlertDescription>
          </Alert>
        </section>

        <section aria-labelledby="log" className="space-y-6">
          <h2 id="log" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
            We looked at fostering and at fields with a similar first step
          </h2>
          <Table className="min-w-[60rem]">
            <TableCaption>Newest first. Each title opens the full report.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Date</TableHead>
                <TableHead scope="col">Research</TableHead>
                <TableHead scope="col">Where we looked</TableHead>
                <TableHead scope="col">What we learned</TableHead>
                <TableHead scope="col">Checked by a person?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id} id={e.id}>
                  <TableCell className="py-3 align-top">{longDate(e.date)}</TableCell>
                  <TableCell className={`${cell} w-[24%]`}>
                    <a href={e.href} className="font-medium underline underline-offset-4">
                      {e.title}
                    </a>
                    <p className="mt-2 text-muted-foreground">{e.question}</p>
                  </TableCell>
                  <TableCell className={`${cell} w-[16%]`}>
                    <ul className="list-disc space-y-1 pl-4">
                      {e.lookedAt.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className={cell}>
                    <ul className="list-disc space-y-2 pl-4">
                      {e.learned.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className={`${cell} w-[18%] text-muted-foreground`}>{e.checked}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section aria-labelledby="meaning" className="space-y-6">
          <div className="max-w-3xl space-y-4">
            <h2 id="meaning" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
              The reviews suggest {meanings.length} ideas for our work
            </h2>
            <p className="leading-7">
              Our draft standard is our open description of a good first reply. Ideas from other fields are our own view
              of what carries over to fostering.
            </p>
          </div>
          <Table className="min-w-[60rem]">
            <TableCaption>
              {meanings.length} ideas, grouped by the part of our work they touch. All are for discussion.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Part of our work</TableHead>
                <TableHead scope="col">What we could do</TableHead>
                <TableHead scope="col">Idea</TableHead>
                <TableHead scope="col">Why</TableHead>
                <TableHead scope="col">From which research</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meanings.map((m) => (
                <TableRow key={m.id} id={m.id}>
                  <TableCell className={`${cell} w-[14%] font-medium`}>{m.part}</TableCell>
                  <TableCell className="py-3 align-top">
                    <Badge variant={KIND_VARIANT[m.kind]}>{KIND_LABEL[m.kind]}</Badge>
                  </TableCell>
                  <TableCell className={`${cell} w-[32%]`}>{m.idea}</TableCell>
                  <TableCell className={`${cell} text-muted-foreground`}>{m.why}</TableCell>
                  <TableCell className={`${cell} w-[18%]`}>
                    <ul className="space-y-1">
                      {m.from.map((f) => (
                        <li key={f.id}>
                          <a href={f.href} className="underline underline-offset-4">
                            {f.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section aria-labelledby="help" className="max-w-3xl space-y-4">
          <h2 id="help" className="scroll-m-20 text-2xl font-semibold tracking-tight md:text-3xl">
            We want your view on these ideas
          </h2>
          <p className="leading-7">
            Tell us where we are wrong, or what research we have missed.
          </p>
          <Button asChild>
            <a href="/#get-involved">Get in touch</a>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
