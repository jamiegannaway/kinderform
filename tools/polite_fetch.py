"""Polite fetcher for public front-door pages and forms.

Follows rule 8 in CLAUDE.md:
- respects robots.txt (a page robots.txt disallows is skipped and logged)
- identifies itself with a project URL in the User-Agent
- waits at least DELAY seconds between requests to the same site
- reads public pages with GET only and never submits a form

Usage (from the repository root):
    python tools/polite_fetch.py URL_LIST.txt OUT.jsonl [--delay 5] [--workers 8] [--save-dir DIR]

URL_LIST.txt holds one "key<TAB>url" per line. OUT.jsonl gets one JSON record
per URL: status, final URL, page title, visible text (trimmed), the fields of
every <form> on the page (labels, names, types, whether required), and
sentences that look like response-time promises. With --save-dir, PDF files
are saved there (named by key) for tools/pdf_fields.py. Raw output and saved
files are working data: keep them out of the repository, and treat downloaded
files as untrusted.

Standard library only.
"""

import argparse
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser

USER_AGENT = "OUCM-register-bot/0.1 (+https://github.com/jamiegannaway/OUCM; polite, read-only)"
TIMEOUT = 25
MAX_BYTES = 3_000_000

PROMISE = re.compile(
    r"[^.!?\n]{0,160}\bwithin\s+(?:one|two|three|four|five|seven|ten|\d{1,3})\s*"
    r"(?:-\s*\w+\s*)?(?:business\s+|working\s+)?(?:hours?|days?|weeks?)\b[^.!?\n]{0,160}[.!?]?",
    re.I,
)


