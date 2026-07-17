# Desktop Command Center Manual Host Smoke Review Checklist

Version: `0.5.8-alpha.0`

## Scope

v0.5.3 adds a local Manual Host Smoke Review Checklist on top of the v0.5.2 Evidence Pack. It turns the evidence pack into explicit human review items before the user manually opens AE/PR for a later real host smoke test.

This slice remains local and read-only:

- It does not launch AE or PR.
- It does not execute real host actions.
- It does not mutate a real AE/PR project.
- It only records lightweight checklist state in browser `localStorage`.

## Contract

The shared contract is `commandCenterManualHostSmokeReviewChecklist`.

Key fields:

- `testScript: "tests/smoke_desktop_manual_host_smoke_review_checklist.py"`
- `displayMode: "manual-host-smoke-review-checklist"`
- `storageKey: "kuroii.motionai.commandCenter.reviewChecklistState.v1"`
- `automaticHostLaunchAllowed: false`
- `readOnlyOnly: true`
- `hostMutationAllowed: false`

Required review items:

- `evidence-pack-generated`
- `project-copy-confirmed`
- `target-lock-reviewed`
- `readiness-blockers-reviewed`
- `runbook-export-reviewed`
- `allowed-actions-reviewed`
- `manual-notes-reviewed`
- `sensitive-data-reviewed`
- `manual-launch-only-confirmed`

## Runtime

`apps/desktop/src/command-center-runtime.js` exposes:

- `manualHostSmokeReviewChecklistContract`
- `manualHostSmokeReviewChecklist`
- `previewManualHostSmokeReviewChecklist(overrides)`
- `updateReviewChecklistState(reviewChecklistState)`

The runtime snapshot passes `reviewChecklistState` into `buildCommandCenterViewModel()` so Desktop, prototype, and later shell surfaces use the same review checklist semantics.

## Status Semantics

Each item has a system condition and a manual checkbox state.

- `blocked`: the underlying condition is not satisfied, so the item is disabled in the prototype.
- `needs-review`: the condition is satisfied, but the user has not checked it.
- `ready`: the condition is satisfied and the user has checked it.

`canProceedToManualHostSmoke` is only `true` when every required item is `ready`.

## Prototype UI

The Desktop prototype adds `#manualHostSmokeReviewChecklistPanel` after the Evidence Pack panel.

Stable UI markers:

- `data-host-smoke-review-checklist`
- `data-review-checklist-item`
- `data-review-checklist-toggle`
- `data-review-checklist-summary`
- `data-review-checklist-reset`

The reset control clears only the local review checklist state. It does not clear Evidence Pack notes, runbook export feedback, result history, or host mock data.

## Storage

Checklist state is persisted at:

`kuroii.motionai.commandCenter.reviewChecklistState.v1`

Persisted shape:

```json
{
  "storageKey": "kuroii.motionai.commandCenter.reviewChecklistState.v1",
  "checkedItems": ["evidence-pack-generated"],
  "lastUpdatedAt": "local-iso-timestamp"
}
```

The state stores only checklist IDs and timestamps. It must not include API keys, provider secrets, private project data, or real host payloads.

## Validation

Primary smoke:

```powershell
python tests/smoke_desktop_manual_host_smoke_review_checklist.py
```

Full structure gate:

```powershell
python tests/validate_v3_structure.py
```

No AE/PR host smoke is part of this validation slice.

## Next Step

v0.5.4 should create a Manual Host Smoke Session Draft from the completed Review Checklist. It should define a local `sessionId`, target host, allowed read-only action list, start conditions, stop conditions, and result placeholders while still avoiding automatic AE/PR launch or real host action execution.
