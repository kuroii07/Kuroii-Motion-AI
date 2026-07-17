# Desktop Command Center Diagnostics Recovery UX v0.4.4

## Scope

v0.4.4 turns the v0.4.3 diagnostics state into an actionable recovery layer. It remains local/mock only and does not test or mutate real AE/PR host projects.

## Added

- Added `commandCenterDiagnosticsRecoveryUx` as the diagnostics recovery contract.
- Added diagnostic recovery actions: `retry-refresh`, `use-mock-mode`, `reset-filters`, and `view-latest-error`.
- Added `resolveDiagnosticRecoveryActions()` so each non-OK diagnostic item carries recovery actions in the view model.
- Added runtime `recoverDiagnostic()` for Desktop shells that need one entry point for diagnostics recovery.
- Added compact diagnostic action buttons in the prototype with stable `data-diagnostic-action` markers.
- Added focus behavior for diagnostic recovery: refresh/Mock state, filter reset, and latest error detail jump.
- Added zh-CN/en-US recovery labels for reset filters and latest error detail.
- Added `tests/smoke_desktop_diagnostics_recovery_ux.py`.

## UX Notes

- Desktop Command Center diagnostics remain L1 brand usage: status-oriented, compact, and professional.
- Diagnostic actions are read-only recovery helpers. They do not perform host mutations.
- `view-latest-error` only opens an existing failed command record. It does not retry or change the host project.
- `reset-filters` only changes local result-history filters so hidden failures can be inspected.

## Validation

```powershell
python tests/smoke_desktop_diagnostics_recovery_ux.py
python tests/validate_v3_structure.py
```

## Not In This Slice

- No AE/PR host testing.
- No real host mutation actions.
- No final visual polish pass.