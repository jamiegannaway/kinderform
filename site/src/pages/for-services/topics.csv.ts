// /for-services/topics.csv: the "Check your own form" table as a spreadsheet, built with the site.
// Counts of forms only; no service is named.
import { loadCensus } from "@/lib/census"
import { toCsv } from "@/lib/compare"
import { insights, type Share } from "@/lib/insights"

export function GET() {
  const d = insights(loadCensus())
  const cells = (s: Share | null) => (s ? [s.yes, s.of] : ["", ""])
  const csv = toCsv(
    ["topic", "personal", "uk_enquiry_forms_asking", "uk_enquiry_forms", "all_enquiry_forms_asking", "all_enquiry_forms",
      "uk_applications_asking", "uk_applications", "us_application_packets_asking", "us_application_packets",
      "england_fostering_assessment", "england_adoption_assessment", "latest_date_checked", "verification"],
    d.topics.map((t) => [t.label, t.sensitive ? "yes" : "no", ...cells(t.ukFirst), ...cells(t.allFirst),
      ...cells(t.ukApp), ...cells(t.usApp), t.england?.fostering.join("; ") ?? "", t.england?.adoption.join("; ") ?? "",
      d.checked, "unverified"]),
  )
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } })
}
