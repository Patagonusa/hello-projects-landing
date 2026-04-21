// Google Places autocomplete for inputs marked with data-address-autocomplete
//
// Setup (one-time per landing site):
//   1. Get a key from console.cloud.google.com — enable "Places API (New)" + "Maps JavaScript API"
//   2. Restrict the key to your domains (helloprojectspro.com, jbc-landing.onrender.com, etc.)
//   3. Add to each calculator <head>:
//        <meta name="google-places-key" content="AIza...">
//
// Without a key, the input behaves as plain text — no autocomplete, no errors.
//
// Per-input setup:
//   <input type="text" name="address" data-address-autocomplete>
// Sibling inputs named city/state/zip in the same <form> auto-populate on selection.
// Or set explicit targets:
//   <input type="text" data-autocomplete-target="street">
//   <input type="text" data-autocomplete-target="city">
//   <input type="text" data-autocomplete-target="state">
//   <input type="text" data-autocomplete-target="zip">
(function () {
  if (window.__addressAutocompleteLoaded) return;
  window.__addressAutocompleteLoaded = true;

  function getKey() {
    var m = document.querySelector('meta[name="google-places-key"]');
    if (m && m.content && m.content.trim()) return m.content.trim();
    if (typeof window.GOOGLE_PLACES_API_KEY === 'string' && window.GOOGLE_PLACES_API_KEY) return window.GOOGLE_PLACES_API_KEY;
    return null;
  }

  function findTarget(form, kind, scope) {
    if (form) {
      var explicit = form.querySelector('[data-autocomplete-target="' + kind + '"]');
      if (explicit) return explicit;
      var byName = form.querySelector('[name="' + kind + '"]');
      if (byName) return byName;
    }
    if (scope) {
      var bn = scope.querySelector('[data-autocomplete-target="' + kind + '"]');
      if (bn) return bn;
    }
    return null;
  }

  function ensureHidden(form, name) {
    if (!form) return null;
    var h = document.createElement('input');
    h.type = 'hidden';
    h.name = name;
    h.setAttribute('data-autocomplete-injected', '1');
    form.appendChild(h);
    return h;
  }

  function setVal(el, value) {
    if (!el || value == null) return;
    el.value = value;
    try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
    try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}
    try { el.dispatchEvent(new Event('blur', { bubbles: true })); } catch (_) {}
  }

  function applyPlace(input, place) {
    if (!place || !place.address_components) return;
    var parts = { streetNumber: '', route: '', city: '', state: '', zip: '', country: '' };
    place.address_components.forEach(function (c) {
      var t = c.types || [];
      if (t.indexOf('street_number') >= 0) parts.streetNumber = c.long_name;
      else if (t.indexOf('route') >= 0) parts.route = c.short_name || c.long_name;
      else if (t.indexOf('locality') >= 0 || t.indexOf('postal_town') >= 0) parts.city = c.long_name;
      else if (!parts.city && t.indexOf('sublocality') >= 0) parts.city = c.long_name;
      else if (t.indexOf('administrative_area_level_1') >= 0) parts.state = c.short_name;
      else if (t.indexOf('postal_code') >= 0) parts.zip = c.short_name;
      else if (t.indexOf('country') >= 0) parts.country = c.short_name;
    });
    var street = (parts.streetNumber + ' ' + parts.route).trim();
    var form = input.form || input.closest('form');

    setVal(input, street || place.formatted_address || input.value);
    var streetEl = findTarget(form, 'street', input.parentElement);
    var cityEl = findTarget(form, 'city', input.parentElement) || ensureHidden(form, 'city');
    var stateEl = findTarget(form, 'state', input.parentElement) || ensureHidden(form, 'state');
    var zipEl = findTarget(form, 'zip', input.parentElement) || ensureHidden(form, 'zip');
    if (streetEl && streetEl !== input) setVal(streetEl, street);
    setVal(cityEl, parts.city);
    setVal(stateEl, parts.state);
    setVal(zipEl, parts.zip);

    try {
      input.dispatchEvent(new CustomEvent('addressselected', {
        bubbles: true,
        detail: { street: street, city: parts.city, state: parts.state, zip: parts.zip, country: parts.country, place: place }
      }));
    } catch (_) {}
  }

  function wireInputs() {
    var inputs = document.querySelectorAll('input[data-address-autocomplete]');
    if (!inputs.length || !window.google || !google.maps || !google.maps.places) return;
    Array.prototype.forEach.call(inputs, function (input) {
      if (input.__autocompleteWired) return;
      input.__autocompleteWired = true;
      try {
        var ac = new google.maps.places.Autocomplete(input, {
          types: ['address'],
          componentRestrictions: { country: ['us'] },
          fields: ['address_components', 'formatted_address', 'geometry'],
        });
        ac.addListener('place_changed', function () { applyPlace(input, ac.getPlace()); });
        // Suppress browser autofill dropdown competing with Places suggestions
        input.setAttribute('autocomplete', 'new-password');
      } catch (e) {
        // Places not loaded — leave as plain text input
      }
    });
  }

  function loadGoogleMaps(key) {
    if (window.google && google.maps && google.maps.places) { wireInputs(); return; }
    var existing = document.querySelector('script[data-google-maps-loader]');
    if (existing) return;
    window.__gmapsAutocompleteInit = function () { wireInputs(); };
    var s = document.createElement('script');
    s.async = true;
    s.defer = true;
    s.setAttribute('data-google-maps-loader', '1');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key)
      + '&libraries=places&callback=__gmapsAutocompleteInit&loading=async';
    document.head.appendChild(s);
  }

  function init() {
    if (!document.querySelector('input[data-address-autocomplete]')) return;
    var key = getKey();
    if (!key) {
      // No key configured — input remains a normal text field. Surface a one-time console hint.
      if (!window.__autocompleteKeyWarned) {
        window.__autocompleteKeyWarned = true;
        console.info('[address-autocomplete] No Google Places key found (add <meta name="google-places-key" content="..."> to enable).');
      }
      return;
    }
    loadGoogleMaps(key);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
