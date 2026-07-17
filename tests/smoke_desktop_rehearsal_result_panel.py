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
    css = read("apps/desktop/prototype/styles.css")
    prototype = read("apps/desktop/prototype/prototype.js")
    zh = json.loads(read("packages/i18n/src/locales/zh-CN.json"))
    en = json.loads(read("packages/i18n/src/locales/en-US.json"))
    readme = read("README.md")
    next_steps = read("docs/NEXT_STEPS_v3.md")
    manual = read("tests/manual_acceptance_checklist.md")
    doc = read("docs/DESKTOP_COMMAND_CENTER_REHEARSAL_RESULT_PANEL_v0.4.9.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "rehearsalResultPanelSmoke" in app_shell
    assert "tests/smoke_desktop_rehearsal_result_panel.py" in app_shell

    for needle in [
        "commandCenterRehearsalResultPanel",
        "version: \"0.5.9-alpha.0\"",
        "testScript: \"tests/smoke_desktop_rehearsal_result_panel.py\"",
        "displayMode: \"compact-read-only-panel\"",
        "data-rehearsal-result-panel",
        "data-rehearsal-check",
        "data-rehearsal-history",
        "data-rehearsal-toggle",
        "buildRehearsalResultPanelState",
        "visibleChecks",
        "historyPreview",
        "failureReason",
        "canProceedToManualHostSmoke",
        "automaticHostLaunchAllowed: false",
        "hostMutationAllowed: false",
        "rehearsalResultPanel,",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildRehearsalResultPanelState,",
        "commandCenterRehearsalResultPanel,",
        "commandCenterRehearsalResultPanelSmoke",
        "snapshotKey: \"rehearsalResultPanelContract\"",
        "viewModelKey: \"rehearsalResultPanel\"",
        "runtimeMethod: \"previewRehearsalResultPanel\"",
        "rehearsalResultPanelContract: commandCenterRehearsalResultPanel",
        "rehearsalResultPanel: buildRehearsalResultPanelState",
        "function previewRehearsalResultPanel",
        "usesMockDataOnly: true",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="rehearsalResultPanel"',
        "data-rehearsal-result-panel",
        'id="rehearsalToggle"',
        "data-rehearsal-toggle",
        'id="rehearsalSummary"',
        'id="rehearsalChecks"',
        'id="rehearsalHistory"',
        'commandCenter.sections.rehearsalResult',
    ]:
        assert needle in index, needle

    for needle in [
        ".rehearsalPanel",
        ".rehearsalPanel.collapsed .rehearsalBody",
        ".rehearsalSummary",
        ".rehearsalStats",
        ".rehearsalGrid",
        ".rehearsalCheck",
        ".rehearsalHistoryRow",
        'data-rehearsal-status="ready"',
        'data-rehearsal-check-status="blocked"',
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "rehearsalResultPanel: true",
        "rehearsalResultPanelContract: \"commandCenterRehearsalResultPanel\"",
        "hostSmokeAllowedReadOnlyActions",
        "buildPrototypeMockHostSmokeRehearsal",
        "buildPrototypeRehearsalResultPanel",
        "renderRehearsalResultPanel",
        "data-rehearsal-check",
        "data-rehearsal-history",
        "commandCenter.rehearsal.status.ready",
        "commandCenter.rehearsal.check.failure-interrupts-run",
        "state.rehearsalCollapsed",
    ]:
        assert needle in prototype, needle

    assert zh["commandCenter"]["sections"]["rehearsalResult"] == "彩排结果"
    assert zh["commandCenter"]["rehearsal"]["canProceed"] == "可进入手动宿主 smoke"
    assert zh["commandCenter"]["rehearsal"]["check"]["failure-interrupts-run"] == "失败会中断运行"
    assert en["commandCenter"]["sections"]["rehearsalResult"] == "Rehearsal Result"
    assert en["commandCenter"]["rehearsal"]["cannotProceed"] == "Not ready for manual host smoke"
    assert en["commandCenter"]["rehearsal"]["check"]["checklist-loaded"] == "Handoff checklist loaded"

    assert "v0.4.9" in readme
    assert "Rehearsal Result Panel" in next_steps
    assert "Desktop Rehearsal Result Panel" in manual
    assert "Desktop Command Center Rehearsal Result Panel" in doc
    assert "compact-read-only-panel" in doc
    assert "v0.5.0" in doc

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "index": index,
        "css": css,
        "prototype": prototype,
        "doc": doc,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop rehearsal result panel smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())