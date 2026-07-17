# Desktop Command Center Readiness Drilldown v0.4.6

## Scope

v0.4.6 turns the Host Readiness Gate from a passive checklist into a local drilldown flow. It still does not start AE/PR host testing and does not mutate real host projects.

## Added

- Added `commandCenterReadinessDrilldown` as the shared drilldown contract.
- Added `resolveReadinessDrilldownTarget()` so readiness checks can expose their target panel.
- Added `readinessDrilldownContract` to runtime snapshots and `commandCenterReadinessDrilldownSmoke` runtime metadata.
- Added clickable and keyboard-activatable readiness cards in the Desktop prototype.
- Added stable `data-readiness-drilldown` and `data-readiness-target` markers.
- Added focus targets for `hostStrip`, `actionList`, `historyTable`, and `diagnosticsPanel`.
- Added zh-CN/en-US `commandCenter.readiness.viewRelatedArea` copy.
- Added `tests/smoke_desktop_readiness_drilldown.py`.

## Drilldown Targets

| Readiness check | Target |
| --- | --- |
| `local-service` | `diagnosticsPanel`, with `refreshButton` as a fallback target in the shared contract |
| `host-target` | `hostStrip` |
| `host-heartbeat` | `diagnosticsPanel` |
| `trusted-actions` | `actionList` |
| `command-history` | `historyTable` |
| `diagnostic-recovery` | `diagnosticsPanel` |

## Validation

```powershell
python tests/smoke_desktop_readiness_drilldown.py
python tests/smoke_desktop_host_readiness_gate.py
python tests/validate_v3_structure.py
```

## Next

v0.4.7 should add a Desktop Command Center handoff checklist for the later real AE/PR host smoke phase, including explicit manual steps, expected safe read-only calls, and rollback notes.
