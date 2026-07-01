/* =============================================
   CareerLens — script.js (نسخة محسّنة)
   إصلاحات: MOCK_MODE=false، URL صحيح، rendering أفضل
   ============================================= */

'use strict';

const CONFIG = {
  WORKER_URL: '/api/analyze',   // Netlify Function عبر redirect
  FREE_LIMIT: 3,
  STORAGE_KEY: 'careerlens_usage',
  MOCK_MODE: false              // ← false دائماً في Production
};

/* ── Usage Tracking ─────────────────────────────────────────────────────── */
function getTodayKey() { return new Date().toISOString().split('T')[0]; }

function getUsageCount() {
  try {
    const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
    return data[getTodayKey()] || 0;
  } catch { return 0; }
}

function incrementUsage() {
  try {
    const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
    data[getTodayKey()] = (data[getTodayKey()] || 0) + 1;
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/* ── DOM References ─────────────────────────────────────────────────────── */
const cvInput      = document.getElementById('cv-input');
const jdInput      = document.getElementById('jd-input');
const cvCount      = document.getElementById('cv-count');
const jdCount      = document.getElementById('jd-count');
const analyzeBtn   = document.getElementById('analyze-btn');
const resultsEl    = document.getElementById('results');
const errorSection = document.getElementById('error-section');
const errorText    = document.getElementById('error-text');
const scoreNumber  = document.getElementById('score-number');
const scoreCircle  = document.getElementById('score-circle');
const scoreExpl    = document.getElementById('score-explanation');
const shareBtn     = document.getElementById('share-btn');
const newAnalBtn   = document.getElementById('new-analysis-btn');

/* ── Character Counters ─────────────────────────────────────────────────── */
function updateCount(textarea, counter) {
  const n = textarea.value.length;
  counter.textContent = n.toLocaleString() + ' chars';
  // بصري: لون مختلف إذا كافي
  counter.style.color = n > 200 ? 'var(--green)' : 'var(--text-3)';
}

cvInput && cvInput.addEventListener('input', () => updateCount(cvInput, cvCount));
jdInput && jdInput.addEventListener('input', () => updateCount(jdInput, jdCount));

/* ── FAQ Accordion ──────────────────────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Nav Hamburger ──────────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
hamburger && hamburger.addEventListener('click', () => {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;
  const open = nav.classList.contains('mobile-open');
  nav.classList.toggle('mobile-open', !open);
  if (!open) {
    Object.assign(nav.style, {
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: '80px', left: '16px', right: '16px',
      background: 'rgba(9,13,26,0.97)', backdropFilter: 'blur(20px)',
      padding: '24px', borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
      gap: '16px', zIndex: '99'
    });
  } else {
    nav.removeAttribute('style');
    nav.classList.remove('mobile-open');
  }
});

/* ── Smooth Scroll ──────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── Result Tabs ────────────────────────────────────────────────────────── */
document.querySelectorAll('.result-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.result-panel').forEach(p => { p.hidden = true; });
    tab.classList.add('active');
    const panel = document.getElementById('tab-' + target);
    if (panel) panel.hidden = false;
  });
});

/* ── Score Ring Animation ───────────────────────────────────────────────── */
function animateScore(score) {
  const circumference = 264;
  const offset = circumference - (score / 100) * circumference;
  if (scoreCircle) scoreCircle.style.strokeDashoffset = offset;

  let current = 0;
  const step = score / 50;
  const interval = setInterval(() => {
    current = Math.min(current + step, score);
    if (scoreNumber) scoreNumber.textContent = Math.round(current) + '%';
    if (current >= score) clearInterval(interval);
  }, 16);
}

