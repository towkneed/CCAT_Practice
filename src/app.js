import { buildDiagnostics, formatDuration, validateBank } from './core.js';

const $ = id => document.getElementById(id);
const ui = {
  setup: $('setup'), test: $('test'), results: $('results'), select: $('test-select'), description: $('test-description'),
  start: $('start-button'), status: $('load-status'), progress: $('progress'), timer: $('timer'), form: $('question-form'),
  question: $('question-text'), figure: $('question-figure'), choices: $('choices'), previous: $('previous-button'), next: $('next-button'), finish: $('finish-button'),
  score: $('score-summary'), categories: $('category-summary'), review: $('review'), restart: $('restart-button'),
  composition: $('composition-report'), insights: $('performance-insights')
};

let bank = null;
let activeTest = null;
let answers = [];
let questionTimes = [];
let index = 0;
let deadline = 0;
let timerId = null;
let finished = false;
let questionEnteredAt = 0;

function setStatus(message, isError = false) { ui.status.textContent = message; ui.status.style.fontWeight = isError ? '700' : ''; }

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
  } catch (error) { console.error(error); setStatus(`${error.message} Serve this directory through a local web server; do not open the HTML as file://.`, true); }
}

function updateDescription() {
  const test = bank?.tests[ui.select.value];
  ui.description.textContent = test ? `${test.description ?? ''} Time limit: ${formatDuration(test.durationSeconds)}.`.trim() : '';
}

function startTest() {
  activeTest = bank.tests[ui.select.value];
  answers = Array(activeTest.questions.length).fill(null);
  questionTimes = Array(activeTest.questions.length).fill(0);
  index = 0; finished = false; deadline = Date.now() + activeTest.durationSeconds * 1000;
  ui.setup.hidden = true; ui.results.hidden = true; ui.test.hidden = false;
  questionEnteredAt = performance.now(); renderQuestion(); updateTimer();
  clearInterval(timerId); timerId = setInterval(updateTimer, 250);
}

function recordQuestionTime() {
  if (!activeTest || finished || !questionEnteredAt) return;
  questionTimes[index] += Math.max(0, performance.now() - questionEnteredAt);
  questionEnteredAt = performance.now();
}

function moveTo(nextIndex) { recordQuestionTime(); index = nextIndex; renderQuestion(); }

function renderFigure(container, figure) {
  container.replaceChildren();
  if (!figure) { container.hidden = true; return; }
  const image = document.createElement('img');
  image.src = figure.src; image.alt = figure.alt; image.className = 'question-figure-image';
  container.append(image); container.hidden = false;
}

function renderQuestion() {
  questionEnteredAt = performance.now();
  const q = activeTest.questions[index];
  ui.progress.textContent = `${index + 1} / ${activeTest.questions.length}`;
  ui.question.textContent = q.prompt; renderFigure(ui.figure, q.figure);
  ui.choices.replaceChildren(...q.choices.map((choice, choiceIndex) => {
    const label = document.createElement('label'); label.className = 'choice';
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'answer'; input.value = String(choiceIndex); input.checked = answers[index] === choiceIndex;
    input.addEventListener('change', () => { answers[index] = choiceIndex; });
    const text = document.createElement('span'); text.textContent = `${String.fromCharCode(65 + choiceIndex)}) ${choice}`;
    label.append(input, text); return label;
  }));
  ui.previous.disabled = index === 0; ui.next.disabled = index === activeTest.questions.length - 1;
}

function updateTimer() {
  if (finished) return;
  const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  ui.timer.textContent = formatDuration(remaining);
  if (remaining <= 0) finishTest('Time expired.');
}

function seconds(ms) { return Math.round(ms / 1000); }
function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

