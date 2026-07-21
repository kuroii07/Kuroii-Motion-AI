from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
TOKEN = "test-local-token"


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def request_json_with_headers(
    method: str,
    url: str,
    data: dict | None = None,
    token: str | None = TOKEN,
    extra_headers: dict[str, str] | None = None,
) -> tuple[int, dict, dict[str, str]]:
    body = None if data is None else json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["X-Kuroii-Session"] = token
    if extra_headers:
        headers.update(extra_headers)
    request = Request(url, data=body, method=method, headers=headers)
    try:
        with urlopen(request, timeout=5) as response:
            return response.status, json.loads(response.read().decode("utf-8")), dict(response.headers)
    except HTTPError as exc:
        return exc.code, json.loads(exc.read().decode("utf-8")), dict(exc.headers)


def request_json(method: str, url: str, data: dict | None = None, token: str | None = TOKEN) -> tuple[int, dict]:
    status, payload, _headers = request_json_with_headers(method, url, data, token)
    return status, payload


def request_empty_with_headers(method: str, url: str, extra_headers: dict[str, str]) -> tuple[int, dict[str, str]]:
    request = Request(url, method=method, headers=extra_headers)
    try:
        with urlopen(request, timeout=5) as response:
            return response.status, dict(response.headers)
    except HTTPError as exc:
        return exc.code, dict(exc.headers)


def wait_for_health(base_url: str) -> None:
    deadline = time.time() + 8
    last_error = None
    while time.time() < deadline:
        try:
            status, payload = request_json("GET", f"{base_url}/health", token=None)
            if status == 200 and payload.get("ok"):
                return
        except Exception as exc:  # pragma: no cover - diagnostic path
            last_error = exc
        time.sleep(0.15)
    raise RuntimeError(f"service did not become healthy: {last_error}")


def main() -> int:
    port = free_port()
    base_url = f"http://127.0.0.1:{port}"
    server_script = ROOT / "apps/local-service/src/server.py"
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    audio_history_directory = tempfile.TemporaryDirectory()
    env["KUROII_AUDIO_HISTORY_PATH"] = str(Path(audio_history_directory.name) / "audio-history.json")
    process = subprocess.Popen(
        [sys.executable, str(server_script), "--port", str(port), "--token", TOKEN],
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
        status, health = request_json("GET", f"{base_url}/health", token=None)
        assert status == 200 and health["serviceId"] == "kuroii-motion-ai-local-service"

        status, unauthorized = request_json("GET", f"{base_url}/providers", token=None)
        assert status == 401 and unauthorized["code"] == "SESSION_REQUIRED"

        status, providers = request_json("GET", f"{base_url}/providers")
        assert status == 200 and providers["count"] >= 4
        assert any(item["providerId"] == "openai-compatible" for item in providers["providers"])

        status, audio_history = request_json("GET", f"{base_url}/ai/audio/history")
        assert status == 200 and audio_history["items"] == [] and audio_history["storage"]["audioCount"] == 0
        status, audio_plan = request_json("POST", f"{base_url}/ai/audio/drafts", {
            "kind": "music-direction",
            "title": "Smoketest music plan",
            "content": {"prompt": "instrumental", "blueprint": "arc"},
            "metadata": {"useCase": "video", "mode": "instrumental", "apiKey": "must-not-save"},
        })
        assert status == 201 and audio_plan["item"]["hasAudio"] is False
        status, audio_history = request_json("GET", f"{base_url}/ai/audio/history")
        assert status == 200 and audio_history["count"] == 1

        cors_headers = {
            "Origin": "null",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-kuroii-session",
        }
        status, headers = request_empty_with_headers("OPTIONS", f"{base_url}/providers/openai/models", cors_headers)
        assert status == 204
        assert headers["Access-Control-Allow-Origin"] == "*"
        assert "POST" in headers["Access-Control-Allow-Methods"]
        assert "X-Kuroii-Session" in headers["Access-Control-Allow-Headers"]

        status, models, headers = request_json_with_headers(
            "POST",
            f"{base_url}/providers/ollama/models",
            {"config": {"baseUrl": "http://localhost:11434/v1"}},
            extra_headers={"Origin": "null"},
        )
        assert status == 200 and models["ok"] is True and models["source"] == "mock"
        assert headers["Access-Control-Allow-Origin"] == "*"

        status, hosts = request_json("GET", f"{base_url}/hosts")
        assert status == 200 and hosts["count"] == 2
        assert any(item["extensionId"] == "com.kuroii.motionai.ae" for item in hosts["hosts"])

        register_payload = {
            "extensionId": "com.kuroii.motionai.ae",
            "projectId": "mock-ae-project",
            "projectName": "Mock AE Project",
            "hostVersion": "mock-2026",
            "agentVersion": "0.3.4-alpha.0",
            "connectionMode": "mock",
            "context": {"activeComp": {"name": "Mock Comp"}, "selection": []},
        }
        status, registered = request_json("POST", f"{base_url}/hosts/after-effects/register", register_payload)
        assert status == 200 and registered["host"]["status"] == "Connected"

        command = {
            "commandId": "smoke-command-001",
            "sessionId": "smoke-session",
            "host": "after-effects",
            "projectId": "mock-ae-project",
            "action": "ae.context.getProject",
            "target": {},
            "params": {"apiKey": "sk-test-secret"},
            "riskLevel": 0,
            "requiresConfirmation": False,
            "createdAt": "2026-07-07T00:00:00Z",
            "timeoutMs": 30000,
        }
        status, result = request_json("POST", f"{base_url}/commands", command)
        assert status == 200 and result["ok"] is True and result["code"] == "TRUSTED_ACTION_EXECUTED"

        bad_command = dict(command)
        bad_command["commandId"] = "bad-capability"
        bad_command["action"] = "ae.unknown.missing"
        status, result = request_json("POST", f"{base_url}/commands", bad_command)
        assert status == 404 and result["code"] == "CAPABILITY_NOT_FOUND"

        return_code = 0
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
    output = process.stdout.read() if process.stdout else ""
    audio_history_directory.cleanup()
    assert "sk-test-secret" not in output, "service logs leaked full API key"
    assert "sk-t…cret" in output, "service logs did not show the expected redacted API key marker"
    print("[OK] Local Service smoke test passed")
    return return_code


if __name__ == "__main__":
    raise SystemExit(main())
