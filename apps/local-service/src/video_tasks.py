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


TASK_LIMIT = 100
_LOCK = threading.Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def video_tasks_path() -> Path:
    override = os.environ.get("KUROII_VIDEO_TASKS_PATH", "").strip()
    return Path(override) if override else workspace_root() / "apps/local-service/data/video-tasks.json"


def video_output_dir() -> Path:
    override = os.environ.get("KUROII_VIDEO_OUTPUT_DIR", "").strip()
    return Path(override) if override else workspace_root() / "apps/local-service/data/generated-videos"


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


def _managed_file_path(task: dict[str, Any]) -> Path | None:
    if not task.get("saved") or not task.get("relativePath"):
        return None
    output_dir = video_output_dir().resolve()
    try:
        file_path = (workspace_root() / str(task["relativePath"])).resolve()
        file_path.relative_to(output_dir)
    except (OSError, ValueError):
        return None
    return file_path


def _remove_managed_file(task: dict[str, Any]) -> bool:
    file_path = _managed_file_path(task)
    if not file_path or not file_path.is_file():
        return False
    try:
        file_path.unlink()
    except OSError:
        return False
    return True


def create_video_task(metadata: dict[str, Any]) -> dict[str, Any]:
    created_at = str(metadata.get("createdAt") or utc_now())
    task = {
        "id": f"vid-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{uuid4().hex[:8]}",
        "providerTaskId": str(metadata.get("providerTaskId") or ""),
        "status": str(metadata.get("status") or "queued"),
        "videoUrl": str(metadata.get("videoUrl") or ""),
        "fileId": str(metadata.get("fileId") or ""),
        "fileName": str(metadata.get("fileName") or ""),
        "relativePath": str(metadata.get("relativePath") or ""),
        "mimeType": str(metadata.get("mimeType") or ""),
        "bytes": max(0, int(metadata.get("bytes") or 0)),
        "saved": bool(metadata.get("saved")),
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
    allowed = {"providerTaskId", "status", "videoUrl", "fileId", "fileName", "relativePath", "mimeType", "bytes", "saved", "diagnostics", "error"}
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


def _safe_file_name(value: Any, fallback: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9._-]+", "-", str(value or "").strip()).strip(".-")
    if not name:
        name = fallback
    if not name.lower().endswith(".mp4"):
        name = f"{name}.mp4"
    return name[:120]


def save_video_task_artifact(task_id: str, video_bytes: bytes, file_name: Any, mime_type: Any = "video/mp4") -> dict[str, Any]:
    if not video_bytes:
        raise ValueError("Video artifact cannot be empty.")
    output_dir = video_output_dir().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    safe_name = _safe_file_name(file_name, f"{task_id}.mp4")
    target = (output_dir / f"{task_id}-{safe_name}").resolve()
    try:
        target.relative_to(output_dir)
    except ValueError as exc:
        raise ValueError("Video artifact path is outside the managed output folder.") from exc
    temporary = target.with_suffix(target.suffix + ".tmp")
    temporary.write_bytes(video_bytes)
    temporary.replace(target)
    return {
        "fileName": safe_name,
        "relativePath": str(target.relative_to(workspace_root())).replace("\\", "/"),
        "mimeType": str(mime_type or "video/mp4"),
        "bytes": len(video_bytes),
        "saved": True,
    }


def list_video_tasks(limit: int = 24) -> list[dict[str, Any]]:
    safe_limit = min(100, max(1, int(limit)))
    with _LOCK:
        return [dict(item) for item in _read_tasks()["items"][:safe_limit] if isinstance(item, dict)]


def get_video_task_artifact(task_id: str) -> dict[str, Any] | None:
    task = get_video_task(task_id)
    if not task:
        return None
    file_path = _managed_file_path(task)
    if not file_path:
        return task
    if not file_path.is_file():
        task["saved"] = False
        return task
    encoded = base64.b64encode(file_path.read_bytes()).decode("ascii")
    task["videoUrl"] = f"data:{task.get('mimeType') or 'video/mp4'};base64,{encoded}"
    return task


def delete_video_tasks(task_ids: list[str]) -> dict[str, Any]:
    """Remove selected local task records and their managed video artifacts."""
    ids = {str(task_id).strip() for task_id in task_ids if str(task_id).strip()}
    if not ids:
        return {"deletedIds": [], "deletedCount": 0, "deletedFiles": 0}
    with _LOCK:
        history = _read_tasks()
        items = [entry for entry in history["items"] if isinstance(entry, dict)]
        removed = [item for item in items if str(item.get("id") or "") in ids]
        retained = [item for item in items if str(item.get("id") or "") not in ids]
        if removed:
            history["items"] = retained
            _write_tasks(history)
        return {
            "deletedIds": [str(item["id"]) for item in removed if item.get("id")],
            "deletedCount": len(removed),
            "deletedFiles": sum(1 for item in removed if _remove_managed_file(item)),
        }
