from __future__ import annotations

import base64
import json
import os
import re
import socket
from dataclasses import dataclass
from io import BytesIO
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageOps, UnidentifiedImageError


@dataclass(frozen=True)
class AdapterError(Exception):
    code: str
    stage: str
    message: str
    status: int


HEADER_NAME_PATTERN = re.compile(r"^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$")
IMAGE_DATA_URL_PATTERN = re.compile(r"^data:image/(?:png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$", re.IGNORECASE)
IMAGE_ASPECT_RATIOS = {
    "1:1": (1, 1), "16:9": (16, 9), "9:16": (9, 16), "21:9": (21, 9), "4:3": (4, 3),
    "3:4": (3, 4), "3:2": (3, 2), "2:3": (2, 3), "5:4": (5, 4), "4:5": (4, 5),
}
IMAGE_OUTPUT_LONG_EDGES = {"1k": 1024, "2k": 2048, "4k": 4096}
PROVIDER_PROTOCOLS = {
    "openai": "openai",
    "deepseek": "openai-compatible",
    "openai-compatible": "openai-compatible",
}


def provider_protocol(provider_id: str) -> str:
    return PROVIDER_PROTOCOLS.get(provider_id, "openai-compatible")


def parsed_origin(parsed: Any) -> tuple[str, str, int]:
    try:
        port = parsed.port or (443 if parsed.scheme == "https" else 80)
    except ValueError:
        raise AdapterError("CONFIG_INVALID", "config", "Provider URL contains an invalid port.", 400) from None
    return parsed.scheme.lower(), str(parsed.hostname or "").lower(), int(port)


def request_timeout_seconds(config: dict[str, Any] | None = None) -> float:
    configured = (config or {}).get("timeoutSeconds")
    if configured is not None:
        try:
            value = float(configured)
        except (TypeError, ValueError):
            raise AdapterError("CONFIG_INVALID", "config", "Request timeout must be a number.", 400) from None
        if value < 1 or value > 180:
            raise AdapterError("CONFIG_INVALID", "config", "Request timeout must be between 1 and 180 seconds.", 400)
        return value
    try:
        return max(0.1, min(float(os.environ.get("KUROII_PROVIDER_TIMEOUT_SECONDS", "120")), 180.0))
    except ValueError:
        return 120.0


def endpoint_url(base_url: str, endpoint_path: str, endpoint_name: str) -> str:
    value = base_url.strip().rstrip("/")
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.fragment or parsed.username or parsed.password:
        raise AdapterError("BASE_URL_UNREACHABLE", "config", "Base URL must be a valid http(s) URL.", 400)
    base_origin = parsed_origin(parsed)
    path_value = str(endpoint_path or "").strip()
    if not path_value or "\r" in path_value or "\n" in path_value:
        raise AdapterError("CONFIG_INVALID", "config", f"{endpoint_name} path is invalid.", 400)
    path_parsed = urlparse(path_value)
    if path_parsed.scheme or path_parsed.netloc:
        if (
            path_parsed.scheme not in {"http", "https"}
            or not path_parsed.netloc
            or path_parsed.fragment
            or path_parsed.username
            or path_parsed.password
        ):
            raise AdapterError("CONFIG_INVALID", "config", f"{endpoint_name} endpoint must be a valid http(s) URL.", 400)
        if parsed_origin(path_parsed) != base_origin:
            raise AdapterError("CONFIG_INVALID", "config", f"{endpoint_name} endpoint must use the same origin as Base URL.", 400)
        return path_value
    if path_parsed.fragment:
        raise AdapterError("CONFIG_INVALID", "config", f"{endpoint_name} path must not contain a fragment.", 400)
    relative_path = path_value.lstrip("/")
    if not relative_path:
        raise AdapterError("CONFIG_INVALID", "config", f"{endpoint_name} path is required.", 400)
    path_without_query = relative_path.split("?", 1)[0].rstrip("/")
    if parsed.path.rstrip("/").endswith(f"/{path_without_query}"):
        return value
    return f"{value}/{relative_path}"


def models_url(base_url: str, models_path: str = "/models") -> str:
    return endpoint_url(base_url, models_path, "Models")


