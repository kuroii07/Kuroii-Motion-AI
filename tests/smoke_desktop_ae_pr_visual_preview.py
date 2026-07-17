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
    ae_index = read("extensions/after-effects/client/index.html")
    ae_css = read("extensions/after-effects/client/styles.css")
    ae_js = read("extensions/after-effects/client/main.js")
    pr_index = read("extensions/premiere-pro/client/index.html")
    pr_css = read("extensions/premiere-pro/client/styles.css")
    pr_js = read("extensions/premiere-pro/client/main.js")
    zh = json.loads(read("packages/i18n/src/locales/zh-CN.json"))
    en = json.loads(read("packages/i18n/src/locales/en-US.json"))
    readme = read("README.md")
    next_steps = read("docs/NEXT_STEPS_v3.md")
    manual = read("tests/manual_acceptance_checklist.md")
    doc = read("docs/DESKTOP_AE_PR_VISUAL_PREVIEW_PASS_v0.5.5.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "visual preview" in root_package["description"]
    assert root_package["scripts"]["test:desktop-ae-pr-visual-preview"] == "python tests/smoke_desktop_ae_pr_visual_preview.py"
    assert "python tests/smoke_desktop_ae_pr_visual_preview.py" in root_package["scripts"]["test"]
    assert "visualPreviewPassSmoke" in app_shell

    for needle in [
        "commandCenterVisualPreviewPass",
        "tests/smoke_desktop_ae_pr_visual_preview.py",
        "displayMode: \"desktop-ae-pr-visual-preview-pass\"",
        "\"desktop\"",
        "\"after-effects\"",
        "\"premiere-pro\"",
        "\"ae-compact-240-320-420\"",
        "\"pr-compact-240-320-420\"",
        "\"data-visual-preview-pass\"",
        "\"data-visual-preview-summary\"",
        "\"data-visual-preview-surface\"",
        "\"data-visual-preview-drawer\"",
        "export function buildCommandCenterVisualPreview",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
        "hostMutationAllowed: false",
        "visualPreview,",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildCommandCenterVisualPreview,",
        "commandCenterVisualPreviewPass,",
        "commandCenterVisualPreviewPassSmoke",
        "snapshotKey: \"visualPreviewContract\"",
        "viewModelKey: \"visualPreview\"",
        "runtimeMethod: \"previewVisualPreviewPass\"",
        "visualPreviewContract: commandCenterVisualPreviewPass",
        "function previewVisualPreviewPass",
        "previewVisualPreviewPass,",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="visualPreviewPanel"',
        "data-visual-preview-pass",
        'id="visualPreviewSummary"',
        "data-visual-preview-summary",
        'id="visualPreviewGrid"',
        'id="visualOverviewToggle"',
        "data-visual-overview-toggle",
        'id="visualOverviewDrawer"',
        "data-visual-preview-drawer",
        "commandCenter.sections.visualPreview",
    ]:
        assert needle in index, needle

    for needle in [
        "visualPreviewPass: true",
        "visualPreviewContract: \"commandCenterVisualPreviewPass\"",
        "visualOverviewOpen",
        "function buildPrototypeVisualPreviewPass",
        "function renderVisualPreviewPass",
        "data-visual-preview-surface",
        "visualOverviewToggle",
        "visualOverviewDrawer",
        "commandCenter.visualPreview.summary",
        "commandCenter.visualPreview.drawerSafety",
    ]:
        assert needle in prototype, needle

    for needle in [
        ".visualPreviewPanel",
        ".visualPreviewBody",
        ".visualPreviewSummary",
        ".visualPreviewGrid",
        ".visualSurfaceCard",
        ".visualSurfaceIcon",
        ".visualOverviewDrawer",
        "@media (max-width: 520px)",
    ]:
        assert needle in desktop_css, needle
    assert balanced_css_braces(desktop_css)

    for label, html, css, js, host_id, host_label in [
        ("ae", ae_index, ae_css, ae_js, "after-effects", "AE Compact"),
        ("pr", pr_index, pr_css, pr_js, "premiere-pro", "PR Compact"),
    ]:
        assert "data-visual-preview-panel" in html
        assert "languageButton" in html
        assert "refreshButton" in html
        assert "modeRail" in html
        assert "statusStrip" in html
        assert host_id in html
        assert ".modeRail" in css
        assert ".contextCard" in css
        assert ".factGrid" in css
        assert "@media (max-width: 280px)" in css
        assert balanced_css_braces(css)
        assert f'hostId: "{host_id}"' in js
        assert host_label in js
        assert "renderI18n" in js
        assert "renderModes" in js
        assert "renderContent" in js
        assert "registerHost" in js
        assert "sendHeartbeat" in js
        assert "render(false);" in js
        assert ".registerHost()" not in js
        assert ".sendHeartbeat()" not in js
        assert "Visual preview" in js or "视觉预览" in js
        assert "0.5.9-alpha.0" in js

    assert zh["commandCenter"]["sections"]["visualPreview"] == "三端视觉预览"
    assert zh["commandCenter"]["visualPreview"]["surface"]["afterEffects"] == "After Effects 面板"
    assert zh["commandCenter"]["visualPreview"]["drawerSafety"].startswith("安全")
    assert en["commandCenter"]["sections"]["visualPreview"] == "Visual Preview"
    assert en["commandCenter"]["visualPreview"]["surface"]["premierePro"] == "Premiere Pro Panel"
    assert "0.5.9-alpha.0" in readme
    assert "Visual Preview Pass" in readme
    assert "v0.5.5 Desktop / AE / PR Visual Preview Pass（已完成）" in next_steps
    assert "v0.5.6" in next_steps
    assert "Desktop / AE / PR Visual Preview" in manual
    assert "data-visual-preview-pass" in doc
    assert "automaticHostLaunchAllowed: false" in doc
    assert "realHostSmokeAllowed: false" in doc

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "index": index,
        "prototype": prototype,
        "desktop_css": desktop_css,
        "ae_index": ae_index,
        "ae_css": ae_css,
        "ae_js": ae_js,
        "pr_index": pr_index,
        "pr_css": pr_css,
        "pr_js": pr_js,
        "readme": readme,
        "next_steps": next_steps,
        "manual": manual,
        "doc": doc,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop / AE / PR visual preview pass smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
