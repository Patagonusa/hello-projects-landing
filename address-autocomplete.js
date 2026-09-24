// Address autocomplete for inputs marked with data-address-autocomplete.
//
// This used to load Google's browser library with a key in a meta tag. That key
// is restricted to the Address Validation API, so the library answered
// ApiTargetBlockedMapError and the field silently never autocompleted — which
// is what "the address doesn't work" looked like from the outside.
//
// It now asks the CRM instead: /api/address/suggest for the list, and
// /api/address/resolve to split the chosen line into street / city / state /
// ZIP, canonicalised by Google's Address Validation API. The key stays on the
// server, there is no referrer allowlist to maintain per domain, and nothing
// here breaks when Google changes its browser SDK.
//
// Per-input setup, unchanged:
//   <input type="text" name="address" data-address-autocomplete>
// Sibling inputs named city / state / zip in the same <form> fill themselves in.
// Or point at them explicitly:
//   <input data-autocomplete-target="city">   (street | city | state | zip)
//
// If the CRM cannot be reached the field stays a plain text box. An estimate
// request must never be blocked by an address lookup.
(function () {
  if (window.__addressAutocompleteLoaded) return;
  window.__addressAutocompleteLoaded = true;

  var API = 'https://patagon-crm.onrender.com/api/address';
  var MIN_CHARS = 4;
  var DEBOUNCE = 250;

  var css = [
    '.aa-wrap{position:relative}',
    '.aa-list{position:absolute;left:0;right:0;top:100%;z-index:60;background:#fff;',
    'border:1px solid #cbd7e6;border-radius:9px;margin-top:4px;overflow:hidden;',
    'box-shadow:0 10px 30px rgba(12,26,46,0.18);max-height:240px;overflow-y:auto}',
    '.aa-item{display:block;width:100%;text-align:left;border:0;background:none;',
    'padding:10px 12px;font:inherit;font-size:14px;color:#1e293b;cursor:pointer}',
    '.aa-item:hover,.aa-item.aa-on{background:#f0f7ff}',
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function targets(input) {
    var form = input.form || document;
    function pick(name) {
      return form.querySelector('[data-autocomplete-target="' + name + '"]') ||
             form.querySelector('[name="' + name + '"]');
    }
    return { city: pick('city'), state: pick('state'), zip: pick('zip') };
  }

  function setValue(el, value) {
    if (!el || !value) return;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function wire(input) {
    if (input.__aaWired) return;
    input.__aaWired = true;
    input.setAttribute('autocomplete', 'off');

    var wrap = document.createElement('div');
    wrap.className = 'aa-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var list = document.createElement('div');
    list.className = 'aa-list';
    list.style.display = 'none';
    wrap.appendChild(list);

    var items = [];
    var highlight = -1;
    var timer = null;
    var seq = 0;

    function close() { list.style.display = 'none'; list.innerHTML = ''; items = []; highlight = -1; }

    function choose(text) {
      input.value = text;
      close();
      var t = targets(input);
      fetch(API + '/resolve?q=' + encodeURIComponent(text))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.address) input.value = d.address;
          setValue(t.city, d && d.city);
          setValue(t.state, d && d.state);
          setValue(t.zip, d && d.zip);
        })
        .catch(function () { /* the typed line stands */ });
    }

    function render(suggestions) {
      items = suggestions || [];
      highlight = -1;
      if (!items.length) return close();
      list.innerHTML = '';
      items.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'aa-item';
        b.textContent = s.text;
        b.addEventListener('mousedown', function (e) { e.preventDefault(); });
        b.addEventListener('click', function () { choose(s.text); });
        b.addEventListener('mouseenter', function () { mark(i); });
        list.appendChild(b);
      });
      list.style.display = 'block';
    }

    function mark(i) {
      highlight = i;
      Array.prototype.forEach.call(list.children, function (el, j) {
        el.classList.toggle('aa-on', j === i);
      });
    }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(timer);
      if (q.length < MIN_CHARS) return close();
      var mine = ++seq;
      timer = setTimeout(function () {
        fetch(API + '/suggest?q=' + encodeURIComponent(q))
          .then(function (r) { return r.json(); })
          .then(function (d) { if (mine === seq) render(d && d.suggestions); })
          .catch(function () { if (mine === seq) close(); });
      }, DEBOUNCE);
    });

    input.addEventListener('keydown', function (e) {
      if (list.style.display === 'none' || !items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); mark((highlight + 1) % items.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(highlight <= 0 ? items.length - 1 : highlight - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(items[highlight >= 0 ? highlight : 0].text); }
      else if (e.key === 'Escape') { close(); }
    });

    input.addEventListener('blur', function () { setTimeout(close, 150); });
  }

  function wireAll() {
    var inputs = document.querySelectorAll('[data-address-autocomplete]');
    Array.prototype.forEach.call(inputs, wire);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireAll);
  } else {
    wireAll();
  }
})();
