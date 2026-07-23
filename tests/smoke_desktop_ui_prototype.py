from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def balanced_css_braces(css: str) -> bool:
    depth = 0
    for char in css:
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
        if depth < 0:
            return False
    return depth == 0


def main() -> int:
    index = read("apps/desktop/prototype/index.html")
    css = read("apps/desktop/prototype/styles.css")
    settings_css = read("apps/desktop/prototype/styles/settings-center.css")
    js = read("apps/desktop/prototype/prototype.js")
    readme = read("apps/desktop/prototype/README.md")
    desktop_package = json.loads(read("apps/desktop/package.json"))
    root_package = json.loads(read("package.json"))

    assert desktop_package["version"] == "0.5.9-alpha.0"
    assert root_package["version"] == "0.5.9-alpha.0"
    assert re.search(r'<link rel="stylesheet" href="\./styles\.css\?v=[^"]+">', index)
    assert re.search(r'<script src="\./prototype\.js\?v=[^"]+"></script>', index)
    assert 'id="languageToggle"' in index
    assert 'id="themeToggle"' in index
    assert 'id="hostStrip"' in index
    assert 'id="actionList"' in index
    assert 'id="historyTable"' in index
    assert "只读模式" in index
    assert "theme-dark" in css and "theme-light" in css
    assert "toggleThemeAppearance" in js
    assert 'applyThemeMode(state.theme === "dark" ? "light" : "dark")' in js
    assert "ACTIVE_VIEW_STORAGE_KEY" in js
    assert "readPersistedActiveView" in js
    assert "setActiveView(button.dataset.navId)" in js
    assert "@media (max-width: 840px)" in css
    assert "grid-template-rows: auto minmax(0, 1fr)" in css
    assert "sidebarCollapsed" in css
    assert "--sidebar-width: 164px" in css
    assert "--sidebar-rail: 72px" in css
    assert ".sidebarCollapsed .navGroup" in css
    assert ".sidebarCollapsed .navGroupLabel" in css
    assert "min-height: 44px" in css
    assert "data-tooltip" in css
    assert balanced_css_braces(css)
    assert "zh-CN" in js and "en-US" in js
    assert "refreshFromService" in js
    assert "providerConfig" in js
    assert '["provider-hub", "provider", "nav.providerHub"]' in js
    assert "renderProviderHubWorkspace" in js
    assert "renderSystemSettingsWorkspace" in js
    assert 'id="refreshModelsButton"' in js
    assert "testProviderConnection" in js
    assert "/provider-profiles/${encodeURIComponent(state.providerConfig.profileId)}/models" in js
    assert "/provider-profiles/${encodeURIComponent(state.providerConfig.profileId)}/test" in js
    assert "/provider-profiles/${encodeURIComponent(state.providerConfig.profileId)}/profile" in js
    assert "/ai/text/generate" in js
    assert "/ai/image/generate" in js
    assert "/ai/video/generate" in js
    assert "/ai/video/readiness" in js
    assert "/ai/video/tasks" in js
    assert "runImageGeneration" in js
    assert "imageGenerationOutputHtml" in js
    assert 'data-create-mode="image"' in js
    assert 'data-create-mode="video"' in js
    assert 'data-create-mode="music"' in js
    assert 'data-create-mode="voice"' in js
    assert "runVideoGeneration" in js
    assert "renderVideoGenerationWorkbench" in js
    assert "renderMusicDirectionWorkbench" in js
    assert "buildMusicDirection" in js
    assert 'id="musicDirectionBrief"' in js
    assert "musicDirectionWorkbench" in js
    assert "musicDirectionDesk" in js
    assert "musicDirectionStage" in js
    assert "musicDirectionReadiness" in js
    assert ".musicDirectionDesk" in read("apps/desktop/prototype/styles/image-workspace.css")
    assert ".musicDirectionStage" in read("apps/desktop/prototype/styles/image-workspace.css")
    assert "renderVoiceDirectionWorkbench" in js
    assert "buildVoiceDirection" in js
    assert 'id="voiceDirectionScript"' in js
    assert "voiceDirectionDesk" in js
    assert "voiceDirectionSheet" in js
    assert ".voiceDirectionDesk" in read("apps/desktop/prototype/styles/image-workspace.css")
    assert "/ai/audio/drafts" in js
    assert "/ai/audio/history" in js
    assert "/ai/assets" in js
    assert "loadAssetLibrary" in js
    assert "assetLibraryWorkbenchBody" in js
    assert "deleteAssetLibraryItem" in js
    assert "data-asset-library-filter" in js
    assert "openAssetLibrary" in js
    assert "mountAssetLibraryShortcut" in js
    assert "restoreAssetLibraryItem" in js
    assert "data-asset-library-restore" in js
    assert '"openImageAssetLibraryButton"' in js
    assert '"openMusicAssetLibraryButton"' in js
    assert '"openVoiceAssetLibraryButton"' in js
    assert '"openVideoAssetLibraryButton"' in js
    assert ".assetLibraryDetailMedia" in css
    assert "saveAudioPlan" in js
    assert "audioHistoryHtml" in js
    assert 'id="refreshAudioHistoryButton"' in js
    assert "loadVideoReadiness" in js
    assert "refreshVideoReadinessButton" in js
    assert "addManualProviderModel" in js
    assert 'id="providerManualModelId"' in js
    assert 'data-provider-manual-capability' in js
    assert "videoGenerationOutputHtml" in js
    assert 'id="videoGenerationAspectRatio"' in js
    assert 'id="videoGenerationDuration"' in js
    assert 'id="videoGenerationResolution"' in js
    assert 'class="imageGenerationPreview"' in js
    assert 'class="imageGenerationDiagnostics"' in js
    assert 'id="imageGenerationSize"' in js
    assert 'id="imageGenerationAspectRatio"' in js
    assert 'id="imageGenerationOutputResolution"' in js
    assert "imageGenerationExportSpec" in js
    assert "outputResolution" in js
    assert 'id="imageGenerationQuality"' in js
    assert ".imageGenerationWorkbench { grid-template-rows: auto; }" in css
    assert "providerProfileReady: false" in js
    assert "state.providerProfileReady = true" in js
    assert "/ai/image/history" in js
    assert "loadImageHistory" in js
    assert "downloadGeneratedImage" in js
    assert "reuseImageHistoryItem" in js
    assert 'class="imageHistoryList"' in js
    assert "deleteSelectedImageHistory" in js
    assert "cleanupMissingImageHistory" in js
    assert "imageHistoryStorage" in js
    assert 'data-image-history-select' in js
    assert ".imageHistoryManagement" in css
    assert "color-scheme: dark" in css
    assert "color-scheme: light" in css
    assert "select:not([multiple])" in css
    assert "appearance: none" in css
    assert "::-webkit-scrollbar" in css
    assert "scrollbar-color:" in css
    assert 'input[type="range"]::-webkit-slider-thumb' in css
    assert 'input[type="checkbox"]:checked::after' in css
    assert "enhanceCustomSelects" in js
    assert "openKuroiiOverlay" in js
    assert "closeKuroiiOverlay" in js
    assert "positionKuroiiOverlay" in js
    assert 'setAttribute("role", "listbox")' in js
    assert 'setAttribute("aria-activedescendant"' in js
    assert "kuroiiSelectMenu" in js
    assert ".kuroiiSelectTrigger" in css
    assert ".kuroiiSelectMenu" in css
    assert ".kuroiiOverlay" in css
    assert "kuroiiOverlayEnter" in css
    assert '[data-placement="top"]' in css
    assert "target && target === appTooltipTarget" in js
    assert ".navList::-webkit-scrollbar" in css
    assert 'matchMedia("(forced-colors: active)")' in js
    assert 'select.setAttribute("aria-hidden", "true")' in js
    assert "select.hidden = true" in js
    assert 'input[type="date"]::-webkit-calendar-picker-indicator' in css
    assert 'input[type="search"]::-webkit-search-cancel-button' in css
    assert "LOCAL_SERVICE_OFFLINE: {" in js
    assert "LOCAL_SERVICE_ERROR: {" in js
    assert 'generation.errorCode = payload.code || (error && error.status ? "LOCAL_SERVICE_ERROR" : "LOCAL_SERVICE_OFFLINE");' in js
    assert "state.serviceOnline = Boolean(error && error.status);" in js
    assert "当前操作返回的数据不符合 OpenAI Compatible 格式" in js
    assert "/provider-profile" in js
    assert "/provider-capabilities" in js
    assert "loadCapabilityConnectionStatuses" in js
    assert "capabilityConnectionLabel" in js
    assert "可绑定待接通" in js
    assert "providerCapabilityRuntimeStatus" in js
    assert "/provider-bindings/${encodeURIComponent(capabilityId)}" in js
    assert "providerProfileStorageKey" in js
    assert "capabilityBindings" in js
    assert "bindCurrentModelToCapability" in js
    assert "apiKeyDraft" in js
    assert "apiKeyRef" in js
    assert "apiKeyStatus" in js
    assert "modelsPath" in js
    assert "videoPath" in js
    assert "videoStatusPath" in js
    assert "customHeadersText" in js
    assert "timeoutSeconds" in js
    assert "defaultCapabilities" in js
    assert "parseProviderHeaders" in js
    assert 'id="providerModelsPath"' in js
    assert 'id="providerChatPath"' in js
    assert 'id="providerVideoPath"' in js
    assert 'id="providerVideoStatusPath"' in js
    assert 'id="providerCustomHeaders"' in js
    assert 'id="providerTimeoutSeconds"' in js
    assert 'id="providerOrganization"' in js
    assert "Organization、模型刷新" in js
    assert "data-provider-default-capability" in js
    assert "providerAdvancedConfig" in css
    assert "providerCapabilityOptions" in css
    assert ".providerCapabilityRuntimeStatus" in css
    assert "delete clean.apiKey" in js
    assert "delete clean.headers.Authorization" not in js
    assert "Windows DPAPI" in js
    assert "secretStoreStatus" in js
    assert "sk-valid-test" not in js
    assert "offline-fallback" not in js
    assert "检查 Key" in js
    assert "切换模型" in js
    assert "等待限流恢复" in js
    assert "检查 Base URL" in js
    assert "providerModelSummaryHtml" in js
    assert 'id="featurePromptInput"' in js
    assert 'id="featureGenerateButton"' in js
    assert 'id="featureCancelButton"' in js
    assert "renderTextGenerationWorkspace" in js
    assert "assistantConversation" in js
    assert "ASSISTANT_CONVERSATION_STORAGE_KEY" in js
    assert "readPersistedAssistantConversation" in js
    assert "persistAssistantConversation" in js
    assert "appendAssistantConversationMessage" in js
    assert "assistantUserMessage" in js
    assert "assistantTyping" in css
    assert 'const liveTextFeatureIds = new Set(["copilot", "create", "copy", "translate", "storyboard", "motion", "expression", "script"])' in js
    assert "textGenerationRequestContext" in js
    assert 'id="featureContentFormat"' in js
    assert 'id="featureContentDuration"' in js
    assert 'id="featureTranslationSource"' in js
    assert 'id="featureTranslationTarget"' in js
    assert 'id="featureTranslationTiming"' in js
    assert 'id="featureStoryboardShots"' in js
    assert 'id="featureStoryboardDuration"' in js
    assert 'bindBoundedNumberInput("featureContentDuration"' in js
    assert 'bindBoundedNumberInput("featureStoryboardShots"' in js
    assert 'bindBoundedNumberInput("featureStoryboardDuration"' in js
    assert "renderMotionWorkbench" in js
    assert "motionInspector" in js
    assert "keyframeTimeline" in js
    assert "renderCodeWorkbench" in js
    assert "codeEditorSurface" in js
    assert "codeInspectorPane" in js
    assert "脚本工程师" in js
    assert ".featureTaskControls" in css
    assert ".motionWorkbench" in css
    assert ".codeWorkbench" in css
    assert "homeProviderName" in index
    assert ".providerHubGrid" in css
    assert ".settingsWorkspace" in settings_css
    assert "bindSystemSettingsWorkspace" in js
    assert ".settingsGroupPanel" in settings_css
    assert 'data-settings-theme-color="${id}"' in js
    assert 'data-settings-accent-color="${id}"' in js
    assert "settingsNavigation" not in js
    assert "settingsSearchInput" not in js
    assert 'data-open-provider-hub' in js
    assert 'data-check-local-service' in js
    assert ".modelSelectRow" in css
    assert "http://127.0.0.1:17631" in js
    assert "riskLevel: 0" in js
    assert "requiresConfirmation: false" in js
    assert "PROTOTYPE_MOCK_EXECUTED" in js
    assert "mutationPerformed: false" in js
    assert "apps/desktop/prototype/index.html" in readme
    assert not re.search(r"\?{3,}", index + css + js + readme)

    print("[OK] Desktop UI prototype smoke test passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
