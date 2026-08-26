import { readFile } from 'node:fs/promises';
import { validateBank } from '../src/core.js';

try {
  const text = await readFile(new URL('../data/questions.json', import.meta.url), 'utf8');
  const bank = JSON.parse(text);
  const errors = validateBank(bank);
  if (errors.length) {
    console.error(`Question bank validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    const tests = Object.values(bank.tests);
    const questionCount = tests.reduce((sum, item) => sum + item.questions.length, 0);
    console.log(`Question bank valid: ${tests.length} test(s), ${questionCount} question(s).`);
  }
} catch (error) {
  console.error(`Unable to validate question bank: ${error.message}`);
  process.exitCode = 1;
}
