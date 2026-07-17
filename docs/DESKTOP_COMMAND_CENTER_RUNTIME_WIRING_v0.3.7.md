# Desktop Command Center Runtime Wiring v0.3.7

## 完成内容

- 新增 `apps/desktop/src/command-center-fixtures.js`，统一 Desktop Command Center mock 数据。
- 新增 `apps/desktop/src/command-center-runtime.js`，提供未来 React / Tauri / WebView 可复用的运行时状态层。
- Runtime 覆盖：
  - `snapshot()`
  - `subscribe(listener)`
  - `setLocale(locale)`
  - `setTheme(theme)`
  - `selectHost(host)`
  - `clearHistory()`
  - `refresh()`
  - `runReadOnlyAction(actionId)`
- Desktop package exports 新增：
  - `./command-center-runtime`
  - `./command-center-fixtures`
- `app-shell.js` 记录 runtime module、fixture module 与 prototype path。
- 静态原型 `prototype.js` 记录 runtime wiring 元信息，保持与 runtime 模块的状态边界一致。

## Runtime 边界

当前仍保持只读 mock：

```text
riskLevel = 0
readOnly = true
mutationPerformed = false
```

没有真实 AE/PR 执行链路，没有写入工程，没有持久化用户配置。

## 设计目的

v0.3.6 的静态 UI 原型已经可直接打开；v0.3.7 把其核心状态流抽到 runtime 层，为下一步正式 UI 页面做准备。

后续 React / Tauri / WebView 页面只需要消费：

```text
createCommandCenterRuntime()
runtime.snapshot().viewModel
runtime.refresh()
runtime.runReadOnlyAction(actionId)
```

## 验证

```powershell
python tests/smoke_desktop_runtime_wiring.py
python tests/smoke_desktop_ui_prototype.py
python tests/smoke_desktop_command_center.py
python tests/validate_v3_structure.py
```

## 未实现

- 还没有正式 React/Tauri 页面。
- 还没有持久化设置与布局。
- 还没有真实 Desktop 窗口。
- 还没有接入真实 AE/PR CSInterface。

## 下一步

进入 `v0.3.8 Desktop Command Center Runtime Smoke With Service`：在不启动真实宿主的前提下，用 Local Service mock 对 runtime 的 `refresh()` 和 `runReadOnlyAction()` 做端到端验证。
