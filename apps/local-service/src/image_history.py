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
DATA_URL_PATTERN = re.compile(r"^data:(image/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$")
_LOCK = threading.Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def image_output_dir() -> Path:
    override = os.environ.get("KUROII_IMAGE_OUTPUT_DIR", "").strip()
    return Path(override) if override else workspace_root() / "apps/local-service/data/generated-images"


def image_history_path() -> Path:
    override = os.environ.get("KUROII_IMAGE_HISTORY_PATH", "").strip()
    return Path(override) if override else workspace_root() / "apps/local-service/data/image-history.json"


def _read_history() -> dict[str, Any]:
    path = image_history_path()
    if not path.is_file():
        return {"version": 1, "items": []}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"version": 1, "items": []}
    items = payload.get("items") if isinstance(payload, dict) else None
    return {"version": 1, "items": items if isinstance(items, list) else []}


def _write_history(payload: dict[str, Any]) -> None:
    path = image_history_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def _safe_slug(value: str, fallback: str = "image") -> str:
    slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip()).strip("-").lower()
    return (slug or fallback)[:48]


def _public_item(item: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in item.items() if key not in {"sourceUrl"}}


def _managed_file_path(item: dict[str, Any]) -> Path | None:
    if not item.get("saved") or not item.get("path"):
        return None
    output_dir = image_output_dir().resolve()
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


def _storage_summary(items: list[dict[str, Any]]) -> dict[str, int]:
    saved_items = [item for item in items if item.get("saved")]
    missing_count = sum(1 for item in saved_items if not (_managed_file_path(item) or Path()).is_file())
    return {
        "historyCount": len(items),
        "savedCount": len(saved_items),
        "missingCount": missing_count,
        "bytes": sum(max(0, int(item.get("bytes") or 0)) for item in saved_items),
        "limit": HISTORY_LIMIT,
    }


def save_generated_image(image_url: str, metadata: dict[str, Any]) -> dict[str, Any]:
    created_at = str(metadata.get("generatedAt") or utc_now())
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    model = str(metadata.get("model") or "image")
    artifact_id = f"img-{timestamp}-{uuid4().hex[:8]}"
    item: dict[str, Any] = {
        "id": artifact_id,
        "fileName": "",
        "path": "",
        "relativePath": "",
        "mimeType": "",
        "bytes": 0,
        "saved": False,
        "prompt": str(metadata.get("prompt") or ""),
        "revisedPrompt": str(metadata.get("revisedPrompt") or ""),
        "options": dict(metadata.get("options") or {}),
        "export": dict(metadata.get("export") or {}),
        "binding": dict(metadata.get("binding") or {}),
        "diagnostics": dict(metadata.get("diagnostics") or {}),
        "providerId": str(metadata.get("providerId") or ""),
        "model": model,
        "createdAt": created_at,
    }
    match = DATA_URL_PATTERN.fullmatch(str(image_url or "").strip())
    if match:
        mime_type, encoded = match.groups()
        extension = "jpg" if mime_type == "image/jpeg" else mime_type.split("/", 1)[1]
        file_name = f"{timestamp}-{_safe_slug(model)}-{uuid4().hex[:6]}.{extension}"
        output_dir = image_output_dir()
        output_dir.mkdir(parents=True, exist_ok=True)
        file_path = output_dir / file_name
        data = base64.b64decode(encoded, validate=True)
        temporary = file_path.with_suffix(file_path.suffix + ".tmp")
        temporary.write_bytes(data)
        temporary.replace(file_path)
        item.update({
            "fileName": file_name,
            "path": str(file_path.resolve()),
            "relativePath": file_name,
            "mimeType": mime_type,
            "bytes": len(data),
            "saved": True,
        })
    elif str(image_url or "").startswith(("https://", "http://")):
        item["sourceUrl"] = str(image_url)

    with _LOCK:
        history = _read_history()
        previous_items = [entry for entry in history["items"] if isinstance(entry, dict)]
        history["items"] = [item, *previous_items][:HISTORY_LIMIT]
        _write_history(history)
        for expired in previous_items[HISTORY_LIMIT - 1:]:
            _remove_managed_file(expired)
    return _public_item(item)


def list_image_history(limit: int = 24) -> list[dict[str, Any]]:
    safe_limit = min(100, max(1, int(limit)))
    with _LOCK:
        items = _read_history()["items"][:safe_limit]
    return [_public_item(item) for item in items if isinstance(item, dict)]


def image_history_storage_summary() -> dict[str, int]:
    with _LOCK:
        items = [entry for entry in _read_history()["items"] if isinstance(entry, dict)]
        return _storage_summary(items)


def delete_image_history_items(artifact_ids: list[str]) -> dict[str, Any]:
    ids = {str(artifact_id).strip() for artifact_id in artifact_ids if str(artifact_id).strip()}
    if not ids:
        return {"deletedIds": [], "deletedCount": 0, "deletedFiles": 0, "storage": image_history_storage_summary()}
    with _LOCK:
        history = _read_history()
        items = [entry for entry in history["items"] if isinstance(entry, dict)]
        removed = [item for item in items if str(item.get("id") or "") in ids]
        retained = [item for item in items if str(item.get("id") or "") not in ids]
        if removed:
            history["items"] = retained
            _write_history(history)
        deleted_files = sum(1 for item in removed if _remove_managed_file(item))
        return {
            "deletedIds": [str(item["id"]) for item in removed if item.get("id")],
            "deletedCount": len(removed),
            "deletedFiles": deleted_files,
            "storage": _storage_summary(retained),
        }


def cleanup_missing_image_history_files() -> dict[str, Any]:
    with _LOCK:
        history = _read_history()
        items = [entry for entry in history["items"] if isinstance(entry, dict)]
        missing = [item for item in items if item.get("saved") and not (_managed_file_path(item) or Path()).is_file()]
        if missing:
            missing_ids = {str(item.get("id") or "") for item in missing}
            retained = [item for item in items if str(item.get("id") or "") not in missing_ids]
            history["items"] = retained
            _write_history(history)
        else:
            retained = items
        return {
            "removedIds": [str(item["id"]) for item in missing if item.get("id")],
            "removedCount": len(missing),
            "storage": _storage_summary(retained),
        }


def get_image_history_item(artifact_id: str, include_data_url: bool = True) -> dict[str, Any] | None:
    with _LOCK:
        item = next((entry for entry in _read_history()["items"] if isinstance(entry, dict) and entry.get("id") == artifact_id), None)
    if not item:
        return None
    result = _public_item(item)
    if item.get("saved") and item.get("path"):
        file_path = _managed_file_path(item)
        if not file_path:
            return None
        if not file_path.is_file():
            result["saved"] = False
            return result
        if include_data_url:
            encoded = base64.b64encode(file_path.read_bytes()).decode("ascii")
            result["imageUrl"] = f"data:{item.get('mimeType') or 'image/png'};base64,{encoded}"
    elif include_data_url and item.get("sourceUrl"):
        result["imageUrl"] = item["sourceUrl"]
    return result


def get_image_history_media_file(artifact_id: str) -> tuple[Path, str] | None:
    """Return a verified managed image file without reading it into memory."""
    with _LOCK:
        item = next((entry for entry in _read_history()["items"] if isinstance(entry, dict) and entry.get("id") == artifact_id), None)
    if not item:
        return None
    file_path = _managed_file_path(item)
    if not file_path or not file_path.is_file():
        return None
    return file_path, str(item.get("mimeType") or "image/png")
