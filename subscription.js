/**
 * CareerLens — subscription.js
 * ضعه في <head> أو قبل script.js في كل صفحة (index.html, analyzer.html, pricing.html).
 *
 * وظيفته:
 * 1) عند العودة من صفحة دفع Stripe (?session_id=...)، يتأكد من نجاح الدفع فعليًا
 *    عبر السيرفر (لا نثق بأي شيء في الرابط وحده) ويسجّل البريد كمشترك.
 * 2) يخزّن حالة "Pro" محليًا (24 ساعة) لتفادي استدعاء السيرفر في كل تحميل صفحة.
 * 3) يوفّر window.isCareerLensPro() لتستخدمه script.js قبل تطبيق حد الـ 3/يوم.
 */

'use strict';

window.CareerLensSubscription = (function () {

  const EMAIL_KEY = 'careerlens_pro_email';
  const STATUS_CACHE_KEY = 'careerlens_pro_status_cache'; // { active, checkedAt }
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // إعادة تحقق يومية كافية لهذه المرحلة

  function getCachedStatus() {
    try {
      const raw = localStorage.getItem(STATUS_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (Date.now() - cache.checkedAt > CACHE_TTL_MS) return null;
      return cache.active;
    } catch { return null; }
  }

  function setCachedStatus(active) {
    try {
      localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify({ active, checkedAt: Date.now() }));
    } catch {}
  }

  // يُستخدم من script.js — قيمة متزامنة (Synchronous) من الكاش المحلي فقط
  function isCareerLensPro() {
    return getCachedStatus() === true;
  }

  function getStoredEmail() {
    try { return localStorage.getItem(EMAIL_KEY) || ''; } catch { return ''; }
  }

  function setStoredEmail(email) {
    try { localStorage.setItem(EMAIL_KEY, email); } catch {}
  }

  // إظهار/إخفاء عناصر Pro في الواجهة عبر data attributes:
  //   data-pro-show   ← يظهر فقط للمشتركين
  //   data-pro-hide   ← يختفي للمشتركين (مثل زر "Get Pro")
  function updateUI(active) {
    document.querySelectorAll('[data-pro-show]').forEach(el => { el.hidden = !active; });
    document.querySelectorAll('[data-pro-hide]').forEach(el => { el.hidden = active; });
  }

  // التحقق من السيرفر (يُستدعى مرة يوميًا كحد أقصى بفضل الكاش)
  async function refreshStatus() {
    const email = getStoredEmail();
    if (!email) { updateUI(false); return false; }

    try {
      const res = await fetch(`/api/check-subscription?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setCachedStatus(!!data.active);
      updateUI(!!data.active);
      return !!data.active;
    } catch {
      // في حال فشل الشبكة، نعتمد على آخر حالة معروفة بدل حجب المستخدم فجأة
      const cached = getCachedStatus();
      updateUI(cached === true);
      return cached === true;
    }
  }

  // معالجة العودة من Stripe Payment Link (?session_id=cs_...)
  async function handleReturnFromCheckout() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) return;

    try {
      const res = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (data.active && data.email) {
        setStoredEmail(data.email);
        setCachedStatus(true);
        updateUI(true);
        showWelcomeBanner();
      }
    } catch (err) {
      console.error('Subscription verification failed:', err);
    } finally {
      // تنظيف الرابط حتى لا يبقى session_id ظاهرًا أو يُعاد استخدامه بالخطأ
      params.delete('session_id');
      const clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', clean);
    }
  }

  function showWelcomeBanner() {
    const banner = document.createElement('div');
    banner.textContent = "🎉 You're on CareerLens Pro — unlimited analyses unlocked.";
    banner.style.cssText = `
      position:fixed; top:0; left:0; right:0; z-index:300;
      background:#00D4B4; color:#0B0F1A; font-weight:700;
      text-align:center; padding:10px; font-size:14px;
      font-family:'Space Grotesk',sans-serif;
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 6000);
  }

  // ── تهيئة عند تحميل كل صفحة ────────────────────────────────────────────
  async function init() {
    await handleReturnFromCheckout();

    const cached = getCachedStatus();
    if (cached !== null) {
      updateUI(cached); // عرض فوري بدون انتظار الشبكة
    }
    refreshStatus(); // تحقق في الخلفية (يحدّث الكاش إن تغيّرت الحالة)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { isCareerLensPro, refreshStatus, getStoredEmail };

})();
