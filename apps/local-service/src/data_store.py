from __future__ import annotations

import json
from typing import Any

from config import workspace_root


def read_json(relative_path: str) -> Any:
    return json.loads((workspace_root() / relative_path).read_text(encoding="utf-8"))


def provider_manifests() -> list[dict[str, Any]]:
    manifest_dir = workspace_root() / "packages/provider-hub/manifests"
    manifests = []
    for path in sorted(manifest_dir.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        data["manifestPath"] = str(path.relative_to(workspace_root())).replace("\\", "/")
        manifests.append(data)
    return manifests


def capability_registry_path(host: str) -> str | None:
    return {
        "after-effects": "packages/capability-registry/registry/ae.capabilities.json",
        "premiere-pro": "packages/capability-registry/registry/pr.capabilities.json",
    }.get(host)


def capability_list(host: str) -> list[dict[str, Any]]:
    registry_path = capability_registry_path(host)
    if not registry_path:
        return []
    registry = read_json(registry_path)
    return list(registry.get("capabilities", []))

def capability_detail(host: str, action_id: str) -> dict[str, Any] | None:
    for capability in capability_list(host):
        if capability.get("id") == action_id:
            return dict(capability)
    return None


def capability_exists(host: str, action_id: str) -> bool:
    if host == "desktop":
        return True
    return capability_detail(host, action_id) is not None