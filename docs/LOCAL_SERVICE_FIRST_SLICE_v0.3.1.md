# Local Service First Slice v0.3.1

## 完成内容

- 新增 `apps/local-service/src/server.py`，使用 Python 标准库启动 localhost HTTP 服务。
- 新增 `/health`、`/providers`、`/hosts`、`/commands`。
- `/providers` 从 Provider Manifest 目录读取平台配置。
- `/hosts` 返回 AE / PR 模拟连接状态，并读取 Capability Registry 能力数量。
- `/commands` 校验 Command Envelope、检查 Capability Registry，并返回 Result Envelope。
- 加入会话令牌、localhost Origin 检查、1 MB Payload 限制和日志脱敏。
- 新增 `tests/smoke_local_service.py`，自动启动服务并验证核心端点。

## 启动方式

```powershell
python apps/local-service/src/server.py --port 17631 --token dev-local-token
```

## 请求示例

```powershell
Invoke-RestMethod http://127.0.0.1:17631/health
Invoke-RestMethod http://127.0.0.1:17631/providers -Headers @{ 'X-Kuroii-Session' = 'dev-local-token' }
Invoke-RestMethod http://127.0.0.1:17631/hosts -Headers @{ 'X-Kuroii-Session' = 'dev-local-token' }
```

## 验证

```powershell
python tests/smoke_local_service.py
python tests/validate_v3_structure.py
```

## 未实现

- WebSocket 心跳。
- 真实 AE/PR Host Agent 连接。
- 真实 Provider 连接测试和模型刷新。
- 命令队列持久化、取消、重试和恢复。
- 高风险命令的 UI 确认流程。

## 下一步

进入 `v0.3.2 Provider Hub First Slice`：实现配置表单契约、模型刷新端点、Provider 连接测试模拟和错误恢复 UI 建议数据结构。
