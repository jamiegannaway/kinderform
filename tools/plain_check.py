"""Check text on kinderform.org against the house plain language rules (docs/plain-language.md).

Reads built pages (.html) or Markdown sources (.md) and reports, for each file:
- the number of words and sentences, and the average sentence length
- sentences of 25 words or more
- words from the "avoid" list

Direct quotations, code and source citations are skipped. A checker cannot tell whether a
page works for real readers; it only catches the easy things.

Run, after building the site:
    python tools/plain_check.py site/dist
    python tools/plain_check.py evidence/library.md --long
Add --strict to exit with an error when any long sentence or avoided word is found.
"""

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

LONG = 25
AVOID = {
    r"\butilis": "use",
    r"\bfacilitat": "help",
    r"\bcommenc": "start",
    r"\bin order to\b": "to",
    r"\bprior to\b": "before",
    r"\bregarding\b": "about",
    r"\bfirst-contact\b": "enquiry form or first contact",
    r"\bunverified\b": "not yet checked by a person",
    r"\brubric\b": "checklist",
    r"\bcrawler\b": "a computer program that reads public web pages",
    r"\bIFAs?\b": "independent agency",
    r"\bRAAs?\b": "regional adoption agency",
    r"\blocal authorit": "council",
}
BLOCKS = {"p", "li", "h1", "h2", "h3", "h4", "td", "th", "dt", "dd", "summary", "figcaption", "caption",
          "label", "legend", "tr", "br", "title", "div", "section", "header", "footer", "nav", "main", "article"}
SKIP = {"script", "style", "svg", "blockquote", "code", "pre", "cite", "q"}


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks, self.buf, self.skip = [], [], 0

    def handle_starttag(self, tag, attrs):
        if tag in SKIP:
            self.skip += 1
        if tag in BLOCKS:
            self.flush()

    def handle_endtag(self, tag):
        if tag in SKIP:
            self.skip = max(0, self.skip - 1)
        if tag in BLOCKS:
            self.flush()

    def handle_data(self, data):
        if not self.skip:
            self.buf.append(data)

    def flush(self):
        t = " ".join("".join(self.buf).split())
        if t:
            self.blocks.append(t)
        self.buf = []


def html_blocks(path: Path) -> list[str]:
    p = Text()
    p.feed(path.read_text(encoding="utf-8"))
    p.flush()
    return p.blocks


def md_blocks(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    out = []
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith((">", "|", "<!--", "---")):
            continue
        s = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", s)  # links and images keep their text
        s = re.sub(r"`[^`]*`", "x", s)
        s = re.sub(r"^#+\s*|^[-*]\s+|^\d+\.\s+|\*\*|__|\*", "", s)
        out.append(s)
    return out


def is_citation(s: str) -> bool:
    return bool(re.search(r"https?://|\(\d{4}[a-z]?\)|\bet al\b|\bpp?\.\s*\d|\bdoi\b", s, re.I)) or s.count('"') >= 2 or s.count("“") >= 1


def sentences(blocks: list[str]) -> list[str]:
    out = []
    for b in blocks:
        for s in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9“\"'(])", b):
            if len(s.split()) >= 3 and not is_citation(s):
                out.append(s)
    return out


def check(path: Path, show_long: bool) -> int:
    blocks = html_blocks(path) if path.suffix == ".html" else md_blocks(path)
    sents = sentences(blocks)
    words = sum(len(b.split()) for b in blocks)
    lens = [len(s.split()) for s in sents]
    long = [s for s in sents if len(s.split()) >= LONG]
    avoid = []
    for b in blocks:
        for pat, use in AVOID.items():
            for m in re.finditer(pat, b, re.I if not pat.startswith(r"\bIFA") and not pat.startswith(r"\bRAA") else 0):
                avoid.append(f"'{m.group(0)}' (use: {use})")
    avg = sum(lens) / len(lens) if lens else 0
    print(f"{path}: {words} words, {len(sents)} sentences, average {avg:.1f} words, "
          f"{len(long)} of {LONG}+ words, {len(avoid)} avoided words")
    if show_long:
        for s in long:
            print(f"  long ({len(s.split())}): {s}")
    for a in sorted(set(avoid)):
        print(f"  avoid: {a} x{avoid.count(a)}")
    return len(long) + len(avoid)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="+", type=Path)
    ap.add_argument("--long", action="store_true", help="list each long sentence")
    ap.add_argument("--strict", action="store_true", help="exit 1 when anything is flagged")
    args = ap.parse_args()
    files = []
    for p in args.paths:
        files += sorted(p.rglob("*.html")) + sorted(p.rglob("*.md")) if p.is_dir() else [p]
    problems = sum(check(f, args.long) for f in files)
    sys.exit(1 if args.strict and problems else 0)


if __name__ == "__main__":
    main()
