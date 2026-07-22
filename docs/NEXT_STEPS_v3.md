# v3.0 下一步路线

## 2026-07-22 通用模型列表接口与多模态接入边界（已完成）

- Provider Hub 将“模型列表接口”移动到 Base URL 下方；OpenAI Compatible 与 Custom Base URL 均可填写返回模型数组的路径（默认 `/models`）。
- Custom Base URL 的刷新改为真实请求该接口，不再返回预置 mock 模型；接口、连接测试与模型列表会保留在独立配置实例中。
- 生成接口（例如 MiniMax 的 `/v1/music_generation`）不能当作模型列表接口使用；没有模型发现 API 的平台必须采用专用 Adapter + 内置模型目录，或手动登记模型。

## 2026-07-22 MiniMax 原生图片 Provider（已完成）

- 新增 MiniMax 专用 Provider Manifest、配置表单与模型目录；API Key 继续只留在本地密钥层。
- MiniMax 的模型刷新来自内置官方目录并明确标注为 `catalog`，不会将 `/v1/image_generation`、`/v1/music_generation` 等生成接口误当成模型列表接口。
- `image-01` 与 `image-01-live` 已走 MiniMax `/v1/image_generation`：完成鉴权错误映射、比例参数转换、URL/Base64 回包解析、图片历史落盘和自动化模拟验证。
- 视频、音乐与配音模型可以登记和绑定，但任务适配器尚未接通；连接测试会明确说明 API Key 在第一次已支持的生成任务中验证，不能伪造“已通过”的联网鉴权结果。

## 2026-07-22 MiniMax 音乐与配音资产链路（已完成）

- 新增 MiniMax 音乐 `/v1/music_generation` 与同步配音 `/v1/t2a_v2` 适配器；请求和回包按各自协议处理，不再复用图片或文本接口。
- 使用非流式 `hex` 回包保存为本地 MP3/WAV/FLAC 资产，避免依赖临时 URL；音频历史只保存模型、绑定、诊断和创作元数据，不保存 API Key。
- 内容生成的音乐方向台、配音脚本台已增加真实生成、试听和下载入口。只有已收到并落盘的真实音频才进入 `completed` 状态；绑定缺失、音色 ID 缺失、鉴权或生成失败都会保留错误信息。
- 当前支持 MiniMax 音乐 `music-3.0`/`music-2.6`（及免费变体）与同步语音模型；语音请求需要实际可用的 MiniMax `voice_id`，界面预填官方示例 ID 但用户可替换。

## 下一步：MiniMax 异步视频与能力状态

1. 实现 MiniMax 视频的提交、轮询、文件查询与下载链路，记录 provider task id、进度、失败原因与可取消状态；不将异步提交误报为成片成功。
2. 在 Provider Hub 中增加能力级别的“已接通 / 可绑定待接通 / 未支持”状态，替代当前仅凭 Provider 整体状态的判断，并将旧的 `future-*` 占位项降级为不可配置提示。
3. 将音频历史扩展到单条重开试听、下载与删除，并在统一资产库中汇总图片、音乐、配音和后续视频。
4. 使用用户自己的 MiniMax Key 逐项做一次真实产物验收：先图片，再音乐/配音，最后视频；每项保留不含密钥的诊断与历史证据。

## 2026-07-21 音频计划资产基础（已完成）

- 内容生成已新增独立的音乐方向台与配音脚本台；两页不复用图片画布语义。
- Local Service 新增受会话令牌保护的 `/ai/audio/drafts` 与 `/ai/audio/history`，用于保存音乐提示词/蓝图和配音分段/参数。
- 记录只保存创作计划元数据，不保存 API Key、不伪造音频文件，并明确标记为 `local-planning` / `planned`。
- Desktop 刷新后可读取这些本地计划记录；真实音乐、试听、WAV/MP3 下载仍保持未接入状态。

## 下一步：真实音频 Provider 接入计划

