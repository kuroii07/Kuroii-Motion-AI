# Provider Hub First Slice v0.3.2

## 完成内容

- 新增 Provider 配置表单契约：`packages/provider-hub/config-forms/*.json`。
- 新增 Provider schema：配置表单、模型列表、连接测试结果。
- 新增错误恢复建议 JSON：`packages/provider-hub/guidance/provider-error-guidance.json`。
- 新增 mock 模型表：`packages/provider-hub/mock-models/models.json`。
- Local Service 新增 Provider Hub 路由：
  - `GET /provider-errors`
  - `GET /providers/{providerId}/config`
  - `POST /providers/{providerId}/models`
  - `POST /providers/{providerId}/test`
- `models` 和 `test` 会根据 Base URL / API Key / model 返回明确 UI 建议。

## 当前错误体验层

| 错误码 | UI 建议 |
|---|---|
| `AUTH_INVALID_KEY` | 检查 Key / 打开官方控制台 |
| `MODEL_NOT_FOUND` | 刷新模型 / 切换模型 |
| `RATE_LIMITED` | 等待限流 / 切换模型 |
| `BASE_URL_UNREACHABLE` | 检查 Base URL / 检查网络代理 |
| `NETWORK_TIMEOUT` | 检查 Base URL / 重试 |
| `CONFIG_MISSING` | 补全配置 |

## 请求示例

```powershell
$headers = @{ 'X-Kuroii-Session' = 'dev-local-token' }
Invoke-RestMethod http://127.0.0.1:17631/provider-errors -Headers $headers
Invoke-RestMethod http://127.0.0.1:17631/providers/openai/config -Headers $headers
```

刷新模型 mock：

```powershell
$body = @{ config = @{ apiKey = 'sk-valid-test' } } | ConvertTo-Json -Depth 5
Invoke-RestMethod http://127.0.0.1:17631/providers/openai/models -Method Post -Headers $headers -Body $body -ContentType 'application/json'
```

连接测试 mock：

```powershell
$body = @{ config = @{ apiKey = 'sk-valid-test' }; model = 'gpt-4.1' } | ConvertTo-Json -Depth 5
Invoke-RestMethod http://127.0.0.1:17631/providers/openai/test -Method Post -Headers $headers -Body $body -ContentType 'application/json'
```

## 验证

```powershell
python tests/smoke_provider_hub.py
python tests/smoke_local_service.py
python tests/validate_v3_structure.py
```

## 未实现

- 不发起真实 Provider API 请求。
- 不持久化用户 Provider 配置。
- 不保存 API Key。
- 暂无 Desktop UI 表单渲染。
- 暂无任务路由策略绑定。

## 下一步

进入 `v0.3.3 Host Connection First Slice`：实现 AE/PR Host Agent 心跳 mock、Host 注册 / 状态刷新、Command Envelope 与 Host 状态联动。
