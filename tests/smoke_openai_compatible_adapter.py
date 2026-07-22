from __future__ import annotations

import json
import os
import socket
import shutil
import subprocess
import sys
import threading
import time
from base64 import b64decode
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps/local-service/src"))

from openai_compatible_adapter import AdapterError, models_url
from openai_protocol_adapter import (
    chat_completions_url,
    generate_chat_completion,
    generate_image,
    image_export_spec,
    images_generations_url,
    inferred_capabilities,
    list_models as list_protocol_models,
)

TOKEN = "test-openai-compatible-token"
UPSTREAM_KEY = "sk-upstream-valid"
UPSTREAM_REQUESTS: list[dict[str, object]] = []
PROFILE_PATH = ROOT / "apps/local-service/data/provider-profile.json"


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


class MockOpenAICompatibleHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args: object) -> None:
        _ = fmt, args

    def send_json(self, status: int, payload: dict) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self) -> None:
        if self.path == "/timeout/models":
            time.sleep(1.25)
            self.send_json(200, {"data": [{"id": "late-model"}]})
            return
        if self.path == "/invalid-json/models":
            data = b"not-json"
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if self.path == "/server-error/models":
            self.send_json(503, {"error": {"message": "temporarily unavailable"}})
            return
        if self.path == "/rate-limit/models":
            self.send_json(429, {"error": {"message": "rate limited"}})
            return
        if self.path not in {"/v1/models", "/v1/catalog/models", "/openai/v1/models", "/deepseek/models"}:
            self.send_json(404, {"error": {"message": "not found"}})
            return
        UPSTREAM_REQUESTS.append({
            "path": self.path,
            "authorization": self.headers.get("Authorization"),
            "organization": self.headers.get("OpenAI-Organization") or self.headers.get("X-Organization"),
            "injected": self.headers.get("Injected"),
        })
        if self.headers.get("Authorization") != f"Bearer {UPSTREAM_KEY}":
            self.send_json(401, {"error": {"message": "invalid key"}})
            return
        if self.path == "/openai/v1/models":
            self.send_json(200, {
                "object": "list",
                "data": [
                    {"id": "gpt-4.1", "object": "model", "owned_by": "openai"},
                    {"id": "gpt-image-1", "object": "model", "owned_by": "openai"},
                ],
            })
            return
        if self.path == "/deepseek/models":
            self.send_json(200, {
                "object": "list",
                "data": [
                    {"id": "deepseek-chat", "object": "model", "owned_by": "deepseek"},
                    {"id": "deepseek-reasoner", "object": "model", "owned_by": "deepseek"},
                ],
            })
            return
        self.send_json(200, {
            "object": "list",
            "data": [
                {"id": "provider-chat", "object": "model", "owned_by": "mock-provider"},
                {"id": "provider-vision", "object": "model", "owned_by": "mock-provider"},
            ],
        })

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            body = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_json(400, {"error": {"message": "invalid json"}})
            return
        if self.path == "/timeout/images/generations":
            time.sleep(1.25)
            self.send_json(200, {"data": [{"b64_json": "aW1hZ2U="}]})
            return
        if self.path == "/invalid-json/images/generations":
            data = b"not-json"
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if self.path == "/invalid-response/images/generations":
            self.send_json(200, {"data": []})
            return
        if self.path == "/server-error/images/generations":
            self.send_json(503, {"error": {"message": "temporarily unavailable"}})
            return
        if self.path == "/rate-limit/images/generations":
            self.send_json(429, {"error": {"message": "rate limited"}})
            return
        if self.path == "/minimax/v1/image_generation":
            UPSTREAM_REQUESTS.append({
                "path": self.path,
                "authorization": self.headers.get("Authorization"),
                "body": body,
            })
            if self.headers.get("Authorization") != f"Bearer {UPSTREAM_KEY}":
                self.send_json(200, {"base_resp": {"status_code": 1004, "status_msg": "invalid key"}})
                return
            self.send_json(200, {
                "base_resp": {"status_code": 0, "status_msg": "success"},
                "data": {
                    "image_base64": ["iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC"],
                },
                "metadata": {"usage": {"image_count": 1}},
            })
            return
        if self.path == "/minimax/v1/music_generation":
            UPSTREAM_REQUESTS.append({"path": self.path, "authorization": self.headers.get("Authorization"), "body": body})
            if self.headers.get("Authorization") != f"Bearer {UPSTREAM_KEY}":
                self.send_json(200, {"base_resp": {"status_code": 1004, "status_msg": "invalid key"}})
                return
            self.send_json(200, {
                "base_resp": {"status_code": 0, "status_msg": "success"},
                "data": {"audio": "49443304", "status": 2},
                "extra_info": {"music_duration": 1200, "audio_format": "mp3"},
                "trace_id": "music-trace",
            })
            return
        if self.path == "/minimax/v1/t2a_v2":
            UPSTREAM_REQUESTS.append({"path": self.path, "authorization": self.headers.get("Authorization"), "body": body})
            if self.headers.get("Authorization") != f"Bearer {UPSTREAM_KEY}":
                self.send_json(200, {"base_resp": {"status_code": 1004, "status_msg": "invalid key"}})
                return
            self.send_json(200, {
                "base_resp": {"status_code": 0, "status_msg": "success"},
                "data": {"audio": "49443304", "status": 2},
                "extra_info": {"audio_length": 880, "audio_format": "mp3"},
                "trace_id": "voice-trace",
            })
            return
        if self.path in {"/v1/images/generations", "/v1/custom/images"}:
            UPSTREAM_REQUESTS.append({
                "path": self.path,
                "authorization": self.headers.get("Authorization"),
                "organization": self.headers.get("OpenAI-Organization") or self.headers.get("X-Organization"),
                "injected": self.headers.get("Injected"),
                "body": body,
            })
            if self.headers.get("Authorization") != f"Bearer {UPSTREAM_KEY}":
                self.send_json(401, {"error": {"message": "invalid key"}})
                return
            self.send_json(200, {
                "created": 1770000000,
                "data": [{
                    "b64_json": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
                    "revised_prompt": "A compact motion design key visual.",
                }],
                "usage": {"total_tokens": 42},
            })
            return
        if self.path == "/timeout/chat/completions":
            time.sleep(1.25)
            self.send_json(200, {"choices": [{"message": {"content": "late"}}]})
            return
        if self.path == "/invalid-json/chat/completions":
            data = b"not-json"
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if self.path == "/invalid-response/chat/completions":
            self.send_json(200, {"choices": []})
            return
        if self.path == "/server-error/chat/completions":
            self.send_json(503, {"error": {"message": "temporarily unavailable"}})
            return
        if self.path == "/rate-limit/chat/completions":
            self.send_json(429, {"error": {"message": "rate limited"}})
            return
        if self.path not in {
            "/v1/chat/completions",
            "/v1/custom/chat",
            "/openai/v1/chat/completions",
            "/deepseek/chat/completions",
        }:
            self.send_json(404, {"error": {"message": "not found"}})
            return
        UPSTREAM_REQUESTS.append({
            "path": self.path,
            "authorization": self.headers.get("Authorization"),
            "organization": self.headers.get("OpenAI-Organization") or self.headers.get("X-Organization"),
            "injected": self.headers.get("Injected"),
            "body": body,
        })
        if self.headers.get("Authorization") != f"Bearer {UPSTREAM_KEY}":
            self.send_json(401, {"error": {"message": "invalid key"}})
            return
        model = str(body.get("model", ""))
        message = {"role": "assistant", "content": f"Generated by {model}"}
        if model == "deepseek-reasoner":
            message["reasoning_content"] = "Checked the motion design constraints."
        elif model == "content-parts":
            message["content"] = [
                {"type": "output_text", "text": "Generated from content parts."},
                {"type": "text", "text": " The text is preserved."},
            ]
        elif model == "reasoning-alias":
            message["reasoning"] = {"type": "reasoning", "text": "Checked through the compatible alias."}
        elif model == "legacy-choice-text":
            message["content"] = None
        choice = {
            "index": 0,
            "message": message,
            "finish_reason": "stop",
        }
        if model == "legacy-choice-text":
            choice["text"] = "Generated from legacy choice text."
        self.send_json(200, {
            "id": "chatcmpl-kuroii-test",
            "object": "chat.completion",
            "model": model,
            "choices": [choice],
            "usage": {
                "prompt_tokens": 12,
                "completion_tokens": 7,
                "total_tokens": 19,
            },
        })


