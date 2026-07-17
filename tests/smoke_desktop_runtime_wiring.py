from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def assert_no_control_chars(text: str, label: str) -> None:
    if re.search(r"[\x00-\x08\x0B\x0C\x0E-\x1F]", text):
        raise AssertionError(f"control characters found in {label}")


def main() -> int:
    root_package = json.loads(read("package.json"))
    desktop_package = json.loads(read("apps/desktop/package.json"))
    app_shell = read("apps/desktop/src/app-shell.js")
    runtime = read("apps/desktop/src/command-center-runtime.js")
    fixtures = read("apps/desktop/src/command-center-fixtures.js")
    prototype = read("apps/desktop/prototype/prototype.js")
    prototype_readme = read("apps/desktop/prototype/README.md")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["exports"]["./command-center-runtime"] == "./src/command-center-runtime.js"
    assert desktop_package["exports"]["./command-center-fixtures"] == "./src/command-center-fixtures.js"

    assert "runtimeModule" in app_shell
    assert "fixtureModule" in app_shell
    assert "command-center-runtime.js" in app_shell
    assert "command-center-fixtures.js" in app_shell

    assert "commandCenterRuntimeVersion" in runtime
    assert "0.5.9-alpha.0" in runtime
    assert "createCommandCenterRuntime" in runtime
    assert "buildCommandCenterViewModel" in runtime
    assert "createLocalServiceClient" in runtime
    assert "normalizeServiceError" in runtime
    assert "cloneCommandCenterMockData" in runtime
    for method in ["snapshot", "subscribe", "setLocale", "setTheme", "selectHost", "clearHistory", "refresh", "runReadOnlyAction"]:
        assert method in runtime
    assert "RUNTIME_MOCK_EXECUTED" in runtime
    assert "mutationPerformed: false" in runtime
    assert "desktop-command-center-runtime" in runtime

    assert "commandCenterFixtureVersion" in fixtures
    assert "commandCenterMockData" in fixtures
    assert "cloneCommandCenterMockData" in fixtures
    assert "ae.context.getActiveComp" in fixtures
    assert "pr.context.getActiveSequence" in fixtures

    assert "runtimeWiring" in prototype
    assert "../src/command-center-runtime.js" in prototype
    assert "../src/command-center-fixtures.js" in prototype
    assert "apps/desktop/src/command-center-runtime.js" in prototype_readme
    assert "apps/desktop/src/command-center-fixtures.js" in prototype_readme

    for label, text in {
        "runtime": runtime,
        "fixtures": fixtures,
        "prototype": prototype,
        "prototype_readme": prototype_readme,
    }.items():
        assert_no_control_chars(text, label)
        assert not re.search(r"\?{3,}", text)

    print("[OK] Desktop runtime wiring smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())