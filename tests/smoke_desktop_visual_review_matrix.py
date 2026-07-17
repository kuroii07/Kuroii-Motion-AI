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
    if "`r`n" in text:
        raise AssertionError(f"literal PowerShell newline marker found in {label}")


def main() -> int:
    root_package = json.loads(read("package.json"))
    desktop_package = json.loads(read("apps/desktop/package.json"))
    app_shell = read("apps/desktop/src/app-shell.js")
    command_center = read("apps/desktop/src/command-center.js")
    runtime = read("apps/desktop/src/command-center-runtime.js")
    index = read("apps/desktop/prototype/index.html")
    prototype = read("apps/desktop/prototype/prototype.js")
    desktop_css = read("apps/desktop/prototype/styles.css")
    zh = json.loads(read("packages/i18n/src/locales/zh-CN.json"))
    en = json.loads(read("packages/i18n/src/locales/en-US.json"))
    readme = read("README.md")
    next_steps = read("docs/NEXT_STEPS_v3.md")
    manual = read("tests/manual_acceptance_checklist.md")
    doc = read("docs/DESKTOP_VISUAL_REVIEW_MATRIX_v0.5.6.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "visual review matrix" in root_package["description"]
    assert root_package["scripts"]["test:desktop-visual-review-matrix"] == "python tests/smoke_desktop_visual_review_matrix.py"
    assert "python tests/smoke_desktop_visual_review_matrix.py" in root_package["scripts"]["test"]
    assert "visualReviewMatrixSmoke" in app_shell

    matrix_ids = [
        "desktop-dark-zh-expanded",
        "desktop-dark-en-collapsed",
        "desktop-light-zh-expanded",
        "desktop-light-en-collapsed",
        "ae-compact-240-dark-zh",
        "ae-compact-320-dark-en",
        "ae-compact-420-light-zh",
        "pr-compact-240-dark-zh",
        "pr-compact-320-dark-en",
        "pr-compact-420-light-zh",
    ]

    for needle in [
        "commandCenterVisualReviewMatrix",
        "tests/smoke_desktop_visual_review_matrix.py",
        "displayMode: \"visual-review-matrix-and-screenshot-checklist\"",
        "screenshotNamingPattern: \"v0.5.6_{surface}_{theme}_{locale}_{layout}_{width}_{dpi}.png\"",
        "minimumScore: 85",
        "\"data-visual-review-matrix\"",
        "\"data-visual-review-summary\"",
        "\"data-visual-review-item\"",
        "\"data-visual-scorecard\"",
        "\"data-visual-blocker\"",
        "export function buildCommandCenterVisualReviewMatrix",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in command_center, needle
    for matrix_id in matrix_ids:
        assert matrix_id in command_center, matrix_id
    for blocker in [
        "unreadable-text",
        "horizontal-overflow",
        "missing-tooltip",
        "placeholder-question-marks",
        "auto-host-launch",
        "host-mutation-control",
    ]:
        assert blocker in command_center, blocker

    for needle in [
        "buildCommandCenterVisualReviewMatrix,",
        "commandCenterVisualReviewMatrix,",
        "commandCenterVisualReviewMatrixSmoke",
        "snapshotKey: \"visualReviewMatrixContract\"",
        "viewModelKey: \"visualReviewMatrix\"",
        "runtimeMethod: \"previewVisualReviewMatrix\"",
        "visualReviewMatrixContract: commandCenterVisualReviewMatrix",
        "function previewVisualReviewMatrix",
        "previewVisualReviewMatrix,",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="visualReviewMatrixPanel"',
        "data-visual-review-matrix",
        'id="visualReviewSummary"',
        "data-visual-review-summary",
        'id="visualReviewGrid"',
        'id="visualScorecard"',
        "data-visual-scorecard",
        'id="visualBlockers"',
        "commandCenter.sections.visualReview",
    ]:
        assert needle in index, needle

    for needle in [
        "visualReviewMatrix: true",
        "visualReviewMatrixContract: \"commandCenterVisualReviewMatrix\"",
        "function buildPrototypeVisualReviewMatrix",
        "function renderVisualReviewMatrix",
        "renderVisualReviewMatrix();",
        "data-visual-review-item",
        "data-visual-blocker",
        "visualReviewFileName",
        "commandCenter.visualReview.summary",
        "commandCenter.visualReview.blocker.placeholder-question-marks",
    ]:
        assert needle in prototype, needle
    for matrix_id in matrix_ids:
        assert matrix_id in prototype, matrix_id

    for needle in [
        ".visualReviewPanel",
        ".visualReviewBody",
        ".visualReviewSummary",
        ".visualReviewGrid",
        ".visualReviewItem",
        ".visualReviewItemTop",
        ".visualReviewId",
        ".visualReviewNote",
        ".visualReviewFile",
        ".visualReviewStatus",
        ".visualScorecard",
        ".visualScoreGrid",
        ".visualScoreItem",
        ".visualBlockers",
        ".visualBlockerList",
        ".visualBlocker",
        "@media (max-width: 520px)",
    ]:
        assert needle in desktop_css, needle
    assert balanced_css_braces(desktop_css)

    assert zh["commandCenter"]["sections"]["visualReview"] == "视觉评审矩阵"
    assert zh["commandCenter"]["visualReview"]["minimumScore"] == "最低分"
    assert zh["commandCenter"]["visualReview"]["blocker"]["placeholder-question-marks"] == "出现问号占位或乱码"
    assert en["commandCenter"]["sections"]["visualReview"] == "Visual Review Matrix"
    assert en["commandCenter"]["visualReview"]["minimumScore"] == "Minimum score"
    assert en["commandCenter"]["visualReview"]["blocker"]["host-mutation-control"] == "Real project mutation control"

    assert "0.5.9-alpha.0" in readme
    assert "Visual Review Matrix" in readme
    assert "v0.5.6 Visual Review Matrix and Screenshot Checklist（已完成）" in next_steps
    assert "v0.5.7 Manual Visual Sign-off State and Findings Backlog" in next_steps
    assert "Visual Review Matrix and Screenshot Checklist" in manual
    assert "data-visual-review-matrix" in doc
    assert "v0.5.6_{surface}_{theme}_{locale}_{layout}_{width}_{dpi}.png" in doc
    assert "automaticHostLaunchAllowed: false" in doc
    assert "realHostSmokeAllowed: false" in doc
    assert "hostMutationAllowed: false" in doc

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "index": index,
        "prototype": prototype,
        "desktop_css": desktop_css,
        "readme": readme,
        "next_steps": next_steps,
        "manual": manual,
        "doc": doc,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop visual review matrix smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
