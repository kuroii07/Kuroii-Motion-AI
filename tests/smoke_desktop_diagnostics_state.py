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
    readme = read("README.md")
    next_steps = read("docs/NEXT_STEPS_v3.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "diagnosticsStateSmoke" in app_shell
    assert "tests/smoke_desktop_diagnostics_state.py" in app_shell

    for needle in [
        "commandCenterDiagnosticsFirstSlice",
        "buildCommandCenterDiagnostics",
        "findLatestCommandError",
        "HOST_HEARTBEAT_STALE",
        "CAPABILITY_MISSING",
        "COMMAND_ERROR_PRESENT",
        "local-service",
        "host-heartbeat",
        "trusted-actions",
        "last-command-error",
        "diagnostics,",
    ]:
        assert needle in command_center, needle

    for needle in [
        "commandCenterDiagnosticsStateSmoke",
        "diagnosticsContract: commandCenterDiagnosticsFirstSlice",
        "diagnosticsNowIso",
        "HOST_HEARTBEAT_STALE",
        "CAPABILITY_MISSING",
        "COMMAND_ERROR_PRESENT",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="diagnosticsPanel"',
        'id="diagnosticsSummary"',
        'id="diagnosticsList"',
        'commandCenter.sections.diagnostics',
    ]:
        assert needle in index, needle

    for needle in [
        ".diagnosticsPanel",
        ".diagnosticsList",
        ".diagnosticItem",
        'data-diagnostic-status="warning"',
        'data-diagnostic-status="error"',
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "diagnosticsState: true",
        "diagnosticsContract: \"commandCenterDiagnosticsFirstSlice\"",
        "diagnosticStaleAfterMs",
        "buildPrototypeDiagnostics",
        "renderDiagnostics",
        "latestCommandError",
        "data-diagnostic-id",
        "data-diagnostic-status",
        "commandCenter.diagnostics.localService.mock",
        "HOST_HEARTBEAT_STALE",
        "CAPABILITY_MISSING",
    ]:
        assert needle in prototype, needle

    assert "v0.4.9" in readme
    assert "Desktop Command Center Diagnostics State" in next_steps

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "index": index,
        "css": css,
        "prototype": prototype,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop diagnostics state smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
