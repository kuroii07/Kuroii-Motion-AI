from __future__ import annotations

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from time import perf_counter
from typing import Any
from urllib.parse import parse_qs, urlparse

from action_runtime import execute_trusted_read_only_action, host_context_payload, trusted_actions
from audio_history import audio_history_storage_summary, get_audio_history_item, list_audio_history, save_audio_plan
from command_history import get_command_record, list_command_history, record_command
from config import ServiceConfig, load_config
from data_store import capability_detail, capability_exists, provider_manifests
from envelopes import now_iso, result_envelope, validate_command
from host_runtime import (
    capabilities_for_host,
    command_host_metadata,
    evaluate_command_target,
    get_host,
    get_target_lock,
    heartbeat_host,
    list_hosts,
    register_host,
    update_host_status,
    update_target_lock,
)
from image_history import (
    cleanup_missing_image_history_files,
    delete_image_history_items,
    get_image_history_item,
    image_history_storage_summary,
    list_image_history,
    save_generated_image,
)
from provider_profiles import (
    create_named_provider_profile,
    delete_named_provider_profile,
    named_provider_runtime_payload,
    public_profile,
    read_provider_profile,
    resolve_capability_binding,
    save_capability_binding,
    save_named_provider_api_key,
    save_provider_api_key,
    save_provider_profile,
    select_named_provider_profile,
    store_named_provider_models,
    update_named_provider_profile,
    video_generation_readiness,
)
from provider_runtime import (
    generate_image,
    generate_text,
    poll_video,
    provider_config_form,
    provider_error_guidance,
    provider_exists,
    refresh_models,
    test_connection,
    submit_video,
)
from video_tasks import create_video_task, get_video_task, list_video_tasks, update_video_task
from redaction import redact_payload

STARTED_AT = perf_counter()


