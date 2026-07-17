# Phase 0 Rebuild Report

## 决策

旧 v0.2.4 CEP 面板实现已清理，项目按 v3.0 重建为 Desktop、Local Service、AE/PR Host Agent 和 Shared Packages 的 monorepo。

## 本阶段完成

- 重建根级 `package.json`、`VERSION`、`README.md`。
- 建立 Desktop 与 Local Service 壳。
- 建立 AE / PR CEP 扩展壳，Extension ID 固定为 `com.kuroii.motionai.ae` 与 `com.kuroii.motionai.pr`。
- 建立 UI Token、主题、多语言、Provider Manifest、Command Envelope、Action Schema、Capability Registry、安全和 Workflow 静态契约。
- 建立结构校验脚本。

## 本阶段不做

- 不做真实 AE/PR 宿主测试。
- 不做真实 Provider API 调用。
- 不做最终 UI 视觉精修。
- 不做安装包、签名、公证和自动更新。

## 下一步

1. 实现 Local Service HTTP/WebSocket 运行体。
2. 实现 Desktop 壳的真实 UI 与设置持久化。
3. 实现 Provider Hub 配置、模型刷新、连接测试和错误恢复 UI。
4. 实现 AE/PR Host Adapter 的上下文读取闭环。
5. 接入首批 Trusted Actions，并开始宿主测试。
