# Kuroii Motion AI Suite

Development roadmap: [`docs/DEVELOPMENT_ROADMAP.md`](docs/DEVELOPMENT_ROADMAP.md).

Latest execution plan: [`docs/NEXT_STEPS_v3.md`](docs/NEXT_STEPS_v3.md).

Kuroii Motion AI Suite 是面向 After Effects 与 Premiere Pro 的 AI 创作、控制与自动化工作台。v3.0 从旧 CEP 单面板路线重建为 Desktop + Local Service + AE/PR Host Agent + Shared Packages 的 monorepo。

内容生成现已将文案、图片、视频、音乐和配音拆为不同工作台。音乐与配音在未配置真实 Provider 时可生成并保存本地创作计划（提示词、蓝图、脚本分段与交付参数），但不会虚构音频、试听或下载文件；真实音频任务会在绑定对应模型后接入。

## 当前阶段

当前版本：`0.5.9-alpha.0`

2026-07-14 已开始实施 Kuroii Professional Studio 视觉重构第一阶段：Desktop 原型新增分层 Design Token / Base / Components / Shell / Home 样式入口，首页已按选定 Command Workspace 视觉稿补齐 Motion Command、活动/工作流/快捷入口图标、五列宿主摘要、健康分数、Pro 区与桌面常驻命令栏。侧栏改为分组导航，窄屏使用抽屉；主题支持 Dark、Light、Follow System 并通过 `kuroii.motionai.themeMode.v1` 持久化。首页阶段设计 QA 为 `94/100`。

Provider Hub 已完成响应式主从流程：桌面保留配置列表与详情双栏；`<=840px` 默认只显示配置列表，选择后进入独立详情，可返回列表且不丢失未保存草稿。连接页的保存与测试操作在窄屏详情底部 Sticky 显示，API Key DPAPI、复制/粘贴/删除、模型刷新和多能力绑定协议保持不变。每个平台会展示模型发现与任务协议要求；`future-*` 仅作为不可配置路线占位项，不能填写 Key 或误绑定模型。

图片生成工作区已改为桌面参数栏 + 预览画布 + Inspector 三栏。右侧 History 与 Diagnostics 使用单一 Tab，不再同时挤占空间；请求失败和空 Prompt 会自动切到 Diagnostics。`<=840px` 按预览、Prompt、快捷提示、折叠生成设置、生成按钮、Inspector 的顺序排列，模式切换头部固定在 Topbar 下方，避免移动端控件被遮挡。

模型平台已升级为 Provider Hub V2：支持同一 Provider 类型创建多条可命名配置，使用固定高度主从布局管理连接、模型和能力绑定；API Key 按 `profileId` 通过 Windows DPAPI 独立加密保存，真实刷新或测试失败不再回退成 Mock 成功。

2026-07-22 已新增 MiniMax 原生 Provider：它使用内置的官方模型目录而非错误调用通用 `/models`。`image-01` 与 `image-01-live` 已接入 MiniMax `/v1/image_generation`；音乐 `/v1/music_generation`、配音 `/v1/t2a_v2` 和视频提交/轮询/文件查询链路也已接入，只有实际生成并落盘的产物才会显示为可用。

2026-07-22 已继续接通 MiniMax 音乐与配音：`music-3.0`/`music-2.6` 使用 `/v1/music_generation`，`speech-2.8-*` 等语音模型使用 `/v1/t2a_v2`。服务会请求十六进制音频、落盘到 `apps/local-service/data/generated-audio/` 并保存无密钥的历史记录；内容生成页在收到真实音频后才显示试听与下载。

2026-07-23 已接通 MiniMax 文生视频异步链路：`/v1/video_generation` 只提交任务，随后轮询 `/v1/query/video_generation`；只有任务成功、查询到文件并下载落盘至 `apps/local-service/data/generated-videos/` 后才显示为完成。视频历史保存任务 ID、文件元数据和无密钥诊断；Hailuo 2.3 / 02 的页面参数限定为实际支持的 6/10 秒、768p/1080p，其他已登记的 MiniMax T2V 模型仅显示其 6 秒、720p 选项。尚未使用真实 Key 做端到端成片验收。

内容生成页现已支持“文案 / 图片”双模式。图片模式通过 Provider Hub 的 `image` 能力绑定调用 OpenAI Compatible `/images/generations`，支持尺寸、质量、背景设置、图片预览和不包含密钥的请求诊断。成功结果会自动保存到 `apps/local-service/data/generated-images/`，并可在最近生成历史中查看、下载或恢复提示词与参数再次使用。2026-07-14 已使用 `gpt-image-2` 完成真实 PNG 生成验证。

图片、音乐、配音和视频的本地记录已汇入资源库，可按类型筛选、预览、下载或删除；从资源库可恢复到对应创作页继续编辑，但不会自动再次发起可能计费的生成请求。

Desktop 原型已增加 Kuroii 原生控件皮肤：深浅色主题分别控制滚动条、输入、复选/单选和滑块；单选下拉使用保留原始 `select` 值与事件的自绘浮层，避免回退到 Windows 原生菜单外观。

当前阶段：v0.5.9 已完成 Pre-host Visual Evidence Review Lock。Desktop 原型新增本地视觉证据复核锁定状态，只有证据就绪、无阻断项并填写复核人时才能锁定；仍不启动或修改真实 AE/PR 宿主工程。

