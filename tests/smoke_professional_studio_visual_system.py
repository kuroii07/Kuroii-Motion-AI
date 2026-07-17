from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE = ROOT / "apps" / "desktop" / "prototype"


def read(relative_path: str) -> str:
    return (PROTOTYPE / relative_path).read_text(encoding="utf-8")


def main() -> int:
    index = read("index.html")
    entry_css = read("styles.css")
    js = read("prototype.js")

    expected_imports = [
        "styles/tokens.css",
        "styles/base.css",
        "styles/components.css",
        "styles/shell.css",
        "styles/home.css",
        "styles/provider-hub.css",
        "styles/image-workspace.css",
        "styles/settings-center.css",
        "styles/professional-mode.css",
        "styles/responsive.css",
    ]
    imports = re.findall(r'@import\s+url\("\./([^\"]+)"\)', entry_css)
    assert imports[: len(expected_imports)] == expected_imports, (
        "styles.css must import the Professional Studio layers in canonical order"
    )

    css_bundle = "\n".join(read(path) for path in expected_imports)
    for token in (
        "--color-bg-app",
        "--color-bg-sidebar",
        "--color-surface-1",
        "--color-surface-2",
        "--color-surface-3",
        "--color-accent",
        "--color-brand-pink",
        "--text-body",
        "--space-4",
        "--radius-sm",
        "--control-sm",
        "--motion-normal",
    ):
        assert token in css_bundle, f"missing canonical design token: {token}"

    for marker in (
        'id="mobileNavToggle"',
        'id="themeToggle"',
        'id="appTooltip"',
        'data-theme-mode="system"',
        'id="motionCommandInput"',
        'id="motionCommandSubmit"',
        'class="commandActivityGrid"',
        'class="commandWorkflowList"',
        'class="commandShortcutGrid"',
        'class="commandWorkspaceSurface"',
        'class="commandSummaryBand"',
        'class="commandRowIcon"',
        'class="commandWorkflowIcon"',
        'class="commandShortcutIcon"',
        'class="commandHealthGauge"',
        "commandProPanel",
        'class="commandBottomBar"',
        'class="commandBarKey"',
        'src="./assets/brand/adobe-aep-file-icon.png"',
        'src="./assets/brand/adobe-prproj-file-icon.png"',
    ):
        assert marker in index, f"missing Professional Studio markup: {marker}"

    for removed_marker in (
        'class="homeDock"',
        'class="layerBoard"',
        'class="dockPanel systemDock"',
    ):
        assert removed_marker not in index, f"legacy home block remains: {removed_marker}"

    for marker in (
        'const THEME_STORAGE_KEY = "kuroii.motionai.themeMode.v1"',
        'window.matchMedia("(prefers-color-scheme: dark)")',
        "state.themeMode",
        "applyThemeMode",
        "toggleThemeAppearance",
        "data-nav-group",
        "bindHomeCommandWorkspace",
        "hydrateCommandIcons",
        "renderSystemSettingsWorkspace",
        "bindSystemSettingsWorkspace",
        "const hostStatusLabel",
        'const THEME_COLOR_STORAGE_KEY = "kuroii.motionai.themeColor.v1"',
        'const ACCENT_COLOR_STORAGE_KEY = "kuroii.motionai.accentColor.v1"',
        "applyPersonalizationColors",
        "updateThemeModeIcons",
        "updateSidebarToggleIcon",
        "bindAppTooltips",
        "showAppTooltip",
        "hideAppTooltip",
        "resolveTooltipPlacement",
        'document.querySelectorAll(".sendButton[data-tooltip]")',
        'data-icon-slot="theme"',
        'data-icon-slot="sidebar"',
        'data-settings-theme="${id}"',
        'data-settings-locale="${id}"',
        'data-settings-theme-color="${id}"',
        'data-settings-accent-color="${id}"',
        'data-tooltip="${escapeHtml(label)}"',
        'data-tooltip="${state.locale === "zh-CN" ? `运行 ${escapeHtml(action.id)}` : `Run ${escapeHtml(action.id)}`}"',
    ):
        assert marker in js, f"missing Professional Studio behavior: {marker}"

    for css_rule in (
        "--sidebar-width: 216px",
        ".commandComposer",
        ".commandWorkspaceSurface",
        ".commandSummaryBand",
        ".commandBottomBar",
        ".commandShortcutIcon",
        ".navGroupLabel",
        ".settingsWorkspace",
        ".settingsGroup",
        ".settingsGroupPanel",
        ".settingsRow",
        ".settingsColorSwatches",
        ".settingsColorSwatch",
        ".settingsColorSwatch.active > span",
        ".sidebarCollapsed .navList::-webkit-scrollbar",
        ".appTooltip",
        ".appTooltip[hidden]",
        "[data-tooltip]::after",
        "@media (max-width: 840px)",
        "@media (prefers-reduced-motion: reduce)",
    ):
        assert css_rule in css_bundle, f"missing Professional Studio CSS rule: {css_rule}"

    migrated_css = "\n".join(
        read(path)
        for path in (
            "styles/tokens.css",
            "styles/base.css",
            "styles/components.css",
            "styles/shell.css",
            "styles/home.css",
            "styles/settings-center.css",
            "styles/responsive.css",
        )
    )
    assert not re.search(r"(?<!\d)9px", migrated_css), "migrated workspace CSS must not use 9px text"
    assert "linear-gradient" not in migrated_css, "migrated workspace CSS must not add decorative gradients"
    assert not re.search(
        r"border-radius:\s*(?:1[2-9]|[2-9][0-9])px",
        migrated_css,
    ), "migrated workspace CSS must keep panel radii at 10px or below"
    assert index.count('data-command-prompt=') >= 6, "the reference uses six quick-command entries"
    assert "settingsNavigation" not in js, "settings page must not nest a second sidebar"
    assert "settingsSearchInput" not in js, "settings page must not keep the discarded sidebar search"
    assert "data-settings-section-target" not in js, "settings groups must not behave like anchor navigation"
    assert 'id="sidebarTooltip"' not in index, "sidebar-only tooltip root must be replaced by the app-wide tooltip"
    assert "bindSidebarTooltip" not in js, "sidebar-only tooltip controller must be replaced by the app-wide controller"
    assert "title=" not in js, "prototype controls must use the branded app tooltip instead of native browser tooltips"
    assert "[data-tooltip]:hover::after" not in entry_css, "legacy pseudo-element tooltips must be disabled"
    sidebar_toggle_markup = re.search(r'id="sidebarToggle"[\s\S]*?</button>', index)
    assert sidebar_toggle_markup and 'M5 7h14' not in sidebar_toggle_markup.group(0), "sidebar toggle must not use the old hamburger icon"
    assert '.sidebarCollapsed .navList {' in css_bundle, "missing collapsed sidebar navigation rule"
    collapsed_nav_rule = re.search(r"\.sidebarCollapsed \.navList\s*\{([^}]*)\}", css_bundle, re.S)
    assert collapsed_nav_rule and "overflow-x: hidden" in collapsed_nav_rule.group(1), "collapsed sidebar must suppress horizontal overflow"
    assert collapsed_nav_rule and "scrollbar-width: none" in collapsed_nav_rule.group(1), "collapsed sidebar must hide the visible scrollbar"
    active_swatch_rule = re.search(r"\.settingsColorSwatch\.active\s*\{([^}]*)\}", css_bundle, re.S)
    assert active_swatch_rule, "missing selected color-swatch state"
    assert "box-shadow" not in active_swatch_rule.group(1), "selected color swatch must not use layered rings"

    print("[OK] Professional Studio visual-system smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
