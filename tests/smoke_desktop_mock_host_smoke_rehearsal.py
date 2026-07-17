from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


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
    prototype = read("apps/desktop/prototype/prototype.js")
    readme = read("README.md")
    next_steps = read("docs/NEXT_STEPS_v3.md")
    doc = read("docs/DESKTOP_COMMAND_CENTER_MOCK_HOST_SMOKE_REHEARSAL_v0.4.8.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "mockHostSmokeRehearsalSmoke" in app_shell
    assert "tests/smoke_desktop_mock_host_smoke_rehearsal.py" in app_shell

    for needle in [
        "commandCenterMockHostSmokeRehearsal",
        "version: \"0.5.9-alpha.0\"",
        "testScript: \"tests/smoke_desktop_mock_host_smoke_rehearsal.py\"",
        "mode: \"mock-only-rehearsal\"",
        "usesMockDataOnly: true",
        "automaticHostLaunchAllowed: false",
        "serviceRequired: false",
        "stopOnFirstFailure: true",
        "readOnlyOnly: true",
        "hostMutationAllowed: false",
        "rehearsedChecks",
        "failureScenarios",
        "expectedMockResultCode: \"TRUSTED_ACTION_EXECUTED\"",
        "buildMockHostSmokeRehearsal",
        "actionViolatesHostSmokeHandoff",
        "isAllowedHostSmokeAction",
        "simulatedHistory",
        "rehearsalHistorySimulated",
        "simulatedResultHistory",
        "failure-interrupts-run",
        "canProceedToManualHostSmoke",
        "const mockHostSmokeRehearsal = buildMockHostSmokeRehearsal",
        "mockHostSmokeRehearsal,",
    ]:
        assert needle in command_center, needle

    for needle in [
        "buildMockHostSmokeRehearsal,",
        "commandCenterMockHostSmokeRehearsal,",
        "commandCenterMockHostSmokeRehearsalSmoke",
        "snapshotKey: \"mockHostSmokeRehearsalContract\"",
        "viewModelKey: \"mockHostSmokeRehearsal\"",
        "runtimeMethod: \"previewMockHostSmokeRehearsal\"",
        "mockHostSmokeRehearsalContract: commandCenterMockHostSmokeRehearsal",
        "mockHostSmokeRehearsal: buildMockHostSmokeRehearsal",
        "function previewMockHostSmokeRehearsal",
        "usesMockDataOnly: true",
        "hostMutationAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        "mockHostSmokeRehearsal: true",
        "mockHostSmokeRehearsalContract: \"commandCenterMockHostSmokeRehearsal\"",
    ]:
        assert needle in prototype, needle

    assert "v0.4.9" in readme
    assert "Mock Host Smoke Rehearsal Runner" in next_steps
    assert "Desktop Command Center Mock Host Smoke Rehearsal Runner" in doc
    assert "mock-only-rehearsal" in doc
    assert "TRUSTED_ACTION_EXECUTED" in doc
    assert "rehearsalOnly: true" in doc
    assert "v0.4.9" in doc

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "prototype": prototype,
        "doc": doc,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop mock host smoke rehearsal smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())