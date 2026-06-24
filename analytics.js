/**
 * CareerLens — analytics.js
 *
 * Lightweight, privacy-respecting analytics module.
 * Two modes:
 *   1. LOCAL MODE  — stores events in localStorage, exports as JSON
 *   2. PLAUSIBLE MODE — sends to Plausible.io (free self-hosted or $9/mo hosted)
 *
 * Plausible is GDPR-compliant by default. No cookies. No consent banner needed.
 * Sign up at: https://plausible.io
 *
 * USAGE:
 * <script src="analytics.js"></script>
 * <!-- Add BEFORE closing </body> in every page -->
 *
 * CareerLensAnalytics.track('analysis_started');
 * CareerLensAnalytics.track('analysis_completed', { score: 72, skills_missing: 4 });
 */

'use strict';

window.CareerLensAnalytics = (function () {

  // ── CONFIG ────────────────────────────────────────────────────────────
  const PLAUSIBLE_DOMAIN = 'careerlens.io'; // replace with your domain
  const USE_PLAUSIBLE = false; // set true after deploying to production
  const LOCAL_KEY = 'careerlens_analytics';
  const SESSION_KEY = 'careerlens_session';

  // ── SESSION ───────────────────────────────────────────────────────────
  function getSession() {
    try {
      let s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!s) {
        s = {
          id: Math.random().toString(36).substring(2, 10),
          started_at: Date.now(),
          page_views: 0,
          analyses_this_session: 0,
          referrer: document.referrer || 'direct',
          landing_page: window.location.pathname
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      }
      return s;
    } catch { return { id: 'anon' }; }
  }

  function updateSession(patch) {
    try {
      const s = getSession();
      Object.assign(s, patch);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {}
  }

  // ── LOCAL STORE ───────────────────────────────────────────────────────
  function storeLocal(event, props) {
    try {
      const events = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      events.push({
        event,
        props,
        url: window.location.pathname,
        timestamp: new Date().toISOString(),
        session: getSession().id
      });
      // Keep last 500 events
      localStorage.setItem(LOCAL_KEY, JSON.stringify(events.slice(-500)));
    } catch {}
  }

  // ── PLAUSIBLE ─────────────────────────────────────────────────────────
  function sendPlausible(event, props) {
    if (typeof window.plausible !== 'function') return;
    window.plausible(event, { props });
  }

  // ── CORE TRACK ────────────────────────────────────────────────────────
  function track(event, props = {}) {
    const enriched = {
      ...props,
      session_id: getSession().id,
    };

    storeLocal(event, enriched);

    if (USE_PLAUSIBLE) {
      sendPlausible(event, enriched);
    }

    if (process?.env?.NODE_ENV !== 'production' || !USE_PLAUSIBLE) {
      console.debug('[CareerLens Analytics]', event, enriched);
    }
  }

  // ── AUTO EVENTS ───────────────────────────────────────────────────────

  // Page view
  function trackPageView() {
    const session = getSession();
    updateSession({ page_views: session.page_views + 1 });
    track('pageview', {
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
      page_views_this_session: session.page_views + 1
    });
  }

  // Scroll depth
  function trackScrollDepth() {
    const depths = [25, 50, 75, 100];
    const fired = new Set();
    window.addEventListener('scroll', () => {
      const pct = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      depths.forEach(d => {
        if (pct >= d && !fired.has(d)) {
          fired.add(d);
          track('scroll_depth', { depth: d });
        }
      });
    }, { passive: true });
  }

  // Time on page
  function trackTimeOnPage() {
    const start = Date.now();
    const milestones = [30, 60, 120, 300]; // seconds
    const fired = new Set();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      milestones.forEach(m => {
        if (elapsed >= m && !fired.has(m)) {
          fired.add(m);
          track('time_on_page', { seconds: m });
        }
      });
      if (elapsed >= 300) clearInterval(interval);
    }, 5000);
  }

  // Click on CTA buttons
  function trackCTAClicks() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-track], .btn-primary, .btn-analyze, .btn-nav');
      if (!el) return;
      const label =
        el.dataset.track ||
        el.textContent.trim().substring(0, 50) ||
        el.id ||
        el.className.split(' ')[0];
      track('cta_click', { label, href: el.href || null });
    });
  }

  // Textarea engagement
  function trackTextareaEngagement() {
    const cvInput = document.getElementById('cv-input');
    const jdInput = document.getElementById('jd-input');
    let cvEngaged = false, jdEngaged = false;

    if (cvInput) {
      cvInput.addEventListener('input', () => {
        if (!cvEngaged && cvInput.value.length > 50) {
          cvEngaged = true;
          track('cv_input_engaged', { chars: cvInput.value.length });
        }
      });
    }

    if (jdInput) {
      jdInput.addEventListener('input', () => {
        if (!jdEngaged && jdInput.value.length > 50) {
          jdEngaged = true;
          track('jd_input_engaged', { chars: jdInput.value.length });
        }
      });
    }
  }

  // ── EXPORT LOCAL DATA ─────────────────────────────────────────────────
  function exportLocalData() {
    try {
      const events = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careerlens-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  // ── FUNNEL SUMMARY ────────────────────────────────────────────────────
  function getFunnelSummary() {
    try {
      const events = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      const counts = {};
      events.forEach(e => { counts[e.event] = (counts[e.event] || 0) + 1; });

      const funnel = {
        pageviews:            counts['pageview']           || 0,
        cv_input_engaged:     counts['cv_input_engaged']   || 0,
        jd_input_engaged:     counts['jd_input_engaged']   || 0,
        analyses_started:     counts['analysis_started']   || 0,
        analyses_completed:   counts['analysis_completed'] || 0,
        cta_clicks:           counts['cta_click']          || 0,
        shares:               counts['share_clicked']      || 0,
        email_captures:       counts['email_captured']     || 0,
      };

      funnel.cv_to_analysis_rate = funnel.cv_input_engaged
        ? Math.round((funnel.analyses_started / funnel.cv_input_engaged) * 100) + '%'
        : 'N/A';

      funnel.start_to_complete_rate = funnel.analyses_started
        ? Math.round((funnel.analyses_completed / funnel.analyses_started) * 100) + '%'
        : 'N/A';

      return funnel;
    } catch { return {}; }
  }

  // ── INIT ──────────────────────────────────────────────────────────────
  function init() {
    // Load Plausible script if enabled
    if (USE_PLAUSIBLE) {
      const script = document.createElement('script');
      script.defer = true;
      script.dataset.domain = PLAUSIBLE_DOMAIN;
      script.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    }

    trackPageView();
    trackScrollDepth();
    trackTimeOnPage();
    trackCTAClicks();
    trackTextareaEngagement();

    // SPA navigation (if you add routing later)
    window.addEventListener('popstate', trackPageView);
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    track,
    exportLocalData,
    getFunnelSummary,
    // Called from script.js
    onAnalysisStarted: () => track('analysis_started'),
    onAnalysisCompleted: (score, missingCount) => {
      updateSession({ analyses_this_session: getSession().analyses_this_session + 1 });
      track('analysis_completed', {
        score,
        missing_skills: missingCount,
        analyses_this_session: getSession().analyses_this_session
      });
    },
    onShareClicked: (score) => track('share_clicked', { score }),
    onUpgradeClicked: (source) => track('upgrade_clicked', { source }),
    onEmailCaptured: () => track('email_captured'),
  };

})();

/*
  HOW TO USE IN script.js
  ─────────────────────────
  Before analyzeBtn click:
    CareerLensAnalytics.onAnalysisStarted();

  After showResults(result):
    CareerLensAnalytics.onAnalysisCompleted(
      result.match_score,
      result.missing_skills?.length || 0
    );

  On share button:
    CareerLensAnalytics.onShareClicked(score);

  CHECK YOUR FUNNEL IN THE BROWSER CONSOLE:
    CareerLensAnalytics.getFunnelSummary()

  EXPORT ALL EVENTS AS JSON:
    CareerLensAnalytics.exportLocalData()
*/
