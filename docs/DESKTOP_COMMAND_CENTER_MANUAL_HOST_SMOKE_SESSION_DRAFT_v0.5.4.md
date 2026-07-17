# Desktop Command Center Manual Host Smoke Session Draft

Version: `0.5.8-alpha.0`

## Scope

v0.5.4 adds a local Manual Host Smoke Session Draft on top of the v0.5.3 Review Checklist. The draft prepares the record structure for a later user-run AE/PR host smoke session.

This slice remains local and read-only:

- It does not launch AE or PR.
- It does not execute real host actions.
- It does not mutate a real AE/PR project.
- It only saves lightweight draft state in browser `localStorage`.

## Contract

The shared contract is `commandCenterManualHostSmokeSessionDraft`.

Key fields:

- `testScript: "tests/smoke_desktop_manual_host_smoke_session_draft.py"`
- `displayMode: "manual-host-smoke-session-draft"`
- `storageKey: "kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1"`
- `automaticHostLaunchAllowed: false`
- `readOnlyOnly: true`
- `hostMutationAllowed: false`

Visible sections:

- `session-summary`
- `target-host`
- `start-conditions`
- `allowed-actions`
- `stop-conditions`
- `result-placeholders`

## Runtime

`apps/desktop/src/command-center-runtime.js` exposes:

- `manualHostSmokeSessionDraftContract`
- `manualHostSmokeSessionDraft`
- `previewManualHostSmokeSessionDraft(overrides)`
- `updateManualHostSmokeSessionDraftState(sessionDraftState)`

The runtime snapshot passes `sessionDraftState` into `buildCommandCenterViewModel()` so Desktop, prototype, and later shell surfaces use the same session draft semantics.

## Draft Semantics

The draft is `ready` only when all start conditions are ready:

- `review-checklist-ready`
- `target-host-selected`
- `allowed-actions-present`
- `manual-launch-only`

The draft includes fixed stop conditions:

- `host-heartbeat-stale`
- `target-lock-mismatch`
- `command-result-failed`
- `mutation-warning-observed`
- `user-cancelled-session`

Result placeholders are intentionally empty in this slice. They prepare for later manual result recording without executing real host actions.

## Prototype UI

The Desktop prototype adds `#manualHostSmokeSessionDraftPanel` after the Review Checklist panel.

Stable UI markers:

- `data-host-smoke-session-draft`
- `data-session-draft-preview`
- `data-session-draft-copy`
- `data-session-draft-export`
- `data-session-draft-save`
- `data-session-draft-reset`

The save control stores only the lightweight local draft state. Copy/export use the generated Markdown or JSON text and do not contact AE/PR.

## Storage

Session draft state is persisted at:

`kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1`

Persisted shape:

```json
{
  "storageKey": "kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1",
  "sessionId": "manual-host-smoke-session-after-effects",
  "selectedHost": "after-effects",
  "status": "blocked",
  "sourceChecklistId": "host-smoke-review-after-effects",
  "sourceEvidencePackId": "host-smoke-evidence-after-effects",
  "savedAt": "local-iso-timestamp"
}
```

The state must not include API keys, provider secrets, private project data, or real host payloads.

## Validation

Primary smoke:

```powershell
python tests/smoke_desktop_manual_host_smoke_session_draft.py
```

Full structure gate:

```powershell
python tests/validate_v3_structure.py
```

No AE/PR host smoke is part of this validation slice.

## Next Step

v0.5.5 should start the Desktop / AE / PR Visual Preview Pass while preserving the existing safety route. It should make the three surfaces reviewable without launching AE/PR or running real host actions.
