from __future__ import annotations

from copy import deepcopy
from threading import RLock
from typing import Any

from envelopes import now_iso
from redaction import redact_payload

MAX_HISTORY_ITEMS = 200

_lock = RLock()
_history: list[dict[str, Any]] = []


def record_command(command: dict[str, Any] | None, result: dict[str, Any], http_status: int) -> dict[str, Any]:
    safe_command = redact_payload(command or {})
    safe_result = deepcopy(result)
    record = {
        "recordedAt": now_iso(),
        "commandId": safe_result.get("commandId") or safe_command.get("commandId", "unknown"),
        "sessionId": safe_command.get("sessionId"),
        "host": safe_command.get("host"),
        "action": safe_command.get("action"),
        "riskLevel": safe_command.get("riskLevel"),
        "requiresConfirmation": safe_command.get("requiresConfirmation"),
        "httpStatus": http_status,
        "ok": safe_result.get("ok", False),
        "code": safe_result.get("code"),
        "message": safe_result.get("message"),
        "durationMs": safe_result.get("durationMs", 0),
        "snapshotId": safe_result.get("snapshotId"),
        "command": safe_command,
        "result": safe_result,
    }
    with _lock:
        _history.append(record)
        if len(_history) > MAX_HISTORY_ITEMS:
            del _history[:-MAX_HISTORY_ITEMS]
    return deepcopy(record)


def list_command_history(limit: int = 50, host: str | None = None, action: str | None = None, ok: bool | None = None) -> list[dict[str, Any]]:
    safe_limit = max(1, min(int(limit), MAX_HISTORY_ITEMS))
    with _lock:
        records = list(reversed(_history))
    if host:
        records = [item for item in records if item.get("host") == host]
    if action:
        records = [item for item in records if item.get("action") == action]
    if ok is not None:
        records = [item for item in records if item.get("ok") is ok]
    return deepcopy(records[:safe_limit])


def get_command_record(command_id: str) -> dict[str, Any] | None:
    with _lock:
        for item in reversed(_history):
            if item.get("commandId") == command_id:
                return deepcopy(item)
    return None
