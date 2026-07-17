export const afterEffectsAdapter = {
  host: "after-effects",
  extensionId: "com.kuroii.motionai.ae",
  contextMethods: ["getProject", "getActiveComp", "getSelection"],
  executionMode: "trusted-actions-first"
};
