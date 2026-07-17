# Professional Mode Workbench Design

Date: 2026-07-15
Status: approved for implementation

## Goal

Reposition Professional Mode as the advanced AE/PR creation, control, and automation workspace. Diagnostics remain available, but they no longer define the page or occupy the primary canvas.

## Product Role

Professional Mode combines:

- Trusted Actions
- Workflow Builder
- Script Editor
- Expression Editor and Library
- Host Context
- Parameters and safety policy
- Dry Run and execution controls
- Result history and logs

The default experience is a working console. Host readiness, diagnostics, Runbook, evidence, and smoke-test tools live in a secondary safety drawer.

## Layout

The desktop layout uses a stable professional-tool frame:

1. A compact mode bar for Trusted Actions, Workflows, Scripts, and Expressions.
2. A left resource rail for items in the selected mode.
3. A central task surface for action configuration, workflow editing, or code editing.
4. A right inspector for host context, parameters, target, risk, and validation.
5. A bottom execution console for Dry Run, Run, output, problems, and history.
6. A diagnostics drawer opened from the mode bar or automatically signaled by a blocking state.

## Code Editing

Script and Expression modes share one editor adapter. The adapter provides:

- JavaScript / ExtendScript and AE Expression syntax colors
- line numbers and active-line treatment
- bracket matching and automatic indentation
- editable content with undo and redo
- find support
- a problems/status surface
- separate light and dark themes

The first implementation must work without a remote runtime dependency. It may use a locally bundled editor library or a local fallback adapter, but the UI contract must remain independent from the editor implementation.

## Safety

- The default target remains the selected AE or PR host.
- Risk-0 read-only actions can run without confirmation.
- Mutating actions remain unavailable until an explicit confirmation flow exists.
- Dry Run is always available in action, workflow, and script modes.
- API keys and provider secrets never enter editor state or renderer persistence.

## Responsive Behavior

- At medium widths, the inspector becomes a toggleable right drawer.
- At narrow widths, the resource rail becomes a selector and the execution console remains reachable below the editor.
- No horizontal page scrolling is allowed.
- Code content may scroll inside the editor surface.

## Visual Direction

- Dense, neutral, and content-first.
- No nested card wall.
- Borders define major panes; minor groups use spacing and separators.
- Cyan is reserved for selection, focus, and the primary execution action.
- Success, warning, and error colors communicate state only.
- Code and diagnostic surfaces use Kuroii brand level L0.

## Acceptance Criteria

- Professional Mode opens to the Trusted Actions workspace, not diagnostics.
- The four primary modes can be switched without leaving the page.
- Script and Expression modes display editable, syntax-colored code.
- Host context and safety state remain visible while working.
- Diagnostics and host-smoke tooling are accessible through a drawer.
- Existing host selection, read-only execution, history, and diagnostic recovery behavior remains callable.
- Dark, light, 1280px desktop, and 840px narrow layouts remain readable.
