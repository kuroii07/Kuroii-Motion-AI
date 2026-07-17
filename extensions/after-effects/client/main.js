const extension = {
  id: "com.kuroii.motionai.ae",
  host: "AE",
  hostId: "after-effects",
  serviceState: "preview",
  activeMode: "context",
  theme: "dark",
  locale: "zh-CN",
  serviceUrl: "http://127.0.0.1:17631",
  sessionToken: "dev-local-token",
  agentVersion: "0.5.9-alpha.0"
};

const i18n = {
  "zh-CN": {
    "app.surface": "AE Compact",
    "app.title": "Kuroii Motion AI",
    "status.preview": "视觉预览模式",
    "status.refreshed": "预览状态已刷新",
    "status.readOnly": "只读预览，不会修改 AE 工程",
    "mode.context": "上下文",
    "mode.actions": "动作",
    "mode.log": "日志",
    "card.context": "合成上下文",
    "card.actions": "只读动作",
    "card.log": "事件日志",
    "field.project": "项目",
    "field.comp": "合成",
    "field.selection": "选中",
    "field.mode": "模式",
    "badge.readOnly": "只读",
    "log.preview": "v0.5.5 仅视觉预览，等待真实宿主 smoke。",
    "tooltip.refresh": "刷新预览",
    "tooltip.language": "切换语言"
  },
  "en-US": {
    "app.surface": "AE Compact",
    "app.title": "Kuroii Motion AI",
    "status.preview": "Visual preview mode",
    "status.refreshed": "Preview state refreshed",
    "status.readOnly": "Read-only preview; AE project will not be changed",
    "mode.context": "Context",
    "mode.actions": "Actions",
    "mode.log": "Log",
    "card.context": "Composition Context",
    "card.actions": "Read-only Actions",
    "card.log": "Event Log",
    "field.project": "Project",
    "field.comp": "Comp",
    "field.selection": "Selection",
    "field.mode": "Mode",
    "badge.readOnly": "Read-only",
    "log.preview": "v0.5.5 visual preview only; waiting for real host smoke.",
    "tooltip.refresh": "Refresh preview",
    "tooltip.language": "Switch language"
  }
};

const modes = [
  ["context", "mode.context"],
  ["actions", "mode.actions"],
  ["log", "mode.log"]
];

const previewContext = {
  project: "Mock AE Project",
  comp: "Mock Comp",
  selection: "1 text layer",
  mode: "preview-only"
};

const previewActions = [
  "ae.context.getProject",
  "ae.context.getActiveComp",
  "ae.context.getSelection",
  "ae.text.readSelectedLayers"
];

function t(key) {
  return (i18n[extension.locale] && i18n[extension.locale][key]) || i18n["en-US"][key] || key;
}

function requestJson(method, path, body) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, extension.serviceUrl + path, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Kuroii-Session", extension.sessionToken);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var payload = {};
      try { payload = JSON.parse(xhr.responseText || "{}"); } catch (error) { payload = { ok: false, code: "INVALID_JSON" }; }
      if (xhr.status >= 200 && xhr.status < 300) resolve(payload);
      else reject(payload);
    };
    xhr.send(body ? JSON.stringify(body) : "{}");
  });
}

function hostPayload(status) {
  return {
    extensionId: extension.id,
    projectId: "mock-ae-project",
    projectName: previewContext.project,
    hostVersion: "mock-2026",
    agentVersion: extension.agentVersion,
    connectionMode: "mock",
    status: status || "Connected",
    context: {
      activeComp: { name: previewContext.comp },
      selection: []
    }
  };
}

function renderI18n() {
  document.documentElement.lang = extension.locale;
  document.querySelectorAll("[data-i18n]").forEach(function (node) {
    node.textContent = t(node.dataset.i18n);
  });
  document.getElementById("refreshButton").dataset.tooltip = t("tooltip.refresh");
  document.getElementById("languageButton").dataset.tooltip = t("tooltip.language");
  document.getElementById("languageButton").textContent = extension.locale === "zh-CN" ? "中" : "EN";
}

function renderModes() {
  document.getElementById("modeRail").innerHTML = modes.map(function (item) {
    return '<button class="modeButton ' + (item[0] === extension.activeMode ? "active" : "") + '" type="button" data-mode="' + item[0] + '">' + t(item[1]) + "</button>";
  }).join("");
  document.querySelectorAll("[data-mode]").forEach(function (button) {
    button.addEventListener("click", function () {
      extension.activeMode = button.dataset.mode;
      render();
    });
  });
}

function renderContent() {
  document.getElementById("content").innerHTML = [
    '<section class="contextCard">',
    '<div class="cardTitle">' + t("card.context") + "</div>",
    '<dl class="factGrid">',
    "<dt>" + t("field.project") + "</dt><dd>" + previewContext.project + "</dd>",
    "<dt>" + t("field.comp") + "</dt><dd>" + previewContext.comp + "</dd>",
    "<dt>" + t("field.selection") + "</dt><dd>" + previewContext.selection + "</dd>",
    "<dt>" + t("field.mode") + "</dt><dd>" + previewContext.mode + "</dd>",
    "</dl>",
    "</section>",
    '<section class="actionCard">',
    '<div class="cardTitle">' + t("card.actions") + "</div>",
    '<div class="actionList">' + previewActions.map(function (action) {
      return '<div class="actionItem"><span>' + action + '</span><span class="badge">' + t("badge.readOnly") + "</span></div>";
    }).join("") + "</div>",
    "</section>",
    '<section class="logCard">',
    '<div class="cardTitle">' + t("card.log") + "</div>",
    '<div class="logList"><div class="logItem"><span>' + t("log.preview") + '</span><span class="badge">v0.5.5</span></div></div>',
    "</section>"
  ].join("");
}

function renderStatus(refreshed) {
  var strip = document.getElementById("statusStrip");
  strip.querySelector(".statusDot").className = "statusDot " + (refreshed ? "success" : "muted");
  strip.querySelector("span:last-child").textContent = refreshed ? t("status.refreshed") : t("status.preview");
  document.getElementById("footerStatus").textContent = t("status.readOnly");
}

function render(refreshed) {
  document.body.dataset.theme = extension.theme;
  renderI18n();
  renderModes();
  renderContent();
  renderStatus(Boolean(refreshed));
}

extension.registerHost = function () {
  return requestJson("POST", "/hosts/" + extension.hostId + "/register", hostPayload("Connected"));
};

extension.sendHeartbeat = function (status) {
  return requestJson("POST", "/hosts/" + extension.hostId + "/heartbeat", hostPayload(status || "Connected"));
};

document.getElementById("refreshButton").addEventListener("click", function () {
  extension.serviceState = "preview-refreshed";
  render(true);
});

document.getElementById("languageButton").addEventListener("click", function () {
  extension.locale = extension.locale === "zh-CN" ? "en-US" : "zh-CN";
  render(false);
});

window.__KUROII_EXTENSION__ = extension;
render(false);
