# Desktop Command Center Runbook Export Feedback State v0.5.1

## Scope

v0.5.1 adds explicit feedback and lightweight state persistence for the Manual Host Smoke Runbook copy/export flow. It keeps the runbook as a local read-only draft and makes copy/export results visible and recoverable after a prototype refresh.

This slice does not start After Effects or Premiere Pro, does not automate host launch, and does not mutate real host projects.

## Contract

- Shared contract: `commandCenterRunbookExportFeedbackState`
- Source contract: `commandCenterManualHostSmokeRunbook`
- Display mode: `inline-feedback-and-persisted-state`
- Storage key: `kuroii.motionai.commandCenter.runbookExportState.v1`
- Runtime smoke metadata: `commandCenterRunbookExportFeedbackStateSmoke`
- Runtime snapshot keys: `runbookExportFeedbackContract`, `runbookExportFeedbackState`
- Runtime state method: `recordRunbookExportFeedback()`
- Prototype feedback node: `#runbookFeedback`
- Stable markers:
  - `data-runbook-feedback`
  - `data-runbook-persisted-state`
- Test: `tests/smoke_desktop_runbook_export_feedback_state.py`

## Feedback Actions

The feedback state supports:

- `generated`
- `copy-success`
- `copy-failed`
- `export-markdown-success`
- `export-json-success`
- `export-failed`

Each state records the runbook id, selected host, runbook status, last action, last format, last result, generated time, exported time, and message key.

## UI Behavior

- Copy success shows a success feedback line and stores `copy-success` with `markdown`.
- Copy failure shows a failure feedback line and focuses the preview text so the user can select it manually.
- Markdown export success stores `export-markdown-success` with `markdown`.
- JSON export success stores `export-json-success` with `json`.
- Export failure stores `export-failed`, shows a recoverable message, and keeps the read-only preview visible.
- The feedback row is inline, theme-aware, and does not block the user with a modal.
- Brand usage is L0/L1 only: status dot, concise label, and neutral metadata. No mascot or decorative illustration is used in this high-risk pre-host-smoke area.

## Persisted State

The prototype stores only lightweight UI state:

- `runbookId`
- `selectedHost`
- `runbookStatus`
- `lastAction`
- `lastFormat`
- `lastResult`
- `lastGeneratedAt`
- `lastExportedAt`
- `lastMessageKey`

The persisted state does not include API keys, project payloads, host context payloads, command details, or generated Markdown / JSON content.

## Safety Rules

- `automaticHostLaunchAllowed: false`
- `readOnlyOnly: true`
- `hostMutationAllowed: false`
- Local storage is used only for UI feedback recovery.

The UI must not contain a button that launches AE/PR or runs a real host command from this feedback row.

## Validation

```powershell
python tests/smoke_desktop_runbook_export_feedback_state.py
python tests/smoke_desktop_manual_host_smoke_runbook.py
python tests/smoke_desktop_ui_prototype.py
python tests/validate_v3_structure.py
```

## Next

v0.5.2 should add a Desktop Command Center Manual Host Smoke Evidence Pack: a local read-only evidence draft that collects readiness, target lock, allowed actions, latest Runbook export state, and manual reviewer notes before any real host smoke begins.