1. 用户选定音乐与 TTS 平台，并在 Provider Hub 保存各自的模型、能力标签、提交路径和 API Key。
2. 根据供应商实际协议实现音乐/配音任务提交、状态查询、失败恢复与取消；仅展示平台实际支持的字段。
3. 将完成的真实音频文件接入试听、下载、历史恢复与来源/授权元数据，替换当前 `planned` 状态，但绝不把失败显示为成功。
4. 最后把图片、视频、音乐、配音记录汇入统一资产库，补项目关联、筛选、复用参数与导出清单。

## v0.5.9 Provider Image Generation Slice（已完成）

- 已新增 OpenAI / OpenAI Compatible `/images/generations` 图片适配器和 `imagesPath` 配置。
- 已新增 `/ai/image/generate` 能力路由，按 Provider Hub 的图片默认绑定调用真实模型。
- 内容生成页已支持“文案 / 图片”模式切换、图片参数、预览与非敏感请求诊断。
- 已使用 `Paper-GPT Image2 / gpt-image-2` 生成真实 PNG，并验证桌面深浅色与 390px 移动宽度。
- 下一阶段：图片历史与本地图库、生成结果下载命名、参考图编辑和批量队列。

## v0.3.1 Local Service First Slice（已完成）

- 已启动可运行的 localhost HTTP 服务实现。
- 已暴露 `/health`、`/providers`、`/hosts`、`/commands`。
- 已加入会话令牌、Payload 限制、localhost Origin 检查和脱敏日志。
- Desktop 与 AE/PR 当前使用模拟连接。

## v0.3.2 Provider Hub First Slice（已完成）

- 已建立 OpenAI Compatible、OpenAI、DeepSeek、Custom Base URL 表单契约。
- 已根据 Base URL 与 API Key 提供 mock 模型刷新端点。
- 已把 Provider 错误映射成明确 UI 建议：检查 Key、切换模型、等待限流、检查 Base URL。

## v0.3.3 Host Connection First Slice（已完成）

- 已实现 AE/PR Host Agent 注册与心跳 mock。
- 已实现 Host 状态：Offline、Connected、Busy、WaitingForConfirmation、Executing、Error、Updating。
- 已让 Command Envelope 与 Host 状态 / Result Envelope 联动。

## v0.3.4 Action Execution First Slice（已完成）

- 已实现首批只读 Trusted Actions mock。
- 已实现 AE/PR context 获取与 Result History。
- 已实现 Command 日志查询与单条日志详情。
- 已阻断未确认的非只读动作，避免 v0.3.4 提前进入真实工程修改。

## v0.3.5 Desktop Command Center First Slice（已完成）

- Desktop 中控壳已接入 `/hosts`、`/hosts/{host}/context`、`/actions/trusted`、`/commands` 的客户端契约。
- 已提供 Host Context 只读查看、Trusted Action 只读触发和 Result History 的 view model。
- 已新增 `command-center` 导航入口与中英文文案。

## v0.3.6 Desktop Command Center UI Prototype（已完成）

- 已新增可直接打开的 `apps/desktop/prototype/index.html`。
- 已展示 Host Cards、Context、Trusted Actions、Result History 与 Safety Notice。
- 已支持 Light / Dark、zh-CN / en-US、侧边栏展开 / 收起和 Local Service 刷新。

## v0.3.7 Desktop Command Center Runtime Wiring（已完成）

- 已新增 `command-center-runtime.js` 与 `command-center-fixtures.js`。
- 已统一 runtime 的 `snapshot / subscribe / refresh / runReadOnlyAction` 状态流。
- 已将 runtime / fixture 模块加入 Desktop package exports 与 app-shell 壳声明。

## v0.3.8 Desktop Command Center Runtime Smoke With Service（已完成）

- 已新增 `tests/smoke_desktop_runtime_service.py`。
- 已在不启动真实宿主的前提下，用 Local Service mock 验证 runtime 所需的 `refresh()` 与 `runReadOnlyAction()` 服务链路。
- 已把 smoke 脚本加入 Desktop 壳声明、根测试脚本和结构校验。
- 继续保持只读 mock，不进入真实宿主测试。

## v0.3.9 Desktop Command Center Detail and Filter State（已完成）

