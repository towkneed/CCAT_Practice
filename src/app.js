import { formatDuration, scoreTest, validateBank } from './core.js';

const $ = id => document.getElementById(id);
const ui = {
  setup: $('setup'), test: $('test'), results: $('results'), select: $('test-select'), description: $('test-description'),
  start: $('start-button'), status: $('load-status'), progress: $('progress'), timer: $('timer'), form: $('question-form'),
  question: $('question-text'), choices: $('choices'), previous: $('previous-button'), next: $('next-button'), finish: $('finish-button'),
  score: $('score-summary'), categories: $('category-summary'), review: $('review'), restart: $('restart-button')
};

let bank = null;
let activeTest = null;
let answers = [];
let index = 0;
let deadline = 0;
let timerId = null;
let finished = false;

function setStatus(message, isError = false) {
  ui.status.textContent = message;
  ui.status.style.fontWeight = isError ? '700' : '';
}

async function loadBank() {
  try {
    const response = await fetch('./data/questions.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Question bank request failed with HTTP ${response.status}.`);
    const candidate = await response.json();
    const errors = validateBank(candidate);
    if (errors.length) throw new Error(`Invalid question bank: ${errors.join(' ')}`);
    bank = candidate;
    ui.select.replaceChildren(...Object.entries(bank.tests).map(([key, test]) => {
      const option = document.createElement('option'); option.value = key; option.textContent = `${test.title} — ${test.questions.length} questions`; return option;
    }));
    ui.select.disabled = false; ui.start.disabled = false; updateDescription(); setStatus(`${Object.keys(bank.tests).length} practice sets loaded.`);
  } catch (error) {
    console.error(error); setStatus(`${error.message} Serve this directory through a local web server; do not open the HTML as file://.`, true);
  }
}

function updateDescription() {
  const test = bank?.tests[ui.select.value];
  ui.description.textContent = test ? `${test.description ?? ''} Time limit: ${formatDuration(test.durationSeconds)}.`.trim() : '';
}

function startTest() {
  activeTest = bank.tests[ui.select.value];
  answers = Array(activeTest.questions.length).fill(null); index = 0; finished = false;
  deadline = Date.now() + activeTest.durationSeconds * 1000;
  ui.setup.hidden = true; ui.results.hidden = true; ui.test.hidden = false;
  renderQuestion(); updateTimer();
  clearInterval(timerId); timerId = setInterval(updateTimer, 250);
}

function renderQuestion() {
  const q = activeTest.questions[index];
  ui.progress.textContent = `${index + 1} / ${activeTest.questions.length}`;
  ui.question.textContent = q.prompt;
  ui.choices.replaceChildren(...q.choices.map((choice, choiceIndex) => {
    const label = document.createElement('label'); label.className = 'choice';
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'answer'; input.value = String(choiceIndex); input.checked = answers[index] === choiceIndex;
    input.addEventListener('change', () => { answers[index] = choiceIndex; });
    const text = document.createElement('span'); text.textContent = `${String.fromCharCode(65 + choiceIndex)}) ${choice}`;
    label.append(input, text); return label;
  }));
  ui.previous.disabled = index === 0;
  ui.next.disabled = index === activeTest.questions.length - 1;
  ui.question.focus?.();
}

function updateTimer() {
  if (finished) return;
  const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  ui.timer.textContent = formatDuration(remaining);
  if (remaining <= 0) finishTest('Time expired.');
}

function finishTest(reason = 'Test submitted.') {
  if (finished) return;
  finished = true; clearInterval(timerId); timerId = null;
  const result = scoreTest(activeTest, answers);
  ui.test.hidden = true; ui.results.hidden = false;
  ui.score.textContent = `${reason} ${result.correct} correct of ${result.total}; ${result.answered} answered; ${result.unanswered} unanswered.`;
  const heading = document.createElement('h3'); heading.textContent = 'By category';
  const list = document.createElement('ul');
  for (const [category, value] of result.categories) { const li = document.createElement('li'); li.textContent = `${category}: ${value.correct} / ${value.total}`; list.append(li); }
  ui.categories.replaceChildren(heading, list);
  ui.review.replaceChildren(...result.review.map((item, i) => {
    const article = document.createElement('article'); article.className = 'review-item';
    const h = document.createElement('h4'); h.textContent = `${i + 1}. ${item.question.prompt}`;
    const outcome = document.createElement('p'); outcome.className = item.isCorrect ? 'correct' : '';
    const selectedText = item.isAnswered ? item.question.choices[item.selected] : 'Unanswered';
    outcome.textContent = `${item.isCorrect ? 'Correct' : 'Incorrect'} — your answer: ${selectedText}. Correct answer: ${item.question.choices[item.question.answer]}.`;
    const explanation = document.createElement('p'); explanation.textContent = item.question.explanation;
    article.append(h, outcome, explanation); return article;
  }));
  ui.results.scrollIntoView({ block: 'start' });
}

ui.select.addEventListener('change', updateDescription);
ui.start.addEventListener('click', startTest);
ui.previous.addEventListener('click', () => { if (index > 0) { index -= 1; renderQuestion(); } });
ui.next.addEventListener('click', () => { if (index < activeTest.questions.length - 1) { index += 1; renderQuestion(); } });
ui.finish.addEventListener('click', () => finishTest());
ui.restart.addEventListener('click', () => { ui.results.hidden = true; ui.setup.hidden = false; activeTest = null; answers = []; index = 0; });
window.addEventListener('pagehide', () => clearInterval(timerId));
loadBank();
