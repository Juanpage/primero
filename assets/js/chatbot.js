class ChatbotWidget {
  constructor() {
    this.messages = {
      es: {
        greeting: 'Hola, soy tu asistente de Visiting World. ¿En qué te ayudo?',
        precios: 'Nuestros planes premium inician en $320. Indica tu destino y fecha para una cotización precisa.',
        promociones: 'Hoy tenemos promociones activas en Galápagos, Riviera Maya y París.',
        contacto: 'Puedes escribirnos a hola@visitingworld.com o usar el botón de WhatsApp.',
        disponibilidad: 'Verificamos disponibilidad en tiempo real. Indica fechas y número de personas.',
        humano: 'Un operador humano puede continuar la conversación en minutos. ¿Te conecto?'
      },
      en: {
        greeting: 'Hi, I am your Visiting World assistant. How can I help?',
        precios: 'Premium plans start at $320. Share destination and dates for a quote.',
        promociones: 'Active promos: Galápagos, Riviera Maya, and Paris.',
        contacto: 'Reach us at hello@visitingworld.com or via WhatsApp.',
        disponibilidad: 'We check availability in real time. Please share dates and group size.',
        humano: 'A human operator can take over within minutes. Should I connect you?'
      }
    };
    this.lang = 'es';
    this.build();
  }

  build() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chatbot';
    wrapper.innerHTML = `
      <button class="btn btn--primary" aria-expanded="false" aria-controls="chatbot-panel" id="chatbot-toggle">💬 Chat</button>
      <div class="chatbot__panel" id="chatbot-panel" hidden>
        <div class="chatbot__header">
          <div>
            <p class="chatbot__title">Visiting World</p>
            <small>Asistente 24/7 · <button class="btn--ghost" id="chatbot-lang" aria-label="Cambiar idioma">ES/EN</button></small>
          </div>
          <button class="modal__close" aria-label="Cerrar chat" data-close>×</button>
        </div>
        <div class="chatbot__messages" role="log" aria-live="polite"></div>
        <form class="chatbot__form" id="chatbot-form">
          <label class="sr-only" for="chatbot-input">Mensaje</label>
          <input id="chatbot-input" class="form__input" name="message" required placeholder="Escribe tu mensaje" />
          <button class="btn btn--primary" type="submit">Enviar</button>
        </form>
      </div>`;
    document.body.appendChild(wrapper);
    this.panel = wrapper.querySelector('#chatbot-panel');
    this.log = wrapper.querySelector('.chatbot__messages');
    this.toggle = wrapper.querySelector('#chatbot-toggle');
    this.form = wrapper.querySelector('#chatbot-form');
    this.input = wrapper.querySelector('#chatbot-input');
    this.langBtn = wrapper.querySelector('#chatbot-lang');
    this.bind();
    this.reply('greeting');
  }

  bind() {
    this.toggle.addEventListener('click', () => {
      const expanded = this.toggle.getAttribute('aria-expanded') === 'true';
      this.toggle.setAttribute('aria-expanded', String(!expanded));
      this.panel.hidden = expanded;
      this.panel.classList.toggle('is-visible');
      if (!expanded) this.input.focus();
    });
    this.panel.querySelector('[data-close]').addEventListener('click', () => this.toggle.click());
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = this.input.value.trim();
      if (!value) return;
      this.addMessage(value, 'user');
      this.input.value = '';
      this.respond(value.toLowerCase());
    });
    this.langBtn.addEventListener('click', () => {
      this.lang = this.lang === 'es' ? 'en' : 'es';
      this.langBtn.textContent = this.lang.toUpperCase();
      this.reply('greeting');
    });
  }

  addMessage(text, role = 'bot') {
    const bubble = document.createElement('div');
    bubble.className = `chatbot__bubble chatbot__bubble--${role}`;
    bubble.textContent = text;
    this.log.appendChild(bubble);
    this.log.scrollTop = this.log.scrollHeight;
  }

  reply(type) {
    const text = this.messages[this.lang][type] || this.messages[this.lang].greeting;
    this.addMessage(text, 'bot');
  }

  respond(input) {
    if (input.includes('precio') || input.includes('price')) return this.reply('precios');
    if (input.includes('promo')) return this.reply('promociones');
    if (input.includes('contact')) return this.reply('contacto');
    if (input.includes('dispon')) return this.reply('disponibilidad');
    if (input.includes('humano') || input.includes('human')) return this.reply('humano');
    return this.reply('greeting');
  }
}

(function initChatbot() {
  document.addEventListener('DOMContentLoaded', () => new ChatbotWidget());
})();
