// Hello Projects Pro — Event Tracking (GA4 + Meta Pixel)
(function() {
  'use strict';

  // Helper: safe GA4 event
  function ga4Event(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  }

  // Helper: safe Meta Pixel event
  function fbEvent(eventName, params) {
    if (typeof fbq === 'function') {
      fbq('track', eventName, params || {});
    }
  }

  // Track phone clicks
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href^="tel:"]');
    if (link) {
      ga4Event('phone_click', { phone_number: link.href.replace('tel:', '') });
      fbEvent('Contact', { content_name: 'Phone Call' });
    }
  });

  // Track CTA / quote link clicks
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href*="quote"]');
    if (link) {
      ga4Event('cta_click', { link_url: link.href, link_text: link.textContent.trim() });
    }
  });

  // Track form submissions (quote forms)
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form.id === 'quoteForm' || form.closest('.quote-container')) {
      ga4Event('generate_lead', { event_category: 'form', event_label: 'quote_form' });
      fbEvent('Lead', { content_name: 'Quote Form' });
    }
  });

  // Track Luna chat events (dispatched by luna-chat.js)
  window.addEventListener('luna_chat_open', function() {
    ga4Event('chat_open', { event_category: 'engagement' });
    fbEvent('Contact', { content_name: 'Chat Open' });
  });

  window.addEventListener('luna_chat_message', function() {
    ga4Event('chat_message', { event_category: 'engagement' });
  });

  window.addEventListener('luna_lead_created', function() {
    ga4Event('generate_lead', { event_category: 'chat', event_label: 'luna_chat' });
    fbEvent('Lead', { content_name: 'Luna Chat' });
  });

  // Track Luna auto-greet
  window.addEventListener('luna_auto_greet', function() {
    ga4Event('luna_auto_greet', { event_category: 'engagement' });
  });

  // Track WhatsApp floating widget
  window.addEventListener('whatsapp_click', function() {
    ga4Event('whatsapp_click', { event_category: 'engagement' });
    fbEvent('Contact', { content_name: 'WhatsApp Widget' });
  });

  window.addEventListener('whatsapp_widget_visible', function() {
    ga4Event('whatsapp_widget_visible', { event_category: 'engagement' });
  });

})();
