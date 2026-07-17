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
    doc = read("docs/DESKTOP_COMMAND_CENTER_HOST_READINESS_GATE_v0.4.5.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "hostReadinessGateSmoke" in app_shell
    assert "tests/smoke_desktop_host_readiness_gate.py" in app_shell

    for needle in [
        "commandCenterHostReadinessGate",
        "commandCenterReadinessMessageKeys",
        "buildHostReadinessGate",
        "readinessCheck",
        "canEnterHostTest",
        "local-service",
        "host-target",
        "host-heartbeat",
        "trusted-actions",
        "command-history",
        "diagnostic-recovery",
        "hostReadinessGate,",
    ]:
        assert needle in command_center, needle

    for needle in [
        "commandCenterHostReadinessGateSmoke",
        "hostReadinessContract: commandCenterHostReadinessGate",
        "viewModelKey: \"hostReadinessGate\"",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="hostReadinessPanel"',
        'id="readinessSummary"',
        'id="readinessList"',
        'data-readiness-status="blocked"',
        'commandCenter.sections.hostReadiness',
    ]:
        assert needle in index, needle

    for needle in [
        ".readinessPanel",
        ".readinessList",
        ".readinessItem",
        'data-readiness-status="ready"',
        'data-readiness-status="warning"',
        'data-readiness-status="blocked"',
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "hostReadinessGate: true",
        "hostReadinessContract: \"commandCenterHostReadinessGate\"",
        "buildPrototypeHostReadinessGate",
        "renderHostReadinessGate",
        "data-readiness-id",
        "data-readiness-status",
        "COMMAND_HISTORY_ENDPOINT_REQUIRED",
        "DIAGNOSTIC_RECOVERY_ACTION_MISSING",
        "commandCenter.readiness.summary.blocked",
    ]:
        assert needle in prototype, needle

    assert zh["commandCenter"]["sections"]["hostReadiness"] == "宿主预检"
    assert zh["commandCenter"]["readiness"]["hostHeartbeat"]["blocked"] == "宿主心跳缺失或过期。"
    assert en["commandCenter"]["sections"]["hostReadiness"] == "Host Readiness"
    assert en["commandCenter"]["readiness"]["diagnosticRecovery"]["ready"] == "Diagnostic blockers have recovery actions."

    assert "v0.4.9" in readme
    assert "Host Readiness Gate" in next_steps
    assert "Desktop Command Center Host Readiness Gate" in doc

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "index": index,
        "css": css,
        "prototype": prototype,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop host readiness gate smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
