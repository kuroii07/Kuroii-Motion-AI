# Kuroii Professional Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 Kuroii Motion AI Desktop 原型重构为已确认的 Professional Studio / Command Workspace，同时保留 Provider、模型绑定、图片生成和现有业务测试能力。

**Architecture:** 保留现有 `index.html` + `prototype.js` 的无构建原型架构，新增职责分离的 CSS 入口，并以 `styles.css` 作为兼容聚合层。先完成 Token、基础组件、App Shell 与首页，再迁移 Provider Hub 和图片工作区；每一阶段均以静态烟测、运行时交互测试和 Playwright 同视口截图作为门禁。

**Tech Stack:** HTML5、CSS Custom Properties、原生 JavaScript、Python smoke tests、Playwright、Local Service HTTP API。

## Global Constraints

- 视觉目标：`output/product-design-audit/visual-system-2026-07-14/11-selected-command-workspace.png`，SHA256 `F4E3BAF01777EB9A36A9C324183A7E569AFDFB38A87C0AD72BB5B2ECA97ECB06`。
- 产品表面是 Desktop 专业创作软件；设计变化度 `5/10`、动效强度 `3/10`、信息密度 `7/10`。
- 中性色约 `85%`，Cyan 约 `10%`，Pink 不超过 `3%`；Pink 不用于普通操作或危险操作。
- 正文以 `13–14px` 为主，工作区不得新增 `9px` 正文；面板圆角不超过 `8px`，控件通常 `6px`。
- 主题必须支持 Dark、Light、Follow System，即时切换并持久化。
- 必须保留 Provider Profile、DPAPI Secret Store、复制/粘贴/删除、多模型能力绑定、图片生成/历史/下载/再次使用。
- API Key 不得进入 renderer 持久化、`localStorage` 或历史 JSON。
- `1440×900` 与 `390×844` 不得出现横向溢出、遮挡或不可达主操作。
- 当前 `.git` 缺少 `.git/HEAD`，不得创建 Commit，也不得修复或重建 Git 元数据。

## Current Execution Status

- Phase 1 已完成：Task 1 静态视觉契约、Task 2 Token/Base/Components、Task 3 App Shell/导航/三态主题、Task 4 Command Workspace 首页。
- Phase 1 验证：`npm.cmd test` 全部通过，`115` 个必需路径通过，桌面深浅色与 390px 截图已保存；经高保真补齐后首页阶段 QA `94/100`。
- Task 5 已完成：Provider Hub 桌面主从布局与 390px 列表→详情流程通过深浅主题截图和草稿保留验证。
- Task 6 已完成：图片工作区 History/Diagnostics Inspector、桌面三栏与 390px 预览优先布局通过深浅主题与错误状态验证。
- 下一阶段：Task 7 旧页面兼容与基础组件迁移，减少 `styles.css` 遗留覆盖。
- 当前没有 Commit：工作区 `.git/HEAD` 缺失。

---

## File Map

- `apps/desktop/prototype/styles.css`：兼容聚合入口，仅保留 `@import` 与旧页面兼容样式。
- `apps/desktop/prototype/styles/tokens.css`：主题、排版、间距、圆角、控件高度、动效 Token。
- `apps/desktop/prototype/styles/base.css`：Reset、文档根、排版、焦点、滚动条、原生表单基线。
- `apps/desktop/prototype/styles/components.css`：Button、Input、Select、Tabs、List、Toast、Tooltip 等基础组件。
- `apps/desktop/prototype/styles/shell.css`：Desktop/Narrow App Shell、侧栏、顶部状态栏、导航抽屉。
- `apps/desktop/prototype/styles/home.css`：Command Workspace 首页布局。
- `apps/desktop/prototype/styles/provider-hub.css`：Provider Hub 主从布局与窄屏列表/详情切换。
- `apps/desktop/prototype/styles/image-workspace.css`：图片参数栏、画布、Inspector 与窄屏预览优先布局。
- `apps/desktop/prototype/styles/responsive.css`：全局 `840px`、`520px` 与 `390px` 响应式收口。
- `apps/desktop/prototype/index.html`：应用壳层和首页静态语义结构。
- `apps/desktop/prototype/prototype.js`：主题模式、导航分组、首页交互、Provider/图片窄屏状态。
- `tests/smoke_professional_studio_visual_system.py`：视觉系统、主题、首页结构和窄屏契约。
- `tests/playwright_professional_studio.py`：运行时主题、导航、桌面/窄屏截图与横向溢出检查。
- `tests/smoke_theme_contrast.py`：读取分文件 CSS 并继续校验对比度。
- `package.json`：接入新增烟测命令。
- `README.md`：记录 Professional Studio 阶段和验证命令。
- `design-qa.md`：同视口视觉对照与阻断问题结论。

