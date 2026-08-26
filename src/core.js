export function validateBank(bank) {
  const errors = [];
  if (!bank || typeof bank !== 'object' || Array.isArray(bank)) return ['Question bank must be an object.'];
  if (bank.schemaVersion !== 1) errors.push('schemaVersion must be 1.');
  if (!bank.tests || typeof bank.tests !== 'object' || Array.isArray(bank.tests)) return [...errors, 'tests must be an object.'];

  const ids = new Set();
  for (const [testKey, test] of Object.entries(bank.tests)) {
    if (!test || typeof test !== 'object') { errors.push(`${testKey}: test must be an object.`); continue; }
    if (typeof test.title !== 'string' || !test.title.trim()) errors.push(`${testKey}: title is required.`);
    if (!Number.isInteger(test.durationSeconds) || test.durationSeconds < 1 || test.durationSeconds > 7200) errors.push(`${testKey}: durationSeconds must be an integer from 1 to 7200.`);
    if (!Array.isArray(test.questions) || test.questions.length === 0) { errors.push(`${testKey}: questions must be a non-empty array.`); continue; }

    test.questions.forEach((q, index) => {
      const prefix = `${testKey}.questions[${index}]`;
      if (!q || typeof q !== 'object') { errors.push(`${prefix}: question must be an object.`); return; }
      if (typeof q.id !== 'string' || !q.id.trim()) errors.push(`${prefix}: id is required.`);
      else if (ids.has(q.id)) errors.push(`${prefix}: duplicate question id ${q.id}.`);
      else ids.add(q.id);
      if (typeof q.category !== 'string' || !q.category.trim()) errors.push(`${prefix}: category is required.`);
      if (!['easy','medium','hard'].includes(q.difficulty)) errors.push(`${prefix}: difficulty must be easy, medium, or hard.`);
      if (typeof q.prompt !== 'string' || !q.prompt.trim()) errors.push(`${prefix}: prompt is required.`);
      if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.some(c => typeof c !== 'string' || !c.trim())) errors.push(`${prefix}: choices must contain at least two non-empty strings.`);
      if (!Number.isInteger(q.answer) || !Array.isArray(q.choices) || q.answer < 0 || q.answer >= q.choices.length) errors.push(`${prefix}: answer must be a valid zero-based choice index.`);
      if (typeof q.explanation !== 'string' || !q.explanation.trim()) errors.push(`${prefix}: explanation is required.`);
    });
  }
  if (Object.keys(bank.tests).length === 0) errors.push('At least one test is required.');
  return errors;
}

export function scoreTest(test, answers) {
  let correct = 0;
  let answered = 0;
  const categories = new Map();
  const review = test.questions.map((question, index) => {
    const selected = answers[index];
    const isAnswered = Number.isInteger(selected);
    const isCorrect = isAnswered && selected === question.answer;
    if (isAnswered) answered += 1;
    if (isCorrect) correct += 1;
    const category = categories.get(question.category) ?? { correct: 0, total: 0 };
    category.total += 1;
    if (isCorrect) category.correct += 1;
    categories.set(question.category, category);
    return { question, selected, isAnswered, isCorrect };
  });
  return { correct, answered, unanswered: test.questions.length - answered, total: test.questions.length, categories, review };
}

export function formatDuration(seconds) {
  const safe = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}
