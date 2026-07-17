# Provider Hub V2 Design

## Goal

Rebuild the whole Model Platform page as a compact configuration manager. Users can create multiple named configurations for the same provider type, understand exactly whether a key/config/model request succeeded, and work without the page growing indefinitely.

## Information Architecture

- Keep the existing application sidebar, top bar, colors, spacing language, and page entry.
- Replace the current capability/catalog/config/discovery/status/guidance/binding stack with one fixed-height master-detail workspace.
- Left pane: named configuration instances with provider type, active state, key state, and model count. It scrolls independently.
- Right pane: selected configuration details. It stays within the viewport and scrolls independently.
- Right detail tabs: `Connection`, `Models`, and `Capabilities`.
- Status and errors stay next to the action that produced them. No remote failure may silently fall back to mock success.

## Configuration Model

Each saved configuration has a stable `profileId` independent from its provider type:

```json
{
  "profileId": "paper-gpt",
  "name": "Paper-GPT",
  "providerId": "openai-compatible",
  "baseUrl": "https://example.com/v1",
  "apiKeyRef": "provider-profile:paper-gpt:apiKey",
  "model": "gpt-5.5",
  "models": [],
  "modelsPath": "/models",
  "chatPath": "/chat/completions",
  "defaultCapabilities": ["text"],
  "enabled": true
}
```

- Multiple configuration instances may use the same `providerId`.
- Names are editable and required.
- API keys remain outside profile JSON and renderer storage.
- Capability bindings point to `profileId + model`, not only `providerId + model`.
- Existing provider profiles migrate into one instance per existing provider without losing bindings.

## Interaction

- `New configuration` creates a draft and selects it.
- Selecting a list item opens it in the detail pane without moving the page.
- Connection tab: name, provider type, Base URL, API Key, advanced endpoint fields, Test, Save.
- Models tab: refresh list, model rows, default model selection, refresh error/result.
- Capabilities tab: assign the selected default model to text/vision/image/etc.
- Saving the key shows inline `saving`, `saved`, or `failed` state and never clears the input on failure.
- Refresh is disabled until required connection fields are valid and the key is saved or present in the draft.
- Delete requires confirmation in a later slice; V2 first pass exposes creation and editing but does not add destructive controls.

## Error Handling

- Local Service offline: show a blocking inline message and keep entered values.
- Provider authentication/network/response errors: show the exact mapped error in the active tab.
- Empty model list is a valid response and is displayed as such.
- Mock catalog entries remain available only as initial templates, never as refresh results.

## Responsive Behavior

- Desktop: two columns, approximately 300px list plus flexible detail.
- Narrow desktop/tablet: list narrows but remains visible.
- Mobile: panes stack, each with bounded height; tabs remain horizontally scrollable.

## Acceptance

- Same provider type can have at least two differently named configurations.
- Page height does not grow with provider or model count.
- Name, URL, encrypted key status, model list, and capability bindings survive reload.
- Key save and model refresh always give visible local feedback.
- No raw key appears in profile JSON, localStorage, logs, or API responses.
