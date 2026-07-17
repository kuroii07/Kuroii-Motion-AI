# Desktop Command Center Manual Host Smoke Runbook v0.5.0

## Scope

v0.5.0 generates a copyable and exportable manual host smoke runbook inside the Desktop Command Center prototype. The runbook is assembled from the host readiness gate, host smoke handoff checklist, mock host smoke rehearsal, rehearsal result panel, allowed read-only actions, rollback notes, and the current target lock.

This slice does not start After Effects or Premiere Pro, does not automate host launch, and does not mutate real host projects.

## Contract

- Shared contract: `commandCenterManualHostSmokeRunbook`
- Source contracts:
  - `commandCenterHostReadinessGate`
  - `commandCenterHostSmokeHandoffChecklist`
  - `commandCenterMockHostSmokeRehearsal`
  - `commandCenterRehearsalResultPanel`
- Display mode: `copy-export-read-only-runbook`
- Output formats: `markdown`, `json`
- Runtime smoke metadata: `commandCenterManualHostSmokeRunbookSmoke`
- Runtime snapshot keys: `manualHostSmokeRunbookContract`, `manualHostSmokeRunbook`
- Runtime preview method: `previewManualHostSmokeRunbook()`
- Prototype panel: `#manualHostSmokeRunbookPanel`
- Test: `tests/smoke_desktop_manual_host_smoke_runbook.py`

## Visible Runbook Sections

The runbook contains:

- Safety summary, including the explicit "No automatic AE/PR launch." statement.
- Target lock status and selected host matching.
- Readiness summary with blockers and warnings.
- Rehearsal summary with blocked checks and failure reason.
- Allowlisted risk-0 read-only actions.
- Manual steps from the handoff checklist.
- Rollback notes.
- Export metadata through Markdown and JSON output.

## UI Behavior

- The panel is read-only and generated from local mock/prototype state.
- The Markdown preview uses `#runbookPreview` and `data-runbook-preview`.
- The copy button uses `data-runbook-copy`.
- The export buttons use `data-runbook-export="markdown"` and `data-runbook-export="json"`.
- zh-CN and en-US strings are present in both the static prototype dictionary and package i18n files.
- Copy failure falls back by focusing the preview text so the user can manually select it.
- Brand usage is L0/L1 only: concise status labels and neutral action buttons. No mascot or decorative illustration is used in this high-risk pre-host-smoke area.

## Safety Rules

- `automaticHostLaunchAllowed: false`
- `readOnlyOnly: true`
- `hostMutationAllowed: false`
- Output is a local Markdown / JSON draft only.

The UI must not contain a button that launches AE/PR or runs a real host command from this panel.

## Validation

```powershell
python tests/smoke_desktop_manual_host_smoke_runbook.py
python tests/smoke_desktop_rehearsal_result_panel.py
python tests/smoke_desktop_mock_host_smoke_rehearsal.py
python tests/smoke_desktop_ui_prototype.py
python tests/validate_v3_structure.py
```

## Next

v0.5.1 should add Runbook Export Feedback and State Persistence: copy/export success and failure feedback, last generated runbook state, and lightweight persisted UI state. It should still avoid launching AE/PR.
