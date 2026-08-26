# Contributing

Contributions are welcome, including AI-assisted contributions.

Before contributing, read [`docs/software-engineering-standards.md`](docs/software-engineering-standards.md). The same quality, security, accessibility, testing, and licensing expectations apply regardless of which tools were used to produce a change.

## Question contributions

Question banks are particularly welcome. Please ensure every submitted question:

1. Is original and was not copied, transcribed, memorized, or reconstructed from an actual CCAT administration or proprietary preparation product.
2. Has exactly one defensible best answer.
3. Includes a concise explanation that demonstrates why the keyed answer is correct.
4. Uses plausible distractors without relying on trick wording or accidental ambiguity.
5. Has category and difficulty metadata consistent with the repository schema.
6. Has had its arithmetic, wording, choices, and answer key checked independently.

Do not submit copyrighted or confidential assessment material.

### Spatial-question contributions

Spatial questions may reference repository-owned SVG assets under `assets/spatial/` using the constrained `figure` contract documented in [`docs/question-bank-schema.md`](docs/question-bank-schema.md).

For each spatial question:

- create original geometry rather than tracing or recreating proprietary assessment material;
- keep SVGs static: no scripts, remote resources, event handlers, or embedded external content;
- provide meaningful alternative text;
- derive the keyed candidate from the reference transformation where practical rather than relying on visual approximation;
- independently verify that exactly one candidate satisfies the prompt and that reflections cannot accidentally qualify as rotations;
- keep visual details legible at narrow widths and browser zoom.

## Code contributions

Keep the practice engine data-driven. Adding a new practice set should normally require adding question data and, when needed, repository-owned assets rather than modifying application code.

For behavior changes, add or update tests where practical. Preserve semantic HTML, keyboard operation, visible focus, responsive behavior, useful error handling, and the rule that answers/explanations remain hidden until completion.

Do not expand trusted-content boundaries casually. New asset types, remote resources, executable markup, or broader figure paths require an explicit security/design review rather than merely loosening validation.

## Validation before a pull request

From the repository root, run:

```powershell
npm test
npm run validate:bank
```

For UI or spatial changes, also serve the application with `npx serve .` and manually exercise the affected flow, including keyboard navigation and a narrow viewport.

## Pull requests

Please describe:

- what changed;
- why it changed;
- how you validated it;
- any known limitations or follow-up work.

Small, focused pull requests are easier to review than unrelated bundles of changes.