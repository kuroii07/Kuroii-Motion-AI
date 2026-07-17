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
    client = read("apps/desktop/src/local-service-client.js")
    index = read("apps/desktop/prototype/index.html")
    prototype = read("apps/desktop/prototype/prototype.js")
    next_steps = read("docs/NEXT_STEPS_v3.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "runtimePrototypeAlignmentSmoke" in app_shell
    assert "tests/smoke_desktop_runtime_prototype_alignment.py" in app_shell

    for needle in [
        "commandCenterRuntimePrototypeAlignment",
        "commandCenterSharedRecoveryActions",
        "commandCenterSharedEmptyStates",
        "buildCommandCenterEmptyStates",
        "serviceFailureCode: \"LOCAL_SERVICE_UNAVAILABLE\"",
        "mockExecutionCodes",
        "emptyStates,",
        "alignment: commandCenterRuntimePrototypeAlignment",
    ]:
        assert needle in command_center, needle

    for needle in [
        "commandCenterRuntimePrototypeAlignmentSmoke",
        "sharedContract: commandCenterRuntimePrototypeAlignment",
        "prototypeAlignment: commandCenterRuntimePrototypeAlignment",
        "recoverFromError",
        "use-mock-mode",
    ]:
        assert needle in runtime, needle

    for needle in [
        "normalizeServiceError",
        "LOCAL_SERVICE_UNAVAILABLE",
        "启动 Local Service",
    ]:
        assert needle in client, needle

    for needle in [
        'data-recovery-action="retry-refresh"',
        'data-recovery-action="use-mock-mode"',
        'data-recovery-action="clear-error"',
    ]:
        assert needle in index, needle

    for needle in [
        'version: "0.5.9-alpha.0"',
        "runtimePrototypeAlignment: true",
        "alignmentContract: \"commandCenterRuntimePrototypeAlignment\"",
        "sharedRecoveryActions",
        "sharedEmptyStateIds",
        "prototypeStateMap",
        "normalizePrototypeServiceError",
        "emptyStateMarkup",
        "data-empty-state",
        "recoverFromError",
        "serviceResponseError",
        "PROTOTYPE_MOCK_EXECUTED",
    ]:
        assert needle in prototype, needle

    assert "Desktop Command Center Runtime-Prototype Alignment" in next_steps

    for label, text in {
        "command_center": command_center,
        "runtime": runtime,
        "client": client,
        "index": index,
        "prototype": prototype,
        "app_shell": app_shell,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop runtime/prototype alignment smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())