// /compare/applications.csv: the application forms table as a spreadsheet, built with the site.
import { applicationRows, toCsv } from "@/lib/compare"

export function GET() {
  const csv = toCsv(
    ["form_id", "country", "place", "issued_by", "form", "step", "format", "licensed", "questions", "sensitive_topics",
      "url", "page_updated", "page_updated_from", "link_status", "date_checked", "verification"],
    applicationRows().map((r) => [r.id, r.country, r.state, r.body, r.name, r.step, r.format, r.licensed ? "yes" : "no",
      r.questions ?? "", r.sensitive, r.link, r.page?.updated ?? "", r.page?.from ?? "",
      r.page?.broken ? "did not work" : "", r.checked, "unverified"]),
  )
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } })
}