class QuietThreadingHTTPServer(ThreadingHTTPServer):
    def handle_error(self, request: object, client_address: tuple[str, int]) -> None:
        _ = request, client_address


def wait_for_health(base_url: str) -> None:
    deadline = time.time() + 8
    while time.time() < deadline:
        try:
            with urlopen(f"{base_url}/health", timeout=1) as response:
                if response.status == 200:
                    return
        except Exception:
            pass
        time.sleep(0.1)
    raise RuntimeError("Local Service did not become healthy.")


def provider_payload(
    base_url: str,
    api_key: str = UPSTREAM_KEY,
    model: str = "",
    **config: object,
) -> dict:
    return {
        "config": {
            "baseUrl": base_url,
            "apiKey": api_key,
            **config,
        },
        "model": model,
    }


def main() -> int:
    assert inferred_capabilities("openai-compatible", "gpt-image-2", {"defaultCapabilities": ["text"]}) == ["image"]
    assert inferred_capabilities("openai-compatible", "qwen3-vl-plus", {"defaultCapabilities": ["text"]}) == ["text", "vision"]
    upstream_port = free_port()
    service_port = free_port()
    upstream = QuietThreadingHTTPServer(("127.0.0.1", upstream_port), MockOpenAICompatibleHandler)
    upstream_thread = threading.Thread(target=upstream.serve_forever, daemon=True)
    upstream_thread.start()
    profile_backup = PROFILE_PATH.read_text(encoding="utf-8") if PROFILE_PATH.is_file() else None

    runtime_dir = ROOT / ".runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    secret_path = runtime_dir / f"openai-compatible-{service_port}.dpapi.json"
    legacy_path = runtime_dir / f"openai-compatible-{service_port}.legacy.json"
    image_output_dir = runtime_dir / f"image-output-{service_port}"
    image_history_path = runtime_dir / f"image-history-{service_port}.json"
    audio_output_dir = runtime_dir / f"audio-output-{service_port}"
    audio_history_path = runtime_dir / f"audio-history-{service_port}.json"
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    env["KUROII_PROVIDER_TIMEOUT_SECONDS"] = "0.2"
    env["KUROII_SECRET_STORE_PATH"] = str(secret_path)
    env["KUROII_LEGACY_SECRET_STORE_PATH"] = str(legacy_path)
    env["KUROII_IMAGE_OUTPUT_DIR"] = str(image_output_dir)
    env["KUROII_IMAGE_HISTORY_PATH"] = str(image_history_path)
    env["KUROII_AUDIO_OUTPUT_DIR"] = str(audio_output_dir)
    env["KUROII_AUDIO_HISTORY_PATH"] = str(audio_history_path)
    process = subprocess.Popen(
        [sys.executable, str(ROOT / "apps/local-service/src/server.py"), "--port", str(service_port), "--token", TOKEN],
        cwd=str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
    )
    service_output: list[str] = []

    def drain_service_output() -> None:
        if process.stdout:
            service_output.extend(process.stdout)

    output_thread = threading.Thread(target=drain_service_output, daemon=True)
    output_thread.start()
    service_url = f"http://127.0.0.1:{service_port}"
    upstream_url = f"http://127.0.0.1:{upstream_port}"
    try:
        wait_for_health(service_url)

        status, models = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/models",
            provider_payload(f"{upstream_url}/v1"),
        )
        assert status == 200 and models["ok"] is True
        assert models["source"] == "live" and models["protocol"] == "openai-compatible"
        assert [item["id"] for item in models["models"]] == ["provider-chat", "provider-vision"]
        assert models["models"][0]["capabilities"] == ["text"]

        status, custom_base_url_models = request_json(
            "POST",
            f"{service_url}/providers/custom-base-url/models",
            provider_payload(
                f"{upstream_url}/v1",
                compatibilityMode="openai-compatible",
                modelsPath="/catalog/models",
            ),
        )
        assert status == 200 and custom_base_url_models["ok"] is True
        assert custom_base_url_models["source"] == "live"
        assert [item["id"] for item in custom_base_url_models["models"]] == ["provider-chat", "provider-vision"]
        assert UPSTREAM_REQUESTS[-1]["path"] == "/v1/catalog/models"

        status, openai_models = request_json(
            "POST",
            f"{service_url}/providers/openai/models",
            provider_payload(
                f"{upstream_url}/openai/v1",
                organization="org-kuroii-motion",
            ),
        )
        assert status == 200 and openai_models["ok"] is True
        assert openai_models["source"] == "live" and openai_models["protocol"] == "openai"
        assert openai_models["models"][0]["capabilities"] == ["text", "vision"]
        assert openai_models["models"][1]["capabilities"] == ["image"]
        assert UPSTREAM_REQUESTS[-1]["organization"] == "org-kuroii-motion"

        status, deepseek_models = request_json(
            "POST",
            f"{service_url}/providers/deepseek/models",
            provider_payload(f"{upstream_url}/deepseek"),
        )
        assert status == 200 and deepseek_models["ok"] is True
        assert deepseek_models["source"] == "live" and deepseek_models["protocol"] == "openai-compatible"
        assert deepseek_models["models"][0]["capabilities"] == ["text"]
        assert deepseek_models["models"][1]["capabilities"] == ["text", "reasoning"]

        status, custom_models = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/models",
            provider_payload(
                f"{upstream_url}/v1",
                modelsPath="catalog/models",
                timeoutSeconds=2,
                headers={
                    "X-Organization": "kuroii-motion",
                    "Authorization": "Bearer must-not-win",
                },
                defaultCapabilities=["vision", "text"],
            ),
        )
        assert status == 200 and custom_models["ok"] is True
        assert custom_models["models"][0]["capabilities"] == ["vision", "text"]
        assert UPSTREAM_REQUESTS[-1] == {
            "path": "/v1/catalog/models",
            "authorization": f"Bearer {UPSTREAM_KEY}",
            "organization": "kuroii-motion",
            "injected": None,
        }

        assert models_url(f"{upstream_url}/v1", f"{upstream_url}/v1/catalog/models") == f"{upstream_url}/v1/catalog/models"
        try:
            models_url(f"{upstream_url}/v1", f"http://127.0.0.1:{free_port()}/models")
        except AdapterError as error:
            assert error.code == "CONFIG_INVALID" and error.stage == "config"
        else:
            raise AssertionError("Cross-origin models endpoint was accepted.")

        request_count = len(UPSTREAM_REQUESTS)
        status, result = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/models",
            provider_payload(
                f"{upstream_url}/v1",
                headers={"X-Test": "safe\r\nInjected: true"},
            ),
        )
        assert status == 400 and result["code"] == "CONFIG_INVALID" and result["stage"] == "config"
        assert len(UPSTREAM_REQUESTS) == request_count

        status, result = request_json(
            "POST",
            f"{service_url}/providers/deepseek/test",
            provider_payload(f"{upstream_url}/deepseek", model="deepseek-chat"),
        )
        assert status == 200 and result["ok"] is True and result["source"] == "live"
        assert result["protocol"] == "openai-compatible"
        assert [item["stage"] for item in result["checks"]] == ["config", "network", "auth", "model"]

        status, result = request_json(
            "POST",
            f"{service_url}/providers/deepseek/test",
            provider_payload(f"{upstream_url}/deepseek", model="missing-model"),
        )
        assert status == 404 and result["code"] == "MODEL_NOT_FOUND" and result["stage"] == "model"

        status, result = request_json(
            "POST",
            f"{service_url}/providers/openai/models",
            provider_payload(f"{upstream_url}/openai/v1", api_key="sk-wrong"),
        )
        assert status == 401 and result["code"] == "AUTH_INVALID_KEY" and result["stage"] == "auth"

        status, generated = request_json(
            "POST",
            f"{service_url}/providers/deepseek/generate",
            {
                **provider_payload(f"{upstream_url}/deepseek", model="deepseek-reasoner"),
                "messages": [{"role": "user", "content": "Plan a title animation."}],
                "options": {"temperature": 0.4, "maxTokens": 320},
            },
        )
        assert status == 200 and generated["ok"] is True
        assert generated["providerId"] == "deepseek" and generated["model"] == "deepseek-reasoner"
        assert generated["content"] == "Generated by deepseek-reasoner"
        assert generated["reasoning"] == "Checked the motion design constraints."
        assert generated["usage"] == {"promptTokens": 12, "completionTokens": 7, "totalTokens": 19}
        assert generated["finishReason"] == "stop"
        assert UPSTREAM_REQUESTS[-1]["body"]["max_tokens"] == 320

        status, generated = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/generate",
            {
                **provider_payload(f"{upstream_url}/v1", model="content-parts"),
                "messages": [{"role": "user", "content": "Write a motion design CTA."}],
            },
        )
        assert status == 200 and generated["ok"] is True
        assert generated["content"] == "Generated from content parts. The text is preserved."

        status, generated = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/generate",
            {
                **provider_payload(f"{upstream_url}/v1", model="reasoning-alias"),
                "messages": [{"role": "user", "content": "Check this animation plan."}],
            },
        )
        assert status == 200 and generated["ok"] is True
        assert generated["reasoning"] == "Checked through the compatible alias."

        status, generated = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/generate",
            {
                **provider_payload(f"{upstream_url}/v1", model="legacy-choice-text"),
                "messages": [{"role": "user", "content": "Write a concise title."}],
            },
        )
        assert status == 200 and generated["ok"] is True
        assert generated["content"] == "Generated from legacy choice text."

        status, generated = request_json(
            "POST",
            f"{service_url}/providers/openai/generate",
            {
                **provider_payload(
                    f"{upstream_url}/openai/v1",
                    model="gpt-4.1",
                    organization="org-kuroii-motion",
                ),
                "messages": [{"role": "user", "content": "Write a short CTA."}],
                "options": {"maxTokens": 120},
            },
        )
        assert status == 200 and generated["ok"] is True
        assert UPSTREAM_REQUESTS[-1]["body"]["max_completion_tokens"] == 120
        assert UPSTREAM_REQUESTS[-1]["organization"] == "org-kuroii-motion"

        status, generated = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/generate",
            {
                **provider_payload(
                    f"{upstream_url}/v1",
                    model="compatible-chat",
                    chatPath="/custom/chat",
                    headers={"X-Organization": "kuroii-motion"},
                    timeoutSeconds=2,
                ),
                "messages": [{"role": "user", "content": "Create three copy variants."}],
                "options": {"maxTokens": 180},
            },
        )
        assert status == 200 and generated["ok"] is True
        assert UPSTREAM_REQUESTS[-1]["path"] == "/v1/custom/chat"
        assert UPSTREAM_REQUESTS[-1]["organization"] == "kuroii-motion"
        assert UPSTREAM_REQUESTS[-1]["body"]["max_tokens"] == 180

        status, generated_image = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/image",
            {
                **provider_payload(
                    f"{upstream_url}/v1",
                    model="gpt-image-2",
                    imagesPath="/custom/images",
                    timeoutSeconds=2,
                ),
                "prompt": "A compact motion design key visual.",
                "options": {"size": "1024x1024", "quality": "medium", "background": "transparent"},
            },
        )
        assert status == 200 and generated_image["ok"] is True
        assert generated_image["providerId"] == "openai-compatible" and generated_image["model"] == "gpt-image-2"
        assert generated_image["imageUrl"].startswith("data:image/png;base64,")
        assert generated_image["revisedPrompt"] == "A compact motion design key visual."
        assert generated_image["diagnostics"]["endpoint"] == "/v1/custom/images"
        assert generated_image["diagnostics"]["httpStatus"] == 200
        assert "apiKey" not in json.dumps(generated_image)
        assert UPSTREAM_REQUESTS[-1]["body"] == {
            "model": "gpt-image-2",
            "prompt": "A compact motion design key visual.",
            "n": 1,
            "size": "1024x1024",
            "quality": "medium",
            "background": "transparent",
        }

        status, image_profile = request_json(
            "POST",
            f"{service_url}/providers/openai-compatible/profile",
            {
                "config": {
                    "baseUrl": f"{upstream_url}/v1",
                    "apiKey": UPSTREAM_KEY,
                    "model": "gpt-image-2",
                    "imagesPath": "/images/generations",
                    "defaultCapabilities": ["image"],
                    "models": [{"id": "gpt-image-2", "capabilities": ["image"]}],
                },
                "model": "gpt-image-2",
                "bindCapabilities": ["image"],
            },
        )
        assert status == 200 and image_profile["ok"] is True
        status, generated_image = request_json(
            "POST",
            f"{service_url}/ai/image/generate",
            {"prompt": "A title card on black.", "options": {"size": "1024x1024"}},
        )
        assert status == 200 and generated_image["ok"] is True
        assert generated_image["binding"]["capability"] == "image"
        assert generated_image["binding"]["model"] == "gpt-image-2"
        assert generated_image["diagnostics"]["profileId"]
        artifact = generated_image["artifact"]
        assert artifact["id"] and artifact["fileName"].endswith(".png")
        assert artifact["bytes"] > 0 and artifact["saved"] is True
        assert Path(artifact["path"]).is_file()
        assert "imageUrl" not in artifact

        status, history = request_json("GET", f"{service_url}/ai/image/history?limit=10")
        assert status == 200 and history["ok"] is True and history["count"] == 1
        assert history["items"][0]["id"] == artifact["id"]
        assert "imageUrl" not in history["items"][0]
        assert history["items"][0]["prompt"] == "A title card on black."
        assert history["storage"]["historyCount"] == 1
        assert history["storage"]["savedCount"] == 1
        assert history["storage"]["bytes"] == artifact["bytes"]

        status, history_item = request_json("GET", f"{service_url}/ai/image/history/{artifact['id']}")
        assert status == 200 and history_item["ok"] is True
        assert history_item["item"]["imageUrl"].startswith("data:image/png;base64,")
        assert history_item["item"]["options"]["size"] == "1024x1024"
        assert UPSTREAM_KEY not in image_history_path.read_text(encoding="utf-8")

        status, deleted = request_json("DELETE", f"{service_url}/ai/image/history/{artifact['id']}")
        assert status == 200 and deleted["ok"] is True and deleted["deletedIds"] == [artifact["id"]]
        assert deleted["deletedFiles"] == 1 and deleted["storage"]["historyCount"] == 0
        assert not Path(artifact["path"]).exists()
        status, missing_history_item = request_json("GET", f"{service_url}/ai/image/history/{artifact['id']}")
        assert status == 404 and missing_history_item["code"] == "IMAGE_HISTORY_NOT_FOUND"
        status, cleanup = request_json("DELETE", f"{service_url}/ai/image/history", {"cleanupMissing": True})
        assert status == 200 and cleanup["ok"] is True and cleanup["cleanup"]["removedCount"] == 0

        status, minimax_models = request_json(
            "POST",
            f"{service_url}/providers/minimax/models",
            provider_payload(f"{upstream_url}/minimax", model="image-01"),
        )
        assert status == 200 and minimax_models["source"] == "catalog"
        assert minimax_models["protocol"] == "minimax-native"
        assert {item["id"] for item in minimax_models["models"]} >= {"image-01", "image-01-live", "MiniMax-Hailuo-2.3"}
        status, minimax_test = request_json(
            "POST",
            f"{service_url}/providers/minimax/test",
            provider_payload(f"{upstream_url}/minimax", model="image-01"),
        )
        assert status == 200 and minimax_test["stage"] == "catalog"
        assert minimax_test["checks"][-1]["ok"] is None

        status, minimax_profile = request_json(
            "POST",
            f"{service_url}/providers/minimax/profile",
            {
                "config": {
                    "baseUrl": f"{upstream_url}/minimax",
                    "apiKey": UPSTREAM_KEY,
                    "model": "image-01",
                    "defaultCapabilities": ["image", "music", "voice"],
                    "models": [
                        {"id": "image-01", "capabilities": ["image"]},
                        {"id": "music-3.0", "capabilities": ["music"]},
                        {"id": "speech-2.8-hd", "capabilities": ["voice"]},
                    ],
                },
                "model": "image-01",
                "bindCapabilities": ["image"],
            },
        )
        assert status == 200 and minimax_profile["ok"] is True
        status, minimax_image = request_json(
            "POST",
            f"{service_url}/ai/image/generate",
            {"prompt": "A MiniMax image test.", "options": {"aspectRatio": "16:9", "outputResolution": "1k"}},
        )
        assert status == 200 and minimax_image["ok"] is True
        assert minimax_image["providerId"] == "minimax" and minimax_image["model"] == "image-01"
        assert minimax_image["protocol"] == "minimax" and minimax_image["binding"]["capability"] == "image"
        assert minimax_image["imageUrl"].startswith("data:image/png;base64,")
        assert minimax_image["artifact"]["saved"] is True
        assert UPSTREAM_REQUESTS[-1]["path"] == "/minimax/v1/image_generation"
        assert UPSTREAM_REQUESTS[-1]["body"] == {
            "model": "image-01",
            "prompt": "A MiniMax image test.",
            "aspect_ratio": "16:9",
            "response_format": "url",
            "n": 1,
        }
        status, music_binding = request_json(
            "POST",
            f"{service_url}/provider-bindings/music",
            {"profileId": "minimax", "providerId": "minimax", "model": "music-3.0", "operation": "set-default"},
        )
        assert status == 200 and music_binding["ok"] is True
        status, generated_music = request_json(
            "POST",
            f"{service_url}/ai/music/generate",
            {"title": "MiniMax music test", "prompt": "Gentle game opening music", "options": {"isInstrumental": True, "format": "mp3"}},
        )
        assert status == 200 and generated_music["ok"] is True
        assert generated_music["artifact"]["kind"] == "music" and generated_music["artifact"]["saved"] is True
        assert generated_music["diagnostics"]["endpoint"] == "/minimax/v1/music_generation"
        assert "audioBytes" not in generated_music
        assert UPSTREAM_REQUESTS[-1]["body"]["is_instrumental"] is True
        status, generated_music_item = request_json("GET", f"{service_url}/ai/audio/history/{generated_music['artifact']['id']}")
        assert status == 200 and generated_music_item["item"]["audioUrl"].startswith("data:audio/mpeg;base64,")

        status, voice_binding = request_json(
            "POST",
            f"{service_url}/provider-bindings/voice",
            {"profileId": "minimax", "providerId": "minimax", "model": "speech-2.8-hd", "operation": "set-default"},
        )
        assert status == 200 and voice_binding["ok"] is True
        status, generated_voice = request_json(
            "POST",
            f"{service_url}/ai/voice/generate",
            {"title": "MiniMax voice test", "text": "Welcome to the adventure.", "segments": ["Welcome to the adventure."], "options": {"voiceId": "male-qn-qingse", "format": "mp3", "language": "en-US", "languageBoost": "English"}},
        )
        assert status == 200 and generated_voice["ok"] is True
        assert generated_voice["artifact"]["kind"] == "voice" and generated_voice["artifact"]["saved"] is True
        assert generated_voice["diagnostics"]["endpoint"] == "/minimax/v1/t2a_v2"
        assert UPSTREAM_REQUESTS[-1]["body"]["voice_setting"]["voice_id"] == "male-qn-qingse"
        status, generated_voice_item = request_json("GET", f"{service_url}/ai/audio/history/{generated_voice['artifact']['id']}")
        assert status == 200 and generated_voice_item["item"]["audioUrl"].startswith("data:audio/mpeg;base64,")
        status, minimax_cleanup = request_json("DELETE", f"{service_url}/ai/image/history", {"ids": [minimax_image["artifact"]["id"]]})
        assert status == 200 and minimax_cleanup["ok"] is True

        assert images_generations_url(f"{upstream_url}/v1", "/images/generations") == f"{upstream_url}/v1/images/generations"
        direct_image = generate_image(
            "openai-compatible",
            {"baseUrl": f"{upstream_url}/v1", "apiKey": UPSTREAM_KEY},
            "gpt-image-2",
            "A compact motion design key visual.",
            {"size": "1024x1024"},
        )
        assert direct_image["imageUrl"].startswith("data:image/png;base64,")
        assert direct_image["export"] == {
            "aspectRatio": "1:1",
            "outputResolution": "1k",
            "width": 1024,
            "height": 1024,
            "sourceSize": "1024x1024",
            "mode": "local-upscale",
            "postProcessed": True,
            "sourceWidth": 1,
            "sourceHeight": 1,
        }
        assert image_export_spec({"aspectRatio": "16:9", "outputResolution": "4k"}) == {
            "aspectRatio": "16:9",
            "outputResolution": "4k",
            "width": 4096,
            "height": 2304,
            "sourceSize": "1536x1024",
        }
        exported_image = generate_image(
            "openai-compatible",
            {"baseUrl": f"{upstream_url}/v1", "apiKey": UPSTREAM_KEY},
            "gpt-image-2",
            "A cinematic game key visual.",
            {"aspectRatio": "16:9", "outputResolution": "2k"},
        )
        assert exported_image["export"]["mode"] == "local-upscale"
        assert exported_image["export"]["width"] == 2048 and exported_image["export"]["height"] == 1152
        assert UPSTREAM_REQUESTS[-1]["body"]["size"] == "1536x1024"
        encoded_image = exported_image["imageUrl"].split(",", 1)[1]
        with Image.open(BytesIO(b64decode(encoded_image))) as delivered_image:
            assert delivered_image.size == (2048, 1152)

        status, saved = request_json(
            "POST",
            f"{service_url}/providers/deepseek/profile",
            {
                "config": {
                    "baseUrl": f"{upstream_url}/deepseek",
                    "apiKey": UPSTREAM_KEY,
                    "model": "deepseek-chat",
                },
                "model": "deepseek-chat",
                "bindCapabilities": ["text"],
            },
        )
        assert status == 200 and saved["ok"] is True
        status, generated = request_json(
            "POST",
            f"{service_url}/ai/text/generate",
            {
                "messages": [{"role": "user", "content": "Summarize the current project."}],
                "options": {"temperature": 0.2, "maxTokens": 220},
            },
        )
        assert status == 200 and generated["ok"] is True
        assert generated["providerId"] == "deepseek" and generated["model"] == "deepseek-chat"
        assert generated["binding"]["capability"] == "text"
        assert generated["binding"]["source"] == "provider-profile"

        assert chat_completions_url(f"{upstream_url}/v1", f"{upstream_url}/v1/custom/chat") == f"{upstream_url}/v1/custom/chat"
        try:
            chat_completions_url(f"{upstream_url}/v1", f"http://127.0.0.1:{free_port()}/chat/completions")
        except AdapterError as error:
            assert error.code == "CONFIG_INVALID" and error.stage == "config"
        else:
            raise AssertionError("Cross-origin chat endpoint was accepted.")

        direct_result = generate_chat_completion(
            "openai-compatible",
            {
                "baseUrl": f"{upstream_url}/v1",
                "apiKey": UPSTREAM_KEY,
                "chatPath": "/chat/completions",
            },
            "provider-chat",
            [{"role": "user", "content": "Hello"}],
            {"maxTokens": 64},
        )
        assert direct_result["content"] == "Generated by provider-chat"

        scenarios = [
            ("missing", 404, "BASE_URL_UNREACHABLE"),
            ("rate-limit", 429, "RATE_LIMITED"),
            ("server-error", 502, "PROVIDER_UNAVAILABLE"),
            ("invalid-json", 502, "PROVIDER_RESPONSE_INVALID"),
            ("timeout", 504, "NETWORK_TIMEOUT"),
        ]
        for path, expected_status, expected_code in scenarios:
            adapter_config = {
                "baseUrl": f"{upstream_url}/{path}",
                "apiKey": UPSTREAM_KEY,
            }
            if path == "timeout":
                adapter_config["timeoutSeconds"] = 1
            try:
                list_protocol_models("openai-compatible", adapter_config)
            except AdapterError as error:
                assert error.status == expected_status and error.code == expected_code, (path, error)
            else:
                raise AssertionError(f"Expected adapter error for scenario: {path}")

        generation_scenarios = [
            ("missing", 404, "BASE_URL_UNREACHABLE"),
            ("rate-limit", 429, "RATE_LIMITED"),
            ("server-error", 502, "PROVIDER_UNAVAILABLE"),
            ("invalid-json", 502, "PROVIDER_RESPONSE_INVALID"),
            ("invalid-response", 502, "PROVIDER_RESPONSE_INVALID"),
            ("timeout", 504, "NETWORK_TIMEOUT"),
        ]
        for path, expected_status, expected_code in generation_scenarios:
            adapter_config = {
                "baseUrl": f"{upstream_url}/{path}",
                "apiKey": UPSTREAM_KEY,
            }
            if path == "timeout":
                adapter_config["timeoutSeconds"] = 1
            try:
                generate_chat_completion(
                    "openai-compatible",
                    adapter_config,
                    "provider-chat",
                    [{"role": "user", "content": "Hello"}],
                    {},
                )
            except AdapterError as error:
                assert error.status == expected_status and error.code == expected_code, (path, error)
            else:
                raise AssertionError(f"Expected generation adapter error for scenario: {path}")

        image_scenarios = [
            ("missing", 404, "BASE_URL_UNREACHABLE"),
            ("rate-limit", 429, "RATE_LIMITED"),
            ("server-error", 502, "PROVIDER_UNAVAILABLE"),
            ("invalid-json", 502, "PROVIDER_RESPONSE_INVALID"),
            ("invalid-response", 502, "PROVIDER_RESPONSE_INVALID"),
            ("timeout", 504, "NETWORK_TIMEOUT"),
        ]
        for path, expected_status, expected_code in image_scenarios:
            adapter_config = {"baseUrl": f"{upstream_url}/{path}", "apiKey": UPSTREAM_KEY}
            if path == "timeout":
                adapter_config["timeoutSeconds"] = 1
            try:
                generate_image("openai-compatible", adapter_config, "gpt-image-2", "Test image", {})
            except AdapterError as error:
                assert error.status == expected_status and error.code == expected_code, (path, error)
            else:
                raise AssertionError(f"Expected image adapter error for scenario: {path}")

        print("[OK] OpenAI protocol provider adapters smoke test passed")
        return 0
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
        upstream.shutdown()
        upstream.server_close()
        upstream_thread.join(timeout=2)
        if profile_backup is None:
            PROFILE_PATH.unlink(missing_ok=True)
        else:
            PROFILE_PATH.parent.mkdir(parents=True, exist_ok=True)
            PROFILE_PATH.write_text(profile_backup, encoding="utf-8")
        secret_path.unlink(missing_ok=True)
        legacy_path.unlink(missing_ok=True)
        image_history_path.unlink(missing_ok=True)
        shutil.rmtree(image_output_dir, ignore_errors=True)
        output_thread.join(timeout=2)
        output = "".join(service_output)
        assert UPSTREAM_KEY not in output, "Local Service logs leaked the upstream API key"


if __name__ == "__main__":
    raise SystemExit(main())
