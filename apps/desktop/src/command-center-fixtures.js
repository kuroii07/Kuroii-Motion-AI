export const commandCenterFixtureVersion = "0.5.9-alpha.0";

export const commandCenterMockData = {
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

export function cloneCommandCenterMockData() {
  return JSON.parse(JSON.stringify(commandCenterMockData));
}
