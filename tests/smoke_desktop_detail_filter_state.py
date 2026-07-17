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
TOKEN = "test-detail-filter-token"


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
            "projectId": "detail-ae-project",
            "projectName": "Detail AE Project",
            "hostVersion": "mock-2026",
            "agentVersion": "0.5.9-alpha.0",
            "connectionMode": "mock",
            "context": {
                "activeComp": {"id": "comp-detail", "name": "Detail Smoke Comp"},
                "selection": [{"id": "layer-detail", "name": "Detail Title", "type": "text", "text": "Kuroii"}],
            },
        }
    return {
        "extensionId": "com.kuroii.motionai.pr",
        "projectId": "detail-pr-project",
        "projectName": "Detail PR Project",
        "hostVersion": "mock-2026",
        "agentVersion": "0.5.9-alpha.0",
        "connectionMode": "mock",
        "context": {
            "activeSequence": {"id": "seq-detail", "name": "Detail Smoke Sequence"},
            "selection": [{"id": "clip-detail", "name": "Detail Opening Clip"}],
        },
    }


def command(command_id: str, host: str, project_id: str, action: str) -> dict:
    return {
        "commandId": command_id,
        "sessionId": "desktop-command-center-runtime",
        "host": host,
        "projectId": project_id,
        "action": action,
        "target": {},
        "params": {},
        "riskLevel": 0,
        "requiresConfirmation": False,
        "createdAt": "2026-07-07T00:00:00Z",
        "timeoutMs": 30000,
    }


def assert_detail_filter_contract_files() -> None:
    root_package = json.loads(read_text("package.json"))
    desktop_package = json.loads(read_text("apps/desktop/package.json"))
    app_shell = read_text("apps/desktop/src/app-shell.js")
    command_center = read_text("apps/desktop/src/command-center.js")
    runtime = read_text("apps/desktop/src/command-center-runtime.js")
    zh = json.loads(read_text("packages/i18n/src/locales/zh-CN.json"))
    en = json.loads(read_text("packages/i18n/src/locales/en-US.json"))

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "detailFilterStateSmoke" in app_shell
    assert "tests/smoke_desktop_detail_filter_state.py" in app_shell

    for needle in [
        "commandCenterDefaultHistoryFilters",
        "normalizeHistoryFilters",
        "historyFilterToServiceQuery",
        "matchesHistoryFilter",
        "buildCommandDetail",
        "buildActivityState",
        "buildRecoveryState",
        "resultFilters",
        "detailPanel",
        "resultSummary",
    ]:
        assert needle in command_center, needle

    for needle in [
        "commandCenterDetailFilterRuntime",
        "setHistoryFilters",
        "resetHistoryFilters",
        "openCommandDetail",
        "clearCommandDetail",
        "recoverFromError",
        "pendingOperation",
        "runningActionId",
        "historyFilterToServiceQuery",
        "client.getCommandDetail",
    ]:
        assert needle in runtime, needle

    assert zh["commandCenter"]["activity"]["executing"] == "正在执行只读动作"
    assert zh["commandCenter"]["filters"]["selected"] == "当前宿主"
    assert en["commandCenter"]["recovery"]["retryRefresh"] == "Retry refresh"
    assert en["commandCenter"]["detail"]["emptyTitle"] == "No command selected"

    for label, text in {"command_center": command_center, "runtime": runtime, "app_shell": app_shell}.items():
        if re.search(r"[\x00-\x08\x0B\x0C\x0E-\x1F]", text):
            raise AssertionError(f"control characters found in {label}")
        if re.search(r"\?{3,}", text):
            raise AssertionError(f"placeholder question marks found in {label}")


def run_filter_and_detail_flow(base_url: str) -> None:
    for host in ["after-effects", "premiere-pro"]:
        status, payload = request_json("POST", f"{base_url}/hosts/{host}/register", registration(host))
        assert status == 200, payload
        assert payload["host"]["status"] == "Connected", payload

    status, ae_result = request_json(
        "POST",
        f"{base_url}/commands",
        command("detail-filter-ae-success", "after-effects", "detail-ae-project", "ae.context.getActiveComp"),
    )
    assert status == 200, ae_result
    assert ae_result["code"] == "TRUSTED_ACTION_EXECUTED"
    assert ae_result["data"]["mutationPerformed"] is False

    status, pr_result = request_json(
        "POST",
        f"{base_url}/commands",
        command("detail-filter-pr-success", "premiere-pro", "detail-pr-project", "pr.context.getActiveSequence"),
    )
    assert status == 200, pr_result
    assert pr_result["code"] == "TRUSTED_ACTION_EXECUTED"
    assert pr_result["data"]["mutationPerformed"] is False

    status, ae_history = request_json("GET", f"{base_url}/commands?limit=10&host=after-effects&ok=true")
    assert status == 200, ae_history
    assert any(item["commandId"] == "detail-filter-ae-success" for item in ae_history["commands"])
    assert all(item["host"] == "after-effects" and item["ok"] is True for item in ae_history["commands"])

    status, action_history = request_json("GET", f"{base_url}/commands?limit=10&action=pr.context.getActiveSequence")
    assert status == 200, action_history
    assert any(item["commandId"] == "detail-filter-pr-success" for item in action_history["commands"])
    assert all(item["action"] == "pr.context.getActiveSequence" for item in action_history["commands"])

    status, detail = request_json("GET", f"{base_url}/commands/detail-filter-ae-success")
    assert status == 200, detail
    record = detail["command"]
    assert record["commandId"] == "detail-filter-ae-success"
    assert record["host"] == "after-effects"
    assert record["result"]["data"]["readOnly"] is True
    assert record["result"]["data"]["mutationPerformed"] is False


def main() -> int:
    assert_detail_filter_contract_files()

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
        run_filter_and_detail_flow(base_url)
        print("[OK] Desktop detail/filter state smoke test passed")
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