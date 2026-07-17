import { createReadOnlyCommandEnvelope } from "./local-service-client.js";

export const commandCenterSections = [
  {
    id: "host-context",
    labelKey: "commandCenter.sections.hostContext",
    surface: "data",
    brandLevel: "L1"
  },
  {
    id: "trusted-actions",
    labelKey: "commandCenter.sections.trustedActions",
    surface: "actions",
    brandLevel: "L0"
  },
  {
    id: "result-history",
    labelKey: "commandCenter.sections.resultHistory",
    surface: "logs",
    brandLevel: "L0"
  }
];

export const commandCenterSafetyPolicy = {
  mode: "read-only-first",
  allowedRiskLevels: [0],
  mutationActionsDisabled: true,
  mutationDisabledReasonKey: "commandCenter.safety.mutationDisabled",
  requiresExplicitHostTarget: true
};

export const commandCenterEmptyState = {
  status: "Offline",
  titleKey: "commandCenter.empty.title",
  messageKey: "commandCenter.empty.message",
  brandState: "Offline",
  brandLevel: "L2"
};

export const commandCenterDefaultHistoryFilters = {
  host: "selected",
  action: "",
  status: "all",
  query: "",
  limit: 20
};

export const commandCenterSharedRecoveryActions = [
  { id: "retry-refresh", labelKey: "commandCenter.recovery.retryRefresh", focusTarget: "recoveryPanel" },
  { id: "clear-error", labelKey: "commandCenter.recovery.clearError", focusTarget: "refreshButton" },
  { id: "use-mock-mode", labelKey: "commandCenter.recovery.useMockMode", focusTarget: "activityBand" }
];

export const commandCenterSharedEmptyStates = {
  noHosts: {
    id: "no-hosts",
    scope: "hosts",
    messageKey: "commandCenter.empty.noHosts",
    nextAction: "use-mock-mode",
    focusTarget: "activityBand",
    tone: "muted"
  },
  noActions: {
    id: "no-actions",
    scope: "actions",
    messageKey: "commandCenter.empty.noActions",
    nextAction: "retry-refresh",
    focusTarget: "refreshButton",
    tone: "muted"
  },
  noHistory: {
    id: "no-history",
    scope: "history",
    messageKey: "commandCenter.empty.noHistory",
    nextAction: "run-read-only-action",
    focusTarget: "actionList",
    tone: "muted"
  },
  noFilteredHistory: {
    id: "no-filtered-history",
    scope: "history",
    messageKey: "commandCenter.empty.noFilteredHistory",
    nextAction: "reset-filters",
    focusTarget: "queryFilter",
    tone: "muted"
  }
};

export const commandCenterRuntimePrototypeAlignment = {
  version: "0.5.9-alpha.0",
  statusSource: "buildCommandCenterViewModel",
  serviceFailureCode: "LOCAL_SERVICE_UNAVAILABLE",
  recoveryActions: commandCenterSharedRecoveryActions.map((action) => action.id),
  emptyStates: Object.values(commandCenterSharedEmptyStates).map((state) => state.id),
  mockExecutionCodes: ["RUNTIME_MOCK_EXECUTED", "PROTOTYPE_MOCK_EXECUTED"],
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterDiagnosticsFirstSlice = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_diagnostics_state.py",
  diagnostics: ["local-service", "host-heartbeat", "trusted-actions", "last-command-error"],
  heartbeatStaleAfterMs: 120000,
  serviceFailureCode: "LOCAL_SERVICE_UNAVAILABLE",
  staleHeartbeatCode: "HOST_HEARTBEAT_STALE",
  missingCapabilityCode: "CAPABILITY_MISSING",
  recentCommandErrorCode: "COMMAND_ERROR_PRESENT",
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterDiagnosticRecoveryActions = {
  "retry-refresh": {
    id: "retry-refresh",
    labelKey: "commandCenter.recovery.retryRefresh",
    focusTarget: "diagnosticsPanel"
  },
  "use-mock-mode": {
    id: "use-mock-mode",
    labelKey: "commandCenter.recovery.useMockMode",
    focusTarget: "activityBand"
  },
  "reset-filters": {
    id: "reset-filters",
    labelKey: "commandCenter.recovery.resetFilters",
    focusTarget: "queryFilter"
  },
  "view-latest-error": {
    id: "view-latest-error",
    labelKey: "commandCenter.recovery.viewLatestError",
    focusTarget: "detailPanel"
  }
};

export const commandCenterDiagnosticsRecoveryUx = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_diagnostics_recovery_ux.py",
  recoveryActions: Object.keys(commandCenterDiagnosticRecoveryActions),
  diagnosticActionMap: {
    "local-service": ["retry-refresh", "use-mock-mode"],
    "host-heartbeat": ["retry-refresh", "use-mock-mode"],
    "trusted-actions": ["retry-refresh"],
    "last-command-error": ["view-latest-error", "reset-filters"]
  },
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterHostReadinessGate = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_host_readiness_gate.py",
  checks: ["local-service", "host-target", "host-heartbeat", "trusted-actions", "command-history", "diagnostic-recovery"],
  requiredChecks: ["local-service", "host-target", "host-heartbeat", "trusted-actions", "diagnostic-recovery"],
  readOnlyOnly: true,
  hostMutationAllowed: false,
  realHostTestAllowedWhen: "all-required-checks-ready"
};

export const commandCenterReadinessDrilldown = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_readiness_drilldown.py",
  sourceContract: "commandCenterHostReadinessGate",
  actionLabelKey: "commandCenter.readiness.viewRelatedArea",
  defaultTarget: { targetId: "diagnosticsPanel" },
  targets: {
    "local-service": { targetId: "diagnosticsPanel", fallbackTargetId: "refreshButton" },
    "host-target": { targetId: "hostStrip" },
    "host-heartbeat": { targetId: "diagnosticsPanel" },
    "trusted-actions": { targetId: "actionList" },
    "command-history": { targetId: "historyTable" },
    "diagnostic-recovery": { targetId: "diagnosticsPanel" }
  },
  eventMarkers: ["data-readiness-drilldown", "data-readiness-target"],
  keyboardTriggers: ["Enter", "Space"],
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterHostSmokeHandoffChecklist = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_host_smoke_handoff.py",
  readinessContract: "commandCenterHostReadinessGate",
  drilldownContract: "commandCenterReadinessDrilldown",
  mode: "manual-handoff-only",
  automaticHostLaunchAllowed: false,
  requiresUserConfirmation: true,
  requiresProjectBackup: true,
  readOnlyOnly: true,
  hostMutationAllowed: false,
  requiredBeforeHostSmoke: [
    "local-service-running",
    "desktop-command-center-open",
    "host-extension-opened-by-user",
    "target-host-locked",
    "host-readiness-required-checks-ready",
    "result-history-visible",
    "manual-project-backup-confirmed"
  ],
  allowedReadOnlyActions: [
    "ae.context.getProject",
    "ae.context.getActiveComp",
    "ae.context.getSelection",
    "ae.text.readSelectedLayers",
    "pr.context.getProject",
    "pr.context.getActiveSequence"
  ],
  expectedResultCodes: ["TRUSTED_ACTION_EXECUTED"],
  forbiddenActionPatterns: [
    "create",
    "delete",
    "write",
    "set",
    "save",
    "render",
    "export",
    "import",
    "mutate"
  ],
  rollbackNotes: [
    "Stop Local Service before retrying a failed host smoke.",
    "Close the AE/PR extension panel if heartbeat or target lock becomes stale.",
    "Use the backed-up project copy if any unexpected host mutation is observed."
  ],
  manualSteps: [
    { id: "start-local-service", target: "Local Service", expected: "/health ok and authenticated routes require X-Kuroii-Session" },
    { id: "open-host-project-copy", target: "AE/PR", expected: "Only a disposable or backed-up project is open" },
    { id: "open-host-extension", target: "AE/PR Host Agent", expected: "Host registration and heartbeat are visible in Desktop" },
    { id: "lock-target-host", target: "Desktop Command Center", expected: "Selected host matches the intended AE or PR target" },
    { id: "run-read-only-context-action", target: "Trusted Actions", expected: "Result history records TRUSTED_ACTION_EXECUTED with ok=true" },
    { id: "review-result-history", target: "Result History", expected: "Command detail contains read-only data and no mutation warnings" }
  ]
};

