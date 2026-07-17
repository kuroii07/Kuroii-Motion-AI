from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    js = (ROOT / "apps/desktop/prototype/prototype.js").read_text(encoding="utf-8")
    css = (ROOT / "apps/desktop/prototype/styles.css").read_text(encoding="utf-8")
    image_css = (ROOT / "apps/desktop/prototype/styles/image-workspace.css").read_text(encoding="utf-8")

    renderer_markers = (
        "renderAssistantWorkbench",
        "renderDocumentWorkbench",
        "renderTranslationWorkbench",
        "renderStoryboardWorkbench",
        "renderMotionWorkbench",
        "renderCodeWorkbench",
        "renderAnalysisWorkbench",
        "renderAutomationWorkbench",
        "renderAssetWorkbench",
        "renderLibraryWorkbench",
        "renderHistoryWorkbench",
    )
    for marker in renderer_markers:
        assert marker in js, f"missing dedicated feature renderer: {marker}"

    css_markers = (
        ".assistantWorkbench",
        ".documentWorkbench",
        ".translationWorkbench",
        ".storyboardWorkbench",
        ".motionWorkbench",
        ".codeWorkbench",
        ".analysisWorkbench",
        ".automationWorkbench",
        ".assetWorkbench",
        ".libraryWorkbench",
        ".historyWorkbench",
    )
    for marker in css_markers:
        assert marker in css, f"missing dedicated workspace style: {marker}"

    route_start = js.index("function renderFeatureWorkspace()")
    route_end = js.index("function providerCapabilityChipsHtml()", route_start)
    route = js[route_start:route_end]
    for view_id in (
        "copilot",
        "create",
        "copy",
        "translate",
        "storyboard",
        "motion",
        "expression",
        "script",
        "analyze",
        "automate",
        "assets",
        "library",
        "history",
    ):
        assert f'case "{view_id}"' in route, f"missing dedicated route for {view_id}"

    for marker in (
        'imageInspectorTab: "history"',
        'class="imageInspectorTabs"',
        'data-image-inspector-tab="history"',
        'data-image-inspector-tab="diagnostics"',
        'class="imageGenerationSettingsDisclosure"',
        'state.imageInspectorTab = "diagnostics"',
        'state.imageInspectorTab = button.dataset.imageInspectorTab',
    ):
        assert marker in js, f"missing image workspace interaction marker: {marker}"

    for marker in (
        ".imageInspectorTabs",
        ".imageInspectorPanel",
        ".imageGenerationSettingsDisclosure",
        'grid-template-areas: "composer canvas inspector"',
        'grid-template-areas: "canvas" "composer" "inspector"',
        ".workspace.view-create .workbenchHeader",
        ".workspace.view-create .workbenchHeaderMeta",
        "justify-content: flex-end",
        "top: var(--topbar-height)",
        "scroll-margin-top: var(--topbar-height)",
        "@media (max-width: 840px)",
    ):
        assert marker in image_css, f"missing image workspace layout marker: {marker}"

    print("[OK] Feature workspace diversity smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
