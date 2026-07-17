# Desktop / AE / PR Visual Preview Pass

Version: `0.5.8-alpha.0`

## Scope

v0.5.5 adds a visual preview pass for the three product surfaces: Desktop Command Center, After Effects compact extension panel, and Premiere Pro compact extension panel.

This slice is visual-review only. It does not start AE/PR, execute real host actions, or mutate host projects.

## Contract

- Shared contract: `commandCenterVisualPreviewPass`
- Builder: `buildCommandCenterVisualPreview()`
- Runtime snapshot keys: `visualPreviewContract`, `visualPreview`
- Runtime method: `previewVisualPreviewPass()`
- Prototype panel: `#visualPreviewPanel`
- Stable markers:
  - `data-visual-preview-pass`
  - `data-visual-preview-summary`
  - `data-visual-preview-surface`
  - `data-visual-preview-drawer`
  - `data-visual-overview-toggle`

## Surface Rules

- Desktop uses the Desktop profile and can carry a fuller brand layer while keeping professional work areas mostly L0/L1.
- AE and PR use the Adobe Extension profile, Compact density, and 240px / 320px / 420px visual width checks.
- Feature overview is exposed as a drawer toggle rather than a permanent right-side block.
- Language switching remains an icon button, not a dropdown.
- The preview uses text-safe ASCII surface marks (`D`, `AE`, `PR`) to avoid missing-glyph question marks.

## Safety

```text
automaticHostLaunchAllowed: false
realHostSmokeAllowed: false
readOnlyOnly: true
hostMutationAllowed: false
```

The AE/PR clients keep `registerHost()` and `sendHeartbeat()` as manual functions on `window.__KUROII_EXTENSION__`, but the visual preview does not call them automatically.

## Validation

Run:

```powershell
python tests/smoke_desktop_ae_pr_visual_preview.py
python tests/validate_v3_structure.py
```

Full suite:

```powershell
npm run test
```

If Node is unavailable on this machine, run the Python smoke chain directly from `package.json`.

## Next

v0.5.6 should refine the visual review matrix and screenshot checklist before any real AE/PR host smoke begins.