- 已补 Result History 的 host/action/status/query/limit 过滤契约。
- 已补命令详情、运行中状态、错误恢复状态与 runtime view model 字段。
- 已新增中英文 i18n 文案和 `tests/smoke_desktop_detail_filter_state.py`。
- 继续保持只读 mock，不进入真实宿主测试。

## v0.4.0 Desktop Command Center Prototype Detail UI（已完成）

- 已把 v0.3.9 的过滤、详情、运行中和错误恢复状态接到 `apps/desktop/prototype/`。
- 静态原型已可查看过滤后的历史、命令详情和恢复提示。
- 已新增 `tests/smoke_desktop_prototype_detail_ui.py`。
- 继续保持只读 mock，不进入真实宿主测试。

## v0.4.1 Desktop Command Center Interaction Polish（已完成）

- 已补 Skip Link、焦点顺序、Focus Ring 与 `Escape` / `/` 快捷键。
- 已补 Host、Trusted Actions、Result History 的空状态。
- 已把错误恢复面板扩展为可聚焦区域，并显示明确恢复建议列表。
- 已把命令详情拆成字段摘要与原始载荷，降低专业区阅读负担。
- 已新增 `tests/smoke_desktop_interaction_polish.py`。
- 继续保持只读 mock，不进入真实宿主测试。

## v0.4.2 Desktop Command Center Runtime-Prototype Alignment（已完成）

- 已新增 `commandCenterRuntimePrototypeAlignment` 共享契约。
- 已对齐 runtime 与 prototype 的恢复动作：`retry-refresh`、`clear-error`、`use-mock-mode`。
- 已对齐空状态：`no-hosts`、`no-actions`、`no-history`、`no-filtered-history`。
- 已为原型补 `data-recovery-action`、`data-empty-state` 和 `LOCAL_SERVICE_UNAVAILABLE` 归一化。
- 已新增 `tests/smoke_desktop_runtime_prototype_alignment.py`。
- 继续保持只读 mock，不进入真实宿主测试。

## v0.4.3 Desktop Command Center Diagnostics State First Slice（已完成）

- 已新增 Local Service / Host Heartbeat / Trusted Actions / Last Command Error 诊断状态模型。
- 已覆盖 `LOCAL_SERVICE_UNAVAILABLE`、`HOST_HEARTBEAT_STALE`、`CAPABILITY_MISSING`、`COMMAND_ERROR_PRESENT`。
- 已把诊断状态接入 runtime snapshot 与 prototype 诊断面板。
- 已新增 `tests/smoke_desktop_diagnostics_state.py`。
- 继续保持只读 mock，不进入真实宿主测试。

## v0.4.4 Desktop Command Center Diagnostics Recovery UX（已完成）

- 已将诊断项与恢复动作关联：刷新 Local Service、切换 Mock、重置过滤、查看最近错误详情。
- 已补诊断面板键盘焦点、错误跳转和中英文文案细化。
- 已新增 `tests/smoke_desktop_diagnostics_recovery_ux.py`。
- 继续不进入 AE/PR 宿主测试。

## v0.4.5 Desktop Command Center Host Readiness Gate（已完成）

- 已建立进入真实 AE/PR 宿主测试前的 Host Readiness 检查清单。
- 已将 Local Service、Host Heartbeat、Trusted Actions、Command History 与诊断恢复状态汇总成只读预检结果。
- 已新增 `tests/smoke_desktop_host_readiness_gate.py`。
- 继续默认不修改真实工程；仅为后续宿主测试准备明确门禁。

## v0.4.6 Desktop Command Center Readiness Drilldown（已完成）

- 已给 Host Readiness 每个预检项增加跳转到对应诊断/宿主/动作/历史区域的 drilldown 行为。
- 已补 `commandCenterReadinessDrilldown` 共享契约、runtime snapshot 元信息与 prototype 稳定数据标记。
- 已支持 readiness 卡片鼠标点击与 `Enter` / `Space` 键盘触发，并补中英文细化文案。
- 已新增 `tests/smoke_desktop_readiness_drilldown.py`。
- 继续不进入 AE/PR 宿主测试，先把预检体验打磨完整。

