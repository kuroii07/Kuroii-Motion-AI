# v3.0 下一步路线

## 2026-07-23 内容生成与资源库工作台视觉重构（已完成第一阶段）

- 内容生成不再以统一的窄三栏和大面积空白画布呈现。文案、图片与视频使用清晰的输入栏、生产舞台和上下文栏；音乐保持“声音方向”输出，配音保持“台词到交付清单”输出，未将它们伪装为图片画布。
- 统一提高正文、标签、输入控件和操作按钮的可读字号与点击面积；标题栏收敛重复的模式文案，模型状态改为可截断的紧凑状态标签，避免长 Provider 名称挤压模式切换。
- 所有生成页使用同一套无装饰空状态：居中的状态点、标题与说明直接置于工作画布，不再额外套色块、投影或伪卡片；结果仍保留原有的真实生成、错误和本地资产逻辑。
- 工作台标题行固定为同一高度，并同步覆盖工作台网格行高，避免内容栏与标题栏重叠；普通标题、详情和历史区只使用面板底色与分隔线，不再使用额外青灰底色。
- 创建页标题栏已拆为固定的模式区与工具区：模式切换不再和 Provider 长名称、资源库按钮争抢同一行；创建页仅在右侧详情栏展示完整 Provider/模型信息，标题栏不再重复显示。
- 左侧输入栏的主操作固定在栏底，避免表单完成后留下无意义空洞；视频在中文环境不再混入未本地化的 Provider 错误详情。
- 资源库改为媒体优先的卡片网格：类型预览占主要空间，标题最多两行，元数据保持一行；详情栏收敛长提示词、统一媒体预览与元数据节奏，不再以整段文本充满卡片。
- 本轮只覆盖视觉与响应式布局，不变更任何 Provider 请求、音频/视频轮询、资产删除、恢复或“确认并生成”的计费保护逻辑。人工验收项见 `docs/CONTENT_WORKSPACE_VISUAL_REVIEW.md`。

## 下一步：内容工作台视觉验收与第二阶段细化

1. 由用户在 Dark / Light、1440px 和 1280px 宽度下人工检查文案、图片、视频、音乐、配音和资源库；优先记录溢出、滚动、按钮可达性、字重和空状态是否仍有视觉问题。
2. 为资源库补充真实缩略图优先级（图片缩略图、音频波形/封面、视频首帧），并为不可预览的计划资产提供统一的类型封面，而不将完整提示词当成卡片内容。
3. 将同一套工作台层级推广到智能助手、分镜、脚本和表达式等创作页面，同时保持每页的任务语义与现有快捷键、数据流不变。

## 2026-07-27 创建页标准组件统一（待人工视觉验收）

- 创建页标题栏拆为“模式区 + 工具区”：模式切换、资源库入口与运行状态不再混排；创建模式的 Provider/模型详情不在标题栏重复展示。
- 图片生成页作为标准页，将图片模型状态移入右侧 Inspector，Inspector 固定为“模型状态 → 历史/诊断切换 → 内容”三段；左侧参数栏只保留提示词、生成设置与底部主操作。
- 文案、视频、音乐和配音均已复用同一职责分层：标题栏只保留模式切换与工具入口，右侧 Inspector 的第一段固定为完整模型状态，左侧固定为输入与底部操作，中部为无卡片、居中的真实预览/结果区域。
- 文案创建页移除了与图片页不一致的 A/B/C 空白标尺；视频、音乐和配音的空预览均使用同一组状态点、标题与说明排版。音乐与配音的模式、语速和情绪控制均收回左侧输入栏，避免中部另起一套标题与控件。
- 根据首轮截图反馈，已移除视频说明误用状态三列布局造成的逐字竖排；音乐和配音重置旧工作台样式的继承，使其模型标签与模型名强制上下排列；三种空预览的状态点强制与标题、说明整体居中；文案创建页的操作改为与其余创建页一致的纵向底部按钮组。
- 此步不更改图片、文本、视频、音乐或配音的请求、轮询、历史、下载、删除或恢复行为；只统一布局、模型显示和无结果状态。

### 下一步：统一人工视觉验收