class KuroiiLocalServiceHandler(BaseHTTPRequestHandler):
    server_version = "KuroiiLocalService/0.3.4"

    @property
    def config(self) -> ServiceConfig:
        return self.server.config  # type: ignore[attr-defined]

    def log_message(self, fmt: str, *args: Any) -> None:
        message = fmt % args
        print(json.dumps({"ts": now_iso(), "level": "info", "message": message}, ensure_ascii=False), flush=True)

    def _send_cors_headers(self) -> None:
        origin = self.headers.get("Origin")
        parsed = urlparse(origin) if origin else None
        if origin == "null" or not origin:
            allowed_origin = "*"
        elif parsed and parsed.hostname in {"127.0.0.1", "localhost"}:
            allowed_origin = origin
        else:
            allowed_origin = "null"
        self.send_header("Access-Control-Allow-Origin", allowed_origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Kuroii-Session, Authorization")
        self.send_header("Access-Control-Max-Age", "600")

    def _send_json(self, status: int, payload: dict[str, Any]) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(data)

    def _send_command_result(self, status: int, command: dict[str, Any] | None, payload: dict[str, Any]) -> None:
        record_command(command, payload, status)
        self._send_json(status, payload)

    def _error(self, status: int, code: str, message: str, advice: list[str] | None = None) -> None:
        self._send_json(status, {"ok": False, "code": code, "message": message, "advice": advice or [], "ts": now_iso()})

    def _origin_allowed(self) -> bool:
        origin = self.headers.get("Origin")
        if not origin:
            return True
        parsed = urlparse(origin)
        return parsed.hostname in {"127.0.0.1", "localhost", None}

    def _authorized(self) -> bool:
        token = self.headers.get("X-Kuroii-Session")
        auth = self.headers.get("Authorization", "")
        return token == self.config.session_token or auth == f"Bearer {self.config.session_token}"

    def _require_auth(self) -> bool:
        if not self._origin_allowed():
            self._error(403, "ORIGIN_FORBIDDEN", "Only localhost origins are allowed.", ["检查调用来源是否为 localhost。"])
            return False
        if not self._authorized():
            self._error(401, "SESSION_REQUIRED", "Missing or invalid Kuroii session token.", ["在请求头加入 X-Kuroii-Session。"])
            return False
        return True

    def _read_json_body(self) -> dict[str, Any] | None:
        length_text = self.headers.get("Content-Length", "0")
        try:
            length = int(length_text)
        except ValueError:
            self._error(400, "INVALID_CONTENT_LENGTH", "Content-Length must be an integer.")
            return None
        if length > self.config.payload_limit_bytes:
            self._error(413, "PAYLOAD_TOO_LARGE", "Payload exceeds the 1 MB limit.", ["减少参数或改用文件引用。"])
            return None
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError as exc:
            self._error(400, "INVALID_JSON", f"Invalid JSON body: {exc.msg}")
            return None
        if not isinstance(payload, dict):
            self._error(400, "INVALID_BODY", "JSON body must be an object.")
            return None
        if self.config.redact_logs:
            print(json.dumps({"ts": now_iso(), "level": "debug", "body": redact_payload(payload)}, ensure_ascii=False), flush=True)
        return payload

    def _provider_route(self, path: str) -> tuple[str, str] | None:
        parts = [part for part in path.split("/") if part]
        if len(parts) == 3 and parts[0] == "providers" and parts[2] in {"config", "models", "test", "profile", "secret", "generate", "image"}:
            return parts[1], parts[2]
        return None

    def _provider_binding_route(self, path: str) -> str | None:
        parts = [part for part in path.split("/") if part]
        if len(parts) == 2 and parts[0] == "provider-bindings":
            return parts[1]
        return None

    def _named_provider_route(self, path: str) -> tuple[str, str] | None:
        parts = [part for part in path.split("/") if part]
        if len(parts) == 3 and parts[0] == "provider-profiles":
            return parts[1], parts[2]
        return None

    def _command_route(self, path: str) -> str | None:
        parts = [part for part in path.split("/") if part]
        if len(parts) == 2 and parts[0] == "commands":
            return parts[1]
        return None

    def _host_route(self, path: str) -> tuple[str, str] | None:
        parts = [part for part in path.split("/") if part]
        if len(parts) == 2 and parts[0] == "hosts":
            return parts[1], "detail"
        if len(parts) == 3 and parts[0] == "hosts" and parts[2] in {"register", "heartbeat", "status", "capabilities", "context"}:
            return parts[1], parts[2]
        return None

    def _query(self) -> dict[str, str]:
        parsed = parse_qs(urlparse(self.path).query, keep_blank_values=False)
        return {key: values[-1] for key, values in parsed.items() if values}

    def do_OPTIONS(self) -> None:
        if not self._origin_allowed():
            self._error(403, "ORIGIN_FORBIDDEN", "Only localhost origins are allowed.", ["检查调用来源是否为 localhost。"])
            return
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/health":
            self._send_json(200, {
                "ok": True,
                "serviceId": self.config.service_id,
                "version": self.config.version,
                "mode": self.config.mode,
                "uptimeMs": int((perf_counter() - STARTED_AT) * 1000),
                "requiresSessionToken": True,
                "routes": [
                    "/health", "/providers", "/provider-errors", "/providers/{providerId}/config",
                    "/provider-profile", "/provider-profiles", "/provider-profiles/{profileId}/profile",
                    "/provider-profiles/{profileId}",
                    "/provider-profiles/{profileId}/select", "/provider-profiles/{profileId}/secret",
                    "/provider-profiles/{profileId}/models", "/provider-profiles/{profileId}/test",
                    "/providers/{providerId}/profile",
                    "/providers/{providerId}/secret",
                    "/providers/{providerId}/models", "/providers/{providerId}/test",
                    "/providers/{providerId}/generate", "/providers/{providerId}/image",
                    "/ai/text/generate", "/ai/image/generate", "/ai/image/history", "/ai/image/history/{imageId}",
                    "/ai/audio/drafts", "/ai/audio/history", "/ai/audio/history/{audioId}",
                    "/ai/video/generate", "/ai/video/tasks", "/ai/video/tasks/{taskId}",
                    "/provider-bindings/{capability}", "/hosts",
                    "/hosts/{host}", "/hosts/{host}/register", "/hosts/{host}/heartbeat",
                    "/hosts/{host}/status", "/hosts/{host}/capabilities", "/hosts/{host}/context",
                    "/host-target", "/actions/trusted", "/commands", "/commands/{commandId}",
                ],
                "ts": now_iso(),
            })
            return
        if (path in {"/providers", "/provider-profile", "/hosts", "/provider-errors", "/host-target", "/actions/trusted", "/commands", "/ai/image/history", "/ai/audio/history", "/ai/video/readiness", "/ai/video/tasks"} or path.startswith("/ai/image/history/") or path.startswith("/ai/audio/history/") or path.startswith("/ai/video/tasks/")) and not self._require_auth():
            return
        if path == "/providers":
            providers = provider_manifests()
            self._send_json(200, {"ok": True, "providers": providers, "count": len(providers)})
            return
        if path == "/provider-errors":
            self._send_json(200, {"ok": True, "guidance": provider_error_guidance()})
            return
        if path == "/provider-profile":
            self._send_json(200, {"ok": True, "profile": public_profile(read_provider_profile())})
            return
        if path == "/ai/image/history":
            try:
                limit = int(self._query().get("limit", "24"))
            except ValueError:
                limit = 24
            items = list_image_history(limit)
            self._send_json(200, {"ok": True, "items": items, "count": len(items), "storage": image_history_storage_summary()})
            return
        if path.startswith("/ai/image/history/"):
            artifact_id = path.rsplit("/", 1)[-1]
            item = get_image_history_item(artifact_id)
            if not item:
                self._error(404, "IMAGE_HISTORY_NOT_FOUND", f"Image history item not found: {artifact_id}")
                return
            self._send_json(200, {"ok": True, "item": item})
            return
        if path == "/ai/audio/history":
            try:
                limit = int(self._query().get("limit", "24"))
            except ValueError:
                limit = 24
            items = list_audio_history(limit)
            self._send_json(200, {"ok": True, "items": items, "count": len(items), "storage": audio_history_storage_summary()})
            return
        if path.startswith("/ai/audio/history/"):
            artifact_id = path.rsplit("/", 1)[-1]
            item = get_audio_history_item(artifact_id)
            if not item:
                self._error(404, "AUDIO_HISTORY_NOT_FOUND", f"Audio history item not found: {artifact_id}")
                return
            self._send_json(200, {"ok": True, "item": item})
            return
        if path == "/ai/video/tasks":
            try:
                limit = int(self._query().get("limit", "24"))
            except ValueError:
                limit = 24
            items = list_video_tasks(limit)
            self._send_json(200, {"ok": True, "items": items, "count": len(items)})
            return
        if path == "/ai/video/readiness":
            self._send_json(200, video_generation_readiness())
            return
        if path.startswith("/ai/video/tasks/"):
            task_id = path.rsplit("/", 1)[-1]
            task = get_video_task(task_id)
            if not task:
                self._error(404, "VIDEO_TASK_NOT_FOUND", f"Video task not found: {task_id}")
                return
            if task.get("status") in {"queued", "processing"} and task.get("providerTaskId"):
                provider_id = str(task.get("providerId") or "").strip()
                binding = task.get("binding") if isinstance(task.get("binding"), dict) else {}
                _, provider_profile = resolve_capability_binding("video")
                if provider_id and isinstance(provider_profile, dict) and str(binding.get("profileId") or "") == str(provider_profile.get("profileId") or ""):
                    status, body = poll_video(provider_id, {"config": provider_profile, "providerTaskId": task["providerTaskId"]})
                    if status == 200:
                        task = update_video_task(task_id, {
                            "providerTaskId": body.get("providerTaskId") or task["providerTaskId"],
                            "status": body.get("status") or task["status"],
                            "videoUrl": body.get("videoUrl") or task.get("videoUrl", ""),
                            "diagnostics": body.get("diagnostics") or task.get("diagnostics", {}),
                            "error": None,
                        }) or task
                    else:
                        task = update_video_task(task_id, {"status": "failed", "error": {"code": body.get("code", "VIDEO_POLL_FAILED"), "message": body.get("message", "Video status polling failed.")}}) or task
            self._send_json(200, {"ok": True, "task": task})
            return
        if path == "/hosts":
            hosts = list_hosts()
            self._send_json(200, {"ok": True, "hosts": hosts, "count": len(hosts)})
            return
        if path == "/host-target":
            self._send_json(200, {"ok": True, "target": get_target_lock()})
            return
        if path == "/actions/trusted":
            query = self._query()
            actions = trusted_actions(query.get("host"))
            self._send_json(200, {"ok": True, "actions": actions, "count": len(actions)})
            return
        if path == "/commands":
            query = self._query()
            ok_value = query.get("ok")
            ok_filter = None if ok_value is None else ok_value.lower() == "true"
            try:
                limit = int(query.get("limit", "50"))
            except ValueError:
                limit = 50
            history = list_command_history(limit=limit, host=query.get("host"), action=query.get("action"), ok=ok_filter)
            self._send_json(200, {"ok": True, "commands": history, "count": len(history)})
            return
        command_id = self._command_route(path)
        if command_id:
            if not self._require_auth():
                return
            record = get_command_record(command_id)
            if not record:
                self._error(404, "COMMAND_NOT_FOUND", f"Command record not found: {command_id}")
                return
            self._send_json(200, {"ok": True, "command": record})
            return
        provider_route = self._provider_route(path)
        if provider_route:
            if not self._require_auth():
                return
            provider_id, action = provider_route
            if action != "config":
                self._error(405, "METHOD_NOT_ALLOWED", f"Use POST for provider {action}.")
                return
            if not provider_exists(provider_id):
                self._error(404, "PROVIDER_NOT_FOUND", f"Provider not found: {provider_id}")
                return
            self._send_json(200, {"ok": True, "form": provider_config_form(provider_id)})
            return
        host_route = self._host_route(path)
        if host_route:
            if not self._require_auth():
                return
            host, action = host_route
            if action == "detail":
                item = get_host(host)
                if not item:
                    self._error(404, "HOST_NOT_REGISTERED", f"Host not found: {host}")
                    return
                self._send_json(200, {"ok": True, "host": item})
                return
            if action == "capabilities":
                self._send_json(200, {"ok": True, "host": host, "capabilities": capabilities_for_host(host)})
                return
            if action == "context":
                context = host_context_payload(host)
                if not context:
                    self._error(404, "HOST_NOT_REGISTERED", f"Host not found: {host}")
                    return
                self._send_json(200, {"ok": True, "context": context})
                return
            self._error(405, "METHOD_NOT_ALLOWED", f"Use POST for host {action}.")
            return
        self._error(404, "NOT_FOUND", f"Route not found: {path}")

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path == "/provider-profiles":
            if not self._require_auth():
                return
            payload = self._read_json_body()
            if payload is None:
                return
            status, body = create_named_provider_profile(payload)
            self._send_json(status, body)
            return
        named_provider_route = self._named_provider_route(path)
        if named_provider_route:
            if not self._require_auth():
                return
            profile_id, action = named_provider_route
            payload = self._read_json_body()
            if payload is None:
                return
            if action == "profile":
                status, body = update_named_provider_profile(profile_id, payload)
                self._send_json(status, body)
                return
            if action == "select":
                status, body = select_named_provider_profile(profile_id)
                self._send_json(status, body)
                return
            if action == "secret":
                status, body = save_named_provider_api_key(profile_id, payload)
                self._send_json(status, body)
                return
            status, provider_id, runtime_payload = named_provider_runtime_payload(profile_id, payload)
            if status != 200:
                self._send_json(status, runtime_payload)
                return
            if action == "models":
                status, body = refresh_models(provider_id, runtime_payload)
                if status == 200 and isinstance(body.get("models"), list):
                    store_named_provider_models(profile_id, body["models"])
                body["profileId"] = profile_id
                self._send_json(status, body)
                return
            if action == "test":
                status, body = test_connection(provider_id, runtime_payload)
                body["profileId"] = profile_id
                self._send_json(status, body)
                return
            if action == "generate":
                status, body = generate_text(provider_id, runtime_payload)
                body["profileId"] = profile_id
                self._send_json(status, body)
                return
            if action == "image":
                status, body = generate_image(provider_id, runtime_payload)
                body["profileId"] = profile_id
                self._send_json(status, body)
                return
            self._error(405, "METHOD_NOT_ALLOWED", f"Unsupported provider profile action: {action}")
            return
        provider_route = self._provider_route(path)
        if provider_route:
            if not self._require_auth():
                return
            provider_id, action = provider_route
            payload = self._read_json_body()
            if payload is None:
                return
            if not provider_exists(provider_id):
                self._error(404, "PROVIDER_NOT_FOUND", f"Provider not found: {provider_id}")
                return
            if action == "models":
                status, body = refresh_models(provider_id, payload)
                self._send_json(status, body)
                return
            if action == "test":
                status, body = test_connection(provider_id, payload)
                self._send_json(status, body)
                return
            if action == "profile":
                status, body = save_provider_profile(provider_id, payload)
                self._send_json(status, body)
                return
            if action == "secret":
                status, body = save_provider_api_key(provider_id, payload)
                self._send_json(status, body)
                return
            if action == "generate":
                status, body = generate_text(provider_id, payload)
                self._send_json(status, body)
                return
            if action == "image":
                status, body = generate_image(provider_id, payload)
                self._send_json(status, body)
                return
            self._error(405, "METHOD_NOT_ALLOWED", f"Unsupported provider action: {action}")
            return
        if path == "/ai/text/generate":
            if not self._require_auth():
                return
            payload = self._read_json_body()
            if payload is None:
                return
            binding, provider_profile = resolve_capability_binding("text")
            if not isinstance(binding, dict):
                self._error(409, "PROVIDER_BINDING_MISSING", "No text capability binding is configured.", ["在 Provider Hub 绑定一个文本模型。"])
                return
            provider_id = str(binding.get("providerId", "")).strip()
            model = str(binding.get("model", "")).strip()
            if not provider_id or not model or not isinstance(provider_profile, dict):
                self._error(409, "PROVIDER_PROFILE_NOT_CONFIGURED", "The bound text provider is not configured.", ["在 Provider Hub 保存平台配置后重试。"])
                return
            status, body = generate_text(provider_id, {
                "config": provider_profile,
                "model": model,
                "messages": payload.get("messages"),
                "options": payload.get("options"),
            })
            if status == 200:
                body["binding"] = {
                    "capability": "text",
                    "profileId": binding.get("profileId"),
                    "providerId": provider_id,
                    "model": model,
                    "source": "provider-profile",
                }
            self._send_json(status, body)
            return
        if path == "/ai/audio/drafts":
            if not self._require_auth():
                return
            payload = self._read_json_body()
            if payload is None:
                return
            try:
                item = save_audio_plan(payload)
            except ValueError as error:
                self._error(400, "AUDIO_PLAN_INVALID", str(error))
                return
            self._send_json(201, {"ok": True, "item": item, "storage": audio_history_storage_summary()})
            return
        if path == "/ai/image/generate":
            if not self._require_auth():
                return
            payload = self._read_json_body()
            if payload is None:
                return
            binding, provider_profile = resolve_capability_binding("image")
            if not isinstance(binding, dict):
                self._error(409, "PROVIDER_BINDING_MISSING", "No image capability binding is configured.", ["在 Provider Hub 绑定一个图片模型。"])
                return
            provider_id = str(binding.get("providerId", "")).strip()
            model = str(binding.get("model", "")).strip()
            if not provider_id or not model or not isinstance(provider_profile, dict):
                self._error(409, "PROVIDER_PROFILE_NOT_CONFIGURED", "The bound image provider is not configured.", ["在 Provider Hub 保存图片平台配置后重试。"])
                return
            status, body = generate_image(provider_id, {
                "config": provider_profile,
                "model": model,
                "prompt": payload.get("prompt"),
                "options": payload.get("options"),
            })
            if status == 200:
                body["binding"] = {
                    "capability": "image",
                    "profileId": binding.get("profileId"),
                    "providerId": provider_id,
                    "model": model,
                    "source": "provider-profile",
                }
                body["diagnostics"]["profileId"] = binding.get("profileId")
                body["artifact"] = save_generated_image(body["imageUrl"], {
                    "prompt": payload.get("prompt"),
                    "options": payload.get("options"),
                    "binding": body["binding"],
                    "diagnostics": body["diagnostics"],
                    "providerId": provider_id,
                    "model": model,
                    "export": body.get("export"),
                    "revisedPrompt": body.get("revisedPrompt"),
                    "generatedAt": body.get("generatedAt"),
                })
            self._send_json(status, body)
            return
        if path == "/ai/video/generate":
            if not self._require_auth():
                return
            payload = self._read_json_body()
            if payload is None:
                return
            readiness = video_generation_readiness()
            if not readiness.get("ready"):
                self._error(409, str(readiness.get("code") or "VIDEO_NOT_READY"), str(readiness.get("message") or "Video generation is not ready."), readiness.get("advice") if isinstance(readiness.get("advice"), list) else [])
                return
            binding, provider_profile = resolve_capability_binding("video")
            provider_id = str(binding.get("providerId", "")).strip()
            model = str(binding.get("model", "")).strip()
            status, body = submit_video(provider_id, {"config": provider_profile, "model": model, "prompt": payload.get("prompt"), "options": payload.get("options")})
            if status < 300:
                binding_payload = {"capability": "video", "profileId": binding.get("profileId"), "providerId": provider_id, "model": model, "source": "provider-profile"}
                task = create_video_task({
                    "providerTaskId": body.get("providerTaskId"), "status": body.get("status"), "videoUrl": body.get("videoUrl"),
                    "prompt": payload.get("prompt"), "options": payload.get("options"), "binding": binding_payload,
                    "providerId": provider_id, "model": model, "diagnostics": body.get("diagnostics"), "createdAt": body.get("generatedAt"),
                })
                body["binding"] = binding_payload
                body["task"] = task
            self._send_json(status, body)
            return
        binding_capability = self._provider_binding_route(path)
        if binding_capability:
            if not self._require_auth():
                return
            payload = self._read_json_body()
            if payload is None:
                return
            status, body = save_capability_binding(binding_capability, payload)
            self._send_json(status, body)
            return
        host_route = self._host_route(path)
        if host_route:
            if not self._require_auth():
                return
            host, action = host_route
            payload = self._read_json_body()
            if payload is None:
                return
            try:
                if action == "register":
                    self._send_json(200, {"ok": True, "host": register_host(host, payload), "target": get_target_lock()})
                    return
                if action == "heartbeat":
                    self._send_json(200, {"ok": True, "host": heartbeat_host(host, payload), "target": get_target_lock()})
                    return
                if action == "status":
                    status = payload.get("status")
                    self._send_json(200, {"ok": True, "host": update_host_status(host, status, payload.get("message")), "target": get_target_lock()})
                    return
            except KeyError:
                self._error(404, "HOST_NOT_REGISTERED", f"Host not found: {host}")
                return
            except ValueError as exc:
                self._error(400, "HOST_INVALID", str(exc))
                return
            self._error(405, "METHOD_NOT_ALLOWED", f"Unsupported host action: {action}")
            return
        if path == "/host-target":
            if not self._require_auth():
                return
            payload = self._read_json_body()
            if payload is None:
                return
            try:
                self._send_json(200, {"ok": True, "target": update_target_lock(payload)})
            except KeyError as exc:
                self._error(404, "HOST_NOT_REGISTERED", f"Host not found: {exc}")
            return
        if path != "/commands":
            self._error(404, "NOT_FOUND", f"Route not found: {path}")
            return
        if not self._require_auth():
            return
        start = perf_counter()
        command = self._read_json_body()
        if command is None:
            return

        command_id = str(command.get("commandId", "unknown"))
        errors = validate_command(command)
        if errors:
            self._send_command_result(400, command, result_envelope(command_id, False, "COMMAND_INVALID", "Command envelope validation failed.", {"errors": errors}, start=start))
            return
        host = command["host"]
        target_ok, target_code, target_message, target_warnings = evaluate_command_target(command)
        if not target_ok:
            self._send_command_result(409, command, result_envelope(command_id, False, target_code, target_message, {"host": host, **command_host_metadata(host)}, target_warnings, start=start))
            return
        action = command["action"]
        if not capability_exists(host, action):
            self._send_command_result(404, command, result_envelope(command_id, False, "CAPABILITY_NOT_FOUND", "No matching capability is registered for this host.", {"host": host, "action": action, **command_host_metadata(host)}, ["刷新 Capability Registry 或检查目标宿主。"], start=start))
            return
        capability = capability_detail(host, action) or {}
        registered_risk = int(capability.get("riskLevel", command["riskLevel"]))
        warnings = []
        if command["riskLevel"] != registered_risk:
            warnings.append("Command riskLevel differs from Capability Registry; registry riskLevel was used.")
        if registered_risk >= 1 and command["requiresConfirmation"]:
            update_host_status(host, "WaitingForConfirmation", "Command is waiting for user confirmation.")
            self._send_command_result(202, command, result_envelope(command_id, True, "WAITING_FOR_CONFIRMATION", "Command validated and is waiting for confirmation.", {
                "host": host,
                "action": action,
                "capability": capability,
                "executed": False,
                **command_host_metadata(host),
            }, warnings, start=start, snapshot_id=None))
            return
        if registered_risk >= 1:
            self._send_command_result(409, command, result_envelope(command_id, False, "ACTION_OUT_OF_SCOPE", "v0.3.4 only executes read-only Trusted Actions in mock mode.", {
                "host": host,
                "action": action,
                "capability": capability,
                "executed": False,
                **command_host_metadata(host),
            }, warnings + ["需要修改工程的动作将在后续版本进入确认、Dry Run 与真实 Host 执行流程。"], start=start, snapshot_id=None))
            return
        update_host_status(host, "Executing", "Mock command execution started.")
        action_result, action_warnings = execute_trusted_read_only_action(command)
        update_host_status(host, "Connected", "Mock command execution completed.")
        self._send_command_result(200, command, result_envelope(command_id, True, "TRUSTED_ACTION_EXECUTED", "Read-only Trusted Action executed by mock Local Service.", {
            "host": host,
            "action": action,
            "capability": capability,
            "mode": self.config.mode,
            "confirmationRequired": command["requiresConfirmation"],
            "executed": True,
            "readOnly": True,
            "mutationPerformed": False,
            "actionResult": action_result,
            "note": "Phase 0.3.4 executes read-only Trusted Actions in mock mode only; no host mutation is performed.",
            **command_host_metadata(host),
        }, warnings + action_warnings, start=start, snapshot_id=None))

    def do_DELETE(self) -> None:
        path = urlparse(self.path).path
        if path == "/ai/image/history" or path.startswith("/ai/image/history/"):
            if not self._require_auth():
                return
            if path == "/ai/image/history":
                payload = self._read_json_body()
                if payload is None:
                    return
                if payload.get("cleanupMissing") is True:
                    result = cleanup_missing_image_history_files()
                    self._send_json(200, {"ok": True, "cleanup": result, "storage": result["storage"]})
                    return
                artifact_ids = payload.get("ids", [])
                if not isinstance(artifact_ids, list) or not all(isinstance(item, str) for item in artifact_ids):
                    self._error(400, "IMAGE_HISTORY_IDS_INVALID", "ids must be an array of image history IDs.")
                    return
                result = delete_image_history_items(artifact_ids)
                self._send_json(200, {"ok": True, **result})
                return
            artifact_id = path.rsplit("/", 1)[-1]
            result = delete_image_history_items([artifact_id])
            if not result["deletedCount"]:
                self._error(404, "IMAGE_HISTORY_NOT_FOUND", f"Image history item not found: {artifact_id}")
                return
            self._send_json(200, {"ok": True, **result})
            return
        parts = [part for part in path.split("/") if part]
        if len(parts) == 2 and parts[0] == "provider-profiles":
            if not self._require_auth():
                return
            status, body = delete_named_provider_profile(parts[1])
            self._send_json(status, body)
            return
        self._error(404, "NOT_FOUND", f"Route not found: {path}")


def create_server(config: ServiceConfig) -> ThreadingHTTPServer:
    server = ThreadingHTTPServer((config.host, config.port), KuroiiLocalServiceHandler)
    server.config = config  # type: ignore[attr-defined]
    return server


def main() -> int:
    parser = argparse.ArgumentParser(description="Kuroii Motion AI Local Service")
    parser.add_argument("--host", default=None)
    parser.add_argument("--port", type=int, default=None)
    parser.add_argument("--token", default=None)
    args = parser.parse_args()
    config = load_config(host=args.host, port=args.port, token=args.token)
    server = create_server(config)
    print(json.dumps({
        "ok": True,
        "serviceId": config.service_id,
        "version": config.version,
        "url": f"http://{config.host}:{config.port}",
        "sessionHeader": "X-Kuroii-Session",
        "tokenHint": config.session_token if config.session_token == "dev-local-token" else "custom-token",
    }, ensure_ascii=False), flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