## v0.4.7 Desktop Command Center Host Smoke Handoff Checklist（已完成）

- 已建立真实 AE/PR 宿主 smoke 前的手动交接清单。
- 已明确只读测试动作白名单、预期返回、失败回滚和不允许触发的工程修改动作。
- 已新增 `commandCenterHostSmokeHandoffChecklist` 共享契约、runtime snapshot 元信息和 `tests/smoke_desktop_host_smoke_handoff.py`。
- 已新增 `docs/DESKTOP_COMMAND_CENTER_HOST_SMOKE_HANDOFF_v0.4.7.md`。
- 继续不自动启动 AE/PR 宿主，也不修改真实工程。

## v0.4.8 Desktop Command Center Mock Host Smoke Rehearsal Runner（已完成）

- 已基于 v0.4.7 checklist 做 mock-only rehearsal runner。
- 已新增 `commandCenterMockHostSmokeRehearsal` 共享契约和 `buildMockHostSmokeRehearsal()` 构建器。
- 已使用本地 mock 数据验证只读动作白名单、target lock、result history 和失败中断路径。
- 已新增 runtime snapshot 元信息、`previewMockHostSmokeRehearsal()` 与 `tests/smoke_desktop_mock_host_smoke_rehearsal.py`。
- 仍不启动 AE/PR 宿主，为后续真实宿主 smoke 留出最后一道本地演练门禁。

## v0.4.9 Desktop Command Center Rehearsal Result Panel（已完成）

- 已新增 `commandCenterRehearsalResultPanel` 共享契约和 `buildRehearsalResultPanelState()` 构建器。
- 已将 mock rehearsal 结果接入 Desktop prototype，形成 `#rehearsalResultPanel` 紧凑只读面板。
- 已展示 pass/blocked 检查项、模拟结果历史、失败中断原因和继续到人工 host smoke 的条件。
- 已新增 runtime snapshot 元信息、`previewRehearsalResultPanel()` 与 `tests/smoke_desktop_rehearsal_result_panel.py`。
- 继续不启动 AE/PR 宿主，也不执行真实宿主动作。

## v0.5.0 Desktop Command Center Manual Host Smoke Runbook Export（已完成）

- 已从 Host Readiness Gate、Host Smoke Handoff Checklist、Mock Rehearsal Result 和当前 target lock 生成只读 runbook。
- runbook 已包含允许动作、阻断项、模拟历史摘要、手动步骤、回滚说明和“未自动启动宿主”的安全声明。
- 已支持复制文本或导出本地 JSON / Markdown 草案，先不接真实 AE/PR 执行。
- 已新增 `commandCenterManualHostSmokeRunbook` 共享契约、runtime snapshot 元信息、`previewManualHostSmokeRunbook()`、Desktop prototype Runbook 面板与 `tests/smoke_desktop_manual_host_smoke_runbook.py`。
- 继续不启动 AE/PR 宿主，也不执行真实宿主动作。

## v0.5.1 Desktop Command Center Runbook Export Feedback and State Persistence（已完成）

- 已给 Runbook 复制 / 导出动作补充更明确的成功、失败、只读状态反馈。
- 已记录最近一次 Runbook 生成状态、导出格式、目标宿主和提示状态，刷新原型后可恢复轻量 UI 状态。
- 已将导出反馈与现有诊断 / readiness 状态保持解耦，不引入真实宿主执行。
- 已新增 `commandCenterRunbookExportFeedbackState` 共享契约、runtime snapshot 元信息、`recordRunbookExportFeedback()`、prototype localStorage 持久化与 `tests/smoke_desktop_runbook_export_feedback_state.py`。
- 继续不启动 AE/PR 宿主，为后续人工宿主 smoke 做体验层准备。

## v0.5.2 Desktop Command Center Manual Host Smoke Evidence Pack（已完成）

