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
TOKEN = "test-provider-v2-token"


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def request_json(method: str, url: str, data: dict | None = None) -> tuple[int, dict]:
    body = None if data is None else json.dumps(data).encode("utf-8")
    request = Request(
        url,
        data=body,
        method=method,
        headers={"Content-Type": "application/json", "X-Kuroii-Session": TOKEN},
    )
    try:
        with urlopen(request, timeout=5) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        return exc.code, json.loads(exc.read().decode("utf-8"))


def wait_for_health(base_url: str) -> None:
    deadline = time.time() + 8
    while time.time() < deadline:
        try:
            request = Request(f"{base_url}/health", method="GET")
            with urlopen(request, timeout=1) as response:
                if response.status == 200:
                    return
        except Exception:
            time.sleep(0.15)
    raise RuntimeError("service did not become healthy")


def start_service(port: int, profile_path: Path, secret_path: Path) -> subprocess.Popen[str]:
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    env["KUROII_PROVIDER_PROFILE_PATH"] = str(profile_path)
    env["KUROII_SECRET_STORE_PATH"] = str(secret_path)
    return subprocess.Popen(
        [sys.executable, str(ROOT / "apps/local-service/src/server.py"), "--port", str(port), "--token", TOKEN],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
    )


def stop_service(process: subprocess.Popen[str]) -> None:
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=5)


