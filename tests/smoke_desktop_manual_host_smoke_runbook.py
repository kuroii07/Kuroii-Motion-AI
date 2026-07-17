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
    doc = read("docs/DESKTOP_COMMAND_CENTER_MANUAL_HOST_SMOKE_RUNBOOK_v0.5.0.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "Kuroii Motion AI Suite" in root_package["description"]
    assert "python tests/smoke_desktop_manual_host_smoke_runbook.py" in root_package["scripts"]["test"]
    assert root_package["scripts"]["test:desktop-manual-host-smoke-runbook"] == "python tests/smoke_desktop_manual_host_smoke_runbook.py"
    assert "manualHostSmokeRunbookSmoke" in app_shell
    assert "tests/smoke_desktop_manual_host_smoke_runbook.py" in app_shell

    for needle in [
        "commandCenterManualHostSmokeRunbook",
        "version: \"0.5.9-alpha.0\"",
        "testScript: \"tests/smoke_desktop_manual_host_smoke_runbook.py\"",
        "commandCenterHostReadinessGate",
        "commandCenterHostSmokeHandoffChecklist",
        "commandCenterMockHostSmokeRehearsal",
        "commandCenterRehearsalResultPanel",
        "displayMode: \"copy-export-read-only-runbook\"",
        "outputFormats: [\"markdown\", \"json\"]",
        "data-host-smoke-runbook",
        "data-runbook-copy",
        "data-runbook-export",
        "data-runbook-preview",
        "automaticHostLaunchAllowed: false",
        "readOnlyOnly: true",
        "hostMutationAllowed: false",
        "function markdownList",
        "buildManualHostSmokeRunbook",
        "No automatic AE/PR launch.",
        "Use only a disposable or backed-up project copy.",
        "Run only allowlisted risk-0 read-only actions.",
        "Stop immediately on stale heartbeat, target mismatch, command failure, or mutation warning.",
        "allowedReadOnlyActions.filter",
        "forbiddenActionPatterns",
        "manualSteps",
        "rollbackNotes",
        "blockedItems",
        "markdownList(runbook.safetySummary)",
        "json: JSON.stringify(runbook, null, 2)",
        "manualHostSmokeRunbook,",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildManualHostSmokeRunbook,",
        "commandCenterManualHostSmokeRunbook,",
        "commandCenterManualHostSmokeRunbookSmoke",
        "snapshotKey: \"manualHostSmokeRunbookContract\"",
        "viewModelKey: \"manualHostSmokeRunbook\"",
        "runtimeMethod: \"previewManualHostSmokeRunbook\"",
        "displayMode: \"copy-export-read-only-runbook\"",
        "outputFormats: commandCenterManualHostSmokeRunbook.outputFormats",
        "eventMarkers: commandCenterManualHostSmokeRunbook.eventMarkers",
        "manualHostSmokeRunbookContract: commandCenterManualHostSmokeRunbook",
        "const manualHostSmokeRunbook = buildManualHostSmokeRunbook",
        "manualHostSmokeRunbook,",
        "function previewManualHostSmokeRunbook",
        "previewManualHostSmokeRunbook,",
        "automaticHostLaunchAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="manualHostSmokeRunbookPanel"',
        "data-host-smoke-runbook",
        'id="runbookMeta"',
        'id="copyRunbookButton"',
        "data-runbook-copy",
        'id="exportRunbookMarkdownButton"',
        'data-runbook-export="markdown"',
        'id="exportRunbookJsonButton"',
        'data-runbook-export="json"',
        'id="runbookSummary"',
        'id="runbookPreview"',
        "data-runbook-preview",
        'tabindex="-1"',
        "commandCenter.sections.hostSmokeRunbook",
    ]:
        assert needle in index, needle

    for needle in [
        ".runbookPanel",
        ".runbookActions",
        ".runbookBody",
        ".runbookSummary",
        '.runbookSummary[data-runbook-status="ready"]',
        '.runbookSummary[data-runbook-status="blocked"]',
        ".runbookPreview",
        ".runbookPanel:focus-visible",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "manualHostSmokeRunbook: true",
        "manualHostSmokeRunbookContract: \"commandCenterManualHostSmokeRunbook\"",
        "hostSmokeManualSteps",
        "hostSmokeRollbackNotes",
        "function markdownList",
        "function buildPrototypeManualHostSmokeRunbook",
        "function renderManualHostSmokeRunbook",
        "async function copyManualHostSmokeRunbook",
        "function exportManualHostSmokeRunbook",
        "navigator.clipboard.writeText(runbook.markdown)",
        "dataset.runbookStatus",
        "commandCenter.runbook.status.ready",
        "commandCenter.runbook.status.blocked",
        "commandCenter.runbook.copyOk",
        "commandCenter.runbook.copyFailed",
        "exportRunbookMarkdownButton",
        "exportRunbookJsonButton",
    ]:
        assert needle in prototype, needle

    assert zh["commandCenter"]["sections"]["hostSmokeRunbook"] == "宿主 Smoke Runbook"
    assert zh["commandCenter"]["runbook"]["copy"] == "复制"
    assert zh["commandCenter"]["runbook"]["exportMarkdown"] == "导出 MD"
    assert zh["commandCenter"]["runbook"]["status"]["ready"] == "Runbook 已就绪，可按人工步骤继续。"
    assert zh["commandCenter"]["runbook"]["copyFailed"] == "复制不可用，请手动选择文本"
    assert en["commandCenter"]["sections"]["hostSmokeRunbook"] == "Host Smoke Runbook"
    assert en["commandCenter"]["runbook"]["copy"] == "Copy"
    assert en["commandCenter"]["runbook"]["exportJson"] == "Export JSON"
    assert en["commandCenter"]["runbook"]["status"]["blocked"] == "Runbook is generated but still has blockers."
    assert en["commandCenter"]["runbook"]["copyFailed"] == "Clipboard unavailable; select the text manually"

    assert "v0.5.0" in readme
    assert "Manual Host Smoke Runbook Export" in readme
    assert "python tests/smoke_desktop_manual_host_smoke_runbook.py" in readme
    assert "v0.5.0 Desktop Command Center Manual Host Smoke Runbook Export" in next_steps
    assert "v0.5.1 Desktop Command Center Runbook Export Feedback and State Persistence" in next_steps
    assert "Desktop Manual Host Smoke Runbook" in manual
    assert "Desktop Command Center Manual Host Smoke Runbook" in doc
    assert "copy-export-read-only-runbook" in doc
    assert "No automatic AE/PR launch." in doc
    assert "data-runbook-copy" in doc
    assert "data-runbook-export=\"markdown\"" in doc
    assert "automaticHostLaunchAllowed: false" in doc

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "index": index,
        "css": css,
        "prototype": prototype,
        "readme": readme,
        "next_steps": next_steps,
        "manual": manual,
        "doc": doc,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop manual host smoke runbook smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
