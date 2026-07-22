from __future__ import annotations

import json
import socket
from typing import Any
from urllib.error import HTTPError, URLError
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
