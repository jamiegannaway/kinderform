// /compare/applications.csv: the US application forms table as a spreadsheet, built with the site.
import { applicationRows, toCsv } from "@/lib/compare"

export function GET() {
  const csv = toCsv(
    ["form_id", "state", "issued_by", "form", "step", "format", "licensed", "url", "page_updated", "page_updated_from",
      "link_status", "date_checked", "verification"],
    applicationRows().map((r) => [r.id, r.state, r.body, r.name, r.step, r.format, r.licensed ? "yes" : "no", r.link,
      r.page?.updated ?? "", r.page?.from ?? "", r.page?.broken ? "did not work" : "", r.checked, "unverified"]),
  )
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } })
}
