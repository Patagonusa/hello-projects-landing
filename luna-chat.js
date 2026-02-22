// Luna Chat Widget — Hello Projects Pro
// Self-contained vanilla JS chat widget that connects to Patagon CRM
(function() {
  'use strict';

  var API_BASE = 'https://www.salesdispatch.ai/api/chat';
  var APPEAR_DELAY = 15000; // 15 seconds
  var AUTO_OPEN_DELAY = 5000; // 5 seconds after bubble appears (20s total)
  var LANG = document.documentElement.lang === 'es' ? 'es' : 'en';

  // Strings
  var STR = {
    en: {
      greeting: 'Need help with your project?',
      title: 'Luna',
      subtitle: 'Hello Projects Pro',
      placeholder: 'Type a message...',
      send: 'Send',
      close: 'Close chat',
      powered: 'Hello Projects Pro',
      offline: 'Connection issue. Please try again.',
      rateLimit: 'Please wait a moment before sending another message.',
    },
    es: {
      greeting: '\u00bfNecesitas ayuda con tu proyecto?',
      title: 'Luna',
      subtitle: 'Hello Projects Pro',
      placeholder: 'Escribe un mensaje...',
      send: 'Enviar',
      close: 'Cerrar chat',
      powered: 'Hello Projects Pro',
      offline: 'Problema de conexi\u00f3n. Int\u00e9ntalo de nuevo.',
      rateLimit: 'Por favor espera un momento antes de enviar otro mensaje.',
    }
  };
  var S = STR[LANG] || STR.en;

  // Page-context greetings
  var PAGE_GREETINGS = {
    en: {
      kitchen: "Hey there! I'm Luna, your project assistant. I see you're interested in kitchen remodeling \u2014 great choice! Whether it's custom cabinets, countertops, or a full transformation, I can help you get started. Got questions about costs or timelines? Just ask! And if you need to speak with someone right away, tap the WhatsApp button on the left.",
      bathroom: "Hi! I'm Luna. Thinking about a bathroom remodel? That's exciting! Walk-in showers, new vanities, beautiful tile work \u2014 we do it all. Tell me what you have in mind, and I'll help you take the first step. Need to talk to someone right now? Our WhatsApp is right there on the left!",
      roofing: "Hi there! I'm Luna. I see you're looking at roofing services. Whether it's a leak, storm damage, or time for a brand new roof \u2014 our licensed team has you covered. Tell me what's going on, and I'll help you get a free estimate. If it's urgent, tap the WhatsApp button on the left for immediate help!",
      general: "Welcome! I'm Luna, your project assistant. Looking at general remodeling? From flooring and windows to garage doors and complete renovations \u2014 we handle it all. What's your project about? Or if you'd rather talk to the team directly, WhatsApp is right on the left!",
      electrical: "Hi! I'm Luna. Exploring electrical services? Panel upgrades, rewiring, EV chargers, smart home setups \u2014 our licensed electricians do it all. Tell me what you need, and I'll point you in the right direction. For urgent electrical issues, tap WhatsApp on the left!",
      landscaping: "Hey! I'm Luna. Dreaming of a beautiful outdoor space? Patios, decks, fencing, landscaping \u2014 let's make your backyard amazing. What do you have in mind? And if you need someone right away, WhatsApp is right there on the left!",
      quote: "Hi! I'm Luna. I see you're requesting a free quote \u2014 awesome! If you have any questions while filling out the form, I'm right here to help. You can also reach our team instantly on WhatsApp!",
      index: "Hey, welcome to Hello Projects Pro! I'm Luna, your project assistant. Whether you're dreaming of a new kitchen, need a roof repair, or anything in between \u2014 I'm here to help you get started. If you need to talk to someone right now, tap the WhatsApp button on the left. Otherwise, tell me about your project!",
      default: "Hey, how are you today! I'm Luna, your project assistant at Hello Projects Pro. If you're looking for something special, you're in the right place. Need to talk to someone right now? Tap the WhatsApp button on the left. Otherwise, tell me about your project!"
    },
    es: {
      kitchen: "\u00a1Hola! Soy Luna, tu asistente de proyectos. Veo que te interesa la remodelaci\u00f3n de cocina \u2014 \u00a1excelente elecci\u00f3n! Gabinetes, mesones, pisos... puedo ayudarte a comenzar. \u00bfTienes preguntas sobre costos o tiempos? \u00a1Solo preg\u00fantame! Y si necesitas hablar con alguien ya, toca el bot\u00f3n de WhatsApp a la izquierda.",
      bathroom: "\u00a1Hola! Soy Luna. \u00bfPensando en remodelar el ba\u00f1o? Duchas, vanidades, azulejos \u2014 hacemos de todo. Cu\u00e9ntame qu\u00e9 tienes en mente y te ayudo a dar el primer paso. \u00bfNecesitas hablar con alguien ahora? \u00a1WhatsApp est\u00e1 ah\u00ed a la izquierda!",
      roofing: "\u00a1Hola! Soy Luna. Veo que est\u00e1s mirando servicios de techos. Ya sea una gotera, da\u00f1o por tormenta o un techo nuevo \u2014 nuestro equipo con licencia te tiene cubierto. Dime qu\u00e9 necesitas. Si es urgente, \u00a1toca WhatsApp a la izquierda para ayuda inmediata!",
      general: "\u00a1Bienvenido! Soy Luna, tu asistente de proyectos. \u00bfMirando remodelaci\u00f3n general? Pisos, ventanas, puertas de garaje, renovaciones completas \u2014 hacemos de todo. \u00bfDe qu\u00e9 se trata tu proyecto? O si prefieres hablar directo, \u00a1WhatsApp est\u00e1 a la izquierda!",
      electrical: "\u00a1Hola! Soy Luna. \u00bfBuscando servicios el\u00e9ctricos? Paneles, cableado, cargadores EV, casa inteligente \u2014 nuestros electricistas con licencia lo manejan todo. \u00a1Dime qu\u00e9 necesitas! Para emergencias el\u00e9ctricas, toca WhatsApp a la izquierda.",
      landscaping: "\u00a1Hola! Soy Luna. \u00bfSo\u00f1ando con un espacio exterior hermoso? Patios, terrazas, cercas, jardiner\u00eda \u2014 \u00a1hagamos tu patio incre\u00edble! \u00bfQu\u00e9 tienes en mente? Y si necesitas a alguien ya, \u00a1WhatsApp est\u00e1 ah\u00ed!",
      quote: "\u00a1Hola! Soy Luna. Veo que vas a pedir un estimado gratis \u2014 \u00a1qu\u00e9 bueno! Si tienes preguntas mientras llenas el formulario, aqu\u00ed estoy. \u00a1Tambi\u00e9n puedes contactar a nuestro equipo por WhatsApp!",
      index: "\u00a1Hola, bienvenido a Hello Projects Pro! Soy Luna, tu asistente de proyectos. Ya sea una cocina nueva, reparar el techo o cualquier otra cosa \u2014 estoy aqu\u00ed para ayudarte. Si necesitas hablar con alguien ahora, toca el bot\u00f3n de WhatsApp a la izquierda. \u00a1O cu\u00e9ntame sobre tu proyecto!",
      default: "\u00a1Hola, c\u00f3mo est\u00e1s! Soy Luna, tu asistente de proyectos en Hello Projects Pro. Si buscas algo especial, est\u00e1s en el lugar correcto. \u00bfNecesitas hablar con alguien ahora? Toca el bot\u00f3n de WhatsApp a la izquierda. \u00a1O cu\u00e9ntame sobre tu proyecto!"
    }
  };

  function detectPageContext() {
    var path = window.location.pathname.toLowerCase();
    var greetings = PAGE_GREETINGS[LANG] || PAGE_GREETINGS.en;
    if (path.indexOf('kitchen') !== -1) return greetings.kitchen;
    if (path.indexOf('bathroom') !== -1) return greetings.bathroom;
    if (path.indexOf('roofing') !== -1) return greetings.roofing;
    if (path.indexOf('general') !== -1) return greetings.general;
    if (path.indexOf('electrical') !== -1) return greetings.electrical;
    if (path.indexOf('landscaping') !== -1) return greetings.landscaping;
    if (path.indexOf('quote') !== -1) return greetings.quote;
    if (path === '/' || path.indexOf('index') !== -1 || path.endsWith('/es.html')) return greetings.index;
    return greetings.default;
  }

  // State
  var sessionId = localStorage.getItem('luna_session_id') || null;
  var visitorId = localStorage.getItem('luna_visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID ? crypto.randomUUID() : 'v-' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    localStorage.setItem('luna_visitor_id', visitorId);
  }
  var isOpen = false;
  var isLoading = false;
  var messages = [];
  var dismissed = localStorage.getItem('luna_dismissed') === '1';

  // Reset auto-greet flag on new browser session
  if (!sessionStorage.getItem('luna_session_active')) {
    sessionStorage.setItem('luna_session_active', '1');
    localStorage.removeItem('luna_auto_greeted');
  }
  var hasAutoGreeted = localStorage.getItem('luna_auto_greeted') === '1';

  // ===== INJECT CSS =====
  var css = document.createElement('style');
  css.textContent = [
    '#luna-widget{position:fixed;bottom:24px;right:24px;z-index:9998;font-family:"Inter",-apple-system,sans-serif;}',
    '#luna-bubble{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 24px rgba(37,99,235,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.2s,box-shadow 0.2s;position:relative;}',
    '#luna-bubble:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(37,99,235,0.5);}',
    '#luna-bubble svg{width:32px;height:32px;}',
    '#luna-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;background:#f59e0b;border-radius:50%;border:2px solid #fff;display:none;animation:luna-pulse 2s infinite;}',
    '@keyframes luna-pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.2);}}',
    '#luna-tooltip{position:absolute;bottom:72px;right:0;background:#fff;color:#1e293b;padding:10px 16px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-size:14px;font-weight:600;white-space:nowrap;display:none;pointer-events:none;}',
    '#luna-tooltip::after{content:"";position:absolute;bottom:-6px;right:24px;width:12px;height:12px;background:#fff;transform:rotate(45deg);box-shadow:2px 2px 4px rgba(0,0,0,0.05);}',
    '#luna-panel{display:none;position:fixed;bottom:24px;right:24px;width:400px;height:560px;background:#fff;border-radius:16px;box-shadow:0 10px 50px rgba(0,0,0,0.2);flex-direction:column;overflow:hidden;z-index:9999;}',
    '#luna-panel.open{display:flex;}',
    '#luna-header{background:linear-gradient(135deg,#0c1a2e,#1e3a5f);color:#fff;padding:16px 20px;display:flex;align-items:center;gap:12px;flex-shrink:0;}',
    '#luna-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#60a5fa);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;flex-shrink:0;}',
    '#luna-header-info{flex:1;}',
    '#luna-header-info h3{font-size:16px;font-weight:700;margin:0;line-height:1.2;}',
    '#luna-header-info p{font-size:12px;color:#94a3b8;margin:0;}',
    '#luna-close{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:24px;padding:4px 8px;line-height:1;border-radius:6px;}',
    '#luna-close:hover{color:#fff;background:rgba(255,255,255,0.1);}',
    '#luna-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f8fafc;}',
    '.luna-msg{max-width:82%;padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.5;word-wrap:break-word;animation:luna-fade 0.3s ease;}',
    '@keyframes luna-fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}',
    '.luna-msg.assistant{background:#fff;color:#1e293b;border:1px solid #e2e8f0;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 4px rgba(0,0,0,0.04);}',
    '.luna-msg.user{background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;border-bottom-right-radius:4px;align-self:flex-end;}',
    '.luna-typing{display:none;align-self:flex-start;padding:12px 20px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;border-bottom-left-radius:4px;}',
    '.luna-typing span{display:inline-block;width:8px;height:8px;background:#94a3b8;border-radius:50%;margin:0 2px;animation:luna-bounce 1.4s infinite;}',
    '.luna-typing span:nth-child(2){animation-delay:0.2s;}',
    '.luna-typing span:nth-child(3){animation-delay:0.4s;}',
    '@keyframes luna-bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}',
    '#luna-input-area{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #e2e8f0;background:#fff;flex-shrink:0;}',
    '#luna-input{flex:1;border:1px solid #e2e8f0;border-radius:24px;padding:10px 18px;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s;resize:none;}',
    '#luna-input:focus{border-color:#2563eb;}',
    '#luna-send{width:40px;height:40px;border-radius:50%;background:#2563eb;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;flex-shrink:0;}',
    '#luna-send:hover{background:#1d4ed8;}',
    '#luna-send:disabled{background:#94a3b8;cursor:default;}',
    '#luna-send svg{width:18px;height:18px;}',
    '@media(max-width:480px){',
    '  #luna-panel{bottom:0;right:0;left:0;width:100%;height:100%;border-radius:0;}',
    '  #luna-widget{bottom:16px;right:16px;}',
    '}',
  ].join('\n');
  document.head.appendChild(css);

  // ===== BUILD DOM =====
  var widget = document.createElement('div');
  widget.id = 'luna-widget';
  widget.innerHTML = [
    '<div id="luna-tooltip">' + S.greeting + '</div>',
    '<button id="luna-bubble" aria-label="Chat with Luna">',
    '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
    '  <span id="luna-dot"></span>',
    '</button>',
    '<div id="luna-panel">',
    '  <div id="luna-header">',
    '    <div id="luna-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><path d="M12 8V4H8"/><rect x="5" y="8" width="14" height="12" rx="2"/><line x1="9" y1="13" x2="9" y2="13.01"/><line x1="15" y1="13" x2="15" y2="13.01"/><path d="M10 17h4"/></svg></div>',
    '    <div id="luna-header-info">',
    '      <h3>' + S.title + '</h3>',
    '      <p>' + S.subtitle + '</p>',
    '    </div>',
    '    <button id="luna-close" aria-label="' + S.close + '">&times;</button>',
    '  </div>',
    '  <div id="luna-messages">',
    '    <div class="luna-typing" id="luna-typing"><span></span><span></span><span></span></div>',
    '  </div>',
    '  <div id="luna-input-area">',
    '    <input type="text" id="luna-input" placeholder="' + S.placeholder + '" autocomplete="off" maxlength="1000">',
    '    <button id="luna-send" aria-label="' + S.send + '">',
    '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    '    </button>',
    '  </div>',
    '</div>',
  ].join('');

  // ===== MOUNT =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  function mount() {
    document.body.appendChild(widget);
    var bubble = document.getElementById('luna-bubble');
    var closeBtn = document.getElementById('luna-close');
    var input = document.getElementById('luna-input');
    var sendBtn = document.getElementById('luna-send');
    var dot = document.getElementById('luna-dot');
    var tooltip = document.getElementById('luna-tooltip');

    // Show bubble after delay
    widget.style.display = 'none';
    if (!dismissed) {
      setTimeout(function() {
        widget.style.display = 'block';
        // Show notification after appearing
        setTimeout(function() {
          if (!isOpen) {
            dot.style.display = 'block';
            tooltip.style.display = 'block';
            setTimeout(function() { tooltip.style.display = 'none'; }, 8000);
          }
        }, 3000);

        // Auto-open with greeting (only once per browser session)
        if (!hasAutoGreeted && !sessionId) {
          setTimeout(function() {
            if (!isOpen) {
              autoGreet();
            }
          }, AUTO_OPEN_DELAY);
        }
      }, APPEAR_DELAY);
    }

    bubble.addEventListener('click', function() {
      openChat();
    });

    closeBtn.addEventListener('click', function() {
      closeChat();
    });

    sendBtn.addEventListener('click', function() {
      sendMessage();
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function autoGreet() {
    var greeting = detectPageContext();

    isOpen = true;
    document.getElementById('luna-panel').classList.add('open');
    document.getElementById('luna-bubble').style.display = 'none';
    document.getElementById('luna-tooltip').style.display = 'none';
    document.getElementById('luna-dot').style.display = 'none';

    // Show greeting as local message (no API call)
    addMessage('assistant', greeting);

    // Mark as auto-greeted
    localStorage.setItem('luna_auto_greeted', '1');
    hasAutoGreeted = true;

    // Start session in background
    startSession(true);

    // Tracking
    try {
      window.dispatchEvent(new Event('luna_chat_open'));
      window.dispatchEvent(new Event('luna_auto_greet'));
    } catch(e) {}
  }

  function openChat() {
    isOpen = true;
    document.getElementById('luna-panel').classList.add('open');
    document.getElementById('luna-bubble').style.display = 'none';
    document.getElementById('luna-tooltip').style.display = 'none';
    document.getElementById('luna-dot').style.display = 'none';
    document.getElementById('luna-input').focus();

    // Dispatch event for tracking
    try { window.dispatchEvent(new Event('luna_chat_open')); } catch(e) {}

    // Show greeting if no messages yet
    if (!sessionId && messages.length === 0) {
      var greeting = detectPageContext();
      addMessage('assistant', greeting);
      startSession(true);
    } else if (!sessionId) {
      startSession(false);
    }
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('luna-panel').classList.remove('open');
    document.getElementById('luna-bubble').style.display = 'flex';
  }

  function startSession(skipGreeting) {
    fetch(API_BASE + '/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        language: LANG,
        page_url: window.location.href,
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.session_id) {
        sessionId = data.session_id;
        localStorage.setItem('luna_session_id', sessionId);

        if (data.resumed && !skipGreeting) {
          // Resumed session — send hello again to get context
          showTyping();
          sendToAPI(LANG === 'es' ? 'Hola, volv\u00ed' : 'Hi, I\'m back');
        }
        // For new sessions with skipGreeting (auto-greet or manual greeting),
        // don't send anything — wait for user's first message
      }
    })
    .catch(function() {
      if (!skipGreeting) {
        addMessage('assistant', S.offline);
      }
    });
  }

  function sendMessage() {
    var input = document.getElementById('luna-input');
    var text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    addMessage('user', text);
    showTyping();

    // Dispatch event for tracking
    try { window.dispatchEvent(new Event('luna_chat_message')); } catch(e) {}

    if (!sessionId) {
      // Session not ready, queue it
      startSession(false);
      return;
    }

    sendToAPI(text);
  }

  function sendToAPI(text) {
    isLoading = true;
    updateSendButton();

    fetch(API_BASE + '/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message: text,
        visitor_id: visitorId,
      }),
    })
    .then(function(r) {
      if (r.status === 429) {
        hideTyping();
        isLoading = false;
        updateSendButton();
        addMessage('assistant', S.rateLimit);
        return null;
      }
      return r.json();
    })
    .then(function(data) {
      hideTyping();
      isLoading = false;
      updateSendButton();

      if (!data) return;

      if (data.reply) {
        addMessage('assistant', data.reply);
      }

      if (data.lead_created) {
        try { window.dispatchEvent(new Event('luna_lead_created')); } catch(e) {}
      }

      // Session ended
      if (data.session_status === 'closed' || data.session_status === 'escalated') {
        sessionId = null;
        localStorage.removeItem('luna_session_id');
      }
    })
    .catch(function() {
      hideTyping();
      isLoading = false;
      updateSendButton();
      addMessage('assistant', S.offline);
    });
  }

  function addMessage(role, text) {
    var container = document.getElementById('luna-messages');
    var typing = document.getElementById('luna-typing');
    var div = document.createElement('div');
    div.className = 'luna-msg ' + role;
    div.textContent = text;
    container.insertBefore(div, typing);
    container.scrollTop = container.scrollHeight;
    messages.push({ role: role, text: text });
  }

  function showTyping() {
    var typing = document.getElementById('luna-typing');
    typing.style.display = 'block';
    var container = document.getElementById('luna-messages');
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('luna-typing').style.display = 'none';
  }

  function updateSendButton() {
    document.getElementById('luna-send').disabled = isLoading;
  }

})();
