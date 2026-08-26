import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, scoreTest, validateBank } from '../src/core.js';

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

test('formatDuration formats minutes and seconds and clamps negative values', () => {
  assert.equal(formatDuration(900), '15:00');
  assert.equal(formatDuration(61), '1:01');
  assert.equal(formatDuration(-2), '0:00');
  assert.equal(formatDuration(Number.NaN), '0:00');
});
