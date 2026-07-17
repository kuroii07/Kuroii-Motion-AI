import {
  buildCommandCenterViewModel,
  buildManualHostSmokeEvidencePack,
  buildManualHostSmokeReviewChecklist,
  buildManualHostSmokeSessionDraft,
  buildManualHostSmokeRunbook,
  buildCommandCenterVisualPreview,
  buildCommandCenterVisualEvidenceExport,
  buildCommandCenterVisualEvidenceReviewLock,
  buildCommandCenterVisualReviewMatrix,
  buildCommandCenterVisualSignoffState,
  buildMockHostSmokeRehearsal,
  buildRehearsalResultPanelState,
  buildRunbookExportFeedbackState,
  commandCenterDiagnosticsFirstSlice,
  commandCenterDiagnosticsRecoveryUx,
  commandCenterHostReadinessGate,
  commandCenterHostSmokeHandoffChecklist,
  commandCenterManualHostSmokeEvidencePack,
  commandCenterManualHostSmokeReviewChecklist,
  commandCenterManualHostSmokeSessionDraft,
  commandCenterManualHostSmokeRunbook,
  commandCenterMockHostSmokeRehearsal,
  commandCenterReadinessDrilldown,
  commandCenterRehearsalResultPanel,
  commandCenterRunbookExportFeedbackState,
  commandCenterRuntimePrototypeAlignment,
  commandCenterVisualPreviewPass,
  commandCenterVisualEvidenceExport,
  commandCenterVisualEvidenceReviewLock,
  commandCenterVisualReviewMatrix,
  commandCenterVisualSignoffState,
  createReadOnlyActionCommand,
  findLatestCommandError,
  historyFilterToServiceQuery,
  normalizeHistoryFilters,
  resolveReadinessDrilldownTarget,
  selectDefaultHost
} from "./command-center.js";
import { cloneCommandCenterMockData } from "./command-center-fixtures.js";
import { createLocalServiceClient, normalizeServiceError } from "./local-service-client.js";

export const commandCenterRuntimeVersion = "0.5.9-alpha.0";

