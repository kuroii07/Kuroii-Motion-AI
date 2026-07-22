from __future__ import annotations

from datetime import datetime, timezone
from time import perf_counter
from typing import Any
from urllib.parse import urlparse

from data_store import read_json, workspace_root
from openai_protocol_adapter import (
    AdapterError,
    generate_chat_completion,
    generate_image as generate_protocol_image,
    list_models as list_openai_protocol_models,
    poll_video_generation as poll_protocol_video_generation,
    sanitize_custom_headers,
    submit_video_generation as submit_protocol_video_generation,
)
from minimax_protocol_adapter import (
    generate_image as generate_minimax_image,
    generate_music as generate_minimax_music,
    generate_voice as generate_minimax_voice,
)
from provider_secrets import get_provider_secret, provider_secret_ref

REMOTE_PROVIDERS = {"openai", "deepseek", "openai-compatible", "minimax"}
LIVE_MODEL_DISCOVERY_PROVIDERS = {"openai", "deepseek", "openai-compatible", "custom-base-url"}
LIVE_VIDEO_PROVIDERS = {"openai", "deepseek", "openai-compatible"}


def supports_live_video_generation(provider_id: str) -> bool:
    """Return whether the current runtime can submit and poll video tasks."""
    return provider_id in LIVE_VIDEO_PROVIDERS


PROVIDER_DISPLAY_NAMES = {
    "openai": "OpenAI",
    "deepseek": "DeepSeek",
    "openai-compatible": "OpenAI Compatible",
    "custom-base-url": "Custom Base URL",
    "minimax": "MiniMax",
}
CONFIG_FORM_PATH = "packages/provider-hub/config-forms/{provider_id}.json"
MODEL_PATH = "packages/provider-hub/mock-models/models.json"
GUIDANCE_PATH = "packages/provider-hub/guidance/provider-error-guidance.json"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def provider_exists(provider_id: str) -> bool:
    return (workspace_root() / "packages/provider-hub/manifests" / f"{provider_id}.json").is_file()


def provider_config_form(provider_id: str) -> dict[str, Any]:
    if not provider_exists(provider_id):
        raise KeyError(provider_id)
    return read_json(CONFIG_FORM_PATH.format(provider_id=provider_id))


def provider_error_guidance() -> dict[str, Any]:
    return read_json(GUIDANCE_PATH)


def guidance_for(code: str) -> dict[str, Any]:
    return provider_error_guidance().get(code, {
        "severity": "error",
        "title": "未知错误",
        "message": "Provider 返回了未知错误。",
        "advice": [{"id": "retry", "labelZh": "重试", "labelEn": "Retry", "kind": "action", "descriptionZh": "稍后重新测试。"}],
    })


def error_result(provider_id: str, code: str, stage: str, message: str | None = None) -> dict[str, Any]:
    guidance = guidance_for(code)
    return {
        "providerId": provider_id,
        "ok": False,
        "stage": stage,
        "code": code,
        "message": message or guidance.get("message", code),
        "severity": guidance.get("severity", "error"),
        "title": guidance.get("title", code),
        "advice": guidance.get("advice", []),
        "checkedAt": utc_now(),
    }


def success_result(provider_id: str, stage: str = "completed", message: str = "Provider connection test passed.", model: str | None = None) -> dict[str, Any]:
    return {
        "providerId": provider_id,
        "ok": True,
        "stage": stage,
        "code": "OK",
        "message": message,
        "model": model,
        "severity": "success",
        "advice": [],
        "checkedAt": utc_now(),
    }


def request_config(payload: dict[str, Any]) -> dict[str, Any]:
    raw_config = payload.get("config", payload)
    return raw_config if isinstance(raw_config, dict) else {}


def field_default(field: dict[str, Any]) -> Any:
    return field.get("defaultValue")