---

### Task 1: Visual Contract And Screenshot Gate

**Files:**
- Create: `tests/smoke_professional_studio_visual_system.py`
- Create: `tests/playwright_professional_studio.py`
- Modify: `package.json`

**Interfaces:**
- Consumes: 当前 `index.html`、`prototype.js`、`styles.css`。
- Produces: `load_css_bundle()`、静态契约测试、四视口截图文件。

- [ ] **Step 1: Write the failing static contract**

```python
required_css = {
    "styles/tokens.css",
    "styles/base.css",
    "styles/components.css",
    "styles/shell.css",
    "styles/home.css",
    "styles/provider-hub.css",
    "styles/image-workspace.css",
    "styles/responsive.css",
}
assert required_css <= set(re.findall(r'@import url\("\./([^\"]+)"\)', entry_css))
assert 'data-theme-mode="system"' in index
assert 'id="motionCommandInput"' in index
assert 'class="commandActivityGrid"' in index
assert 'class="commandSummaryBand"' in index
assert 'kuroii.motionai.themeMode.v1' in js
```

- [ ] **Step 2: Run test to verify RED**

Run: `python tests/smoke_professional_studio_visual_system.py`

Expected: FAIL because the split CSS files, system theme mode, and Command Workspace structure do not exist yet.

- [ ] **Step 3: Add Playwright acceptance script**

```python
CASES = [
    ("home-dark-desktop", 1440, 900, "dark", "home"),
    ("home-light-desktop", 1440, 900, "light", "home"),
    ("home-dark-mobile", 390, 844, "dark", "home"),
    ("home-light-mobile", 390, 844, "light", "home"),
]
```

The script must assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, click the theme control, reload, and verify persistence before taking screenshots.

- [ ] **Step 4: Add npm scripts**

Add `test:professional-studio` and include the static smoke test in `npm test` before legacy desktop UI tests.

- [ ] **Step 5: Verify the test remains RED for the intended missing implementation**

Run: `C:\tmp\visionhub-tools\node\npm.cmd run test:professional-studio`

Expected: FAIL at the first missing visual-system assertion, not on Python syntax or missing imports.

### Task 2: Tokens, Base, And Components

**Files:**
- Create: `apps/desktop/prototype/styles/tokens.css`
- Create: `apps/desktop/prototype/styles/base.css`
- Create: `apps/desktop/prototype/styles/components.css`
- Modify: `apps/desktop/prototype/styles.css`
- Modify: `tests/smoke_theme_contrast.py`

**Interfaces:**
- Produces: canonical variables `--color-bg-app`, `--color-surface-1`, `--color-accent`, `--text-body`, `--space-4`, `--radius-sm`, `--control-sm`, `--motion-normal` plus legacy aliases.

- [ ] **Step 1: Extend the failing contract**

```python
for token in (
    "--color-bg-app", "--color-bg-sidebar", "--color-surface-1",
    "--color-surface-2", "--color-surface-3", "--color-accent",
    "--text-body", "--space-4", "--radius-sm", "--control-sm",
):
    assert token in css_bundle
```

