# Desktop Command Center Detail and Filter State v0.3.9

## 完成内容

- `apps/desktop/src/command-center.js` 新增 Result History 过滤与详情 view model：
  - `commandCenterDefaultHistoryFilters`
  - `normalizeHistoryFilters()`
  - `historyFilterToServiceQuery()`
  - `matchesHistoryFilter()`
  - `buildCommandDetail()`
  - `buildActivityState()`
  - `buildRecoveryState()`
- `apps/desktop/src/command-center-runtime.js` 新增 Desktop 页面可直接消费的状态方法：
  - `setHistoryFilters(partialFilters)`
  - `resetHistoryFilters()`
  - `selectCommand(commandId)`
  - `openCommandDetail(commandId)`
  - `clearCommandDetail()`
  - `clearError()`
  - `recoverFromError(action)`
- Runtime 的 `refresh()` 现在会按 `historyFilterToServiceQuery()` 拉取 Result History。
- Runtime 的 `runReadOnlyAction()` 现在暴露 `pendingOperation`、`runningActionId`、`selectedCommandId` 和 detail 状态。
- 新增中英文 i18n 键，覆盖 activity、recovery、filters 与 detail 空状态。
- 新增 `tests/smoke_desktop_detail_filter_state.py`，验证 Result History 的 host/action/ok 过滤和 command detail 回读。

## 当前 View Model 新字段

```text
activity
recovery
resultFilters
resultSummary
resultRows[].selected
detailPanel
trustedActions[].running
```

这些字段用于后续正式 Desktop 页面或静态原型直接消费，不要求页面自己重新拼接状态。

## 安全边界

当前仍保持只读 mock：

```text
riskLevel = 0
readOnly = true
requiresConfirmation = false
mutationPerformed = false
```

没有真实 CSInterface 调用，没有写入 AE/PR 工程，没有文件系统工程修改。

## 验证

```powershell
python tests/smoke_desktop_detail_filter_state.py
python tests/smoke_desktop_runtime_service.py
python tests/smoke_desktop_runtime_wiring.py
python tests/validate_v3_structure.py
```

## 未实现

- 静态 prototype 还没有把新过滤器和详情面板真正渲染出来。
- 还没有正式 React/Tauri 页面。
- 还没有真实 AE/PR Host Agent 执行链路。
- 还没有持久化 Result History 过滤偏好。

## 下一步

进入 `v0.4.0 Desktop Command Center Prototype Detail UI`：把 v0.3.9 的过滤、详情、运行中和错误恢复状态接到 `apps/desktop/prototype/`，让用户可以在可打开的静态原型里看到这些交互。