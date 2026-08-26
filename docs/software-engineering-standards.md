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
- Prefer narrow allowlists for repository-owned content over permissive URL or markup handling.
- Do not inject question-bank HTML or SVG markup into the DOM when a static asset representation is sufficient.
- AI-generated code receives the same security, licensing, review, testing, and quality scrutiny as human-written code.

## Accessibility

- Use semantic HTML and native controls whenever possible.
- Preserve keyboard navigation, visible focus, useful labels, and accessibility metadata.
- Require meaningful alternative text for question figures.
- Do not make hover the only way to discover essential information.
- Maintain sufficient contrast and usable layouts at narrow widths and zoomed text sizes.

## JavaScript and browser behavior

- Keep application logic separate from question-bank data and presentation where practical.
- Prefer deterministic, testable functions for scoring, validation, diagnostics, and timing calculations.
- Timers and state transitions must be idempotent: completion must not score twice or corrupt state.
- Per-question timing is diagnostic metadata; navigation must account for elapsed time without double-counting visits.
- Do not expose answer explanations in the rendered practice UI before completion.
- Validate loaded question-bank structure before starting a test and present actionable errors for invalid data.
- Render repository-owned figures through non-executable image boundaries unless a reviewed requirement justifies otherwise.

## Dependencies

- Prefer platform APIs for this small browser application.
- Every dependency must have a clear justification and should be pinned/managed deliberately.
- Do not introduce a framework merely to avoid writing straightforward browser code.

## Documentation

- Document behavior, configuration, contracts, and schema changes under `docs/`.
- Use JSDoc for exported or non-obvious JavaScript APIs.
- Keep README instructions runnable and current.
- Code, comments, documentation, and examples should agree.
- Clearly distinguish maintained application paths from retained prototypes or historical artifacts.

## Testing and validation

- Add or update automated tests for deterministic logic and regressions where practical.
- Test narrowly while developing, then run the broader validation suite before merge.
- Never weaken a test simply to make a change pass.
- Exercise keyboard-only use and common responsive layouts for UI changes.
- Validate asset-path constraints and accessibility metadata when adding new figure types.
- Preserve useful failure evidence long enough to diagnose problems; do not hide failures behind generic success messages.

## Content integrity

- Practice questions and visual assets contributed to this repository must be original.
- Do not copy, transcribe, reconstruct, trace, or solicit questions or figures from actual CCAT administrations or proprietary preparation products.
- Questions should have one defensible best answer and a concise explanation.
- Review arithmetic, wording, answer choices, and answer keys independently before release.
- For spatial questions, independently verify transformation direction, marker placement, handedness, and uniqueness of the keyed candidate.
- Where practical, construct a spatial question's correct candidate directly from the reference transformation so correctness is encoded in the asset construction rather than judged only by eye.

## Generated artifacts

- Do not commit generated build output, caches, editor state, temporary files, or local environment artifacts unless the repository intentionally distributes them.
- Generated files that are intentionally versioned must be reproducible and documented.

## Pull requests

A change should explain what changed, why, how it was validated, and any known limitations. Human and AI-assisted contributions are held to the same standard.