// Tidies Markdown from evidence/ for the public research pages:
// - links between evidence files point to their pages on the site
// - links to other repository files become plain text (the repository is not public yet)
// - tracking parameters (utm_*) are removed from outside links
// - wide tables sit in a scrolling box so they do not break the page on a phone
import path from "node:path"

const PAGES = [
  [/^library\.md$/, () => "/research/library"],
  [/^findings\.json$/, () => "/research"],
  [/^research-log\.json$/, () => "/research/log"],
  [/^reports\/(.+)\.md$/, (m) => `/research/reports/${m[1]}`],
  [/^digests\/(.+)\.md$/, (m) => `/research/updates/${m[1]}`],
]

function sitePath(href, filePath) {
  const [target, hash = ""] = href.split("#")
  const marker = `${path.sep}evidence${path.sep}`
  const at = filePath ? filePath.lastIndexOf(marker) : -1
  if (at < 0) return null
  const evidenceDir = filePath.slice(0, at + marker.length)
  const abs = path.resolve(path.dirname(filePath), target)
  const rel = path.relative(evidenceDir, abs).split(path.sep).join("/")
  for (const [re, to] of PAGES) {
    const m = rel.match(re)
    if (m) return to(m) + (hash ? `#${hash}` : "")
  }
  return null
}

function cleanUrl(href) {
  try {
    const u = new URL(href)
    for (const k of [...u.searchParams.keys()]) if (k.startsWith("utm_")) u.searchParams.delete(k)
    return u.toString()
  } catch {
    return href
  }
}

export default function rehypeResearch() {
  return (tree, file) => {
    const filePath = file?.path || file?.history?.[0]
    const walk = (node) => {
      if (!node.children) return
      node.children = node.children.flatMap((child) => {
        if (child.type === "element" && child.tagName === "a" && typeof child.properties?.href === "string") {
          const href = child.properties.href
          if (/^https?:\/\//.test(href)) {
            child.properties.href = cleanUrl(href)
          } else if (!href.startsWith("#") && !href.startsWith("/") && !href.startsWith("mailto:")) {
            const to = sitePath(href, filePath)
            if (to) child.properties.href = to
            else {
              walk(child)
              return child.children
            }
          }
        }
        if (child.type === "element" && child.tagName === "table") {
          walk(child)
          return [{ type: "element", tagName: "div", properties: { className: ["kf-table"] }, children: [child] }]
        }
        walk(child)
        return [child]
      })
    }
    walk(tree)
  }
}
