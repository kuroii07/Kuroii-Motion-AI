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
    doc = read("docs/DESKTOP_VISUAL_EVIDENCE_EXPORT_v0.5.8.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "pre-host visual evidence export" in root_package["description"]
    assert root_package["scripts"]["test:desktop-visual-evidence-export"] == "python tests/smoke_desktop_visual_evidence_export.py"
    assert "python tests/smoke_desktop_visual_evidence_export.py" in root_package["scripts"]["test"]
    assert "visualEvidenceExportSmoke" in app_shell

    for needle in [
        "commandCenterVisualEvidenceExport",
        "tests/smoke_desktop_visual_evidence_export.py",
        "displayMode: \"pre-host-visual-evidence-export\"",
        "outputFormats: [\"markdown\", \"json\"]",
        "\"export-summary\"",
        "\"screenshot-matrix\"",
        "\"signoff-summary\"",
        "\"findings-backlog\"",
        "\"safety-flags\"",
        "\"data-visual-evidence-export\"",
        "\"data-visual-evidence-summary\"",
        "\"data-visual-evidence-preview\"",
        "\"data-visual-evidence-copy\"",
        "export function buildCommandCenterVisualEvidenceExport",
        "canProceedToPreHostReview",
        "sourceVisualReviewMatrixStatus",
        "sourceVisualSignoffStatus",
        "screenshotNamingPattern",
        "JSON.stringify(exportDraft, null, 2)",
        "No AE/PR host is launched by this export.",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildCommandCenterVisualEvidenceExport,",
        "commandCenterVisualEvidenceExport,",
        "commandCenterVisualEvidenceExportSmoke",
        "snapshotKey: \"visualEvidenceExportContract\"",
        "viewModelKey: \"visualEvidenceExport\"",
        "runtimeMethod: \"previewVisualEvidenceExport\"",
        "visualEvidenceExportContract: commandCenterVisualEvidenceExport",
        "visualEvidenceExport,",
        "function previewVisualEvidenceExport",
        "previewVisualEvidenceExport,",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="visualEvidenceExportPanel"',
        "data-visual-evidence-export",
        'id="visualEvidenceMeta"',
        'id="copyVisualEvidenceButton"',
        'id="exportVisualEvidenceMarkdownButton"',
        'id="exportVisualEvidenceJsonButton"',
        'id="visualEvidenceSummary"',
        "data-visual-evidence-summary",
        'id="visualEvidencePreview"',
        "data-visual-evidence-preview",
        "commandCenter.sections.visualEvidence",
    ]:
        assert needle in index, needle

    for needle in [
        "visualEvidenceExport: true",
        "visualEvidenceExportContract: \"commandCenterVisualEvidenceExport\"",
        "function buildPrototypeVisualEvidenceExport",
        "function renderVisualEvidenceExport",
        "function copyVisualEvidenceExport",
        "function exportVisualEvidenceExport",
        "renderVisualEvidenceExport();",
        'el("copyVisualEvidenceButton").addEventListener("click", copyVisualEvidenceExport)',
        'el("exportVisualEvidenceMarkdownButton").addEventListener("click", () => exportVisualEvidenceExport("markdown"))',
        'el("exportVisualEvidenceJsonButton").addEventListener("click", () => exportVisualEvidenceExport("json"))',
        "commandCenter.visualEvidence.summary",
        "commandCenter.visualEvidence.exportMarkdownSuccess",
        "visual-evidence-${generatedAt.replace",
    ]:
        assert needle in prototype, needle

    for needle in [
        ".visualEvidencePanel",
        ".visualEvidenceBody",
        ".visualEvidenceSummary",
        ".visualEvidencePreview",
        ".visualEvidencePreview:focus-visible",
        "@media (max-width: 840px)",
        "@media (max-width: 520px)",
    ]:
        assert needle in desktop_css, needle
    assert balanced_css_braces(desktop_css)

    assert zh["commandCenter"]["sections"]["visualEvidence"] == "视觉证据导出"
    assert zh["commandCenter"]["visualEvidence"]["exportJson"] == "导出 JSON"
    assert zh["commandCenter"]["visualEvidence"]["copyOk"] == "视觉证据 Markdown 已复制"
    assert en["commandCenter"]["sections"]["visualEvidence"] == "Visual Evidence Export"
    assert en["commandCenter"]["visualEvidence"]["exportJson"] == "Export JSON"
    assert en["commandCenter"]["visualEvidence"]["copyOk"] == "Visual evidence Markdown copied"

    assert "0.5.9-alpha.0" in readme
    assert "Pre-host Visual Evidence Export" in readme
    assert "v0.5.8 Pre-host Visual Evidence Export（已完成）" in next_steps
    assert "v0.5.9 Pre-host Visual Evidence Review Lock" in next_steps
    assert "Pre-host Visual Evidence Export" in manual
    assert "Desktop Pre-host Visual Evidence Export" in doc
    assert "data-visual-evidence-preview" in doc
    assert "Markdown / JSON" in doc
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

    print("[OK] Desktop visual evidence export smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
