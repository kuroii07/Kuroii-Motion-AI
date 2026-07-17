from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
TOKEN = "test-action-token"


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


def register_payload(host: str) -> dict:
    if host == "after-effects":
        return {
            "extensionId": "com.kuroii.motionai.ae",
            "projectId": "mock-ae-project",
            "projectName": "Mock AE Project",
            "hostVersion": "mock-2026",
            "agentVersion": "0.3.4-alpha.0",
            "connectionMode": "mock",
            "context": {
                "activeComp": {"id": "comp-001", "name": "Mock Comp", "width": 1920, "height": 1080},
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
            "activeSequence": {"id": "seq-001", "name": "Mock Sequence", "markers": [{"name": "Intro", "time": 0}]},
            "selection": [{"id": "clip-1", "name": "Opening Clip"}],
        },
    }


def command(command_id: str, host: str, action: str, risk: int = 0, confirmation: bool = False) -> dict:
    project_id = "mock-ae-project" if host == "after-effects" else "mock-pr-project"
    return {
        "commandId": command_id,
        "sessionId": "action-smoke-session",
        "host": host,
        "projectId": project_id,
        "action": action,
        "target": {},
        "params": {"apiKey": "sk-action-secret"},
        "riskLevel": risk,
        "requiresConfirmation": confirmation,
        "createdAt": "2026-07-07T00:00:00Z",
        "timeoutMs": 30000,
    }


def main() -> int:
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

        query = urlencode({"host": "after-effects"})
        status, actions = request_json("GET", f"{base_url}/actions/trusted?{query}")
        assert status == 200 and actions["count"] >= 3
        assert any(item["id"] == "ae.context.getActiveComp" and item["readOnly"] is True for item in actions["actions"])

        status, ae_host = request_json("POST", f"{base_url}/hosts/after-effects/register", register_payload("after-effects"))
        assert status == 200 and ae_host["host"]["status"] == "Connected"

        status, pr_host = request_json("POST", f"{base_url}/hosts/premiere-pro/register", register_payload("premiere-pro"))
        assert status == 200 and pr_host["host"]["status"] == "Connected"

        status, context = request_json("GET", f"{base_url}/hosts/after-effects/context")
        assert status == 200
        assert context["context"]["context"]["activeComp"]["name"] == "Mock Comp"

        status, comp_result = request_json("POST", f"{base_url}/commands", command("action-comp", "after-effects", "ae.context.getActiveComp"))
        assert status == 200 and comp_result["code"] == "TRUSTED_ACTION_EXECUTED"
        assert comp_result["data"]["readOnly"] is True
        assert comp_result["data"]["mutationPerformed"] is False
        assert comp_result["data"]["actionResult"]["activeComp"]["name"] == "Mock Comp"

        status, text_result = request_json("POST", f"{base_url}/commands", command("action-text", "after-effects", "ae.text.readSelectedLayers"))
        assert status == 200 and text_result["data"]["actionResult"]["textLayers"][0]["text"] == "Kuroii"

        status, sequence_result = request_json("POST", f"{base_url}/commands", command("action-sequence", "premiere-pro", "pr.context.getActiveSequence"))
        assert status == 200
        assert sequence_result["data"]["actionResult"]["activeSequence"]["name"] == "Mock Sequence"

        status, out_of_scope = request_json("POST", f"{base_url}/commands", command("action-write", "after-effects", "ae.text.replaceSelectedLayers", risk=1))
        assert status == 409 and out_of_scope["code"] == "ACTION_OUT_OF_SCOPE"

        status, history = request_json("GET", f"{base_url}/commands?limit=10")
        assert status == 200 and history["count"] >= 4
        detail = next(item for item in history["commands"] if item["commandId"] == "action-comp")
        assert detail["code"] == "TRUSTED_ACTION_EXECUTED"
        assert detail["command"]["params"]["apiKey"] == "sk-a…cret"
        assert "sk-action-secret" not in json.dumps(history, ensure_ascii=False)

        status, one = request_json("GET", f"{base_url}/commands/action-comp")
        assert status == 200
        assert one["command"]["commandId"] == "action-comp"

        print("[OK] Action Execution smoke test passed")
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
