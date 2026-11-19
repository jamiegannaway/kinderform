// Notioly line drawings, used under Kinderform's purchased licence. They are not openly
// licensed: see public/illustrations/LICENCE.md.
//
// Each one is decorative. The words beside it carry the meaning, so alt is empty and screen
// readers skip it. The ink is the theme's foreground colour; in dark mode the image is
// inverted so the lines stay readable.
export type IllustrationName =
  | "analysing"
  | "clock-is-ticking"
  | "details"
  | "examining"
  | "notification"
  | "paper-airplane"
  | "peace"
  | "plant-seed"
  | "studying"

export function Illustration({ name, className = "" }: { name: IllustrationName; className?: string }) {
  return (
    <img
      src={`/illustrations/${name}.svg`}
      alt=""
      width={520}
      height={520}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`h-auto select-none dark:invert ${className}`}
    />
  )
}