/* ── HTML Escape ────────────────────────────────────────────────────────── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Render Results ─────────────────────────────────────────────────────── */
function renderSkills(skills) {
  const panel = document.getElementById('tab-skills');
  if (!panel) return;
  if (!skills || !skills.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:20px 0">✅ No significant skill gaps — your profile matches well!</p>';
    return;
  }
  panel.innerHTML = skills.map(s => `
    <div class="skill-item">
      <span class="skill-badge badge-${(s.priority || 'medium').toLowerCase()}">${esc(s.priority || 'medium')}</span>
      <div class="skill-info">
        <h4>${esc(s.skill)}</h4>
        <p>${esc(s.why || '')}</p>
      </div>
    </div>
  `).join('');
}

function renderImprovements(improvements) {
  const panel = document.getElementById('tab-improvements');
  if (!panel) return;
  if (!improvements || !improvements.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:20px 0">✅ Your CV is well-structured for this role.</p>';
    return;
  }
  panel.innerHTML = improvements.map(imp => `
    <div class="improvement-item">
      <div class="improvement-section-label">${esc(imp.section || 'General')}</div>
      <div class="improvement-label before-label">Before</div>
      <div class="improvement-before">${esc(imp.current || '')}</div>
      <div class="improvement-label after-label">After</div>
      <div class="improvement-after">${esc(imp.improved || '')}</div>
      <p class="improvement-reason">💡 ${esc(imp.reason || '')}</p>
    </div>
  `).join('');
}

function renderQuestions(questions) {
  const panel = document.getElementById('tab-questions');
  if (!panel) return;
  if (!questions || !questions.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:20px 0">No questions generated.</p>';
    return;
  }
  panel.innerHTML = questions.map((q, i) => `
    <div class="question-item">
      <div class="question-num">${i + 1}</div>
      <p>${esc(q)}</p>
    </div>
  `).join('');
}

