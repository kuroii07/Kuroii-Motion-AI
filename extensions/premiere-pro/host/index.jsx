(function () {
  var KUROII_EXTENSION_ID = "com.kuroii.motionai.pr";
  var KUROII_HOST_ID = "premiere-pro";

  function getHostContext() {
    return {
      extensionId: KUROII_EXTENSION_ID,
      host: KUROII_HOST_ID,
      status: "mock",
      projectId: "mock-pr-project",
      projectName: "Mock PR Project",
      hostVersion: "mock-2026",
      context: {
        activeSequence: { name: "Mock Sequence" },
        selection: []
      },
      message: "Phase 0.3.4 host context stub"
    };
  }

  function getRegistrationPayload() {
    var context = getHostContext();
    return {
      extensionId: KUROII_EXTENSION_ID,
      projectId: context.projectId,
      projectName: context.projectName,
      hostVersion: context.hostVersion,
      agentVersion: "0.3.4-alpha.0",
      connectionMode: "mock",
      context: context.context
    };
  }

  $.global.KuroiiMotionAI = {
    getHostContext: getHostContext,
    getRegistrationPayload: getRegistrationPayload
  };
}());
