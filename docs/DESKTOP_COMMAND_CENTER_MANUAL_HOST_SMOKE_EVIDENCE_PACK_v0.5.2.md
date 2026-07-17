# Desktop Command Center Manual Host Smoke Evidence Pack v0.5.2

## Scope

v0.5.2 adds a local read-only Evidence Pack draft for manual AE/PR host smoke preparation. It collects the current Host Readiness result, target lock, allowed read-only actions, Manual Host Smoke Runbook, latest Runbook export feedback state, and manual reviewer notes.

This slice is still pre-host-smoke. It does not launch AE/PR, does not execute host actions, and does not modify host projects.

## Contract

- Shared contract: `commandCenterManualHostSmokeEvidencePack`
- Builder: `buildManualHostSmokeEvidencePack()`
- Runtime smoke metadata: `commandCenterManualHostSmokeEvidencePackSmoke`
- Runtime snapshot keys: `manualHostSmokeEvidencePackContract`, `manualHostSmokeEvidencePack`
- Runtime preview method: `previewManualHostSmokeEvidencePack()`
- Prototype panel: `#manualHostSmokeEvidencePackPanel`
- Prototype notes storage key: `kuroii.motionai.commandCenter.evidencePackNotes.v1`
- Display mode: `local-read-only-evidence-pack`
- Output formats: `markdown`, `json`

## Evidence Fields

The evidence pack includes:

- `evidencePackId`
- `generatedAt`
- `selectedHost`
- `targetLock`
- `readinessSummary`
- `runbookSummary`
- `runbookExportSummary`
- `allowedActions`
- `manualReviewerNotes`
- `safetySummary`
- `markdown`
- `json`

The `manualReviewerNotes` field is local-only, can be empty, and explicitly does not include API keys, tokens, or private project content.

## UI Markers

- `data-host-smoke-evidence-pack`
- `data-evidence-pack-preview`
- `data-evidence-pack-copy`
- `data-evidence-pack-export`
- `data-evidence-notes`

The prototype exposes a compact panel after the Runbook panel. Users can type manual review notes, copy the Markdown draft, or export Markdown / JSON locally. The panel has no button for launching AE/PR or running host actions.

## Safety Flags

```js
automaticHostLaunchAllowed: false
readOnlyOnly: true
hostMutationAllowed: false
```

## Validation

Added:

```powershell
python tests/smoke_desktop_manual_host_smoke_evidence_pack.py
```

The full Python smoke chain should include this new script before `tests/validate_v3_structure.py`.

## Next Step

v0.5.3 should add a Manual Host Smoke Review Checklist / Sign-off layer on top of the Evidence Pack. It should define which evidence fields must be reviewed before the user manually opens AE/PR for real smoke testing, while still avoiding automatic host launch.
