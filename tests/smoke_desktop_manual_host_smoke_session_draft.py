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
    doc = read("docs/DESKTOP_COMMAND_CENTER_MANUAL_HOST_SMOKE_SESSION_DRAFT_v0.5.4.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "Kuroii Motion AI Suite" in root_package["description"]
    assert "python tests/smoke_desktop_manual_host_smoke_session_draft.py" in root_package["scripts"]["test"]
    assert root_package["scripts"]["test:desktop-manual-host-smoke-session-draft"] == "python tests/smoke_desktop_manual_host_smoke_session_draft.py"
    assert "manualHostSmokeSessionDraftSmoke" in app_shell
    assert "tests/smoke_desktop_manual_host_smoke_session_draft.py" in app_shell

    for needle in [
        "commandCenterManualHostSmokeSessionDraft",
        "version: \"0.5.9-alpha.0\"",
        "testScript: \"tests/smoke_desktop_manual_host_smoke_session_draft.py\"",
        "commandCenterManualHostSmokeReviewChecklist",
        "commandCenterManualHostSmokeEvidencePack",
        "commandCenterManualHostSmokeRunbook",
        "commandCenterHostSmokeHandoffChecklist",
        "displayMode: \"manual-host-smoke-session-draft\"",
        "storageKey: \"kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1\"",
        "\"session-summary\"",
        "\"target-host\"",
        "\"start-conditions\"",
        "\"allowed-actions\"",
        "\"stop-conditions\"",
        "\"result-placeholders\"",
        "\"data-host-smoke-session-draft\"",
        "\"data-session-draft-preview\"",
        "\"data-session-draft-copy\"",
        "\"data-session-draft-export\"",
        "\"data-session-draft-save\"",
        "\"data-session-draft-reset\"",
        "function sessionCondition",
        "export function buildManualHostSmokeSessionDraft",
        "\"review-checklist-ready\"",
        "\"target-host-selected\"",
        "\"allowed-actions-present\"",
        "\"manual-launch-only\"",
        "\"host-heartbeat-stale\"",
        "\"target-lock-mismatch\"",
        "\"command-result-failed\"",
        "\"mutation-warning-observed\"",
        "\"user-cancelled-session\"",
        "canStartManualHostSmokeSession: status === \"ready\"",
        "json: JSON.stringify(draft, null, 2)",
        "manualHostSmokeSessionDraft,",
        "automaticHostLaunchAllowed: false",
        "readOnlyOnly: true",
        "hostMutationAllowed: false",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildManualHostSmokeSessionDraft,",
        "commandCenterManualHostSmokeSessionDraft,",
        "commandCenterManualHostSmokeSessionDraftSmoke",
        "snapshotKey: \"manualHostSmokeSessionDraftContract\"",
        "viewModelKey: \"manualHostSmokeSessionDraft\"",
        "runtimeMethod: \"previewManualHostSmokeSessionDraft\"",
        "stateMethod: \"updateManualHostSmokeSessionDraftState\"",
        "storageKey: commandCenterManualHostSmokeSessionDraft.storageKey",
        "manualHostSmokeSessionDraftContract: commandCenterManualHostSmokeSessionDraft",
        "manualHostSmokeSessionDraft = buildManualHostSmokeSessionDraft",
        "sessionDraftState: options.sessionDraftState || null",
        "sessionDraftState: state.sessionDraftState",
        "function previewManualHostSmokeSessionDraft",
        "function updateManualHostSmokeSessionDraftState",
        "previewManualHostSmokeSessionDraft,",
        "updateManualHostSmokeSessionDraftState,",
        "automaticHostLaunchAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="manualHostSmokeSessionDraftPanel"',
        "data-host-smoke-session-draft",
        'id="sessionDraftMeta"',
        'id="saveSessionDraftButton"',
        "data-session-draft-save",
        'id="copySessionDraftButton"',
        "data-session-draft-copy",
        'id="exportSessionDraftMarkdownButton"',
        'data-session-draft-export="markdown"',
        'id="exportSessionDraftJsonButton"',
        'data-session-draft-export="json"',
        'id="resetSessionDraftButton"',
        "data-session-draft-reset",
        'id="sessionDraftSummary"',
        "data-session-draft-summary",
        'id="sessionDraftGrid"',
        'id="sessionDraftPreview"',
        "data-session-draft-preview",
        "commandCenter.sections.hostSmokeSessionDraft",
    ]:
        assert needle in index, needle

    for needle in [
        ".sessionDraftPanel",
        ".sessionDraftActions",
        ".sessionDraftBody",
        ".sessionDraftSummary",
        '.sessionDraftSummary[data-session-draft-status="ready"]',
        '.sessionDraftSummary[data-session-draft-status="blocked"]',
        ".sessionDraftGrid",
        ".sessionDraftBlock",
        ".sessionDraftBlockTitle",
        ".sessionDraftPreview",
        ".sessionDraftPreview:focus-visible",
        ".sessionDraftPanel:focus-visible",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "manualHostSmokeSessionDraft: true",
        "manualHostSmokeSessionDraftContract: \"commandCenterManualHostSmokeSessionDraft\"",
        "sessionDraftStorageKey",
        "kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1",
        "readPersistedSessionDraftState",
        "writePersistedSessionDraftState",
        "state.sessionDraftState",
        "function buildPrototypeManualHostSmokeSessionDraft",
        "function saveManualHostSmokeSessionDraft",
        "async function copyManualHostSmokeSessionDraft",
        "function exportManualHostSmokeSessionDraft",
        "function resetManualHostSmokeSessionDraft",
        "function renderManualHostSmokeSessionDraft",
        "dataset.sessionDraftStatus",
        "commandCenter.sessionDraft.status.ready",
        "commandCenter.sessionDraft.status.blocked",
        "commandCenter.sessionDraft.exportJsonSuccess",
        "saveSessionDraftButton",
        "copySessionDraftButton",
        "exportSessionDraftMarkdownButton",
        "exportSessionDraftJsonButton",
        "resetSessionDraftButton",
        "renderManualHostSmokeSessionDraft();",
    ]:
        assert needle in prototype, needle

    assert zh["commandCenter"]["sections"]["hostSmokeSessionDraft"] == "宿主 Smoke Session 草案"
    assert zh["commandCenter"]["sessionDraft"]["save"] == "生成"
    assert zh["commandCenter"]["sessionDraft"]["status"]["ready"] == "Session 草案已就绪，可等待用户手动打开宿主。"
    assert zh["commandCenter"]["sessionDraft"]["stopConditions"] == "停止条件"
    assert en["commandCenter"]["sections"]["hostSmokeSessionDraft"] == "Host Smoke Session Draft"
    assert en["commandCenter"]["sessionDraft"]["copy"] == "Copy"
    assert en["commandCenter"]["sessionDraft"]["status"]["blocked"] == "Session draft is still blocked by review conditions."
    assert en["commandCenter"]["sessionDraft"]["placeholders"] == "Result placeholders"

    assert "0.5.9-alpha.0" in readme
    assert "Manual Host Smoke Session Draft" in readme
    assert "python tests/smoke_desktop_manual_host_smoke_session_draft.py" in readme
    assert "v0.5.4 Desktop Command Center Manual Host Smoke Session Draft（已完成）" in next_steps
    assert "v0.5.5 Desktop / AE / PR Visual Preview Pass" in next_steps
    assert "Desktop Manual Host Smoke Session Draft" in manual
    assert "kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1" in manual
    assert "Desktop Command Center Manual Host Smoke Session Draft" in doc
    assert "manual-host-smoke-session-draft" in doc
    assert "data-host-smoke-session-draft" in doc
    assert "data-session-draft-save" in doc
    assert "automaticHostLaunchAllowed: false" in doc
    assert "must not include API keys" in doc
    assert "v0.5.5" in doc

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

    print("[OK] Desktop manual host smoke session draft smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
