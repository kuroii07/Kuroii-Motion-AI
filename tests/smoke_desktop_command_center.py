from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
TOKEN = "test-desktop-token"


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


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
            "projectId": "mock-ae-project",
            "projectName": "Mock AE Project",
            "hostVersion": "mock-2026",
            "agentVersion": "0.3.4-alpha.0",
            "connectionMode": "mock",
            "context": {
                "activeComp": {"id": "comp-001", "name": "Mock Comp"},
                "selection": [{"id": "layer-1", "name": "Title", "type": "text", "text": "Kuroii"}],
            },
        }
    return {
        "extensionId": "com.kuroii.motionai.pr",
        "projectId": "mock-pr-project",
        "projectName": "Mock PR Project",
        "hostVersion": "mock-2026",
        "agentVersion": "0.3.4-alpha.0",
        "connectionMode": "mock",
        "context": {
            "activeSequence": {"id": "seq-001", "name": "Mock Sequence"},
            "selection": [{"id": "clip-1", "name": "Opening Clip"}],
        },
    }


def read_text(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def assert_desktop_contract_files() -> None:
    app_shell = read_text("apps/desktop/src/app-shell.js")
    navigation = read_text("apps/desktop/src/navigation.js")
    client = read_text("apps/desktop/src/local-service-client.js")
    command_center = read_text("apps/desktop/src/command-center.js")
    package_json = json.loads(read_text("apps/desktop/package.json"))
    zh = json.loads(read_text("packages/i18n/src/locales/zh-CN.json"))
    en = json.loads(read_text("packages/i18n/src/locales/en-US.json"))

    assert "0.5.9-alpha.0" in app_shell
    assert package_json["version"] == "0.5.9-alpha.0"
    assert "commandCenterMode: \"read-only-first\"" in app_shell
    assert "{ id: \"command-center\"" in navigation
    assert "nav.commandCenter" in navigation
    assert "createLocalServiceClient" in client
    assert "X-Kuroii-Session" in client
    assert "/hosts/{host}/context" in client
    assert "/actions/trusted" in client
    assert "/commands/{commandId}" in client
    assert "buildCommandCenterViewModel" in command_center
    assert "allowedRiskLevels: [0]" in command_center
    assert "mutationActionsDisabled: true" in command_center
    assert zh["nav"]["commandCenter"] == "命令中心"
    assert en["nav"]["commandCenter"] == "Command Center"
    assert zh["commandCenter"]["sections"]["trustedActions"] == "只读可信动作"
    assert en["commandCenter"]["sections"]["resultHistory"] == "Result History"


def main() -> int:
    assert_desktop_contract_files()

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

        status, ae = request_json("POST", f"{base_url}/hosts/after-effects/register", registration("after-effects"))
        assert status == 200 and ae["host"]["status"] == "Connected"
        status, pr = request_json("POST", f"{base_url}/hosts/premiere-pro/register", registration("premiere-pro"))
        assert status == 200 and pr["host"]["status"] == "Connected"

        status, hosts = request_json("GET", f"{base_url}/hosts")
        assert status == 200 and hosts["count"] == 2
        assert any(item["host"] == "after-effects" and item["status"] == "Connected" for item in hosts["hosts"])

        status, context = request_json("GET", f"{base_url}/hosts/after-effects/context")
        assert status == 200
        assert context["context"]["context"]["activeComp"]["name"] == "Mock Comp"

        status, actions = request_json("GET", f"{base_url}/actions/trusted?host=after-effects")
        assert status == 200
        assert any(item["id"] == "ae.context.getActiveComp" for item in actions["actions"])

        command = {
            "commandId": "desktop-command-center-smoke",
            "sessionId": "desktop-command-center",
            "host": "after-effects",
            "projectId": "mock-ae-project",
            "action": "ae.context.getActiveComp",
            "target": {},
            "params": {},
            "riskLevel": 0,
            "requiresConfirmation": False,
            "createdAt": "2026-07-07T00:00:00Z",
            "timeoutMs": 30000,
        }
        status, result = request_json("POST", f"{base_url}/commands", command)
        assert status == 200 and result["code"] == "TRUSTED_ACTION_EXECUTED"
        assert result["data"]["actionResult"]["activeComp"]["name"] == "Mock Comp"

        status, history = request_json("GET", f"{base_url}/commands?limit=5&host=after-effects")
        assert status == 200
        assert any(item["commandId"] == "desktop-command-center-smoke" for item in history["commands"])

        print("[OK] Desktop Command Center smoke test passed")
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