def chat_completions_url(base_url: str, chat_path: str = "/chat/completions") -> str:
    return endpoint_url(base_url, chat_path, "Chat completions")


def images_generations_url(base_url: str, images_path: str = "/images/generations") -> str:
    return endpoint_url(base_url, images_path, "Image generations")


def video_generations_url(base_url: str, video_path: str = "/videos/generations") -> str:
    return endpoint_url(base_url, video_path, "Video generations")


def video_status_url(base_url: str, status_path: str, task_id: str) -> str:
    safe_task_id = quote(str(task_id or "").strip(), safe="")
    if not safe_task_id:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider video response contains no task ID.", 502)
    template = str(status_path or "/videos/generations/{taskId}").strip()
    if "{taskId}" not in template:
        template = template.rstrip("/") + "/{taskId}"
    return endpoint_url(base_url, template.replace("{taskId}", safe_task_id), "Video status")


def sanitize_custom_headers(custom_headers: Any) -> dict[str, str]:
    if custom_headers is None or custom_headers == "":
        return {}
    if not isinstance(custom_headers, dict):
        raise AdapterError("CONFIG_INVALID", "config", "Custom headers must be a key/value object.", 400)
    sanitized: dict[str, str] = {}
    for key, value in custom_headers.items():
        header_name = str(key).strip()
        header_value = "" if value is None else str(value).strip()
        if not header_name:
            continue
        if header_name.lower() == "authorization":
            continue
        if not HEADER_NAME_PATTERN.fullmatch(header_name):
            raise AdapterError("CONFIG_INVALID", "config", f"Invalid custom header name: {header_name}", 400)
        if "\r" in header_value or "\n" in header_value:
            raise AdapterError("CONFIG_INVALID", "config", f"Invalid custom header value: {header_name}", 400)
        sanitized[header_name] = header_value
    return sanitized


def default_capabilities(config: dict[str, Any]) -> list[str]:
    value = config.get("defaultCapabilities", ["text"])
    if not isinstance(value, list):
        raise AdapterError("CONFIG_INVALID", "config", "Default capabilities must be a list.", 400)
    capabilities: list[str] = []
    for item in value:
        capability = str(item).strip()
        if capability and capability not in capabilities:
            capabilities.append(capability)
    return capabilities or ["text"]


def inferred_capabilities(provider_id: str, model_id: str, config: dict[str, Any]) -> list[str]:
    lowered = model_id.lower()
    if any(marker in lowered for marker in ["gpt-image", "dall-e", "image-"]):
        return ["image"]
    if any(marker in lowered for marker in ["video", "sora", "veo", "kling", "wan2", "hailuo"]):
        return ["video"]
    if any(marker in lowered for marker in ["whisper", "transcribe"]):
        return ["speech"]
    if any(marker in lowered for marker in ["tts", "audio", "realtime"]):
        return ["voice"]
    if any(marker in lowered for marker in ["vision", "-vl", "vl-", "5v-"]):
        return ["text", "vision"]
    if provider_id == "openai-compatible":
        return default_capabilities(config)
    if provider_id == "deepseek":
        return ["text", "reasoning"] if "reasoner" in lowered or lowered.endswith("-r1") else ["text"]
    capabilities = ["text"]
    if any(marker in lowered for marker in ["gpt-4.1", "gpt-4o", "gpt-4.5", "o3", "o4"]):
        capabilities.append("vision")
    return capabilities


def normalized_headers(provider_id: str, config: dict[str, Any]) -> dict[str, str]:
    headers = {
        "Accept": "application/json",
        "User-Agent": "Kuroii-Motion-AI-Local-Service/0.3.4",
    }
    api_key = str(config.get("apiKey", "") or "")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    if provider_id == "openai":
        organization = str(config.get("organization", "") or "").strip()
        if organization:
            headers.update(sanitize_custom_headers({"OpenAI-Organization": organization}))
    headers.update(sanitize_custom_headers(config.get("headers")))
    return headers


