from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from config import workspace_root
from openai_compatible_adapter import AdapterError, sanitize_custom_headers
from provider_secrets import (
    delete_provider_profile_secret,
    get_provider_secret,
    get_provider_secret_status,
    provider_profile_secret_ref,
    provider_secret_ref,
    save_provider_profile_secret,
    save_provider_secret,
    secret_store_metadata,
)
from provider_runtime import mock_models, provider_exists, supports_live_capability, supports_live_video_generation


PROFILE_STORE_PATH = "apps/local-service/data/provider-profile.json"
DEFAULT_BINDINGS = {
    "text": {"providerId": "openai", "model": "gpt-4.1"},
    "vision": {"providerId": "openai", "model": "gpt-4.1"},
    "image": {"providerId": "openai", "model": "gpt-image-1"},
    # Video is deliberately unbound until a real async-capable model is configured.
    # A placeholder binding makes the generation screen look ready when it is not.
    "video": {},
    "voice": {"providerId": "custom-base-url", "model": "custom-voice"},
    "speech": {"providerId": "custom-base-url", "model": "custom-speech"},
    "music": {"providerId": "custom-base-url", "model": "custom-music"},
    "sfx": {"providerId": "custom-base-url", "model": "custom-sfx"},
    "local": {"providerId": "ollama", "model": "llama3.1"},
}
DEFAULT_PROVIDER_NAMES = {
    "openai": "OpenAI",
    "openai-compatible": "OpenAI Compatible",
    "deepseek": "DeepSeek",
    "minimax": "MiniMax",
    "custom-base-url": "Custom Base URL",
    "ollama": "Ollama",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def profile_store_path() -> Path:
    override = os.environ.get("KUROII_PROVIDER_PROFILE_PATH", "").strip()
    return Path(override) if override else workspace_root() / PROFILE_STORE_PATH


def default_profile() -> dict[str, Any]:
    profile_id = "openai"
    return {
        "version": 2,
        "activeProfileId": profile_id,
        "profileInstances": {
            profile_id: {
                "profileId": profile_id,
                "name": "OpenAI",
                "providerId": "openai",
                "baseUrl": "https://api.openai.com/v1",
                "apiKeyRef": provider_secret_ref("openai"),
                "model": "gpt-4.1",
                "models": [],
                "enabled": True,
                "source": "default",
                "updatedAt": None,
            }
        },
        "capabilityBindings": _bindings_with_profile_ids(dict(DEFAULT_BINDINGS), {"openai": profile_id}),
        "capabilityModelBindings": {},
        "updatedAt": None,
    }


def _safe_profile_id(value: str) -> str:
    lowered = value.strip().lower()
    lowered = re.sub(r"[^a-z0-9_-]+", "-", lowered).strip("-")
    return lowered or "provider-profile"


def _unique_profile_id(profile: dict[str, Any], requested: str, provider_id: str) -> str:
    instances = profile.get("profileInstances", {})
    base = _safe_profile_id(requested or provider_id)
    if base == "provider-profile" or base.isdigit() or len(base) < 3:
        base = _safe_profile_id(provider_id)
    candidate = base
    suffix = 2
    while candidate in instances:
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate


def _default_profile_name(provider_id: str) -> str:
    return DEFAULT_PROVIDER_NAMES.get(provider_id, provider_id.replace("-", " ").title())


def _bindings_with_profile_ids(bindings: dict[str, Any], provider_to_profile: dict[str, str]) -> dict[str, Any]:
    normalized: dict[str, Any] = {}
    for capability, raw in bindings.items():
        if not isinstance(raw, dict):
            continue
        provider_id = str(raw.get("providerId", "")).strip()
        model = str(raw.get("model", "")).strip()
        item = {"providerId": provider_id, "model": model}
        profile_id = str(raw.get("profileId", "")).strip() or provider_to_profile.get(provider_id, "")
        if profile_id:
            item["profileId"] = profile_id
        normalized[capability] = item
    return normalized


def _remove_legacy_video_placeholder(bindings: dict[str, Any], provider_to_profile: dict[str, str]) -> dict[str, Any]:
    """Drop the old unconfigured Custom Video placeholder during profile reads."""
    video = bindings.get("video")
    if (
        isinstance(video, dict)
        and video.get("providerId") == "custom-base-url"
        and video.get("model") == "custom-video"
        and "custom-base-url" not in provider_to_profile
    ):
        bindings.pop("video", None)
    return bindings


def _capability_model_bindings(
    raw_bindings: Any,
    fallback_bindings: dict[str, Any],
    provider_to_profile: dict[str, str],
) -> dict[str, list[dict[str, str]]]:
    source = raw_bindings if isinstance(raw_bindings, dict) else {
        capability: [binding]
        for capability, binding in fallback_bindings.items()
        if isinstance(binding, dict)
    }
    normalized: dict[str, list[dict[str, str]]] = {}
    for capability, raw_items in source.items():
        if capability not in DEFAULT_BINDINGS or not isinstance(raw_items, list):
            continue
        items: list[dict[str, str]] = []
        seen: set[tuple[str, str, str]] = set()
        for raw in raw_items:
            if not isinstance(raw, dict):
                continue
            binding = _bindings_with_profile_ids({capability: raw}, provider_to_profile).get(capability)
            if not isinstance(binding, dict):
                continue
            provider_id = str(binding.get("providerId", "")).strip()
            model = str(binding.get("model", "")).strip()
            profile_id = str(binding.get("profileId", "")).strip()
            if not provider_id or not model:
                continue
            identity = (profile_id, provider_id, model)
            if identity in seen:
                continue
            seen.add(identity)
            items.append(binding)
        if items:
            normalized[capability] = items
    return normalized


def _migrate_legacy_profile(data: dict[str, Any]) -> dict[str, Any]:
    profile = default_profile()
    legacy_profiles = data.get("profiles")
    if not isinstance(legacy_profiles, dict):
        return profile

    instances: dict[str, Any] = {}
    provider_to_profile: dict[str, str] = {}
    for provider_id, raw_item in legacy_profiles.items():
        if not isinstance(raw_item, dict):
            continue
        provider_id = str(raw_item.get("providerId") or provider_id).strip()
        if not provider_id:
            continue
        profile_id = _safe_profile_id(provider_id)
        provider_to_profile[provider_id] = profile_id
        item = {key: value for key, value in raw_item.items() if key != "apiKey"}
        api_key = str(raw_item.get("apiKey", "") or "")
        old_ref = str(item.get("apiKeyRef") or provider_secret_ref(provider_id))
        if not api_key:
            api_key = get_provider_secret(provider_id, old_ref)
        if api_key:
            secret_meta = save_provider_profile_secret(provider_id, profile_id, api_key)
            item["apiKeyRef"] = secret_meta["apiKeyRef"]
        else:
            item["apiKeyRef"] = old_ref
        item.update({
            "profileId": profile_id,
            "name": str(item.get("name") or _default_profile_name(provider_id)).strip(),
            "providerId": provider_id,
            "models": item.get("models") if isinstance(item.get("models"), list) else [],
            "enabled": bool(item.get("enabled", True)),
        })
        instances[profile_id] = item

    if not instances:
        return profile
    active_provider_id = str(data.get("activeProviderId", "")).strip()
    active_profile_id = provider_to_profile.get(active_provider_id) or next(iter(instances))
    bindings = data.get("capabilityBindings") if isinstance(data.get("capabilityBindings"), dict) else DEFAULT_BINDINGS
    normalized_bindings = _remove_legacy_video_placeholder(
        _bindings_with_profile_ids({**DEFAULT_BINDINGS, **bindings}, provider_to_profile), provider_to_profile
    )
    return {
        "version": 2,
        "activeProfileId": active_profile_id,
        "profileInstances": instances,
        "capabilityBindings": normalized_bindings,
        "capabilityModelBindings": _capability_model_bindings(
            data.get("capabilityModelBindings"), normalized_bindings, provider_to_profile
        ),
        "updatedAt": data.get("updatedAt"),
    }


def _normalize_v2_profile(data: dict[str, Any]) -> dict[str, Any]:
    raw_instances = data.get("profileInstances")
    if not isinstance(raw_instances, dict):
        return _migrate_legacy_profile(data)
    instances: dict[str, Any] = {}
    provider_to_profile: dict[str, str] = {}
    for key, raw_item in raw_instances.items():
        if not isinstance(raw_item, dict):
            continue
        profile_id = _safe_profile_id(str(raw_item.get("profileId") or key))
        provider_id = str(raw_item.get("providerId", "")).strip()
        if not provider_id:
            continue
        item = {field: value for field, value in raw_item.items() if field != "apiKey"}
        api_key = str(raw_item.get("apiKey", "") or "")
        if api_key:
            secret_meta = save_provider_profile_secret(provider_id, profile_id, api_key)
            item["apiKeyRef"] = secret_meta["apiKeyRef"]
        item.update({
            "profileId": profile_id,
            "name": str(item.get("name") or _default_profile_name(provider_id)).strip(),
            "providerId": provider_id,
            "apiKeyRef": str(item.get("apiKeyRef") or provider_profile_secret_ref(profile_id)),
            "models": item.get("models") if isinstance(item.get("models"), list) else [],
            "enabled": bool(item.get("enabled", True)),
        })
        instances[profile_id] = item
        provider_to_profile.setdefault(provider_id, profile_id)
    if not instances:
        return default_profile()
    active_profile_id = str(data.get("activeProfileId", "")).strip()
    if active_profile_id not in instances:
        active_profile_id = next(iter(instances))
    bindings = data.get("capabilityBindings") if isinstance(data.get("capabilityBindings"), dict) else DEFAULT_BINDINGS
    normalized_bindings = _remove_legacy_video_placeholder(
        _bindings_with_profile_ids({**DEFAULT_BINDINGS, **bindings}, provider_to_profile), provider_to_profile
    )
    return {
        "version": 2,
        "activeProfileId": active_profile_id,
        "profileInstances": instances,
        "capabilityBindings": normalized_bindings,
        "capabilityModelBindings": _capability_model_bindings(
            data.get("capabilityModelBindings"), normalized_bindings, provider_to_profile
        ),
        "updatedAt": data.get("updatedAt"),
    }


def read_provider_profile() -> dict[str, Any]:
    path = profile_store_path()
    if not path.is_file():
        return default_profile()
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return default_profile()
    if not isinstance(data, dict):
        return default_profile()
    profile = _normalize_v2_profile(data)
    if data.get("version") != 2 or "profileInstances" not in data or "capabilityModelBindings" not in data or any(
        isinstance(item, dict) and "apiKey" in item for item in data.get("profileInstances", {}).values()
    ):
        write_provider_profile(profile)
    return profile


def write_provider_profile(profile: dict[str, Any]) -> dict[str, Any]:
    path = profile_store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    profile["version"] = 2
    profile["updatedAt"] = utc_now()
    temporary_path = path.with_suffix(f"{path.suffix}.tmp")
    temporary_path.write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(temporary_path, path)
    return profile


def _public_instance(item: dict[str, Any]) -> dict[str, Any]:
    public = {key: value for key, value in item.items() if key != "apiKey"}
    profile_id = str(public.get("profileId", ""))
    provider_id = str(public.get("providerId", ""))
    api_key_ref = str(public.get("apiKeyRef") or provider_profile_secret_ref(profile_id))
    public["apiKeyRef"] = api_key_ref
    public["apiKeyStatus"] = get_provider_secret_status(provider_id, api_key_ref)
    return public


def _compatibility_profiles(profile: dict[str, Any], public_instances: dict[str, Any]) -> dict[str, Any]:
    selected: dict[str, Any] = {}
    active_profile_id = str(profile.get("activeProfileId", ""))
    active = public_instances.get(active_profile_id)
    if isinstance(active, dict):
        selected[str(active.get("providerId", ""))] = active
    for item in public_instances.values():
        provider_id = str(item.get("providerId", ""))
        if provider_id and provider_id not in selected:
            selected[provider_id] = item
    for provider_id in ("openai", "deepseek", "openai-compatible", "minimax", "custom-base-url"):
        if provider_id in selected:
            continue
        legacy_ref = provider_secret_ref(provider_id)
        status = get_provider_secret_status(provider_id, legacy_ref)
        if status["configured"]:
            selected[provider_id] = {
                "profileId": provider_id,
                "name": _default_profile_name(provider_id),
                "providerId": provider_id,
                "apiKeyRef": legacy_ref,
                "apiKeyStatus": status,
                "source": "secret-store",
                "updatedAt": None,
            }
    return selected


def public_profile(profile: dict[str, Any]) -> dict[str, Any]:
    public_instances = {
        profile_id: _public_instance(item)
        for profile_id, item in profile.get("profileInstances", {}).items()
        if isinstance(item, dict)
    }
    active_profile_id = str(profile.get("activeProfileId", ""))
    active = public_instances.get(active_profile_id, {})
    compatibility = _compatibility_profiles(profile, public_instances)
    return {
        "version": 2,
        "activeProfileId": active_profile_id,
        "activeProviderId": active.get("providerId", "openai"),
        "profileInstances": public_instances,
        "profiles": compatibility,
        "capabilityBindings": profile.get("capabilityBindings", {}),
        "capabilityModelBindings": profile.get("capabilityModelBindings", {}),
        "updatedAt": profile.get("updatedAt"),
        "storage": os.environ.get("KUROII_PROVIDER_PROFILE_PATH", PROFILE_STORE_PATH),
        "secretStore": secret_store_metadata(),
    }


def save_provider_api_key(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    if not provider_exists(provider_id):
        return 404, {"ok": False, "code": "PROVIDER_NOT_FOUND", "message": f"Provider not found: {provider_id}"}
    api_key = str(payload.get("apiKey", "") or "").strip()
    if not api_key:
        return 400, {"ok": False, "code": "CONFIG_MISSING", "message": "API key is required."}
    secret_meta = save_provider_secret(provider_id, api_key)
    return 200, {
        "ok": True,
        "providerId": provider_id,
        "apiKeyRef": secret_meta["apiKeyRef"],
        "apiKeyStatus": secret_meta["apiKeyStatus"],
        "secretStore": secret_store_metadata(),
    }


def save_named_provider_api_key(profile_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    profile = read_provider_profile()
    item = profile.get("profileInstances", {}).get(profile_id)
    if not isinstance(item, dict):
        return 404, {"ok": False, "code": "PROVIDER_PROFILE_NOT_FOUND", "message": f"Provider profile not found: {profile_id}"}
    api_key = str(payload.get("apiKey", "") or "").strip()
    if not api_key:
        return 400, {"ok": False, "code": "CONFIG_MISSING", "message": "API key is required."}
    provider_id = str(item.get("providerId", ""))
    secret_meta = save_provider_profile_secret(provider_id, profile_id, api_key)
    item["apiKeyRef"] = secret_meta["apiKeyRef"]
    item["updatedAt"] = utc_now()
    write_provider_profile(profile)
    return 200, {
        "ok": True,
        "profileId": profile_id,
        "providerId": provider_id,
        "apiKeyRef": secret_meta["apiKeyRef"],
        "apiKeyStatus": secret_meta["apiKeyStatus"],
        "secretStore": secret_store_metadata(),
    }


def model_supports_capability(provider_id: str, model_id: str, capability: str) -> bool:
    for model in mock_models(provider_id):
        if model.get("id") == model_id:
            capabilities = set(model.get("capabilities") or model.get("tags") or [])
            return capability in capabilities or capability in {"text", "local"}
    return capability in {"text", "local", "video", "voice", "speech", "music", "sfx"}


def profile_model_supports_capability(
    item: dict[str, Any] | None,
    provider_id: str,
    model_id: str,
    capability: str,
) -> bool:
    if isinstance(item, dict):
        for model in item.get("models", []):
            if not isinstance(model, dict) or str(model.get("id", "")).strip() != model_id:
                continue
            capabilities = set(model.get("capabilities") or model.get("tags") or [])
            if capabilities:
                return capability in capabilities
            return capability in set(item.get("defaultCapabilities") or [])
    return model_supports_capability(provider_id, model_id, capability)


def normalize_profile_payload(
    provider_id: str,
    payload: dict[str, Any],
    *,
    profile_id: str | None = None,
    existing: dict[str, Any] | None = None,
    legacy_secret_ref: bool = True,
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    if not provider_exists(provider_id):
        return {}, {"code": "PROVIDER_NOT_FOUND", "message": f"Provider not found: {provider_id}"}
    incoming = payload.get("config", payload)
    if not isinstance(incoming, dict):
        return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Provider profile config must be an object."}
    config = {**(existing or {}), **incoming}
    resolved_profile_id = profile_id or str(config.get("profileId") or provider_id)
    default_ref = provider_secret_ref(provider_id) if legacy_secret_ref else provider_profile_secret_ref(resolved_profile_id)
    item = {
        **(existing or {}),
        "profileId": resolved_profile_id,
        "name": str(payload.get("name") or config.get("name") or (existing or {}).get("name") or _default_profile_name(provider_id)).strip(),
        "providerId": provider_id,
        "baseUrl": str(config.get("baseUrl", "")).strip(),
        "apiKeyRef": str(config.get("apiKeyRef") or (existing or {}).get("apiKeyRef") or default_ref).strip(),
        "model": str(payload.get("model") or config.get("model") or "").strip(),
        "models": config.get("models") if isinstance(config.get("models"), list) else list((existing or {}).get("models") or []),
        "enabled": bool(config.get("enabled", (existing or {}).get("enabled", True))),
        "source": "local-service",
        "updatedAt": utc_now(),
    }
    if not item["name"]:
        return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Provider profile name is required."}
    api_key = str(config.get("apiKey", "") or "").strip()
    if api_key:
        secret_meta = (
            save_provider_secret(provider_id, api_key)
            if legacy_secret_ref
            else save_provider_profile_secret(provider_id, resolved_profile_id, api_key)
        )
        item["apiKeyRef"] = secret_meta["apiKeyRef"]
    if provider_id == "openai":
        organization = str(config.get("organization", "") or "").strip()
        if "\r" in organization or "\n" in organization:
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "OpenAI organization is invalid."}
        item["organization"] = organization
    if provider_id in {"openai-compatible", "custom-base-url"}:
        models_path = str(config.get("modelsPath", "/models") or "/models").strip()
        if not models_path or "\r" in models_path or "\n" in models_path:
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Models path is invalid."}
        item["modelsPath"] = models_path
    if provider_id == "openai-compatible":
        chat_path = str(config.get("chatPath", "/chat/completions") or "/chat/completions").strip()
        images_path = str(config.get("imagesPath", "/images/generations") or "/images/generations").strip()
        video_path = str(config.get("videoPath", "/videos/generations") or "/videos/generations").strip()
        video_status_path = str(config.get("videoStatusPath", "/videos/generations/{taskId}") or "/videos/generations/{taskId}").strip()
        if not chat_path or "\r" in chat_path or "\n" in chat_path:
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Chat path is invalid."}
        if not images_path or "\r" in images_path or "\n" in images_path:
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Images path is invalid."}
        if not video_path or "\r" in video_path or "\n" in video_path:
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Video path is invalid."}
        if not video_status_path or "\r" in video_status_path or "\n" in video_status_path:
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Video status path is invalid."}
        try:
            timeout_seconds = float(config.get("timeoutSeconds", 120))
        except (TypeError, ValueError):
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Request timeout must be a number."}
        if timeout_seconds < 1 or timeout_seconds > 180:
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Request timeout must be between 1 and 180 seconds."}
        try:
            headers = sanitize_custom_headers(config.get("headers"))
        except AdapterError as error:
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": error.message}
        raw_capabilities = config.get("defaultCapabilities", ["text"])
        if not isinstance(raw_capabilities, list):
            return {}, {"code": "INVALID_PROVIDER_PROFILE", "message": "Default capabilities must be a list."}
        capabilities: list[str] = []
        for raw in raw_capabilities:
            capability = str(raw).strip()
            if capability and capability not in capabilities:
                capabilities.append(capability)
        item.update({
            "chatPath": chat_path,
            "imagesPath": images_path,
            "videoPath": video_path,
            "videoStatusPath": video_status_path,
            "headers": headers,
            "timeoutSeconds": int(timeout_seconds) if timeout_seconds.is_integer() else timeout_seconds,
            "defaultCapabilities": capabilities or ["text"],
        })
    return item, None


def create_named_provider_profile(payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    provider_id = str(payload.get("providerId", "")).strip()
    name = str(payload.get("name", "")).strip()
    if not name:
        return 400, {"ok": False, "code": "INVALID_PROVIDER_PROFILE", "message": "Provider profile name is required."}
    profile = read_provider_profile()
    profile_id = _unique_profile_id(profile, str(payload.get("profileId") or name), provider_id)
    item, error = normalize_profile_payload(
        provider_id,
        payload,
        profile_id=profile_id,
        legacy_secret_ref=False,
    )
    if error:
        return 404 if error["code"] == "PROVIDER_NOT_FOUND" else 400, {"ok": False, **error}
    profile.setdefault("profileInstances", {})[profile_id] = item
    profile["activeProfileId"] = profile_id
    saved = write_provider_profile(profile)
    return 201, {"ok": True, "providerProfile": _public_instance(item), "profile": public_profile(saved)}


def update_named_provider_profile(profile_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    profile = read_provider_profile()
    existing = profile.get("profileInstances", {}).get(profile_id)
    if not isinstance(existing, dict):
        return 404, {"ok": False, "code": "PROVIDER_PROFILE_NOT_FOUND", "message": f"Provider profile not found: {profile_id}"}
    provider_id = str(payload.get("providerId") or existing.get("providerId", "")).strip()
    item, error = normalize_profile_payload(
        provider_id,
        payload,
        profile_id=profile_id,
        existing=existing,
        legacy_secret_ref=False,
    )
    if error:
        return 404 if error["code"] == "PROVIDER_NOT_FOUND" else 400, {"ok": False, **error}
    profile["profileInstances"][profile_id] = item
    profile["activeProfileId"] = profile_id
    saved = write_provider_profile(profile)
    return 200, {"ok": True, "providerProfile": _public_instance(item), "profile": public_profile(saved)}


def select_named_provider_profile(profile_id: str) -> tuple[int, dict[str, Any]]:
    profile = read_provider_profile()
    if profile_id not in profile.get("profileInstances", {}):
        return 404, {"ok": False, "code": "PROVIDER_PROFILE_NOT_FOUND", "message": f"Provider profile not found: {profile_id}"}
    profile["activeProfileId"] = profile_id
    saved = write_provider_profile(profile)
    return 200, {"ok": True, "profile": public_profile(saved)}


def delete_named_provider_profile(profile_id: str) -> tuple[int, dict[str, Any]]:
    profile = read_provider_profile()
    instances = profile.get("profileInstances", {})
    if profile_id not in instances:
        return 404, {"ok": False, "code": "PROVIDER_PROFILE_NOT_FOUND", "message": f"Provider profile not found: {profile_id}"}
    if len(instances) <= 1:
        return 409, {"ok": False, "code": "PROVIDER_PROFILE_REQUIRED", "message": "At least one provider profile must remain."}
    instances.pop(profile_id)
    delete_provider_profile_secret(profile_id)
    bindings = profile.get("capabilityBindings", {})
    model_bindings = profile.get("capabilityModelBindings", {})
    for capability in set(bindings) | set(model_bindings):
        remaining = [
            binding
            for binding in model_bindings.get(capability, [])
            if not isinstance(binding, dict) or binding.get("profileId") != profile_id
        ]
        if remaining:
            model_bindings[capability] = remaining
        else:
            model_bindings.pop(capability, None)
        default_binding = bindings.get(capability)
        if isinstance(default_binding, dict) and default_binding.get("profileId") == profile_id:
            if remaining:
                bindings[capability] = remaining[0]
            else:
                bindings.pop(capability, None)
    profile["capabilityBindings"] = bindings
    profile["capabilityModelBindings"] = model_bindings
    if profile.get("activeProfileId") == profile_id:
        profile["activeProfileId"] = next(iter(instances))
    saved = write_provider_profile(profile)
    return 200, {"ok": True, "deletedProfileId": profile_id, "profile": public_profile(saved)}


def named_provider_runtime_payload(profile_id: str, payload: dict[str, Any]) -> tuple[int, str, dict[str, Any]]:
    profile = read_provider_profile()
    item = profile.get("profileInstances", {}).get(profile_id)
    if not isinstance(item, dict):
        return 404, "", {"ok": False, "code": "PROVIDER_PROFILE_NOT_FOUND", "message": f"Provider profile not found: {profile_id}"}
    provider_id = str(item.get("providerId", ""))
    incoming = payload.get("config") if isinstance(payload.get("config"), dict) else {}
    merged_config = {**item, **incoming, "apiKeyRef": item.get("apiKeyRef")}
    runtime_payload = {**payload, "config": merged_config}
    return 200, provider_id, runtime_payload


def store_named_provider_models(profile_id: str, models: list[dict[str, Any]]) -> None:
    profile = read_provider_profile()
    item = profile.get("profileInstances", {}).get(profile_id)
    if not isinstance(item, dict):
        return
    item["models"] = models
    item["updatedAt"] = utc_now()
    write_provider_profile(profile)


def save_provider_profile(provider_id: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    profile = read_provider_profile()
    existing_id = next(
        (
            profile_id
            for profile_id, item in profile.get("profileInstances", {}).items()
            if isinstance(item, dict) and item.get("providerId") == provider_id
        ),
        provider_id,
    )
    existing = profile.get("profileInstances", {}).get(existing_id)
    item, error = normalize_profile_payload(
        provider_id,
        payload,
        profile_id=existing_id,
        existing=existing if isinstance(existing, dict) else None,
        legacy_secret_ref=True,
    )
    if error:
        return 404 if error["code"] == "PROVIDER_NOT_FOUND" else 400, {"ok": False, **error}
    profile.setdefault("profileInstances", {})[existing_id] = item
    profile["activeProfileId"] = existing_id
    model_id = item.get("model")
    profile_capabilities = set(item.get("defaultCapabilities") or [])
    raw_bindings = payload.get("bindCapabilities") if isinstance(payload.get("bindCapabilities"), list) else []
    for capability in raw_bindings:
        if not isinstance(capability, str):
            continue
        if model_id and (capability in profile_capabilities or profile_model_supports_capability(item, provider_id, model_id, capability)):
            binding = {
                "profileId": existing_id,
                "providerId": provider_id,
                "model": model_id,
            }
            items = profile.setdefault("capabilityModelBindings", {}).setdefault(capability, [])
            if binding not in items:
                items.append(binding)
            profile.setdefault("capabilityBindings", {})[capability] = binding
    saved = write_provider_profile(profile)
    return 200, {"ok": True, "profile": public_profile(saved)}


def save_capability_binding(capability: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    profile = read_provider_profile()
    profile_id = str(payload.get("profileId", "")).strip()
    provider_id = str(payload.get("providerId", "")).strip()
    item: dict[str, Any] | None = None
    if profile_id:
        item = profile.get("profileInstances", {}).get(profile_id)
        if not isinstance(item, dict):
            return 404, {"ok": False, "code": "PROVIDER_PROFILE_NOT_FOUND", "message": f"Provider profile not found: {profile_id}"}
        provider_id = str(item.get("providerId", ""))
    else:
        matching = [
            (candidate_id, item)
            for candidate_id, item in profile.get("profileInstances", {}).items()
            if isinstance(item, dict) and item.get("providerId") == provider_id
        ]
        if matching:
            profile_id = next(
                (candidate_id for candidate_id, _ in matching if candidate_id == profile.get("activeProfileId")),
                matching[0][0],
            )
            item = profile.get("profileInstances", {}).get(profile_id)
    model_id = str(payload.get("model", "")).strip()
    operation = str(payload.get("operation", "add")).strip() or "add"
    if capability not in DEFAULT_BINDINGS:
        return 400, {"ok": False, "code": "CAPABILITY_NOT_SUPPORTED", "message": f"Unsupported capability: {capability}"}
    if not provider_exists(provider_id):
        return 404, {"ok": False, "code": "PROVIDER_NOT_FOUND", "message": f"Provider not found: {provider_id}"}
    if not model_id:
        return 400, {"ok": False, "code": "MODEL_REQUIRED", "message": "Model is required for capability binding."}
    if operation not in {"add", "set-default", "remove"}:
        return 400, {"ok": False, "code": "INVALID_BINDING_OPERATION", "message": f"Unsupported binding operation: {operation}"}
    if operation != "remove" and not profile_model_supports_capability(item, provider_id, model_id, capability):
        return 400, {"ok": False, "code": "MODEL_CAPABILITY_MISMATCH", "message": "Selected model does not advertise this capability."}
    binding = {"providerId": provider_id, "model": model_id}
    if profile_id:
        binding["profileId"] = profile_id
    bindings = profile.setdefault("capabilityBindings", {})
    model_bindings = profile.setdefault("capabilityModelBindings", {})
    items = model_bindings.setdefault(capability, [])
    if operation == "remove":
        items[:] = [candidate for candidate in items if candidate != binding]
        if not items:
            model_bindings.pop(capability, None)
        if bindings.get(capability) == binding:
            if items:
                bindings[capability] = items[0]
            else:
                bindings.pop(capability, None)
    else:
        was_empty = not items
        if binding not in items:
            items.append(binding)
        if operation == "set-default" or was_empty or capability not in bindings:
            bindings[capability] = binding
    saved = write_provider_profile(profile)
    return 200, {"ok": True, "profile": public_profile(saved)}


def resolve_capability_binding(capability: str) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    profile = read_provider_profile()
    binding = profile.get("capabilityBindings", {}).get(capability)
    if not isinstance(binding, dict):
        return None, None
    profile_id = str(binding.get("profileId", "")).strip()
    item = profile.get("profileInstances", {}).get(profile_id) if profile_id else None
    if not isinstance(item, dict):
        provider_id = str(binding.get("providerId", "")).strip()
        item = next(
            (
                candidate
                for candidate in profile.get("profileInstances", {}).values()
                if isinstance(candidate, dict) and candidate.get("providerId") == provider_id
            ),
            None,
        )
    return binding, item if isinstance(item, dict) else None


def _public_binding(binding: dict[str, Any] | None) -> dict[str, str] | None:
    if not isinstance(binding, dict):
        return None
    provider_id = str(binding.get("providerId", "")).strip()
    model = str(binding.get("model", "")).strip()
    if not provider_id or not model:
        return None
    return {
        "profileId": str(binding.get("profileId", "")).strip(),
        "providerId": provider_id,
        "model": model,
    }


def capability_connection_statuses() -> dict[str, Any]:
    """Return safe, configuration-only truth for every Provider Hub capability.

    A configured model is only *connected* once the local runtime implements
    that task protocol and the chosen profile, model capability and secret are
    all valid.  This endpoint never tests a remote provider or returns a key.
    """
    profile = read_provider_profile()
    items = [_capability_connection_status(profile, capability) for capability in DEFAULT_BINDINGS]
    return {
        "ok": True,
        "items": items,
        "byCapability": {item["capability"]: item for item in items},
    }


def _capability_connection_status(profile_data: dict[str, Any], capability: str) -> dict[str, Any]:
    binding = profile_data.get("capabilityBindings", {}).get(capability)
    public_binding = _public_binding(binding if isinstance(binding, dict) else None)
    if not public_binding:
        supported = any(supports_live_capability(provider_id, capability) for provider_id in DEFAULT_PROVIDER_NAMES)
        return {
            "capability": capability,
            "state": "action-required" if supported else "unsupported",
            "code": "PROVIDER_BINDING_MISSING" if supported else "CAPABILITY_RUNTIME_NOT_SUPPORTED",
            "message": "No default model is bound for this capability." if supported else "No live runtime adapter exists for this capability yet.",
            "advice": ["Add a model with this capability in Provider Hub and set it as default."] if supported else ["This capability is catalog-only until a provider adapter is implemented."],
            "binding": None,
        }

    provider_id = public_binding["providerId"]
    model_id = public_binding["model"]
    if not supports_live_capability(provider_id, capability):
        return {
            "capability": capability,
            "state": "unsupported",
            "code": "CAPABILITY_PROVIDER_NOT_SUPPORTED",
            "message": "The bound provider has no live runtime adapter for this capability.",
            "advice": ["Choose a provider supported by this capability, or add its task adapter first."],
            "binding": public_binding,
        }

    profile_id = public_binding["profileId"]
    provider_profile = profile_data.get("profileInstances", {}).get(profile_id) if profile_id else None
    if not isinstance(provider_profile, dict):
        provider_profile = next(
            (
                candidate for candidate in profile_data.get("profileInstances", {}).values()
                if isinstance(candidate, dict) and str(candidate.get("providerId", "")) == provider_id
            ),
            None,
        )
    if not isinstance(provider_profile, dict):
        return {
            "capability": capability,
            "state": "action-required",
            "code": "PROVIDER_PROFILE_NOT_CONFIGURED",
            "message": "The bound provider profile is unavailable.",
            "advice": ["Save the provider profile, then bind the model again."],
            "binding": public_binding,
        }
    if not provider_profile.get("enabled", True):
        return {
            "capability": capability,
            "state": "action-required",
            "code": "PROVIDER_PROFILE_DISABLED",
            "message": "The bound provider profile is disabled.",
            "advice": ["Enable this provider profile in Provider Hub."],
            "binding": public_binding,
        }
    if not profile_model_supports_capability(provider_profile, provider_id, model_id, capability):
        return {
            "capability": capability,
            "state": "action-required",
            "code": "MODEL_CAPABILITY_MISMATCH",
            "message": "The bound model is not marked for this capability.",
            "advice": ["Refresh or edit model capability tags, then bind a compatible model."],
            "binding": public_binding,
        }
    api_key_status = get_provider_secret_status(provider_id, str(provider_profile.get("apiKeyRef", "")))
    if not api_key_status.get("configured"):
        return {
            "capability": capability,
            "state": "action-required",
            "code": "CONFIG_MISSING",
            "message": "The bound provider API key is not configured.",
            "advice": ["Save the API key for the bound provider profile in Provider Hub."],
            "binding": public_binding,
        }
    return {
        "capability": capability,
        "state": "connected",
        "code": "CAPABILITY_READY",
        "message": "The bound provider is ready for live requests.",
        "advice": [],
        "binding": public_binding,
    }


def video_generation_readiness() -> dict[str, Any]:
    """Describe whether the current video binding can submit a real task.

    This is intentionally a configuration-only check.  It never sends a request
    to the provider and never exposes a secret value.
    """
    binding, profile = resolve_capability_binding("video")
    if not isinstance(binding, dict) or not str(binding.get("providerId", "")).strip() or not str(binding.get("model", "")).strip():
        return {
            "ok": True,
            "ready": False,
            "code": "PROVIDER_BINDING_MISSING",
            "message": "No video model is bound yet.",
            "advice": ["In Provider Hub, add a video-capable model and set it as the default video binding."],
        }

    provider_id = str(binding.get("providerId", "")).strip()
    model_id = str(binding.get("model", "")).strip()
    public_binding = {
        "profileId": str(binding.get("profileId", "")).strip(),
        "providerId": provider_id,
        "model": model_id,
    }
    if not isinstance(profile, dict):
        return {
            "ok": True,
            "ready": False,
            "code": "PROVIDER_PROFILE_NOT_CONFIGURED",
            "message": "The bound video provider profile is unavailable.",
            "advice": ["Save the provider profile in Provider Hub, then bind its video model again."],
            "binding": public_binding,
        }
    if not profile.get("enabled", True):
        return {
            "ok": True,
            "ready": False,
            "code": "PROVIDER_PROFILE_DISABLED",
            "message": "The bound video provider profile is disabled.",
            "advice": ["Enable the provider profile in Provider Hub."],
            "binding": public_binding,
        }
    if not supports_live_video_generation(provider_id):
        return {
            "ok": True,
            "ready": False,
            "code": "VIDEO_PROVIDER_NOT_SUPPORTED",
            "message": "This provider is not supported by the live video runtime yet.",
            "advice": ["Use an OpenAI Compatible video provider, or add an adapter for this provider first."],
            "binding": public_binding,
        }
    if not profile_model_supports_capability(profile, provider_id, model_id, "video"):
        return {
            "ok": True,
            "ready": False,
            "code": "MODEL_CAPABILITY_MISMATCH",
            "message": "The bound model is not marked as video-capable.",
            "advice": ["Refresh or edit the model capabilities, then bind a model tagged with Video."],
            "binding": public_binding,
        }
    api_key_status = get_provider_secret_status(provider_id, str(profile.get("apiKeyRef", "")))
    if not api_key_status.get("configured"):
        return {
            "ok": True,
            "ready": False,
            "code": "CONFIG_MISSING",
            "message": "The video provider API key is not configured.",
            "advice": ["Save the API key for the bound provider profile in Provider Hub."],
            "binding": public_binding,
        }
    return {
        "ok": True,
        "ready": True,
        "code": "VIDEO_READY",
        "message": "The bound video provider is ready for task submission.",
        "advice": [],
        "binding": public_binding,
    }
