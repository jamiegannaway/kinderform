"""Sign and verify webhook messages, following the Standard Webhooks convention.

A message has three headers:
  webhook-id         a unique identifier for the message
  webhook-timestamp  Unix time in seconds
  webhook-signature  "v1," and the base64 of an HMAC-SHA256, or several of
                     these separated by spaces (so a secret can be rotated)
The HMAC covers "{id}.{timestamp}.{body}" and uses the raw body bytes. The
secret is base64, with an optional "whsec_" prefix.

Verify rejects a timestamp more than 5 minutes from now. A receiver should also
remember recent webhook-id values and refuse a repeat; this tool does not.
Use TLS as well. Messages never contain the secret or the body.

  python3 tools/webhook_sign.py generate-secret
  python3 tools/webhook_sign.py sign   --secret-env NAME --id ID BODYFILE [--timestamp N]
  python3 tools/webhook_sign.py verify --secret-env NAME --id ID --timestamp N --signature "v1,..." BODYFILE
Read the secret from an environment variable (or --secret-file), not from the
command line. Never commit a real secret.
"""

import base64
import binascii
import hashlib
import hmac
import os
import secrets
import sys
import time
from pathlib import Path

TOLERANCE_SECONDS = 300
PREFIX = "whsec_"


class WebhookError(ValueError):
    """A content-free reason a message was refused."""


def _key(secret):
    text = secret.decode("ascii") if isinstance(secret, bytes) else secret
    text = text.strip()
    if text.startswith(PREFIX):
        text = text[len(PREFIX):]
    try:
        key = base64.b64decode(text, validate=True)
    except (binascii.Error, ValueError):
        raise WebhookError("The secret is not base64.") from None
    if not key:
        raise WebhookError("The secret is empty.")
    return key


def generate_secret():
    """A new random secret in the whsec_ form."""
    return PREFIX + base64.b64encode(secrets.token_bytes(32)).decode("ascii")


def signature(secret, msg_id, timestamp, body):
    """The 'v1,...' signature for one message. body is bytes."""
    if not isinstance(body, bytes):
        raise WebhookError("The body must be bytes: sign the raw body.")
    signed = f"{msg_id}.{int(timestamp)}.".encode("utf-8") + body
    digest = hmac.new(_key(secret), signed, hashlib.sha256).digest()
    return "v1," + base64.b64encode(digest).decode("ascii")


def sign(secrets_in, msg_id, body, timestamp=None):
    """Return the three headers. Pass a list of secrets while rotating a key."""
    if isinstance(secrets_in, (str, bytes)):
        secrets_in = [secrets_in]
    if not msg_id or any(c in msg_id for c in " .\n\r"):
        raise WebhookError("The id must not be empty or hold spaces or dots.")
    stamp = int(time.time() if timestamp is None else timestamp)
    return {
        "webhook-id": msg_id,
        "webhook-timestamp": str(stamp),
        "webhook-signature": " ".join(signature(s, msg_id, stamp, body) for s in secrets_in),
    }


def verify(secrets_in, headers, body, now=None, tolerance=TOLERANCE_SECONDS):
    """Return True, or raise WebhookError. Accepts any of several secrets and signatures."""
    if isinstance(secrets_in, (str, bytes)):
        secrets_in = [secrets_in]
    lowered = {str(k).lower(): v for k, v in headers.items()}
    try:
        msg_id = lowered["webhook-id"]
        stamp_text = lowered["webhook-timestamp"]
        offered = lowered["webhook-signature"]
    except KeyError:
        raise WebhookError("A webhook header is missing.") from None
    try:
        stamp = int(stamp_text)
    except (TypeError, ValueError):
        raise WebhookError("The timestamp is not a whole number.") from None
    current = time.time() if now is None else now
    if abs(current - stamp) > tolerance:
        raise WebhookError("The timestamp is too far from now.")
    candidates = []
    for part in str(offered).split():
        version, _, value = part.partition(",")
        if version == "v1" and value:
            candidates.append(value)
    matched = False
    for secret in secrets_in:
        expected = signature(secret, msg_id, stamp, body)[3:]
        for value in candidates:
            # Compare every candidate, so timing does not show which matched.
            if hmac.compare_digest(expected.encode("ascii"), value.encode("utf-8", "replace")):
                matched = True
    if not matched:
        raise WebhookError("No signature matches.")
    return True


def _secret_from(args):
    if "--secret-env" in args:
        value = os.environ.get(args[args.index("--secret-env") + 1], "")
    elif "--secret-file" in args:
        value = Path(args[args.index("--secret-file") + 1]).read_text(encoding="ascii")
    else:
        raise WebhookError("Give --secret-env NAME or --secret-file PATH.")
    if not value.strip():
        raise WebhookError("The secret is not set.")
    return value


def _option(args, name):
    return args[args.index(name) + 1] if name in args and args.index(name) + 1 < len(args) else None


def main(argv):
    usage = "Use: webhook_sign.py generate-secret | sign|verify --secret-env NAME --id ID [--timestamp N] [--signature S] BODYFILE"
    if not argv or argv[0] not in ("generate-secret", "sign", "verify"):
        print(usage, file=sys.stderr)
        return 2
    try:
        if argv[0] == "generate-secret":
            print(generate_secret())
            return 0
        args = argv[1:]
        body_path = args[-1] if args else None
        if body_path is None or body_path.startswith("--"):
            print(usage, file=sys.stderr)
            return 2
        body = Path(body_path).read_bytes()
        key = _secret_from(args)
        msg_id = _option(args, "--id")
        if argv[0] == "sign":
            stamp = _option(args, "--timestamp")
            headers = sign(key, msg_id or "", body, int(stamp) if stamp else None)
            for name, value in headers.items():
                print(f"{name}: {value}")
            return 0
        verify(key, {"webhook-id": msg_id or "", "webhook-timestamp": _option(args, "--timestamp") or "",
                     "webhook-signature": _option(args, "--signature") or ""}, body)
        print("The signature is valid.")
        return 0
    except WebhookError as error:
        print(str(error), file=sys.stderr)
        return 1
    except (OSError, UnicodeError):
        print("Could not read a file.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
