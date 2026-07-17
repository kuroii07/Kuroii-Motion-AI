# Desktop Command Center Host Smoke Handoff Checklist v0.4.7

## Scope

v0.4.7 adds a manual handoff checklist for the later real AE/PR host smoke phase. It does not start AE or PR, does not automate host launch, and does not mutate real host projects.

## Contract

- Shared contract: `commandCenterHostSmokeHandoffChecklist`
- Runtime smoke metadata: `commandCenterHostSmokeHandoffSmoke`
- Runtime snapshot key: `hostSmokeHandoffChecklist`
- Test: `tests/smoke_desktop_host_smoke_handoff.py`
- Mode: `manual-handoff-only`
- Safety: `readOnlyOnly: true`, `hostMutationAllowed: false`, `automaticHostLaunchAllowed: false`

## Required Before Host Smoke

1. Start Local Service manually and verify `/health`.
2. Open Desktop Command Center manually.
3. Open AE or PR manually with a disposable or backed-up project copy.
4. Open the AE/PR Host Agent extension manually.
5. Confirm host registration and heartbeat are visible in Desktop.
6. Lock the intended target host.
7. Confirm Host Readiness required checks are ready.
8. Confirm Result History is visible before any read-only action is run.

## Allowed Read-only Actions

| Host | Action | Expected Result |
| --- | --- | --- |
| After Effects | `ae.context.getProject` | `TRUSTED_ACTION_EXECUTED`, `ok=true` |
| After Effects | `ae.context.getActiveComp` | `TRUSTED_ACTION_EXECUTED`, `ok=true` |
| After Effects | `ae.context.getSelection` | `TRUSTED_ACTION_EXECUTED`, `ok=true` |
| After Effects | `ae.text.readSelectedLayers` | `TRUSTED_ACTION_EXECUTED`, `ok=true` |
| Premiere Pro | `pr.context.getProject` | `TRUSTED_ACTION_EXECUTED`, `ok=true` |
| Premiere Pro | `pr.context.getActiveSequence` | `TRUSTED_ACTION_EXECUTED`, `ok=true` |

## Forbidden During Host Smoke

Do not run any action that creates, deletes, writes, sets, saves, renders, exports, imports, or mutates host project state. Any action outside the allowlist blocks the host smoke.

## Failure And Rollback

- If heartbeat becomes stale, stop the smoke and reopen the host extension manually.
- If target lock mismatches the intended host, stop and reset the target lock before retrying.
- If any command returns `ok=false`, inspect Result History and do not continue to additional host actions.
- If any unexpected host mutation is observed, stop Local Service, close the extension panel, and recover from the backed-up project copy.

## Validation

```powershell
python tests/smoke_desktop_host_smoke_handoff.py
python tests/smoke_desktop_readiness_drilldown.py
python tests/validate_v3_structure.py
```

## Next

v0.4.8 should add a local host-smoke rehearsal runner that validates the checklist against mock data only, still without launching AE/PR.