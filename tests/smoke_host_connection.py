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
TOKEN = "test-host-token"


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


def ae_registration() -> dict:
    return {
        "extensionId": "com.kuroii.motionai.ae",
        "projectId": "mock-ae-project",
        "projectName": "Mock AE Project",
        "hostVersion": "mock-2026",
        "agentVersion": "0.3.4-alpha.0",
        "connectionMode": "mock",
        "context": {"activeComp": {"name": "Mock Comp"}, "selection": []},
    }


def command(command_id: str = "host-smoke-command", risk: int = 0, confirmation: bool = False, action: str = "ae.context.getProject") -> dict:
    return {
        "commandId": command_id,
        "sessionId": "host-smoke-session",
        "host": "after-effects",
        "projectId": "mock-ae-project",
        "action": action,
        "target": {},
        "params": {},
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

        status, hosts = request_json("GET", f"{base_url}/hosts")
        assert status == 200 and hosts["count"] == 2
        assert any(item["host"] == "after-effects" and item["status"] == "Offline" for item in hosts["hosts"])

        status, result = request_json("POST", f"{base_url}/commands", command("offline-command"))
        assert status == 409 and result["code"] == "HOST_OFFLINE"

        status, registered = request_json("POST", f"{base_url}/hosts/after-effects/register", ae_registration())
        assert status == 200 and registered["host"]["status"] == "Connected"
        assert registered["target"]["targetHost"] == "after-effects"

        status, heartbeat = request_json("POST", f"{base_url}/hosts/after-effects/heartbeat", {**ae_registration(), "status": "Busy"})
        assert status == 200 and heartbeat["host"]["status"] == "Busy"

        status, busy_result = request_json("POST", f"{base_url}/commands", command("busy-command"))
        assert status == 409 and busy_result["code"] == "HOST_BUSY"

        status, heartbeat = request_json("POST", f"{base_url}/hosts/after-effects/heartbeat", {**ae_registration(), "status": "Connected"})
        assert status == 200 and heartbeat["host"]["status"] == "Connected"

        status, caps = request_json("GET", f"{base_url}/hosts/after-effects/capabilities")
        assert status == 200 and any(item["id"] == "ae.context.getProject" for item in caps["capabilities"])

        status, target = request_json("POST", f"{base_url}/host-target", {"targetHost": "after-effects", "hostLock": True})
        assert status == 200 and target["target"]["hostLock"] is True

        status, result = request_json("POST", f"{base_url}/commands", command("connected-command"))
        assert status == 200 and result["code"] == "TRUSTED_ACTION_EXECUTED"
        assert result["data"]["hostStatus"] == "Connected"

        status, waiting = request_json("POST", f"{base_url}/commands", command("confirm-command", risk=1, confirmation=True, action="ae.text.replaceSelectedLayers"))
        assert status == 202 and waiting["code"] == "WAITING_FOR_CONFIRMATION"
        assert waiting["data"]["hostStatus"] == "WaitingForConfirmation"

        print("[OK] Host Connection smoke test passed")
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
