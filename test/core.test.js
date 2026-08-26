import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagnostics, formatDuration, scoreTest, validateBank } from '../src/core.js';

function validBank() {
  return {
    schemaVersion: 1,
    tests: {
      sample: {
        title: 'Sample', durationSeconds: 60,
        questions: [
          { id: 'q1', category: 'Numerical', difficulty: 'easy', prompt: '1 + 1?', choices: ['1','2'], answer: 1, explanation: 'One plus one is two.' },
          { id: 'q2', category: 'Verbal', difficulty: 'medium', prompt: 'Opposite of up?', choices: ['Down','Sideways'], answer: 0, explanation: 'Down is the opposite direction.' }
        ]
      }
    }
  };
}

test('validateBank accepts a structurally valid bank', () => {
  assert.deepEqual(validateBank(validBank()), []);
});

test('validateBank accepts a constrained SVG figure', () => {
  const bank = validBank();
  bank.tests.sample.questions[0].figure = { type: 'svg', src: './assets/spatial/rotation-01.svg', alt: 'Reference shape and answer figures.' };
  assert.deepEqual(validateBank(bank), []);
});

test('validateBank rejects figure paths outside the spatial asset directory', () => {
  const bank = validBank();
  bank.tests.sample.questions[0].figure = { type: 'svg', src: 'https://example.com/question.svg', alt: 'Remote figure.' };
  assert.match(validateBank(bank).join(' '), /figure\.src/);
});

test('validateBank requires accessible alternative text for figures', () => {
  const bank = validBank();
  bank.tests.sample.questions[0].figure = { type: 'svg', src: './assets/spatial/rotation-01.svg', alt: '' };
  assert.match(validateBank(bank).join(' '), /figure\.alt is required/);
});

test('validateBank rejects unsupported schema versions', () => {
  const bank = validBank(); bank.schemaVersion = 2;
  assert.match(validateBank(bank).join(' '), /schemaVersion/);
});

test('validateBank rejects duplicate question IDs across tests', () => {
  const bank = validBank();
  bank.tests.other = { title: 'Other', durationSeconds: 30, questions: [{ ...bank.tests.sample.questions[0] }] };
  assert.match(validateBank(bank).join(' '), /duplicate question id q1/);
});

test('validateBank rejects an out-of-range answer index', () => {
  const bank = validBank(); bank.tests.sample.questions[0].answer = 9;
  assert.match(validateBank(bank).join(' '), /answer must be a valid/);
});

test('scoreTest distinguishes correct, incorrect, and unanswered responses', () => {
  const testData = validBank().tests.sample;
  const result = scoreTest(testData, [1, null]);
  assert.equal(result.correct, 1);
  assert.equal(result.answered, 1);
  assert.equal(result.unanswered, 1);
  assert.equal(result.total, 2);
  assert.equal(result.categories.get('Numerical').correct, 1);
  assert.equal(result.categories.get('Verbal').correct, 0);
});

test('scoreTest does not treat string indexes as answered choices', () => {
  const result = scoreTest(validBank().tests.sample, ['1', 0]);
  assert.equal(result.answered, 1);
  assert.equal(result.correct, 1);
});

test('buildDiagnostics computes category timing and correct-versus-missed timing', () => {
  const result = buildDiagnostics(validBank().tests.sample, [1, 1], [12000, 30000]);
  assert.equal(result.correct, 1);
  assert.equal(result.averageCorrectTimeMs, 12000);
  assert.equal(result.averageMissedTimeMs, 30000);
  assert.equal(result.totalRecordedTimeMs, 42000);
  assert.deepEqual(result.categoryRows, [
    { category: 'Numerical', correct: 1, total: 1, accuracy: 1, averageTimeMs: 12000 },
    { category: 'Verbal', correct: 0, total: 1, accuracy: 0, averageTimeMs: 30000 }
  ]);
});

test('buildDiagnostics safely handles missing and invalid timing samples', () => {
  const result = buildDiagnostics(validBank().tests.sample, [1, null], [Number.NaN, -500]);
  assert.equal(result.totalRecordedTimeMs, 0);
  assert.equal(result.averageCorrectTimeMs, null);
  assert.equal(result.averageMissedTimeMs, null);
  assert.equal(result.categoryRows[0].averageTimeMs, 0);
  assert.equal(result.categoryRows[1].averageTimeMs, 0);
});

test('formatDuration formats minutes and seconds and clamps negative values', () => {
  assert.equal(formatDuration(900), '15:00');
  assert.equal(formatDuration(61), '1:01');
  assert.equal(formatDuration(-2), '0:00');
  assert.equal(formatDuration(Number.NaN), '0:00');
});
