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
    doc = read("docs/DESKTOP_VISUAL_SIGNOFF_STATE_v0.5.7.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "manual visual sign-off" in root_package["description"]
    assert root_package["scripts"]["test:desktop-visual-signoff-state"] == "python tests/smoke_desktop_visual_signoff_state.py"
    assert "python tests/smoke_desktop_visual_signoff_state.py" in root_package["scripts"]["test"]
    assert "visualSignoffStateSmoke" in app_shell

    for needle in [
        "commandCenterVisualSignoffState",
        "tests/smoke_desktop_visual_signoff_state.py",
        "displayMode: \"manual-visual-signoff-state-and-findings-backlog\"",
        "storageKey: \"kuroii.motionai.commandCenter.visualSignoffState.v1\"",
        "\"pending-review\"",
        "\"accepted\"",
        "\"blocked\"",
        "\"needs-recheck\"",
        "\"data-visual-signoff-state\"",
        "\"data-visual-signoff-summary\"",
        "\"data-visual-signoff-item\"",
        "\"data-visual-signoff-action\"",
        "\"data-visual-findings-backlog\"",
        "\"data-visual-finding-add\"",
        "\"data-visual-finding-resolve\"",
        "export function buildCommandCenterVisualSignoffState",
        "canCompleteVisualSignoff",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildCommandCenterVisualSignoffState,",
        "commandCenterVisualSignoffState,",
        "commandCenterVisualSignoffStateSmoke",
        "snapshotKey: \"visualSignoffStateContract\"",
        "viewModelKey: \"visualSignoffState\"",
        "runtimeMethod: \"previewVisualSignoffState\"",
        "stateMethod: \"updateVisualSignoffState\"",
        "visualSignoffStateContract: commandCenterVisualSignoffState",
        "function previewVisualSignoffState",
        "function updateVisualSignoffState",
        "previewVisualSignoffState,",
        "updateVisualSignoffState,",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="visualSignoffPanel"',
        "data-visual-signoff-state",
        'id="visualSignoffSummary"',
        "data-visual-signoff-summary",
        'id="visualSignoffGrid"',
        'id="visualFindingComposer"',
        'id="visualFindingItem"',
        'id="visualFindingType"',
        'id="visualFindingSeverity"',
        'id="visualFindingNote"',
        "data-visual-finding-add",
        'id="visualFindingsBacklog"',
        "data-visual-findings-backlog",
        "commandCenter.sections.visualSignoff",
    ]:
        assert needle in index, needle

    for needle in [
        "visualSignoffState: true",
        "visualSignoffContract: \"commandCenterVisualSignoffState\"",
        "const visualSignoffStorageKey = \"kuroii.motionai.commandCenter.visualSignoffState.v1\"",
        "function readPersistedVisualSignoffState",
        "function writePersistedVisualSignoffState",
        "function buildPrototypeVisualSignoffState",
        "function renderVisualSignoffState",
        "function addVisualFinding",
        "function resolveVisualFinding",
        "function resetVisualSignoffState",
        "data-visual-signoff-action",
        "data-visual-finding-resolve",
        "renderVisualSignoffState();",
        "commandCenter.visualSignoff.summary",
        "commandCenter.visualSignoff.type.brand-consistency",
    ]:
        assert needle in prototype, needle

    for needle in [
        ".visualSignoffPanel",
        ".visualSignoffBody",
        ".visualSignoffSummary",
        ".visualSignoffGrid",
        ".visualSignoffItem",
        ".visualSignoffItemTop",
        ".visualSignoffStatus",
        ".visualSignoffMeta",
        ".visualSignoffActions",
        ".visualFindingComposer",
        ".visualFindingNoteField",
        ".visualFindingsBacklog",
        ".visualFindingItem",
        ".visualSignoffEmpty",
        "@media (max-width: 520px)",
    ]:
        assert needle in desktop_css, needle
    assert balanced_css_braces(desktop_css)

    assert zh["commandCenter"]["sections"]["visualSignoff"] == "视觉签核"
    assert zh["commandCenter"]["visualSignoff"]["accepted"] == "通过"
    assert zh["commandCenter"]["visualSignoff"]["type"]["brand-consistency"] == "品牌一致性"
    assert en["commandCenter"]["sections"]["visualSignoff"] == "Visual Sign-off"
    assert en["commandCenter"]["visualSignoff"]["accepted"] == "Accepted"
    assert en["commandCenter"]["visualSignoff"]["type"]["brand-consistency"] == "Brand consistency"

    assert "0.5.9-alpha.0" in readme
    assert "Manual Visual Sign-off State and Findings Backlog" in readme
    assert "v0.5.7 Manual Visual Sign-off State and Findings Backlog（已完成）" in next_steps
    assert "v0.5.8 Pre-host Visual Evidence Export" in next_steps
    assert "Manual Visual Sign-off State and Findings Backlog" in manual
    assert "data-visual-signoff-state" in doc
    assert "kuroii.motionai.commandCenter.visualSignoffState.v1" in doc
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

    print("[OK] Desktop visual sign-off state smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