class PageParser(HTMLParser):
    """Collect title, visible text and form fields."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.text: list[str] = []
        self.forms: list[dict] = []
        self._in_title = False
        self._skip = 0
        self._form = None
        self._labels: dict[str, str] = {}
        self._label_for = None
        self._label_text: list[str] = []
        self._in_label = False
        self._select = None
        self._last_text = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style", "noscript", "svg"):
            self._skip += 1
        elif tag == "title":
            self._in_title = True
        elif tag == "form":
            self._form = {"action": a.get("action", ""), "method": (a.get("method") or "get").lower(),
                          "id": a.get("id", ""), "fields": []}
            self.forms.append(self._form)
        elif tag == "label":
            self._in_label = True
            self._label_for = a.get("for")
            self._label_text = []
        elif tag in ("input", "textarea", "select"):
            ftype = a.get("type", "text" if tag != "select" else "select").lower() if tag == "input" else tag
            if ftype in ("hidden", "submit", "button", "image", "reset"):
                return
            field = {
                "tag": tag, "type": ftype, "name": a.get("name", ""), "id": a.get("id", ""),
                "placeholder": a.get("placeholder", ""), "aria_label": a.get("aria-label", ""),
                "required": "required" in a or a.get("aria-required") == "true",
                "label": " ".join(self._label_text).strip() if self._in_label else "",
                "near_text": self._last_text[-120:], "options": [],
            }
            target = self._form["fields"] if self._form is not None else self._orphans()
            target.append(field)
            if tag == "select":
                self._select = field
        elif tag == "option" and self._select is not None:
            self._select["options"].append("")

    def _orphans(self):
        # Fields outside a <form> element (common with JavaScript forms).
        if not self.forms or self.forms[-1].get("id") != "__orphans__":
            self.forms.append({"action": "", "method": "", "id": "__orphans__", "fields": []})
        return self.forms[-1]["fields"]

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg") and self._skip:
            self._skip -= 1
        elif tag == "title":
            self._in_title = False
        elif tag == "form":
            self._form = None
        elif tag == "label":
            text = " ".join(self._label_text).strip()
            if self._label_for:
                self._labels[self._label_for] = text
            self._in_label = False
        elif tag == "select":
            self._select = None

    def handle_data(self, data):
        if self._skip:
            return
        data = " ".join(data.split())
        if not data:
            return
        if self._in_title:
            self.title += data
        if self._in_label:
            self._label_text.append(data)
        if self._select is not None and self._select["options"] and not self._select["options"][-1]:
            self._select["options"][-1] = data[:60]
        self.text.append(data)
        self._last_text = data

    def finish(self):
        for form in self.forms:
            for field in form["fields"]:
                if not field["label"] and field["id"] in self._labels:
                    field["label"] = self._labels[field["id"]]
                field["options"] = [o for o in field["options"] if o][:15]


class Polite:
    def __init__(self, delay: float, save_dir: str = "") -> None:
        self.delay = delay
        self.save_dir = save_dir
        self.robots: dict[str, urllib.robotparser.RobotFileParser | None] = {}
        self.last: dict[str, float] = defaultdict(float)
        self.locks: dict[str, threading.Lock] = defaultdict(threading.Lock)
        self.guard = threading.Lock()

    def _lock(self, host: str) -> threading.Lock:
        with self.guard:
            return self.locks[host]

    def _wait(self, host: str) -> None:
        gap = time.monotonic() - self.last[host]
        if gap < self.delay:
            time.sleep(self.delay - gap)
        self.last[host] = time.monotonic()

    def _get(self, url: str) -> tuple[int, str, bytes, str]:
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*;q=0.5"},
                                         method="GET")
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
                body = response.read(MAX_BYTES)
                return response.status, response.geturl(), body, response.headers.get("Content-Type", "")
        except urllib.error.HTTPError as error:
            return error.code, url, b"", ""

    def allowed(self, url: str) -> bool:
        parts = urllib.parse.urlsplit(url)
        host = parts.netloc.lower()
        if host not in self.robots:
            robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"
            parser = urllib.robotparser.RobotFileParser()
            try:
                self._wait(host)
                status, _, body, _ = self._get(robots_url)
                if status >= 400:
                    parser.parse([])  # no robots.txt: everything allowed
                else:
                    parser.parse(body.decode("utf-8", "replace").splitlines())
                self.robots[host] = parser
            except Exception:
                self.robots[host] = None  # unreachable robots.txt: be cautious, skip the site
        parser = self.robots[host]
        return parser is not None and parser.can_fetch(USER_AGENT, url)

    def fetch(self, key: str, url: str) -> dict:
        record = {"key": key, "url": url, "fetched_at": time.strftime("%Y-%m-%d")}
        host = urllib.parse.urlsplit(url).netloc.lower()
        with self._lock(host):
            try:
                if not self.allowed(url):
                    record["status"] = "robots_disallowed"
                    return record
                self._wait(host)
                status, final, body, ctype = self._get(url)
            except Exception as error:  # network errors, timeouts
                record["status"] = f"error: {type(error).__name__}"
                return record
        record.update(status=status, final_url=final, content_type=ctype)
        is_pdf = "pdf" in ctype.lower() or body[:5] == b"%PDF-"
        if status == 200 and is_pdf and self.save_dir:
            import os
            safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", key)[:150] + ".pdf"
            path = os.path.join(self.save_dir, safe)
            with open(path, "wb") as handle:
                handle.write(body)
            record["saved_pdf"] = path
            return record
        if status != 200 or "html" not in ctype.lower():
            return record
        parser = PageParser()
        try:
            parser.feed(body.decode("utf-8", "replace"))
            parser.finish()
        except Exception:
            pass
        text = " ".join(parser.text)
        record["title"] = parser.title[:200]
        record["text"] = text[:20000]
        record["forms"] = [f for f in parser.forms if f["fields"]]
        record["promises"] = sorted({m.group(0).strip()[:300] for m in PROMISE.finditer(text)})[:10]
        return record


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("urls")
    ap.add_argument("out")
    ap.add_argument("--delay", type=float, default=5.0)
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--save-dir", default="")
    args = ap.parse_args()
    if args.delay < 3:
        print("Delay below 3 seconds is not allowed (CLAUDE.md rule 8).")
        return 2
    jobs = []
    for line in open(args.urls, encoding="utf-8"):
        if "\t" in line:
            key, url = line.rstrip("\n").split("\t", 1)
            if url.startswith(("http://", "https://")):
                jobs.append((key, url))
    polite = Polite(args.delay, args.save_dir)
    write_lock = threading.Lock()
    done = 0
    with open(args.out, "a", encoding="utf-8") as out, ThreadPoolExecutor(args.workers) as pool:
        for record in pool.map(lambda job: polite.fetch(*job), jobs):
            with write_lock:
                out.write(json.dumps(record) + "\n")
                done += 1
                if done % 50 == 0:
                    print(f"{done}/{len(jobs)}", flush=True)
    print(f"done {done}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
