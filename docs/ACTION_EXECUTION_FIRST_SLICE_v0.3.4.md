# Action Execution First Slice v0.3.4

## 完成内容

- 新增 `apps/local-service/src/action_runtime.py`，提供风险 0 只读 Trusted Actions mock。
- 新增 `apps/local-service/src/command_history.py`，提供内存 Command Result History 与日志查询。
- 新增 Local Service 端点：
  - `GET /actions/trusted`
  - `GET /hosts/{host}/context`
  - `GET /commands`
  - `GET /commands/{commandId}`
- `POST /commands` 现在会根据 Capability Registry 风险等级执行策略：
  - `riskLevel = 0`：返回 `TRUSTED_ACTION_EXECUTED`，只读 mock 执行，不修改宿主工程。
  - `riskLevel >= 1` 且 `requiresConfirmation = true`：返回 `WAITING_FOR_CONFIRMATION`。
  - `riskLevel >= 1` 且未请求确认：返回 `ACTION_OUT_OF_SCOPE`。
- Command History 会记录 HTTP 状态、Command Envelope、Result Envelope、Host、Action、风险等级和耗时，并沿用脱敏规则隐藏 API Key / Token。
- 新增 `tests/smoke_action_execution.py`，覆盖 AE/PR context、只读动作、越界写入动作、历史查询和单条日志查询。

## 首批只读动作

After Effects：

```text
ae.context.getProject
ae.context.getActiveComp
ae.context.getSelection
ae.text.readSelectedLayers
ae.expression.scanErrors
ae.project.scanMissingFootage
```

Premiere Pro：

```text
pr.context.getProject
pr.context.getActiveSequence
pr.context.getSelection
pr.marker.read
pr.subtitle.exportSrt
```

## 请求示例

```powershell
$headers = @{ 'X-Kuroii-Session' = 'dev-local-token' }
Invoke-RestMethod http://127.0.0.1:17631/actions/trusted?host=after-effects -Headers $headers
Invoke-RestMethod http://127.0.0.1:17631/hosts/after-effects/context -Headers $headers
Invoke-RestMethod http://127.0.0.1:17631/commands?limit=20 -Headers $headers
```

## 验证

```powershell
python tests/smoke_action_execution.py
python tests/smoke_host_connection.py
python tests/smoke_local_service.py
python tests/smoke_provider_hub.py
python tests/validate_v3_structure.py
```

## 未实现

- 还没有真实 CEP CSInterface 执行链路。
- 还没有真实 AE/PR 工程读取。
- 还没有持久化队列、取消、恢复和幂等重放保护。
- 还没有 Desktop UI 的 Result History 页面。
- 高风险动作仍停留在确认等待 / 越界阻断，不进入真实执行。

## 下一步

进入 `v0.3.5 Desktop Command Center First Slice`：把 Desktop 中控壳接入 Local Service 的 Host Context、Trusted Actions、Command History，并提供不修改工程的只读命令触发入口。
