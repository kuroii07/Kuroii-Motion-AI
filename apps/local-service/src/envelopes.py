from __future__ import annotations

from datetime import datetime, timezone
from time import perf_counter
from typing import Any

REQUIRED_COMMAND_FIELDS = [
    "commandId",
    "sessionId",
    "host",
    "projectId",
    "action",
    "target",
    "params",
    "riskLevel",
    "requiresConfirmation",
    "createdAt",
    "timeoutMs",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def validate_command(command: dict[str, Any]) -> list[str]:
    errors = []
    for field in REQUIRED_COMMAND_FIELDS:
        if field not in command:
            errors.append(f"missing field: {field}")
    risk = command.get("riskLevel")
    if not isinstance(risk, int) or risk < 0 or risk > 5:
        errors.append("riskLevel must be an integer from 0 to 5")
    if command.get("host") not in {"desktop", "after-effects", "premiere-pro"}:
        errors.append("host must be desktop, after-effects, or premiere-pro")
    if not isinstance(command.get("requiresConfirmation"), bool):
        errors.append("requiresConfirmation must be boolean")
    if not isinstance(command.get("timeoutMs"), int) or command.get("timeoutMs", 0) <= 0:
        errors.append("timeoutMs must be a positive integer")
    return errors


def result_envelope(command_id: str, ok: bool, code: str, message: str, data: Any = None, warnings: list[str] | None = None, start: float | None = None, snapshot_id: str | None = None) -> dict[str, Any]:
    duration = int((perf_counter() - start) * 1000) if start is not None else 0
    return {
        "commandId": command_id,
        "ok": ok,
        "code": code,
        "message": message,
        "data": data if data is not None else {},
        "warnings": warnings or [],
        "durationMs": duration,
        "snapshotId": snapshot_id,
    }
