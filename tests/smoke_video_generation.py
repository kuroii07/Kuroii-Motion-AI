from __future__ import annotations

import json
import os
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "local-service" / "src"))

from openai_protocol_adapter import poll_video_generation, submit_video_generation  # noqa: E402
from video_tasks import create_video_task, get_video_task, update_video_task  # noqa: E402


class VideoProviderHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return

    def _json(self, body: dict) -> None:
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_POST(self) -> None:
        assert self.path == "/v1/videos/generations"
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])).decode("utf-8"))
        assert body == {"model": "video-test", "prompt": "cat walks", "seconds": 5, "aspect_ratio": "16:9", "resolution": "720p"}
        self._json({"id": "task-1", "status": "queued"})

    def do_GET(self) -> None:
        assert self.path == "/v1/videos/generations/task-1"
        self._json({"id": "task-1", "status": "completed", "data": {"url": "https://media.example.test/video.mp4"}})


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 0), VideoProviderHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        config = {
            "baseUrl": f"http://127.0.0.1:{server.server_port}/v1",
            "apiKey": "test-key",
            "videoPath": "/videos/generations",
            "videoStatusPath": "/videos/generations/{taskId}",
            "timeoutSeconds": 5,
        }
        submitted = submit_video_generation("openai-compatible", config, "video-test", "cat walks", {"durationSeconds": 5, "aspectRatio": "16:9", "resolution": "720p"})
        assert submitted["providerTaskId"] == "task-1"
        assert submitted["status"] == "queued"
        completed = poll_video_generation("openai-compatible", config, "task-1")
        assert completed["status"] == "succeeded"
        assert completed["videoUrl"] == "https://media.example.test/video.mp4"
        with tempfile.TemporaryDirectory() as temp_dir:
            os.environ["KUROII_VIDEO_TASKS_PATH"] = str(Path(temp_dir) / "tasks.json")
            task = create_video_task({"providerTaskId": "task-1", "status": submitted["status"], "prompt": "cat walks"})
            updated = update_video_task(task["id"], {"status": completed["status"], "videoUrl": completed["videoUrl"]})
            assert updated and updated["status"] == "succeeded"
            assert get_video_task(task["id"])["videoUrl"] == completed["videoUrl"]
            del os.environ["KUROII_VIDEO_TASKS_PATH"]
    finally:
        server.shutdown()
        server.server_close()
    print("[OK] Video async generation smoke test passed")


if __name__ == "__main__":
    main()
