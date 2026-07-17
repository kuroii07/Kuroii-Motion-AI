# Desktop Command Center Host Readiness Gate v0.4.5

## Scope

v0.4.5 adds a read-only Host Readiness Gate before any real AE/PR host testing. It remains local/mock-first and does not mutate real host projects.

## Added

- Added `commandCenterHostReadinessGate` as the readiness contract.
- Added `buildHostReadinessGate()` to aggregate Desktop readiness from Local Service, host target, host heartbeat, trusted actions, command history, and diagnostic recovery coverage.
- Added `hostReadinessGate` to `buildCommandCenterViewModel()`.
- Added `commandCenterHostReadinessGateSmoke` and `hostReadinessContract` to runtime snapshots.
- Added a compact prototype Host Readiness panel with stable `data-readiness-id` and `data-readiness-status` markers.
- Added zh-CN/en-US readiness text for blocked, warning, and ready states.
- Added `tests/smoke_desktop_host_readiness_gate.py`.

## Gate Rules

The gate is read-only. It only answers whether the Desktop Command Center has enough observable state to enter real host testing.

- `local-service`: blocked until Local Service is connected.
- `host-target`: blocked until a selected host target is online.
- `host-heartbeat`: blocked until the selected host heartbeat is fresh.
- `trusted-actions`: blocked until at least one risk-0 read-only action is available.
- `command-history`: warning when empty, blocked when the Local Service history endpoint is unavailable.
- `diagnostic-recovery`: blocked if a non-OK diagnostic has no recovery action.

## Validation

```powershell
python tests/smoke_desktop_host_readiness_gate.py
python tests/validate_v3_structure.py
```

## Not In This Slice

- No AE/PR host launch or host testing.
- No real project mutation.
- No provider key or model configuration changes.