# Manual Acceptance Checklist

- [ ] v3.0 文档仍保留。
- [ ] 视觉 UI 参考仍保留。
- [ ] 旧 v0.2.4 包、旧安装脚本、旧用户指南已清理。
- [ ] AE Extension ID 为 `com.kuroii.motionai.ae`。
- [ ] PR Extension ID 为 `com.kuroii.motionai.pr`。
- [ ] Provider Hub 有错误恢复 UI 建议。
- [ ] Command Envelope / Result Envelope 存在。
- [ ] Action Schema 与 Capability Registry 存在。
- [ ] Theme / i18n / Sidebar / Tooltip 基础存在。

## v0.3.1 Local Service

- [ ] `/health` 可访问。
- [ ] `/providers` 未带 token 返回 401。
- [ ] `/providers` 带 token 返回 Provider Manifest。
- [ ] `/hosts` 返回 AE / PR 模拟 Host。
- [ ] `/commands` 返回 Result Envelope。
- [ ] 日志脱敏 API Key / Token。

## v0.3.2 Provider Hub

- [ ] `/provider-errors` 返回错误恢复建议。
- [ ] `/providers/openai/config` 返回表单字段。
- [ ] `/providers/openai/models` 可返回 mock 模型列表。
- [ ] 无效 Key 返回 `AUTH_INVALID_KEY` 与“检查 Key”。
- [ ] 错误 Base URL 返回 `BASE_URL_UNREACHABLE` 与“检查 Base URL”。
- [ ] 模型不存在返回 `MODEL_NOT_FOUND` 与“切换模型”。
- [ ] 限流模拟返回 `RATE_LIMITED` 与“等待限流”。

## v0.3.3 Host Connection

- [ ] `/hosts` 默认返回 AE / PR Offline。
- [ ] 离线 Host 执行命令返回 `HOST_OFFLINE`。
- [ ] `/hosts/after-effects/register` 后状态为 Connected。
- [ ] `/hosts/after-effects/heartbeat` 可刷新 Busy / Connected。
- [ ] Busy Host 执行命令返回 `HOST_BUSY`。
- [ ] `/hosts/after-effects/capabilities` 返回 AE Capability Registry。
- [ ] `/host-target` 可设置 Host Lock。
- [ ] 需要确认的风险命令返回 `WAITING_FOR_CONFIRMATION`。

## v0.3.4 Action Execution

- [ ] `/actions/trusted` 返回风险 0 的只读 Trusted Actions。
- [ ] `/hosts/after-effects/context` 返回 AE mock context。
- [ ] `/hosts/premiere-pro/context` 返回 PR mock context。
- [ ] 风险 0 命令返回 `TRUSTED_ACTION_EXECUTED`。
- [ ] 未确认的非只读动作返回 `ACTION_OUT_OF_SCOPE`。
- [ ] `/commands` 返回 Result History。
- [ ] `/commands/{commandId}` 返回单条日志详情。
- [ ] Command History 中 API Key / Token 已脱敏。
## v0.3.5 Desktop Command Center

- [ ] `apps/desktop/src/local-service-client.js` 暴露 Local Service 客户端。
- [ ] `apps/desktop/src/command-center.js` 暴露 Command Center view model。
- [ ] Desktop 壳声明 `/hosts`、`/hosts/{host}/context`、`/actions/trusted`、`/commands`。
- [ ] 导航包含 `command-center`。
- [ ] zh-CN / en-US 包含 `nav.commandCenter` 与命令中心文案。
- [ ] 只读安全策略限制 `allowedRiskLevels: [0]`。
- [ ] `tests/smoke_desktop_command_center.py` 通过。
## v0.3.6 Desktop UI Prototype

- [ ] `apps/desktop/prototype/index.html` 可直接打开。
- [ ] 原型包含 Host Cards、Host Context、Trusted Actions、Result History、Command Detail、Safety Notice。
- [ ] 原型支持 Light / Dark 主题切换。
- [ ] 原型支持 zh-CN / en-US 图标按钮切换。
- [ ] 原型支持侧边栏展开 / 收起。
- [ ] 原型默认使用本地 mock 数据，Local Service 开启时可刷新接口。
- [ ] `tests/smoke_desktop_ui_prototype.py` 通过。
## v0.3.7 Desktop Runtime Wiring

- [ ] `apps/desktop/src/command-center-runtime.js` 存在。
- [ ] `apps/desktop/src/command-center-fixtures.js` 存在。
- [ ] Runtime 暴露 `snapshot / subscribe / refresh / runReadOnlyAction`。
- [ ] Desktop package exports 包含 `./command-center-runtime` 与 `./command-center-fixtures`。
- [ ] `app-shell.js` 声明 runtime module 与 fixture module。
- [ ] 原型记录 runtime wiring 元信息。
- [ ] `tests/smoke_desktop_runtime_wiring.py` 通过。
## v0.4.7 Desktop Host Smoke Handoff

