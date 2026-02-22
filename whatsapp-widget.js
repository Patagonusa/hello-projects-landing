// WhatsApp Floating Widget — Hello Projects Pro
(function() {
  'use strict';

  var WA_URL = 'https://wa.me/message/P3KKERSF57BKB1';
  var APPEAR_DELAY = 10000;
  var TOOLTIP_DELAY = 3000;
  var TOOLTIP_DURATION = 8000;
  var LANG = document.documentElement.lang === 'es' ? 'es' : 'en';

  var STR = {
    en: { tooltip: 'Need to talk right now?', label: 'Chat on WhatsApp' },
    es: { tooltip: '\u00bfNecesitas hablar ahora?', label: 'Chatea por WhatsApp' }
  };
  var S = STR[LANG] || STR.en;

  var css = document.createElement('style');
  css.textContent = [
    '#wa-float{position:fixed;bottom:28px;left:24px;z-index:9997;font-family:"Inter",-apple-system,sans-serif;display:none;}',
    '#wa-float.visible{display:block;animation:wa-slide-in 0.4s ease-out;}',
    '@keyframes wa-slide-in{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}',
    '#wa-btn{display:flex;align-items:center;gap:10px;background:#25D366;color:#fff;text-decoration:none;padding:12px 20px;border-radius:50px;font-size:14px;font-weight:700;box-shadow:0 4px 20px rgba(37,211,102,0.35);transition:all 0.25s;position:relative;}',
    '#wa-btn:hover{background:#20bd5a;transform:translateY(-2px);box-shadow:0 6px 28px rgba(37,211,102,0.45);}',
    '#wa-btn svg{width:24px;height:24px;flex-shrink:0;}',
    '#wa-btn-text{display:inline;}',
    '#wa-tooltip{position:absolute;bottom:calc(100% + 12px);left:0;background:#1e293b;color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.3s;box-shadow:0 4px 16px rgba(0,0,0,0.2);}',
    '#wa-tooltip.show{opacity:1;}',
    '#wa-tooltip::after{content:"";position:absolute;bottom:-6px;left:24px;width:12px;height:12px;background:#1e293b;transform:rotate(45deg);}',
    '#wa-pulse{position:absolute;top:-2px;right:-2px;width:12px;height:12px;background:#f59e0b;border-radius:50%;border:2px solid #fff;animation:wa-pulse-anim 2s infinite;}',
    '@keyframes wa-pulse-anim{0%,100%{transform:scale(1);}50%{transform:scale(1.3);}}',
    '@media(max-width:768px){',
    '  #wa-float{bottom:20px;left:16px;}',
    '  #wa-btn{padding:14px;border-radius:50%;}',
    '  #wa-btn-text{display:none;}',
    '  #wa-tooltip{display:none;}',
    '}',
  ].join('\n');
  document.head.appendChild(css);

  var container = document.createElement('div');
  container.id = 'wa-float';
  container.innerHTML = [
    '<div id="wa-tooltip">' + S.tooltip + '</div>',
    '<a id="wa-btn" href="' + WA_URL + '" target="_blank" rel="noopener" aria-label="' + S.label + '">',
    '  <span id="wa-pulse"></span>',
    '  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    '  <span id="wa-btn-text">' + S.label + '</span>',
    '</a>',
  ].join('');

  function mount() {
    document.body.appendChild(container);

    setTimeout(function() {
      container.classList.add('visible');

      setTimeout(function() {
        var tooltip = document.getElementById('wa-tooltip');
        if (tooltip) {
          tooltip.classList.add('show');
          setTimeout(function() { tooltip.classList.remove('show'); }, TOOLTIP_DURATION);
        }
      }, TOOLTIP_DELAY);

      try { window.dispatchEvent(new Event('whatsapp_widget_visible')); } catch(e) {}
    }, APPEAR_DELAY);

    var btn = document.getElementById('wa-btn');
    btn.addEventListener('click', function() {
      try { window.dispatchEvent(new Event('whatsapp_click')); } catch(e) {}
    });
    btn.addEventListener('mouseenter', function() {
      var t = document.getElementById('wa-tooltip');
      if (t) t.classList.add('show');
    });
    btn.addEventListener('mouseleave', function() {
      var t = document.getElementById('wa-tooltip');
      if (t) t.classList.remove('show');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
