"""Bind an existing source check to the finding text and source URL it covers.

A digest prevents accidental reuse of a stale check; it is not evidence of review.
Only a person may record a new check. Edited findings must clear their checks first.
"""

import hashlib
import json


def claim_digest(finding: dict, source: dict) -> str:
    payload = json.dumps(
        [finding["title"], finding["summary"], source["url"]],
        ensure_ascii=False, separators=(",", ":"),
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def check_is_current(finding: dict, source: dict) -> bool:
    checked = source.get("checked")
    return checked is None or checked.get("claim_sha256") == claim_digest(finding, source)
