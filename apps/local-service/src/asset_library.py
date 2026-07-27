from __future__ import annotations

from datetime import datetime
from functools import lru_cache
from io import BytesIO
import os
from pathlib import Path
import shutil
import subprocess
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


THUMBNAIL_SIZE = (480, 300)


def _thumbnail_image_bytes(image: Any) -> tuple[bytes, str]:
    from PIL import Image

    image.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
    output = BytesIO()
    if "A" in image.getbands():
        image.convert("RGBA").save(output, format="PNG", optimize=True)
        return output.getvalue(), "image/png"
    image.convert("RGB").save(output, format="JPEG", quality=82, optimize=True)
    return output.getvalue(), "image/jpeg"


@lru_cache(maxsize=48)
def _image_thumbnail_bytes(path_text: str, modified_ns: int) -> tuple[bytes, str] | None:
    """Encode a bounded thumbnail so galleries never decode source-size images."""
    del modified_ns  # Keeps the cache invalid when a managed file changes.
    try:
        from PIL import Image, ImageOps

        with Image.open(path_text) as source:
            image = ImageOps.exif_transpose(source)
            return _thumbnail_image_bytes(image)
    except (ImportError, OSError, ValueError):
        return None


def _cover_background() -> Any:
    from PIL import Image

    return Image.new("RGB", THUMBNAIL_SIZE, "#19212a")


@lru_cache(maxsize=48)
def _audio_waveform_thumbnail_bytes(path_text: str, modified_ns: int) -> tuple[bytes, str] | None:
    """Create a bounded waveform cover from the managed audio file bytes."""
    del modified_ns
    try:
        from PIL import ImageDraw

        raw = Path(path_text).read_bytes()[:1_500_000]
        if not raw:
            return None
        image = _cover_background()
        draw = ImageDraw.Draw(image)
        width, height = image.size
        center = height // 2
        draw.line((0, center, width, center), fill="#30404d", width=1)
        bars = 96
        bucket_size = max(1, len(raw) // bars)
        for index in range(bars):
            bucket = raw[index * bucket_size:(index + 1) * bucket_size]
            if not bucket:
                break
            amplitude = sum(abs(sample - 128) for sample in bucket) / (len(bucket) * 128)
            bar_height = max(8, int((height - 64) * min(1, amplitude * 1.45)))
            x = int((index + 0.5) * width / bars)
            color = "#28bfe0" if index % 8 else "#6cd8ed"
            draw.line((x, center - bar_height // 2, x, center + bar_height // 2), fill=color, width=3)
        draw.text((18, 16), "AUDIO", fill="#b7c7d4")
        output = BytesIO()
        image.save(output, format="PNG", optimize=True)
        return output.getvalue(), "image/png"
    except (ImportError, OSError, ValueError):
        return None


def _ffmpeg_path() -> str | None:
    configured = os.environ.get("KUROII_FFMPEG_PATH", "").strip()
    if configured and Path(configured).is_file():
        return configured
    return shutil.which("ffmpeg")


@lru_cache(maxsize=48)
def _video_first_frame_thumbnail_bytes(path_text: str, modified_ns: int) -> tuple[bytes, str] | None:
    """Extract one frame with ffmpeg when it is locally available."""
    del modified_ns
    ffmpeg = _ffmpeg_path()
    if not ffmpeg:
        return None
    try:
        result = subprocess.run(
            [ffmpeg, "-v", "error", "-i", path_text, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "mjpeg", "pipe:1"],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=10,
            check=False,
        )
        if result.returncode != 0 or not result.stdout:
            return None
        from PIL import Image, ImageOps

        with Image.open(BytesIO(result.stdout)) as source:
            return _thumbnail_image_bytes(ImageOps.exif_transpose(source))
    except (ImportError, OSError, subprocess.SubprocessError, ValueError):
        return None


@lru_cache(maxsize=48)
def _video_poster_thumbnail_bytes(path_text: str, modified_ns: int) -> tuple[bytes, str] | None:
    """Use a clear local video cover when a first frame is unavailable."""
    del path_text, modified_ns
    try:
        from PIL import ImageDraw

        image = _cover_background()
        draw = ImageDraw.Draw(image)
        width, height = image.size
        draw.rounded_rectangle((24, 24, width - 24, height - 24), radius=14, outline="#38505e", width=2)
        triangle = [(width // 2 - 20, height // 2 - 30), (width // 2 - 20, height // 2 + 30), (width // 2 + 34, height // 2)]
        draw.polygon(triangle, fill="#2abfe0")
        draw.text((18, 16), "VIDEO", fill="#b7c7d4")
        draw.text((18, height - 36), "NO FRAME", fill="#8395a5")
        output = BytesIO()
        image.save(output, format="PNG", optimize=True)
        return output.getvalue(), "image/png"
    except (ImportError, OSError, ValueError):
        return None


def get_asset_thumbnail(asset_type: str, asset_id: str) -> tuple[bytes, str] | None:
    """Return a compact real-media preview without embedding it in list JSON."""
    normalized_type = str(asset_type or "").lower()
    media = get_asset_media(normalized_type, asset_id)
    if not media:
        return None
    file_path, _mime_type = media
    try:
        modified_ns = file_path.stat().st_mtime_ns
    except OSError:
        return None
    path_text = str(file_path)
    if normalized_type == "image":
        return _image_thumbnail_bytes(path_text, modified_ns)
    if normalized_type == "audio":
        return _audio_waveform_thumbnail_bytes(path_text, modified_ns)
    if normalized_type == "video":
        return _video_first_frame_thumbnail_bytes(path_text, modified_ns) or _video_poster_thumbnail_bytes(path_text, modified_ns)
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
