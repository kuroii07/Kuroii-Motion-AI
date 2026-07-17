# Kuroii Host Connection 与 Command Bus 规范 v2.0

## 1. 架构

```text
Desktop
↕ WebSocket / HTTP
Local Service
↕
AE Host Agent
PR Host Agent
```

## 2. 模式

```text
Live Mode
Queue Mode
Project Package Mode
```

## 3. Host 状态

```text
Offline
Connected
Busy
WaitingForConfirmation
Executing
Error
Updating
```

## 4. Command Envelope

必须包含：

```text
commandId
sessionId
host
projectId
action
target
params
riskLevel
requiresConfirmation
createdAt
timeoutMs
```

## 5. Result Envelope

必须包含：

```text
commandId
ok
code
message
data
warnings
durationMs
snapshotId
```

## 6. 目标锁定

Desktop 必须显示：

```text
Active Host
Target Host
Pinned Host
Host Lock
Project
Comp / Sequence
Selection
```

AE/PR 同时在线时不得隐式猜测目标宿主。

## 7. 安全

localhost、会话令牌、Action 白名单、速率限制、Payload 限制、超时、重放保护、版本兼容检查。

## 8. 断线与恢复

自动重连、指数退避、队列持久化、幂等命令、取消、超时、恢复执行状态。宿主重启后不得盲目重放高风险动作。
