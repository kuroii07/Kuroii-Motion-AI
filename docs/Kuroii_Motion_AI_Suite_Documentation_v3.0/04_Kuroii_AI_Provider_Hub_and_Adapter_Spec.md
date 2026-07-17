# Kuroii AI Provider Hub 与 Adapter 规范 v2.0

## 1. 定位

Provider Hub 同时是模型连接中心、平台接入向导、官方文档入口、模型发现中心、任务绑定中心和健康监控中心。

## 2. 能力分类

```text
Text / LLM
Vision
Image
Video
Voice / TTS
Speech-to-Text
Music
SFX
Local Models
```

## 3. 每个平台必须提供

```text
平台图标
能力标签
协议
认证方式
连接状态
配置状态
Kuroii 中文接入指南
官方控制台
API Key 页面
官方 API 文档
模型列表
价格说明
服务状态
动态配置表单
测试连接
模型发现
任务绑定
兼容性
已知限制
最后验证日期
适配器版本
```

## 4. Provider Manifest

必须描述：

```text
providerId
displayName
categories
protocol
auth
endpoint
modelDiscovery
capabilities
documentation
compatibility
knownIssues
```

## 5. Adapter SDK

必须支持：

```text
validateConfig
testConnection
listModels
execute
cancel
pollTask
download
retry
```

异步平台必须实现 submit / poll / cancel / download。

## 6. 接入向导

```text
选择能力
→ 选择平台
→ 查看 Kuroii 指南
→ 打开官方页面获取 Key
→ 填写配置
→ 四级连接测试
→ 选择模型
→ 绑定任务
```

四级测试：

```text
配置格式
服务可达
身份认证
最小模型调用
```

## 7. 任务路由

```text
Auto
Manual
Policy
```

策略：

```text
质量优先
速度优先
成本优先
本地优先
隐私优先
```

## 8. 模型参数

简洁模式与高级模式并存，支持：

```text
快速草稿
均衡
高质量
低成本
隐私本地
```

## 9. 元数据更新

可远程更新模型列表、文档链接、已知问题、推荐参数和弃用提醒。不得远程注入未经签名的执行代码。

## 10. 首发

```text
OpenAI Compatible
OpenAI
DeepSeek
Custom Base URL
Ollama / LM Studio
```

架构必须从第一天支持多模态，不能写死为 LLM-only。
