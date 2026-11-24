"""Check that the portable examples match their source wording and work without external assets."""

import base64
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from starter.offline import render_html


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.nodes = []
        self.inline = {}
        self.current = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))
        if tag in {"script", "style"}:
            self.current = tag
            self.inline[tag] = ""

    def handle_endtag(self, tag):
        if tag == self.current:
            self.current = None

    def handle_data(self, data):
        if self.current:
            self.inline[self.current] += data


def check_page(ui, schema, variant):
    html = render_html(ui, schema, variant)
    page = Page(html)
    languages = [a["lang"] for tag, a in page.nodes if tag == "html"]
    assert languages == [ui["locale"]], variant
    inputs = [a for tag, a in page.nodes if tag == "input"]
    fields = {c["scope"].split("/")[-1] for q in ui["pages"] for c in q["elements"]}
    assert {a["name"] for a in inputs} == fields, variant
    assert not any("checked" in a for a in inputs), variant
    ids = [a["id"] for _, a in page.nodes if "id" in a]
    assert len(ids) == len(set(ids)), variant
    for tag, attrs in page.nodes:
        assert tag != "form" and "src" not in attrs, (variant, tag)
        for key in ["for", "aria-labelledby", "aria-describedby"]:
            assert all(ref in ids for ref in attrs.get(key, "").split()), (variant, key)
    policy = next(a["content"] for tag, a in page.nodes if a.get("http-equiv") == "Content-Security-Policy")
    assert "connect-src 'none'" in policy and "form-action 'none'" in policy
    for raw in page.inline.values():
        digest = base64.b64encode(sha256(raw.encode()).digest()).decode()
        assert f"'sha256-{digest}'" in policy, variant


if __name__ == "__main__":
    schema = json.loads((ROOT / "schema/enquiry-submission.schema.json").read_text())
    for source in sorted((ROOT / "schema/ui").glob("enquiry-submission.*.json")):
        check_page(json.loads(source.read_text()), schema, source.name.split(".")[-2])
    print("Offline form controls, relationships, language and content policies match the source variants.")
