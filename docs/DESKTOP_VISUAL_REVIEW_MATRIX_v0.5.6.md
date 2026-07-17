# Desktop Visual Review Matrix and Screenshot Checklist

Version: `0.5.8-alpha.0`

This slice locks the visual review gate for Desktop, After Effects, and Premiere Pro before any real host smoke testing. It is a review-only layer: it does not launch AE/PR, execute host actions, or mutate project files.

## Scope

- Contract: `commandCenterVisualReviewMatrix`
- Builder: `buildCommandCenterVisualReviewMatrix()`
- Runtime snapshot keys: `visualReviewMatrixContract`, `visualReviewMatrix`
- Runtime preview method: `previewVisualReviewMatrix()`
- Prototype panel: `#visualReviewMatrixPanel`
- Prototype markers: `data-visual-review-matrix`, `data-visual-review-summary`, `data-visual-review-item`, `data-visual-scorecard`, `data-visual-blocker`
- Smoke: `tests/smoke_desktop_visual_review_matrix.py`

## Screenshot Naming

Pattern:

```text
v0.5.6_{surface}_{theme}_{locale}_{layout}_{width}_{dpi}.png
```

Example:

```text
v0.5.6_after-effects_dark_en-US_compact_320px_125.png
```

## Required Matrix

- `desktop-dark-zh-expanded`
- `desktop-dark-en-collapsed`
- `desktop-light-zh-expanded`
- `desktop-light-en-collapsed`
- `ae-compact-240-dark-zh`
- `ae-compact-320-dark-en`
- `ae-compact-420-light-zh`
- `pr-compact-240-dark-zh`
- `pr-compact-320-dark-en`
- `pr-compact-420-light-zh`

## Scorecard

Minimum score: `85`.

- Theme completeness
- Localization
- Responsive layout
- Component states
- Icons and tooltips
- Accessibility
- Brand consistency
- Loading / error / empty states
- Visual regression self-check

## Blocking Issues

- Unreadable text
- Horizontal overflow
- Missing tooltip
- Question-mark placeholders or mojibake
- Automatic host launch entry
- Real project mutation control

## Safety Flags

- `automaticHostLaunchAllowed: false`
- `realHostSmokeAllowed: false`
- `readOnlyOnly: true`
- `hostMutationAllowed: false`

## Next Step

v0.5.7 should add manual visual sign-off state and a small findings backlog so screenshots can be marked reviewed, blocked, or accepted before real host smoke begins.
