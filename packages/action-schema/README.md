# @kuroii/action-schema

AI 只生成结构化 Action；Host Adapter 只执行可信动作或经过安全验证的脚本。风险等级 0-5。

## v0.3.4

- 风险 0：允许进入只读 Trusted Actions mock。
- 风险 1-5：等待确认或被当前切片阻断，不修改 AE/PR 工程。
- 运行时以 Capability Registry 的风险等级为准，不盲信客户端传入的 `riskLevel`。