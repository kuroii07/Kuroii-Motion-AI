from __future__ import annotations

import json
import socket
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

from openai_protocol_adapter import (
    AdapterError,
    endpoint_url,
    image_export_spec,
    map_http_error,
    normalized_headers,
    render_image_export,
    request_timeout_seconds,
)


def _minimax_error(payload: Any) -> AdapterError | None:
    base_response = payload.get("base_resp") if isinstance(payload, dict) else None
    if not isinstance(base_response, dict):
        return None
    try:
        status_code = int(base_response.get("status_code", 0) or 0)
    except (TypeError, ValueError):
        status_code = 0
    if status_code == 0:
        return None
    message = str(base_response.get("status_msg") or "MiniMax rejected the request.")
    if status_code in {1004, 2049}:
        return AdapterError("AUTH_INVALID_KEY", "auth", message, 401)
    if status_code == 1002:
        return AdapterError("RATE_LIMITED", "auth", message, 429)
    return AdapterError("PROVIDER_RESPONSE_INVALID", "generation", message, 502)


def generate_image(config: dict[str, Any], model: str, prompt: Any, options: Any = None) -> dict[str, Any]:
    model_id = str(model or "").strip()
    prompt_text = str(prompt or "").strip()
    if model_id not in {"image-01", "image-01-live"}:
        raise AdapterError("MODEL_NOT_FOUND", "model", "MiniMax image generation requires image-01 or image-01-live.", 404)
    if not prompt_text:
        raise AdapterError("CONFIG_MISSING", "config", "An image prompt is required.", 400)

    export_spec = image_export_spec(options)
    request_body: dict[str, Any] = {
        "model": model_id,
        "prompt": prompt_text,
        "aspect_ratio": export_spec["aspectRatio"],
        "response_format": "url",
        "n": 1,
    }
    if isinstance(options, dict) and options.get("promptOptimizer") is not None:
        request_body["prompt_optimizer"] = bool(options["promptOptimizer"])

    endpoint = endpoint_url(str(config.get("baseUrl", "")), "/v1/image_generation", "MiniMax image generation")
    request = Request(
        endpoint,
        data=json.dumps(request_body, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={**normalized_headers("minimax", config), "Content-Type": "application/json"},
    )
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            status, raw = int(response.status), response.read()
    except HTTPError as exc:
        raise map_http_error(int(exc.code), "MiniMax image endpoint") from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", "MiniMax image request timed out.", 504) from None
    except (URLError, OSError) as exc:
        if isinstance(getattr(exc, "reason", None), (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", "MiniMax image request timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "MiniMax could not be reached.", 502) from None
    if status < 200 or status >= 300:
        raise map_http_error(status, "MiniMax image endpoint")
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax returned invalid image JSON.", 502) from None
    error = _minimax_error(payload)
    if error:
        raise error
    data = payload.get("data") if isinstance(payload, dict) else None
    if not isinstance(data, dict):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax image response contains no data.", 502)
    image_urls = data.get("image_urls")
    image_url = str(image_urls[0]).strip() if isinstance(image_urls, list) and image_urls else ""
    response_format = "url"
    if not image_url:
        encoded_images = data.get("image_base64")
        encoded = str(encoded_images[0]).strip() if isinstance(encoded_images, list) and encoded_images else ""
        if not encoded:
            raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax image response contains no image.", 502)
        image_url = f"data:image/png;base64,{encoded}"
        response_format = "base64"
    image_url, export = render_image_export(image_url, export_spec)
    metadata = payload.get("metadata") if isinstance(payload, dict) and isinstance(payload.get("metadata"), dict) else {}
    return {
        "imageUrl": image_url,
        "revisedPrompt": "",
        "usage": metadata,
        "export": export,
        "endpoint": endpoint,
        "httpStatus": status,
        "responseFormat": response_format,
        "protocol": "minimax",
    }


def _audio_format(options: Any) -> str:
    value = str(options.get("format") or "mp3").lower().strip() if isinstance(options, dict) else "mp3"
    if value not in {"mp3", "wav", "flac"}:
        raise AdapterError("CONFIG_INVALID", "config", "MiniMax audio format must be mp3, wav, or flac.", 400)
    return value


def _post_minimax_json(config: dict[str, Any], path: str, body: dict[str, Any], label: str) -> tuple[int, dict[str, Any], str]:
    endpoint = endpoint_url(str(config.get("baseUrl", "")), path, label)
    request = Request(
        endpoint,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={**normalized_headers("minimax", config), "Content-Type": "application/json"},
    )
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            status, raw = int(response.status), response.read()
    except HTTPError as exc:
        raise map_http_error(int(exc.code), label) from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", f"{label} timed out.", 504) from None
    except (URLError, OSError) as exc:
        if isinstance(getattr(exc, "reason", None), (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", f"{label} timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", f"{label} could not be reached.", 502) from None
    if status < 200 or status >= 300:
        raise map_http_error(status, label)
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", f"{label} returned invalid JSON.", 502) from None
    error = _minimax_error(payload)
    if error:
        raise error
    return status, payload, endpoint


def _get_minimax_json(config: dict[str, Any], path: str, query: dict[str, str], label: str) -> tuple[int, dict[str, Any], str]:
    endpoint = endpoint_url(str(config.get("baseUrl", "")), path, label)
    url = f"{endpoint}?{urlencode(query)}" if query else endpoint
    request = Request(url, method="GET", headers=normalized_headers("minimax", config))
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            status, raw = int(response.status), response.read()
    except HTTPError as exc:
        raise map_http_error(int(exc.code), label) from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", f"{label} timed out.", 504) from None
    except (URLError, OSError) as exc:
        if isinstance(getattr(exc, "reason", None), (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", f"{label} timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", f"{label} could not be reached.", 502) from None
    if status < 200 or status >= 300:
        raise map_http_error(status, label)
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", f"{label} returned invalid JSON.", 502) from None
    error = _minimax_error(payload)
    if error:
        raise error
    return status, payload, url


def _video_options(model: str, options: Any) -> tuple[int, str]:
    opts = options if isinstance(options, dict) else {}
    try:
        duration = int(opts.get("durationSeconds") or 6)
    except (TypeError, ValueError):
        raise AdapterError("CONFIG_INVALID", "config", "MiniMax video duration must be a whole number of seconds.", 400) from None
    requested_resolution = str(opts.get("resolution") or "768p").strip().upper()
    resolution = {"720P": "720P", "768P": "768P", "1080P": "1080P"}.get(requested_resolution)
    if not resolution:
        raise AdapterError("CONFIG_INVALID", "config", "MiniMax video resolution must be 720p, 768p, or 1080p.", 400)
    hailuo_models = {"MiniMax-Hailuo-2.3", "MiniMax-Hailuo-02"}
    if model in hailuo_models:
        if duration not in {6, 10}:
            raise AdapterError("CONFIG_INVALID", "config", "This MiniMax Hailuo model supports 6 or 10 second clips.", 400)
        if resolution not in {"768P", "1080P"}:
            raise AdapterError("CONFIG_INVALID", "config", "This MiniMax Hailuo model supports 768p or 1080p output.", 400)
    elif duration != 6:
        raise AdapterError("CONFIG_INVALID", "config", "This MiniMax video model supports 6 second clips only.", 400)
    elif resolution != "720P":
        raise AdapterError("CONFIG_INVALID", "config", "This MiniMax video model supports 720p output only.", 400)
    return duration, resolution


def submit_video(config: dict[str, Any], model: str, prompt: Any, options: Any = None) -> dict[str, Any]:
    model_id = str(model or "").strip()
    supported_models = {"MiniMax-Hailuo-2.3", "MiniMax-Hailuo-02", "T2V-01-Director", "T2V-01"}
    if model_id not in supported_models:
        raise AdapterError("MODEL_NOT_FOUND", "model", "MiniMax video generation requires a supported Hailuo or T2V model.", 404)
    prompt_text = str(prompt or "").strip()
    if not prompt_text:
        raise AdapterError("CONFIG_MISSING", "config", "A MiniMax video prompt is required.", 400)
    if len(prompt_text) > 2000:
        raise AdapterError("CONFIG_INVALID", "config", "MiniMax video prompts must be 2000 characters or fewer.", 400)
    duration, resolution = _video_options(model_id, options)
    opts = options if isinstance(options, dict) else {}
    body: dict[str, Any] = {"model": model_id, "prompt": prompt_text, "duration": duration, "resolution": resolution}
    if opts.get("promptOptimizer") is not None:
        body["prompt_optimizer"] = bool(opts["promptOptimizer"])
    status, payload, endpoint = _post_minimax_json(config, "/v1/video_generation", body, "MiniMax video generation")
    task_id = str(payload.get("task_id") or "").strip()
    if not task_id:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax video response contains no task ID.", 502)
    return {"providerTaskId": task_id, "status": "queued", "videoUrl": "", "endpoint": endpoint, "httpStatus": status, "protocol": "minimax"}


def _download_video(config: dict[str, Any], download_url: str) -> tuple[bytes, str]:
    parsed = urlparse(download_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax returned an invalid video download URL.", 502)
    request = Request(download_url, method="GET", headers={"User-Agent": "Kuroii-Motion-AI/0.3"})
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            raw = response.read()
            mime_type = str(response.headers.get_content_type() or "video/mp4")
    except HTTPError as exc:
        raise map_http_error(int(exc.code), "MiniMax video file download") from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", "MiniMax video file download timed out.", 504) from None
    except (URLError, OSError) as exc:
        if isinstance(getattr(exc, "reason", None), (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", "MiniMax video file download timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "MiniMax video file could not be downloaded.", 502) from None
    if not raw:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax video download is empty.", 502)
    return raw, mime_type if mime_type.startswith("video/") else "video/mp4"


def poll_video(config: dict[str, Any], provider_task_id: str) -> dict[str, Any]:
    task_id = str(provider_task_id or "").strip()
    if not task_id:
        raise AdapterError("CONFIG_MISSING", "generation", "A MiniMax video task ID is required.", 400)
    status, payload, endpoint = _get_minimax_json(config, "/v1/query/video_generation", {"task_id": task_id}, "MiniMax video status")
    provider_status = str(payload.get("status") or "").strip().lower()
    normalized_status = {
        "preparing": "queued", "queueing": "queued", "processing": "processing",
        "success": "succeeded", "fail": "failed", "failed": "failed",
    }.get(provider_status)
    if not normalized_status:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax returned an unknown video task status.", 502)
    result: dict[str, Any] = {"providerTaskId": str(payload.get("task_id") or task_id), "status": normalized_status, "videoUrl": "", "endpoint": endpoint, "httpStatus": status, "protocol": "minimax"}
    if normalized_status != "succeeded":
        return result
    file_id = str(payload.get("file_id") or "").strip()
    if not file_id:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax completed the video task without a file ID.", 502)
    _, file_payload, file_endpoint = _get_minimax_json(config, "/v1/files/retrieve", {"file_id": file_id}, "MiniMax video file lookup")
    file_data = file_payload.get("file") if isinstance(file_payload.get("file"), dict) else {}
    download_url = str(file_data.get("download_url") or "").strip()
    if not download_url:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "MiniMax video file lookup contains no download URL.", 502)
    video_bytes, mime_type = _download_video(config, download_url)
    result.update({
        "videoUrl": download_url,
        "fileId": file_id,
        "fileName": str(file_data.get("filename") or f"{file_id}.mp4"),
        "mimeType": mime_type,
        "videoBytes": video_bytes,
        "fileLookupEndpoint": file_endpoint,
    })
    return result


def _audio_response(payload: dict[str, Any], audio_format: str, label: str) -> dict[str, Any]:
    data = payload.get("data") if isinstance(payload, dict) else None
    if not isinstance(data, dict) or data.get("status") not in {2, "2"}:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", f"{label} did not complete successfully.", 502)
    encoded_audio = data.get("audio") if isinstance(data, dict) else None
    if not isinstance(encoded_audio, str) or not encoded_audio.strip():
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", f"{label} response contains no audio.", 502)
    try:
        audio_bytes = bytes.fromhex(encoded_audio.strip())
    except ValueError:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", f"{label} response audio is not valid hex.", 502) from None
    if not audio_bytes:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", f"{label} response audio is empty.", 502)
    extra_info = payload.get("extra_info") if isinstance(payload.get("extra_info"), dict) else {}
    return {
        "audioBytes": audio_bytes,
        "format": audio_format,
        "usage": extra_info,
        "traceId": str(payload.get("trace_id") or ""),
    }


def generate_music(config: dict[str, Any], model: str, prompt: Any, lyrics: Any = None, options: Any = None) -> dict[str, Any]:
    model_id = str(model or "").strip()
    if model_id not in {"music-3.0", "music-2.6", "music-3.0-free", "music-2.6-free"}:
        raise AdapterError("MODEL_NOT_FOUND", "model", "MiniMax music generation requires a supported music-3.0 or music-2.6 model.", 404)
    prompt_text = str(prompt or "").strip()
    lyrics_text = str(lyrics or "").strip()
    opts = options if isinstance(options, dict) else {}
    is_instrumental = bool(opts.get("isInstrumental", True))
    if not prompt_text:
        raise AdapterError("CONFIG_MISSING", "config", "A MiniMax music prompt is required.", 400)
    if not is_instrumental and not lyrics_text and not bool(opts.get("lyricsOptimizer")):
        raise AdapterError("CONFIG_MISSING", "config", "Lyrics are required for a vocal MiniMax music request unless lyrics optimization is enabled.", 400)
    audio_format = _audio_format(opts)
    audio_setting = {
        "format": audio_format,
        "sample_rate": int(opts.get("sampleRate") or 44100),
        "bitrate": int(opts.get("bitrate") or 256000),
    }
    body: dict[str, Any] = {
        "model": model_id,
        "prompt": prompt_text[:2000],
        "stream": False,
        "output_format": "hex",
        "is_instrumental": is_instrumental,
        "audio_setting": audio_setting,
    }
    if lyrics_text:
        body["lyrics"] = lyrics_text[:3500]
    if bool(opts.get("lyricsOptimizer")):
        body["lyrics_optimizer"] = True
    status, payload, endpoint = _post_minimax_json(config, "/v1/music_generation", body, "MiniMax music generation")
    return {
        **_audio_response(payload, audio_format, "MiniMax music generation"),
        "endpoint": endpoint,
        "httpStatus": status,
        "protocol": "minimax",
        "request": {"isInstrumental": is_instrumental, "format": audio_format},
    }


def generate_voice(config: dict[str, Any], model: str, text: Any, options: Any = None) -> dict[str, Any]:
    model_id = str(model or "").strip()
    if model_id not in {"speech-2.8-hd", "speech-2.8-turbo", "speech-2.6-hd", "speech-2.6-turbo", "speech-02-hd", "speech-02-turbo", "speech-01-hd", "speech-01-turbo"}:
        raise AdapterError("MODEL_NOT_FOUND", "model", "MiniMax voice generation requires a supported speech model.", 404)
    text_value = str(text or "").strip()
    if not text_value:
        raise AdapterError("CONFIG_MISSING", "config", "Voice text is required.", 400)
    if len(text_value) >= 10000:
        raise AdapterError("CONFIG_INVALID", "config", "MiniMax voice text must contain fewer than 10000 characters.", 400)
    opts = options if isinstance(options, dict) else {}
    voice_id = str(opts.get("voiceId") or "").strip()
    if not voice_id:
        raise AdapterError("CONFIG_MISSING", "config", "A MiniMax voice ID is required.", 400)
    audio_format = _audio_format(opts)
    body: dict[str, Any] = {
        "model": model_id,
        "text": text_value,
        "stream": False,
        "output_format": "hex",
        "voice_setting": {
            "voice_id": voice_id,
            "speed": float(opts.get("speed") or 1),
            "vol": float(opts.get("volume") or 1),
            "pitch": int(opts.get("pitch") or 0),
            "emotion": str(opts.get("emotion") or "neutral"),
        },
        "audio_setting": {
            "format": audio_format,
            "sample_rate": int(opts.get("sampleRate") or 32000),
            "bitrate": int(opts.get("bitrate") or 128000),
            "channel": 1,
        },
    }
    language_boost = str(opts.get("languageBoost") or "").strip()
    if language_boost:
        body["language_boost"] = language_boost
    status, payload, endpoint = _post_minimax_json(config, "/v1/t2a_v2", body, "MiniMax voice generation")
    return {
        **_audio_response(payload, audio_format, "MiniMax voice generation"),
        "endpoint": endpoint,
        "httpStatus": status,
        "protocol": "minimax",
        "request": {"voiceId": voice_id, "format": audio_format},
    }
