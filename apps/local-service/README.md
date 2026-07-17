# Kuroii Local Service

Local Service 负责 Desktop 与 AE/PR Host Agent 之间的 localhost HTTP/WebSocket 通信、Command Bus、Provider 调用代理、任务队列和安全边界。

## v0.3.4 Action Execution First Slice

当前已实现 Python 标准库 HTTP 服务，并接入 Provider Hub、Host Connection mock 与只读 Trusted Actions mock。AE/PR Host Agent 可以注册、心跳、刷新状态、查询能力与查询上下文；Command Bus 会检查目标 Host、按 Capability Registry 风险等级执行只读 mock 动作，并记录 Result History。

### 启动

```powershell
python apps/local-service/src/server.py --port 17631 --token dev-local-token
```

### 端点

| Method | Path | Token | 说明 |
|---|---|---|---|
| GET | `/health` | 否 | 服务健康、版本、路由、运行模式 |
| GET | `/providers` | 是 | 读取 `packages/provider-hub/manifests/*.json` |
| GET | `/provider-errors` | 是 | 返回 Provider 错误恢复建议 |
| GET | `/provider-profile` | 是 | 返回 V2 命名配置、当前配置、兼容投影和能力绑定 |
| POST | `/provider-profiles` | 是 | 创建一条带稳定 `profileId` 的命名配置 |
| POST | `/provider-profiles/{profileId}/profile` | 是 | 更新配置名称、Provider 类型和连接字段 |
| POST | `/provider-profiles/{profileId}/select` | 是 | 选中当前配置实例 |
| POST | `/provider-profiles/{profileId}/secret` | 是 | 按配置实例使用 Windows DPAPI 加密保存 API Key |
| POST | `/provider-profiles/{profileId}/models` | 是 | 使用选中配置刷新真实模型并持久化列表 |
| POST | `/provider-profiles/{profileId}/test` | 是 | 使用选中配置执行连接测试并返回真实结果 |
| POST | `/provider-profiles/{profileId}/image` | 是 | 使用指定配置调用真实图片生成接口 |
| DELETE | `/provider-profiles/{profileId}` | 是 | 删除配置、实例级加密 Key 与引用它的能力绑定；最后一条配置不可删除 |
| GET | `/providers/{providerId}/config` | 是 | 返回 Provider 配置表单契约 |
| POST | `/providers/{providerId}/models` | 是 | 根据配置返回 mock 模型列表 |
| POST | `/providers/{providerId}/test` | 是 | 模拟四级连接测试并返回 UI 建议 |
| POST | `/providers/{providerId}/secret` | 是 | 将当前 Provider API Key 加密保存到 Windows DPAPI 密钥库，只返回配置状态 |
| POST | `/providers/{providerId}/generate` | 是 | 直接调用 Provider 文本生成接口 |
| POST | `/providers/{providerId}/image` | 是 | 直接调用 Provider 图片生成接口 |
| POST | `/ai/text/generate` | 是 | 使用文本能力默认绑定生成文本 |
| POST | `/ai/image/generate` | 是 | 使用图片能力默认绑定生成图片，并返回非敏感诊断信息 |
| GET | `/ai/image/history?limit=24` | 是 | 返回最近图片生成元数据，不返回图片 Base64 或 API Key |
| GET | `/ai/image/history/{imageId}` | 是 | 返回单条历史详情及可显示的本地图片 data URL |
| DELETE | `/ai/image/history/{imageId}` | 是 | 删除单条图片历史索引与受管理的本地图片文件 |
| DELETE | `/ai/image/history` | 是 | 使用 `ids` 批量删除，或传入 `cleanupMissing: true` 清理已丢失本地文件的索引 |
| GET | `/hosts` | 是 | 返回 AE / PR Host 状态与能力数量 |
| GET | `/hosts/{host}` | 是 | 返回单个 Host 详情 |
| POST | `/hosts/{host}/register` | 是 | 注册 Host Agent 并设置 Connected |
| POST | `/hosts/{host}/heartbeat` | 是 | 刷新 Host 心跳和上下文 |
| POST | `/hosts/{host}/status` | 是 | 刷新 Host 状态 |
| GET | `/hosts/{host}/capabilities` | 是 | 返回 Host Capability Registry |
| GET | `/hosts/{host}/context` | 是 | 返回 Host Context 快照 |
| GET / POST | `/host-target` | 是 | 读取或设置 Active/Target/Pinned Host 与 Host Lock |
| GET | `/actions/trusted` | 是 | 返回风险 0 只读 Trusted Actions |
| POST | `/commands` | 是 | 校验并执行只读 Trusted Action mock，返回 Result Envelope |
| GET | `/commands` | 是 | 查询 Command Result History |
| GET | `/commands/{commandId}` | 是 | 查询单条 Command 日志详情 |

### 安全边界

- 默认只绑定 `127.0.0.1`。
- 除 `/health` 外要求 `X-Kuroii-Session` 或 `Authorization: Bearer <token>`。
- 默认 Payload 上限 1 MB。
- 拒绝非 localhost Origin。
- 请求日志和 Command History 会脱敏 `apiKey`、`token`、`Authorization` 等字段。
- v0.3.4 只执行风险 0 只读动作；未确认的非只读动作返回 `ACTION_OUT_OF_SCOPE`。

### 当前限制

- 只做 mock 执行，不修改 AE/PR 工程。
- OpenAI、DeepSeek 与 OpenAI Compatible 已支持真实模型发现和文本生成；OpenAI 与 OpenAI Compatible 已支持同步图片生成。
- OpenAI Compatible 默认请求超时为 60 秒；可分别配置模型列表、文本生成和图片生成路径。
- 图片生成当前支持单图同步返回，接受 Provider 返回的 `b64_json` 或远程 `url`。Base64 图片会原子写入 `apps/local-service/data/generated-images/`，历史索引写入 `apps/local-service/data/image-history.json`，默认最多保留 200 条且不记录 API Key。
- 图片历史已支持列表、单条详情、下载、恢复参数再次使用、单条/批量删除、失效文件索引清理与本地存储占用摘要；编辑、跨页面检索和异步任务尚未接入。
- WebSocket、队列持久化、重放保护、真实 CEP 通信和取消任务将在后续阶段实现。
