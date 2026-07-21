from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVICE_SRC = ROOT / "apps" / "local-service" / "src"
sys.path.insert(0, str(SERVICE_SRC))

from audio_history import audio_history_storage_summary, get_audio_history_item, list_audio_history, save_audio_plan  # noqa: E402


def main() -> int:
    with tempfile.TemporaryDirectory() as directory:
        history_path = Path(directory) / "audio-history.json"
        original = os.environ.get("KUROII_AUDIO_HISTORY_PATH")
        os.environ["KUROII_AUDIO_HISTORY_PATH"] = str(history_path)
        try:
            music = save_audio_plan({
                "kind": "music-direction",
                "title": "RPG opening",
                "content": {"prompt": "instrumental adventure", "blueprint": "build energy"},
                "metadata": {"useCase": "video", "mode": "instrumental", "apiKey": "must-not-persist"},
            })
            voice = save_audio_plan({
                "kind": "voice-plan",
                "title": "Opening voiceover",
                "content": {"script": "Welcome", "segments": ["Welcome", "Begin the adventure"]},
                "metadata": {"language": "en-US", "voice": "narrator", "pace": "natural", "emotion": "confident"},
            })
            assert music["hasAudio"] is False and music["source"] == "local-planning"
            assert voice["segments"] == ["Welcome", "Begin the adventure"]
            assert [item["id"] for item in list_audio_history()] == [voice["id"], music["id"]]
            assert get_audio_history_item(music["id"])["metadata"] == {"useCase": "video", "mode": "instrumental"}
            assert "must-not-persist" not in history_path.read_text(encoding="utf-8")
            assert audio_history_storage_summary()["plannedCount"] == 2
        finally:
            if original is None:
                os.environ.pop("KUROII_AUDIO_HISTORY_PATH", None)
            else:
                os.environ["KUROII_AUDIO_HISTORY_PATH"] = original
    server = (SERVICE_SRC / "server.py").read_text(encoding="utf-8")
    assert '"/ai/audio/drafts"' in server
    assert '"/ai/audio/history"' in server
    print("[OK] Audio planning history smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
