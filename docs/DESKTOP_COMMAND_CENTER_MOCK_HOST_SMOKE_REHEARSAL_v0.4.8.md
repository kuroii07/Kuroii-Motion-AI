# Desktop Command Center Mock Host Smoke Rehearsal Runner v0.4.8

## Scope

v0.4.8 adds a mock-only rehearsal runner for the later AE/PR host smoke phase. It validates the handoff checklist against local mock data only. It does not start AE or PR, does not automate host launch, and does not mutate real host projects.

## Contract

- Shared contract: `commandCenterMockHostSmokeRehearsal`
- Builder: `buildMockHostSmokeRehearsal()`
- Runtime smoke metadata: `commandCenterMockHostSmokeRehearsalSmoke`
- Runtime snapshot keys: `mockHostSmokeRehearsalContract`, `mockHostSmokeRehearsal`
- Runtime method: `previewMockHostSmokeRehearsal()`
- Test: `tests/smoke_desktop_mock_host_smoke_rehearsal.py`
- Mode: `mock-only-rehearsal`
- Safety: `usesMockDataOnly: true`, `readOnlyOnly: true`, `hostMutationAllowed: false`, `automaticHostLaunchAllowed: false`

## Rehearsed Checks

| Check | Purpose |
| --- | --- |
| `checklist-loaded` | Confirms v0.4.7 handoff checklist is present. |
| `target-lock-valid` | Confirms the selected host matches the target lock. |
| `selected-host-connected` | Confirms mock host state is not Offline. |
| `required-readiness-ready` | Reuses Host Readiness required checks against mock timing/data. |
| `allowed-actions-present` | Confirms risk-0 read-only allowlist actions exist for the selected host. |
| `forbidden-actions-absent` | Blocks create/delete/write/set/save/render/export/import/mutate style actions. |
| `result-history-captures-read-only-records` | Uses simulated mock result history when no real history exists. |
| `failure-interrupts-run` | Blocks progression when an allowed read-only result has `ok=false`. |

## Mock Result History

When no command history is present, the rehearsal runner creates simulated result records from the allowed read-only actions. These records use `TRUSTED_ACTION_EXECUTED`, `ok=true`, and `rehearsalOnly: true` so they cannot be mistaken for real host execution.

## Failure Scenarios

- `target-lock-mismatch`
- `forbidden-action-requested`
- `command-result-failed`
- `missing-result-history`

## Validation

```powershell
python tests/smoke_desktop_mock_host_smoke_rehearsal.py
python tests/smoke_desktop_host_smoke_handoff.py
python tests/validate_v3_structure.py
```

## Next

v0.4.9 should expose the rehearsal result in the Desktop prototype as a compact read-only panel or drawer, still without launching AE/PR.