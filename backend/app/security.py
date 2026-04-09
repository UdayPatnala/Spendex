from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import UTC, datetime, timedelta

from .config import settings

PBKDF2_ITERATIONS = 120_000


def _b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("utf-8").rstrip("=")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"{salt.hex()}:{derived.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt_hex, digest_hex = hashed_password.split(":", maxsplit=1)
    except ValueError:
        return False
    salt = bytes.fromhex(salt_hex)
    expected = bytes.fromhex(digest_hex)
    actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return hmac.compare_digest(actual, expected)


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    expires_at = datetime.now(UTC) + timedelta(minutes=expires_minutes or settings.token_expire_minutes)
    payload = {"sub": subject, "exp": expires_at.timestamp()}
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    signature = hmac.new(settings.secret_key.encode("utf-8"), payload_bytes, hashlib.sha256).digest()
    return f"{_b64url_encode(payload_bytes)}.{_b64url_encode(signature)}"


def decode_access_token(token: str) -> dict[str, str | float]:
    payload_part, signature_part = token.split(".", maxsplit=1)
    payload_bytes = _b64url_decode(payload_part)
    expected_signature = hmac.new(settings.secret_key.encode("utf-8"), payload_bytes, hashlib.sha256).digest()
    provided_signature = _b64url_decode(signature_part)
    if not hmac.compare_digest(expected_signature, provided_signature):
        raise ValueError("Invalid token signature")
    payload = json.loads(payload_bytes)
    if float(payload["exp"]) < datetime.now(UTC).timestamp():
        raise ValueError("Token expired")
    return payload
