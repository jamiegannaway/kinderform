// A badge in one of the theme's tag colours (src/styles/globals.css), chosen by meaning, so the same
// colour always says the same thing: green, checked or ready; amber, not yet checked or take care;
// blue, a draft or information; rose, sensitive; violet and teal, kinds of thing such as research
// or the law. Built on the shadcn/ui Badge.
import { Badge } from "@/components/ui/badge"

export type Tone = "green" | "amber" | "blue" | "rose" | "violet" | "teal"

const TONE: Record<Tone, string> = {
  green: "border-transparent bg-tag-green text-tag-green-foreground",
  amber: "border-transparent bg-tag-amber text-tag-amber-foreground",
  blue: "border-transparent bg-tag-blue text-tag-blue-foreground",
  rose: "border-transparent bg-tag-rose text-tag-rose-foreground",
  violet: "border-transparent bg-tag-violet text-tag-violet-foreground",
  teal: "border-transparent bg-tag-teal text-tag-teal-foreground",
}

export function Tag({ tone, className = "", children }: { tone: Tone; className?: string; children: React.ReactNode }) {
  return <Badge className={`${TONE[tone]} ${className}`}>{children}</Badge>
}
