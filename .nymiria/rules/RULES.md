# Project Rules

> Managed by Nymiria. The JSON block below is machine-readable; the list below is for human reference.

<!-- nymiria:rules:start -->
[
  {
    "id": "no-ci-without-explicit-approval",
    "priority": "critical",
    "scope": "all-projects",
    "rule": "Do not trigger GitHub Actions usage unless the user explicitly approves that specific run after being asked.",
    "enforcement": [
      "Before any action that can trigger CI minutes (git push to CI-enabled branches, gh workflow run, workflow trigger edits), ask for explicit per-instance approval and wait.",
      "Default to local-only validation and local-only automation.",
      "Do not enable push/pull_request/schedule workflow triggers without explicit approval."
    ]
  }
]
<!-- nymiria:rules:end -->

## Rules

- Do not trigger GitHub Actions usage unless the user explicitly approves that specific run after being asked.
- Before any CI-triggering action (`git push`, `gh workflow run`, or enabling workflow auto-triggers), request explicit per-instance approval and wait.
- Default to local-only validation and local-only automation.
- Do not enable `push`, `pull_request`, or `schedule` workflow triggers without explicit approval.
