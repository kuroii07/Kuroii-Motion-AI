from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE = ROOT / "apps" / "desktop" / "prototype"


def read(relative_path: str) -> str:
    return (PROTOTYPE / relative_path).read_text(encoding="utf-8")


def main() -> int:
    index = read("index.html")
    js = read("prototype.js")
    css_entry = read("styles.css")

    for marker in (
        'id="professionalWorkbench"',
        'class="professionalModeBar"',
        'data-professional-mode="actions"',
        'data-professional-mode="workflows"',
        'data-professional-mode="script"',
        'data-professional-mode="expression"',
        'id="professionalResourcePane"',
        'id="professionalResourceToggle"',
        'id="professionalStage"',
        'id="professionalInspector"',
        'id="professionalConsole"',
        'id="professionalDiagnosticsDrawer"',
        'id="professionalDiagnosticsToggle"',
        'data-diagnostics-view="status"',
        'data-diagnostics-view="validation"',
        'src="./code-editor.bundle.js',
    ):
        assert marker in index, f"missing Professional Mode workbench markup: {marker}"

    for marker in (
        'professionalMode: "actions"',
        "renderProfessionalWorkbench",
        "bindProfessionalWorkbench",
        "setProfessionalMode",
        "toggleProfessionalDiagnostics",
        "setProfessionalDiagnosticsView",
        "mountProfessionalCodeEditor",
        "window.KuroiiCodeEditor.create",
        "diagnosticsToggle.onclick",
        "button.onclick = () => setProfessionalMode",
        "state.professionalResourceOpen",
    ):
        assert marker in js, f"missing Professional Mode behavior: {marker}"

    assert '@import url("./styles/professional-mode.css")' in css_entry
    professional_css = read("styles/professional-mode.css")
    for marker in (
        ".professionalWorkbench",
        ".professionalModeBar",
        ".professionalResourcePane",
        ".professionalStage",
        ".professionalInspector",
        ".professionalConsole",
        ".professionalDiagnosticsDrawer",
        ".kuroiiCodeEditor",
        ".tok-keyword",
        ".tok-string",
        ".tok-comment",
        "@media (max-width: 1100px)",
        "@media (max-width: 840px)",
    ):
        assert marker in professional_css, f"missing Professional Mode CSS: {marker}"

    assert ".workspace.view-command-center .professionalWorkbench" in professional_css
    assert ".workspace:not(.view-command-center) .professionalWorkbench" in professional_css
    assert "overflow-x: hidden" in professional_css

    editor_bundle = read("code-editor.bundle.js")
    for marker in (
        "KuroiiCodeEditor",
        "EditorView",
        "javascript",
        "bracketMatching",
        "highlightActiveLine",
        "lineNumbers",
    ):
        assert marker in editor_bundle, f"missing bundled editor capability: {marker}"

    package_json = (ROOT / "package.json").read_text(encoding="utf-8")
    assert '"build:code-editor"' in package_json
    assert '"test:professional-mode"' in package_json

    print("[OK] Professional Mode workbench smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
