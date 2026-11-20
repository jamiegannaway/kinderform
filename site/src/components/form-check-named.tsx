import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SiteFooter, SiteHeader } from "@/components/site-header"
import { GROUPS, type Group } from "@/lib/census"
import type { Ranking, Scored } from "@/lib/form-check"

const MARKETING: Record<string, string> = {
  separate_unticked: "Separate, not ticked",
  separate_optional: "Separate, optional",
  separate_form: "Separate sign-up",
  none: "None asked",
  required_choice: "Must answer yes or no",
  required_checkbox_ambiguous: "Must tick, unclear wording",
  bundled_on_submit: "Signed up on sending",
  "not checked": "Not checked",
}

const OBSERVED: Record<string, string> = {
  direct_fetch: "Read on the live page",
  index_snapshot: "Search engine copy",
  search_snippet: "Search result text",
  secondhand: "Described elsewhere",
}

function Yes({ v }: { v: boolean | "yes" | "no" | "not checked" | null }) {
  if (v === null || v === "not checked") return <span className="text-muted-foreground">Not checked</span>
  return v === true || v === "yes" ? <span>Yes</span> : <span className="font-medium">No</span>
}

function FormTable({ rows, ranked }: { rows: Scored[]; ranked: boolean }) {
  return (
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            {ranked && <TableHead className="text-right">Rank</TableHead>}
            {ranked && <TableHead className="text-right">Draft score</TableHead>}
            <TableHead>Form</TableHead>
            <TableHead className="text-right">Questions</TableHead>
            <TableHead>Sensitive questions</TableHead>
            <TableHead>Reply time stated</TableHead>
            <TableHead>Newsletter consent</TableHead>
            <TableHead>Privacy notice</TableHead>
            <TableHead>Flags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.form.form_id}>
              {ranked && <TableCell className="text-right tabular-nums">{i + 1}</TableCell>}
              {ranked && (
                <TableCell className="text-right">
                  <span className="font-semibold tabular-nums">{r.score}</span>
                  <div className="text-xs text-muted-foreground">on {r.assessedWeight} of 100</div>
                </TableCell>
              )}
              <TableCell className="min-w-56 whitespace-normal">
                <a href={r.form.form_url || r.form.source_url} className="font-medium underline underline-offset-4">
                  {r.form.name}
                </a>
                <div className="text-xs text-muted-foreground">
                  {r.form.region}, {r.form.country}. {OBSERVED[r.form.observed] ?? r.form.observed},{" "}
                  {r.form.date_checked}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="tabular-nums">{r.questions}</span>
                <div className="text-xs text-muted-foreground">
                  {r.requiredKnown ? `${r.required} required` : "required not shown"}
                </div>
              </TableCell>
              <TableCell className="min-w-48 whitespace-normal">
                {[...(r.dateOfBirth ? ["Date of birth"] : []), ...r.sensitive].join(", ") || (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                {r.replyPromise ?? (r.replyChecked ? <span className="font-medium">None stated</span> : <span className="text-muted-foreground">Not checked</span>)}
              </TableCell>
              <TableCell>{MARKETING[r.marketing] ?? r.marketing}</TableCell>
              <TableCell>
                <Yes v={r.privacyNotice} />
              </TableCell>
              <TableCell className="min-w-40 whitespace-normal">
                <div className="flex flex-wrap gap-1">
                  {r.capped.map((c) => (
                    <Badge key={c} variant="destructive">
                      {c}
                    </Badge>
                  ))}
                  {r.spareRoom && <Badge variant="outline">Asks about a spare room</Badge>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}

function GroupSection({ group, r }: { group: Group; r: Ranking }) {
  return (
    <section aria-labelledby={`g-${group}`} className="py-10">
      <h2 id={`g-${group}`} className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {group} <span className="text-muted-foreground">({r.ranked.length + r.unranked.length})</span>
      </h2>
      {r.ranked.length > 0 && <FormTable rows={r.ranked} ranked />}
      {r.unranked.length > 0 && (
        <>
          <h3 className="mt-8 text-lg font-semibold">Not ranked yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We have seen these forms only through a search engine or a description elsewhere. Someone needs
            to check them on the live page before we can rank them.
          </p>
          <FormTable rows={r.unranked} ranked={false} />
        </>
      )}
    </section>
  )
}

export default function FormCheckNamed({ groups, built }: { groups: Record<Group, Ranking>; built: string }) {
  return (
    <>
      <SiteHeader current="/form-check" />
      <main id="main" className="mx-auto max-w-7xl px-6">
        <section className="pt-8 pb-4 md:pt-14">
          <Badge variant="destructive">Private preview. Do not share.</Badge>
          <h1 className="mt-6 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Form check: named results
          </h1>
          <Alert className="mt-8 max-w-4xl">
            <AlertTitle>A working view, not a finding</AlertTitle>
            <AlertDescription>
              <p>We build this page only for private Vercel previews, never for kinderform.org.</p>
              <ul className="mt-2 ml-5 list-disc space-y-2">
                <li>
                  Scores use the draft checklist (version 0.1) on only the areas a public page can show,
                  scaled to 100.
                </li>
                <li>
                  &ldquo;On 55 of 100&rdquo; means we could judge only 55 of the checklist&rsquo;s 100 points.
                </li>
                <li>
                  We do not score 3 areas: how quickly people hear back, finding the form and the right
                  service, and keeping good records.
                </li>
                <li>We rank only forms read directly from the live page.</li>
                <li>No row has been checked by a person yet.</li>
              </ul>
              <p className="mt-2">
                Each service sees its own scores in private before we publish any score by name. Page built{" "}
                {built}.
              </p>
            </AlertDescription>
          </Alert>
        </section>
        {GROUPS.filter((g) => groups[g]).map((g) => (
          <GroupSection key={g} group={g} r={groups[g]} />
        ))}
        <section className="py-10">
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">United States</h2>
          <p className="mt-4 text-muted-foreground">
            No US forms have been collected yet. When they are, they will appear here by state and, where
            counties run child welfare, by county.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
