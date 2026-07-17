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
    doc = read("docs/DESKTOP_COMMAND_CENTER_MANUAL_HOST_SMOKE_REVIEW_CHECKLIST_v0.5.3.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "Kuroii Motion AI Suite" in root_package["description"]
    assert "python tests/smoke_desktop_manual_host_smoke_review_checklist.py" in root_package["scripts"]["test"]
    assert root_package["scripts"]["test:desktop-manual-host-smoke-review-checklist"] == "python tests/smoke_desktop_manual_host_smoke_review_checklist.py"
    assert "manualHostSmokeReviewChecklistSmoke" in app_shell
    assert "tests/smoke_desktop_manual_host_smoke_review_checklist.py" in app_shell

    for needle in [
        "commandCenterManualHostSmokeReviewChecklist",
        "version: \"0.5.9-alpha.0\"",
        "testScript: \"tests/smoke_desktop_manual_host_smoke_review_checklist.py\"",
        "commandCenterManualHostSmokeEvidencePack",
        "commandCenterHostReadinessGate",
        "commandCenterRunbookExportFeedbackState",
        "displayMode: \"manual-host-smoke-review-checklist\"",
        "storageKey: \"kuroii.motionai.commandCenter.reviewChecklistState.v1\"",
        "\"evidence-pack-generated\"",
        "\"project-copy-confirmed\"",
        "\"target-lock-reviewed\"",
        "\"readiness-blockers-reviewed\"",
        "\"runbook-export-reviewed\"",
        "\"allowed-actions-reviewed\"",
        "\"manual-notes-reviewed\"",
        "\"sensitive-data-reviewed\"",
        "\"manual-launch-only-confirmed\"",
        "\"data-host-smoke-review-checklist\"",
        "\"data-review-checklist-item\"",
        "\"data-review-checklist-toggle\"",
        "\"data-review-checklist-summary\"",
        "\"data-review-checklist-reset\"",
        "function normalizeCheckedReviewItems",
        "function reviewChecklistItem",
        "export function buildManualHostSmokeReviewChecklist",
        "conditionSatisfied ? (checked ? \"ready\" : \"needs-review\") : \"blocked\"",
        "const status = summary.blocked ? \"blocked\" : (summary.needsReview ? \"needs-review\" : \"ready\")",
        "canProceedToManualHostSmoke: status === \"ready\"",
        "storageKey: commandCenterManualHostSmokeReviewChecklist.storageKey",
        "json: JSON.stringify(checklist, null, 2)",
        "manualHostSmokeReviewChecklist,",
        "automaticHostLaunchAllowed: false",
        "readOnlyOnly: true",
        "hostMutationAllowed: false",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildManualHostSmokeReviewChecklist,",
        "commandCenterManualHostSmokeReviewChecklist,",
        "commandCenterManualHostSmokeReviewChecklistSmoke",
        "snapshotKey: \"manualHostSmokeReviewChecklistContract\"",
        "viewModelKey: \"manualHostSmokeReviewChecklist\"",
        "runtimeMethod: \"previewManualHostSmokeReviewChecklist\"",
        "stateMethod: \"updateReviewChecklistState\"",
        "storageKey: commandCenterManualHostSmokeReviewChecklist.storageKey",
        "manualHostSmokeReviewChecklistContract: commandCenterManualHostSmokeReviewChecklist",
        "manualHostSmokeReviewChecklist = buildManualHostSmokeReviewChecklist",
        "reviewChecklistState: options.reviewChecklistState || null",
        "reviewChecklistState: state.reviewChecklistState",
        "function previewManualHostSmokeReviewChecklist",
        "function updateReviewChecklistState",
        "previewManualHostSmokeReviewChecklist,",
        "updateReviewChecklistState,",
        "automaticHostLaunchAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="manualHostSmokeReviewChecklistPanel"',
        "data-host-smoke-review-checklist",
        'id="reviewChecklistMeta"',
        'id="resetReviewChecklistButton"',
        "data-review-checklist-reset",
        'id="reviewChecklistSummary"',
        "data-review-checklist-summary",
        'id="reviewChecklistList"',
        "commandCenter.sections.hostSmokeReviewChecklist",
    ]:
        assert needle in index, needle

    for needle in [
        ".reviewChecklistPanel",
        ".reviewChecklistBody",
        ".reviewChecklistSummary",
        '.reviewChecklistSummary[data-review-checklist-status="ready"]',
        '.reviewChecklistSummary[data-review-checklist-status="needs-review"]',
        '.reviewChecklistSummary[data-review-checklist-status="blocked"]',
        ".reviewChecklistList",
        ".reviewChecklistItem",
        '.reviewChecklistItem[data-review-checklist-status="ready"]',
        '.reviewChecklistItem[data-review-checklist-status="needs-review"]',
        '.reviewChecklistItem[data-review-checklist-status="blocked"]',
        ".reviewChecklistItem input:focus-visible",
        ".reviewChecklistTitle",
        ".reviewChecklistMeta",
        ".reviewChecklistPanel:focus-visible",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "manualHostSmokeReviewChecklist: true",
        "manualHostSmokeReviewChecklistContract: \"commandCenterManualHostSmokeReviewChecklist\"",
        "reviewChecklistStorageKey",
        "kuroii.motionai.commandCenter.reviewChecklistState.v1",
        "readPersistedReviewChecklistState",
        "writePersistedReviewChecklistState",
        "state.reviewChecklistState",
        "function checkedReviewItemsSet",
        "function prototypeReviewChecklistItem",
        "function buildPrototypeManualHostSmokeReviewChecklist",
        "conditionSatisfied ? (checked ? \"ready\" : \"needs-review\") : \"blocked\"",
        "function saveReviewChecklistCheckedItems",
        "function toggleReviewChecklistItem",
        "function resetReviewChecklist",
        "function renderManualHostSmokeReviewChecklist",
        "dataset.reviewChecklistStatus",
        "data-review-checklist-toggle",
        "disabled",
        "commandCenter.reviewChecklist.status.needsReview",
        "commandCenter.reviewChecklist.item.manualLaunchOnlyConfirmed",
        "resetReviewChecklistButton",
        "renderManualHostSmokeReviewChecklist();",
    ]:
        assert needle in prototype, needle

    assert zh["commandCenter"]["sections"]["hostSmokeReviewChecklist"] == "宿主 Smoke 复核清单"
    assert zh["commandCenter"]["reviewChecklist"]["reset"] == "重置"
    assert zh["commandCenter"]["reviewChecklist"]["status"]["needsReview"] == "复核条件已满足，请逐项人工确认。"
    assert zh["commandCenter"]["reviewChecklist"]["ready"] == "已确认"
    assert zh["commandCenter"]["reviewChecklist"]["blocked"] == "阻断"
    assert "API Key" in zh["commandCenter"]["reviewChecklist"]["item"]["sensitiveDataReviewed"]
    assert en["commandCenter"]["sections"]["hostSmokeReviewChecklist"] == "Host Smoke Review Checklist"
    assert en["commandCenter"]["reviewChecklist"]["reset"] == "Reset"
    assert en["commandCenter"]["reviewChecklist"]["status"]["blocked"] == "Review checklist is still blocked. Resolve the condition items first."
    assert en["commandCenter"]["reviewChecklist"]["needsReview"] == "Needs review"
    assert "manually" in en["commandCenter"]["reviewChecklist"]["item"]["manualLaunchOnlyConfirmed"]

    assert "0.5.9-alpha.0" in readme
    assert "Manual Host Smoke Review Checklist" in readme
    assert "python tests/smoke_desktop_manual_host_smoke_review_checklist.py" in readme
    assert "v0.5.3 Desktop Command Center Manual Host Smoke Review Checklist（已完成）" in next_steps
    assert "v0.5.4 Desktop Command Center Manual Host Smoke Session Draft" in next_steps
    assert "Desktop Manual Host Smoke Review Checklist" in manual
    assert "kuroii.motionai.commandCenter.reviewChecklistState.v1" in manual
    assert "Desktop Command Center Manual Host Smoke Review Checklist" in doc
    assert "manual-host-smoke-review-checklist" in doc
    assert "data-host-smoke-review-checklist" in doc
    assert "data-review-checklist-reset" in doc
    assert "automaticHostLaunchAllowed: false" in doc
    assert "must not include API keys" in doc
    assert "v0.5.4" in doc

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

    print("[OK] Desktop manual host smoke review checklist smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