- 已基于 Host Readiness、target lock、allowed actions、Runbook 和反馈状态生成手动宿主 smoke 前的证据包草案。
- 已加入人工检查备注输入，并使用 `kuroii.motionai.commandCenter.evidencePackNotes.v1` 保存轻量本地草案。
- 已支持复制 Evidence Pack Markdown，以及本地导出 Markdown / JSON 草案。
- 已新增 `commandCenterManualHostSmokeEvidencePack` 共享契约、runtime snapshot 元信息、`previewManualHostSmokeEvidencePack()`、Desktop prototype Evidence Pack 面板与 `tests/smoke_desktop_manual_host_smoke_evidence_pack.py`。
- 继续不自动启动 AE/PR，不执行真实 host action，不修改真实工程。

## v0.5.3 Desktop Command Center Manual Host Smoke Review Checklist（已完成）

- 已基于 Evidence Pack 增加人工复核 / 签核清单，明确哪些字段必须检查后才能进入真实宿主 smoke。
- 已将项目副本确认、target lock、readiness 阻断项、Runbook 导出状态、只读动作白名单、人工备注、敏感信息检查和手动启动确认转成可勾选 review checklist。
- 已新增 `commandCenterManualHostSmokeReviewChecklist` 共享契约、runtime snapshot 元信息、`previewManualHostSmokeReviewChecklist()`、`updateReviewChecklistState()`、Desktop prototype Review Checklist 面板与 `tests/smoke_desktop_manual_host_smoke_review_checklist.py`。
- 继续保持本地只读，不自动启动 AE/PR，不执行真实 host action。

## v0.5.4 Desktop Command Center Manual Host Smoke Session Draft（已完成）

- 已基于 Review Checklist 生成一次手动宿主 smoke session 草案，记录 sessionId、目标宿主、开始前条件、允许动作、停止条件和结果占位。
- 已新增 `commandCenterManualHostSmokeSessionDraft` 共享契约、runtime snapshot 元信息、`previewManualHostSmokeSessionDraft()`、`updateManualHostSmokeSessionDraftState()`、Desktop prototype Session Draft 面板与 `tests/smoke_desktop_manual_host_smoke_session_draft.py`。
- 只创建本地草案和本地持久化状态，不启动 AE/PR，不执行真实 host action。
- 为后续用户手动打开 AE/PR 后的真实 smoke 记录、结果回填和失败回滚做准备。

## v0.5.5 Desktop / AE / PR Visual Preview Pass（已完成）

- 在不打乱现有门禁链路的前提下，进入三端视觉预览：Desktop 主界面、AE Compact 面板、PR Compact 面板。
- 优先统一品牌入口、功能区层级、图标风格、状态灯、抽屉式功能总览和中英文视觉密度。
- 仍不进入真实 AE/PR 宿主测试；先让界面视觉可评审、可截图、可继续细化。

已新增 `commandCenterVisualPreviewPass` 共享契约、`buildCommandCenterVisualPreview()`、runtime `previewVisualPreviewPass()`、Desktop prototype `#visualPreviewPanel`，并将 AE/PR 客户端升级为可直接打开评审的 Compact 视觉预览面板。

## v0.5.6 Visual Review Matrix and Screenshot Checklist（已完成）

- 建立 Desktop / AE / PR 的人工视觉评审矩阵：Dark zh-CN Expanded、Dark en-US Collapsed、Light zh-CN Expanded、Light en-US Collapsed，以及 AE/PR 240px / 320px / 420px。
- 补一份截图命名、检查项和阻断标准文档，准备后续真正打开宿主前的视觉签核。
- 继续不进入真实 AE/PR 宿主测试；先把视觉验收流程固定下来。

已新增 `commandCenterVisualReviewMatrix` 共享契约、`buildCommandCenterVisualReviewMatrix()`、runtime `previewVisualReviewMatrix()`、Desktop prototype `#visualReviewMatrixPanel`、共享 i18n 文案、`docs/DESKTOP_VISUAL_REVIEW_MATRIX_v0.5.6.md` 与 `tests/smoke_desktop_visual_review_matrix.py`。

## v0.5.7 Manual Visual Sign-off State and Findings Backlog（已完成）

