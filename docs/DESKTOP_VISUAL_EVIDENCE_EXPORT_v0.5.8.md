# Desktop Pre-host Visual Evidence Export

Version: `0.5.8-alpha.0`

This slice turns the local visual review work into a pre-host evidence draft. It combines the v0.5.6 screenshot matrix, the v0.5.7 manual visual sign-off summary, and the findings backlog into local Markdown / JSON output before any real AE/PR host smoke.

It is still review-only. It does not launch AE/PR, execute host actions, capture real screenshots, or mutate project files.

## Scope

- Contract: `commandCenterVisualEvidenceExport`
- Builder: `buildCommandCenterVisualEvidenceExport()`
- Runtime snapshot keys: `visualEvidenceExportContract`, `visualEvidenceExport`
- Runtime method: `previewVisualEvidenceExport()`
- Prototype panel: `#visualEvidenceExportPanel`
- Prototype markers: `data-visual-evidence-export`, `data-visual-evidence-summary`, `data-visual-evidence-preview`, `data-visual-evidence-copy`
- Prototype actions: `#copyVisualEvidenceButton`, `#exportVisualEvidenceMarkdownButton`, `#exportVisualEvidenceJsonButton`
- Smoke: `tests/smoke_desktop_visual_evidence_export.py`

## Included Evidence

- Export summary: evidence id, generated time, status, source matrix status, source sign-off status.
- Screenshot matrix: surface, theme, locale, layout, expected width, screenshot file name, score, sign-off status, and open finding count.
- Sign-off summary: accepted, blocked, needs recheck, pending, open findings, and resolved findings.
- Findings backlog: finding id, matrix item id, type, severity, status, note, created time, and updated time.
- Safety flags: no automatic host launch, no real host smoke, read-only only, and no host mutation.

## Output Formats

- Markdown: human-readable evidence draft for manual review.
- JSON: structured evidence draft for later handoff, review lock, or session result attachment.

The prototype only triggers browser-side copy / download actions. It does not write generated evidence files automatically.

## UI Behavior

- `#visualEvidenceExportPanel` shows a compact summary and a scrollable read-only preview.
- Copy writes the Markdown draft to the clipboard when the browser allows it.
- Markdown / JSON export creates a local browser download draft.
- Failed copy or export focuses the preview so the reviewer can manually select the text.

## Safety Flags

- `automaticHostLaunchAllowed: false`
- `realHostSmokeAllowed: false`
- `readOnlyOnly: true`
- `hostMutationAllowed: false`

## Next Step

v0.5.9 should add a pre-host visual evidence review lock, recording whether the generated evidence draft has been manually reviewed and whether any blocker remains before moving toward a real host smoke session.