export const commandCenterRuntimeServiceSmoke = {
  mode: "local-service-mock",
  testScript: "tests/smoke_desktop_runtime_service.py",
  serviceBackedMethods: ["refresh", "runReadOnlyAction"],
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterDetailFilterRuntime = {
  testScript: "tests/smoke_desktop_detail_filter_state.py",
  stateMethods: ["setHistoryFilters", "resetHistoryFilters", "openCommandDetail", "clearCommandDetail", "recoverFromError"],
  historyFilters: ["host", "action", "status", "query", "limit"],
  recoveryActions: ["retry-refresh", "clear-error", "use-mock-mode"]
};

export const commandCenterRuntimePrototypeAlignmentSmoke = {
  testScript: "tests/smoke_desktop_runtime_prototype_alignment.py",
  sharedContract: commandCenterRuntimePrototypeAlignment,
  sharedStates: ["no-hosts", "no-actions", "no-history", "no-filtered-history"],
  recoveryActions: ["retry-refresh", "clear-error", "use-mock-mode"],
  prototypeParityFlags: ["runtimePrototypeAlignment", "sharedRecoveryActions", "sharedEmptyStateIds"],
  serviceFailureCode: commandCenterRuntimePrototypeAlignment.serviceFailureCode,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterDiagnosticsStateSmoke = {
  testScript: "tests/smoke_desktop_diagnostics_state.py",
  contract: commandCenterDiagnosticsFirstSlice,
  diagnostics: ["local-service", "host-heartbeat", "trusted-actions", "last-command-error"],
  expectedCodes: ["LOCAL_SERVICE_UNAVAILABLE", "HOST_HEARTBEAT_STALE", "CAPABILITY_MISSING", "COMMAND_ERROR_PRESENT"],
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterDiagnosticsRecoveryUxSmoke = {
  testScript: "tests/smoke_desktop_diagnostics_recovery_ux.py",
  contract: commandCenterDiagnosticsRecoveryUx,
  runtimeMethod: "recoverDiagnostic",
  recoveryActions: ["retry-refresh", "use-mock-mode", "reset-filters", "view-latest-error"],
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterHostReadinessGateSmoke = {
  testScript: "tests/smoke_desktop_host_readiness_gate.py",
  contract: commandCenterHostReadinessGate,
  snapshotKey: "hostReadinessContract",
  viewModelKey: "hostReadinessGate",
  checks: ["local-service", "host-target", "host-heartbeat", "trusted-actions", "command-history", "diagnostic-recovery"],
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterReadinessDrilldownSmoke = {
  testScript: "tests/smoke_desktop_readiness_drilldown.py",
  contract: commandCenterReadinessDrilldown,
  snapshotKey: "readinessDrilldownContract",
  runtimeMethod: "resolveReadinessDrilldown",
  eventMarkers: ["data-readiness-drilldown", "data-readiness-target"],
  keyboardTriggers: ["Enter", "Space"],
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterHostSmokeHandoffSmoke = {
  testScript: "tests/smoke_desktop_host_smoke_handoff.py",
  contract: commandCenterHostSmokeHandoffChecklist,
  snapshotKey: "hostSmokeHandoffChecklist",
  mode: "manual-handoff-only",
  allowedReadOnlyActions: commandCenterHostSmokeHandoffChecklist.allowedReadOnlyActions,
  forbiddenActionPatterns: commandCenterHostSmokeHandoffChecklist.forbiddenActionPatterns,
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterMockHostSmokeRehearsalSmoke = {
  testScript: "tests/smoke_desktop_mock_host_smoke_rehearsal.py",
  contract: commandCenterMockHostSmokeRehearsal,
  snapshotKey: "mockHostSmokeRehearsalContract",
  viewModelKey: "mockHostSmokeRehearsal",
  runtimeMethod: "previewMockHostSmokeRehearsal",
  mode: "mock-only-rehearsal",
  failureScenarios: commandCenterMockHostSmokeRehearsal.failureScenarios,
  automaticHostLaunchAllowed: false,
  usesMockDataOnly: true,
  readOnlyOnly: true,
  hostMutationAllowed: false
};
export const commandCenterRehearsalResultPanelSmoke = {
  testScript: "tests/smoke_desktop_rehearsal_result_panel.py",
  contract: commandCenterRehearsalResultPanel,
  snapshotKey: "rehearsalResultPanelContract",
  viewModelKey: "rehearsalResultPanel",
  runtimeMethod: "previewRehearsalResultPanel",
  displayMode: "compact-read-only-panel",
  eventMarkers: commandCenterRehearsalResultPanel.eventMarkers,
  automaticHostLaunchAllowed: false,
  usesMockDataOnly: true,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterManualHostSmokeRunbookSmoke = {
  testScript: "tests/smoke_desktop_manual_host_smoke_runbook.py",
  contract: commandCenterManualHostSmokeRunbook,
  snapshotKey: "manualHostSmokeRunbookContract",
  viewModelKey: "manualHostSmokeRunbook",
  runtimeMethod: "previewManualHostSmokeRunbook",
  displayMode: "copy-export-read-only-runbook",
  outputFormats: commandCenterManualHostSmokeRunbook.outputFormats,
  eventMarkers: commandCenterManualHostSmokeRunbook.eventMarkers,
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterRunbookExportFeedbackStateSmoke = {
  testScript: "tests/smoke_desktop_runbook_export_feedback_state.py",
  contract: commandCenterRunbookExportFeedbackState,
  snapshotKey: "runbookExportFeedbackContract",
  viewModelKey: "runbookExportFeedbackState",
  runtimeMethod: "recordRunbookExportFeedback",
  storageKey: commandCenterRunbookExportFeedbackState.storageKey,
  persistedFields: commandCenterRunbookExportFeedbackState.persistedFields,
  eventMarkers: commandCenterRunbookExportFeedbackState.eventMarkers,
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterManualHostSmokeEvidencePackSmoke = {
  testScript: "tests/smoke_desktop_manual_host_smoke_evidence_pack.py",
  contract: commandCenterManualHostSmokeEvidencePack,
  snapshotKey: "manualHostSmokeEvidencePackContract",
  viewModelKey: "manualHostSmokeEvidencePack",
  runtimeMethod: "previewManualHostSmokeEvidencePack",
  displayMode: "local-read-only-evidence-pack",
  outputFormats: commandCenterManualHostSmokeEvidencePack.outputFormats,
  notesStorageKey: commandCenterManualHostSmokeEvidencePack.notesStorageKey,
  eventMarkers: commandCenterManualHostSmokeEvidencePack.eventMarkers,
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterManualHostSmokeReviewChecklistSmoke = {
  testScript: "tests/smoke_desktop_manual_host_smoke_review_checklist.py",
  contract: commandCenterManualHostSmokeReviewChecklist,
  snapshotKey: "manualHostSmokeReviewChecklistContract",
  viewModelKey: "manualHostSmokeReviewChecklist",
  runtimeMethod: "previewManualHostSmokeReviewChecklist",
  stateMethod: "updateReviewChecklistState",
  displayMode: "manual-host-smoke-review-checklist",
  storageKey: commandCenterManualHostSmokeReviewChecklist.storageKey,
  requiredItems: commandCenterManualHostSmokeReviewChecklist.requiredItems,
  eventMarkers: commandCenterManualHostSmokeReviewChecklist.eventMarkers,
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterManualHostSmokeSessionDraftSmoke = {
  testScript: "tests/smoke_desktop_manual_host_smoke_session_draft.py",
  contract: commandCenterManualHostSmokeSessionDraft,
  snapshotKey: "manualHostSmokeSessionDraftContract",
  viewModelKey: "manualHostSmokeSessionDraft",
  runtimeMethod: "previewManualHostSmokeSessionDraft",
  stateMethod: "updateManualHostSmokeSessionDraftState",
  displayMode: "manual-host-smoke-session-draft",
  storageKey: commandCenterManualHostSmokeSessionDraft.storageKey,
  eventMarkers: commandCenterManualHostSmokeSessionDraft.eventMarkers,
  automaticHostLaunchAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualPreviewPassSmoke = {
  testScript: "tests/smoke_desktop_ae_pr_visual_preview.py",
  contract: commandCenterVisualPreviewPass,
  snapshotKey: "visualPreviewContract",
  viewModelKey: "visualPreview",
  runtimeMethod: "previewVisualPreviewPass",
  displayMode: "desktop-ae-pr-visual-preview-pass",
  surfaces: commandCenterVisualPreviewPass.surfaces,
  eventMarkers: commandCenterVisualPreviewPass.eventMarkers,
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualReviewMatrixSmoke = {
  testScript: "tests/smoke_desktop_visual_review_matrix.py",
  contract: commandCenterVisualReviewMatrix,
  snapshotKey: "visualReviewMatrixContract",
  viewModelKey: "visualReviewMatrix",
  runtimeMethod: "previewVisualReviewMatrix",
  displayMode: "visual-review-matrix-and-screenshot-checklist",
  matrixIds: commandCenterVisualReviewMatrix.requiredMatrixIds,
  scoreCategories: commandCenterVisualReviewMatrix.scoreCategories,
  eventMarkers: commandCenterVisualReviewMatrix.eventMarkers,
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualSignoffStateSmoke = {
  testScript: "tests/smoke_desktop_visual_signoff_state.py",
  contract: commandCenterVisualSignoffState,
  snapshotKey: "visualSignoffStateContract",
  viewModelKey: "visualSignoffState",
  runtimeMethod: "previewVisualSignoffState",
  stateMethod: "updateVisualSignoffState",
  storageKey: commandCenterVisualSignoffState.storageKey,
  displayMode: "manual-visual-signoff-state-and-findings-backlog",
  allowedStatuses: commandCenterVisualSignoffState.allowedStatuses,
  findingTypes: commandCenterVisualSignoffState.findingTypes,
  eventMarkers: commandCenterVisualSignoffState.eventMarkers,
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualEvidenceExportSmoke = {
  testScript: "tests/smoke_desktop_visual_evidence_export.py",
  contract: commandCenterVisualEvidenceExport,
  snapshotKey: "visualEvidenceExportContract",
  viewModelKey: "visualEvidenceExport",
  runtimeMethod: "previewVisualEvidenceExport",
  displayMode: "pre-host-visual-evidence-export",
  outputFormats: commandCenterVisualEvidenceExport.outputFormats,
  eventMarkers: commandCenterVisualEvidenceExport.eventMarkers,
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

export const commandCenterVisualEvidenceReviewLockSmoke = {
  testScript: "tests/smoke_desktop_visual_evidence_review_lock.py",
  contract: commandCenterVisualEvidenceReviewLock,
  snapshotKey: "visualEvidenceReviewLockContract",
  viewModelKey: "visualEvidenceReviewLock",
  runtimeMethod: "previewVisualEvidenceReviewLock",
  stateMethod: "updateVisualEvidenceReviewLock",
  displayMode: "pre-host-visual-evidence-review-lock",
  automaticHostLaunchAllowed: false,
  realHostSmokeAllowed: false,
  readOnlyOnly: true,
  hostMutationAllowed: false
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createCommandCenterRuntime(options = {}) {
  const data = options.initialData ? clone(options.initialData) : cloneCommandCenterMockData();
  const transport = options.transport || globalThis.fetch;
  const client = options.client || (typeof transport === "function"
    ? createLocalServiceClient({
        baseUrl: options.baseUrl,
        sessionToken: options.sessionToken,
        transport
      })
    : null);
  const createCommandId = options.createCommandId || (() => `desktop-runtime-${Date.now()}`);
  const nowIso = options.nowIso || (() => new Date().toISOString());
  const initialHost = options.selectedHost || selectDefaultHost(data.hosts, data.target);
  const listeners = new Set();
  const state = {
    locale: options.locale || "zh-CN",
    theme: options.theme || "dark",
    selectedHost: initialHost,
    serviceOnline: false,
    lastError: null,
    detail: null,
    selectedCommandId: options.selectedCommandId || null,
    historyFilters: normalizeHistoryFilters(options.historyFilters, initialHost),
    pendingOperation: null,
    runningActionId: null,
    runbookExportFeedbackState: options.runbookExportFeedbackState || null,
    manualReviewerNotes: options.manualReviewerNotes || "",
    reviewChecklistState: options.reviewChecklistState || null,
    sessionDraftState: options.sessionDraftState || null,
    visualSignoffState: options.visualSignoffState || null,
    visualEvidenceReviewLock: options.visualEvidenceReviewLock || null,
    data
  };

  function snapshot() {
    const snapshotNow = nowIso();
    const manualHostSmokeRunbook = buildManualHostSmokeRunbook({
      ...state.data,
      selectedHost: state.selectedHost,
      serviceOnline: state.serviceOnline,
      diagnosticsNowIso: snapshotNow
    });
    const runbookExportFeedbackState = buildRunbookExportFeedbackState({
      runbook: manualHostSmokeRunbook,
      persistedState: state.runbookExportFeedbackState,
      nowIso: snapshotNow
    });
    const manualHostSmokeEvidencePack = buildManualHostSmokeEvidencePack({
      runbook: manualHostSmokeRunbook,
      runbookExportFeedbackState,
      manualReviewerNotes: state.manualReviewerNotes,
      generatedAt: snapshotNow
    });
    const manualHostSmokeReviewChecklist = buildManualHostSmokeReviewChecklist({
      evidencePack: manualHostSmokeEvidencePack,
      reviewChecklistState: state.reviewChecklistState,
      generatedAt: snapshotNow
    });
    const manualHostSmokeSessionDraft = buildManualHostSmokeSessionDraft({
      reviewChecklist: manualHostSmokeReviewChecklist,
      evidencePack: manualHostSmokeEvidencePack,
      sessionDraftState: state.sessionDraftState,
      generatedAt: snapshotNow
    });
    const visualPreview = buildCommandCenterVisualPreview({
      ...state.data,
      selectedHost: state.selectedHost,
      generatedAt: snapshotNow
    });
    const visualReviewMatrix = buildCommandCenterVisualReviewMatrix({
      visualPreview,
      generatedAt: snapshotNow
    });
    const visualSignoffState = buildCommandCenterVisualSignoffState({
      visualReviewMatrix,
      visualSignoffState: state.visualSignoffState,
      generatedAt: snapshotNow
    });
    const visualEvidenceExport = buildCommandCenterVisualEvidenceExport({
      visualReviewMatrix,
      visualSignoffState,
      generatedAt: snapshotNow
    });
    const visualEvidenceReviewLock = buildCommandCenterVisualEvidenceReviewLock({
      visualEvidenceExport,
      visualEvidenceReviewLock: state.visualEvidenceReviewLock,
      generatedAt: snapshotNow
    });
    return {
      ...state,
      data: clone(state.data),
      detail: state.detail ? clone(state.detail) : null,
      prototypeAlignment: commandCenterRuntimePrototypeAlignment,
      diagnosticsContract: commandCenterDiagnosticsFirstSlice,
      diagnosticsRecoveryContract: commandCenterDiagnosticsRecoveryUx,
      hostReadinessContract: commandCenterHostReadinessGate,
      readinessDrilldownContract: commandCenterReadinessDrilldown,
      hostSmokeHandoffChecklist: commandCenterHostSmokeHandoffChecklist,
      mockHostSmokeRehearsalContract: commandCenterMockHostSmokeRehearsal,
      rehearsalResultPanelContract: commandCenterRehearsalResultPanel,
      manualHostSmokeRunbookContract: commandCenterManualHostSmokeRunbook,
      runbookExportFeedbackContract: commandCenterRunbookExportFeedbackState,
      manualHostSmokeEvidencePackContract: commandCenterManualHostSmokeEvidencePack,
      manualHostSmokeReviewChecklistContract: commandCenterManualHostSmokeReviewChecklist,
      manualHostSmokeSessionDraftContract: commandCenterManualHostSmokeSessionDraft,
      visualPreviewContract: commandCenterVisualPreviewPass,
      visualReviewMatrixContract: commandCenterVisualReviewMatrix,
      visualSignoffStateContract: commandCenterVisualSignoffState,
      visualEvidenceExportContract: commandCenterVisualEvidenceExport,
      visualEvidenceReviewLockContract: commandCenterVisualEvidenceReviewLock,
      mockHostSmokeRehearsal: buildMockHostSmokeRehearsal({
        ...state.data,
        selectedHost: state.selectedHost,
        serviceOnline: state.serviceOnline,
        rehearsalNowIso: snapshotNow
      }),
      rehearsalResultPanel: buildRehearsalResultPanelState({
        rehearsal: buildMockHostSmokeRehearsal({
          ...state.data,
          selectedHost: state.selectedHost,
          serviceOnline: state.serviceOnline,
          rehearsalNowIso: snapshotNow
        })
      }),
      manualHostSmokeRunbook,
      runbookExportFeedbackState,
      manualHostSmokeEvidencePack,
      manualHostSmokeReviewChecklist,
      manualHostSmokeSessionDraft,
      visualPreview,
      visualReviewMatrix,
      visualSignoffState,
      visualEvidenceExport,
      visualEvidenceReviewLock,
      historyFilters: { ...state.historyFilters },
      viewModel: buildCommandCenterViewModel({
        ...state.data,
        selectedHost: state.selectedHost,
        historyFilters: state.historyFilters,
        detail: state.detail,
        selectedCommandId: state.selectedCommandId,
        pendingOperation: state.pendingOperation,
        runningActionId: state.runningActionId,
        serviceOnline: state.serviceOnline,
        lastError: state.lastError,
        diagnosticsNowIso: snapshotNow,
        runbookExportFeedbackState: state.runbookExportFeedbackState,
        manualReviewerNotes: state.manualReviewerNotes,
        reviewChecklistState: state.reviewChecklistState,
        sessionDraftState: state.sessionDraftState,
        visualSignoffState: state.visualSignoffState,
        visualEvidenceReviewLock: state.visualEvidenceReviewLock
      })
    };
  }

  function emit() {
    const value = snapshot();
    listeners.forEach((listener) => listener(value));
    return value;
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(snapshot());
    return () => listeners.delete(listener);
  }

  function setLocale(locale) {
    state.locale = locale;
    return emit();
  }

  function setTheme(theme) {
    state.theme = theme;
    return emit();
  }

  function selectHost(host) {
    state.selectedHost = host;
    state.historyFilters = normalizeHistoryFilters(state.historyFilters, host);
    return emit();
  }

  function setHistoryFilters(partialFilters = {}) {
    state.historyFilters = normalizeHistoryFilters({ ...state.historyFilters, ...partialFilters }, state.selectedHost);
    return emit();
  }

  function resetHistoryFilters() {
    state.historyFilters = normalizeHistoryFilters({}, state.selectedHost);
    return emit();
  }

  function clearHistory() {
    state.data.history = [];
    state.detail = null;
    state.selectedCommandId = null;
    return emit();
  }

  function localCommandRecord(commandId) {
    return state.data.history.find((record) => record.commandId === commandId) || null;
  }

  function selectCommand(commandId) {
    state.selectedCommandId = commandId || null;
    state.detail = commandId ? localCommandRecord(commandId) : null;
    return emit();
  }

  function clearCommandDetail() {
    state.selectedCommandId = null;
    state.detail = null;
    return emit();
  }

  function clearError() {
    state.lastError = null;
    if (state.pendingOperation === "error") state.pendingOperation = null;
    return emit();
  }

  async function openCommandDetail(commandId) {
    if (!commandId) return clearCommandDetail();
    state.selectedCommandId = commandId;
    state.detail = localCommandRecord(commandId);
    state.pendingOperation = "loading-detail";
    emit();
    if (!client || !state.serviceOnline) {
      state.pendingOperation = null;
      return emit();
    }
    try {
      const payload = await client.getCommandDetail(commandId);
      state.detail = payload.command || state.detail;
      state.lastError = null;
    } catch (error) {
      state.lastError = normalizeServiceError(error);
    } finally {
      state.pendingOperation = null;
    }
    return emit();
  }

  function applyServiceData(payload) {
    if (payload.hosts) state.data.hosts = payload.hosts;
    if (payload.target) state.data.target = payload.target;
    if (payload.contexts) state.data.contexts = { ...state.data.contexts, ...payload.contexts };
    if (payload.trustedActions) state.data.trustedActions = payload.trustedActions;
    if (payload.history) state.data.history = payload.history;
    if (!state.selectedHost || !state.data.hosts.some((host) => host.host === state.selectedHost)) {
      state.selectedHost = selectDefaultHost(state.data.hosts, state.data.target);
    }
    state.historyFilters = normalizeHistoryFilters(state.historyFilters, state.selectedHost);
  }

  async function refresh() {
    state.pendingOperation = "refreshing";
    emit();
    if (!client) {
      state.serviceOnline = false;
      state.lastError = {
        code: "LOCAL_SERVICE_CLIENT_UNAVAILABLE",
        message: "No fetch-compatible Local Service client is available.",
        advice: ["Use the local mock runtime or start the Desktop shell with a fetch-compatible transport."]
      };
      state.pendingOperation = null;
      return emit();
    }
    try {
      const hostsPayload = await client.listHosts();
      const hosts = hostsPayload.hosts || [];
      const selectedHost = state.selectedHost || selectDefaultHost(hosts, state.data.target);
      const contexts = {};
      for (const host of hosts) {
        try {
          const contextPayload = await client.getHostContext(host.host);
          contexts[host.host] = contextPayload.context;
        } catch (error) {
          contexts[host.host] = state.data.contexts[host.host];
        }
      }
      const actionsPayload = await client.listTrustedActions(selectedHost);
      const historyPayload = await client.listCommandHistory(historyFilterToServiceQuery(state.historyFilters, selectedHost));
      applyServiceData({
        hosts,
        contexts,
        trustedActions: actionsPayload.actions || [],
        history: historyPayload.commands || []
      });
      state.serviceOnline = true;
      state.lastError = null;
    } catch (error) {
      state.serviceOnline = false;
      state.lastError = normalizeServiceError(error);
    } finally {
      state.pendingOperation = null;
    }
    return emit();
  }

  function appendRuntimeRecord(record) {
    state.detail = record;
    state.selectedCommandId = record.commandId;
    state.data.history = [record, ...state.data.history.filter((item) => item.commandId !== record.commandId)];
  }

  async function runReadOnlyAction(actionId) {
    state.pendingOperation = "executing";
    state.runningActionId = actionId;
    emit();
    try {
      const context = state.data.contexts[state.selectedHost] || {};
      const command = createReadOnlyActionCommand({
        commandId: createCommandId(),
        sessionId: "desktop-command-center-runtime",
        host: state.selectedHost,
        projectId: context.project ? context.project.projectId : "",
        action: actionId
      });
      if (!client || !state.serviceOnline) {
        const record = {
          commandId: command.commandId,
          host: command.host,
          action: command.action,
          code: "RUNTIME_MOCK_EXECUTED",
          ok: true,
          durationMs: 0,
          recordedAt: nowIso(),
          data: { readOnly: true, mutationPerformed: false }
        };
        appendRuntimeRecord(record);
        state.lastError = null;
        return emit();
      }
      const result = await client.executeReadOnlyAction(command);
      const record = {
        commandId: result.commandId,
        host: command.host,
        action: command.action,
        code: result.code,
        ok: result.ok,
        durationMs: result.durationMs,
        recordedAt: nowIso(),
        command,
        result
      };
      appendRuntimeRecord(record);
      state.lastError = null;
    } catch (error) {
      state.lastError = error && error.payload
        ? normalizeServiceError(error)
        : {
            ok: false,
            status: 0,
            code: "COMMAND_RUNTIME_FAILED",
            message: error && error.message ? error.message : "Command runtime failed.",
            advice: ["刷新 Host Context 后重试。"]
          };
    } finally {
      state.pendingOperation = null;
      state.runningActionId = null;
    }
    return emit();
  }

  async function recoverFromError(action = "retry-refresh") {
    if (action === "retry-refresh") {
      state.lastError = null;
      return refresh();
    }
    if (action === "use-mock-mode") {
      state.serviceOnline = false;
      state.lastError = null;
      state.pendingOperation = null;
      state.runningActionId = null;
      return emit();
    }
    return clearError();
  }

  async function recoverDiagnostic(action = "retry-refresh", diagnosticId = null) {
    if (action === "retry-refresh" || action === "use-mock-mode" || action === "clear-error") {
      return recoverFromError(action);
    }
    if (action === "reset-filters") {
      return resetHistoryFilters();
    }
    if (action === "view-latest-error") {
      const latestError = findLatestCommandError(state.data.history);
      if (latestError && latestError.commandId) {
        return openCommandDetail(latestError.commandId);
      }
      return emit();
    }
    return emit();
  }

  function resolveReadinessDrilldown(readinessId) {
    return {
      readinessId,
      ...resolveReadinessDrilldownTarget(readinessId)
    };
  }

  function previewMockHostSmokeRehearsal(overrides = {}) {
    return buildMockHostSmokeRehearsal({
      ...state.data,
      ...overrides,
      selectedHost: overrides.selectedHost || state.selectedHost,
      serviceOnline: Object.prototype.hasOwnProperty.call(overrides, "serviceOnline") ? overrides.serviceOnline : state.serviceOnline,
      rehearsalNowIso: overrides.rehearsalNowIso || nowIso()
    });
  }
  function previewRehearsalResultPanel(overrides = {}) {
    const rehearsal = buildMockHostSmokeRehearsal({
      ...state.data,
      ...overrides,
      selectedHost: overrides.selectedHost || state.selectedHost,
      serviceOnline: Object.prototype.hasOwnProperty.call(overrides, "serviceOnline") ? overrides.serviceOnline : state.serviceOnline,
      rehearsalNowIso: overrides.rehearsalNowIso || nowIso()
    });
    return buildRehearsalResultPanelState({ rehearsal });
  }

  function previewManualHostSmokeRunbook(overrides = {}) {
    return buildManualHostSmokeRunbook({
      ...state.data,
      ...overrides,
      selectedHost: overrides.selectedHost || state.selectedHost,
      serviceOnline: Object.prototype.hasOwnProperty.call(overrides, "serviceOnline") ? overrides.serviceOnline : state.serviceOnline,
      diagnosticsNowIso: overrides.diagnosticsNowIso || nowIso(),
      generatedAt: overrides.generatedAt || nowIso()
    });
  }

  function recordRunbookExportFeedback(feedback = {}) {
    const runbook = previewManualHostSmokeRunbook(feedback);
    const nextState = buildRunbookExportFeedbackState({
      runbook,
      persistedState: state.runbookExportFeedbackState,
      lastAction: feedback.lastAction || "generated",
      lastFormat: Object.prototype.hasOwnProperty.call(feedback, "lastFormat") ? feedback.lastFormat : null,
      lastResult: feedback.lastResult || "success",
      lastMessageKey: feedback.lastMessageKey || "commandCenter.runbook.feedback.generated",
      recordedAt: feedback.recordedAt || nowIso(),
      nowIso: feedback.nowIso || nowIso()
    });
    state.runbookExportFeedbackState = nextState.persisted;
    return emit();
  }

  function previewManualHostSmokeEvidencePack(overrides = {}) {
    const generatedAt = overrides.generatedAt || nowIso();
    const runbook = buildManualHostSmokeRunbook({
      ...state.data,
      ...overrides,
      selectedHost: overrides.selectedHost || state.selectedHost,
      serviceOnline: Object.prototype.hasOwnProperty.call(overrides, "serviceOnline") ? overrides.serviceOnline : state.serviceOnline,
      diagnosticsNowIso: overrides.diagnosticsNowIso || generatedAt,
      generatedAt
    });
    const runbookExportFeedbackState = buildRunbookExportFeedbackState({
      runbook,
      persistedState: overrides.runbookExportFeedbackState || state.runbookExportFeedbackState,
      nowIso: generatedAt
    });
    return buildManualHostSmokeEvidencePack({
      runbook,
      runbookExportFeedbackState,
      manualReviewerNotes: Object.prototype.hasOwnProperty.call(overrides, "manualReviewerNotes")
        ? overrides.manualReviewerNotes
        : state.manualReviewerNotes,
      generatedAt
    });
  }

  function previewManualHostSmokeReviewChecklist(overrides = {}) {
    const generatedAt = overrides.generatedAt || nowIso();
    const evidencePack = previewManualHostSmokeEvidencePack({
      ...overrides,
      generatedAt
    });
    return buildManualHostSmokeReviewChecklist({
      evidencePack,
      reviewChecklistState: Object.prototype.hasOwnProperty.call(overrides, "reviewChecklistState")
        ? overrides.reviewChecklistState
        : state.reviewChecklistState,
      generatedAt
    });
  }

  function updateReviewChecklistState(reviewChecklistState = {}) {
    state.reviewChecklistState = reviewChecklistState;
    return emit();
  }

  function previewManualHostSmokeSessionDraft(overrides = {}) {
    const generatedAt = overrides.generatedAt || nowIso();
    const evidencePack = previewManualHostSmokeEvidencePack({
      ...overrides,
      generatedAt
    });
    const reviewChecklist = buildManualHostSmokeReviewChecklist({
      evidencePack,
      reviewChecklistState: Object.prototype.hasOwnProperty.call(overrides, "reviewChecklistState")
        ? overrides.reviewChecklistState
        : state.reviewChecklistState,
      generatedAt
    });
    return buildManualHostSmokeSessionDraft({
      reviewChecklist,
      evidencePack,
      sessionDraftState: Object.prototype.hasOwnProperty.call(overrides, "sessionDraftState")
        ? overrides.sessionDraftState
        : state.sessionDraftState,
      generatedAt
    });
  }

  function updateManualHostSmokeSessionDraftState(sessionDraftState = {}) {
    state.sessionDraftState = sessionDraftState;
    return emit();
  }

  function previewVisualPreviewPass(overrides = {}) {
    return buildCommandCenterVisualPreview({
      ...state.data,
      ...overrides,
      selectedHost: overrides.selectedHost || state.selectedHost,
      generatedAt: overrides.generatedAt || nowIso()
    });
  }

  function previewVisualReviewMatrix(overrides = {}) {
    const generatedAt = overrides.generatedAt || nowIso();
    const visualPreview = buildCommandCenterVisualPreview({
      ...state.data,
      ...overrides,
      selectedHost: overrides.selectedHost || state.selectedHost,
      generatedAt
    });
    return buildCommandCenterVisualReviewMatrix({
      ...overrides,
      visualPreview,
      generatedAt
    });
  }

  function previewVisualSignoffState(overrides = {}) {
    const generatedAt = overrides.generatedAt || nowIso();
    const visualReviewMatrix = previewVisualReviewMatrix({
      ...overrides,
      generatedAt
    });
    return buildCommandCenterVisualSignoffState({
      ...overrides,
      visualReviewMatrix,
      visualSignoffState: Object.prototype.hasOwnProperty.call(overrides, "visualSignoffState")
        ? overrides.visualSignoffState
        : state.visualSignoffState,
      generatedAt
    });
  }

  function updateVisualSignoffState(visualSignoffState = {}) {
    state.visualSignoffState = visualSignoffState;
    return emit();
  }

  function previewVisualEvidenceExport(overrides = {}) {
    const generatedAt = overrides.generatedAt || nowIso();
    const visualReviewMatrix = previewVisualReviewMatrix({
      ...overrides,
      generatedAt
    });
    const visualSignoffState = buildCommandCenterVisualSignoffState({
      ...overrides,
      visualReviewMatrix,
      visualSignoffState: Object.prototype.hasOwnProperty.call(overrides, "visualSignoffState")
        ? overrides.visualSignoffState
        : state.visualSignoffState,
      generatedAt
    });
    return buildCommandCenterVisualEvidenceExport({
      ...overrides,
      visualReviewMatrix,
      visualSignoffState,
      generatedAt
    });
  }

  function previewVisualEvidenceReviewLock(overrides = {}) {
    const generatedAt = overrides.generatedAt || nowIso();
    const visualEvidenceExport = previewVisualEvidenceExport({ ...overrides, generatedAt });
    return buildCommandCenterVisualEvidenceReviewLock({
      ...overrides,
      visualEvidenceExport,
      visualEvidenceReviewLock: Object.prototype.hasOwnProperty.call(overrides, "visualEvidenceReviewLock")
        ? overrides.visualEvidenceReviewLock
        : state.visualEvidenceReviewLock,
      generatedAt
    });
  }

  function updateVisualEvidenceReviewLock(visualEvidenceReviewLock = {}) {
    state.visualEvidenceReviewLock = visualEvidenceReviewLock;
    return emit();
  }

  return {
    snapshot,
    subscribe,
    setLocale,
    setTheme,
    selectHost,
    setHistoryFilters,
    resetHistoryFilters,
    clearHistory,
    selectCommand,
    openCommandDetail,
    clearCommandDetail,
    clearError,
    recoverFromError,
    recoverDiagnostic,
    resolveReadinessDrilldown,
    previewMockHostSmokeRehearsal,
    previewRehearsalResultPanel,
    previewManualHostSmokeRunbook,
    recordRunbookExportFeedback,
    previewManualHostSmokeEvidencePack,
    previewManualHostSmokeReviewChecklist,
    updateReviewChecklistState,
    previewManualHostSmokeSessionDraft,
    updateManualHostSmokeSessionDraftState,
    previewVisualPreviewPass,
    previewVisualReviewMatrix,
    previewVisualSignoffState,
    updateVisualSignoffState,
    previewVisualEvidenceExport,
    previewVisualEvidenceReviewLock,
    updateVisualEvidenceReviewLock,
    refresh,
    runReadOnlyAction
  };
}
