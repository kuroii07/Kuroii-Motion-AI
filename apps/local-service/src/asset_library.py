from __future__ import annotations

from datetime import datetime
from typing import Any

from audio_history import delete_audio_history_items, get_audio_history_item, get_audio_history_media_file, list_audio_history
from image_history import delete_image_history_items, get_image_history_item, get_image_history_media_file, list_image_history
from video_tasks import delete_video_tasks, get_video_task_artifact, get_video_task_media_file, list_video_tasks


ASSET_TYPES = {"image", "audio", "video"}


def _text(value: Any, limit: int = 180) -> str:
    return str(value or "").strip()[:limit]


def _timestamp(value: Any) -> float:
    try:
        return datetime.fromisoformat(str(value or "").replace("Z", "+00:00")).timestamp()
    except ValueError:
        return 0.0


def _image_asset(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "assetType": "image",
        "id": _text(item.get("id"), 120),
        "kind": "image",
        "title": _text(item.get("prompt")) or "Generated image",
        "status": "ready" if item.get("saved") else "reference",
        "createdAt": _text(item.get("createdAt"), 80),
        "providerId": _text(item.get("providerId"), 80),
        "model": _text(item.get("model"), 120),
        "fileName": _text(item.get("fileName"), 160),
        "mimeType": _text(item.get("mimeType"), 80),
        "bytes": max(0, int(item.get("bytes") or 0)),
        "saved": bool(item.get("saved")),
    }


def _audio_asset(item: dict[str, Any]) -> dict[str, Any]:
    audio_kind = _text(item.get("kind"), 80)
    is_generated = bool(item.get("hasAudio"))
    title = _text(item.get("title")) or ("Generated music" if audio_kind == "music" else "Generated voice")
    return {
        "assetType": "audio",
        "id": _text(item.get("id"), 120),
        "kind": audio_kind,
        "title": title,
        "status": "ready" if is_generated and item.get("saved") else ("planned" if not is_generated else "missing"),
        "createdAt": _text(item.get("createdAt"), 80),
        "providerId": _text(item.get("providerId"), 80),
        "model": _text(item.get("model"), 120),
        "fileName": _text(item.get("fileName"), 160),
        "mimeType": _text(item.get("mimeType"), 80),
        "bytes": max(0, int(item.get("bytes") or 0)),
        "saved": bool(item.get("saved")),
        "hasMedia": is_generated,
        "metadata": dict(item.get("metadata") or {}),
    }


def _video_asset(task: dict[str, Any]) -> dict[str, Any]:
    return {
        "assetType": "video",
        "id": _text(task.get("id"), 120),
        "kind": "video",
        "title": _text(task.get("prompt")) or "Generated video",
        "status": _text(task.get("status"), 40) or "queued",
        "createdAt": _text(task.get("createdAt"), 80),
        "providerId": _text(task.get("providerId"), 80),
        "model": _text(task.get("model"), 120),
        "fileName": _text(task.get("fileName"), 160),
        "mimeType": _text(task.get("mimeType"), 80),
        "bytes": max(0, int(task.get("bytes") or 0)),
        "saved": bool(task.get("saved")),
        "hasMedia": bool(task.get("saved")),
    }


def list_assets(limit: int = 60, asset_type: str = "all") -> list[dict[str, Any]]:
    safe_limit = min(100, max(1, int(limit)))
    selected_type = str(asset_type or "all").strip().lower()
    sources: list[dict[str, Any]] = []
    if selected_type in {"all", "image"}:
        sources.extend(_image_asset(item) for item in list_image_history(100))
    if selected_type in {"all", "audio"}:
        sources.extend(_audio_asset(item) for item in list_audio_history(100))
    if selected_type in {"all", "video"}:
        sources.extend(_video_asset(item) for item in list_video_tasks(100))
    return sorted(sources, key=lambda item: _timestamp(item.get("createdAt")), reverse=True)[:safe_limit]


def get_asset(asset_type: str, asset_id: str) -> dict[str, Any] | None:
    normalized_type = str(asset_type or "").lower()
    if normalized_type == "image":
        item = get_image_history_item(asset_id, include_data_url=False)
    elif normalized_type == "audio":
        item = get_audio_history_item(asset_id, include_data_url=False)
    elif normalized_type == "video":
        item = get_video_task_artifact(asset_id, include_data_url=False)
    else:
        return None
    if not item:
        return None
    # The asset detail route is metadata-only.  Do not leak legacy provider URLs
    # or data URLs from individual history stores into renderer JSON.
    detail = {key: value for key, value in item.items() if key not in {"imageUrl", "audioUrl", "videoUrl"}}
    return {"asset": {"image": _image_asset, "audio": _audio_asset, "video": _video_asset}[normalized_type](item), "detail": detail}


def get_asset_media(asset_type: str, asset_id: str) -> tuple[Any, str] | None:
    """Resolve a managed media file for streaming, never for JSON embedding."""
    normalized_type = str(asset_type or "").lower()
    if normalized_type == "image":
        return get_image_history_media_file(asset_id)
    if normalized_type == "audio":
        return get_audio_history_media_file(asset_id)
    if normalized_type == "video":
        return get_video_task_media_file(asset_id)
    return None


def delete_asset(asset_type: str, asset_id: str) -> dict[str, Any] | None:
    normalized_type = str(asset_type or "").lower()
    if normalized_type == "image":
        return delete_image_history_items([asset_id])
    if normalized_type == "audio":
        return delete_audio_history_items([asset_id])
    if normalized_type == "video":
        return delete_video_tasks([asset_id])
    return None
