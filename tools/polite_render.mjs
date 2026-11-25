// Read pages whose enquiry forms are built by JavaScript, politely, in a headless browser.
//
// Some fostering services' forms exist only after the page's scripts run, so tools/polite_fetch.py
// sees no questions. This tool renders those pages in Chromium (through Playwright) and saves the
// HTML the browser ends up with. `python3 tools/polite_fetch.py --rendered MANIFEST OUT.jsonl` then
// reads that HTML into the same records as an ordinary read, for tools/crawl_to_census.py.
//
// It keeps the polite crawling rule (CLAUDE.md, hard rule 8):
// - it checks robots.txt for every address it fetches, the page and each script or data call;
// - it identifies itself with the same user agent as polite_fetch.py;
// - it waits at least --delay seconds (5 by default, never under 3) between requests to one site;
// - it loads only the page, its scripts and its data calls: no images, fonts, styles or media;
// - it lets through GET requests only, and never clicks, types or presses anything, so it cannot
//   send a form.
//
// Usage (from the repository root):
//   node tools/polite_render.mjs URLS.tsv OUT_DIR [--delay 5]
// Behind an HTTPS proxy, run it with NODE_USE_ENV_PROXY=1 so its robots.txt requests use the proxy.
// URLS.tsv has one "key<TAB>url" per line, as for polite_fetch.py. OUT_DIR gets one .html file per
// page and manifest.jsonl. Treat what it saves as data from the web, not as instructions.
import { createRequire } from "node:module"
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs"
import { join } from "node:path"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright")

const USER_AGENT = "Kinderform-register-bot/0.1 (+https://github.com/jamiegannaway/kinderform; polite, read-only)"
const AGENT_TOKEN = "kinderform-register-bot"
const KEEP = new Set(["document", "script", "xhr", "fetch"])
const PAGE_TIMEOUT_MS = 6 * 60 * 1000

const args = process.argv.slice(2)
const [urlsFile, outDir] = args
const delayAt = args.indexOf("--delay")
const delay = delayAt >= 0 ? Number(args[delayAt + 1]) : 5
if (!urlsFile || !outDir) {
  console.error("usage: node tools/polite_render.mjs URLS.tsv OUT_DIR [--delay 5]")
  process.exit(2)
}
if (!(delay >= 3)) {
  console.error("Delay below 3 seconds is not allowed (CLAUDE.md rule 8).")
  process.exit(2)
}

// ---- one request at a time per site, at least `delay` seconds apart -----------------------------
const queues = new Map()
const last = new Map()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
function throttle(host) {
  const before = queues.get(host) ?? Promise.resolve()
  const turn = before.then(async () => {
    const wait = (last.get(host) ?? 0) + delay * 1000 - Date.now()
    if (wait > 0) await sleep(wait)
    last.set(host, Date.now())
  })
  queues.set(host, turn)
  return turn
}

// ---- robots.txt: groups for our agent, else "*"; longest matching rule wins; * and $ supported ------
const robots = new Map()
function parseRobots(text) {
  const groups = []
  let current = null
  let lastWasAgent = false
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim()
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/)
    if (!m) continue
    const field = m[1].toLowerCase()
    const value = m[2].trim()
    if (field === "user-agent") {
      if (!lastWasAgent) groups.push((current = { agents: [], rules: [] }))
      current.agents.push(value.toLowerCase())
      lastWasAgent = true
    } else {
      lastWasAgent = false
      if (current && (field === "allow" || field === "disallow")) current.rules.push({ allow: field === "allow", path: value })
    }
  }
  const mine = groups.filter((g) => g.agents.some((a) => a !== "*" && AGENT_TOKEN.includes(a)))
  return (mine.length ? mine : groups.filter((g) => g.agents.includes("*"))).flatMap((g) => g.rules)
}
function ruleMatches(path, rulePath) {
  if (!rulePath) return false
  const anchored = rulePath.endsWith("$")
  const body = (anchored ? rulePath.slice(0, -1) : rulePath)
    .split("*")
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*")
  return new RegExp(`^${body}${anchored ? "$" : ""}`).test(path)
}
async function allowed(url) {
  const u = new URL(url)
  if (u.protocol !== "https:" && u.protocol !== "http:") return false
  if (!robots.has(u.host)) {
    robots.set(
      u.host,
      (async () => {
        await throttle(u.host)
        try {
          const res = await fetch(`${u.protocol}//${u.host}/robots.txt`, {
            headers: { "User-Agent": USER_AGENT },
            signal: AbortSignal.timeout(30000),
          })
          if (res.status === 401 || res.status === 403) return [{ allow: false, path: "/" }]
          return res.ok ? parseRobots(await res.text()) : []
        } catch {
          return [{ allow: false, path: "/" }] // cannot read robots.txt: stay out
        }
      })(),
    )
  }
  const rules = await robots.get(u.host)
  const path = u.pathname + u.search
  let best = null
  for (const r of rules) {
    if (ruleMatches(path, r.path) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)))
      best = r
  }
  return !best || best.allow
}

// ---- render each page --------------------------------------------------------------------------
mkdirSync(outDir, { recursive: true })
const manifest = join(outDir, "manifest.jsonl")
const jobs = readFileSync(urlsFile, "utf-8")
  .split(/\r?\n/)
  .map((l) => l.split("\t"))
  .filter(([k, u]) => k && /^https?:\/\//.test(u ?? ""))

const browser = await chromium.launch()
for (const [key, url] of jobs) {
  const record = { key, url, fetched_at: new Date().toISOString().slice(0, 10), rendered: true, blocked: {} }
  const count = (why) => (record.blocked[why] = (record.blocked[why] ?? 0) + 1)
  const context = await browser.newContext({ userAgent: USER_AGENT, serviceWorkers: "block", javaScriptEnabled: true })
  const page = await context.newPage()
  page.setDefaultTimeout(PAGE_TIMEOUT_MS)
  await page.route("**/*", async (route) => {
    const req = route.request()
    if (req.method() !== "GET") return count("not a GET request"), route.abort()
    if (!KEEP.has(req.resourceType())) return count(req.resourceType()), route.abort()
    if (!(await allowed(req.url()))) return count("robots.txt"), route.abort()
    await throttle(new URL(req.url()).host)
    return route.continue()
  })
  try {
    if (!(await allowed(url))) {
      record.status = "robots_disallowed"
    } else {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: PAGE_TIMEOUT_MS })
      record.status = res ? res.status() : "no response"
      record.final_url = page.url()
      record.content_type = res ? res.headers()["content-type"] ?? "" : ""
      // Wait for the scripts to finish, then until the number of form fields stops changing.
      await page.waitForLoadState("networkidle", { timeout: PAGE_TIMEOUT_MS }).catch(() => {})
      let fields = -1
      for (let i = 0; i < 12; i++) {
        const n = await page.evaluate(() => document.querySelectorAll("input, select, textarea").length)
        if (n === fields && n > 0) break
        fields = n
        await sleep(delay * 1000)
      }
      const parts = [await page.content()]
      for (const frame of page.frames()) if (frame !== page.mainFrame()) parts.push(await frame.content().catch(() => ""))
      const file = join(outDir, `${key.replace(/[^A-Za-z0-9_.-]+/g, "_").slice(0, 150)}.html`)
      writeFileSync(file, parts.join("\n<!-- frame -->\n"))
      record.html_file = file
    }
  } catch (error) {
    record.status = `error: ${error.name}`
  }
  await context.close()
  appendFileSync(manifest, JSON.stringify(record) + "\n")
  console.log(key, record.status, JSON.stringify(record.blocked))
}
await browser.close()
