// HPP pixel enhancements
// - Own visitor pixel: POST every pageview to CRM /api/webhooks/visitor
// - Meta Advanced Matching: hash email/phone/zip/first/last on blur, re-init fbq
// - Form-abandoner webhook: POST valid email/phone to CRM on blur
// - Click-to-call tracking (tel: link taps -> CRM)
// - Exit-intent SMS opt-in modal
// Included via <script src="/pixel-enhancements.js" defer></script> in <head>
(function () {
  var BRAND = 'hpp';
  var META_PIXEL = '1782159502364871';
  var CRM_HOST = 'https://patagon-crm.onrender.com';
  var CRM = CRM_HOST + '/api/webhooks/lead-partial';
  var CRM_VISITOR = CRM_HOST + '/api/webhooks/visitor';
  var FP_KEY = 'hpp_fp';

  var BRAND_COLORS = {
    primary: '#0c1a2e',
    accent: '#f59e0b',
    accentHover: '#d97706',
    text: '#1e293b'
  };

  function inferInterest() {
    var p = (location.pathname || '').toLowerCase();
    if (p.indexOf('roof') >= 0) return 'roof';
    if (p.indexOf('hvac') >= 0) return 'hvac';
    if (p.indexOf('estimator') >= 0 || p.indexOf('calculator') >= 0) return 'estimator';
    if (p.indexOf('catalog') >= 0) return 'catalog';
    if (p.indexOf('kitchen') >= 0) return 'kitchen';
    if (p.indexOf('bathroom') >= 0) return 'bathroom';
    if (p.indexOf('landscaping') >= 0) return 'landscaping';
    if (p.indexOf('electrical') >= 0) return 'electrical';
    if (p.indexOf('remodeling') >= 0) return 'remodeling';
    if (p.indexOf('qualify') >= 0) return 'qualify';
    if (p.indexOf('quote') >= 0) return 'quote';
    return 'general';
  }
  var INTEREST = inferInterest();
  var LANG = (document.documentElement.getAttribute('lang') || 'en').toLowerCase().slice(0, 2);
  var IS_ES = LANG === 'es';

  var fp = localStorage.getItem(FP_KEY);
  if (!fp) {
    fp = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now() + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem(FP_KEY, fp);
  }

  var userData = {};
  var sent = {};
  var PAGE_LOAD_AT = Date.now();

  function qs(k) {
    try { return new URLSearchParams(location.search).get(k) || undefined; } catch (e) { return undefined; }
  }

  function getCookie(name) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\\/+^]/g, '\\$&') + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : undefined;
    } catch (e) { return undefined; }
  }

  function buildAttribution() {
    return {
      landing_page: location.pathname,
      utm_source: qs('utm_source'),
      utm_medium: qs('utm_medium'),
      utm_campaign: qs('utm_campaign'),
      utm_content: qs('utm_content'),
      utm_term: qs('utm_term'),
      fbclid: qs('fbclid'),
      gclid: qs('gclid'),
      fingerprint: fp,
      brand: BRAND,
      interest: INTEREST,
      timestamp: new Date().toISOString()
    };
  }

  function postPartial(extra, useBeacon) {
    var body = buildAttribution();
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k];
    var payload = JSON.stringify(body);
    try {
      if (useBeacon && navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(CRM, blob);
        return;
      }
      fetch(CRM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
        mode: 'cors'
      }).catch(function () {});
    } catch (_) {}
  }

  try {
    var visitorBody = {
      fingerprint_id: fp,
      brand: BRAND,
      landing_page: location.pathname,
      referrer_domain: (function () {
        try { return document.referrer ? new URL(document.referrer).hostname : undefined; } catch (e) { return undefined; }
      })(),
      utm_source: qs('utm_source'), utm_medium: qs('utm_medium'),
      utm_campaign: qs('utm_campaign'), utm_content: qs('utm_content'), utm_term: qs('utm_term'),
      fbclid: qs('fbclid'), gclid: qs('gclid'),
      fbc: getCookie('_fbc'), fbp: getCookie('_fbp')
    };
    fetch(CRM_VISITOR, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorBody), keepalive: true, mode: 'cors'
    }).catch(function () {});
  } catch (_) {}

  async function sha256(s) {
    var b = new TextEncoder().encode(s);
    var h = await crypto.subtle.digest('SHA-256', b);
    return Array.from(new Uint8Array(h)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  async function onBlur(e) {
    var t = e.target;
    if (!t || t.tagName !== 'INPUT') return;
    var type = (t.type || '').toLowerCase();
    var nm = (t.name || t.id || '').toLowerCase();
    var v = t.value || '';
    if (!v) return;

    var email = null, phone = null, changed = false;
    if (type === 'email' || nm.indexOf('email') >= 0) {
      var em = v.trim().toLowerCase();
      if (emailRe.test(em)) { userData.em = await sha256(em); email = em; changed = true; }
    } else if (type === 'tel' || nm.indexOf('phone') >= 0 || nm.indexOf('tel') >= 0) {
      var p = (v || '').replace(/\D/g, '');
      if (p.length === 10) p = '1' + p;
      if (p.length >= 11) { userData.ph = await sha256(p); phone = p; changed = true; }
    } else if (nm.indexOf('zip') >= 0 || nm.indexOf('postal') >= 0) {
      var z = v.trim().toLowerCase().slice(0, 5);
      if (z) { userData.zp = await sha256(z); changed = true; }
    } else if (nm.indexOf('first') >= 0) {
      var fn = v.trim().toLowerCase();
      if (fn) { userData.fn = await sha256(fn); changed = true; }
    } else if (nm.indexOf('last') >= 0) {
      var ln = v.trim().toLowerCase();
      if (ln) { userData.ln = await sha256(ln); changed = true; }
    }

    if (changed && typeof fbq === 'function') {
      try { fbq('init', META_PIXEL, userData); fbq('track', 'PageView'); } catch (_) {}
    }

    if (email || phone) {
      var k = (email || '') + '|' + (phone || '');
      var last = sent[k] || 0;
      if (Date.now() - last < 10000) return;
      sent[k] = Date.now();
      postPartial({ email: email || undefined, phone: phone || undefined, source: 'form_abandon' }, false);
    }
  }
  document.addEventListener('blur', onBlur, true);

  document.addEventListener('submit', function () {
    try { localStorage.setItem('form_submitted', '1'); } catch (_) {}
  }, true);

  // Click-to-call
  var callSent = {};
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (!a) return;
    var raw = (a.getAttribute('href') || '').replace(/^tel:/i, '');
    var digits = raw.replace(/\D/g, '');
    if (digits.length === 10) digits = '1' + digits;
    if (digits.length < 11) return;
    var now = Date.now();
    if (callSent[digits] && now - callSent[digits] < 30000) return;
    callSent[digits] = now;
    postPartial({ phone: digits, source: 'click_to_call' }, true);
    return true;
  }, true);

  // Exit-intent modal
  var COPY = IS_ES ? {
    heading: '¡Espera! Envíame una copia de mi estimado',
    sub: 'Te enviamos un SMS con tu estimado y próximos pasos. Sin spam.',
    placeholder: 'Tu número de teléfono',
    submit: 'Enviarmelo',
    close: 'Cerrar',
    thanks: '¡Listo! Te enviaremos el estimado en breve.',
    invalid: 'Ingresa un número válido de 10 dígitos.'
  } : {
    heading: 'Wait! Text me a copy of my estimate',
    sub: 'We\'ll text your estimate and next steps. No spam.',
    placeholder: 'Your phone number',
    submit: 'Text it to me',
    close: 'Close',
    thanks: 'Got it! Your estimate is on the way.',
    invalid: 'Please enter a valid 10-digit phone number.'
  };

  function injectModalStyles() {
    if (document.getElementById('exit-intent-styles')) return;
    var css = ''
      + '.exit-overlay{position:fixed;inset:0;background:rgba(12,26,46,.72);z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;animation:exitFade .25s ease}'
      + '.exit-modal{background:#fff;border-radius:14px;max-width:420px;width:100%;padding:28px 24px 24px;box-shadow:0 20px 60px rgba(0,0,0,.35);position:relative;animation:exitPop .3s cubic-bezier(.2,.9,.3,1.2);font-family:Inter,-apple-system,sans-serif;color:' + BRAND_COLORS.text + '}'
      + '.exit-close{position:absolute;top:10px;right:12px;background:none;border:0;font-size:22px;line-height:1;cursor:pointer;color:#94a3b8;width:32px;height:32px;border-radius:6px}'
      + '.exit-close:hover{background:#f1f5f9;color:' + BRAND_COLORS.primary + '}'
      + '.exit-modal h2{margin:0 0 8px;font-size:20px;font-weight:800;color:' + BRAND_COLORS.primary + ';line-height:1.25}'
      + '.exit-modal p{margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.5}'
      + '.exit-modal input{width:100%;padding:12px 14px;font-size:16px;border:2px solid #e2e8f0;border-radius:8px;outline:none;box-sizing:border-box;font-family:inherit}'
      + '.exit-modal input:focus{border-color:' + BRAND_COLORS.accent + '}'
      + '.exit-modal button.exit-submit{width:100%;margin-top:12px;padding:13px;background:' + BRAND_COLORS.accent + ';color:' + BRAND_COLORS.primary + ';border:0;border-radius:8px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit}'
      + '.exit-modal button.exit-submit:hover{background:' + BRAND_COLORS.accentHover + '}'
      + '.exit-modal button.exit-submit:disabled{opacity:.6;cursor:wait}'
      + '.exit-msg{margin-top:10px;font-size:13px;min-height:18px}'
      + '.exit-msg.err{color:#dc2626}.exit-msg.ok{color:#059669}'
      + '@keyframes exitFade{from{opacity:0}to{opacity:1}}'
      + '@keyframes exitPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:none}}';
    var s = document.createElement('style');
    s.id = 'exit-intent-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var shown = false;
  function shouldSuppress() {
    try {
      if (localStorage.getItem('exit_popup_shown') === '1') return true;
      if (localStorage.getItem('form_submitted') === '1') return true;
    } catch (_) {}
    if (Date.now() - PAGE_LOAD_AT < 20000) return true;
    return shown;
  }

  function showExitModal() {
    if (shouldSuppress()) return;
    shown = true;
    try { localStorage.setItem('exit_popup_shown', '1'); } catch (_) {}
    injectModalStyles();

    var overlay = document.createElement('div');
    overlay.className = 'exit-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'exit-h');
    overlay.setAttribute('aria-describedby', 'exit-d');
    overlay.innerHTML = ''
      + '<div class="exit-modal">'
      +   '<button class="exit-close" aria-label="' + COPY.close + '" type="button">&times;</button>'
      +   '<h2 id="exit-h">' + COPY.heading + '</h2>'
      +   '<p id="exit-d">' + COPY.sub + '</p>'
      +   '<form class="exit-form" novalidate>'
      +     '<input type="tel" name="phone" inputmode="tel" autocomplete="tel" '
      +       'placeholder="' + COPY.placeholder + '" '
      +       'pattern="[0-9\\-\\(\\) ]{10,}" required aria-label="' + COPY.placeholder + '">'
      +     '<button type="submit" class="exit-submit">' + COPY.submit + '</button>'
      +     '<div class="exit-msg" aria-live="polite"></div>'
      +   '</form>'
      + '</div>';
    document.body.appendChild(overlay);

    var closeBtn = overlay.querySelector('.exit-close');
    var form = overlay.querySelector('.exit-form');
    var input = overlay.querySelector('input[name=phone]');
    var msg = overlay.querySelector('.exit-msg');
    setTimeout(function () { try { input.focus(); } catch (_) {} }, 50);

    function close() {
      try { overlay.parentNode.removeChild(overlay); } catch (_) {}
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = (input.value || '').replace(/\D/g, '');
      if (raw.length === 10) raw = '1' + raw;
      if (raw.length < 11) {
        msg.className = 'exit-msg err';
        msg.textContent = COPY.invalid;
        return;
      }
      var btn = form.querySelector('.exit-submit');
      btn.disabled = true;
      postPartial({ phone: raw, source: 'exit_intent_sms' }, false);
      try { localStorage.setItem('form_submitted', '1'); } catch (_) {}
      msg.className = 'exit-msg ok';
      msg.textContent = COPY.thanks;
      setTimeout(close, 1400);
    });
  }

  document.addEventListener('mouseleave', function (e) {
    if (e.clientY > 0) return;
    showExitModal();
  });

  var lastY = window.scrollY || 0;
  var maxY = lastY;
  var scrollUp = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY || 0;
    if (y > maxY) maxY = y;
    if (y < lastY) scrollUp += (lastY - y); else scrollUp = 0;
    lastY = y;
    if (maxY > 500 && scrollUp > 300 && Date.now() - PAGE_LOAD_AT > 20000) {
      showExitModal();
    }
  }, { passive: true });

  window.addEventListener('pagehide', function () {
    if (Date.now() - PAGE_LOAD_AT < 30000) return;
    showExitModal();
  });
})();
