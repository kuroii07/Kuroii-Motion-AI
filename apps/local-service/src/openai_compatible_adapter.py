from __future__ import annotations

from typing import Any

from openai_protocol_adapter import (
    AdapterError,
    default_capabilities,
    inferred_capabilities,
    map_http_error,
    models_url,
    parsed_origin,
    provider_protocol,
    request_timeout_seconds,
    sanitize_custom_headers,
)
from openai_protocol_adapter import list_models as list_provider_models
from openai_protocol_adapter import normalized_headers as provider_headers
from openai_protocol_adapter import parse_models as parse_provider_models


def normalized_headers(config: dict[str, Any]) -> dict[str, str]:
    return provider_headers("openai-compatible", config)


def parse_models(payload: Any, fallback_capabilities: list[str] | None = None) -> list[dict[str, Any]]:
    config = {"defaultCapabilities": fallback_capabilities or ["text"]}
    return parse_provider_models("openai-compatible", payload, config)


def list_models(config: dict[str, Any]) -> dict[str, Any]:
    return list_provider_models("openai-compatible", config)