function renderDiagnostics(result) {
  const compositionHeading = document.createElement('h3'); compositionHeading.textContent = 'Test composition';
  const table = document.createElement('table'); table.className = 'report-table';
  table.innerHTML = '<thead><tr><th>Type</th><th>Questions</th><th>Correct</th><th>Accuracy</th><th>Avg time</th></tr></thead>';
  const body = document.createElement('tbody');
  result.categoryRows.forEach(stat => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${stat.category}</td><td>${stat.total}</td><td>${stat.correct}</td><td>${pct(stat.correct, stat.total)}%</td><td>${formatDuration(seconds(stat.averageTimeMs))}</td>`;
    body.append(row);
  });
  table.append(body); ui.composition.replaceChildren(compositionHeading, table);

  const heading = document.createElement('h3'); heading.textContent = 'What this score shows';
  const overall = document.createElement('p'); overall.textContent = `${pct(result.correct, result.total)}% overall accuracy. ${result.unanswered ? `${result.unanswered} question${result.unanswered === 1 ? '' : 's'} went unanswered.` : 'Every question received an answer.'}`;
  const strengthsHeading = document.createElement('h4'); strengthsHeading.textContent = 'Strengths';
  const strengths = document.createElement('ul');
  const improvementsHeading = document.createElement('h4'); improvementsHeading.textContent = 'Areas to improve';
  const improvements = document.createElement('ul');
  result.categoryRows.forEach(stat => {
    const accuracy = pct(stat.correct, stat.total);
    const item = document.createElement('li'); item.textContent = `${stat.category}: ${accuracy}% accuracy, average ${formatDuration(seconds(stat.averageTimeMs))} per question.`;
    (accuracy >= 85 ? strengths : improvements).append(item);
  });
  if (!strengths.children.length) { const li = document.createElement('li'); li.textContent = 'No category crossed the 85% accuracy threshold on this run; use the category data below to target practice.'; strengths.append(li); }
  if (!improvements.children.length) { const li = document.createElement('li'); li.textContent = 'No category fell below 85% accuracy on this run. Focus next on maintaining accuracy while increasing pace.'; improvements.append(li); }

  const timingHeading = document.createElement('h4'); timingHeading.textContent = 'Timing';
  const timing = document.createElement('ul');
  const timingItems = [`Total recorded question time: ${formatDuration(seconds(result.totalRecordedTimeMs))}.`, `Average per question: ${formatDuration(seconds(result.totalRecordedTimeMs / result.total))}.`, `Average on correct: ${result.averageCorrectTimeMs === null ? 'n/a' : formatDuration(seconds(result.averageCorrectTimeMs))}.`];
  if (result.averageMissedTimeMs !== null) timingItems.push(`Average on incorrect answers: ${formatDuration(seconds(result.averageMissedTimeMs))}.`);
  timingItems.forEach(text => { const li = document.createElement('li'); li.textContent = text; timing.append(li); });
  ui.insights.replaceChildren(heading, overall, strengthsHeading, strengths, improvementsHeading, improvements, timingHeading, timing);
}

function finishTest(reason = 'Test submitted.') {
  if (finished) return;
  recordQuestionTime(); finished = true; clearInterval(timerId); timerId = null;
  const result = buildDiagnostics(activeTest, answers, questionTimes);
  ui.test.hidden = true; ui.results.hidden = false;
  ui.score.textContent = `${reason} ${result.correct} correct of ${result.total}; ${result.answered} answered; ${result.unanswered} unanswered.`;
  const heading = document.createElement('h3'); heading.textContent = 'By category';
  const list = document.createElement('ul');
  for (const [category, value] of result.categories) { const li = document.createElement('li'); li.textContent = `${category}: ${value.correct} / ${value.total}`; list.append(li); }
  ui.categories.replaceChildren(heading, list); renderDiagnostics(result);
  ui.review.replaceChildren(...result.review.map((item, i) => {
    const article = document.createElement('article'); article.className = 'review-item';
    const h = document.createElement('h4'); h.textContent = `${i + 1}. ${item.question.prompt}`;
    const figure = document.createElement('div'); figure.className = 'review-figure'; renderFigure(figure, item.question.figure);
    const meta = document.createElement('p'); meta.className = 'review-meta'; meta.textContent = `Type: ${item.question.category} · Time taken: ${formatDuration(seconds(questionTimes[i]))} · Difficulty: ${item.question.difficulty}`;
    const outcome = document.createElement('p'); outcome.className = item.isCorrect ? 'correct' : '';
    const selectedText = item.isAnswered ? item.question.choices[item.selected] : 'Unanswered';
    outcome.textContent = `${item.isCorrect ? 'Correct' : 'Incorrect'} — your answer: ${selectedText}. Correct answer: ${item.question.choices[item.question.answer]}.`;
    const explanation = document.createElement('p'); explanation.textContent = item.question.explanation;
    article.append(h); if (item.question.figure) article.append(figure); article.append(meta, outcome, explanation); return article;
  }));
  ui.results.scrollIntoView({ block: 'start' });
}

ui.select.addEventListener('change', updateDescription);
ui.start.addEventListener('click', startTest);
ui.previous.addEventListener('click', () => { if (index > 0) moveTo(index - 1); });
ui.next.addEventListener('click', () => { if (index < activeTest.questions.length - 1) moveTo(index + 1); });
ui.finish.addEventListener('click', () => finishTest());
ui.restart.addEventListener('click', () => { ui.results.hidden = true; ui.setup.hidden = false; activeTest = null; answers = []; questionTimes = []; index = 0; });
window.addEventListener('pagehide', () => clearInterval(timerId));
loadBank();
