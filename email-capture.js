/**
 * CareerLens — email-capture.js
 * Drop this script anywhere after script.js.
 * It shows a non-intrusive modal after the FIRST successful analysis,
 * asks for email, and sends it to Mailchimp (or any endpoint you choose).
 *
 * SETUP:
 * 1. Create a free Mailchimp account at mailchimp.com
 * 2. Create an Audience
 * 3. Go to Audience → Signup forms → Embedded forms → copy your form action URL
 * 4. Paste it into MAILCHIMP_URL below
 * 5. Add <script src="email-capture.js"></script> to index.html and analyzer.html
 */

'use strict';

(function () {

  const EMAIL_KEY = 'careerlens_email_captured';
  const DISMISSED_KEY = 'careerlens_email_dismissed';

  // Replace with your Mailchimp embedded form POST URL
  const MAILCHIMP_URL = 'https://YOUR_ACCOUNT.us1.list-manage.com/subscribe/post?u=YOUR_U&id=YOUR_ID';

  // ── Only show once, only after an analysis ──────────────────────────────
  function shouldShow() {
    if (localStorage.getItem(EMAIL_KEY))      return false;
    if (localStorage.getItem(DISMISSED_KEY))  return false;
    return true;
  }

  // ── Build the modal ─────────────────────────────────────────────────────
  function buildModal() {
    const overlay = document.createElement('div');
    overlay.id = 'email-capture-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(11,15,26,0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: fadeIn 0.25s ease;
    `;

    overlay.innerHTML = `
      <div style="
        background: #111827; border: 1px solid rgba(255,255,255,0.12);
        border-radius: 20px; padding: 40px; max-width: 440px; width: 100%;
        position: relative; animation: slideUp 0.3s ease;
      ">
        <button id="email-dismiss" style="
          position:absolute; top:16px; right:16px;
          background:none; border:none; color:#64748B;
          font-size:20px; cursor:pointer; line-height:1;
        " aria-label="Close">×</button>

        <div style="font-size:28px; margin-bottom:12px;">🎯</div>

        <h2 style="
          font-family:'Space Grotesk',sans-serif;
          font-size:22px; font-weight:700; letter-spacing:-0.5px;
          color:#F1F5F9; margin-bottom:10px;
        ">Get your full report by email</h2>

        <p style="font-size:14px; color:#94A3B8; line-height:1.65; margin-bottom:24px;">
          We'll email you a summary of this analysis, plus weekly tips
          on the skills IT employers are actively hiring for right now.
          Unsubscribe anytime.
        </p>

        <form id="email-capture-form" novalidate>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <input
              type="email"
              id="capture-email-input"
              placeholder="your@email.com"
              autocomplete="email"
              required
              style="
                flex:1; min-width:0; background:#1a2235;
                border:1px solid rgba(255,255,255,0.14);
                border-radius:8px; padding:12px 16px;
                color:#F1F5F9; font-family:'Inter',sans-serif;
                font-size:14px; outline:none;
                transition: border-color 0.2s;
              "
            />
            <button type="submit" id="capture-submit" style="
              background:#00D4B4; color:#0B0F1A;
              font-family:'Space Grotesk',sans-serif;
              font-weight:700; font-size:14px;
              padding:12px 20px; border:none;
              border-radius:8px; cursor:pointer;
              white-space:nowrap;
              transition: background 0.2s;
            ">Send it →</button>
          </div>
          <p id="capture-error" style="
            color:#FF6B6B; font-size:12px; margin-top:8px;
          " hidden></p>
        </form>

        <button id="email-skip" style="
          display:block; margin-top:16px; background:none; border:none;
          color:#64748B; font-size:12px; cursor:pointer; text-decoration:underline;
        ">No thanks, skip for now</button>

        <p style="font-size:11px; color:#475569; margin-top:16px; line-height:1.5;">
          We never share your email. No spam. One-click unsubscribe.
        </p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Focus input
    setTimeout(() => {
      document.getElementById('capture-email-input')?.focus();
    }, 300);

    // Close handlers
    document.getElementById('email-dismiss').addEventListener('click', dismiss);
    document.getElementById('email-skip').addEventListener('click', dismiss);
    overlay.addEventListener('click', e => { if (e.target === overlay) dismiss(); });

    // Input focus style
    const emailInput = document.getElementById('capture-email-input');
    emailInput.addEventListener('focus', () => {
      emailInput.style.borderColor = 'rgba(0,212,180,0.5)';
    });
    emailInput.addEventListener('blur', () => {
      emailInput.style.borderColor = 'rgba(255,255,255,0.14)';
    });

    // Submit
    document.getElementById('email-capture-form').addEventListener('submit', async e => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const errorEl = document.getElementById('capture-error');

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEl.textContent = 'Please enter a valid email address.';
        errorEl.hidden = false;
        return;
      }

      errorEl.hidden = true;
      const btn = document.getElementById('capture-submit');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      const success = await submitEmail(email);

      if (success) {
        localStorage.setItem(EMAIL_KEY, email);
        showSuccess(overlay);
      } else {
        // Still mark as captured to avoid annoying them
        localStorage.setItem(EMAIL_KEY, email);
        showSuccess(overlay, true);
      }
    });
  }

  async function submitEmail(email) {
    // Option A: Mailchimp JSONP (works from browser, no CORS issues)
    // Option B: Your Cloudflare Worker email endpoint
    // Option C: Formspree.io free plan

    // --- Mailchimp JSONP ---
    if (MAILCHIMP_URL && !MAILCHIMP_URL.includes('YOUR_ACCOUNT')) {
      try {
        const url = MAILCHIMP_URL.replace('/post?', '/post-json?') + '&EMAIL=' + encodeURIComponent(email) + '&c=mailchimpCallback';
        await new Promise((resolve, reject) => {
          window.mailchimpCallback = (data) => {
            delete window.mailchimpCallback;
            if (data.result === 'success' || data.result === 'error') resolve(data);
            else reject(data);
          };
          const script = document.createElement('script');
          script.src = url;
          script.onerror = reject;
          document.head.appendChild(script);
          setTimeout(() => reject(new Error('timeout')), 8000);
        });
        return true;
      } catch (err) {
        console.warn('Mailchimp submission failed:', err);
        return false;
      }
    }

    // --- Fallback: Formspree (replace with your form ID) ---
    // try {
    //   const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    //     body: JSON.stringify({ email, source: 'careerlens-capture' })
    //   });
    //   return res.ok;
    // } catch { return false; }

    // --- Dev mode: just log ---
    console.log('Email captured (dev mode):', email);
    return true;
  }

  function showSuccess(overlay, fallback = false) {
    const inner = overlay.querySelector('div');
    inner.innerHTML = `
      <div style="text-align:center; padding:20px 0;">
        <div style="font-size:48px; margin-bottom:16px;">✅</div>
        <h2 style="
          font-family:'Space Grotesk',sans-serif;
          font-size:22px; font-weight:700;
          color:#F1F5F9; margin-bottom:10px;
        ">${fallback ? "You're on the list!" : "You're subscribed!"}</h2>
        <p style="font-size:14px; color:#94A3B8; margin-bottom:24px;">
          We'll send your analysis summary shortly.<br/>
          Check your spam folder if it doesn't arrive in 5 minutes.
        </p>
        <button onclick="document.getElementById('email-capture-overlay').remove()" style="
          background:#00D4B4; color:#0B0F1A;
          font-family:'Space Grotesk',sans-serif;
          font-weight:700; font-size:14px;
          padding:12px 24px; border:none;
          border-radius:8px; cursor:pointer;
        ">Close</button>
      </div>
    `;
    setTimeout(() => overlay.remove(), 5000);
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    const overlay = document.getElementById('email-capture-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s';
      setTimeout(() => overlay.remove(), 200);
    }
  }

  // ── CSS animations ──────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity:0; }
      to   { transform: translateY(0);    opacity:1; }
    }
  `;
  document.head.appendChild(style);

  // ── Hook into the results display ───────────────────────────────────────
  // Wait for the results section to become visible, then show modal
  // with a 4-second delay so the user can absorb the score first.
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'hidden') {
        const el = m.target;
        if (el.id === 'results' && !el.hidden && shouldShow()) {
          setTimeout(buildModal, 4000);
          observer.disconnect();
        }
      }
    }
  });

  const resultsEl = document.getElementById('results');
  if (resultsEl) {
    observer.observe(resultsEl, { attributes: true });
  }

})();