- [ ] **Step 2: Run RED**

Run: `python tests/smoke_professional_studio_visual_system.py`

Expected: FAIL with missing canonical Token names.

- [ ] **Step 3: Implement the minimal CSS layers**

`styles.css` begins with the ordered imports, and `tokens.css` defines Dark/Light values from the approved spec. Add legacy aliases such as `--bg: var(--color-bg-app)` so unmigrated pages remain functional.

- [ ] **Step 4: Update contrast test bundle loading**

```python
CSS_FILES = [
    "styles/tokens.css", "styles/base.css", "styles/components.css",
    "styles/shell.css", "styles/home.css", "styles/provider-hub.css",
    "styles/image-workspace.css", "styles/responsive.css", "styles.css",
]
css = "\n".join((PROTOTYPE / path).read_text(encoding="utf-8") for path in CSS_FILES if (PROTOTYPE / path).exists())
```

- [ ] **Step 5: Run GREEN**

Run: `python tests/smoke_professional_studio_visual_system.py && python tests/smoke_theme_contrast.py`

Expected: both PASS.

### Task 3: App Shell, Navigation, And Theme Persistence

**Files:**
- Create: `apps/desktop/prototype/styles/shell.css`
- Modify: `apps/desktop/prototype/index.html`
- Modify: `apps/desktop/prototype/prototype.js`
- Create: `apps/desktop/prototype/styles/responsive.css`

**Interfaces:**
- Produces: `THEME_STORAGE_KEY`, `resolveThemeMode(mode)`, `applyThemeMode(mode)`, `cycleThemeMode()`, grouped navigation markup, and narrow-screen drawer state.

- [ ] **Step 1: Add failing theme/navigation assertions**

```python
assert 'const THEME_STORAGE_KEY = "kuroii.motionai.themeMode.v1"' in js
assert 'window.matchMedia("(prefers-color-scheme: dark)")' in js
assert 'state.themeMode' in js
assert 'data-nav-group=' in js
assert '--sidebar-width: 216px' in css_bundle
assert '@media (max-width: 840px)' in css_bundle
```

- [ ] **Step 2: Run RED**

Run: `python tests/smoke_professional_studio_visual_system.py`

Expected: FAIL on missing persistent theme mode and grouped navigation.

- [ ] **Step 3: Implement theme mode and shell**

Use `localStorage` only for the theme mode string. `system` resolves with `matchMedia`; the resolved `theme-dark`/`theme-light` class is applied to `body` and `#appShell`. Add a listener for system theme changes only while `state.themeMode === "system"`.

- [ ] **Step 4: Implement grouped navigation and narrow drawer**

Navigation groups are `工作区`, `创作工具`, `资源与管理`, `系统`. At `<=840px`, the sidebar becomes an off-canvas drawer controlled by a visible topbar menu button and closes after a destination is selected.

- [ ] **Step 5: Run GREEN**

Run: `python tests/smoke_professional_studio_visual_system.py && python tests/smoke_desktop_ui_prototype.py`

Expected: PASS with all legacy IDs preserved.

### Task 4: Command Workspace Home

**Files:**
- Create: `apps/desktop/prototype/styles/home.css`
- Modify: `apps/desktop/prototype/index.html`
- Modify: `apps/desktop/prototype/prototype.js`

**Interfaces:**
- Produces: `#motionCommandInput`, `#motionCommandSubmit`, `.commandActivityGrid`, `.commandWorkflowList`, `.commandShortcutGrid`, `.commandSummaryBand`.

- [ ] **Step 1: Add failing home structure assertions**

```python
for marker in (
    'id="motionCommandInput"', 'id="motionCommandSubmit"',
    'class="commandActivityGrid"', 'class="commandWorkflowList"',
    'class="commandShortcutGrid"', 'class="commandSummaryBand"',
):
    assert marker in index
for removed in ("layerBoard", "systemDock", "homeDockGroup"):
    assert removed not in index
```