def normalize_config(provider_id: str, payload: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any] | None]:
    form = provider_config_form(provider_id)
    incoming = request_config(payload)
    normalized: dict[str, Any] = {}
    for field in form.get("fields", []):
        field_id = field.get("id")
        if not field_id:
            continue
        if field_id == "apiKey":
            api_key_ref = str(incoming.get("apiKeyRef") or provider_secret_ref(provider_id))
            value = str(incoming.get("apiKey") or get_provider_secret(provider_id, api_key_ref) or "")
            normalized["apiKeyRef"] = api_key_ref
        else:
            value = incoming.get(field_id, field_default(field))
        if field_id == "headers":
            try:
                value = sanitize_custom_headers(value)
            except AdapterError as error:
                return normalized, error_result(provider_id, error.code, error.stage, error.message)
        elif field_id in {"modelsPath", "chatPath", "imagesPath"}:
            default_path = {"modelsPath": "/models", "chatPath": "/chat/completions", "imagesPath": "/images/generations"}[field_id]
            value = str(value or default_path).strip()
            if not value or "\r" in value or "\n" in value:
                return normalized, error_result(provider_id, "CONFIG_INVALID", "config", f"{field_id} is invalid.")
        elif field_id == "timeoutSeconds":
            try:
                value = float(value)
            except (TypeError, ValueError):
                return normalized, error_result(provider_id, "CONFIG_INVALID", "config", "Request timeout must be a number.")
            if value < float(field.get("min", 1)) or value > float(field.get("max", 180)):
                return normalized, error_result(provider_id, "CONFIG_INVALID", "config", "Request timeout must be between 1 and 180 seconds.")
            if value.is_integer():
                value = int(value)
        elif field_id == "defaultCapabilities":
            if not isinstance(value, list):
                return normalized, error_result(provider_id, "CONFIG_INVALID", "config", "Default capabilities must be a list.")
            capabilities = []
            for item in value:
                capability = str(item).strip()
                if capability and capability not in capabilities:
                    capabilities.append(capability)
            value = capabilities or list(field_default(field) or ["text"])
        if field.get("required") and (value is None or value == ""):
            return normalized, error_result(provider_id, "CONFIG_MISSING", "config", f"Missing required config: {field_id}")
        if value is not None:
            normalized[field_id] = value
    return normalized, None


def validate_base_url(provider_id: str, config: dict[str, Any]) -> dict[str, Any] | None:
    base_url = config.get("baseUrl")
    if not base_url:
        return None
    parsed = urlparse(str(base_url))
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return error_result(provider_id, "BASE_URL_UNREACHABLE", "network", "Base URL must be a valid http(s) URL.")
    if provider_id in LIVE_MODEL_DISCOVERY_PROVIDERS:
        return None
    lowered = str(base_url).lower()
    if any(marker in lowered for marker in ["bad", "invalid", "unreachable", "404"]):
        return error_result(provider_id, "BASE_URL_UNREACHABLE", "network")
    if "timeout" in lowered:
        return error_result(provider_id, "NETWORK_TIMEOUT", "network")
    if "rate-limit" in lowered or "ratelimit" in lowered:
        return error_result(provider_id, "RATE_LIMITED", "network")
    return None


def validate_api_key(provider_id: str, config: dict[str, Any]) -> dict[str, Any] | None:
    if provider_id not in REMOTE_PROVIDERS and provider_id != "custom-base-url":
        return None
    api_key = str(config.get("apiKey", ""))
    if provider_id in REMOTE_PROVIDERS and not api_key:
        return error_result(provider_id, "CONFIG_MISSING", "auth", "API Key is required for this provider.")
    if provider_id in LIVE_MODEL_DISCOVERY_PROVIDERS:
        return None
    lowered = api_key.lower()
    if any(marker in lowered for marker in ["invalid", "bad", "expired", "wrong"]):
        return error_result(provider_id, "AUTH_INVALID_KEY", "auth")
    if "rate" in lowered:
        return error_result(provider_id, "RATE_LIMITED", "auth")
    return None


def validate_provider_request(provider_id: str, payload: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any] | None]:
    if not provider_exists(provider_id):
        return {}, error_result(provider_id, "PROVIDER_NOT_FOUND", "config", "Provider is not registered.")
    config, error = normalize_config(provider_id, payload)
    if error:
        return config, error
    for validator in [validate_base_url, validate_api_key]:
        error = validator(provider_id, config)
        if error:
            return config, error
    return config, None


