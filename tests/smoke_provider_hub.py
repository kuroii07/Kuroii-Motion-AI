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
TOKEN = "test-provider-token"


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


def main() -> int:
    port = free_port()
    base_url = f"http://127.0.0.1:{port}"
    profile_path = ROOT / f".runtime/provider-profile-smoke-{port}.json"
    secret_path = ROOT / f".runtime/provider-secrets-smoke-{port}.dpapi.json"
    legacy_secret_path = ROOT / f".runtime/provider-secrets-smoke-{port}.legacy.json"
    legacy_secret_path.parent.mkdir(parents=True, exist_ok=True)
    legacy_secret_path.write_text(json.dumps({
        "version": 1,
        "secrets": {
            "provider:openai:apiKey": {
                "kind": "apiKey",
                "providerId": "openai",
                "value": "sk-legacy-migration-test",
            }
        },
    }), encoding="utf-8")
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    env["KUROII_SECRET_STORE_PATH"] = str(secret_path)
    env["KUROII_LEGACY_SECRET_STORE_PATH"] = str(legacy_secret_path)
    env["KUROII_PROVIDER_PROFILE_PATH"] = str(profile_path)
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

        status, guidance = request_json("GET", f"{base_url}/provider-errors")
        assert status == 200 and guidance["ok"] is True
        assert "AUTH_INVALID_KEY" in guidance["guidance"]
        assert guidance["guidance"]["AUTH_INVALID_KEY"]["advice"][0]["labelZh"] == "检查 Key"

        status, config = request_json("GET", f"{base_url}/providers/openai/config")
        assert status == 200 and config["form"]["providerId"] == "openai"
        assert any(field["id"] == "apiKey" and field["secret"] for field in config["form"]["fields"])

        status, compatible_config = request_json("GET", f"{base_url}/providers/openai-compatible/config")
        assert status == 200 and compatible_config["form"]["providerId"] == "openai-compatible"
        compatible_fields = {field["id"]: field for field in compatible_config["form"]["fields"]}
        assert compatible_fields["modelsPath"]["defaultValue"] == "/models"
        assert compatible_fields["chatPath"]["defaultValue"] == "/chat/completions"
        assert compatible_fields["timeoutSeconds"]["defaultValue"] == 120
        assert compatible_fields["timeoutSeconds"]["min"] == 1
        assert compatible_fields["timeoutSeconds"]["max"] == 180
        assert compatible_fields["defaultCapabilities"]["defaultValue"] == ["text"]

        status, profile = request_json("GET", f"{base_url}/provider-profile")
        assert status == 200 and profile["ok"] is True
        assert profile["profile"]["activeProviderId"] == "openai"
        assert "apiKey" not in profile["profile"]["profiles"]["openai"]
        assert profile["profile"]["profiles"]["openai"]["apiKeyStatus"]["configured"] is True
        assert not legacy_secret_path.exists(), "legacy plaintext secret store was not removed after migration"
        migrated_store = secret_path.read_text(encoding="utf-8")
        assert "sk-legacy-migration-test" not in migrated_store

        status, saved = request_json("POST", f"{base_url}/providers/openai/profile", {
            "config": {
                "baseUrl": "https://api.openai.com/v1",
                "apiKey": "sk-valid-test",
                "model": "gpt-4.1",
                "organization": "org-kuroii-motion",
            },
            "model": "gpt-4.1",
            "bindCapabilities": ["text", "vision"],
        })
        assert status == 200 and saved["ok"] is True
        public_openai = saved["profile"]["profiles"]["openai"]
        assert public_openai["model"] == "gpt-4.1"
        assert public_openai["apiKeyRef"] == "provider:openai:apiKey"
        assert public_openai["apiKeyStatus"]["configured"] is True
        assert public_openai["organization"] == "org-kuroii-motion"
        assert "apiKey" not in public_openai
        assert saved["profile"]["secretStore"]["backend"] == "windows-dpapi"
        assert saved["profile"]["secretStore"]["encryptedAtRest"] is True
        assert saved["profile"]["capabilityBindings"]["text"]["model"] == "gpt-4.1"
        profile_on_disk = json.loads(profile_path.read_text(encoding="utf-8"))
        assert '"apiKey":' not in json.dumps(profile_on_disk)
        secret_on_disk = json.loads(secret_path.read_text(encoding="utf-8"))
        secret_item = secret_on_disk["secrets"]["provider:openai:apiKey"]
        assert secret_on_disk["backend"] == "windows-dpapi"
        assert "ciphertext" in secret_item
        assert "value" not in secret_item
        assert "sk-valid-test" not in secret_path.read_text(encoding="utf-8")

        status, secret_saved = request_json("POST", f"{base_url}/providers/openai-compatible/secret", {
            "apiKey": "sk-compatible-secret-only",
        })
        assert status == 200 and secret_saved["ok"] is True
        assert secret_saved["apiKeyRef"] == "provider:openai-compatible:apiKey"
        assert secret_saved["apiKeyStatus"]["configured"] is True
        assert "apiKey" not in secret_saved
        assert "sk-compatible-secret-only" not in secret_path.read_text(encoding="utf-8")

        status, profile = request_json("GET", f"{base_url}/provider-profile")
        assert status == 200
        compatible_status = profile["profile"]["profiles"]["openai-compatible"]["apiKeyStatus"]
        assert compatible_status["configured"] is True

        status, saved = request_json("POST", f"{base_url}/providers/openai-compatible/profile", {
            "config": {
                "baseUrl": "https://gateway.example.com/v1",
                "apiKey": "sk-compatible-profile",
                "model": "compatible-chat",
                "modelsPath": "catalog/models",
                "chatPath": "custom/chat",
                "timeoutSeconds": 12,
                "headers": {
                    "X-Organization": "kuroii-motion",
                    "Authorization": "Bearer must-not-persist",
                },
                "defaultCapabilities": ["text", "vision"],
            },
            "model": "compatible-chat",
        })
        assert status == 200 and saved["ok"] is True
        compatible_profile = saved["profile"]["profiles"]["openai-compatible"]
        assert compatible_profile["modelsPath"] == "catalog/models"
        assert compatible_profile["chatPath"] == "custom/chat"
        assert compatible_profile["timeoutSeconds"] == 12
        assert compatible_profile["headers"] == {"X-Organization": "kuroii-motion"}
        assert compatible_profile["defaultCapabilities"] == ["text", "vision"]
        assert "Authorization" not in json.dumps(compatible_profile)
        profile_on_disk = json.loads(profile_path.read_text(encoding="utf-8"))
        compatible_on_disk = next(
            item
            for item in profile_on_disk["profileInstances"].values()
            if item["providerId"] == "openai-compatible"
        )
        assert compatible_on_disk["headers"] == {"X-Organization": "kuroii-motion"}
        assert "must-not-persist" not in profile_path.read_text(encoding="utf-8")
        assert "sk-compatible-profile" not in profile_path.read_text(encoding="utf-8")

        status, invalid_profile = request_json("POST", f"{base_url}/providers/openai-compatible/profile", {
            "config": {
                "baseUrl": "https://gateway.example.com/v1",
                "apiKeyRef": "provider:openai-compatible:apiKey",
                "timeoutSeconds": 240,
            }
        })
        assert status == 400 and invalid_profile["code"] == "INVALID_PROVIDER_PROFILE"

        status, bound = request_json("POST", f"{base_url}/provider-bindings/image", {
            "providerId": "openai",
            "model": "gpt-image-1",
        })
        assert status == 200 and bound["profile"]["capabilityBindings"]["image"]["model"] == "gpt-image-1"

        status, result = request_json("POST", f"{base_url}/providers/openai-compatible/models", {"config": {"baseUrl": "not-a-url", "apiKey": "sk-valid-test"}})
        assert status == 400 and result["code"] == "BASE_URL_UNREACHABLE"
        assert any(item["labelZh"] == "检查 Base URL" for item in result["advice"])

        status, result = request_json("POST", f"{base_url}/providers/deepseek/test", {"config": {}})
        assert status == 400 and result["code"] == "CONFIG_MISSING"
        assert any(item["labelZh"] == "补全配置" for item in result["advice"])

        print("[OK] Provider Hub smoke test passed")
        return 0
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
        profile_path.unlink(missing_ok=True)
        secret_path.unlink(missing_ok=True)
        legacy_secret_path.unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(main())