- [ ] **Step 2: Run RED**

Run: `python tests/smoke_professional_studio_visual_system.py`

Expected: FAIL because the old Dock/layer-board home is still present.

- [ ] **Step 3: Implement semantic Command Workspace markup**

Use a real `<textarea>` for the command brief, one Cyan submit button, lightweight quick-command buttons, two list regions for recent activity/workflows, six compact shortcuts, and one bottom summary band. Keep existing provider status IDs so runtime updates continue working.

- [ ] **Step 4: Bind interactions**

Quick-command clicks populate the textarea; submit shows a non-blocking activity message and leaves the host write boundary unchanged. Shortcut buttons reuse the existing navigation state instead of adding routes.

- [ ] **Step 5: Run GREEN**

Run: `python tests/smoke_professional_studio_visual_system.py && python tests/smoke_desktop_command_center.py && python tests/smoke_desktop_ui_prototype.py`

Expected: PASS.

### Task 5: Provider Hub Master-Detail Migration

**Files:**
- Create: `apps/desktop/prototype/styles/provider-hub.css`
- Modify: `apps/desktop/prototype/prototype.js`
- Modify: `tests/smoke_provider_hub_v2.py`

**Interfaces:**
- Produces: `state.providerMobileView`, list/detail navigation controls, underlined tabs, sticky narrow-screen save action.

- [ ] **Step 1: Add failing Provider assertions**

```python
assert 'providerMobileView: "list"' in js
assert 'data-provider-mobile-view="list"' in js
assert 'id="providerBackToProfiles"' in js
assert 'class="providerStickyActions"' in js
```

- [ ] **Step 2: Run RED**

Run: `python tests/smoke_provider_hub_v2.py`

Expected: FAIL because narrow-screen Provider Hub still stacks both panes.

- [ ] **Step 3: Implement desktop and narrow master-detail states**

Desktop remains two columns. Narrow view renders the Profile list by default; selecting a Profile switches to details, and the back control restores the list without resetting drafts.

- [ ] **Step 4: Preserve secret and capability contracts**

Run targeted assertions for `apiKeyDraft`, `apiKeyRef`, `apiKeyStatus`, DPAPI text, profile copy/paste/delete, model refresh, and multiple capability bindings.

- [ ] **Step 5: Run GREEN**

Run: `python tests/smoke_provider_hub.py && python tests/smoke_provider_hub_v2.py && python tests/smoke_provider_api_key_save_button.py && python tests/smoke_openai_compatible_adapter.py`

Expected: all PASS.

### Task 6: Image Workspace Preview-First Migration

**Files:**
- Create: `apps/desktop/prototype/styles/image-workspace.css`
- Modify: `apps/desktop/prototype/prototype.js`
- Modify: `tests/smoke_feature_workspace_diversity.py`

**Interfaces:**
- Produces: `state.imageInspectorTab`, `data-image-inspector-tab`, compact settings disclosure, preview-first narrow order.

- [ ] **Step 1: Add failing image workspace assertions**

```python
assert 'imageInspectorTab: "history"' in js
assert 'data-image-inspector-tab="history"' in js
assert 'class="imageInspectorTabs"' in js
assert 'class="imageGenerationSettingsDisclosure"' in js
```

- [ ] **Step 2: Run RED**

Run: `python tests/smoke_feature_workspace_diversity.py`

Expected: FAIL because history and diagnostics are simultaneously presented and mobile ordering is not preview-first.

- [ ] **Step 3: Implement desktop Inspector tabs and narrow ordering**

Keep history selected by default; switch to diagnostics automatically on failed requests. At `<=840px`, order preview/result first, prompt second, key parameters third, generate action fourth, with advanced settings in a disclosure.

- [ ] **Step 4: Run functional image tests**

Run: `python tests/smoke_desktop_ui_prototype.py && python tests/smoke_feature_workspace_diversity.py && python tests/smoke_local_service.py`

Expected: PASS without changing image API routes or history data.

