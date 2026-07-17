from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(relative_path):
    return (ROOT / relative_path).read_text(encoding="utf-8")


def main():
    prototype = read("apps/desktop/prototype/prototype.js")
    css = read("apps/desktop/prototype/styles.css")

    for needle in [
        'class="providerApiKeyRow"',
        'id="saveProviderApiKeyButton"',
        "function saveProviderApiKey",
        'el("saveProviderApiKeyButton")',
        'value="${escapeHtml(state.providerConfig.apiKeyDraft || "")}"',
        "state.providerConfig.apiKeySaveState = \"saving\"",
        "state.providerConfig.apiKeySaveState = \"saved\"",
        "state.providerConfig.apiKeySaveState = \"error\"",
        "API Key 已加密保存",
        "Local Service 未连接，API Key 未保存",
    ]:
        assert needle in prototype, needle

    for needle in [
        ".providerApiKeyRow",
        ".providerApiKeySaveButton",
        "grid-template-columns: minmax(0, 1fr) auto",
    ]:
        assert needle in css, needle

    print("[OK] Provider API key save button smoke test passed")


if __name__ == "__main__":
    main()
