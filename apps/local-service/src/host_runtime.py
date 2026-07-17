from __future__ import annotations

from copy import deepcopy
from threading import RLock
from typing import Any

from data_store import capability_list, read_json
from envelopes import now_iso

HOST_STATUS = {"Offline", "Connected", "Busy", "WaitingForConfirmation", "Executing", "Error", "Updating"}
HOST_REGISTRY_PATHS = {
    "after-effects": "packages/capability-registry/registry/ae.capabilities.json",
    "premiere-pro": "packages/capability-registry/registry/pr.capabilities.json",
}
DEFAULT_HOSTS: dict[str, dict[str, Any]] = {
    "after-effects": {
        "host": "after-effects",
        "displayName": "After Effects",
        "extensionId": "com.kuroii.motionai.ae",
        "status": "Offline",
        "projectId": "mock-ae-project",
        "projectName": "Mock AE Project",
        "hostVersion": "unknown",
        "agentVersion": "0.3.4-alpha.0",
        "lastSeenAt": None,
        "connectionMode": "mock",
        "context": {
            "activeComp": None,
            "selection": [],
        },
    },
    "premiere-pro": {
        "host": "premiere-pro",
        "displayName": "Premiere Pro",
        "extensionId": "com.kuroii.motionai.pr",
        "status": "Offline",
        "projectId": "mock-pr-project",
        "projectName": "Mock PR Project",
        "hostVersion": "unknown",
        "agentVersion": "0.3.4-alpha.0",
        "lastSeenAt": None,
        "connectionMode": "mock",
        "context": {
            "activeSequence": None,
            "selection": [],
        },
    },
}

_lock = RLock()
_hosts: dict[str, dict[str, Any]] = deepcopy(DEFAULT_HOSTS)
_target_lock: dict[str, Any] = {
    "activeHost": None,
    "targetHost": None,
    "pinnedHost": None,
    "hostLock": False,
    "project": None,
    "compOrSequence": None,
    "selection": [],
    "updatedAt": None,
}


def normalize_host_id(host: str) -> str:
    aliases = {"ae": "after-effects", "aftereffects": "after-effects", "pr": "premiere-pro", "premiere": "premiere-pro"}
    return aliases.get(str(host).lower(), str(host).lower())


def host_exists(host: str) -> bool:
    return normalize_host_id(host) in _hosts


def _with_capabilities(host_state: dict[str, Any]) -> dict[str, Any]:
    item = deepcopy(host_state)
    registry_path = HOST_REGISTRY_PATHS.get(item["host"])
    capabilities = []
    if registry_path:
        registry = read_json(registry_path)
        capabilities = registry.get("capabilities", [])
    item["capabilityCount"] = len(capabilities)
    item["capabilities"] = [cap.get("id") for cap in capabilities[:8]]
    return item


def list_hosts() -> list[dict[str, Any]]:
    with _lock:
        return [_with_capabilities(host) for host in _hosts.values()]


def get_host(host: str) -> dict[str, Any] | None:
    host_id = normalize_host_id(host)
    with _lock:
        item = _hosts.get(host_id)
        return _with_capabilities(item) if item else None


def _merge_host_state(host_id: str, payload: dict[str, Any], status: str) -> dict[str, Any]:
    current = deepcopy(_hosts[host_id])
    context = payload.get("context") if isinstance(payload.get("context"), dict) else {}
    current.update({
        "status": status,
        "lastSeenAt": now_iso(),
        "projectId": payload.get("projectId", current.get("projectId")),
        "projectName": payload.get("projectName", current.get("projectName")),
        "hostVersion": payload.get("hostVersion", current.get("hostVersion")),
        "agentVersion": payload.get("agentVersion", current.get("agentVersion")),
        "connectionMode": payload.get("connectionMode", current.get("connectionMode", "mock")),
    })
    merged_context = dict(current.get("context") or {})
    merged_context.update(context)
    current["context"] = merged_context
    _hosts[host_id] = current
    _target_lock["activeHost"] = host_id
    if not _target_lock.get("hostLock"):
        _target_lock["targetHost"] = host_id
    _target_lock["project"] = {"projectId": current.get("projectId"), "projectName": current.get("projectName")}
    _target_lock["compOrSequence"] = context.get("activeComp") or context.get("activeSequence") or _target_lock.get("compOrSequence")
    _target_lock["selection"] = context.get("selection", _target_lock.get("selection", []))
    _target_lock["updatedAt"] = now_iso()
    return _with_capabilities(current)


