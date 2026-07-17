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
    doc = read("docs/DESKTOP_COMMAND_CENTER_MANUAL_HOST_SMOKE_EVIDENCE_PACK_v0.5.2.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "Kuroii Motion AI Suite" in root_package["description"]
    assert "python tests/smoke_desktop_manual_host_smoke_evidence_pack.py" in root_package["scripts"]["test"]
    assert root_package["scripts"]["test:desktop-manual-host-smoke-evidence-pack"] == "python tests/smoke_desktop_manual_host_smoke_evidence_pack.py"
    assert "manualHostSmokeEvidencePackSmoke" in app_shell
    assert "tests/smoke_desktop_manual_host_smoke_evidence_pack.py" in app_shell

    for needle in [
        "commandCenterManualHostSmokeEvidencePack",
        "version: \"0.5.9-alpha.0\"",
        "testScript: \"tests/smoke_desktop_manual_host_smoke_evidence_pack.py\"",
        "commandCenterHostReadinessGate",
        "commandCenterManualHostSmokeRunbook",
        "commandCenterRunbookExportFeedbackState",
        "displayMode: \"local-read-only-evidence-pack\"",
        "outputFormats: [\"markdown\", \"json\"]",
        "notesStorageKey: \"kuroii.motionai.commandCenter.evidencePackNotes.v1\"",
        "\"data-host-smoke-evidence-pack\"",
        "\"data-evidence-pack-preview\"",
        "\"data-evidence-pack-copy\"",
        "\"data-evidence-pack-export\"",
        "\"data-evidence-notes\"",
        "buildManualHostSmokeEvidencePack",
        "runbookExportSummary",
        "manualReviewerNotes",
        "containsSensitiveDataAllowed: false",
        "No real host action is executed by this evidence pack.",
        "Only allowlisted risk-0 read-only actions may be used in a later manual smoke.",
        "must not include API keys, tokens, or private project content",
        "Automatic Host Launch Allowed",
        "Host Mutation Allowed",
        "automaticHostLaunchAllowed: false",
        "readOnlyOnly: true",
        "hostMutationAllowed: false",
        "manualHostSmokeEvidencePack,",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildManualHostSmokeEvidencePack,",
        "commandCenterManualHostSmokeEvidencePack,",
        "commandCenterManualHostSmokeEvidencePackSmoke",
        "snapshotKey: \"manualHostSmokeEvidencePackContract\"",
        "viewModelKey: \"manualHostSmokeEvidencePack\"",
        "runtimeMethod: \"previewManualHostSmokeEvidencePack\"",
        "notesStorageKey: commandCenterManualHostSmokeEvidencePack.notesStorageKey",
        "manualReviewerNotes: options.manualReviewerNotes || \"\"",
        "manualHostSmokeEvidencePackContract: commandCenterManualHostSmokeEvidencePack",
        "manualHostSmokeEvidencePack = buildManualHostSmokeEvidencePack",
        "manualHostSmokeEvidencePack,",
        "function previewManualHostSmokeEvidencePack",
        "previewManualHostSmokeEvidencePack,",
        "automaticHostLaunchAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="manualHostSmokeEvidencePackPanel"',
        "data-host-smoke-evidence-pack",
        'id="evidencePackMeta"',
        'id="copyEvidencePackButton"',
        "data-evidence-pack-copy",
        'id="exportEvidencePackMarkdownButton"',
        'data-evidence-pack-export="markdown"',
        'id="exportEvidencePackJsonButton"',
        'data-evidence-pack-export="json"',
        'id="evidencePackSummary"',
        'id="evidenceNotesInput"',
        "data-evidence-notes",
        'id="evidencePackPreview"',
        "data-evidence-pack-preview",
        "commandCenter.sections.hostSmokeEvidencePack",
    ]:
        assert needle in index, needle

    for needle in [
        ".evidencePackPanel",
        ".evidencePackActions",
        ".evidencePackBody",
        ".evidencePackSummary",
        '.evidencePackSummary[data-evidence-pack-status="ready"]',
        '.evidencePackSummary[data-evidence-pack-status="blocked"]',
        ".evidenceNotes",
        ".evidenceNotes textarea",
        ".evidencePackPreview",
        ".evidencePackPanel:focus-visible",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "manualHostSmokeEvidencePack: true",
        "manualHostSmokeEvidencePackContract: \"commandCenterManualHostSmokeEvidencePack\"",
        "evidencePackNotesStorageKey",
        "kuroii.motionai.commandCenter.evidencePackNotes.v1",
        "readPersistedEvidencePackNotes",
        "writePersistedEvidencePackNotes",
        "state.evidencePackNotes",
        "buildPrototypeManualHostSmokeEvidencePack",
        "renderManualHostSmokeEvidencePack",
        "copyManualHostSmokeEvidencePack",
        "exportManualHostSmokeEvidencePack",
        "dataset.evidencePackStatus",
        "commandCenter.evidencePack.notesPlaceholder",
        "commandCenter.evidencePack.exportJsonSuccess",
        "No real host action is executed by this evidence pack.",
        "manualReviewerNotes",
        "containsSensitiveDataAllowed: false",
        "copyEvidencePackButton",
        "exportEvidencePackMarkdownButton",
        "exportEvidencePackJsonButton",
        "evidenceNotesInput",
    ]:
        assert needle in prototype, needle

    assert zh["commandCenter"]["sections"]["hostSmokeEvidencePack"] == "宿主 Smoke 证据包"
    assert zh["commandCenter"]["evidencePack"]["copy"] == "复制"
    assert zh["commandCenter"]["evidencePack"]["status"]["ready"] == "证据包草案已就绪，可供人工复核。"
    assert "API Key" in zh["commandCenter"]["evidencePack"]["notesPlaceholder"]
    assert zh["commandCenter"]["evidencePack"]["exportJsonSuccess"] == "证据包 JSON 草案已开始本地导出。"
    assert en["commandCenter"]["sections"]["hostSmokeEvidencePack"] == "Host Smoke Evidence Pack"
    assert en["commandCenter"]["evidencePack"]["copy"] == "Copy"
    assert en["commandCenter"]["evidencePack"]["status"]["blocked"] == "Evidence pack draft is generated but still has blockers."
    assert "API keys" in en["commandCenter"]["evidencePack"]["notesPlaceholder"]
    assert en["commandCenter"]["evidencePack"]["exportMarkdownSuccess"] == "Evidence pack Markdown draft export started locally."

    assert "v0.5.2" in readme
    assert "Manual Host Smoke Evidence Pack" in readme
    assert "python tests/smoke_desktop_manual_host_smoke_evidence_pack.py" in readme
    assert "v0.5.2 Desktop Command Center Manual Host Smoke Evidence Pack（已完成）" in next_steps
    assert "v0.5.3 Desktop Command Center Manual Host Smoke Review Checklist" in next_steps
    assert "Desktop Manual Host Smoke Evidence Pack" in manual
    assert "Desktop Command Center Manual Host Smoke Evidence Pack" in doc
    assert "local-read-only-evidence-pack" in doc
    assert "data-host-smoke-evidence-pack" in doc
    assert "data-evidence-notes" in doc
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

    print("[OK] Desktop manual host smoke evidence pack smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
