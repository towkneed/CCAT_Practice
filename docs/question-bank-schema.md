# Question Bank Schema

`data/questions.json` is the data contract between question authors and the practice engine.

## Top level

```json
{
  "schemaVersion": 1,
  "tests": {
    "test1": { "...": "..." }
  }
}
```

- `schemaVersion` — integer. Currently `1`.
- `tests` — object keyed by stable test identifier. Keys are not presented as titles and may be chosen for maintainability.

## Test object

Each test contains:

- `title` — non-empty display name.
- `description` — optional display description.
- `durationSeconds` — integer from 1 through 7200.
- `questions` — non-empty array of question objects.

The application discovers test objects dynamically. Adding a valid test should not require an application-code change.

## Question object

```json
{
  "id": "t1-q01",
  "category": "Numerical",
  "difficulty": "medium",
  "prompt": "Question text",
  "choices": ["Choice A", "Choice B", "Choice C"],
  "answer": 1,
  "explanation": "Why Choice B is correct."
}
```

- `id` — globally unique, non-empty string within the bank. IDs should remain stable once published.
- `category` — non-empty string used in result summaries.
- `difficulty` — exactly `easy`, `medium`, or `hard`.
- `prompt` — non-empty question text.
- `choices` — at least two non-empty strings. The UI supplies A/B/C/etc. labels; do not put those labels in the data.
- `answer` — zero-based integer index into `choices`.
- `explanation` — non-empty explanation shown only after completion.

## Validation

`src/core.js` validates the bank before a test can start. Invalid banks fail closed and produce an actionable load error rather than beginning a partially defined test.

Schema validation is structural, not a substitute for content review. Automated checks cannot determine whether a verbal analogy is genuinely unambiguous or whether a keyed arithmetic answer was reasoned correctly.

## Content rules

Questions must be original. Do not copy, transcribe, memorize/reconstruct, scrape, or solicit questions from an actual CCAT administration or a proprietary preparation product.

Every published question should receive a second-pass content audit that independently solves it from the prompt and choices rather than trusting the existing `answer` field.
