# Desktop Command Center Prototype

This static prototype can be opened directly in a browser:

```text
apps/desktop/prototype/index.html
```

It uses local mock data by default and can refresh from `http://127.0.0.1:17631` when the Local Service is running with `dev-local-token`.

Current scope:

- Host Cards
- Host Context
- Read-only Trusted Actions
- Result History
- Result History Filters
- Command Detail panel
- Activity status band
- Recovery panel
- Safety Notice
- Light / Dark theme toggle
- zh-CN / en-US language toggle

Runtime wiring source modules:

- `apps/desktop/src/command-center-runtime.js`
- `apps/desktop/src/command-center-fixtures.js`

Validation:

```powershell
python tests/smoke_desktop_ui_prototype.py
python tests/smoke_desktop_prototype_detail_ui.py
```