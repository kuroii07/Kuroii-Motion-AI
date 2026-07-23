from __future__ import annotations

import base64
import os
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "local-service" / "src"))

from asset_library import delete_asset, get_asset, list_assets  # noqa: E402
from audio_history import save_audio_plan, save_generated_audio  # noqa: E402
from image_history import save_generated_image  # noqa: E402
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

            image = save_generated_image(
                f"data:image/png;base64,{base64.b64encode(b'png-data').decode('ascii')}",
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
            assert image_detail and image_detail["detail"]["imageUrl"].startswith("data:image/png;base64,")
            audio_detail = get_asset("audio", audio["id"])
            assert audio_detail and audio_detail["detail"]["audioUrl"].startswith("data:audio/mpeg;base64,")
            video_detail = get_asset("video", task["id"])
            assert video_detail and video_detail["detail"]["videoUrl"].startswith("data:video/mp4;base64,")

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
