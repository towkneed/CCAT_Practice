# Repository Instructions

Read and follow [`../docs/software-engineering-standards.md`](../docs/software-engineering-standards.md) before changing this repository.

Key project rules:

- Keep the browser application independent from individual question sets.
- Treat `data/questions.json` as untrusted input and validate its schema before use.
- New practice tests should normally be data-only additions.
- Never expose answer keys or explanations in the practice UI before test completion.
- Preserve semantic HTML, keyboard accessibility, visible focus, responsive behavior, and actionable errors.
- Prefer browser platform APIs and avoid unnecessary dependencies.
- Add/update automated tests for scoring, validation, timer/state behavior, and regressions where practical.
- Practice questions must be original. Do not reproduce proprietary CCAT or commercial practice-test questions.
- Keep documentation synchronized with behavior and schema changes.
- Do not commit generated artifacts, local caches, editor state, or secrets.

Before considering a change complete, run the narrowest relevant validation and then the full repository validation suite documented in the README.