上一阶段 v0.5.4 已完成 Desktop Command Center Manual Host Smoke Session Draft，继续作为后续真实宿主 smoke 前的安全记录草案。v0.5.3 的 Review Checklist、v0.5.2 的 Evidence Pack 与 v0.5.0 的 Runbook 仍保留在门禁链路中。

历史链路：v0.4.9 Desktop Rehearsal Result Panel、v0.5.0 Manual Host Smoke Runbook Export、v0.5.2 Manual Host Smoke Evidence Pack、v0.5.3 Manual Host Smoke Review Checklist、v0.5.4 Manual Host Smoke Session Draft、v0.5.5 Visual Preview Pass、v0.5.6 Visual Review Matrix、v0.5.7 Manual Visual Sign-off State and Findings Backlog、v0.5.8 Pre-host Visual Evidence Export 均继续保留，并为 v0.5.9 Review Lock 提供安全上下文。

## 专业模式

专业模式已重新定位为 AE / PR 高级创作、控制与自动化工作台，而不是单独的检测页面。默认工作区包含可信动作、工作流、脚本和表达式四种模式，并共享宿主上下文、参数检查、Dry Run、执行控制台与历史记录。

脚本和表达式页面使用本地打包的 CodeMirror 6 编辑器，支持 ExtendScript / JSX 与 AE Expression 语法着色、行号、当前行、括号匹配、缩进、撤销重做和深浅主题。编辑器 bundle 通过以下命令生成：

```powershell
npm run build:code-editor
```

诊断、宿主预检、错误恢复、Smoke、Runbook 与证据工具保留在专业模式右侧的“诊断与安全”抽屉中，并分为“状态诊断”和“验证档案”两个视图。

## 架构

```text
apps/desktop                 Desktop 中控壳
apps/local-service           本地服务与 Command Bus 入口
extensions/after-effects     AE Host Agent / CEP 壳
extensions/premiere-pro      PR Host Agent / CEP 壳
packages/ui-system           Theme / Token / Sidebar / Tooltip 基础
packages/i18n                zh-CN / en-US / ja-JP / ko-KR 字典结构
packages/provider-hub        Provider Manifest / Adapter / 错误恢复建议
packages/command-bus         Command Envelope / Result Envelope
packages/action-schema       Action Schema / 风险等级
packages/capability-registry AE / PR 能力注册表
packages/host-adapters       Host 状态与 AE/PR Adapter 契约
packages/security            BYOK / 权限 / 脱敏 / 风险策略
packages/workflow            线性工作流契约
tests                        结构校验与人工验收清单
```

## 保留内容

- `docs/Kuroii_Motion_AI_Suite_Documentation_v3.0/`
- `视觉UI参考/`
- `.agents/`、`.gitignore`、`.editorconfig`

## 启动 Local Service

```powershell
python apps/local-service/src/server.py --port 17631 --token dev-local-token
```

服务地址：`http://127.0.0.1:17631`。除 `/health` 外，请求需要带请求头：`X-Kuroii-Session: dev-local-token`。

## Desktop 原型

可直接打开：`apps/desktop/prototype/index.html`。

## 校验

```powershell
python tests/smoke_local_service.py
python tests/smoke_provider_hub.py
python tests/smoke_provider_hub_v2.py
python tests/smoke_provider_api_key_save_button.py
python tests/smoke_openai_compatible_adapter.py
python tests/smoke_host_connection.py
python tests/smoke_action_execution.py
python tests/smoke_desktop_command_center.py
python tests/smoke_desktop_ui_prototype.py
python tests/smoke_desktop_runtime_wiring.py
python tests/smoke_desktop_runtime_service.py
python tests/smoke_desktop_detail_filter_state.py
python tests/smoke_desktop_prototype_detail_ui.py
python tests/smoke_desktop_interaction_polish.py
python tests/smoke_professional_studio_visual_system.py
python tests/smoke_professional_mode_workbench.py
python tests/smoke_desktop_runtime_prototype_alignment.py
python tests/smoke_desktop_diagnostics_state.py
python tests/smoke_desktop_diagnostics_recovery_ux.py
python tests/smoke_desktop_host_readiness_gate.py
python tests/smoke_desktop_readiness_drilldown.py
python tests/smoke_desktop_host_smoke_handoff.py
python tests/smoke_desktop_mock_host_smoke_rehearsal.py
python tests/smoke_desktop_rehearsal_result_panel.py
python tests/smoke_desktop_manual_host_smoke_runbook.py
python tests/smoke_desktop_runbook_export_feedback_state.py
python tests/smoke_desktop_manual_host_smoke_evidence_pack.py
python tests/smoke_desktop_manual_host_smoke_review_checklist.py
python tests/smoke_desktop_manual_host_smoke_session_draft.py
python tests/smoke_desktop_ae_pr_visual_preview.py
python tests/smoke_desktop_visual_review_matrix.py
python tests/smoke_desktop_visual_signoff_state.py
python tests/smoke_desktop_visual_evidence_export.py
python tests/validate_v3_structure.py
```

如果本机安装了 npm，也可以运行：

```powershell
npm run test
```
