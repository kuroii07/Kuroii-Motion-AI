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
    doc = read("docs/DESKTOP_COMMAND_CENTER_HOST_SMOKE_HANDOFF_v0.4.7.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "hostSmokeHandoffSmoke" in app_shell
    assert "tests/smoke_desktop_host_smoke_handoff.py" in app_shell

    for needle in [
        "commandCenterHostSmokeHandoffChecklist",
        "version: \"0.5.9-alpha.0\"",
        "mode: \"manual-handoff-only\"",
        "automaticHostLaunchAllowed: false",
        "requiresUserConfirmation: true",
        "requiresProjectBackup: true",
        "readOnlyOnly: true",
        "hostMutationAllowed: false",
        "requiredBeforeHostSmoke",
        "allowedReadOnlyActions",
        "expectedResultCodes: [\"TRUSTED_ACTION_EXECUTED\"]",
        "forbiddenActionPatterns",
        "rollbackNotes",
        "manualSteps",
        "ae.context.getProject",
        "ae.context.getActiveComp",
        "ae.context.getSelection",
        "ae.text.readSelectedLayers",
        "pr.context.getProject",
        "pr.context.getActiveSequence",
        "mutate",
    ]:
        assert needle in command_center, needle

    for forbidden in ["create", "delete", "write", "set", "save", "render", "export", "import", "mutate"]:
        assert f'"{forbidden}"' in command_center, forbidden

    for needle in [
        "commandCenterHostSmokeHandoffChecklist,",
        "commandCenterHostSmokeHandoffSmoke",
        "contract: commandCenterHostSmokeHandoffChecklist",
        "snapshotKey: \"hostSmokeHandoffChecklist\"",
        "hostSmokeHandoffChecklist: commandCenterHostSmokeHandoffChecklist",
        "automaticHostLaunchAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        "hostSmokeHandoff: true",
        "hostSmokeHandoffContract: \"commandCenterHostSmokeHandoffChecklist\"",
    ]:
        assert needle in prototype, needle

    assert "v0.4.9" in readme
    assert "Host Smoke Handoff Checklist" in next_steps
    assert "Desktop Command Center Host Smoke Handoff Checklist" in doc
    assert "manual-handoff-only" in doc
    assert "Do not run any action that creates, deletes, writes, sets, saves, renders, exports, imports, or mutates" in doc
    assert "v0.4.8" in doc

    for label, text in {
        "app_shell": app_shell,
        "command_center": command_center,
        "runtime": runtime,
        "prototype": prototype,
        "doc": doc,
    }.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop host smoke handoff smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())