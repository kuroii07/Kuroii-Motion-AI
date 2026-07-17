export function createCommandEnvelope(input) {
  return {
    commandId: input.commandId,
    sessionId: input.sessionId,
    host: input.host,
    projectId: input.projectId,
    action: input.action,
    target: input.target || {},
    params: input.params || {},
    riskLevel: input.riskLevel ?? 0,
    requiresConfirmation: Boolean(input.requiresConfirmation),
    createdAt: input.createdAt || new Date().toISOString(),
    timeoutMs: input.timeoutMs || 30000
  };
}
