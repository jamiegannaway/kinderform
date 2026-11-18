// Helpers for the research pages, which are built from evidence/ in the repository.
import { getCollection, type CollectionEntry } from "astro:content"

export type EvidenceEntry = CollectionEntry<"evidence">

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

// "reports/2026-11-intake-interactions" -> "/research/reports/2026-11-intake-interactions"
export function hrefOf(id: string): string {
  if (id === "library") return "/research/library"
  if (id.startsWith("digests/")) return `/research/updates/${id.slice("digests/".length)}`
  return `/research/${id}`
}

export function slugOf(id: string): string {
  return hrefOf(id).slice("/research/".length)
}

// The first "# " heading in the Markdown is the title.
export function titleOf(body = ""): string {
  const m = body.match(/^#\s+(.+)$/m)
  return m ? m[1].replace(/[*_`]/g, "").trim() : "Untitled"
}

// Reports and updates are named YYYY-MM; this gives "November 2026".
export function monthOf(id: string): string {
  const m = id.match(/(\d{4})-(\d{2})/)
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : ""
}

export function libraryUpdated(body = ""): string | null {
  const m = body.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

export async function evidenceEntries() {
  const all = await getCollection("evidence")
  const byNewest = (a: EvidenceEntry, b: EvidenceEntry) => b.id.localeCompare(a.id)
  return {
    all,
    library: all.find((e) => e.id === "library"),
    reports: all.filter((e) => e.id.startsWith("reports/")).sort(byNewest),
    updates: all.filter((e) => e.id.startsWith("digests/")).sort(byNewest),
  }
}
