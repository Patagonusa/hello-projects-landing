// HPP pixel enhancements
// - Own visitor pixel: POST every pageview to CRM /api/webhooks/visitor
// - Meta Advanced Matching: hash email/phone/zip/first/last on blur, re-init fbq
// - Form-abandoner webhook: POST valid email/phone to CRM on blur
// Included via <script src="/pixel-enhancements.js" defer></script> in <head>
(function () {
  var BRAND = 'hpp';
  var META_PIXEL = '1782159502364871';
  var CRM_HOST = 'https://patagon-crm.onrender.com';
  var CRM = CRM_HOST + '/api/webhooks/lead-partial';
  var CRM_VISITOR = CRM_HOST + '/api/webhooks/visitor';
  var FP_KEY = 'hpp_fp';

  // Infer interest from pathname
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

  var fp = localStorage.getItem(FP_KEY);
  if (!fp) {
    fp = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now() + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem(FP_KEY, fp);
  }

  var userData = {};
  var sent = {};

  function qs(k) {
    try { return new URLSearchParams(location.search).get(k) || undefined; } catch (e) { return undefined; }
  }

  function getCookie(name) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\\/+^]/g, '\\$&') + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : undefined;
    } catch (e) { return undefined; }
  }

  // Fire our own pixel ping to CRM /api/webhooks/visitor — one call per pageview
  try {
    var visitorBody = {
      fingerprint_id: fp,
      brand: BRAND,
      landing_page: location.pathname,
      referrer_domain: (function () {
        try { return document.referrer ? new URL(document.referrer).hostname : undefined; } catch (e) { return undefined; }
      })(),
      utm_source: qs('utm_source'),
      utm_medium: qs('utm_medium'),
      utm_campaign: qs('utm_campaign'),
      utm_content: qs('utm_content'),
      utm_term: qs('utm_term'),
      fbclid: qs('fbclid'),
      gclid: qs('gclid'),
      fbc: getCookie('_fbc'),
      fbp: getCookie('_fbp'),
    };
    fetch(CRM_VISITOR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorBody),
      keepalive: true,
      mode: 'cors',
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
      var body = {
        email: email || undefined,
        phone: phone || undefined,
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
        timestamp: new Date().toISOString(),
      };
      try {
        fetch(CRM, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          keepalive: true,
          mode: 'cors',
        }).catch(function () {});
      } catch (_) {}
    }
  }

  document.addEventListener('blur', onBlur, true);
})();
