# Kuroii Security、Privacy 与 Permissions 规范 v2.0

## 1. 默认原则

```text
最小权限
本地优先
默认不上传工程
默认不上传媒体
API Key 不进扩展长期存储
日志脱敏
明确同意
可撤销
可诊断
```

## 2. 权限

```text
Read-only
Safe Execute
Advanced
Developer
```

## 3. Provider 发送

任务提交前显示发送摘要。隐私模式可限制为本地 Provider。自动切换 Provider 必须受用户策略控制。

## 4. Script

白名单、静态扫描、风险、确认、Undo、Snapshot、文件访问授权。

## 5. 本地服务

localhost、令牌、端口保护、来源校验、速率限制、Payload 限制和安全更新。

## 6. 遥测

默认关闭或明确加入，不收集创作内容。
