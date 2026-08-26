# CCAT Practice

An independent, browser-based timed aptitude-practice application built around original CCAT-style questions.

> **Not affiliated with, endorsed by, or sponsored by Criteria Corp.** CCAT is a trademark of its respective owner. This project does not contain or solicit copied proprietary test questions. Question contributions must be original.

## Goals

- Practice under realistic time pressure.
- Keep the practice engine separate from question-bank data.
- Support multiple complete practice tests from one JSON bank.
- Track correctness, unanswered questions, category performance, and timing.
- Keep the implementation understandable, accessible, testable, and dependency-light.

## Running locally

Because the app loads its question bank with `fetch`, serve the repository through a local HTTP server rather than opening `index.html` directly as a `file://` URL.

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Question banks

Practice sets live in `data/questions.json`. The schema is data-driven: a bank contains named tests, and each test contains metadata plus questions. The UI discovers available tests rather than hard-coding a particular number of tests.

Questions include an ID, category, difficulty, prompt, answer choices, correct answer, and explanation. Explanations and correctness are not shown in the practice UI until a test is submitted or time expires.

The data contract is documented in [`docs/question-bank-schema.md`](docs/question-bank-schema.md).

All included questions are original practice material. Do not submit questions copied, memorized/reconstructed, or transcribed from an actual CCAT administration or proprietary preparation product.

## Validation

The project deliberately uses Node's built-in test runner and currently has no runtime or development package dependencies.

With Node.js 20 or later:

```powershell
npm test
npm run validate:bank
```

`npm test` exercises deterministic validation, scoring, and time-formatting behavior. `npm run validate:bank` loads the real question bank and rejects structural problems such as duplicate IDs, invalid answer indexes, missing explanations, or unsupported schema versions.

Structural validation does **not** prove that a question's keyed answer is intellectually correct. Question content should receive an independent second-pass solution review before release.

## Development

Project engineering expectations are documented in [`docs/software-engineering-standards.md`](docs/software-engineering-standards.md). See [`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing changes or question banks.

AI-assisted contributions are welcome. The standard is the resulting software and content: it should be understandable, reviewable, tested where practical, and safe to maintain regardless of which tools helped produce it.

A new valid practice set should normally be a data-only change. The browser application discovers available tests from the bank automatically.

## License

Software source is released under the MIT License. Original question-bank content in this repository is provided for use with the project under the same license unless otherwise noted.
