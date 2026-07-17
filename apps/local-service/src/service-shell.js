export const localServiceShell = {
  serviceId: "kuroii-motion-ai-local-service",
  transport: ["http", "websocket.reserved"],
  bind: "127.0.0.1",
  routes: [
    "/health",
    "/providers",
    "/provider-errors",
    "/providers/{providerId}/config",
    "/providers/{providerId}/models",
    "/providers/{providerId}/test",
    "/hosts",
    "/hosts/{host}",
    "/hosts/{host}/register",
    "/hosts/{host}/heartbeat",
    "/hosts/{host}/status",
    "/hosts/{host}/capabilities",
    "/host-target",
    "/commands"
  ],
  security: {
    sessionToken: true,
    originCheck: true,
    rateLimit: true,
    payloadLimit: "1mb",
    redactLogs: true
  }
};
