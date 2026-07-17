# @kuroii/command-bus

Command Bus 定义 Desktop、Local Service、AE Host Agent 与 PR Host Agent 的命令和结果信封。

## v0.3.4

- `POST /commands`：返回 Result Envelope。
- `GET /commands`：返回 Command Result History。
- `GET /commands/{commandId}`：返回单条 Command 日志详情。
- History 中保存脱敏后的 Command Envelope 与 Result Envelope。