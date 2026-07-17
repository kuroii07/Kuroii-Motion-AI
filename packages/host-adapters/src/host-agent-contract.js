export const hostAgentRoutes = {
  register: "/hosts/{host}/register",
  heartbeat: "/hosts/{host}/heartbeat",
  status: "/hosts/{host}/status",
  capabilities: "/hosts/{host}/capabilities",
  target: "/host-target"
};

export const hostConnectionModes = ["mock", "live", "queue", "project-package"];
export const hostStatuses = ["Offline", "Connected", "Busy", "WaitingForConfirmation", "Executing", "Error", "Updating"];
