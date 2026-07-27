const runtimeWiring = {
  version: "0.5.9-alpha.0",
  runtimeModule: "../src/command-center-runtime.js",
  fixtureModule: "../src/command-center-fixtures.js",
  detailFilterUi: true,
  interactionPolish: true,
  runtimePrototypeAlignment: true,
  alignmentContract: "commandCenterRuntimePrototypeAlignment",
  diagnosticsState: true,
  diagnosticsContract: "commandCenterDiagnosticsFirstSlice",
  diagnosticsRecoveryUx: true,
  diagnosticsRecoveryContract: "commandCenterDiagnosticsRecoveryUx",
  hostReadinessGate: true,
  hostReadinessContract: "commandCenterHostReadinessGate",
  readinessDrilldown: true,
  readinessDrilldownContract: "commandCenterReadinessDrilldown",
  hostSmokeHandoff: true,
  hostSmokeHandoffContract: "commandCenterHostSmokeHandoffChecklist",
  mockHostSmokeRehearsal: true,
  mockHostSmokeRehearsalContract: "commandCenterMockHostSmokeRehearsal",
  rehearsalResultPanel: true,
  rehearsalResultPanelContract: "commandCenterRehearsalResultPanel",
  manualHostSmokeRunbook: true,
  manualHostSmokeRunbookContract: "commandCenterManualHostSmokeRunbook",
  runbookExportFeedbackState: true,
  runbookExportFeedbackContract: "commandCenterRunbookExportFeedbackState",
  manualHostSmokeEvidencePack: true,
  manualHostSmokeEvidencePackContract: "commandCenterManualHostSmokeEvidencePack",
  manualHostSmokeReviewChecklist: true,
  manualHostSmokeReviewChecklistContract: "commandCenterManualHostSmokeReviewChecklist",
  manualHostSmokeSessionDraft: true,
  manualHostSmokeSessionDraftContract: "commandCenterManualHostSmokeSessionDraft",
  visualPreviewPass: true,
  visualPreviewContract: "commandCenterVisualPreviewPass",
  visualReviewMatrix: true,
  visualReviewMatrixContract: "commandCenterVisualReviewMatrix",
  visualSignoffState: true,
  visualSignoffContract: "commandCenterVisualSignoffState",
  visualEvidenceExport: true,
  visualEvidenceExportContract: "commandCenterVisualEvidenceExport",
  visualEvidenceReviewLock: true,
  visualEvidenceReviewLockContract: "commandCenterVisualEvidenceReviewLock"
};

const diagnosticStaleAfterMs = 120000;
const runbookExportFeedbackStorageKey = "kuroii.motionai.commandCenter.runbookExportState.v1";
const evidencePackNotesStorageKey = "kuroii.motionai.commandCenter.evidencePackNotes.v1";
const reviewChecklistStorageKey = "kuroii.motionai.commandCenter.reviewChecklistState.v1";
const sessionDraftStorageKey = "kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1";
const visualSignoffStorageKey = "kuroii.motionai.commandCenter.visualSignoffState.v1";
const visualEvidenceReviewLockStorageKey = "kuroii.motionai.commandCenter.visualEvidenceReviewLock.v1";
const providerProfileStorageKey = "kuroii.motionai.providerProfile.v1";
const THEME_STORAGE_KEY = "kuroii.motionai.themeMode.v1";
const THEME_COLOR_STORAGE_KEY = "kuroii.motionai.themeColor.v1";
const ACCENT_COLOR_STORAGE_KEY = "kuroii.motionai.accentColor.v1";

const themeColorPalettes = {
  cyan: {
    dark: { accent: "#27C7EB", hover: "#51D4EF", active: "#12A9CD", soft: "rgba(39, 199, 235, 0.13)", onAccent: "#071217" },
    light: { accent: "#066F8A", hover: "#056B86", active: "#04566C", soft: "rgba(8, 125, 156, 0.11)", onAccent: "#FFFFFF" }
  },
  blue: {
    dark: { accent: "#5B8CFF", hover: "#7EA6FF", active: "#3F70E8", soft: "rgba(91, 140, 255, 0.15)", onAccent: "#FFFFFF" },
    light: { accent: "#285FC4", hover: "#1F55B8", active: "#194794", soft: "rgba(40, 95, 196, 0.12)", onAccent: "#FFFFFF" }
  },
  green: {
    dark: { accent: "#31C982", hover: "#57D89A", active: "#20A96A", soft: "rgba(49, 201, 130, 0.14)", onAccent: "#07150F" },
    light: { accent: "#087A58", hover: "#066A4C", active: "#05543D", soft: "rgba(8, 122, 88, 0.11)", onAccent: "#FFFFFF" }
  },
  orange: {
    dark: { accent: "#F08A45", hover: "#F5A064", active: "#D66C2C", soft: "rgba(240, 138, 69, 0.15)", onAccent: "#1A0B03" },
    light: { accent: "#B85A18", hover: "#A95015", active: "#8E4210", soft: "rgba(184, 90, 24, 0.11)", onAccent: "#FFFFFF" }
  },
  violet: {
    dark: { accent: "#9B76F2", hover: "#B093F7", active: "#8059D8", soft: "rgba(155, 118, 242, 0.15)", onAccent: "#FFFFFF" },
    light: { accent: "#6D46C2", hover: "#603AB5", active: "#50309A", soft: "rgba(109, 70, 194, 0.11)", onAccent: "#FFFFFF" }
  },
  slate: {
    dark: { accent: "#8A9BB0", hover: "#A0AFC0", active: "#71849B", soft: "rgba(138, 155, 176, 0.15)", onAccent: "#0C1117" },
    light: { accent: "#53687F", hover: "#465C73", active: "#394C60", soft: "rgba(83, 104, 127, 0.11)", onAccent: "#FFFFFF" }
  }
};

const accentColorPalettes = {
  mint: { dark: "#3EE0AA", light: "#087A58" },
  cyan: { dark: "#2EC5F4", light: "#06708F" },
  amber: { dark: "#FFC247", light: "#9A6500" },
  rose: { dark: "#F06B85", light: "#B52E50" },
  violet: { dark: "#A78BFA", light: "#6D46C2" },
  orange: { dark: "#FF934D", light: "#B85A18" }
};

function readAppearanceColor(storageKey, palette, fallback) {
  try {
    const value = window.localStorage ? window.localStorage.getItem(storageKey) : null;
    return value && palette[value] ? value : fallback;
  } catch (_error) {
    return fallback;
  }
}

function readThemeMode() {
  try {
    const value = window.localStorage ? window.localStorage.getItem(THEME_STORAGE_KEY) : null;
    return ["dark", "light", "system"].includes(value) ? value : "system";
  } catch (_error) {
    return "system";
  }
}

function resolveThemeMode(mode) {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode === "light" ? "light" : "dark";
}

const initialThemeMode = readThemeMode();
const initialThemeColor = readAppearanceColor(THEME_COLOR_STORAGE_KEY, themeColorPalettes, "cyan");
const initialAccentColor = readAppearanceColor(ACCENT_COLOR_STORAGE_KEY, accentColorPalettes, "rose");

const providerCapabilities = [
  { id: "text", label: { "zh-CN": "语言", "en-US": "Text" } },
  { id: "vision", label: { "zh-CN": "视觉", "en-US": "Vision" } },
  { id: "image", label: { "zh-CN": "图片", "en-US": "Image" } },
  { id: "video", label: { "zh-CN": "视频", "en-US": "Video" } },
  { id: "voice", label: { "zh-CN": "语音", "en-US": "Voice" } },
  { id: "speech", label: { "zh-CN": "语音转文字", "en-US": "Speech-to-Text" } },
  { id: "music", label: { "zh-CN": "音乐", "en-US": "Music" } },
  { id: "sfx", label: { "zh-CN": "音效", "en-US": "SFX" } },
  { id: "local", label: { "zh-CN": "本地模型", "en-US": "Local Models" } }
];

const providerCatalog = [
  { id: "openai", label: "OpenAI", protocol: "OpenAI", baseUrl: "https://api.openai.com/v1", auth: "API Key", categories: ["text", "vision", "image"], status: "ready", guide: "OpenAI 官方模型与 OpenAI Compatible 任务路由入口" },
  { id: "deepseek", label: "DeepSeek", protocol: "OpenAI Compatible", baseUrl: "https://api.deepseek.com/v1", auth: "API Key", categories: ["text"], status: "ready", guide: "中文、代码与推理任务的低成本语言模型接入" },
  { id: "minimax", label: "MiniMax", protocol: "MiniMax Native", baseUrl: "https://api.minimaxi.com", auth: "API Key", categories: ["text", "image", "video", "voice", "music"], status: "needs-config", guide: "MiniMax 专用协议：图片、视频、音乐与配音均使用各自的原生任务适配器" },
  { id: "openai-compatible", label: "OpenAI Compatible", protocol: "Custom", baseUrl: "https://example.com/v1", auth: "API Key", categories: ["text", "vision", "image"], status: "needs-config", guide: "适配第三方聚合平台或私有 OpenAI Compatible 服务" },
  { id: "custom-base-url", label: "Custom Base URL", protocol: "Custom", baseUrl: "https://example.com/v1", auth: "API Key", categories: ["text", "vision", "image"], status: "needs-config", guide: "保留给自定义平台、企业网关和授权 API" },
  { id: "ollama", label: "Ollama Local", protocol: "Local", baseUrl: "http://127.0.0.1:11434/v1", auth: "None", categories: ["text", "local"], status: "local", guide: "本地优先与隐私优先任务" },
  { id: "lm-studio", label: "LM Studio", protocol: "Local", baseUrl: "http://127.0.0.1:1234/v1", auth: "None", categories: ["text", "vision", "local"], status: "local", guide: "本地模型工作台与离线调试" },
  { id: "future-video", label: "Video Providers", protocol: "Async Task", baseUrl: "https://api.example-video.com/v1", auth: "API Key", categories: ["video"], status: "planned", configurable: false, guide: "预留给视频生成、submit / poll / cancel / download 异步任务" },
  { id: "future-voice", label: "Voice Providers", protocol: "Async / Realtime", baseUrl: "https://api.example-voice.com/v1", auth: "API Key", categories: ["voice", "speech", "music", "sfx"], status: "planned", configurable: false, guide: "预留给 TTS、STT、音乐和音效模型" }
];

const providerServiceIds = ["openai", "deepseek", "minimax", "openai-compatible", "custom-base-url", "ollama", "lm-studio"];

const providerContractCapabilities = {
  openai: ["text", "image", "video"],
  deepseek: ["text"],
  minimax: ["text", "image", "video", "voice", "music"],
  "openai-compatible": ["text", "image", "video"],
  "custom-base-url": ["text", "image"],
  ollama: [],
  "lm-studio": []
};

const providerModelCatalog = {
  openai: [
    { id: "gpt-4.1", label: "GPT-4.1", tags: ["text", "vision"] },
    { id: "gpt-4.1-mini", label: "GPT-4.1 mini", tags: ["text"] },
    { id: "gpt-image-1", label: "GPT Image", tags: ["image"] }
  ],
  deepseek: [
    { id: "deepseek-chat", label: "DeepSeek Chat", tags: ["text"] },
    { id: "deepseek-reasoner", label: "DeepSeek Reasoner", tags: ["reasoning"] }
  ],
  minimax: [
    { id: "MiniMax-M3", label: "MiniMax M3", tags: ["text"] },
    { id: "image-01", label: "MiniMax Image 01", tags: ["image"] },
    { id: "image-01-live", label: "MiniMax Image 01 Live", tags: ["image"] },
    { id: "MiniMax-Hailuo-2.3", label: "Hailuo 2.3", tags: ["video"] },
    { id: "music-3.0", label: "MiniMax Music 3.0", tags: ["music"] },
    { id: "music-3.0-free", label: "MiniMax Music 3.0 Free", tags: ["music"] },
    { id: "music-2.6", label: "MiniMax Music 2.6", tags: ["music"] },
    { id: "speech-2.8-hd", label: "MiniMax Speech 2.8 HD", tags: ["voice"] },
    { id: "speech-2.8-turbo", label: "MiniMax Speech 2.8 Turbo", tags: ["voice"] }
  ],
  "openai-compatible": [
    { id: "compatible-chat", label: "Compatible Chat", tags: ["text"] },
    { id: "compatible-vision", label: "Compatible Vision", tags: ["vision"] }
  ],
  "custom-base-url": [
    { id: "custom-chat", label: "Custom Chat", tags: ["text"] },
    { id: "custom-image", label: "Custom Image", tags: ["image"] }
  ],
  ollama: [
    { id: "llama3.1", label: "Llama 3.1", tags: ["local"] },
    { id: "qwen2.5", label: "Qwen 2.5", tags: ["local"] }
  ],
  "lm-studio": [
    { id: "local-model", label: "Local Model", tags: ["local"] },
    { id: "local-vision", label: "Local Vision", tags: ["local", "vision"] }
  ],
  "future-video": [
    { id: "video-model-placeholder", label: "Video Model Placeholder", tags: ["video"] }
  ],
  "future-voice": [
    { id: "tts-placeholder", label: "TTS Placeholder", tags: ["voice"] },
    { id: "stt-placeholder", label: "STT Placeholder", tags: ["speech"] },
    { id: "sfx-placeholder", label: "SFX Placeholder", tags: ["sfx"] }
  ]
};

const providerErrorGuidance = {
  CONFIG_MISSING: {
    tone: "error",
    title: { "zh-CN": "配置缺失", "en-US": "Missing config" },
    message: { "zh-CN": "请先补全 Base URL 和 API Key。", "en-US": "Complete Base URL and API key first." },
    actions: [
      { "zh-CN": "补全配置", "en-US": "Complete config" },
      { "zh-CN": "检查 Key", "en-US": "Check API key" }
    ]
  },
  CONFIG_INVALID: {
    tone: "error",
    title: { "zh-CN": "高级配置无效", "en-US": "Invalid advanced config" },
    message: { "zh-CN": "请检查模型列表路径、文本生成路径、超时范围和自定义请求头。", "en-US": "Check the models path, chat path, timeout range, and custom headers." },
    actions: [
      { "zh-CN": "检查高级配置", "en-US": "Check advanced config" },
      { "zh-CN": "移除 Authorization Header", "en-US": "Remove Authorization header" }
    ]
  },
  AUTH_INVALID_KEY: {
    tone: "error",
    title: { "zh-CN": "API Key 无效", "en-US": "Invalid API key" },
    message: { "zh-CN": "当前 Key 无法通过身份认证。", "en-US": "The current key failed authentication." },
    actions: [
      { "zh-CN": "检查 Key", "en-US": "Check API key" },
      { "zh-CN": "重新复制官方 Key", "en-US": "Copy a fresh provider key" }
    ]
  },
  BASE_URL_UNREACHABLE: {
    tone: "error",
    title: { "zh-CN": "Base URL 不可达", "en-US": "Base URL unreachable" },
    message: { "zh-CN": "请确认协议、域名、端口和 /v1 路径。", "en-US": "Check protocol, domain, port, and /v1 path." },
    actions: [
      { "zh-CN": "检查 Base URL", "en-US": "Check Base URL" },
      { "zh-CN": "检查代理/防火墙", "en-US": "Check proxy or firewall" }
    ]
  },
  MODEL_NOT_FOUND: {
    tone: "warning",
    title: { "zh-CN": "模型不可用", "en-US": "Model unavailable" },
    message: { "zh-CN": "当前模型不在平台返回的可用列表中。", "en-US": "The selected model is not in the returned model list." },
    actions: [
      { "zh-CN": "刷新模型", "en-US": "Refresh models" },
      { "zh-CN": "切换模型", "en-US": "Switch model" }
    ]
  },
  RATE_LIMITED: {
    tone: "warning",
    title: { "zh-CN": "请求被限流", "en-US": "Rate limited" },
    message: { "zh-CN": "Provider 暂时限制了请求频率或额度。", "en-US": "The provider is temporarily limiting requests or quota." },
    actions: [
      { "zh-CN": "等待限流恢复", "en-US": "Wait for rate limit" },
      { "zh-CN": "切换模型", "en-US": "Switch model" }
    ]
  },
  LOCAL_SERVICE_OFFLINE: {
    tone: "error",
    title: { "zh-CN": "本地服务未连接", "en-US": "Local Service offline" },
    message: { "zh-CN": "无法连接 Kuroii Local Service。", "en-US": "Kuroii Local Service could not be reached." },
    actions: [
      { "zh-CN": "检查本地服务", "en-US": "Check Local Service" },
      { "zh-CN": "重新启动后重试", "en-US": "Restart and retry" }
    ]
  },
  LOCAL_SERVICE_ERROR: {
    tone: "error",
    title: { "zh-CN": "本地服务响应异常", "en-US": "Local Service error" },
    message: { "zh-CN": "Local Service 已响应，但未返回可识别的错误详情。", "en-US": "Local Service responded without recognizable error details." },
    actions: [
      { "zh-CN": "重试当前操作", "en-US": "Retry the operation" },
      { "zh-CN": "检查本地服务日志", "en-US": "Check Local Service logs" }
    ]
  },
  NETWORK_TIMEOUT: {
    tone: "error",
    title: { "zh-CN": "网络超时", "en-US": "Network timeout" },
    message: { "zh-CN": "连接 Provider 时超过等待时间。", "en-US": "The provider connection timed out." },
    actions: [
      { "zh-CN": "检查 Base URL", "en-US": "Check Base URL" },
      { "zh-CN": "稍后重试", "en-US": "Retry later" }
    ]
  },
  PROVIDER_UNAVAILABLE: {
    tone: "error",
    title: { "zh-CN": "Provider 服务不可用", "en-US": "Provider unavailable" },
    message: { "zh-CN": "Provider 当前返回服务端错误。", "en-US": "The provider is currently returning a server error." },
    actions: [
      { "zh-CN": "稍后重试", "en-US": "Retry later" },
      { "zh-CN": "切换 Provider", "en-US": "Switch provider" }
    ]
  },
  PROVIDER_RESPONSE_INVALID: {
    tone: "error",
    title: { "zh-CN": "Provider 响应格式异常", "en-US": "Invalid provider response" },
    message: { "zh-CN": "当前操作返回的数据不符合 OpenAI Compatible 格式。", "en-US": "The current response does not match the expected OpenAI Compatible format." },
    actions: [
      { "zh-CN": "检查 Base URL", "en-US": "Check Base URL" },
      { "zh-CN": "检查兼容协议", "en-US": "Check compatibility" }
    ]
  }
};

const sharedRecoveryActions = ["retry-refresh", "clear-error", "use-mock-mode"];
const diagnosticRecoveryActions = {
  "retry-refresh": { id: "retry-refresh", labelKey: "commandCenter.recovery.retryRefresh", focusTarget: "diagnosticsPanel" },
  "use-mock-mode": { id: "use-mock-mode", labelKey: "commandCenter.recovery.useMockMode", focusTarget: "activityBand" },
  "reset-filters": { id: "reset-filters", labelKey: "commandCenter.recovery.resetFilters", focusTarget: "queryFilter" },
  "view-latest-error": { id: "view-latest-error", labelKey: "commandCenter.recovery.viewLatestError", focusTarget: "detailPanel" }
};
const diagnosticActionMap = {
  "local-service": ["retry-refresh", "use-mock-mode"],
  "host-heartbeat": ["retry-refresh", "use-mock-mode"],
  "trusted-actions": ["retry-refresh"],
  "last-command-error": ["view-latest-error", "reset-filters"]
};
const readinessDrilldownTargets = {
  "local-service": "diagnosticsPanel",
  "host-target": "hostStrip",
  "host-heartbeat": "diagnosticsPanel",
  "trusted-actions": "actionList",
  "command-history": "historyTable",
  "diagnostic-recovery": "diagnosticsPanel"
};
const hostSmokeAllowedReadOnlyActions = [
  "ae.context.getProject",
  "ae.context.getActiveComp",
  "ae.context.getSelection",
  "ae.text.readSelectedLayers",
  "pr.context.getProject",
  "pr.context.getActiveSequence"
];
const hostSmokeForbiddenActionPatterns = ["create", "delete", "write", "set", "save", "render", "export", "import", "mutate"];
const hostSmokeManualSteps = [
  { id: "start-local-service", target: "Local Service", expected: "/health ok and authenticated routes require X-Kuroii-Session" },
  { id: "open-host-project-copy", target: "AE/PR", expected: "Only a disposable or backed-up project is open" },
  { id: "open-host-extension", target: "AE/PR Host Agent", expected: "Host registration and heartbeat are visible in Desktop" },
  { id: "lock-target-host", target: "Desktop Command Center", expected: "Selected host matches the intended AE or PR target" },
  { id: "run-read-only-context-action", target: "Trusted Actions", expected: "Result history records TRUSTED_ACTION_EXECUTED with ok=true" },
  { id: "review-result-history", target: "Result History", expected: "Command detail contains read-only data and no mutation warnings" }
];
const hostSmokeRollbackNotes = [
  "Stop Local Service before retrying a failed host smoke.",
  "Close the AE/PR extension panel if heartbeat or target lock becomes stale.",
  "Use the backed-up project copy if any unexpected host mutation is observed."
];
const sharedEmptyStateIds = {
  hosts: "no-hosts",
  actions: "no-actions",
  history: "no-history",
  filteredHistory: "no-filtered-history"
};
const prototypeStateMap = {
  serviceFailureCode: "LOCAL_SERVICE_UNAVAILABLE",
  recoveryActions: sharedRecoveryActions,
  emptyStates: Object.values(sharedEmptyStateIds),
  mockExecutionCode: "PROTOTYPE_MOCK_EXECUTED"
};

const i18n = {
  "zh-CN": {
    "nav.home": "首页",
    "nav.copilot": "智能助手",
    "nav.create": "内容生成",
    "nav.copy": "文案创作",
    "nav.translate": "智能翻译",
    "nav.storyboard": "分镜脚本",
    "nav.motion": "动效设计",
    "nav.expression": "表达式",
    "nav.script": "脚本工具",
    "nav.analyze": "智能分析",
    "nav.automate": "自动化流程",
    "nav.assets": "素材管理",
    "nav.library": "资源库",
    "nav.history": "历史记录",
    "nav.hostCenter": "宿主环境",
    "nav.commandCenter": "专业模式",
    "nav.providerHub": "模型平台",
    "nav.system": "设置",
    "commandCenter.eyebrow": "Kuroii Motion AI",
    "commandCenter.title": "Motion Assistant",
    "commandCenter.safety.readOnly": "只读模式：仅允许风险 0 的 Trusted Actions。",
    "commandCenter.sections.hostContext": "宿主上下文",
    "commandCenter.sections.trustedActions": "只读可信动作",
    "commandCenter.sections.resultHistory": "结果历史",
    "commandCenter.sections.commandDetail": "命令详情",
    "commandCenter.sections.diagnostics": "诊断",
    "commandCenter.sections.hostReadiness": "宿主预检",
    "commandCenter.sections.rehearsalResult": "彩排结果",
    "commandCenter.sections.hostSmokeRunbook": "宿主 Smoke Runbook",
    "commandCenter.sections.hostSmokeEvidencePack": "宿主 Smoke 证据包",
    "commandCenter.sections.hostSmokeReviewChecklist": "宿主 Smoke 复核清单",
    "commandCenter.sections.hostSmokeSessionDraft": "宿主 Smoke Session 草案",
    "commandCenter.sections.visualPreview": "三端视觉预览",
    "commandCenter.sections.visualReview": "视觉评审矩阵",
    "commandCenter.sections.visualSignoff": "视觉签核",
    "commandCenter.sections.visualEvidence": "视觉证据导出",
    "commandCenter.actions.clear": "清空",
    "commandCenter.actions.resetFilters": "重置",
    "commandCenter.actions.skipToWorkspace": "跳到命令区域",
    "commandCenter.activity.ready": "服务已连接",
    "commandCenter.activity.mockReady": "本地 Mock 就绪",
    "commandCenter.activity.refreshing": "正在刷新上下文",
    "commandCenter.activity.executing": "正在执行只读动作",
    "commandCenter.activity.loadingDetail": "正在读取命令详情",
    "commandCenter.activity.error": "需要处理连接问题",
    "commandCenter.recovery.retryRefresh": "重试刷新",
    "commandCenter.recovery.clearError": "清除错误",
    "commandCenter.recovery.useMockMode": "切换 Mock 模式",
    "commandCenter.recovery.resetFilters": "重置过滤",
    "commandCenter.recovery.viewLatestError": "查看最近错误",
    "commandCenter.filters.host": "宿主",
    "commandCenter.filters.action": "动作",
    "commandCenter.filters.status": "状态",
    "commandCenter.filters.query": "搜索",
    "commandCenter.filters.limit": "数量",
    "commandCenter.filters.all": "全部",
    "commandCenter.filters.selected": "当前宿主",
    "commandCenter.filters.success": "成功",
    "commandCenter.filters.failed": "失败",
    "commandCenter.detail.emptyTitle": "未选择命令",
    "commandCenter.detail.emptyMessage": "从结果历史中选择一条命令查看详情。",
    "commandCenter.detail.rawPayload": "原始载荷",
    "commandCenter.empty.noActions": "当前宿主暂无可用只读动作。",
    "commandCenter.empty.noHistory": "暂无执行记录。运行一个只读动作后会显示在这里。",
    "commandCenter.empty.noFilteredHistory": "没有符合当前过滤条件的记录。",
    "commandCenter.empty.noHosts": "暂无宿主连接。可先使用本地 Mock 查看流程。",
    "commandCenter.error.defaultAdvice": "确认 Local Service 已启动，或继续使用 Mock 模式。",
    "commandCenter.diagnostics.localService": "Local Service",
    "commandCenter.diagnostics.hostHeartbeat": "宿主心跳",
    "commandCenter.diagnostics.trustedActions": "可信动作",
    "commandCenter.diagnostics.lastCommand": "最近错误",
    "commandCenter.diagnostics.localService.connected": "Local Service 已连接。",
    "commandCenter.diagnostics.localService.mock": "当前使用本地 Mock，未连接 Local Service。",
    "commandCenter.diagnostics.localService.error": "Local Service 需要处理。",
    "commandCenter.diagnostics.hostHeartbeat.connected": "当前宿主心跳正常。",
    "commandCenter.diagnostics.hostHeartbeat.stale": "当前宿主心跳可能过期。",
    "commandCenter.diagnostics.hostHeartbeat.offline": "当前宿主离线或没有心跳。",
    "commandCenter.diagnostics.trustedActions.ready": "当前宿主有可用只读动作。",
    "commandCenter.diagnostics.trustedActions.missing": "当前宿主缺少只读动作能力。",
    "commandCenter.diagnostics.lastCommand.clean": "最近没有命令错误。",
    "commandCenter.diagnostics.lastCommand.error": "最近命令出现错误。",
    "commandCenter.diagnostics.recoveryActions": "诊断恢复动作",
    "commandCenter.readiness.summary.ready": "已满足真实宿主测试预检。",
    "commandCenter.readiness.summary.warning": "预检有提醒项，建议先处理。",
    "commandCenter.readiness.summary.blocked": "真实宿主测试仍被预检阻止。",
    "commandCenter.readiness.localService": "Local Service",
    "commandCenter.readiness.localService.ready": "Local Service 已连接。",
    "commandCenter.readiness.localService.blocked": "需要先连接 Local Service。",
    "commandCenter.readiness.hostTarget": "宿主目标",
    "commandCenter.readiness.hostTarget.ready": "当前宿主目标可用。",
    "commandCenter.readiness.hostTarget.blocked": "需要选择一个在线宿主目标。",
    "commandCenter.readiness.hostHeartbeat": "宿主心跳",
    "commandCenter.readiness.hostHeartbeat.ready": "宿主心跳在允许窗口内。",
    "commandCenter.readiness.hostHeartbeat.blocked": "宿主心跳缺失或过期。",
    "commandCenter.readiness.trustedActions": "只读动作",
    "commandCenter.readiness.trustedActions.ready": "只读可信动作已可用。",
    "commandCenter.readiness.trustedActions.blocked": "需要至少一个风险 0 的只读动作。",
    "commandCenter.readiness.commandHistory": "命令历史",
    "commandCenter.readiness.commandHistory.ready": "命令历史可读取。",
    "commandCenter.readiness.commandHistory.warning": "命令历史为空，建议先执行一次只读动作。",
    "commandCenter.readiness.commandHistory.blocked": "需要 Local Service 命令历史端点。",
    "commandCenter.readiness.diagnosticRecovery": "诊断恢复",
    "commandCenter.readiness.diagnosticRecovery.ready": "诊断阻断项已有恢复动作。",
    "commandCenter.readiness.diagnosticRecovery.blocked": "诊断阻断项缺少恢复动作。",
    "commandCenter.readiness.viewRelatedArea": "查看对应区域",
    "commandCenter.rehearsal.status.ready": "彩排通过，可以进入手动宿主 smoke 准备。",
    "commandCenter.rehearsal.status.blocked": "彩排被阻止，请先处理下方检查项。",
    "commandCenter.rehearsal.canProceed": "可进入手动宿主 smoke",
    "commandCenter.rehearsal.cannotProceed": "暂不可进入手动宿主 smoke",
    "commandCenter.rehearsal.checks": "检查项",
    "commandCenter.rehearsal.history": "模拟结果历史",
    "commandCenter.rehearsal.pass": "通过",
    "commandCenter.rehearsal.blocked": "阻止",
    "commandCenter.rehearsal.allowed": "允许动作",
    "commandCenter.rehearsal.forbidden": "禁用动作",
    "commandCenter.rehearsal.simulated": "模拟记录",
    "commandCenter.rehearsal.failureReason": "失败原因",
    "commandCenter.rehearsal.noFailure": "未触发失败中断",
    "commandCenter.rehearsal.readOnlyRecord": "只读记录，未修改宿主工程",
    "commandCenter.rehearsal.noHistory": "暂无模拟结果历史。",
    "commandCenter.rehearsal.toggle": "折叠彩排结果",
    "commandCenter.rehearsal.check.checklist-loaded": "交接清单已加载",
    "commandCenter.rehearsal.check.target-lock-valid": "宿主目标锁定有效",
    "commandCenter.rehearsal.check.selected-host-connected": "当前宿主已连接",
    "commandCenter.rehearsal.check.required-readiness-ready": "必需预检已就绪",
    "commandCenter.rehearsal.check.allowed-actions-present": "存在允许的只读动作",
    "commandCenter.rehearsal.check.forbidden-actions-absent": "无禁用动作混入",
    "commandCenter.rehearsal.check.result-history-captures-read-only-records": "结果历史捕获只读记录",
    "commandCenter.rehearsal.check.failure-interrupts-run": "失败会中断运行",
    "commandCenter.runbook.copy": "复制",
    "commandCenter.runbook.exportMarkdown": "导出 MD",
    "commandCenter.runbook.exportJson": "导出 JSON",
    "commandCenter.runbook.status.ready": "Runbook 已就绪，可按人工步骤继续。",
    "commandCenter.runbook.status.blocked": "Runbook 已生成，但仍存在阻断项。",
    "commandCenter.runbook.canProceed": "可继续",
    "commandCenter.runbook.cannotProceed": "暂不可继续",
    "commandCenter.runbook.copyOk": "Runbook 已复制",
    "commandCenter.runbook.copyFailed": "复制不可用，请手动选择文本",
    "commandCenter.runbook.feedback.generated": "Runbook 已在本地生成。",
    "commandCenter.runbook.feedback.copySuccess": "Markdown 已复制到剪贴板。",
    "commandCenter.runbook.feedback.copyFailed": "复制失败，请手动选择预览文本。",
    "commandCenter.runbook.feedback.exportMarkdownSuccess": "Markdown 草案已开始本地导出。",
    "commandCenter.runbook.feedback.exportJsonSuccess": "JSON 草案已开始本地导出。",
    "commandCenter.runbook.feedback.exportFailed": "导出失败，请复制预览文本作为备用。",
    "commandCenter.runbook.feedback.lastAction": "最近动作",
    "commandCenter.runbook.feedback.persisted": "已保存轻量状态",
    "commandCenter.evidencePack.copy": "复制",
    "commandCenter.evidencePack.exportMarkdown": "导出 MD",
    "commandCenter.evidencePack.exportJson": "导出 JSON",
    "commandCenter.evidencePack.status.ready": "证据包草案已就绪，可供人工复核。",
    "commandCenter.evidencePack.status.blocked": "证据包草案已生成，但仍有阻断项。",
    "commandCenter.evidencePack.canProceed": "可进入人工复核",
    "commandCenter.evidencePack.cannotProceed": "暂不可进入人工复核",
    "commandCenter.evidencePack.notesLabel": "人工检查备注",
    "commandCenter.evidencePack.notesPlaceholder": "记录人工检查结论、项目副本状态或需要复查的阻断项。不要填写 API Key、Token 或私人项目内容。",
    "commandCenter.evidencePack.notesSaved": "备注已保存本地草案",
    "commandCenter.evidencePack.copyOk": "证据包 Markdown 已复制",
    "commandCenter.evidencePack.copyFailed": "复制失败，请手动选择预览文本",
    "commandCenter.evidencePack.exportMarkdownSuccess": "证据包 Markdown 草案已开始本地导出。",
    "commandCenter.evidencePack.exportJsonSuccess": "证据包 JSON 草案已开始本地导出。",
    "commandCenter.evidencePack.exportFailed": "证据包导出失败，请复制预览文本作为备用。",
    "commandCenter.reviewChecklist.reset": "重置",
    "commandCenter.reviewChecklist.status.ready": "复核清单已完成，可进入人工宿主 smoke 前最后确认。",
    "commandCenter.reviewChecklist.status.needsReview": "复核条件已满足，请逐项人工确认。",
    "commandCenter.reviewChecklist.status.blocked": "复核清单仍被阻断，请先处理条件项。",
    "commandCenter.reviewChecklist.ready": "已确认",
    "commandCenter.reviewChecklist.needsReview": "待确认",
    "commandCenter.reviewChecklist.blocked": "阻断",
    "commandCenter.reviewChecklist.summary": "复核进度",
    "commandCenter.reviewChecklist.item.evidencePackGenerated": "证据包已生成并可追溯",
    "commandCenter.reviewChecklist.item.projectCopyConfirmed": "已确认使用可丢弃或已备份项目副本",
    "commandCenter.reviewChecklist.item.targetLockReviewed": "已复核 target lock 与当前宿主一致",
    "commandCenter.reviewChecklist.item.readinessBlockersReviewed": "已复核 readiness 无阻断项",
    "commandCenter.reviewChecklist.item.runbookExportReviewed": "已复核 Runbook 导出反馈状态",
    "commandCenter.reviewChecklist.item.allowedActionsReviewed": "已复核只读动作白名单",
    "commandCenter.reviewChecklist.item.manualNotesReviewed": "已复核人工检查备注",
    "commandCenter.reviewChecklist.item.sensitiveDataReviewed": "已确认备注不含 API Key、Token 或私人项目内容",
    "commandCenter.reviewChecklist.item.manualLaunchOnlyConfirmed": "已确认 AE/PR 只由用户手动打开",
    "commandCenter.sessionDraft.save": "生成",
    "commandCenter.sessionDraft.copy": "复制",
    "commandCenter.sessionDraft.exportMarkdown": "导出 MD",
    "commandCenter.sessionDraft.exportJson": "导出 JSON",
    "commandCenter.sessionDraft.reset": "重置",
    "commandCenter.sessionDraft.status.ready": "Session 草案已就绪，可等待用户手动打开宿主。",
    "commandCenter.sessionDraft.status.blocked": "Session 草案仍被复核条件阻断。",
    "commandCenter.sessionDraft.canStart": "可开始记录",
    "commandCenter.sessionDraft.cannotStart": "暂不可开始",
    "commandCenter.sessionDraft.saved": "Session 草案已保存本地",
    "commandCenter.sessionDraft.copyOk": "Session 草案 Markdown 已复制",
    "commandCenter.sessionDraft.copyFailed": "复制失败，请手动选择预览文本",
    "commandCenter.sessionDraft.exportMarkdownSuccess": "Session 草案 Markdown 已开始本地导出。",
    "commandCenter.sessionDraft.exportJsonSuccess": "Session 草案 JSON 已开始本地导出。",
    "commandCenter.sessionDraft.exportFailed": "Session 草案导出失败，请复制预览文本作为备用。",
    "commandCenter.sessionDraft.startConditions": "开始条件",
    "commandCenter.sessionDraft.allowedActions": "允许动作",
    "commandCenter.sessionDraft.stopConditions": "停止条件",
    "commandCenter.sessionDraft.placeholders": "结果占位",
    "commandCenter.visualPreview.overviewToggle": "功能总览",
    "commandCenter.visualPreview.overviewClose": "收起总览",
    "commandCenter.visualPreview.summary": "视觉预览层已就绪：Desktop 完整工作区，AE/PR 紧凑扩展面板；仅用于评审，不启动宿主。",
    "commandCenter.visualPreview.profile": "界面规格",
    "commandCenter.visualPreview.density": "密度",
    "commandCenter.visualPreview.brandLevel": "品牌层级",
    "commandCenter.visualPreview.widthChecks": "宽度检查",
    "commandCenter.visualPreview.actions": "只读动作",
    "commandCenter.visualPreview.previewOnly": "仅视觉预览",
    "commandCenter.visualPreview.surface.desktop": "Desktop 中控",
    "commandCenter.visualPreview.surface.afterEffects": "After Effects 面板",
    "commandCenter.visualPreview.surface.premierePro": "Premiere Pro 面板",
    "commandCenter.visualPreview.notes.desktop": "保留完整侧栏、顶部状态和命令中心层级，专业区以 L0/L1 为主。",
    "commandCenter.visualPreview.notes.afterEffects": "240/320/420px 紧凑宽度可用，强调合成上下文和只读动作。",
    "commandCenter.visualPreview.notes.premierePro": "保持剪辑工作区密度，强调序列上下文、状态灯和只读记录。",
    "commandCenter.visualPreview.drawerTitle": "功能区总览",
    "commandCenter.visualPreview.drawerDesktop": "Desktop：命令中心、宿主预检、Runbook、证据包与 Session 草案。",
    "commandCenter.visualPreview.drawerAe": "AE：项目 / 合成 / 选中图层上下文，只读动作和本地心跳状态。",
    "commandCenter.visualPreview.drawerPr": "PR：项目 / 序列上下文，只读动作、字幕 / Marker 后续入口和事件日志。",
    "commandCenter.visualPreview.drawerSafety": "安全：本阶段不自动启动 AE/PR，不执行真实宿主动作，不修改工程。",
    "commandCenter.visualReview.summary": "截图评审矩阵已建立：先完成人工视觉签核，再进入真实宿主 smoke。",
    "commandCenter.visualReview.pending": "待评审",
    "commandCenter.visualReview.fileName": "截图文件",
    "commandCenter.visualReview.scorecard": "评分卡",
    "commandCenter.visualReview.blockers": "阻断项",
    "commandCenter.visualReview.minimumScore": "最低分",
    "commandCenter.visualReview.notes.desktopExpanded": "检查完整侧栏、顶部状态、命令区层级和专业区品牌克制。",
    "commandCenter.visualReview.notes.desktopCollapsed": "检查收起侧栏识别、英文短文案和 Tooltip。",
    "commandCenter.visualReview.notes.lightTheme": "检查浅色主题下 Dropdown、Tooltip、Panel 对比度。",
    "commandCenter.visualReview.notes.englishDensity": "检查英文长文本不溢出、不撑破按钮和卡片。",
    "commandCenter.visualReview.notes.aeNarrow": "AE 240px 窄面板不得横向溢出。",
    "commandCenter.visualReview.notes.aeEnglish": "AE 英文紧凑面板按钮和日志可读。",
    "commandCenter.visualReview.notes.aeLight": "AE 浅色紧凑面板状态灯和边界可读。",
    "commandCenter.visualReview.notes.prNarrow": "PR 240px 窄面板保持剪辑工作区密度。",
    "commandCenter.visualReview.notes.prEnglish": "PR 英文紧凑面板序列上下文不溢出。",
    "commandCenter.visualReview.notes.prLight": "PR 浅色紧凑面板状态、日志和只读徽标可读。",
    "commandCenter.visualReview.blocker.unreadable-text": "文字不可读",
    "commandCenter.visualReview.blocker.horizontal-overflow": "窄屏横向溢出",
    "commandCenter.visualReview.blocker.missing-tooltip": "图标缺少 Tooltip",
    "commandCenter.visualReview.blocker.placeholder-question-marks": "出现问号占位或乱码",
    "commandCenter.visualReview.blocker.auto-host-launch": "出现自动启动宿主入口",
    "commandCenter.visualReview.blocker.host-mutation-control": "出现真实工程修改控件",
    "commandCenter.visualSignoff.summary": "视觉签核状态会保存在本地：所有截图通过且无未解决问题后，才能进入下一道人工门禁。",
    "commandCenter.visualSignoff.ready": "视觉签核已完成",
    "commandCenter.visualSignoff.needsReview": "仍需评审",
    "commandCenter.visualSignoff.blocked": "存在阻断",
    "commandCenter.visualSignoff.pending": "待评审",
    "commandCenter.visualSignoff.accepted": "通过",
    "commandCenter.visualSignoff.needsRecheck": "需复查",
    "commandCenter.visualSignoff.markAccepted": "标记通过",
    "commandCenter.visualSignoff.markBlocked": "标记阻断",
    "commandCenter.visualSignoff.markRecheck": "标记复查",
    "commandCenter.visualSignoff.findings": "问题回收",
    "commandCenter.visualSignoff.findingItem": "截图项",
    "commandCenter.visualSignoff.findingType": "问题类型",
    "commandCenter.visualSignoff.findingSeverity": "级别",
    "commandCenter.visualSignoff.findingNote": "备注",
    "commandCenter.visualSignoff.findingPlaceholder": "记录问题位置、表现和复查要求。",
    "commandCenter.visualSignoff.addFinding": "新增问题",
    "commandCenter.visualSignoff.resolveFinding": "已解决",
    "commandCenter.visualSignoff.noFindings": "暂无未解决问题。",
    "commandCenter.visualSignoff.reset": "重置签核",
    "commandCenter.visualSignoff.saved": "本地签核状态已保存",
    "commandCenter.visualSignoff.openFindings": "未解决问题",
    "commandCenter.visualSignoff.type.unreadable-text": "文字不可读",
    "commandCenter.visualSignoff.type.horizontal-overflow": "横向溢出",
    "commandCenter.visualSignoff.type.missing-tooltip": "缺少 Tooltip",
    "commandCenter.visualSignoff.type.placeholder-question-marks": "问号占位或乱码",
    "commandCenter.visualSignoff.type.contrast": "对比度",
    "commandCenter.visualSignoff.type.layout": "布局",
    "commandCenter.visualSignoff.type.copy": "文案",
    "commandCenter.visualSignoff.type.brand-consistency": "品牌一致性",
    "commandCenter.visualEvidence.summary": "视觉证据包会汇总截图矩阵、签核摘要和问题回收列表，供真实宿主 smoke 前人工复核。",
    "commandCenter.visualEvidence.ready": "视觉证据已就绪",
    "commandCenter.visualEvidence.needsReview": "仍需人工复核",
    "commandCenter.visualEvidence.copy": "复制",
    "commandCenter.visualEvidence.exportMarkdown": "导出 MD",
    "commandCenter.visualEvidence.exportJson": "导出 JSON",
    "commandCenter.visualEvidence.copyOk": "视觉证据 Markdown 已复制",
    "commandCenter.visualEvidence.copyFailed": "复制失败，请手动选择预览文本",
    "commandCenter.visualEvidence.exportMarkdownSuccess": "视觉证据 Markdown 草案已开始本地导出。",
    "commandCenter.visualEvidence.exportJsonSuccess": "视觉证据 JSON 草案已开始本地导出。",
    "commandCenter.visualEvidence.exportFailed": "视觉证据导出失败，请复制预览文本作为备用。",
    "commandCenter.visualEvidenceReviewLock.reviewer": "复核人",
    "commandCenter.visualEvidenceReviewLock.note": "复核备注",
    "commandCenter.visualEvidenceReviewLock.lock": "锁定证据",
    "commandCenter.visualEvidenceReviewLock.unlock": "解除锁定",
    "commandCenter.visualEvidenceReviewLock.locked": "证据已锁定",
    "commandCenter.visualEvidenceReviewLock.blocked": "存在待处理阻断项",
    "commandCenter.visualEvidenceReviewLock.pending-review": "等待复核人确认",
    "commandCenter.visualEvidenceReviewLock.openBlockers": "阻断项",
    "status.localMock": "本地 Mock",
    "status.service": "Local Service",
    "field.project": "项目",
    "field.projectId": "项目 ID",
    "field.activeTarget": "当前目标",
    "field.selection": "选中项",
    "field.lastSeen": "最近心跳",
    "field.mode": "模式",
    "detail.commandId": "命令 ID",
    "detail.host": "宿主",
    "detail.action": "动作",
    "detail.code": "代码",
    "detail.result": "结果",
    "detail.duration": "耗时",
    "detail.recordedAt": "记录时间"
  },
  "en-US": {
    "nav.home": "Home",
    "nav.copilot": "Assistant",
    "nav.create": "Create",
    "nav.copy": "Copy",
    "nav.translate": "Translate",
    "nav.storyboard": "Storyboard",
    "nav.motion": "Motion",
    "nav.expression": "Expression",
    "nav.script": "Script",
    "nav.analyze": "Analyze",
    "nav.automate": "Automate",
    "nav.assets": "Assets",
    "nav.library": "Library",
    "nav.history": "History",
    "nav.hostCenter": "Host Center",
    "nav.commandCenter": "Professional",
    "nav.providerHub": "Provider Hub",
    "nav.system": "Settings",
    "commandCenter.eyebrow": "Kuroii Motion AI",
    "commandCenter.title": "Motion Assistant",
    "commandCenter.safety.readOnly": "Read-only mode: only risk-0 Trusted Actions are enabled.",
    "commandCenter.sections.hostContext": "Host Context",
    "commandCenter.sections.trustedActions": "Read-only Trusted Actions",
    "commandCenter.sections.resultHistory": "Result History",
    "commandCenter.sections.commandDetail": "Command Detail",
    "commandCenter.sections.diagnostics": "Diagnostics",
    "commandCenter.sections.hostReadiness": "Host Readiness",
    "commandCenter.sections.rehearsalResult": "Rehearsal Result",
    "commandCenter.sections.hostSmokeRunbook": "Host Smoke Runbook",
    "commandCenter.sections.hostSmokeEvidencePack": "Host Smoke Evidence Pack",
    "commandCenter.sections.hostSmokeReviewChecklist": "Host Smoke Review Checklist",
    "commandCenter.sections.hostSmokeSessionDraft": "Host Smoke Session Draft",
    "commandCenter.sections.visualPreview": "Visual Preview",
    "commandCenter.sections.visualReview": "Visual Review Matrix",
    "commandCenter.sections.visualSignoff": "Visual Sign-off",
    "commandCenter.sections.visualEvidence": "Visual Evidence Export",
    "commandCenter.actions.clear": "Clear",
    "commandCenter.actions.resetFilters": "Reset",
    "commandCenter.actions.skipToWorkspace": "Skip to command workspace",
    "commandCenter.activity.ready": "Service connected",
    "commandCenter.activity.mockReady": "Local mock ready",
    "commandCenter.activity.refreshing": "Refreshing context",
    "commandCenter.activity.executing": "Running read-only action",
    "commandCenter.activity.loadingDetail": "Loading command detail",
    "commandCenter.activity.error": "Connection needs attention",
    "commandCenter.recovery.retryRefresh": "Retry refresh",
    "commandCenter.recovery.clearError": "Clear error",
    "commandCenter.recovery.useMockMode": "Use mock mode",
    "commandCenter.recovery.resetFilters": "Reset filters",
    "commandCenter.recovery.viewLatestError": "View latest error",
    "commandCenter.filters.host": "Host",
    "commandCenter.filters.action": "Action",
    "commandCenter.filters.status": "Status",
    "commandCenter.filters.query": "Search",
    "commandCenter.filters.limit": "Limit",
    "commandCenter.filters.all": "All",
    "commandCenter.filters.selected": "Selected host",
    "commandCenter.filters.success": "Success",
    "commandCenter.filters.failed": "Failed",
    "commandCenter.detail.emptyTitle": "No command selected",
    "commandCenter.detail.emptyMessage": "Select a command from result history to inspect details.",
    "commandCenter.detail.rawPayload": "Raw payload",
    "commandCenter.empty.noActions": "No read-only actions are available for the selected host.",
    "commandCenter.empty.noHistory": "No execution records yet. Run a read-only action to populate this table.",
    "commandCenter.empty.noFilteredHistory": "No records match the current filters.",
    "commandCenter.empty.noHosts": "No host connection yet. You can still inspect the local mock flow.",
    "commandCenter.error.defaultAdvice": "Confirm Local Service is running, or continue in mock mode.",
    "commandCenter.diagnostics.localService": "Local Service",
    "commandCenter.diagnostics.hostHeartbeat": "Host Heartbeat",
    "commandCenter.diagnostics.trustedActions": "Trusted Actions",
    "commandCenter.diagnostics.lastCommand": "Last Error",
    "commandCenter.diagnostics.localService.connected": "Local Service is connected.",
    "commandCenter.diagnostics.localService.mock": "Local mock is active; Local Service is not connected.",
    "commandCenter.diagnostics.localService.error": "Local Service needs attention.",
    "commandCenter.diagnostics.hostHeartbeat.connected": "Selected host heartbeat is healthy.",
    "commandCenter.diagnostics.hostHeartbeat.stale": "Selected host heartbeat may be stale.",
    "commandCenter.diagnostics.hostHeartbeat.offline": "Selected host is offline or has no heartbeat.",
    "commandCenter.diagnostics.trustedActions.ready": "Selected host has read-only actions.",
    "commandCenter.diagnostics.trustedActions.missing": "Selected host is missing read-only action capability.",
    "commandCenter.diagnostics.lastCommand.clean": "No recent command errors.",
    "commandCenter.diagnostics.lastCommand.error": "A recent command failed.",
    "commandCenter.diagnostics.recoveryActions": "Diagnostic recovery actions",
    "commandCenter.readiness.summary.ready": "Ready for real host test preflight.",
    "commandCenter.readiness.summary.warning": "Preflight has warnings to review.",
    "commandCenter.readiness.summary.blocked": "Real host testing is still blocked by preflight.",
    "commandCenter.readiness.localService": "Local Service",
    "commandCenter.readiness.localService.ready": "Local Service is connected.",
    "commandCenter.readiness.localService.blocked": "Connect Local Service first.",
    "commandCenter.readiness.hostTarget": "Host Target",
    "commandCenter.readiness.hostTarget.ready": "Selected host target is available.",
    "commandCenter.readiness.hostTarget.blocked": "Select an online host target.",
    "commandCenter.readiness.hostHeartbeat": "Host Heartbeat",
    "commandCenter.readiness.hostHeartbeat.ready": "Host heartbeat is inside the allowed window.",
    "commandCenter.readiness.hostHeartbeat.blocked": "Host heartbeat is missing or stale.",
    "commandCenter.readiness.trustedActions": "Read-only Actions",
    "commandCenter.readiness.trustedActions.ready": "Read-only trusted actions are available.",
    "commandCenter.readiness.trustedActions.blocked": "At least one risk-0 read-only action is required.",
    "commandCenter.readiness.commandHistory": "Command History",
    "commandCenter.readiness.commandHistory.ready": "Command history is readable.",
    "commandCenter.readiness.commandHistory.warning": "Command history is empty; run a read-only action first.",
    "commandCenter.readiness.commandHistory.blocked": "Local Service command history endpoint is required.",
    "commandCenter.readiness.diagnosticRecovery": "Diagnostic Recovery",
    "commandCenter.readiness.diagnosticRecovery.ready": "Diagnostic blockers have recovery actions.",
    "commandCenter.readiness.diagnosticRecovery.blocked": "A diagnostic blocker is missing recovery actions.",
    "commandCenter.readiness.viewRelatedArea": "View related area",
    "commandCenter.rehearsal.status.ready": "Rehearsal passed. Manual host smoke prep can continue.",
    "commandCenter.rehearsal.status.blocked": "Rehearsal is blocked. Review the checks below first.",
    "commandCenter.rehearsal.canProceed": "Ready for manual host smoke",
    "commandCenter.rehearsal.cannotProceed": "Not ready for manual host smoke",
    "commandCenter.rehearsal.checks": "Checks",
    "commandCenter.rehearsal.history": "Simulated result history",
    "commandCenter.rehearsal.pass": "Pass",
    "commandCenter.rehearsal.blocked": "Blocked",
    "commandCenter.rehearsal.allowed": "Allowed actions",
    "commandCenter.rehearsal.forbidden": "Forbidden actions",
    "commandCenter.rehearsal.simulated": "Simulated records",
    "commandCenter.rehearsal.failureReason": "Failure reason",
    "commandCenter.rehearsal.noFailure": "No failure interrupt triggered",
    "commandCenter.rehearsal.readOnlyRecord": "Read-only record; no host project mutation",
    "commandCenter.rehearsal.noHistory": "No simulated result history yet.",
    "commandCenter.rehearsal.toggle": "Toggle rehearsal result",
    "commandCenter.rehearsal.check.checklist-loaded": "Handoff checklist loaded",
    "commandCenter.rehearsal.check.target-lock-valid": "Target lock is valid",
    "commandCenter.rehearsal.check.selected-host-connected": "Selected host is connected",
    "commandCenter.rehearsal.check.required-readiness-ready": "Required readiness checks are ready",
    "commandCenter.rehearsal.check.allowed-actions-present": "Allowed read-only actions are present",
    "commandCenter.rehearsal.check.forbidden-actions-absent": "No forbidden actions are mixed in",
    "commandCenter.rehearsal.check.result-history-captures-read-only-records": "Result history captures read-only records",
    "commandCenter.rehearsal.check.failure-interrupts-run": "Failure interrupts the run",
    "commandCenter.runbook.copy": "Copy",
    "commandCenter.runbook.exportMarkdown": "Export MD",
    "commandCenter.runbook.exportJson": "Export JSON",
    "commandCenter.runbook.status.ready": "Runbook is ready for manual steps.",
    "commandCenter.runbook.status.blocked": "Runbook is generated but still has blockers.",
    "commandCenter.runbook.canProceed": "Can proceed",
    "commandCenter.runbook.cannotProceed": "Cannot proceed yet",
    "commandCenter.runbook.copyOk": "Runbook copied",
    "commandCenter.runbook.copyFailed": "Clipboard unavailable; select the text manually",
    "commandCenter.runbook.feedback.generated": "Runbook generated locally.",
    "commandCenter.runbook.feedback.copySuccess": "Markdown copied to clipboard.",
    "commandCenter.runbook.feedback.copyFailed": "Copy failed. Select the preview text manually.",
    "commandCenter.runbook.feedback.exportMarkdownSuccess": "Markdown draft export started locally.",
    "commandCenter.runbook.feedback.exportJsonSuccess": "JSON draft export started locally.",
    "commandCenter.runbook.feedback.exportFailed": "Export failed. Copy the preview text as a fallback.",
    "commandCenter.runbook.feedback.lastAction": "Last action",
    "commandCenter.runbook.feedback.persisted": "Lightweight state saved",
    "commandCenter.evidencePack.copy": "Copy",
    "commandCenter.evidencePack.exportMarkdown": "Export MD",
    "commandCenter.evidencePack.exportJson": "Export JSON",
    "commandCenter.evidencePack.status.ready": "Evidence pack draft is ready for manual review.",
    "commandCenter.evidencePack.status.blocked": "Evidence pack draft is generated but still has blockers.",
    "commandCenter.evidencePack.canProceed": "Ready for manual review",
    "commandCenter.evidencePack.cannotProceed": "Manual review is not ready yet",
    "commandCenter.evidencePack.notesLabel": "Manual reviewer notes",
    "commandCenter.evidencePack.notesPlaceholder": "Record manual review findings, project-copy status, or blockers to revisit. Do not enter API keys, tokens, or private project content.",
    "commandCenter.evidencePack.notesSaved": "Notes saved to local draft",
    "commandCenter.evidencePack.copyOk": "Evidence pack Markdown copied",
    "commandCenter.evidencePack.copyFailed": "Copy failed. Select the preview text manually",
    "commandCenter.evidencePack.exportMarkdownSuccess": "Evidence pack Markdown draft export started locally.",
    "commandCenter.evidencePack.exportJsonSuccess": "Evidence pack JSON draft export started locally.",
    "commandCenter.evidencePack.exportFailed": "Evidence pack export failed. Copy the preview text as a fallback.",
    "commandCenter.reviewChecklist.reset": "Reset",
    "commandCenter.reviewChecklist.status.ready": "Review checklist is complete for the final manual host smoke confirmation.",
    "commandCenter.reviewChecklist.status.needsReview": "Review conditions are met. Confirm each item manually.",
    "commandCenter.reviewChecklist.status.blocked": "Review checklist is still blocked. Resolve the condition items first.",
    "commandCenter.reviewChecklist.ready": "Confirmed",
    "commandCenter.reviewChecklist.needsReview": "Needs review",
    "commandCenter.reviewChecklist.blocked": "Blocked",
    "commandCenter.reviewChecklist.summary": "Review progress",
    "commandCenter.reviewChecklist.item.evidencePackGenerated": "Evidence pack is generated and traceable",
    "commandCenter.reviewChecklist.item.projectCopyConfirmed": "Disposable or backed-up project copy is confirmed",
    "commandCenter.reviewChecklist.item.targetLockReviewed": "Target lock matches the selected host",
    "commandCenter.reviewChecklist.item.readinessBlockersReviewed": "Readiness blockers are reviewed and clear",
    "commandCenter.reviewChecklist.item.runbookExportReviewed": "Runbook export feedback state is reviewed",
    "commandCenter.reviewChecklist.item.allowedActionsReviewed": "Read-only action allowlist is reviewed",
    "commandCenter.reviewChecklist.item.manualNotesReviewed": "Manual reviewer notes are reviewed",
    "commandCenter.reviewChecklist.item.sensitiveDataReviewed": "Notes contain no API keys, tokens, or private project content",
    "commandCenter.reviewChecklist.item.manualLaunchOnlyConfirmed": "AE/PR will only be opened manually by the user",
    "commandCenter.sessionDraft.save": "Generate",
    "commandCenter.sessionDraft.copy": "Copy",
    "commandCenter.sessionDraft.exportMarkdown": "Export MD",
    "commandCenter.sessionDraft.exportJson": "Export JSON",
    "commandCenter.sessionDraft.reset": "Reset",
    "commandCenter.sessionDraft.status.ready": "Session draft is ready while waiting for the user to open the host manually.",
    "commandCenter.sessionDraft.status.blocked": "Session draft is still blocked by review conditions.",
    "commandCenter.sessionDraft.canStart": "Ready to record",
    "commandCenter.sessionDraft.cannotStart": "Cannot start yet",
    "commandCenter.sessionDraft.saved": "Session draft saved locally",
    "commandCenter.sessionDraft.copyOk": "Session draft Markdown copied",
    "commandCenter.sessionDraft.copyFailed": "Copy failed. Select the preview text manually",
    "commandCenter.sessionDraft.exportMarkdownSuccess": "Session draft Markdown export started locally.",
    "commandCenter.sessionDraft.exportJsonSuccess": "Session draft JSON export started locally.",
    "commandCenter.sessionDraft.exportFailed": "Session draft export failed. Copy the preview text as a fallback.",
    "commandCenter.sessionDraft.startConditions": "Start conditions",
    "commandCenter.sessionDraft.allowedActions": "Allowed actions",
    "commandCenter.sessionDraft.stopConditions": "Stop conditions",
    "commandCenter.sessionDraft.placeholders": "Result placeholders",
    "commandCenter.visualPreview.overviewToggle": "Feature Overview",
    "commandCenter.visualPreview.overviewClose": "Hide Overview",
    "commandCenter.visualPreview.summary": "Visual preview is ready: Desktop full workspace plus compact AE/PR extension panels. Review only; no host launch.",
    "commandCenter.visualPreview.profile": "Profile",
    "commandCenter.visualPreview.density": "Density",
    "commandCenter.visualPreview.brandLevel": "Brand level",
    "commandCenter.visualPreview.widthChecks": "Width checks",
    "commandCenter.visualPreview.actions": "Read-only actions",
    "commandCenter.visualPreview.previewOnly": "Visual preview only",
    "commandCenter.visualPreview.surface.desktop": "Desktop Command Center",
    "commandCenter.visualPreview.surface.afterEffects": "After Effects Panel",
    "commandCenter.visualPreview.surface.premierePro": "Premiere Pro Panel",
    "commandCenter.visualPreview.notes.desktop": "Keeps the full sidebar, top status, and command hierarchy; professional areas stay mostly L0/L1.",
    "commandCenter.visualPreview.notes.afterEffects": "Usable at 240/320/420px compact widths, focused on comp context and read-only actions.",
    "commandCenter.visualPreview.notes.premierePro": "Keeps editing-workspace density with sequence context, status lights, and read-only records.",
    "commandCenter.visualPreview.drawerTitle": "Feature Area Overview",
    "commandCenter.visualPreview.drawerDesktop": "Desktop: Command Center, host readiness, Runbook, evidence pack, and Session Draft.",
    "commandCenter.visualPreview.drawerAe": "AE: project / comp / selected-layer context, read-only actions, and local heartbeat state.",
    "commandCenter.visualPreview.drawerPr": "PR: project / sequence context, read-only actions, future subtitle / marker entry points, and event log.",
    "commandCenter.visualPreview.drawerSafety": "Safety: this phase does not auto-launch AE/PR, execute real host actions, or mutate projects.",
    "commandCenter.visualReview.summary": "Screenshot review matrix is ready. Complete manual visual sign-off before real host smoke.",
    "commandCenter.visualReview.pending": "Pending review",
    "commandCenter.visualReview.fileName": "Screenshot file",
    "commandCenter.visualReview.scorecard": "Scorecard",
    "commandCenter.visualReview.blockers": "Blockers",
    "commandCenter.visualReview.minimumScore": "Minimum score",
    "commandCenter.visualReview.notes.desktopExpanded": "Check full sidebar, top status, command hierarchy, and restrained branding in professional areas.",
    "commandCenter.visualReview.notes.desktopCollapsed": "Check collapsed sidebar identity, English short copy, and tooltips.",
    "commandCenter.visualReview.notes.lightTheme": "Check dropdown, tooltip, and panel contrast in light theme.",
    "commandCenter.visualReview.notes.englishDensity": "Check English text does not overflow buttons or cards.",
    "commandCenter.visualReview.notes.aeNarrow": "AE 240px narrow panel must not overflow horizontally.",
    "commandCenter.visualReview.notes.aeEnglish": "AE English compact panel buttons and logs remain readable.",
    "commandCenter.visualReview.notes.aeLight": "AE light compact panel status lights and borders remain readable.",
    "commandCenter.visualReview.notes.prNarrow": "PR 240px narrow panel keeps editing-workspace density.",
    "commandCenter.visualReview.notes.prEnglish": "PR English compact panel sequence context does not overflow.",
    "commandCenter.visualReview.notes.prLight": "PR light compact panel status, log, and read-only badges remain readable.",
    "commandCenter.visualReview.blocker.unreadable-text": "Unreadable text",
    "commandCenter.visualReview.blocker.horizontal-overflow": "Horizontal overflow",
    "commandCenter.visualReview.blocker.missing-tooltip": "Missing tooltip",
    "commandCenter.visualReview.blocker.placeholder-question-marks": "Question-mark placeholders or mojibake",
    "commandCenter.visualReview.blocker.auto-host-launch": "Automatic host launch entry",
    "commandCenter.visualReview.blocker.host-mutation-control": "Real project mutation control",
    "commandCenter.visualSignoff.summary": "Visual sign-off is saved locally. All shots must be accepted with no open findings before the next manual gate.",
    "commandCenter.visualSignoff.ready": "Visual sign-off complete",
    "commandCenter.visualSignoff.needsReview": "Needs review",
    "commandCenter.visualSignoff.blocked": "Blocked",
    "commandCenter.visualSignoff.pending": "Pending",
    "commandCenter.visualSignoff.accepted": "Accepted",
    "commandCenter.visualSignoff.needsRecheck": "Recheck",
    "commandCenter.visualSignoff.markAccepted": "Accept",
    "commandCenter.visualSignoff.markBlocked": "Block",
    "commandCenter.visualSignoff.markRecheck": "Recheck",
    "commandCenter.visualSignoff.findings": "Findings Backlog",
    "commandCenter.visualSignoff.findingItem": "Shot",
    "commandCenter.visualSignoff.findingType": "Type",
    "commandCenter.visualSignoff.findingSeverity": "Severity",
    "commandCenter.visualSignoff.findingNote": "Note",
    "commandCenter.visualSignoff.findingPlaceholder": "Record location, symptom, and recheck request.",
    "commandCenter.visualSignoff.addFinding": "Add Finding",
    "commandCenter.visualSignoff.resolveFinding": "Resolve",
    "commandCenter.visualSignoff.noFindings": "No open findings.",
    "commandCenter.visualSignoff.reset": "Reset Sign-off",
    "commandCenter.visualSignoff.saved": "Local sign-off state saved",
    "commandCenter.visualSignoff.openFindings": "Open findings",
    "commandCenter.visualSignoff.type.unreadable-text": "Unreadable text",
    "commandCenter.visualSignoff.type.horizontal-overflow": "Horizontal overflow",
    "commandCenter.visualSignoff.type.missing-tooltip": "Missing tooltip",
    "commandCenter.visualSignoff.type.placeholder-question-marks": "Question placeholders or mojibake",
    "commandCenter.visualSignoff.type.contrast": "Contrast",
    "commandCenter.visualSignoff.type.layout": "Layout",
    "commandCenter.visualSignoff.type.copy": "Copy",
    "commandCenter.visualSignoff.type.brand-consistency": "Brand consistency",
    "commandCenter.visualEvidence.summary": "Visual evidence bundles the screenshot matrix, sign-off summary, and findings backlog for manual review before real host smoke.",
    "commandCenter.visualEvidence.ready": "Visual evidence ready",
    "commandCenter.visualEvidence.needsReview": "Manual review still needed",
    "commandCenter.visualEvidence.copy": "Copy",
    "commandCenter.visualEvidence.exportMarkdown": "Export MD",
    "commandCenter.visualEvidence.exportJson": "Export JSON",
    "commandCenter.visualEvidence.copyOk": "Visual evidence Markdown copied",
    "commandCenter.visualEvidence.copyFailed": "Copy failed. Select the preview text manually",
    "commandCenter.visualEvidence.exportMarkdownSuccess": "Visual evidence Markdown draft export started locally.",
    "commandCenter.visualEvidence.exportJsonSuccess": "Visual evidence JSON draft export started locally.",
    "commandCenter.visualEvidence.exportFailed": "Visual evidence export failed. Copy the preview text as a fallback.",
    "commandCenter.visualEvidenceReviewLock.reviewer": "Reviewer",
    "commandCenter.visualEvidenceReviewLock.note": "Review note",
    "commandCenter.visualEvidenceReviewLock.lock": "Lock evidence",
    "commandCenter.visualEvidenceReviewLock.unlock": "Unlock",
    "commandCenter.visualEvidenceReviewLock.locked": "Evidence locked",
    "commandCenter.visualEvidenceReviewLock.blocked": "Open blockers remain",
    "commandCenter.visualEvidenceReviewLock.pending-review": "Awaiting reviewer confirmation",
    "commandCenter.visualEvidenceReviewLock.openBlockers": "Open blockers",
    "status.localMock": "Local Mock",
    "status.service": "Local Service",
    "field.project": "Project",
    "field.projectId": "Project ID",
    "field.activeTarget": "Active Target",
    "field.selection": "Selection",
    "field.lastSeen": "Last Seen",
    "field.mode": "Mode",
    "detail.commandId": "Command ID",
    "detail.host": "Host",
    "detail.action": "Action",
    "detail.code": "Code",
    "detail.result": "Result",
    "detail.duration": "Duration",
    "detail.recordedAt": "Recorded at"
  }
};

const navItems = [
  ["home", "home", "nav.home"],
  ["copilot", "message", "nav.copilot"],
  ["create", "spark", "nav.create"],
  ["copy", "type", "nav.copy"],
  ["translate", "translate", "nav.translate"],
  ["storyboard", "layout", "nav.storyboard"],
  ["motion", "wave", "nav.motion"],
  ["expression", "function", "nav.expression"],
  ["script", "code", "nav.script"],
  ["analyze", "scan", "nav.analyze"],
  ["automate", "refresh", "nav.automate"],
  ["assets", "box", "nav.assets"],
  ["library", "book", "nav.library"],
  ["history", "clock", "nav.history"],
  ["provider-hub", "provider", "nav.providerHub"],
  ["command-center", "layers", "nav.commandCenter"],
  ["system", "settings", "nav.system"]
];

const ACTIVE_VIEW_STORAGE_KEY = "kuroii.motionai.activeView.v1";
const ASSISTANT_CONVERSATION_STORAGE_KEY = "kuroii.motionai.assistantConversation.v1";
const ASSISTANT_CONVERSATION_LIMIT = 60;
const ASSISTANT_CONVERSATION_TEXT_LIMIT = 16000;

function readPersistedActiveView() {
  try {
    const candidate = window.localStorage?.getItem(ACTIVE_VIEW_STORAGE_KEY) || "";
    return navItems.some(([id]) => id === candidate) ? candidate : "home";
  } catch (_error) {
    return "home";
  }
}

function setActiveView(viewId) {
  const nextView = navItems.some(([id]) => id === viewId) ? viewId : "home";
  state.activeView = nextView;
  try {
    window.localStorage?.setItem(ACTIVE_VIEW_STORAGE_KEY, nextView);
  } catch (_error) {
    // The current page still works when local storage is unavailable.
  }
}

function normalizeAssistantConversationMessage(value) {
  if (!value || typeof value !== "object") return null;
  const role = value.role === "user" ? "user" : "assistant";
  const status = ["success", "error", "cancelled", "generating"].includes(value.status) ? value.status : "success";
  const limitText = (text) => String(text || "").slice(0, ASSISTANT_CONVERSATION_TEXT_LIMIT);
  const entry = {
    id: String(value.id || `assistant-message-restored-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    createdAt: String(value.createdAt || new Date().toISOString()),
    role,
    status,
    content: limitText(value.content),
    reasoning: limitText(value.reasoning),
    message: limitText(value.message),
    errorCode: limitText(value.errorCode),
    advice: Array.isArray(value.advice) ? value.advice.map(limitText).slice(0, 8) : [],
    usage: value.usage && typeof value.usage === "object" ? value.usage : null,
    binding: value.binding && typeof value.binding === "object" ? value.binding : null,
    generatedAt: value.generatedAt ? String(value.generatedAt) : null
  };
  if (entry.status === "generating") {
    entry.status = "cancelled";
    entry.message = "页面刷新前的回复未完成，请重新发送。";
  }
  return entry.content || entry.reasoning || entry.message || role === "user" ? entry : null;
}

function readPersistedAssistantConversation() {
  try {
    const raw = window.localStorage?.getItem(ASSISTANT_CONVERSATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeAssistantConversationMessage).filter(Boolean).slice(-ASSISTANT_CONVERSATION_LIMIT);
  } catch (_error) {
    return [];
  }
}

function persistAssistantConversation() {
  try {
    window.localStorage?.setItem(
      ASSISTANT_CONVERSATION_STORAGE_KEY,
      JSON.stringify(state.assistantConversation.slice(-ASSISTANT_CONVERSATION_LIMIT))
    );
  } catch (_error) {
    // Conversation history remains available for the current page when storage is unavailable.
  }
}

const initialActiveView = readPersistedActiveView();

const navGroups = [
  { id: "workspace", label: { "zh-CN": "工作区", "en-US": "Workspace" }, items: ["home", "copilot", "create"] },
  { id: "creative", label: { "zh-CN": "创作工具", "en-US": "Creative Tools" }, items: ["copy", "translate", "storyboard", "motion", "expression", "script"] },
  { id: "resources", label: { "zh-CN": "资源与管理", "en-US": "Resources" }, items: ["analyze", "automate", "assets", "library", "history", "provider-hub"] },
  { id: "system", label: { "zh-CN": "系统", "en-US": "System" }, items: ["command-center", "system"] }
];

const navIconPaths = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
  message: '<path d="M5 6.5h14v9H9l-4 4v-13z"/><path d="M8.5 10h7"/><path d="M8.5 13h4"/>',
  spark: '<path d="M12 3l1.5 5L18 10l-4.5 2L12 17l-1.5-5L6 10l4.5-2L12 3z"/><path d="M19 16l.7 2.1L22 19l-2.3.9L19 22l-.7-2.1L16 19l2.3-.9L19 16z"/>',
  type: '<path d="M4 6h16"/><path d="M8 6v14"/><path d="M16 6v14"/><path d="M6.5 20h3"/><path d="M14.5 20h3"/>',
  translate: '<path d="M4 5h9"/><path d="M8.5 3v2"/><path d="M5.5 9c1.2 2.7 3.4 4.8 6.5 6"/><path d="M12 9c-.8 2.2-2.7 4.5-6 6"/><path d="M14 21l4-10 4 10"/><path d="M15.5 17h5"/>',
  layout: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16"/><path d="M10 10v9"/>',
  wave: '<path d="M3 12c2.5-6 5.5 6 8 0s5.5 6 10 0"/>',
  function: '<path d="M8 20c2-6 2-10 4-16"/><path d="M5 9h9"/><path d="M14 14l5 5"/><path d="M19 14l-5 5"/>',
  code: '<path d="M8 8 4 12l4 4"/><path d="m16 8 4 4-4 4"/><path d="m13 5-2 14"/>',
  scan: '<path d="M4 8V5h3"/><path d="M17 5h3v3"/><path d="M20 16v3h-3"/><path d="M7 19H4v-3"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M18.2 9A7 7 0 0 0 6.6 6.6L4 9"/><path d="M5.8 15A7 7 0 0 0 17.4 17.4L20 15"/>',
  box: '<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7z"/><path d="m4.5 9 7.5 4 7.5-4"/><path d="M12 13v7"/>',
  book: '<path d="M5 5.5A3 3 0 0 1 8 3h11v16H8a3 3 0 0 0-3 3V5.5z"/><path d="M5 19a3 3 0 0 1 3-3h11"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  provider: '<path d="M5 6h14v4H5z"/><path d="M5 14h14v4H5z"/><path d="M8 8h.1M8 16h.1"/><path d="M12 8h4M12 16h4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7.3 7.3 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.8-1L14.4 3h-4.8l-.4 3a7 7 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a7.3 7.3 0 0 0 0 2L3 14.5l2 3.4 2.4-1a7 7 0 0 0 1.8 1l.4 3h4.8l.4-3a7 7 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>',
  play: '<path d="M7 5.5v13l11-6.5L7 5.5z"/>',
  back: '<path d="m14 6-6 6 6 6"/><path d="M8 12h11"/>'
};

function navIconSvg(name) {
  return `<svg class="navSvg" viewBox="0 0 24 24" aria-hidden="true">${navIconPaths[name] || navIconPaths.home}</svg>`;
}

function hydrateCommandIcons() {
  document.querySelectorAll("[data-command-icon]").forEach((node) => {
    node.innerHTML = navIconSvg(node.dataset.commandIcon);
  });
}

const featurePages = {
  copilot: {
    icon: "message",
    eyebrow: { "zh-CN": "Kuroii Assistant", "en-US": "Kuroii Assistant" },
    title: { "zh-CN": "小黑助手", "en-US": "Kuroii Assistant" },
    intro: { "zh-CN": "面向 AE / PR 工程上下文的对话入口，先理解当前合成、序列和选中内容，再给出可执行建议。", "en-US": "A context-aware assistant for AE / PR projects, compositions, sequences, and selected layers." },
    promptLabel: { "zh-CN": "向小黑说明任务", "en-US": "Brief Kuroii" },
    prompt: { "zh-CN": "例如：检查当前标题动画是否适合 15 秒广告片节奏，并给出可执行修改建议。", "en-US": "Example: Review the current title animation for a 15-second ad and suggest executable changes." },
    primary: { "zh-CN": "发送", "en-US": "Send" },
    secondary: { "zh-CN": "读取当前上下文", "en-US": "Read Context" },
    chips: ["分析当前工程", "生成执行步骤", "解释表达式", "检查风险"],
    metrics: [["Context", "AE + PR"], ["Mode", "Read-only"], ["Risk", "0"]],
    outputTitle: { "zh-CN": "对话草稿", "en-US": "Draft Response" },
    outputRows: ["已读取宿主状态", "等待用户输入任务", "高风险动作将进入确认流程"],
    sideTitle: { "zh-CN": "上下文范围", "en-US": "Context Scope" },
    sideItems: ["当前合成 / 序列", "选中图层 / 剪辑", "可用只读动作"],
    historyTitle: { "zh-CN": "最近对话", "en-US": "Recent Chats" },
    historyRows: ["标题动效节奏建议", "字幕断点检查", "表达式解释"]
  },
  create: {
    icon: "spark",
    eyebrow: { "zh-CN": "Content Generation", "en-US": "Content Generation" },
    title: { "zh-CN": "内容生成", "en-US": "Content Generation" },
    intro: { "zh-CN": "生成广告片结构、创意方向、镜头段落和可交付文本，后续可转入分镜与动效模块。", "en-US": "Generate ad structures, creative directions, shot sections, and delivery-ready text." },
    promptLabel: { "zh-CN": "生成需求", "en-US": "Generation Brief" },
    prompt: { "zh-CN": "例如：为一款二次元放置手游生成 30 秒短视频广告结构，包含开头钩子和结尾 CTA。", "en-US": "Example: Create a 30-second ad structure for an anime idle mobile game with hook and CTA." },
    primary: { "zh-CN": "生成内容", "en-US": "Generate" },
    secondary: { "zh-CN": "套用工作流", "en-US": "Use Workflow" },
    chips: ["广告结构", "短视频脚本", "产品卖点", "标题方案"],
    metrics: [["Format", "Script"], ["Shots", "6"], ["Host", "AE / PR"]],
    outputTitle: { "zh-CN": "生成预览", "en-US": "Generation Preview" },
    outputRows: ["Hook：前三秒视觉冲突", "Middle：展示核心卖点", "CTA：引导下载或预约"],
    sideTitle: { "zh-CN": "生成参数", "en-US": "Generation Settings" },
    sideItems: ["视频时长", "平台比例", "语气与受众"],
    historyTitle: { "zh-CN": "生成记录", "en-US": "Generation History" },
    historyRows: ["游戏广告片结构", "电商产品卖点", "短视频口播稿"]
  },
  copy: {
    icon: "type",
    eyebrow: { "zh-CN": "Copywriting", "en-US": "Copywriting" },
    title: { "zh-CN": "文案创作", "en-US": "Copywriting" },
    intro: { "zh-CN": "为标题、字幕、按钮、口播和发布文案生成可直接进入 AE / PR 的文本方案。", "en-US": "Create titles, subtitles, buttons, voiceover, and publishing copy for AE / PR." },
    promptLabel: { "zh-CN": "文案目标", "en-US": "Copy Goal" },
    prompt: { "zh-CN": "例如：给当前游戏广告做 5 组标题，语气要强冲突、短句、适合竖屏开头。", "en-US": "Example: Make five short high-conflict titles for the current game ad opening." },
    primary: { "zh-CN": "生成文案", "en-US": "Write Copy" },
    secondary: { "zh-CN": "改写选中文本", "en-US": "Rewrite Selection" },
    chips: ["标题", "字幕", "口播", "CTA"],
    metrics: [["Variants", "5"], ["Tone", "Direct"], ["Length", "Short"]],
    outputTitle: { "zh-CN": "候选文案", "en-US": "Copy Variants" },
    outputRows: ["别眨眼，下一秒反转", "这次不是升级，是重开", "点击前先想好代价"],
    sideTitle: { "zh-CN": "文案约束", "en-US": "Copy Constraints" },
    sideItems: ["字数限制", "语气", "平台规范"],
    historyTitle: { "zh-CN": "文案历史", "en-US": "Copy History" },
    historyRows: ["广告标题 A/B", "字幕压缩", "发布文案"]
  },
  translate: {
    icon: "translate",
    eyebrow: { "zh-CN": "Localization", "en-US": "Localization" },
    title: { "zh-CN": "智能翻译", "en-US": "Smart Translation" },
    intro: { "zh-CN": "面向字幕、图层文本和发布素材的多语言翻译，保留时间轴、断句和术语一致性。", "en-US": "Translate subtitles, layer text, and publishing assets while preserving timing and terms." },
    promptLabel: { "zh-CN": "翻译说明", "en-US": "Translation Notes" },
    prompt: { "zh-CN": "例如：把当前字幕翻译成英文和日文，保留游戏术语，不改变每条字幕长度太多。", "en-US": "Example: Translate current subtitles into English and Japanese while preserving game terms." },
    primary: { "zh-CN": "开始翻译", "en-US": "Translate" },
    secondary: { "zh-CN": "术语检查", "en-US": "Check Terms" },
    chips: ["字幕翻译", "图层文本", "术语表", "双语校对"],
    metrics: [["Lang", "ZH/EN"], ["Terms", "12"], ["Timing", "Keep"]],
    outputTitle: { "zh-CN": "翻译预览", "en-US": "Translation Preview" },
    outputRows: ["CN：立即开启冒险", "EN：Start the adventure now", "JP：今すぐ冒険を始めよう"],
    sideTitle: { "zh-CN": "语言设置", "en-US": "Language Settings" },
    sideItems: ["源语言", "目标语言", "术语锁定"],
    historyTitle: { "zh-CN": "翻译历史", "en-US": "Translation History" },
    historyRows: ["角色字幕 EN", "商店页文案 JP", "按钮文案双语"]
  },
  storyboard: {
    icon: "layout",
    eyebrow: { "zh-CN": "Storyboard", "en-US": "Storyboard" },
    title: { "zh-CN": "分镜脚本", "en-US": "Storyboard Script" },
    intro: { "zh-CN": "把创意文案拆成镜头、时长、画面元素、字幕和动效说明，方便进入 AE / PR 制作。", "en-US": "Break ideas into shots, timing, visuals, subtitles, and motion notes." },
    promptLabel: { "zh-CN": "分镜目标", "en-US": "Storyboard Goal" },
    prompt: { "zh-CN": "例如：把这段广告脚本拆成 6 个镜头，每个镜头给出时长、画面、字幕和转场。", "en-US": "Example: Split this ad script into six shots with timing, visuals, subtitles, and transitions." },
    primary: { "zh-CN": "生成分镜", "en-US": "Create Storyboard" },
    secondary: { "zh-CN": "导入脚本", "en-US": "Import Script" },
    chips: ["6 镜头", "15 秒", "转场建议", "字幕节奏"],
    metrics: [["Shots", "6"], ["Duration", "15s"], ["Export", "CSV"]],
    outputTitle: { "zh-CN": "镜头列表", "en-US": "Shot List" },
    outputRows: ["01 Hook · 0-3s · 强视觉冲突", "02 Gameplay · 3-7s · 核心卖点", "03 CTA · 12-15s · 下载引导"],
    sideTitle: { "zh-CN": "分镜字段", "en-US": "Storyboard Fields" },
    sideItems: ["镜头编号", "时长", "画面 / 字幕 / 转场"],
    historyTitle: { "zh-CN": "分镜历史", "en-US": "Storyboard History" },
    historyRows: ["手游买量脚本", "产品宣传片", "社媒短视频"]
  },
  motion: {
    icon: "wave",
    eyebrow: { "zh-CN": "Motion Design", "en-US": "Motion Design" },
    title: { "zh-CN": "动效设计", "en-US": "Motion Design" },
    intro: { "zh-CN": "根据当前图层、镜头节奏和品牌语气生成动效方案、关键帧说明和可执行步骤。", "en-US": "Generate motion plans, keyframe notes, and executable steps from layer and shot context." },
    promptLabel: { "zh-CN": "动效描述", "en-US": "Motion Brief" },
    prompt: { "zh-CN": "例如：给当前标题层做 0.8 秒科技感入场，结尾轻微回弹，适合游戏广告。", "en-US": "Example: Make a 0.8-second tech-style title intro with a subtle bounce." },
    primary: { "zh-CN": "生成动效", "en-US": "Generate Motion" },
    secondary: { "zh-CN": "分析节奏", "en-US": "Analyze Rhythm" },
    chips: ["入场", "退场", "转场", "镜头节奏"],
    metrics: [["Ease", "Back"], ["Time", "0.8s"], ["Layers", "3"]],
    outputTitle: { "zh-CN": "动效方案", "en-US": "Motion Plan" },
    outputRows: ["Position：快速推进", "Scale：96 到 100", "Opacity：0 到 100"],
    sideTitle: { "zh-CN": "动效参数", "en-US": "Motion Parameters" },
    sideItems: ["持续时间", "缓动曲线", "应用层级"],
    historyTitle: { "zh-CN": "动效历史", "en-US": "Motion History" },
    historyRows: ["标题入场", "按钮回弹", "镜头转场"]
  },
  expression: {
    icon: "function",
    eyebrow: { "zh-CN": "Expression", "en-US": "Expression" },
    title: { "zh-CN": "表达式", "en-US": "Expressions" },
    intro: { "zh-CN": "生成、解释和检查 AE 表达式，优先提供可调参数和错误恢复建议。", "en-US": "Generate, explain, and check AE expressions with editable controls and recovery advice." },
    promptLabel: { "zh-CN": "表达式需求", "en-US": "Expression Request" },
    prompt: { "zh-CN": "例如：给位置属性生成随机轻微漂浮表达式，支持频率和幅度两个控制项。", "en-US": "Example: Create a subtle floating position expression with frequency and amplitude controls." },
    primary: { "zh-CN": "生成表达式", "en-US": "Generate Expression" },
    secondary: { "zh-CN": "解释表达式", "en-US": "Explain" },
    chips: ["循环", "随机", "弹性", "控制器"],
    metrics: [["Controls", "2"], ["Safe", "Yes"], ["Host", "AE"]],
    outputTitle: { "zh-CN": "表达式预览", "en-US": "Expression Preview" },
    outputRows: ["freq = effect('Frequency')('Slider')", "amp = effect('Amplitude')('Slider')", "value + wiggle(freq, amp)"],
    sideTitle: { "zh-CN": "检查项", "en-US": "Checks" },
    sideItems: ["属性兼容", "控制器命名", "错误提示"],
    historyTitle: { "zh-CN": "表达式历史", "en-US": "Expression History" },
    historyRows: ["轻微漂浮", "数字递增", "循环摆动"]
  },
  script: {
    icon: "code",
    eyebrow: { "zh-CN": "Script Tools", "en-US": "Script Tools" },
    title: { "zh-CN": "脚本工具", "en-US": "Script Tools" },
    intro: { "zh-CN": "生成和管理 AE / PR 脚本草案，默认只读预览，执行前进入风险确认。", "en-US": "Create and manage AE / PR script drafts with read-only preview and risk confirmation." },
    promptLabel: { "zh-CN": "脚本任务", "en-US": "Script Task" },
    prompt: { "zh-CN": "例如：生成一个只读取当前合成图层名称并导出 JSON 的 AE JSX 脚本。", "en-US": "Example: Generate an AE JSX script that reads layer names and exports JSON." },
    primary: { "zh-CN": "生成脚本", "en-US": "Generate Script" },
    secondary: { "zh-CN": "风险检查", "en-US": "Risk Check" },
    chips: ["JSX", "UXP", "只读动作", "Undo Group"],
    metrics: [["Risk", "Preview"], ["Host", "AE / PR"], ["Mode", "Draft"]],
    outputTitle: { "zh-CN": "脚本预览", "en-US": "Script Preview" },
    outputRows: ["app.beginUndoGroup(...)", "读取当前合成", "输出图层摘要"],
    sideTitle: { "zh-CN": "安全策略", "en-US": "Safety Policy" },
    sideItems: ["默认不执行", "修改前确认", "保留回滚说明"],
    historyTitle: { "zh-CN": "脚本历史", "en-US": "Script History" },
    historyRows: ["读取图层名", "批量标记", "导出项目摘要"]
  },
  analyze: {
    icon: "scan",
    eyebrow: { "zh-CN": "Analysis", "en-US": "Analysis" },
    title: { "zh-CN": "智能分析", "en-US": "Smart Analysis" },
    intro: { "zh-CN": "检查工程健康、表达式错误、素材缺失、镜头节奏和导出风险，输出可定位建议。", "en-US": "Check health, expression errors, missing assets, rhythm, and export risks." },
    promptLabel: { "zh-CN": "分析范围", "en-US": "Analysis Scope" },
    prompt: { "zh-CN": "例如：检查当前工程是否存在缺失素材、过重表达式和可能影响导出的风险。", "en-US": "Example: Check the project for missing assets, heavy expressions, and export risks." },
    primary: { "zh-CN": "开始分析", "en-US": "Analyze" },
    secondary: { "zh-CN": "生成报告", "en-US": "Create Report" },
    chips: ["工程健康", "表达式", "素材", "性能"],
    metrics: [["Score", "92"], ["Issues", "3"], ["Mode", "Read-only"]],
    outputTitle: { "zh-CN": "分析结果", "en-US": "Analysis Result" },
    outputRows: ["未发现缺失素材", "2 个表达式可优化", "建议预合成复杂图层"],
    sideTitle: { "zh-CN": "分析维度", "en-US": "Dimensions" },
    sideItems: ["文件", "性能", "表达式", "插件"],
    historyTitle: { "zh-CN": "分析历史", "en-US": "Analysis History" },
    historyRows: ["广告片工程检查", "字幕层检查", "PR 序列检查"]
  },
  automate: {
    icon: "refresh",
    eyebrow: { "zh-CN": "Automation", "en-US": "Automation" },
    title: { "zh-CN": "自动化流程", "en-US": "Automation" },
    intro: { "zh-CN": "把多步操作组织成可复核流程，先 Dry Run，再按权限执行可信动作。", "en-US": "Organize multi-step work into reviewable workflows with Dry Run before execution." },
    promptLabel: { "zh-CN": "流程目标", "en-US": "Workflow Goal" },
    prompt: { "zh-CN": "例如：读取当前字幕层，批量检查断句，生成修正建议，但不要直接修改工程。", "en-US": "Example: Read subtitle layers, check line breaks, and produce fixes without editing." },
    primary: { "zh-CN": "创建流程", "en-US": "Create Workflow" },
    secondary: { "zh-CN": "Dry Run", "en-US": "Dry Run" },
    chips: ["读取", "检查", "生成", "确认执行"],
    metrics: [["Steps", "4"], ["Risk", "0"], ["Queue", "Ready"]],
    outputTitle: { "zh-CN": "流程草案", "en-US": "Workflow Draft" },
    outputRows: ["Step 1：读取上下文", "Step 2：检查字幕", "Step 3：生成修正建议"],
    sideTitle: { "zh-CN": "执行策略", "en-US": "Execution Policy" },
    sideItems: ["Dry Run", "用户确认", "结果记录"],
    historyTitle: { "zh-CN": "流程历史", "en-US": "Workflow History" },
    historyRows: ["字幕检查流程", "素材命名流程", "导出前预检"]
  },
  assets: {
    icon: "box",
    eyebrow: { "zh-CN": "Assets", "en-US": "Assets" },
    title: { "zh-CN": "素材管理", "en-US": "Asset Management" },
    intro: { "zh-CN": "管理工程素材、生成资产说明、检查缺失文件和整理命名，连接后可同步 AE / PR 项目。", "en-US": "Manage assets, descriptions, missing files, and naming across AE / PR projects." },
    promptLabel: { "zh-CN": "素材任务", "en-US": "Asset Task" },
    prompt: { "zh-CN": "例如：分析当前工程素材命名，找出不规范文件，并给出重命名建议。", "en-US": "Example: Analyze asset naming and suggest clean rename rules." },
    primary: { "zh-CN": "扫描素材", "en-US": "Scan Assets" },
    secondary: { "zh-CN": "生成命名规则", "en-US": "Naming Rules" },
    chips: ["素材扫描", "命名", "缺失文件", "标签"],
    metrics: [["Files", "128"], ["Missing", "0"], ["Tags", "18"]],
    outputTitle: { "zh-CN": "素材摘要", "en-US": "Asset Summary" },
    outputRows: ["视频素材：42", "图片素材：58", "音频素材：12"],
    sideTitle: { "zh-CN": "管理字段", "en-US": "Fields" },
    sideItems: ["文件类型", "路径", "标签", "授权备注"],
    historyTitle: { "zh-CN": "素材历史", "en-US": "Asset History" },
    historyRows: ["广告素材扫描", "图层命名建议", "音频素材整理"]
  },
  library: {
    icon: "book",
    eyebrow: { "zh-CN": "Library", "en-US": "Library" },
    title: { "zh-CN": "资源库", "en-US": "Library" },
    intro: { "zh-CN": "汇总本机生成的图片、音乐、配音与视频资产；可按类型检索、重开预览、下载或安全删除。", "en-US": "Browse locally generated images, music, voice, and video assets; filter, preview, download, or safely delete them." },
    promptLabel: { "zh-CN": "资产检索", "en-US": "Asset Search" },
    prompt: { "zh-CN": "例如：查找最近生成的游戏广告配音和横版主视觉。", "en-US": "Example: Find recent game-ad voiceovers and landscape key visuals." },
    primary: { "zh-CN": "搜索资源", "en-US": "Search" },
    secondary: { "zh-CN": "新建资源", "en-US": "New Asset" },
    chips: ["表达式", "脚本", "动效预设", "工作流"],
    metrics: [["Items", "64"], ["Tags", "22"], ["Local", "On"]],
    outputTitle: { "zh-CN": "资源结果", "en-US": "Library Results" },
    outputRows: ["标题弹性入场", "字幕安全边距模板", "PR Marker 工作流"],
    sideTitle: { "zh-CN": "资源分类", "en-US": "Categories" },
    sideItems: ["AI 模板", "动效", "脚本", "项目规范"],
    historyTitle: { "zh-CN": "最近打开", "en-US": "Recent Items" },
    historyRows: ["弹性标题表达式", "广告片流程", "字幕模板"]
  },
  history: {
    icon: "clock",
    eyebrow: { "zh-CN": "History", "en-US": "History" },
    title: { "zh-CN": "历史记录", "en-US": "History" },
    intro: { "zh-CN": "集中查看对话、生成、动作、导出和错误恢复记录，方便回溯每次 AI 操作。", "en-US": "Review conversations, generations, actions, exports, and recovery history." },
    promptLabel: { "zh-CN": "搜索历史", "en-US": "Search History" },
    prompt: { "zh-CN": "例如：查找今天和字幕、表达式、导出相关的所有操作记录。", "en-US": "Example: Find today's subtitle, expression, and export related operations." },
    primary: { "zh-CN": "搜索", "en-US": "Search" },
    secondary: { "zh-CN": "导出记录", "en-US": "Export" },
    chips: ["对话", "生成", "动作", "错误"],
    metrics: [["Today", "12"], ["Errors", "0"], ["Saved", "On"]],
    outputTitle: { "zh-CN": "时间线", "en-US": "Timeline" },
    outputRows: ["14:32 生成游戏广告标题", "14:28 优化字幕断句", "14:15 多语言翻译"],
    sideTitle: { "zh-CN": "筛选条件", "en-US": "Filters" },
    sideItems: ["宿主", "动作类型", "状态", "时间范围"],
    historyTitle: { "zh-CN": "导出选项", "en-US": "Export Options" },
    historyRows: ["Markdown", "JSON", "本地证据包"]
  },
  "provider-hub": {
    icon: "provider",
    eyebrow: { "zh-CN": "Provider Hub", "en-US": "Provider Hub" },
    title: { "zh-CN": "模型平台", "en-US": "Provider Hub" },
    intro: { "zh-CN": "集中管理语言、图片、视频、语音、本地模型等平台接入、模型发现、任务绑定和错误恢复。", "en-US": "Manage text, image, video, voice, local model providers, model discovery, routing, and recovery." },
    promptLabel: { "zh-CN": "平台接入", "en-US": "Provider Connection" },
    prompt: { "zh-CN": "选择能力类型和平台，填写 Base URL / API Key，刷新模型列表并绑定到任务。", "en-US": "Choose capability and provider, set Base URL / API key, refresh models, and bind tasks." },
    primary: { "zh-CN": "刷新模型", "en-US": "Refresh Models" },
    secondary: { "zh-CN": "测试连接", "en-US": "Test Connection" },
    chips: ["语言", "图片", "视频", "语音", "本地模型"],
    metrics: [["Providers", "8"], ["Types", "9"], ["Routing", "Manual"]],
    outputTitle: { "zh-CN": "模型发现", "en-US": "Model Discovery" },
    outputRows: ["语言模型：GPT-4.1 / DeepSeek", "图片模型：GPT Image / Compatible Image", "视频与语音：预留异步任务接入"],
    sideTitle: { "zh-CN": "任务绑定", "en-US": "Task Binding" },
    sideItems: ["内容生成", "智能翻译", "分镜脚本", "动效设计", "素材管理"],
    historyTitle: { "zh-CN": "接入记录", "en-US": "Connection History" },
    historyRows: ["OpenAI 模型刷新", "DeepSeek 连接测试", "本地模型扫描"]
  },
  system: {
    icon: "settings",
    eyebrow: { "zh-CN": "Settings", "en-US": "Settings" },
    title: { "zh-CN": "设置", "en-US": "Settings" },
    intro: { "zh-CN": "集中管理主题语言、宿主连接、安全策略、本地缓存、快捷键、更新和关于信息。模型平台作为独立功能区进入。", "en-US": "Manage appearance, host connection, safety, cache, shortcuts, updates, and about. Provider Hub is a separate workspace." },
    promptLabel: { "zh-CN": "设置搜索", "en-US": "Settings Search" },
    prompt: { "zh-CN": "例如：切换主题语言、查看缓存目录、检查宿主连接或打开软件更新。", "en-US": "Example: Change appearance, inspect cache, check host connection, or open updates." },
    primary: { "zh-CN": "打开模型平台", "en-US": "Open Provider Hub" },
    secondary: { "zh-CN": "检查本地服务", "en-US": "Check Local Service" },
    chips: ["主题语言", "宿主连接", "安全权限", "缓存更新"],
    metrics: [["Theme", "Dark"], ["Locale", "ZH"], ["Host", "Mock"]],
    outputTitle: { "zh-CN": "设置摘要", "en-US": "Settings Summary" },
    outputRows: ["主题：Dark", "语言：中文", "宿主：AE / PR mock"],
    sideTitle: { "zh-CN": "设置分区", "en-US": "Sections" },
    sideItems: ["界面偏好", "宿主环境", "安全权限", "数据缓存", "快捷键", "软件更新"],
    historyTitle: { "zh-CN": "最近设置", "en-US": "Recent Settings" },
    historyRows: ["切换深色主题", "检查本地服务", "清理缓存"]
  }
};

const mockState = {
  target: { hostLock: true, targetHost: "after-effects" },
  hosts: [
    {
      host: "after-effects",
      displayName: "After Effects",
      status: "Connected",
      projectName: "Mock AE Project",
      projectId: "mock-ae-project",
      capabilityCount: 27,
      lastSeenAt: "2026-07-07T06:30:00Z"
    },
    {
      host: "premiere-pro",
      displayName: "Premiere Pro",
      status: "Offline",
      projectName: "Mock PR Project",
      projectId: "mock-pr-project",
      capabilityCount: 14,
      lastSeenAt: null
    }
  ],
  contexts: {
    "after-effects": {
      host: "after-effects",
      status: "Connected",
      project: { projectName: "Mock AE Project", projectId: "mock-ae-project" },
      connectionMode: "mock",
      lastSeenAt: "2026-07-07T06:30:00Z",
      context: {
        activeComp: { id: "comp-001", name: "Mock Comp" },
        selection: [{ id: "layer-1", name: "Title", type: "text", text: "Kuroii" }]
      }
    },
    "premiere-pro": {
      host: "premiere-pro",
      status: "Offline",
      project: { projectName: "Mock PR Project", projectId: "mock-pr-project" },
      connectionMode: "mock",
      lastSeenAt: null,
      context: {
        activeSequence: { id: "seq-001", name: "Mock Sequence" },
        selection: []
      }
    }
  },
  trustedActions: [
    { id: "ae.context.getProject", host: "after-effects", riskLevel: 0, readOnly: true },
    { id: "ae.context.getActiveComp", host: "after-effects", riskLevel: 0, readOnly: true },
    { id: "ae.context.getSelection", host: "after-effects", riskLevel: 0, readOnly: true },
    { id: "ae.text.readSelectedLayers", host: "after-effects", riskLevel: 0, readOnly: true },
    { id: "pr.context.getProject", host: "premiere-pro", riskLevel: 0, readOnly: true },
    { id: "pr.context.getActiveSequence", host: "premiere-pro", riskLevel: 0, readOnly: true }
  ],
  history: []
};

function readPersistedRunbookFeedbackState() {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(runbookExportFeedbackStorageKey) : null;
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writePersistedRunbookFeedbackState(value) {
  try {
    if (window.localStorage) {
      window.localStorage.setItem(runbookExportFeedbackStorageKey, JSON.stringify(value));
    }
  } catch (error) {
    // Local file previews may block storage; feedback still renders for the current session.
  }
}

function readPersistedEvidencePackNotes() {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(evidencePackNotesStorageKey) : null;
    return raw || "";
  } catch (error) {
    return "";
  }
}

function writePersistedEvidencePackNotes(value) {
  try {
    if (window.localStorage) {
      window.localStorage.setItem(evidencePackNotesStorageKey, String(value || ""));
    }
  } catch (error) {
    // Local file previews may block storage; notes still remain in the current session state.
  }
}

function readPersistedReviewChecklistState() {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(reviewChecklistStorageKey) : null;
    return raw ? JSON.parse(raw) : { checkedItems: [] };
  } catch (error) {
    return { checkedItems: [] };
  }
}

function writePersistedReviewChecklistState(value) {
  try {
    if (window.localStorage) {
      window.localStorage.setItem(reviewChecklistStorageKey, JSON.stringify(value));
    }
  } catch (error) {
    // Local file previews may block storage; checklist state still works in memory.
  }
}

function readPersistedSessionDraftState() {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(sessionDraftStorageKey) : null;
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writePersistedSessionDraftState(value) {
  try {
    if (window.localStorage) {
      window.localStorage.setItem(sessionDraftStorageKey, JSON.stringify(value));
    }
  } catch (error) {
    // Local file previews may block storage; session draft state still works in memory.
  }
}

function readPersistedVisualSignoffState() {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(visualSignoffStorageKey) : null;
    return raw ? JSON.parse(raw) : { statuses: {}, findings: [] };
  } catch (error) {
    return { statuses: {}, findings: [] };
  }
}

function writePersistedVisualSignoffState(value) {
  try {
    if (window.localStorage) {
      window.localStorage.setItem(visualSignoffStorageKey, JSON.stringify(value));
    }
  } catch (error) {
    // Local file previews may block storage; visual sign-off still works in memory.
  }
}

function defaultProviderProfile() {
  const defaultInstance = {
    profileId: "openai",
    name: "OpenAI",
    providerId: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKeyRef: "provider:openai:apiKey",
    apiKeyStatus: { configured: false, preview: "" },
    organization: "",
    model: "gpt-4.1",
    models: providerModelCatalog.openai || [],
    enabled: true,
    source: "prototype-default",
    updatedAt: null
  };
  return {
    version: 2,
    activeProfileId: "openai",
    activeProviderId: "openai",
    profileInstances: { openai: defaultInstance },
    profiles: {
      openai: defaultInstance
    },
    capabilityBindings: {
      text: { profileId: "openai", providerId: "openai", model: "gpt-4.1" },
      vision: { profileId: "openai", providerId: "openai", model: "gpt-4.1" },
      image: { profileId: "openai", providerId: "openai", model: "gpt-image-1" },
      video: {},
      voice: { providerId: "custom-base-url", model: "custom-voice" },
      speech: { providerId: "custom-base-url", model: "custom-speech" },
      music: { providerId: "custom-base-url", model: "custom-music" },
      sfx: { providerId: "custom-base-url", model: "custom-sfx" },
      local: { providerId: "ollama", model: "llama3.1" }
    },
    capabilityModelBindings: {},
    updatedAt: null,
    storage: "localStorage",
    secretStore: {
      backend: "local-service-required",
      scope: "none",
      encryptedAtRest: false
    }
  };
}

function sanitizeProviderHeaders(headers) {
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) return {};
  const sanitized = {};
  for (const [rawName, rawValue] of Object.entries(headers)) {
    const name = String(rawName || "").trim();
    const value = String(rawValue ?? "").trim();
    if (!name || name.toLowerCase() === "authorization") continue;
    if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name)) continue;
    if (/[\r\n]/.test(value)) continue;
    sanitized[name] = value;
  }
  return sanitized;
}

function formatProviderHeaders(headers) {
  return Object.entries(sanitizeProviderHeaders(headers))
    .map(([name, value]) => `${name}: ${value}`)
    .join("\n");
}

function parseProviderHeaders(value) {
  const headers = {};
  const lines = String(value || "").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator <= 0) return { headers: {}, error: "CONFIG_INVALID" };
    const name = line.slice(0, separator).trim();
    const headerValue = line.slice(separator + 1).trim();
    if (name.toLowerCase() === "authorization") continue;
    if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name) || /[\r\n]/.test(headerValue)) {
      return { headers: {}, error: "CONFIG_INVALID" };
    }
    headers[name] = headerValue;
  }
  return { headers, error: null };
}

function normalizeProviderCapabilities(value) {
  const allowed = new Set(providerCapabilities.map((item) => item.id));
  const capabilities = Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter((item) => allowed.has(item))
    : [];
  return [...new Set(capabilities.length ? capabilities : ["text"])];
}

function normalizeCapabilityBinding(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const providerId = String(value.providerId || "").trim();
  const model = String(value.model || "").trim();
  const profileId = String(value.profileId || "").trim();
  if (!providerId || !model) return null;
  return { ...(profileId ? { profileId } : {}), providerId, model };
}

function normalizeCapabilityModelBindings(value, fallbackBindings = {}) {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : Object.fromEntries(Object.entries(fallbackBindings).map(([capabilityId, binding]) => [capabilityId, [binding]]));
  const normalized = {};
  for (const capability of providerCapabilities) {
    const seen = new Set();
    const items = (Array.isArray(source[capability.id]) ? source[capability.id] : [])
      .map(normalizeCapabilityBinding)
      .filter((binding) => {
        if (!binding) return false;
        const identity = `${binding.profileId || ""}\u0000${binding.providerId}\u0000${binding.model}`;
        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
      });
    if (items.length) normalized[capability.id] = items;
  }
  return normalized;
}

function sanitizeProviderProfileForStorage(profile) {
  const defaults = defaultProviderProfile();
  const hasCapabilityModelBindings = Boolean(
    profile && Object.prototype.hasOwnProperty.call(profile, "capabilityModelBindings")
  );
  const next = { ...defaults, ...(profile || {}) };
  const sourceInstances = next.profileInstances && Object.keys(next.profileInstances).length
    ? next.profileInstances
    : Object.fromEntries(Object.entries(next.profiles || {}).map(([providerId, item]) => [providerId, {
      ...(item || {}),
      profileId: providerId,
      name: providerLabel(providerId)
    }]));
  const profileInstances = {};
  for (const [instanceId, item] of Object.entries(sourceInstances)) {
    const clean = { ...(item || {}) };
    delete clean.apiKey;
    delete clean.apiKeyDraft;
    const profileId = String(clean.profileId || instanceId);
    const providerId = String(clean.providerId || "openai");
    clean.profileId = profileId;
    clean.name = String(clean.name || providerLabel(providerId)).trim() || providerLabel(providerId);
    clean.providerId = providerId;
    clean.apiKeyRef = clean.apiKeyRef || `provider-profile:${profileId}:apiKey`;
    clean.apiKeyStatus = clean.apiKeyStatus || { configured: false, preview: "" };
    clean.models = Array.isArray(clean.models) ? normalizeProviderModels(clean.models) : (providerModelCatalog[providerId] || []);
    clean.enabled = clean.enabled !== false;
    if (providerId === "openai") {
      clean.organization = String(clean.organization || "").replace(/[\r\n]/g, "").trim();
    }
    if (providerId === "openai-compatible") {
      clean.modelsPath = String(clean.modelsPath || "/models").trim() || "/models";
      clean.chatPath = String(clean.chatPath || "/chat/completions").trim() || "/chat/completions";
      clean.imagesPath = String(clean.imagesPath || "/images/generations").trim() || "/images/generations";
      clean.videoPath = String(clean.videoPath || "/videos/generations").trim() || "/videos/generations";
      clean.videoStatusPath = String(clean.videoStatusPath || "/videos/generations/{taskId}").trim() || "/videos/generations/{taskId}";
      clean.headers = sanitizeProviderHeaders(clean.headers);
      clean.timeoutSeconds = Math.min(180, Math.max(1, Number(clean.timeoutSeconds) || 120));
      clean.defaultCapabilities = normalizeProviderCapabilities(clean.defaultCapabilities);
    }
    profileInstances[profileId] = clean;
  }
  const activeProfileId = profileInstances[next.activeProfileId]
    ? next.activeProfileId
    : Object.keys(profileInstances)[0];
  const activeInstance = profileInstances[activeProfileId] || {};
  const profiles = {};
  for (const item of Object.values(profileInstances)) {
    if (!profiles[item.providerId] || item.profileId === activeProfileId) profiles[item.providerId] = item;
  }
  const capabilityBindings = {
    ...defaults.capabilityBindings,
    ...(next.capabilityBindings || {})
  };
  return {
    ...next,
    version: 2,
    activeProfileId,
    activeProviderId: activeInstance.providerId || "openai",
    profileInstances,
    profiles,
    capabilityBindings,
    capabilityModelBindings: normalizeCapabilityModelBindings(
      hasCapabilityModelBindings ? next.capabilityModelBindings : undefined,
      hasCapabilityModelBindings ? {} : capabilityBindings
    )
  };
}

function readPersistedProviderProfile() {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(providerProfileStorageKey) : null;
    return sanitizeProviderProfileForStorage(raw ? JSON.parse(raw) : defaultProviderProfile());
  } catch (error) {
    return defaultProviderProfile();
  }
}

function writePersistedProviderProfile(value) {
  try {
    if (window.localStorage) {
      window.localStorage.setItem(providerProfileStorageKey, JSON.stringify(sanitizeProviderProfileForStorage(value)));
    }
  } catch (error) {
    // Local file previews may block storage; provider profile still works in memory.
  }
}

const persistedProviderProfile = readPersistedProviderProfile();
const liveTextFeatureIds = new Set(["copilot", "create", "copy", "translate", "storyboard", "motion", "expression", "script"]);
const imageAspectPresets = [
  ["1:1", "1:1"], ["16:9", "16:9"], ["9:16", "9:16"], ["21:9", "21:9"], ["4:3", "4:3"],
  ["3:4", "3:4"], ["3:2", "3:2"], ["2:3", "2:3"], ["5:4", "5:4"], ["4:5", "4:5"]
];
const imageOutputLongEdges = { "1k": 1024, "2k": 2048, "4k": 4096 };

function imageGenerationExportSpec(settings = {}) {
  const aspectRatio = imageAspectPresets.some(([value]) => value === settings.aspectRatio) ? settings.aspectRatio : "1:1";
  const outputResolution = imageOutputLongEdges[settings.outputResolution] ? settings.outputResolution : "1k";
  const [widthRatio, heightRatio] = aspectRatio.split(":").map(Number);
  const longEdge = imageOutputLongEdges[outputResolution];
  const width = widthRatio >= heightRatio ? longEdge : Math.round(longEdge * widthRatio / heightRatio);
  const height = widthRatio >= heightRatio ? Math.round(longEdge * heightRatio / widthRatio) : longEdge;
  const even = (value) => Math.max(2, value + (value % 2));
  return {
    aspectRatio,
    outputResolution,
    width: even(width),
    height: even(height),
    sourceSize: widthRatio === heightRatio ? "1024x1024" : (widthRatio > heightRatio ? "1536x1024" : "1024x1536")
  };
}

function syncImageGenerationExportSettings() {
  const spec = imageGenerationExportSpec(state.imageGenerationSettings);
  state.imageGenerationSettings = { ...state.imageGenerationSettings, ...spec, size: spec.sourceSize };
  return spec;
}

function defaultTextGenerationState() {
  return {
    prompt: "",
    status: "idle",
    content: "",
    reasoning: "",
    errorCode: null,
    message: "",
    advice: [],
    usage: null,
    binding: null,
    generatedAt: null
  };
}

function defaultImageGenerationState() {
  return {
    prompt: "",
    status: "idle",
    imageUrl: "",
    export: null,
    revisedPrompt: "",
    errorCode: null,
    message: "",
    advice: [],
    usage: null,
    binding: null,
    diagnostics: null,
    artifact: null,
    generatedAt: null
  };
}

function defaultVideoGenerationState() {
  return {
    prompt: "",
    status: "idle",
    task: null,
    errorCode: null,
    message: "",
    advice: [],
    binding: null,
    diagnostics: null
  };
}

function defaultMusicDirectionState() {
  return {
    brief: "",
    useCase: "video",
    mode: "instrumental",
    prompt: "",
    blueprint: "",
    status: "idle",
    audio: null,
    message: "",
    errorCode: null
  };
}

function defaultVoiceDirectionState() {
  return {
    script: "",
    language: "zh-CN",
    voice: "narrator",
    pace: "natural",
    emotion: "confident",
    voiceId: "male-qn-qingse",
    segments: [],
    status: "idle",
    audio: null,
    message: "",
    errorCode: null
  };
}

function defaultTextFeatureSettings() {
  return {
    create: {
      format: "short-video-script",
      durationSeconds: 30,
      tone: "direct"
    },
    translate: {
      sourceLanguage: "auto",
      targetLanguage: "en",
      preserveTiming: true
    },
    storyboard: {
      shots: 6,
      durationSeconds: 15
    }
  };
}

function providerConfigFromProfile(profile) {
  const activeProfileId = profile.activeProfileId || Object.keys(profile.profileInstances || {})[0] || "openai";
  const item = (profile.profileInstances && profile.profileInstances[activeProfileId]) || defaultProviderProfile().profileInstances.openai;
  const providerId = item.providerId || profile.activeProviderId || "openai";
  const models = Array.isArray(item.models) ? normalizeProviderModels(item.models) : (providerModelCatalog[providerId] || []);
  const model = item.model || (models[0] ? models[0].id : "");
  return {
    profileId: activeProfileId,
    name: item.name || providerLabel(providerId),
    providerId,
    baseUrl: item.baseUrl || (providerCatalog.find((provider) => provider.id === providerId) || providerCatalog[0]).baseUrl,
    apiKeyDraft: "",
    apiKeyRef: item.apiKeyRef || `provider:${providerId}:apiKey`,
    apiKeyStatus: item.apiKeyStatus || { configured: false, preview: "" },
    apiKeySaveState: "idle",
    organization: item.organization || "",
    modelsPath: item.modelsPath || "/models",
    chatPath: item.chatPath || "/chat/completions",
    imagesPath: item.imagesPath || "/images/generations",
    videoPath: item.videoPath || "/videos/generations",
    videoStatusPath: item.videoStatusPath || "/videos/generations/{taskId}",
    customHeadersText: formatProviderHeaders(item.headers),
    timeoutSeconds: Number(item.timeoutSeconds) || 120,
    defaultCapabilities: normalizeProviderCapabilities(item.defaultCapabilities),
    manualModelId: "",
    manualModelLabel: "",
    manualModelCapabilities: ["video"],
    model,
    models,
    status: "ready",
    errorCode: null,
    source: item.source || "local-profile",
    stage: profile.updatedAt ? "profile-loaded" : "preview",
    message: profile.updatedAt ? "Provider profile loaded." : "Mock model list ready.",
    advice: [],
    lastRefresh: profile.updatedAt || "mock-ready",
    lastTest: "-"
  };
}

const state = {
  locale: "zh-CN",
  themeMode: initialThemeMode,
  theme: resolveThemeMode(initialThemeMode),
  themeColor: initialThemeColor,
  accentColor: initialAccentColor,
  activeView: initialActiveView,
  selectedHost: "after-effects",
  selectedCommandId: null,
  detail: null,
  data: JSON.parse(JSON.stringify(mockState)),
  serviceOnline: false,
  pendingOperation: null,
  runningActionId: null,
  lastError: null,
  historyFilters: { host: "selected", action: "", status: "all", query: "", limit: 20 },
  rehearsalCollapsed: false,
  runbookExportFeedbackState: readPersistedRunbookFeedbackState(),
  evidencePackNotes: readPersistedEvidencePackNotes(),
  reviewChecklistState: readPersistedReviewChecklistState(),
  sessionDraftState: readPersistedSessionDraftState(),
  visualSignoffState: readPersistedVisualSignoffState(),
  visualEvidenceReviewLock: readPersistedVisualEvidenceReviewLock(),
  providerProfile: persistedProviderProfile,
  providerConfig: providerConfigFromProfile(persistedProviderProfile),
  providerHubTab: "connection",
  providerMobileView: "list",
  providerModelCapabilityFilter: "all",
  providerDeleteConfirmOpen: false,
  providerProfileReady: false,
  capabilityConnection: { status: "idle", byCapability: {} },
  createMode: "text",
  imageGeneration: defaultImageGenerationState(),
  imageGenerationSettings: {
    size: "1024x1024",
    aspectRatio: "1:1",
    outputResolution: "1k",
    quality: "medium",
    background: "opaque"
  },
  videoGeneration: defaultVideoGenerationState(),
  musicDirection: defaultMusicDirectionState(),
  voiceDirection: defaultVoiceDirectionState(),
  videoReadiness: { status: "idle", ready: false, code: "PROVIDER_BINDING_MISSING", message: "", advice: [] },
  videoGenerationSettings: { aspectRatio: "16:9", durationSeconds: 5, resolution: "720p" },
  videoTasks: [],
  videoTasksStatus: "idle",
  selectedVideoTaskId: null,
  imageHistory: [],
  imageHistoryStatus: "idle",
  imageHistoryStorage: null,
  imageHistoryNotice: "",
  audioHistory: [],
  audioHistoryStatus: "idle",
  audioHistoryStorage: null,
  audioHistoryNotice: "",
  assetLibrary: [],
  assetLibraryStatus: "idle",
  assetLibraryFilter: "all",
  assetLibraryQuery: "",
  selectedAssetLibraryId: null,
  assetLibraryDetail: null,
  assetLibraryPendingSelection: null,
  assetLibraryRegenerationConfirm: null,
  assetLibraryNotice: "",
  selectedImageHistoryId: null,
  selectedImageHistoryIds: [],
  imageInspectorTab: "history",
  textGeneration: {
    copilot: defaultTextGenerationState(),
    create: defaultTextGenerationState(),
    copy: defaultTextGenerationState(),
    translate: defaultTextGenerationState(),
    storyboard: defaultTextGenerationState()
  },
  assistantConversation: readPersistedAssistantConversation(),
  textFeatureSettings: defaultTextFeatureSettings(),
  professionalMode: "actions",
  professionalResourceQuery: "",
  professionalSelectedResource: {
    actions: null,
    workflows: "ae-safe-inspect",
    script: "main.jsx",
    expression: "Position.expression"
  },
  professionalInspectorOpen: false,
  professionalResourceOpen: false,
  professionalConsoleTab: "output",
  professionalDiagnosticsOpen: false,
  professionalDiagnosticsView: "status",
  professionalConsoleMessages: [],
  codeDocuments: {
    "main.jsx": "app.beginUndoGroup(\"Kuroii Read Layers\");\n\nvar comp = app.project.activeItem;\nvar result = [];\n\nif (comp && comp instanceof CompItem) {\n  for (var i = 1; i <= comp.numLayers; i++) {\n    result.push(comp.layer(i).name);\n  }\n}\n\napp.endUndoGroup();",
    "selection.jsx": "var comp = app.project.activeItem;\nvar selected = comp ? comp.selectedLayers : [];\nselected;",
    "Position.expression": "freq = effect(\"Frequency\")(\"Slider\");\namp = effect(\"Amplitude\")(\"Slider\");\nvalue + wiggle(freq, amp);",
    "Scale.expression": "delay = index * 0.08;\nt = Math.max(0, time - inPoint - delay);\neaseOut(t, 0, 0.45, [0, 0], value);",
    "Opacity.expression": "fade = framesToTime(12);\nease(time, inPoint, inPoint + fade, 0, value);"
  },
  visualOverviewOpen: false,
  focusAfterRender: null
};

let textGenerationController = null;
let imageGenerationController = null;
let videoGenerationController = null;
let professionalCodeEditor = null;
let featureCodeEditor = null;

function t(key) {
  return i18n[state.locale][key] || i18n["en-US"][key] || key;
}

function localText(value) {
  if (typeof value === "string") return value;
  return value[state.locale] || value["en-US"] || value["zh-CN"] || "";
}

function el(id) {
  return document.getElementById(id);
}

let activeKuroiiOverlay = null;
let kuroiiSelectSequence = 0;

function closeKuroiiOverlay({ restoreFocus = false } = {}) {
  if (!activeKuroiiOverlay) return;
  const overlay = activeKuroiiOverlay;
  activeKuroiiOverlay = null;
  overlay.cleanup();
  overlay.onClose?.();
  overlay.panel.remove();
  if (restoreFocus && document.body.contains(overlay.anchor)) overlay.anchor.focus({ preventScroll: true });
}

function closeKuroiiSelect(options) {
  closeKuroiiOverlay(options);
}

function selectedOptionLabel(select) {
  const selected = select.options[select.selectedIndex];
  return selected ? selected.textContent.trim() : "";
}

function customSelectAccessibleName(select) {
  const explicit = select.getAttribute("aria-label");
  if (explicit) return explicit;
  const label = select.closest("label");
  const labelText = label && label.querySelector(":scope > span");
  return labelText ? labelText.textContent.trim() : (select.name || select.id || "Select");
}

function positionKuroiiOverlay(anchor, panel, options = {}) {
  const rect = anchor.getBoundingClientRect();
  const gap = options.gap ?? 5;
  const viewportPadding = options.viewportPadding ?? 8;
  const maxWidth = Math.max(0, window.innerWidth - viewportPadding * 2);
  const width = Math.min(Math.max(rect.width, options.minWidth ?? 190), maxWidth);
  const availableBelow = Math.max(0, window.innerHeight - rect.bottom - viewportPadding - gap);
  const availableAbove = Math.max(0, rect.top - viewportPadding - gap);
  const maxHeight = options.maxHeight ?? 320;
  const desiredHeight = Math.min(panel.scrollHeight, maxHeight);
  const openBelow = availableBelow >= desiredHeight || availableBelow >= availableAbove;
  const availableHeight = openBelow ? availableBelow : availableAbove;
  const height = Math.min(desiredHeight, Math.max(0, availableHeight));
  const top = openBelow
    ? Math.min(Math.max(viewportPadding, rect.bottom + gap), window.innerHeight - height - viewportPadding)
    : Math.max(viewportPadding, rect.top - height - gap);
  panel.style.width = `${width}px`;
  panel.style.maxHeight = `${Math.max(0, availableHeight)}px`;
  panel.style.left = `${Math.min(Math.max(viewportPadding, rect.left), window.innerWidth - width - viewportPadding)}px`;
  panel.style.top = `${top}px`;
  panel.dataset.placement = openBelow ? "bottom" : "top";
}

function openKuroiiOverlay({ anchor, panel, onClose, options }) {
  closeKuroiiOverlay();
  document.body.appendChild(panel);
  positionKuroiiOverlay(anchor, panel, options);
  const outsideHandler = (event) => {
    if (!anchor.contains(event.target) && !panel.contains(event.target)) closeKuroiiOverlay();
  };
  const keydownHandler = (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeKuroiiOverlay({ restoreFocus: true });
  };
  const reposition = () => {
    if (!document.body.contains(anchor)) closeKuroiiOverlay();
    else positionKuroiiOverlay(anchor, panel, options);
  };
  document.addEventListener("pointerdown", outsideHandler, true);
  document.addEventListener("keydown", keydownHandler, true);
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, true);
  activeKuroiiOverlay = {
    anchor,
    panel,
    onClose,
    cleanup: () => {
      document.removeEventListener("pointerdown", outsideHandler, true);
      document.removeEventListener("keydown", keydownHandler, true);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    }
  };
}

function openKuroiiSelect(select, trigger, wrapper, focusDirection = 0) {
  if (select.disabled) return;
  closeKuroiiSelect();
  const menu = document.createElement("div");
  const menuId = `kuroii-select-menu-${++kuroiiSelectSequence}`;
  menu.id = menuId;
  menu.className = "kuroiiOverlay kuroiiSelectMenu";
  menu.setAttribute("role", "listbox");
  menu.setAttribute("aria-label", customSelectAccessibleName(select));
  trigger.setAttribute("aria-controls", menuId);
  trigger.setAttribute("aria-expanded", "true");
  wrapper.classList.add("open");

  Array.from(select.options).forEach((option, optionIndex) => {
    const item = document.createElement("button");
    item.id = `${menuId}-option-${optionIndex}`;
    item.type = "button";
    item.className = `kuroiiSelectOption${option.selected ? " selected" : ""}`;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", option.selected ? "true" : "false");
    item.disabled = option.disabled;
    item.textContent = option.textContent;
    item.addEventListener("click", () => {
      select.selectedIndex = optionIndex;
      trigger.querySelector("span").textContent = selectedOptionLabel(select);
      closeKuroiiSelect();
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      trigger.focus();
    });
    menu.appendChild(item);
  });

  openKuroiiOverlay({
    anchor: trigger,
    panel: menu,
    options: { minWidth: 190, maxHeight: 320 },
    onClose: () => {
      trigger.setAttribute("aria-expanded", "false");
      trigger.removeAttribute("aria-activedescendant");
      wrapper.classList.remove("open");
    }
  });
  const options = Array.from(menu.querySelectorAll(".kuroiiSelectOption:not(:disabled)"));
  const selectedIndex = Math.max(0, options.findIndex((item) => item.classList.contains("selected")));
  const focusIndex = focusDirection < 0 ? Math.max(0, selectedIndex - 1) : focusDirection > 0 ? Math.min(options.length - 1, selectedIndex + 1) : selectedIndex;
  const focusOption = (index) => {
    const option = options[index];
    if (!option) return;
    trigger.setAttribute("aria-activedescendant", option.id);
    option.focus();
  };
  menu.addEventListener("keydown", (event) => {
    const currentIndex = Math.max(0, options.indexOf(document.activeElement));
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(Math.min(options.length - 1, currentIndex + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(Math.max(0, currentIndex - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.activeElement?.click();
    }
  });
  focusOption(focusIndex);
}

function enhanceCustomSelects(root = document) {
  if (window.matchMedia && window.matchMedia("(forced-colors: active)").matches) return;
  root.querySelectorAll("select:not([multiple]):not([data-kuroii-select])").forEach((select) => {
    select.dataset.kuroiiSelect = "true";
    const wrapper = document.createElement("span");
    wrapper.className = "kuroiiSelect";
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.classList.add("kuroiiNativeSelect");
    select.setAttribute("aria-hidden", "true");
    select.hidden = true;
    select.tabIndex = -1;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "kuroiiSelectTrigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", customSelectAccessibleName(select));
    trigger.disabled = select.disabled;
    const label = document.createElement("span");
    label.textContent = selectedOptionLabel(select);
    trigger.appendChild(label);
    wrapper.appendChild(trigger);
    trigger.addEventListener("click", () => {
      if (activeKuroiiOverlay && activeKuroiiOverlay.anchor === trigger) closeKuroiiSelect();
      else openKuroiiSelect(select, trigger, wrapper);
    });
    trigger.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      openKuroiiSelect(select, trigger, wrapper, event.key === "ArrowUp" || event.key === "Home" ? -1 : 1);
    });
    select.addEventListener("change", () => {
      label.textContent = selectedOptionLabel(select);
      trigger.disabled = select.disabled;
    });
  });
}

function requestFocus(id) {
  state.focusAfterRender = id;
}

function applyFocusAfterRender() {
  if (!state.focusAfterRender) return;
  const target = el(state.focusAfterRender);
  state.focusAfterRender = null;
  if (target && typeof target.focus === "function") {
    window.requestAnimationFrame(() => target.focus({ preventScroll: false }));
  }
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function currentProvider() {
  return providerCatalog.find((provider) => provider.id === state.providerConfig.providerId) || providerCatalog[0];
}

function currentProviderModels() {
  return Array.isArray(state.providerConfig.models) ? state.providerConfig.models : [];
}

function providerModelsForActiveCapability() {
  const models = currentProviderModels();
  const capability = state.providerModelCapabilityFilter || "all";
  if (capability === "all") return models;
  return models.filter((model) => Array.isArray(model.tags) && model.tags.includes(capability));
}

function providerModelCapabilityCounts() {
  const counts = {};
  for (const model of currentProviderModels()) {
    for (const capability of Array.isArray(model.tags) ? model.tags : []) {
      counts[capability] = (counts[capability] || 0) + 1;
    }
  }
  return counts;
}

function currentModelLabel() {
  const model = currentProviderModels().find((item) => item.id === state.providerConfig.model);
  return model ? model.label : state.providerConfig.model || (state.locale === "zh-CN" ? "未选择" : "Not selected");
}

function providerModelLabel(providerId, modelId) {
  const model = (providerModelCatalog[providerId] || []).find((item) => item.id === modelId);
  return model ? model.label : modelId || (state.locale === "zh-CN" ? "未绑定" : "Not bound");
}

function providerLabel(providerId) {
  const provider = providerCatalog.find((item) => item.id === providerId);
  return provider ? provider.label : providerId;
}

function providerCapabilityLabel(capabilityId) {
  const capability = providerCapabilities.find((item) => item.id === capabilityId);
  return capability ? localText(capability.label) : capabilityId;
}

function capabilityConnectionStatus(capabilityId) {
  return state.capabilityConnection.byCapability[capabilityId] || {
    capability: capabilityId,
    state: state.capabilityConnection.status === "loading" ? "loading" : "action-required",
    code: "PROVIDER_STATUS_UNAVAILABLE",
    message: "",
    advice: [],
    binding: null
  };
}

function capabilityConnectionLabel(capabilityId) {
  const status = capabilityConnectionStatus(capabilityId);
  const labels = {
    connected: state.locale === "zh-CN" ? "已接通" : "Connected",
    "action-required": state.locale === "zh-CN" ? "可绑定待接通" : "Ready to connect",
    unsupported: state.locale === "zh-CN" ? "未支持" : "Not supported",
    loading: state.locale === "zh-CN" ? "检查中" : "Checking"
  };
  return labels[status.state] || labels["action-required"];
}

function capabilityConnectionTone(capabilityId) {
  const stateName = capabilityConnectionStatus(capabilityId).state;
  return stateName === "connected" ? "success" : (stateName === "unsupported" ? "error" : "warning");
}

function capabilityConnectionDetail(capabilityId, fallback) {
  const status = capabilityConnectionStatus(capabilityId);
  if (status.state === "connected" && status.binding) {
    return `${providerLabel(status.binding.providerId)} · ${providerModelLabel(status.binding.providerId, status.binding.model)}`;
  }
  if (status.state === "unsupported") {
    return state.locale === "zh-CN" ? "当前运行时尚未提供此能力的真实任务适配器" : "No live task adapter is available for this capability.";
  }
  return fallback || (state.locale === "zh-CN" ? "请在 Provider Hub 完成模型、启用状态和 API Key 配置" : "Complete model, profile, and API key setup in Provider Hub.");
}

function selectedModelCapabilities() {
  const selected = currentProviderModels().find((item) => item.id === state.providerConfig.model);
  const advertised = (selected && Array.isArray(selected.tags) ? selected.tags : []).filter((tag) => providerCapabilities.some((item) => item.id === tag));
  return advertised.length ? advertised : normalizeProviderCapabilities(state.providerConfig.defaultCapabilities);
}

function addManualProviderModel() {
  if (providerOperationPending()) return;
  syncProviderFormState();
  const modelId = String(state.providerConfig.manualModelId || "").trim();
  const label = String(state.providerConfig.manualModelLabel || "").trim() || modelId;
  const capabilities = normalizeProviderCapabilities(state.providerConfig.manualModelCapabilities);
  if (!modelId) {
    state.providerConfig.errorCode = "MODEL_REQUIRED";
    state.providerConfig.message = state.locale === "zh-CN" ? "请填写供应商文档中的模型 ID。" : "Enter the model ID from the provider documentation.";
    requestFocus("providerManualModelId");
    render();
    return;
  }
  if (!capabilities.length) {
    state.providerConfig.errorCode = "MODEL_CAPABILITY_MISMATCH";
    state.providerConfig.message = state.locale === "zh-CN" ? "至少选择一个模型能力标签。" : "Select at least one model capability.";
    render();
    return;
  }
  const models = currentProviderModels().filter((model) => model.id !== modelId);
  models.push({ id: modelId, label, tags: capabilities, source: "manual" });
  state.providerConfig.models = models;
  state.providerConfig.model = modelId;
  state.providerConfig.manualModelId = "";
  state.providerConfig.manualModelLabel = "";
  state.providerConfig.manualModelCapabilities = ["video"];
  state.providerConfig.errorCode = null;
  state.providerConfig.stage = "manual-model-added";
  state.providerConfig.message = state.locale === "zh-CN"
    ? "模型已加入当前配置。点击“保存配置”后将写入本地 Provider Profile。"
    : "The model was added to this profile. Save the profile to persist it locally.";
  render();
}

function currentModelCanBindCapability(capabilityId) {
  const capabilities = selectedModelCapabilities();
  return providerSupportsCapabilityContract(capabilityId) && capabilities.includes(capabilityId);
}

function providerStatusLabel() {
  const guidance = providerErrorGuidance[state.providerConfig.errorCode];
  if (guidance) return localText(guidance.title);
  if (state.providerConfig.apiKeySaveState === "saving") return state.locale === "zh-CN" ? "保存 Key 中" : "Saving key";
  if (state.providerConfig.status === "refreshing") return state.locale === "zh-CN" ? "刷新中" : "Refreshing";
  if (state.providerConfig.status === "testing") return state.locale === "zh-CN" ? "测试中" : "Testing";
  if (state.providerConfig.status === "saving") return state.locale === "zh-CN" ? "保存中" : "Saving";
  if (state.providerConfig.status === "warning") return state.locale === "zh-CN" ? "离线预览" : "Offline Preview";
  if (state.providerConfig.status === "saved") return state.locale === "zh-CN" ? "已保存" : "Saved";
  if (state.providerConfig.status === "error") return state.locale === "zh-CN" ? "操作失败" : "Operation failed";
  return state.locale === "zh-CN" ? "已配置" : "Configured";
}

function providerStatusTone() {
  const guidance = providerErrorGuidance[state.providerConfig.errorCode];
  if (guidance) return guidance.tone;
  if (state.providerConfig.status === "warning") return "warning";
  if (providerOperationPending()) return "warning";
  return state.providerConfig.status === "saved" ? "success" : "ready";
}

function providerOperationPending() {
  return ["refreshing", "testing", "saving"].includes(state.providerConfig.status)
    || state.providerConfig.apiKeySaveState === "saving";
}

function isLocalProvider(provider = currentProvider()) {
  return provider.protocol === "Local";
}

function providerHasServiceRoute(provider = currentProvider()) {
  return providerServiceIds.includes(provider.id);
}

function providerCanBeConfigured(provider = currentProvider()) {
  return providerHasServiceRoute(provider) && provider.configurable !== false;
}

function providerSupportsCapabilityContract(capabilityId, provider = currentProvider()) {
  return (providerContractCapabilities[provider.id] || []).includes(capabilityId);
}

function showProviderNotWiredFeedback(action = "configure") {
  const provider = currentProvider();
  const actionText = {
    configure: state.locale === "zh-CN" ? "配置、保存 Key 和连接测试" : "configuration, key saving, and connection tests",
    bind: state.locale === "zh-CN" ? "模型绑定" : "model binding"
  }[action] || action;
  state.providerConfig.status = "error";
  state.providerConfig.errorCode = "PROVIDER_NOT_WIRED";
  state.providerConfig.source = "local";
  state.providerConfig.stage = "planned-provider";
  state.providerConfig.message = state.locale === "zh-CN"
    ? `${provider.label} 是产品路线占位项，尚未接入真实 Adapter，不能执行${actionText}。`
    : `${provider.label} is a roadmap placeholder without a live adapter; ${actionText} are unavailable.`;
  state.providerConfig.advice = [state.locale === "zh-CN"
    ? "请改选已接通的平台；接入新供应商需要专用 Adapter、模型目录和任务协议。"
    : "Select a wired provider. A new provider needs a dedicated adapter, model catalog, and task contract."];
}

function isValidUrl(value) {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(String(value || "").trim());
}

function providerConfigSnapshot() {
  const provider = currentProvider();
  return {
    name: String(state.providerConfig.name || "").trim(),
    provider,
    baseUrl: String(state.providerConfig.baseUrl || "").trim(),
    apiKeyDraft: String(state.providerConfig.apiKeyDraft || "").trim(),
    apiKeyConfigured: Boolean(state.providerConfig.apiKeyStatus && state.providerConfig.apiKeyStatus.configured),
    organization: String(state.providerConfig.organization || "").trim(),
    modelsPath: String(state.providerConfig.modelsPath || "/models").trim(),
    chatPath: String(state.providerConfig.chatPath || "/chat/completions").trim(),
    imagesPath: String(state.providerConfig.imagesPath || "/images/generations").trim(),
    videoPath: String(state.providerConfig.videoPath || "/videos/generations").trim(),
    videoStatusPath: String(state.providerConfig.videoStatusPath || "/videos/generations/{taskId}").trim(),
    headersResult: parseProviderHeaders(state.providerConfig.customHeadersText),
    timeoutSeconds: Number(state.providerConfig.timeoutSeconds),
    defaultCapabilities: normalizeProviderCapabilities(state.providerConfig.defaultCapabilities),
    model: String(state.providerConfig.model || "").trim()
  };
}

function validateProviderConfig() {
  const snapshot = providerConfigSnapshot();
  if (!snapshot.name) return "CONFIG_MISSING";
  if (!snapshot.baseUrl || (!isLocalProvider(snapshot.provider) && !snapshot.apiKeyDraft && !snapshot.apiKeyConfigured)) return "CONFIG_MISSING";
  if (!isValidUrl(snapshot.baseUrl)) return "BASE_URL_UNREACHABLE";
  if (/invalid/i.test(snapshot.apiKeyDraft)) return "AUTH_INVALID_KEY";
  if (/rate/i.test(snapshot.apiKeyDraft)) return "RATE_LIMITED";
  if (/timeout/i.test(snapshot.apiKeyDraft)) return "NETWORK_TIMEOUT";
  if (["openai-compatible", "custom-base-url"].includes(snapshot.provider.id)) {
    if (!snapshot.modelsPath || /[\r\n]/.test(snapshot.modelsPath)) return "CONFIG_INVALID";
  }
  if (snapshot.provider.id === "openai-compatible") {
    if (!snapshot.chatPath || /[\r\n]/.test(snapshot.chatPath)) return "CONFIG_INVALID";
    if (!snapshot.imagesPath || /[\r\n]/.test(snapshot.imagesPath)) return "CONFIG_INVALID";
    if (!snapshot.videoPath || /[\r\n]/.test(snapshot.videoPath)) return "CONFIG_INVALID";
    if (!snapshot.videoStatusPath || /[\r\n]/.test(snapshot.videoStatusPath)) return "CONFIG_INVALID";
    if (snapshot.headersResult.error) return snapshot.headersResult.error;
    if (!Number.isFinite(snapshot.timeoutSeconds) || snapshot.timeoutSeconds < 1 || snapshot.timeoutSeconds > 180) return "CONFIG_INVALID";
    if (!snapshot.defaultCapabilities.length) return "CONFIG_INVALID";
  }
  const models = currentProviderModels();
  if (models.length && snapshot.model && !models.some((model) => model.id === snapshot.model)) return "MODEL_NOT_FOUND";
  return null;
}

function syncProviderFormState() {
  const profileName = el("providerProfileName");
  const providerSelect = el("providerSelect");
  const baseUrl = el("providerBaseUrl");
  const apiKey = el("providerApiKey");
  const organization = el("providerOrganization");
  const model = el("providerModelSelect");
  const modelsPath = el("providerModelsPath");
  const chatPath = el("providerChatPath");
  const imagesPath = el("providerImagesPath");
  const videoPath = el("providerVideoPath");
  const videoStatusPath = el("providerVideoStatusPath");
  const customHeaders = el("providerCustomHeaders");
  const timeoutSeconds = el("providerTimeoutSeconds");
  const manualModelId = el("providerManualModelId");
  const manualModelLabel = el("providerManualModelLabel");
  if (profileName) state.providerConfig.name = profileName.value;
  if (providerSelect) state.providerConfig.providerId = providerSelect.value;
  if (baseUrl) state.providerConfig.baseUrl = baseUrl.value;
  if (apiKey) state.providerConfig.apiKeyDraft = apiKey.value;
  if (organization) state.providerConfig.organization = organization.value;
  if (model) state.providerConfig.model = model.value;
  if (modelsPath) state.providerConfig.modelsPath = modelsPath.value;
  if (chatPath) state.providerConfig.chatPath = chatPath.value;
  if (imagesPath) state.providerConfig.imagesPath = imagesPath.value;
  if (videoPath) state.providerConfig.videoPath = videoPath.value;
  if (videoStatusPath) state.providerConfig.videoStatusPath = videoStatusPath.value;
  if (customHeaders) state.providerConfig.customHeadersText = customHeaders.value;
  if (timeoutSeconds) state.providerConfig.timeoutSeconds = Number(timeoutSeconds.value);
  if (manualModelId) state.providerConfig.manualModelId = manualModelId.value;
  if (manualModelLabel) state.providerConfig.manualModelLabel = manualModelLabel.value;
  const capabilityInputs = [...document.querySelectorAll("[data-provider-default-capability]")];
  if (capabilityInputs.length) {
    state.providerConfig.defaultCapabilities = capabilityInputs
      .filter((input) => input.checked)
      .map((input) => input.dataset.providerDefaultCapability);
  }
  const manualCapabilityInputs = [...document.querySelectorAll("[data-provider-manual-capability]")];
  if (manualCapabilityInputs.length) {
    state.providerConfig.manualModelCapabilities = manualCapabilityInputs
      .filter((input) => input.checked)
      .map((input) => input.dataset.providerManualCapability);
  }
}

function providerRequestBody() {
  const config = {
    baseUrl: state.providerConfig.baseUrl,
    apiKeyRef: state.providerConfig.apiKeyRef,
    model: state.providerConfig.model
  };
  if (state.providerConfig.apiKeyDraft) {
    config.apiKey = state.providerConfig.apiKeyDraft;
  }
  if (state.providerConfig.providerId === "openai" && state.providerConfig.organization) {
    config.organization = String(state.providerConfig.organization).trim();
  }
  if (["openai-compatible", "custom-base-url"].includes(state.providerConfig.providerId)) {
    config.modelsPath = String(state.providerConfig.modelsPath || "/models").trim() || "/models";
  }
  if (state.providerConfig.providerId === "openai-compatible") {
    config.chatPath = String(state.providerConfig.chatPath || "/chat/completions").trim() || "/chat/completions";
    config.imagesPath = String(state.providerConfig.imagesPath || "/images/generations").trim() || "/images/generations";
    config.videoPath = String(state.providerConfig.videoPath || "/videos/generations").trim() || "/videos/generations";
    config.videoStatusPath = String(state.providerConfig.videoStatusPath || "/videos/generations/{taskId}").trim() || "/videos/generations/{taskId}";
    config.headers = parseProviderHeaders(state.providerConfig.customHeadersText).headers;
    config.timeoutSeconds = Number(state.providerConfig.timeoutSeconds) || 120;
    config.defaultCapabilities = normalizeProviderCapabilities(state.providerConfig.defaultCapabilities);
    config.models = currentProviderModels().map((model) => ({
      id: model.id,
      label: model.label,
      capabilities: Array.isArray(model.tags) ? model.tags : []
    }));
  }
  if (state.providerConfig.providerId === "custom-base-url") {
    config.compatibilityMode = "openai-compatible";
  }
  return {
    config,
    model: state.providerConfig.model
  };
}

function providerProfilePayload() {
  return {
    name: state.providerConfig.name,
    providerId: state.providerConfig.providerId,
    ...providerRequestBody(),
    bindCapabilities: selectedModelCapabilities()
  };
}

function applyProviderProfile(profile, options = {}) {
  if (!profile || typeof profile !== "object") return;
  state.providerProfile = sanitizeProviderProfileForStorage(profile);
  const activeProfileId = state.providerProfile.activeProfileId || state.providerConfig.profileId || Object.keys(state.providerProfile.profileInstances || {})[0];
  const activeProfile = state.providerProfile.profileInstances[activeProfileId] || {};
  const activeProviderId = activeProfile.providerId || state.providerProfile.activeProviderId || "openai";
  const activeProvider = providerCatalog.find((provider) => provider.id === activeProviderId) || providerCatalog[0];
  const models = Array.isArray(activeProfile.models) ? normalizeProviderModels(activeProfile.models) : [];
  state.providerConfig.profileId = activeProfileId;
  state.providerConfig.name = activeProfile.name || providerLabel(activeProvider.id);
  state.providerConfig.providerId = activeProvider.id;
  state.providerConfig.baseUrl = activeProfile.baseUrl || activeProvider.baseUrl;
  state.providerConfig.apiKeyDraft = "";
  state.providerConfig.apiKeyRef = activeProfile.apiKeyRef || `provider-profile:${activeProfileId}:apiKey`;
  state.providerConfig.apiKeyStatus = activeProfile.apiKeyStatus || { configured: false, preview: "" };
  state.providerConfig.organization = activeProfile.organization || "";
  state.providerConfig.modelsPath = activeProfile.modelsPath || "/models";
  state.providerConfig.chatPath = activeProfile.chatPath || "/chat/completions";
  state.providerConfig.imagesPath = activeProfile.imagesPath || "/images/generations";
  state.providerConfig.videoPath = activeProfile.videoPath || "/videos/generations";
  state.providerConfig.videoStatusPath = activeProfile.videoStatusPath || "/videos/generations/{taskId}";
  state.providerConfig.customHeadersText = formatProviderHeaders(activeProfile.headers);
  state.providerConfig.timeoutSeconds = Number(activeProfile.timeoutSeconds) || 120;
  state.providerConfig.defaultCapabilities = normalizeProviderCapabilities(activeProfile.defaultCapabilities);
  state.providerConfig.model = activeProfile.model || (models[0] ? models[0].id : "");
  state.providerConfig.models = models;
  state.providerConfig.errorCode = null;
  state.providerConfig.status = options.status || "ready";
  state.providerConfig.source = activeProfile.source || profile.storage || options.source || "provider-profile";
  state.providerConfig.stage = options.stage || "profile-loaded";
  state.providerConfig.message = options.message || (state.locale === "zh-CN" ? "已读取模型平台配置。" : "Provider profile loaded.");
  state.providerConfig.lastRefresh = profile.updatedAt || state.providerConfig.lastRefresh || "-";
  writePersistedProviderProfile(state.providerProfile);
  if (options.refreshCapabilities !== false && options.source === "service") {
    void loadCapabilityConnectionStatuses();
  }
}

async function loadProviderProfileFromService() {
  try {
    const response = await fetch("http://127.0.0.1:17631/provider-profile", {
      headers: { "X-Kuroii-Session": "dev-local-token" }
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    if (payload.ok && payload.profile) {
      applyProviderProfile(payload.profile, { source: "service", stage: "profile-loaded", refreshCapabilities: false });
      state.serviceOnline = true;
    }
  } catch (error) {
    state.providerConfig.source = state.providerConfig.source || "localStorage";
  } finally {
    state.providerProfileReady = true;
    await loadCapabilityConnectionStatuses({ renderAfter: false });
    render();
    void loadImageHistory();
    void loadVideoReadiness({ renderAfter: false });
  }
}

async function loadCapabilityConnectionStatuses(options = {}) {
  state.capabilityConnection.status = "loading";
  if (options.renderAfter !== false) render();
  try {
    const response = await fetch("http://127.0.0.1:17631/provider-capabilities", {
      headers: { "X-Kuroii-Session": "dev-local-token" }
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    state.capabilityConnection = {
      status: "ready",
      byCapability: payload && payload.byCapability && typeof payload.byCapability === "object" ? payload.byCapability : {}
    };
    state.serviceOnline = true;
  } catch (_error) {
    state.capabilityConnection = { status: "error", byCapability: {} };
  }
  if (options.renderAfter !== false) render();
}

function normalizeProviderModels(models) {
  return (Array.isArray(models) ? models : []).map((model) => ({
    id: model.id || model.model || model.label || "unknown-model",
    label: model.label || model.id || model.model || "Unknown Model",
    tags: model.tags || model.capabilities || model.recommendedFor || []
  }));
}

function applyProviderServiceError(payload, fallbackCode = "NETWORK_TIMEOUT") {
  const code = payload && payload.code ? payload.code : fallbackCode;
  state.providerConfig.status = "error";
  state.providerConfig.errorCode = code;
  state.providerConfig.stage = payload && payload.stage ? payload.stage : "request";
  state.providerConfig.source = "service";
  state.providerConfig.message = payload && payload.message ? payload.message : providerStatusLabel();
  state.providerConfig.advice = Array.isArray(payload && payload.advice) ? payload.advice : [];
}

function applyMockProviderRefresh() {
  syncProviderFormState();
  const errorCode = validateProviderConfig();
  if (errorCode) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = errorCode;
    return;
  }
  const models = providerModelCatalog[state.providerConfig.providerId] || [];
  state.providerConfig.models = models;
  if (!models.some((model) => model.id === state.providerConfig.model)) {
    state.providerConfig.model = models[0] ? models[0].id : "";
  }
  state.providerConfig.status = "ready";
  state.providerConfig.errorCode = null;
  state.providerConfig.source = "mock";
  state.providerConfig.stage = "model-discovery";
  state.providerConfig.message = "Mock model discovery completed.";
  state.providerConfig.advice = [];
  state.providerConfig.lastRefresh = new Date().toLocaleTimeString(state.locale === "zh-CN" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function refreshProviderModels() {
  if (providerOperationPending()) return;
  syncProviderFormState();
  const pendingApiKey = state.providerConfig.apiKeyDraft;
  if (!providerCanBeConfigured()) {
    showProviderNotWiredFeedback();
    render();
    return;
  }
  state.providerConfig.status = "refreshing";
  state.providerConfig.errorCode = null;
  state.providerConfig.stage = "model-discovery";
  state.providerConfig.message = state.locale === "zh-CN" ? "正在请求 Local Service 刷新模型。" : "Requesting Local Service model discovery.";
  render();
  try {
    const response = await fetch(`http://127.0.0.1:17631/provider-profiles/${encodeURIComponent(state.providerConfig.profileId)}/models`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kuroii-Session": "dev-local-token"
      },
      body: JSON.stringify(providerRequestBody())
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      applyProviderServiceError(payload, payload.code || "NETWORK_TIMEOUT");
    } else {
      const models = normalizeProviderModels(payload.models);
      state.providerConfig.models = models;
      if (!models.some((model) => model.id === state.providerConfig.model)) {
        state.providerConfig.model = models[0] ? models[0].id : "";
      }
      state.providerConfig.status = "ready";
      state.providerConfig.errorCode = null;
      state.providerConfig.source = payload.source || "service";
      state.providerConfig.stage = "model-discovery";
      state.providerConfig.message = payload.note || (state.locale === "zh-CN" ? "模型列表刷新完成。" : "Model list refreshed.");
      state.providerConfig.advice = [];
      state.providerConfig.lastRefresh = new Date().toLocaleTimeString(state.locale === "zh-CN" ? "zh-CN" : "en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
      state.serviceOnline = true;
      state.lastError = null;
    }
  } catch (error) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "LOCAL_SERVICE_OFFLINE";
    state.providerConfig.source = "local";
    state.providerConfig.stage = "model-refresh-failed";
    state.providerConfig.message = state.locale === "zh-CN"
      ? "Local Service 未连接，模型列表没有刷新。"
      : "Local Service is unavailable; the model list was not refreshed.";
  }
  state.providerConfig.apiKeyDraft = pendingApiKey;
  render();
}

async function saveProviderApiKey() {
  if (providerOperationPending()) return;
  syncProviderFormState();
  if (!providerCanBeConfigured()) {
    showProviderNotWiredFeedback();
    render();
    return;
  }
  const apiKey = String(state.providerConfig.apiKeyDraft || "").trim();
  if (!apiKey) {
    state.providerConfig.apiKeySaveState = "error";
    state.providerConfig.message = state.locale === "zh-CN" ? "请输入 API Key 后再保存。" : "Enter an API key before saving.";
    render();
    return;
  }
  state.providerConfig.apiKeySaveState = "saving";
  state.providerConfig.message = state.locale === "zh-CN" ? "正在加密保存 API Key。" : "Encrypting and saving API key.";
  render();
  try {
    const response = await fetch(`http://127.0.0.1:17631/provider-profiles/${encodeURIComponent(state.providerConfig.profileId)}/secret`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kuroii-Session": "dev-local-token"
      },
      body: JSON.stringify({ apiKey })
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      throw Object.assign(new Error(payload.message || "API key save failed."), { payload });
    }
    state.providerConfig.apiKeyRef = payload.apiKeyRef;
    state.providerConfig.apiKeyStatus = payload.apiKeyStatus;
    state.providerConfig.apiKeyDraft = "";
    state.providerConfig.apiKeySaveState = "saved";
    state.providerConfig.status = "saved";
    state.providerConfig.source = "service";
    state.providerConfig.stage = "secret-saved";
    state.providerConfig.message = state.locale === "zh-CN" ? "API Key 已加密保存。" : "API key saved with encryption.";
    state.providerProfile.secretStore = payload.secretStore || state.providerProfile.secretStore;
    const existingProfile = state.providerProfile.profileInstances[state.providerConfig.profileId] || {};
    state.providerProfile.profileInstances[state.providerConfig.profileId] = {
      ...existingProfile,
      profileId: state.providerConfig.profileId,
      name: state.providerConfig.name,
      providerId: state.providerConfig.providerId,
      apiKeyRef: payload.apiKeyRef,
      apiKeyStatus: payload.apiKeyStatus,
      source: existingProfile.source || "secret-store"
    };
    writePersistedProviderProfile(state.providerProfile);
    state.serviceOnline = true;
  } catch (error) {
    state.providerConfig.apiKeyDraft = apiKey;
    state.providerConfig.apiKeySaveState = "error";
    state.providerConfig.status = "error";
    state.providerConfig.source = "local";
    state.providerConfig.stage = "secret-save-failed";
    state.providerConfig.message = state.locale === "zh-CN"
      ? "Local Service 未连接，API Key 未保存。"
      : "Local Service is unavailable; API key was not saved.";
  }
  render();
}

async function testProviderConnection() {
  if (providerOperationPending()) return;
  syncProviderFormState();
  if (!providerCanBeConfigured()) {
    showProviderNotWiredFeedback();
    render();
    return;
  }
  state.providerConfig.status = "testing";
  state.providerConfig.errorCode = null;
  state.providerConfig.stage = "connection-test";
  state.providerConfig.message = state.locale === "zh-CN" ? "正在执行配置、网络、认证和模型测试。" : "Testing config, network, auth, and model.";
  render();
  try {
    const response = await fetch(`http://127.0.0.1:17631/provider-profiles/${encodeURIComponent(state.providerConfig.profileId)}/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kuroii-Session": "dev-local-token"
      },
      body: JSON.stringify(providerRequestBody())
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      applyProviderServiceError(payload, payload.code || "NETWORK_TIMEOUT");
    } else {
      state.providerConfig.status = "ready";
      state.providerConfig.errorCode = null;
      state.providerConfig.source = "service";
      state.providerConfig.stage = payload.stage || "completed";
      state.providerConfig.message = payload.message || (state.locale === "zh-CN" ? "连接测试通过。" : "Connection test passed.");
      state.providerConfig.advice = [];
      state.providerConfig.lastTest = new Date().toLocaleTimeString(state.locale === "zh-CN" ? "zh-CN" : "en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
      state.serviceOnline = true;
      state.lastError = null;
    }
  } catch (error) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "LOCAL_SERVICE_OFFLINE";
    state.providerConfig.source = "local";
    state.providerConfig.stage = "connection-test-failed";
    state.providerConfig.message = state.locale === "zh-CN"
      ? "Local Service 未连接，连接测试没有执行。"
      : "Local Service is unavailable; the connection test did not run.";
    state.providerConfig.advice = [];
  }
  render();
}

function saveProviderProfileLocal(source = "localStorage") {
  const existingProfile = state.providerProfile.profiles && state.providerProfile.profiles[state.providerConfig.providerId]
    ? state.providerProfile.profiles[state.providerConfig.providerId]
    : {};
  const savedProvider = {
    providerId: state.providerConfig.providerId,
    baseUrl: state.providerConfig.baseUrl,
    apiKeyRef: state.providerConfig.apiKeyRef || `provider:${state.providerConfig.providerId}:apiKey`,
    apiKeyStatus: existingProfile.apiKeyStatus || state.providerConfig.apiKeyStatus || { configured: false, preview: "" },
    model: state.providerConfig.model,
    source,
    updatedAt: new Date().toISOString()
  };
  if (state.providerConfig.providerId === "openai") {
    savedProvider.organization = String(state.providerConfig.organization || "").replace(/[\r\n]/g, "").trim();
  }
  if (state.providerConfig.providerId === "openai-compatible") {
    savedProvider.modelsPath = String(state.providerConfig.modelsPath || "/models").trim() || "/models";
    savedProvider.chatPath = String(state.providerConfig.chatPath || "/chat/completions").trim() || "/chat/completions";
    savedProvider.imagesPath = String(state.providerConfig.imagesPath || "/images/generations").trim() || "/images/generations";
    savedProvider.videoPath = String(state.providerConfig.videoPath || "/videos/generations").trim() || "/videos/generations";
    savedProvider.videoStatusPath = String(state.providerConfig.videoStatusPath || "/videos/generations/{taskId}").trim() || "/videos/generations/{taskId}";
    savedProvider.headers = parseProviderHeaders(state.providerConfig.customHeadersText).headers;
    savedProvider.timeoutSeconds = Number(state.providerConfig.timeoutSeconds) || 120;
    savedProvider.defaultCapabilities = normalizeProviderCapabilities(state.providerConfig.defaultCapabilities);
  }
  const profile = {
    ...state.providerProfile,
    activeProviderId: state.providerConfig.providerId,
    profiles: {
      ...(state.providerProfile.profiles || {}),
      [state.providerConfig.providerId]: savedProvider
    },
    capabilityBindings: {
      ...(state.providerProfile.capabilityBindings || {})
    },
    updatedAt: new Date().toISOString(),
    storage: source
  };
  for (const capability of selectedModelCapabilities()) {
    profile.capabilityBindings[capability] = {
      providerId: state.providerConfig.providerId,
      model: state.providerConfig.model
    };
  }
  state.providerProfile = sanitizeProviderProfileForStorage(profile);
  writePersistedProviderProfile(profile);
  return state.providerProfile;
}

async function saveProviderSettings() {
  if (providerOperationPending()) return;
  syncProviderFormState();
  if (!providerCanBeConfigured()) {
    showProviderNotWiredFeedback();
    render();
    return;
  }
  const errorCode = validateProviderConfig();
  if (errorCode) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = errorCode;
    state.providerConfig.stage = "config";
    state.providerConfig.source = "local-state";
    state.providerConfig.message = state.locale === "zh-CN" ? "保存前需要修复配置。" : "Fix the config before saving.";
    state.providerConfig.advice = [];
    render();
    return;
  }
  state.providerConfig.status = "saving";
  state.providerConfig.errorCode = null;
  state.providerConfig.stage = "saving-profile";
  state.providerConfig.message = state.locale === "zh-CN" ? "正在保存模型平台配置。" : "Saving Provider Hub profile.";
  render();
  try {
    const response = await fetch(`http://127.0.0.1:17631/provider-profiles/${encodeURIComponent(state.providerConfig.profileId)}/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kuroii-Session": "dev-local-token"
      },
      body: JSON.stringify(providerProfilePayload())
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      applyProviderServiceError(payload, payload.code || "NETWORK_TIMEOUT");
    } else {
      applyProviderProfile(payload.profile, {
        status: "saved",
        source: "service",
        stage: "profile-saved",
        message: state.locale === "zh-CN" ? "配置已保存到 Local Service，并同步能力默认模型。" : "Profile saved to Local Service with capability defaults."
      });
      state.providerConfig.apiKeyDraft = "";
      state.serviceOnline = true;
    }
  } catch (error) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "LOCAL_SERVICE_OFFLINE";
    state.providerConfig.stage = "profile-save-failed";
    state.providerConfig.source = "local";
    state.providerConfig.message = state.locale === "zh-CN"
      ? "Local Service 未连接，配置没有保存。当前输入已保留。"
      : "Local Service is unavailable; the profile was not saved. Current inputs were kept.";
  }
  state.providerConfig.advice = [];
  render();
}

async function bindCurrentModelToCapability(capabilityId) {
  syncProviderFormState();
  if (!providerCanBeConfigured()) {
    showProviderNotWiredFeedback("bind");
    render();
    return;
  }
  if (!currentModelCanBindCapability(capabilityId)) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "MODEL_NOT_FOUND";
    state.providerConfig.stage = "capability-binding";
    state.providerConfig.message = state.locale === "zh-CN" ? "当前模型不支持该能力，不能绑定。" : "Current model does not support this capability.";
    render();
    return;
  }
  return updateCapabilityModelBinding(
    capabilityId,
    state.providerConfig.profileId,
    state.providerConfig.model,
    "add",
    state.providerConfig.providerId
  );
}

async function updateCapabilityModelBinding(capabilityId, profileId, model, operation, providerId = "") {
  try {
    const response = await fetch(`http://127.0.0.1:17631/provider-bindings/${encodeURIComponent(capabilityId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kuroii-Session": "dev-local-token"
      },
      body: JSON.stringify({
        profileId,
        providerId,
        model,
        operation
      })
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      applyProviderServiceError(payload, payload.code || "NETWORK_TIMEOUT");
    } else {
      const messages = {
        add: state.locale === "zh-CN" ? "模型已添加到该能力。" : "Model added to this capability.",
        "set-default": state.locale === "zh-CN" ? "该能力的默认模型已更新。" : "Default model updated for this capability.",
        remove: state.locale === "zh-CN" ? "模型已从该能力解绑。" : "Model removed from this capability."
      };
      applyProviderProfile(payload.profile, {
        status: "saved",
        source: "service",
        stage: "capability-bound",
        message: messages[operation] || messages.add
      });
      if (profileId === state.providerConfig.profileId) {
        state.providerConfig.model = model;
      }
      state.serviceOnline = true;
    }
  } catch (error) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "LOCAL_SERVICE_OFFLINE";
    state.providerConfig.stage = "capability-binding-failed";
    state.providerConfig.source = "local";
    state.providerConfig.message = state.locale === "zh-CN" ? "Local Service 未连接，能力绑定没有保存。" : "Local Service is unavailable; the capability binding was not saved.";
  }
  render();
}

function setDefaultCapabilityModel(capabilityId, profileId, model, providerId = "") {
  return updateCapabilityModelBinding(capabilityId, profileId, model, "set-default", providerId);
}

function removeCapabilityModelBinding(capabilityId, profileId, model, providerId = "") {
  return updateCapabilityModelBinding(capabilityId, profileId, model, "remove", providerId);
}

async function createProviderProfile() {
  const sequence = Object.keys(state.providerProfile.profileInstances || {}).length + 1;
  const name = state.locale === "zh-CN" ? `新配置 ${sequence}` : `New profile ${sequence}`;
  const providerId = providerCanBeConfigured() ? state.providerConfig.providerId : "openai-compatible";
  const provider = providerCatalog.find((item) => item.id === providerId) || providerCatalog[0];
  try {
    const response = await fetch("http://127.0.0.1:17631/provider-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Kuroii-Session": "dev-local-token" },
      body: JSON.stringify({
        name,
        providerId,
        config: {
          baseUrl: provider.baseUrl || "",
          modelsPath: "/models",
          chatPath: "/chat/completions",
          imagesPath: "/images/generations",
          videoPath: "/videos/generations",
          videoStatusPath: "/videos/generations/{taskId}",
          timeoutSeconds: 120,
          defaultCapabilities: ["text"]
        }
      })
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      applyProviderServiceError(payload, payload.code || "NETWORK_TIMEOUT");
    } else {
      applyProviderProfile(payload.profile, {
        status: "saved",
        source: "service",
        stage: "profile-created",
        message: state.locale === "zh-CN" ? "新配置已创建，可以继续改名和填写连接信息。" : "New profile created. Rename it and complete the connection details."
      });
      state.providerHubTab = "connection";
      requestFocus("providerProfileName");
      state.serviceOnline = true;
    }
  } catch (error) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "LOCAL_SERVICE_OFFLINE";
    state.providerConfig.stage = "profile-create-failed";
    state.providerConfig.message = state.locale === "zh-CN" ? "Local Service 未连接，无法创建新配置。" : "Local Service is unavailable; a new profile could not be created.";
  }
  render();
}

async function selectProviderProfile(profileId) {
  if (!profileId || profileId === state.providerConfig.profileId) return;
  try {
    const response = await fetch(`http://127.0.0.1:17631/provider-profiles/${encodeURIComponent(profileId)}/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Kuroii-Session": "dev-local-token" },
      body: "{}"
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      applyProviderServiceError(payload, payload.code || "NETWORK_TIMEOUT");
    } else {
      applyProviderProfile(payload.profile, { source: "service", stage: "profile-selected" });
      state.serviceOnline = true;
    }
  } catch (error) {
    const local = state.providerProfile.profileInstances && state.providerProfile.profileInstances[profileId];
    if (local) {
      state.providerProfile.activeProfileId = profileId;
      applyProviderProfile(state.providerProfile, { source: "local", stage: "profile-selected-local" });
    }
  }
  render();
}

function providerProfileClipboardPayload() {
  const config = {
    baseUrl: state.providerConfig.baseUrl,
    model: state.providerConfig.model,
    enabled: true
  };
  if (state.providerConfig.providerId === "openai") {
    config.organization = state.providerConfig.organization || "";
  }
  if (["openai-compatible", "custom-base-url"].includes(state.providerConfig.providerId)) {
    config.modelsPath = state.providerConfig.modelsPath || "/models";
  }
  if (state.providerConfig.providerId === "openai-compatible") {
    config.chatPath = state.providerConfig.chatPath || "/chat/completions";
    config.imagesPath = state.providerConfig.imagesPath || "/images/generations";
    config.videoPath = state.providerConfig.videoPath || "/videos/generations";
    config.videoStatusPath = state.providerConfig.videoStatusPath || "/videos/generations/{taskId}";
    config.headers = parseProviderHeaders(state.providerConfig.customHeadersText).headers;
    config.timeoutSeconds = Number(state.providerConfig.timeoutSeconds) || 120;
    config.defaultCapabilities = normalizeProviderCapabilities(state.providerConfig.defaultCapabilities);
  }
  return {
    format: "kuroii-provider-profile-v2",
    version: 1,
    name: state.providerConfig.name,
    providerId: state.providerConfig.providerId,
    config
  };
}

async function copyProviderProfile() {
  syncProviderFormState();
  try {
    await navigator.clipboard.writeText(JSON.stringify(providerProfileClipboardPayload(), null, 2));
    state.providerConfig.status = "saved";
    state.providerConfig.errorCode = null;
    state.providerConfig.stage = "profile-copied";
    state.providerConfig.message = state.locale === "zh-CN" ? "配置已复制，不包含 API Key。" : "Profile copied without the API key.";
  } catch (error) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "CLIPBOARD_UNAVAILABLE";
    state.providerConfig.stage = "profile-copy-failed";
    state.providerConfig.message = state.locale === "zh-CN" ? "无法读取系统剪贴板权限。" : "Clipboard access is unavailable.";
  }
  render();
}

async function pasteProviderProfile() {
  try {
    const text = await navigator.clipboard.readText();
    const pasted = JSON.parse(text);
    if (!pasted || pasted.format !== "kuroii-provider-profile-v2" || !pasted.providerId || !pasted.config) {
      throw new Error("INVALID_PROVIDER_CLIPBOARD");
    }
    const suffix = state.locale === "zh-CN" ? " 副本" : " Copy";
    const response = await fetch("http://127.0.0.1:17631/provider-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Kuroii-Session": "dev-local-token" },
      body: JSON.stringify({
        name: `${String(pasted.name || providerLabel(pasted.providerId)).trim()}${suffix}`,
        providerId: pasted.providerId,
        config: pasted.config
      })
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      applyProviderServiceError(payload, payload.code || "INVALID_PROVIDER_PROFILE");
    } else {
      applyProviderProfile(payload.profile, {
        status: "saved",
        source: "service",
        stage: "profile-pasted",
        message: state.locale === "zh-CN" ? "已粘贴为新配置。API Key 未复制，请重新填写并保存。" : "Pasted as a new profile. Enter and save its API key."
      });
      state.providerHubTab = "connection";
      state.providerModelCapabilityFilter = "all";
      state.serviceOnline = true;
    }
  } catch (error) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "INVALID_PROVIDER_CLIPBOARD";
    state.providerConfig.stage = "profile-paste-failed";
    state.providerConfig.message = state.locale === "zh-CN" ? "剪贴板中没有有效的 Kuroii 模型平台配置。" : "The clipboard does not contain a valid Kuroii provider profile.";
  }
  render();
}

function requestDeleteProviderProfile() {
  state.providerDeleteConfirmOpen = true;
  requestFocus("cancelDeleteProviderProfileButton");
  render();
}

function closeProviderDeleteConfirm() {
  state.providerDeleteConfirmOpen = false;
  requestFocus("deleteProviderProfileButton");
  render();
}

function handleProviderDeleteDialogKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeProviderDeleteConfirm();
    return;
  }
  if (event.key !== "Tab") return;
  const dialog = event.currentTarget;
  const focusable = Array.from(dialog.querySelectorAll("button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

async function confirmDeleteProviderProfile() {
  const profileId = state.providerConfig.profileId;
  state.providerDeleteConfirmOpen = false;
  try {
    const response = await fetch(`http://127.0.0.1:17631/provider-profiles/${encodeURIComponent(profileId)}`, {
      method: "DELETE",
      headers: { "X-Kuroii-Session": "dev-local-token" }
    });
    const payload = response.ok ? await response.json() : (await serviceResponseError(response)).payload;
    if (!response.ok || !payload.ok) {
      applyProviderServiceError(payload, payload.code || "PROVIDER_PROFILE_DELETE_FAILED");
    } else {
      applyProviderProfile(payload.profile, {
        status: "saved",
        source: "service",
        stage: "profile-deleted",
        message: state.locale === "zh-CN" ? "配置及其加密 Key 已删除。" : "The profile and its encrypted key were deleted."
      });
      state.providerHubTab = "connection";
      state.providerModelCapabilityFilter = "all";
    }
  } catch (error) {
    state.providerConfig.status = "error";
    state.providerConfig.errorCode = "LOCAL_SERVICE_OFFLINE";
    state.providerConfig.stage = "profile-delete-failed";
    state.providerConfig.message = state.locale === "zh-CN" ? "Local Service 未连接，配置没有删除。" : "Local Service is unavailable; the profile was not deleted.";
  }
  render();
}

function providerModelSummaryHtml() {
  const provider = currentProvider();
  const tone = providerStatusTone();
  const statusText = providerStatusLabel();
  const title = state.locale === "zh-CN" ? "当前模型" : "Current Model";
  const sub = state.locale === "zh-CN" ? "由模型平台统一配置" : "Configured in Provider Hub";
  return `
    <section class="featureProviderSummary" aria-label="${escapeHtml(title)}">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(sub)}</span>
      </div>
      <dl>
        <div><dt>Provider</dt><dd>${escapeHtml(provider.label)}</dd></div>
        <div><dt>Model</dt><dd>${escapeHtml(currentModelLabel())}</dd></div>
        <div><dt>Status</dt><dd><span class="providerStateBadge ${escapeHtml(tone)}">${escapeHtml(statusText)}</span></dd></div>
      </dl>
    </section>
  `;
}

function providerGuidanceHtml() {
  const guidance = providerErrorGuidance[state.providerConfig.errorCode];
  const serviceAdvice = Array.isArray(state.providerConfig.advice) ? state.providerConfig.advice : [];
  if (!guidance) {
    const advice = serviceAdvice.map((item) => `<li>${escapeHtml(item.labelZh || item.labelEn || item.id || String(item))}</li>`).join("");
    return `
      <div class="providerGuidance ok">
        <strong>${escapeHtml(providerStatusLabel())}</strong>
        <p>${escapeHtml(state.providerConfig.message || (state.locale === "zh-CN" ? "各功能页将只显示这个已配置模型，不再重复展示平台配置表单。" : "Feature pages only show this configured model instead of repeating provider forms."))}</p>
        ${advice ? `<ul>${advice}</ul>` : ""}
      </div>
    `;
  }
  const advice = serviceAdvice.length
    ? serviceAdvice.map((item) => `<li>${escapeHtml(item.labelZh || item.labelEn || item.id || String(item))}</li>`).join("")
    : guidance.actions.map((action) => `<li>${escapeHtml(localText(action))}</li>`).join("");
  return `
    <div class="providerGuidance ${escapeHtml(guidance.tone)}">
      <strong>${escapeHtml(localText(guidance.title))}</strong>
      <p>${escapeHtml(state.providerConfig.message || localText(guidance.message))}</p>
      <ul>${advice}</ul>
    </div>
  `;
}

function providerCapabilityBindingsHtml() {
  const bindings = (state.providerProfile && state.providerProfile.capabilityBindings) || {};
  return providerCapabilities.map((capability) => {
    const binding = bindings[capability.id] || {};
    const boundProvider = binding.providerId || "-";
    const boundModel = binding.model || "";
    const canBind = currentModelCanBindCapability(capability.id);
    const summary = boundModel
      ? `${providerLabel(boundProvider)} · ${providerModelLabel(boundProvider, boundModel)}`
      : (state.locale === "zh-CN" ? "未绑定" : "Not bound");
    const buttonLabel = state.locale === "zh-CN" ? "设为当前" : "Use current";
    return `
      <li>
        <div>
          <strong>${escapeHtml(providerCapabilityLabel(capability.id))}</strong>
          <small>${escapeHtml(summary)}</small>
        </div>
        <button class="providerBindingButton" type="button" data-bind-capability="${escapeHtml(capability.id)}" ${canBind ? "" : "disabled"}>${escapeHtml(buttonLabel)}</button>
      </li>
    `;
  }).join("");
}

function viewClassName(viewId) {
  return `view-${String(viewId || "home").replace(/[^a-z0-9-]/gi, "-")}`;
}

function statusTone(status) {
  return {
    Connected: "success",
    Busy: "warning",
    WaitingForConfirmation: "warning",
    Executing: "warning",
    Updating: "warning",
    Error: "error",
    Offline: "muted"
  }[status] || "muted";
}

function resultTone(ok) {
  if (ok === true) return "success";
  if (ok === false) return "error";
  return "muted";
}

function selectedContext() {
  return state.data.contexts[state.selectedHost] || {};
}

function contextSummary() {
  const item = selectedContext();
  const context = item.context || {};
  const target = context.activeComp || context.activeSequence || null;
  const selection = Array.isArray(context.selection) ? context.selection : [];
  return {
    projectName: item.project ? item.project.projectName : "Untitled Project",
    projectId: item.project ? item.project.projectId : "",
    activeTarget: target ? target.name : "None",
    selection: String(selection.length),
    lastSeenAt: item.lastSeenAt || "None",
    mode: item.connectionMode || "mock"
  };
}

function normalizedHostFilter() {
  return state.historyFilters.host === "selected" ? state.selectedHost : state.historyFilters.host;
}

function searchText(record) {
  return [record.commandId, record.host, record.action, record.code, record.message, record.sessionId]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filteredHistory() {
  const host = normalizedHostFilter();
  const query = state.historyFilters.query.trim().toLowerCase();
  return state.data.history.filter((record) => {
    if (host && host !== "all" && record.host !== host) return false;
    if (state.historyFilters.action && record.action !== state.historyFilters.action) return false;
    if (state.historyFilters.status === "success" && record.ok !== true) return false;
    if (state.historyFilters.status === "failed" && record.ok !== false) return false;
    if (query && !searchText(record).includes(query)) return false;
    return true;
  }).slice(0, state.historyFilters.limit);
}

function historyServiceQuery() {
  const query = new URLSearchParams();
  query.set("limit", String(state.historyFilters.limit));
  const host = normalizedHostFilter();
  if (host && host !== "all") query.set("host", host);
  if (state.historyFilters.action) query.set("action", state.historyFilters.action);
  if (state.historyFilters.status === "success") query.set("ok", "true");
  if (state.historyFilters.status === "failed") query.set("ok", "false");
  return query.toString();
}

function setPending(operation, actionId = null) {
  state.pendingOperation = operation;
  state.runningActionId = actionId;
  renderActivity();
  renderActions();
}

function normalizePrototypeServiceError(error) {
  const payload = error && error.payload ? error.payload : (error || {});
  const advice = Array.isArray(payload.advice) && payload.advice.length
    ? payload.advice
    : [t("commandCenter.error.defaultAdvice")];
  return {
    ok: false,
    status: error && error.status ? error.status : (payload.status || 0),
    code: payload.code || prototypeStateMap.serviceFailureCode,
    message: payload.message || (error && error.message ? error.message : "Local Service is unavailable."),
    advice,
    recoveryActions: sharedRecoveryActions
  };
}

function setError(error) {
  state.lastError = normalizePrototypeServiceError(error);
  state.serviceOnline = false;
}

function emptyStateMarkup(scope, messageKey) {
  const id = sharedEmptyStateIds[scope] || scope;
  return `<div class="emptyState" data-empty-state="${id}" data-state-map="${scope}">${t(messageKey)}</div>`;
}

function clearError() {
  state.lastError = null;
}

const controlIconMarkup = {
  sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.42 1.42"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>',
  panelClose: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m16 15-3-3 3-3"></path>',
  panelOpen: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m14 9 3 3-3 3"></path>'
};

function updateThemeModeIcons() {
  const iconName = state.theme === "light" ? "sun" : "moon";
  const themeLabel = state.theme === "light"
    ? (state.locale === "zh-CN" ? "浅色" : "Light")
    : (state.locale === "zh-CN" ? "深色" : "Dark");
  [el("themeToggle"), el("topThemeToggle")].filter(Boolean).forEach((button) => {
    const icon = button.querySelector('[data-icon-slot="theme"]');
    if (icon) icon.innerHTML = controlIconMarkup[iconName];
    button.dataset.icon = iconName;
    const actionLabel = state.locale === "zh-CN"
      ? `切换主题（当前：${themeLabel}）`
      : `Change theme (current: ${themeLabel})`;
    button.dataset.tooltip = actionLabel;
    button.setAttribute("aria-label", actionLabel);
  });
}

function updateSidebarToggleIcon() {
  const button = el("sidebarToggle");
  const shell = el("appShell");
  if (!button || !shell) return;
  const collapsed = shell.classList.contains("sidebarCollapsed");
  const actionLabel = collapsed
    ? (state.locale === "zh-CN" ? "展开侧栏" : "Expand sidebar")
    : (state.locale === "zh-CN" ? "收起侧栏" : "Collapse sidebar");
  const icon = button.querySelector('[data-icon-slot="sidebar"]');
  if (icon) icon.innerHTML = controlIconMarkup[collapsed ? "panelOpen" : "panelClose"];
  button.dataset.icon = collapsed ? "panel-open" : "panel-close";
  button.dataset.tooltip = actionLabel;
  button.setAttribute("aria-label", actionLabel);
  button.setAttribute("aria-pressed", collapsed ? "true" : "false");
}

let appTooltipTarget = null;

function hideAppTooltip() {
  const tooltip = el("appTooltip");
  if (!tooltip) return;
  tooltip.hidden = true;
  tooltip.setAttribute("aria-hidden", "true");
  tooltip.textContent = "";
  tooltip.style.removeProperty("left");
  tooltip.style.removeProperty("top");
  tooltip.removeAttribute("data-placement");
  appTooltipTarget = null;
}

function resolveTooltipPlacement(targetRect, tooltipRect, preferredPlacement = "top") {
  const gap = 8;
  const viewportPadding = 8;
  const placements = [preferredPlacement, "top", "bottom", "right", "left"]
    .filter((placement, index, items) => items.indexOf(placement) === index);
  const positionFor = (placement) => {
    if (placement === "bottom") {
      return { placement, left: targetRect.left + (targetRect.width - tooltipRect.width) / 2, top: targetRect.bottom + gap };
    }
    if (placement === "right") {
      return { placement, left: targetRect.right + gap, top: targetRect.top + (targetRect.height - tooltipRect.height) / 2 };
    }
    if (placement === "left") {
      return { placement, left: targetRect.left - tooltipRect.width - gap, top: targetRect.top + (targetRect.height - tooltipRect.height) / 2 };
    }
    return { placement: "top", left: targetRect.left + (targetRect.width - tooltipRect.width) / 2, top: targetRect.top - tooltipRect.height - gap };
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const clampCrossAxis = (position) => {
    if (["top", "bottom"].includes(position.placement)) {
      return { ...position, left: clamp(position.left, viewportPadding, window.innerWidth - tooltipRect.width - viewportPadding) };
    }
    return { ...position, top: clamp(position.top, viewportPadding, window.innerHeight - tooltipRect.height - viewportPadding) };
  };
  const fitsViewport = ({ left, top }) => (
    left >= viewportPadding
    && top >= viewportPadding
    && left + tooltipRect.width <= window.innerWidth - viewportPadding
    && top + tooltipRect.height <= window.innerHeight - viewportPadding
  );
  const position = placements.map((placement) => clampCrossAxis(positionFor(placement))).find(fitsViewport)
    || clampCrossAxis(positionFor(preferredPlacement));
  return {
    placement: position.placement,
    left: Math.min(window.innerWidth - tooltipRect.width - viewportPadding, Math.max(viewportPadding, position.left)),
    top: Math.min(window.innerHeight - tooltipRect.height - viewportPadding, Math.max(viewportPadding, position.top))
  };
}

function showAppTooltip(target) {
  const tooltip = el("appTooltip");
  const label = target?.dataset.tooltip?.trim();
  if (!tooltip || !label) {
    hideAppTooltip();
    return;
  }
  appTooltipTarget = target;
  tooltip.textContent = label;
  tooltip.hidden = false;
  tooltip.setAttribute("aria-hidden", "false");
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const sidebarTooltip = target.closest(".sidebar") && el("appShell")?.classList.contains("sidebarCollapsed");
  const preferredPlacement = sidebarTooltip ? "right" : (target.closest(".topbar") || targetRect.top < tooltipRect.height + 16 ? "bottom" : "top");
  const position = resolveTooltipPlacement(targetRect, tooltipRect, preferredPlacement);
  tooltip.dataset.placement = position.placement;
  tooltip.style.left = `${Math.round(position.left)}px`;
  tooltip.style.top = `${Math.round(position.top)}px`;
}

function bindAppTooltips() {
  const tooltipTarget = (event) => event.target.closest?.("[data-tooltip]");
  document.addEventListener("mouseover", (event) => {
    const target = tooltipTarget(event);
    if (target && target !== appTooltipTarget) showAppTooltip(target);
  });
  document.addEventListener("mouseout", (event) => {
    const target = tooltipTarget(event);
    if (target && target === appTooltipTarget && !target.contains(event.relatedTarget)) hideAppTooltip();
  });
  document.addEventListener("focusin", (event) => {
    const target = tooltipTarget(event);
    if (target) showAppTooltip(target);
  });
  document.addEventListener("focusout", (event) => {
    if (event.target === appTooltipTarget) hideAppTooltip();
  });
  document.addEventListener("pointerdown", hideAppTooltip, true);
  document.addEventListener("scroll", hideAppTooltip, true);
  window.addEventListener("resize", hideAppTooltip, { passive: true });
}

function renderNav() {
  hideAppTooltip();
  const iconOnly = el("appShell").classList.contains("sidebarCollapsed") || window.matchMedia("(max-width: 840px)").matches;
  el("navList").innerHTML = navGroups.map((group) => {
    const items = group.items.map((itemId) => navItems.find(([id]) => id === itemId)).filter(Boolean);
    return `
      <section class="navGroup" data-nav-group="${group.id}" aria-label="${escapeHtml(localText(group.label))}">
        <div class="navGroupLabel">${escapeHtml(localText(group.label))}</div>
        ${items.map(([id, icon, key]) => `
          <button class="navItem ${id === state.activeView ? "active" : ""}" type="button" data-nav-id="${id}" ${iconOnly ? `data-tooltip="${t(key)}"` : ""} aria-label="${t(key)}" aria-current="${id === state.activeView ? "page" : "false"}">
            <span class="navIcon">${navIconSvg(icon)}</span>
            <span class="navLabel">${t(key)}</span>
          </button>
        `).join("")}
      </section>
    `;
  }).join("");
  document.querySelectorAll(".navItem[data-nav-id]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.navId === "provider-hub" && state.activeView !== "provider-hub") {
        state.providerMobileView = "list";
      }
      setActiveView(button.dataset.navId);
      window.scrollTo(0, 0);
      el("commandWorkspace").scrollTop = 0;
      closeMobileNavigation();
      render();
    });
  });
  updateSidebarToggleIcon();
}

function applyThemeMode(mode, options = {}) {
  const nextMode = ["dark", "light", "system"].includes(mode) ? mode : "system";
  const resolvedTheme = resolveThemeMode(nextMode);
  state.themeMode = nextMode;
  state.theme = resolvedTheme;
  document.body.className = `theme-${state.theme}`;
  const shell = el("appShell");
  if (shell) {
    shell.classList.remove("theme-dark", "theme-light");
    shell.classList.add(`theme-${resolvedTheme}`);
  }
  applyPersonalizationColors();
  updateThemeModeIcons();
  professionalCodeEditor?.setTheme(resolvedTheme);
  featureCodeEditor?.setTheme(resolvedTheme);
  const buttons = [el("themeToggle"), el("topThemeToggle")].filter(Boolean);
  if (buttons.length) {
    buttons.forEach((button) => {
      button.dataset.themeMode = nextMode;
    });
  }
  if (options.persist !== false) {
    try {
      window.localStorage?.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (_error) {
      // Theme persistence is optional when storage is unavailable.
    }
  }
}

function applyPersonalizationColors(options = {}) {
  const themePalette = themeColorPalettes[state.themeColor] || themeColorPalettes.cyan;
  const themeValues = themePalette[state.theme] || themePalette.dark;
  const accentPalette = accentColorPalettes[state.accentColor] || accentColorPalettes.rose;
  const accentValue = accentPalette[state.theme] || accentPalette.dark;
  const targets = [document.body, el("appShell")].filter(Boolean);
  targets.forEach((target) => {
    target.style.setProperty("--color-accent", themeValues.accent);
    target.style.setProperty("--color-accent-hover", themeValues.hover);
    target.style.setProperty("--color-accent-active", themeValues.active);
    target.style.setProperty("--color-accent-soft", themeValues.soft);
    target.style.setProperty("--color-on-accent", themeValues.onAccent);
    target.style.setProperty("--accent", themeValues.accent);
    target.style.setProperty("--accent-hover", themeValues.hover);
    target.style.setProperty("--accent-active", themeValues.active);
    target.style.setProperty("--button-primary-text", themeValues.onAccent);
    target.style.setProperty("--focus-ring", themeValues.accent);
    target.style.setProperty("--selected-bg", themeValues.soft);
    target.style.setProperty("--color-brand-pink", accentValue);
    target.style.setProperty("--accent-2", accentValue);
  });
  if (options.persist !== false) {
    try {
      window.localStorage?.setItem(THEME_COLOR_STORAGE_KEY, state.themeColor);
      window.localStorage?.setItem(ACCENT_COLOR_STORAGE_KEY, state.accentColor);
    } catch (_error) {
      // Appearance persistence is optional when storage is unavailable.
    }
  }
}

function toggleThemeAppearance() {
  applyThemeMode(state.theme === "dark" ? "light" : "dark");
}

function openMobileNavigation() {
  el("appShell")?.classList.add("mobileNavOpen");
  el("mobileNavToggle")?.setAttribute("aria-expanded", "true");
}

function closeMobileNavigation() {
  el("appShell")?.classList.remove("mobileNavOpen");
  el("mobileNavToggle")?.setAttribute("aria-expanded", "false");
}

function renderTopbarTitle() {
  const title = document.querySelector(".topbarTitle h1");
  if (!title) return;
  if (state.activeView === "home") {
    title.textContent = state.locale === "zh-CN" ? "首页" : "Home";
    return;
  }
  const feature = featurePages[state.activeView];
  if (feature) {
    title.textContent = localText(feature.title);
  }
}

function renderWorkspaceMode() {
  const workspace = el("commandWorkspace");
  workspace.className = `workspace ${viewClassName(state.activeView)}`;
}

function textCapabilityBinding() {
  const bindings = (state.providerProfile && state.providerProfile.capabilityBindings) || {};
  return bindings.text || defaultProviderProfile().capabilityBindings.text;
}

function imageCapabilityBinding() {
  const bindings = (state.providerProfile && state.providerProfile.capabilityBindings) || {};
  return bindings.image || defaultProviderProfile().capabilityBindings.image;
}

function videoCapabilityBinding() {
  const bindings = (state.providerProfile && state.providerProfile.capabilityBindings) || {};
  return bindings.video || defaultProviderProfile().capabilityBindings.video;
}

function videoGenerationControlOptions() {
  const binding = state.videoReadiness.binding || videoCapabilityBinding();
  if (binding && binding.providerId === "minimax") {
    const hailuo = ["MiniMax-Hailuo-2.3", "MiniMax-Hailuo-02"].includes(binding.model);
    return { aspectRatio: false, durations: hailuo ? [6, 10] : [6], resolutions: hailuo ? ["768p", "1080p"] : ["720p"] };
  }
  return { aspectRatio: true, durations: [5, 10, 15], resolutions: ["480p", "720p", "1080p"] };
}

function normalizeVideoGenerationSettings() {
  const supported = videoGenerationControlOptions();
  if (!supported.durations.includes(Number(state.videoGenerationSettings.durationSeconds))) state.videoGenerationSettings.durationSeconds = supported.durations[0];
  if (!supported.resolutions.includes(state.videoGenerationSettings.resolution)) state.videoGenerationSettings.resolution = supported.resolutions[0];
}

function musicCapabilityBinding() {
  const bindings = (state.providerProfile && state.providerProfile.capabilityBindings) || {};
  return bindings.music || {};
}

function voiceCapabilityBinding() {
  const bindings = (state.providerProfile && state.providerProfile.capabilityBindings) || {};
  return bindings.voice || {};
}

function textGenerationState(viewId = state.activeView) {
  if (!state.textGeneration[viewId]) {
    state.textGeneration[viewId] = defaultTextGenerationState();
  }
  return state.textGeneration[viewId];
}

function textFeatureControlsHtml(viewId) {
  const settings = state.textFeatureSettings[viewId];
  if (viewId === "create") {
    return `
      <div class="featureTaskControls" aria-label="${state.locale === "zh-CN" ? "内容生成参数" : "Content generation settings"}">
        <label>
          <span>${state.locale === "zh-CN" ? "输出格式" : "Output format"}</span>
          <select id="featureContentFormat">
            <option value="short-video-script" ${settings.format === "short-video-script" ? "selected" : ""}>${state.locale === "zh-CN" ? "短视频脚本" : "Short video script"}</option>
            <option value="ad-structure" ${settings.format === "ad-structure" ? "selected" : ""}>${state.locale === "zh-CN" ? "广告片结构" : "Ad structure"}</option>
            <option value="creative-concepts" ${settings.format === "creative-concepts" ? "selected" : ""}>${state.locale === "zh-CN" ? "创意方向" : "Creative concepts"}</option>
          </select>
        </label>
        <label>
          <span>${state.locale === "zh-CN" ? "目标时长（秒）" : "Duration (seconds)"}</span>
          <input id="featureContentDuration" type="number" min="5" max="180" step="1" value="${escapeHtml(String(settings.durationSeconds))}">
        </label>
        <label>
          <span>${state.locale === "zh-CN" ? "表达语气" : "Tone"}</span>
          <select id="featureContentTone">
            <option value="direct" ${settings.tone === "direct" ? "selected" : ""}>${state.locale === "zh-CN" ? "直接有力" : "Direct"}</option>
            <option value="cinematic" ${settings.tone === "cinematic" ? "selected" : ""}>${state.locale === "zh-CN" ? "电影感" : "Cinematic"}</option>
            <option value="playful" ${settings.tone === "playful" ? "selected" : ""}>${state.locale === "zh-CN" ? "轻松活泼" : "Playful"}</option>
          </select>
        </label>
      </div>
    `;
  }
  if (viewId === "translate") {
    return `
      <div class="featureTaskControls translationTaskControls" aria-label="${state.locale === "zh-CN" ? "翻译参数" : "Translation settings"}">
        <label>
          <span>${state.locale === "zh-CN" ? "源语言" : "Source language"}</span>
          <select id="featureTranslationSource">
            <option value="auto" ${settings.sourceLanguage === "auto" ? "selected" : ""}>${state.locale === "zh-CN" ? "自动识别" : "Auto detect"}</option>
            <option value="zh-CN" ${settings.sourceLanguage === "zh-CN" ? "selected" : ""}>简体中文</option>
            <option value="en" ${settings.sourceLanguage === "en" ? "selected" : ""}>English</option>
            <option value="ja" ${settings.sourceLanguage === "ja" ? "selected" : ""}>日本語</option>
            <option value="ko" ${settings.sourceLanguage === "ko" ? "selected" : ""}>한국어</option>
          </select>
        </label>
        <label>
          <span>${state.locale === "zh-CN" ? "目标语言" : "Target language"}</span>
          <select id="featureTranslationTarget">
            <option value="en" ${settings.targetLanguage === "en" ? "selected" : ""}>English</option>
            <option value="zh-CN" ${settings.targetLanguage === "zh-CN" ? "selected" : ""}>简体中文</option>
            <option value="ja" ${settings.targetLanguage === "ja" ? "selected" : ""}>日本語</option>
            <option value="ko" ${settings.targetLanguage === "ko" ? "selected" : ""}>한국어</option>
          </select>
        </label>
        <label class="featureTaskToggle">
          <input id="featureTranslationTiming" type="checkbox" ${settings.preserveTiming ? "checked" : ""}>
          <span>${state.locale === "zh-CN" ? "保留字幕编号、断句和时间信息" : "Preserve subtitle numbering, breaks, and timing"}</span>
        </label>
      </div>
    `;
  }
  if (viewId === "storyboard") {
    return `
      <div class="featureTaskControls" aria-label="${state.locale === "zh-CN" ? "分镜参数" : "Storyboard settings"}">
        <label>
          <span>${state.locale === "zh-CN" ? "镜头数量" : "Shot count"}</span>
          <input id="featureStoryboardShots" type="number" min="1" max="30" step="1" value="${escapeHtml(String(settings.shots))}">
        </label>
        <label>
          <span>${state.locale === "zh-CN" ? "总时长（秒）" : "Total duration (seconds)"}</span>
          <input id="featureStoryboardDuration" type="number" min="3" max="600" step="1" value="${escapeHtml(String(settings.durationSeconds))}">
        </label>
      </div>
    `;
  }
  return "";
}

function providerProfileForBinding(binding) {
  const instances = (state.providerProfile && state.providerProfile.profileInstances) || {};
  if (binding && binding.profileId && instances[binding.profileId]) return instances[binding.profileId];
  return Object.values(instances).find((item) => item && item.providerId === (binding && binding.providerId))
    || ((state.providerProfile && state.providerProfile.profiles) || {})[(binding && binding.providerId) || ""]
    || null;
}

function textBindingSummaryHtml() {
  const binding = textCapabilityBinding();
  const profile = providerProfileForBinding(binding);
  const configured = Boolean(profile && profile.apiKeyStatus && profile.apiKeyStatus.configured);
  const title = state.locale === "zh-CN" ? "当前文本模型" : "Current Text Model";
  const sub = state.locale === "zh-CN" ? "由 Provider Hub 的文本能力绑定决定" : "Selected by the Provider Hub text binding";
  return `
    <section class="featureProviderSummary" aria-label="${escapeHtml(title)}">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(sub)}</span>
      </div>
      <dl>
        <div><dt>Provider</dt><dd>${escapeHtml(providerLabel(binding.providerId))}</dd></div>
        <div><dt>Model</dt><dd>${escapeHtml(providerModelLabel(binding.providerId, binding.model))}</dd></div>
        <div><dt>Status</dt><dd><span class="providerStateBadge ${configured ? "success" : "warning"}">${configured ? (state.locale === "zh-CN" ? "可生成" : "Ready") : (state.locale === "zh-CN" ? "需要配置 Key" : "API key required")}</span></dd></div>
      </dl>
    </section>
  `;
}

function textGenerationErrorHtml(generation) {
  const guidance = providerErrorGuidance[generation.errorCode];
  const title = guidance ? localText(guidance.title) : (generation.errorCode || (state.locale === "zh-CN" ? "生成失败" : "Generation failed"));
  const message = generation.message || (guidance ? localText(guidance.message) : (state.locale === "zh-CN" ? "文本生成请求未完成。" : "Text generation did not complete."));
  const serviceAdvice = Array.isArray(generation.advice) ? generation.advice : [];
  const advice = serviceAdvice.length
    ? serviceAdvice.map((item) => item.labelZh || item.labelEn || item.id || String(item))
    : (guidance ? guidance.actions.map((item) => localText(item)) : []);
  return `
    <div class="textGenerationError" role="alert">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
      ${advice.length ? `<ul>${advice.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
    </div>
  `;
}

function textGenerationOutputHtml(feature, generation) {
  if (generation.status === "generating") {
    return `
      <div class="textGenerationEmpty busy" role="status">
        <span class="statusDot warning"></span>
        <strong>${state.locale === "zh-CN" ? "正在生成" : "Generating"}</strong>
        <p>${state.locale === "zh-CN" ? "请求已发送到当前绑定模型，可随时取消。" : "The request is running on the bound model and can be cancelled."}</p>
      </div>
    `;
  }
  if (generation.status === "error" || generation.status === "cancelled") {
    return textGenerationErrorHtml(generation);
  }
  if (generation.status === "success") {
    const usage = generation.usage || {};
    const binding = generation.binding || textCapabilityBinding();
    return `
      <article class="textGenerationResult">
        ${generation.reasoning ? `
          <details class="textReasoningBlock">
            <summary>${state.locale === "zh-CN" ? "查看模型思考摘要" : "View reasoning summary"}</summary>
            <div>${escapeHtml(generation.reasoning)}</div>
          </details>
        ` : ""}
        <div class="textGenerationContent">${escapeHtml(generation.content)}</div>
        <footer>
          <span>${escapeHtml(providerLabel(binding.providerId))} · ${escapeHtml(providerModelLabel(binding.providerId, binding.model))}</span>
          <span>${usage.totalTokens ? `${usage.totalTokens} tokens` : (state.locale === "zh-CN" ? "用量未返回" : "Usage unavailable")}</span>
        </footer>
      </article>
    `;
  }
  return `
    <div class="textGenerationEmpty">
      <span class="statusDot muted"></span>
      <strong>${escapeHtml(localText(feature.outputTitle))}</strong>
      <p>${state.locale === "zh-CN" ? "输入任务后，结果会由当前文本能力绑定的真实模型返回。" : "Enter a task to generate with the model bound to text capability."}</p>
    </div>
  `;
}

function renderTextGenerationWorkspace(feature, workspace) {
  const generation = textGenerationState();
  const binding = textCapabilityBinding();
  const metrics = [
    ["Provider", providerLabel(binding.providerId)],
    ["Model", providerModelLabel(binding.providerId, binding.model)],
    ["Status", generation.status === "generating" ? (state.locale === "zh-CN" ? "生成中" : "Generating") : (state.serviceOnline ? "Service" : "Local")]
  ].map(([label, value]) => `
    <div class="featureMetric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
  const chips = feature.chips.map((chip) => `<button type="button" data-text-prompt-chip="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`).join("");
  const taskControls = textFeatureControlsHtml(state.activeView);
  const sideItems = feature.sideItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const historyRows = feature.historyRows.map((row) => `
    <button class="featureHistoryRow" type="button" data-text-history="${escapeHtml(row)}">
      <span class="utilityIcon">${navIconSvg(feature.icon)}</span>
      <span>${escapeHtml(row)}</span>
      <small>${state.locale === "zh-CN" ? "示例" : "sample"}</small>
    </button>
  `).join("");
  const generating = generation.status === "generating";
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="featureHero">
      <div class="featureHeroText">
        <span class="featureEyebrow">${escapeHtml(localText(feature.eyebrow))}</span>
        <h2>${escapeHtml(localText(feature.title))}</h2>
        <p>${escapeHtml(localText(feature.intro))}</p>
      </div>
      <div class="featureMetricGrid" aria-label="Text generation status">${metrics}</div>
    </section>
    <section class="featurePageGrid textGenerationPageGrid">
      <section class="featurePanel featureComposerPanel textComposerPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${state.locale === "zh-CN" ? "任务输入" : "Prompt"}</h3>
            <span>${escapeHtml(localText(feature.promptLabel))}</span>
          </div>
          <span class="featureModeBadge">${state.serviceOnline ? "Live" : "Local Service"}</span>
        </div>
        <textarea class="featurePromptInput" id="featurePromptInput" placeholder="${escapeHtml(localText(feature.prompt))}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea>
        ${taskControls}
        <div class="featureChipRow" aria-label="Quick prompts">${chips}</div>
        <div class="featureActionRow">
          <button class="featurePrimaryButton" id="featureGenerateButton" type="button" ${generating ? "disabled" : ""}>${generating ? (state.locale === "zh-CN" ? "生成中" : "Generating") : escapeHtml(localText(feature.primary))}</button>
          <button class="featureSecondaryButton" id="featureCancelButton" type="button" ${generating ? "" : "hidden disabled"}>${state.locale === "zh-CN" ? "取消生成" : "Cancel"}</button>
          <button class="featureSecondaryButton" id="featureSecondaryButton" type="button" ${generating ? "disabled" : ""}>${escapeHtml(localText(feature.secondary))}</button>
        </div>
      </section>
      <section class="featurePanel featureOutputPanel textGenerationOutputPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${escapeHtml(localText(feature.outputTitle))}</h3>
            <span>${generation.generatedAt ? new Date(generation.generatedAt).toLocaleString(state.locale === "zh-CN" ? "zh-CN" : "en-US") : (state.locale === "zh-CN" ? "真实 Provider 输出" : "Live provider output")}</span>
          </div>
        </div>
        <div class="textGenerationOutput">${textGenerationOutputHtml(feature, generation)}</div>
      </section>
      <aside class="featurePanel featureSidePanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${escapeHtml(localText(feature.sideTitle))}</h3>
            <span>${state.locale === "zh-CN" ? "当前功能约束" : "Current constraints"}</span>
          </div>
        </div>
        <ul class="featureSideList">${sideItems}</ul>
      </aside>
      ${textBindingSummaryHtml()}
      <section class="featurePanel featureHistoryPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${escapeHtml(localText(feature.historyTitle))}</h3>
            <span>${state.locale === "zh-CN" ? "点击填入示例任务" : "Click to reuse a sample"}</span>
          </div>
        </div>
        <div class="featureHistoryList">${historyRows}</div>
      </section>
    </section>
  `;
  bindTextGenerationWorkspace();
  const threadStream = workspace.querySelector(".assistantThreadStream");
  if (threadStream && state.assistantConversation.length) {
    threadStream.scrollTop = threadStream.scrollHeight;
  }
}

function textGenerationSystemPrompt(viewId) {
  if (viewId === "create") {
    return state.locale === "zh-CN"
      ? "你是 Kuroii Motion AI Suite 的内容策划助手。根据用户目标生成适合 AE/PR 制作的内容结构，明确开头钩子、主体段落、画面建议、字幕或旁白以及结尾 CTA。不要声称已经读取未提供的工程内容。"
      : "You are the Kuroii Motion AI Suite content planning assistant. Create production-ready structures for AE/PR with a hook, sections, visual direction, copy or voiceover, and CTA. Never claim unavailable host context.";
  }
  if (viewId === "copy") {
    return state.locale === "zh-CN"
      ? "你是 Kuroii Motion AI Suite 的文案创作助手。为 AE/PR 视频制作输出可直接使用的中文文案，优先短句、清晰层级和多个可比较方案。不要虚构已读取的宿主内容。"
      : "You are the Kuroii Motion AI Suite copywriting assistant. Produce concise, production-ready copy for AE/PR video workflows, with clear variants. Never claim host context you did not receive.";
  }
  if (viewId === "translate") {
    return state.locale === "zh-CN"
      ? "你是 Kuroii Motion AI Suite 的视频本地化助手。准确翻译字幕、图层文字和发布文案，保持术语一致、语气自然，并严格遵守用户要求的编号、断句和时间格式。只处理用户提供的文本。"
      : "You are the Kuroii Motion AI Suite localization assistant. Translate subtitles, layer text, and publishing copy accurately, preserve terminology and requested timing or line structure, and only process supplied text.";
  }
  if (viewId === "storyboard") {
    return state.locale === "zh-CN"
      ? "你是 Kuroii Motion AI Suite 的分镜脚本助手。按指定镜头数和总时长输出可制作的镜头表，每个镜头必须包含时间段、画面、字幕或旁白、动效和转场建议，时长总和必须匹配目标时长。"
      : "You are the Kuroii Motion AI Suite storyboard assistant. Produce a production-ready shot list matching the requested shot count and total duration. Each shot must include timing, visuals, copy or voiceover, motion, and transition notes.";
  }
  if (viewId === "script") {
    return state.locale === "zh-CN"
      ? "你是 Kuroii Motion AI Suite 的 AE/PR 脚本工程师。输出可审查的脚本草案，明确宿主、权限、修改范围和回滚方式。默认不声称已执行脚本，不执行高风险操作。"
      : "You are the Kuroii Motion AI Suite AE/PR scripting engineer. Produce reviewable script drafts with host, permissions, mutation scope, and rollback notes. Never claim execution and avoid unsafe operations.";
  }
  return state.locale === "zh-CN"
    ? "你是 Kuroii Motion AI Suite 的小黑助手。围绕 AE/PR 动效与剪辑工作给出具体、可执行、风险明确的建议。当前未提供的宿主信息不要假装已经读取。"
    : "You are Kuroii Assistant for AE/PR motion and editing work. Give concrete, executable, risk-aware guidance. Never pretend to have host context that was not provided.";
}

function textGenerationOptions(viewId) {
  if (viewId === "create" || viewId === "copy") return { temperature: 0.8, maxTokens: 1400 };
  if (viewId === "translate") return { temperature: 0.2, maxTokens: 1800 };
  if (viewId === "storyboard") return { temperature: 0.5, maxTokens: 2200 };
  return { temperature: 0.4, maxTokens: 1400 };
}

function textGenerationRequestContext(viewId, prompt) {
  const settings = state.textFeatureSettings[viewId];
  if (viewId === "create") {
    return [
      `Output format: ${settings.format}`,
      `Target duration: ${settings.durationSeconds} seconds`,
      `Tone: ${settings.tone}`,
      "",
      prompt
    ].join("\n");
  }
  if (viewId === "translate") {
    return [
      `Source language: ${settings.sourceLanguage}`,
      `Target language: ${settings.targetLanguage}`,
      `Preserve timing and line structure: ${settings.preserveTiming ? "yes" : "no"}`,
      "",
      prompt
    ].join("\n");
  }
  if (viewId === "storyboard") {
    return [
      `Shot count: ${settings.shots}`,
      `Total duration: ${settings.durationSeconds} seconds`,
      "Required columns: shot, time range, visual, copy/voiceover, motion, transition",
      "",
      prompt
    ].join("\n");
  }
  return prompt;
}

function bindBoundedNumberInput(id, target, key, min, max, fallback) {
  const input = el(id);
  if (!input) return;
  const syncValue = () => {
    const raw = String(input.value || "").trim();
    if (!raw) return false;
    const value = Number(raw);
    if (!Number.isFinite(value)) return false;
    target[key] = Math.min(max, Math.max(min, value));
    return true;
  };
  input.addEventListener("input", syncValue);
  input.addEventListener("change", () => {
    if (!syncValue()) target[key] = fallback;
    input.value = String(target[key]);
  });
}

function appendAssistantConversationMessage(message) {
  const entry = {
    id: `assistant-message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    role: "assistant",
    status: "success",
    content: "",
    ...message
  };
  state.assistantConversation.push(entry);
  persistAssistantConversation();
  return entry;
}

function updateAssistantConversationMessage(message, changes) {
  if (!message) return;
  Object.assign(message, changes);
  persistAssistantConversation();
}

async function runTextGeneration() {
  if (!state.providerProfileReady) return;
  const viewId = state.activeView;
  const generation = textGenerationState(viewId);
  const prompt = String(generation.prompt || "").trim();
  if (!prompt) {
    generation.status = "error";
    generation.errorCode = "CONFIG_MISSING";
    generation.message = state.locale === "zh-CN" ? "请先输入要处理的任务。" : "Enter a task before generating.";
    generation.advice = [];
    requestFocus("featurePromptInput");
    render();
    return;
  }
  let assistantReply = null;
  if (viewId === "copilot") {
    appendAssistantConversationMessage({ role: "user", content: prompt });
    assistantReply = appendAssistantConversationMessage({ role: "assistant", status: "generating" });
    generation.prompt = "";
  }
  generation.status = "generating";
  generation.content = "";
  generation.reasoning = "";
  generation.errorCode = null;
  generation.message = "";
  generation.advice = [];
  generation.usage = null;
  generation.binding = null;
  generation.generatedAt = null;
  const controller = new AbortController();
  textGenerationController = controller;
  render();
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/text/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kuroii-Session": "dev-local-token"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: textGenerationSystemPrompt(viewId) },
          { role: "user", content: textGenerationRequestContext(viewId, prompt) }
        ],
        options: textGenerationOptions(viewId)
      }),
      signal: controller.signal
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    if (!payload.ok) {
      const error = new Error(payload.message || "Text generation failed.");
      error.payload = payload;
      throw error;
    }
    generation.status = "success";
    generation.content = payload.content || "";
    generation.reasoning = payload.reasoning || "";
    generation.usage = payload.usage || null;
    generation.binding = payload.binding || textCapabilityBinding();
    generation.generatedAt = payload.generatedAt || new Date().toISOString();
    updateAssistantConversationMessage(assistantReply, {
      status: "success",
      content: generation.content,
      reasoning: generation.reasoning,
      usage: generation.usage,
      binding: generation.binding,
      generatedAt: generation.generatedAt
    });
    state.serviceOnline = true;
    state.lastError = null;
  } catch (error) {
    if (error && error.name === "AbortError") {
      generation.status = "cancelled";
      generation.errorCode = "REQUEST_CANCELLED";
      generation.message = state.locale === "zh-CN" ? "本次生成已取消。" : "Generation was cancelled.";
      generation.advice = [];
    } else {
      const payload = error && error.payload ? error.payload : {};
      generation.status = "error";
      generation.errorCode = payload.code || (error && error.status ? "LOCAL_SERVICE_ERROR" : "LOCAL_SERVICE_OFFLINE");
      generation.message = payload.message || (state.locale === "zh-CN" ? "无法连接 Local Service，请确认服务已启动。" : "Could not reach Local Service. Make sure it is running.");
      generation.advice = Array.isArray(payload.advice) ? payload.advice : [];
      state.serviceOnline = Boolean(error && error.status);
    }
    updateAssistantConversationMessage(assistantReply, {
      status: generation.status,
      message: generation.message,
      errorCode: generation.errorCode,
      advice: generation.advice
    });
  } finally {
    if (textGenerationController === controller) {
      textGenerationController = null;
    }
    render();
  }
}

function bindTextGenerationWorkspace() {
  const viewId = state.activeView;
  const feature = featurePages[viewId];
  const generation = textGenerationState(viewId);
  const settings = state.textFeatureSettings[viewId];
  const input = el("featurePromptInput");
  if (viewId === "create") {
    el("featureContentFormat")?.addEventListener("change", (event) => {
      settings.format = event.target.value;
    });
    bindBoundedNumberInput("featureContentDuration", settings, "durationSeconds", 5, 180, 30);
    el("featureContentTone")?.addEventListener("change", (event) => {
      settings.tone = event.target.value;
    });
  }
  if (viewId === "translate") {
    el("featureTranslationSource")?.addEventListener("change", (event) => {
      settings.sourceLanguage = event.target.value;
    });
    el("featureTranslationTarget")?.addEventListener("change", (event) => {
      settings.targetLanguage = event.target.value;
    });
    el("featureTranslationTiming")?.addEventListener("change", (event) => {
      settings.preserveTiming = event.target.checked;
    });
  }
  if (viewId === "storyboard") {
    bindBoundedNumberInput("featureStoryboardShots", settings, "shots", 1, 30, 6);
    bindBoundedNumberInput("featureStoryboardDuration", settings, "durationSeconds", 3, 600, 15);
  }
  input?.addEventListener("input", (event) => {
    generation.prompt = event.target.value;
    if (generation.status === "error" && generation.errorCode === "CONFIG_MISSING") {
      generation.status = "idle";
      generation.errorCode = null;
      generation.message = "";
    }
  });
  input?.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runTextGeneration();
    }
  });
  el("featureGenerateButton")?.addEventListener("click", runTextGeneration);
  el("featureCancelButton")?.addEventListener("click", () => {
    if (generation.status === "generating" && textGenerationController) {
      textGenerationController.abort();
    }
  });
  el("featureSecondaryButton")?.addEventListener("click", () => {
    generation.prompt = localText(feature.prompt);
    generation.status = "idle";
    generation.errorCode = null;
    generation.message = "";
    requestFocus("featurePromptInput");
    render();
  });
  document.querySelectorAll("[data-text-prompt-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      const chip = button.dataset.textPromptChip;
      generation.prompt = `${chip}：${generation.prompt || localText(feature.prompt)}`;
      generation.status = "idle";
      generation.errorCode = null;
      requestFocus("featurePromptInput");
      render();
    });
  });
  document.querySelectorAll("[data-text-history]").forEach((button) => {
    button.addEventListener("click", () => {
      generation.prompt = button.dataset.textHistory || "";
      generation.status = "idle";
      generation.errorCode = null;
      requestFocus("featurePromptInput");
      render();
    });
  });
  bindCreateModeControls();
}

function createModeToggleHtml() {
  return `
    <div class="createModeToggle" role="group" aria-label="${state.locale === "zh-CN" ? "内容生成模式" : "Content generation mode"}">
      <button type="button" data-create-mode="text" class="${state.createMode === "text" ? "active" : ""}" aria-pressed="${state.createMode === "text" ? "true" : "false"}">${state.locale === "zh-CN" ? "文案" : "Text"}</button>
      <button type="button" data-create-mode="image" class="${state.createMode === "image" ? "active" : ""}" aria-pressed="${state.createMode === "image" ? "true" : "false"}">${state.locale === "zh-CN" ? "图片" : "Image"}</button>
      <button type="button" data-create-mode="video" class="${state.createMode === "video" ? "active" : ""}" aria-pressed="${state.createMode === "video" ? "true" : "false"}">${state.locale === "zh-CN" ? "视频" : "Video"}</button>
      <button type="button" data-create-mode="music" class="${state.createMode === "music" ? "active" : ""}" aria-pressed="${state.createMode === "music" ? "true" : "false"}">${state.locale === "zh-CN" ? "音乐" : "Music"}</button>
      <button type="button" data-create-mode="voice" class="${state.createMode === "voice" ? "active" : ""}" aria-pressed="${state.createMode === "voice" ? "true" : "false"}">${state.locale === "zh-CN" ? "配音" : "Voice"}</button>
    </div>
  `;
}

function bindCreateModeControls() {
  document.querySelectorAll("[data-create-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.dataset.createMode;
      if (!nextMode || nextMode === state.createMode) return;
      if (textGenerationController) textGenerationController.abort();
      if (imageGenerationController) imageGenerationController.abort();
      if (videoGenerationController) videoGenerationController.abort();
      state.createMode = nextMode;
      render();
      if (nextMode === "image" && state.imageHistoryStatus === "idle") void loadImageHistory();
      if (nextMode === "video") {
        if (state.videoTasksStatus === "idle") void loadVideoTasks();
        void loadVideoReadiness();
      }
      if (["music", "voice"].includes(nextMode) && state.audioHistoryStatus === "idle") void loadAudioHistory();
    });
  });
}

function safeGeneratedImageSource(value) {
  const source = String(value || "").trim();
  if (/^https?:\/\//i.test(source)) return source;
  if (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source)) return source;
  return "";
}

function safeGeneratedVideoSource(value) {
  const source = String(value || "").trim();
  if (/^https?:\/\//i.test(source)) return source;
  if (/^data:video\/(mp4|webm);base64,[a-z0-9+/=]+$/i.test(source)) return source;
  return "";
}

function imageHistoryDateLabel(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(state.locale === "zh-CN" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function imageHistorySelectedIds() {
  return new Set(state.selectedImageHistoryIds || []);
}

function imageHistoryStorageLabel(bytes) {
  const value = Math.max(0, Number(bytes) || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function assetLibraryKindLabel(item) {
  const kind = String(item && item.kind || "");
  const labels = {
    image: { "zh-CN": "图片", "en-US": "Image" },
    video: { "zh-CN": "视频", "en-US": "Video" },
    music: { "zh-CN": "音乐", "en-US": "Music" },
    voice: { "zh-CN": "配音", "en-US": "Voice" },
    "music-direction": { "zh-CN": "音乐方案", "en-US": "Music plan" },
    "voice-plan": { "zh-CN": "配音方案", "en-US": "Voice plan" }
  };
  return localText(labels[kind] || { "zh-CN": "资产", "en-US": "Asset" });
}

function assetLibraryIcon(item) {
  const kind = String(item && item.kind || "");
  if (kind === "image") return "IMG";
  if (kind === "video") return "VID";
  if (kind === "music" || kind === "music-direction") return "MUS";
  if (kind === "voice" || kind === "voice-plan") return "VOX";
  return "AST";
}

function assetLibraryStatusLabel(status) {
  const labels = {
    ready: { "zh-CN": "可用", "en-US": "Ready" },
    reference: { "zh-CN": "引用", "en-US": "Reference" },
    planned: { "zh-CN": "方案", "en-US": "Planned" },
    missing: { "zh-CN": "文件缺失", "en-US": "Missing" },
    queued: { "zh-CN": "排队中", "en-US": "Queued" },
    processing: { "zh-CN": "生成中", "en-US": "Processing" },
    succeeded: { "zh-CN": "已完成", "en-US": "Completed" },
    failed: { "zh-CN": "失败", "en-US": "Failed" }
  };
  return localText(labels[String(status || "").toLowerCase()] || { "zh-CN": "未知", "en-US": "Unknown" });
}

function assetLibraryFilteredItems() {
  const filter = state.assetLibraryFilter || "all";
  const query = String(state.assetLibraryQuery || "").trim().toLowerCase();
  return (state.assetLibrary || []).filter((item) => {
    if (filter !== "all" && item.assetType !== filter) return false;
    if (!query) return true;
    return [item.title, item.kind, item.providerId, item.model, item.fileName].join(" ").toLowerCase().includes(query);
  });
}

async function loadAssetLibrary(options = {}) {
  const renderAfter = options.renderAfter !== false;
  state.assetLibraryStatus = "loading";
  if (renderAfter) render();
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/assets?limit=72", {
      headers: { "X-Kuroii-Session": "dev-local-token" }
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    state.assetLibrary = Array.isArray(payload.items) ? payload.items : [];
    const pendingSelection = state.assetLibraryPendingSelection;
    const pendingAsset = pendingSelection && state.assetLibrary.find((item) => item.assetType === pendingSelection.assetType && item.id === pendingSelection.id);
    if (pendingAsset) {
      state.selectedAssetLibraryId = pendingAsset.id;
      state.assetLibraryDetail = null;
    } else if (!state.selectedAssetLibraryId || !state.assetLibrary.some((item) => item.id === state.selectedAssetLibraryId)) {
      state.selectedAssetLibraryId = state.assetLibrary[0] ? state.assetLibrary[0].id : null;
      state.assetLibraryDetail = null;
    }
    state.assetLibraryPendingSelection = null;
    state.assetLibraryStatus = "ready";
    state.serviceOnline = true;
  } catch (error) {
    state.assetLibraryStatus = "error";
    state.assetLibraryNotice = state.locale === "zh-CN" ? "本地资源库暂不可用。" : "The local asset library is unavailable.";
  } finally {
    if (renderAfter) render();
  }
}

function openAssetLibrary(assetType = "all", assetId = "") {
  state.assetLibraryFilter = ["image", "audio", "video"].includes(assetType) ? assetType : "all";
  state.assetLibraryQuery = "";
  state.assetLibraryPendingSelection = assetId ? { assetType, id: assetId } : null;
  state.assetLibraryDetail = null;
  setActiveView("library");
  el("commandWorkspace").scrollTop = 0;
  render();
  void loadAssetLibrary({ renderAfter: true });
}

function mountAssetLibraryShortcut(buttonId, assetType, assetId = "") {
  const headerTools = document.querySelector("#featureWorkspace .workbenchHeaderTools");
  if (!headerTools || document.getElementById(buttonId)) return;
  const label = state.locale === "zh-CN" ? "查看资源库" : "View assets";
  headerTools.insertAdjacentHTML("beforeend", `<button class="featureSecondaryButton assetLibraryShortcut" id="${escapeHtml(buttonId)}" type="button">${label}</button>`);
  el(buttonId)?.addEventListener("click", () => openAssetLibrary(assetType, assetId || ""));
}

function restoreAssetLibraryItem(detailPayload = state.assetLibraryDetail) {
  const asset = detailPayload && detailPayload.asset;
  const detail = detailPayload && detailPayload.detail;
  if (!asset || !detail) return;
  if (asset.assetType === "image") {
    applyImageHistoryItem(detail, { focusPrompt: true });
    state.createMode = "image";
  } else if (asset.assetType === "video") {
    state.videoGenerationSettings = { ...state.videoGenerationSettings, ...(detail.options || {}) };
    normalizeVideoGenerationSettings();
    state.videoGeneration = {
      ...defaultVideoGenerationState(),
      prompt: detail.prompt || "",
      status: detail.status === "succeeded" ? "success" : (detail.status === "failed" ? "error" : "idle"),
      task: detail,
      binding: detail.binding || videoCapabilityBinding(),
      diagnostics: detail.diagnostics || null,
      errorCode: detail.error && detail.error.code ? detail.error.code : null,
      message: detail.error && detail.error.message ? detail.error.message : ""
    };
    state.selectedVideoTaskId = detail.id || null;
    state.createMode = "video";
    requestFocus("featurePromptInput");
  } else if (asset.kind === "music" || asset.kind === "music-direction") {
    const metadata = detail.metadata || {};
    state.musicDirection = {
      ...defaultMusicDirectionState(),
      brief: detail.title || detail.prompt || "",
      useCase: metadata.useCase || "video",
      mode: metadata.mode || "instrumental",
      prompt: detail.prompt || "",
      blueprint: detail.blueprint || "",
      status: detail.hasAudio ? "completed" : (detail.prompt ? "ready" : "idle"),
      audio: detail.hasAudio ? detail : null
    };
    state.createMode = "music";
    requestFocus("musicDirectionBrief");
  } else {
    const metadata = detail.metadata || {};
    const script = detail.script || detail.prompt || "";
    state.voiceDirection = {
      ...defaultVoiceDirectionState(),
      script,
      segments: Array.isArray(detail.segments) && detail.segments.length ? detail.segments : voiceScriptSegments(script),
      language: metadata.language || "zh-CN",
      voice: metadata.voice || "narrator",
      voiceId: metadata.voiceId || "",
      pace: metadata.pace || "natural",
      emotion: metadata.emotion || "confident",
      status: detail.hasAudio ? "completed" : (script ? "ready" : "idle"),
      audio: detail.hasAudio ? detail : null
    };
    state.createMode = "voice";
    requestFocus("voiceDirectionScript");
  }
  setActiveView("create");
  el("commandWorkspace").scrollTop = 0;
  render();
}

function assetLibraryRegenerationCapability(detailPayload = state.assetLibraryDetail) {
  const asset = detailPayload && detailPayload.asset;
  if (!asset) return "";
  if (asset.assetType === "image") return "image";
  if (asset.assetType === "video") return "video";
  return asset.kind === "music" || asset.kind === "music-direction" ? "music" : "voice";
}

function assetLibraryRegenerationBinding(capabilityId) {
  const status = capabilityConnectionStatus(capabilityId);
  if (status.binding) return status.binding;
  const fallback = {
    image: imageCapabilityBinding(),
    video: videoCapabilityBinding(),
    music: musicCapabilityBinding(),
    voice: voiceCapabilityBinding()
  };
  return fallback[capabilityId] || {};
}

function assetLibraryRegenerationPlan(detailPayload = state.assetLibraryDetail) {
  const capability = assetLibraryRegenerationCapability(detailPayload);
  const readiness = capability ? capabilityConnectionStatus(capability) : null;
  const binding = capability ? assetLibraryRegenerationBinding(capability) : {};
  const routes = {
    image: "/ai/image/generate",
    video: "/ai/video/generate",
    music: "/ai/music/generate",
    voice: "/ai/voice/generate"
  };
  return {
    capability,
    readiness,
    binding,
    route: routes[capability] || "",
    ready: Boolean(
      readiness
      && readiness.state === "connected"
      && (capability !== "video" || state.videoReadiness.ready)
    ),
    title: detailPayload && detailPayload.asset ? detailPayload.asset.title || assetLibraryKindLabel(detailPayload.asset) : ""
  };
}

function requestAssetLibraryRegeneration(detailPayload = state.assetLibraryDetail) {
  const asset = detailPayload && detailPayload.asset;
  if (!asset || !detailPayload.detail) return;
  state.assetLibraryRegenerationConfirm = { assetType: asset.assetType, id: asset.id };
  const plan = assetLibraryRegenerationPlan(detailPayload);
  if (state.capabilityConnection.status === "idle") void loadCapabilityConnectionStatuses();
  if (plan.capability === "video" && state.videoReadiness.status === "idle") void loadVideoReadiness();
  requestFocus("assetLibraryRegenerateDialog");
  render();
}

function cancelAssetLibraryRegeneration() {
  state.assetLibraryRegenerationConfirm = null;
  render();
}

function confirmAssetLibraryRegeneration() {
  const confirmation = state.assetLibraryRegenerationConfirm;
  const detailPayload = state.assetLibraryDetail;
  const asset = detailPayload && detailPayload.asset;
  if (!confirmation || !asset || asset.id !== confirmation.id || asset.assetType !== confirmation.assetType) {
    cancelAssetLibraryRegeneration();
    return;
  }
  const plan = assetLibraryRegenerationPlan(detailPayload);
  if (!plan.ready) return;
  state.assetLibraryRegenerationConfirm = null;
  restoreAssetLibraryItem(detailPayload);
  window.requestAnimationFrame(() => {
    if (plan.capability === "image") void runImageGeneration();
    else if (plan.capability === "video") void runVideoGeneration();
    else if (plan.capability === "music") void generateMusicAudio();
    else if (plan.capability === "voice") void generateVoiceAudio();
  });
}

async function loadAssetLibraryDetail(asset, options = {}) {
  if (!asset || !asset.assetType || !asset.id) return null;
  state.selectedAssetLibraryId = asset.id;
  state.assetLibraryDetail = null;
  state.assetLibraryRegenerationConfirm = null;
  if (options.renderAfter !== false) render();
  try {
    const response = await fetch(`http://127.0.0.1:17631/ai/assets/${encodeURIComponent(asset.assetType)}/${encodeURIComponent(asset.id)}`, {
      headers: { "X-Kuroii-Session": "dev-local-token" }
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    if (!payload.ok || !payload.detail) throw new Error("Asset detail is unavailable.");
    state.assetLibraryDetail = payload;
    state.serviceOnline = true;
    return payload;
  } catch (error) {
    state.assetLibraryNotice = state.locale === "zh-CN" ? "无法打开这条资源记录。" : "This asset record could not be opened.";
    return null;
  } finally {
    if (options.renderAfter !== false) render();
  }
}

function downloadAssetLibraryItem(detailPayload = state.assetLibraryDetail) {
  const asset = detailPayload && detailPayload.asset;
  const detail = detailPayload && detailPayload.detail;
  if (!asset || !detail) return;
  const source = asset.assetType === "image"
    ? safeGeneratedImageSource(detail.imageUrl)
    : asset.assetType === "audio"
      ? String(detail.audioUrl || "").trim()
      : safeGeneratedVideoSource(detail.videoUrl);
  if (!source) return;
  const link = document.createElement("a");
  link.href = source;
  link.download = asset.fileName || `kuroii-${asset.assetType}-${Date.now()}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function deleteAssetLibraryItem(asset) {
  if (!asset || !asset.assetType || !asset.id) return;
  const message = state.locale === "zh-CN"
    ? `删除“${asset.title || assetLibraryKindLabel(asset)}”及其受管理的本地文件？此操作无法撤销。`
    : `Delete “${asset.title || assetLibraryKindLabel(asset)}” and its managed local file? This cannot be undone.`;
  if (!window.confirm(message)) return;
  state.assetLibraryStatus = "loading";
  render();
  try {
    const response = await fetch(`http://127.0.0.1:17631/ai/assets/${encodeURIComponent(asset.assetType)}/${encodeURIComponent(asset.id)}`, {
      method: "DELETE",
      headers: { "X-Kuroii-Session": "dev-local-token" }
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    if (!payload.ok) throw new Error("Asset was not deleted.");
    state.assetLibraryNotice = state.locale === "zh-CN" ? `已删除 ${payload.deletedCount || 0} 条资源记录。` : `Deleted ${payload.deletedCount || 0} asset record(s).`;
    state.assetLibraryDetail = null;
    state.selectedAssetLibraryId = null;
    await loadAssetLibrary({ renderAfter: false });
  } catch (error) {
    state.assetLibraryStatus = "error";
    state.assetLibraryNotice = state.locale === "zh-CN" ? "无法删除资源记录。" : "The asset record could not be deleted.";
  }
  render();
}

async function loadImageHistory(options = {}) {
  const renderAfter = options.renderAfter !== false;
  state.imageHistoryStatus = "loading";
  if (renderAfter) render();
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/image/history?limit=24", {
      headers: { "X-Kuroii-Session": "dev-local-token" }
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    state.imageHistory = Array.isArray(payload.items) ? payload.items : [];
    state.imageHistoryStorage = payload.storage && typeof payload.storage === "object" ? payload.storage : null;
    const availableIds = new Set(state.imageHistory.map((item) => item.id));
    state.selectedImageHistoryIds = (state.selectedImageHistoryIds || []).filter((id) => availableIds.has(id));
    state.imageHistoryStatus = "ready";
    state.serviceOnline = true;
  } catch (error) {
    state.imageHistoryStatus = "error";
  } finally {
    if (renderAfter) render();
  }
}

function audioHistoryDateLabel(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(state.locale === "zh-CN" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function loadAudioHistory(options = {}) {
  const renderAfter = options.renderAfter !== false;
  state.audioHistoryStatus = "loading";
  if (renderAfter) render();
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/audio/history?limit=24", {
      headers: { "X-Kuroii-Session": "dev-local-token" }
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    state.audioHistory = Array.isArray(payload.items) ? payload.items : [];
    state.audioHistoryStorage = payload.storage && typeof payload.storage === "object" ? payload.storage : null;
    state.audioHistoryStatus = "ready";
    state.serviceOnline = true;
  } catch (error) {
    state.audioHistoryStatus = "error";
    state.audioHistoryNotice = state.locale === "zh-CN" ? "本地服务不可用，计划尚未保存。" : "Local service is unavailable; the plan was not saved.";
  } finally {
    if (renderAfter) render();
  }
}

async function saveAudioPlan(kind, payload) {
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/audio/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Kuroii-Session": "dev-local-token" },
      body: JSON.stringify({ kind, ...payload })
    });
    if (!response.ok) throw await serviceResponseError(response);
    const result = await response.json();
    if (!result.ok || !result.item) throw new Error("Audio plan was not saved.");
    state.audioHistory = [result.item, ...(state.audioHistory || []).filter((item) => item.id !== result.item.id)].slice(0, 24);
    state.audioHistoryStorage = result.storage && typeof result.storage === "object" ? result.storage : state.audioHistoryStorage;
    state.audioHistoryStatus = "ready";
    state.audioHistoryNotice = state.locale === "zh-CN" ? "已保存到本地音频资产记录。" : "Saved to local audio asset history.";
    state.serviceOnline = true;
  } catch (error) {
    state.audioHistoryNotice = state.locale === "zh-CN" ? "计划已生成，但本地服务未保存记录。" : "The plan was created, but the local service did not save it.";
  }
  if (state.activeView === "create" && ["music", "voice"].includes(state.createMode)) render();
}

async function loadAudioHistoryItem(artifactId) {
  const response = await fetch(`http://127.0.0.1:17631/ai/audio/history/${encodeURIComponent(artifactId)}`, {
    headers: { "X-Kuroii-Session": "dev-local-token" }
  });
  if (!response.ok) throw await serviceResponseError(response);
  const payload = await response.json();
  if (!payload.ok || !payload.item) throw new Error("Audio history item was not found.");
  return payload.item;
}

async function generateAudioAsset(kind, payload) {
  const response = await fetch(`http://127.0.0.1:17631/ai/${kind}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Kuroii-Session": "dev-local-token" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw await serviceResponseError(response);
  const result = await response.json();
  if (!result.ok || !result.artifact) throw new Error("Audio generation did not return an artifact.");
  const item = await loadAudioHistoryItem(result.artifact.id);
  state.audioHistory = [result.artifact, ...(state.audioHistory || []).filter((entry) => entry.id !== result.artifact.id)].slice(0, 24);
  state.audioHistoryStorage = result.storage || state.audioHistoryStorage;
  state.audioHistoryStatus = "ready";
  state.serviceOnline = true;
  return item;
}

function audioDownloadHtml(item) {
  if (!item || !item.audioUrl) return "";
  return `<a class="featureSecondaryButton" href="${escapeHtml(item.audioUrl)}" download="${escapeHtml(item.fileName || "kuroii-audio.mp3")}">${state.locale === "zh-CN" ? "下载音频" : "Download audio"}</a>`;
}

function audioHistoryHtml(kind) {
  const generatedKind = kind === "music-direction" ? "music" : "voice";
  const items = (state.audioHistory || []).filter((item) => item.kind === kind || item.kind === generatedKind).slice(0, 4);
  const label = kind === "music-direction" ? (state.locale === "zh-CN" ? "音乐方向" : "Music directions") : (state.locale === "zh-CN" ? "配音清单" : "Voice plans");
  if (!items.length) return `<div class="audioHistoryEmpty">${state.audioHistoryStatus === "loading" ? (state.locale === "zh-CN" ? "正在读取本地记录…" : "Loading local records…") : (state.audioHistoryStatus === "error" ? (state.locale === "zh-CN" ? "本地记录暂不可用" : "Local records unavailable") : (state.locale === "zh-CN" ? "尚无已保存的计划" : "No saved plans yet"))}</div>`;
  return `<div class="audioHistoryList" aria-label="${escapeHtml(label)}">${items.map((item) => `<article><strong>${escapeHtml(item.title || label)}</strong><small>${escapeHtml(audioHistoryDateLabel(item.createdAt))}</small><span>${item.hasAudio ? (state.locale === "zh-CN" ? "已生成音频" : "Audio generated") : (item.kind === "voice-plan" ? `${Array.isArray(item.segments) ? item.segments.length : 0} ${state.locale === "zh-CN" ? "段" : "segments"}` : escapeHtml((item.metadata && item.metadata.mode) || ""))}</span></article>`).join("")}</div>`;
}

async function mutateImageHistory(payload, options = {}) {
  const response = await fetch("http://127.0.0.1:17631/ai/image/history", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "X-Kuroii-Session": "dev-local-token" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw await serviceResponseError(response);
  const result = await response.json();
  if (!result.ok) throw new Error(result.message || "Image history update failed.");
  if (options.renderAfter !== false) render();
  return result;
}

async function deleteSelectedImageHistory() {
  const ids = [...imageHistorySelectedIds()];
  if (!ids.length) return;
  const message = state.locale === "zh-CN" ? `删除选中的 ${ids.length} 条图片历史记录及本地文件？此操作无法撤销。` : `Delete ${ids.length} selected image history records and local files? This cannot be undone.`;
  if (!window.confirm(message)) return;
  state.imageHistoryStatus = "loading";
  render();
  try {
    const result = await mutateImageHistory({ ids }, { renderAfter: false });
    state.selectedImageHistoryIds = [];
    if (ids.includes(state.selectedImageHistoryId)) state.selectedImageHistoryId = null;
    state.imageHistoryNotice = state.locale === "zh-CN" ? `已删除 ${result.deletedCount || 0} 条记录。` : `Deleted ${result.deletedCount || 0} records.`;
    await loadImageHistory({ renderAfter: false });
  } catch (error) {
    state.imageHistoryStatus = "error";
    state.imageHistoryNotice = state.locale === "zh-CN" ? "无法删除图片历史记录。" : "Could not delete image history records.";
  }
  render();
}

async function cleanupMissingImageHistory() {
  const message = state.locale === "zh-CN" ? "清理索引中已丢失的本地图片记录？" : "Remove history records whose local image files are missing?";
  if (!window.confirm(message)) return;
  state.imageHistoryStatus = "loading";
  render();
  try {
    const result = await mutateImageHistory({ cleanupMissing: true }, { renderAfter: false });
    const removed = result.cleanup?.removedCount || 0;
    state.imageHistoryNotice = state.locale === "zh-CN" ? `已清理 ${removed} 条失效记录。` : `Removed ${removed} missing-file records.`;
    await loadImageHistory({ renderAfter: false });
  } catch (error) {
    state.imageHistoryStatus = "error";
    state.imageHistoryNotice = state.locale === "zh-CN" ? "无法清理失效记录。" : "Could not clean up missing-file records.";
  }
  render();
}

async function loadImageHistoryItem(imageId, options = {}) {
  const response = await fetch(`http://127.0.0.1:17631/ai/image/history/${encodeURIComponent(imageId)}`, {
    headers: { "X-Kuroii-Session": "dev-local-token" }
  });
  if (!response.ok) throw await serviceResponseError(response);
  const payload = await response.json();
  const item = payload && payload.item ? payload.item : null;
  if (!item) throw new Error("Image history item is unavailable.");
  state.selectedImageHistoryId = item.id || imageId;
  if (options.renderAfter !== false) render();
  return item;
}

function applyImageHistoryItem(item, options = {}) {
  if (!item) return;
  const imageSource = safeGeneratedImageSource(item.imageUrl);
  state.imageGenerationSettings = {
    ...state.imageGenerationSettings,
    ...(item.options || {})
  };
  syncImageGenerationExportSettings();
  state.imageGeneration = {
    ...defaultImageGenerationState(),
    prompt: item.prompt || "",
    status: imageSource ? "success" : "idle",
    imageUrl: imageSource,
    revisedPrompt: item.revisedPrompt || "",
    binding: item.binding || imageCapabilityBinding(),
    diagnostics: item.diagnostics || null,
    artifact: item,
    export: item.export || null,
    generatedAt: item.createdAt || null
  };
  state.selectedImageHistoryId = item.id || null;
  if (options.focusPrompt) requestFocus("featurePromptInput");
}

async function reuseImageHistoryItem(itemOrId) {
  try {
    const item = typeof itemOrId === "string" ? await loadImageHistoryItem(itemOrId, { renderAfter: false }) : itemOrId;
    applyImageHistoryItem(item, { focusPrompt: true });
  } catch (error) {
    state.imageGeneration.status = "error";
    state.imageGeneration.errorCode = "IMAGE_HISTORY_NOT_FOUND";
    state.imageGeneration.message = state.locale === "zh-CN" ? "无法读取这条图片历史记录。" : "Could not load this image history item.";
  }
  render();
}

function downloadGeneratedImage(item = state.imageGeneration) {
  const source = safeGeneratedImageSource(item && item.imageUrl);
  if (!source) return;
  const artifact = item.artifact || item;
  const fileName = artifact.fileName || `kuroii-image-${Date.now()}.png`;
  const link = document.createElement("a");
  link.href = source;
  link.download = fileName;
  if (/^https?:\/\//i.test(source)) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function imageHistoryListHtml() {
  if (state.imageHistoryStatus === "loading") {
    return `<div class="imageHistoryEmpty"><span class="statusDot warning"></span>${state.locale === "zh-CN" ? "正在读取历史" : "Loading history"}</div>`;
  }
  if (state.imageHistoryStatus === "error") {
    return `<div class="imageHistoryEmpty"><span class="statusDot error"></span>${state.locale === "zh-CN" ? "历史暂不可用" : "History unavailable"}</div>`;
  }
  if (!state.imageHistory.length) {
    return `<div class="imageHistoryEmpty"><span class="statusDot muted"></span>${state.locale === "zh-CN" ? "还没有生成记录" : "No generated images yet"}</div>`;
  }
  return `
    <div class="imageHistoryList">
      ${state.imageHistory.map((item) => {
        const selected = item.id === state.selectedImageHistoryId;
        const checked = imageHistorySelectedIds().has(item.id);
        const binding = item.binding || {};
        return `
          <div class="imageHistoryItem ${selected ? "selected" : ""} ${checked ? "marked" : ""}">
            <label class="imageHistorySelect"><input type="checkbox" data-image-history-select="${escapeHtml(item.id)}" ${checked ? "checked" : ""} aria-label="${state.locale === "zh-CN" ? "选择图片历史记录" : "Select image history record"}"></label>
            <button class="imageHistoryOpenButton" type="button" data-image-history-open="${escapeHtml(item.id)}" aria-label="${state.locale === "zh-CN" ? "查看生成结果" : "View generated image"}" data-tooltip="${state.locale === "zh-CN" ? "查看生成结果" : "View generated image"}">
              <span class="imageHistoryType">IMG</span>
              <span class="imageHistoryText"><strong>${escapeHtml(item.prompt || (state.locale === "zh-CN" ? "未命名图片" : "Untitled image"))}</strong><small>${escapeHtml(imageHistoryDateLabel(item.createdAt))} · ${escapeHtml(providerModelLabel(binding.providerId, binding.model || item.model))}</small></span>
            </button>
            <button class="imageHistoryAction" type="button" data-image-history-reuse="${escapeHtml(item.id)}" data-tooltip="${state.locale === "zh-CN" ? "恢复提示词和参数" : "Restore prompt and settings"}">${state.locale === "zh-CN" ? "再次使用" : "Reuse"}</button>
            <button class="imageHistoryAction" type="button" data-image-history-download="${escapeHtml(item.id)}" data-tooltip="${state.locale === "zh-CN" ? "下载图片" : "Download image"}">${state.locale === "zh-CN" ? "下载" : "Download"}</button>
            <button class="imageHistoryAction danger" type="button" data-image-history-delete="${escapeHtml(item.id)}">${state.locale === "zh-CN" ? "删除" : "Delete"}</button>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function imageHistoryManagementHtml() {
  const storage = state.imageHistoryStorage || {};
  const selectedCount = imageHistorySelectedIds().size;
  const allSelected = state.imageHistory.length > 0 && selectedCount === state.imageHistory.length;
  const storageText = storage.historyCount === undefined ? "" : `${imageHistoryStorageLabel(storage.bytes)} · ${storage.historyCount}/${storage.limit || 200}`;
  const missingText = storage.missingCount ? (state.locale === "zh-CN" ? `${storage.missingCount} 条失效` : `${storage.missingCount} missing`) : "";
  return `
    <div class="imageHistoryManagement">
      <div class="imageHistoryStorage"><span>${state.locale === "zh-CN" ? "本地存储" : "Local storage"}</span><strong>${escapeHtml(storageText || "-")}</strong>${missingText ? `<small>${escapeHtml(missingText)}</small>` : ""}</div>
      <div class="imageHistoryBulkActions">
        <label><input type="checkbox" id="selectAllImageHistory" ${allSelected ? "checked" : ""} ${state.imageHistory.length ? "" : "disabled"}>${state.locale === "zh-CN" ? "全选" : "All"}</label>
        <button class="imageHistoryAction" id="deleteSelectedImageHistoryButton" type="button" ${selectedCount ? "" : "disabled"}>${state.locale === "zh-CN" ? `删除 (${selectedCount})` : `Delete (${selectedCount})`}</button>
        <button class="imageHistoryAction" id="cleanupImageHistoryButton" type="button">${state.locale === "zh-CN" ? "清理失效" : "Clean missing"}</button>
      </div>
      ${state.imageHistoryNotice ? `<p class="imageHistoryNotice" role="status">${escapeHtml(state.imageHistoryNotice)}</p>` : ""}
    </div>
  `;
}

function imageGenerationOutputHtml(generation) {
  if (generation.status === "generating") {
    return `<div class="textGenerationEmpty busy" role="status"><span class="statusDot warning"></span><strong>${state.locale === "zh-CN" ? "正在生成图片" : "Generating image"}</strong><p>${state.locale === "zh-CN" ? "请求已发送到图片能力绑定模型，可随时取消。" : "The request is running on the bound image model and can be cancelled."}</p></div>`;
  }
  if (generation.status === "error" || generation.status === "cancelled") {
    return textGenerationErrorHtml(generation);
  }
  const imageSource = safeGeneratedImageSource(generation.imageUrl);
  if (generation.status === "success" && imageSource) {
    const binding = generation.binding || imageCapabilityBinding();
    const exportInfo = generation.export || {};
    const exportLabel = exportInfo.width && exportInfo.height
      ? `${String(exportInfo.outputResolution || "1K").toUpperCase()} · ${exportInfo.width} × ${exportInfo.height}${exportInfo.mode === "local-upscale" ? (state.locale === "zh-CN" ? " · 本地高质量放大" : " · local high-quality upscale") : ""}`
      : "";
    return `
      <figure class="imageGenerationPreview">
        <img src="${escapeHtml(imageSource)}" alt="${escapeHtml(generation.revisedPrompt || generation.prompt || (state.locale === "zh-CN" ? "AI 生成图片" : "AI generated image"))}">
        <figcaption>
          <span>${escapeHtml(providerLabel(binding.providerId))} · ${escapeHtml(providerModelLabel(binding.providerId, binding.model))}</span>
          ${exportLabel ? `<small class="imageExportResultLabel">${escapeHtml(exportLabel)}</small>` : ""}
          <span class="imageGenerationPreviewActions">
            <button class="featureSecondaryButton" id="downloadGeneratedImageButton" type="button">${state.locale === "zh-CN" ? "下载" : "Download"}</button>
            <button class="featureSecondaryButton" id="openGeneratedImageButton" type="button">${state.locale === "zh-CN" ? "打开原图" : "Open image"}</button>
          </span>
        </figcaption>
      </figure>
    `;
  }
  return `<div class="textGenerationEmpty"><span class="statusDot muted"></span><strong>${state.locale === "zh-CN" ? "图片预览" : "Image preview"}</strong><p>${state.locale === "zh-CN" ? "输入画面描述后，结果会由图片能力绑定的真实模型返回。" : "Describe the image to generate with the model bound to image capability."}</p></div>`;
}

function imageGenerationDiagnosticsHtml(generation) {
  const binding = generation.binding || imageCapabilityBinding();
  const diagnostics = generation.diagnostics || {};
  const profile = providerProfileForBinding(binding);
  const configured = Boolean(profile && profile.apiKeyStatus && profile.apiKeyStatus.configured);
  return `
    <div class="imageGenerationDiagnostics">
      <div><span>Provider</span><strong>${escapeHtml(providerLabel(binding.providerId))}</strong></div>
      <div><span>Model</span><strong>${escapeHtml(providerModelLabel(binding.providerId, binding.model))}</strong></div>
      <div><span>${state.locale === "zh-CN" ? "配置" : "Profile"}</span><strong>${escapeHtml((profile && profile.name) || binding.profileId || "-")}</strong></div>
      <div><span>${state.locale === "zh-CN" ? "接口" : "Endpoint"}</span><strong>${escapeHtml(diagnostics.endpoint || (profile && profile.imagesPath) || "/images/generations")}</strong></div>
      <div><span>${state.locale === "zh-CN" ? "耗时" : "Duration"}</span><strong>${diagnostics.durationMs ? `${escapeHtml(String(diagnostics.durationMs))} ms` : "-"}</strong></div>
      <div><span>HTTP</span><strong>${escapeHtml(String(diagnostics.httpStatus || "-"))}</strong></div>
      <div><span>${state.locale === "zh-CN" ? "响应" : "Response"}</span><strong>${escapeHtml(diagnostics.responseFormat || "-")}</strong></div>
      <div><span>API Key</span><strong>${configured ? (state.locale === "zh-CN" ? "已保存" : "Saved") : (state.locale === "zh-CN" ? "未配置" : "Missing")}</strong></div>
    </div>
  `;
}

async function runImageGeneration() {
  if (!state.providerProfileReady) return;
  const generation = state.imageGeneration;
  const readiness = capabilityConnectionStatus("image");
  if (readiness.state !== "connected") {
    generation.status = "error";
    generation.errorCode = readiness.code;
    generation.message = `${capabilityConnectionLabel("image")}：${capabilityConnectionDetail("image")}`;
    render();
    return;
  }
  syncImageGenerationExportSettings();
  const prompt = String(generation.prompt || "").trim();
  if (!prompt) {
    generation.status = "error";
    generation.errorCode = "CONFIG_MISSING";
    generation.message = state.locale === "zh-CN" ? "请先输入图片画面描述。" : "Enter an image prompt before generating.";
    state.imageInspectorTab = "diagnostics";
    requestFocus("featurePromptInput");
    render();
    return;
  }
  generation.status = "generating";
  generation.imageUrl = "";
  generation.revisedPrompt = "";
  generation.errorCode = null;
  generation.message = "";
  generation.advice = [];
  generation.usage = null;
  generation.binding = null;
  generation.diagnostics = null;
  generation.artifact = null;
  generation.generatedAt = null;
  const controller = new AbortController();
  imageGenerationController = controller;
  render();
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/image/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Kuroii-Session": "dev-local-token" },
      body: JSON.stringify({ prompt, options: { ...state.imageGenerationSettings } }),
      signal: controller.signal
    });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    if (!payload.ok) {
      const error = new Error(payload.message || "Image generation failed.");
      error.payload = payload;
      throw error;
    }
    generation.status = "success";
    generation.imageUrl = safeGeneratedImageSource(payload.imageUrl);
    generation.revisedPrompt = payload.revisedPrompt || "";
    generation.usage = payload.usage || null;
    generation.export = payload.export || null;
    generation.binding = payload.binding || imageCapabilityBinding();
    generation.diagnostics = payload.diagnostics || null;
    generation.artifact = payload.artifact || null;
    generation.generatedAt = payload.generatedAt || new Date().toISOString();
    state.serviceOnline = true;
    await loadImageHistory({ renderAfter: false });
  } catch (error) {
    if (error && error.name === "AbortError") {
      generation.status = "cancelled";
      generation.errorCode = "REQUEST_CANCELLED";
      generation.message = state.locale === "zh-CN" ? "本次图片生成已取消。" : "Image generation was cancelled.";
    } else {
      const payload = error && error.payload ? error.payload : {};
      generation.status = "error";
      generation.errorCode = payload.code || (error && error.status ? "LOCAL_SERVICE_ERROR" : "LOCAL_SERVICE_OFFLINE");
      generation.message = payload.message || (state.locale === "zh-CN" ? "无法连接 Local Service，请确认服务已启动。" : "Could not reach Local Service. Make sure it is running.");
      generation.advice = Array.isArray(payload.advice) ? payload.advice : [];
      state.serviceOnline = Boolean(error && error.status);
    }
    state.imageInspectorTab = "diagnostics";
  } finally {
    if (imageGenerationController === controller) imageGenerationController = null;
    render();
  }
}

function bindImageGenerationWorkspace() {
  const generation = state.imageGeneration;
  const input = el("featurePromptInput");
  input?.addEventListener("input", (event) => { generation.prompt = event.target.value; });
  el("imageGenerationAspectRatio")?.addEventListener("change", (event) => {
    state.imageGenerationSettings.aspectRatio = event.target.value;
    syncImageGenerationExportSettings();
    render();
  });
  el("imageGenerationOutputResolution")?.addEventListener("change", (event) => {
    state.imageGenerationSettings.outputResolution = event.target.value;
    syncImageGenerationExportSettings();
    render();
  });
  el("imageGenerationQuality")?.addEventListener("change", (event) => { state.imageGenerationSettings.quality = event.target.value; });
  el("imageGenerationBackground")?.addEventListener("change", (event) => { state.imageGenerationSettings.background = event.target.value; });
  el("featureGenerateButton")?.addEventListener("click", runImageGeneration);
  el("featureCancelButton")?.addEventListener("click", () => imageGenerationController?.abort());
  el("openGeneratedImageButton")?.addEventListener("click", () => {
    const source = safeGeneratedImageSource(generation.imageUrl);
    if (source) window.open(source, "_blank", "noopener,noreferrer");
  });
  el("downloadGeneratedImageButton")?.addEventListener("click", () => downloadGeneratedImage());
  document.querySelectorAll("[data-image-inspector-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.imageInspectorTab = button.dataset.imageInspectorTab;
      render();
    });
  });
  document.querySelectorAll("[data-image-history-open]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const item = await loadImageHistoryItem(button.dataset.imageHistoryOpen, { renderAfter: false });
        applyImageHistoryItem(item);
      } catch (error) {
        state.imageGeneration.status = "error";
        state.imageGeneration.errorCode = "IMAGE_HISTORY_NOT_FOUND";
        state.imageGeneration.message = state.locale === "zh-CN" ? "无法读取这条图片历史记录。" : "Could not load this image history item.";
      }
      render();
    });
  });
  document.querySelectorAll("[data-image-history-reuse]").forEach((button) => {
    button.addEventListener("click", () => reuseImageHistoryItem(button.dataset.imageHistoryReuse));
  });
  document.querySelectorAll("[data-image-history-download]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const item = await loadImageHistoryItem(button.dataset.imageHistoryDownload, { renderAfter: false });
        downloadGeneratedImage(item);
      } catch (error) {
        state.imageGeneration.status = "error";
        state.imageGeneration.errorCode = "IMAGE_HISTORY_NOT_FOUND";
        state.imageGeneration.message = state.locale === "zh-CN" ? "无法下载这条图片历史记录。" : "Could not download this image history item.";
        render();
      }
    });
  });
  document.querySelectorAll("[data-image-history-select]").forEach((input) => {
    input.addEventListener("change", () => {
      const selected = imageHistorySelectedIds();
      if (input.checked) selected.add(input.dataset.imageHistorySelect);
      else selected.delete(input.dataset.imageHistorySelect);
      state.selectedImageHistoryIds = [...selected];
      render();
    });
  });
  el("selectAllImageHistory")?.addEventListener("change", (event) => {
    state.selectedImageHistoryIds = event.target.checked ? state.imageHistory.map((item) => item.id) : [];
    render();
  });
  el("deleteSelectedImageHistoryButton")?.addEventListener("click", deleteSelectedImageHistory);
  el("cleanupImageHistoryButton")?.addEventListener("click", cleanupMissingImageHistory);
  document.querySelectorAll("[data-image-history-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedImageHistoryIds = [button.dataset.imageHistoryDelete];
      void deleteSelectedImageHistory();
    });
  });
  document.querySelectorAll("[data-image-prompt-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      generation.prompt = `${button.dataset.imagePromptChip}，${generation.prompt || ""}`.replace(/，$/, "");
      requestFocus("featurePromptInput");
      render();
    });
  });
  bindCreateModeControls();
}

async function loadVideoTasks(options = {}) {
  state.videoTasksStatus = "loading";
  if (options.renderAfter !== false) render();
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/video/tasks?limit=24", { headers: { "X-Kuroii-Session": "dev-local-token" } });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    state.videoTasks = Array.isArray(payload.items) ? payload.items : [];
    state.videoTasksStatus = "ready";
    state.serviceOnline = true;
  } catch (error) {
    state.videoTasksStatus = "error";
  }
  if (options.renderAfter !== false) render();
}

async function loadVideoReadiness(options = {}) {
  state.videoReadiness.status = "loading";
  if (options.renderAfter !== false) render();
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/video/readiness", { headers: { "X-Kuroii-Session": "dev-local-token" } });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    state.videoReadiness = {
      status: "ready",
      ready: payload.ready === true,
      code: payload.code || "VIDEO_NOT_READY",
      message: payload.message || "",
      advice: Array.isArray(payload.advice) ? payload.advice : [],
      binding: payload.binding || null
    };
    normalizeVideoGenerationSettings();
    state.serviceOnline = true;
  } catch (error) {
    const payload = error && error.payload ? error.payload : {};
    state.videoReadiness = {
      status: "error",
      ready: false,
      code: payload.code || "LOCAL_SERVICE_OFFLINE",
      message: payload.message || (state.locale === "zh-CN" ? "无法检查视频模型配置。" : "Could not check the video model configuration."),
      advice: Array.isArray(payload.advice) ? payload.advice : []
    };
  } finally {
    if (options.renderAfter !== false) render();
  }
}

function videoTaskStatusLabel(status) {
  const labels = {
    queued: state.locale === "zh-CN" ? "排队中" : "Queued",
    processing: state.locale === "zh-CN" ? "生成中" : "Processing",
    succeeded: state.locale === "zh-CN" ? "已完成" : "Succeeded",
    failed: state.locale === "zh-CN" ? "失败" : "Failed",
    cancelled: state.locale === "zh-CN" ? "已取消" : "Cancelled"
  };
  return labels[status] || status || "-";
}

function videoGenerationOutputHtml(generation) {
  const task = generation.task;
  if (generation.status === "generating" || (task && ["queued", "processing"].includes(task.status))) {
    return `<div class="textGenerationEmpty busy" role="status"><span class="statusDot warning"></span><strong>${state.locale === "zh-CN" ? "视频任务进行中" : "Video task in progress"}</strong><p>${state.locale === "zh-CN" ? "任务已提交给视频能力绑定模型；此页面会自动轮询状态。关闭或刷新页面后，任务仍保留在本地历史中。" : "The task was submitted to the bound video model. This page is polling its status; the task remains in local history after refresh."}</p></div>`;
  }
  if (generation.status === "error" || generation.status === "cancelled") return textGenerationErrorHtml(generation);
  const source = safeGeneratedVideoSource(task && task.videoUrl);
  if (task && task.status === "succeeded" && source) {
    return `<figure class="imageGenerationPreview videoGenerationPreview"><video src="${escapeHtml(source)}" controls preload="metadata"></video><figcaption><span>${escapeHtml(providerLabel((task.binding || {}).providerId))} · ${escapeHtml(providerModelLabel((task.binding || {}).providerId, (task.binding || {}).model))}</span><span class="imageGenerationPreviewActions"><button class="featureSecondaryButton" id="downloadGeneratedVideoButton" type="button">${state.locale === "zh-CN" ? "下载 / 打开" : "Download / open"}</button></span></figcaption></figure>`;
  }
  return `<div class="textGenerationEmpty"><span class="statusDot muted"></span><strong>${state.locale === "zh-CN" ? "视频预览" : "Video preview"}</strong><p>${state.locale === "zh-CN" ? "输入镜头描述后，任务会发送到 Provider Hub 中绑定的视频模型。未绑定模型时会明确报错，不会生成占位视频。" : "Describe the shot to send it to the video model bound in Provider Hub. Missing bindings return a clear error, never a placeholder video."}</p></div>`;
}

function videoTaskHistoryHtml() {
  if (state.videoTasksStatus === "loading") return `<div class="imageHistoryEmpty"><span class="statusDot warning"></span>${state.locale === "zh-CN" ? "正在读取任务" : "Loading tasks"}</div>`;
  if (state.videoTasksStatus === "error") return `<div class="imageHistoryEmpty"><span class="statusDot error"></span>${state.locale === "zh-CN" ? "任务历史暂不可用" : "Task history unavailable"}</div>`;
  if (!state.videoTasks.length) return `<div class="imageHistoryEmpty"><span class="statusDot muted"></span>${state.locale === "zh-CN" ? "还没有视频任务" : "No video tasks yet"}</div>`;
  return `<div class="imageHistoryList">${state.videoTasks.map((task) => `<button class="imageHistoryOpenButton ${task.id === state.selectedVideoTaskId ? "selected" : ""}" type="button" data-video-task-open="${escapeHtml(task.id)}"><span class="imageHistoryType">VID</span><span class="imageHistoryText"><strong>${escapeHtml(task.prompt || (state.locale === "zh-CN" ? "未命名视频任务" : "Untitled video task"))}</strong><small>${escapeHtml(videoTaskStatusLabel(task.status))} · ${escapeHtml(imageHistoryDateLabel(task.updatedAt || task.createdAt))}</small></span></button>`).join("")}</div>`;
}

async function refreshVideoTask(taskId, options = {}) {
  const response = await fetch(`http://127.0.0.1:17631/ai/video/tasks/${encodeURIComponent(taskId)}`, { headers: { "X-Kuroii-Session": "dev-local-token" }, signal: options.signal });
  if (!response.ok) throw await serviceResponseError(response);
  const payload = await response.json();
  if (!payload.task) throw new Error("Video task is unavailable.");
  state.selectedVideoTaskId = payload.task.id;
  state.videoGeneration.task = payload.task;
  state.videoGeneration.binding = payload.task.binding || videoCapabilityBinding();
  state.videoGeneration.diagnostics = payload.task.diagnostics || null;
  if (payload.task.status === "succeeded") state.videoGeneration.status = "success";
  if (["failed", "cancelled"].includes(payload.task.status)) {
    state.videoGeneration.status = "error";
    state.videoGeneration.errorCode = payload.task.error && payload.task.error.code;
    state.videoGeneration.message = (payload.task.error && payload.task.error.message) || (state.locale === "zh-CN" ? "视频生成失败。" : "Video generation failed.");
  }
  return payload.task;
}

async function runVideoGeneration() {
  if (!state.providerProfileReady) return;
  if (!state.videoReadiness.ready) {
    await loadVideoReadiness({ renderAfter: false });
    if (!state.videoReadiness.ready) {
      const readiness = state.videoReadiness;
      state.videoGeneration.status = "error";
      state.videoGeneration.errorCode = readiness.code || "VIDEO_NOT_READY";
      state.videoGeneration.message = readiness.message || (state.locale === "zh-CN" ? "视频模型尚未配置完成。" : "The video model is not configured yet.");
      state.videoGeneration.advice = readiness.advice || [];
      render();
      return;
    }
  }
  const generation = state.videoGeneration;
  const prompt = String(generation.prompt || "").trim();
  if (!prompt) {
    generation.status = "error";
    generation.errorCode = "CONFIG_MISSING";
    generation.message = state.locale === "zh-CN" ? "请先输入视频镜头描述。" : "Enter a video prompt before generating.";
    requestFocus("featurePromptInput");
    render();
    return;
  }
  const controller = new AbortController();
  videoGenerationController = controller;
  generation.status = "generating";
  generation.task = null;
  generation.errorCode = null;
  generation.message = "";
  generation.advice = [];
  render();
  try {
    const response = await fetch("http://127.0.0.1:17631/ai/video/generate", { method: "POST", headers: { "Content-Type": "application/json", "X-Kuroii-Session": "dev-local-token" }, body: JSON.stringify({ prompt, options: { ...state.videoGenerationSettings } }), signal: controller.signal });
    if (!response.ok) throw await serviceResponseError(response);
    const payload = await response.json();
    generation.task = payload.task;
    generation.binding = payload.binding || videoCapabilityBinding();
    generation.diagnostics = payload.diagnostics || null;
    state.selectedVideoTaskId = payload.task && payload.task.id;
    while (generation.task && ["queued", "processing"].includes(generation.task.status)) {
      await new Promise((resolve, reject) => {
        const timer = window.setTimeout(resolve, 1800);
        controller.signal.addEventListener("abort", () => { window.clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
      });
      await refreshVideoTask(generation.task.id, { signal: controller.signal });
      render();
    }
    if (generation.task && generation.task.status === "succeeded") generation.status = "success";
    await loadVideoTasks({ renderAfter: false });
  } catch (error) {
    if (error && error.name === "AbortError") {
      generation.status = "cancelled";
      generation.errorCode = "REQUEST_CANCELLED";
      generation.message = state.locale === "zh-CN" ? "已停止本页轮询；远端视频任务仍可在历史中查看。" : "Stopped polling on this page; the remote task remains in history.";
    } else {
      const payload = error && error.payload ? error.payload : {};
      generation.status = "error";
      generation.errorCode = payload.code || "LOCAL_SERVICE_ERROR";
      generation.message = payload.message || (state.locale === "zh-CN" ? "无法提交视频任务。" : "Could not submit the video task.");
      generation.advice = Array.isArray(payload.advice) ? payload.advice : [];
    }
  } finally {
    if (videoGenerationController === controller) videoGenerationController = null;
    render();
  }
}

function bindVideoGenerationWorkspace() {
  const generation = state.videoGeneration;
  el("featurePromptInput")?.addEventListener("input", (event) => { generation.prompt = event.target.value; });
  el("videoGenerationAspectRatio")?.addEventListener("change", (event) => { state.videoGenerationSettings.aspectRatio = event.target.value; });
  el("videoGenerationDuration")?.addEventListener("change", (event) => { state.videoGenerationSettings.durationSeconds = Number(event.target.value) || videoGenerationControlOptions().durations[0]; });
  el("videoGenerationResolution")?.addEventListener("change", (event) => { state.videoGenerationSettings.resolution = event.target.value; });
  el("featureGenerateButton")?.addEventListener("click", runVideoGeneration);
  el("featureCancelButton")?.addEventListener("click", () => videoGenerationController?.abort());
  el("refreshVideoTasksButton")?.addEventListener("click", () => loadVideoTasks());
  el("refreshVideoReadinessButton")?.addEventListener("click", () => loadVideoReadiness());
  el("downloadGeneratedVideoButton")?.addEventListener("click", () => {
    const source = safeGeneratedVideoSource(generation.task && generation.task.videoUrl);
    if (source) window.open(source, "_blank", "noopener,noreferrer");
  });
  document.querySelectorAll("[data-video-task-open]").forEach((button) => button.addEventListener("click", async () => {
    try { await refreshVideoTask(button.dataset.videoTaskOpen); } catch (error) { generation.status = "error"; generation.message = state.locale === "zh-CN" ? "无法读取视频任务状态。" : "Could not read video task status."; }
    render();
  }));
  bindCreateModeControls();
}

function buildMusicDirection() {
  const music = state.musicDirection;
  const brief = String(music.brief || "").trim();
  if (!brief) {
    music.status = "error";
    requestFocus("musicDirectionBrief");
    render();
    return;
  }
  const isInstrumental = music.mode === "instrumental";
  const useCase = music.useCase === "video" ? "服务画面动作、镜头能量与剪辑节奏" : "建立独立的音乐情绪与记忆点";
  music.blueprint = `使用目标：${useCase}。情绪与受众质感围绕“${brief}”展开；先建立清晰的节奏引擎，再以主配器推进能量，并保留可剪辑的呼吸与收束。`;
  music.prompt = `${isInstrumental ? "纯音乐，不含演唱。" : "歌曲方向，演唱语言与歌词由后续平台配置决定。"} 围绕“${brief}”建立单一清晰的音乐身份；用具有层次的节奏引擎和主配器推动情绪，制作质感干净、具有空间感。${music.useCase === "video" ? "音乐的能量变化跟随画面动作和镜头推进，保留可用于剪辑转场的呼吸与收束。" : "旋律、律动与制作层次形成明确记忆点，并自然完成能量收束。"}`;
  music.status = "ready";
  render();
  void saveAudioPlan("music-direction", {
    title: brief.slice(0, 72),
    content: { prompt: music.prompt, blueprint: music.blueprint },
    metadata: { useCase: music.useCase, mode: music.mode }
  });
}

function musicDirectionOutputHtml(music) {
  if (music.status === "generating") return `<div class="musicDirectionEmpty"><span class="statusDot"></span><strong>${state.locale === "zh-CN" ? "正在请求已绑定的音乐模型…" : "Requesting the bound music model…"}</strong><p>${state.locale === "zh-CN" ? "仅在收到真实音频并保存为本地资产后才会显示试听。" : "Preview appears only after real audio is returned and saved locally."}</p></div>`;
  if (music.status === "completed" && music.audio) return `<div class="musicDirectionOutput"><section class="musicDirectionBlueprint"><span>${state.locale === "zh-CN" ? "已生成音乐资产" : "Generated music asset"}</span><strong>${escapeHtml(music.audio.fileName || "audio")}</strong><audio controls src="${escapeHtml(music.audio.audioUrl || "")}"></audio><div class="imageResultActions">${audioDownloadHtml(music.audio)}</div></section><section class="musicDirectionPrompt"><div><span>${state.locale === "zh-CN" ? "本次音乐提示词" : "Music prompt"}</span><small>${escapeHtml(music.message || "")}</small></div><p>${escapeHtml(music.prompt)}</p></section></div>`;
  if (music.status === "error") return `<div class="musicDirectionError"><strong>${escapeHtml(music.message || (state.locale === "zh-CN" ? "请先描述音乐要服务的画面或创作目标。" : "Describe the visual or creative goal first."))}</strong></div>`;
  if (music.status !== "ready") return `<div class="musicDirectionEmpty"><span class="statusDot muted"></span><p class="musicDirectionEyebrow">${state.locale === "zh-CN" ? "从画面到声音" : "From picture to sound"}</p><strong>${state.locale === "zh-CN" ? "先定方向，再接入生成" : "Set the direction, then connect generation"}</strong><p>${state.locale === "zh-CN" ? "这里产出可复制的音乐提示词和创作蓝图；在绑定音乐模型前，不会伪造试听、波形或音频文件。" : "This space produces a reusable prompt and creative blueprint. It never fabricates previews, waveforms, or audio before a music model is connected."}</p><ol><li>${state.locale === "zh-CN" ? "描述画面与情绪" : "Describe picture and emotion"}</li><li>${state.locale === "zh-CN" ? "选择用途与作品模式" : "Choose use case and mode"}</li><li>${state.locale === "zh-CN" ? "生成可带往平台的方向" : "Build a direction for your platform"}</li></ol></div>`;
  return `<div class="musicDirectionOutput"><section class="musicDirectionBlueprint"><span>${state.locale === "zh-CN" ? "创作蓝图" : "Creative blueprint"}</span><p>${escapeHtml(music.blueprint)}</p></section><section class="musicDirectionPrompt"><div><span>${state.locale === "zh-CN" ? "通用音乐提示词" : "General music prompt"}</span><small>${state.locale === "zh-CN" ? "可直接带往已接入的平台" : "Ready for a connected platform"}</small></div><p>${escapeHtml(music.prompt)}</p></section></div>`;
}

function bindMusicDirectionWorkspace() {
  const music = state.musicDirection;
  const musicReadiness = document.querySelector(".musicDirectionReadiness > section:first-child");
  if (musicReadiness) musicReadiness.innerHTML = `<span class="statusDot ${capabilityConnectionTone("music")}"></span><p>${escapeHtml(capabilityConnectionLabel("music"))}</p><strong>${escapeHtml(capabilityConnectionDetail("music", state.locale === "zh-CN" ? "当前仍可完成音乐方向设计" : "Direction design remains available."))}</strong>`;
  el("musicDirectionBrief")?.addEventListener("input", (event) => { music.brief = event.target.value; });
  el("musicDirectionUseCase")?.addEventListener("change", (event) => { music.useCase = event.target.value; });
  el("musicDirectionMode")?.addEventListener("change", (event) => { music.mode = event.target.value; });
  el("buildMusicDirectionButton")?.addEventListener("click", buildMusicDirection);
  el("generateMusicAudioButton")?.addEventListener("click", generateMusicAudio);
  el("refreshAudioHistoryButton")?.addEventListener("click", () => loadAudioHistory());
  bindCreateModeControls();
}

async function generateMusicAudio() {
  const music = state.musicDirection;
  const readiness = capabilityConnectionStatus("music");
  if (readiness.state !== "connected") {
    music.status = "error";
    music.errorCode = readiness.code;
    music.message = `${capabilityConnectionLabel("music")}：${capabilityConnectionDetail("music")}`;
    render();
    return;
  }
  if (!music.prompt) {
    buildMusicDirection();
    if (!music.prompt) return;
  }
  music.status = "generating";
  music.message = "";
  music.errorCode = null;
  render();
  try {
    const isInstrumental = music.mode === "instrumental";
    music.audio = await generateAudioAsset("music", {
      title: String(music.brief || "Generated music").slice(0, 72),
      prompt: music.prompt,
      options: { isInstrumental, lyricsOptimizer: !isInstrumental, format: "mp3" }
    });
    music.status = "completed";
    music.message = state.locale === "zh-CN" ? "已生成并保存到本地音频资产记录。" : "Generated and saved to local audio assets.";
  } catch (error) {
    music.status = "error";
    music.errorCode = error && error.code;
    music.message = error && error.message ? error.message : (state.locale === "zh-CN" ? "音乐生成失败，请检查音乐模型绑定和 API Key。" : "Music generation failed. Check the music binding and API key.");
  }
  render();
}

function voiceScriptSegments(script) {
  return String(script || "")
    .replace(/([。！？!?])/g, "$1\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function buildVoiceDirection() {
  const voice = state.voiceDirection;
  const script = String(voice.script || "").trim();
  if (!script) {
    voice.status = "error";
    requestFocus("voiceDirectionScript");
    render();
    return;
  }
  voice.segments = voiceScriptSegments(script);
  voice.status = "ready";
  render();
  void saveAudioPlan("voice-plan", {
    title: script.slice(0, 72),
    content: { script, segments: voice.segments },
    metadata: { language: voice.language, voice: voice.voice, pace: voice.pace, emotion: voice.emotion }
  });
}

function voiceDirectionOutputHtml(voice) {
  if (voice.status === "generating") return `<div class="voiceDirectionEmpty"><span class="statusDot"></span><strong>${state.locale === "zh-CN" ? "正在请求已绑定的配音模型…" : "Requesting the bound voice model…"}</strong><p>${state.locale === "zh-CN" ? "仅在真实音频保存成功后提供试听和下载。" : "Preview and download appear only after real audio is saved."}</p></div>`;
  if (voice.status === "completed" && voice.audio) return `<div class="voiceDirectionSheet"><header><div><p>${state.locale === "zh-CN" ? "已生成配音资产" : "Generated voice asset"}</p><strong>${escapeHtml(voice.audio.fileName || "audio")}</strong></div><span>${escapeHtml(voice.message || "")}</span></header><audio controls src="${escapeHtml(voice.audio.audioUrl || "")}"></audio><div class="imageResultActions">${audioDownloadHtml(voice.audio)}</div></div>`;
  if (voice.status === "error") return `<div class="voiceDirectionError"><strong>${escapeHtml(voice.message || (state.locale === "zh-CN" ? "请先输入需要配音的脚本。" : "Enter the script to voice first."))}</strong></div>`;
  if (voice.status !== "ready") return `<div class="voiceDirectionEmpty"><span class="statusDot muted"></span><p class="voiceDirectionEyebrow">${state.locale === "zh-CN" ? "台词到交付" : "Script to delivery"}</p><strong>${state.locale === "zh-CN" ? "把脚本拆成可审阅的配音清单" : "Turn your script into a reviewable voice list"}</strong><p>${state.locale === "zh-CN" ? "先确定角色、语言和表达方式；接入语音模型后，再逐段生成试听与可下载的音频文件。" : "Set the character, language, and delivery first. After a voice model is connected, generate previewable and downloadable audio per segment."}</p></div>`;
  const language = voice.language === "zh-CN" ? "中文" : (voice.language === "en-US" ? "English" : "日本語");
  const profile = { narrator: "沉稳旁白", explainer: "明快讲解", character: "角色对白" }[voice.voice] || "沉稳旁白";
  const pace = { slow: "舒缓", natural: "自然", brisk: "明快" }[voice.pace] || "自然";
  const emotion = { confident: "坚定", warm: "温暖", energetic: "有活力" }[voice.emotion] || "坚定";
  return `<div class="voiceDirectionSheet"><header><div><p>${state.locale === "zh-CN" ? "配音清单" : "Voice delivery list"}</p><strong>${voice.segments.length} ${state.locale === "zh-CN" ? "段待生成" : "segments queued"}</strong></div><span>${escapeHtml(`${language} · ${profile} · ${pace} · ${emotion}`)}</span></header><ol>${voice.segments.map((segment, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${escapeHtml(segment)}</p><small>${state.locale === "zh-CN" ? "待生成试听" : "Preview pending"}</small></li>`).join("")}</ol></div>`;
}

function bindVoiceDirectionWorkspace() {
  const voice = state.voiceDirection;
  const voiceReadiness = document.querySelector(".voiceDirectionDelivery > section:first-child");
  if (voiceReadiness) voiceReadiness.innerHTML = `<span class="statusDot ${capabilityConnectionTone("voice")}"></span><p>${escapeHtml(capabilityConnectionLabel("voice"))}</p><strong>${escapeHtml(capabilityConnectionDetail("voice", state.locale === "zh-CN" ? "本页不会生成假音频" : "This page never fabricates audio"))}</strong>`;
  const controls = document.querySelector(".voiceDirectionControls");
  if (controls && !el("voiceDirectionVoiceId")) {
    controls.insertAdjacentHTML("beforeend", `<label><span>${state.locale === "zh-CN" ? "MiniMax 音色 ID" : "MiniMax voice ID"}</span><input id="voiceDirectionVoiceId" type="text" value="${escapeHtml(voice.voiceId || "")}" placeholder="male-qn-qingse"></label>`);
  }
  el("voiceDirectionScript")?.addEventListener("input", (event) => { voice.script = event.target.value; });
  el("voiceDirectionLanguage")?.addEventListener("change", (event) => { voice.language = event.target.value; });
  el("voiceDirectionVoice")?.addEventListener("change", (event) => { voice.voice = event.target.value; });
  el("voiceDirectionPace")?.addEventListener("change", (event) => { voice.pace = event.target.value; });
  el("voiceDirectionEmotion")?.addEventListener("change", (event) => { voice.emotion = event.target.value; });
  el("voiceDirectionVoiceId")?.addEventListener("input", (event) => { voice.voiceId = event.target.value; });
  el("buildVoiceDirectionButton")?.addEventListener("click", buildVoiceDirection);
  el("generateVoiceAudioButton")?.addEventListener("click", generateVoiceAudio);
  el("refreshAudioHistoryButton")?.addEventListener("click", () => loadAudioHistory());
  bindCreateModeControls();
}

async function generateVoiceAudio() {
  const voice = state.voiceDirection;
  const readiness = capabilityConnectionStatus("voice");
  if (readiness.state !== "connected") {
    voice.status = "error";
    voice.errorCode = readiness.code;
    voice.message = `${capabilityConnectionLabel("voice")}：${capabilityConnectionDetail("voice")}`;
    render();
    return;
  }
  const text = String(voice.script || "").trim();
  if (!text) {
    buildVoiceDirection();
    if (!voice.script) return;
  }
  voice.status = "generating";
  voice.message = "";
  voice.errorCode = null;
  render();
  const languageBoost = { "zh-CN": "Chinese", "en-US": "English", "ja-JP": "Japanese" }[voice.language] || "auto";
  const speed = { slow: 0.8, natural: 1, brisk: 1.2 }[voice.pace] || 1;
  try {
    voice.audio = await generateAudioAsset("voice", {
      title: text.slice(0, 72),
      text,
      segments: voice.segments.length ? voice.segments : voiceScriptSegments(text),
      options: { voiceId: String(voice.voiceId || "").trim(), speed, emotion: voice.emotion, language: voice.language, languageBoost, format: "mp3" }
    });
    voice.status = "completed";
    voice.message = state.locale === "zh-CN" ? "已生成并保存到本地音频资产记录。" : "Generated and saved to local audio assets.";
  } catch (error) {
    voice.status = "error";
    voice.errorCode = error && error.code;
    voice.message = error && error.message ? error.message : (state.locale === "zh-CN" ? "配音生成失败，请检查音色 ID、模型绑定和 API Key。" : "Voice generation failed. Check the voice ID, binding, and API key.");
  }
  render();
}

function renderVoiceDirectionWorkbench(feature, workspace) {
  const voice = state.voiceDirection;
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `<section class="taskWorkbench voiceDirectionWorkbench">${workbenchHeaderHtml(feature, `${createModeToggleHtml()}<span>${state.locale === "zh-CN" ? "配音脚本台" : "Voice script desk"}</span>`)}<div class="voiceDirectionDesk"><aside class="voiceDirectionComposer"><div class="railHeading"><strong>${state.locale === "zh-CN" ? "脚本" : "Script"}</strong><span>${state.locale === "zh-CN" ? "可逐行输入，也可直接粘贴完整口播" : "Enter line by line or paste the full voiceover"}</span></div><textarea id="voiceDirectionScript" placeholder="${state.locale === "zh-CN" ? "例如：欢迎来到喵喵冒险团。\n现在，和我们一起踏上新的旅程。" : "Example: Welcome to the Meow Adventure Guild.\nNow, begin a new journey with us."}">${escapeHtml(voice.script)}</textarea><div class="voiceDirectionControls"><label><span>${state.locale === "zh-CN" ? "语言" : "Language"}</span><select id="voiceDirectionLanguage"><option value="zh-CN" ${voice.language === "zh-CN" ? "selected" : ""}>中文</option><option value="en-US" ${voice.language === "en-US" ? "selected" : ""}>English</option><option value="ja-JP" ${voice.language === "ja-JP" ? "selected" : ""}>日本語</option></select></label><label><span>${state.locale === "zh-CN" ? "角色 / 音色方向" : "Role / voice direction"}</span><select id="voiceDirectionVoice"><option value="narrator" ${voice.voice === "narrator" ? "selected" : ""}>${state.locale === "zh-CN" ? "沉稳旁白" : "Grounded narrator"}</option><option value="explainer" ${voice.voice === "explainer" ? "selected" : ""}>${state.locale === "zh-CN" ? "明快讲解" : "Bright explainer"}</option><option value="character" ${voice.voice === "character" ? "selected" : ""}>${state.locale === "zh-CN" ? "角色对白" : "Character dialogue"}</option></select></label></div><div class="voiceDirectionAction"><button class="featurePrimaryButton" id="buildVoiceDirectionButton" type="button">${state.locale === "zh-CN" ? "拆分配音清单" : "Build voice list"}</button><button class="featureSecondaryButton" id="generateVoiceAudioButton" type="button" ${voice.status === "generating" ? "disabled" : ""}>${voice.status === "generating" ? (state.locale === "zh-CN" ? "生成中…" : "Generating…") : (state.locale === "zh-CN" ? "生成配音" : "Generate voice")}</button></div></aside><main class="voiceDirectionStage" aria-live="polite"><div class="voiceDirectionStageHeading"><div><p>${state.locale === "zh-CN" ? "交付节奏" : "Delivery rhythm"}</p><h3>${state.locale === "zh-CN" ? "先审台词，再生成声音" : "Review lines before generating voice"}</h3></div><div class="voiceDirectionInlineControls"><label><span>${state.locale === "zh-CN" ? "语速" : "Pace"}</span><select id="voiceDirectionPace"><option value="slow" ${voice.pace === "slow" ? "selected" : ""}>${state.locale === "zh-CN" ? "舒缓" : "Calm"}</option><option value="natural" ${voice.pace === "natural" ? "selected" : ""}>${state.locale === "zh-CN" ? "自然" : "Natural"}</option><option value="brisk" ${voice.pace === "brisk" ? "selected" : ""}>${state.locale === "zh-CN" ? "明快" : "Brisk"}</option></select></label><label><span>${state.locale === "zh-CN" ? "情绪" : "Emotion"}</span><select id="voiceDirectionEmotion"><option value="confident" ${voice.emotion === "confident" ? "selected" : ""}>${state.locale === "zh-CN" ? "坚定" : "Confident"}</option><option value="warm" ${voice.emotion === "warm" ? "selected" : ""}>${state.locale === "zh-CN" ? "温暖" : "Warm"}</option><option value="energetic" ${voice.emotion === "energetic" ? "selected" : ""}>${state.locale === "zh-CN" ? "有活力" : "Energetic"}</option></select></label></div></div>${voiceDirectionOutputHtml(voice)}</main><aside class="voiceDirectionDelivery"><section><span class="statusDot muted"></span><p>${state.locale === "zh-CN" ? "语音模型尚未绑定" : "No voice model bound"}</p><strong>${state.locale === "zh-CN" ? "本页不会生成假音频" : "This page never fabricates audio"}</strong></section><section class="audioPlanningHistory"><div class="railHeading"><strong>${state.locale === "zh-CN" ? "本地资产记录" : "Local asset history"}</strong><button class="imageHistoryRefresh" id="refreshAudioHistoryButton" type="button">${state.locale === "zh-CN" ? "刷新" : "Refresh"}</button></div>${audioHistoryHtml("voice-plan")}</section><div><p class="voiceDirectionEyebrow">${state.locale === "zh-CN" ? "交付预设" : "Delivery preset"}</p><ul><li>${state.locale === "zh-CN" ? "按段试听与重试" : "Preview and retry by segment"}</li><li>${state.locale === "zh-CN" ? "导出 WAV / MP3" : "Export WAV / MP3"}</li><li>${state.locale === "zh-CN" ? "保留模型与来源元数据" : "Retain model and source metadata"}</li></ul></div></aside></div></section>`;
  bindVoiceDirectionWorkspace();
  mountAssetLibraryShortcut("openVoiceAssetLibraryButton", "audio", voice.audio && voice.audio.id);
}

function renderMusicDirectionWorkbench(feature, workspace) {
  const music = state.musicDirection;
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `<section class="taskWorkbench musicDirectionWorkbench">${workbenchHeaderHtml(feature, `${createModeToggleHtml()}<span>${state.locale === "zh-CN" ? "音乐方向台" : "Music direction desk"}</span>`)}<div class="musicDirectionDesk"><aside class="musicDirectionBriefPanel"><div class="railHeading"><strong>${state.locale === "zh-CN" ? "声音意图" : "Sound intent"}</strong><span>${state.locale === "zh-CN" ? "说明画面、受众、情绪与要强化的瞬间" : "Describe the visual, audience, emotion, and moments to amplify"}</span></div><textarea id="musicDirectionBrief" placeholder="${state.locale === "zh-CN" ? "例如：奇幻 RPG 猫咪冒险的开场，轻快探索感，镜头从村庄推进到远方城堡。" : "Example: An opening for a fantasy RPG cat adventure, playful exploration, moving from village to distant castle."}">${escapeHtml(music.brief)}</textarea><div class="musicDirectionControls"><label><span>${state.locale === "zh-CN" ? "使用场景" : "Use case"}</span><select id="musicDirectionUseCase"><option value="video" ${music.useCase === "video" ? "selected" : ""}>${state.locale === "zh-CN" ? "视频 / UA 配乐" : "Video / UA"}</option><option value="music" ${music.useCase === "music" ? "selected" : ""}>${state.locale === "zh-CN" ? "音乐先行探索" : "Music-first exploration"}</option></select></label><label><span>${state.locale === "zh-CN" ? "作品模式" : "Mode"}</span><select id="musicDirectionMode"><option value="instrumental" ${music.mode === "instrumental" ? "selected" : ""}>${state.locale === "zh-CN" ? "纯音乐" : "Instrumental"}</option><option value="song" ${music.mode === "song" ? "selected" : ""}>${state.locale === "zh-CN" ? "歌曲" : "Song"}</option></select></label></div><p class="musicDirectionHint">${state.locale === "zh-CN" ? "未明确要求时，不在提示词中擅自限制时长或按秒划分结构。" : "No duration or second-by-second structure is inferred unless explicitly requested."}</p><div class="musicDirectionAction"><button class="featurePrimaryButton" id="buildMusicDirectionButton" type="button">${state.locale === "zh-CN" ? "生成音乐方向" : "Build music direction"}</button><button class="featureSecondaryButton" id="generateMusicAudioButton" type="button" ${music.status === "generating" ? "disabled" : ""}>${music.status === "generating" ? (state.locale === "zh-CN" ? "生成中…" : "Generating…") : (state.locale === "zh-CN" ? "生成音乐" : "Generate music")}</button></div></aside><main class="musicDirectionStage" aria-live="polite"><div class="musicDirectionStageHeading"><div><p>${state.locale === "zh-CN" ? "声音叙事" : "Sound narrative"}</p><h3>${state.locale === "zh-CN" ? "让节奏服务镜头" : "Make rhythm serve the shot"}</h3></div><span>${music.mode === "instrumental" ? (state.locale === "zh-CN" ? "纯音乐" : "Instrumental") : (state.locale === "zh-CN" ? "歌曲方向" : "Song direction")}</span></div>${musicDirectionOutputHtml(music)}</main><aside class="musicDirectionReadiness"><section><span class="statusDot muted"></span><p>${state.locale === "zh-CN" ? "音乐模型尚未绑定" : "No music model bound"}</p><strong>${state.locale === "zh-CN" ? "当前可完成方向设计" : "Direction design is available"}</strong></section><section class="audioPlanningHistory"><div class="railHeading"><strong>${state.locale === "zh-CN" ? "本地资产记录" : "Local asset history"}</strong><button class="imageHistoryRefresh" id="refreshAudioHistoryButton" type="button">${state.locale === "zh-CN" ? "刷新" : "Refresh"}</button></div>${audioHistoryHtml("music-direction")}</section><div><p class="musicDirectionEyebrow">${state.locale === "zh-CN" ? "下一步" : "Next"}</p><ol><li>${state.locale === "zh-CN" ? "在 Provider 中登记支持音乐的模型" : "Register a music-capable model in Provider"}</li><li>${state.locale === "zh-CN" ? "绑定后再开放生成与试听" : "Enable generation and listening after binding"}</li></ol></div></aside></div></section>`;
  bindMusicDirectionWorkspace();
  mountAssetLibraryShortcut("openMusicAssetLibraryButton", "audio", music.audio && music.audio.id);
}

function renderVideoGenerationWorkbench(feature, workspace) {
  const generation = state.videoGeneration;
  const settings = state.videoGenerationSettings;
  const supportedSettings = videoGenerationControlOptions();
  const generating = generation.status === "generating";
  const readiness = state.videoReadiness;
  const readyLabel = readiness.status === "loading"
    ? (state.locale === "zh-CN" ? "正在检查视频模型配置…" : "Checking video model configuration…")
    : (readiness.ready
      ? (state.locale === "zh-CN" ? "视频模型已就绪，可以提交真实异步任务。" : "Video model is ready for real async task submission.")
      : (state.locale === "zh-CN" ? "尚未绑定可用的视频模型。" : (readiness.message || "No usable video model is bound yet.")));
  const readyAdvice = state.locale !== "zh-CN" && !readiness.ready && readiness.advice && readiness.advice.length
    ? `<small>${escapeHtml(readiness.advice[0])}</small>`
    : "";
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench imageGenerationWorkbench videoGenerationWorkbench">
      ${workbenchHeaderHtml(feature, `${createModeToggleHtml()}<span>${state.locale === "zh-CN" ? "异步视频任务" : "Async video task"}</span>`)}
      <div class="imageGenerationWorkbenchBody">
        <aside class="imageGenerationComposer"><div class="railHeading"><strong>${state.locale === "zh-CN" ? "镜头描述" : "Shot prompt"}</strong><span>${state.locale === "zh-CN" ? "描述主体、动作、镜头运动、节奏与风格" : "Describe subject, action, camera, pacing, and style"}</span></div>
          <textarea id="featurePromptInput" placeholder="${state.locale === "zh-CN" ? "例如：雨夜霓虹街头，一只黑猫从水洼旁走过，镜头低机位缓慢跟拍，电影感，16:9。" : "Example: A black cat walks beside a puddle on a neon rainy street; low-angle slow tracking shot, cinematic."}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea>
          <div class="imageGenerationControls">${supportedSettings.aspectRatio ? `<label><span>${state.locale === "zh-CN" ? "画面比例" : "Aspect ratio"}</span><select id="videoGenerationAspectRatio">${["16:9", "9:16", "1:1", "21:9", "4:3"].map((value) => `<option value="${value}" ${settings.aspectRatio === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>` : ""}<label><span>${state.locale === "zh-CN" ? "时长" : "Duration"}</span><select id="videoGenerationDuration">${supportedSettings.durations.map((value) => `<option value="${value}" ${Number(settings.durationSeconds) === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label><span>${state.locale === "zh-CN" ? "输出规格" : "Resolution"}</span><select id="videoGenerationResolution">${supportedSettings.resolutions.map((value) => `<option value="${value}" ${settings.resolution === value ? "selected" : ""}>${value}</option>`).join("")}</select></label></div>
          <p class="imageExportNote">${state.locale === "zh-CN" ? (supportedSettings.aspectRatio ? "不同视频供应商对时长和规格的支持不同；本页会按绑定模型返回真实状态和错误。" : "MiniMax 当前文本生成视频接口不接收画面比例；这里仅显示该模型实际支持的时长和输出规格。") : (supportedSettings.aspectRatio ? "Video providers differ in supported duration and resolution; this page shows the bound model's real status and errors." : "MiniMax text-to-video does not accept an aspect ratio here; only this model's supported duration and output settings are shown.")}</p>
          <p class="imageExportNote"><span class="statusDot ${readiness.ready ? "success" : (readiness.status === "loading" ? "warning" : "muted")}"></span>${escapeHtml(readyLabel)} ${readyAdvice}<button class="imageHistoryRefresh" id="refreshVideoReadinessButton" type="button">${state.locale === "zh-CN" ? "检查" : "Check"}</button></p>
          <div class="workbenchActionBar"><button class="featurePrimaryButton" id="featureGenerateButton" type="button" ${generating || !state.providerProfileReady || !readiness.ready ? "disabled" : ""}>${generating ? (state.locale === "zh-CN" ? "生成中" : "Generating") : (state.locale === "zh-CN" ? "生成视频" : "Generate video")}</button><button class="featureSecondaryButton" id="featureCancelButton" type="button" ${generating ? "" : "hidden disabled"}>${state.locale === "zh-CN" ? "停止轮询" : "Stop polling"}</button></div>
        </aside>
        <main class="imageGenerationCanvas" aria-live="polite">${videoGenerationOutputHtml(generation)}</main>
        <aside class="imageGenerationInspector"><section class="imageHistorySection"><div class="railHeading"><strong>${state.locale === "zh-CN" ? "视频任务历史" : "Video task history"}</strong><button class="imageHistoryRefresh" id="refreshVideoTasksButton" type="button">${state.locale === "zh-CN" ? "刷新" : "Refresh"}</button></div>${videoTaskHistoryHtml()}</section></aside>
      </div>
    </section>`;
  bindVideoGenerationWorkspace();
  mountAssetLibraryShortcut("openVideoAssetLibraryButton", "video", generation.task && generation.task.id);
}

function renderImageGenerationWorkbench(feature, workspace) {
  const generation = state.imageGeneration;
  const settings = state.imageGenerationSettings;
  const generating = generation.status === "generating";
  const imageReadiness = capabilityConnectionStatus("image");
  const inspectorTab = state.imageInspectorTab === "diagnostics" ? "diagnostics" : "history";
  const imageSettingsOpen = !window.matchMedia("(max-width: 840px)").matches;
  const exportSpec = imageGenerationExportSpec(settings);
  const aspectOptions = imageAspectPresets.map(([value, label]) => `<option value="${value}" ${exportSpec.aspectRatio === value ? "selected" : ""}>${label}</option>`).join("");
  const outputOptions = ["1k", "2k", "4k"].map((value) => {
    const spec = imageGenerationExportSpec({ ...settings, outputResolution: value });
    return `<option value="${value}" ${exportSpec.outputResolution === value ? "selected" : ""}>${value.toUpperCase()} · ${spec.width} × ${spec.height}</option>`;
  }).join("");
  const chips = ["游戏主视觉", "透明背景素材", "分镜概念图", "产品海报"].map((chip) => `<button type="button" data-image-prompt-chip="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`).join("");
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench imageGenerationWorkbench">
      ${workbenchHeaderHtml(feature, `${createModeToggleHtml()}<span>${state.locale === "zh-CN" ? "图片模型真实生成" : "Live image generation"}</span>`)}
      <div class="imageGenerationWorkbenchBody">
        <aside class="imageGenerationComposer">
          <div class="railHeading"><strong>${state.locale === "zh-CN" ? "画面描述" : "Image prompt"}</strong><span>${state.locale === "zh-CN" ? "描述主体、构图、风格和用途" : "Describe subject, composition, style, and use"}</span></div>
          <textarea id="featurePromptInput" placeholder="${state.locale === "zh-CN" ? "例如：赛博东方风游戏角色主视觉，半身构图，透明背景，适合 AE 角色卡包装。" : "Example: Cyber-eastern game character key visual, transparent background, suitable for an AE character card."}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea>
          <div class="workbenchPromptChips vertical">${chips}</div>
          <details class="imageGenerationSettingsDisclosure" ${imageSettingsOpen ? "open" : ""}>
            <summary>${state.locale === "zh-CN" ? "生成设置" : "Generation settings"}<span>${escapeHtml(settings.size)} · ${escapeHtml(settings.quality)}</span></summary>
            <div class="imageGenerationControls">
              <label><span>${state.locale === "zh-CN" ? "画面比例" : "Aspect ratio"}</span><select id="imageGenerationAspectRatio">${aspectOptions}</select></label>
              <label><span>${state.locale === "zh-CN" ? "输出规格" : "Output resolution"}</span><select id="imageGenerationOutputResolution">${outputOptions}</select></label>
              <p class="imageExportNote">${state.locale === "zh-CN" ? "2K / 4K 在模型返回后进行本地高质量放大；下载和历史保存的是最终输出文件。" : "2K / 4K are locally high-quality upscaled after generation; downloads and history use the final output file."}</p>
              <label><span>${state.locale === "zh-CN" ? "尺寸" : "Size"}</span><select id="imageGenerationSize"><option value="1024x1024" ${settings.size === "1024x1024" ? "selected" : ""}>1024 × 1024</option><option value="1536x1024" ${settings.size === "1536x1024" ? "selected" : ""}>1536 × 1024</option><option value="1024x1536" ${settings.size === "1024x1536" ? "selected" : ""}>1024 × 1536</option></select></label>
              <label><span>${state.locale === "zh-CN" ? "质量" : "Quality"}</span><select id="imageGenerationQuality"><option value="low" ${settings.quality === "low" ? "selected" : ""}>Low</option><option value="medium" ${settings.quality === "medium" ? "selected" : ""}>Medium</option><option value="high" ${settings.quality === "high" ? "selected" : ""}>High</option></select></label>
              <label><span>${state.locale === "zh-CN" ? "背景" : "Background"}</span><select id="imageGenerationBackground"><option value="opaque" ${settings.background === "opaque" ? "selected" : ""}>${state.locale === "zh-CN" ? "不透明" : "Opaque"}</option><option value="transparent" ${settings.background === "transparent" ? "selected" : ""}>${state.locale === "zh-CN" ? "透明" : "Transparent"}</option><option value="auto" ${settings.background === "auto" ? "selected" : ""}>Auto</option></select></label>
            </div>
          </details>
          <div class="workbenchActionBar">
            <button class="featurePrimaryButton" id="featureGenerateButton" type="button" ${generating || !state.providerProfileReady || imageReadiness.state !== "connected" ? "disabled" : ""}>${!state.providerProfileReady ? (state.locale === "zh-CN" ? "同步配置中" : "Syncing config") : (imageReadiness.state !== "connected" ? capabilityConnectionLabel("image") : (generating ? (state.locale === "zh-CN" ? "生成中" : "Generating") : (state.locale === "zh-CN" ? "生成图片" : "Generate image")))}</button>
            <button class="featureSecondaryButton" id="featureCancelButton" type="button" ${generating ? "" : "hidden disabled"}>${state.locale === "zh-CN" ? "取消" : "Cancel"}</button>
          </div>
        </aside>
        <main class="imageGenerationCanvas" aria-live="polite">${imageGenerationOutputHtml(generation)}</main>
        <aside class="imageGenerationInspector">
          <section class="creationInspectorStatus" aria-label="${state.locale === "zh-CN" ? "图片模型状态" : "Image model status"}">
            <span class="statusDot ${capabilityConnectionTone("image")}"></span>
            <div><span>${state.locale === "zh-CN" ? "图片模型" : "Image model"}</span><strong>${escapeHtml(capabilityConnectionDetail("image"))}</strong></div>
          </section>
          <nav class="imageInspectorTabs" aria-label="${state.locale === "zh-CN" ? "图片检查器" : "Image inspector"}">
            <button type="button" data-image-inspector-tab="history" class="${inspectorTab === "history" ? "active" : ""}" aria-selected="${inspectorTab === "history" ? "true" : "false"}">${state.locale === "zh-CN" ? "历史" : "History"}</button>
            <button type="button" data-image-inspector-tab="diagnostics" class="${inspectorTab === "diagnostics" ? "active" : ""}" aria-selected="${inspectorTab === "diagnostics" ? "true" : "false"}">${state.locale === "zh-CN" ? "诊断" : "Diagnostics"}</button>
          </nav>
          ${inspectorTab === "diagnostics" ? `
            <section class="imageInspectorPanel imageDiagnosticsSection"><div class="railHeading"><strong>${state.locale === "zh-CN" ? "请求诊断" : "Request diagnostics"}</strong><span>${state.locale === "zh-CN" ? "不包含 API Key" : "API key excluded"}</span></div>${imageGenerationDiagnosticsHtml(generation)}</section>
          ` : `
            <section class="imageInspectorPanel imageHistorySection"><div class="railHeading"><strong>${state.locale === "zh-CN" ? "最近生成" : "Recent generations"}</strong><button class="imageHistoryRefresh" id="refreshImageHistoryButton" type="button">${state.locale === "zh-CN" ? "刷新" : "Refresh"}</button></div>${imageHistoryManagementHtml()}${imageHistoryListHtml()}</section>
          `}
        </aside>
      </div>
    </section>
  `;
  bindImageGenerationWorkspace();
  mountAssetLibraryShortcut("openImageAssetLibraryButton", "image", generation.artifact && generation.artifact.id);
  const legacySizeControl = el("imageGenerationSize");
  legacySizeControl?.closest("label")?.remove();
  const settingsSummary = workspace.querySelector(".imageGenerationSettingsDisclosure summary span");
  if (settingsSummary) settingsSummary.textContent = `${exportSpec.outputResolution.toUpperCase()} · ${exportSpec.width} × ${exportSpec.height} · ${settings.quality}`;
  el("refreshImageHistoryButton")?.addEventListener("click", () => loadImageHistory());
}

function workbenchHeaderHtml(feature, meta = "") {
  const textDrivenViews = new Set(["copilot", "create", "copy", "translate", "storyboard", "motion", "expression", "script", "analyze", "automate"]);
  const binding = state.activeView === "create" && state.createMode === "image"
    ? imageCapabilityBinding()
    : (state.activeView === "create" && state.createMode === "video" ? videoCapabilityBinding() : textCapabilityBinding());
  const activeCreateCapability = state.activeView === "create" && ["image", "video", "music", "voice"].includes(state.createMode)
    ? state.createMode
    : "";
  const runtimeDetail = activeCreateCapability
    ? `${capabilityConnectionLabel(activeCreateCapability)} · ${capabilityConnectionDetail(activeCreateCapability)}`
    : (textDrivenViews.has(state.activeView)
    ? providerModelLabel(binding.providerId, binding.model)
    : (state.serviceOnline ? "Local Service" : (state.locale === "zh-CN" ? "服务离线" : "Service offline")));
  const runtimeLabel = activeCreateCapability
    ? capabilityConnectionLabel(activeCreateCapability)
    : runtimeDetail;
  return `
    <header class="workbenchHeader">
      <div class="workbenchIdentity">
        <span class="utilityIcon">${navIconSvg(feature.icon)}</span>
        <div>
          <span>${escapeHtml(localText(feature.eyebrow))}</span>
          <h2>${escapeHtml(localText(feature.title))}</h2>
        </div>
      </div>
      <div class="workbenchHeaderMeta">
        <div class="workbenchHeaderModes">${meta}</div>
        <div class="workbenchHeaderTools">${activeCreateCapability ? "" : `<span class="workbenchModelState" title="${escapeHtml(runtimeDetail)}"><span class="statusDot ${state.serviceOnline ? "success" : "warning"}"></span>${escapeHtml(runtimeLabel)}</span>`}</div>
      </div>
    </header>
  `;
}

function workbenchQuickPromptsHtml(feature) {
  return feature.chips.map((chip) => `<button type="button" data-text-prompt-chip="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`).join("");
}

function workbenchGenerationActionsHtml(feature, generation) {
  const generating = generation.status === "generating";
  const syncing = !state.providerProfileReady;
  return `
    <div class="workbenchActionBar">
      <button class="featurePrimaryButton" id="featureGenerateButton" type="button" ${generating || syncing ? "disabled" : ""}>${syncing ? (state.locale === "zh-CN" ? "同步配置中" : "Syncing config") : (generating ? (state.locale === "zh-CN" ? "生成中" : "Generating") : escapeHtml(localText(feature.primary)))}</button>
      <button class="featureSecondaryButton" id="featureCancelButton" type="button" ${generating ? "" : "hidden disabled"}>${state.locale === "zh-CN" ? "取消" : "Cancel"}</button>
      <button class="featureSecondaryButton" id="featureSecondaryButton" type="button" ${generating ? "disabled" : ""}>${escapeHtml(localText(feature.secondary))}</button>
    </div>
  `;
}

function workbenchHistoryHtml(feature) {
  return feature.historyRows.map((row) => `
    <button type="button" data-text-history="${escapeHtml(row)}">
      <span>${escapeHtml(row)}</span>
      <small>${state.locale === "zh-CN" ? "再次使用" : "Reuse"}</small>
    </button>
  `).join("");
}

function assistantConversationHtml() {
  return state.assistantConversation.map((message) => {
    if (message.role === "user") {
      return `
        <article class="assistantMessage assistantUserMessage">
          <div class="assistantMessageContent"><p>${escapeHtml(message.content)}</p></div>
          <span class="assistantAvatar" aria-label="${state.locale === "zh-CN" ? "你的消息" : "Your message"}">${state.locale === "zh-CN" ? "我" : "You"}</span>
        </article>
      `;
    }
    if (message.status === "generating") {
      return `
        <article class="assistantMessage assistantReplyMessage" role="status">
          <span class="assistantAvatar">K</span>
          <div class="assistantTyping"><span class="statusDot warning"></span>${state.locale === "zh-CN" ? "小黑正在思考" : "Kuroii is thinking"}</div>
        </article>
      `;
    }
    if (message.status === "error" || message.status === "cancelled") {
      return `
        <article class="assistantMessage assistantReplyMessage">
          <span class="assistantAvatar">K</span>
          <div class="assistantMessageContent assistantMessageError"><strong>${state.locale === "zh-CN" ? "本次回复未完成" : "Reply not completed"}</strong><p>${escapeHtml(message.message || (state.locale === "zh-CN" ? "请检查服务后重试。" : "Check the service and try again."))}</p></div>
        </article>
      `;
    }
    const binding = message.binding || textCapabilityBinding();
    return `
      <article class="assistantMessage assistantReplyMessage">
        <span class="assistantAvatar">K</span>
        <div class="assistantMessageContent assistantReplyContent">
          <div class="assistantReplyText">${escapeHtml(message.content)}</div>
          ${message.reasoning ? `<details class="textReasoningBlock"><summary>${state.locale === "zh-CN" ? "查看模型思考摘要" : "View reasoning summary"}</summary><div>${escapeHtml(message.reasoning)}</div></details>` : ""}
          <footer>${escapeHtml(providerLabel(binding.providerId))} · ${escapeHtml(providerModelLabel(binding.providerId, binding.model))}</footer>
        </div>
      </article>
    `;
  }).join("");
}

function renderAssistantWorkbench(feature, workspace) {
  const generation = textGenerationState("copilot");
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench assistantWorkbench">
      ${workbenchHeaderHtml(feature, `<span>${state.locale === "zh-CN" ? "工程上下文对话" : "Project context chat"}</span>`)}
      <div class="assistantWorkbenchBody">
        <main class="assistantThread">
          <div class="assistantThreadStream" aria-live="polite">
            <article class="assistantMessage assistantIntroMessage">
              <span class="assistantAvatar">K</span>
              <div><strong>${state.locale === "zh-CN" ? "小黑已准备好" : "Kuroii is ready"}</strong><p>${escapeHtml(localText(feature.intro))}</p></div>
            </article>
            ${assistantConversationHtml()}
          </div>
          <div class="assistantComposerDock">
            <textarea id="featurePromptInput" placeholder="${escapeHtml(localText(feature.prompt))}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea>
            <div class="assistantComposerFooter">
              <div class="workbenchPromptChips">${workbenchQuickPromptsHtml(feature)}</div>
              ${workbenchGenerationActionsHtml(feature, generation)}
            </div>
          </div>
        </main>
        <aside class="assistantContextPane">
          <div class="contextPaneSection"><span>${state.locale === "zh-CN" ? "当前宿主" : "Active host"}</span><strong>After Effects · Comp 01_Main</strong><small>3 layers selected · 00:00:12:04</small></div>
          <div class="contextPaneSection"><span>${state.locale === "zh-CN" ? "可用上下文" : "Available context"}</span><ul><li>${state.locale === "zh-CN" ? "合成与序列信息" : "Composition and sequence"}</li><li>${state.locale === "zh-CN" ? "选中图层与剪辑" : "Selected layers and clips"}</li><li>${state.locale === "zh-CN" ? "只读诊断状态" : "Read-only diagnostics"}</li></ul></div>
          <div class="assistantHistoryRail"><span>${escapeHtml(localText(feature.historyTitle))}</span>${workbenchHistoryHtml(feature)}</div>
        </aside>
      </div>
    </section>
  `;
  bindTextGenerationWorkspace();
}

function renderDocumentWorkbench(feature, workspace, mode) {
  if (mode === "create" && state.createMode === "image") {
    renderImageGenerationWorkbench(feature, workspace);
    return;
  }
  if (mode === "create" && state.createMode === "video") {
    renderVideoGenerationWorkbench(feature, workspace);
    return;
  }
  if (mode === "create" && state.createMode === "music") {
    renderMusicDirectionWorkbench(feature, workspace);
    return;
  }
  if (mode === "create" && state.createMode === "voice") {
    renderVoiceDirectionWorkbench(feature, workspace);
    return;
  }
  const generation = textGenerationState(mode);
  const isCopy = mode === "copy";
  const taskControls = textFeatureControlsHtml(mode);
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench documentWorkbench ${isCopy ? "copyDocumentWorkbench" : "contentDocumentWorkbench"}">
      ${workbenchHeaderHtml(feature, `${mode === "create" ? createModeToggleHtml() : ""}<span>${isCopy ? (state.locale === "zh-CN" ? "多版本文案编辑" : "Multi-variant copy editor") : (state.locale === "zh-CN" ? "创意简报到成稿" : "Brief to deliverable")}</span>`)}
      <div class="documentWorkbenchBody">
        <aside class="documentBriefRail">
          <div class="railHeading"><strong>${isCopy ? (state.locale === "zh-CN" ? "文案约束" : "Copy constraints") : (state.locale === "zh-CN" ? "创意简报" : "Creative brief")}</strong><span>${escapeHtml(localText(feature.promptLabel))}</span></div>
          <textarea id="featurePromptInput" placeholder="${escapeHtml(localText(feature.prompt))}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea>
          ${taskControls}
          <div class="workbenchPromptChips vertical">${workbenchQuickPromptsHtml(feature)}</div>
          ${workbenchGenerationActionsHtml(feature, generation)}
        </aside>
        <main class="documentCanvas">
          <div class="documentRuler"><span>${isCopy ? (state.locale === "zh-CN" ? "候选版本" : "Variants") : (state.locale === "zh-CN" ? "生成文档" : "Generated document")}</span><div><button type="button">A</button><button type="button">B</button><button type="button">C</button></div></div>
          <article class="documentPage" aria-live="polite">
            ${textGenerationOutputHtml(feature, generation)}
          </article>
        </main>
        <aside class="documentOutlineRail">
          <div class="railHeading"><strong>${isCopy ? (state.locale === "zh-CN" ? "版本对比" : "Variant compare") : (state.locale === "zh-CN" ? "文档结构" : "Document outline")}</strong><span>${state.locale === "zh-CN" ? "点击定位内容" : "Jump to section"}</span></div>
          <ol>${feature.outputRows.map((row, index) => `<li><button type="button"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(row)}</button></li>`).join("")}</ol>
          <div class="documentHistoryRail"><span>${escapeHtml(localText(feature.historyTitle))}</span>${workbenchHistoryHtml(feature)}</div>
        </aside>
      </div>
    </section>
  `;
  bindTextGenerationWorkspace();
}

function renderTranslationWorkbench(feature, workspace) {
  const generation = textGenerationState("translate");
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench translationWorkbench">
      ${workbenchHeaderHtml(feature, `<span>${state.locale === "zh-CN" ? "逐段对照与字幕保护" : "Segment alignment and subtitle safety"}</span>`)}
      <div class="translationToolbar">
        ${textFeatureControlsHtml("translate")}
        ${workbenchGenerationActionsHtml(feature, generation)}
      </div>
      <div class="translationWorkbenchBody">
        <section class="translationColumn sourceColumn">
          <header><strong>${state.locale === "zh-CN" ? "原文" : "Source"}</strong><span>${state.locale === "zh-CN" ? "自动分段" : "Auto segmented"}</span></header>
          <div class="translationSegment"><span>01</span><textarea id="featurePromptInput" placeholder="${escapeHtml(localText(feature.prompt))}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea></div>
          <div class="translationSegment ghost"><span>02</span><p>00:00:03,200 → 00:00:05,800</p></div>
        </section>
        <section class="translationColumn targetColumn">
          <header><strong>${state.locale === "zh-CN" ? "译文" : "Translation"}</strong><span>${state.locale === "zh-CN" ? "长度与时间码检查" : "Length and timing checks"}</span></header>
          <div class="translationResult" aria-live="polite">${textGenerationOutputHtml(feature, generation)}</div>
        </section>
        <aside class="translationGlossaryPane">
          <header><strong>${state.locale === "zh-CN" ? "术语表" : "Glossary"}</strong><button type="button">+</button></header>
          <label><span>Ultimate</span><input value="终极技能" aria-label="Ultimate"></label>
          <label><span>Idle RPG</span><input value="放置 RPG" aria-label="Idle RPG"></label>
          <label><span>Critical Hit</span><input value="暴击" aria-label="Critical Hit"></label>
          <div class="translationQa"><strong>QA</strong><p>${state.locale === "zh-CN" ? "术语一致 · 时间码保留 · 断句待检查" : "Terms consistent · Timing kept · Breaks need review"}</p></div>
        </aside>
      </div>
    </section>
  `;
  bindTextGenerationWorkspace();
}

function renderStoryboardWorkbench(feature, workspace) {
  const generation = textGenerationState("storyboard");
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench storyboardWorkbench">
      ${workbenchHeaderHtml(feature, `<span>${state.locale === "zh-CN" ? "镜头表与时长校验" : "Shot table and duration validation"}</span>`)}
      <div class="storyboardToolbar">${textFeatureControlsHtml("storyboard")}${workbenchGenerationActionsHtml(feature, generation)}</div>
      <div class="storyboardWorkbenchBody">
        <aside class="storySourcePane">
          <div class="railHeading"><strong>${state.locale === "zh-CN" ? "脚本来源" : "Source script"}</strong><span>${escapeHtml(localText(feature.promptLabel))}</span></div>
          <textarea id="featurePromptInput" placeholder="${escapeHtml(localText(feature.prompt))}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea>
          <div class="workbenchPromptChips vertical">${workbenchQuickPromptsHtml(feature)}</div>
        </aside>
        <main class="storyShotTable">
          <div class="storyTableHeader"><span>#</span><span>${state.locale === "zh-CN" ? "时间" : "Time"}</span><span>${state.locale === "zh-CN" ? "画面与动作" : "Visual and action"}</span><span>${state.locale === "zh-CN" ? "字幕 / 旁白" : "Copy / VO"}</span><span>${state.locale === "zh-CN" ? "转场" : "Transition"}</span></div>
          ${feature.outputRows.map((row, index) => `<button class="storyShotRow ${index === 0 ? "selected" : ""}" type="button" data-workbench-select><span>${String(index + 1).padStart(2, "0")}</span><span>${index * 3}-${index * 3 + 3}s</span><strong>${escapeHtml(row)}</strong><span>${state.locale === "zh-CN" ? "待生成" : "Pending"}</span><span>${index ? "Cut" : "Open"}</span></button>`).join("")}
          <div class="storyGeneratedDraft">${textGenerationOutputHtml(feature, generation)}</div>
        </main>
      </div>
      <div class="storyTimeline"><span class="timelineLabel">00:00</span><div class="timelineTrack">${Array.from({ length: 6 }, (_, index) => `<button type="button" style="--shot-index:${index}"><span>${index + 1}</span></button>`).join("")}</div><span class="timelineLabel">00:15</span></div>
    </section>
  `;
  bindTextGenerationWorkspace();
  bindStaticWorkbenchInteractions();
}

function renderMotionWorkbench(feature, workspace) {
  const generation = textGenerationState("motion");
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench motionWorkbench">
      ${workbenchHeaderHtml(feature, `<span>${state.locale === "zh-CN" ? "图层、舞台、参数与关键帧" : "Layers, stage, inspector, and keyframes"}</span>`)}
      <div class="motionWorkbenchBody">
        <aside class="motionLayerPane">
          <header><strong>${state.locale === "zh-CN" ? "图层" : "Layers"}</strong><button type="button">+</button></header>
          <button class="selected" type="button" data-workbench-select><span>T</span><div><strong>Title_Main</strong><small>Text · Position</small></div></button>
          <button type="button" data-workbench-select><span>▣</span><div><strong>Shape_Accent</strong><small>Shape · Scale</small></div></button>
          <button type="button" data-workbench-select><span>◫</span><div><strong>BG_Gradient</strong><small>Solid · Opacity</small></div></button>
        </aside>
        <main class="motionStage">
          <div class="motionStageToolbar"><span>Comp 01_Main · 1920 × 1080</span><div><button type="button">25%</button><button type="button">Fit</button><button type="button">▶</button></div></div>
          <div class="motionCanvas"><div class="motionCanvasObject"><span>KUROII MOTION</span><i></i><i></i><i></i><i></i></div></div>
          <div class="motionGeneratedPlan">${textGenerationOutputHtml(feature, generation)}</div>
        </main>
        <aside class="motionInspector">
          <header><strong>${state.locale === "zh-CN" ? "动效参数" : "Motion inspector"}</strong><span>Title_Main</span></header>
          <label><span>${state.locale === "zh-CN" ? "持续时间" : "Duration"}</span><div><input type="number" value="0.8" step="0.1"><small>s</small></div></label>
          <label><span>${state.locale === "zh-CN" ? "缓动" : "Easing"}</span><select><option>Back Out</option><option>Expo Out</option><option>Bezier</option></select></label>
          <label><span>${state.locale === "zh-CN" ? "位移" : "Offset"}</span><input type="range" min="0" max="500" value="180"></label>
          <textarea id="featurePromptInput" placeholder="${escapeHtml(localText(feature.prompt))}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea>
          <div class="workbenchPromptChips">${workbenchQuickPromptsHtml(feature)}</div>
          ${workbenchGenerationActionsHtml(feature, generation)}
        </aside>
      </div>
      <div class="keyframeTimeline">
        <div class="timelineTools"><button type="button">◆</button><span>00:00:00:00</span></div>
        <div class="timelineNames"><span>Position</span><span>Scale</span><span>Opacity</span></div>
        <div class="keyframeTracks"><div><i style="left:8%"></i><i style="left:48%"></i></div><div><i style="left:8%"></i><i style="left:48%"></i></div><div><i style="left:8%"></i><i style="left:42%"></i></div><b style="left:28%"></b></div>
      </div>
    </section>
  `;
  bindTextGenerationWorkspace();
  bindStaticWorkbenchInteractions();
}

function renderCodeWorkbench(feature, workspace, mode) {
  const generation = textGenerationState(mode);
  const isExpression = mode === "expression";
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench codeWorkbench ${isExpression ? "expressionWorkbench" : "scriptWorkbench"}">
      ${workbenchHeaderHtml(feature, `<span>${isExpression ? "After Effects Expression" : "JSX / UXP"}</span>`)}
      <div class="codeWorkbenchBody">
        <aside class="codeExplorerPane">
          <header><strong>${isExpression ? (state.locale === "zh-CN" ? "属性" : "Properties") : (state.locale === "zh-CN" ? "文件" : "Files")}</strong><button type="button">+</button></header>
          <button class="selected" type="button" data-workbench-select><span>ƒx</span><div><strong>${isExpression ? "Position" : "main.jsx"}</strong><small>${isExpression ? "Title_Main" : "src"}</small></div></button>
          <button type="button" data-workbench-select><span>ƒx</span><div><strong>${isExpression ? "Scale" : "manifest.json"}</strong><small>${isExpression ? "Shape_Accent" : "config"}</small></div></button>
          <div class="codePromptPane"><label>${escapeHtml(localText(feature.promptLabel))}</label><textarea id="featurePromptInput" placeholder="${escapeHtml(localText(feature.prompt))}" spellcheck="true">${escapeHtml(generation.prompt)}</textarea>${workbenchGenerationActionsHtml(feature, generation)}</div>
        </aside>
        <main class="codeEditorPane">
          <div class="codeTabs"><button class="selected" type="button">${isExpression ? "Position.expression" : "main.jsx"}<span>×</span></button><button type="button">${state.locale === "zh-CN" ? "生成结果" : "Generated"}</button></div>
          <div class="codeEditorSurface"><div class="kuroiiCodeEditor featureCodeEditorHost" id="featureCodeEditorHost"></div></div>
          <div class="codeGeneratedOutput" aria-live="polite">${textGenerationOutputHtml(feature, generation)}</div>
        </main>
        <aside class="codeInspectorPane">
          <header><strong>${isExpression ? (state.locale === "zh-CN" ? "控制器" : "Controls") : (state.locale === "zh-CN" ? "安全检查" : "Safety")}</strong></header>
          ${isExpression ? `<label><span>Frequency</span><input type="number" value="1.5" step="0.1"></label><label><span>Amplitude</span><input type="number" value="18"></label><label><span>Seed</span><input type="number" value="2"></label>` : `<ul><li class="pass">${state.locale === "zh-CN" ? "使用 Undo Group" : "Undo Group present"}</li><li class="pass">${state.locale === "zh-CN" ? "无网络访问" : "No network access"}</li><li class="warning">${state.locale === "zh-CN" ? "写入前需要确认" : "Confirm before mutation"}</li></ul>`}
        </aside>
      </div>
      <div class="codeConsole"><span>PROBLEMS 0</span><span>OUTPUT</span><span>LOCAL SERVICE</span><pre>${state.locale === "zh-CN" ? "就绪。脚本只在用户确认后执行。" : "Ready. Scripts execute only after confirmation."}</pre></div>
    </section>
  `;
  bindTextGenerationWorkspace();
  bindStaticWorkbenchInteractions();
  mountFeatureCodeEditor(isExpression ? "expression" : "script");
}

const professionalWorkflowDefinitions = [
  {
    id: "ae-safe-inspect",
    name: { "zh-CN": "AE 安全检查", "en-US": "AE Safe Inspect" },
    summary: { "zh-CN": "读取工程、合成和当前选择，不修改项目。", "en-US": "Read project, composition, and selection without mutation." },
    host: "after-effects",
    steps: ["ae.context.getProject", "ae.context.getActiveComp", "ae.context.getSelection", "ae.text.readSelectedLayers"]
  },
  {
    id: "pr-sequence-inspect",
    name: { "zh-CN": "PR 序列检查", "en-US": "PR Sequence Inspect" },
    summary: { "zh-CN": "读取项目与活动序列上下文。", "en-US": "Read project and active sequence context." },
    host: "premiere-pro",
    steps: ["pr.context.getProject", "pr.context.getActiveSequence"]
  },
  {
    id: "selection-report",
    name: { "zh-CN": "选择内容报告", "en-US": "Selection Report" },
    summary: { "zh-CN": "汇总当前宿主选择内容并输出报告。", "en-US": "Summarize the selected host content as a report." },
    host: "cross-host",
    steps: ["context.getSelection", "report.format", "history.record"]
  }
];

const professionalCodeResources = {
  script: [
    { id: "main.jsx", name: "main.jsx", meta: "ExtendScript · AE", symbol: "JS" },
    { id: "selection.jsx", name: "selection.jsx", meta: "ExtendScript · read-only", symbol: "JS" }
  ],
  expression: [
    { id: "Position.expression", name: "Position", meta: "Title_Main · Position", symbol: "fx" },
    { id: "Scale.expression", name: "Scale", meta: "Shape_Accent · Scale", symbol: "fx" },
    { id: "Opacity.expression", name: "Opacity", meta: "Overlay · Opacity", symbol: "fx" }
  ]
};

function professionalModeLabel(mode) {
  const labels = {
    actions: { "zh-CN": "可信动作", "en-US": "Trusted Actions" },
    workflows: { "zh-CN": "工作流", "en-US": "Workflows" },
    script: { "zh-CN": "脚本", "en-US": "Scripts" },
    expression: { "zh-CN": "表达式", "en-US": "Expressions" }
  };
  return localText(labels[mode] || labels.actions);
}

function professionalResources() {
  const mode = state.professionalMode;
  let resources = [];
  if (mode === "actions") {
    resources = state.data.trustedActions
      .filter((action) => action.host === state.selectedHost)
      .map((action) => ({
        id: action.id,
        name: action.id.split(".").slice(-2).join("."),
        meta: `${action.host} · risk ${action.riskLevel} · ${action.readOnly ? "read-only" : "blocked"}`,
        symbol: "→",
        source: action
      }));
  } else if (mode === "workflows") {
    resources = professionalWorkflowDefinitions
      .filter((workflow) => workflow.host === state.selectedHost || workflow.host === "cross-host")
      .map((workflow) => ({
        id: workflow.id,
        name: localText(workflow.name),
        meta: `${workflow.steps.length} steps · ${workflow.host}`,
        symbol: "◇",
        source: workflow
      }));
  } else {
    resources = (professionalCodeResources[mode] || []).map((resource) => ({ ...resource, source: resource }));
  }
  const query = state.professionalResourceQuery.trim().toLowerCase();
  if (!query) return resources;
  return resources.filter((resource) => `${resource.name} ${resource.meta} ${resource.id}`.toLowerCase().includes(query));
}

function selectedProfessionalResource(resources = professionalResources()) {
  const mode = state.professionalMode;
  const selectedId = state.professionalSelectedResource[mode];
  const selected = resources.find((resource) => resource.id === selectedId) || resources[0] || null;
  if (selected && selected.id !== selectedId) state.professionalSelectedResource[mode] = selected.id;
  return selected;
}

function setProfessionalMode(mode) {
  if (!new Set(["actions", "workflows", "script", "expression"]).has(mode)) return;
  state.professionalMode = mode;
  state.professionalResourceQuery = "";
  renderProfessionalWorkbench();
}

function toggleProfessionalDiagnostics(open = !state.professionalDiagnosticsOpen) {
  state.professionalDiagnosticsOpen = Boolean(open);
  const drawer = el("professionalDiagnosticsDrawer");
  const toggle = el("professionalDiagnosticsToggle");
  if (drawer) drawer.hidden = !state.professionalDiagnosticsOpen;
  if (toggle) toggle.setAttribute("aria-expanded", state.professionalDiagnosticsOpen ? "true" : "false");
}

function setProfessionalDiagnosticsView(view) {
  state.professionalDiagnosticsView = view === "validation" ? "validation" : "status";
  const drawer = el("professionalDiagnosticsDrawer");
  if (drawer) drawer.dataset.view = state.professionalDiagnosticsView;
  document.querySelectorAll("[data-diagnostics-view]").forEach((button) => {
    const active = button.dataset.diagnosticsView === state.professionalDiagnosticsView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function professionalHostBarHtml() {
  const summary = contextSummary();
  const hosts = state.data.hosts.map((host) => `
    <button class="professionalHostChoice ${host.host === state.selectedHost ? "active" : ""}" type="button" data-professional-host="${escapeHtml(host.host)}">
      <span class="statusDot ${statusTone(host.status)}"></span>
      <strong>${escapeHtml(host.displayName)}</strong>
      <span>${escapeHtml(host.status)}</span>
    </button>
  `).join("");
  return `${hosts}<span class="professionalHostContextSummary">${escapeHtml(summary.projectName)} · ${escapeHtml(summary.activeTarget)} · ${escapeHtml(summary.selection)} selected</span>`;
}

function professionalResourceListHtml(resources, selected) {
  if (!resources.length) {
    return `<div class="emptyState"><strong>${state.locale === "zh-CN" ? "没有匹配项" : "No matching items"}</strong><span>${state.locale === "zh-CN" ? "切换宿主或清除搜索条件。" : "Switch host or clear the search."}</span></div>`;
  }
  return resources.map((resource) => `
    <button class="professionalResourceItem ${selected && selected.id === resource.id ? "active" : ""}" type="button" data-professional-resource="${escapeHtml(resource.id)}">
      <span>${escapeHtml(resource.symbol || "·")}</span>
      <span class="professionalResourceItemText"><strong>${escapeHtml(resource.name)}</strong><small>${escapeHtml(resource.meta)}</small></span>
      <span class="professionalResourceItemMeta">${selected && selected.id === resource.id ? "●" : ""}</span>
    </button>
  `).join("");
}

function professionalStageHtml(selected) {
  if (!selected) {
    return `<div class="professionalStageContent"><div class="emptyState"><strong>${state.locale === "zh-CN" ? "暂无可用内容" : "Nothing available"}</strong></div></div>`;
  }
  if (state.professionalMode === "actions") {
    const action = selected.source;
    return `
      <div class="professionalStageHeader">
        <div class="professionalStageTitle"><strong>${escapeHtml(action.id)}</strong><span>${escapeHtml(action.host)} · trusted action</span></div>
        <span class="statusPill"><span class="statusDot success"></span>risk ${action.riskLevel} · read-only</span>
      </div>
      <div class="professionalStageContent professionalActionForm">
        <section class="professionalActionSummary">
          <h2>${state.locale === "zh-CN" ? "执行可信动作" : "Run trusted action"}</h2>
          <p>${state.locale === "zh-CN" ? "读取当前宿主上下文并返回结构化结果。本动作不会修改 AE / PR 工程。" : "Read the selected host context and return structured output without modifying the project."}</p>
        </section>
        <section class="professionalParameterGroup">
          <div class="professionalParameterGrid">
            <label><span>${state.locale === "zh-CN" ? "目标宿主" : "Target host"}</span><input value="${escapeHtml(action.host)}" readonly></label>
            <label><span>${state.locale === "zh-CN" ? "执行策略" : "Execution policy"}</span><input value="risk-0 / read-only" readonly></label>
            <label><span>${state.locale === "zh-CN" ? "项目" : "Project"}</span><input value="${escapeHtml(contextSummary().projectName)}" readonly></label>
            <label><span>${state.locale === "zh-CN" ? "当前目标" : "Active target"}</span><input value="${escapeHtml(contextSummary().activeTarget)}" readonly></label>
          </div>
        </section>
      </div>`;
  }
  if (state.professionalMode === "workflows") {
    const workflow = selected.source;
    return `
      <div class="professionalStageHeader"><div class="professionalStageTitle"><strong>${escapeHtml(localText(workflow.name))}</strong><span>${escapeHtml(workflow.host)} · ${workflow.steps.length} steps</span></div><span class="statusPill"><span class="statusDot success"></span>Dry Run ready</span></div>
      <div class="professionalStageContent professionalWorkflowCanvas">
        <div><h2>${escapeHtml(localText(workflow.name))}</h2><p>${escapeHtml(localText(workflow.summary))}</p></div>
        ${workflow.steps.map((step, index) => `<div class="professionalWorkflowLane"><span>${index + 1}</span><div><strong>${escapeHtml(step)}</strong><p>${state.locale === "zh-CN" ? "读取上下文并将结果传递到下一步" : "Read context and pass output to the next step"}</p></div><span class="statusPill">risk 0</span></div>`).join("")}
      </div>`;
  }
  const language = state.professionalMode === "expression" ? "expression" : "extendscript";
  return `
    <div class="professionalCodeStage">
      <div class="professionalStageHeader"><div class="professionalStageTitle"><strong>${escapeHtml(selected.name)}</strong><span>${language === "expression" ? "After Effects Expression" : "ExtendScript / JSX"}</span></div><span class="statusPill"><span class="statusDot success"></span>${state.locale === "zh-CN" ? "本地编辑" : "Local editor"}</span></div>
      <div class="professionalCodeEditorHost"><div class="kuroiiCodeEditor" id="professionalCodeEditorHost"></div></div>
    </div>`;
}

function professionalInspectorHtml(selected) {
  const summary = contextSummary();
  const selectedLabel = selected ? selected.name : "None";
  const mode = state.professionalMode;
  return `
    <section class="professionalInspectorSection"><strong>${state.locale === "zh-CN" ? "宿主上下文" : "Host context"}</strong>
      <div class="professionalInspectorRow"><span>Host</span><span>${escapeHtml(state.selectedHost)}</span></div>
      <div class="professionalInspectorRow"><span>Project</span><span>${escapeHtml(summary.projectName)}</span></div>
      <div class="professionalInspectorRow"><span>Target</span><span>${escapeHtml(summary.activeTarget)}</span></div>
      <div class="professionalInspectorRow"><span>Selection</span><span>${escapeHtml(summary.selection)}</span></div>
    </section>
    <section class="professionalInspectorSection"><strong>${state.locale === "zh-CN" ? "当前任务" : "Current task"}</strong>
      <div class="professionalInspectorRow"><span>Mode</span><span>${escapeHtml(mode)}</span></div>
      <div class="professionalInspectorRow"><span>Item</span><span>${escapeHtml(selectedLabel)}</span></div>
      <div class="professionalInspectorRow"><span>Safety</span><span>risk 0</span></div>
      <div class="professionalInspectorRow"><span>Mutation</span><span>blocked</span></div>
    </section>
    <section class="professionalInspectorSection"><strong>${state.locale === "zh-CN" ? "验证" : "Validation"}</strong>
      <div class="professionalInspectorRow"><span>Syntax</span><span>${mode === "script" || mode === "expression" ? "ready" : "n/a"}</span></div>
      <div class="professionalInspectorRow"><span>Dry Run</span><span>available</span></div>
      <div class="professionalInspectorRow"><span>Confirmation</span><span>${mode === "actions" ? "not required" : "required before mutation"}</span></div>
    </section>`;
}

function professionalConsoleHtml() {
  if (state.professionalConsoleTab === "history") {
    const history = filteredHistory().slice(0, 12);
    if (!history.length) return state.locale === "zh-CN" ? "暂无执行历史。" : "No execution history.";
    return history.map((record) => `<div class="professionalConsoleLog"><time>${escapeHtml(record.createdAt || "-")}</time><span>${record.ok === false ? "ERROR" : "OK"}</span><span>${escapeHtml(record.action || record.commandId)}</span></div>`).join("");
  }
  if (state.professionalConsoleTab === "problems") {
    return state.locale === "zh-CN" ? "未发现语法或安全问题。" : "No syntax or safety problems detected.";
  }
  const messages = state.professionalConsoleMessages.length
    ? state.professionalConsoleMessages
    : [{ time: new Date().toLocaleTimeString(), level: "READY", message: state.locale === "zh-CN" ? "专业工作台已就绪。选择资源后可执行 Dry Run。" : "Professional workbench ready. Select a resource to run a Dry Run." }];
  return messages.slice(-20).map((item) => `<div class="professionalConsoleLog"><time>${escapeHtml(item.time)}</time><span>${escapeHtml(item.level)}</span><span>${escapeHtml(item.message)}</span></div>`).join("");
}

function destroyProfessionalCodeEditor() {
  if (professionalCodeEditor) professionalCodeEditor.destroy();
  professionalCodeEditor = null;
}

function mountProfessionalCodeEditor(selected) {
  destroyProfessionalCodeEditor();
  if (!selected || !["script", "expression"].includes(state.professionalMode)) return;
  const root = el("professionalCodeEditorHost");
  if (!root || !window.KuroiiCodeEditor || typeof window.KuroiiCodeEditor.create !== "function") return;
  const documentId = selected.id;
  professionalCodeEditor = window.KuroiiCodeEditor.create(root, {
    doc: state.codeDocuments[documentId] || "",
    language: state.professionalMode,
    theme: state.theme,
    onChange(value) { state.codeDocuments[documentId] = value; },
    onSelectionChange(position) {
      const meta = el("professionalInspectorMeta");
      if (meta) meta.textContent = `Ln ${position.line}, Col ${position.column}`;
    }
  });
}

function mountFeatureCodeEditor(mode) {
  if (featureCodeEditor) featureCodeEditor.destroy();
  featureCodeEditor = null;
  const root = el("featureCodeEditorHost");
  if (!root || !window.KuroiiCodeEditor || typeof window.KuroiiCodeEditor.create !== "function") return;
  const documentId = mode === "expression" ? "Position.expression" : "main.jsx";
  featureCodeEditor = window.KuroiiCodeEditor.create(root, {
    doc: state.codeDocuments[documentId] || "",
    language: mode === "expression" ? "expression" : "extendscript",
    theme: state.theme,
    onChange(value) { state.codeDocuments[documentId] = value; }
  });
}

function pushProfessionalConsole(level, message) {
  state.professionalConsoleMessages.push({ time: new Date().toLocaleTimeString(), level, message });
  state.professionalConsoleTab = "output";
}

function bindProfessionalWorkbench(resources, selected) {
  document.querySelectorAll("[data-professional-mode]").forEach((button) => {
    button.onclick = () => setProfessionalMode(button.dataset.professionalMode);
  });
  document.querySelectorAll("[data-professional-host]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedHost = button.dataset.professionalHost;
      state.professionalSelectedResource.actions = null;
      render();
    });
  });
  document.querySelectorAll("[data-professional-resource]").forEach((button) => {
    button.addEventListener("click", () => {
      state.professionalSelectedResource[state.professionalMode] = button.dataset.professionalResource;
      state.professionalResourceOpen = false;
      renderProfessionalWorkbench();
    });
  });
  const query = el("professionalResourceQuery");
  if (query) {
    query.value = state.professionalResourceQuery;
    query.oninput = () => {
      state.professionalResourceQuery = query.value;
      renderProfessionalWorkbench();
      el("professionalResourceQuery")?.focus();
    };
  }
  const diagnosticsToggle = el("professionalDiagnosticsToggle");
  if (diagnosticsToggle) diagnosticsToggle.onclick = () => toggleProfessionalDiagnostics();
  const diagnosticsClose = el("professionalDiagnosticsClose");
  if (diagnosticsClose) diagnosticsClose.onclick = () => toggleProfessionalDiagnostics(false);
  document.querySelectorAll("[data-diagnostics-view]").forEach((button) => {
    button.onclick = () => setProfessionalDiagnosticsView(button.dataset.diagnosticsView);
  });
  const inspectorToggle = el("professionalInspectorToggle");
  if (inspectorToggle) {
    inspectorToggle.onclick = () => {
      state.professionalInspectorOpen = !state.professionalInspectorOpen;
      el("professionalWorkbench")?.classList.toggle("inspectorOpen", state.professionalInspectorOpen);
      inspectorToggle.setAttribute("aria-pressed", state.professionalInspectorOpen ? "true" : "false");
    };
  }
  const resourceToggle = el("professionalResourceToggle");
  if (resourceToggle) {
    resourceToggle.onclick = () => {
      state.professionalResourceOpen = !state.professionalResourceOpen;
      el("professionalWorkbench")?.classList.toggle("resourceOpen", state.professionalResourceOpen);
      resourceToggle.setAttribute("aria-pressed", state.professionalResourceOpen ? "true" : "false");
    };
  }
  document.querySelectorAll("[data-professional-console]").forEach((button) => {
    button.onclick = () => {
      state.professionalConsoleTab = button.dataset.professionalConsole;
      renderProfessionalWorkbench();
    };
  });
  const dryRun = el("professionalDryRun");
  if (dryRun) {
    dryRun.onclick = () => {
      const item = selected ? selected.name : professionalModeLabel(state.professionalMode);
      pushProfessionalConsole("DRY RUN", `${item}: ${state.locale === "zh-CN" ? "验证通过，未修改宿主工程。" : "validation passed; no host mutation performed."}`);
      renderProfessionalWorkbench();
    };
  }
  const run = el("professionalRun");
  if (run) {
    run.onclick = () => {
      if (state.professionalMode === "actions" && selected) {
        runAction(selected.id);
        return;
      }
      pushProfessionalConsole("READY", state.locale === "zh-CN" ? "当前模式仅开放 Dry Run；写入执行需要确认流程。" : "This mode currently allows Dry Run only; mutation requires confirmation.");
      renderProfessionalWorkbench();
    };
  }
}

function renderProfessionalWorkbench() {
  const workbench = el("professionalWorkbench");
  if (!workbench) return;
  const resources = professionalResources();
  const selected = selectedProfessionalResource(resources);
  document.querySelectorAll("[data-professional-mode]").forEach((button) => {
    const active = button.dataset.professionalMode === state.professionalMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
    button.textContent = professionalModeLabel(button.dataset.professionalMode);
  });
  workbench.classList.toggle("inspectorOpen", state.professionalInspectorOpen);
  workbench.classList.toggle("resourceOpen", state.professionalResourceOpen);
  el("professionalHostBar").innerHTML = professionalHostBarHtml();
  el("professionalResourceTitle").textContent = professionalModeLabel(state.professionalMode);
  el("professionalResourceMeta").textContent = `${resources.length} items`;
  el("professionalResourceList").innerHTML = professionalResourceListHtml(resources, selected);
  el("professionalStage").innerHTML = professionalStageHtml(selected);
  el("professionalInspectorTitle").textContent = state.locale === "zh-CN" ? "上下文与参数" : "Context & Parameters";
  el("professionalInspectorMeta").textContent = state.selectedHost;
  el("professionalInspectorBody").innerHTML = professionalInspectorHtml(selected);
  el("professionalConsoleBody").innerHTML = professionalConsoleHtml();
  document.querySelectorAll("[data-professional-console]").forEach((button) => {
    const active = button.dataset.professionalConsole === state.professionalConsoleTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  el("professionalProblemCount").textContent = "0";
  el("professionalInspectorToggle").setAttribute("aria-pressed", state.professionalInspectorOpen ? "true" : "false");
  el("professionalResourceToggle").setAttribute("aria-pressed", state.professionalResourceOpen ? "true" : "false");
  toggleProfessionalDiagnostics(state.professionalDiagnosticsOpen);
  setProfessionalDiagnosticsView(state.professionalDiagnosticsView);
  bindProfessionalWorkbench(resources, selected);
  mountProfessionalCodeEditor(selected);
}

function renderAnalysisWorkbench(feature, workspace) {
  workspace.setAttribute("aria-label", localText(feature.title));
  const issues = [
    ["warning", state.locale === "zh-CN" ? "表达式计算过重" : "Heavy expression evaluation", "Title_Main · Position"],
    ["error", state.locale === "zh-CN" ? "代理素材路径失效" : "Proxy path unavailable", "Footage/Game_01.mov"],
    ["info", state.locale === "zh-CN" ? "可预合成复杂图层" : "Layers can be precomposed", "Comp 01_Main"]
  ];
  workspace.innerHTML = `
    <section class="taskWorkbench analysisWorkbench">
      ${workbenchHeaderHtml(feature, `<button class="featurePrimaryButton" type="button">${state.locale === "zh-CN" ? "重新扫描" : "Rescan"}</button>`)}
      <div class="analysisSummaryBar"><strong>92</strong><span>${state.locale === "zh-CN" ? "工程健康度" : "Project health"}</span><div><button class="selected" type="button">${state.locale === "zh-CN" ? "全部 3" : "All 3"}</button><button type="button">Error 1</button><button type="button">Warning 1</button><button type="button">Info 1</button></div></div>
      <div class="analysisWorkbenchBody">
        <aside class="analysisTreePane"><header><strong>${state.locale === "zh-CN" ? "检查范围" : "Scope"}</strong></header><button class="selected" type="button" data-workbench-select>▾ Comp 01_Main <span>2</span></button><button type="button" data-workbench-select>▸ Sequence 01 <span>1</span></button><button type="button" data-workbench-select>▸ Assets <span>1</span></button><button type="button" data-workbench-select>▸ Expressions <span>1</span></button></aside>
        <main class="analysisIssueList"><div class="analysisListHeader"><span>${state.locale === "zh-CN" ? "严重级别" : "Severity"}</span><span>${state.locale === "zh-CN" ? "问题" : "Issue"}</span><span>${state.locale === "zh-CN" ? "位置" : "Location"}</span></div>${issues.map(([tone, title, location], index) => `<button class="analysisIssueRow ${index === 0 ? "selected" : ""}" type="button" data-workbench-select><span class="severity ${tone}">${tone}</span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(location)}</span></button>`).join("")}</main>
        <aside class="analysisDetailPane"><header><span>AE-EXPR-014</span><strong>${issues[0][1]}</strong></header><dl><div><dt>${state.locale === "zh-CN" ? "影响" : "Impact"}</dt><dd>${state.locale === "zh-CN" ? "预览帧率下降约 18%" : "Preview FPS reduced by about 18%"}</dd></div><div><dt>${state.locale === "zh-CN" ? "定位" : "Location"}</dt><dd>Title_Main › Position</dd></div></dl><div class="analysisFixPreview"><strong>${state.locale === "zh-CN" ? "建议" : "Recommendation"}</strong><p>${state.locale === "zh-CN" ? "缓存重复计算，并将全局扫描限制在当前合成。" : "Cache repeated calculations and limit global scans to the active composition."}</p></div><button class="featurePrimaryButton" type="button">${state.locale === "zh-CN" ? "定位到图层" : "Reveal layer"}</button><button class="featureSecondaryButton" type="button">${state.locale === "zh-CN" ? "生成修复方案" : "Generate fix"}</button></aside>
      </div>
    </section>
  `;
  bindStaticWorkbenchInteractions();
}

function renderAutomationWorkbench(feature, workspace) {
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="taskWorkbench automationWorkbench">
      ${workbenchHeaderHtml(feature, `<button class="featureSecondaryButton" type="button">Dry Run</button><button class="featurePrimaryButton" type="button">${state.locale === "zh-CN" ? "运行流程" : "Run workflow"}</button>`)}
      <div class="automationToolbar"><button type="button">＋ ${state.locale === "zh-CN" ? "步骤" : "Step"}</button><button type="button">↶</button><button type="button">↷</button><span>${state.locale === "zh-CN" ? "字幕检查流程" : "Subtitle review workflow"}</span><strong>${state.locale === "zh-CN" ? "草稿" : "Draft"}</strong></div>
      <div class="automationWorkbenchBody">
        <aside class="automationNodeLibrary"><header><strong>${state.locale === "zh-CN" ? "动作库" : "Action library"}</strong><input placeholder="${state.locale === "zh-CN" ? "搜索动作" : "Search actions"}"></header><button type="button">◎ ${state.locale === "zh-CN" ? "读取宿主上下文" : "Read host context"}</button><button type="button">◇ ${state.locale === "zh-CN" ? "条件判断" : "Condition"}</button><button type="button">AI ${state.locale === "zh-CN" ? "模型生成" : "AI generation"}</button><button type="button">✓ ${state.locale === "zh-CN" ? "人工确认" : "Approval"}</button></aside>
        <main class="automationCanvas">
          <div class="workflowNode triggerNode" style="left:6%;top:38%"><span>01</span><strong>${state.locale === "zh-CN" ? "读取字幕层" : "Read subtitles"}</strong><small>After Effects</small><i></i></div>
          <div class="workflowConnector" style="left:25%;top:47%;width:12%"></div>
          <div class="workflowNode aiNode selected" style="left:38%;top:30%"><span>02</span><strong>${state.locale === "zh-CN" ? "检查断句" : "Check line breaks"}</strong><small>Text model</small><i></i></div>
          <div class="workflowConnector" style="left:57%;top:47%;width:12%"></div>
          <div class="workflowNode approvalNode" style="left:70%;top:38%"><span>03</span><strong>${state.locale === "zh-CN" ? "人工确认" : "Approval"}</strong><small>Required</small></div>
        </main>
        <aside class="automationInspector"><header><strong>${state.locale === "zh-CN" ? "步骤设置" : "Step settings"}</strong><span>02</span></header><label><span>${state.locale === "zh-CN" ? "模型" : "Model"}</span><select><option>${escapeHtml(currentModelLabel())}</option></select></label><label><span>${state.locale === "zh-CN" ? "失败策略" : "On failure"}</span><select><option>${state.locale === "zh-CN" ? "停止流程" : "Stop workflow"}</option></select></label><label><span>${state.locale === "zh-CN" ? "输出变量" : "Output variable"}</span><input value="subtitle_review"></label></aside>
      </div>
      <div class="automationRunLog"><span>RUN LOG</span><pre>Dry Run ready · 3 steps · 1 approval gate · 0 write actions</pre></div>
    </section>
  `;
}

function renderAssetWorkbench(feature, workspace) {
  workspace.setAttribute("aria-label", localText(feature.title));
  const files = [["Game_Intro_01.mov", "Video", "184 MB"], ["Title_Logo.png", "Image", "2.4 MB"], ["Battle_Theme.wav", "Audio", "38 MB"], ["UI_Click_03.wav", "Audio", "182 KB"]];
  workspace.innerHTML = `
    <section class="taskWorkbench assetWorkbench">
      ${workbenchHeaderHtml(feature, `<button class="featureSecondaryButton" type="button">${state.locale === "zh-CN" ? "扫描缺失" : "Scan missing"}</button><button class="featurePrimaryButton" type="button">${state.locale === "zh-CN" ? "导入素材" : "Import"}</button>`)}
      <div class="assetToolbar"><button type="button">←</button><button type="button">→</button><button type="button">↑</button><div class="assetPath">Project › Assets › Campaign_01</div><input placeholder="${state.locale === "zh-CN" ? "搜索素材" : "Search assets"}"><button type="button">☷</button><button type="button">▦</button></div>
      <div class="assetWorkbenchBody">
        <aside class="assetFolderTree"><header>${state.locale === "zh-CN" ? "项目目录" : "Project folders"}</header><button class="selected" type="button" data-workbench-select>▾ Campaign_01</button><button type="button" data-workbench-select>&nbsp;&nbsp;Footage <span>42</span></button><button type="button" data-workbench-select>&nbsp;&nbsp;Images <span>58</span></button><button type="button" data-workbench-select>&nbsp;&nbsp;Audio <span>12</span></button><button type="button" data-workbench-select>&nbsp;&nbsp;Missing <span class="dangerText">1</span></button></aside>
        <main class="assetFileTable"><div class="assetTableHeader"><span></span><span>${state.locale === "zh-CN" ? "名称" : "Name"}</span><span>${state.locale === "zh-CN" ? "类型" : "Type"}</span><span>${state.locale === "zh-CN" ? "大小" : "Size"}</span><span>${state.locale === "zh-CN" ? "状态" : "Status"}</span></div>${files.map(([name, type, size], index) => `<button class="assetFileRow ${index === 0 ? "selected" : ""}" type="button" data-workbench-select><span>${type === "Video" ? "▶" : type === "Image" ? "▧" : "♪"}</span><strong>${name}</strong><span>${type}</span><span>${size}</span><span class="providerStateBadge success">OK</span></button>`).join("")}</main>
        <aside class="assetPreviewPane"><div class="assetPreviewMedia"><span>16:9</span><strong>Game_Intro_01.mov</strong></div><dl><div><dt>${state.locale === "zh-CN" ? "分辨率" : "Resolution"}</dt><dd>1920 × 1080</dd></div><div><dt>${state.locale === "zh-CN" ? "帧率" : "Frame rate"}</dt><dd>29.97 fps</dd></div><div><dt>${state.locale === "zh-CN" ? "引用" : "Used by"}</dt><dd>3 comps</dd></div><div><dt>${state.locale === "zh-CN" ? "授权" : "License"}</dt><dd>Project owned</dd></div></dl><button class="featureSecondaryButton" type="button">${state.locale === "zh-CN" ? "在资源管理器显示" : "Reveal in Explorer"}</button></aside>
      </div>
      <footer class="assetStatusBar"><span>112 ${state.locale === "zh-CN" ? "个项目" : "items"}</span><span>1.8 GB</span><span>${state.locale === "zh-CN" ? "缺失 1" : "1 missing"}</span></footer>
    </section>
  `;
  bindStaticWorkbenchInteractions();
}

function renderLibraryWorkbench(feature, workspace) {
  workspace.setAttribute("aria-label", localText(feature.title));
  const zh = state.locale === "zh-CN";
  const allItems = state.assetLibrary || [];
  const items = assetLibraryFilteredItems();
  const selected = items.find((item) => item.id === state.selectedAssetLibraryId) || items[0] || null;
  const detailPayload = state.assetLibraryDetail && selected && state.assetLibraryDetail.asset && state.assetLibraryDetail.asset.id === selected.id
    ? state.assetLibraryDetail
    : null;
  const detail = detailPayload && detailPayload.detail;
  const regenerationPlan = detailPayload ? assetLibraryRegenerationPlan(detailPayload) : null;
  const regenerationConfirmation = state.assetLibraryRegenerationConfirm
    && detailPayload
    && state.assetLibraryRegenerationConfirm.id === detailPayload.asset.id
    && state.assetLibraryRegenerationConfirm.assetType === detailPayload.asset.assetType
    ? regenerationPlan
    : null;
  const counts = {
    all: allItems.length,
    image: allItems.filter((item) => item.assetType === "image").length,
    audio: allItems.filter((item) => item.assetType === "audio").length,
    video: allItems.filter((item) => item.assetType === "video").length
  };
  const selectedDetailMedia = detail && selected
    ? (selected.assetType === "image"
      ? (safeGeneratedImageSource(detail.imageUrl) ? `<img src="${escapeHtml(safeGeneratedImageSource(detail.imageUrl))}" alt="">` : "")
      : selected.assetType === "audio"
        ? (detail.audioUrl ? `<audio controls src="${escapeHtml(detail.audioUrl)}"></audio>` : "")
        : (safeGeneratedVideoSource(detail.videoUrl) ? `<video controls preload="metadata" src="${escapeHtml(safeGeneratedVideoSource(detail.videoUrl))}"></video>` : ""))
    : "";
  const categoryButton = (id, label) => `<button class="${state.assetLibraryFilter === id ? "selected" : ""}" type="button" data-asset-library-filter="${id}">${label}<span>${counts[id]}</span></button>`;
  const listMarkup = state.assetLibraryStatus === "loading"
    ? `<div class="assetLibraryEmpty"><span class="statusDot warning"></span>${zh ? "正在读取本地资源…" : "Loading local assets…"}</div>`
    : state.assetLibraryStatus === "error"
      ? `<div class="assetLibraryEmpty"><span class="statusDot error"></span>${zh ? "资源库暂不可用" : "Asset library unavailable"}</div>`
      : !items.length
        ? `<div class="assetLibraryEmpty"><span class="statusDot muted"></span>${zh ? "没有符合条件的生成资产" : "No generated assets match this view"}</div>`
        : items.map((item) => `
          <button class="libraryItem assetLibraryItem ${selected && selected.id === item.id ? "selected" : ""}" type="button" data-asset-library-open="${escapeHtml(item.id)}">
            <span class="libraryItemPreview assetLibraryPreview"><b>${escapeHtml(assetLibraryIcon(item))}</b><small>${escapeHtml(assetLibraryStatusLabel(item.status))}</small></span>
            <strong>${escapeHtml(item.title || assetLibraryKindLabel(item))}</strong>
            <small>${escapeHtml(assetLibraryKindLabel(item))} · ${escapeHtml(imageHistoryDateLabel(item.createdAt))}</small>
            <i>${escapeHtml(item.model || item.providerId || "Local")}</i>
          </button>
        `).join("");
  const detailMarkup = !selected
    ? `<div class="assetLibraryEmpty"><span class="statusDot muted"></span>${zh ? "从左侧筛选中选择一条资产。" : "Select an asset from the list."}</div>`
    : `
      <header><span>${escapeHtml(assetLibraryIcon(selected))}</span><div><strong>${escapeHtml(selected.title || assetLibraryKindLabel(selected))}</strong><small>${escapeHtml(assetLibraryKindLabel(selected))} · ${escapeHtml(assetLibraryStatusLabel(selected.status))}</small></div></header>
      <div class="assetLibraryDetailMedia ${selectedDetailMedia ? "ready" : "empty"}">${selectedDetailMedia || `<span>${zh ? (selected.saved ? "点击打开以载入预览" : "该资源没有本地可预览文件") : (selected.saved ? "Open to load preview" : "No local preview file for this asset")}</span>`}</div>
      <dl>
        <div><dt>${zh ? "模型" : "Model"}</dt><dd>${escapeHtml(selected.model || "-")}</dd></div>
        <div><dt>${zh ? "来源" : "Provider"}</dt><dd>${escapeHtml(selected.providerId || "Local")}</dd></div>
        <div><dt>${zh ? "文件" : "File"}</dt><dd>${escapeHtml(selected.fileName || "-")}</dd></div>
        <div><dt>${zh ? "大小" : "Size"}</dt><dd>${escapeHtml(imageHistoryStorageLabel(selected.bytes))}</dd></div>
      </dl>
      <div class="assetLibraryActions">
        <button class="featureSecondaryButton" type="button" data-asset-library-preview="${escapeHtml(selected.id)}">${detailPayload ? (zh ? "刷新预览" : "Refresh preview") : (zh ? "打开预览" : "Open preview")}</button>
        <button class="featureSecondaryButton" type="button" data-asset-library-download="${escapeHtml(selected.id)}" ${selected.saved && detailPayload ? "" : "disabled"}>${zh ? "下载" : "Download"}</button>
        <button class="featureSecondaryButton" type="button" data-asset-library-restore="${escapeHtml(selected.id)}" ${detailPayload ? "" : "disabled"}>${zh ? "恢复到创作页" : "Restore to create"}</button>
        <button class="featurePrimaryButton assetLibraryRegenerateButton" type="button" data-asset-library-regenerate="${escapeHtml(selected.id)}" ${detailPayload ? "" : "disabled"}>${zh ? "恢复并再次生成" : "Restore & generate"}</button>
        <button class="featureSecondaryButton dangerButton" type="button" data-asset-library-delete="${escapeHtml(selected.id)}">${zh ? "删除" : "Delete"}</button>
      </div>
    `;
  workspace.innerHTML = `
    <section class="taskWorkbench libraryWorkbench">
      ${workbenchHeaderHtml(feature, `<button class="featureSecondaryButton" id="refreshAssetLibraryButton" type="button">${zh ? "刷新资源" : "Refresh assets"}</button>`)}
      <div class="libraryToolbar assetLibraryToolbar"><input id="assetLibraryQuery" value="${escapeHtml(state.assetLibraryQuery)}" placeholder="${zh ? "搜索图片、音乐、配音或视频资产" : "Search images, music, voice, or video assets"}"><span>${zh ? `${items.length} 条结果` : `${items.length} results`}</span></div>
      ${state.assetLibraryNotice ? `<div class="assetLibraryNotice">${escapeHtml(state.assetLibraryNotice)}</div>` : ""}
      <div class="libraryWorkbenchBody assetLibraryWorkbenchBody"><aside class="libraryCategoryPane"><header>${zh ? "资产类型" : "Asset type"}</header>${categoryButton("all", zh ? "全部资产" : "All assets")}${categoryButton("image", zh ? "图片" : "Images")}${categoryButton("audio", zh ? "音频" : "Audio")}${categoryButton("video", zh ? "视频" : "Video")}</aside><main class="libraryItemGrid assetLibraryGrid">${listMarkup}</main><aside class="libraryDetailPane assetLibraryDetailPane">${detailMarkup}</aside></div>
    </section>
    ${regenerationConfirmation ? `
      <div class="assetLibraryRegenerateBackdrop" role="presentation">
        <section class="assetLibraryRegenerateDialog" id="assetLibraryRegenerateDialog" role="dialog" aria-modal="true" aria-labelledby="assetLibraryRegenerateTitle" tabindex="-1">
          <div><p>${zh ? "新的生成请求" : "New generation request"}</p><h3 id="assetLibraryRegenerateTitle">${zh ? "恢复并再次生成？" : "Restore and generate again?"}</h3><span>${escapeHtml(regenerationConfirmation.title)}</span></div>
          <dl>
            <div><dt>${zh ? "能力" : "Capability"}</dt><dd>${escapeHtml(providerCapabilityLabel(regenerationConfirmation.capability))}</dd></div>
            <div><dt>Provider</dt><dd>${escapeHtml(providerLabel(regenerationConfirmation.binding.providerId))}</dd></div>
            <div><dt>Model</dt><dd>${escapeHtml(providerModelLabel(regenerationConfirmation.binding.providerId, regenerationConfirmation.binding.model))}</dd></div>
            <div><dt>${zh ? "请求接口" : "Request route"}</dt><dd><code>${escapeHtml(regenerationConfirmation.route)}</code></dd></div>
          </dl>
          <div class="assetLibraryRegenerateWarning"><strong>${zh ? "确认后将提交新的真实生成请求，可能消耗你的 Provider 配额或产生费用。" : "Confirming submits a new live generation request that may consume provider quota or incur charges."}</strong><span>${regenerationConfirmation.ready ? (zh ? "仅恢复本地参数；不会复用旧结果。" : "Only local parameters are restored; the old result is not reused.") : `${escapeHtml(capabilityConnectionLabel(regenerationConfirmation.capability))}：${escapeHtml(capabilityConnectionDetail(regenerationConfirmation.capability))}`}</span></div>
          <div class="assetLibraryRegenerateActions"><button class="featureSecondaryButton" id="cancelAssetLibraryRegenerateButton" type="button">${zh ? "取消" : "Cancel"}</button><button class="featurePrimaryButton" id="confirmAssetLibraryRegenerateButton" type="button" ${regenerationConfirmation.ready ? "" : "disabled"}>${zh ? "确认并生成" : "Confirm & generate"}</button></div>
        </section>
      </div>
    ` : ""}
  `;
  document.querySelector("#refreshAssetLibraryButton")?.addEventListener("click", () => void loadAssetLibrary());
  document.querySelector("#assetLibraryQuery")?.addEventListener("input", (event) => {
    state.assetLibraryQuery = event.target.value;
    renderLibraryWorkbench(feature, workspace);
    el("assetLibraryQuery")?.focus();
  });
  document.querySelectorAll("[data-asset-library-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.assetLibraryFilter = button.dataset.assetLibraryFilter || "all";
      state.assetLibraryDetail = null;
      state.assetLibraryRegenerationConfirm = null;
      renderLibraryWorkbench(feature, workspace);
    });
  });
  document.querySelectorAll("[data-asset-library-open], [data-asset-library-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = (state.assetLibrary || []).find((candidate) => candidate.id === button.dataset.assetLibraryOpen || candidate.id === button.dataset.assetLibraryPreview);
      if (item) void loadAssetLibraryDetail(item);
    });
  });
  document.querySelectorAll("[data-asset-library-download]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = (state.assetLibrary || []).find((candidate) => candidate.id === button.dataset.assetLibraryDownload);
      if (item && state.assetLibraryDetail?.asset?.id === item.id) downloadAssetLibraryItem();
    });
  });
  document.querySelectorAll("[data-asset-library-restore]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = (state.assetLibrary || []).find((candidate) => candidate.id === button.dataset.assetLibraryRestore);
      if (item && state.assetLibraryDetail?.asset?.id === item.id) restoreAssetLibraryItem();
    });
  });
  document.querySelectorAll("[data-asset-library-regenerate]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = (state.assetLibrary || []).find((candidate) => candidate.id === button.dataset.assetLibraryRegenerate);
      if (item && state.assetLibraryDetail?.asset?.id === item.id) requestAssetLibraryRegeneration();
    });
  });
  el("cancelAssetLibraryRegenerateButton")?.addEventListener("click", cancelAssetLibraryRegeneration);
  el("confirmAssetLibraryRegenerateButton")?.addEventListener("click", confirmAssetLibraryRegeneration);
  el("assetLibraryRegenerateDialog")?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cancelAssetLibraryRegeneration();
  });
  document.querySelector(".assetLibraryRegenerateBackdrop")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) cancelAssetLibraryRegeneration();
  });
  document.querySelectorAll("[data-asset-library-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = (state.assetLibrary || []).find((candidate) => candidate.id === button.dataset.assetLibraryDelete);
      if (item) void deleteAssetLibraryItem(item);
    });
  });
}

function renderHistoryWorkbench(feature, workspace) {
  workspace.setAttribute("aria-label", localText(feature.title));
  const rows = [["14:32", "文案创作", "生成", "GPT-5.5", "success"], ["14:28", "智能翻译", "翻译", "company-chat", "success"], ["14:15", "表达式", "生成", "GPT-5.5", "warning"], ["13:54", "自动化流程", "Dry Run", "Local", "success"], ["13:20", "模型平台", "刷新模型", "OpenAI Compatible", "error"]];
  workspace.innerHTML = `
    <section class="taskWorkbench historyWorkbench">
      ${workbenchHeaderHtml(feature, `<button class="featureSecondaryButton" type="button">${state.locale === "zh-CN" ? "导出记录" : "Export"}</button>`)}
      <div class="historyFilterBar"><input placeholder="${state.locale === "zh-CN" ? "搜索操作、模型或结果" : "Search action, model, or result"}"><select><option>${state.locale === "zh-CN" ? "所有功能" : "All features"}</option></select><select><option>${state.locale === "zh-CN" ? "所有状态" : "All statuses"}</option></select><input type="date"><button type="button">${state.locale === "zh-CN" ? "清除" : "Clear"}</button></div>
      <div class="historyWorkbenchBody"><main class="historyAuditTable"><div class="historyAuditHeader"><span>${state.locale === "zh-CN" ? "时间" : "Time"}</span><span>${state.locale === "zh-CN" ? "功能" : "Feature"}</span><span>${state.locale === "zh-CN" ? "操作" : "Action"}</span><span>${state.locale === "zh-CN" ? "模型 / 服务" : "Model / Service"}</span><span>${state.locale === "zh-CN" ? "状态" : "Status"}</span></div>${rows.map(([time, page, action, model, status], index) => `<button class="historyAuditRow ${index === 0 ? "selected" : ""}" type="button" data-workbench-select><span>${time}</span><strong>${page}</strong><span>${action}</span><span>${model}</span><span class="providerStateBadge ${status}">${status}</span></button>`).join("")}</main><aside class="historyDetailPane"><header><span>op_20260713_1432</span><strong>${state.locale === "zh-CN" ? "文案生成完成" : "Copy generation completed"}</strong></header><dl><div><dt>Provider</dt><dd>OpenAI Compatible</dd></div><div><dt>Model</dt><dd>gpt-5.5</dd></div><div><dt>Duration</dt><dd>13.29s</dd></div><div><dt>Tokens</dt><dd>842</dd></div></dl><div class="historyResultPreview"><strong>${state.locale === "zh-CN" ? "结果摘要" : "Result summary"}</strong><p>5 ${state.locale === "zh-CN" ? "组短标题，语气直接，适合竖屏开头。" : "short title variants for vertical video openings."}</p></div><button class="featurePrimaryButton" type="button">${state.locale === "zh-CN" ? "再次运行" : "Run again"}</button><button class="featureSecondaryButton" type="button">${state.locale === "zh-CN" ? "查看完整结果" : "View full result"}</button></aside></div>
    </section>
  `;
  bindStaticWorkbenchInteractions();
}

function bindStaticWorkbenchInteractions() {
  document.querySelectorAll("[data-workbench-select]").forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.parentElement;
      parent?.querySelectorAll("[data-workbench-select]").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
    });
  });
}

function renderFeatureWorkspace() {
  const feature = featurePages[state.activeView];
  const workspace = el("featureWorkspace");
  if (!feature) {
    workspace.innerHTML = "";
    return;
  }
  switch (state.activeView) {
    case "provider-hub": renderProviderHubWorkspaceV2(feature, workspace); return;
    case "system": renderSystemSettingsWorkspace(feature, workspace); return;
    case "copilot": renderAssistantWorkbench(feature, workspace); return;
    case "create": renderDocumentWorkbench(feature, workspace, "create"); return;
    case "copy": renderDocumentWorkbench(feature, workspace, "copy"); return;
    case "translate": renderTranslationWorkbench(feature, workspace); return;
    case "storyboard": renderStoryboardWorkbench(feature, workspace); return;
    case "motion": renderMotionWorkbench(feature, workspace); return;
    case "expression": renderCodeWorkbench(feature, workspace, "expression"); return;
    case "script": renderCodeWorkbench(feature, workspace, "script"); return;
    case "analyze": renderAnalysisWorkbench(feature, workspace); return;
    case "automate": renderAutomationWorkbench(feature, workspace); return;
    case "assets": renderAssetWorkbench(feature, workspace); return;
    case "library":
      renderLibraryWorkbench(feature, workspace);
      if (state.assetLibraryStatus === "idle") void loadAssetLibrary();
      return;
    case "history": renderHistoryWorkbench(feature, workspace); return;
    default: workspace.innerHTML = "";
  }
}

function providerCapabilityChipsHtml() {
  return providerCapabilities.map((capability) => {
    const active = currentProvider().categories.includes(capability.id);
    return `<button class="providerCapabilityChip ${active ? "active" : ""}" type="button">${escapeHtml(localText(capability.label))}</button>`;
  }).join("");
}

function providerPlatformCardsHtml() {
  return providerCatalog.map((provider) => {
    const selected = provider.id === state.providerConfig.providerId;
    const tags = provider.categories.map((id) => {
      const item = providerCapabilities.find((capability) => capability.id === id);
      return `<span>${escapeHtml(item ? localText(item.label) : id)}</span>`;
    }).join("");
    return `
      <button class="providerPlatformCard ${selected ? "selected" : ""}" type="button" data-provider-card="${escapeHtml(provider.id)}" aria-pressed="${selected ? "true" : "false"}">
        <span class="providerPlatformTop">
          <strong>${escapeHtml(provider.label)}</strong>
          <small>${escapeHtml(provider.status)}</small>
        </span>
        <span class="providerPlatformMeta">${escapeHtml(provider.protocol)} · ${escapeHtml(provider.auth)}</span>
        <span class="providerPlatformTags">${tags}</span>
      </button>
    `;
  }).join("");
}

function providerModelRowsHtml() {
  const models = currentProviderModels();
  if (!models.length) {
    return `<div class="providerModelEmpty">${state.locale === "zh-CN" ? "暂无模型，请刷新或检查平台配置。" : "No models yet. Refresh or check provider config."}</div>`;
  }
  return models.map((model) => {
    const selected = model.id === state.providerConfig.model;
    const tags = (model.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
      <button class="providerModelRow ${selected ? "selected" : ""}" type="button" data-provider-model="${escapeHtml(model.id)}">
        <span>
          <strong>${escapeHtml(model.label)}</strong>
          <small>${escapeHtml(model.id)}</small>
        </span>
        <span class="providerModelTags">${tags}</span>
      </button>
    `;
  }).join("");
}

function renderProviderHubWorkspace(feature, workspace) {
  const provider = currentProvider();
  const models = currentProviderModels();
  const providerOptions = providerCatalog.map((item) => `
    <option value="${escapeHtml(item.id)}" ${item.id === state.providerConfig.providerId ? "selected" : ""}>${escapeHtml(item.label)}</option>
  `).join("");
  const modelOptions = models.map((item) => `
    <option value="${escapeHtml(item.id)}" ${item.id === state.providerConfig.model ? "selected" : ""}>${escapeHtml(item.label)}</option>
  `).join("");
  const metrics = [
    ["Provider", provider.label],
    ["Model", currentModelLabel()],
    ["Status", providerStatusLabel()]
  ].map(([label, value]) => `
    <div class="featureMetric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
  const taskBindings = providerCapabilityBindingsHtml();
  const recentRows = feature.historyRows.map((row) => `
    <button class="featureHistoryRow" type="button">
      <span class="utilityIcon">${navIconSvg(feature.icon)}</span>
      <span>${escapeHtml(row)}</span>
      <small>${state.locale === "zh-CN" ? "最近" : "recent"}</small>
    </button>
  `).join("");
  const apiKeyStatusText = state.providerConfig.apiKeyStatus && state.providerConfig.apiKeyStatus.configured
    ? `${state.locale === "zh-CN" ? "已配置" : "Configured"} ${state.providerConfig.apiKeyStatus.preview || ""}`.trim()
    : (state.locale === "zh-CN" ? "未配置" : "Not configured");
  const apiKeyPlaceholder = state.providerConfig.apiKeyStatus && state.providerConfig.apiKeyStatus.configured
    ? (state.locale === "zh-CN" ? "留空表示继续使用已保存 Key" : "Leave blank to keep saved key")
    : (state.locale === "zh-CN" ? "输入 Key 后保存到 Local Service" : "Enter key to save via Local Service");
  const secretStore = (state.providerProfile && state.providerProfile.secretStore) || {};
  const secretStoreStatus = secretStore.backend === "windows-dpapi"
    ? `${state.locale === "zh-CN" ? "Windows DPAPI · 当前用户 · 已加密" : "Windows DPAPI · Current user · Encrypted"}`
    : (state.locale === "zh-CN" ? "需要 Local Service" : "Local Service required");
  const isOpenAICompatible = provider.id === "openai-compatible";
  const isOpenAI = provider.id === "openai";
  const connectionConfigSubtitle = isOpenAI
    ? (state.locale === "zh-CN" ? "Base URL、API Key、Organization、模型刷新" : "Base URL, API key, organization, and model refresh")
    : (state.locale === "zh-CN" ? "Base URL、API Key、模型刷新" : "Base URL, API key, and model refresh");
  const capabilityOptions = providerCapabilities.map((capability) => {
    const checked = normalizeProviderCapabilities(state.providerConfig.defaultCapabilities).includes(capability.id);
    return `
      <label class="providerCapabilityOption">
        <input type="checkbox" data-provider-default-capability="${escapeHtml(capability.id)}" ${checked ? "checked" : ""}>
        <span>${escapeHtml(localText(capability.label))}</span>
      </label>
    `;
  }).join("");
  const advancedConfig = isOpenAICompatible ? `
    <details class="providerAdvancedConfig" open>
      <summary>${state.locale === "zh-CN" ? "OpenAI Compatible 高级配置" : "OpenAI Compatible advanced config"}</summary>
      <div class="providerAdvancedGrid">
        <label>
          <span>${state.locale === "zh-CN" ? "模型列表路径" : "Models path"}</span>
          <input id="providerModelsPath" type="text" value="${escapeHtml(state.providerConfig.modelsPath || "/models")}" placeholder="/models" spellcheck="false">
        </label>
        <label>
          <span>${state.locale === "zh-CN" ? "文本生成路径" : "Chat path"}</span>
          <input id="providerChatPath" type="text" value="${escapeHtml(state.providerConfig.chatPath || "/chat/completions")}" placeholder="/chat/completions" spellcheck="false">
        </label>
        <label>
          <span>${state.locale === "zh-CN" ? "请求超时（秒）" : "Request timeout (seconds)"}</span>
          <input id="providerTimeoutSeconds" type="number" min="1" max="180" step="1" value="${escapeHtml(String(state.providerConfig.timeoutSeconds || 120))}">
        </label>
        <label class="providerHeadersField">
          <span>${state.locale === "zh-CN" ? "自定义请求头" : "Custom headers"}</span>
          <textarea id="providerCustomHeaders" rows="4" placeholder="X-Organization: kuroii-motion" spellcheck="false">${escapeHtml(state.providerConfig.customHeadersText || "")}</textarea>
          <small>${state.locale === "zh-CN" ? "每行一个 Header。Authorization 由 API Key 自动生成，不会保存或覆盖。" : "One header per line. Authorization is generated from the API key and is never saved or overridden."}</small>
        </label>
        <fieldset class="providerCapabilityOptions">
          <legend>${state.locale === "zh-CN" ? "模型未声明能力时的默认标签" : "Fallback capability tags"}</legend>
          <div>${capabilityOptions}</div>
        </fieldset>
      </div>
    </details>
  ` : "";
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="featureHero">
      <div class="featureHeroText">
        <span class="featureEyebrow">${escapeHtml(localText(feature.eyebrow))}</span>
        <h2>${escapeHtml(localText(feature.title))}</h2>
        <p>${escapeHtml(localText(feature.intro))}</p>
      </div>
      <div class="featureMetricGrid" aria-label="Provider status">${metrics}</div>
    </section>
    <section class="providerHubGrid">
      <section class="featurePanel providerCapabilityPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${state.locale === "zh-CN" ? "能力分类" : "Capability Types"}</h3>
            <span>${state.locale === "zh-CN" ? "语言、图片、视频、语音和本地模型" : "Text, image, video, voice, and local models"}</span>
          </div>
        </div>
        <div class="providerCapabilityGrid">${providerCapabilityChipsHtml()}</div>
      </section>
      <section class="featurePanel providerPlatformPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${state.locale === "zh-CN" ? "平台列表" : "Providers"}</h3>
            <span>${state.locale === "zh-CN" ? "选择平台后配置和刷新模型" : "Select a provider to configure and refresh models"}</span>
          </div>
        </div>
        <div class="providerPlatformList">${providerPlatformCardsHtml()}</div>
      </section>
      <section class="featurePanel providerConfigPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${state.locale === "zh-CN" ? "连接配置" : "Connection Config"}</h3>
            <span>${connectionConfigSubtitle}</span>
          </div>
          <span class="featureModeBadge">${state.serviceOnline ? "Service" : "Mock"}</span>
        </div>
        <div class="providerForm">
          <label>
            <span>Provider</span>
            <select id="providerSelect">${providerOptions}</select>
          </label>
          <label>
            <span>Base URL</span>
            <input id="providerBaseUrl" type="url" value="${escapeHtml(state.providerConfig.baseUrl)}" spellcheck="false">
          </label>
          <label>
            <span>API Key</span>
            <div class="providerApiKeyRow">
              <input id="providerApiKey" type="password" value="${escapeHtml(state.providerConfig.apiKeyDraft || "")}" placeholder="${escapeHtml(apiKeyPlaceholder)}" autocomplete="off" spellcheck="false">
              <button class="featureSecondaryButton providerApiKeySaveButton" id="saveProviderApiKeyButton" type="button" ${state.providerConfig.apiKeySaveState === "saving" ? "disabled" : ""}>${state.providerConfig.apiKeySaveState === "saving" ? (state.locale === "zh-CN" ? "保存中" : "Saving") : (state.locale === "zh-CN" ? "保存" : "Save")}</button>
            </div>
          </label>
          ${isOpenAI ? `
            <label>
              <span>OpenAI Organization</span>
              <input id="providerOrganization" type="text" value="${escapeHtml(state.providerConfig.organization || "")}" placeholder="org-..." autocomplete="off" spellcheck="false">
            </label>
          ` : ""}
          <label>
            <span>${state.locale === "zh-CN" ? "模型" : "Model"}</span>
            <div class="modelSelectRow">
              <select id="providerModelSelect">${modelOptions}</select>
              <button class="iconButton modelRefreshButton" id="refreshModelsButton" type="button" aria-label="${state.locale === "zh-CN" ? "刷新模型列表" : "Refresh model list"}" data-tooltip="${state.locale === "zh-CN" ? "刷新模型列表" : "Refresh models"}">
                <svg class="buttonSvg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 7v5h-5"></path>
                  <path d="M4 17v-5h5"></path>
                  <path d="M18.2 9A7 7 0 0 0 6.6 6.6L4 9"></path>
                  <path d="M5.8 15A7 7 0 0 0 17.4 17.4L20 15"></path>
                </svg>
              </button>
            </div>
          </label>
          ${advancedConfig}
          <div class="providerFormActions">
            <button class="featurePrimaryButton" id="testProviderButton" type="button">${state.locale === "zh-CN" ? "测试连接" : "Test Connection"}</button>
            <button class="featureSecondaryButton" id="saveProviderButton" type="button">${state.locale === "zh-CN" ? "保存设置" : "Save Settings"}</button>
          </div>
        </div>
      </section>
      <section class="featurePanel providerModelDiscoveryPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${state.locale === "zh-CN" ? "模型发现" : "Model Discovery"}</h3>
            <span>${state.locale === "zh-CN" ? "按平台返回的可用模型选择默认模型" : "Choose the default model from provider results"}</span>
          </div>
        </div>
        <div class="providerModelList">${providerModelRowsHtml()}</div>
      </section>
      <aside class="featurePanel providerStatusPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${state.locale === "zh-CN" ? "当前配置" : "Current Config"}</h3>
            <span>${state.locale === "zh-CN" ? "功能页读取此处模型" : "Feature pages read this model"}</span>
          </div>
        </div>
        <dl class="providerConfigSummary">
          <div><dt>Provider</dt><dd>${escapeHtml(provider.label)}</dd></div>
          <div><dt>Protocol</dt><dd>${escapeHtml(provider.protocol)}</dd></div>
          <div><dt>Auth</dt><dd>${escapeHtml(provider.auth)}</dd></div>
          <div><dt>API Key</dt><dd>${escapeHtml(apiKeyStatusText)}</dd></div>
          <div><dt>${state.locale === "zh-CN" ? "密钥存储" : "Secret Store"}</dt><dd>${escapeHtml(secretStoreStatus)}</dd></div>
          ${isOpenAI && state.providerConfig.organization ? `<div><dt>Organization</dt><dd>${escapeHtml(state.providerConfig.organization)}</dd></div>` : ""}
          <div><dt>Model</dt><dd>${escapeHtml(currentModelLabel())}</dd></div>
          ${isOpenAICompatible ? `
            <div><dt>${state.locale === "zh-CN" ? "模型路径" : "Models path"}</dt><dd>${escapeHtml(state.providerConfig.modelsPath || "/models")}</dd></div>
            <div><dt>${state.locale === "zh-CN" ? "生成路径" : "Chat path"}</dt><dd>${escapeHtml(state.providerConfig.chatPath || "/chat/completions")}</dd></div>
            <div><dt>${state.locale === "zh-CN" ? "超时" : "Timeout"}</dt><dd>${escapeHtml(String(state.providerConfig.timeoutSeconds || 120))}s</dd></div>
          ` : ""}
          <div><dt>${state.locale === "zh-CN" ? "来源" : "Source"}</dt><dd>${escapeHtml(state.providerConfig.source)}</dd></div>
          <div><dt>${state.locale === "zh-CN" ? "阶段" : "Stage"}</dt><dd>${escapeHtml(state.providerConfig.stage)}</dd></div>
          <div><dt>${state.locale === "zh-CN" ? "上次刷新" : "Last refresh"}</dt><dd>${escapeHtml(state.providerConfig.lastRefresh)}</dd></div>
          <div><dt>${state.locale === "zh-CN" ? "上次测试" : "Last test"}</dt><dd>${escapeHtml(state.providerConfig.lastTest)}</dd></div>
          <div><dt>${state.locale === "zh-CN" ? "存储" : "Storage"}</dt><dd>${escapeHtml((state.providerProfile && state.providerProfile.storage) || state.providerConfig.source)}</dd></div>
          <div><dt>${state.locale === "zh-CN" ? "接入说明" : "Guide"}</dt><dd>${escapeHtml(provider.guide)}</dd></div>
        </dl>
      </aside>
      <section class="featurePanel providerGuidancePanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${state.locale === "zh-CN" ? "错误处理建议" : "Recovery Guidance"}</h3>
            <span>${state.locale === "zh-CN" ? "为真实 Provider 接入预留" : "Ready for live provider wiring"}</span>
          </div>
        </div>
        ${providerGuidanceHtml()}
      </section>
      <section class="featurePanel providerBindingPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${escapeHtml(localText(feature.sideTitle))}</h3>
            <span>${state.locale === "zh-CN" ? "功能页按能力读取默认 Provider / Model" : "Feature pages read defaults by capability"}</span>
          </div>
        </div>
        <ul class="providerBindingList">${taskBindings}</ul>
      </section>
      <section class="featurePanel featureHistoryPanel">
        <div class="featurePanelHeader">
          <div>
            <h3>${escapeHtml(localText(feature.historyTitle))}</h3>
            <span>${state.locale === "zh-CN" ? "本地预览数据" : "Local preview data"}</span>
          </div>
        </div>
        <div class="featureHistoryList">${recentRows}</div>
      </section>
    </section>
  `;
  bindProviderSettingsWorkspace();
}

function providerHubFeedbackHtml() {
  if (!state.providerConfig.message) return "";
  const tone = state.providerConfig.status === "error"
    ? "error"
    : (state.providerConfig.status === "saved" || state.providerConfig.apiKeySaveState === "saved" ? "success" : "info");
  const advice = (state.providerConfig.advice || []).map((item) => {
    const label = item.labelZh || item.labelEn || item.descriptionZh || item.descriptionEn || item;
    return `<li>${escapeHtml(label)}</li>`;
  }).join("");
  return `
    <div class="providerInlineFeedback ${tone}" role="${tone === "error" ? "alert" : "status"}" aria-live="${tone === "error" ? "assertive" : "polite"}">
      <strong>${escapeHtml(providerStatusLabel())}</strong>
      <span>${escapeHtml(state.providerConfig.message)}</span>
      ${advice ? `<ul>${advice}</ul>` : ""}
    </div>
  `;
}

function providerProfileListHtml() {
  const instances = Object.values(state.providerProfile.profileInstances || {});
  const pending = providerOperationPending();
  if (!instances.length) {
    return `<div class="providerProfileEmpty">${state.locale === "zh-CN" ? "还没有配置。" : "No profiles yet."}</div>`;
  }
  return instances.map((item) => {
    const selected = item.profileId === state.providerConfig.profileId;
    const keyConfigured = Boolean(item.apiKeyStatus && item.apiKeyStatus.configured);
    const modelCount = Array.isArray(item.models) ? item.models.length : 0;
    return `
      <button class="providerProfileItem ${selected ? "selected" : ""}" type="button" data-provider-profile-id="${escapeHtml(item.profileId)}" aria-pressed="${selected ? "true" : "false"}" ${pending ? "disabled" : ""}>
        <span class="providerProfileItemTop">
          <strong>${escapeHtml(item.name || providerLabel(item.providerId))}</strong>
          <span class="statusDot ${keyConfigured ? "success" : "warning"}"></span>
        </span>
        <span>${escapeHtml(providerLabel(item.providerId))}</span>
        <small>${modelCount} ${state.locale === "zh-CN" ? "个模型" : "models"}</small>
      </button>
    `;
  }).join("");
}

function providerIntegrationGuideHtml(provider) {
  const zh = state.locale === "zh-CN";
  const modelListPath = state.providerConfig.modelsPath || "/models";
  const chatPath = state.providerConfig.chatPath || "/chat/completions";
  const imagesPath = state.providerConfig.imagesPath || "/images/generations";
  const videoPath = state.providerConfig.videoPath || "/videos/generations";
  const videoStatusPath = state.providerConfig.videoStatusPath || "/videos/generations/{taskId}";
  const rows = [];
  let summary = "";
  let tone = "ready";

  if (!providerCanBeConfigured(provider)) {
    tone = "planned";
    summary = zh
      ? "这是产品路线占位项，不是可填写的供应商配置。"
      : "This is a roadmap placeholder, not a configurable provider.";
    rows.push(
      { label: zh ? "接入方式" : "Integration", path: zh ? "专用 Adapter" : "Dedicated adapter", detail: zh ? "需要新增 Provider Manifest、密钥策略、模型目录与服务端任务适配器。" : "Requires a provider manifest, secret policy, model catalog, and server task adapter." },
      { label: zh ? "视频任务" : "Video task", path: "submit → poll → file download", detail: zh ? "异步视频至少需要提交、状态轮询、取消（如平台支持）和成片下载的完整协议。" : "Async video needs submit, status polling, optional cancellation, and final file download." },
      { label: zh ? "音频任务" : "Audio task", path: "generate / stream → local asset", detail: zh ? "音乐、配音和音效需按供应商实际回包解析，再落盘为本地资产；不能复用语言模型接口。" : "Music, voice, and SFX need provider-specific response parsing and local asset storage; language endpoints cannot be reused." }
    );
  } else if (provider.id === "minimax") {
    summary = zh
      ? "MiniMax 使用原生任务协议；模型来自内置目录，不会把生成接口当作 /models。"
      : "MiniMax uses native task contracts and an internal catalog; generation endpoints are never treated as /models.";
    rows.push(
      { label: zh ? "模型发现" : "Model discovery", path: "catalog", detail: zh ? "内置目录按已支持模型族更新；不填写也不请求 /models。" : "Uses the supported-model catalog; it never calls /models." },
      { label: zh ? "图片" : "Image", path: "POST /v1/image_generation", detail: zh ? "绑定 image-01 / image-01-live 等图片模型。" : "Bind an image model such as image-01 or image-01-live." },
      { label: zh ? "音乐" : "Music", path: "POST /v1/music_generation", detail: zh ? "只绑定音乐模型；真实音频回包才会保存为本地资产。" : "Bind a music model only; only real audio responses are saved locally." },
      { label: zh ? "配音" : "Voice", path: "POST /v1/t2a_v2", detail: zh ? "需要有效 voice_id，语言模型不能替代音色模型。" : "Requires a valid voice_id; a language model cannot substitute for a voice model." },
      { label: zh ? "视频" : "Video", path: "POST /v1/video_generation → GET /v1/query/video_generation → GET /v1/files/retrieve", detail: zh ? "异步任务必须完成轮询并下载到本地，才会显示为成片。" : "The async task must be polled and downloaded locally before it is shown as a completed video." }
    );
  } else if (provider.id === "openai-compatible") {
    summary = zh
      ? "聚合/中转平台必须分别提供模型列表与任务端点，并返回当前适配器能够解析的 OpenAI Compatible JSON。"
      : "Aggregators must expose separate model discovery and task endpoints, returning OpenAI Compatible JSON that this adapter can parse.";
    rows.push(
      { label: zh ? "模型发现" : "Model discovery", path: `GET ${modelListPath}`, detail: zh ? "必须返回模型数组；生成接口不能作为模型列表接口。" : "Must return a model array; a generation endpoint is not a model-list endpoint." },
      { label: zh ? "文本" : "Text", path: `POST ${chatPath}`, detail: zh ? "要求 Chat Completions 请求和响应结构。" : "Requires Chat Completions request and response shapes." },
      { label: zh ? "图片" : "Image", path: `POST ${imagesPath}`, detail: zh ? "需要 OpenAI Images 类型回包，并为图片模型标记 image 能力。" : "Needs an OpenAI Images-style response and an image capability tag on the model." },
      { label: zh ? "视频" : "Video", path: `POST ${videoPath} → GET ${videoStatusPath}`, detail: zh ? "仅在平台返回可轮询 task id、状态和可下载文件时可绑定 video。" : "Bind video only when the provider returns a pollable task id, status, and downloadable file." }
    );
  } else if (provider.id === "custom-base-url") {
    summary = zh
      ? "自定义平台目前按 OpenAI Compatible 的模型发现、文本和图片契约接入；视频、音乐和配音需要专用 Adapter。"
      : "Custom Base URL currently follows OpenAI Compatible contracts for discovery, text, and image; video, music, and voice need dedicated adapters.";
    rows.push(
      { label: zh ? "模型发现" : "Model discovery", path: `GET ${modelListPath}`, detail: zh ? "必须返回模型数组，不接受生成接口。" : "Must return a model array, not a generation response." },
      { label: zh ? "文本" : "Text", path: "POST /chat/completions", detail: zh ? "模型需要标记 text / vision 能力。" : "Models must be tagged text or vision." },
      { label: zh ? "图片" : "Image", path: "POST /images/generations", detail: zh ? "模型需要标记 image 能力并返回可保存的图片数据。" : "Models must be tagged image and return savable image data." },
      { label: zh ? "未接通" : "Not wired", path: zh ? "视频 / 音乐 / 配音" : "Video / music / voice", detail: zh ? "这些任务不能仅靠 Base URL 和能力标签启用。" : "These tasks cannot be enabled by Base URL and capability tags alone." }
    );
  } else if (provider.id === "deepseek") {
    summary = zh
      ? "当前内置目录仅将 DeepSeek 用于语言任务；不要把可返回的语言模型误标为图片、视频或音频模型。"
      : "The current catalog uses DeepSeek for text tasks only; do not tag a language model as image, video, or audio.";
    rows.push(
      { label: zh ? "模型发现" : "Model discovery", path: "GET /models", detail: zh ? "刷新后按实际模型列表选择。" : "Choose from the refreshed live model list." },
      { label: zh ? "文本" : "Text", path: "POST /chat/completions", detail: zh ? "要求 Chat Completions 兼容结构。" : "Requires a Chat Completions-compatible shape." },
      { label: zh ? "未接通" : "Not wired", path: zh ? "图片 / 视频 / 音乐 / 配音" : "Image / video / music / voice", detail: zh ? "当前 Provider 目录和任务适配器未声明这些能力。" : "The current provider catalog and task adapter do not declare these capabilities." }
    );
  } else if (provider.id === "ollama" || provider.id === "lm-studio") {
    summary = zh
      ? "本地平台用于本机模型发现与调试；当前没有内容生成任务 Adapter，因此不能把本地模型绑定为可生成能力。"
      : "Local providers are for on-device discovery and debugging; no content-generation task adapter is currently wired, so local models cannot bind generation capabilities.";
    rows.push(
      { label: zh ? "本地地址" : "Local endpoint", path: provider.baseUrl, detail: zh ? "仅连接受控的本机服务，不需要远程 API Key。" : "Connects to a controlled local service and needs no remote API key." },
      { label: zh ? "运行时状态" : "Runtime state", path: zh ? "仅目录 / 调试" : "Catalog / debug only", detail: zh ? "须先实现本地模型的文本、图片或视频专用任务 Adapter，才会开放能力绑定。" : "A dedicated local text, image, or video task adapter is required before capability binding opens." }
    );
  } else {
    summary = zh
      ? "该平台使用 OpenAI 任务兼容层；模型、能力标签和返回结构必须与选择的任务一致。"
      : "This provider uses the OpenAI task compatibility layer; model tags and responses must match the selected task.";
    rows.push(
      { label: zh ? "模型发现" : "Model discovery", path: "GET /models", detail: zh ? "返回模型数组后再选择默认模型。" : "Return a model array before choosing a default model." },
      { label: zh ? "文本" : "Text", path: "POST /chat/completions", detail: zh ? "要求 Chat Completions 结构。" : "Requires a Chat Completions shape." },
      { label: zh ? "图片" : "Image", path: "POST /images/generations", detail: zh ? "需要图片生成回包；语言模型不能绑定 image。" : "Requires an image-generation response; language models cannot bind image." },
      { label: zh ? "视频" : "Video", path: "submit → poll → download", detail: zh ? "仅为符合异步任务契约的平台开放。" : "Available only to providers that satisfy the async task contract." }
    );
  }

  return `
    <section class="providerIntegrationGuide ${tone === "planned" ? "planned" : ""}" aria-label="${zh ? "Provider 接入要求" : "Provider integration requirements"}">
      <div class="providerIntegrationGuideHeading"><div><strong>${zh ? "接入要求" : "Integration requirements"}</strong><span>${escapeHtml(provider.protocol)} · ${escapeHtml(provider.guide || "")}</span></div><span class="providerIntegrationGuideState ${tone}">${tone === "planned" ? (zh ? "不可配置" : "Not configurable") : (zh ? "按协议接入" : "Contract guided")}</span></div>
      <p>${escapeHtml(summary)}</p>
      <ul class="providerIntegrationTaskList">${rows.map((row) => `<li><div><strong>${escapeHtml(row.label)}</strong><code>${escapeHtml(row.path)}</code></div><span>${escapeHtml(row.detail)}</span></li>`).join("")}</ul>
    </section>
  `;
}

function providerConnectionTabHtml(provider, providerOptions) {
  const isOpenAI = provider.id === "openai";
  const isCompatible = provider.id === "openai-compatible";
  const supportsModelDiscoveryEndpoint = ["openai-compatible", "custom-base-url"].includes(provider.id);
  const pending = providerOperationPending();
  const disabled = pending ? "disabled" : "";
  if (!providerCanBeConfigured(provider)) {
    return `
      <div class="providerForm providerConnectionForm providerPlaceholderConnection">
        <div class="providerFormGrid">
          <label class="providerWideField">
            <span>${state.locale === "zh-CN" ? "平台类型" : "Provider type"}</span>
            <select id="providerSelect" ${disabled}>${providerOptions}</select>
            <small>${state.locale === "zh-CN" ? "可切换到已接通的平台继续创建或编辑配置。" : "Switch to a wired provider to create or edit a configuration."}</small>
          </label>
        </div>
        ${providerIntegrationGuideHtml(provider)}
        <section class="providerPlaceholderPanel">
          <strong>${state.locale === "zh-CN" ? "此占位项不会保存 Base URL、API Key、模型或能力绑定。" : "This placeholder never saves a Base URL, API key, model, or capability binding."}</strong>
          <span>${state.locale === "zh-CN" ? "等专用 Adapter 完成后，才会开放对应平台的连接字段和真实连接测试。" : "Connection fields and live tests open only after its dedicated adapter is implemented."}</span>
        </section>
        ${providerHubFeedbackHtml()}
      </div>
    `;
  }
  const refreshing = state.providerConfig.status === "refreshing";
  const testing = state.providerConfig.status === "testing";
  const saving = state.providerConfig.status === "saving";
  const savingApiKey = state.providerConfig.apiKeySaveState === "saving";
  const configured = Boolean(state.providerConfig.apiKeyStatus && state.providerConfig.apiKeyStatus.configured);
  const keyStatus = configured
    ? `${state.locale === "zh-CN" ? "已保存" : "Saved"} ${state.providerConfig.apiKeyStatus.preview || ""}`.trim()
    : (state.locale === "zh-CN" ? "未保存" : "Not saved");
  const capabilityOptions = providerCapabilities.map((capability) => {
    const checked = normalizeProviderCapabilities(state.providerConfig.defaultCapabilities).includes(capability.id);
    return `
      <label class="providerCapabilityOption">
        <input type="checkbox" data-provider-default-capability="${escapeHtml(capability.id)}" ${checked ? "checked" : ""} ${disabled}>
        <span>${escapeHtml(localText(capability.label))}</span>
      </label>
    `;
  }).join("");
  const models = currentProviderModels();
  const filteredModels = providerModelsForActiveCapability();
  const modelOptions = models.map((model) => `<option value="${escapeHtml(model.id)}" ${model.id === state.providerConfig.model ? "selected" : ""}>${escapeHtml(model.label)}</option>`).join("");
  const capabilityCounts = providerModelCapabilityCounts();
  const capabilityFilters = [
    `<button type="button" data-provider-model-capability="all" class="${state.providerModelCapabilityFilter === "all" ? "active" : ""}" ${disabled}>${state.locale === "zh-CN" ? "全部" : "All"} <span>${models.length}</span></button>`,
    ...providerCapabilities
      .filter((capability) => capabilityCounts[capability.id])
      .map((capability) => `<button type="button" data-provider-model-capability="${escapeHtml(capability.id)}" class="${state.providerModelCapabilityFilter === capability.id ? "active" : ""}" ${disabled}>${escapeHtml(localText(capability.label))} <span>${capabilityCounts[capability.id]}</span></button>`)
  ].join("");
  const modelRows = filteredModels.length ? filteredModels.map((model) => {
    const selected = model.id === state.providerConfig.model;
    return `
      <button class="providerModelRow ${selected ? "selected" : ""}" type="button" data-provider-model="${escapeHtml(model.id)}" ${disabled}>
        <span><strong>${escapeHtml(model.label)}</strong><small>${escapeHtml(model.id)}</small></span>
        <span class="providerModelTags">${(model.tags || []).map((tag) => `<span>${escapeHtml(providerCapabilityLabel(tag))}</span>`).join("")}</span>
      </button>
    `;
  }).join("") : `<div class="providerModelEmpty">${models.length ? (state.locale === "zh-CN" ? "该分类下没有模型。" : "No models in this category.") : (state.locale === "zh-CN" ? "保存 URL 和 Key 后刷新模型。" : "Save the URL and key, then refresh models.")}</div>`;
  return `
    <div class="providerForm providerConnectionForm">
      ${providerIntegrationGuideHtml(provider)}
      <div class="providerFormGrid">
        <label>
          <span>${state.locale === "zh-CN" ? "配置名称" : "Profile name"}</span>
          <input id="providerProfileName" type="text" value="${escapeHtml(state.providerConfig.name || "")}" maxlength="80" autocomplete="off" ${disabled}>
        </label>
        <label>
          <span>${state.locale === "zh-CN" ? "平台类型" : "Provider type"}</span>
          <select id="providerSelect" ${disabled}>${providerOptions}</select>
        </label>
        <label class="providerWideField">
          <span>Base URL</span>
          <input id="providerBaseUrl" type="url" value="${escapeHtml(state.providerConfig.baseUrl || "")}" spellcheck="false" ${disabled}>
        </label>
        ${supportsModelDiscoveryEndpoint ? `
          <label class="providerWideField">
            <span>${state.locale === "zh-CN" ? "模型列表接口" : "Model list endpoint"}</span>
            <input id="providerModelsPath" type="text" value="${escapeHtml(state.providerConfig.modelsPath || "/models")}" placeholder="/models" spellcheck="false" ${disabled}>
            <small>${state.locale === "zh-CN" ? "填写返回模型数组的接口路径（例如 /models）；生成接口不能用于刷新模型。" : "Enter an endpoint that returns a model array (for example, /models). Generation endpoints cannot refresh models."}</small>
          </label>
        ` : ""}
        <label class="providerWideField">
          <span>API Key <small>${escapeHtml(keyStatus)}</small></span>
          <div class="providerApiKeyRow">
            <input id="providerApiKey" type="password" value="${escapeHtml(state.providerConfig.apiKeyDraft || "")}" placeholder="${configured ? (state.locale === "zh-CN" ? "留空继续使用已保存 Key" : "Leave blank to keep saved key") : (state.locale === "zh-CN" ? "输入 API Key" : "Enter API key")}" autocomplete="off" spellcheck="false" ${disabled}>
            <button class="featureSecondaryButton providerApiKeySaveButton" id="saveProviderApiKeyButton" type="button" ${disabled}>${savingApiKey ? (state.locale === "zh-CN" ? "保存中" : "Saving") : (state.locale === "zh-CN" ? "保存 Key" : "Save key")}</button>
          </div>
        </label>
        <label class="providerWideField">
          <span>${state.locale === "zh-CN" ? "默认模型" : "Default model"}</span>
          <div class="modelSelectRow">
            <select id="providerModelSelect" ${disabled}>${modelOptions || `<option value="">${state.locale === "zh-CN" ? "请先刷新模型" : "Refresh models first"}</option>`}</select>
            <button class="featureSecondaryButton" id="refreshModelsButton" type="button" ${disabled}>${refreshing ? (state.locale === "zh-CN" ? "刷新中" : "Refreshing") : (state.locale === "zh-CN" ? "刷新模型" : "Refresh")}</button>
          </div>
        </label>
        ${isOpenAI ? `
          <label class="providerWideField">
            <span>OpenAI Organization</span>
            <input id="providerOrganization" type="text" value="${escapeHtml(state.providerConfig.organization || "")}" placeholder="org-..." autocomplete="off" ${disabled}>
          </label>
        ` : ""}
      </div>
      ${isCompatible ? `
        <details class="providerAdvancedConfig">
          <summary>${state.locale === "zh-CN" ? "高级连接选项" : "Advanced connection options"}</summary>
          <div class="providerAdvancedGrid">
            <label><span>${state.locale === "zh-CN" ? "文本生成路径" : "Chat path"}</span><input id="providerChatPath" type="text" value="${escapeHtml(state.providerConfig.chatPath || "/chat/completions")}" spellcheck="false" ${disabled}></label>
            <label><span>${state.locale === "zh-CN" ? "图片生成路径" : "Images path"}</span><input id="providerImagesPath" type="text" value="${escapeHtml(state.providerConfig.imagesPath || "/images/generations")}" spellcheck="false" ${disabled}></label>
            <label><span>${state.locale === "zh-CN" ? "视频提交路径" : "Video submit path"}</span><input id="providerVideoPath" type="text" value="${escapeHtml(state.providerConfig.videoPath || "/videos/generations")}" spellcheck="false" ${disabled}></label>
            <label><span>${state.locale === "zh-CN" ? "视频状态路径" : "Video status path"}</span><input id="providerVideoStatusPath" type="text" value="${escapeHtml(state.providerConfig.videoStatusPath || "/videos/generations/{taskId}")}" spellcheck="false" ${disabled}></label>
            <label><span>${state.locale === "zh-CN" ? "请求超时（秒）" : "Timeout (seconds)"}</span><input id="providerTimeoutSeconds" type="number" min="1" max="180" value="${escapeHtml(String(state.providerConfig.timeoutSeconds || 120))}" ${disabled}></label>
            <label class="providerHeadersField"><span>${state.locale === "zh-CN" ? "自定义请求头" : "Custom headers"}</span><textarea id="providerCustomHeaders" rows="4" spellcheck="false" ${disabled}>${escapeHtml(state.providerConfig.customHeadersText || "")}</textarea></label>
            <fieldset class="providerCapabilityOptions"><legend>${state.locale === "zh-CN" ? "默认能力标签" : "Default capability tags"}</legend><div>${capabilityOptions}</div></fieldset>
          </div>
        </details>
        <section class="providerManualModel" aria-label="${state.locale === "zh-CN" ? "手动登记模型" : "Register model manually"}">
          <div class="providerSectionHeading"><div><strong>${state.locale === "zh-CN" ? "手动登记模型" : "Register model manually"}</strong><span>${state.locale === "zh-CN" ? "当 /models 未返回视频模型时，按供应商文档填写模型 ID 和能力标签。" : "Use the provider documentation when /models does not return a video model."}</span></div></div>
          <div class="providerManualModelGrid">
            <label><span>${state.locale === "zh-CN" ? "模型 ID" : "Model ID"}</span><input id="providerManualModelId" type="text" value="${escapeHtml(state.providerConfig.manualModelId || "")}" placeholder="provider-video-model" spellcheck="false" ${disabled}></label>
            <label><span>${state.locale === "zh-CN" ? "显示名称（可选）" : "Display name (optional)"}</span><input id="providerManualModelLabel" type="text" value="${escapeHtml(state.providerConfig.manualModelLabel || "")}" placeholder="Video model" ${disabled}></label>
            <fieldset class="providerCapabilityOptions providerManualModelCapabilities"><legend>${state.locale === "zh-CN" ? "模型能力" : "Model capabilities"}</legend><div>${providerCapabilities.map((capability) => `<label class="providerCapabilityOption"><input type="checkbox" data-provider-manual-capability="${escapeHtml(capability.id)}" ${state.providerConfig.manualModelCapabilities.includes(capability.id) ? "checked" : ""} ${disabled}><span>${escapeHtml(localText(capability.label))}</span></label>`).join("")}</div></fieldset>
            <button class="featureSecondaryButton" id="addManualProviderModelButton" type="button" ${disabled}>${state.locale === "zh-CN" ? "加入模型列表" : "Add model"}</button>
          </div>
        </section>
      ` : ""}
      <section class="providerConnectionModels" aria-label="${state.locale === "zh-CN" ? "模型能力分类" : "Model capability categories"}">
        <div class="providerSectionHeading">
          <div><strong>${state.locale === "zh-CN" ? "模型能力分类" : "Model capabilities"}</strong><span>${state.locale === "zh-CN" ? "查看每个模型支持的能力并选择默认模型" : "Review capabilities and choose the default model"}</span></div>
        </div>
        <div class="providerCapabilityFilter">${capabilityFilters}</div>
        <div class="providerConnectionModelList">${modelRows}</div>
      </section>
      <div class="providerFormActions providerStickyActions">
        <button class="featurePrimaryButton" id="saveProviderButton" type="button" ${disabled}>${saving ? (state.locale === "zh-CN" ? "保存中" : "Saving") : (state.locale === "zh-CN" ? "保存配置" : "Save profile")}</button>
        <button class="featureSecondaryButton" id="testProviderButton" type="button" ${disabled}>${testing ? (state.locale === "zh-CN" ? "测试中" : "Testing") : (state.locale === "zh-CN" ? "测试连接" : "Test connection")}</button>
      </div>
      ${providerHubFeedbackHtml()}
    </div>
  `;
}

function providerModelsTabHtml() {
  const pending = providerOperationPending();
  const refreshing = state.providerConfig.status === "refreshing";
  const models = currentProviderModels();
  const rows = models.length ? models.map((model) => {
    const selected = model.id === state.providerConfig.model;
    return `
      <button class="providerModelRow ${selected ? "selected" : ""}" type="button" data-provider-model="${escapeHtml(model.id)}" ${pending ? "disabled" : ""}>
        <span><strong>${escapeHtml(model.label)}</strong><small>${escapeHtml(model.id)}</small></span>
        <span class="providerModelTags">${(model.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</span>
      </button>
    `;
  }).join("") : `<div class="providerModelEmpty">${state.locale === "zh-CN" ? "暂无模型。刷新后这里会显示平台真实返回的列表。" : "No models. Refresh to load the provider's live list."}</div>`;
  return `
    <div class="providerModelsWorkspace">
      <div class="providerTabToolbar">
        <div><strong>${models.length} ${state.locale === "zh-CN" ? "个模型" : "models"}</strong><span>${state.locale === "zh-CN" ? "只显示真实刷新结果" : "Live refresh results only"}</span></div>
        <button class="featurePrimaryButton" id="refreshModelsButton" type="button" ${pending ? "disabled" : ""}>${refreshing ? (state.locale === "zh-CN" ? "刷新中" : "Refreshing") : (state.locale === "zh-CN" ? "刷新模型" : "Refresh models")}</button>
      </div>
      <div class="providerModelList">${rows}</div>
      ${providerHubFeedbackHtml()}
    </div>
  `;
}

function providerCapabilitiesTabHtml() {
  const pending = providerOperationPending();
  const bindings = state.providerProfile.capabilityBindings || {};
  const modelBindings = state.providerProfile.capabilityModelBindings || {};
  const instances = state.providerProfile.profileInstances || {};
  const rows = providerCapabilities.map((capability) => {
    const runtimeStatus = capabilityConnectionStatus(capability.id);
    const defaultBinding = bindings[capability.id] || {};
    const capabilityBindings = modelBindings[capability.id] || [];
    const boundHere = capabilityBindings.some((binding) => (
      binding.profileId === state.providerConfig.profileId && binding.model === state.providerConfig.model
    ));
    const canBind = providerCanBeConfigured() && Boolean(state.providerConfig.model) && currentModelCanBindCapability(capability.id);
    const boundModels = capabilityBindings.length ? capabilityBindings.map((binding) => {
      const isDefault = binding.profileId === defaultBinding.profileId
        && binding.providerId === defaultBinding.providerId
        && binding.model === defaultBinding.model;
      const profileName = (instances[binding.profileId] && instances[binding.profileId].name)
        || binding.profileId
        || binding.providerId;
      return `
        <div class="providerCapabilityBindingItem">
          <div class="providerCapabilityBindingName">
            <strong>${escapeHtml(binding.model)}</strong>
            <span>${escapeHtml(profileName)}</span>
          </div>
          <div class="providerCapabilityBindingActions">
            ${isDefault ? `<span class="providerDefaultBadge">${state.locale === "zh-CN" ? "默认" : "Default"}</span>` : `
              <button class="providerBindingButton" type="button" data-default-capability="${escapeHtml(capability.id)}" data-binding-profile="${escapeHtml(binding.profileId || "")}" data-binding-provider="${escapeHtml(binding.providerId)}" data-binding-model="${escapeHtml(binding.model)}" ${pending ? "disabled" : ""}>${state.locale === "zh-CN" ? "设为默认" : "Set default"}</button>
            `}
            <button class="providerBindingButton danger" type="button" data-remove-capability="${escapeHtml(capability.id)}" data-binding-profile="${escapeHtml(binding.profileId || "")}" data-binding-provider="${escapeHtml(binding.providerId)}" data-binding-model="${escapeHtml(binding.model)}" ${pending ? "disabled" : ""}>${state.locale === "zh-CN" ? "解绑" : "Remove"}</button>
          </div>
        </div>
      `;
    }).join("") : `<div class="providerCapabilityEmpty">${state.locale === "zh-CN" ? "还没有绑定模型" : "No models bound yet"}</div>`;
    return `
      <div class="providerCapabilityRow">
        <div class="providerCapabilityHeader">
          <div>
            <strong>${escapeHtml(localText(capability.label))}</strong>
            <span>${escapeHtml(capabilityConnectionLabel(capability.id))} · ${capabilityBindings.length} ${state.locale === "zh-CN" ? "个模型" : "models"}</span>
          </div>
          <button class="providerBindingButton" type="button" data-bind-capability="${escapeHtml(capability.id)}" ${pending || !canBind || boundHere ? "disabled" : ""}>${boundHere ? (state.locale === "zh-CN" ? "已添加" : "Added") : (state.locale === "zh-CN" ? "添加绑定" : "Add binding")}</button>
        </div>
        <div class="providerCapabilityRuntimeStatus ${escapeHtml(capabilityConnectionTone(capability.id))}"><span>${escapeHtml(capabilityConnectionLabel(capability.id))}</span><small>${escapeHtml(capabilityConnectionDetail(capability.id, runtimeStatus.message))}</small></div>
        <div class="providerCapabilityBindingList">${boundModels}</div>
      </div>
    `;
  }).join("");
  return `
    <div class="providerCapabilitiesWorkspace">
      <div class="providerSelectedModelSummary"><span>${state.locale === "zh-CN" ? "当前选中模型，可添加到多个能力" : "Selected model can be added to multiple capabilities"}</span><strong>${escapeHtml(currentModelLabel())}</strong></div>
      ${providerHubFeedbackHtml()}
      <div class="providerCapabilityRows">${rows}</div>
    </div>
  `;
}

function renderProviderHubWorkspaceV2(feature, workspace) {
  const provider = currentProvider();
  const instances = Object.values(state.providerProfile.profileInstances || {});
  const pending = providerOperationPending();
  const providerOptions = providerCatalog.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === state.providerConfig.providerId ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
  const tabs = [
    ["connection", state.locale === "zh-CN" ? "连接与模型" : "Connection & Models"],
    ["capabilities", state.locale === "zh-CN" ? "能力绑定" : "Capabilities"]
  ];
  if (!tabs.some(([id]) => id === state.providerHubTab)) state.providerHubTab = "connection";
  const tabContent = state.providerHubTab === "capabilities"
    ? providerCapabilitiesTabHtml()
    : providerConnectionTabHtml(provider, providerOptions);
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="providerHubHeader">
      <div><span class="featureEyebrow">Provider Hub</span><h2>${escapeHtml(localText(feature.title))}</h2><p>${state.locale === "zh-CN" ? "按配置实例管理平台连接、模型和能力绑定。" : "Manage provider connections, models, and capability bindings by profile."}</p></div>
      <div class="providerHubHeaderStatus"><span class="statusDot ${state.serviceOnline ? "success" : "warning"}"></span><strong>${state.serviceOnline ? "Local Service" : (state.locale === "zh-CN" ? "服务未连接" : "Service offline")}</strong></div>
    </section>
    <section class="providerHubShell" data-provider-mobile-view="${state.providerMobileView}">
      <aside class="providerProfilePane">
        <div class="providerPaneHeader">
          <div><strong>${state.locale === "zh-CN" ? "配置" : "Profiles"}</strong><span>${instances.length}</span></div>
          <button class="iconButton" id="newProviderProfileButton" type="button" aria-label="${state.locale === "zh-CN" ? "新建配置" : "New profile"}" data-tooltip="${state.locale === "zh-CN" ? "新建配置" : "New profile"}" ${pending ? "disabled" : ""}>+</button>
        </div>
        <div class="providerProfileList">${providerProfileListHtml()}</div>
      </aside>
      <section class="providerDetailPane" aria-busy="${pending ? "true" : "false"}" data-provider-pending="${pending ? "true" : "false"}">
        <header class="providerDetailHeader">
          <div class="providerDetailIdentity">
            <button class="providerBackButton" id="providerBackToProfiles" type="button" aria-label="${state.locale === "zh-CN" ? "返回配置列表" : "Back to profiles"}">${navIconSvg("back")}<span>${state.locale === "zh-CN" ? "配置" : "Profiles"}</span></button>
            <div><strong>${escapeHtml(state.providerConfig.name || provider.label)}</strong><span>${escapeHtml(provider.label)} · ${escapeHtml(state.providerConfig.profileId || "")}</span></div>
          </div>
          <div class="providerDetailActions">
            <button class="featureSecondaryButton" id="copyProviderProfileButton" type="button" ${pending ? "disabled" : ""}>${state.locale === "zh-CN" ? "复制" : "Copy"}</button>
            <button class="featureSecondaryButton" id="pasteProviderProfileButton" type="button" ${pending ? "disabled" : ""}>${state.locale === "zh-CN" ? "粘贴" : "Paste"}</button>
            <button class="featureDangerButton" id="deleteProviderProfileButton" type="button" ${pending || instances.length <= 1 ? "disabled" : ""}>${state.locale === "zh-CN" ? "删除" : "Delete"}</button>
            <span class="providerStateBadge ${escapeHtml(providerStatusTone())}">${escapeHtml(providerStatusLabel())}</span>
          </div>
        </header>
        <nav class="providerDetailTabs" aria-label="${state.locale === "zh-CN" ? "配置详情" : "Profile details"}">${tabs.map(([id, label]) => `<button type="button" data-provider-tab="${id}" class="${state.providerHubTab === id ? "active" : ""}" aria-selected="${state.providerHubTab === id ? "true" : "false"}" ${pending ? "disabled" : ""}>${escapeHtml(label)}</button>`).join("")}</nav>
        <div class="providerDetailBody">${tabContent}</div>
      </section>
    </section>
    ${state.providerDeleteConfirmOpen ? `
      <div class="providerDeleteConfirmBackdrop" role="presentation">
        <section class="providerDeleteConfirm" role="dialog" aria-modal="true" aria-labelledby="providerDeleteConfirmTitle">
          <div>
            <h3 id="providerDeleteConfirmTitle">${state.locale === "zh-CN" ? "删除平台配置" : "Delete provider profile"}</h3>
            <p>${state.locale === "zh-CN" ? `确定删除“${escapeHtml(state.providerConfig.name)}”吗？对应的加密 API Key 和能力绑定也会移除。` : `Delete “${escapeHtml(state.providerConfig.name)}”? Its encrypted API key and capability bindings will also be removed.`}</p>
          </div>
          <div class="providerDeleteConfirmActions">
            <button class="featureSecondaryButton" id="cancelDeleteProviderProfileButton" type="button">${state.locale === "zh-CN" ? "取消" : "Cancel"}</button>
            <button class="featureDangerButton" id="confirmDeleteProviderProfileButton" type="button">${state.locale === "zh-CN" ? "确认删除" : "Delete"}</button>
          </div>
        </section>
      </div>
    ` : ""}
  `;
  bindProviderHubV2Workspace();
}

function bindProviderHubV2Workspace() {
  el("newProviderProfileButton")?.addEventListener("click", () => {
    state.providerMobileView = "detail";
    createProviderProfile();
  });
  el("providerBackToProfiles")?.addEventListener("click", () => {
    syncProviderFormState();
    state.providerMobileView = "list";
    render();
  });
  el("copyProviderProfileButton")?.addEventListener("click", copyProviderProfile);
  el("pasteProviderProfileButton")?.addEventListener("click", pasteProviderProfile);
  el("deleteProviderProfileButton")?.addEventListener("click", requestDeleteProviderProfile);
  el("cancelDeleteProviderProfileButton")?.addEventListener("click", closeProviderDeleteConfirm);
  el("confirmDeleteProviderProfileButton")?.addEventListener("click", confirmDeleteProviderProfile);
  const deleteDialog = document.querySelector(".providerDeleteConfirm");
  deleteDialog?.addEventListener("keydown", handleProviderDeleteDialogKeydown);
  document.querySelector(".providerDeleteConfirmBackdrop")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeProviderDeleteConfirm();
  });
  document.querySelectorAll("[data-provider-profile-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.providerMobileView = "detail";
      if (button.dataset.providerProfileId === state.providerConfig.profileId) render();
      else selectProviderProfile(button.dataset.providerProfileId);
    });
  });
  document.querySelectorAll("[data-provider-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      syncProviderFormState();
      state.providerHubTab = button.dataset.providerTab;
      render();
    });
  });
  el("providerSelect")?.addEventListener("change", (event) => {
    syncProviderFormState();
    const provider = providerCatalog.find((item) => item.id === event.target.value) || providerCatalog[0];
    state.providerConfig.providerId = provider.id;
    state.providerConfig.baseUrl = provider.baseUrl || "";
    state.providerConfig.models = providerModelCatalog[provider.id] || [];
    state.providerConfig.model = state.providerConfig.models[0] ? state.providerConfig.models[0].id : "";
    state.providerConfig.organization = "";
    state.providerConfig.modelsPath = "/models";
    state.providerConfig.chatPath = "/chat/completions";
    state.providerConfig.imagesPath = "/images/generations";
    state.providerConfig.videoPath = "/videos/generations";
    state.providerConfig.videoStatusPath = "/videos/generations/{taskId}";
    state.providerConfig.timeoutSeconds = 120;
    state.providerModelCapabilityFilter = "all";
    state.providerConfig.errorCode = null;
    render();
  });
  el("providerModelSelect")?.addEventListener("change", (event) => {
    syncProviderFormState();
    state.providerConfig.model = event.target.value;
    state.providerConfig.errorCode = null;
    render();
  });
  el("addManualProviderModelButton")?.addEventListener("click", addManualProviderModel);
  document.querySelectorAll("[data-provider-model-capability]").forEach((button) => {
    button.addEventListener("click", () => {
      syncProviderFormState();
      state.providerModelCapabilityFilter = button.dataset.providerModelCapability;
      render();
    });
  });
  document.querySelectorAll("[data-provider-model]").forEach((button) => {
    button.addEventListener("click", () => {
      state.providerConfig.model = button.dataset.providerModel;
      state.providerConfig.errorCode = null;
      render();
    });
  });
  document.querySelectorAll("[data-bind-capability]").forEach((button) => {
    button.addEventListener("click", () => bindCurrentModelToCapability(button.dataset.bindCapability));
  });
  document.querySelectorAll("[data-default-capability]").forEach((button) => {
    button.addEventListener("click", () => setDefaultCapabilityModel(button.dataset.defaultCapability, button.dataset.bindingProfile, button.dataset.bindingModel, button.dataset.bindingProvider));
  });
  document.querySelectorAll("[data-remove-capability]").forEach((button) => {
    button.addEventListener("click", () => removeCapabilityModelBinding(button.dataset.removeCapability, button.dataset.bindingProfile, button.dataset.bindingModel, button.dataset.bindingProvider));
  });
  el("refreshModelsButton")?.addEventListener("click", refreshProviderModels);
  el("testProviderButton")?.addEventListener("click", testProviderConnection);
  el("saveProviderButton")?.addEventListener("click", saveProviderSettings);
  el("saveProviderApiKeyButton")?.addEventListener("click", saveProviderApiKey);
}

function renderSystemSettingsWorkspace(feature, workspace) {
  const zh = state.locale === "zh-CN";
  const host = selectedHostRecord();
  const provider = currentProvider();
  const serviceLabel = state.serviceOnline ? (zh ? "已连接" : "Connected") : (zh ? "本地预览" : "Local preview");
  const hostLabel = host ? host.displayName : (zh ? "未选择宿主" : "No host selected");
  const hostStatus = host ? host.status : "Offline";
  const hostStatusLabel = hostStatus === "Connected"
    ? (zh ? "已连接" : "Connected")
    : (hostStatus === "Offline" ? (zh ? "离线" : "Offline") : hostStatus);
  const themeOptions = [
    ["dark", zh ? "深色" : "Dark"],
    ["light", zh ? "浅色" : "Light"],
    ["system", zh ? "跟随系统" : "System"]
  ];
  const localeOptions = [["zh-CN", "中文"], ["en-US", "English"]];
  const themeColorOptions = [
    ["cyan", zh ? "青蓝" : "Cyan", "#27C7EB"],
    ["blue", zh ? "蓝色" : "Blue", "#5B8CFF"],
    ["green", zh ? "绿色" : "Green", "#31C982"],
    ["orange", zh ? "橙色" : "Orange", "#F08A45"],
    ["violet", zh ? "紫色" : "Violet", "#9B76F2"],
    ["slate", zh ? "灰蓝" : "Slate", "#8A9BB0"]
  ];
  const accentColorOptions = [
    ["mint", zh ? "薄荷绿" : "Mint", "#3EE0AA"],
    ["cyan", zh ? "亮青" : "Bright cyan", "#2EC5F4"],
    ["amber", zh ? "琥珀黄" : "Amber", "#FFC247"],
    ["rose", zh ? "品牌粉" : "Brand rose", "#F06B85"],
    ["violet", zh ? "柔紫" : "Soft violet", "#A78BFA"],
    ["orange", zh ? "暖橙" : "Warm orange", "#FF934D"]
  ];
  const themeColorSwatches = themeColorOptions.map(([id, label, color]) => `
    <button class="settingsColorSwatch ${state.themeColor === id ? "active" : ""}" type="button" data-settings-theme-color="${id}" aria-label="${escapeHtml(label)}" aria-pressed="${state.themeColor === id ? "true" : "false"}" data-tooltip="${escapeHtml(label)}" style="--swatch-color:${color}"><span aria-hidden="true"></span></button>
  `).join("");
  const accentColorSwatches = accentColorOptions.map(([id, label, color]) => `
    <button class="settingsColorSwatch ${state.accentColor === id ? "active" : ""}" type="button" data-settings-accent-color="${id}" aria-label="${escapeHtml(label)}" aria-pressed="${state.accentColor === id ? "true" : "false"}" data-tooltip="${escapeHtml(label)}" style="--swatch-color:${color}"><span aria-hidden="true"></span></button>
  `).join("");
  workspace.setAttribute("aria-label", localText(feature.title));
  workspace.innerHTML = `
    <section class="settingsWorkspace">
      <header class="settingsHeader">
        <div>
          <span class="settingsEyebrow">${escapeHtml(localText(feature.eyebrow))}</span>
          <h2>${escapeHtml(localText(feature.title))}</h2>
          <p>${escapeHtml(localText(feature.intro))}</p>
        </div>
        <div class="settingsHeaderStatus" aria-label="${zh ? "本地服务状态" : "Local service status"}">
          <span class="statusDot ${state.serviceOnline ? "success" : "warning"}"></span>
          <span><strong>Local Service</strong><small>${escapeHtml(serviceLabel)}</small></span>
        </div>
      </header>
      <div class="settingsGroups">
        <section class="settingsGroup" aria-labelledby="settingsAppearanceTitle">
          <h3 id="settingsAppearanceTitle">${zh ? "外观" : "Appearance"}</h3>
          <div class="settingsGroupPanel">
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "主题模式" : "Theme mode"}</strong><span>${zh ? "立即应用，并记住本机选择。" : "Apply immediately and remember this device."}</span></div>
                <div class="settingsSegmented" role="group" aria-label="${zh ? "主题模式" : "Theme mode"}">${themeOptions.map(([id, label]) => `<button type="button" data-settings-theme="${id}" aria-pressed="${state.themeMode === id ? "true" : "false"}" class="${state.themeMode === id ? "active" : ""}">${escapeHtml(label)}</button>`).join("")}</div>
              </div>
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "界面语言" : "Interface language"}</strong><span>${zh ? "切换后立即刷新当前界面。" : "Refresh the current interface immediately."}</span></div>
                <div class="settingsSegmented" role="group" aria-label="${zh ? "界面语言" : "Interface language"}">${localeOptions.map(([id, label]) => `<button type="button" data-settings-locale="${id}" aria-pressed="${state.locale === id ? "true" : "false"}" class="${state.locale === id ? "active" : ""}">${escapeHtml(label)}</button>`).join("")}</div>
              </div>
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "主题色" : "Theme color"}</strong><span>${zh ? "用于主按钮、选中状态和焦点反馈。" : "Used for primary actions, selected states, and focus feedback."}</span></div>
                <div class="settingsColorSwatches" role="group" aria-label="${zh ? "主题色" : "Theme color"}">${themeColorSwatches}</div>
              </div>
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "强调色" : "Accent color"}</strong><span>${zh ? "用于品牌提示、次级重点和创作标记。" : "Used for brand cues, secondary emphasis, and creative markers."}</span></div>
                <div class="settingsColorSwatches" role="group" aria-label="${zh ? "强调色" : "Accent color"}">${accentColorSwatches}</div>
              </div>
          </div>
        </section>

        <section class="settingsGroup" aria-labelledby="settingsConnectionTitle">
          <h3 id="settingsConnectionTitle">${zh ? "连接与安全" : "Connections & Safety"}</h3>
          <div class="settingsGroupPanel">
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "当前宿主" : "Current host"}</strong><span>${escapeHtml(hostLabel)} · ${escapeHtml(hostStatus)}</span></div>
                <div class="settingsRowAction"><span class="settingsInlineStatus"><span class="statusDot ${statusTone(hostStatus)}"></span>${escapeHtml(hostStatusLabel)}</span><button class="settingsActionButton" type="button" data-check-local-service>${zh ? "检查连接" : "Check connection"}</button></div>
              </div>
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "模型平台" : "Provider Hub"}</strong><span>${escapeHtml(provider.label)} · ${escapeHtml(currentModelLabel())}</span></div>
                <div class="settingsRowAction"><span class="providerStateBadge ${escapeHtml(providerStatusTone())}">${escapeHtml(providerStatusLabel())}</span><button class="settingsActionButton" type="button" data-open-provider-hub>${zh ? "管理模型" : "Manage models"}</button></div>
              </div>
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "Trusted Actions" : "Trusted Actions"}</strong><span>${zh ? "当前仅允许风险等级 0 的只读操作。" : "Only read-only actions with risk level 0 are allowed."}</span></div>
                <span class="settingsStateLabel success">${zh ? "已启用" : "Enabled"}</span>
              </div>
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>API Key</strong><span>${zh ? "密钥由 Local Service 加密保存，不进入渲染器持久化。" : "Keys are encrypted by Local Service and excluded from renderer persistence."}</span></div>
                <span class="settingsStateLabel">${zh ? "安全存储" : "Secure storage"}</span>
              </div>
          </div>
        </section>

        <section class="settingsGroup" aria-labelledby="settingsDataTitle">
          <h3 id="settingsDataTitle">${zh ? "数据与更新" : "Data & Updates"}</h3>
          <div class="settingsGroupPanel">
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "本地数据" : "Local data"}</strong><span>${zh ? "配置、历史与生成记录保存在本机应用数据目录。" : "Settings, history, and generation records stay in the local app data directory."}</span></div>
                <span class="settingsStateLabel">${zh ? "仅本机" : "Local only"}</span>
              </div>
              <div class="settingsRow">
                <div class="settingsRowLabel"><strong>${zh ? "更新通道" : "Update channel"}</strong><span>${zh ? "当前版本" : "Current version"} ${escapeHtml(runtimeWiring.version)}</span></div>
                <span class="settingsStateLabel warning">Alpha</span>
              </div>
          </div>
        </section>

        <section class="settingsGroup" aria-labelledby="settingsShortcutsTitle">
          <h3 id="settingsShortcutsTitle">${zh ? "快捷键" : "Shortcuts"}</h3>
          <div class="settingsGroupPanel settingsShortcutRows">
              <div class="settingsRow"><div class="settingsRowLabel"><strong>${zh ? "命令栏" : "Command bar"}</strong><span>${zh ? "打开创作指令入口" : "Open the creative command surface"}</span></div><kbd>Ctrl + J</kbd></div>
              <div class="settingsRow"><div class="settingsRowLabel"><strong>${zh ? "搜索命令" : "Search commands"}</strong><span>${zh ? "查找功能和动作" : "Find features and actions"}</span></div><kbd>Ctrl + K</kbd></div>
              <div class="settingsRow"><div class="settingsRowLabel"><strong>${zh ? "打开帮助" : "Open help"}</strong><span>${zh ? "查看当前工作区帮助" : "View help for the current workspace"}</span></div><kbd>Ctrl + /</kbd></div>
          </div>
        </section>

        <section class="settingsGroup" aria-labelledby="settingsAboutTitle">
          <h3 id="settingsAboutTitle">${zh ? "关于" : "About"}</h3>
          <div class="settingsGroupPanel">
            <div class="settingsRow"><div class="settingsRowLabel"><strong>Kuroii Motion AI</strong><span>${zh ? "面向 After Effects 与 Premiere Pro 的 AI 创作工作台。" : "AI production workspace for After Effects and Premiere Pro."}</span></div><span class="settingsVersion">v${escapeHtml(runtimeWiring.version)}</span></div>
          </div>
        </section>
      </div>
    </section>
  `;
  bindSystemSettingsWorkspace();
}

function bindSystemSettingsWorkspace() {
  document.querySelector("[data-open-provider-hub]")?.addEventListener("click", () => {
    setActiveView("provider-hub");
    el("commandWorkspace").scrollTop = 0;
    render();
  });
  document.querySelector("[data-check-local-service]")?.addEventListener("click", refreshFromService);
  document.querySelectorAll("[data-settings-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      applyThemeMode(button.dataset.settingsTheme);
      render();
      applyThemeMode(state.themeMode, { persist: false });
    });
  });
  document.querySelectorAll("[data-settings-locale]").forEach((button) => {
    button.addEventListener("click", () => {
      state.locale = button.dataset.settingsLocale;
      render();
      applyThemeMode(state.themeMode, { persist: false });
    });
  });
  document.querySelectorAll("[data-settings-theme-color]").forEach((button) => {
    button.addEventListener("click", () => {
      state.themeColor = button.dataset.settingsThemeColor;
      applyPersonalizationColors();
      render();
      applyPersonalizationColors({ persist: false });
    });
  });
  document.querySelectorAll("[data-settings-accent-color]").forEach((button) => {
    button.addEventListener("click", () => {
      state.accentColor = button.dataset.settingsAccentColor;
      applyPersonalizationColors();
      render();
      applyPersonalizationColors({ persist: false });
    });
  });
}

function bindProviderSettingsWorkspace() {
  const providerSelect = el("providerSelect");
  const modelSelect = el("providerModelSelect");
  const refreshButton = el("refreshModelsButton");
  const testButton = el("testProviderButton");
  const saveButton = el("saveProviderButton");
  const saveApiKeyButton = el("saveProviderApiKeyButton");
  const selectProvider = (providerId) => {
    const provider = providerCatalog.find((item) => item.id === providerId) || providerCatalog[0];
    const savedProfile = state.providerProfile.profiles && state.providerProfile.profiles[provider.id] ? state.providerProfile.profiles[provider.id] : null;
    state.providerConfig.providerId = provider.id;
    state.providerConfig.baseUrl = savedProfile && savedProfile.baseUrl ? savedProfile.baseUrl : provider.baseUrl;
    state.providerConfig.apiKeyDraft = "";
    state.providerConfig.apiKeyRef = savedProfile && savedProfile.apiKeyRef ? savedProfile.apiKeyRef : `provider:${provider.id}:apiKey`;
    state.providerConfig.apiKeyStatus = savedProfile && savedProfile.apiKeyStatus ? savedProfile.apiKeyStatus : { configured: false, preview: "" };
    state.providerConfig.apiKeySaveState = "idle";
    state.providerConfig.organization = savedProfile && savedProfile.organization ? savedProfile.organization : "";
    state.providerConfig.modelsPath = savedProfile && savedProfile.modelsPath ? savedProfile.modelsPath : "/models";
    state.providerConfig.chatPath = savedProfile && savedProfile.chatPath ? savedProfile.chatPath : "/chat/completions";
    state.providerConfig.imagesPath = savedProfile && savedProfile.imagesPath ? savedProfile.imagesPath : "/images/generations";
    state.providerConfig.videoPath = savedProfile && savedProfile.videoPath ? savedProfile.videoPath : "/videos/generations";
    state.providerConfig.videoStatusPath = savedProfile && savedProfile.videoStatusPath ? savedProfile.videoStatusPath : "/videos/generations/{taskId}";
    state.providerConfig.customHeadersText = formatProviderHeaders(savedProfile && savedProfile.headers);
    state.providerConfig.timeoutSeconds = savedProfile && savedProfile.timeoutSeconds ? Number(savedProfile.timeoutSeconds) : 120;
    state.providerConfig.defaultCapabilities = normalizeProviderCapabilities(savedProfile && savedProfile.defaultCapabilities);
    state.providerConfig.models = providerModelCatalog[provider.id] || [];
    state.providerConfig.model = savedProfile && savedProfile.model ? savedProfile.model : (state.providerConfig.models[0] ? state.providerConfig.models[0].id : "");
    state.providerConfig.errorCode = null;
    state.providerConfig.status = "ready";
    render();
  };
  providerSelect?.addEventListener("change", (event) => {
    selectProvider(event.target.value);
  });
  modelSelect?.addEventListener("change", (event) => {
    syncProviderFormState();
    state.providerConfig.model = event.target.value;
    state.providerConfig.errorCode = null;
    render();
  });
  document.querySelectorAll("[data-provider-card]").forEach((button) => {
    button.addEventListener("click", () => selectProvider(button.dataset.providerCard));
  });
  document.querySelectorAll("[data-provider-model]").forEach((button) => {
    button.addEventListener("click", () => {
      state.providerConfig.model = button.dataset.providerModel;
      state.providerConfig.errorCode = null;
      render();
    });
  });
  document.querySelectorAll("[data-bind-capability]").forEach((button) => {
    button.addEventListener("click", () => bindCurrentModelToCapability(button.dataset.bindCapability));
  });
  document.querySelectorAll("[data-default-capability]").forEach((button) => {
    button.addEventListener("click", () => setDefaultCapabilityModel(button.dataset.defaultCapability, button.dataset.bindingProfile, button.dataset.bindingModel, button.dataset.bindingProvider));
  });
  document.querySelectorAll("[data-remove-capability]").forEach((button) => {
    button.addEventListener("click", () => removeCapabilityModelBinding(button.dataset.removeCapability, button.dataset.bindingProfile, button.dataset.bindingModel, button.dataset.bindingProvider));
  });
  refreshButton?.addEventListener("click", refreshProviderModels);
  testButton?.addEventListener("click", testProviderConnection);
  saveButton?.addEventListener("click", saveProviderSettings);
  saveApiKeyButton?.addEventListener("click", saveProviderApiKey);
}

function renderI18n() {
  document.documentElement.lang = state.locale;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  el("languageToggle").textContent = state.locale === "zh-CN" ? "中" : "EN";
  el("languageToggle").dataset.tooltip = state.locale === "zh-CN" ? "Switch to English" : "切换中文";
  el("languageToggle").setAttribute("aria-label", el("languageToggle").dataset.tooltip);
  el("refreshButton").dataset.tooltip = state.locale === "zh-CN" ? "刷新" : "Refresh";
  el("refreshButton").setAttribute("aria-label", el("refreshButton").dataset.tooltip);
  el("mobileNavToggle").dataset.tooltip = state.locale === "zh-CN" ? "打开导航" : "Open navigation";
  el("mobileNavToggle").setAttribute("aria-label", el("mobileNavToggle").dataset.tooltip);
  document.querySelectorAll(".sendButton[data-tooltip]").forEach((button) => {
    button.dataset.tooltip = state.locale === "zh-CN" ? "生成动效方案" : "Generate motion concept";
    button.setAttribute("aria-label", button.dataset.tooltip);
  });
  updateThemeModeIcons();
  updateSidebarToggleIcon();
  el("clearErrorButton").dataset.tooltip = state.locale === "zh-CN" ? "清除错误" : "Clear error";
  el("clearErrorButton").setAttribute("aria-label", el("clearErrorButton").dataset.tooltip);
  el("closeDetailButton").dataset.tooltip = state.locale === "zh-CN" ? "关闭详情" : "Close details";
  el("closeDetailButton").setAttribute("aria-label", el("closeDetailButton").dataset.tooltip);
  el("professionalResourceAdd").dataset.tooltip = state.locale === "zh-CN" ? "添加资源" : "Add resource";
  el("professionalResourceAdd").setAttribute("aria-label", el("professionalResourceAdd").dataset.tooltip);
  el("professionalDiagnosticsClose").dataset.tooltip = state.locale === "zh-CN" ? "关闭诊断" : "Close diagnostics";
  el("professionalDiagnosticsClose").setAttribute("aria-label", el("professionalDiagnosticsClose").dataset.tooltip);
  el("rehearsalToggle").dataset.tooltip = t("commandCenter.rehearsal.toggle");
  el("rehearsalToggle").setAttribute("aria-label", t("commandCenter.rehearsal.toggle"));
  el("queryFilter").placeholder = state.locale === "zh-CN" ? "搜索命令、动作、状态" : "Search command, action, code";
  el("evidenceNotesInput").placeholder = t("commandCenter.evidencePack.notesPlaceholder");
  el("visualFindingNote").placeholder = t("commandCenter.visualSignoff.findingPlaceholder");
}

function renderServiceStatus() {
  const connection = el("serviceStatus");
  const connectionDot = connection.querySelector(".statusDot");
  connectionDot.className = "statusDot success";
  connection.querySelector(".connectionStateText").textContent = state.locale === "zh-CN" ? "连接正常" : "Connected";
  connection.querySelector(".connectionStateSub").textContent = state.locale === "zh-CN" ? "Connected" : "Ready";

  const mode = el("modeStatus");
  const modeDot = mode.querySelector(".statusDot");
  modeDot.className = `statusDot ${state.serviceOnline ? "success" : "muted"}`;
  mode.querySelector("span:last-child").textContent = state.serviceOnline ? t("status.service") : t("status.localMock");
}

function renderActivity() {
  const band = el("activityBand");
  const dot = el("activityDot");
  let tone = "muted";
  let labelKey = state.serviceOnline ? "commandCenter.activity.ready" : "commandCenter.activity.mockReady";
  if (state.lastError) {
    tone = "error";
    labelKey = "commandCenter.activity.error";
  } else if (state.pendingOperation === "refreshing") {
    tone = "warning";
    labelKey = "commandCenter.activity.refreshing";
  } else if (state.pendingOperation === "executing") {
    tone = "warning";
    labelKey = "commandCenter.activity.executing";
  } else if (state.pendingOperation === "loading-detail") {
    tone = "warning";
    labelKey = "commandCenter.activity.loadingDetail";
  } else if (state.serviceOnline) {
    tone = "success";
  }
  band.className = `activityBand ${tone}`;
  dot.className = `statusDot ${tone}`;
  el("activityText").textContent = t(labelKey);
}

function renderRecovery() {
  const panel = el("recoveryPanel");
  if (!state.lastError) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  el("recoveryTitle").textContent = state.lastError.code;
  el("recoveryMessage").textContent = state.lastError.message;
  el("recoveryAdvice").innerHTML = state.lastError.advice.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function latestCommandError() {
  return state.data.history.find((record) => record.ok === false) || null;
}

function selectedHostRecord() {
  return state.data.hosts.find((host) => host.host === state.selectedHost) || null;
}

function diagnosticRecoveryIds(id, status) {
  if (status === "ok") return [];
  return diagnosticActionMap[id] || [];
}

function diagnosticItem(id, status, labelKey, messageKey, extra = {}) {
  return { id, status, labelKey, messageKey, recoveryActionIds: diagnosticRecoveryIds(id, status), ...extra };
}

function buildPrototypeDiagnostics() {
  const host = selectedHostRecord();
  const selectedActions = state.data.trustedActions.filter((action) => action.host === state.selectedHost);
  const lastError = state.lastError || latestCommandError();
  const localService = state.lastError
    ? diagnosticItem("local-service", "error", "commandCenter.diagnostics.localService", "commandCenter.diagnostics.localService.error", { code: state.lastError.code })
    : (state.serviceOnline
      ? diagnosticItem("local-service", "ok", "commandCenter.diagnostics.localService", "commandCenter.diagnostics.localService.connected")
      : diagnosticItem("local-service", "warning", "commandCenter.diagnostics.localService", "commandCenter.diagnostics.localService.mock"));
  let heartbeat = diagnosticItem("host-heartbeat", "warning", "commandCenter.diagnostics.hostHeartbeat", "commandCenter.diagnostics.hostHeartbeat.offline", { code: "HOST_OFFLINE" });
  if (host && host.status !== "Offline" && host.lastSeenAt) {
    const ageMs = Date.now() - Date.parse(host.lastSeenAt);
    heartbeat = Number.isFinite(ageMs) && ageMs > diagnosticStaleAfterMs
      ? diagnosticItem("host-heartbeat", "warning", "commandCenter.diagnostics.hostHeartbeat", "commandCenter.diagnostics.hostHeartbeat.stale", { code: "HOST_HEARTBEAT_STALE" })
      : diagnosticItem("host-heartbeat", "ok", "commandCenter.diagnostics.hostHeartbeat", "commandCenter.diagnostics.hostHeartbeat.connected");
  }
  const actions = selectedActions.length
    ? diagnosticItem("trusted-actions", "ok", "commandCenter.diagnostics.trustedActions", "commandCenter.diagnostics.trustedActions.ready", { count: selectedActions.length })
    : diagnosticItem("trusted-actions", "warning", "commandCenter.diagnostics.trustedActions", "commandCenter.diagnostics.trustedActions.missing", { code: "CAPABILITY_MISSING" });
  const command = lastError
    ? diagnosticItem("last-command-error", "error", "commandCenter.diagnostics.lastCommand", "commandCenter.diagnostics.lastCommand.error", { code: lastError.code || "COMMAND_ERROR_PRESENT" })
    : diagnosticItem("last-command-error", "ok", "commandCenter.diagnostics.lastCommand", "commandCenter.diagnostics.lastCommand.clean");
  return [localService, heartbeat, actions, command];
}

function renderDiagnostics() {
  const items = buildPrototypeDiagnostics();
  const warning = items.filter((item) => item.status === "warning").length;
  const error = items.filter((item) => item.status === "error").length;
  el("diagnosticsSummary").textContent = `OK ${items.length - warning - error} · WARN ${warning} · ERR ${error}`;
  el("diagnosticsList").innerHTML = items.map((item) => {
    const actions = item.recoveryActionIds.map((actionId) => {
      const action = diagnosticRecoveryActions[actionId];
      return `<button class="diagnosticAction" type="button" data-diagnostic-id="${item.id}" data-diagnostic-action="${actionId}">${t(action.labelKey)}</button>`;
    }).join("");
    return `
      <article class="diagnosticItem" data-diagnostic-id="${item.id}" data-diagnostic-status="${item.status}">
        <div class="diagnosticTitle"><span class="statusDot ${item.status === "ok" ? "success" : item.status}"></span>${t(item.labelKey)}</div>
        <div class="diagnosticMessage">${t(item.messageKey)}</div>
        ${actions ? `<div class="diagnosticActions" role="group" aria-label="${t("commandCenter.diagnostics.recoveryActions")}">${actions}</div>` : ""}
      </article>
    `;
  }).join("");
  document.querySelectorAll("[data-diagnostic-action]").forEach((button) => {
    button.addEventListener("click", () => handleDiagnosticRecovery(button.dataset.diagnosticAction, button.dataset.diagnosticId));
  });
}

function readinessTone(status) {
  if (status === "ready") return "success";
  if (status === "warning") return "warning";
  return "error";
}

function readinessCheck(id, status, labelKey, messageKey, extra = {}) {
  return {
    id,
    status,
    labelKey,
    messageKey,
    drilldownTarget: readinessDrilldownTargets[id] || "diagnosticsPanel",
    ...extra
  };
}

function buildPrototypeHostReadinessGate() {
  const host = selectedHostRecord();
  const selectedActions = state.data.trustedActions.filter((action) => action.host === state.selectedHost);
  const diagnostics = buildPrototypeDiagnostics();
  const heartbeat = diagnostics.find((item) => item.id === "host-heartbeat");
  const diagnosticsWithRecovery = diagnostics
    .filter((item) => item.status !== "ok")
    .every((item) => item.recoveryActionIds.length > 0);
  const checks = [
    state.serviceOnline
      ? readinessCheck("local-service", "ready", "commandCenter.readiness.localService", "commandCenter.readiness.localService.ready")
      : readinessCheck("local-service", "blocked", "commandCenter.readiness.localService", "commandCenter.readiness.localService.blocked", { code: "LOCAL_SERVICE_REQUIRED" }),
    host && host.status !== "Offline"
      ? readinessCheck("host-target", "ready", "commandCenter.readiness.hostTarget", "commandCenter.readiness.hostTarget.ready", { host: state.selectedHost })
      : readinessCheck("host-target", "blocked", "commandCenter.readiness.hostTarget", "commandCenter.readiness.hostTarget.blocked", { code: "HOST_TARGET_UNAVAILABLE" }),
    heartbeat && heartbeat.status === "ok"
      ? readinessCheck("host-heartbeat", "ready", "commandCenter.readiness.hostHeartbeat", "commandCenter.readiness.hostHeartbeat.ready")
      : readinessCheck("host-heartbeat", "blocked", "commandCenter.readiness.hostHeartbeat", "commandCenter.readiness.hostHeartbeat.blocked", { code: heartbeat && heartbeat.code ? heartbeat.code : "HOST_HEARTBEAT_REQUIRED" }),
    selectedActions.length
      ? readinessCheck("trusted-actions", "ready", "commandCenter.readiness.trustedActions", "commandCenter.readiness.trustedActions.ready", { count: selectedActions.length })
      : readinessCheck("trusted-actions", "blocked", "commandCenter.readiness.trustedActions", "commandCenter.readiness.trustedActions.blocked", { code: "READ_ONLY_ACTIONS_REQUIRED" }),
    !state.serviceOnline
      ? readinessCheck("command-history", "blocked", "commandCenter.readiness.commandHistory", "commandCenter.readiness.commandHistory.blocked", { code: "COMMAND_HISTORY_ENDPOINT_REQUIRED" })
      : (state.data.history.length
        ? readinessCheck("command-history", "ready", "commandCenter.readiness.commandHistory", "commandCenter.readiness.commandHistory.ready", { count: state.data.history.length })
        : readinessCheck("command-history", "warning", "commandCenter.readiness.commandHistory", "commandCenter.readiness.commandHistory.warning", { code: "COMMAND_HISTORY_EMPTY" })),
    diagnosticsWithRecovery
      ? readinessCheck("diagnostic-recovery", "ready", "commandCenter.readiness.diagnosticRecovery", "commandCenter.readiness.diagnosticRecovery.ready")
      : readinessCheck("diagnostic-recovery", "blocked", "commandCenter.readiness.diagnosticRecovery", "commandCenter.readiness.diagnosticRecovery.blocked", { code: "DIAGNOSTIC_RECOVERY_ACTION_MISSING" })
  ];
  const blocked = checks.filter((item) => item.status === "blocked").length;
  const warning = checks.filter((item) => item.status === "warning").length;
  const status = blocked ? "blocked" : (warning ? "warning" : "ready");
  return {
    status,
    checks,
    summaryKey: status === "ready"
      ? "commandCenter.readiness.summary.ready"
      : (status === "warning" ? "commandCenter.readiness.summary.warning" : "commandCenter.readiness.summary.blocked"),
    summary: {
      total: checks.length,
      ready: checks.filter((item) => item.status === "ready").length,
      warning,
      blocked
    }
  };
}

function renderHostReadinessGate() {
  const gate = buildPrototypeHostReadinessGate();
  const summary = el("readinessSummary");
  summary.dataset.readinessStatus = gate.status;
  summary.textContent = `${gate.status.toUpperCase()} · READY ${gate.summary.ready} · WARN ${gate.summary.warning} · BLOCK ${gate.summary.blocked}`;
  el("readinessList").innerHTML = gate.checks.map((item) => `
    <article class="readinessItem" role="button" tabindex="0" aria-label="${t(item.labelKey)} · ${t(item.messageKey)} · ${t("commandCenter.readiness.viewRelatedArea")}" data-readiness-id="${item.id}" data-readiness-status="${item.status}" data-readiness-drilldown="${item.id}" data-readiness-target="${item.drilldownTarget}">
      <div class="readinessTitle"><span class="statusDot ${readinessTone(item.status)}"></span>${t(item.labelKey)}</div>
      <div class="readinessMessage">${t(item.messageKey)}</div>
      ${item.code ? `<div class="panelMeta">${escapeHtml(item.code)}</div>` : ""}
      <div class="readinessAction">${t("commandCenter.readiness.viewRelatedArea")} <span aria-hidden="true">↘</span></div>
    </article>
  `).join("");
  document.querySelectorAll("[data-readiness-drilldown]").forEach((item) => {
    const drilldown = () => handleReadinessDrilldown(item.dataset.readinessDrilldown, item.dataset.readinessTarget);
    item.addEventListener("click", drilldown);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        drilldown();
      }
    });
  });
}

function actionViolatesHostSmokeHandoff(actionId = "") {
  const normalized = String(actionId || "").toLowerCase();
  return hostSmokeForbiddenActionPatterns.some((pattern) => normalized.includes(pattern));
}

function isAllowedHostSmokeAction(action = {}) {
  return hostSmokeAllowedReadOnlyActions.includes(action.id)
    && action.readOnly === true
    && action.riskLevel === 0
    && !actionViolatesHostSmokeHandoff(action.id);
}

function prototypeRehearsalCheck(id, ok, extra = {}) {
  return { id, status: ok ? "pass" : "blocked", ok, ...extra };
}

function buildPrototypeMockHostSmokeRehearsal() {
  const target = state.data.target || {};
  const host = selectedHostRecord();
  const selectedActions = state.data.trustedActions.filter((action) => action.host === state.selectedHost);
  const allowedActions = selectedActions.filter((action) => isAllowedHostSmokeAction(action));
  const forbiddenActions = selectedActions.filter((action) => !isAllowedHostSmokeAction(action));
  const simulatedHistory = allowedActions.map((action) => ({
    commandId: `mock-rehearsal-${action.id}`,
    host: state.selectedHost,
    action: action.id,
    code: "TRUSTED_ACTION_EXECUTED",
    ok: true,
    durationMs: 0,
    recordedAt: host && host.lastSeenAt ? host.lastSeenAt : new Date().toISOString(),
    data: { readOnly: true, mutationPerformed: false, rehearsalOnly: true }
  }));
  const rehearsalHistory = state.data.history.length ? state.data.history : simulatedHistory;
  const allowedHistory = rehearsalHistory.filter((record) => record.host === state.selectedHost && hostSmokeAllowedReadOnlyActions.includes(record.action));
  const failedRecord = allowedHistory.find((record) => record.ok === false) || null;
  const targetLockValid = target.hostLock === true && target.targetHost === state.selectedHost;
  const requiredReadinessReady = Boolean(host && host.status !== "Offline" && targetLockValid && allowedActions.length && allowedHistory.length);
  const checks = [
    prototypeRehearsalCheck("checklist-loaded", true, { contract: "manual-handoff-only" }),
    prototypeRehearsalCheck("target-lock-valid", targetLockValid, { selectedHost: state.selectedHost, targetHost: target.targetHost || null }),
    prototypeRehearsalCheck("selected-host-connected", Boolean(host && host.status !== "Offline"), { hostStatus: host ? host.status : "Missing" }),
    prototypeRehearsalCheck("required-readiness-ready", requiredReadinessReady, { readinessStatus: requiredReadinessReady ? "ready" : "blocked" }),
    prototypeRehearsalCheck("allowed-actions-present", allowedActions.length > 0, { count: allowedActions.length, actions: allowedActions.map((action) => action.id) }),
    prototypeRehearsalCheck("forbidden-actions-absent", forbiddenActions.length === 0, { count: forbiddenActions.length, actions: forbiddenActions.map((action) => action.id) }),
    prototypeRehearsalCheck("result-history-captures-read-only-records", allowedHistory.length > 0, { count: allowedHistory.length }),
    prototypeRehearsalCheck("failure-interrupts-run", !failedRecord, { failedCommandId: failedRecord ? failedRecord.commandId : null })
  ];
  const blocked = checks.filter((item) => item.status === "blocked");
  return {
    mode: "mock-only-rehearsal",
    displayMode: "compact-read-only-panel",
    usesMockDataOnly: true,
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false,
    selectedHost: state.selectedHost,
    status: blocked.length ? "blocked" : "ready",
    canProceedToManualHostSmoke: blocked.length === 0,
    checks,
    blockedChecks: blocked.map((item) => item.id),
    allowedActions: allowedActions.map((action) => action.id),
    forbiddenActions: forbiddenActions.map((action) => action.id),
    rehearsalHistorySimulated: state.data.history.length === 0,
    simulatedResultHistory: simulatedHistory,
    lastAllowedHistoryRecord: allowedHistory[0] || null,
    interruptedByFailure: Boolean(failedRecord)
  };
}

function buildPrototypeRehearsalResultPanel() {
  const rehearsal = buildPrototypeMockHostSmokeRehearsal();
  const pass = rehearsal.checks.filter((check) => check.status === "pass").length;
  const blocked = rehearsal.checks.filter((check) => check.status === "blocked");
  return {
    sourceRehearsalMode: rehearsal.mode,
    displayMode: rehearsal.displayMode,
    status: rehearsal.status,
    tone: rehearsal.status === "ready" ? "success" : "error",
    selectedHost: rehearsal.selectedHost,
    canProceedToManualHostSmoke: rehearsal.canProceedToManualHostSmoke,
    interruptedByFailure: rehearsal.interruptedByFailure,
    failureReason: rehearsal.interruptedByFailure ? "command-result-failed" : (blocked[0] ? blocked[0].id : null),
    summary: {
      totalChecks: rehearsal.checks.length,
      pass,
      blocked: blocked.length,
      allowedActions: rehearsal.allowedActions.length,
      forbiddenActions: rehearsal.forbiddenActions.length,
      simulatedHistoryRecords: rehearsal.simulatedResultHistory.length
    },
    visibleChecks: rehearsal.checks,
    simulatedResultHistory: rehearsal.simulatedResultHistory,
    historyPreview: rehearsal.lastAllowedHistoryRecord || rehearsal.simulatedResultHistory[0] || null
  };
}

function renderRehearsalResultPanel() {
  const result = buildPrototypeRehearsalResultPanel();
  const panel = el("rehearsalResultPanel");
  const toggle = el("rehearsalToggle");
  panel.classList.toggle("collapsed", state.rehearsalCollapsed);
  toggle.setAttribute("aria-expanded", state.rehearsalCollapsed ? "false" : "true");
  toggle.textContent = state.rehearsalCollapsed ? "▸" : "▾";
  el("rehearsalMode").textContent = `${result.sourceRehearsalMode} · ${result.displayMode}`;
  const summary = el("rehearsalSummary");
  summary.dataset.rehearsalStatus = result.status;
  const summaryKey = result.status === "ready" ? "commandCenter.rehearsal.status.ready" : "commandCenter.rehearsal.status.blocked";
  const proceedKey = result.canProceedToManualHostSmoke ? "commandCenter.rehearsal.canProceed" : "commandCenter.rehearsal.cannotProceed";
  const failureText = result.failureReason ? `${t("commandCenter.rehearsal.failureReason")}: ${escapeHtml(result.failureReason)}` : t("commandCenter.rehearsal.noFailure");
  summary.innerHTML = `<span class="statusDot ${result.tone}"></span><span>${t(summaryKey)} · ${t(proceedKey)} · ${failureText}</span>`;
  const stats = [
    ["commandCenter.rehearsal.pass", `${result.summary.pass} / ${result.summary.totalChecks}`],
    ["commandCenter.rehearsal.blocked", String(result.summary.blocked)],
    ["commandCenter.rehearsal.allowed", String(result.summary.allowedActions)],
    ["commandCenter.rehearsal.simulated", String(result.summary.simulatedHistoryRecords)]
  ];
  el("rehearsalStats").innerHTML = stats.map(([key, value]) => `<div class="rehearsalStat"><span>${t(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  el("rehearsalChecks").innerHTML = result.visibleChecks.map((check) => {
    const tone = check.status === "pass" ? "success" : "error";
    const meta = [
      check.count !== undefined ? `count ${check.count}` : null,
      check.failedCommandId ? `failed ${check.failedCommandId}` : null,
      check.hostStatus ? `host ${check.hostStatus}` : null,
      check.readinessStatus ? `readiness ${check.readinessStatus}` : null
    ].filter(Boolean).join(" · ");
    return `
      <div class="rehearsalCheck" data-rehearsal-check="${check.id}" data-rehearsal-check-status="${check.status}">
        <div class="rehearsalCheckTitle"><span class="statusDot ${tone}"></span>${t(`commandCenter.rehearsal.check.${check.id}`)}</div>
        <div class="rehearsalCheckMeta">${check.status.toUpperCase()}${meta ? ` · ${escapeHtml(meta)}` : ""}</div>
      </div>
    `;
  }).join("");
  const history = result.simulatedResultHistory;
  el("rehearsalHistory").innerHTML = history.length
    ? history.map((record) => `
      <div class="rehearsalHistoryRow" data-rehearsal-history="${record.commandId}">
        <div class="rehearsalHistoryTitle"><span class="statusDot ${resultTone(record.ok)}"></span>${escapeHtml(record.action)}</div>
        <div class="rehearsalHistoryMeta">${escapeHtml(record.code)} · ${escapeHtml(record.host)} · ${t("commandCenter.rehearsal.readOnlyRecord")}</div>
      </div>
    `).join("")
    : `<div class="emptyState" data-empty-state="rehearsal-history">${t("commandCenter.rehearsal.noHistory")}</div>`;
}

function markdownList(items = []) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function buildPrototypeManualHostSmokeRunbook() {
  const readiness = buildPrototypeHostReadinessGate();
  const rehearsal = buildPrototypeRehearsalResultPanel();
  const target = state.data.target || {};
  const allowedActions = hostSmokeAllowedReadOnlyActions.filter((actionId) => {
    return state.data.trustedActions.some((action) => action.id === actionId && action.host === state.selectedHost);
  });
  const readinessBlocked = readiness.checks.filter((check) => check.status === "blocked").map((check) => check.id);
  const readinessWarnings = readiness.checks.filter((check) => check.status === "warning").map((check) => check.id);
  const rehearsalBlocked = rehearsal.visibleChecks.filter((check) => check.status === "blocked").map((check) => check.id);
  const blockedItems = Array.from(new Set([...readinessBlocked, ...rehearsalBlocked]));
  const runbook = {
    runbookId: `host-smoke-runbook-${state.selectedHost || "no-host"}`,
    title: "Kuroii Motion AI Manual Host Smoke Runbook",
    generatedAt: new Date().toISOString(),
    status: blockedItems.length ? "blocked" : "ready",
    canProceedToManualHostSmoke: blockedItems.length === 0 && rehearsal.canProceedToManualHostSmoke === true,
    selectedHost: state.selectedHost,
    targetLock: {
      hostLock: target.hostLock === true,
      targetHost: target.targetHost || null,
      matchesSelectedHost: target.hostLock === true && target.targetHost === state.selectedHost
    },
    readinessSummary: {
      status: readiness.status,
      summary: readiness.summary,
      blocked: readinessBlocked,
      warnings: readinessWarnings
    },
    rehearsalSummary: {
      status: rehearsal.status,
      failureReason: rehearsal.failureReason,
      summary: rehearsal.summary,
      blocked: rehearsalBlocked
    },
    allowedActions,
    forbiddenActionPatterns: hostSmokeForbiddenActionPatterns,
    manualSteps: hostSmokeManualSteps,
    rollbackNotes: hostSmokeRollbackNotes,
    blockedItems,
    safetySummary: [
      "No automatic AE/PR launch.",
      "Use only a disposable or backed-up project copy.",
      "Run only allowlisted risk-0 read-only actions.",
      "Stop immediately on stale heartbeat, target mismatch, command failure, or mutation warning."
    ],
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
  const markdown = [
    `# ${runbook.title}`,
    "",
    `- Runbook ID: ${runbook.runbookId}`,
    `- Generated At: ${runbook.generatedAt}`,
    `- Selected Host: ${runbook.selectedHost || "none"}`,
    `- Status: ${runbook.status}`,
    `- Can Proceed To Manual Host Smoke: ${runbook.canProceedToManualHostSmoke ? "yes" : "no"}`,
    "",
    "## Safety Summary",
    markdownList(runbook.safetySummary),
    "",
    "## Target Lock",
    `- Host Lock: ${runbook.targetLock.hostLock ? "true" : "false"}`,
    `- Target Host: ${runbook.targetLock.targetHost || "none"}`,
    `- Matches Selected Host: ${runbook.targetLock.matchesSelectedHost ? "true" : "false"}`,
    "",
    "## Readiness Summary",
    `- Status: ${runbook.readinessSummary.status}`,
    `- Blocked: ${runbook.readinessSummary.blocked.length ? runbook.readinessSummary.blocked.join(", ") : "none"}`,
    `- Warnings: ${runbook.readinessSummary.warnings.length ? runbook.readinessSummary.warnings.join(", ") : "none"}`,
    "",
    "## Rehearsal Summary",
    `- Status: ${runbook.rehearsalSummary.status}`,
    `- Failure Reason: ${runbook.rehearsalSummary.failureReason || "none"}`,
    `- Blocked: ${runbook.rehearsalSummary.blocked.length ? runbook.rehearsalSummary.blocked.join(", ") : "none"}`,
    "",
    "## Allowed Read-only Actions",
    markdownList(runbook.allowedActions),
    "",
    "## Manual Steps",
    markdownList(runbook.manualSteps.map((step) => `${step.id}: ${step.target} -> ${step.expected}`)),
    "",
    "## Rollback Notes",
    markdownList(runbook.rollbackNotes)
  ].join("\n");
  return {
    ...runbook,
    markdown,
    json: JSON.stringify(runbook, null, 2)
  };
}

function runbookFeedbackTone(result) {
  if (result === "success") return "success";
  if (result === "failed") return "error";
  return "muted";
}

function buildPrototypeRunbookExportFeedbackState(runbook, feedback = {}) {
  const persistedState = feedback.persistedState || state.runbookExportFeedbackState || {};
  const lastAction = feedback.lastAction || persistedState.lastAction || "generated";
  const lastFormat = Object.prototype.hasOwnProperty.call(feedback, "lastFormat")
    ? feedback.lastFormat
    : (persistedState.lastFormat || null);
  const lastResult = feedback.lastResult || persistedState.lastResult || "success";
  const recordedAt = feedback.recordedAt || new Date().toISOString();
  const isExportAction = lastAction.startsWith("export-");
  const lastMessageKey = feedback.lastMessageKey || persistedState.lastMessageKey || "commandCenter.runbook.feedback.generated";
  const persisted = {
    runbookId: runbook.runbookId,
    selectedHost: runbook.selectedHost,
    runbookStatus: runbook.status,
    lastAction,
    lastFormat,
    lastResult,
    lastGeneratedAt: runbook.generatedAt || persistedState.lastGeneratedAt || recordedAt,
    lastExportedAt: feedback.lastExportedAt || (isExportAction ? recordedAt : persistedState.lastExportedAt) || null,
    lastMessageKey
  };
  return {
    storageKey: runbookExportFeedbackStorageKey,
    runbookId: runbook.runbookId,
    selectedHost: runbook.selectedHost,
    runbookStatus: runbook.status,
    canProceedToManualHostSmoke: runbook.canProceedToManualHostSmoke,
    lastAction,
    lastFormat,
    lastResult,
    tone: runbookFeedbackTone(lastResult),
    lastMessageKey,
    persisted,
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
}

function saveRunbookExportFeedbackState(runbook, feedback = {}) {
  const nextState = buildPrototypeRunbookExportFeedbackState(runbook, feedback);
  state.runbookExportFeedbackState = nextState.persisted;
  writePersistedRunbookFeedbackState(nextState.persisted);
  return nextState;
}

function ensureGeneratedRunbookFeedbackState(runbook) {
  if (!state.runbookExportFeedbackState || state.runbookExportFeedbackState.runbookId !== runbook.runbookId || state.runbookExportFeedbackState.runbookStatus !== runbook.status) {
    return saveRunbookExportFeedbackState(runbook, {
      lastAction: "generated",
      lastFormat: null,
      lastResult: "success",
      lastMessageKey: "commandCenter.runbook.feedback.generated",
      recordedAt: runbook.generatedAt
    });
  }
  return buildPrototypeRunbookExportFeedbackState(runbook);
}

function renderRunbookFeedback(feedback) {
  const node = el("runbookFeedback");
  node.dataset.runbookFeedbackResult = feedback.lastResult;
  node.dataset.runbookLastAction = feedback.lastAction;
  node.innerHTML = `
    <span class="statusDot ${feedback.tone}"></span>
    <span>${t(feedback.lastMessageKey)}</span>
    <span class="runbookFeedbackMeta">${t("commandCenter.runbook.feedback.lastAction")}: ${escapeHtml(feedback.lastAction)}${feedback.lastFormat ? ` · ${escapeHtml(feedback.lastFormat)}` : ""} · ${escapeHtml(feedback.selectedHost || "none")} · ${t("commandCenter.runbook.feedback.persisted")}</span>
  `;
}

function renderManualHostSmokeRunbook() {
  const runbook = buildPrototypeManualHostSmokeRunbook();
  el("runbookMeta").textContent = `${runbook.status} · ${runbook.runbookId}`;
  const summary = el("runbookSummary");
  summary.dataset.runbookStatus = runbook.status;
  const summaryKey = runbook.status === "ready" ? "commandCenter.runbook.status.ready" : "commandCenter.runbook.status.blocked";
  const proceedKey = runbook.canProceedToManualHostSmoke ? "commandCenter.runbook.canProceed" : "commandCenter.runbook.cannotProceed";
  summary.innerHTML = `<span class="statusDot ${runbook.status === "ready" ? "success" : "error"}"></span><span>${t(summaryKey)} · ${t(proceedKey)} · ${runbook.blockedItems.length ? runbook.blockedItems.join(", ") : t("commandCenter.rehearsal.noFailure")}</span>`;
  renderRunbookFeedback(ensureGeneratedRunbookFeedbackState(runbook));
  el("runbookPreview").textContent = runbook.markdown;
}

async function copyManualHostSmokeRunbook() {
  const runbook = buildPrototypeManualHostSmokeRunbook();
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(runbook.markdown);
    } else {
      throw new Error("Clipboard API unavailable");
    }
    el("runbookMeta").textContent = t("commandCenter.runbook.copyOk");
    renderRunbookFeedback(saveRunbookExportFeedbackState(runbook, {
      lastAction: "copy-success",
      lastFormat: "markdown",
      lastResult: "success",
      lastMessageKey: "commandCenter.runbook.feedback.copySuccess",
      recordedAt: new Date().toISOString()
    }));
  } catch (error) {
    el("runbookMeta").textContent = t("commandCenter.runbook.copyFailed");
    renderRunbookFeedback(saveRunbookExportFeedbackState(runbook, {
      lastAction: "copy-failed",
      lastFormat: "markdown",
      lastResult: "failed",
      lastMessageKey: "commandCenter.runbook.feedback.copyFailed",
      recordedAt: new Date().toISOString()
    }));
    el("runbookPreview").focus();
  }
}

function exportManualHostSmokeRunbook(format = "markdown") {
  const runbook = buildPrototypeManualHostSmokeRunbook();
  try {
    const isJson = format === "json";
    const content = isJson ? runbook.json : runbook.markdown;
    const extension = isJson ? "json" : "md";
    const mime = isJson ? "application/json" : "text/markdown";
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${runbook.runbookId}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    renderRunbookFeedback(saveRunbookExportFeedbackState(runbook, {
      lastAction: isJson ? "export-json-success" : "export-markdown-success",
      lastFormat: isJson ? "json" : "markdown",
      lastResult: "success",
      lastMessageKey: isJson ? "commandCenter.runbook.feedback.exportJsonSuccess" : "commandCenter.runbook.feedback.exportMarkdownSuccess",
      recordedAt: new Date().toISOString()
    }));
  } catch (error) {
    renderRunbookFeedback(saveRunbookExportFeedbackState(runbook, {
      lastAction: "export-failed",
      lastFormat: format,
      lastResult: "failed",
      lastMessageKey: "commandCenter.runbook.feedback.exportFailed",
      recordedAt: new Date().toISOString()
    }));
    el("runbookPreview").focus();
  }
}

function buildPrototypeManualHostSmokeEvidencePack() {
  const runbook = buildPrototypeManualHostSmokeRunbook();
  const feedback = buildPrototypeRunbookExportFeedbackState(runbook);
  const notesText = String(state.evidencePackNotes || "").trim();
  const runbookExportSummary = {
    storageKey: runbookExportFeedbackStorageKey,
    lastAction: feedback.lastAction || "generated",
    lastFormat: feedback.lastFormat || null,
    lastResult: feedback.lastResult || "success",
    lastMessageKey: feedback.lastMessageKey || null,
    lastGeneratedAt: feedback.persisted.lastGeneratedAt || runbook.generatedAt,
    lastExportedAt: feedback.persisted.lastExportedAt || null
  };
  const evidencePack = {
    evidencePackId: `host-smoke-evidence-${runbook.selectedHost || "no-host"}`,
    title: "Kuroii Motion AI Manual Host Smoke Evidence Pack",
    generatedAt: new Date().toISOString(),
    displayMode: "local-read-only-evidence-pack",
    selectedHost: runbook.selectedHost,
    status: runbook.canProceedToManualHostSmoke && runbookExportSummary.lastResult === "success" ? "ready" : "blocked",
    canProceedToManualHostSmoke: runbook.canProceedToManualHostSmoke === true && runbookExportSummary.lastResult === "success",
    targetLock: runbook.targetLock,
    readinessSummary: runbook.readinessSummary,
    runbookSummary: {
      runbookId: runbook.runbookId,
      status: runbook.status,
      canProceedToManualHostSmoke: runbook.canProceedToManualHostSmoke,
      generatedAt: runbook.generatedAt,
      blockedItems: runbook.blockedItems
    },
    runbookExportSummary,
    allowedActions: runbook.allowedActions,
    manualReviewerNotes: {
      text: notesText,
      status: notesText ? "provided" : "empty",
      requiredBeforeHostSmoke: true,
      containsSensitiveDataAllowed: false
    },
    safetySummary: [
      "No automatic AE/PR launch.",
      "No real host action is executed by this evidence pack.",
      "Only allowlisted risk-0 read-only actions may be used in a later manual smoke.",
      "Manual reviewer notes stay local and must not include API keys, tokens, or private project content."
    ],
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
  const markdown = [
    `# ${evidencePack.title}`,
    "",
    `- Evidence Pack ID: ${evidencePack.evidencePackId}`,
    `- Generated At: ${evidencePack.generatedAt}`,
    `- Selected Host: ${evidencePack.selectedHost || "none"}`,
    `- Status: ${evidencePack.status}`,
    `- Can Proceed To Manual Host Smoke: ${evidencePack.canProceedToManualHostSmoke ? "yes" : "no"}`,
    `- Automatic Host Launch Allowed: ${evidencePack.automaticHostLaunchAllowed ? "true" : "false"}`,
    `- Read Only Only: ${evidencePack.readOnlyOnly ? "true" : "false"}`,
    `- Host Mutation Allowed: ${evidencePack.hostMutationAllowed ? "true" : "false"}`,
    "",
    "## Safety Summary",
    markdownList(evidencePack.safetySummary),
    "",
    "## Target Lock",
    `- Host Lock: ${evidencePack.targetLock.hostLock ? "true" : "false"}`,
    `- Target Host: ${evidencePack.targetLock.targetHost || "none"}`,
    `- Matches Selected Host: ${evidencePack.targetLock.matchesSelectedHost ? "true" : "false"}`,
    "",
    "## Readiness Summary",
    `- Status: ${evidencePack.readinessSummary.status}`,
    `- Blocked: ${evidencePack.readinessSummary.blocked.length ? evidencePack.readinessSummary.blocked.join(", ") : "none"}`,
    `- Warnings: ${evidencePack.readinessSummary.warnings.length ? evidencePack.readinessSummary.warnings.join(", ") : "none"}`,
    "",
    "## Runbook Summary",
    `- Runbook ID: ${evidencePack.runbookSummary.runbookId}`,
    `- Runbook Status: ${evidencePack.runbookSummary.status}`,
    `- Blocked Items: ${evidencePack.runbookSummary.blockedItems.length ? evidencePack.runbookSummary.blockedItems.join(", ") : "none"}`,
    "",
    "## Runbook Export Summary",
    `- Last Action: ${evidencePack.runbookExportSummary.lastAction}`,
    `- Last Format: ${evidencePack.runbookExportSummary.lastFormat || "none"}`,
    `- Last Result: ${evidencePack.runbookExportSummary.lastResult}`,
    `- Last Exported At: ${evidencePack.runbookExportSummary.lastExportedAt || "none"}`,
    "",
    "## Allowed Read-only Actions",
    markdownList(evidencePack.allowedActions),
    "",
    "## Manual Reviewer Notes",
    evidencePack.manualReviewerNotes.text || "None"
  ].join("\n");
  return {
    ...evidencePack,
    markdown,
    json: JSON.stringify(evidencePack, null, 2)
  };
}

function renderManualHostSmokeEvidencePack() {
  const evidencePack = buildPrototypeManualHostSmokeEvidencePack();
  el("evidencePackMeta").textContent = `${evidencePack.status} · ${evidencePack.evidencePackId}`;
  const summary = el("evidencePackSummary");
  summary.dataset.evidencePackStatus = evidencePack.status;
  const summaryKey = evidencePack.status === "ready" ? "commandCenter.evidencePack.status.ready" : "commandCenter.evidencePack.status.blocked";
  const proceedKey = evidencePack.canProceedToManualHostSmoke ? "commandCenter.evidencePack.canProceed" : "commandCenter.evidencePack.cannotProceed";
  const notesText = evidencePack.manualReviewerNotes.status === "provided" ? t("commandCenter.evidencePack.notesSaved") : t("commandCenter.evidencePack.notesLabel");
  summary.innerHTML = `<span class="statusDot ${evidencePack.status === "ready" ? "success" : "error"}"></span><span>${t(summaryKey)} · ${t(proceedKey)} · ${notesText}</span>`;
  if (document.activeElement !== el("evidenceNotesInput")) {
    el("evidenceNotesInput").value = state.evidencePackNotes || "";
  }
  el("evidencePackPreview").textContent = evidencePack.markdown;
}

async function copyManualHostSmokeEvidencePack() {
  const evidencePack = buildPrototypeManualHostSmokeEvidencePack();
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(evidencePack.markdown);
    } else {
      throw new Error("Clipboard API unavailable");
    }
    el("evidencePackMeta").textContent = t("commandCenter.evidencePack.copyOk");
  } catch (error) {
    el("evidencePackMeta").textContent = t("commandCenter.evidencePack.copyFailed");
    el("evidencePackPreview").focus();
  }
}

function exportManualHostSmokeEvidencePack(format = "markdown") {
  const evidencePack = buildPrototypeManualHostSmokeEvidencePack();
  try {
    const isJson = format === "json";
    const content = isJson ? evidencePack.json : evidencePack.markdown;
    const extension = isJson ? "json" : "md";
    const mime = isJson ? "application/json" : "text/markdown";
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${evidencePack.evidencePackId}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    el("evidencePackMeta").textContent = t(isJson ? "commandCenter.evidencePack.exportJsonSuccess" : "commandCenter.evidencePack.exportMarkdownSuccess");
  } catch (error) {
    el("evidencePackMeta").textContent = t("commandCenter.evidencePack.exportFailed");
    el("evidencePackPreview").focus();
  }
}

function checkedReviewItemsSet() {
  const checked = state.reviewChecklistState && Array.isArray(state.reviewChecklistState.checkedItems)
    ? state.reviewChecklistState.checkedItems
    : [];
  return new Set(checked);
}

function prototypeReviewChecklistItem(id, labelKey, conditionSatisfied, checkedItems, details = {}) {
  const checked = checkedItems.has(id);
  return {
    id,
    labelKey,
    checked,
    conditionSatisfied,
    status: conditionSatisfied ? (checked ? "ready" : "needs-review") : "blocked",
    ...details
  };
}

function buildPrototypeManualHostSmokeReviewChecklist() {
  const evidencePack = buildPrototypeManualHostSmokeEvidencePack();
  const checkedItems = checkedReviewItemsSet();
  const readinessBlocked = evidencePack.readinessSummary.blocked || [];
  const notes = evidencePack.manualReviewerNotes || {};
  const runbookExport = evidencePack.runbookExportSummary || {};
  const targetLock = evidencePack.targetLock || {};
  const safetyFlagsReady = evidencePack.automaticHostLaunchAllowed === false && evidencePack.readOnlyOnly === true && evidencePack.hostMutationAllowed === false;
  const reviewItems = [
    prototypeReviewChecklistItem("evidence-pack-generated", "commandCenter.reviewChecklist.item.evidencePackGenerated", Boolean(evidencePack.evidencePackId && evidencePack.generatedAt), checkedItems, { evidencePackId: evidencePack.evidencePackId }),
    prototypeReviewChecklistItem("project-copy-confirmed", "commandCenter.reviewChecklist.item.projectCopyConfirmed", true, checkedItems, { manualConfirmationRequired: true }),
    prototypeReviewChecklistItem("target-lock-reviewed", "commandCenter.reviewChecklist.item.targetLockReviewed", targetLock.hostLock === true && targetLock.matchesSelectedHost === true, checkedItems, { targetHost: targetLock.targetHost || null }),
    prototypeReviewChecklistItem("readiness-blockers-reviewed", "commandCenter.reviewChecklist.item.readinessBlockersReviewed", readinessBlocked.length === 0, checkedItems, { blockedItems: readinessBlocked }),
    prototypeReviewChecklistItem("runbook-export-reviewed", "commandCenter.reviewChecklist.item.runbookExportReviewed", runbookExport.lastResult === "success", checkedItems, { lastAction: runbookExport.lastAction || null, lastFormat: runbookExport.lastFormat || null }),
    prototypeReviewChecklistItem("allowed-actions-reviewed", "commandCenter.reviewChecklist.item.allowedActionsReviewed", evidencePack.allowedActions.length > 0, checkedItems, { count: evidencePack.allowedActions.length }),
    prototypeReviewChecklistItem("manual-notes-reviewed", "commandCenter.reviewChecklist.item.manualNotesReviewed", notes.status === "provided" && Boolean(notes.text), checkedItems, { notesStatus: notes.status || "empty" }),
    prototypeReviewChecklistItem("sensitive-data-reviewed", "commandCenter.reviewChecklist.item.sensitiveDataReviewed", notes.containsSensitiveDataAllowed === false, checkedItems, { containsSensitiveDataAllowed: notes.containsSensitiveDataAllowed === true }),
    prototypeReviewChecklistItem("manual-launch-only-confirmed", "commandCenter.reviewChecklist.item.manualLaunchOnlyConfirmed", safetyFlagsReady, checkedItems, { automaticHostLaunchAllowed: evidencePack.automaticHostLaunchAllowed, hostMutationAllowed: evidencePack.hostMutationAllowed })
  ];
  const summary = {
    total: reviewItems.length,
    ready: reviewItems.filter((item) => item.status === "ready").length,
    needsReview: reviewItems.filter((item) => item.status === "needs-review").length,
    blocked: reviewItems.filter((item) => item.status === "blocked").length,
    checked: reviewItems.filter((item) => item.checked).length
  };
  const status = summary.blocked ? "blocked" : (summary.needsReview ? "needs-review" : "ready");
  return {
    checklistId: `host-smoke-review-${evidencePack.selectedHost || "no-host"}`,
    title: "Kuroii Motion AI Manual Host Smoke Review Checklist",
    displayMode: "manual-host-smoke-review-checklist",
    sourceEvidencePackId: evidencePack.evidencePackId,
    selectedHost: evidencePack.selectedHost,
    generatedAt: new Date().toISOString(),
    status,
    canProceedToManualHostSmoke: status === "ready",
    reviewItems,
    summary,
    persisted: {
      storageKey: reviewChecklistStorageKey,
      checkedItems: reviewItems.filter((item) => item.checked).map((item) => item.id),
      checklistId: `host-smoke-review-${evidencePack.selectedHost || "no-host"}`,
      sourceEvidencePackId: evidencePack.evidencePackId,
      selectedHost: evidencePack.selectedHost,
      lastUpdatedAt: new Date().toISOString()
    },
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
}

function saveReviewChecklistCheckedItems(checkedItems) {
  state.reviewChecklistState = {
    storageKey: reviewChecklistStorageKey,
    checkedItems,
    lastUpdatedAt: new Date().toISOString()
  };
  writePersistedReviewChecklistState(state.reviewChecklistState);
}

function toggleReviewChecklistItem(itemId, checked) {
  const checkedItems = checkedReviewItemsSet();
  if (checked) {
    checkedItems.add(itemId);
  } else {
    checkedItems.delete(itemId);
  }
  saveReviewChecklistCheckedItems(Array.from(checkedItems));
  renderManualHostSmokeReviewChecklist();
}

function resetReviewChecklist() {
  saveReviewChecklistCheckedItems([]);
  requestFocus("manualHostSmokeReviewChecklistPanel");
  render();
}

function renderManualHostSmokeReviewChecklist() {
  const checklist = buildPrototypeManualHostSmokeReviewChecklist();
  el("reviewChecklistMeta").textContent = `${checklist.status} · ${checklist.checklistId}`;
  const summary = el("reviewChecklistSummary");
  summary.dataset.reviewChecklistStatus = checklist.status;
  const statusKey = checklist.status === "ready"
    ? "commandCenter.reviewChecklist.status.ready"
    : (checklist.status === "needs-review" ? "commandCenter.reviewChecklist.status.needsReview" : "commandCenter.reviewChecklist.status.blocked");
  summary.innerHTML = `<span class="statusDot ${checklist.status === "ready" ? "success" : (checklist.status === "needs-review" ? "warning" : "error")}"></span><span>${t(statusKey)} · ${t("commandCenter.reviewChecklist.summary")}: ${checklist.summary.ready}/${checklist.summary.total} · ${t("commandCenter.reviewChecklist.blocked")}: ${checklist.summary.blocked}</span>`;
  el("reviewChecklistList").innerHTML = checklist.reviewItems.map((item) => {
    const disabled = item.conditionSatisfied ? "" : "disabled";
    const statusText = item.status === "ready"
      ? t("commandCenter.reviewChecklist.ready")
      : (item.status === "needs-review" ? t("commandCenter.reviewChecklist.needsReview") : t("commandCenter.reviewChecklist.blocked"));
    const meta = [
      item.count !== undefined ? `count ${item.count}` : null,
      item.targetHost ? `target ${item.targetHost}` : null,
      item.lastAction ? `last ${item.lastAction}` : null,
      item.notesStatus ? `notes ${item.notesStatus}` : null,
      item.blockedItems && item.blockedItems.length ? `blocked ${item.blockedItems.join(", ")}` : null
    ].filter(Boolean).join(" · ");
    return `
      <label class="reviewChecklistItem" data-review-checklist-item="${item.id}" data-review-checklist-status="${item.status}">
        <input type="checkbox" data-review-checklist-toggle="${item.id}" ${item.checked ? "checked" : ""} ${disabled}>
        <span class="reviewChecklistText">
          <span class="reviewChecklistTitle">${t(item.labelKey)}</span>
          <span class="reviewChecklistMeta">${statusText}${meta ? ` · ${escapeHtml(meta)}` : ""}</span>
        </span>
      </label>
    `;
  }).join("");
  document.querySelectorAll("[data-review-checklist-toggle]").forEach((input) => {
    input.addEventListener("change", (event) => {
      toggleReviewChecklistItem(event.target.dataset.reviewChecklistToggle, event.target.checked);
    });
  });
}

function buildPrototypeVisualPreviewPass() {
  const actionCount = (hostId) => state.data.trustedActions.filter((action) => action.host === hostId).length;
  const hostStatus = (hostId) => {
    const host = state.data.hosts.find((item) => item.host === hostId);
    return host ? host.status : "preview-only";
  };
  const surfaces = [
    {
      id: "desktop",
      icon: "D",
      labelKey: "commandCenter.visualPreview.surface.desktop",
      profile: "Desktop",
      density: "comfortable",
      brandLevel: "L1/L2",
      status: "preview-ready",
      tone: "success",
      actionCount: state.data.trustedActions.length,
      widthChecks: ["LG", "XL"],
      zones: ["topbar", "sidebar", "command-workspace", "visual-preview-panel"],
      notesKey: "commandCenter.visualPreview.notes.desktop"
    },
    {
      id: "after-effects",
      icon: "AE",
      labelKey: "commandCenter.visualPreview.surface.afterEffects",
      profile: "Adobe Extension",
      density: "compact",
      brandLevel: "L0/L1",
      status: hostStatus("after-effects"),
      tone: statusTone(hostStatus("after-effects")),
      actionCount: actionCount("after-effects"),
      widthChecks: ["240px", "320px", "420px"],
      zones: ["compact-header", "status-strip", "read-only-actions", "event-log"],
      notesKey: "commandCenter.visualPreview.notes.afterEffects"
    },
    {
      id: "premiere-pro",
      icon: "PR",
      labelKey: "commandCenter.visualPreview.surface.premierePro",
      profile: "Adobe Extension",
      density: "compact",
      brandLevel: "L0/L1",
      status: hostStatus("premiere-pro"),
      tone: statusTone(hostStatus("premiere-pro")),
      actionCount: actionCount("premiere-pro"),
      widthChecks: ["240px", "320px", "420px"],
      zones: ["compact-header", "status-strip", "sequence-context", "event-log"],
      notesKey: "commandCenter.visualPreview.notes.premierePro"
    }
  ];
  return {
    status: "preview-ready",
    displayMode: "desktop-ae-pr-visual-preview-pass",
    surfaces,
    summary: {
      total: surfaces.length,
      compact: surfaces.filter((surface) => surface.density === "compact").length,
      readOnlyActions: state.data.trustedActions.length
    },
    safety: {
      automaticHostLaunchAllowed: false,
      realHostSmokeAllowed: false,
      hostMutationAllowed: false,
      readOnlyOnly: true
    }
  };
}

function renderVisualPreviewPass() {
  const preview = buildPrototypeVisualPreviewPass();
  el("visualPreviewMeta").textContent = `${preview.displayMode} · ${preview.summary.total} surfaces`;
  el("visualPreviewSummary").innerHTML = `
    <span class="statusDot success"></span>
    <span>${t("commandCenter.visualPreview.summary")}</span>
  `;
  el("visualPreviewGrid").innerHTML = preview.surfaces.map((surface) => `
    <article class="visualSurfaceCard" data-visual-preview-surface="${surface.id}">
      <div class="visualSurfaceTop">
        <span class="visualSurfaceIcon" aria-hidden="true">${escapeHtml(surface.icon)}</span>
        <div>
          <div class="visualSurfaceTitle">${t(surface.labelKey)}</div>
          <div class="visualSurfaceMeta"><span class="statusDot ${surface.tone}"></span>${escapeHtml(surface.status)}</div>
        </div>
      </div>
      <dl class="visualSurfaceFacts">
        <dt>${t("commandCenter.visualPreview.profile")}</dt><dd>${escapeHtml(surface.profile)}</dd>
        <dt>${t("commandCenter.visualPreview.density")}</dt><dd>${escapeHtml(surface.density)}</dd>
        <dt>${t("commandCenter.visualPreview.brandLevel")}</dt><dd>${escapeHtml(surface.brandLevel)}</dd>
        <dt>${t("commandCenter.visualPreview.widthChecks")}</dt><dd>${escapeHtml(surface.widthChecks.join(" / "))}</dd>
        <dt>${t("commandCenter.visualPreview.actions")}</dt><dd>${surface.actionCount}</dd>
      </dl>
      <p class="visualSurfaceNote">${t(surface.notesKey)}</p>
      <span class="readOnlyBadge">${t("commandCenter.visualPreview.previewOnly")}</span>
    </article>
  `).join("");
  el("visualOverviewToggle").textContent = state.visualOverviewOpen
    ? t("commandCenter.visualPreview.overviewClose")
    : t("commandCenter.visualPreview.overviewToggle");
  el("visualOverviewToggle").setAttribute("aria-expanded", state.visualOverviewOpen ? "true" : "false");
  el("visualOverviewDrawer").hidden = !state.visualOverviewOpen;
  el("visualOverviewDrawer").innerHTML = `
    <div class="visualDrawerTitle">${t("commandCenter.visualPreview.drawerTitle")}</div>
    <ul>
      <li>${t("commandCenter.visualPreview.drawerDesktop")}</li>
      <li>${t("commandCenter.visualPreview.drawerAe")}</li>
      <li>${t("commandCenter.visualPreview.drawerPr")}</li>
      <li>${t("commandCenter.visualPreview.drawerSafety")}</li>
    </ul>
  `;
}

const visualReviewScoreCategories = [
  "theme-completeness",
  "localization",
  "responsive-layout",
  "component-states",
  "icons-tooltips",
  "accessibility",
  "brand-consistency",
  "loading-error-empty",
  "visual-regression-self-check"
];
const visualSignoffStatuses = ["pending-review", "accepted", "blocked", "needs-recheck"];
const visualFindingTypes = [
  "unreadable-text",
  "horizontal-overflow",
  "missing-tooltip",
  "placeholder-question-marks",
  "contrast",
  "layout",
  "copy",
  "brand-consistency"
];

function visualReviewFileName(surface, theme, locale, layout, width, dpi) {
  return `v0.5.6_${surface}_${theme}_${locale}_${layout}_${width}_${dpi}.png`;
}

function buildPrototypeVisualReviewMatrix() {
  const matrixItems = [
    ["desktop-dark-zh-expanded", "desktop", "dark", "zh-CN", "expanded", "XL", "100", "commandCenter.visualReview.notes.desktopExpanded"],
    ["desktop-dark-en-collapsed", "desktop", "dark", "en-US", "collapsed", "XL", "125", "commandCenter.visualReview.notes.desktopCollapsed"],
    ["desktop-light-zh-expanded", "desktop", "light", "zh-CN", "expanded", "LG", "100", "commandCenter.visualReview.notes.lightTheme"],
    ["desktop-light-en-collapsed", "desktop", "light", "en-US", "collapsed", "LG", "125", "commandCenter.visualReview.notes.englishDensity"],
    ["ae-compact-240-dark-zh", "after-effects", "dark", "zh-CN", "compact", "240px", "100", "commandCenter.visualReview.notes.aeNarrow"],
    ["ae-compact-320-dark-en", "after-effects", "dark", "en-US", "compact", "320px", "125", "commandCenter.visualReview.notes.aeEnglish"],
    ["ae-compact-420-light-zh", "after-effects", "light", "zh-CN", "compact", "420px", "100", "commandCenter.visualReview.notes.aeLight"],
    ["pr-compact-240-dark-zh", "premiere-pro", "dark", "zh-CN", "compact", "240px", "100", "commandCenter.visualReview.notes.prNarrow"],
    ["pr-compact-320-dark-en", "premiere-pro", "dark", "en-US", "compact", "320px", "125", "commandCenter.visualReview.notes.prEnglish"],
    ["pr-compact-420-light-zh", "premiere-pro", "light", "zh-CN", "compact", "420px", "100", "commandCenter.visualReview.notes.prLight"]
  ].map(([id, surface, theme, locale, layout, width, dpi, notesKey]) => ({
    id,
    surface,
    theme,
    locale,
    layout,
    width,
    dpi,
    notesKey,
    status: "pending-review",
    screenshotFileName: visualReviewFileName(surface, theme, locale, layout, width, dpi)
  }));
  const blockers = [
    "unreadable-text",
    "horizontal-overflow",
    "missing-tooltip",
    "placeholder-question-marks",
    "auto-host-launch",
    "host-mutation-control"
  ];
  return {
    status: "pending-review",
    displayMode: "visual-review-matrix-and-screenshot-checklist",
    minimumScore: 85,
    matrixItems,
    scorecard: visualReviewScoreCategories.map((id) => ({
      id,
      maxScore: id === "theme-completeness" || id === "component-states" ? 15 : 10,
      status: "pending-review"
    })),
    blockers,
    safety: {
      automaticHostLaunchAllowed: false,
      realHostSmokeAllowed: false,
      hostMutationAllowed: false,
      readOnlyOnly: true
    }
  };
}

function renderVisualReviewMatrix() {
  const review = buildPrototypeVisualReviewMatrix();
  el("visualReviewMeta").textContent = `${review.displayMode} · ${review.matrixItems.length} shots`;
  el("visualReviewScoreMeta").textContent = `${t("commandCenter.visualReview.minimumScore")} ${review.minimumScore}`;
  el("visualReviewSummary").innerHTML = `
    <span class="statusDot warning"></span>
    <span>${t("commandCenter.visualReview.summary")}</span>
  `;
  el("visualReviewGrid").innerHTML = review.matrixItems.map((item) => `
    <article class="visualReviewItem" data-visual-review-item="${item.id}">
      <div class="visualReviewItemTop">
        <span class="readOnlyBadge">${escapeHtml(item.surface)}</span>
        <span class="panelMeta">${escapeHtml(item.theme)} · ${escapeHtml(item.locale)} · ${escapeHtml(item.width)}</span>
      </div>
      <div class="visualReviewId">${escapeHtml(item.id)}</div>
      <div class="visualReviewNote">${t(item.notesKey)}</div>
      <div class="visualReviewFile"><strong>${t("commandCenter.visualReview.fileName")}</strong><span>${escapeHtml(item.screenshotFileName)}</span></div>
      <span class="visualReviewStatus">${t("commandCenter.visualReview.pending")}</span>
    </article>
  `).join("");
  el("visualScorecard").innerHTML = `
    <div class="visualReviewSubhead">${t("commandCenter.visualReview.scorecard")}</div>
    <div class="visualScoreGrid">
      ${review.scorecard.map((item) => `
        <div class="visualScoreItem" data-visual-score="${item.id}">
          <span>${escapeHtml(item.id)}</span>
          <strong>${item.maxScore}</strong>
        </div>
      `).join("")}
    </div>
  `;
  el("visualBlockers").innerHTML = `
    <div class="visualReviewSubhead">${t("commandCenter.visualReview.blockers")}</div>
    <div class="visualBlockerList">
      ${review.blockers.map((id) => `
        <div class="visualBlocker" data-visual-blocker="${id}">
          <span class="statusDot warning"></span>
          <span>${t(`commandCenter.visualReview.blocker.${id}`)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function normalizePrototypeVisualSignoffState() {
  const source = state.visualSignoffState || {};
  return {
    statuses: source.statuses && typeof source.statuses === "object" ? source.statuses : {},
    findings: Array.isArray(source.findings) ? source.findings : []
  };
}

function visualSignoffLabelKey(status) {
  if (status === "accepted") return "commandCenter.visualSignoff.accepted";
  if (status === "blocked") return "commandCenter.visualSignoff.blocked";
  if (status === "needs-recheck") return "commandCenter.visualSignoff.needsRecheck";
  return "commandCenter.visualSignoff.pending";
}

function visualSignoffTone(status) {
  if (status === "accepted") return "success";
  if (status === "blocked") return "error";
  if (status === "needs-recheck") return "warning";
  return "muted";
}

function buildPrototypeVisualSignoffState() {
  const review = buildPrototypeVisualReviewMatrix();
  const persisted = normalizePrototypeVisualSignoffState();
  const matrixIds = new Set(review.matrixItems.map((item) => item.id));
  const findings = persisted.findings.map((finding, index) => ({
    id: finding.id || `visual-finding-${index + 1}`,
    matrixItemId: finding.matrixItemId,
    type: visualFindingTypes.includes(finding.type) ? finding.type : "layout",
    severity: ["low", "medium", "high", "blocker"].includes(finding.severity) ? finding.severity : "medium",
    status: finding.status === "resolved" ? "resolved" : "open",
    note: finding.note || "",
    createdAt: finding.createdAt || "",
    updatedAt: finding.updatedAt || finding.createdAt || "",
    orphaned: !matrixIds.has(finding.matrixItemId)
  }));
  const openFindingCountByItem = findings.reduce((acc, finding) => {
    if (finding.status !== "resolved" && !finding.orphaned) {
      acc[finding.matrixItemId] = (acc[finding.matrixItemId] || 0) + 1;
    }
    return acc;
  }, {});
  const signoffItems = review.matrixItems.map((item) => {
    const saved = persisted.statuses[item.id] || {};
    const status = visualSignoffStatuses.includes(saved.status) ? saved.status : "pending-review";
    return {
      ...item,
      signoffStatus: status,
      tone: visualSignoffTone(status),
      updatedAt: saved.updatedAt || "",
      openFindingCount: openFindingCountByItem[item.id] || 0
    };
  });
  const summary = {
    total: signoffItems.length,
    accepted: signoffItems.filter((item) => item.signoffStatus === "accepted").length,
    blocked: signoffItems.filter((item) => item.signoffStatus === "blocked").length,
    needsRecheck: signoffItems.filter((item) => item.signoffStatus === "needs-recheck").length,
    pending: signoffItems.filter((item) => item.signoffStatus === "pending-review").length,
    openFindings: findings.filter((finding) => finding.status !== "resolved").length,
    resolvedFindings: findings.filter((finding) => finding.status === "resolved").length
  };
  const status = summary.blocked || summary.openFindings ? "blocked" : (summary.pending || summary.needsRecheck ? "needs-review" : "ready");
  return {
    displayMode: "manual-visual-signoff-state-and-findings-backlog",
    status,
    signoffItems,
    findings,
    summary,
    canCompleteVisualSignoff: status === "ready",
    persisted: {
      storageKey: visualSignoffStorageKey,
      statuses: persisted.statuses,
      findings,
      lastUpdatedAt: new Date().toISOString()
    },
    safety: {
      automaticHostLaunchAllowed: false,
      realHostSmokeAllowed: false,
      hostMutationAllowed: false,
      readOnlyOnly: true
    }
  };
}

function saveVisualSignoffState(nextState) {
  state.visualSignoffState = {
    storageKey: visualSignoffStorageKey,
    statuses: nextState.statuses || {},
    findings: nextState.findings || [],
    lastUpdatedAt: new Date().toISOString()
  };
  writePersistedVisualSignoffState(state.visualSignoffState);
}

function setVisualSignoffItemStatus(matrixItemId, status) {
  const current = normalizePrototypeVisualSignoffState();
  const nextStatus = visualSignoffStatuses.includes(status) ? status : "pending-review";
  current.statuses[matrixItemId] = {
    status: nextStatus,
    updatedAt: new Date().toISOString()
  };
  saveVisualSignoffState(current);
  renderVisualSignoffState();
}

function addVisualFinding() {
  const current = normalizePrototypeVisualSignoffState();
  const matrixItemId = el("visualFindingItem").value;
  const type = el("visualFindingType").value;
  const severity = el("visualFindingSeverity").value;
  const note = el("visualFindingNote").value.trim();
  if (!matrixItemId) return;
  const now = new Date().toISOString();
  current.findings.push({
    id: `visual-finding-${Date.now()}`,
    matrixItemId,
    type: visualFindingTypes.includes(type) ? type : "layout",
    severity: ["low", "medium", "high", "blocker"].includes(severity) ? severity : "medium",
    status: "open",
    note,
    createdAt: now,
    updatedAt: now
  });
  current.statuses[matrixItemId] = {
    status: "blocked",
    updatedAt: now
  };
  el("visualFindingNote").value = "";
  saveVisualSignoffState(current);
  renderVisualSignoffState();
}

function resolveVisualFinding(findingId) {
  const current = normalizePrototypeVisualSignoffState();
  current.findings = current.findings.map((finding) => finding.id === findingId
    ? { ...finding, status: "resolved", updatedAt: new Date().toISOString() }
    : finding);
  saveVisualSignoffState(current);
  renderVisualSignoffState();
}

function resetVisualSignoffState() {
  saveVisualSignoffState({ statuses: {}, findings: [] });
  renderVisualSignoffState();
}

function renderVisualFindingComposer(signoff) {
  const itemSelect = el("visualFindingItem");
  const typeSelect = el("visualFindingType");
  const selectedItem = itemSelect.value;
  const selectedType = typeSelect.value;
  itemSelect.innerHTML = signoff.signoffItems.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.id)}</option>`).join("");
  typeSelect.innerHTML = visualFindingTypes.map((type) => `<option value="${escapeHtml(type)}">${t(`commandCenter.visualSignoff.type.${type}`)}</option>`).join("");
  if (selectedItem && signoff.signoffItems.some((item) => item.id === selectedItem)) itemSelect.value = selectedItem;
  if (selectedType && visualFindingTypes.includes(selectedType)) typeSelect.value = selectedType;
}

function renderVisualSignoffState() {
  const signoff = buildPrototypeVisualSignoffState();
  const summaryKey = signoff.status === "ready"
    ? "commandCenter.visualSignoff.ready"
    : (signoff.status === "blocked" ? "commandCenter.visualSignoff.blocked" : "commandCenter.visualSignoff.needsReview");
  const summaryTone = signoff.status === "ready" ? "success" : (signoff.status === "blocked" ? "error" : "warning");
  el("visualSignoffMeta").textContent = `${signoff.summary.accepted}/${signoff.summary.total} · ${t(summaryKey)}`;
  el("visualSignoffSummary").innerHTML = `
    <span class="statusDot ${summaryTone}"></span>
    <span>${t("commandCenter.visualSignoff.summary")} · ${t("commandCenter.visualSignoff.openFindings")} ${signoff.summary.openFindings}</span>
  `;
  el("visualSignoffGrid").innerHTML = signoff.signoffItems.map((item) => `
    <article class="visualSignoffItem" data-visual-signoff-item="${item.id}" data-visual-signoff-status="${item.signoffStatus}">
      <div class="visualSignoffItemTop">
        <span class="visualReviewId">${escapeHtml(item.id)}</span>
        <span class="visualSignoffStatus ${item.tone}">${t(visualSignoffLabelKey(item.signoffStatus))}</span>
      </div>
      <div class="visualSignoffMeta">${escapeHtml(item.surface)} · ${escapeHtml(item.theme)} · ${escapeHtml(item.locale)} · ${escapeHtml(item.width)}</div>
      <div class="visualSignoffMeta">${t("commandCenter.visualSignoff.openFindings")}: ${item.openFindingCount}</div>
      <div class="visualSignoffActions">
        <button type="button" data-visual-signoff-action="accepted" data-signoff-id="${item.id}">${t("commandCenter.visualSignoff.markAccepted")}</button>
        <button type="button" data-visual-signoff-action="blocked" data-signoff-id="${item.id}">${t("commandCenter.visualSignoff.markBlocked")}</button>
        <button type="button" data-visual-signoff-action="needs-recheck" data-signoff-id="${item.id}">${t("commandCenter.visualSignoff.markRecheck")}</button>
      </div>
    </article>
  `).join("");
  renderVisualFindingComposer(signoff);
  const openFindings = signoff.findings.filter((finding) => finding.status !== "resolved");
  el("visualFindingsBacklog").innerHTML = `
    <div class="visualReviewSubhead">${t("commandCenter.visualSignoff.findings")}</div>
    ${openFindings.length ? openFindings.map((finding) => `
      <article class="visualFindingItem" data-visual-finding="${finding.id}">
        <div class="visualSignoffItemTop">
          <strong>${escapeHtml(finding.matrixItemId)}</strong>
          <span class="visualSignoffStatus warning">${escapeHtml(finding.severity)}</span>
        </div>
        <div class="visualSignoffMeta">${t(`commandCenter.visualSignoff.type.${finding.type}`)} · ${escapeHtml(finding.createdAt || "")}</div>
        <p>${escapeHtml(finding.note || "-")}</p>
        <button type="button" data-visual-finding-resolve="${finding.id}">${t("commandCenter.visualSignoff.resolveFinding")}</button>
      </article>
    `).join("") : `<div class="visualSignoffEmpty">${t("commandCenter.visualSignoff.noFindings")}</div>`}
  `;
  document.querySelectorAll("[data-visual-signoff-action]").forEach((button) => {
    button.addEventListener("click", () => setVisualSignoffItemStatus(button.dataset.signoffId, button.dataset.visualSignoffAction));
  });
  document.querySelectorAll("[data-visual-finding-resolve]").forEach((button) => {
    button.addEventListener("click", () => resolveVisualFinding(button.dataset.visualFindingResolve));
  });
}

function buildPrototypeVisualEvidenceExport() {
  const review = buildPrototypeVisualReviewMatrix();
  const signoff = buildPrototypeVisualSignoffState();
  const generatedAt = new Date().toISOString();
  const evidenceId = `visual-evidence-${generatedAt.replace(/[:.]/g, "-")}`;
  const matrixItems = review.matrixItems.map((item) => {
    const signoffItem = signoff.signoffItems.find((entry) => entry.id === item.id) || {};
    return {
      id: item.id,
      surface: item.surface,
      theme: item.theme,
      locale: item.locale,
      layout: item.layout,
      width: item.width,
      dpi: item.dpi,
      screenshotFileName: item.screenshotFileName,
      signoffStatus: signoffItem.signoffStatus || "pending-review",
      openFindingCount: signoffItem.openFindingCount || 0
    };
  });
  const findings = signoff.findings.map((finding) => ({
    id: finding.id,
    matrixItemId: finding.matrixItemId,
    type: finding.type,
    severity: finding.severity,
    status: finding.status,
    note: finding.note || "",
    createdAt: finding.createdAt || "",
    updatedAt: finding.updatedAt || ""
  }));
  const summary = {
    matrixTotal: matrixItems.length,
    accepted: signoff.summary.accepted,
    blocked: signoff.summary.blocked,
    needsRecheck: signoff.summary.needsRecheck,
    pending: signoff.summary.pending,
    openFindings: findings.filter((finding) => finding.status !== "resolved").length,
    resolvedFindings: findings.filter((finding) => finding.status === "resolved").length
  };
  const status = summary.openFindings || summary.blocked || summary.pending || summary.needsRecheck ? "needs-review" : "ready";
  const evidence = {
    evidenceId,
    generatedAt,
    displayMode: "pre-host-visual-evidence-export",
    status,
    sourceVisualReviewMatrixStatus: review.status,
    sourceVisualSignoffStatus: signoff.status,
    canProceedToPreHostReview: status === "ready",
    summary,
    screenshotNamingPattern: "v0.5.6_{surface}_{theme}_{locale}_{layout}_{width}_{dpi}.png",
    matrixItems,
    findings,
    safety: {
      automaticHostLaunchAllowed: false,
      realHostSmokeAllowed: false,
      readOnlyOnly: true,
      hostMutationAllowed: false
    },
    automaticHostLaunchAllowed: false,
    realHostSmokeAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
  const markdown = [
    "# Kuroii Motion AI Visual Evidence Export",
    "",
    `- Evidence ID: ${evidence.evidenceId}`,
    `- Generated At: ${evidence.generatedAt}`,
    `- Status: ${evidence.status}`,
    `- Source Visual Review Matrix Status: ${evidence.sourceVisualReviewMatrixStatus}`,
    `- Source Visual Sign-off Status: ${evidence.sourceVisualSignoffStatus}`,
    `- Can Proceed To Pre-host Review: ${evidence.canProceedToPreHostReview ? "yes" : "no"}`,
    `- Screenshot Naming Pattern: ${evidence.screenshotNamingPattern}`,
    `- Automatic Host Launch Allowed: ${evidence.automaticHostLaunchAllowed ? "true" : "false"}`,
    `- Real Host Smoke Allowed: ${evidence.realHostSmokeAllowed ? "true" : "false"}`,
    `- Host Mutation Allowed: ${evidence.hostMutationAllowed ? "true" : "false"}`,
    "",
    "## Summary",
    `- Matrix Total: ${summary.matrixTotal}`,
    `- Accepted: ${summary.accepted}`,
    `- Blocked: ${summary.blocked}`,
    `- Needs Recheck: ${summary.needsRecheck}`,
    `- Pending: ${summary.pending}`,
    `- Open Findings: ${summary.openFindings}`,
    `- Resolved Findings: ${summary.resolvedFindings}`,
    "",
    "## Screenshot Matrix",
    ...matrixItems.map((item) => `- ${item.id}: ${item.signoffStatus} | ${item.screenshotFileName} | open findings ${item.openFindingCount}`),
    "",
    "## Findings Backlog",
    ...(findings.length
      ? findings.map((finding) => `- ${finding.id}: ${finding.matrixItemId} | ${finding.type} | ${finding.severity} | ${finding.status} | ${finding.note || "none"}`)
      : ["- None"]),
    "",
    "## Safety",
    "- No AE/PR host is launched by this export.",
    "- No real host action is executed by this export.",
    "- No project mutation is performed by this export."
  ].join("\n");
  return {
    ...evidence,
    markdown,
    json: JSON.stringify(evidence, null, 2)
  };
}

function readPersistedVisualEvidenceReviewLock() {
  try {
    const raw = localStorage.getItem(visualEvidenceReviewLockStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function writePersistedVisualEvidenceReviewLock(value) {
  localStorage.setItem(visualEvidenceReviewLockStorageKey, JSON.stringify(value));
}

function buildPrototypeVisualEvidenceReviewLock() {
  const evidence = buildPrototypeVisualEvidenceExport();
  const persisted = state.visualEvidenceReviewLock || {};
  const reviewedBy = String(persisted.reviewedBy || "").trim();
  const openBlockerCount = evidence.summary.openFindings + evidence.summary.blocked + evidence.summary.needsRecheck + evidence.summary.pending;
  const canLock = evidence.status === "ready" && openBlockerCount === 0 && Boolean(reviewedBy);
  const isLocked = Boolean(persisted.isLocked) && canLock;
  return {
    evidenceId: evidence.evidenceId,
    reviewedBy,
    reviewNote: String(persisted.reviewNote || "").trim(),
    openBlockerCount,
    canLock,
    isLocked,
    lockedAt: isLocked ? persisted.lockedAt || "" : "",
    status: isLocked ? "locked" : openBlockerCount ? "blocked" : "pending-review",
    automaticHostLaunchAllowed: false,
    realHostSmokeAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
}

function visualEvidenceReviewLockLabelKey(status) {
  if (status === "locked") return "commandCenter.visualEvidenceReviewLock.locked";
  if (status === "blocked") return "commandCenter.visualEvidenceReviewLock.blocked";
  return "commandCenter.visualEvidenceReviewLock.pending-review";
}

function renderVisualEvidenceReviewLock() {
  const reviewLock = buildPrototypeVisualEvidenceReviewLock();
  const tone = reviewLock.isLocked ? "success" : reviewLock.status === "blocked" ? "error" : "warning";
  el("visualEvidenceReviewer").value = reviewLock.reviewedBy;
  el("visualEvidenceReviewNote").value = reviewLock.reviewNote;
  el("lockVisualEvidenceButton").disabled = !reviewLock.canLock;
  el("unlockVisualEvidenceButton").disabled = !reviewLock.isLocked;
  el("visualEvidenceReviewLockSummary").innerHTML = `
    <span class="statusDot ${tone}"></span>
    <span class="visualEvidenceReviewLockStatus">${t(visualEvidenceReviewLockLabelKey(reviewLock.status))}</span>
    <span>${t("commandCenter.visualEvidenceReviewLock.openBlockers")} ${reviewLock.openBlockerCount}</span>
  `;
}

function saveVisualEvidenceReviewLock(partial) {
  state.visualEvidenceReviewLock = { ...state.visualEvidenceReviewLock, ...partial };
  writePersistedVisualEvidenceReviewLock(state.visualEvidenceReviewLock);
  renderVisualEvidenceReviewLock();
}

function lockVisualEvidenceReview() {
  const reviewedBy = el("visualEvidenceReviewer").value.trim();
  const reviewNote = el("visualEvidenceReviewNote").value.trim();
  const candidate = { reviewedBy, reviewNote, isLocked: true, lockedAt: new Date().toISOString() };
  state.visualEvidenceReviewLock = candidate;
  const reviewLock = buildPrototypeVisualEvidenceReviewLock();
  saveVisualEvidenceReviewLock(reviewLock.canLock ? candidate : { ...candidate, isLocked: false, lockedAt: "" });
}

function unlockVisualEvidenceReview() {
  saveVisualEvidenceReviewLock({ isLocked: false, lockedAt: "" });
}

function renderVisualEvidenceExport() {
  const evidence = buildPrototypeVisualEvidenceExport();
  const summaryKey = evidence.status === "ready" ? "commandCenter.visualEvidence.ready" : "commandCenter.visualEvidence.needsReview";
  const tone = evidence.status === "ready" ? "success" : "warning";
  el("visualEvidenceMeta").textContent = `${evidence.status} · ${evidence.evidenceId}`;
  el("visualEvidenceSummary").innerHTML = `
    <span class="statusDot ${tone}"></span>
    <span>${t("commandCenter.visualEvidence.summary")} · ${t(summaryKey)} · ${t("commandCenter.visualSignoff.openFindings")} ${evidence.summary.openFindings}</span>
  `;
  el("visualEvidencePreview").textContent = evidence.markdown;
}

async function copyVisualEvidenceExport() {
  const evidence = buildPrototypeVisualEvidenceExport();
  try {
    await navigator.clipboard.writeText(evidence.markdown);
    el("visualEvidenceMeta").textContent = t("commandCenter.visualEvidence.copyOk");
  } catch (error) {
    el("visualEvidenceMeta").textContent = t("commandCenter.visualEvidence.copyFailed");
    el("visualEvidencePreview").focus();
  }
}

function exportVisualEvidenceExport(format = "markdown") {
  const evidence = buildPrototypeVisualEvidenceExport();
  try {
    const isJson = format === "json";
    const content = isJson ? evidence.json : evidence.markdown;
    const extension = isJson ? "json" : "md";
    const mime = isJson ? "application/json" : "text/markdown";
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${evidence.evidenceId}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    el("visualEvidenceMeta").textContent = t(isJson ? "commandCenter.visualEvidence.exportJsonSuccess" : "commandCenter.visualEvidence.exportMarkdownSuccess");
  } catch (error) {
    el("visualEvidenceMeta").textContent = t("commandCenter.visualEvidence.exportFailed");
    el("visualEvidencePreview").focus();
  }
}

function buildPrototypeManualHostSmokeSessionDraft() {
  const evidencePack = buildPrototypeManualHostSmokeEvidencePack();
  const reviewChecklist = buildPrototypeManualHostSmokeReviewChecklist();
  const selectedHost = reviewChecklist.selectedHost || evidencePack.selectedHost || state.selectedHost;
  const sessionId = state.sessionDraftState && state.sessionDraftState.sessionId
    ? state.sessionDraftState.sessionId
    : `manual-host-smoke-session-${selectedHost || "no-host"}`;
  const allowedActions = evidencePack.allowedActions || [];
  const safetyFlagsReady = reviewChecklist.automaticHostLaunchAllowed === false && reviewChecklist.readOnlyOnly === true && reviewChecklist.hostMutationAllowed === false;
  const startConditions = [
    { id: "review-checklist-ready", status: reviewChecklist.status === "ready" ? "ready" : "blocked", ok: reviewChecklist.status === "ready" },
    { id: "target-host-selected", status: selectedHost ? "ready" : "blocked", ok: Boolean(selectedHost) },
    { id: "allowed-actions-present", status: allowedActions.length ? "ready" : "blocked", ok: allowedActions.length > 0, count: allowedActions.length },
    { id: "manual-launch-only", status: safetyFlagsReady ? "ready" : "blocked", ok: safetyFlagsReady }
  ];
  const blockedConditions = startConditions.filter((item) => item.status === "blocked");
  const status = blockedConditions.length ? "blocked" : "ready";
  const stopConditions = ["host-heartbeat-stale", "target-lock-mismatch", "command-result-failed", "mutation-warning-observed", "user-cancelled-session"];
  const resultPlaceholders = [
    { id: "session-started-at", value: null, required: true },
    { id: "manual-host-opened-by-user", value: false, required: true },
    { id: "read-only-command-results", value: [], required: true },
    { id: "session-ended-at", value: null, required: true },
    { id: "failure-reason", value: null, required: false }
  ];
  const generatedAt = new Date().toISOString();
  const draft = {
    sessionId,
    title: "Kuroii Motion AI Manual Host Smoke Session Draft",
    displayMode: "manual-host-smoke-session-draft",
    generatedAt,
    selectedHost,
    status,
    canStartManualHostSmokeSession: status === "ready",
    sourceChecklistId: reviewChecklist.checklistId,
    sourceEvidencePackId: evidencePack.evidencePackId,
    startConditions,
    blockedConditions: blockedConditions.map((item) => item.id),
    allowedActions,
    stopConditions,
    resultPlaceholders,
    persisted: {
      storageKey: sessionDraftStorageKey,
      sessionId,
      selectedHost,
      status,
      sourceChecklistId: reviewChecklist.checklistId,
      sourceEvidencePackId: evidencePack.evidencePackId,
      savedAt: generatedAt
    },
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
  const markdown = [
    `# ${draft.title}`,
    "",
    `- Session ID: ${draft.sessionId}`,
    `- Generated At: ${draft.generatedAt}`,
    `- Selected Host: ${draft.selectedHost || "none"}`,
    `- Status: ${draft.status}`,
    `- Can Start Manual Host Smoke Session: ${draft.canStartManualHostSmokeSession ? "yes" : "no"}`,
    `- Automatic Host Launch Allowed: ${draft.automaticHostLaunchAllowed ? "true" : "false"}`,
    `- Host Mutation Allowed: ${draft.hostMutationAllowed ? "true" : "false"}`,
    "",
    "## Start Conditions",
    ...draft.startConditions.map((item) => `- ${item.id}: ${item.status}`),
    "",
    "## Allowed Read-only Actions",
    markdownList(draft.allowedActions),
    "",
    "## Stop Conditions",
    markdownList(draft.stopConditions),
    "",
    "## Result Placeholders",
    ...draft.resultPlaceholders.map((item) => `- ${item.id}: pending`)
  ].join("\n");
  return {
    ...draft,
    markdown,
    json: JSON.stringify(draft, null, 2)
  };
}

function saveManualHostSmokeSessionDraft() {
  const draft = buildPrototypeManualHostSmokeSessionDraft();
  state.sessionDraftState = draft.persisted;
  writePersistedSessionDraftState(state.sessionDraftState);
  renderManualHostSmokeSessionDraft();
  el("sessionDraftMeta").textContent = t("commandCenter.sessionDraft.saved");
}

async function copyManualHostSmokeSessionDraft() {
  const draft = buildPrototypeManualHostSmokeSessionDraft();
  try {
    await navigator.clipboard.writeText(draft.markdown);
    el("sessionDraftMeta").textContent = t("commandCenter.sessionDraft.copyOk");
  } catch (error) {
    el("sessionDraftMeta").textContent = t("commandCenter.sessionDraft.copyFailed");
    el("sessionDraftPreview").focus();
  }
}

function exportManualHostSmokeSessionDraft(format = "markdown") {
  const draft = buildPrototypeManualHostSmokeSessionDraft();
  try {
    const isJson = format === "json";
    const content = isJson ? draft.json : draft.markdown;
    const extension = isJson ? "json" : "md";
    const mime = isJson ? "application/json" : "text/markdown";
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${draft.sessionId}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    el("sessionDraftMeta").textContent = t(isJson ? "commandCenter.sessionDraft.exportJsonSuccess" : "commandCenter.sessionDraft.exportMarkdownSuccess");
  } catch (error) {
    el("sessionDraftMeta").textContent = t("commandCenter.sessionDraft.exportFailed");
    el("sessionDraftPreview").focus();
  }
}

function resetManualHostSmokeSessionDraft() {
  state.sessionDraftState = null;
  writePersistedSessionDraftState(null);
  requestFocus("manualHostSmokeSessionDraftPanel");
  render();
}

function renderManualHostSmokeSessionDraft() {
  const draft = buildPrototypeManualHostSmokeSessionDraft();
  el("sessionDraftMeta").textContent = `${draft.status} · ${draft.sessionId}`;
  const summary = el("sessionDraftSummary");
  summary.dataset.sessionDraftStatus = draft.status;
  const statusKey = draft.status === "ready"
    ? "commandCenter.sessionDraft.status.ready"
    : "commandCenter.sessionDraft.status.blocked";
  const startLabel = draft.canStartManualHostSmokeSession
    ? t("commandCenter.sessionDraft.canStart")
    : t("commandCenter.sessionDraft.cannotStart");
  summary.innerHTML = `<span class="statusDot ${draft.status === "ready" ? "success" : "error"}"></span><span>${t(statusKey)} · ${startLabel} · ${draft.blockedConditions.length} blocked</span>`;
  const cells = [
    [t("commandCenter.sessionDraft.startConditions"), draft.startConditions.map((item) => `${item.id}: ${item.status}`)],
    [t("commandCenter.sessionDraft.allowedActions"), draft.allowedActions],
    [t("commandCenter.sessionDraft.stopConditions"), draft.stopConditions],
    [t("commandCenter.sessionDraft.placeholders"), draft.resultPlaceholders.map((item) => item.id)]
  ];
  el("sessionDraftGrid").innerHTML = cells.map(([title, items]) => `
    <div class="sessionDraftBlock">
      <div class="sessionDraftBlockTitle">${escapeHtml(title)}</div>
      <ul>${(items.length ? items : ["None"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
  `).join("");
  el("sessionDraftPreview").textContent = draft.markdown;
}

function handleReadinessDrilldown(readinessId, targetId) {
  const resolvedTarget = targetId || readinessDrilldownTargets[readinessId] || "diagnosticsPanel";
  requestFocus(resolvedTarget);
  applyFocusAfterRender();
}

function renderHosts() {
  if (!state.data.hosts.length) {
    el("hostStrip").innerHTML = emptyStateMarkup("hosts", "commandCenter.empty.noHosts");
    return;
  }
  el("hostStrip").innerHTML = state.data.hosts.map((host) => `
    <article class="hostCard ${host.host === state.selectedHost ? "selected" : ""}" data-host="${host.host}" tabindex="0" aria-pressed="${host.host === state.selectedHost ? "true" : "false"}">
      <div>
        <div class="hostTitle"><span class="statusDot ${statusTone(host.status)}"></span>${host.displayName}</div>
        <div class="hostMeta">${host.projectName || "No Project"}</div>
        <div class="hostStats">
          <span class="hostStat">${host.status}</span>
          <span class="hostStat">${host.capabilityCount || 0} actions</span>
          <span class="hostStat">${host.host}</span>
        </div>
      </div>
      <span class="panelMeta">${host.host === state.data.target.targetHost ? "LOCK" : ""}</span>
    </article>
  `).join("");
  document.querySelectorAll(".hostCard").forEach((card) => {
    const select = () => {
      state.selectedHost = card.dataset.host;
      render();
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
  });
}

function renderContext() {
  const summary = contextSummary();
  const rows = [
    ["field.project", summary.projectName],
    ["field.projectId", summary.projectId],
    ["field.activeTarget", summary.activeTarget],
    ["field.selection", summary.selection],
    ["field.lastSeen", summary.lastSeenAt],
    ["field.mode", summary.mode]
  ];
  el("selectedHostMeta").textContent = state.selectedHost || "None";
  el("contextList").innerHTML = rows.map(([key, value]) => `<dt>${t(key)}</dt><dd>${escapeHtml(value || "None")}</dd>`).join("");
}

function renderActions() {
  const actions = state.data.trustedActions.filter((action) => action.host === state.selectedHost);
  const busy = state.pendingOperation === "executing";
  if (!actions.length) {
    el("actionList").innerHTML = emptyStateMarkup("actions", "commandCenter.empty.noActions");
    return;
  }
  el("actionList").innerHTML = actions.map((action) => {
    const running = busy && state.runningActionId === action.id;
    const enabled = action.readOnly && action.riskLevel === 0 && !busy;
    return `
      <div class="actionRow ${running ? "running" : ""}">
        <div>
          <div class="actionName">${action.id}</div>
          <div class="actionMeta">${action.host} · risk ${action.riskLevel} · ${action.readOnly ? "read-only" : "blocked"}</div>
        </div>
        <button class="runButton" type="button" data-action="${escapeHtml(action.id)}" ${enabled ? "" : "disabled"} aria-label="${state.locale === "zh-CN" ? `运行 ${escapeHtml(action.id)}` : `Run ${escapeHtml(action.id)}`}" data-tooltip="${state.locale === "zh-CN" ? `运行 ${escapeHtml(action.id)}` : `Run ${escapeHtml(action.id)}`}">${running ? "…" : "▶"}</button>
      </div>
    `;
  }).join("");
  document.querySelectorAll(".runButton").forEach((button) => {
    button.addEventListener("click", () => runAction(button.dataset.action));
  });
}

function uniqueActions() {
  return Array.from(new Set(state.data.history.map((record) => record.action).concat(state.data.trustedActions.map((action) => action.id)).filter(Boolean))).sort();
}

function renderFilters() {
  const hostOptions = [
    ["selected", t("commandCenter.filters.selected")],
    ["all", t("commandCenter.filters.all")],
    ...state.data.hosts.map((host) => [host.host, host.displayName])
  ];
  el("hostFilter").innerHTML = hostOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  el("hostFilter").value = state.historyFilters.host;
  const actionOptions = [["", t("commandCenter.filters.all")], ...uniqueActions().map((action) => [action, action])];
  el("actionFilter").innerHTML = actionOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  el("actionFilter").value = state.historyFilters.action;
  const statusOptions = [
    ["all", t("commandCenter.filters.all")],
    ["success", t("commandCenter.filters.success")],
    ["failed", t("commandCenter.filters.failed")]
  ];
  el("statusFilter").innerHTML = statusOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  el("statusFilter").value = state.historyFilters.status;
  el("queryFilter").value = state.historyFilters.query;
  el("limitFilter").value = String(state.historyFilters.limit);
}

function renderHistory() {
  const rows = filteredHistory();
  const success = state.data.history.filter((record) => record.ok === true).length;
  const failed = state.data.history.filter((record) => record.ok === false).length;
  el("resultSummary").textContent = `${rows.length} / ${state.data.history.length} · OK ${success} · ERR ${failed}`;
  if (!rows.length) {
    const key = state.data.history.length ? "commandCenter.empty.noFilteredHistory" : "commandCenter.empty.noHistory";
    const emptyId = state.data.history.length ? sharedEmptyStateIds.filteredHistory : sharedEmptyStateIds.history;
    el("historyTable").innerHTML = `<div class="historyRow empty" data-empty-state="${emptyId}"><span class="statusDot muted"></span><span class="historyCell">${t(key)}</span><span></span><span></span></div>`;
    return;
  }
  el("historyTable").innerHTML = rows.map((record) => `
    <div class="historyRow ${state.selectedCommandId === record.commandId ? "selected" : ""}" data-command="${record.commandId}" tabindex="0">
      <span class="statusDot ${resultTone(record.ok)}"></span>
      <span class="historyCell">${escapeHtml(record.action)}</span>
      <span class="historyCell">${escapeHtml(record.code)}</span>
      <span class="historyCell">${record.durationMs || 0}ms</span>
    </div>
  `).join("");
  document.querySelectorAll(".historyRow[data-command]").forEach((row) => {
    const open = () => openCommandDetail(row.dataset.command);
    row.addEventListener("click", open);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function detailSummaryRows(detail) {
  return [
    ["detail.commandId", detail.commandId || "idle"],
    ["detail.host", detail.host || (detail.command ? detail.command.host : state.selectedHost)],
    ["detail.action", detail.action || (detail.command ? detail.command.action : "")],
    ["detail.code", detail.code || "idle"],
    ["detail.result", detail.ok === true ? "OK" : detail.ok === false ? "Error" : "Idle"],
    ["detail.duration", `${detail.durationMs || 0}ms`],
    ["detail.recordedAt", detail.recordedAt || "-"]
  ];
}

function renderDetail() {
  const detail = state.detail || {
    commandId: state.selectedCommandId || "idle",
    code: state.selectedCommandId ? "LOADING" : t("commandCenter.detail.emptyTitle"),
    ok: null,
    message: state.selectedCommandId ? t("commandCenter.activity.loadingDetail") : t("commandCenter.detail.emptyMessage"),
    durationMs: 0,
    recordedAt: "-"
  };
  el("detailCode").textContent = detail.code || "idle";
  el("detailSummary").innerHTML = detailSummaryRows(detail).map(([key, value]) => `<dt>${t(key)}</dt><dd>${escapeHtml(value || "-")}</dd>`).join("");
  el("detailPre").textContent = JSON.stringify(detail, null, 2);
}

function renderHomeProviderStatus() {
  const providerName = el("homeProviderName");
  const modelName = el("homeModelName");
  const providerStatus = el("homeProviderStatus");
  const modelStatus = el("homeModelStatus");
  if (!providerName || !modelName || !providerStatus || !modelStatus) return;
  const hasError = Boolean(state.providerConfig.errorCode);
  providerName.textContent = currentProvider().label;
  modelName.textContent = currentModelLabel();
  providerStatus.textContent = hasError
    ? (state.locale === "zh-CN" ? "需检查" : "Check")
    : (state.locale === "zh-CN" ? "正常" : "OK");
  modelStatus.textContent = hasError
    ? (state.locale === "zh-CN" ? "不可用" : "Unavailable")
    : (state.locale === "zh-CN" ? "在线" : "Online");
}

function render() {
  closeKuroiiSelect();
  renderI18n();
  renderTopbarTitle();
  renderWorkspaceMode();
  renderNav();
  hydrateCommandIcons();
  renderServiceStatus();
  renderActivity();
  renderRecovery();
  renderHomeProviderStatus();
  renderFeatureWorkspace();
  renderProfessionalWorkbench();
  renderVisualPreviewPass();
  renderVisualReviewMatrix();
  renderVisualSignoffState();
  renderVisualEvidenceExport();
  renderVisualEvidenceReviewLock();
  renderDiagnostics();
  renderHostReadinessGate();
  renderRehearsalResultPanel();
  renderManualHostSmokeRunbook();
  renderManualHostSmokeEvidencePack();
  renderManualHostSmokeReviewChecklist();
  renderManualHostSmokeSessionDraft();
  renderHosts();
  renderContext();
  renderActions();
  renderFilters();
  renderHistory();
  renderDetail();
  enhanceCustomSelects();
  applyFocusAfterRender();
}

function commandEnvelope(actionId) {
  const context = selectedContext();
  return {
    commandId: `prototype-${Date.now()}`,
    sessionId: "desktop-command-center-prototype",
    host: state.selectedHost,
    projectId: context.project ? context.project.projectId : "",
    action: actionId,
    target: {},
    params: {},
    riskLevel: 0,
    requiresConfirmation: false,
    createdAt: new Date().toISOString(),
    timeoutMs: 30000
  };
}

function upsertHistory(record) {
  state.data.history = [record, ...state.data.history.filter((item) => item.commandId !== record.commandId)];
  state.selectedCommandId = record.commandId;
  state.detail = record;
}

async function runAction(actionId) {
  const command = commandEnvelope(actionId);
  setPending("executing", actionId);
  if (state.serviceOnline) {
    try {
      const response = await fetch("http://127.0.0.1:17631/commands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kuroii-Session": "dev-local-token"
        },
        body: JSON.stringify(command)
      });
      if (!response.ok) throw await serviceResponseError(response);
      const payload = await response.json();
      const record = {
        commandId: payload.commandId,
        host: command.host,
        action: command.action,
        code: payload.code,
        ok: payload.ok,
        durationMs: payload.durationMs,
        recordedAt: new Date().toISOString(),
        command,
        result: payload
      };
      upsertHistory(record);
      state.lastError = null;
      requestFocus("detailPanel");
      setPending(null);
      render();
      return;
    } catch (error) {
      setError(error);
      requestFocus("recoveryPanel");
    }
  }
  const record = {
    commandId: command.commandId,
    host: command.host,
    action: command.action,
    code: "PROTOTYPE_MOCK_EXECUTED",
    ok: true,
    durationMs: 0,
    recordedAt: new Date().toISOString(),
    command,
    data: { host: command.host, readOnly: true, mutationPerformed: false }
  };
  upsertHistory(record);
  requestFocus("detailPanel");
  setPending(null);
  render();
}

async function openCommandDetail(commandId) {
  state.selectedCommandId = commandId;
  state.detail = state.data.history.find((item) => item.commandId === commandId) || null;
  setPending("loading-detail");
  if (state.serviceOnline) {
    try {
      const response = await fetch(`http://127.0.0.1:17631/commands/${encodeURIComponent(commandId)}`, {
        headers: { "X-Kuroii-Session": "dev-local-token" }
      });
      if (!response.ok) throw await serviceResponseError(response);
      const payload = await response.json();
      state.detail = payload.command;
      state.lastError = null;
      requestFocus("detailPanel");
    } catch (error) {
      setError(error);
      requestFocus("recoveryPanel");
    }
  } else {
    requestFocus("detailPanel");
  }
  setPending(null);
  render();
}

async function refreshFromService() {
  setPending("refreshing");
  try {
    const headers = { "X-Kuroii-Session": "dev-local-token" };
    const historyQuery = historyServiceQuery();
    const [hostsRes, actionsRes, historyRes] = await Promise.all([
      fetch("http://127.0.0.1:17631/hosts", { headers }),
      fetch(`http://127.0.0.1:17631/actions/trusted?host=${encodeURIComponent(state.selectedHost)}`, { headers }),
      fetch(`http://127.0.0.1:17631/commands?${historyQuery}`, { headers })
    ]);
    if (!hostsRes.ok) throw await serviceResponseError(hostsRes);
    if (!actionsRes.ok) throw await serviceResponseError(actionsRes);
    if (!historyRes.ok) throw await serviceResponseError(historyRes);
    const hosts = await hostsRes.json();
    const actions = await actionsRes.json();
    const history = await historyRes.json();
    state.data.hosts = hosts.hosts || state.data.hosts;
    state.data.target = hosts.target || state.data.target;
    state.data.trustedActions = actions.actions || state.data.trustedActions;
    state.data.history = history.commands || state.data.history;
    const contextMap = {};
    for (const host of state.data.hosts) {
      const contextRes = await fetch(`http://127.0.0.1:17631/hosts/${encodeURIComponent(host.host)}/context`, { headers });
      if (contextRes.ok) {
        const payload = await contextRes.json();
        contextMap[host.host] = payload.context;
      }
    }
    state.data.contexts = { ...state.data.contexts, ...contextMap };
    state.serviceOnline = true;
    state.lastError = null;
  } catch (error) {
    setError(error);
    requestFocus("recoveryPanel");
  }
  setPending(null);
  render();
}

async function serviceResponseError(response) {
  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }
  const error = new Error(payload.message || `Local Service request failed: ${response.status}`);
  error.status = response.status;
  error.payload = payload;
  return error;
}

function resetFilters() {
  state.historyFilters = { host: "selected", action: "", status: "all", query: "", limit: 20 };
  render();
}

function showLatestCommandError() {
  const latestError = latestCommandError();
  if (!latestError) {
    requestFocus("diagnosticsPanel");
    render();
    return;
  }
  if (!filteredHistory().some((record) => record.commandId === latestError.commandId)) {
    state.historyFilters = { host: "all", action: "", status: "all", query: "", limit: 20 };
  }
  state.selectedCommandId = latestError.commandId;
  state.detail = latestError;
  requestFocus("detailPanel");
  render();
}

function handleDiagnosticRecovery(action = "retry-refresh", diagnosticId = null) {
  if (action === "retry-refresh") return refreshFromService();
  if (action === "use-mock-mode") {
    state.serviceOnline = false;
    state.lastError = null;
    setPending(null);
    requestFocus("activityBand");
    render();
    return Promise.resolve();
  }
  if (action === "reset-filters") {
    state.historyFilters = { host: "all", action: "", status: "all", query: "", limit: 20 };
    requestFocus("queryFilter");
    render();
    return Promise.resolve();
  }
  if (action === "view-latest-error") {
    showLatestCommandError();
    return Promise.resolve();
  }
  requestFocus("diagnosticsPanel");
  render();
  return Promise.resolve();
}

function recoverFromError(action = "clear-error") {
  if (action === "retry-refresh") {
    state.lastError = null;
    return refreshFromService();
  }
  if (action === "use-mock-mode") {
    state.serviceOnline = false;
    state.lastError = null;
    setPending(null);
    requestFocus("activityBand");
    render();
    return Promise.resolve();
  }
  clearError();
  requestFocus("refreshButton");
  render();
  return Promise.resolve();
}

function bindEvents() {
  el("refreshButton").addEventListener("click", refreshFromService);
  el("retryRefreshButton").addEventListener("click", () => recoverFromError("retry-refresh"));
  el("useMockModeButton").addEventListener("click", () => recoverFromError("use-mock-mode"));
  el("clearErrorButton").addEventListener("click", () => recoverFromError("clear-error"));
  el("languageToggle").addEventListener("click", () => {
    state.locale = state.locale === "zh-CN" ? "en-US" : "zh-CN";
    render();
    applyThemeMode(state.themeMode, { persist: false });
  });
  el("themeToggle").addEventListener("click", () => {
    toggleThemeAppearance();
  });
  el("topThemeToggle").addEventListener("click", () => {
    toggleThemeAppearance();
  });
  el("mobileNavToggle").addEventListener("click", () => {
    if (el("appShell").classList.contains("mobileNavOpen")) closeMobileNavigation();
    else openMobileNavigation();
  });
  el("sidebarScrim").addEventListener("click", closeMobileNavigation);
  el("sidebarToggle").addEventListener("click", () => {
    hideAppTooltip();
    el("appShell").classList.toggle("sidebarCollapsed");
    renderNav();
  });
  el("visualOverviewToggle").addEventListener("click", () => {
    state.visualOverviewOpen = !state.visualOverviewOpen;
    renderVisualPreviewPass();
  });
  el("rehearsalToggle").addEventListener("click", () => {
    state.rehearsalCollapsed = !state.rehearsalCollapsed;
    render();
  });
  el("copyRunbookButton").addEventListener("click", copyManualHostSmokeRunbook);
  el("exportRunbookMarkdownButton").addEventListener("click", () => exportManualHostSmokeRunbook("markdown"));
  el("exportRunbookJsonButton").addEventListener("click", () => exportManualHostSmokeRunbook("json"));
  el("copyEvidencePackButton").addEventListener("click", copyManualHostSmokeEvidencePack);
  el("exportEvidencePackMarkdownButton").addEventListener("click", () => exportManualHostSmokeEvidencePack("markdown"));
  el("exportEvidencePackJsonButton").addEventListener("click", () => exportManualHostSmokeEvidencePack("json"));
  el("copyVisualEvidenceButton").addEventListener("click", copyVisualEvidenceExport);
  el("exportVisualEvidenceMarkdownButton").addEventListener("click", () => exportVisualEvidenceExport("markdown"));
  el("exportVisualEvidenceJsonButton").addEventListener("click", () => exportVisualEvidenceExport("json"));
  el("lockVisualEvidenceButton").addEventListener("click", lockVisualEvidenceReview);
  el("unlockVisualEvidenceButton").addEventListener("click", unlockVisualEvidenceReview);
  el("visualEvidenceReviewer").addEventListener("input", (event) => saveVisualEvidenceReviewLock({ reviewedBy: event.target.value, isLocked: false, lockedAt: "" }));
  el("visualEvidenceReviewNote").addEventListener("input", (event) => saveVisualEvidenceReviewLock({ reviewNote: event.target.value, isLocked: false, lockedAt: "" }));
  el("resetReviewChecklistButton").addEventListener("click", resetReviewChecklist);
  el("saveSessionDraftButton").addEventListener("click", saveManualHostSmokeSessionDraft);
  el("copySessionDraftButton").addEventListener("click", copyManualHostSmokeSessionDraft);
  el("exportSessionDraftMarkdownButton").addEventListener("click", () => exportManualHostSmokeSessionDraft("markdown"));
  el("exportSessionDraftJsonButton").addEventListener("click", () => exportManualHostSmokeSessionDraft("json"));
  el("resetSessionDraftButton").addEventListener("click", resetManualHostSmokeSessionDraft);
  el("addVisualFindingButton").addEventListener("click", addVisualFinding);
  el("resetVisualSignoffButton").addEventListener("click", resetVisualSignoffState);
  el("evidenceNotesInput").addEventListener("input", (event) => {
    state.evidencePackNotes = event.target.value;
    writePersistedEvidencePackNotes(state.evidencePackNotes);
    renderManualHostSmokeEvidencePack();
    renderManualHostSmokeReviewChecklist();
    renderManualHostSmokeSessionDraft();
  });
  el("clearHistoryButton").addEventListener("click", () => {
    state.data.history = [];
    state.detail = null;
    state.selectedCommandId = null;
    requestFocus("historyTable");
    render();
  });
  el("closeDetailButton").addEventListener("click", () => {
    state.detail = null;
    state.selectedCommandId = null;
    requestFocus("historyTable");
    render();
  });
  el("hostFilter").addEventListener("change", (event) => {
    state.historyFilters.host = event.target.value;
    render();
  });
  el("actionFilter").addEventListener("change", (event) => {
    state.historyFilters.action = event.target.value;
    render();
  });
  el("statusFilter").addEventListener("change", (event) => {
    state.historyFilters.status = event.target.value;
    render();
  });
  el("queryFilter").addEventListener("input", (event) => {
    state.historyFilters.query = event.target.value;
    renderHistory();
  });
  el("limitFilter").addEventListener("change", (event) => {
    state.historyFilters.limit = Number(event.target.value) || 20;
    render();
  });
  el("resetFiltersButton").addEventListener("click", () => {
    resetFilters();
    requestFocus("queryFilter");
    applyFocusAfterRender();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.lastError) {
        recoverFromError("clear-error");
      } else if (state.detail || state.selectedCommandId) {
        state.detail = null;
        state.selectedCommandId = null;
        requestFocus("historyTable");
        render();
      } else if (!state.rehearsalCollapsed && el("rehearsalResultPanel").contains(document.activeElement)) {
        state.rehearsalCollapsed = true;
        requestFocus("rehearsalResultPanel");
        render();
      }
    }
    if (event.key === "/" && document.activeElement && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      el("queryFilter").focus();
    }
  });
  window.addEventListener("resize", () => {
    hideAppTooltip();
    if (!window.matchMedia("(max-width: 840px)").matches) closeMobileNavigation();
    renderNav();
  });
}

function bindHomeCommandWorkspace() {
  const input = el("motionCommandInput");
  const count = el("motionCommandCount");
  const updateCount = () => {
    if (input && count) count.textContent = `${input.value.length} / 1500`;
  };
  input?.addEventListener("input", updateCount);
  document.querySelectorAll("[data-command-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!input) return;
      input.value = button.dataset.commandPrompt || "";
      updateCount();
      input.focus();
    });
  });
  document.querySelectorAll("[data-command-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.dataset.commandNav);
      el("commandWorkspace").scrollTop = 0;
      render();
    });
  });
  el("motionCommandSubmit")?.addEventListener("click", () => {
    const brief = input?.value.trim() || "";
    if (!brief) {
      input?.focus();
      return;
    }
    const activityText = el("activityText");
    const activityDot = el("activityDot");
    if (activityText) activityText.textContent = state.locale === "zh-CN" ? "命令已接收，正在准备创作上下文" : "Command received. Preparing creative context.";
    activityDot?.classList.remove("muted", "error", "warning");
    activityDot?.classList.add("success");
  });
  updateCount();
}

const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
systemThemeQuery.addEventListener?.("change", () => {
  if (state.themeMode === "system") applyThemeMode("system", { persist: false });
});

applyThemeMode(state.themeMode, { persist: false });
bindEvents();
bindAppTooltips();
bindHomeCommandWorkspace();
render();
loadProviderProfileFromService();
