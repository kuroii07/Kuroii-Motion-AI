from __future__ import annotations

import json
import os
import re
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
TOKEN = "test-runtime-service-token"


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def read_text(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def request_json(method: str, url: str, data: dict | None = None, token: str | None = TOKEN) -> tuple[int, dict]:
    body = None if data is None else json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["X-Kuroii-Session"] = token
    request = Request(url, data=body, method=method, headers=headers)
    try:
        with urlopen(request, timeout=5) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        return exc.code, json.loads(exc.read().decode("utf-8"))


def wait_for_health(base_url: str) -> None:
    deadline = time.time() + 8
    while time.time() < deadline:
        try:
            status, payload = request_json("GET", f"{base_url}/health", token=None)
            if status == 200 and payload.get("ok"):
                return
        except Exception:
            pass
        time.sleep(0.15)
    raise RuntimeError("service did not become healthy")


def registration(host: str) -> dict:
    if host == "after-effects":
        return {
            "extensionId": "com.kuroii.motionai.ae",
            "projectId": "runtime-ae-project",
            "projectName": "Runtime AE Project",
            "hostVersion": "mock-2026",
            "agentVersion": "0.5.9-alpha.0",
            "connectionMode": "mock",
            "context": {
                "activeComp": {"id": "comp-runtime", "name": "Runtime Smoke Comp"},
                "selection": [{"id": "layer-runtime", "name": "Runtime Title", "type": "text", "text": "Kuroii"}],
            },
        }
    return {
        "extensionId": "com.kuroii.motionai.pr",
        "projectId": "runtime-pr-project",
        "projectName": "Runtime PR Project",
        "hostVersion": "mock-2026",
        "agentVersion": "0.5.9-alpha.0",
        "connectionMode": "mock",
        "context": {
            "activeSequence": {"id": "seq-runtime", "name": "Runtime Smoke Sequence"},
            "selection": [{"id": "clip-runtime", "name": "Runtime Opening Clip"}],
        },
    }


def assert_runtime_contract_files() -> None:
    root_package = json.loads(read_text("package.json"))
    desktop_package = json.loads(read_text("apps/desktop/package.json"))
    app_shell = read_text("apps/desktop/src/app-shell.js")
    runtime = read_text("apps/desktop/src/command-center-runtime.js")
    client = read_text("apps/desktop/src/local-service-client.js")
    next_steps = read_text("docs/NEXT_STEPS_v3.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "runtimeServiceSmoke" in app_shell
    assert "tests/smoke_desktop_runtime_service.py" in app_shell

    assert "commandCenterRuntimeVersion" in runtime
    assert "0.5.9-alpha.0" in runtime
    assert "commandCenterRuntimeServiceSmoke" in runtime
    assert "serviceBackedMethods" in runtime
    assert "createLocalServiceClient" in runtime
    assert "client.listHosts" in runtime
    assert "client.getHostContext" in runtime
    assert "client.listTrustedActions" in runtime
    assert "client.listCommandHistory" in runtime
    assert "client.executeReadOnlyAction" in runtime
    assert "state.serviceOnline = true" in runtime
    assert "normalizeServiceError" in runtime
    assert "createCommandId" in runtime
    assert "nowIso" in runtime

    assert "createLocalServiceClient" in client
    assert "executeReadOnlyAction" in client
    assert "/hosts/{host}/context" in client
    assert "/actions/trusted" in client
    assert "/commands" in client
    assert "Desktop Command Center Runtime Smoke With Service" in next_steps

    for label, text in {"runtime": runtime, "client": client, "app_shell": app_shell}.items():
        if re.search(r"[\x00-\x08\x0B\x0C\x0E-\x1F]", text):
            raise AssertionError(f"control characters found in {label}")
        if re.search(r"\?{3,}", text):
            raise AssertionError(f"placeholder question marks found in {label}")


def run_runtime_service_flow(base_url: str) -> None:
    for host in ["after-effects", "premiere-pro"]:
        status, payload = request_json("POST", f"{base_url}/hosts/{host}/register", registration(host))
        assert status == 200, payload
        assert payload["host"]["status"] == "Connected", payload

    status, hosts_payload = request_json("GET", f"{base_url}/hosts")
    assert status == 200, hosts_payload
    hosts = hosts_payload["hosts"]
    assert len(hosts) == 2, hosts_payload
    assert any(item["host"] == "after-effects" and item["status"] == "Connected" for item in hosts)

    selected_host = "after-effects"
    contexts: dict[str, dict] = {}
    for item in hosts:
        status, context_payload = request_json("GET", f"{base_url}/hosts/{item['host']}/context")
        assert status == 200, context_payload
        contexts[item["host"]] = context_payload["context"]
    assert contexts[selected_host]["project"]["projectId"] == "runtime-ae-project"
    assert contexts[selected_host]["context"]["activeComp"]["name"] == "Runtime Smoke Comp"

    status, actions_payload = request_json("GET", f"{base_url}/actions/trusted?host={selected_host}")
    assert status == 200, actions_payload
    actions = actions_payload["actions"]
    assert actions, actions_payload
    assert all(item["host"] == selected_host for item in actions)
    assert all(item["riskLevel"] == 0 and item["readOnly"] is True for item in actions)
    action_id = "ae.context.getActiveComp"
    assert any(item["id"] == action_id for item in actions)

    status, before_history = request_json("GET", f"{base_url}/commands?limit=20")
    assert status == 200, before_history

    command = {
        "commandId": "desktop-runtime-service-smoke",
        "sessionId": "desktop-command-center-runtime",
        "host": selected_host,
        "projectId": contexts[selected_host]["project"]["projectId"],
        "action": action_id,
        "target": {},
        "params": {},
        "riskLevel": 0,
        "requiresConfirmation": False,
        "createdAt": "2026-07-07T00:00:00Z",
        "timeoutMs": 30000,
    }
    status, result = request_json("POST", f"{base_url}/commands", command)
    assert status == 200, result
    assert result["ok"] is True
    assert result["code"] == "TRUSTED_ACTION_EXECUTED"
    assert result["data"]["readOnly"] is True
    assert result["data"]["mutationPerformed"] is False
    assert result["data"]["actionResult"]["activeComp"]["name"] == "Runtime Smoke Comp"

    status, after_history = request_json("GET", f"{base_url}/commands?limit=20&host={selected_host}")
    assert status == 200, after_history
    assert any(item["commandId"] == command["commandId"] for item in after_history["commands"])

    status, detail = request_json("GET", f"{base_url}/commands/{command['commandId']}")
    assert status == 200, detail
    assert detail["command"]["commandId"] == command["commandId"]
    assert detail["command"]["result"]["code"] == "TRUSTED_ACTION_EXECUTED"


def main() -> int:
    assert_runtime_contract_files()

    port = free_port()
    base_url = f"http://127.0.0.1:{port}"
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    process = subprocess.Popen(
        [sys.executable, str(ROOT / "apps/local-service/src/server.py"), "--port", str(port), "--token", TOKEN],
        cwd=str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
    )
    try:
        wait_for_health(base_url)
        run_runtime_service_flow(base_url)
        print("[OK] Desktop runtime service smoke test passed")
        return 0
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)


if __name__ == "__main__":
    raise SystemExit(main())