function renderRoadmap(roadmap) {
  const panel = document.getElementById('tab-roadmap');
  if (!panel) return;
  if (!roadmap || !roadmap.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:20px 0">✅ No learning roadmap needed — your skills already match!</p>';
    return;
  }
  panel.innerHTML = roadmap.map(item => `
    <div class="roadmap-item">
      <div class="roadmap-header">
        <span class="roadmap-skill">${esc(item.skill)}</span>
        <span class="roadmap-weeks">${item.weeks} week${item.weeks > 1 ? 's' : ''}</span>
      </div>
      <ul class="roadmap-resources">
        ${(item.resources || []).map(r => `<li>${esc(r)}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function renderProjects(projects) {
  const panel = document.getElementById('tab-projects');
  if (!panel) return;
  if (!projects || !projects.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:20px 0">No portfolio project suggestions.</p>';
    return;
  }
  panel.innerHTML = projects.map((proj, i) => `
    <div class="project-item">
      <h4>Project idea ${i + 1}</h4>
      <p>${esc(typeof proj === 'string' ? proj : proj.description || JSON.stringify(proj))}</p>
    </div>
  `).join('');
}

/* ── UI State ───────────────────────────────────────────────────────────── */
function setLoading(isLoading) {
  if (!analyzeBtn) return;
  analyzeBtn.disabled = isLoading;
  const textEl    = analyzeBtn.querySelector('.btn-analyze-text');
  const loadingEl = analyzeBtn.querySelector('.btn-analyze-loading');
  if (textEl)    textEl.hidden    = isLoading;
  if (loadingEl) loadingEl.hidden = !isLoading;
}

function showError(msg) {
  if (errorText) errorText.textContent = msg;
  if (errorSection) { errorSection.hidden = false; errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

function hideError()   { if (errorSection) errorSection.hidden = true; }
function hideResults() { if (resultsEl) resultsEl.hidden = true; }

function showResults(data) {
  if (!resultsEl) return;
  resultsEl.hidden = false;

  const score = Math.max(0, Math.min(100, data.match_score || 0));
  animateScore(score);
  if (scoreExpl) scoreExpl.textContent = data.score_explanation || '';

  // Overall advice card
  const adviceCard = document.getElementById('overall-advice-card');
  if (adviceCard && data.overall_advice) {
    adviceCard.innerHTML = `<strong style="color:var(--accent-bright);font-size:11px;letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:8px;">Overall Assessment</strong>${esc(data.overall_advice)}`;
    adviceCard.hidden = false;
  }

  renderSkills(data.missing_skills);
  renderImprovements(data.cv_improvements);
  renderQuestions(data.interview_questions);
  renderRoadmap(data.learning_roadmap);
  renderProjects(data.portfolio_projects);

  // Reset tabs
  document.querySelectorAll('.result-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.result-panel').forEach((p, i) => { p.hidden = i !== 0; });

  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (analyzeBtn) analyzeBtn.dataset.lastScore = score;
}

/* ── Main Analysis ──────────────────────────────────────────────────────── */
async function runAnalysis() {
  const cv = cvInput ? cvInput.value.trim() : '';
  const jd = jdInput ? jdInput.value.trim() : '';

  if (cv.length < 50) { showError('Your CV seems too short. Please paste your full CV text.'); return; }
  if (jd.length < 50) { showError('The job description seems too short. Please paste the full job posting.'); return; }

  const isPro = window.CareerLensSubscription && window.CareerLensSubscription.isCareerLensPro();
  if (!isPro && getUsageCount() >= CONFIG.FREE_LIMIT) {
    showError(`You've used your ${CONFIG.FREE_LIMIT} free analyses for today. Come back tomorrow or upgrade to Pro.`);
    return;
  }

  setLoading(true);
  hideError();
  hideResults();

  try {
    const response = await fetch(CONFIG.WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv, jd })
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('Server returned an invalid response. Please try again.');
    }

    if (!response.ok) {
      throw new Error(result.error || `Server error: ${response.status}`);
    }

    incrementUsage();
    showResults(result);

  } catch (err) {
    console.error('Analysis error:', err);
    showError(err.message || 'Analysis failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

/* ── Share Button ───────────────────────────────────────────────────────── */
shareBtn && shareBtn.addEventListener('click', () => {
  const score = analyzeBtn ? (analyzeBtn.dataset.lastScore || '?') : '?';
  const text = `I just scored ${score}% match on my target IT role using CareerLens — an AI CV analyzer. It found my skill gaps and gave me a personalized learning roadmap. Try it free: ${window.location.origin}`;
  if (navigator.share) {
    navigator.share({ title: 'My CareerLens CV Score', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      if (shareBtn) {
        shareBtn.textContent = 'Copied! ✓';
        setTimeout(() => { shareBtn.textContent = 'Share your score'; }, 2500);
      }
    });
  }
});

/* ── New Analysis Button ────────────────────────────────────────────────── */
newAnalBtn && newAnalBtn.addEventListener('click', () => {
  hideResults();
  hideError();
  if (cvInput) cvInput.value = '';
  if (jdInput) jdInput.value = '';
  if (cvCount) { cvCount.textContent = '0 chars'; cvCount.style.color = ''; }
  if (jdCount) { jdCount.textContent = '0 chars'; jdCount.style.color = ''; }
  cvInput && cvInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  cvInput && cvInput.focus();
});

/* ── Analyze Button ─────────────────────────────────────────────────────── */
analyzeBtn && analyzeBtn.addEventListener('click', runAnalysis);

/* ── Keyboard Shortcut Ctrl+Enter ───────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runAnalysis();
  }
});

/* ── Nav scroll effect ──────────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (nav) nav.style.opacity = window.scrollY > 10 ? '1' : '1';
}, { passive: true });

// Expose needed functions globally for other scripts
window.showResults = showResults;
window.showError = showError;
window.hideError = hideError;
window.hideResults = hideResults;
window.setLoading = setLoading;
window.getUsageCount = getUsageCount;
window.incrementUsage = incrementUsage;
window.CONFIG = CONFIG;
window.escapeHtml = esc;
window.getMockResult = null; // disabled — always use real API
