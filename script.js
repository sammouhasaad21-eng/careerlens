/* =============================================
   CareerLens — script.js
   Handles: AI analysis, results rendering,
   tab switching, FAQ accordion, nav, localStorage
   ============================================= */

'use strict';

/* =============================================
   CONFIG
   IMPORTANT: Replace WORKER_URL with your
   Cloudflare Worker URL before deploying.
   For local testing, the mock mode below is used.
   ============================================= */
const CONFIG = {
  WORKER_URL: '/api/analyze',
  FREE_LIMIT: 3,
  STORAGE_KEY: 'careerlens_usage',
  HISTORY_KEY: 'careerlens_history',
  MOCK_MODE: true  // Set to false when you deploy your Worker
};

/* =============================================
   USAGE TRACKING (localStorage)
   ============================================= */
function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

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
  } catch { /* silently fail */ }
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  try {
    const list = getHistory();
    list.unshift(entry);
    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(list.slice(0, 6)));
  } catch { /* silently fail */ }
}

function formatDate(date) {
  return new Date(date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function updateUsageStatus() {
  if (!usageStatusEl) return;
  const used = getUsageCount();
  const remaining = Math.max(0, CONFIG.FREE_LIMIT - used);
  const translation = translate('usage_status', 'You have {remaining} free analyses remaining today.');
  usageStatusEl.textContent = translation.replace('{remaining}', remaining);
}

function renderHistory() {
  if (!historyListEl) return;
  const history = getHistory();
  if (!history.length) {
    historyListEl.innerHTML = `<p>${translate('history_empty', 'No past analysis yet. Your results will appear here.')}</p>`;
    return;
  }

  historyListEl.innerHTML = history.map(item => `
    <div class="history-card">
      <div class="history-meta">
        <span>${formatDate(item.date)}</span>
        <strong>${item.score}%</strong>
      </div>
      <div class="history-snippet">
        <p>${item.role || 'CV analysis'}</p>
      </div>
    </div>
  `).join('');
}

/* =============================================
   DOM REFERENCES
   ============================================= */
const cvInput      = document.getElementById('cv-input');
const jdInput      = document.getElementById('jd-input');
const cvCount      = document.getElementById('cv-count');
const jdCount      = document.getElementById('jd-count');
const analyzeBtn      = document.getElementById('analyze-btn');
const resultsEl       = document.getElementById('results');
const errorSection    = document.getElementById('error-section');
const errorText       = document.getElementById('error-text');
const scoreNumber     = document.getElementById('score-number');
const scoreCircle     = document.getElementById('score-circle');
const scoreExpl       = document.getElementById('score-explanation');
const usageStatusEl   = document.getElementById('usage-status');
const historyListEl   = document.getElementById('history-list');
const shareBtn        = document.getElementById('share-btn');
const newAnalBtn      = document.getElementById('new-analysis-btn');

/* =============================================
   CHARACTER COUNTERS
   ============================================= */
function updateCount(textarea, counter) {
  const n = textarea.value.length;
  counter.textContent = n.toLocaleString() + ' characters';
}

cvInput.addEventListener('input', () => updateCount(cvInput, cvCount));
jdInput.addEventListener('input', () => updateCount(jdInput, jdCount));

/* =============================================
   FAQ ACCORDION
   ============================================= */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* =============================================
   NAV HAMBURGER (mobile)
   ============================================= */
const hamburger = document.getElementById('hamburger');
hamburger && hamburger.addEventListener('click', () => {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;
  const open = nav.style.display === 'flex';
  nav.style.display = open ? '' : 'flex';
  if (!open) {
    Object.assign(nav.style, {
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: '64px',
      left: '0',
      right: '0',
      background: 'var(--navy)',
      padding: '24px',
      borderBottom: '1px solid var(--border)',
      gap: '20px',
      zIndex: '99'
    });
  } else {
    nav.removeAttribute('style');
  }
});

/* =============================================
   SMOOTH SCROLL for nav links
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* =============================================
   RESULT TABS
   ============================================= */
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

/* =============================================
   SCORE RING ANIMATION
   ============================================= */
function animateScore(score) {
  const circumference = 264;
  const offset = circumference - (score / 100) * circumference;
  scoreCircle.style.strokeDashoffset = offset;

  let color = '#22C55E';
  if (score < 50)      color = '#FF6B6B';
  else if (score < 75) color = '#F59E0B';
  scoreCircle.style.stroke = color;

  let current = 0;
  const step = score / 40;
  const interval = setInterval(() => {
    current = Math.min(current + step, score);
    scoreNumber.textContent = Math.round(current) + '%';
    if (current >= score) clearInterval(interval);
  }, 16);
}

/* =============================================
   RENDER RESULTS
   ============================================= */
function renderSkills(skills) {
  const panel = document.getElementById('tab-skills');
  if (!skills || !skills.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:16px 0">No significant skill gaps identified. Your profile is a strong match.</p>';
    return;
  }
  panel.innerHTML = skills.map(s => `
    <div class="skill-item">
      <span class="skill-badge badge-${(s.priority||'medium').toLowerCase()}">${s.priority || 'Medium'}</span>
      <div class="skill-info">
        <h4>${escapeHtml(s.skill)}</h4>
        <p>${escapeHtml(s.why || '')}</p>
      </div>
    </div>
  `).join('');
}

function renderImprovements(improvements) {
  const panel = document.getElementById('tab-improvements');
  if (!improvements || !improvements.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:16px 0">Your CV is already well-structured for this role.</p>';
    return;
  }
  panel.innerHTML = improvements.map(imp => `
    <div class="improvement-item">
      <div class="improvement-section-label">${escapeHtml(imp.section || 'General')}</div>
      <div class="improvement-label before-label">Before</div>
      <div class="improvement-before">${escapeHtml(imp.current || '')}</div>
      <div class="improvement-label after-label">After</div>
      <div class="improvement-after">${escapeHtml(imp.improved || '')}</div>
      <p class="improvement-reason">${escapeHtml(imp.reason || '')}</p>
    </div>
  `).join('');
}

function renderQuestions(questions) {
  const panel = document.getElementById('tab-questions');
  if (!questions || !questions.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:16px 0">No questions generated.</p>';
    return;
  }
  panel.innerHTML = questions.map((q, i) => `
    <div class="question-item">
      <div class="question-num">${i + 1}</div>
      <p>${escapeHtml(q)}</p>
    </div>
  `).join('');
}

function renderRoadmap(roadmap) {
  const panel = document.getElementById('tab-roadmap');
  if (!roadmap || !roadmap.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:16px 0">No learning roadmap — your skills already match well.</p>';
    return;
  }
  panel.innerHTML = roadmap.map(item => `
    <div class="roadmap-item">
      <div class="roadmap-header">
        <span class="roadmap-skill">${escapeHtml(item.skill)}</span>
        <span class="roadmap-weeks">${item.weeks} week${item.weeks > 1 ? 's' : ''}</span>
      </div>
      <ul class="roadmap-resources">
        ${(item.resources || []).map(r => `<li>${escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function renderProjects(projects) {
  const panel = document.getElementById('tab-projects');
  if (!projects || !projects.length) {
    panel.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:16px 0">No portfolio project suggestions.</p>';
    return;
  }
  panel.innerHTML = projects.map((proj, i) => `
    <div class="project-item">
      <h4>Project idea ${i + 1}</h4>
      <p>${escapeHtml(typeof proj === 'string' ? proj : proj.description || JSON.stringify(proj))}</p>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* =============================================
   MOCK DATA (for local testing without a Worker)
   ============================================= */
function getMockResult(cv, jd) {
  // Calculate score based on input length and keyword matches
  const cvWords = cv.toLowerCase().split(/\s+/).length;
  const jdWords = jd.toLowerCase().split(/\s+/).length;
  const baseScore = Math.min(90, Math.floor((Math.min(cvWords, jdWords) / 150) * 100));
  
  // Count keyword matches for skill detection
  const commonKeywords = ['python', 'kubernetes', 'terraform', 'react', 'nodejs', 'aws', 'docker', 'git', 'sql', 'agile', 'devops', 'ci/cd', 'java', 'javascript', 'cloud'];
  let matches = 0;
  commonKeywords.forEach(keyword => {
    if (cv.toLowerCase().includes(keyword) && jd.toLowerCase().includes(keyword)) matches++;
  });
  
  const finalScore = Math.max(25, Math.min(95, baseScore + (matches * 3)));
  
  return {
    match_score: finalScore,
    score_explanation: `Your CV contains ${cvWords} words and shows relevant skills. The job description emphasizes ${jdWords} key points. ${matches > 5 ? 'Strong keyword alignment detected.' : 'Some skill gaps identified.'}`,
    matched_skills: ["Python", "REST APIs", "PostgreSQL", "Git", "Agile"],
    missing_skills: [
      { skill: "Kubernetes", priority: "high", why: "Mentioned 6 times in the job description including in the required qualifications." },
      { skill: "Terraform", priority: "high", why: "Listed as a core requirement: 'must have experience with IaC tools, preferably Terraform'." },
      { skill: "Prometheus / Grafana", priority: "medium", why: "Mentioned twice in the 'nice to have' section for monitoring and observability." },
      { skill: "Go (Golang)", priority: "medium", why: "Secondary language listed in requirements, not strictly required but frequently mentioned." },
      { skill: "ArgoCD", priority: "low", why: "Listed once under 'tools we use' — not a hard requirement but shows you know the ecosystem." }
    ],
    cv_improvements: [
      {
        section: "Work Experience",
        current: "Worked on backend services using Python and helped the team with deployments.",
        improved: "Developed and maintained 3 Python microservices processing 500K+ daily requests; collaborated with DevOps team to streamline CI/CD pipeline, reducing deployment time by 40%.",
        reason: "Quantified impact and specific technologies make the ATS and the hiring manager notice this entry. The original is vague and unmemorable."
      },
      {
        section: "Skills section",
        current: "Databases: MySQL, PostgreSQL",
        improved: "Databases: PostgreSQL (query optimization, indexing, 50M+ row tables), MySQL — add: basic Redis and message queue experience (RabbitMQ)",
        reason: "The job description mentions distributed systems. Showing you understand data at scale and async communication closes a perceived gap."
      }
    ],
    interview_questions: [
      "Walk me through how you would set up a Kubernetes deployment for a stateful Python application that needs to persist data across pod restarts.",
      "Our services are deployed across 3 regions. Describe how you would approach debugging a latency spike that only affects one region intermittently.",
      "You have a Python service that processes events from a Kafka queue. The consumer is falling behind. What are the first 5 things you'd check?",
      "Tell me about a time you improved an existing system's reliability. What was the failure mode, what did you change, and how did you measure improvement?",
      "How would you approach migrating a monolithic Python application to containerized microservices without downtime?"
    ],
    learning_roadmap: [
      {
        skill: "Kubernetes",
        weeks: 4,
        resources: [
          "Kubernetes.io interactive tutorials (free, official, hands-on)",
          "'Kubernetes Up and Running' — Burns, Beda, Hightower (O'Reilly, 3rd ed.)",
          "KodeKloud Kubernetes CKAD practice labs (paid but worth it)"
        ]
      },
      {
        skill: "Terraform",
        weeks: 3,
        resources: [
          "HashiCorp's official Terraform tutorials at developer.hashicorp.com",
          "Build a real AWS/GCP project: VPC + EC2 + RDS with Terraform state in S3",
          "Gruntwork's 'Terraform: Up & Running' book (Yevgeniy Brikman)"
        ]
      },
      {
        skill: "Prometheus + Grafana",
        weeks: 2,
        resources: [
          "Prometheus.io official getting-started guide",
          "Set up a local Docker stack: Prometheus + Grafana + a Python app exposing /metrics",
          "Grafana Labs free courses at grafana.com/tutorials"
        ]
      }
    ],
    portfolio_projects: [
      "Build a containerized Python FastAPI service with Kubernetes deployment manifests (Deployment, Service, HPA), Terraform for the cloud infrastructure, and a Grafana dashboard showing request latency and error rate. Document everything in a README as if onboarding a new team member.",
      "Create a GitOps pipeline: a Python app in GitHub, Terraform for a managed Kubernetes cluster (GKE/EKS free tier), ArgoCD for continuous deployment, and Prometheus/Grafana for monitoring. Write a blog post about what you learned — this is exactly the stack this company uses."
    ],
    overall_advice: "Your backend Python fundamentals are solid and your experience is real — that's 68% of the way there. The missing piece is the cloud-native operations layer: Kubernetes, IaC, and observability. Focus on Kubernetes first because it unblocks everything else. 4 weeks of deliberate practice with the resources above, plus one portfolio project, and you'll be competitive for this exact role. Apply again in 6 weeks."
  };
}

/* =============================================
   MAIN ANALYSIS FUNCTION
   ============================================= */
async function runAnalysis() {
  const cv = cvInput.value.trim();
  const jd = jdInput.value.trim();

  // Validation
  if (cv.length < 100) {
    showError('Your CV seems too short. Please paste your full CV text (at least 100 characters).');
    return;
  }
  if (jd.length < 100) {
    showError('The job description seems too short. Please paste the full job posting.');
    return;
  }

  // Usage limit check
  const used = getUsageCount();
  if (used >= CONFIG.FREE_LIMIT) {
    showError(`You've used your ${CONFIG.FREE_LIMIT} free analyses for today. Come back tomorrow, or upgrade to Pro for unlimited analyses.`);
    return;
  }

  // UI: loading state
  setLoading(true);
  hideError();
  hideResults();

  try {
    let result;

    if (CONFIG.MOCK_MODE) {
      // Local testing: use mock data with a realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      result = getMockResult(cv, jd);
    } else {
      // Production: call your Cloudflare Worker
      const response = await fetch(CONFIG.WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, jd })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${response.status}`);
      }

      result = await response.json();
    }

    // Success: increment usage, save history, and show results
    incrementUsage();
    saveHistory({
      date: new Date().toISOString(),
      score: result.match_score || 0,
      role: result.job_title || 'CV analysis',
      cvSnippet: cv.slice(0, 120),
      jdSnippet: jd.slice(0, 120)
    });
    showResults(result);
    updateUsageStatus();
    renderHistory();

  } catch (err) {
    console.error('Analysis error:', err);
    showError('Analysis failed: ' + (err.message || 'Unknown error. Please try again.'));
  } finally {
    setLoading(false);
  }
}

/* =============================================
   UI STATE HELPERS
   ============================================= */
function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.querySelector('.btn-analyze-text').hidden = isLoading;
  analyzeBtn.querySelector('.btn-analyze-loading').hidden = !isLoading;
}

function showError(msg) {
  errorText.textContent = msg;
  errorSection.hidden = false;
  errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() { errorSection.hidden = true; }

function hideResults() { resultsEl.hidden = true; }

function showResults(data) {
  // Show results container
  resultsEl.hidden = false;

  // Animate score
  const score = Math.max(0, Math.min(100, data.match_score || 0));
  animateScore(score);
  scoreExpl.textContent = data.score_explanation || '';

  // Render all panels
  renderSkills(data.missing_skills);
  renderImprovements(data.cv_improvements);
  renderQuestions(data.interview_questions);
  renderRoadmap(data.learning_roadmap);
  renderProjects(data.portfolio_projects);

  // Reset to first tab
  document.querySelectorAll('.result-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.result-panel').forEach((p, i) => { p.hidden = i !== 0; });

  // Scroll to results
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Store last score for sharing
  analyzeBtn.dataset.lastScore = score;
}

/* =============================================
   SHARE BUTTON
   ============================================= */
shareBtn && shareBtn.addEventListener('click', () => {
  const score = analyzeBtn.dataset.lastScore || '?';
  const text = `I just scored ${score}% match on my target IT role using CareerLens — an AI CV analyzer. It found my skill gaps and gave me a personalized learning roadmap. Try it free: ${window.location.href}`;
  if (navigator.share) {
    navigator.share({ title: 'My CareerLens CV Score', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      shareBtn.textContent = 'Copied to clipboard!';
      setTimeout(() => { shareBtn.textContent = 'Share your score'; }, 2500);
    });
  }
});

/* =============================================
   NEW ANALYSIS BUTTON
   ============================================= */
newAnalBtn && newAnalBtn.addEventListener('click', () => {
  hideResults();
  hideError();
  cvInput.value = '';
  jdInput.value = '';
  updateCount(cvInput, cvCount);
  updateCount(jdInput, jdCount);
  cvInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  cvInput.focus();
});

/* =============================================
   ANALYZE BUTTON
   ============================================= */
analyzeBtn.addEventListener('click', runAnalysis);

updateUsageStatus();
renderHistory();

/* =============================================
   NAV SCROLL EFFECT
   ============================================= */
const nav = document.querySelector('.nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.style.borderBottomColor = y > 10 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)';
  lastScroll = y;
}, { passive: true });

/* =============================================
   CLOUDFLARE WORKER CODE (reference)
   -----------------------------------------------
   Deploy this as a Cloudflare Worker at:
   https://dash.cloudflare.com/ → Workers & Pages

   worker.js:
   -----------------------------------------------
   export default {
     async fetch(request, env) {
       if (request.method === 'OPTIONS') {
         return new Response(null, {
           headers: {
             'Access-Control-Allow-Origin': '*',
             'Access-Control-Allow-Methods': 'POST, OPTIONS',
             'Access-Control-Allow-Headers': 'Content-Type',
           }
         });
       }

       if (request.method !== 'POST') {
         return new Response('Method not allowed', { status: 405 });
       }

       const { cv, jd } = await request.json();

       if (!cv || !jd) {
         return Response.json({ error: 'CV and job description are required' }, { status: 400 });
       }

       const prompt = `You are a senior software engineering hiring manager with 15 years of IT recruitment experience. Analyze the following CV and Job Description for an IT/software role.

   Return ONLY a valid JSON object with this exact structure (no extra text, no markdown):
   {
     "match_score": <integer 0-100>,
     "score_explanation": "<2 sentences explaining the score>",
     "matched_skills": ["<skill>"],
     "missing_skills": [{"skill": "<name>", "priority": "high|medium|low", "why": "<reason it matters>"}],
     "cv_improvements": [{"section": "<CV section>", "current": "<current text>", "improved": "<better version>", "reason": "<why this helps>"}],
     "interview_questions": ["<question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"],
     "learning_roadmap": [{"skill": "<skill>", "weeks": <integer>, "resources": ["<resource 1>", "<resource 2>", "<resource 3>"]}],
     "portfolio_projects": ["<detailed project idea 1>", "<detailed project idea 2>"],
     "overall_advice": "<3 sentence summary and next steps>"
   }

   CV:
   ${cv.substring(0, 4000)}

   Job Description:
   ${jd.substring(0, 3000)}`;

       const response = await fetch('https://api.anthropic.com/v1/messages', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'x-api-key': env.ANTHROPIC_API_KEY,
           'anthropic-version': '2023-06-01'
         },
         body: JSON.stringify({
           model: 'claude-opus-4-6',
           max_tokens: 3000,
           messages: [{ role: 'user', content: prompt }]
         })
       });

       const data = await response.json();
       const text = data.content[0].text;

       let result;
       try {
         result = JSON.parse(text);
       } catch {
         const match = text.match(/\{[\s\S]*\}/);
         result = match ? JSON.parse(match[0]) : { error: 'Failed to parse AI response' };
       }

       return Response.json(result, {
         headers: { 'Access-Control-Allow-Origin': '*' }
       });
     }
   };

   wrangler.toml:
   -----------------------------------------------
   name = "careerlens-worker"
   main = "worker.js"
   compatibility_date = "2024-01-01"

   [vars]
   # Set ANTHROPIC_API_KEY as a secret:
   # npx wrangler secret put ANTHROPIC_API_KEY
   ============================================= */

console.log('%cCareerLens loaded. MOCK_MODE: ' + CONFIG.MOCK_MODE, 'color: #00D4B4; font-weight: bold;');
