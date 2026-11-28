// The research pages are built straight from the evidence library in the repository,
// so merging a change to evidence/ updates kinderform.org/research.
import { defineCollection } from "astro:content"
import { file, glob } from "astro/loaders"
import { z } from "astro/zod"
import { createHash } from "node:crypto"

// Markdown: the library, reports and monthly update notes. README.md is for contributors.
const evidence = defineCollection({
  loader: glob({ pattern: ["library.md", "reports/*.md", "digests/*.md"], base: "../evidence" }),
})

const checked = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    against: z.enum(["full text", "abstract", "key findings", "chart"]),
    claim_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    note: z.string().optional(),
  })
  .nullable()

// "What we know so far": short findings, each with its sources and whether a person checked them.
const findings = defineCollection({
  loader: file("../evidence/findings.json", { parser: (text) => JSON.parse(text).findings }),
  schema: z.object({
    id: z.string(),
    stage: z.string(),
    title: z.string(),
    summary: z.string(),
    sources: z
      .array(
        z.object({
          title: z.string(),
          by: z.string(),
          year: z.string(),
          url: z.string(),
          checked,
          note: z.string().optional(),
        })
      )
      .min(1),
  }).superRefine((finding, ctx) => {
    finding.sources.forEach((source, i) => {
      if (!source.checked) return
      const digest = createHash("sha256").update(JSON.stringify([finding.title, finding.summary, source.url])).digest("hex")
      if (source.checked.claim_sha256 !== digest) {
        ctx.addIssue({ code: "custom", path: ["sources", i, "checked"], message: "Finding changed since its source check. Clear checked until a person reviews this version." })
      }
    })
  }),
})

export const collections = { evidence, findings }
