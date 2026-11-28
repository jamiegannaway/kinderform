"""Give each starter kit release a Git tag, so the source link in its credits works.

Every kit's CREDITS.txt links to https://github.com/jamiegannaway/kinderform/tree/<version>.
That link only works when a tag with that name exists. This tool finds each release folder in
starter/releases/ that has no tag, and names the commit that last changed its archive: the
source those bytes were built from.

  python3 tools/tag_releases.py            list the tags that are missing, and their commits
  python3 tools/tag_releases.py --create   also make the tags in this clone, and print their names

It never moves or removes a tag, and it does not push. The workflow
.github/workflows/tag-releases.yml runs it and pushes the new tags.
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RELEASES = ROOT / "starter" / "releases"
ARCHIVE = "kinderform-all-starters.zip"
# A folder name must look like a version before it becomes a tag name.
VERSION = re.compile(r"v\d+\.\d+\.\d+(-draft\.\d+)?")


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True, text=True).stdout.strip()


def missing():
    """Return (version, commit) for each release with an archive and no tag, oldest name first."""
    tags = set(git("tag", "--list").split())
    found = []
    for folder in sorted(RELEASES.iterdir()):
        archive = folder / ARCHIVE
        if not VERSION.fullmatch(folder.name) or not archive.is_file() or folder.name in tags:
            continue
        commit = git("log", "-1", "--format=%H", "--", str(archive.relative_to(ROOT)))
        if commit:
            found.append((folder.name, commit))
    return found


def main(argv):
    if argv not in ([], ["--create"]):
        print("Use: tag_releases.py [--create]", file=sys.stderr)
        return 2
    for version, commit in missing():
        if argv:
            git("tag", version, commit)
            print(version)
        else:
            print(f"{version} has no tag. Its archive was built at {commit[:7]}.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