export const commandCenterMockHostSmokeRehearsal = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_mock_host_smoke_rehearsal.py",
  sourceChecklist: "commandCenterHostSmokeHandoffChecklist",
  mode: "mock-only-rehearsal",
  usesMockDataOnly: true,
  automaticHostLaunchAllowed: false,
  serviceRequired: false,
  stopOnFirstFailure: true,
  readOnlyOnly: true,
  hostMutationAllowed: false,
  rehearsedChecks: [
    "checklist-loaded",
    "target-lock-valid",
    "selected-host-connected",
    "required-readiness-ready",
    "allowed-actions-present",
    "forbidden-actions-absent",
    "result-history-captures-read-only-records",
    "failure-interrupts-run"
  ],
  failureScenarios: [
    "target-lock-mismatch",
    "forbidden-action-requested",
    "command-result-failed",
    "missing-result-history"
  ],
  expectedMockResultCode: "TRUSTED_ACTION_EXECUTED"
};
export const commandCenterRehearsalResultPanel = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_rehearsal_result_panel.py",
  sourceRehearsal: "commandCenterMockHostSmokeRehearsal",
  displayMode: "compact-read-only-panel",
  surface: "desktop-command-center-prototype",
  defaultCollapsed: false,
  visibleFields: [
    "status",
    "check-summary",
    "blocked-checks",
    "simulated-result-history",
    "failure-interrupt-reason",
    "manual-host-smoke-readiness"
  ],
  eventMarkers: ["data-rehearsal-result-panel", "data-rehearsal-check", "data-rehearsal-history", "data-rehearsal-toggle"],
  keyboardTriggers: ["Enter", "Space", "Escape"],
  usesMockDataOnly: true,
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterManualHostSmokeRunbook = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_manual_host_smoke_runbook.py",
  sourceContracts: [
    "commandCenterHostReadinessGate",
    "commandCenterHostSmokeHandoffChecklist",
    "commandCenterMockHostSmokeRehearsal",
    "commandCenterRehearsalResultPanel"
  ],
  displayMode: "copy-export-read-only-runbook",
  outputFormats: ["markdown", "json"],
  visibleSections: [
    "safety-summary",
    "target-lock",
    "readiness-summary",
    "rehearsal-summary",
    "allowed-actions",
    "manual-steps",
    "rollback-notes",
    "export-metadata"
  ],
  eventMarkers: ["data-host-smoke-runbook", "data-runbook-copy", "data-runbook-export", "data-runbook-preview"],
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterRunbookExportFeedbackState = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_runbook_export_feedback_state.py",
  sourceContract: "commandCenterManualHostSmokeRunbook",
  storageKey: "kuroii.motionai.commandCenter.runbookExportState.v1",
  displayMode: "inline-feedback-and-persisted-state",
  actionTypes: [
    "generated",
    "copy-success",
    "copy-failed",
    "export-markdown-success",
    "export-json-success",
    "export-failed"
  ],
  persistedFields: [
    "runbookId",
    "selectedHost",
    "runbookStatus",
    "lastAction",
    "lastFormat",
    "lastResult",
    "lastGeneratedAt",
    "lastExportedAt",
    "lastMessageKey"
  ],
  eventMarkers: ["data-runbook-feedback", "data-runbook-persisted-state"],
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterManualHostSmokeEvidencePack = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_manual_host_smoke_evidence_pack.py",
  sourceContracts: [
    "commandCenterHostReadinessGate",
    "commandCenterHostSmokeHandoffChecklist",
    "commandCenterManualHostSmokeRunbook",
    "commandCenterRunbookExportFeedbackState"
  ],
  displayMode: "local-read-only-evidence-pack",
  outputFormats: ["markdown", "json"],
  notesStorageKey: "kuroii.motionai.commandCenter.evidencePackNotes.v1",
  visibleSections: [
    "safety-summary",
    "target-lock",
    "readiness-summary",
    "runbook-summary",
    "runbook-export-summary",
    "allowed-actions",
    "manual-reviewer-notes",
    "export-metadata"
  ],
  eventMarkers: [
    "data-host-smoke-evidence-pack",
    "data-evidence-pack-preview",
    "data-evidence-pack-copy",
    "data-evidence-pack-export",
    "data-evidence-notes"
  ],
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterManualHostSmokeReviewChecklist = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_manual_host_smoke_review_checklist.py",
  sourceContracts: [
    "commandCenterManualHostSmokeEvidencePack",
    "commandCenterHostReadinessGate",
    "commandCenterRunbookExportFeedbackState"
  ],
  displayMode: "manual-host-smoke-review-checklist",
  storageKey: "kuroii.motionai.commandCenter.reviewChecklistState.v1",
  requiredItems: [
    "evidence-pack-generated",
    "project-copy-confirmed",
    "target-lock-reviewed",
    "readiness-blockers-reviewed",
    "runbook-export-reviewed",
    "allowed-actions-reviewed",
    "manual-notes-reviewed",
    "sensitive-data-reviewed",
    "manual-launch-only-confirmed"
  ],
  eventMarkers: [
    "data-host-smoke-review-checklist",
    "data-review-checklist-item",
    "data-review-checklist-toggle",
    "data-review-checklist-summary",
    "data-review-checklist-reset"
  ],
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterManualHostSmokeSessionDraft = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_manual_host_smoke_session_draft.py",
  sourceContracts: [
    "commandCenterManualHostSmokeReviewChecklist",
    "commandCenterManualHostSmokeEvidencePack",
    "commandCenterManualHostSmokeRunbook",
    "commandCenterHostSmokeHandoffChecklist"
  ],
  displayMode: "manual-host-smoke-session-draft",
  storageKey: "kuroii.motionai.commandCenter.hostSmokeSessionDraft.v1",
  visibleSections: [
    "session-summary",
    "target-host",
    "start-conditions",
    "allowed-actions",
    "stop-conditions",
    "result-placeholders"
  ],
  eventMarkers: [
    "data-host-smoke-session-draft",
    "data-session-draft-preview",
    "data-session-draft-copy",
    "data-session-draft-export",
    "data-session-draft-save",
    "data-session-draft-reset"
  ],
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualPreviewPass = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_ae_pr_visual_preview.py",
  sourceContracts: [
    "commandCenterManualHostSmokeSessionDraft",
    "commandCenterHostReadinessGate",
    "commandCenterRuntimePrototypeAlignment"
  ],
  displayMode: "desktop-ae-pr-visual-preview-pass",
  surfaces: ["desktop", "after-effects", "premiere-pro"],
  requiredProfiles: ["Desktop", "Adobe Extension"],
  visualChecks: [
    "dark-zh-expanded",
    "dark-en-collapsed",
    "light-zh-expanded",
    "light-en-collapsed",
    "ae-compact-240-320-420",
    "pr-compact-240-320-420"
  ],
  eventMarkers: [
    "data-visual-preview-pass",
    "data-visual-preview-summary",
    "data-visual-preview-surface",
    "data-visual-preview-drawer",
    "data-visual-overview-toggle"
  ],
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualReviewMatrix = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_visual_review_matrix.py",
  sourceContracts: [
    "commandCenterVisualPreviewPass",
    "commandCenterRuntimePrototypeAlignment",
    "commandCenterHostSmokeHandoffChecklist"
  ],
  displayMode: "visual-review-matrix-and-screenshot-checklist",
  screenshotNamingPattern: "v0.5.6_{surface}_{theme}_{locale}_{layout}_{width}_{dpi}.png",
  minimumScore: 85,
  requiredMatrixIds: [
    "desktop-dark-zh-expanded",
    "desktop-dark-en-collapsed",
    "desktop-light-zh-expanded",
    "desktop-light-en-collapsed",
    "ae-compact-240-dark-zh",
    "ae-compact-320-dark-en",
    "ae-compact-420-light-zh",
    "pr-compact-240-dark-zh",
    "pr-compact-320-dark-en",
    "pr-compact-420-light-zh"
  ],
  scoreCategories: [
    "theme-completeness",
    "localization",
    "responsive-layout",
    "component-states",
    "icons-tooltips",
    "accessibility",
    "brand-consistency",
    "loading-error-empty",
    "visual-regression-self-check"
  ],
  blockingIssues: [
    "unreadable-text",
    "horizontal-overflow",
    "missing-tooltip",
    "placeholder-question-marks",
    "auto-host-launch",
    "host-mutation-control"
  ],
  eventMarkers: [
    "data-visual-review-matrix",
    "data-visual-review-summary",
    "data-visual-review-item",
    "data-visual-scorecard",
    "data-visual-blocker"
  ],
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualSignoffState = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_visual_signoff_state.py",
  sourceContracts: [
    "commandCenterVisualReviewMatrix",
    "commandCenterVisualPreviewPass"
  ],
  displayMode: "manual-visual-signoff-state-and-findings-backlog",
  storageKey: "kuroii.motionai.commandCenter.visualSignoffState.v1",
  allowedStatuses: [
    "pending-review",
    "accepted",
    "blocked",
    "needs-recheck"
  ],
  findingTypes: [
    "unreadable-text",
    "horizontal-overflow",
    "missing-tooltip",
    "placeholder-question-marks",
    "contrast",
    "layout",
    "copy",
    "brand-consistency"
  ],
  findingStatuses: [
    "open",
    "resolved"
  ],
  eventMarkers: [
    "data-visual-signoff-state",
    "data-visual-signoff-summary",
    "data-visual-signoff-item",
    "data-visual-signoff-action",
    "data-visual-findings-backlog",
    "data-visual-finding-add",
    "data-visual-finding-resolve"
  ],
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualEvidenceExport = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_visual_evidence_export.py",
  sourceContracts: [
    "commandCenterVisualReviewMatrix",
    "commandCenterVisualSignoffState",
    "commandCenterVisualPreviewPass"
  ],
  displayMode: "pre-host-visual-evidence-export",
  outputFormats: ["markdown", "json"],
  visibleSections: [
    "export-summary",
    "screenshot-matrix",
    "signoff-summary",
    "findings-backlog",
    "safety-flags"
  ],
  eventMarkers: [
    "data-visual-evidence-export",
    "data-visual-evidence-summary",
    "data-visual-evidence-preview",
    "data-visual-evidence-copy",
    "data-visual-evidence-export"
  ],
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualEvidenceReviewLock = {
  version: "0.5.9-alpha.0",
  testScript: "tests/smoke_desktop_visual_evidence_review_lock.py",
  sourceContracts: ["commandCenterVisualEvidenceExport", "commandCenterVisualSignoffState"],
  displayMode: "pre-host-visual-evidence-review-lock",
  visibleSections: ["review-summary", "reviewer", "review-note", "lock-state"],
  eventMarkers: ["data-visual-evidence-review-lock", "data-visual-evidence-review-lock-summary"],
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterReadinessMessageKeys = {
  summaryReady: "commandCenter.readiness.summary.ready",
  summaryWarning: "commandCenter.readiness.summary.warning",
  summaryBlocked: "commandCenter.readiness.summary.blocked",
  localServiceReady: "commandCenter.readiness.localService.ready",
  localServiceBlocked: "commandCenter.readiness.localService.blocked",
  hostTargetReady: "commandCenter.readiness.hostTarget.ready",
  hostTargetBlocked: "commandCenter.readiness.hostTarget.blocked",
  hostHeartbeatReady: "commandCenter.readiness.hostHeartbeat.ready",
  hostHeartbeatBlocked: "commandCenter.readiness.hostHeartbeat.blocked",
  trustedActionsReady: "commandCenter.readiness.trustedActions.ready",
  trustedActionsBlocked: "commandCenter.readiness.trustedActions.blocked",
  commandHistoryReady: "commandCenter.readiness.commandHistory.ready",
  commandHistoryWarning: "commandCenter.readiness.commandHistory.warning",
  commandHistoryBlocked: "commandCenter.readiness.commandHistory.blocked",
  diagnosticRecoveryReady: "commandCenter.readiness.diagnosticRecovery.ready",
  diagnosticRecoveryBlocked: "commandCenter.readiness.diagnosticRecovery.blocked"
};

export const commandCenterDiagnosticMessageKeys = {
  localServiceConnected: "commandCenter.diagnostics.localService.connected",
  localServiceMock: "commandCenter.diagnostics.localService.mock",
  localServiceError: "commandCenter.diagnostics.localService.error",
  hostHeartbeatConnected: "commandCenter.diagnostics.hostHeartbeat.connected",
  hostHeartbeatStale: "commandCenter.diagnostics.hostHeartbeat.stale",
  hostOffline: "commandCenter.diagnostics.hostHeartbeat.offline",
  trustedActionsReady: "commandCenter.diagnostics.trustedActions.ready",
  trustedActionsMissing: "commandCenter.diagnostics.trustedActions.missing",
  lastCommandClean: "commandCenter.diagnostics.lastCommand.clean",
  lastCommandError: "commandCenter.diagnostics.lastCommand.error"
};

export const commandCenterOperationStates = {
  idle: { status: "idle", brandState: "Idle", tone: "muted" },
  refreshing: { status: "refreshing", brandState: "Connecting", tone: "warning" },
  executing: { status: "executing", brandState: "Executing", tone: "warning" },
  loadingDetail: { status: "loading-detail", brandState: "Thinking", tone: "warning" },
  error: { status: "error", brandState: "Error", tone: "error" }
};

export function selectDefaultHost(hosts = [], target = {}) {
  const normalizedHosts = hosts.filter(Boolean);
  const lockedHost = target.hostLock && target.targetHost
    ? normalizedHosts.find((item) => item.host === target.targetHost)
    : null;
  if (lockedHost) return lockedHost.host;
  const connected = normalizedHosts.find((item) => item.status === "Connected");
  if (connected) return connected.host;
  return normalizedHosts[0] ? normalizedHosts[0].host : null;
}

export function hostStatusTone(status) {
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

export function resultStatusTone(ok) {
  if (ok === true) return "success";
  if (ok === false) return "error";
  return "muted";
}

export function normalizeHistoryFilters(filters = {}, selectedHost = null) {
  const source = filters || {};
  const status = ["all", "success", "failed"].includes(source.status) ? source.status : commandCenterDefaultHistoryFilters.status;
  let host = typeof source.host === "string" && source.host ? source.host : commandCenterDefaultHistoryFilters.host;
  if (host === "selected" && !selectedHost) host = "all";
  const limitNumber = Number(source.limit || commandCenterDefaultHistoryFilters.limit);
  return {
    host,
    action: typeof source.action === "string" ? source.action.trim() : "",
    status,
    query: typeof source.query === "string" ? source.query.trim() : "",
    limit: Number.isFinite(limitNumber) ? Math.max(1, Math.min(Math.trunc(limitNumber), 100)) : commandCenterDefaultHistoryFilters.limit
  };
}

export function historyFilterToServiceQuery(filters = {}, selectedHost = null) {
  const normalized = normalizeHistoryFilters(filters, selectedHost);
  const query = { limit: normalized.limit };
  if (normalized.host === "selected" && selectedHost) {
    query.host = selectedHost;
  } else if (normalized.host !== "all") {
    query.host = normalized.host;
  }
  if (normalized.action) query.action = normalized.action;
  if (normalized.status === "success") query.ok = true;
  if (normalized.status === "failed") query.ok = false;
  return query;
}

export function summarizeHostContext(contextPayload) {
  const item = contextPayload && contextPayload.context ? contextPayload.context : contextPayload;
  const context = item && item.context ? item.context : {};
  const project = item && item.project ? item.project : {};
  const activeTarget = context.activeComp || context.activeSequence || null;
  const selection = Array.isArray(context.selection) ? context.selection : [];
  return {
    host: item ? item.host : null,
    status: item ? item.status : "Offline",
    projectName: project.projectName || "Untitled Project",
    projectId: project.projectId || null,
    activeTarget,
    activeTargetName: activeTarget ? activeTarget.name : null,
    selectionCount: selection.length,
    selection,
    lastSeenAt: item ? item.lastSeenAt : null
  };
}

export function historyRecordSearchText(record = {}) {
  return [
    record.commandId,
    record.host,
    record.action,
    record.code,
    record.message,
    record.sessionId,
    record.httpStatus
  ].filter(Boolean).join(" ").toLowerCase();
}

export function matchesHistoryFilter(record = {}, filters = {}, selectedHost = null) {
  const normalized = normalizeHistoryFilters(filters, selectedHost);
  const hostFilter = normalized.host === "selected" ? selectedHost : normalized.host;
  if (hostFilter && hostFilter !== "all" && record.host !== hostFilter) return false;
  if (normalized.action && record.action !== normalized.action) return false;
  if (normalized.status === "success" && record.ok !== true) return false;
  if (normalized.status === "failed" && record.ok !== false) return false;
  if (normalized.query && !historyRecordSearchText(record).includes(normalized.query.toLowerCase())) return false;
  return true;
}

export function buildCommandDetail(record = null) {
  if (!record) {
    return {
      open: false,
      commandId: null,
      tone: "muted",
      titleKey: "commandCenter.detail.emptyTitle",
      messageKey: "commandCenter.detail.emptyMessage"
    };
  }
  const result = record.result || record;
  const command = record.command || null;
  return {
    open: true,
    commandId: record.commandId || result.commandId || null,
    host: record.host || (command ? command.host : null),
    action: record.action || (command ? command.action : null),
    code: record.code || result.code || null,
    ok: typeof record.ok === "boolean" ? record.ok : result.ok,
    tone: resultStatusTone(typeof record.ok === "boolean" ? record.ok : result.ok),
    message: record.message || result.message || "",
    durationMs: record.durationMs || result.durationMs || 0,
    recordedAt: record.recordedAt || null,
    httpStatus: record.httpStatus || null,
    warnings: result.warnings || [],
    data: result.data || record.data || {},
    command,
    result,
    raw: record
  };
}

export function buildActivityState(input = {}) {
  if (input.lastError) {
    return {
      ...commandCenterOperationStates.error,
      labelKey: "commandCenter.activity.error",
      message: input.lastError.message || "Local Service is unavailable."
    };
  }
  if (input.pendingOperation === "refreshing") {
    return {
      ...commandCenterOperationStates.refreshing,
      labelKey: "commandCenter.activity.refreshing"
    };
  }
  if (input.pendingOperation === "executing") {
    return {
      ...commandCenterOperationStates.executing,
      labelKey: "commandCenter.activity.executing",
      actionId: input.runningActionId || null
    };
  }
  if (input.pendingOperation === "loading-detail") {
    return {
      ...commandCenterOperationStates.loadingDetail,
      labelKey: "commandCenter.activity.loadingDetail",
      commandId: input.selectedCommandId || null
    };
  }
  return {
    ...commandCenterOperationStates.idle,
    labelKey: input.serviceOnline ? "commandCenter.activity.ready" : "commandCenter.activity.mockReady"
  };
}

export function buildRecoveryState(lastError = null) {
  if (!lastError) {
    return { visible: false, actions: [] };
  }
  return {
    visible: true,
    code: lastError.code || commandCenterRuntimePrototypeAlignment.serviceFailureCode,
    message: lastError.message || "Local Service is unavailable.",
    advice: lastError.advice || [],
    actions: commandCenterSharedRecoveryActions
  };
}

export function buildCommandCenterEmptyStates(input = {}) {
  const hosts = input.hosts || [];
  const selectedHost = input.selectedHost || null;
  const history = input.history || [];
  const historyFilters = normalizeHistoryFilters(input.historyFilters, selectedHost);
  const filteredHistory = input.filteredHistory || history.filter((record) => matchesHistoryFilter(record, historyFilters, selectedHost));
  const filteredActions = (input.trustedActions || []).filter((action) => !selectedHost || action.host === selectedHost);
  return {
    hosts: hosts.length ? null : commandCenterSharedEmptyStates.noHosts,
    actions: filteredActions.length ? null : commandCenterSharedEmptyStates.noActions,
    history: filteredHistory.length
      ? null
      : (history.length ? commandCenterSharedEmptyStates.noFilteredHistory : commandCenterSharedEmptyStates.noHistory)
  };
}

function minutesBetween(nowIso, thenIso) {
  if (!nowIso || !thenIso) return null;
  const now = Date.parse(nowIso);
  const then = Date.parse(thenIso);
  if (!Number.isFinite(now) || !Number.isFinite(then)) return null;
  return Math.max(0, Math.round((now - then) / 60000));
}

export function resolveDiagnosticRecoveryActions(diagnosticId, status = "ok") {
  if (status === "ok") return [];
  const actionIds = commandCenterDiagnosticsRecoveryUx.diagnosticActionMap[diagnosticId] || [];
  return actionIds
    .map((actionId) => commandCenterDiagnosticRecoveryActions[actionId])
    .filter(Boolean);
}

function diagnosticItem(id, status, tone, labelKey, messageKey, details = {}) {
  return {
    id,
    status,
    tone,
    labelKey,
    messageKey,
    recoveryActions: resolveDiagnosticRecoveryActions(id, status),
    ...details
  };
}

export function findLatestCommandError(history = []) {
  return history.find((record) => record && record.ok === false) || null;
}

function actionViolatesHostSmokeHandoff(actionId = "") {
  const normalized = String(actionId || "").toLowerCase();
  return commandCenterHostSmokeHandoffChecklist.forbiddenActionPatterns.some((pattern) => normalized.includes(pattern));
}

function isAllowedHostSmokeAction(action = {}) {
  return commandCenterHostSmokeHandoffChecklist.allowedReadOnlyActions.includes(action.id)
    && action.readOnly === true
    && action.riskLevel === 0
    && !actionViolatesHostSmokeHandoff(action.id);
}

function rehearsalCheck(id, ok, details = {}) {
  return { id, status: ok ? "pass" : "blocked", ok, ...details };
}

export function buildMockHostSmokeRehearsal(input = {}) {
  const hosts = input.hosts || [];
  const target = input.target || {};
  const selectedHost = input.selectedHost || selectDefaultHost(hosts, target);
  const selectedHostRecord = hosts.find((host) => host.host === selectedHost) || null;
  const selectedActions = (input.trustedActions || []).filter((action) => !selectedHost || action.host === selectedHost);
  const allowedActions = selectedActions.filter((action) => isAllowedHostSmokeAction(action));
  const forbiddenActions = selectedActions.filter((action) => !isAllowedHostSmokeAction(action));
  const history = Array.isArray(input.history) ? input.history : [];
  const simulatedHistory = allowedActions.map((action) => ({
    commandId: `mock-rehearsal-${action.id}`,
    host: selectedHost,
    action: action.id,
    code: commandCenterMockHostSmokeRehearsal.expectedMockResultCode,
    ok: true,
    durationMs: 0,
    recordedAt: input.rehearsalNowIso || (selectedHostRecord ? selectedHostRecord.lastSeenAt : null) || null,
    data: { readOnly: true, mutationPerformed: false, rehearsalOnly: true }
  }));
  const rehearsalHistory = history.length ? history : simulatedHistory;
  const allowedHistory = rehearsalHistory.filter((record) => record.host === selectedHost && commandCenterHostSmokeHandoffChecklist.allowedReadOnlyActions.includes(record.action));
  const failedRecord = allowedHistory.find((record) => record.ok === false) || null;
  const rehearsalNowIso = input.rehearsalNowIso || (selectedHostRecord ? selectedHostRecord.lastSeenAt : null) || input.diagnosticsNowIso || null;
  const readinessGate = input.hostReadinessGate || buildHostReadinessGate({
    ...input,
    hosts,
    target,
    selectedHost,
    trustedActions: input.trustedActions || [],
    history: rehearsalHistory,
    serviceOnline: input.serviceOnline !== false,
    nowIso: rehearsalNowIso
  }, input.diagnostics || null);
  const readinessChecks = readinessGate.checks || [];
  const requiredReadinessReady = commandCenterHostReadinessGate.requiredChecks.every((id) => {
    const item = readinessChecks.find((check) => check.id === id);
    return item && item.status === "ready";
  });
  const targetLockValid = target.hostLock === true && target.targetHost === selectedHost;
  const checks = [
    rehearsalCheck("checklist-loaded", true, { contract: commandCenterHostSmokeHandoffChecklist.mode }),
    rehearsalCheck("target-lock-valid", targetLockValid, { selectedHost, targetHost: target.targetHost || null }),
    rehearsalCheck("selected-host-connected", Boolean(selectedHostRecord && selectedHostRecord.status !== "Offline"), { hostStatus: selectedHostRecord ? selectedHostRecord.status : "Missing" }),
    rehearsalCheck("required-readiness-ready", requiredReadinessReady, { readinessStatus: readinessGate.status }),
    rehearsalCheck("allowed-actions-present", allowedActions.length > 0, { count: allowedActions.length, actions: allowedActions.map((action) => action.id) }),
    rehearsalCheck("forbidden-actions-absent", forbiddenActions.length === 0, { count: forbiddenActions.length, actions: forbiddenActions.map((action) => action.id) }),
    rehearsalCheck("result-history-captures-read-only-records", allowedHistory.length > 0, { count: allowedHistory.length }),
    rehearsalCheck("failure-interrupts-run", !failedRecord, { failedCommandId: failedRecord ? failedRecord.commandId : null })
  ];
  const blocked = checks.filter((item) => item.status === "blocked");
  return {
    contract: commandCenterMockHostSmokeRehearsal,
    sourceChecklist: commandCenterHostSmokeHandoffChecklist,
    mode: commandCenterMockHostSmokeRehearsal.mode,
    usesMockDataOnly: true,
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false,
    selectedHost,
    status: blocked.length ? "blocked" : "ready",
    canProceedToManualHostSmoke: blocked.length === 0,
    checks,
    blockedChecks: blocked.map((item) => item.id),
    allowedActions: allowedActions.map((action) => action.id),
    forbiddenActions: forbiddenActions.map((action) => action.id),
    rehearsalHistorySimulated: history.length === 0,
    simulatedResultHistory: simulatedHistory,
    lastAllowedHistoryRecord: allowedHistory[0] || null,
    interruptedByFailure: Boolean(failedRecord)
  };
}
export function buildRehearsalResultPanelState(input = {}) {
  const rehearsal = input.rehearsal || buildMockHostSmokeRehearsal(input);
  const checks = rehearsal.checks || [];
  const passCount = checks.filter((check) => check.status === "pass").length;
  const blockedChecks = checks.filter((check) => check.status === "blocked");
  const simulatedResultHistory = rehearsal.simulatedResultHistory || [];
  const latestHistoryRecord = rehearsal.lastAllowedHistoryRecord || simulatedResultHistory[0] || null;
  const failureReason = rehearsal.interruptedByFailure
    ? "command-result-failed"
    : (blockedChecks[0] ? blockedChecks[0].id : null);
  return {
    contract: commandCenterRehearsalResultPanel,
    sourceRehearsal: rehearsal,
    sourceRehearsalMode: rehearsal.mode,
    displayMode: commandCenterRehearsalResultPanel.displayMode,
    surface: commandCenterRehearsalResultPanel.surface,
    usesMockDataOnly: true,
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false,
    selectedHost: rehearsal.selectedHost || null,
    status: rehearsal.status,
    tone: rehearsal.status === "ready" ? "success" : "error",
    canProceedToManualHostSmoke: rehearsal.canProceedToManualHostSmoke === true,
    interruptedByFailure: rehearsal.interruptedByFailure === true,
    failureReason,
    summary: {
      totalChecks: checks.length,
      pass: passCount,
      blocked: blockedChecks.length,
      allowedActions: (rehearsal.allowedActions || []).length,
      forbiddenActions: (rehearsal.forbiddenActions || []).length,
      simulatedHistoryRecords: simulatedResultHistory.length
    },
    visibleChecks: checks.map((check) => ({
      id: check.id,
      status: check.status,
      ok: check.ok === true,
      code: check.code || null,
      count: typeof check.count === "number" ? check.count : null,
      failedCommandId: check.failedCommandId || null
    })),
    blockedChecks: blockedChecks.map((check) => check.id),
    simulatedResultHistory,
    historyPreview: latestHistoryRecord
  };
}

function markdownList(items = []) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function runbookFeedbackTone(result) {
  if (result === "success") return "success";
  if (result === "failed") return "error";
  return "muted";
}

export function buildManualHostSmokeRunbook(input = {}) {
  const hosts = input.hosts || [];
  const target = input.target || {};
  const selectedHost = input.selectedHost || selectDefaultHost(hosts, target);
  const trustedActions = input.trustedActions || [];
  const history = input.history || [];
  const diagnostics = input.diagnostics || buildCommandCenterDiagnostics({
    ...input,
    hosts,
    target,
    selectedHost,
    trustedActions,
    history,
    serviceOnline: input.serviceOnline,
    nowIso: input.diagnosticsNowIso
  });
  const hostReadinessGate = input.hostReadinessGate || buildHostReadinessGate({
    ...input,
    hosts,
    target,
    selectedHost,
    trustedActions,
    history,
    serviceOnline: input.serviceOnline,
    nowIso: input.diagnosticsNowIso
  }, diagnostics);
  const rehearsal = input.mockHostSmokeRehearsal || buildMockHostSmokeRehearsal({
    ...input,
    hosts,
    target,
    selectedHost,
    trustedActions,
    history,
    serviceOnline: input.serviceOnline,
    rehearsalNowIso: input.rehearsalNowIso || input.diagnosticsNowIso
  });
  const rehearsalResultPanel = input.rehearsalResultPanel || buildRehearsalResultPanelState({ rehearsal });
  const generatedAt = input.generatedAt || input.diagnosticsNowIso || input.rehearsalNowIso || null;
  const readinessBlocked = (hostReadinessGate.checks || []).filter((check) => check.status === "blocked").map((check) => check.id);
  const readinessWarnings = (hostReadinessGate.checks || []).filter((check) => check.status === "warning").map((check) => check.id);
  const allowedActions = commandCenterHostSmokeHandoffChecklist.allowedReadOnlyActions.filter((actionId) => {
    return trustedActions.some((action) => action.id === actionId && (!selectedHost || action.host === selectedHost));
  });
  const blockedItems = Array.from(new Set([
    ...readinessBlocked,
    ...(rehearsalResultPanel.blockedChecks || [])
  ]));
  const safetySummary = [
    "No automatic AE/PR launch.",
    "Use only a disposable or backed-up project copy.",
    "Run only allowlisted risk-0 read-only actions.",
    "Stop immediately on stale heartbeat, target mismatch, command failure, or mutation warning."
  ];
  const runbook = {
    contract: commandCenterManualHostSmokeRunbook,
    runbookId: `host-smoke-runbook-${selectedHost || "no-host"}`,
    generatedAt,
    title: "Kuroii Motion AI Manual Host Smoke Runbook",
    status: blockedItems.length ? "blocked" : "ready",
    canProceedToManualHostSmoke: blockedItems.length === 0 && rehearsalResultPanel.canProceedToManualHostSmoke === true,
    selectedHost,
    targetLock: {
      hostLock: target.hostLock === true,
      targetHost: target.targetHost || null,
      matchesSelectedHost: target.hostLock === true && target.targetHost === selectedHost
    },
    readinessSummary: {
      status: hostReadinessGate.status,
      summary: hostReadinessGate.summary,
      blocked: readinessBlocked,
      warnings: readinessWarnings
    },
    rehearsalSummary: {
      status: rehearsalResultPanel.status,
      failureReason: rehearsalResultPanel.failureReason,
      summary: rehearsalResultPanel.summary,
      blocked: rehearsalResultPanel.blockedChecks || []
    },
    allowedActions,
    forbiddenActionPatterns: commandCenterHostSmokeHandoffChecklist.forbiddenActionPatterns,
    manualSteps: commandCenterHostSmokeHandoffChecklist.manualSteps,
    rollbackNotes: commandCenterHostSmokeHandoffChecklist.rollbackNotes,
    blockedItems,
    safetySummary,
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
  const markdown = [
    `# ${runbook.title}`,
    "",
    `- Runbook ID: ${runbook.runbookId}`,
    `- Generated At: ${runbook.generatedAt || "not-set"}`,
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

export function buildRunbookExportFeedbackState(input = {}) {
  const persistedState = input.persistedState || {};
  const runbook = input.runbook || buildManualHostSmokeRunbook(input);
  const lastAction = input.lastAction || persistedState.lastAction || "generated";
  const lastFormat = Object.prototype.hasOwnProperty.call(input, "lastFormat")
    ? input.lastFormat
    : (persistedState.lastFormat || null);
  const lastResult = input.lastResult || persistedState.lastResult || "success";
  const recordedAt = input.recordedAt || input.nowIso || null;
  const lastGeneratedAt = runbook.generatedAt || persistedState.lastGeneratedAt || recordedAt;
  const isExportAction = lastAction.startsWith("export-");
  const lastExportedAt = input.lastExportedAt || (isExportAction ? recordedAt : persistedState.lastExportedAt) || null;
  const defaultMessageKey = lastResult === "success"
    ? "commandCenter.runbook.feedback.generated"
    : "commandCenter.runbook.feedback.idle";
  const lastMessageKey = input.lastMessageKey || persistedState.lastMessageKey || defaultMessageKey;
  const persisted = {
    runbookId: runbook.runbookId,
    selectedHost: runbook.selectedHost,
    runbookStatus: runbook.status,
    lastAction,
    lastFormat,
    lastResult,
    lastGeneratedAt,
    lastExportedAt,
    lastMessageKey
  };
  return {
    contract: commandCenterRunbookExportFeedbackState,
    storageKey: commandCenterRunbookExportFeedbackState.storageKey,
    runbookId: runbook.runbookId,
    selectedHost: runbook.selectedHost,
    runbookStatus: runbook.status,
    canProceedToManualHostSmoke: runbook.canProceedToManualHostSmoke,
    lastAction,
    lastFormat,
    lastResult,
    tone: runbookFeedbackTone(lastResult),
    lastGeneratedAt,
    lastExportedAt,
    lastMessageKey,
    persisted,
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
}

export function buildManualHostSmokeEvidencePack(input = {}) {
  const runbook = input.runbook || buildManualHostSmokeRunbook(input);
  const runbookExportFeedbackState = input.runbookExportFeedbackState || buildRunbookExportFeedbackState({
    runbook,
    persistedState: input.persistedRunbookExportState || input.persistedState,
    nowIso: input.nowIso || input.generatedAt || runbook.generatedAt
  });
  const generatedAt = input.generatedAt || input.nowIso || runbook.generatedAt || null;
  const notesText = String(input.manualReviewerNotes || input.reviewerNotes || "").trim();
  const runbookExportSummary = {
    storageKey: runbookExportFeedbackState.storageKey || commandCenterRunbookExportFeedbackState.storageKey,
    lastAction: runbookExportFeedbackState.lastAction || "generated",
    lastFormat: runbookExportFeedbackState.lastFormat || null,
    lastResult: runbookExportFeedbackState.lastResult || "success",
    lastMessageKey: runbookExportFeedbackState.lastMessageKey || null,
    lastGeneratedAt: runbookExportFeedbackState.lastGeneratedAt || runbook.generatedAt || null,
    lastExportedAt: runbookExportFeedbackState.lastExportedAt || null
  };
  const safetySummary = [
    "No automatic AE/PR launch.",
    "No real host action is executed by this evidence pack.",
    "Only allowlisted risk-0 read-only actions may be used in a later manual smoke.",
    "Manual reviewer notes stay local and must not include API keys, tokens, or private project content."
  ];
  const evidencePack = {
    contract: commandCenterManualHostSmokeEvidencePack,
    evidencePackId: `host-smoke-evidence-${runbook.selectedHost || "no-host"}`,
    generatedAt,
    title: "Kuroii Motion AI Manual Host Smoke Evidence Pack",
    status: runbook.canProceedToManualHostSmoke && runbookExportSummary.lastResult === "success" ? "ready" : "blocked",
    canProceedToManualHostSmoke: runbook.canProceedToManualHostSmoke === true && runbookExportSummary.lastResult === "success",
    selectedHost: runbook.selectedHost || null,
    targetLock: runbook.targetLock,
    readinessSummary: runbook.readinessSummary,
    runbookSummary: {
      runbookId: runbook.runbookId,
      status: runbook.status,
      canProceedToManualHostSmoke: runbook.canProceedToManualHostSmoke,
      generatedAt: runbook.generatedAt,
      blockedItems: runbook.blockedItems || []
    },
    runbookExportSummary,
    allowedActions: runbook.allowedActions || [],
    manualReviewerNotes: {
      text: notesText,
      status: notesText ? "provided" : "empty",
      requiredBeforeHostSmoke: true,
      containsSensitiveDataAllowed: false
    },
    safetySummary,
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
  const markdown = [
    `# ${evidencePack.title}`,
    "",
    `- Evidence Pack ID: ${evidencePack.evidencePackId}`,
    `- Generated At: ${evidencePack.generatedAt || "not-set"}`,
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

function normalizeCheckedReviewItems(input = {}) {
  const source = input.reviewChecklistState || input.persistedState || input;
  if (Array.isArray(source.checkedItems)) return new Set(source.checkedItems);
  if (source.checkedItems && typeof source.checkedItems === "object") {
    return new Set(Object.entries(source.checkedItems).filter(([, value]) => value === true).map(([key]) => key));
  }
  return new Set();
}

function reviewChecklistItem(id, labelKey, conditionSatisfied, checkedItems, details = {}) {
  const checked = checkedItems.has(id);
  const status = conditionSatisfied ? (checked ? "ready" : "needs-review") : "blocked";
  return {
    id,
    labelKey,
    required: true,
    checked,
    conditionSatisfied,
    status,
    ...details
  };
}

export function buildManualHostSmokeReviewChecklist(input = {}) {
  const evidencePack = input.evidencePack || buildManualHostSmokeEvidencePack(input);
  const checkedItems = normalizeCheckedReviewItems(input);
  const generatedAt = input.generatedAt || input.nowIso || evidencePack.generatedAt || null;
  const readinessBlocked = evidencePack.readinessSummary && Array.isArray(evidencePack.readinessSummary.blocked)
    ? evidencePack.readinessSummary.blocked
    : [];
  const allowedActions = Array.isArray(evidencePack.allowedActions) ? evidencePack.allowedActions : [];
  const notes = evidencePack.manualReviewerNotes || {};
  const runbookExport = evidencePack.runbookExportSummary || {};
  const targetLock = evidencePack.targetLock || {};
  const safetyFlagsReady = evidencePack.automaticHostLaunchAllowed === false
    && evidencePack.readOnlyOnly === true
    && evidencePack.hostMutationAllowed === false;
  const reviewItems = [
    reviewChecklistItem(
      "evidence-pack-generated",
      "commandCenter.reviewChecklist.item.evidencePackGenerated",
      Boolean(evidencePack.evidencePackId && evidencePack.generatedAt),
      checkedItems,
      { evidencePackId: evidencePack.evidencePackId || null }
    ),
    reviewChecklistItem(
      "project-copy-confirmed",
      "commandCenter.reviewChecklist.item.projectCopyConfirmed",
      true,
      checkedItems,
      { manualConfirmationRequired: true }
    ),
    reviewChecklistItem(
      "target-lock-reviewed",
      "commandCenter.reviewChecklist.item.targetLockReviewed",
      targetLock.hostLock === true && targetLock.matchesSelectedHost === true,
      checkedItems,
      { targetHost: targetLock.targetHost || null }
    ),
    reviewChecklistItem(
      "readiness-blockers-reviewed",
      "commandCenter.reviewChecklist.item.readinessBlockersReviewed",
      readinessBlocked.length === 0,
      checkedItems,
      { blockedItems: readinessBlocked }
    ),
    reviewChecklistItem(
      "runbook-export-reviewed",
      "commandCenter.reviewChecklist.item.runbookExportReviewed",
      runbookExport.lastResult === "success",
      checkedItems,
      { lastAction: runbookExport.lastAction || null, lastFormat: runbookExport.lastFormat || null }
    ),
    reviewChecklistItem(
      "allowed-actions-reviewed",
      "commandCenter.reviewChecklist.item.allowedActionsReviewed",
      allowedActions.length > 0,
      checkedItems,
      { count: allowedActions.length }
    ),
    reviewChecklistItem(
      "manual-notes-reviewed",
      "commandCenter.reviewChecklist.item.manualNotesReviewed",
      notes.status === "provided" && Boolean(notes.text),
      checkedItems,
      { notesStatus: notes.status || "empty" }
    ),
    reviewChecklistItem(
      "sensitive-data-reviewed",
      "commandCenter.reviewChecklist.item.sensitiveDataReviewed",
      notes.containsSensitiveDataAllowed === false,
      checkedItems,
      { containsSensitiveDataAllowed: notes.containsSensitiveDataAllowed === true }
    ),
    reviewChecklistItem(
      "manual-launch-only-confirmed",
      "commandCenter.reviewChecklist.item.manualLaunchOnlyConfirmed",
      safetyFlagsReady,
      checkedItems,
      { automaticHostLaunchAllowed: evidencePack.automaticHostLaunchAllowed, hostMutationAllowed: evidencePack.hostMutationAllowed }
    )
  ];
  const summary = {
    total: reviewItems.length,
    ready: reviewItems.filter((item) => item.status === "ready").length,
    needsReview: reviewItems.filter((item) => item.status === "needs-review").length,
    blocked: reviewItems.filter((item) => item.status === "blocked").length,
    checked: reviewItems.filter((item) => item.checked === true).length
  };
  const status = summary.blocked ? "blocked" : (summary.needsReview ? "needs-review" : "ready");
  const checklist = {
    contract: commandCenterManualHostSmokeReviewChecklist,
    checklistId: `host-smoke-review-${evidencePack.selectedHost || "no-host"}`,
    generatedAt,
    title: "Kuroii Motion AI Manual Host Smoke Review Checklist",
    sourceEvidencePackId: evidencePack.evidencePackId,
    selectedHost: evidencePack.selectedHost || null,
    status,
    canProceedToManualHostSmoke: status === "ready",
    reviewItems,
    summary,
    persisted: {
      storageKey: commandCenterManualHostSmokeReviewChecklist.storageKey,
      checklistId: `host-smoke-review-${evidencePack.selectedHost || "no-host"}`,
      sourceEvidencePackId: evidencePack.evidencePackId,
      selectedHost: evidencePack.selectedHost || null,
      checkedItems: reviewItems.filter((item) => item.checked).map((item) => item.id),
      lastUpdatedAt: generatedAt
    },
    automaticHostLaunchAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
  const markdown = [
    `# ${checklist.title}`,
    "",
    `- Checklist ID: ${checklist.checklistId}`,
    `- Evidence Pack ID: ${checklist.sourceEvidencePackId || "none"}`,
    `- Generated At: ${checklist.generatedAt || "not-set"}`,
    `- Selected Host: ${checklist.selectedHost || "none"}`,
    `- Status: ${checklist.status}`,
    `- Can Proceed To Manual Host Smoke: ${checklist.canProceedToManualHostSmoke ? "yes" : "no"}`,
    `- Automatic Host Launch Allowed: ${checklist.automaticHostLaunchAllowed ? "true" : "false"}`,
    `- Host Mutation Allowed: ${checklist.hostMutationAllowed ? "true" : "false"}`,
    "",
    "## Review Items",
    ...checklist.reviewItems.map((item) => `- [${item.checked ? "x" : " "}] ${item.id}: ${item.status}`)
  ].join("\n");
  return {
    ...checklist,
    markdown,
    json: JSON.stringify(checklist, null, 2)
  };
}

function sessionCondition(id, ok, details = {}) {
  return {
    id,
    status: ok ? "ready" : "blocked",
    ok,
    ...details
  };
}

export function buildManualHostSmokeSessionDraft(input = {}) {
  const reviewChecklist = input.reviewChecklist || buildManualHostSmokeReviewChecklist(input);
  const evidencePack = input.evidencePack || null;
  const generatedAt = input.generatedAt || input.nowIso || reviewChecklist.generatedAt || null;
  const selectedHost = reviewChecklist.selectedHost || (evidencePack ? evidencePack.selectedHost : null);
  const sessionId = input.sessionId
    || (input.sessionDraftState && input.sessionDraftState.sessionId)
    || `manual-host-smoke-session-${selectedHost || "no-host"}`;
  const allowedActions = reviewChecklist.reviewItems && evidencePack && Array.isArray(evidencePack.allowedActions)
    ? evidencePack.allowedActions
    : (input.allowedActions || []);
  const checklistReady = reviewChecklist.status === "ready" && reviewChecklist.canProceedToManualHostSmoke === true;
  const safetyFlagsReady = reviewChecklist.automaticHostLaunchAllowed === false
    && reviewChecklist.readOnlyOnly === true
    && reviewChecklist.hostMutationAllowed === false;
  const targetHostReady = Boolean(selectedHost);
  const startConditions = [
    sessionCondition("review-checklist-ready", checklistReady, { checklistId: reviewChecklist.checklistId || null }),
    sessionCondition("target-host-selected", targetHostReady, { selectedHost }),
    sessionCondition("allowed-actions-present", allowedActions.length > 0, { count: allowedActions.length }),
    sessionCondition("manual-launch-only", safetyFlagsReady, { automaticHostLaunchAllowed: false, hostMutationAllowed: false })
  ];
  const stopConditions = [
    "host-heartbeat-stale",
    "target-lock-mismatch",
    "command-result-failed",
    "mutation-warning-observed",
    "user-cancelled-session"
  ];
  const resultPlaceholders = [
    { id: "session-started-at", value: null, required: true },
    { id: "manual-host-opened-by-user", value: false, required: true },
    { id: "read-only-command-results", value: [], required: true },
    { id: "session-ended-at", value: null, required: true },
    { id: "failure-reason", value: null, required: false }
  ];
  const blockedConditions = startConditions.filter((item) => item.status === "blocked");
  const status = blockedConditions.length ? "blocked" : "ready";
  const draft = {
    contract: commandCenterManualHostSmokeSessionDraft,
    sessionId,
    generatedAt,
    title: "Kuroii Motion AI Manual Host Smoke Session Draft",
    status,
    canStartManualHostSmokeSession: status === "ready",
    selectedHost,
    sourceChecklistId: reviewChecklist.checklistId || null,
    sourceEvidencePackId: reviewChecklist.sourceEvidencePackId || null,
    startConditions,
    blockedConditions: blockedConditions.map((item) => item.id),
    allowedActions,
    stopConditions,
    resultPlaceholders,
    persisted: {
      storageKey: commandCenterManualHostSmokeSessionDraft.storageKey,
      sessionId,
      selectedHost,
      status,
      sourceChecklistId: reviewChecklist.checklistId || null,
      sourceEvidencePackId: reviewChecklist.sourceEvidencePackId || null,
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
    `- Generated At: ${draft.generatedAt || "not-set"}`,
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

function buildVisualSurface(input = {}) {
  const hostRecord = input.hostRecord || null;
  const trustedActions = input.trustedActions || [];
  const status = input.status || (hostRecord ? hostRecord.status : "preview-only");
  const actionCount = input.actionCount !== undefined
    ? input.actionCount
    : trustedActions.filter((action) => action.host === input.hostId).length;
  return {
    id: input.id,
    hostId: input.hostId || input.id,
    labelKey: input.labelKey,
    profile: input.profile,
    density: input.density,
    brandLevel: input.brandLevel,
    widthChecks: input.widthChecks,
    zones: input.zones,
    status,
    tone: input.tone || (status === "Connected" || status === "preview-ready" ? "success" : "muted"),
    actionCount,
    previewOnly: true,
    autoLaunchAllowed: false,
    hostMutationAllowed: false,
    notesKey: input.notesKey
  };
}

export function buildCommandCenterVisualPreview(input = {}) {
  const hosts = input.hosts || [];
  const trustedActions = input.trustedActions || [];
  const selectedHost = input.selectedHost || selectDefaultHost(hosts, input.target || {});
  const hostById = (id) => hosts.find((host) => host.host === id) || null;
  const surfaces = [
    buildVisualSurface({
      id: "desktop",
      hostId: "desktop-command-center",
      labelKey: "commandCenter.visualPreview.surface.desktop",
      profile: "Desktop",
      density: "comfortable",
      brandLevel: "L1/L2",
      widthChecks: ["LG", "XL"],
      zones: ["topbar", "sidebar", "command-workspace", "visual-preview-panel"],
      status: "preview-ready",
      tone: "success",
      actionCount: trustedActions.length,
      notesKey: "commandCenter.visualPreview.notes.desktop"
    }),
    buildVisualSurface({
      id: "after-effects",
      hostId: "after-effects",
      labelKey: "commandCenter.visualPreview.surface.afterEffects",
      profile: "Adobe Extension",
      density: "compact",
      brandLevel: "L0/L1",
      widthChecks: ["240px", "320px", "420px"],
      zones: ["compact-header", "status-strip", "read-only-actions", "event-log"],
      hostRecord: hostById("after-effects"),
      trustedActions,
      notesKey: "commandCenter.visualPreview.notes.afterEffects"
    }),
    buildVisualSurface({
      id: "premiere-pro",
      hostId: "premiere-pro",
      labelKey: "commandCenter.visualPreview.surface.premierePro",
      profile: "Adobe Extension",
      density: "compact",
      brandLevel: "L0/L1",
      widthChecks: ["240px", "320px", "420px"],
      zones: ["compact-header", "status-strip", "sequence-context", "event-log"],
      hostRecord: hostById("premiere-pro"),
      trustedActions,
      notesKey: "commandCenter.visualPreview.notes.premierePro"
    })
  ];
  return {
    contract: commandCenterVisualPreviewPass,
    generatedAt: input.generatedAt || input.nowIso || null,
    status: "preview-ready",
    selectedHost,
    summary: {
      total: surfaces.length,
      previewReady: surfaces.filter((surface) => surface.previewOnly).length,
      compactSurfaces: surfaces.filter((surface) => surface.density === "compact").length,
      blocked: 0
    },
    surfaces,
    overview: {
      mode: "drawer",
      defaultOpen: false,
      sections: [
        "desktop-command-center",
        "after-effects-compact-panel",
        "premiere-pro-compact-panel",
        "visual-regression-matrix"
      ]
    },
    visualChecks: commandCenterVisualPreviewPass.visualChecks,
    safety: {
      automaticHostLaunchAllowed: false,
      realHostSmokeAllowed: false,
      readOnlyOnly: true,
      hostMutationAllowed: false
    }
  };
}

function visualReviewItem(id, surface, theme, locale, layout, width, dpi, notesKey) {
  const fileName = commandCenterVisualReviewMatrix.screenshotNamingPattern
    .replace("{surface}", surface)
    .replace("{theme}", theme)
    .replace("{locale}", locale)
    .replace("{layout}", layout)
    .replace("{width}", width)
    .replace("{dpi}", dpi);
  return {
    id,
    surface,
    theme,
    locale,
    layout,
    width,
    dpi,
    notesKey,
    screenshotFileName: fileName,
    status: "pending-review",
    required: true,
    previewOnly: true
  };
}

export function buildCommandCenterVisualReviewMatrix(input = {}) {
  const visualPreview = input.visualPreview || buildCommandCenterVisualPreview(input);
  const matrixItems = [
    visualReviewItem("desktop-dark-zh-expanded", "desktop", "dark", "zh-CN", "expanded", "XL", "100", "commandCenter.visualReview.notes.desktopExpanded"),
    visualReviewItem("desktop-dark-en-collapsed", "desktop", "dark", "en-US", "collapsed", "XL", "125", "commandCenter.visualReview.notes.desktopCollapsed"),
    visualReviewItem("desktop-light-zh-expanded", "desktop", "light", "zh-CN", "expanded", "LG", "100", "commandCenter.visualReview.notes.lightTheme"),
    visualReviewItem("desktop-light-en-collapsed", "desktop", "light", "en-US", "collapsed", "LG", "125", "commandCenter.visualReview.notes.englishDensity"),
    visualReviewItem("ae-compact-240-dark-zh", "after-effects", "dark", "zh-CN", "compact", "240px", "100", "commandCenter.visualReview.notes.aeNarrow"),
    visualReviewItem("ae-compact-320-dark-en", "after-effects", "dark", "en-US", "compact", "320px", "125", "commandCenter.visualReview.notes.aeEnglish"),
    visualReviewItem("ae-compact-420-light-zh", "after-effects", "light", "zh-CN", "compact", "420px", "100", "commandCenter.visualReview.notes.aeLight"),
    visualReviewItem("pr-compact-240-dark-zh", "premiere-pro", "dark", "zh-CN", "compact", "240px", "100", "commandCenter.visualReview.notes.prNarrow"),
    visualReviewItem("pr-compact-320-dark-en", "premiere-pro", "dark", "en-US", "compact", "320px", "125", "commandCenter.visualReview.notes.prEnglish"),
    visualReviewItem("pr-compact-420-light-zh", "premiere-pro", "light", "zh-CN", "compact", "420px", "100", "commandCenter.visualReview.notes.prLight")
  ];
  const scorecard = commandCenterVisualReviewMatrix.scoreCategories.map((id) => ({
    id,
    maxScore: id === "theme-completeness" || id === "component-states" ? 15 : 10,
    status: "pending-review"
  }));
  return {
    contract: commandCenterVisualReviewMatrix,
    generatedAt: input.generatedAt || input.nowIso || null,
    status: "pending-review",
    sourceVisualPreviewStatus: visualPreview.status,
    matrixItems,
    scorecard,
    minimumScore: commandCenterVisualReviewMatrix.minimumScore,
    screenshotNamingPattern: commandCenterVisualReviewMatrix.screenshotNamingPattern,
    blockingIssues: commandCenterVisualReviewMatrix.blockingIssues.map((id) => ({
      id,
      status: "must-check",
      labelKey: `commandCenter.visualReview.blocker.${id}`
    })),
    summary: {
      total: matrixItems.length,
      desktop: matrixItems.filter((item) => item.surface === "desktop").length,
      afterEffects: matrixItems.filter((item) => item.surface === "after-effects").length,
      premierePro: matrixItems.filter((item) => item.surface === "premiere-pro").length,
      pending: matrixItems.length,
      blockers: commandCenterVisualReviewMatrix.blockingIssues.length
    },
    safety: {
      automaticHostLaunchAllowed: false,
      realHostSmokeAllowed: false,
      readOnlyOnly: true,
      hostMutationAllowed: false
    }
  };
}

function normalizeVisualSignoffState(input = {}) {
  const source = input.visualSignoffState || input.persistedState || input || {};
  const rawStatuses = source.statuses || source.items || {};
  const statuses = {};
  Object.entries(rawStatuses).forEach(([id, value]) => {
    if (typeof value === "string") {
      statuses[id] = { status: value };
      return;
    }
    if (value && typeof value === "object") {
      statuses[id] = {
        status: value.status,
        note: value.note || "",
        updatedAt: value.updatedAt || null
      };
    }
  });
  const findings = Array.isArray(source.findings)
    ? source.findings.filter((item) => item && item.matrixItemId)
    : [];
  return { statuses, findings };
}

function normalizeVisualSignoffStatus(status) {
  return commandCenterVisualSignoffState.allowedStatuses.includes(status)
    ? status
    : "pending-review";
}

function visualSignoffTone(status) {
  if (status === "accepted") return "success";
  if (status === "blocked") return "error";
  if (status === "needs-recheck") return "warning";
  return "muted";
}

export function buildCommandCenterVisualSignoffState(input = {}) {
  const visualReviewMatrix = input.visualReviewMatrix || buildCommandCenterVisualReviewMatrix(input);
  const generatedAt = input.generatedAt || input.nowIso || visualReviewMatrix.generatedAt || null;
  const normalized = normalizeVisualSignoffState(input);
  const matrixIds = new Set((visualReviewMatrix.matrixItems || []).map((item) => item.id));
  const findings = normalized.findings.map((finding, index) => {
    const type = commandCenterVisualSignoffState.findingTypes.includes(finding.type)
      ? finding.type
      : "layout";
    const status = commandCenterVisualSignoffState.findingStatuses.includes(finding.status)
      ? finding.status
      : "open";
    return {
      id: finding.id || `visual-finding-${index + 1}`,
      matrixItemId: finding.matrixItemId,
      type,
      severity: ["low", "medium", "high", "blocker"].includes(finding.severity) ? finding.severity : "medium",
      status,
      note: finding.note || "",
      createdAt: finding.createdAt || generatedAt,
      updatedAt: finding.updatedAt || finding.createdAt || generatedAt,
      orphaned: !matrixIds.has(finding.matrixItemId)
    };
  });
  const openFindingCountByItem = findings.reduce((acc, finding) => {
    if (finding.status !== "resolved" && !finding.orphaned) {
      acc[finding.matrixItemId] = (acc[finding.matrixItemId] || 0) + 1;
    }
    return acc;
  }, {});
  const signoffItems = (visualReviewMatrix.matrixItems || []).map((item) => {
    const persisted = normalized.statuses[item.id] || {};
    const status = normalizeVisualSignoffStatus(persisted.status);
    return {
      ...item,
      signoffStatus: status,
      tone: visualSignoffTone(status),
      reviewerNote: persisted.note || "",
      updatedAt: persisted.updatedAt || null,
      openFindingCount: openFindingCountByItem[item.id] || 0
    };
  });
  const summary = {
    total: signoffItems.length,
    accepted: signoffItems.filter((item) => item.signoffStatus === "accepted").length,
    blocked: signoffItems.filter((item) => item.signoffStatus === "blocked").length,
    needsRecheck: signoffItems.filter((item) => item.signoffStatus === "needs-recheck").length,
    pending: signoffItems.filter((item) => item.signoffStatus === "pending-review").length,
    openFindings: findings.filter((item) => item.status !== "resolved").length,
    resolvedFindings: findings.filter((item) => item.status === "resolved").length
  };
  const status = summary.blocked || summary.openFindings
    ? "blocked"
    : (summary.pending || summary.needsRecheck ? "needs-review" : "ready");
  const persisted = {
    storageKey: commandCenterVisualSignoffState.storageKey,
    statuses: signoffItems.reduce((acc, item) => {
      if (item.signoffStatus !== "pending-review" || item.reviewerNote || item.updatedAt) {
        acc[item.id] = {
          status: item.signoffStatus,
          note: item.reviewerNote,
          updatedAt: item.updatedAt || generatedAt
        };
      }
      return acc;
    }, {}),
    findings,
    lastUpdatedAt: generatedAt
  };
  return {
    contract: commandCenterVisualSignoffState,
    generatedAt,
    status,
    displayMode: commandCenterVisualSignoffState.displayMode,
    sourceVisualReviewMatrixStatus: visualReviewMatrix.status,
    signoffItems,
    findings,
    summary,
    canCompleteVisualSignoff: status === "ready",
    persisted,
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
}

export function buildCommandCenterVisualEvidenceExport(input = {}) {
  const visualReviewMatrix = input.visualReviewMatrix || buildCommandCenterVisualReviewMatrix(input);
  const visualSignoffState = input.visualSignoffState && input.visualSignoffState.signoffItems
    ? input.visualSignoffState
    : buildCommandCenterVisualSignoffState({
        ...input,
        visualReviewMatrix
      });
  const generatedAt = input.generatedAt || input.nowIso || visualSignoffState.generatedAt || visualReviewMatrix.generatedAt || null;
  const evidenceId = input.evidenceId || `visual-evidence-${generatedAt ? String(generatedAt).replace(/[:.]/g, "-") : "draft"}`;
  const matrixItems = (visualReviewMatrix.matrixItems || []).map((item) => {
    const signoff = (visualSignoffState.signoffItems || []).find((entry) => entry.id === item.id) || {};
    return {
      id: item.id,
      surface: item.surface,
      theme: item.theme,
      locale: item.locale,
      layout: item.layout,
      width: item.width,
      dpi: item.dpi,
      screenshotFileName: item.screenshotFileName,
      signoffStatus: signoff.signoffStatus || "pending-review",
      openFindingCount: signoff.openFindingCount || 0
    };
  });
  const findings = (visualSignoffState.findings || []).map((finding) => ({
    id: finding.id,
    matrixItemId: finding.matrixItemId,
    type: finding.type,
    severity: finding.severity,
    status: finding.status,
    note: finding.note || "",
    createdAt: finding.createdAt || null,
    updatedAt: finding.updatedAt || null
  }));
  const summary = {
    matrixTotal: matrixItems.length,
    accepted: visualSignoffState.summary ? visualSignoffState.summary.accepted : 0,
    blocked: visualSignoffState.summary ? visualSignoffState.summary.blocked : 0,
    needsRecheck: visualSignoffState.summary ? visualSignoffState.summary.needsRecheck : 0,
    pending: visualSignoffState.summary ? visualSignoffState.summary.pending : matrixItems.length,
    openFindings: findings.filter((finding) => finding.status !== "resolved").length,
    resolvedFindings: findings.filter((finding) => finding.status === "resolved").length
  };
  const status = summary.openFindings || summary.blocked || summary.pending || summary.needsRecheck
    ? "needs-review"
    : "ready";
  const exportDraft = {
    contract: commandCenterVisualEvidenceExport,
    evidenceId,
    generatedAt,
    displayMode: commandCenterVisualEvidenceExport.displayMode,
    status,
    sourceVisualReviewMatrixStatus: visualReviewMatrix.status,
    sourceVisualSignoffStatus: visualSignoffState.status,
    canProceedToPreHostReview: status === "ready",
    summary,
    screenshotNamingPattern: visualReviewMatrix.screenshotNamingPattern,
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
    `- Evidence ID: ${exportDraft.evidenceId}`,
    `- Generated At: ${exportDraft.generatedAt || "not-set"}`,
    `- Status: ${exportDraft.status}`,
    `- Source Visual Review Matrix Status: ${exportDraft.sourceVisualReviewMatrixStatus}`,
    `- Source Visual Sign-off Status: ${exportDraft.sourceVisualSignoffStatus}`,
    `- Can Proceed To Pre-host Review: ${exportDraft.canProceedToPreHostReview ? "yes" : "no"}`,
    `- Screenshot Naming Pattern: ${exportDraft.screenshotNamingPattern}`,
    `- Automatic Host Launch Allowed: ${exportDraft.automaticHostLaunchAllowed ? "true" : "false"}`,
    `- Real Host Smoke Allowed: ${exportDraft.realHostSmokeAllowed ? "true" : "false"}`,
    `- Host Mutation Allowed: ${exportDraft.hostMutationAllowed ? "true" : "false"}`,
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
    ...exportDraft,
    markdown,
    json: JSON.stringify(exportDraft, null, 2)
  };
}

export function buildCommandCenterVisualEvidenceReviewLock(input = {}) {
  const visualEvidenceExport = input.visualEvidenceExport || buildCommandCenterVisualEvidenceExport(input);
  const persisted = input.visualEvidenceReviewLock && typeof input.visualEvidenceReviewLock === "object"
    ? input.visualEvidenceReviewLock
    : {};
  const reviewedBy = String(persisted.reviewedBy || input.reviewedBy || "").trim();
  const reviewNote = String(persisted.reviewNote || input.reviewNote || "").trim();
  const openBlockerCount = Number(visualEvidenceExport.summary?.openFindings || 0)
    + Number(visualEvidenceExport.summary?.blocked || 0)
    + Number(visualEvidenceExport.summary?.needsRecheck || 0)
    + Number(visualEvidenceExport.summary?.pending || 0);
  const canLock = visualEvidenceExport.status === "ready" && openBlockerCount === 0 && Boolean(reviewedBy);
  const isLocked = Boolean(persisted.isLocked) && canLock;
  const lockedAt = isLocked ? (persisted.lockedAt || input.generatedAt || input.nowIso || null) : null;
  const status = isLocked ? "locked" : openBlockerCount ? "blocked" : "pending-review";
  return {
    contract: commandCenterVisualEvidenceReviewLock,
    displayMode: commandCenterVisualEvidenceReviewLock.displayMode,
    evidenceId: visualEvidenceExport.evidenceId,
    sourceEvidenceStatus: visualEvidenceExport.status,
    reviewedBy,
    reviewNote,
    isLocked,
    lockedAt,
    openBlockerCount,
    canLock,
    canProceedToManualHostSmoke: isLocked,
    status,
    automaticHostLaunchAllowed: false,
    realHostSmokeAllowed: false,
    readOnlyOnly: true,
    hostMutationAllowed: false
  };
}

export function resolveReadinessDrilldownTarget(readinessId) {
  return commandCenterReadinessDrilldown.targets[readinessId] || commandCenterReadinessDrilldown.defaultTarget;
}

function readinessTone(status) {
  if (status === "ready") return "success";
  if (status === "warning") return "warning";
  return "error";
}

function readinessCheck(id, status, labelKey, messageKey, details = {}) {
  const drilldown = resolveReadinessDrilldownTarget(id);
  return {
    id,
    status,
    tone: readinessTone(status),
    labelKey,
    messageKey,
    drilldownTarget: drilldown.targetId,
    drilldownFallbackTarget: drilldown.fallbackTargetId || null,
    drilldownLabelKey: commandCenterReadinessDrilldown.actionLabelKey,
    ...details
  };
}

export function buildHostReadinessGate(input = {}, diagnostics = null) {
  const hosts = input.hosts || [];
  const selectedHost = input.selectedHost || selectDefaultHost(hosts, input.target || {});
  const selectedHostRecord = hosts.find((host) => host.host === selectedHost) || null;
  const selectedActions = (input.trustedActions || []).filter((action) => !selectedHost || action.host === selectedHost);
  const history = Array.isArray(input.history) ? input.history : [];
  const diagnosticState = diagnostics || buildCommandCenterDiagnostics(input);
  const diagnosticItems = diagnosticState.items || [];
  const heartbeatDiagnostic = diagnosticItems.find((item) => item.id === "host-heartbeat");
  const diagnosticsWithRecovery = diagnosticItems
    .filter((item) => item.status !== "ok")
    .every((item) => Array.isArray(item.recoveryActions) && item.recoveryActions.length > 0);

  const checks = [
    input.serviceOnline
      ? readinessCheck("local-service", "ready", "commandCenter.readiness.localService", commandCenterReadinessMessageKeys.localServiceReady)
      : readinessCheck("local-service", "blocked", "commandCenter.readiness.localService", commandCenterReadinessMessageKeys.localServiceBlocked, { code: "LOCAL_SERVICE_REQUIRED", recoveryAction: "retry-refresh" }),
    selectedHostRecord && selectedHostRecord.status !== "Offline"
      ? readinessCheck("host-target", "ready", "commandCenter.readiness.hostTarget", commandCenterReadinessMessageKeys.hostTargetReady, { host: selectedHost })
      : readinessCheck("host-target", "blocked", "commandCenter.readiness.hostTarget", commandCenterReadinessMessageKeys.hostTargetBlocked, { code: "HOST_TARGET_UNAVAILABLE", host: selectedHost, recoveryAction: "retry-refresh" }),
    heartbeatDiagnostic && heartbeatDiagnostic.status === "ok"
      ? readinessCheck("host-heartbeat", "ready", "commandCenter.readiness.hostHeartbeat", commandCenterReadinessMessageKeys.hostHeartbeatReady, { host: selectedHost })
      : readinessCheck("host-heartbeat", "blocked", "commandCenter.readiness.hostHeartbeat", commandCenterReadinessMessageKeys.hostHeartbeatBlocked, { code: heartbeatDiagnostic && heartbeatDiagnostic.code ? heartbeatDiagnostic.code : "HOST_HEARTBEAT_REQUIRED", host: selectedHost, recoveryAction: "retry-refresh" }),
    selectedActions.length
      ? readinessCheck("trusted-actions", "ready", "commandCenter.readiness.trustedActions", commandCenterReadinessMessageKeys.trustedActionsReady, { count: selectedActions.length })
      : readinessCheck("trusted-actions", "blocked", "commandCenter.readiness.trustedActions", commandCenterReadinessMessageKeys.trustedActionsBlocked, { code: "READ_ONLY_ACTIONS_REQUIRED", host: selectedHost, recoveryAction: "retry-refresh" }),
    !input.serviceOnline
      ? readinessCheck("command-history", "blocked", "commandCenter.readiness.commandHistory", commandCenterReadinessMessageKeys.commandHistoryBlocked, { code: "COMMAND_HISTORY_ENDPOINT_REQUIRED", recoveryAction: "retry-refresh" })
      : (history.length
        ? readinessCheck("command-history", "ready", "commandCenter.readiness.commandHistory", commandCenterReadinessMessageKeys.commandHistoryReady, { count: history.length })
        : readinessCheck("command-history", "warning", "commandCenter.readiness.commandHistory", commandCenterReadinessMessageKeys.commandHistoryWarning, { code: "COMMAND_HISTORY_EMPTY" })),
    diagnosticsWithRecovery
      ? readinessCheck("diagnostic-recovery", "ready", "commandCenter.readiness.diagnosticRecovery", commandCenterReadinessMessageKeys.diagnosticRecoveryReady)
      : readinessCheck("diagnostic-recovery", "blocked", "commandCenter.readiness.diagnosticRecovery", commandCenterReadinessMessageKeys.diagnosticRecoveryBlocked, { code: "DIAGNOSTIC_RECOVERY_ACTION_MISSING" })
  ];
  const blocked = checks.filter((item) => item.status === "blocked").length;
  const warning = checks.filter((item) => item.status === "warning").length;
  const status = blocked ? "blocked" : (warning ? "warning" : "ready");
  return {
    contract: commandCenterHostReadinessGate,
    status,
    canEnterHostTest: status === "ready",
    summaryKey: status === "ready"
      ? commandCenterReadinessMessageKeys.summaryReady
      : (status === "warning" ? commandCenterReadinessMessageKeys.summaryWarning : commandCenterReadinessMessageKeys.summaryBlocked),
    checks,
    summary: {
      total: checks.length,
      ready: checks.filter((item) => item.status === "ready").length,
      warning,
      blocked
    }
  };
}

export function buildCommandCenterDiagnostics(input = {}) {
  const hosts = input.hosts || [];
  const selectedHost = input.selectedHost || selectDefaultHost(hosts, input.target || {});
  const selectedHostRecord = hosts.find((host) => host.host === selectedHost) || null;
  const selectedActions = (input.trustedActions || []).filter((action) => !selectedHost || action.host === selectedHost);
  const latestError = input.lastError || findLatestCommandError(input.history || []);
  const nowIso = input.nowIso || new Date().toISOString();
  const staleAfterMs = input.heartbeatStaleAfterMs || commandCenterDiagnosticsFirstSlice.heartbeatStaleAfterMs;
  const lastSeenAt = selectedHostRecord ? selectedHostRecord.lastSeenAt : null;
  const heartbeatAgeMs = lastSeenAt ? Date.parse(nowIso) - Date.parse(lastSeenAt) : null;
  const heartbeatAgeMinutes = minutesBetween(nowIso, lastSeenAt);

  const localService = input.lastError
    ? diagnosticItem("local-service", "error", "error", "commandCenter.diagnostics.localService", commandCenterDiagnosticMessageKeys.localServiceError, { code: input.lastError.code || commandCenterDiagnosticsFirstSlice.serviceFailureCode })
    : (input.serviceOnline
      ? diagnosticItem("local-service", "ok", "success", "commandCenter.diagnostics.localService", commandCenterDiagnosticMessageKeys.localServiceConnected)
      : diagnosticItem("local-service", "warning", "warning", "commandCenter.diagnostics.localService", commandCenterDiagnosticMessageKeys.localServiceMock));

  let hostHeartbeat = diagnosticItem("host-heartbeat", "warning", "warning", "commandCenter.diagnostics.hostHeartbeat", commandCenterDiagnosticMessageKeys.hostOffline, { code: "HOST_OFFLINE", host: selectedHost });
  if (selectedHostRecord && selectedHostRecord.status !== "Offline" && lastSeenAt) {
    hostHeartbeat = heartbeatAgeMs !== null && heartbeatAgeMs > staleAfterMs
      ? diagnosticItem("host-heartbeat", "warning", "warning", "commandCenter.diagnostics.hostHeartbeat", commandCenterDiagnosticMessageKeys.hostHeartbeatStale, { code: commandCenterDiagnosticsFirstSlice.staleHeartbeatCode, host: selectedHost, ageMinutes: heartbeatAgeMinutes })
      : diagnosticItem("host-heartbeat", "ok", "success", "commandCenter.diagnostics.hostHeartbeat", commandCenterDiagnosticMessageKeys.hostHeartbeatConnected, { host: selectedHost, ageMinutes: heartbeatAgeMinutes });
  }

  const trustedActions = selectedActions.length
    ? diagnosticItem("trusted-actions", "ok", "success", "commandCenter.diagnostics.trustedActions", commandCenterDiagnosticMessageKeys.trustedActionsReady, { count: selectedActions.length })
    : diagnosticItem("trusted-actions", "warning", "warning", "commandCenter.diagnostics.trustedActions", commandCenterDiagnosticMessageKeys.trustedActionsMissing, { code: commandCenterDiagnosticsFirstSlice.missingCapabilityCode, host: selectedHost, count: 0 });

  const lastCommandError = latestError
    ? diagnosticItem("last-command-error", "error", "error", "commandCenter.diagnostics.lastCommand", commandCenterDiagnosticMessageKeys.lastCommandError, { code: latestError.code || (latestError.result ? latestError.result.code : commandCenterDiagnosticsFirstSlice.recentCommandErrorCode), commandId: latestError.commandId || null })
    : diagnosticItem("last-command-error", "ok", "success", "commandCenter.diagnostics.lastCommand", commandCenterDiagnosticMessageKeys.lastCommandClean);

  const items = [localService, hostHeartbeat, trustedActions, lastCommandError];
  return {
    contract: commandCenterDiagnosticsFirstSlice,
    items,
    summary: {
      total: items.length,
      ok: items.filter((item) => item.status === "ok").length,
      warning: items.filter((item) => item.status === "warning").length,
      error: items.filter((item) => item.status === "error").length
    }
  };
}

export function buildCommandCenterViewModel(input = {}) {
  const hosts = input.hosts || [];
  const target = input.target || {};
  const selectedHost = input.selectedHost || selectDefaultHost(hosts, target);
  const contexts = input.contexts || {};
  const trustedActions = input.trustedActions || [];
  const history = input.history || [];
  const historyFilters = normalizeHistoryFilters(input.historyFilters, selectedHost);
  const filteredHistory = history.filter((record) => matchesHistoryFilter(record, historyFilters, selectedHost));
  const filteredActions = trustedActions.filter((action) => !selectedHost || action.host === selectedHost);
  const selectedCommandId = input.selectedCommandId || (input.detail ? input.detail.commandId : null);
  const selectedRecord = input.detail || filteredHistory.find((record) => record.commandId === selectedCommandId) || null;
  const emptyStates = buildCommandCenterEmptyStates({
    hosts,
    selectedHost,
    trustedActions,
    history,
    historyFilters,
    filteredHistory
  });
  const diagnostics = buildCommandCenterDiagnostics({
    hosts,
    target,
    selectedHost,
    trustedActions,
    history,
    serviceOnline: input.serviceOnline,
    lastError: input.lastError,
    nowIso: input.diagnosticsNowIso,
    heartbeatStaleAfterMs: input.heartbeatStaleAfterMs
  });
  const hostReadinessGate = buildHostReadinessGate({
    hosts,
    target,
    selectedHost,
    trustedActions,
    history,
    serviceOnline: input.serviceOnline,
    lastError: input.lastError,
    nowIso: input.diagnosticsNowIso,
    heartbeatStaleAfterMs: input.heartbeatStaleAfterMs
  }, diagnostics);

  const mockHostSmokeRehearsal = buildMockHostSmokeRehearsal({
    hosts,
    target,
    selectedHost,
    trustedActions,
    history,
    serviceOnline: input.serviceOnline,
    rehearsalNowIso: input.diagnosticsNowIso
  });
  const rehearsalResultPanel = buildRehearsalResultPanelState({ rehearsal: mockHostSmokeRehearsal });
  const manualHostSmokeRunbook = buildManualHostSmokeRunbook({
    hosts,
    target,
    selectedHost,
    trustedActions,
    history,
    serviceOnline: input.serviceOnline,
    diagnostics,
    hostReadinessGate,
    mockHostSmokeRehearsal,
    rehearsalResultPanel,
    generatedAt: input.diagnosticsNowIso
  });
  const runbookExportFeedbackState = buildRunbookExportFeedbackState({
    runbook: manualHostSmokeRunbook,
    persistedState: input.runbookExportFeedbackState,
    nowIso: input.diagnosticsNowIso
  });
  const manualHostSmokeEvidencePack = buildManualHostSmokeEvidencePack({
    runbook: manualHostSmokeRunbook,
    runbookExportFeedbackState,
    manualReviewerNotes: input.manualReviewerNotes,
    generatedAt: input.diagnosticsNowIso
  });
  const manualHostSmokeReviewChecklist = buildManualHostSmokeReviewChecklist({
    evidencePack: manualHostSmokeEvidencePack,
    reviewChecklistState: input.reviewChecklistState,
    generatedAt: input.diagnosticsNowIso
  });
  const manualHostSmokeSessionDraft = buildManualHostSmokeSessionDraft({
    reviewChecklist: manualHostSmokeReviewChecklist,
    evidencePack: manualHostSmokeEvidencePack,
    sessionDraftState: input.sessionDraftState,
    generatedAt: input.diagnosticsNowIso
  });
  const visualPreview = buildCommandCenterVisualPreview({
    hosts,
    target,
    selectedHost,
    trustedActions,
    generatedAt: input.diagnosticsNowIso
  });
  const visualReviewMatrix = buildCommandCenterVisualReviewMatrix({
    visualPreview,
    visualSignoffState: input.visualSignoffState,
    generatedAt: input.diagnosticsNowIso
  });
  const visualSignoffState = buildCommandCenterVisualSignoffState({
    visualReviewMatrix,
    visualSignoffState: input.visualSignoffState,
    generatedAt: input.diagnosticsNowIso
  });
  const visualEvidenceExport = buildCommandCenterVisualEvidenceExport({
    visualReviewMatrix,
    visualSignoffState,
    generatedAt: input.diagnosticsNowIso
  });

  return {
    selectedHost,
    target,
    alignment: commandCenterRuntimePrototypeAlignment,
    safetyPolicy: commandCenterSafetyPolicy,
    activity: buildActivityState(input),
    recovery: buildRecoveryState(input.lastError),
    diagnostics,
    hostReadinessGate,
    mockHostSmokeRehearsal,
    rehearsalResultPanel,
    manualHostSmokeRunbook,
    runbookExportFeedbackState,
    manualHostSmokeEvidencePack,
    manualHostSmokeReviewChecklist,
    manualHostSmokeSessionDraft,
    visualPreview,
    visualReviewMatrix,
    visualSignoffState,
    visualEvidenceExport,
    emptyStates,
    hostCards: hosts.map((host) => ({
      host: host.host,
      displayName: host.displayName,
      status: host.status,
      tone: hostStatusTone(host.status),
      capabilityCount: host.capabilityCount || 0,
      projectName: host.projectName,
      lastSeenAt: host.lastSeenAt,
      selected: host.host === selectedHost
    })),
    contextSummary: summarizeHostContext(contexts[selectedHost]),
    trustedActions: filteredActions.map((action) => ({
      ...action,
      running: input.runningActionId === action.id && input.pendingOperation === "executing",
      enabled: action.readOnly === true && action.riskLevel === 0 && input.pendingOperation !== "executing",
      disabledReasonKey: action.readOnly === true && action.riskLevel === 0
        ? null
        : commandCenterSafetyPolicy.mutationDisabledReasonKey
    })),
    resultFilters: {
      ...historyFilters,
      serviceQuery: historyFilterToServiceQuery(historyFilters, selectedHost),
      availableHosts: ["all", "selected", ...hosts.map((host) => host.host)],
      availableStatuses: ["all", "success", "failed"],
      availableActions: Array.from(new Set(history.map((record) => record.action).filter(Boolean)))
    },
    resultSummary: {
      total: history.length,
      filtered: filteredHistory.length,
      success: history.filter((record) => record.ok === true).length,
      failed: history.filter((record) => record.ok === false).length
    },
    resultRows: filteredHistory.map((record) => ({
      commandId: record.commandId,
      host: record.host,
      action: record.action,
      code: record.code,
      ok: record.ok,
      tone: resultStatusTone(record.ok),
      durationMs: record.durationMs,
      recordedAt: record.recordedAt,
      selected: record.commandId === selectedCommandId
    })),
    detailPanel: buildCommandDetail(selectedRecord),
    emptyState: hosts.length ? null : commandCenterEmptyState
  };
}
export function createReadOnlyActionCommand(input) {
  if (!input.host || !input.projectId || !input.action) {
    throw new Error("host, projectId and action are required to create a read-only command.");
  }
  return createReadOnlyCommandEnvelope({
    commandId: input.commandId,
    sessionId: input.sessionId,
    host: input.host,
    projectId: input.projectId,
    action: input.action,
    target: input.target || {},
    params: input.params || {},
    createdAt: input.createdAt,
    timeoutMs: input.timeoutMs
  });
}
