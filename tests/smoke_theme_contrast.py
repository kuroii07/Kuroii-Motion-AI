from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROTOTYPE_PATH = ROOT / "apps/desktop/prototype"
INDEX_PATH = ROOT / "apps/desktop/prototype/index.html"
JS_PATH = ROOT / "apps/desktop/prototype/prototype.js"
CSS_FILES = [
    "styles/tokens.css",
    "styles/base.css",
    "styles/components.css",
    "styles/shell.css",
    "styles/home.css",
    "styles/provider-hub.css",
    "styles/image-workspace.css",
    "styles/responsive.css",
    "styles.css",
]


def css_block(css: str, selector: str) -> str:
    start = css.index(selector)
    brace = css.index("{", start)
    depth = 0
    for index in range(brace, len(css)):
        if css[index] == "{":
            depth += 1
        elif css[index] == "}":
            depth -= 1
            if depth == 0:
                return css[brace + 1 : index]
    raise AssertionError(f"unterminated CSS block: {selector}")


def theme_tokens(css: str, selector: str) -> dict[str, str]:
    block = css_block(css, selector)
    raw = dict(re.findall(r"(--[\w-]+)\s*:\s*([^;]+)\s*;", block))

    def resolve(name: str, seen: set[str] | None = None) -> str | None:
        seen = seen or set()
        if name in seen or name not in raw:
            return None
        value = raw[name].strip()
        if re.fullmatch(r"#[0-9a-fA-F]{6}", value):
            return value
        alias = re.fullmatch(r"var\((--[\w-]+)\)", value)
        return resolve(alias.group(1), seen | {name}) if alias else None

    return {name: value for name in raw if (value := resolve(name)) is not None}


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def luminance(hex_color: str) -> float:
    channels = []
    for channel in rgb(hex_color):
        value = channel / 255
        channels.append(value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def contrast(first: str, second: str) -> float:
    high, low = sorted((luminance(first), luminance(second)), reverse=True)
    return (high + 0.05) / (low + 0.05)


def require_contrast(tokens: dict[str, str], foreground: str, background: str, minimum: float) -> None:
    ratio = contrast(tokens[foreground], tokens[background])
    assert ratio >= minimum, f"{foreground} on {background} contrast {ratio:.2f} < {minimum:.1f}"


def main() -> int:
    css = "\n".join((PROTOTYPE_PATH / path).read_text(encoding="utf-8") for path in CSS_FILES)
    index = INDEX_PATH.read_text(encoding="utf-8")
    js = JS_PATH.read_text(encoding="utf-8")
    required_tokens = {
        "--bg",
        "--surface",
        "--text",
        "--text-2",
        "--muted",
        "--accent",
        "--button-primary-text",
        "--focus-ring",
        "--control-bg",
        "--control-placeholder",
        "--disabled-bg",
        "--disabled-text",
        "--selected-bg",
        "--warning",
        "--error",
        "--success",
        "--work-surface",
        "--work-surface-panel",
        "--work-surface-line",
        "--work-surface-text",
        "--work-surface-muted",
        "--work-surface-accent",
    }

    for selector in (".theme-dark", ".theme-light"):
        tokens = theme_tokens(css, selector)
        missing = sorted(required_tokens - tokens.keys())
        assert not missing, f"{selector} missing theme tokens: {', '.join(missing)}"
        require_contrast(tokens, "--text", "--bg", 7.0)
        require_contrast(tokens, "--text-2", "--surface", 4.5)
        require_contrast(tokens, "--muted", "--surface", 4.5)
        require_contrast(tokens, "--accent", "--surface", 4.5)
        require_contrast(tokens, "--accent", "--surface-2", 4.5)
        require_contrast(tokens, "--accent-2", "--surface-2", 4.5)
        require_contrast(tokens, "--muted", "--selected-bg", 4.5)
        require_contrast(tokens, "--button-primary-text", "--accent", 4.5)
        require_contrast(tokens, "--focus-ring", "--bg", 3.0)
        require_contrast(tokens, "--control-placeholder", "--control-bg", 4.5)
        require_contrast(tokens, "--disabled-text", "--disabled-bg", 3.0)
        require_contrast(tokens, "--warning", "--surface", 4.5)
        require_contrast(tokens, "--error", "--surface", 4.5)
        require_contrast(tokens, "--success", "--surface", 4.5)
        require_contrast(tokens, "--work-surface-text", "--work-surface", 7.0)
        require_contrast(tokens, "--work-surface-muted", "--work-surface", 4.5)
        require_contrast(tokens, "--work-surface-accent", "--work-surface", 4.5)
        assert len({tokens["--warning"], tokens["--error"], tokens["--success"]}) == 3

    for needle in (
        "button,\ninput,\nselect,\ntextarea",
        "input::placeholder",
        "textarea::placeholder",
        "button:disabled",
        "input:disabled",
        "select:disabled",
        "textarea:disabled",
        "option",
        "accent-color: var(--accent)",
        "outline: 2px solid var(--focus-ring)",
        ".providerStateBadge.success",
        ".providerStateBadge.warning",
        ".providerStateBadge.error",
    ):
        assert needle in css, f"missing global theme behavior: {needle}"

    semantic_badges = {
        ".providerStateBadge.success": "var(--success)",
        ".providerStateBadge.warning": "var(--warning)",
        ".providerStateBadge.error": "var(--error)",
    }
    for selector, token in semantic_badges.items():
        assert token in css_block(css, selector), f"{selector} must use {token}"

    professional_surfaces = {
        ".motionCanvas": "var(--work-surface)",
        ".codeEditorSurface": "var(--work-surface)",
        ".automationCanvas": "var(--work-surface)",
        ".workflowNode": "var(--work-surface-panel)",
        ".assetPreviewMedia": "var(--work-surface)",
        ".libraryCodePreview": "var(--work-surface)",
    }
    for selector, token in professional_surfaces.items():
        assert token in css_block(css, selector), f"{selector} must use {token}"

    assert "color: var(--text-2)" in css_block(css, ".timelineTools"), "timeline timecode must follow the active theme"
    assert '<body class="theme-dark">' in index, "theme tokens must be available at the document root"
    assert re.search(r'href="\./styles\.css\?v=[^"]+"', index), "theme stylesheet must be cache-busted"
    assert re.search(r'src="\./prototype\.js\?v=[^"]+"', index), "prototype script must be cache-busted"
    assert "document.body.className = `theme-${state.theme}`" in js, "theme toggle must update the document root"
    app_shell_block = css_block(css, ".appShell")
    assert "color: var(--text)" in app_shell_block or "color: var(--color-text-primary)" in app_shell_block, "app shell must establish inherited text color"

    print("[OK] Theme contrast and semantic state smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
