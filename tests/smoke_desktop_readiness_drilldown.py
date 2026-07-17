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
    doc = read("docs/DESKTOP_COMMAND_CENTER_READINESS_DRILLDOWN_v0.4.6.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "readinessDrilldownSmoke" in app_shell
    assert "tests/smoke_desktop_readiness_drilldown.py" in app_shell

    for needle in [
        "commandCenterReadinessDrilldown",
        "resolveReadinessDrilldownTarget",
        "actionLabelKey: \"commandCenter.readiness.viewRelatedArea\"",
        "\"local-service\": { targetId: \"diagnosticsPanel\"",
        "\"host-target\": { targetId: \"hostStrip\"",
        "\"trusted-actions\": { targetId: \"actionList\"",
        "\"command-history\": { targetId: \"historyTable\"",
        "drilldownTarget",
        "drilldownLabelKey",
        "keyboardTriggers: [\"Enter\", \"Space\"]",
    ]:
        assert needle in command_center, needle

    for needle in [
        "commandCenterReadinessDrilldownSmoke",
        "readinessDrilldownContract: commandCenterReadinessDrilldown",
        "resolveReadinessDrilldown",
        "resolveReadinessDrilldownTarget",
        "snapshotKey: \"readinessDrilldownContract\"",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="hostStrip" aria-label="Hosts" tabindex="-1"',
        'id="actionList" aria-live="polite" tabindex="-1"',
        'id="historyTable" aria-live="polite" tabindex="-1"',
        'id="diagnosticsPanel" aria-live="polite" tabindex="-1"',
    ]:
        assert needle in index, needle

    for needle in [
        ".readinessItem:hover",
        ".readinessItem:focus-visible",
        ".readinessAction",
        ".hostStrip:focus-visible",
        ".actionList:focus-visible",
        ".readinessList",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "readinessDrilldown: true",
        "readinessDrilldownContract: \"commandCenterReadinessDrilldown\"",
        "const readinessDrilldownTargets",
        "data-readiness-drilldown",
        "data-readiness-target",
        "handleReadinessDrilldown",
        "event.key === \"Enter\" || event.key === \" \"",
        "renderHostReadinessGate();",
        "commandCenter.readiness.viewRelatedArea",
    ]:
        assert needle in prototype, needle

    assert zh["commandCenter"]["readiness"]["viewRelatedArea"] == "查看对应区域"
    assert en["commandCenter"]["readiness"]["viewRelatedArea"] == "View related area"
    assert "v0.4.9" in readme
    assert "Desktop Command Center Readiness Drilldown" in next_steps
    assert "Desktop Command Center Readiness Drilldown" in doc

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

    print("[OK] Desktop readiness drilldown smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
