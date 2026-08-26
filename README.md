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

Questions include an ID, category, prompt, answer choices, correct answer, and explanation. Explanations and correctness are not shown until a test is submitted or time expires.

All included questions are original practice material. Do not submit questions copied or reconstructed from an actual CCAT administration or proprietary preparation product.

## Development

Project engineering expectations are documented in `docs/software-engineering-standards.md`. See `CONTRIBUTING.md` before proposing changes or question banks.

AI-assisted contributions are welcome. The standard is the resulting software and content: it should be understandable, reviewable, tested where practical, and safe to maintain regardless of which tools helped produce it.

## License

Software source is released under the MIT License. Original question-bank content in this repository is provided for use with the project under the same license unless otherwise noted.