def main() -> int:
    prototype_js = (ROOT / "apps/desktop/prototype/prototype.js").read_text(encoding="utf-8")
    prototype_css = (ROOT / "apps/desktop/prototype/styles.css").read_text(encoding="utf-8")
    provider_css = (ROOT / "apps/desktop/prototype/styles/provider-hub.css").read_text(encoding="utf-8")
    for marker in (
        "providerHubShell",
        "providerProfileList",
        "providerDetailTabs",
        'data-provider-tab="${id}"',
        '["connection"',
        '["capabilities"',
        'id="providerModelSelect"',
        "providerCapabilityFilter",
        "addManualProviderModel",
        'id="providerManualModelId"',
        'id="addManualProviderModelButton"',
        "providerModelsForActiveCapability",
        "createProviderProfile",
        "copyProviderProfile",
        "pasteProviderProfile",
        "requestDeleteProviderProfile",
        "confirmDeleteProviderProfile",
        "closeProviderDeleteConfirm",
        "handleProviderDeleteDialogKeydown",
        "function providerOperationPending()",
        'aria-busy="${pending ? "true" : "false"}"',
        'data-provider-pending="${pending ? "true" : "false"}"',
        'state.providerConfig.status === "refreshing"',
        'state.providerConfig.status === "testing"',
        'state.providerConfig.status === "saving"',
        'state.providerConfig.apiKeySaveState === "saving"',
        'return state.locale === "zh-CN" ? "操作失败" : "Operation failed";',
        'role="${tone === "error" ? "alert" : "status"}"',
        'id="newProviderProfileButton" type="button"',
        'id="copyProviderProfileButton" type="button"',
        'id="pasteProviderProfileButton" type="button"',
        'requestFocus("cancelDeleteProviderProfileButton")',
        'requestFocus("deleteProviderProfileButton")',
        'event.key !== "Tab"',
        'event.key === "Escape"',
        "navigator.clipboard.writeText",
        "navigator.clipboard.readText",
        "providerDeleteConfirm",
        "capabilityModelBindings",
        'id="providerImagesPath"',
        "imagesPath",
        "setDefaultCapabilityModel",
        "removeCapabilityModelBinding",
        "/provider-profiles/",
        'providerMobileView: "list"',
        'data-provider-mobile-view="${state.providerMobileView}"',
        'id="providerBackToProfiles"',
        'class="providerFormActions providerStickyActions"',
        'state.providerMobileView = "detail"',
        'state.providerMobileView = "list"',
    ):
        assert marker in prototype_js, f"missing Provider Hub V2 UI marker: {marker}"
    for marker in (
        ".providerHubShell",
        ".providerProfileList",
        ".providerDetailBody",
        ".providerDeleteConfirm:focus-within",
        ".providerDetailActions .providerStateBadge",
        "overflow-y: auto",
    ):
        assert marker in prototype_css, f"missing Provider Hub V2 CSS marker: {marker}"
    for marker in (
        ".providerBackButton",
        '.providerHubShell[data-provider-mobile-view="list"] .providerDetailPane',
        '.providerHubShell[data-provider-mobile-view="detail"] .providerProfilePane',
        ".providerStickyActions",
        "position: sticky",
        "@media (max-width: 840px)",
    ):
        assert marker in provider_css, f"missing Provider Hub responsive marker: {marker}"

    runtime_dir = ROOT / ".runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    port = free_port()
    base_url = f"http://127.0.0.1:{port}"
    profile_path = runtime_dir / f"provider-profile-v2-{port}.json"
    secret_path = runtime_dir / f"provider-secrets-v2-{port}.dpapi.json"
    process = start_service(port, profile_path, secret_path)
    raw_keys = ["sk-paper-profile-secret", "sk-company-profile-secret"]

    try:
        wait_for_health(base_url)

        status, video_readiness = request_json("GET", f"{base_url}/ai/video/readiness")
        assert status == 200 and video_readiness["ready"] is False
        assert video_readiness["code"] == "PROVIDER_BINDING_MISSING"

        status, capability_status = request_json("GET", f"{base_url}/provider-capabilities")
        assert status == 200 and capability_status["ok"] is True
        assert capability_status["byCapability"]["video"]["state"] == "action-required"
        assert capability_status["byCapability"]["vision"]["state"] == "unsupported"

        status, paper = request_json("POST", f"{base_url}/provider-profiles", {
            "name": "Paper-GPT",
            "providerId": "openai-compatible",
            "config": {
                "baseUrl": "https://paper.example.com/v1",
                "modelsPath": "/models",
                "chatPath": "/chat/completions",
                "timeoutSeconds": 12,
                "defaultCapabilities": ["text"],
                "models": [
                    {"id": "gpt-5.5", "label": "gpt-5.5", "capabilities": ["text"]},
                    {"id": "gpt-image-2", "label": "gpt-image-2", "capabilities": ["image"]},
                    {"id": "video-test", "label": "video-test", "capabilities": ["video"]},
                ],
            },
        })
        assert status == 201 and paper["ok"] is True
        paper_profile = paper["providerProfile"]
        assert paper_profile["profileId"]
        assert paper_profile["name"] == "Paper-GPT"
        assert paper_profile["providerId"] == "openai-compatible"
        assert paper_profile["apiKeyRef"] == f"provider-profile:{paper_profile['profileId']}:apiKey"

        status, company = request_json("POST", f"{base_url}/provider-profiles", {
            "name": "公司中转",
            "providerId": "openai-compatible",
            "config": {
                "baseUrl": "https://company.example.com/v1",
                "modelsPath": "/models",
                "chatPath": "/chat/completions",
                "defaultCapabilities": ["text", "vision"],
                "models": [
                    {"id": "company-chat", "label": "company-chat", "capabilities": ["text"]},
                ],
            },
        })
        assert status == 201 and company["ok"] is True
        company_profile = company["providerProfile"]
        assert company_profile["profileId"] != paper_profile["profileId"]
        assert company_profile["profileId"].startswith("openai-compatible")
        assert company_profile["timeoutSeconds"] == 120

        for item, raw_key in zip((paper_profile, company_profile), raw_keys, strict=True):
            status, saved_secret = request_json(
                "POST",
                f"{base_url}/provider-profiles/{item['profileId']}/secret",
                {"apiKey": raw_key},
            )
            assert status == 200 and saved_secret["ok"] is True
            assert saved_secret["profileId"] == item["profileId"]
            assert saved_secret["apiKeyRef"] == f"provider-profile:{item['profileId']}:apiKey"
            assert saved_secret["apiKeyStatus"]["configured"] is True
            assert raw_key not in json.dumps(saved_secret, ensure_ascii=False)

        status, renamed = request_json(
            "POST",
            f"{base_url}/provider-profiles/{company_profile['profileId']}/profile",
            {"name": "公司 GPT 中转", "config": {"baseUrl": "https://company.example.com/v2"}},
        )
        assert status == 200 and renamed["providerProfile"]["name"] == "公司 GPT 中转"

        status, bound = request_json("POST", f"{base_url}/provider-bindings/text", {
            "profileId": paper_profile["profileId"],
            "model": "gpt-5.5",
        })
        assert status == 200
        assert bound["profile"]["capabilityBindings"]["text"] == {
            "profileId": paper_profile["profileId"],
            "providerId": "openai-compatible",
            "model": "gpt-5.5",
        }
        assert bound["profile"]["capabilityModelBindings"]["text"] == [
            {"profileId": paper_profile["profileId"], "providerId": "openai-compatible", "model": "gpt-5.5"}
        ]

        status, second_text = request_json("POST", f"{base_url}/provider-bindings/text", {
            "profileId": company_profile["profileId"],
            "model": "company-chat",
        })
        assert status == 200
        assert len(second_text["profile"]["capabilityModelBindings"]["text"]) == 2
        assert second_text["profile"]["capabilityBindings"]["text"]["profileId"] == paper_profile["profileId"]

        status, default_text = request_json("POST", f"{base_url}/provider-bindings/text", {
            "profileId": company_profile["profileId"],
            "model": "company-chat",
            "operation": "set-default",
        })
        assert status == 200
        assert default_text["profile"]["capabilityBindings"]["text"]["profileId"] == company_profile["profileId"]

        status, removed_text = request_json("POST", f"{base_url}/provider-bindings/text", {
            "profileId": company_profile["profileId"],
            "model": "company-chat",
            "operation": "remove",
        })
        assert status == 200
        assert removed_text["profile"]["capabilityModelBindings"]["text"] == [
            {"profileId": paper_profile["profileId"], "providerId": "openai-compatible", "model": "gpt-5.5"}
        ]
        assert removed_text["profile"]["capabilityBindings"]["text"]["profileId"] == paper_profile["profileId"]

        status, restored_text = request_json("POST", f"{base_url}/provider-bindings/text", {
            "profileId": company_profile["profileId"],
            "model": "company-chat",
            "operation": "set-default",
        })
        assert status == 200
        assert len(restored_text["profile"]["capabilityModelBindings"]["text"]) == 2
        assert restored_text["profile"]["capabilityBindings"]["text"]["profileId"] == company_profile["profileId"]

        status, image_bound = request_json("POST", f"{base_url}/provider-bindings/image", {
            "profileId": paper_profile["profileId"],
            "model": "gpt-image-2",
        })
        assert status == 200
        assert image_bound["profile"]["capabilityBindings"]["image"]["model"] == "gpt-image-2"
        assert image_bound["profile"]["capabilityModelBindings"]["image"][0]["model"] == "gpt-image-2"

        status, video_bound = request_json("POST", f"{base_url}/provider-bindings/video", {
            "profileId": paper_profile["profileId"],
            "model": "video-test",
        })
        assert status == 200
        assert video_bound["profile"]["capabilityBindings"]["video"]["model"] == "video-test"
        status, video_readiness = request_json("GET", f"{base_url}/ai/video/readiness")
        assert status == 200 and video_readiness["ready"] is True
        assert video_readiness["binding"]["model"] == "video-test"

        status, capability_status = request_json("GET", f"{base_url}/provider-capabilities")
        assert status == 200 and capability_status["ok"] is True
        assert capability_status["byCapability"]["video"]["state"] == "connected"
        assert capability_status["byCapability"]["video"]["binding"]["model"] == "video-test"

        status, selected = request_json(
            "POST", f"{base_url}/provider-profiles/{company_profile['profileId']}/select", {}
        )
        assert status == 200 and selected["profile"]["activeProfileId"] == company_profile["profileId"]

        status, rebound = request_json("POST", f"{base_url}/provider-bindings/text", {
            "profileId": company_profile["profileId"],
            "model": "company-chat",
            "operation": "set-default",
        })
        assert status == 200 and rebound["profile"]["capabilityBindings"]["text"]["profileId"] == company_profile["profileId"]

        stop_service(process)
        process = start_service(port, profile_path, secret_path)
        wait_for_health(base_url)

        status, payload = request_json("GET", f"{base_url}/provider-profile")
        assert status == 200 and payload["ok"] is True
        profile = payload["profile"]
        instances = profile["profileInstances"]
        assert profile["activeProfileId"] == company_profile["profileId"]
        assert {instances[paper_profile["profileId"]]["name"], instances[company_profile["profileId"]]["name"]} == {
            "Paper-GPT",
            "公司 GPT 中转",
        }
        assert instances[paper_profile["profileId"]]["apiKeyStatus"]["configured"] is True
        assert instances[company_profile["profileId"]]["apiKeyStatus"]["configured"] is True

        compatible_projection = profile["profiles"]["openai-compatible"]
        assert compatible_projection["profileId"] == company_profile["profileId"]
        assert compatible_projection["name"] == "公司 GPT 中转"

        profile_text = profile_path.read_text(encoding="utf-8")
        secret_text = secret_path.read_text(encoding="utf-8")
        response_text = json.dumps(payload, ensure_ascii=False)
        for raw_key in raw_keys:
            assert raw_key not in profile_text
            assert raw_key not in secret_text
            assert raw_key not in response_text

        status, deleted = request_json(
            "DELETE", f"{base_url}/provider-profiles/{company_profile['profileId']}"
        )
        assert status == 200 and deleted["ok"] is True
        assert company_profile["profileId"] not in deleted["profile"]["profileInstances"]
        assert deleted["profile"]["activeProfileId"] != company_profile["profileId"]
        assert deleted["profile"]["capabilityBindings"].get("text", {}).get("profileId") != company_profile["profileId"]
        secret_store = json.loads(secret_path.read_text(encoding="utf-8"))
        assert f"provider-profile:{company_profile['profileId']}:apiKey" not in secret_store["secrets"]

        status, deleted_paper = request_json("DELETE", f"{base_url}/provider-profiles/{paper_profile['profileId']}")
        assert status == 200 and deleted_paper["ok"] is True
        remaining_profile_id = next(iter(deleted_paper["profile"]["profileInstances"]))
        status, last_profile = request_json("DELETE", f"{base_url}/provider-profiles/{remaining_profile_id}")
        assert status == 409 and last_profile["code"] == "PROVIDER_PROFILE_REQUIRED"

        print("[OK] Provider Hub V2 smoke test passed")
        return 0
    finally:
        if process.poll() is None:
            stop_service(process)
        profile_path.unlink(missing_ok=True)
        secret_path.unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(main())
