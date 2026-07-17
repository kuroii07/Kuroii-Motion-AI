# Kuroii Motion AI Suite 产品总规划 v3.0

## 1. 产品定位

Kuroii Motion AI Suite 是面向 After Effects 与 Premiere Pro 的 AI 创作、控制与自动化工作台。它既提供文案、翻译、分镜、字幕、动效、表达式、脚本、素材和项目管理等专业 AI 工具，也能理解当前 AE/PR 工程上下文，通过经过验证的动作与工作流，在用户确认后直接执行操作。

产品不局限于 AI 视频和广告视频，覆盖动态设计、MG 动画、品牌包装、宣传片、游戏 PV、电商、社媒、影视后期、多语言、多尺寸、模板生产与批量版本。

## 2. 产品组成

```text
Kuroii Motion AI Suite
├─ Kuroii Motion AI Desktop
├─ Kuroii Motion AI for After Effects
├─ Kuroii Motion AI for Premiere Pro
├─ Local Service / Command Bus
├─ Shared Core
├─ AI Provider Hub
└─ Optional Cloud Services
```

```text
Desktop = 大脑、中控、工作流、Provider、任务、素材、诊断、安装更新
AE Extension = AE 上下文读取与执行代理
PR Extension = PR 上下文读取与执行代理
```

## 3. 四层能力体系

### 专业创作层

```text
Copy
Translate
Storyboard
Subtitle
Motion
Expression
Script
Edit
Audio
Assets
Project
```

### AI 控制层

```text
Copilot
Host Context Engine
Intent Parser
Action Planner
Capability Registry
AI Task Router
```

### 自动化执行层

```text
Trusted Action Library
Action Schema
Workflow Builder
Batch Processing
Execution Engine
Cross-Host Orchestrator
Job Center
```

### 基础设施层

```text
Provider Hub
Provider Adapter SDK
Secure Storage
History
Undo / Snapshot
Logs
Diagnostics
Privacy
License
i18n
Theme System
Update
```

## 4. Desktop 信息架构

```text
Home
Copilot
Projects
Jobs
Workflows
Assets
Library

Host Center
- After Effects
- Premiere Pro
- Cross-Host

AI Provider Hub
- Text
- Vision
- Image
- Video
- Voice
- Speech-to-Text
- Music & SFX
- Local
- Task Routing
- Provider Guides

Development
- Actions
- Scripts
- Expressions
- Capability Registry
- Workflow Builder

System
- Extensions
- Account
- License
- Diagnostics
- Updates
- Settings
```

## 5. AE 扩展

```text
Copilot
Tools
Automate
Analyze
Settings
```

Tools：

```text
Copy
Translate
Storyboard
Motion
Expression
Script
Assets
Project
```

## 6. PR 扩展

```text
Copilot
Tools
Automate
Analyze
Settings
```

Tools：

```text
Copy
Translate
Storyboard
Subtitle
Edit
Script
Audio
Assets
Project
```

## 7. Copilot

```text
Ask：只分析
Plan：只生成计划
Act：确认后执行
```

```text
用户命令
→ Host Context
→ Intent Parser
→ Capability Registry
→ Action Planner
→ Safety Validator
→ Preview
→ Confirm
→ Host Agent
→ Execute
→ Verify
→ History / Snapshot / Logs
```

## 8. 兼容与语言

```text
Windows 10 / 11
macOS 12+
Intel / Apple Silicon
AE / PR 2018—2026+
主测试 2022—2026+
zh-CN / en-US
后续 ja-JP / ko-KR
```

要求：语言运行时一键切换、无需重启、设置持久化、缺失文本回退、禁止硬编码文案。

## 9. 主题

```text
Light
Dark
Follow System
```

要求：一键切换、即时生效、可同步或各端独立、设计 Token、全组件主题适配、视觉自检。

## 10. 品牌系统

品牌资产包括 Logo、App Icon、AE/PR Icon、Kuroii Cat、Hero、Empty State、Dialog Illustration、Status Expressions、Motion States、Provider Icons。

Kuroii Cat 状态：

```text
Idle
Listening
Thinking
Generating
Connecting
Executing
Success
Warning
Error
Offline
Waiting
Cancelled
Updating
Completed
```

## 11. 商业与 BYOK

```text
Trial
Personal
Pro
Studio / Team
```

Kuroii 账户控制软件授权，用户 API Key 控制 AI 消耗，第三方模型费用由用户承担。

## 12. 路线图

- Phase 0：架构、Desktop/AE/PR 壳、Local Service、Provider 抽象、Action Schema、UI 基础系统。
- Phase 1：AE/PR 上下文、Trusted Actions、Copy、Translate、Expression、Script、SRT、Marker、Provider Hub。
- Phase 1.5：Copilot、Intent、Action Planner、Safety、History、Snapshot、Task Router。
- Phase 2：Vision、STT、Voice、Image、Workflow Builder、Jobs、Assets。
- Phase 2.5：Video、Cross-Host、多语言、多尺寸、自动回填。
- Phase 3：团队、同步、模板市场、Kuroii Creative Suite 生态。