def map_http_error(status: int, endpoint_name: str = "Provider endpoint") -> AdapterError:
    if status in {401, 403}:
        return AdapterError("AUTH_INVALID_KEY", "auth", "Provider rejected the API key.", status)
    if status == 404:
        return AdapterError("BASE_URL_UNREACHABLE", "network", f"{endpoint_name} was not found.", status)
    if status == 429:
        return AdapterError("RATE_LIMITED", "auth", "Provider rate limit or quota was reached.", status)
    if status >= 500:
        return AdapterError("PROVIDER_UNAVAILABLE", "network", "Provider service is temporarily unavailable.", 502)
    return AdapterError("PROVIDER_RESPONSE_INVALID", "network", f"Provider returned HTTP {status}.", 502)


def parse_models(provider_id: str, payload: Any, config: dict[str, Any]) -> list[dict[str, Any]]:
    if isinstance(payload, dict):
        raw_models = payload.get("data", payload.get("models"))
    else:
        raw_models = payload
    if not isinstance(raw_models, list):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "model", "Provider model response does not contain a model list.", 502)
    models = []
    for item in raw_models:
        if isinstance(item, str):
            model_id = item.strip()
            if model_id:
                models.append({
                    "id": model_id,
                    "label": model_id,
                    "capabilities": inferred_capabilities(provider_id, model_id, config),
                })
            continue
        if not isinstance(item, dict):
            continue
        model_id = str(item.get("id") or item.get("model") or item.get("name") or "").strip()
        if not model_id:
            continue
        capabilities = item.get("capabilities")
        models.append({
            "id": model_id,
            "label": str(item.get("label") or item.get("name") or model_id),
            "capabilities": capabilities if isinstance(capabilities, list) and capabilities else inferred_capabilities(provider_id, model_id, config),
            "ownedBy": item.get("owned_by") or item.get("ownedBy"),
        })
    if not models:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "model", "Provider returned an empty or invalid model list.", 502)
    return models


def normalized_messages(messages: Any) -> list[dict[str, Any]]:
    if not isinstance(messages, list) or not messages:
        raise AdapterError("CONFIG_INVALID", "config", "At least one chat message is required.", 400)
    normalized: list[dict[str, Any]] = []
    allowed_roles = {"developer", "system", "user", "assistant"}
    for item in messages:
        if not isinstance(item, dict):
            raise AdapterError("CONFIG_INVALID", "config", "Each chat message must be an object.", 400)
        role = str(item.get("role", "")).strip()
        content = item.get("content")
        if role not in allowed_roles:
            raise AdapterError("CONFIG_INVALID", "config", f"Unsupported chat role: {role or 'empty'}", 400)
        if not isinstance(content, (str, list)) or (isinstance(content, str) and not content.strip()):
            raise AdapterError("CONFIG_INVALID", "config", "Each chat message must contain text or content parts.", 400)
        normalized.append({"role": role, "content": content})
    return normalized


def normalized_generation_options(provider_id: str, options: Any) -> dict[str, Any]:
    if options is None:
        return {}
    if not isinstance(options, dict):
        raise AdapterError("CONFIG_INVALID", "config", "Generation options must be an object.", 400)
    result: dict[str, Any] = {}
    if options.get("temperature") is not None:
        try:
            temperature = float(options["temperature"])
        except (TypeError, ValueError):
            raise AdapterError("CONFIG_INVALID", "config", "Temperature must be a number.", 400) from None
        if temperature < 0 or temperature > 2:
            raise AdapterError("CONFIG_INVALID", "config", "Temperature must be between 0 and 2.", 400)
        result["temperature"] = temperature
    if options.get("maxTokens") is not None:
        try:
            max_tokens = int(options["maxTokens"])
        except (TypeError, ValueError):
            raise AdapterError("CONFIG_INVALID", "config", "Max tokens must be an integer.", 400) from None
        if max_tokens < 1 or max_tokens > 128000:
            raise AdapterError("CONFIG_INVALID", "config", "Max tokens must be between 1 and 128000.", 400)
        token_field = "max_completion_tokens" if provider_id == "openai" else "max_tokens"
        result[token_field] = max_tokens
    if options.get("stop") is not None:
        stop = options["stop"]
        if not isinstance(stop, (str, list)):
            raise AdapterError("CONFIG_INVALID", "config", "Stop must be a string or list.", 400)
        result["stop"] = stop
    return result