- [ ] 真实 AE/PR smoke 前已阅读 `docs/DESKTOP_COMMAND_CENTER_HOST_SMOKE_HANDOFF_v0.4.7.md`。
- [ ] 仅使用可丢弃或已备份的 AE/PR 项目副本。
- [ ] 不由 Codex 自动启动 AE/PR；宿主由用户手动打开。
- [ ] 只运行 allowlist 中的风险 0 只读动作。
- [ ] 不运行 create/delete/write/set/save/render/export/import/mutate 类动作。
- [ ] 如心跳过期、target lock 不匹配或命令失败，立即停止 smoke 并按文档回滚。
- [ ] `tests/smoke_desktop_host_smoke_handoff.py` 通过。
## v0.4.8 Desktop Mock Host Smoke Rehearsal

- [ ] `commandCenterMockHostSmokeRehearsal` 只使用 mock 数据。
- [ ] 彩排器不会启动 AE/PR，也不会执行真实 host action。
- [ ] 彩排器会检查 target lock、allowlist、forbidden action、result history 和失败中断路径。
- [ ] 模拟结果历史包含 `rehearsalOnly: true`。
- [ ] `tests/smoke_desktop_mock_host_smoke_rehearsal.py` 通过。
## v0.4.9 Desktop Rehearsal Result Panel

- [ ] Desktop prototype 显示 `#rehearsalResultPanel`。
- [ ] 面板显示 pass / blocked 检查项、模拟结果历史和失败中断原因。
- [ ] 面板可折叠，折叠按钮有 Tooltip / aria-label。
- [ ] 面板只展示 mock-only rehearsal 结果，不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] zh-CN / en-US 切换后彩排结果面板文案同步切换。
- [ ] `tests/smoke_desktop_rehearsal_result_panel.py` 通过。
## v0.5.0 Desktop Manual Host Smoke Runbook

- [ ] Desktop prototype 显示 `#manualHostSmokeRunbookPanel`。
- [ ] Runbook 可汇总 safety summary、target lock、readiness summary、rehearsal summary、allowed actions、manual steps 和 rollback notes。
- [ ] Runbook 预览区域只读，支持复制 Markdown 草案。
- [ ] Runbook 支持本地导出 Markdown 与 JSON 草案。
- [ ] Runbook 面板不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] zh-CN / en-US 切换后 Runbook 面板按钮和状态文案同步切换。
- [ ] `tests/smoke_desktop_manual_host_smoke_runbook.py` 通过。
## v0.5.1 Desktop Runbook Export Feedback and State Persistence

- [ ] Runbook 面板显示 `#runbookFeedback`。
- [ ] 复制成功显示成功反馈，并记录 `copy-success` / `markdown`。
- [ ] 复制失败显示失败反馈，并把焦点转到 `#runbookPreview` 便于手动选择文本。
- [ ] Markdown / JSON 导出成功显示对应格式反馈。
- [ ] 导出失败显示失败反馈，并保留只读预览文本作为备用。
- [ ] 最近一次 runbookId、目标宿主、格式、结果和提示状态保存到 localStorage。
- [ ] Runbook 反馈状态不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] `tests/smoke_desktop_runbook_export_feedback_state.py` 通过。
## v0.5.2 Desktop Manual Host Smoke Evidence Pack

- [ ] Desktop prototype 显示 `#manualHostSmokeEvidencePackPanel`。
- [ ] Evidence Pack 汇总 readiness、target lock、allowed actions、Runbook 和 Runbook export feedback。
- [ ] `#evidenceNotesInput` 可填写人工检查备注，并保存到 `kuroii.motionai.commandCenter.evidencePackNotes.v1`。
- [ ] Evidence Pack 可复制 Markdown 草案。
- [ ] Evidence Pack 可本地导出 Markdown 与 JSON 草案。
- [ ] Evidence Pack 面板不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] 人工备注提示明确不要填写 API Key、Token 或私人项目内容。
- [ ] `tests/smoke_desktop_manual_host_smoke_evidence_pack.py` 通过。
## v0.5.3 Desktop Manual Host Smoke Review Checklist

