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
