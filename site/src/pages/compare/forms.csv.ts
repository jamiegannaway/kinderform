// /compare/forms.csv: the enquiry forms table as a spreadsheet, built with the site.
import { loadCensus } from "@/lib/census"
import { formRows, toCsv } from "@/lib/compare"

export function GET() {
  const rows = formRows(loadCensus())
  const csv = toCsv(
    ["form_id", "country", "service", "area", "service_type", "stage", "questions", "asks", "beyond_the_standard",
      "reply_time_stated", "form_url", "read_from", "page_updated", "page_updated_from", "link_status", "date_checked", "verification"],
    rows.map((r) => [r.id, r.country, r.service, r.area, r.type, r.stage, r.questions, r.asks, r.beyond, r.reply,
      r.link, r.readFrom, r.page?.updated ?? "", r.page?.from ?? "", r.page?.broken ? "did not work" : "", r.checked, "unverified"]),
  )
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } })
}
