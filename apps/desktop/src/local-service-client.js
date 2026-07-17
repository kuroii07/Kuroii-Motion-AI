const DEFAULT_BASE_URL = "http://127.0.0.1:17631";
const DEFAULT_SESSION_TOKEN = "dev-local-token";

export const desktopLocalServiceRoutes = {
  health: "/health",
  hosts: "/hosts",
  hostContext: "/hosts/{host}/context",
  trustedActions: "/actions/trusted",
  commands: "/commands",
  commandDetail: "/commands/{commandId}"
};

export function createLocalServiceClient(options = {}) {
  const baseUrl = options.baseUrl || DEFAULT_BASE_URL;
  const sessionToken = options.sessionToken || DEFAULT_SESSION_TOKEN;
  const transport = options.transport || globalThis.fetch;

  if (typeof transport !== "function") {
    throw new Error("A fetch-compatible transport is required for Desktop Command Center.");
  }

  async function request(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    if (path !== desktopLocalServiceRoutes.health) {
      headers["X-Kuroii-Session"] = sessionToken;
    }
    const response = await transport(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const payload = await response.json();
    if (!response.ok) {
      const error = new Error(payload.message || `Local Service request failed: ${response.status}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  return {
    baseUrl,
    async health() {
      return request("GET", desktopLocalServiceRoutes.health);
    },
    async listHosts() {
      return request("GET", desktopLocalServiceRoutes.hosts);
    },
    async getHostContext(host) {
      return request("GET", desktopLocalServiceRoutes.hostContext.replace("{host}", encodeURIComponent(host)));
    },
    async listTrustedActions(host) {
      const query = host ? `?host=${encodeURIComponent(host)}` : "";
      return request("GET", `${desktopLocalServiceRoutes.trustedActions}${query}`);
    },
    async executeReadOnlyAction(command) {
      return request("POST", desktopLocalServiceRoutes.commands, command);
    },
    async listCommandHistory(filters = {}) {
      const query = new URLSearchParams();
      if (filters.limit) query.set("limit", String(filters.limit));
      if (filters.host) query.set("host", filters.host);
      if (filters.action) query.set("action", filters.action);
      if (typeof filters.ok === "boolean") query.set("ok", String(filters.ok));
      const suffix = query.toString() ? `?${query.toString()}` : "";
      return request("GET", `${desktopLocalServiceRoutes.commands}${suffix}`);
    },
    async getCommandDetail(commandId) {
      return request("GET", desktopLocalServiceRoutes.commandDetail.replace("{commandId}", encodeURIComponent(commandId)));
    }
  };
}

export function createReadOnlyCommandEnvelope(input) {
  return {
    commandId: input.commandId || `desktop-${Date.now()}`,
    sessionId: input.sessionId || "desktop-command-center",
    host: input.host,
    projectId: input.projectId,
    action: input.action,
    target: input.target || {},
    params: input.params || {},
    riskLevel: 0,
    requiresConfirmation: false,
    createdAt: input.createdAt || new Date().toISOString(),
    timeoutMs: input.timeoutMs || 30000
  };
}

export function normalizeServiceError(error) {
  const payload = error && error.payload ? error.payload : {};
  return {
    ok: false,
    status: error && error.status ? error.status : 0,
    code: payload.code || "LOCAL_SERVICE_UNAVAILABLE",
    message: payload.message || "Local Service is unavailable.",
    advice: payload.advice || ["启动 Local Service，或检查 127.0.0.1:17631。"]
  };
}
