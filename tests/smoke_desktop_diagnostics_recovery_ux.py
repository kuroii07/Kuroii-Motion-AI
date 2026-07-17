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
    doc = read("docs/DESKTOP_COMMAND_CENTER_DIAGNOSTICS_RECOVERY_UX_v0.4.4.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "diagnosticsRecoveryUxSmoke" in app_shell
    assert "tests/smoke_desktop_diagnostics_recovery_ux.py" in app_shell

    for needle in [
        "commandCenterDiagnosticRecoveryActions",
        "commandCenterDiagnosticsRecoveryUx",
        "resolveDiagnosticRecoveryActions",
        "reset-filters",
        "view-latest-error",
        "diagnosticActionMap",
        "recoveryActions: resolveDiagnosticRecoveryActions",
    ]:
        assert needle in command_center, needle

    for needle in [
        "commandCenterDiagnosticsRecoveryUxSmoke",
        "diagnosticsRecoveryContract: commandCenterDiagnosticsRecoveryUx",
        "recoverDiagnostic",
        "findLatestCommandError",
        "resetHistoryFilters",
        "view-latest-error",
    ]:
        assert needle in runtime, needle

    assert 'id="diagnosticsPanel"' in index
    for needle in [
        ".diagnosticActions",
        ".diagnosticAction",
        ".diagnosticAction:focus-visible",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "diagnosticsRecoveryUx: true",
        "diagnosticsRecoveryContract: \"commandCenterDiagnosticsRecoveryUx\"",
        "diagnosticRecoveryActions",
        "diagnosticActionMap",
        "diagnosticRecoveryIds",
        "handleDiagnosticRecovery",
        "showLatestCommandError",
        "data-diagnostic-action",
        "commandCenter.diagnostics.recoveryActions",
        "commandCenter.recovery.resetFilters",
        "commandCenter.recovery.viewLatestError",
    ]:
        assert needle in prototype, needle

    assert zh["commandCenter"]["recovery"]["resetFilters"] == "重置过滤"
    assert zh["commandCenter"]["recovery"]["viewLatestError"] == "查看最近错误"
    assert en["commandCenter"]["recovery"]["resetFilters"] == "Reset filters"
    assert en["commandCenter"]["recovery"]["viewLatestError"] == "View latest error"

    assert "v0.4.9" in readme
    assert "Diagnostics Recovery UX" in next_steps
    assert "Desktop Command Center Diagnostics Recovery UX" in doc

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "index": index,
        "css": css,
        "prototype": prototype,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop diagnostics recovery UX smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
