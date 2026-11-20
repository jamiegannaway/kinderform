// /compare/rules.csv: every rule in all four countries as a spreadsheet, built with the site.
import { loadTopics, ruleRows, toCsv } from "@/lib/compare"

export function GET() {
  const labels = new Map(loadTopics().map((t) => [t.code, t.label]))
  const csv = toCsv(
    ["policy_id", "country", "place", "topic", "topic_label", "applies_to", "rule_summary", "value", "legal_citation",
      "source_type", "source_url", "page_updated", "page_updated_from", "link_status", "date_checked", "verification", "notes"],
    ruleRows().map((r) => [r.id, r.country, r.place, r.topic, labels.get(r.topic) ?? r.topic, r.appliesTo, r.summary,
      r.value, r.citation, r.sourceType, r.link, r.page?.updated ?? "", r.page?.from ?? "", r.page?.broken ? "did not work" : "", r.checked, "unverified", r.notes]),
  )
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } })
}