def normalized_image_options(options: Any) -> dict[str, Any]:
    if options is None:
        return {}
    if not isinstance(options, dict):
        raise AdapterError("CONFIG_INVALID", "config", "Image options must be an object.", 400)
    result: dict[str, Any] = {}
    allowed = {
        "size": {"auto", "1024x1024", "1536x1024", "1024x1536"},
        "quality": {"auto", "low", "medium", "high"},
        "background": {"auto", "opaque", "transparent"},
        "outputFormat": {"png", "jpeg", "webp"},
    }
    for source_key, values in allowed.items():
        if options.get(source_key) is None:
            continue
        value = str(options[source_key]).strip().lower()
        if value not in values:
            raise AdapterError("CONFIG_INVALID", "config", f"Unsupported image {source_key}: {value}", 400)
        target_key = "output_format" if source_key == "outputFormat" else source_key
        result[target_key] = value
    return result


def normalized_video_options(options: Any) -> dict[str, Any]:
    if options is None:
        return {}
    if not isinstance(options, dict):
        raise AdapterError("CONFIG_INVALID", "config", "Video options must be an object.", 400)
    result: dict[str, Any] = {}
    if options.get("durationSeconds") is not None:
        try:
            duration = int(options["durationSeconds"])
        except (TypeError, ValueError):
            raise AdapterError("CONFIG_INVALID", "config", "Video duration must be an integer.", 400) from None
        if duration < 1 or duration > 60:
            raise AdapterError("CONFIG_INVALID", "config", "Video duration must be between 1 and 60 seconds.", 400)
        result["seconds"] = duration
    if options.get("aspectRatio") is not None:
        aspect_ratio = str(options["aspectRatio"]).strip()
        if aspect_ratio not in IMAGE_ASPECT_RATIOS:
            raise AdapterError("CONFIG_INVALID", "config", f"Unsupported video aspect ratio: {aspect_ratio}", 400)
        result["aspect_ratio"] = aspect_ratio
    if options.get("resolution") is not None:
        resolution = str(options["resolution"]).strip().lower()
        if resolution not in {"480p", "720p", "1080p"}:
            raise AdapterError("CONFIG_INVALID", "config", f"Unsupported video resolution: {resolution}", 400)
        result["resolution"] = resolution
    return result


def image_export_spec(options: Any) -> dict[str, Any]:
    if options is None:
        options = {}
    if not isinstance(options, dict):
        raise AdapterError("CONFIG_INVALID", "config", "Image options must be an object.", 400)
    aspect_ratio = str(options.get("aspectRatio") or "1:1").strip()
    output_resolution = str(options.get("outputResolution") or "1k").strip().lower()
    if aspect_ratio not in IMAGE_ASPECT_RATIOS:
        raise AdapterError("CONFIG_INVALID", "config", f"Unsupported image aspect ratio: {aspect_ratio}", 400)
    if output_resolution not in IMAGE_OUTPUT_LONG_EDGES:
        raise AdapterError("CONFIG_INVALID", "config", f"Unsupported image output resolution: {output_resolution}", 400)
    width_ratio, height_ratio = IMAGE_ASPECT_RATIOS[aspect_ratio]
    long_edge = IMAGE_OUTPUT_LONG_EDGES[output_resolution]
    if width_ratio >= height_ratio:
        width = long_edge
        height = max(2, round(long_edge * height_ratio / width_ratio))
    else:
        height = long_edge
        width = max(2, round(long_edge * width_ratio / height_ratio))
    width += width % 2
    height += height % 2
    source_size = "1024x1024" if width_ratio == height_ratio else ("1536x1024" if width_ratio > height_ratio else "1024x1536")
    return {
        "aspectRatio": aspect_ratio,
        "outputResolution": output_resolution,
        "width": width,
        "height": height,
        "sourceSize": source_size,
    }