def register_host(host: str, payload: dict[str, Any]) -> dict[str, Any]:
    host_id = normalize_host_id(host)
    if host_id not in _hosts:
        raise KeyError(host_id)
    extension_id = payload.get("extensionId")
    expected_extension_id = _hosts[host_id].get("extensionId")
    if extension_id and extension_id != expected_extension_id:
        raise ValueError(f"extensionId mismatch: expected {expected_extension_id}")
    with _lock:
        return _merge_host_state(host_id, payload, "Connected")


def heartbeat_host(host: str, payload: dict[str, Any]) -> dict[str, Any]:
    host_id = normalize_host_id(host)
    if host_id not in _hosts:
        raise KeyError(host_id)
    status = payload.get("status", "Connected")
    if status not in HOST_STATUS:
        raise ValueError(f"invalid host status: {status}")
    with _lock:
        return _merge_host_state(host_id, payload, status)


def update_host_status(host: str, status: str, message: str | None = None) -> dict[str, Any]:
    host_id = normalize_host_id(host)
    if host_id not in _hosts:
        raise KeyError(host_id)
    if status not in HOST_STATUS:
        raise ValueError(f"invalid host status: {status}")
    with _lock:
        current = deepcopy(_hosts[host_id])
        current["status"] = status
        current["lastStatusMessage"] = message
        current["lastSeenAt"] = now_iso()
        _hosts[host_id] = current
        return _with_capabilities(current)


def get_target_lock() -> dict[str, Any]:
    with _lock:
        return deepcopy(_target_lock)


def update_target_lock(payload: dict[str, Any]) -> dict[str, Any]:
    with _lock:
        for key in ["activeHost", "targetHost", "pinnedHost"]:
            if key in payload and payload[key] is not None:
                host_id = normalize_host_id(payload[key])
                if host_id not in _hosts:
                    raise KeyError(host_id)
                _target_lock[key] = host_id
        if "hostLock" in payload:
            _target_lock["hostLock"] = bool(payload["hostLock"])
        for key in ["project", "compOrSequence", "selection"]:
            if key in payload:
                _target_lock[key] = payload[key]
        _target_lock["updatedAt"] = now_iso()
        return deepcopy(_target_lock)


def capabilities_for_host(host: str) -> list[dict[str, Any]]:
    host_id = normalize_host_id(host)
    return capability_list(host_id)


def evaluate_command_target(command: dict[str, Any]) -> tuple[bool, str, str, list[str]]:
    host_id = normalize_host_id(command.get("host", ""))
    if host_id == "desktop":
        return True, "OK", "Desktop command target is valid.", []
    with _lock:
        host = deepcopy(_hosts.get(host_id))
        lock = deepcopy(_target_lock)
    if not host:
        return False, "HOST_NOT_REGISTERED", "Target host is not registered.", ["检查目标宿主。"]
    if host.get("status") == "Offline":
        return False, "HOST_OFFLINE", "Target host is offline.", ["打开对应 AE/PR 扩展，等待 Host Agent 注册或心跳。"]
    if host.get("status") in {"Busy", "Executing", "Updating"}:
        return False, "HOST_BUSY", "Target host is busy.", ["等待当前动作完成，或切换目标宿主。"]
    if lock.get("hostLock") and lock.get("targetHost") and lock.get("targetHost") != host_id:
        return False, "HOST_LOCK_MISMATCH", "Host lock points to another target host.", ["检查 Desktop 的 Host Lock / Target Host。"]
    command_project = command.get("projectId")
    if command_project and host.get("projectId") and command_project != host.get("projectId"):
        return False, "TARGET_PROJECT_MISMATCH", "Command project does not match registered host project.", ["刷新 Host Context，确认 Project。"]
    return True, "OK", "Command target is valid.", []


def command_host_metadata(host: str) -> dict[str, Any]:
    host_id = normalize_host_id(host)
    with _lock:
        host_state = deepcopy(_hosts.get(host_id, {}))
        target_lock = deepcopy(_target_lock)
    return {
        "hostStatus": host_state.get("status"),
        "hostLastSeenAt": host_state.get("lastSeenAt"),
        "targetLock": target_lock,
    }
