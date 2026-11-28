"""Check the frozen starter release and its extracted URLs without publishing or sending data."""
import csv
import hashlib
import io
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit
from zipfile import ZipFile

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "starter"))
from check import problems
from pack import ARCHIVE, SCHEMA_ADDRESSES, SCHEMAS, STARTER, VERSION, publish, read_json


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.files = set()

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href", "")
        dest = urlsplit(href)
        if dest.path and not dest.scheme and not dest.netloc:
            self.files.add(dest.path)


def validate(directory):
    with ZipFile(directory / ARCHIVE) as combined:
        assert combined.testzip() is None
        start = Links()
        start.feed(combined.read("START-HERE.html").decode())
        assert start.files and start.files.issubset(combined.namelist())
        keys = {name.split("/")[0] for name in start.files}
        expected = {"global", *(p.name.split(".")[1] for p in (SCHEMAS / "ui").glob("*.json"))}
        assert keys == expected
        tested = 0
        for key in sorted(keys):
            disk = directory / key
            with ZipFile(directory / f"kinderform-{key}-starter.zip") as kit:
                for name in kit.namelist():
                    assert kit.read(name) == combined.read(f"{key}/{name}") == (disk / name).read_bytes()
                links = Links()
                links.feed(kit.read("START-HERE.html").decode())
                assert links.files.issubset(kit.namelist()), (key, links.files-set(kit.namelist()))
            schema, ui = read_json(disk / "submission-schema.json"), read_json(disk / "wording.json")
            Draft202012Validator.check_schema(schema)
            validator = Draft202012Validator(schema)
            fields = {q["scope"].rsplit("/", 1)[1] for p in ui["pages"] for q in p["elements"]}
            mapping = list(csv.DictReader(io.StringIO((disk / "field-map.csv").read_text(encoding="utf-8-sig"))))
            assert {row["Field key"] for row in mapping} == fields
            assert len((disk / "questions.md").read_text()) < 6000
            for case in read_json(disk / "test-cases.json"):
                assert (not problems(case["record"], validator, ui)) == case["valid"], (key, case["name"])
                tested += 1
            if key == "global":
                assert not any("postcode" in name or name in ("zip_prefix","postal_code_fsa","contact_language")
                               for name in fields)
                assert ui["locale"] == "en"
            elif key.startswith("ca"):
                assert {"contact_language", "postal_code_fsa"} <= fields
        return len(keys), tested


if __name__ == "__main__":
    with TemporaryDirectory() as tmp:
        dest = Path(tmp)
        publish(dest)
        count, tested = validate(dest / "downloads/starter" / VERSION)
        for source, address in SCHEMA_ADDRESSES.items():
            assert (dest / "schema" / address).read_bytes() == (SCHEMAS / source).read_bytes(), address
        # Monitoring version 0.1 keeps the bytes it was published with.
        frozen = hashlib.sha256((dest / "schema/enquiry/0.1.json").read_bytes()).hexdigest()
        assert frozen == "6c28fe217901a244bccd200b11ff38f0dbdc6a510bb52406ad5b4ec0784ca032", "enquiry/0.1.json changed"
    print(f"OK: {count} starter kits, {tested} submission cases, archive links and canonical schema downloads")
