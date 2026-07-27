from __future__ import annotations

import base64
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import json
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "local-service" / "src"))

from asset_library import delete_asset, get_asset, get_asset_media, get_asset_thumbnail, list_assets  # noqa: E402
from audio_history import save_audio_plan, save_generated_audio  # noqa: E402
from image_history import save_generated_image  # noqa: E402
from config import ServiceConfig  # noqa: E402
from server import create_server  # noqa: E402
from video_tasks import create_video_task, save_video_task_artifact, update_video_task  # noqa: E402


def main() -> None:
    names = (
        "KUROII_IMAGE_OUTPUT_DIR", "KUROII_IMAGE_HISTORY_PATH",
        "KUROII_AUDIO_OUTPUT_DIR", "KUROII_AUDIO_HISTORY_PATH",
        "KUROII_VIDEO_OUTPUT_DIR", "KUROII_VIDEO_TASKS_PATH",
    )
    previous = {name: os.environ.get(name) for name in names}
    try:
        with tempfile.TemporaryDirectory(dir=ROOT / "apps" / "local-service" / "data") as directory:
            root = Path(directory)
            os.environ["KUROII_IMAGE_OUTPUT_DIR"] = str(root / "images")
            os.environ["KUROII_IMAGE_HISTORY_PATH"] = str(root / "image-history.json")
            os.environ["KUROII_AUDIO_OUTPUT_DIR"] = str(root / "audio")
            os.environ["KUROII_AUDIO_HISTORY_PATH"] = str(root / "audio-history.json")
            os.environ["KUROII_VIDEO_OUTPUT_DIR"] = str(root / "videos")
            os.environ["KUROII_VIDEO_TASKS_PATH"] = str(root / "video-tasks.json")

            image_output = BytesIO()
            Image.new("RGB", (960, 640), "#2b87ad").save(image_output, format="PNG")
            image_bytes = image_output.getvalue()
            image = save_generated_image(
                f"data:image/png;base64,{base64.b64encode(image_bytes).decode('ascii')}",
                {"prompt": "Image asset", "model": "image-test"},
            )
            audio = save_generated_audio(b"mp3-data", {"kind": "music", "title": "Music asset", "model": "music-test", "format": "mp3"})
            plan = save_audio_plan({"kind": "voice-plan", "title": "Voice plan", "content": {"script": "Hello"}})
            task = create_video_task({"prompt": "Video asset", "status": "succeeded", "model": "video-test"})
            artifact = save_video_task_artifact(task["id"], b"mp4-data", "asset.mp4")
            update_video_task(task["id"], artifact)

            assets = list_assets(20)
            assert [item["assetType"] for item in assets].count("image") == 1
            assert [item["assetType"] for item in assets].count("audio") == 2
            assert [item["assetType"] for item in assets].count("video") == 1
            assert len(list_assets(20, "audio")) == 2

            image_detail = get_asset("image", image["id"])
            assert image_detail and "imageUrl" not in image_detail["detail"]
            audio_detail = get_asset("audio", audio["id"])
            assert audio_detail and "audioUrl" not in audio_detail["detail"]
            video_detail = get_asset("video", task["id"])
            assert video_detail and "videoUrl" not in video_detail["detail"]

            image_media = get_asset_media("image", image["id"])
            audio_media = get_asset_media("audio", audio["id"])
            video_media = get_asset_media("video", task["id"])
            assert image_media and image_media[0].read_bytes() == image_bytes and image_media[1] == "image/png"
            assert audio_media and audio_media[0].read_bytes() == b"mp3-data" and audio_media[1] == "audio/mpeg"
            assert video_media and video_media[0].read_bytes() == b"mp4-data" and video_media[1] == "video/mp4"

            audio_thumbnail = get_asset_thumbnail("audio", audio["id"])
            video_thumbnail = get_asset_thumbnail("video", task["id"])
            assert audio_thumbnail and audio_thumbnail[1] == "image/png"
            assert video_thumbnail and video_thumbnail[1] == "image/png"
            for preview_bytes, _mime_type in (audio_thumbnail, video_thumbnail):
                with Image.open(BytesIO(preview_bytes)) as preview:
                    assert preview.width <= 480 and preview.height <= 300

            # When ffmpeg is installed, the service must prefer a real first
            # frame over the fallback video poster.
            ffmpeg = shutil.which("ffmpeg")
            if ffmpeg:
                first_frame_source = root / "first-frame.mp4"
                subprocess.run(
                    [ffmpeg, "-y", "-f", "lavfi", "-i", "color=c=0x247ca6:s=320x180:r=1", "-t", "1", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(first_frame_source)],
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=10,
                )
                first_frame_task = create_video_task({"prompt": "First frame asset", "status": "succeeded", "model": "video-test"})
                first_frame_artifact = save_video_task_artifact(first_frame_task["id"], first_frame_source.read_bytes(), "first-frame.mp4")
                update_video_task(first_frame_task["id"], first_frame_artifact)
                first_frame_thumbnail = get_asset_thumbnail("video", first_frame_task["id"])
                assert first_frame_thumbnail and first_frame_thumbnail[1] == "image/jpeg"
                with Image.open(BytesIO(first_frame_thumbnail[0])) as preview:
                    pixel = preview.convert("RGB").getpixel((preview.width // 2, preview.height // 2))
                    assert pixel[2] > pixel[0]

            service = create_server(ServiceConfig(port=0, session_token="asset-library-test"))
            service_thread = threading.Thread(target=service.serve_forever, daemon=True)
            service_thread.start()
            try:
                port = service.server_address[1]
                detail_request = Request(
                    f"http://127.0.0.1:{port}/ai/assets/image/{image['id']}",
                    headers={"X-Kuroii-Session": "asset-library-test"},
                )
                with urlopen(detail_request, timeout=5) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                assert payload["ok"] and "imageUrl" not in payload["detail"]
                media_request = Request(
                    f"http://127.0.0.1:{port}/ai/assets/image/{image['id']}/media",
                    headers={"X-Kuroii-Session": "asset-library-test"},
                )
                with urlopen(media_request, timeout=5) as response:
                    assert response.headers.get_content_type() == "image/png"
                    assert response.read() == image_bytes
                direct_media_request = Request(
                    f"http://127.0.0.1:{port}/ai/assets/image/{image['id']}/media?session=asset-library-test",
                )
                with urlopen(direct_media_request, timeout=5) as response:
                    assert response.headers.get_content_type() == "image/png"
                    assert response.read() == image_bytes
                thumbnail_request = Request(
                    f"http://127.0.0.1:{port}/ai/assets/image/{image['id']}/media?session=asset-library-test&thumbnail=1",
                )
                with urlopen(thumbnail_request, timeout=5) as response:
                    thumbnail_bytes = response.read()
                    assert response.headers.get_content_type() == "image/jpeg"
                with Image.open(BytesIO(thumbnail_bytes)) as thumbnail:
                    assert thumbnail.width <= 480 and thumbnail.height <= 300
                for asset_type, asset_id in (("audio", audio["id"]), ("video", task["id"])):
                    preview_request = Request(
                        f"http://127.0.0.1:{port}/ai/assets/{asset_type}/{asset_id}/media?session=asset-library-test&thumbnail=1",
                    )
                    with urlopen(preview_request, timeout=5) as response:
                        preview_bytes = response.read()
                        assert response.headers.get_content_type() == "image/png"
                    with Image.open(BytesIO(preview_bytes)) as preview:
                        assert preview.width <= 480 and preview.height <= 300

                # Repeatedly swap large-image streams. The list/detail protocol
                # stays URL-based and never returns Base64 payloads, so the
                # renderer can keep one current media reference instead of
                # retaining every previously opened source image.
                large_ids = []
                for color in ("#286f99", "#996a28"):
                    large_output = BytesIO()
                    Image.new("RGB", (1920, 1280), color).save(large_output, format="PNG")
                    large_asset = save_generated_image(
                        f"data:image/png;base64,{base64.b64encode(large_output.getvalue()).decode('ascii')}",
                        {"prompt": f"Large asset {color}", "model": "image-test"},
                    )
                    large_ids.append(large_asset["id"])
                for _ in range(12):
                    for asset_id in large_ids:
                        switch_request = Request(
                            f"http://127.0.0.1:{port}/ai/assets/image/{asset_id}/media?session=asset-library-test",
                        )
                        with urlopen(switch_request, timeout=5) as response:
                            assert response.headers.get_content_type() == "image/png"
                            assert response.read().startswith(b"\x89PNG")
            finally:
                service.shutdown()
                service.server_close()
                service_thread.join(timeout=5)

            removed_audio = delete_asset("audio", audio["id"])
            assert removed_audio and removed_audio["deletedCount"] == 1 and removed_audio["deletedFiles"] == 1
            removed_video = delete_asset("video", task["id"])
            assert removed_video and removed_video["deletedCount"] == 1 and removed_video["deletedFiles"] == 1
            removed_plan = delete_asset("audio", plan["id"])
            assert removed_plan and removed_plan["deletedCount"] == 1 and removed_plan["deletedFiles"] == 0
    finally:
        for name, value in previous.items():
            if value is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = value
    print("[OK] Unified asset library smoke test passed")


if __name__ == "__main__":
    main()