1. 在 Dark / Light 的 1440px、1280px 下依次切换文案、图片、视频、音乐、配音，确认模式切换始终在同一标题位置，模型信息始终只在右侧第一段出现。
2. 确认五页左侧的主操作都贴合栏底；中部无结果时都只有状态点、标题和说明，没有额外色块、重复标题、英文报错或遮挡。
3. 若四页视觉验收通过，再处理资源库的卡片/详情信息密度；若有任一页仍不齐，直接以对应截图为准做定点修正，不继续扩展新功能。

## 2026-07-27 资源库媒体优先展示（已完成第一步，待人工视觉验收）

- 资源卡片改为媒体优先：图片、音频和视频使用明确的轻量类型封面，不再将完整提示词作为主视觉；真实媒体只在右侧详情按需载入，列表接口和卡片均不携带或重复解码 Base64 数据，避免大文件卡死渲染器。
- 详情栏固定为“资产摘要 → 真实媒体预览 → 模型/来源/创建时间/文件大小 → 本地文件 → 操作”层级；保留现有打开预览、下载、恢复到创作页、恢复并再次生成和删除行为。
- 音频卡片只展示类型节奏封面，不把它标示为真实波形；真实试听仍只在已载入的详情中出现，避免对没有音频文件的计划资产造成误导。

### 下一步：资源资产回归验证

1. 人工从资源库分别打开一张图片、一段音乐或配音、一条视频，确认详情预览与文件元数据对应，长标题与模型名不会撑破卡片。
2. 对每种已保存资产各执行一次“恢复到创作页”；确认只恢复本地参数、不自动提交新的计费生成请求。
3. 最后再补充视频首帧和音频封面/波形的本地派生缓存，前提是它们来自真实已保存文件且不会把 Base64 放回资源列表接口。

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

## 2026-07-23 MiniMax 异步视频资产链路（已完成模拟验证）

- MiniMax 视频不再走 OpenAI Compatible 通用路径：`/v1/video_generation` 返回的仅是 provider task id，服务会继续轮询 `/v1/query/video_generation`，并在成功后通过 `/v1/files/retrieve` 查询、下载并保存 MP4 到 `generated-videos/`。
- 只有任务成功且本地文件写入成功时，视频历史才会变为 `succeeded`；下载为空、文件查询失败或本地落盘失败都会记录为失败，避免把“已提交”或“远端完成但文件未保存”误报为成片成功。
- 视频任务历史会保存无密钥的 MiniMax 文件 ID、文件名、相对路径、MIME、字节数和诊断。当前预览仍使用供应商的短期下载 URL；统一资产库阶段会补本地文件重开与删除入口。
- 视频页会按绑定模型收窄参数：Hailuo 2.3 / 02 显示 6/10 秒和 768p/1080p；T2V-01 系列显示 6 秒与 720p；MiniMax 当前文本生成视频接口不展示不生效的画面比例项。
- 已用本地模拟 Provider 完成“提交 → 轮询 → 文件查询 → 下载 → 本地历史”回归；仍需要用户自己的 MiniMax Key 完成真实成片验收。

## 2026-07-23 音乐与配音运行时修复（已完成）

- 旧 Local Service 进程不会热加载新路由；若 `/health` 路由表缺少 `/ai/music/generate` 或 `/ai/voice/generate`，页面会返回 `Route not found`。服务重启后必须以路由表为准，而不是仅看页面的“已接入”标记。
- 音乐与配音工作区的操作按钮改为始终渲染在固定底部操作区；长提示词、脚本或历史记录只在各自面板滚动，不再把生成按钮挤出可视区。
- 当前本机 MiniMax 配置已登记并绑定 `music-3.0`（音乐）和 `speech-2.8-hd`（配音）。真实生成仍由用户主动点击触发，以避免自动消耗账户额度；成功后应写入本地音频历史并显示试听/下载。

## 2026-07-23 Provider 能力接通状态（已完成）

- Local Service 新增只读 `/provider-capabilities`：逐项核对真实任务适配器、模型能力标签、默认绑定、Profile 启用状态和 API Key 状态；API Key 不会出现在返回值或界面持久化中。
- Provider Hub 的每项能力现在明确显示“已接通 / 可绑定待接通 / 未支持”，不会再把“模型已登记”或“Key 已保存”误报为可实际生成。
- 内容生成的图片、音乐、配音页面读取同一份状态：未接通会禁用真实生成按钮并给出原因；视频继续使用更细的异步任务就绪检查。

