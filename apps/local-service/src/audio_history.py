from __future__ import annotations

import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from config import workspace_root


HISTORY_LIMIT = 200
ALLOWED_KINDS = {"music-direction", "voice-plan"}
_LOCK = threading.Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def audio_history_path() -> Path:
    override = os.environ.get("KUROII_AUDIO_HISTORY_PATH", "").strip()
    return Path(override) if override else workspace_root() / "apps/local-service/data/audio-history.json"


def _read_history() -> dict[str, Any]:
    path = audio_history_path()
    if not path.is_file():
        return {"version": 1, "items": []}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"version": 1, "items": []}
    items = payload.get("items") if isinstance(payload, dict) else None
    return {"version": 1, "items": items if isinstance(items, list) else []}


def _write_history(payload: dict[str, Any]) -> None:
    path = audio_history_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def _short_text(value: Any, limit: int = 12000) -> str:
    return str(value or "").strip()[:limit]


def _clean_segments(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [_short_text(item, 1600) for item in value if _short_text(item, 1600)][:80]


def _safe_metadata(kind: str, metadata: Any) -> dict[str, str]:
    source = metadata if isinstance(metadata, dict) else {}
    allowed = (
        ("useCase", "mode")
        if kind == "music-direction"
        else ("language", "voice", "pace", "emotion")
    )
    return {key: _short_text(source.get(key), 120) for key in allowed if _short_text(source.get(key), 120)}


def _public_item(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(item.get("id") or ""),
        "kind": str(item.get("kind") or ""),
        "title": _short_text(item.get("title"), 180),
        "prompt": _short_text(item.get("prompt")),
        "blueprint": _short_text(item.get("blueprint")),
        "script": _short_text(item.get("script")),
        "segments": _clean_segments(item.get("segments")),
        "metadata": dict(item.get("metadata") or {}),
        "source": "local-planning",
        "status": "planned",
        "hasAudio": False,
        "createdAt": str(item.get("createdAt") or ""),
    }


def save_audio_plan(payload: dict[str, Any]) -> dict[str, Any]:
    kind = str(payload.get("kind") or "").strip()
    if kind not in ALLOWED_KINDS:
        raise ValueError("A supported audio plan kind is required.")
    content = payload.get("content") if isinstance(payload.get("content"), dict) else {}
    created_at = utc_now()
    item = {
        "id": f"audio-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{uuid4().hex[:8]}",
        "kind": kind,
        "title": _short_text(payload.get("title"), 180) or ("Music direction" if kind == "music-direction" else "Voice plan"),
        "prompt": _short_text(content.get("prompt")),
        "blueprint": _short_text(content.get("blueprint")),
        "script": _short_text(content.get("script")),
        "segments": _clean_segments(content.get("segments")),
        "metadata": _safe_metadata(kind, payload.get("metadata")),
        "createdAt": created_at,
    }
    with _LOCK:
        history = _read_history()
        existing = [entry for entry in history["items"] if isinstance(entry, dict)]
        history["items"] = [item, *existing][:HISTORY_LIMIT]
        _write_history(history)
    return _public_item(item)


def list_audio_history(limit: int = 24) -> list[dict[str, Any]]:
    safe_limit = min(100, max(1, int(limit)))
    with _LOCK:
        items = _read_history()["items"][:safe_limit]
    return [_public_item(item) for item in items if isinstance(item, dict)]


def get_audio_history_item(artifact_id: str) -> dict[str, Any] | None:
    with _LOCK:
        item = next((entry for entry in _read_history()["items"] if isinstance(entry, dict) and entry.get("id") == artifact_id), None)
    return _public_item(item) if item else None


def audio_history_storage_summary() -> dict[str, int]:
    with _LOCK:
        items = [entry for entry in _read_history()["items"] if isinstance(entry, dict)]
    return {"historyCount": len(items), "audioCount": 0, "plannedCount": len(items), "limit": HISTORY_LIMIT}
