from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def balanced_css_braces(css: str) -> bool:
    depth = 0
    for char in css:
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
        if depth < 0:
            return False
    return depth == 0


def assert_no_bad_text(label: str, text: str) -> None:
    if re.search(r"[\x00-\x08\x0B\x0C\x0E-\x1F]", text):
        raise AssertionError(f"control characters found in {label}")
    if re.search(r"\?{3,}", text):
        raise AssertionError(f"placeholder question marks found in {label}")


def main() -> int:
    index = read("apps/desktop/prototype/index.html")
    css = read("apps/desktop/prototype/styles.css")
    js = read("apps/desktop/prototype/prototype.js")
    app_shell = read("apps/desktop/src/app-shell.js")
    root_package = json.loads(read("package.json"))
    desktop_package = json.loads(read("apps/desktop/package.json"))

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "interactionPolishSmoke" in app_shell
    assert "tests/smoke_desktop_interaction_polish.py" in app_shell

    for needle in [
        'class="skipLink"',
        'id="commandWorkspace" tabindex="-1"',
        'id="activityBand" aria-live="polite" tabindex="-1"',
        'id="recoveryAdvice"',
        'id="actionList" aria-live="polite"',
        'id="historyTable" aria-live="polite" tabindex="-1"',
        'id="detailPanel" tabindex="-1"',
        'id="detailSummary"',
        'class="rawDetail"',
        'aria-live="polite"',
    ]:
        assert needle in index, needle

    for needle in [
        ".skipLink",
        ":focus-visible",
        ".recoveryAdvice",
        ".emptyState",
        ".detailSummary",
        ".rawDetail summary",
        ".historyTable:focus-visible",
        ".filterBar input:focus-visible",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "interactionPolish: true",
        "requestFocus",
        "applyFocusAfterRender",
        "detailSummaryRows",
        "commandCenter.empty.noHistory",
        "commandCenter.empty.noFilteredHistory",
        "commandCenter.error.defaultAdvice",
        'event.key === "Escape"',
        'event.key === "/"',
    ]:
        assert needle in js, needle

    for label, text in {"index": index, "css": css, "js": js, "app_shell": app_shell}.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop interaction polish smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())