from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVICE_SRC = ROOT / "apps" / "local-service" / "src"
sys.path.insert(0, str(SERVICE_SRC))

from audio_history import audio_history_storage_summary, get_audio_history_item, list_audio_history, save_audio_plan, save_generated_audio  # noqa: E402


def main() -> int:
    with tempfile.TemporaryDirectory() as directory:
        history_path = Path(directory) / "audio-history.json"
        output_dir = Path(directory) / "generated-audio"
        original = os.environ.get("KUROII_AUDIO_HISTORY_PATH")
        original_output = os.environ.get("KUROII_AUDIO_OUTPUT_DIR")
        os.environ["KUROII_AUDIO_HISTORY_PATH"] = str(history_path)
        os.environ["KUROII_AUDIO_OUTPUT_DIR"] = str(output_dir)
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
            generated = save_generated_audio(b"ID3\x04", {
                "kind": "music",
                "title": "Generated opening",
                "prompt": "instrumental adventure",
                "providerId": "minimax",
                "model": "music-3.0",
                "format": "mp3",
                "binding": {"providerId": "minimax", "model": "music-3.0"},
                "diagnostics": {"endpoint": "/v1/music_generation"},
            })
            assert generated["hasAudio"] is True and generated["saved"] is True
            assert Path(output_dir / generated["relativePath"]).is_file()
            generated_detail = get_audio_history_item(generated["id"])
            assert generated_detail and generated_detail["audioUrl"].startswith("data:audio/mpeg;base64,")
            summary = audio_history_storage_summary()
            assert summary["audioCount"] == 1 and summary["plannedCount"] == 2 and summary["bytes"] == 4
        finally:
            if original is None:
                os.environ.pop("KUROII_AUDIO_HISTORY_PATH", None)
            else:
                os.environ["KUROII_AUDIO_HISTORY_PATH"] = original
            if original_output is None:
                os.environ.pop("KUROII_AUDIO_OUTPUT_DIR", None)
            else:
                os.environ["KUROII_AUDIO_OUTPUT_DIR"] = original_output
    server = (SERVICE_SRC / "server.py").read_text(encoding="utf-8")
    assert '"/ai/audio/drafts"' in server
    assert '"/ai/audio/history"' in server
    assert '"/ai/music/generate"' in server
    assert '"/ai/voice/generate"' in server
    print("[OK] Audio planning history smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
