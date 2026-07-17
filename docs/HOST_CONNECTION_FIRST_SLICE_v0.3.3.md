# Host Connection First Slice v0.3.3

## 完成内容

- 新增 `apps/local-service/src/host_runtime.py`，提供内存 Host Registry。
- 新增 Host 端点：
  - `GET /hosts`
  - `GET /hosts/{host}`
  - `POST /hosts/{host}/register`
  - `POST /hosts/{host}/heartbeat`
  - `POST /hosts/{host}/status`
  - `GET /hosts/{host}/capabilities`
  - `GET /host-target`
  - `POST /host-target`
- `/commands` 现在会检查：
  - Host 是否注册 / 在线。
  - Host 是否 Busy / Executing / Updating。
  - Host Lock 是否指向其他宿主。
  - Command `projectId` 是否匹配当前 Host 项目。
  - Capability Registry 是否包含目标 Action。
- AE / PR CEP client mock 提供 `registerHost()` 与 `sendHeartbeat()`。
- AE / PR host JSX 提供 `getHostContext()` 与 `getRegistrationPayload()`。
- 新增 `tests/smoke_host_connection.py`。

## Host 状态

```text
Offline
Connected
Busy
WaitingForConfirmation
Executing
Error
Updating
```

## 请求示例

```powershell
$headers = @{ 'X-Kuroii-Session' = 'dev-local-token' }
$body = @{
  extensionId = 'com.kuroii.motionai.ae'
  projectId = 'mock-ae-project'
  projectName = 'Mock AE Project'
  hostVersion = 'mock-2026'
  agentVersion = '0.3.3-alpha.0'
  connectionMode = 'mock'
  context = @{ activeComp = @{ name = 'Mock Comp' }; selection = @() }
} | ConvertTo-Json -Depth 6
Invoke-RestMethod http://127.0.0.1:17631/hosts/after-effects/register -Method Post -Headers $headers -Body $body -ContentType 'application/json'
```

## 验证

```powershell
python tests/smoke_host_connection.py
python tests/smoke_local_service.py
python tests/smoke_provider_hub.py
python tests/validate_v3_structure.py
```

## 未实现

- 还没有真实 CEP CSInterface 与 Local Service 通信验证。
- 还没有 WebSocket 心跳。
- 还没有队列持久化、取消、恢复和幂等重放保护。
- 高风险确认仍为服务端状态 mock，没有 Desktop UI 确认弹窗。
- 不执行真实 AE/PR 工程修改。

## 下一步

进入 `v0.3.4 Action Execution First Slice`：实现首批只读 Trusted Actions mock，包括 AE/PR context 获取、Capability Registry 查询、Command Result 历史记录和日志查看。
