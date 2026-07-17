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
    index = read("apps/desktop/prototype/index.html")
    css = read("apps/desktop/prototype/styles.css")
    js = read("apps/desktop/prototype/prototype.js")
    readme = read("apps/desktop/prototype/README.md")
    root_package = json.loads(read("package.json"))
    desktop_package = json.loads(read("apps/desktop/package.json"))
    app_shell = read("apps/desktop/src/app-shell.js")

    assert root_package["version"] == "0.5.9-alpha.0"
    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert "prototypeDetailUiSmoke" in app_shell
    assert "tests/smoke_desktop_prototype_detail_ui.py" in app_shell

    for needle in [
        'id="activityBand"',
        'id="recoveryPanel"',
        'id="historyFilters"',
        'id="hostFilter"',
        'id="actionFilter"',
        'id="statusFilter"',
        'id="queryFilter"',
        'id="limitFilter"',
        'id="resultSummary"',
        'id="closeDetailButton"',
        'id="retryRefreshButton"',
        'id="useMockModeButton"',
    ]:
        assert needle in index, needle

    for needle in [
        ".activityBand",
        ".recoveryPanel",
        ".filterBar",
        ".actionRow.running",
        "@media (max-width: 980px)",
        "@media (max-width: 520px)",
    ]:
        assert needle in css, needle
    assert balanced_css_braces(css)

    for needle in [
        'version: "0.5.9-alpha.0"',
        "detailFilterUi: true",
        "historyServiceQuery",
        "filteredHistory",
        "renderFilters",
        "renderRecovery",
        "renderActivity",
        "openCommandDetail",
        "resetFilters",
        "setPending",
        "setError",
        "retryRefreshButton",
        "useMockModeButton",
        "PROTOTYPE_MOCK_EXECUTED",
        "mutationPerformed: false",
    ]:
        assert needle in js, needle

    assert "Result History Filters" in readme
    assert "Command Detail panel" in readme
    assert "Recovery panel" in readme

    for label, text in {"index": index, "css": css, "js": js, "readme": readme}.items():
        assert_no_bad_text(label, text)

    print("[OK] Desktop prototype detail UI smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())