## 统一资产库与跨页面复用（已完成第一段）

- 新增 `GET /ai/assets` 统一汇总图片、音乐、配音方案/成品与视频任务；列表不携带 Base64 或密钥，按创建时间排序。
- 新增 `GET` / `DELETE /ai/assets/{assetType}/{assetId}`：详情才按需读取本地媒体；删除只会移除已明确选中的索引与受管理目录内的文件。
- “资源库”页面现已接入真实本地资产，可按图片、音频、视频筛选和搜索；单条可重开预览、下载，并在二次确认后删除。已保存视频以本地文件为准重开预览。
- 音乐和配音的“方案”记录会保留在库内，但没有媒体文件时明确显示为方案，下载按钮保持禁用，避免误导为已生成音频。

## 统一资产库与跨页面复用（已完成）

- 图片、音乐、配音、视频四个创作页的标题栏均新增“查看资源库”；已有本地成品或记录时，会优先定位到对应资产。
- 资源库详情新增“恢复到创作页”：图片恢复提示词与生成参数，音乐恢复创作 Brief、提示词和蓝图，配音恢复脚本、分段和音色参数，视频恢复提示词、任务状态与已生效选项。
- 该回跳只读取本地已保存记录，不会重新提交图片、音乐、配音或视频生成请求。
- 资源库详情新增“恢复并再次生成”：打开确认窗后会显示当前能力绑定的 Provider、模型和请求接口，并明确提示可能消耗配额或产生费用；只有再次点击“确认并生成”才会提交真实请求，取消、按 Escape 或点击遮罩均不会发起请求。

## Provider 配置边界与任务契约（已完成）

- `future-video` 与 `future-voice` 现在是明确的不可配置路线占位项：不会显示或保存 Base URL、API Key、模型、能力绑定，也不会执行刷新或连接测试。
- 所有真实 Provider 的连接页新增“接入要求”：写明模型发现方式、可接通任务所需协议与路径，以及语言模型不能冒充图片、视频或音频模型的边界。
- MiniMax 页面展示其原生图片、音乐、配音与异步视频提交/轮询/文件查询路径；OpenAI Compatible 明确区分模型列表接口与各类生成接口。

## 下一步：真实 Provider 验收与 Adapter 扩展

1. 使用用户自己的 MiniMax Key 做真实产物验收：图片、音乐、配音、视频各保留一个本地资产和不含密钥的诊断证据；不自动发起任何计费生成请求。
2. 为第三方异步任务补充明确的队列状态、取消策略与失败后“保留本地参数再试”的说明。
3. 将验证完成的第三方多模态平台按同一 Adapter 契约接入，先完成模型目录和单项任务模拟，再开放可配置入口。

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

## 2026-07-27 资源库媒体预览卡顿修复（已完成）

- `GET /ai/assets/{assetType}/{assetId}` 现为纯元数据接口；统一剥离图片、音频和视频的 Base64 / 旧媒体 URL，避免大文件进入 JSON 后阻塞服务端编码或前端解析。
- 新增受会话校验的 `GET /ai/assets/{assetType}/{assetId}/media`，以分块文件流返回受管理的本地媒体。资源库详情先显示元数据，再把该媒体流直接交给图片、音频或视频元素解码；不再依赖内置浏览器可能无法绘制的 Blob 对象 URL。
- 下载复用同一媒体流接口。资源卡片仍只显示轻量类型封面，不在列表中解码真实媒体。
- 已覆盖元数据无媒体 URL、媒体文件流内容 / MIME、服务端回归与原型语法检查。仍需用户手动打开此前会卡死的 5 MB 图片，确认浏览器不再出现“页面无响应”。

## 下一步计划

1. 用户手动复验资源库中大图片的“打开预览 / 刷新预览 / 下载”，确认不再卡死。
2. 若复验通过，补一次大图连续切换与内存回收的回归；若仍卡顿，记录具体文件大小和格式后继续定位图片解码阶段。

## 2026-07-27 资源库缩略图与详情抽屉（已完成）

