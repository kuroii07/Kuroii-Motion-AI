# Kuroii Motion AI Suite — Codex 正式开发 / 升级总指令

请正式开发或升级 Kuroii Motion AI Suite。

## 1. 必读文档

完整阅读 `docs/00` 到 `docs/12` 全部文档。不得只读产品总规划或只读某一个扩展文档。

## 2. 冻结功能

不得删除：

```text
AE：Copy / Translate / Storyboard / Motion / Expression / Script / Assets / Project
PR：Copy / Translate / Storyboard / Subtitle / Edit / Script / Audio / Assets / Project
```

Copilot 是统一入口，不替代专业模块。

## 3. 本轮优先目标

```text
Monorepo
Desktop 壳
Local Service
AE 扩展
PR 扩展
Shared Core
Capability Registry
Action Schema
Execution Engine
Provider Hub 基础
Theme / i18n / Sidebar / Tooltip
Win / Mac 安装
测试与视觉自检
```

## 4. UI 强制要求

```text
Light / Dark / Follow System
zh-CN / en-US 即时切换
预留 ja-JP / ko-KR
Sidebar Expanded / Collapsed
Collapsed 仅显示图标
纯图标必须 Tooltip
主题、语言、侧栏状态持久化
Design Token
禁止硬编码颜色与文案
完整组件状态
响应式断点
高 DPI
键盘 Focus
视觉自检
```

## 5. 品牌强制要求

```text
统一 Logo / Icon 资产入口
Kuroii Cat 使用状态枚举
专业区低频
首页 / 空状态 / 引导允许完整角色
深浅色对应品牌资产
禁止临时绘制替代 Logo
```

## 6. Extension ID

```text
AE: com.kuroii.motionai.ae
PR: com.kuroii.motionai.pr
```

## 7. Provider

首发实现 OpenAI Compatible、OpenAI、DeepSeek、Custom Base URL，预留 Ollama/LM Studio。架构必须多模态。

## 8. 安全

BYOK、Key 安全存储、扩展不长期持有 Key、Trusted Actions 优先、高风险确认、Undo、Snapshot、脱敏日志。

## 9. 兼容

```text
Windows 10 / 11
macOS 12+
Intel / Apple Silicon
AE / PR 2018—2026+
主测试 2022—2026+
```

## 10. 执行顺序

```text
1. 扫描代码库
2. 对照文档输出差距
3. 保护现有有效功能
4. 建立 / 修复架构
5. 建立 Theme 与 i18n
6. 建立 Sidebar / Tooltip
7. 建立 Host Connection
8. 建立 Action / Capability
9. 建立 Provider Hub
10. 实现 AE / PR 首批功能
11. 完成测试
12. 输出开发报告
```

不要停留在纯方案讨论。先简短说明理解，然后直接执行。

## 11. 禁止

```text
禁止删功能
禁止把 Desktop 与扩展做成相同 UI
禁止只适配 Dark
禁止纯图标无 Tooltip
禁止硬编码颜色
禁止硬编码文案
禁止 PR 无检测调用新 API
禁止 QE DOM 作为核心
禁止高风险静默执行
禁止未做视觉自检就标记完成
```
