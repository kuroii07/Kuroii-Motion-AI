# Professional Mode Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the diagnostic card wall with a professional AE/PR execution workbench and add a shared syntax-colored editor for Script and Expression modes.

**Architecture:** Keep the existing Command Center runtime and DOM ids as the data/behavior source, then add a dedicated Professional Mode presentation layer in the prototype. The new workbench owns mode switching and editor state while the legacy diagnostic, readiness, and host-smoke panels remain mounted inside a secondary drawer so existing contracts continue to work.

**Tech Stack:** Static HTML, CSS design-token layers, vanilla JavaScript, Python structural smoke tests, Playwright visual verification.

## Global Constraints

- Preserve existing provider secret-store behavior; no API key enters renderer persistence or `localStorage`.
- Preserve all current Command Center runtime contracts and stable ids.
- Default to read-only risk-0 execution; mutation controls remain unavailable.
- No decorative gradients, nested card wall, or page-level horizontal scrolling.
- Support dark and light themes and the existing sidebar behavior.
- The local `.git` directory is invalid, so do not commit or repair Git unless explicitly requested.

---

### Task 1: Lock the Professional Mode structure contract

**Files:**
- Modify: `tests/smoke_professional_mode_workbench.py`
- Modify: `package.json`

**Interfaces:**
- Produces structural markers for `professionalWorkbench`, four mode buttons, resource pane, stage, inspector, console, diagnostics drawer, and editor adapter.

- [ ] Write a smoke test that asserts the required markup, behavior functions, CSS panes, and absence of a visible legacy card wall in Professional Mode.
- [ ] Run `python tests/smoke_professional_mode_workbench.py` and confirm it fails because the new workbench is absent.
- [ ] Add the focused test script to `package.json`.

### Task 2: Build the Professional Mode shell and mode routing

**Files:**
- Modify: `apps/desktop/prototype/index.html`
- Modify: `apps/desktop/prototype/prototype.js`
- Create: `apps/desktop/prototype/styles/professional-mode.css`
- Modify: `apps/desktop/prototype/styles.css`

**Interfaces:**
- Consumes: existing `state.selectedHost`, trusted actions, context, history, diagnostics, and render functions.
- Produces: `renderProfessionalWorkbench()`, `bindProfessionalWorkbench()`, `setProfessionalMode(mode)`, and `toggleProfessionalDiagnostics(open)`.

- [ ] Add the semantic four-pane workbench and diagnostics drawer markup.
- [ ] Add state for active professional mode, selected resource, inspector visibility, console tab, and diagnostics drawer.
- [ ] Render Trusted Actions and Workflows from existing host/runtime data.
- [ ] Bind mode switching, resource selection, inspector toggling, Dry Run, and diagnostics drawer controls.
- [ ] Keep legacy diagnostic and smoke panels mounted inside the drawer.
- [ ] Run the focused smoke test until the shell contract passes.

### Task 3: Add the shared syntax-colored editor adapter

**Files:**
- Create: `apps/desktop/prototype/code-editor.js`
- Modify: `apps/desktop/prototype/prototype.js`
- Modify: `apps/desktop/prototype/styles/professional-mode.css`
- Modify: `tests/smoke_professional_mode_workbench.py`

**Interfaces:**
- Produces: `createKuroiiCodeEditor(root, options)` with `getValue()`, `setValue()`, `setLanguage()`, `focus()`, and `destroy()`.
- Consumes: `language: "extendscript" | "expression"`, initial source, theme class, and `onChange(source)`.

- [ ] Extend the failing smoke test with editor API and syntax-token requirements.
- [ ] Implement a local editor adapter with editable source, line numbers, syntax tokenization, active-line state, tab indentation, bracket status, and undo-compatible native input.
- [ ] Use ExtendScript and Expression token vocabularies and separate semantic token colors for both themes.
- [ ] Mount the adapter in Script and Expression Professional Mode stages and reuse it in the existing Script/Expression feature workbenches.
- [ ] Run focused and feature-workspace tests.

### Task 4: Visual integration and regression verification

**Files:**
- Modify: `apps/desktop/prototype/styles/responsive.css`
- Modify: `tests/smoke_theme_contrast.py`
- Modify: `tests/smoke_desktop_ui_prototype.py`
- Modify: `README.md`

**Interfaces:**
- Consumes: the completed workbench and editor contracts.
- Produces: desktop/narrow responsive behavior and documented Professional Mode role.

- [ ] Add medium-width inspector drawer behavior and narrow-width resource selector behavior.
- [ ] Add light/dark editor contrast assertions and no-horizontal-overflow assertions.
- [ ] Update README with the corrected Professional Mode positioning.
- [ ] Run JavaScript syntax checks, focused smoke tests, the full Python smoke chain, and Playwright screenshots in dark/light desktop and narrow states.
- [ ] Restore the preview to expanded dark mode and report screenshot paths plus the next optimization plan.