### Task 7: Legacy Page Compatibility And Component Migration

**Files:**
- Modify: `apps/desktop/prototype/styles.css`
- Modify: `apps/desktop/prototype/styles/components.css`
- Modify: `apps/desktop/prototype/prototype.js`
- Modify: `tests/smoke_desktop_ui_prototype.py`

**Interfaces:**
- Consumes: canonical Tokens and components from Tasks 2–3.
- Produces: legacy alias coverage with no new hard-coded color families.

- [ ] **Step 1: Add failing CSS quality assertions**

```python
assert "9px" not in newly_migrated_css
assert not re.search(r"border-radius:\s*(1[2-9]|[2-9][0-9])px", newly_migrated_css)
assert "linear-gradient" not in newly_migrated_css
```

- [ ] **Step 2: Run RED and inventory violations**

Run: `python tests/smoke_professional_studio_visual_system.py`

Expected: FAIL with exact migrated-file violations only; legacy `styles.css` is reported separately.

- [ ] **Step 3: Migrate shared controls and page chrome**

Map primary/secondary/icon buttons, form controls, tabs, list rows, tooltips, custom dropdowns, scrollbars, date/search inputs, checkboxes, and range controls to canonical Tokens.

- [ ] **Step 4: Run full static smoke suite**

Run: `C:\tmp\visionhub-tools\node\npm.cmd test`

Expected: all required paths PASS.

### Task 8: Visual QA And Accessibility Gate

**Files:**
- Create: `output/professional-studio-2026-07-14/*.png`
- Create: `design-qa.md`

**Interfaces:**
- Consumes: local preview `http://127.0.0.1:8765/index.html` and selected visual reference.
- Produces: desktop/mobile Dark/Light screenshots and final QA result.

- [ ] **Step 1: Start or verify the local servers**

Run: `python -m http.server 8765 --directory apps/desktop/prototype`

Run separately: `python apps/local-service/src/server.py --port 17631`

Expected: both endpoints respond; reuse existing processes when already running.

- [ ] **Step 2: Capture the matrix**

Run: `python tests/playwright_professional_studio.py`

Expected: screenshots for Home, Provider Hub, and Image workspace at `1440×900` and `390×844`, Dark and Light where specified.

- [ ] **Step 3: Compare source and implementation**

Open the selected reference and same-state implementation captures. Record P0/P1/P2/P3 issues in `design-qa.md`; fix every P0/P1/P2 before proceeding.

- [ ] **Step 4: Run accessibility checks**

Verify keyboard focus, Tooltip on icon controls, `prefers-reduced-motion`, theme contrast, no color-only states, and no horizontal overflow.

- [ ] **Step 5: Pass the gate**

`design-qa.md` must end with `final result: passed` and the UI score must be at least `85/100`.

### Task 9: Documentation And Final Regression

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-07-14-kuroii-professional-studio-design.md`
- Modify: `docs/superpowers/plans/2026-07-14-kuroii-professional-studio-implementation.md`

**Interfaces:**
- Produces: current implementation status, commands, screenshot paths, unresolved P3 follow-ups, and next iteration plan.

- [ ] **Step 1: Mark the design spec approved**

Change status from `待用户最终审核` to `已确认，实施中/已完成` matching the actual stage.

- [ ] **Step 2: Update README**

Document the split visual system, Command Workspace, three-mode theme, Provider narrow flow, Image preview-first flow, and verification commands.

- [ ] **Step 3: Run final verification**

Run: `C:\tmp\visionhub-tools\node\npm.cmd test`

Run: `node --check apps/desktop/prototype/prototype.js`

Run: `python tests/playwright_professional_studio.py`

Expected: all automated checks PASS, JS syntax PASS, and screenshot QA PASS.

- [ ] **Step 4: Record completion and next plan**

Check completed plan items, list any P3 polish only, and state the next implementation slice. Do not claim a Commit because this workspace is not a valid Git repository.
