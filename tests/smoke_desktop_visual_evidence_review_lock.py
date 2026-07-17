from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(relative_path):
    return (ROOT / relative_path).read_text(encoding="utf-8")


def main():
    command_center = read("apps/desktop/src/command-center.js")
    runtime = read("apps/desktop/src/command-center-runtime.js")
    prototype = read("apps/desktop/prototype/prototype.js")
    index = read("apps/desktop/prototype/index.html")
    desktop_css = read("apps/desktop/prototype/styles.css")
    next_steps = read("docs/NEXT_STEPS_v3.md")
    readme = read("README.md")

    for needle in [
        "commandCenterVisualEvidenceReviewLock",
        "buildCommandCenterVisualEvidenceReviewLock",
        'displayMode: "pre-host-visual-evidence-review-lock"',
        "reviewedBy",
        "reviewNote",
        "lockedAt",
        "openBlockerCount",
        "realHostSmokeAllowed: false",
        "hostMutationAllowed: false",
    ]:
        assert needle in command_center, needle

    for needle in [
        "commandCenterVisualEvidenceReviewLockSmoke",
        'snapshotKey: "visualEvidenceReviewLockContract"',
        'viewModelKey: "visualEvidenceReviewLock"',
        "previewVisualEvidenceReviewLock",
        "updateVisualEvidenceReviewLock",
        "visualEvidenceReviewLockContract",
        "automaticHostLaunchAllowed: false",
        "realHostSmokeAllowed: false",
    ]:
        assert needle in runtime, needle

    for needle in [
        'id="visualEvidenceReviewLockPanel"',
        "data-visual-evidence-review-lock",
        'id="visualEvidenceReviewer"',
        'id="visualEvidenceReviewNote"',
        'id="lockVisualEvidenceButton"',
        'id="unlockVisualEvidenceButton"',
        'id="visualEvidenceReviewLockSummary"',
        "commandCenter.sections.visualEvidenceReviewLock",
    ]:
        assert needle in index, needle

    for needle in [
        'const visualEvidenceReviewLockStorageKey = "kuroii.motionai.commandCenter.visualEvidenceReviewLock.v1"',
        "function readPersistedVisualEvidenceReviewLock",
        "function buildPrototypeVisualEvidenceReviewLock",
        "function renderVisualEvidenceReviewLock",
        "function lockVisualEvidenceReview",
        "function unlockVisualEvidenceReview",
        "renderVisualEvidenceReviewLock();",
        'el("lockVisualEvidenceButton").addEventListener("click", lockVisualEvidenceReview)',
        "commandCenter.visualEvidenceReviewLock.locked",
    ]:
        assert needle in prototype, needle

    for needle in [
        ".visualEvidenceReviewLockPanel",
        ".visualEvidenceReviewLockSummary",
        ".visualEvidenceReviewLockFields",
        ".visualEvidenceReviewLockStatus",
        "@media (max-width: 520px)",
    ]:
        assert needle in desktop_css, needle

    assert "v0.5.9 Pre-host Visual Evidence Review Lock" in next_steps
    assert "0.5.9-alpha.0" in readme
    print("[OK] Desktop visual evidence review lock smoke test passed")


if __name__ == "__main__":
    main()
