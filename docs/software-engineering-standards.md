# Software Engineering Standards

These standards apply to human and AI-assisted contributions unless a repository-specific decision explicitly overrides them. Deviations should be documented with rationale.

## Core principles

- Prefer simple, maintainable solutions and existing project conventions.
- Preserve separation of concerns and clear module boundaries.
- Keep public contracts backward-compatible where practical; otherwise document migration/versioning.
- Avoid unrelated refactors in focused changes.
- Use descriptive names and comments that explain intent rather than restating code.

## Security and validation

- Never hard-code secrets or environment-specific credentials.
- Centralize configuration rather than scattering magic values.
- Treat files, JSON, URLs, browser state, and user input as trust boundaries: validate before use.
- Fail safely and visibly. Do not broadly swallow exceptions.
- AI-generated code receives the same security, licensing, review, testing, and quality scrutiny as human-written code.

## Accessibility

- Use semantic HTML and native controls whenever possible.
- Preserve keyboard navigation, visible focus, useful labels, and accessibility metadata.
- Do not make hover the only way to discover essential information.
- Maintain sufficient contrast and usable layouts at narrow widths and zoomed text sizes.

## JavaScript and browser behavior

- Keep application logic separate from question-bank data and presentation where practical.
- Prefer deterministic, testable functions for scoring, validation, and timing calculations.
- Timers and state transitions must be idempotent: completion must not score twice or corrupt state.
- Do not expose answer explanations in the rendered practice UI before completion.
- Validate loaded question-bank structure before starting a test and present actionable errors for invalid data.

## Dependencies

- Prefer platform APIs for this small browser application.
- Every dependency must have a clear justification and should be pinned/managed deliberately.
- Do not introduce a framework merely to avoid writing straightforward browser code.

## Documentation

- Document behavior, configuration, contracts, and schema changes under `docs/`.
- Use JSDoc for exported or non-obvious JavaScript APIs.
- Keep README instructions runnable and current.
- Code, comments, documentation, and examples should agree.

## Testing and validation

- Add or update automated tests for deterministic logic and regressions where practical.
- Test narrowly while developing, then run the broader validation suite before merge.
- Never weaken a test simply to make a change pass.
- Exercise keyboard-only use and common responsive layouts for UI changes.
- Preserve useful failure evidence long enough to diagnose problems; do not hide failures behind generic success messages.

## Content integrity

- Practice questions contributed to this repository must be original.
- Do not copy, transcribe, reconstruct, or solicit questions from actual CCAT administrations or proprietary preparation products.
- Questions should have one defensible best answer and a concise explanation.
- Review arithmetic, wording, answer choices, and answer keys independently before release.

## Generated artifacts

- Do not commit generated build output, caches, editor state, temporary files, or local environment artifacts unless the repository intentionally distributes them.
- Generated files that are intentionally versioned must be reproducible and documented.

## Pull requests

A change should explain what changed, why, how it was validated, and any known limitations. Human and AI-assisted contributions are held to the same standard.