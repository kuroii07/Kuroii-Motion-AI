from __future__ import annotations

import base64
import json
import os
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from config import workspace_root


HISTORY_LIMIT = 200
PLANNING_KINDS = {"music-direction", "voice-plan"}
GENERATED_KINDS = {"music", "voice"}
ALLOWED_KINDS = PLANNING_KINDS | GENERATED_KINDS
AUDIO_TYPES = {
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "flac": "audio/flac",
}
_LOCK = threading.Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def audio_history_path() -> Path:
    override = os.environ.get("KUROII_AUDIO_HISTORY_PATH", "").strip()
    return Path(override) if override else workspace_root() / "apps/local-service/data/audio-history.json"


def audio_output_dir() -> Path:
    override = os.environ.get("KUROII_AUDIO_OUTPUT_DIR", "").strip()
    return Path(override) if override else workspace_root() / "apps/local-service/data/generated-audio"


def _read_history() -> dict[str, Any]:
    path = audio_history_path()
    if not path.is_file():
        return {"version": 2, "items": []}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"version": 2, "items": []}
    items = payload.get("items") if isinstance(payload, dict) else None
    return {"version": 2, "items": items if isinstance(items, list) else []}


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


def _safe_slug(value: str, fallback: str = "audio") -> str:
    slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip()).strip("-").lower()
    return (slug or fallback)[:48]


def _managed_file_path(item: dict[str, Any]) -> Path | None:
    if not item.get("hasAudio") or not item.get("path"):
        return None
    output_dir = audio_output_dir().resolve()
    try:
        file_path = Path(str(item["path"])).resolve()
        file_path.relative_to(output_dir)
    except (OSError, ValueError):
        return None
    return file_path


def _remove_managed_file(item: dict[str, Any]) -> bool:
    file_path = _managed_file_path(item)
    if not file_path or not file_path.is_file():
        return False
    try:
        file_path.unlink()
    except OSError:
        return False
    return True


def _public_item(item: dict[str, Any]) -> dict[str, Any]:
    is_audio = bool(item.get("hasAudio"))
    result = {
        "id": str(item.get("id") or ""),
        "kind": str(item.get("kind") or ""),
        "title": _short_text(item.get("title"), 180),
        "prompt": _short_text(item.get("prompt")),
        "blueprint": _short_text(item.get("blueprint")),
        "script": _short_text(item.get("script")),
        "segments": _clean_segments(item.get("segments")),
        "metadata": dict(item.get("metadata") or {}),
        "source": "provider" if is_audio else "local-planning",
        "status": "completed" if is_audio else "planned",
        "hasAudio": is_audio,
        "createdAt": str(item.get("createdAt") or ""),
    }
    if is_audio:
        result.update({
            "fileName": str(item.get("fileName") or ""),
            "relativePath": str(item.get("relativePath") or ""),
            "mimeType": str(item.get("mimeType") or "audio/mpeg"),
            "bytes": max(0, int(item.get("bytes") or 0)),
            "saved": bool(item.get("saved")),
            "providerId": str(item.get("providerId") or ""),
            "model": str(item.get("model") or ""),
            "binding": dict(item.get("binding") or {}),
            "diagnostics": dict(item.get("diagnostics") or {}),
        })
    return result


def _storage_summary(items: list[dict[str, Any]]) -> dict[str, int]:
    audio_items = [item for item in items if item.get("hasAudio")]
    planned_items = [item for item in items if not item.get("hasAudio")]
    missing_count = sum(1 for item in audio_items if not (_managed_file_path(item) or Path()).is_file())
    return {
        "historyCount": len(items),
        "audioCount": len(audio_items),
        "plannedCount": len(planned_items),
        "missingCount": missing_count,
        "bytes": sum(max(0, int(item.get("bytes") or 0)) for item in audio_items),
        "limit": HISTORY_LIMIT,
    }


def save_audio_plan(payload: dict[str, Any]) -> dict[str, Any]:
    kind = str(payload.get("kind") or "").strip()
    if kind not in PLANNING_KINDS:
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


def save_generated_audio(audio_bytes: bytes, metadata: dict[str, Any]) -> dict[str, Any]:
    kind = str(metadata.get("kind") or "").strip()
    if kind not in GENERATED_KINDS:
        raise ValueError("A generated audio kind is required.")
    if not audio_bytes:
        raise ValueError("Generated audio data is required.")
    audio_format = str(metadata.get("format") or "mp3").lower().strip()
    if audio_format not in AUDIO_TYPES:
        raise ValueError("Unsupported generated audio format.")
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    model = _short_text(metadata.get("model"), 120) or kind
    artifact_id = f"aud-{timestamp}-{uuid4().hex[:8]}"
    file_name = f"{timestamp}-{_safe_slug(model)}-{uuid4().hex[:6]}.{audio_format}"
    output_dir = audio_output_dir()
    output_dir.mkdir(parents=True, exist_ok=True)
    file_path = output_dir / file_name
    temporary = file_path.with_suffix(file_path.suffix + ".tmp")
    temporary.write_bytes(audio_bytes)
    temporary.replace(file_path)
    item = {
        "id": artifact_id,
        "kind": kind,
        "title": _short_text(metadata.get("title"), 180) or ("Generated music" if kind == "music" else "Generated voice"),
        "prompt": _short_text(metadata.get("prompt")),
        "blueprint": "",
        "script": _short_text(metadata.get("script")),
        "segments": _clean_segments(metadata.get("segments")),
        "metadata": {key: _short_text(value, 180) for key, value in dict(metadata.get("metadata") or {}).items() if key in {"format", "durationMs", "language", "voiceId"}},
        "fileName": file_name,
        "path": str(file_path.resolve()),
        "relativePath": file_name,
        "mimeType": AUDIO_TYPES[audio_format],
        "bytes": len(audio_bytes),
        "saved": True,
        "hasAudio": True,
        "providerId": _short_text(metadata.get("providerId"), 80),
        "model": model,
        "binding": dict(metadata.get("binding") or {}),
        "diagnostics": dict(metadata.get("diagnostics") or {}),
        "createdAt": str(metadata.get("generatedAt") or utc_now()),
    }
    with _LOCK:
        history = _read_history()
        previous_items = [entry for entry in history["items"] if isinstance(entry, dict)]
        history["items"] = [item, *previous_items][:HISTORY_LIMIT]
        _write_history(history)
        for expired in previous_items[HISTORY_LIMIT - 1:]:
            _remove_managed_file(expired)
    return _public_item(item)


def list_audio_history(limit: int = 24) -> list[dict[str, Any]]:
    safe_limit = min(100, max(1, int(limit)))
    with _LOCK:
        items = _read_history()["items"][:safe_limit]
    return [_public_item(item) for item in items if isinstance(item, dict)]


def get_audio_history_item(artifact_id: str) -> dict[str, Any] | None:
    with _LOCK:
        item = next((entry for entry in _read_history()["items"] if isinstance(entry, dict) and entry.get("id") == artifact_id), None)
    if not item:
        return None
    result = _public_item(item)
    if item.get("hasAudio"):
        file_path = _managed_file_path(item)
        if not file_path:
            return None
        if not file_path.is_file():
            result["saved"] = False
            return result
        encoded = base64.b64encode(file_path.read_bytes()).decode("ascii")
        result["audioUrl"] = f"data:{item.get('mimeType') or 'audio/mpeg'};base64,{encoded}"
    return result


def audio_history_storage_summary() -> dict[str, int]:
    with _LOCK:
        items = [entry for entry in _read_history()["items"] if isinstance(entry, dict)]
    return _storage_summary(items)
