# Desktop Pre-host Visual Evidence Review Lock

Version: `0.5.9-alpha.0`

This slice records the final manual review decision for local visual evidence before a controlled host smoke. It does not launch After Effects or Premiere Pro, execute host actions, capture screenshots, or mutate project files.

## Lock Rule

- Visual evidence status must be `ready`.
- There must be no open findings, blocked items, pending items, or items needing recheck.
- A reviewer name is required.
- The optional review note is local-only and must not contain provider secrets or private project payloads.

The lock is invalidated when a blocker appears or the reviewer details change. A locked evidence review is still not permission to launch a host automatically; it only supplies a stable manual-gate record.

## Contract

- Contract: `commandCenterVisualEvidenceReviewLock`
- Builder: `buildCommandCenterVisualEvidenceReviewLock()`
- Runtime methods: `previewVisualEvidenceReviewLock()` and `updateVisualEvidenceReviewLock()`
- Local storage: `kuroii.motionai.commandCenter.visualEvidenceReviewLock.v1`
- Prototype panel: `#visualEvidenceReviewLockPanel`
- Smoke: `tests/smoke_desktop_visual_evidence_review_lock.py`

## Safety

- `automaticHostLaunchAllowed: false`
- `realHostSmokeAllowed: false`
- `readOnlyOnly: true`
- `hostMutationAllowed: false`

## Next

After the user manually completes the visual matrix and locks the review, follow `DESKTOP_COMMAND_CENTER_HOST_SMOKE_HANDOFF_v0.4.7.md` with a disposable project copy and only the allowlisted read-only actions.