- [ ] Desktop prototype 显示 `#manualHostSmokeReviewChecklistPanel`。
- [ ] Review Checklist 由 Evidence Pack 自动生成条件项。
- [ ] 条件满足但未勾选的项显示 `needs-review`。
- [ ] 条件不满足的项显示 `blocked` 且不可勾选。
- [ ] 勾选状态保存到 `kuroii.motionai.commandCenter.reviewChecklistState.v1`。
- [ ] 重置按钮可清空本地复核勾选状态。
- [ ] Review Checklist 面板不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] `tests/smoke_desktop_manual_host_smoke_review_checklist.py` 通过。
## v0.5.4 Desktop Manual Host Smoke Session Draft

- [ ] Desktop prototype 显示 `#manualHostSmokeSessionDraftPanel`。
- [ ] Session Draft 由 Review Checklist 和 Evidence Pack 自动生成。
- [ ] Session Draft 包含 sessionId、目标宿主、开始条件、允许只读动作、停止条件和结果占位。
- [ ] 草案状态保存到 `kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1`。
- [ ] Session Draft 支持复制 Markdown、本地导出 Markdown / JSON、重置本地草案。
- [ ] Session Draft 面板不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] `tests/smoke_desktop_manual_host_smoke_session_draft.py` 通过。

## v0.5.5 Desktop / AE / PR Visual Preview

- [ ] Desktop prototype 显示 `#visualPreviewPanel` 与 `data-visual-preview-pass`。
- [ ] Desktop 视觉预览面板包含 Desktop、AE、PR 三个 surface card。
- [ ] 功能总览以抽屉方式打开 / 收起，不固定占据右侧功能区。
- [ ] zh-CN / en-US 切换后视觉预览面板文案同步切换。
- [ ] AE client 可直接打开并显示 Compact header、状态条、功能区和日志区。
- [ ] PR client 可直接打开并显示 Compact header、状态条、功能区和日志区。
- [ ] AE/PR 面板 240px、320px、420px 宽度不横向溢出。
- [ ] AE/PR 面板语言切换为右上角图标按钮，不使用下拉菜单。
- [ ] 面板不自动调用 `registerHost()` 或 `sendHeartbeat()`。
- [ ] `tests/smoke_desktop_ae_pr_visual_preview.py` 通过。

## v0.5.6 Visual Review Matrix and Screenshot Checklist

- [ ] Desktop prototype 显示 `#visualReviewMatrixPanel` 与 `data-visual-review-matrix`。
- [ ] 视觉评审矩阵包含 4 个 Desktop 截图项与 6 个 AE/PR Compact 截图项。
- [ ] 截图命名遵循 `v0.5.6_{surface}_{theme}_{locale}_{layout}_{width}_{dpi}.png`。
- [ ] 评分卡最低分为 85，覆盖主题、多语言、响应式、组件状态、Tooltip、可访问性和品牌一致性。
- [ ] 阻断项包含文字不可读、横向溢出、缺少 Tooltip、问号占位或乱码、自动启动宿主入口、真实工程修改控件。
- [ ] 视觉评审矩阵不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] zh-CN / en-US 切换后视觉评审矩阵文案同步切换。
- [ ] `tests/smoke_desktop_visual_review_matrix.py` 通过。

## v0.5.7 Manual Visual Sign-off State and Findings Backlog

- [ ] Desktop prototype 显示 `#visualSignoffPanel` 与 `data-visual-signoff-state`。
- [ ] 10 项视觉矩阵均可标记为待评审、通过、阻断或需复查。
- [ ] 签核状态保存到 `kuroii.motionai.commandCenter.visualSignoffState.v1`。
- [ ] Findings backlog 可记录截图项、问题类型、级别、备注和解决状态。
- [ ] 新增问题会把对应截图项标记为阻断。
- [ ] 所有截图通过且无未解决问题时，视觉签核状态才可完成。
- [ ] 视觉签核面板不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] zh-CN / en-US 切换后视觉签核面板文案同步切换。
- [ ] `tests/smoke_desktop_visual_signoff_state.py` 通过。

## v0.5.8 Pre-host Visual Evidence Export

- [ ] Desktop prototype 显示 `#visualEvidenceExportPanel` 与 `data-visual-evidence-export`。
- [ ] 视觉证据导出汇总截图矩阵、签核摘要、未解决 / 已解决 findings 和安全标记。
- [ ] 视觉证据支持复制 Markdown 草案。
- [ ] 视觉证据支持本地导出 Markdown 与 JSON 草案。
- [ ] 视觉证据预览区只读、可滚动、窄宽度下不横向溢出。
- [ ] 视觉证据导出不提供启动 AE/PR 或执行真实 host action 的按钮。
- [ ] zh-CN / en-US 切换后视觉证据导出面板文案同步切换。
- [ ] `tests/smoke_desktop_visual_evidence_export.py` 通过。
