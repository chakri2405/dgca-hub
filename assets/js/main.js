// main.js — updated to fetch question bank from JSON and build quiz

// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Search filtering
const search = document.getElementById('search');
const searchMobile = document.getElementById('search-mobile');
const examList = document.getElementById('exam-list');

function filterExams(value) {
  const q = value.trim().toLowerCase();
  const cards = examList.querySelectorAll('[data-title]');
  cards.forEach(card => {
    const title = card.getAttribute('data-title') || '';
    if (!q || title.includes(q)) card.style.display = '';
    else card.style.display = 'none';
  });
}

if (search) search.addEventListener('input', e => filterExams(e.target.value));
if (searchMobile) searchMobile.addEventListener('input', e => filterExams(e.target.value));

/* QUIZ LOGIC USING FETCHED JSON DATA */

let QUESTION_BANK = {};

async function loadQuestionBank() {
  try {
    const res = await fetch('assets/data/questions.json');
    QUESTION_BANK = await res.json();
  } catch (err) {
    console.error('Failed to load question bank:', err);
  }
}

// Build quiz UI dynamically for topic
function createQuizUI(topicKey) {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';
  const questions = QUESTION_BANK[topicKey] || [];
  if (!questions.length) {
    container.innerHTML = '<p class="text-slate-300">No questions for this topic yet.</p>';
    return;
  }

  questions.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'mb-4 border-b border-slate-700 pb-3';
    div.innerHTML = `
      <p class="font-semibold mb-2 text-yellow-400">${idx + 1}. ${item.q}</p>
      ${item.options.map(opt => `<label class="block cursor-pointer hover:text-yellow-300"><input type="radio" name="q${idx}" value="${opt}" class="mr-2"> ${opt}</label>`).join('')}
      <div id="feedback-${idx}" class="mt-2 text-sm"></div>
    `;
    container.appendChild(div);
  });

  const submitBtn = document.createElement('button');
  submitBtn.className = 'bg-green-500 text-black px-4 py-2 rounded mt-2 font-bold hover:bg-green-600 transition';
  submitBtn.textContent = 'Submit Answers';
  submitBtn.addEventListener('click', () => submitQuiz(questions));
  container.appendChild(submitBtn);

  container.classList.remove('hidden');
  document.getElementById('quiz-result').classList.add('hidden');
}

function submitQuiz(questions) {
  let score = 0;
  questions.forEach((q, idx) => {
    const sel = document.querySelector(`input[name="q${idx}"]:checked`);
    const fb = document.getElementById(`feedback-${idx}`);
    if (sel && sel.value === q.a) {
      score++;
      if (fb) fb.innerHTML = `<span class="text-green-400 font-semibold">Correct</span>`;
    } else {
      if (fb) fb.innerHTML = `<span class="text-rose-400 font-semibold">Wrong — correct: ${q.a}</span>`;
    }
  });
  const resultDiv = document.getElementById('quiz-result');
  resultDiv.innerHTML = `<div class="p-4 rounded bg-slate-800/60 text-yellow-400 font-bold">You scored <strong>${score}</strong> out of <strong>${questions.length}</strong></div>`;
  resultDiv.classList.remove('hidden');
}

// Setup mock test controls after DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadQuestionBank();

  const startBtn = document.getElementById('start-quiz');
  const topicSelect = document.getElementById('topic-select');

  if (startBtn && topicSelect) {
    startBtn.addEventListener('click', () => {
      const topic = topicSelect.value;
      createQuizUI(topic);
    });
  }

  // If on index page, adjust search placeholder
  const topSearch = document.getElementById('search');
  if (topSearch) {
    topSearch.placeholder = 'Search exams... (try "navigation")';
  }
});


