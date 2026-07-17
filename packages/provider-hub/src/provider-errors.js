export const providerErrorGuidance = {
  AUTH_INVALID_KEY: {
    severity: "error",
    titleKey: "provider.error.invalidKey",
    adviceKeys: ["providerAdvice.checkKey", "providerAdvice.openConsole"],
    userAdviceZh: "检查 API Key 是否正确、是否过期、是否有当前模型权限。"
  },
  MODEL_NOT_FOUND: {
    severity: "warning",
    titleKey: "provider.error.modelNotFound",
    adviceKeys: ["providerAdvice.refreshModels", "providerAdvice.switchModel"],
    userAdviceZh: "刷新模型列表，或切换到当前平台可用模型。"
  },
  RATE_LIMITED: {
    severity: "warning",
    titleKey: "provider.error.rateLimited",
    adviceKeys: ["providerAdvice.waitRateLimit", "providerAdvice.switchModel"],
    userAdviceZh: "等待限流恢复，或切换到其他模型 / Provider。"
  },
  BASE_URL_UNREACHABLE: {
    severity: "error",
    titleKey: "provider.error.baseUrl",
    adviceKeys: ["providerAdvice.checkBaseUrl", "providerAdvice.checkProxy"],
    userAdviceZh: "检查 Base URL、网络代理、本地服务端口和协议路径。"
  },
  NETWORK_TIMEOUT: {
    severity: "error",
    titleKey: "provider.error.timeout",
    adviceKeys: ["providerAdvice.checkBaseUrl", "providerAdvice.retry"],
    userAdviceZh: "检查网络连接、代理设置和 Provider 服务状态。"
  },
  CONFIG_MISSING: {
    severity: "error",
    titleKey: "provider.error.configMissing",
    adviceKeys: ["providerAdvice.completeConfig"],
    userAdviceZh: "补全 API Key、Base URL 或必要参数后再测试。"
  }
};