- 为 v0.5.6 的 10 项截图矩阵增加人工签核状态：待评审、已通过、阻断、需复查。
- 增加轻量本地 findings backlog，记录截图项、问题类型、备注和复查状态。
- 继续不进入真实 AE/PR 宿主测试；先把视觉问题回收、复核和签核闭环补齐。

已新增 `commandCenterVisualSignoffState` 共享契约、`buildCommandCenterVisualSignoffState()`、runtime `previewVisualSignoffState()` / `updateVisualSignoffState()`、Desktop prototype `#visualSignoffPanel`、本地存储 `kuroii.motionai.commandCenter.visualSignoffState.v1`、共享 i18n 文案、`docs/DESKTOP_VISUAL_SIGNOFF_STATE_v0.5.7.md` 与 `tests/smoke_desktop_visual_signoff_state.py`。

## v0.5.8 Pre-host Visual Evidence Export（已完成）

- 将 v0.5.6 截图矩阵、v0.5.7 签核摘要和 findings backlog 汇总为本地 Markdown / JSON 证据包。
- 支持复制和本地导出视觉证据草案，继续沿用只读、手动评审、无宿主启动的安全边界。
- 继续不进入真实 AE/PR 宿主测试；先把视觉证据交付物做完整。

已新增 `commandCenterVisualEvidenceExport` 共享契约、`buildCommandCenterVisualEvidenceExport()`、runtime `previewVisualEvidenceExport()`、Desktop prototype `#visualEvidenceExportPanel`、复制 / 本地导出按钮、共享 i18n 文案、`docs/DESKTOP_VISUAL_EVIDENCE_EXPORT_v0.5.8.md` 与 `tests/smoke_desktop_visual_evidence_export.py`。

## v0.5.9 Pre-host Visual Evidence Review Lock（已完成）

- 在 v0.5.8 视觉证据草案基础上增加人工 review lock：记录证据包是否已被复核、复核人备注、锁定时间和仍需处理的阻断项。
- 继续不启动 AE/PR 宿主，不执行真实 host action；只把进入真实宿主 smoke 前的最后视觉证据确认门禁固定下来。
- 为后续真实宿主 smoke session 的结果回填与失败回滚准备稳定状态入口。

已新增 `commandCenterVisualEvidenceReviewLock` 共享契约、`buildCommandCenterVisualEvidenceReviewLock()`、runtime `previewVisualEvidenceReviewLock()` / `updateVisualEvidenceReviewLock()`、Desktop prototype 本地锁定状态与 `tests/smoke_desktop_visual_evidence_review_lock.py`。锁定只在无阻断项、证据就绪且已填写复核人时生效。

## 2026-07-14 图片历史与品牌控件基线（已完成）

- 图片生成成功后自动落盘，并建立最多 200 条的本地历史索引；列表不携带 Base64，单条详情按需读取图片。
- 内容生成图片模式已接入最近生成、查看、下载、恢复提示词和参数再次使用。
- API Key 不进入图片历史 JSON、renderer 持久化或 `localStorage`。
- Desktop 全局接入 Kuroii 滚动条、下拉浮层、复选/单选、滑块和按钮交互状态，覆盖深色、浅色与 390px 窄屏。

## 下一步：图片历史管理与人工视觉签核

- 已完成图片历史的单条删除、批量选择、清理失效文件和存储占用提示；删除会同时清理受管理的本地图片文件，历史列表不会携带 Base64 或 API Key。
- 下一项：将图片历史与独立“历史记录”页打通，增加图片筛选和生成参数详情。
- 继续执行真实 Desktop 截图矩阵与人工视觉签核，再进入受控宿主 Smoke。

- 用户手动打开 Desktop、AE 或 PR 与扩展，在 v0.5.6 矩阵中完成真实截图、处理 findings，并由复核人写入 v0.5.9 锁定状态。
- 锁定后，按 v0.4.7 handoff checklist 只执行白名单中的只读 Context 动作；不自动启动宿主，不运行写入、保存、渲染或导出动作。
