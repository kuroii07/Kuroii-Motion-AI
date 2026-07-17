# Desktop Manual Visual Sign-off State and Findings Backlog

Version: `0.5.8-alpha.0`

This slice adds a local manual sign-off layer on top of the v0.5.6 visual review matrix. It records whether each required screenshot is pending, accepted, blocked, or needs recheck, and it keeps a lightweight findings backlog for visual issues found during review.

It is still review-only. It does not launch AE/PR, execute host actions, or mutate project files.

## Scope

- Contract: `commandCenterVisualSignoffState`
- Builder: `buildCommandCenterVisualSignoffState()`
- Runtime snapshot keys: `visualSignoffStateContract`, `visualSignoffState`
- Runtime methods: `previewVisualSignoffState()`, `updateVisualSignoffState()`
- Prototype panel: `#visualSignoffPanel`
- Prototype markers: `data-visual-signoff-state`, `data-visual-signoff-summary`, `data-visual-signoff-item`, `data-visual-signoff-action`, `data-visual-findings-backlog`, `data-visual-finding-add`, `data-visual-finding-resolve`
- Prototype storage: `kuroii.motionai.commandCenter.visualSignoffState.v1`
- Smoke: `tests/smoke_desktop_visual_signoff_state.py`

## Statuses

- `pending-review`
- `accepted`
- `blocked`
- `needs-recheck`

## Findings Backlog

Finding fields:

- `matrixItemId`
- `type`
- `severity`
- `status`
- `note`
- `createdAt`
- `updatedAt`

Finding types:

- `unreadable-text`
- `horizontal-overflow`
- `missing-tooltip`
- `placeholder-question-marks`
- `contrast`
- `layout`
- `copy`
- `brand-consistency`

## Completion Rule

Visual sign-off can be completed only when all 10 matrix items are accepted and there are no open findings. This does not start real host smoke; it only clears the visual review gate.

## Safety Flags

- `automaticHostLaunchAllowed: false`
- `realHostSmokeAllowed: false`
- `readOnlyOnly: true`
- `hostMutationAllowed: false`

## Follow-up

v0.5.8 now prepares a pre-host visual evidence export, combining the screenshot checklist, sign-off summary, and findings backlog into a local Markdown / JSON bundle for manual review before any real host smoke.
