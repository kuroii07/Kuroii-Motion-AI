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
    doc = read("docs/DESKTOP_COMMAND_CENTER_RUNBOOK_EXPORT_FEEDBACK_STATE_v0.5.1.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "Kuroii Motion AI Suite" in root_package["description"]
    assert "python tests/smoke_desktop_runbook_export_feedback_state.py" in root_package["scripts"]["test"]
    assert root_package["scripts"]["test:desktop-runbook-export-feedback-state"] == "python tests/smoke_desktop_runbook_export_feedback_state.py"
    assert "runbookExportFeedbackStateSmoke" in app_shell
    assert "tests/smoke_desktop_runbook_export_feedback_state.py" in app_shell

    for needle in [
        "commandCenterRunbookExportFeedbackState",
        "version: \"0.5.9-alpha.0\"",
        "testScript: \"tests/smoke_desktop_runbook_export_feedback_state.py\"",
        "sourceContract: \"commandCenterManualHostSmokeRunbook\"",
        "storageKey: \"kuroii.motionai.commandCenter.runbookExportState.v1\"",
        "displayMode: \"inline-feedback-and-persisted-state\"",
        "\"copy-success\"",
        "\"copy-failed\"",
        "\"export-markdown-success\"",
        "\"export-json-success\"",
        "\"export-failed\"",
        "\"lastMessageKey\"",
        "eventMarkers: [\"data-runbook-feedback\", \"data-runbook-persisted-state\"]",
        "buildRunbookExportFeedbackState",
        "runbookFeedbackTone",
        "persistedState",
        "lastExportedAt",
        "lastMessageKey",
        "runbookExportFeedbackState,",
        "automaticHostLaunchAllowed: false",
        "readOnlyOnly: true",
        "hostMutationAllowed: false",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildRunbookExportFeedbackState,",
        "commandCenterRunbookExportFeedbackState,",
        "commandCenterRunbookExportFeedbackStateSmoke",
        "snapshotKey: \"runbookExportFeedbackContract\"",
        "viewModelKey: \"runbookExportFeedbackState\"",
        "runtimeMethod: \"recordRunbookExportFeedback\"",
        "storageKey: commandCenterRunbookExportFeedbackState.storageKey",
        "persistedFields: commandCenterRunbookExportFeedbackState.persistedFields",
        "runbookExportFeedbackState: options.runbookExportFeedbackState || null",
        "runbookExportFeedbackContract: commandCenterRunbookExportFeedbackState",
        "runbookExportFeedbackState = buildRunbookExportFeedbackState",
        "function recordRunbookExportFeedback",
        "state.runbookExportFeedbackState = nextState.persisted",
        "recordRunbookExportFeedback,",
        "automaticHostLaunchAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="runbookFeedback"',
        "data-runbook-feedback",
        "data-runbook-persisted-state",
    ]:
        assert needle in index, needle

    for needle in [
        ".runbookFeedback",
        '.runbookFeedback[data-runbook-feedback-result="success"]',
        '.runbookFeedback[data-runbook-feedback-result="failed"]',
        ".runbookFeedbackMeta",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "runbookExportFeedbackState: true",
        "runbookExportFeedbackContract: \"commandCenterRunbookExportFeedbackState\"",
        "runbookExportFeedbackStorageKey",
        "kuroii.motionai.commandCenter.runbookExportState.v1",
        "readPersistedRunbookFeedbackState",
        "writePersistedRunbookFeedbackState",
        "state.runbookExportFeedbackState",
        "buildPrototypeRunbookExportFeedbackState",
        "saveRunbookExportFeedbackState",
        "ensureGeneratedRunbookFeedbackState",
        "renderRunbookFeedback",
        "dataset.runbookFeedbackResult",
        "dataset.runbookLastAction",
        "commandCenter.runbook.feedback.generated",
        "commandCenter.runbook.feedback.copySuccess",
        "commandCenter.runbook.feedback.copyFailed",
        "commandCenter.runbook.feedback.exportMarkdownSuccess",
        "commandCenter.runbook.feedback.exportJsonSuccess",
        "commandCenter.runbook.feedback.exportFailed",
        "lastAction: \"copy-success\"",
        "lastAction: \"copy-failed\"",
        "lastAction: isJson ? \"export-json-success\" : \"export-markdown-success\"",
        "lastAction: \"export-failed\"",
        "lastFormat: isJson ? \"json\" : \"markdown\"",
        "el(\"runbookPreview\").focus()",
    ]:
        assert needle in prototype, needle

    zh_feedback = zh["commandCenter"]["runbook"]["feedback"]
    en_feedback = en["commandCenter"]["runbook"]["feedback"]
    assert zh_feedback["generated"] == "Runbook 已在本地生成。"
    assert zh_feedback["copySuccess"] == "Markdown 已复制到剪贴板。"
    assert zh_feedback["exportJsonSuccess"] == "JSON 草案已开始本地导出。"
    assert zh_feedback["persisted"] == "已保存轻量状态"
    assert en_feedback["generated"] == "Runbook generated locally."
    assert en_feedback["copySuccess"] == "Markdown copied to clipboard."
    assert en_feedback["exportMarkdownSuccess"] == "Markdown draft export started locally."
    assert en_feedback["persisted"] == "Lightweight state saved"

    assert "0.5.9-alpha.0" in readme
    assert "Manual Host Smoke Review Checklist" in readme
    assert "python tests/smoke_desktop_runbook_export_feedback_state.py" in readme
    assert "v0.5.1 Desktop Command Center Runbook Export Feedback and State Persistence" in next_steps
    assert "v0.5.2 Desktop Command Center Manual Host Smoke Evidence Pack" in next_steps
    assert "Desktop Runbook Export Feedback and State Persistence" in manual
    assert "Desktop Command Center Runbook Export Feedback State" in doc
    assert "inline-feedback-and-persisted-state" in doc
    assert "recordRunbookExportFeedback()" in doc
    assert "data-runbook-feedback" in doc
    assert "automaticHostLaunchAllowed: false" in doc
    assert "does not include API keys" in doc

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

    print("[OK] Desktop runbook export feedback state smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
