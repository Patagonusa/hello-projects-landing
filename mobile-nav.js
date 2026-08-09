/* Hello Projects Pro — shared mobile nav + external-link handling.
   Self-contained: injects its own CSS + a hamburger toggle so the header
   collapses cleanly on phones (most traffic is mobile). Also forces every
   external link to open in a new tab so visitors never lose the site. */
(function () {
  if (window.__hppMobileNav) return;
  window.__hppMobileNav = true;

  var css = ''
    + '.hpp-hamburger{display:none;background:none;border:0;cursor:pointer;padding:10px;margin-left:auto;line-height:0}'
    + '.hpp-hamburger span{display:block;width:26px;height:3px;background:#fff;margin:5px 0;border-radius:2px;transition:transform .25s,opacity .25s}'
    + '.hpp-open .hpp-hamburger span:nth-child(1){transform:translateY(8px) rotate(45deg)}'
    + '.hpp-open .hpp-hamburger span:nth-child(2){opacity:0}'
    + '.hpp-open .hpp-hamburger span:nth-child(3){transform:translateY(-8px) rotate(-45deg)}'
    + '@media (max-width:900px){'
    + '  .header-main{position:relative;flex-wrap:nowrap !important}'
    + '  .hpp-hamburger{display:block}'
    + '  .header-nav{position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:stretch;'
    + '    background:#0c1a2e;padding:6px 18px 18px;gap:2px !important;box-shadow:0 14px 30px rgba(0,0,0,.45);'
    + '    border-top:1px solid rgba(255,255,255,.08);display:none !important;max-height:80vh;overflow-y:auto;z-index:1000}'
    + '  .header-main.hpp-open .header-nav{display:flex !important}'
    + '  .header-nav > a{width:100%;box-sizing:border-box;padding:13px 6px !important;font-size:16px !important;'
    + '    border-bottom:1px solid rgba(255,255,255,.06)}'
    + '  .header-nav .lang-switch{display:inline-block;width:auto;min-width:44px;text-align:center;margin:6px 6px 0 0;'
    + '    padding:8px 12px !important;border:1px solid rgba(255,255,255,.25);border-radius:8px;border-bottom:1px solid rgba(255,255,255,.25) !important}'
    + '  .header-nav .btn{width:100%;box-sizing:border-box;justify-content:center;margin-top:10px;border-bottom:0 !important}'
    + '}';
  var st = document.createElement('style');
  st.appendChild(document.createTextNode(css));
  (document.head || document.documentElement).appendChild(st);

  function init() {
    // 1) External links -> new tab (so visitors can always get back to the site)
    var here = location.host;
    var links = document.querySelectorAll('a[href^="http"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.host && a.host !== here && !a.target) {
        a.target = '_blank';
        a.rel = (a.rel ? a.rel + ' ' : '') + 'noopener';
      }
    }
    // 2) Hamburger menu
    var nav = document.querySelector('.header-nav');
    if (!nav) return;
    var bar = nav.parentElement; // .header-main
    if (bar.querySelector('.hpp-hamburger')) return;
    var btn = document.createElement('button');
    btn.className = 'hpp-hamburger';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    btn.addEventListener('click', function () {
      var open = bar.classList.toggle('hpp-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.parentNode.insertBefore(btn, nav);
    // Close after tapping a real link
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { bar.classList.remove('hpp-open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
