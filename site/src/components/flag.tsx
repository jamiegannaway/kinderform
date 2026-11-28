import { Globe } from "lucide-react"

import type { StarterKey } from "@/lib/starter-kits"

// The flag file in public/flags/ for each starter kit. The French Canadian kit uses Canada's flag.
const FLAG: Record<Exclude<StarterKey, "global">, string> = {
  uk: "gb",
  us: "us",
  ca: "ca",
  "ca-fr": "ca",
  au: "au",
  de: "de",
  fr: "fr",
  es: "es",
  ie: "ie",
  nl: "nl",
  nz: "nz",
  sg: "sg",
  no: "no",
  dk: "dk",
  fi: "fi",
}

// A small round flag in the shadcn/ui Avatar look: the classes of its Avatar, AvatarImage and
// AvatarFallback. It uses a plain <img>, because the Radix Avatar shows its image only after
// client JavaScript runs, and these pages ship none. The flag is decorative: the country's name
// is always next to it. The kit for any country gets a globe in the fallback circle.
export function Flag({ kit, className = "size-8" }: { kit: StarterKey; className?: string }) {
  return (
    <span className={`relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-border ${className}`}>
      {kit === "global" ? (
        <span className="flex size-full items-center justify-center rounded-full bg-muted">
          <Globe aria-hidden="true" className="size-[55%]" />
        </span>
      ) : (
        <img src={`/flags/${FLAG[kit]}.svg`} alt="" width={32} height={32} className="aspect-square size-full" />
      )}
    </span>
  )
}
