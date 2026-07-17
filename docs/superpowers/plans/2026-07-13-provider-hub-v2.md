# Provider Hub V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a compact named multi-profile Provider Hub with reliable encrypted-key, model-refresh, testing, and capability-binding feedback.

**Architecture:** Extend provider storage from provider-id keyed profiles to stable profile instances while preserving a compatibility projection for existing consumers. Replace the prototype's long grid with a bounded master-detail workspace and three detail tabs.

**Tech Stack:** Python standard library Local Service, vanilla JavaScript prototype, CSS, Windows DPAPI, Python smoke tests.

## Global Constraints

- Keep API keys out of renderer persistence, profile JSON, logs, and responses.
- Preserve the existing application shell and visual language.
- Never report a remote refresh/test as successful after falling back to mock data.
- Preserve migration compatibility for the current `provider-profile.json`.

---

### Task 1: Named Profile Storage

**Files:**
- Modify: `apps/local-service/src/provider_profiles.py`
- Modify: `apps/local-service/src/server.py`
- Test: `tests/smoke_provider_hub_v2.py`

- [ ] Write a failing smoke test for creating two named OpenAI Compatible profiles and reloading them.
- [ ] Add stable `profileId`, `name`, and profile-scoped secret references.
- [ ] Add create/update/select API handling while retaining the public compatibility projection.
- [ ] Verify no raw key reaches disk or responses.

### Task 2: Master-detail UI

**Files:**
- Modify: `apps/desktop/prototype/prototype.js`
- Modify: `apps/desktop/prototype/styles.css`
- Test: `tests/smoke_provider_hub_v2.py`

- [ ] Write failing assertions for the bounded master-detail layout and three tabs.
- [ ] Render named configuration list and selected detail state.
- [ ] Remove old long-page panels from the Provider Hub route.
- [ ] Add independent scrolling and responsive constraints.

### Task 3: Operational Flows

**Files:**
- Modify: `apps/desktop/prototype/prototype.js`
- Modify: `apps/local-service/src/provider_profiles.py`
- Test: `tests/smoke_provider_hub_v2.py`

- [ ] Wire create, rename, save, key save, test, model refresh, and capability binding to the selected profile.
- [ ] Keep errors and success feedback inside the active tab.
- [ ] Remove model-refresh mock fallback for service-backed providers.
- [ ] Verify state survives reload and secrets remain encrypted.

### Task 4: Documentation and Regression

**Files:**
- Modify: `README.md`
- Modify: `apps/local-service/README.md`
- Modify: `tests/validate_v3_structure.py`
- Modify: `package.json`

- [ ] Register the new smoke test and routes.
- [ ] Run Provider Hub V1/V2, secret save, adapter, and structure tests.
- [ ] Start Local Service and inspect the page at desktop and narrow widths.
