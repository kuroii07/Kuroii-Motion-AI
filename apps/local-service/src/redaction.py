from __future__ import annotations

import re
from typing import Any

_SECRET_KEYS = {"api_key", "apikey", "apiKey", "authorization", "token", "sessionToken", "password", "secret"}
_BEARER_RE = re.compile(r"Bearer\s+[A-Za-z0-9._\-]+", re.IGNORECASE)


def redact_value(value: Any) -> Any:
    if value is None:
        return value
    text = str(value)
    if len(text) <= 8:
        return "****"
    return f"{text[:4]}…{text[-4:]}"


def redact_payload(payload: Any) -> Any:
    if isinstance(payload, dict):
        result = {}
        for key, value in payload.items():
            if key in _SECRET_KEYS or key.lower() in _SECRET_KEYS:
                result[key] = redact_value(value)
            else:
                result[key] = redact_payload(value)
        return result
    if isinstance(payload, list):
        return [redact_payload(item) for item in payload]
    if isinstance(payload, str):
        return _BEARER_RE.sub("Bearer ****", payload)
    return payload