def render_image_export(image_url: str, export_spec: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    result = {**export_spec, "mode": "provider-native", "postProcessed": False, "sourceWidth": None, "sourceHeight": None}
    matched = IMAGE_DATA_URL_PATTERN.fullmatch(str(image_url or "").strip())
    if not matched:
        return image_url, result
    try:
        source_bytes = base64.b64decode(matched.group(1), validate=True)
        if len(source_bytes) > 25 * 1024 * 1024:
            raise ValueError("source image is too large")
        with Image.open(BytesIO(source_bytes)) as source:
            result["sourceWidth"], result["sourceHeight"] = source.size
            rendered = ImageOps.fit(source, (export_spec["width"], export_spec["height"]), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
            if "A" in rendered.getbands():
                rendered = rendered.convert("RGBA")
            else:
                rendered = rendered.convert("RGB")
            buffer = BytesIO()
            rendered.save(buffer, format="PNG", optimize=True)
    except (UnidentifiedImageError, ValueError, OSError) as exc:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", f"Could not prepare the generated image for export: {exc}", 502) from None
    result["mode"] = "local-upscale" if max(export_spec["width"], export_spec["height"]) > max(result["sourceWidth"], result["sourceHeight"]) else "local-crop"
    result["postProcessed"] = (result["sourceWidth"], result["sourceHeight"]) != (export_spec["width"], export_spec["height"])
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}", result


def response_text(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "".join(response_text(item) for item in value)
    if isinstance(value, dict):
        # OpenAI-compatible gateways are not fully uniform here.  In
        # particular, Responses-style content parts use `output_text`, while
        # some reasoning models return an object with a nested `text` value.
        # Only inspect known text-bearing keys so metadata is never rendered.
        for key in ("text", "output_text", "content", "value"):
            text = response_text(value.get(key))
            if text:
                return text
    return ""


def first_response_text(payload: dict[str, Any], keys: tuple[str, ...]) -> str:
    for key in keys:
        text = response_text(payload.get(key))
        if text:
            return text
    return ""


def parse_chat_completion(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider returned an invalid chat response.", 502)
    choices = payload.get("choices")
    if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider chat response does not contain a choice.", 502)
    choice = choices[0]
    message = choice.get("message")
    if not isinstance(message, dict):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider chat response does not contain a message.", 502)
    content = first_response_text(message, ("content", "output_text", "text"))
    # `reasoning_content` is used by DeepSeek.  Other compatible providers
    # commonly expose the same data through `reasoning` or `reasoningContent`.
    reasoning = first_response_text(message, ("reasoning_content", "reasoning", "reasoningContent"))
    if not content:
        # Legacy completion-style gateways may keep text on the choice rather
        # than inside `choice.message`.
        content = first_response_text(choice, ("text", "output_text"))
    if not content and not reasoning:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider chat response contains no generated text.", 502)
    usage = payload.get("usage") if isinstance(payload.get("usage"), dict) else {}
    return {
        "content": content,
        "reasoning": reasoning,
        "finishReason": choice.get("finish_reason"),
        "usage": {
            "promptTokens": usage.get("prompt_tokens"),
            "completionTokens": usage.get("completion_tokens"),
            "totalTokens": usage.get("total_tokens"),
        },
        "responseId": payload.get("id"),
        "responseModel": payload.get("model"),
    }


def generate_chat_completion(
    provider_id: str,
    config: dict[str, Any],
    model: str,
    messages: Any,
    options: Any = None,
) -> dict[str, Any]:
    model_id = str(model or "").strip()
    if not model_id:
        raise AdapterError("CONFIG_MISSING", "model", "A model is required for text generation.", 400)
    url = chat_completions_url(str(config.get("baseUrl", "")), str(config.get("chatPath", "/chat/completions")))
    body = {
        "model": model_id,
        "messages": normalized_messages(messages),
        **normalized_generation_options(provider_id, options),
    }
    headers = {
        **normalized_headers(provider_id, config),
        "Content-Type": "application/json",
    }
    request = Request(
        url,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers=headers,
    )
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            status = int(response.status)
            raw = response.read()
    except HTTPError as exc:
        raise map_http_error(int(exc.code), "Provider chat endpoint") from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", "Provider request timed out.", 504) from None
    except URLError as exc:
        if isinstance(exc.reason, (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", "Provider request timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "Provider could not be reached.", 502) from None
    except OSError:
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "Provider could not be reached.", 502) from None
    if status < 200 or status >= 300:
        raise map_http_error(status, "Provider chat endpoint")
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider returned invalid JSON.", 502) from None
    return {
        **parse_chat_completion(payload),
        "endpoint": url,
        "httpStatus": status,
        "protocol": provider_protocol(provider_id),
    }


def generate_image(
    provider_id: str,
    config: dict[str, Any],
    model: str,
    prompt: Any,
    options: Any = None,
) -> dict[str, Any]:
    model_id = str(model or "").strip()
    prompt_text = str(prompt or "").strip()
    if not model_id:
        raise AdapterError("CONFIG_MISSING", "model", "A model is required for image generation.", 400)
    if not prompt_text:
        raise AdapterError("CONFIG_MISSING", "config", "An image prompt is required.", 400)
    url = images_generations_url(str(config.get("baseUrl", "")), str(config.get("imagesPath", "/images/generations")))
    image_options = normalized_image_options(options)
    export_spec = image_export_spec(options)
    # Upstream image APIs accept only their native source dimensions.  The
    # selected delivery size is rendered locally after the provider responds.
    image_options["size"] = export_spec["sourceSize"]
    body = {"model": model_id, "prompt": prompt_text, "n": 1, **image_options}
    request = Request(
        url,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={**normalized_headers(provider_id, config), "Content-Type": "application/json"},
    )
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            status = int(response.status)
            raw = response.read()
    except HTTPError as exc:
        raise map_http_error(int(exc.code), "Provider image endpoint") from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", "Provider request timed out.", 504) from None
    except URLError as exc:
        if isinstance(exc.reason, (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", "Provider request timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "Provider could not be reached.", 502) from None
    except OSError:
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "Provider could not be reached.", 502) from None
    if status < 200 or status >= 300:
        raise map_http_error(status, "Provider image endpoint")
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider returned invalid JSON.", 502) from None
    data = payload.get("data") if isinstance(payload, dict) else None
    item = data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else None
    if not item:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider image response contains no image.", 502)
    image_url = str(item.get("url") or "").strip()
    response_format = "url"
    if not image_url:
        encoded = str(item.get("b64_json") or "").strip()
        if not encoded:
            raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider image response contains no image data.", 502)
        output_format = str(image_options.get("output_format") or "png")
        mime = "image/jpeg" if output_format == "jpeg" else f"image/{output_format}"
        image_url = f"data:{mime};base64,{encoded}"
        response_format = "b64_json"
    image_url, export = render_image_export(image_url, export_spec)
    usage = payload.get("usage") if isinstance(payload, dict) and isinstance(payload.get("usage"), dict) else {}
    return {
        "imageUrl": image_url,
        "revisedPrompt": str(item.get("revised_prompt") or ""),
        "usage": usage,
        "export": export,
        "endpoint": url,
        "httpStatus": status,
        "responseFormat": response_format,
        "protocol": provider_protocol(provider_id),
    }


def _video_response_fields(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider returned an invalid video response.", 502)
    candidates: list[dict[str, Any]] = [payload]
    for key in ("data", "video", "output", "result"):
        value = payload.get(key)
        if isinstance(value, dict):
            candidates.append(value)
        elif isinstance(value, list) and value and isinstance(value[0], dict):
            candidates.append(value[0])
    task_id = ""
    status = ""
    video_url = ""
    for item in candidates:
        if not task_id:
            task_id = str(item.get("task_id") or item.get("taskId") or item.get("id") or item.get("job_id") or "").strip()
        if not status:
            status = str(item.get("status") or item.get("state") or "").strip().lower()
        if not video_url:
            video_url = str(item.get("url") or item.get("video_url") or item.get("videoUrl") or item.get("download_url") or "").strip()
            nested_file = item.get("file")
            if not video_url and isinstance(nested_file, dict):
                video_url = str(nested_file.get("url") or "").strip()
    if video_url and not video_url.startswith(("https://", "http://")):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider returned an unsupported video URL.", 502)
    normalized_status = {
        "completed": "succeeded", "complete": "succeeded", "success": "succeeded", "done": "succeeded",
        "failed": "failed", "error": "failed", "cancelled": "cancelled", "canceled": "cancelled",
        "processing": "processing", "running": "processing", "in_progress": "processing", "pending": "queued", "queued": "queued",
    }.get(status, "succeeded" if video_url else "queued")
    if not task_id and not video_url:
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider video response contains neither a task ID nor a video URL.", 502)
    return {"providerTaskId": task_id, "status": normalized_status, "videoUrl": video_url}


def submit_video_generation(
    provider_id: str,
    config: dict[str, Any],
    model: str,
    prompt: Any,
    options: Any = None,
) -> dict[str, Any]:
    model_id = str(model or "").strip()
    prompt_text = str(prompt or "").strip()
    if not model_id:
        raise AdapterError("CONFIG_MISSING", "model", "A model is required for video generation.", 400)
    if not prompt_text:
        raise AdapterError("CONFIG_MISSING", "config", "A video prompt is required.", 400)
    url = video_generations_url(str(config.get("baseUrl", "")), str(config.get("videoPath", "/videos/generations")))
    body = {"model": model_id, "prompt": prompt_text, **normalized_video_options(options)}
    request = Request(url, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), method="POST", headers={**normalized_headers(provider_id, config), "Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            status, raw = int(response.status), response.read()
    except HTTPError as exc:
        raise map_http_error(int(exc.code), "Provider video endpoint") from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", "Provider video request timed out.", 504) from None
    except (URLError, OSError) as exc:
        if isinstance(getattr(exc, "reason", None), (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", "Provider video request timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "Provider could not be reached.", 502) from None
    if status < 200 or status >= 300:
        raise map_http_error(status, "Provider video endpoint")
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider returned invalid video JSON.", 502) from None
    return {**_video_response_fields(payload), "endpoint": url, "httpStatus": status, "protocol": provider_protocol(provider_id)}


def poll_video_generation(provider_id: str, config: dict[str, Any], provider_task_id: str) -> dict[str, Any]:
    url = video_status_url(str(config.get("baseUrl", "")), str(config.get("videoStatusPath", "/videos/generations/{taskId}")), provider_task_id)
    request = Request(url, method="GET", headers=normalized_headers(provider_id, config))
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            status, raw = int(response.status), response.read()
    except HTTPError as exc:
        raise map_http_error(int(exc.code), "Provider video status endpoint") from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", "Provider video status request timed out.", 504) from None
    except (URLError, OSError) as exc:
        if isinstance(getattr(exc, "reason", None), (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", "Provider video status request timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "Provider could not be reached.", 502) from None
    if status < 200 or status >= 300:
        raise map_http_error(status, "Provider video status endpoint")
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "generation", "Provider returned invalid video status JSON.", 502) from None
    return {**_video_response_fields(payload), "endpoint": url, "httpStatus": status, "protocol": provider_protocol(provider_id)}


def list_models(provider_id: str, config: dict[str, Any]) -> dict[str, Any]:
    url = models_url(str(config.get("baseUrl", "")), str(config.get("modelsPath", "/models")))
    request = Request(url, method="GET", headers=normalized_headers(provider_id, config))
    try:
        with urlopen(request, timeout=request_timeout_seconds(config)) as response:
            status = int(response.status)
            raw = response.read()
    except HTTPError as exc:
        raise map_http_error(int(exc.code)) from None
    except (TimeoutError, socket.timeout):
        raise AdapterError("NETWORK_TIMEOUT", "network", "Provider request timed out.", 504) from None
    except URLError as exc:
        if isinstance(exc.reason, (TimeoutError, socket.timeout)):
            raise AdapterError("NETWORK_TIMEOUT", "network", "Provider request timed out.", 504) from None
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "Provider could not be reached.", 502) from None
    except OSError:
        raise AdapterError("BASE_URL_UNREACHABLE", "network", "Provider could not be reached.", 502) from None
    if status < 200 or status >= 300:
        raise map_http_error(status)
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise AdapterError("PROVIDER_RESPONSE_INVALID", "model", "Provider returned invalid JSON.", 502) from None
    return {
        "models": parse_models(provider_id, payload, config),
        "endpoint": url,
        "httpStatus": status,
        "protocol": provider_protocol(provider_id),
    }