def mock_models(provider_id: str) -> list[dict[str, Any]]:
    models = read_json(MODEL_PATH)
    return list(models.get(provider_id, []))


def adapter_error_result(provider_id: str, error: AdapterError) -> tuple[int, dict[str, Any]]:
    return error.status, error_result(provider_id, error.code, error.stage, error.message)


def live_models(provider_id: str, config: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    try:
        result = list_openai_protocol_models(provider_id, config)
    except AdapterError as error:
        return adapter_error_result(provider_id, error)
    models = result["models"]
    protocol = result["protocol"]
    display_name = PROVIDER_DISPLAY_NAMES.get(provider_id, provider_id)
    return 200, {
        "providerId": provider_id,
        "ok": True,
        "models": models,
        "count": len(models),
        "source": "live",
        "protocol": protocol,
        "stage": "model",
        "refreshedAt": utc_now(),
        "note": f"Live {display_name} model discovery completed.",
    }


def refresh_models(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    config, error = validate_provider_request(provider_id, payload)
    if error:
        status = {"CONFIG_MISSING": 400, "CONFIG_INVALID": 400, "AUTH_INVALID_KEY": 401, "BASE_URL_UNREACHABLE": 400, "NETWORK_TIMEOUT": 504, "RATE_LIMITED": 429}.get(error["code"], 400)
        return status, error
    if provider_id in LIVE_MODEL_DISCOVERY_PROVIDERS:
        return live_models(provider_id, config)
    models = mock_models(provider_id)
    if provider_id == "minimax":
        return 200, {
            "providerId": provider_id,
            "ok": True,
            "models": models,
            "count": len(models),
            "source": "catalog",
            "protocol": "minimax-native",
            "stage": "model",
            "refreshedAt": utc_now(),
            "note": "MiniMax publishes separate generation APIs rather than a shared /models endpoint; this catalog mirrors the supported MiniMax model families.",
        }
    return 200, {
        "providerId": provider_id,
        "ok": True,
        "models": models,
        "count": len(models),
        "source": "mock",
        "refreshedAt": utc_now(),
        "note": "v0.3.2 mock model discovery; no real provider request was sent.",
    }


def generate_text(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    config, error = validate_provider_request(provider_id, payload)
    if error:
        status = {
            "CONFIG_MISSING": 400,
            "CONFIG_INVALID": 400,
            "AUTH_INVALID_KEY": 401,
            "BASE_URL_UNREACHABLE": 400,
            "NETWORK_TIMEOUT": 504,
            "RATE_LIMITED": 429,
        }.get(error["code"], 400)
        return status, error
    if provider_id not in LIVE_MODEL_DISCOVERY_PROVIDERS:
        return 400, error_result(
            provider_id,
            "CONFIG_INVALID",
            "config",
            "This provider does not support live text generation yet.",
        )
    model = str(payload.get("model") or payload.get("modelId") or request_config(payload).get("model") or "").strip()
    try:
        result = generate_chat_completion(
            provider_id,
            config,
            model,
            payload.get("messages"),
            payload.get("options"),
        )
    except AdapterError as adapter_error:
        return adapter_error_result(provider_id, adapter_error)
    return 200, {
        "ok": True,
        "providerId": provider_id,
        "model": model,
        "content": result["content"],
        "reasoning": result["reasoning"],
        "finishReason": result["finishReason"],
        "usage": result["usage"],
        "responseId": result["responseId"],
        "responseModel": result["responseModel"],
        "protocol": result["protocol"],
        "source": "live",
        "generatedAt": utc_now(),
    }


def generate_image(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    config, error = validate_provider_request(provider_id, payload)
    if error:
        status = {
            "CONFIG_MISSING": 400,
            "CONFIG_INVALID": 400,
            "AUTH_INVALID_KEY": 401,
            "BASE_URL_UNREACHABLE": 400,
            "NETWORK_TIMEOUT": 504,
            "RATE_LIMITED": 429,
        }.get(error["code"], 400)
        return status, error
    if provider_id not in LIVE_MODEL_DISCOVERY_PROVIDERS and provider_id != "minimax":
        return 400, error_result(provider_id, "CONFIG_INVALID", "config", "This provider does not support live image generation yet.")
    model = str(payload.get("model") or payload.get("modelId") or request_config(payload).get("model") or "").strip()
    started = perf_counter()
    try:
        result = (
            generate_minimax_image(config, model, payload.get("prompt"), payload.get("options"))
            if provider_id == "minimax"
            else generate_protocol_image(provider_id, config, model, payload.get("prompt"), payload.get("options"))
        )
    except AdapterError as adapter_error:
        return adapter_error_result(provider_id, adapter_error)
    endpoint_path = urlparse(result["endpoint"]).path
    return 200, {
        "ok": True,
        "providerId": provider_id,
        "model": model,
        "imageUrl": result["imageUrl"],
        "revisedPrompt": result["revisedPrompt"],
        "usage": result["usage"],
        "export": result["export"],
        "protocol": result["protocol"],
        "source": "live",
        "generatedAt": utc_now(),
        "diagnostics": {
            "providerId": provider_id,
            "model": model,
            "endpoint": endpoint_path,
            "durationMs": round((perf_counter() - started) * 1000),
            "httpStatus": result["httpStatus"],
            "responseFormat": result["responseFormat"],
            "outputResolution": result["export"]["outputResolution"],
            "outputSize": f"{result['export']['width']}x{result['export']['height']}",
            "exportMode": result["export"]["mode"],
        },
    }


def _generate_minimax_audio(provider_id: str, payload: dict[str, Any], kind: str) -> tuple[int, dict[str, Any]]:
    config, error = validate_provider_request(provider_id, payload)
    if error:
        status = {
            "CONFIG_MISSING": 400,
            "CONFIG_INVALID": 400,
            "AUTH_INVALID_KEY": 401,
            "BASE_URL_UNREACHABLE": 400,
            "NETWORK_TIMEOUT": 504,
            "RATE_LIMITED": 429,
        }.get(error["code"], 400)
        return status, error
    if provider_id != "minimax":
        return 400, error_result(provider_id, "CONFIG_INVALID", "config", f"This provider does not support live {kind} generation yet.")
    model = str(payload.get("model") or payload.get("modelId") or request_config(payload).get("model") or "").strip()
    started = perf_counter()
    try:
        result = (
            generate_minimax_music(config, model, payload.get("prompt"), payload.get("lyrics"), payload.get("options"))
            if kind == "music"
            else generate_minimax_voice(config, model, payload.get("text"), payload.get("options"))
        )
    except AdapterError as adapter_error:
        return adapter_error_result(provider_id, adapter_error)
    return 200, {
        "ok": True,
        "providerId": provider_id,
        "model": model,
        "audioBytes": result["audioBytes"],
        "format": result["format"],
        "usage": result["usage"],
        "traceId": result["traceId"],
        "protocol": result["protocol"],
        "source": "live",
        "generatedAt": utc_now(),
        "diagnostics": {
            "providerId": provider_id,
            "model": model,
            "endpoint": urlparse(result["endpoint"]).path,
            "durationMs": round((perf_counter() - started) * 1000),
            "httpStatus": result["httpStatus"],
            "format": result["format"],
            "traceId": result["traceId"],
        },
    }


def generate_music(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    return _generate_minimax_audio(provider_id, payload, "music")


def generate_voice(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    return _generate_minimax_audio(provider_id, payload, "voice")


def submit_video(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    config, error = validate_provider_request(provider_id, payload)
    if error:
        return {"AUTH_INVALID_KEY": 401, "NETWORK_TIMEOUT": 504, "RATE_LIMITED": 429}.get(error["code"], 400), error
    if not supports_live_video_generation(provider_id):
        return 400, error_result(provider_id, "CONFIG_INVALID", "config", "This provider does not support live video generation yet.")
    model = str(payload.get("model") or payload.get("modelId") or request_config(payload).get("model") or "").strip()
    started = perf_counter()
    try:
        result = submit_protocol_video_generation(provider_id, config, model, payload.get("prompt"), payload.get("options"))
    except AdapterError as adapter_error:
        return adapter_error_result(provider_id, adapter_error)
    return 202, {
        "ok": True,
        "providerId": provider_id,
        "model": model,
        "providerTaskId": result["providerTaskId"],
        "status": result["status"],
        "videoUrl": result["videoUrl"],
        "protocol": result["protocol"],
        "source": "live",
        "generatedAt": utc_now(),
        "diagnostics": {"endpoint": urlparse(result["endpoint"]).path, "durationMs": round((perf_counter() - started) * 1000), "httpStatus": result["httpStatus"]},
    }


def poll_video(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    config, error = validate_provider_request(provider_id, payload)
    if error:
        return {"AUTH_INVALID_KEY": 401, "NETWORK_TIMEOUT": 504, "RATE_LIMITED": 429}.get(error["code"], 400), error
    provider_task_id = str(payload.get("providerTaskId") or "").strip()
    if not provider_task_id:
        return 400, error_result(provider_id, "CONFIG_MISSING", "generation", "A provider video task ID is required.")
    started = perf_counter()
    try:
        result = poll_protocol_video_generation(provider_id, config, provider_task_id)
    except AdapterError as adapter_error:
        return adapter_error_result(provider_id, adapter_error)
    return 200, {
        "ok": True,
        "providerId": provider_id,
        "providerTaskId": result["providerTaskId"] or provider_task_id,
        "status": result["status"],
        "videoUrl": result["videoUrl"],
        "protocol": result["protocol"],
        "diagnostics": {"endpoint": urlparse(result["endpoint"]).path, "durationMs": round((perf_counter() - started) * 1000), "httpStatus": result["httpStatus"]},
    }


def test_connection(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    config, error = validate_provider_request(provider_id, payload)
    if error:
        status = {"CONFIG_MISSING": 400, "CONFIG_INVALID": 400, "AUTH_INVALID_KEY": 401, "BASE_URL_UNREACHABLE": 400, "NETWORK_TIMEOUT": 504, "RATE_LIMITED": 429}.get(error["code"], 400)
        return status, error
    model = payload.get("model") or payload.get("modelId") or request_config(payload).get("model")
    if provider_id == "minimax":
        models = mock_models(provider_id)
        model_ids = {item.get("id") for item in models}
        if model and model not in model_ids:
            return 404, error_result(provider_id, "MODEL_NOT_FOUND", "model")
        selected = str(model or models[0]["id"])
        response = success_result(
            provider_id,
            stage="catalog",
            message="MiniMax catalog is ready. API key verification happens on the first supported generation request.",
            model=selected,
        )
        response["source"] = "catalog"
        response["protocol"] = "minimax-native"
        response["checks"] = [
            {"stage": "config", "ok": True},
            {"stage": "catalog", "ok": True, "model": selected},
            {"stage": "auth", "ok": None, "note": "Verified by the first supported generation request."},
        ]
        return 200, response
    if provider_id in LIVE_MODEL_DISCOVERY_PROVIDERS:
        status, result = live_models(provider_id, config)
        if status != 200:
            return status, result
        models = result["models"]
        model_ids = {item.get("id") for item in models}
        if model and model not in model_ids:
            return 404, error_result(provider_id, "MODEL_NOT_FOUND", "model")
        selected = str(model or models[0]["id"])
        display_name = PROVIDER_DISPLAY_NAMES.get(provider_id, provider_id)
        response = success_result(
            provider_id,
            stage="completed",
            message=f"{display_name} four-stage connection test passed.",
            model=selected,
        )
        response["source"] = "live"
        response["protocol"] = result["protocol"]
        response["checks"] = [
            {"stage": "config", "ok": True},
            {"stage": "network", "ok": True},
            {"stage": "auth", "ok": True},
            {"stage": "model", "ok": True, "model": selected},
        ]
        return 200, response
    models = mock_models(provider_id)
    model_ids = {item.get("id") for item in models}
    if model and model not in model_ids:
        return 404, error_result(provider_id, "MODEL_NOT_FOUND", "model")
    selected = str(model or (models[0].get("id") if models else "mock-model"))
    return 200, success_result(provider_id, model=selected)