- 图片列表恢复真实预览，但只请求服务端按需生成、最长边不超过 480 × 300 的缩略图；原始图片仍只在详情内读取，避免列表重复解码大图。
- 资源详情改为右侧抽屉：首次进入资源库不展开；点击某张卡片后才打开，点击遮罩或关闭按钮回到无选中状态，不再长期挤占列表宽度。
- 音频和视频仍保留轻量类型封面，避免伪造其预览内容；详情抽屉中才按真实媒体能力展示试听或视频。

## 下一步计划

1. 用户手动确认图片卡片缩略图是否正常显示，以及抽屉默认收起、打开和关闭是否符合预期。
2. 确认后补充音频封面、视频首帧或海报的独立缩略策略，并继续进行大图连续切换回归。

## 2026-07-27 资源库全屏预览与按需详情抽屉（已完成，待人工视觉验收）

- 图片卡片职责改为预览优先：点击缩略图只打开全屏原图预览；原图只在这一刻按需读取，预览容器可在图片超出窗口时独立滚动。
- 每张资源卡片新增右上角 `…` 操作入口；默认仅显示紧凑卡片，选择“打开完整详情”后才展开右侧详情抽屉，避免详情长期挤占资源列表。
- 详情抽屉补齐原图/媒体、Prompt 或脚本、模型、来源、创建时间、文件与已有的下载、恢复、再次生成、删除操作；超长 Prompt 仅在抽屉内部滚动。
- 本次未改变 Provider 调用、资源生成、下载、删除和再次生成的业务逻辑；全屏预览仍通过本地受会话校验的媒体流读取。

## 下一步计划

1. 用户手动确认：点击图片是否直接进入全屏原图预览，`…` 菜单是否只在需要时打开详情抽屉，以及抽屉内长 Prompt 和超大原图是否可独立滚动。
2. 若该交互通过，补齐音频波形封面与视频首帧/海报的轻量缩略图策略，并对连续切换多张大图做内存回收回归。

## 2026-07-27 全图查看器适应窗口修正（已完成，待人工视觉验收）

- 修正此前错误的“原始尺寸直接铺入滚动容器”行为：全图查看器现在默认适应可视窗口并居中展示，不再把透明画布或超大原图直接放大到查看器外。
- 全屏查看器扩大为接近可视区域的媒体舞台，背景模糊退后；透明图片的棋盘格仅作为图片本身的受控底板，而非无边界页面底色。
- 新增真实缩放控制：默认“适应窗口”，可使用缩小、放大或点击倍率切换回适应模式；非适应模式按原始像素尺寸缩放，并只在查看器内提供滚动。

## 下一步计划

1. 用户手动确认透明 PNG、横图、竖图在“适应窗口”下均完整可见，切换缩放后仅查看器内部出现滚动。
2. 若视觉验收通过，补充资源库连续切换多张大图的内存回收回归，并继续实现音频波形封面与视频首帧/海报缩略图。

## 2026-07-27 资源库音频波形、视频首帧与媒体切换回归（已完成，待人工视觉验收）

- 音频资源卡片现在请求服务端生成的紧凑波形封面；波形由受管本地音频文件生成，列表仍不读取或保存原始音频内容。
- 视频资源卡片优先经本地 `ffmpeg` 提取真实首帧；当 `ffmpeg` 不可用、视频损坏或格式不支持时，服务端返回清晰标明的 VIDEO 海报，不再出现空白卡片。
- 所有图片、音频和视频封面统一通过受会话校验的 `thumbnail=1` 媒体接口返回，最大尺寸保持在 480 × 300；不会把 Base64、原始音视频或远端地址写入列表 JSON。
- 新增回归覆盖：音频波形、视频海报、可用 `ffmpeg` 环境下的真实首帧、以及两张 1920 × 1280 图片连续切换 12 轮的流式媒体请求。前端仍只保留单一当前媒体状态，切换时会清理旧引用。

## 下一步计划

1. 用户手动确认真实音频卡片展示波形、真实视频卡片展示首帧或 VIDEO 海报，并确认不存在空白预览。
2. 用户连续切换两到三张大图并打开/关闭查看器，确认长期操作无卡死；如仍异常，提供文件格式和大小后继续定位原生解码或 GPU 绘制阶段。
