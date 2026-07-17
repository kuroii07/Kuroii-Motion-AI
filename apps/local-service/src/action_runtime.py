from __future__ import annotations

from copy import deepcopy
from typing import Any

from data_store import capability_detail, capability_list
from envelopes import now_iso
from host_runtime import get_host, normalize_host_id


SUPPORTED_HOSTS = ("after-effects", "premiere-pro")


def trusted_actions(host: str | None = None) -> list[dict[str, Any]]:
    hosts = [normalize_host_id(host)] if host else list(SUPPORTED_HOSTS)
    actions: list[dict[str, Any]] = []
    for host_id in hosts:
        for capability in capability_list(host_id):
            if capability.get("riskLevel") != 0:
                continue
            actions.append({
                "id": capability.get("id"),
                "host": host_id,
                "type": "Trusted Action",
                "riskLevel": 0,
                "readOnly": True,
                "supportsUndo": bool(capability.get("supportsUndo", False)),
                "executionMode": "mock-read-only",
                "testStatus": capability.get("testStatus", "stub"),
            })
    return actions


def trusted_action_exists(host: str, action_id: str) -> bool:
    capability = capability_detail(normalize_host_id(host), action_id)
    return bool(capability and capability.get("riskLevel") == 0)


def host_context_payload(host: str) -> dict[str, Any] | None:
    host_state = get_host(host)
    if not host_state:
        return None
    return {
        "host": host_state.get("host"),
        "displayName": host_state.get("displayName"),
        "status": host_state.get("status"),
        "project": {
            "projectId": host_state.get("projectId"),
            "projectName": host_state.get("projectName"),
        },
        "hostVersion": host_state.get("hostVersion"),
        "agentVersion": host_state.get("agentVersion"),
        "connectionMode": host_state.get("connectionMode"),
        "lastSeenAt": host_state.get("lastSeenAt"),
        "context": deepcopy(host_state.get("context") or {}),
    }


def execute_trusted_read_only_action(command: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    host_id = normalize_host_id(command["host"])
    action_id = command["action"]
    host_state = get_host(host_id)
    if not host_state:
        raise KeyError(host_id)

    capability = capability_detail(host_id, action_id)
    if not capability or capability.get("riskLevel") != 0:
        raise ValueError(f"action is not a read-only trusted action: {action_id}")

    context = deepcopy(host_state.get("context") or {})
    selection = context.get("selection") if isinstance(context.get("selection"), list) else []
    project = {
        "projectId": host_state.get("projectId"),
        "projectName": host_state.get("projectName"),
    }
    warnings: list[str] = []
    result: dict[str, Any] = {
        "actionId": action_id,
        "host": host_id,
        "readOnly": True,
        "mutationPerformed": False,
        "mock": True,
        "executedAt": now_iso(),
        "project": project,
        "contextLastSeenAt": host_state.get("lastSeenAt"),
    }

    if action_id == "ae.context.getProject" or action_id == "pr.context.getProject":
        result["project"] = project
        result["hostVersion"] = host_state.get("hostVersion")
        result["connectionMode"] = host_state.get("connectionMode")
    elif action_id == "ae.context.getActiveComp":
        result["activeComp"] = context.get("activeComp")
        if not result["activeComp"]:
            warnings.append("No active comp is available in the current AE mock context.")
    elif action_id == "pr.context.getActiveSequence":
        result["activeSequence"] = context.get("activeSequence")
        if not result["activeSequence"]:
            warnings.append("No active sequence is available in the current PR mock context.")
    elif action_id in {"ae.context.getSelection", "pr.context.getSelection"}:
        result["selection"] = selection
        result["selectionCount"] = len(selection)
    elif action_id == "ae.text.readSelectedLayers":
        text_layers = []
        for item in selection:
            if not isinstance(item, dict):
                continue
            if item.get("type") in {"text", "TextLayer"} or "text" in item:
                text_layers.append({
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "text": item.get("text", ""),
                })
        result["textLayers"] = text_layers
        result["selectionCount"] = len(selection)
        if not text_layers:
            warnings.append("No selected text layers were found in the AE mock context.")
    elif action_id == "ae.expression.scanErrors":
        result["expressionErrors"] = []
        result["scannedSelectionCount"] = len(selection)
    elif action_id == "ae.project.scanMissingFootage":
        result["missingFootage"] = []
        result["scannedProject"] = project
    elif action_id == "pr.marker.read":
        active_sequence = context.get("activeSequence") if isinstance(context.get("activeSequence"), dict) else {}
        result["markers"] = active_sequence.get("markers", [])
    elif action_id == "pr.subtitle.exportSrt":
        result["format"] = "srt"
        result["subtitles"] = []
        result["exportedFile"] = None
        warnings.append("Mock mode returns subtitle data only; it does not write an SRT file.")
    else:
        result["context"] = context
        warnings.append("Read-only capability resolved through the generic mock adapter.")

    return result, warnings
