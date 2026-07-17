# @kuroii/host-adapters

AE / PR Host Adapter 契约。负责 Host Context、Capability Detection、Command 执行和 Result Envelope 回传。

## v0.3.4 Host + Action Execution

- `POST /hosts/{host}/register`：Host Agent 启动后注册。
- `POST /hosts/{host}/heartbeat`：Host Agent 定期刷新状态与上下文。
- `POST /hosts/{host}/status`：刷新 Busy / WaitingForConfirmation / Executing / Error 等状态。
- `GET /hosts/{host}/capabilities`：读取 Capability Registry。
- `GET /hosts/{host}/context`：读取 Host Context 快照。
- `GET / POST /host-target`：读取或设置 Active Host、Target Host、Pinned Host 和 Host Lock。

当前仍为 mock，不执行真实 AE/PR 工程修改。