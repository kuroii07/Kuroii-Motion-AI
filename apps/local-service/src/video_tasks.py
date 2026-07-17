from __future__ import annotations

import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from config import workspace_root


TASK_LIMIT = 100
_LOCK = threading.Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def video_tasks_path() -> Path:
    override = os.environ.get("KUROII_VIDEO_TASKS_PATH", "").strip()
    return Path(override) if override else workspace_root() / "apps/local-service/data/video-tasks.json"


def _read_tasks() -> dict[str, Any]:
    path = video_tasks_path()
    if not path.is_file():
        return {"version": 1, "items": []}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"version": 1, "items": []}
    items = payload.get("items") if isinstance(payload, dict) else None
    return {"version": 1, "items": items if isinstance(items, list) else []}


def _write_tasks(payload: dict[str, Any]) -> None:
    path = video_tasks_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def create_video_task(metadata: dict[str, Any]) -> dict[str, Any]:
    created_at = str(metadata.get("createdAt") or utc_now())
    task = {
        "id": f"vid-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{uuid4().hex[:8]}",
        "providerTaskId": str(metadata.get("providerTaskId") or ""),
        "status": str(metadata.get("status") or "queued"),
        "videoUrl": str(metadata.get("videoUrl") or ""),
        "prompt": str(metadata.get("prompt") or ""),
        "options": dict(metadata.get("options") or {}),
        "binding": dict(metadata.get("binding") or {}),
        "providerId": str(metadata.get("providerId") or ""),
        "model": str(metadata.get("model") or ""),
        "diagnostics": dict(metadata.get("diagnostics") or {}),
        "error": None,
        "createdAt": created_at,
        "updatedAt": created_at,
    }
    with _LOCK:
        history = _read_tasks()
        history["items"] = [task, *[item for item in history["items"] if isinstance(item, dict)]][:TASK_LIMIT]
        _write_tasks(history)
    return task


def get_video_task(task_id: str) -> dict[str, Any] | None:
    with _LOCK:
        item = next((entry for entry in _read_tasks()["items"] if isinstance(entry, dict) and entry.get("id") == task_id), None)
    return dict(item) if isinstance(item, dict) else None


def update_video_task(task_id: str, changes: dict[str, Any]) -> dict[str, Any] | None:
    allowed = {"providerTaskId", "status", "videoUrl", "diagnostics", "error"}
    with _LOCK:
        history = _read_tasks()
        for item in history["items"]:
            if not isinstance(item, dict) or item.get("id") != task_id:
                continue
            for key in allowed:
                if key in changes:
                    item[key] = changes[key]
            item["updatedAt"] = utc_now()
            _write_tasks(history)
            return dict(item)
    return None


def list_video_tasks(limit: int = 24) -> list[dict[str, Any]]:
    safe_limit = min(100, max(1, int(limit)))
    with _LOCK:
        return [dict(item) for item in _read_tasks()["items"][:safe_limit] if isinstance(item, dict)]
