const chatbotResponses = {
  precios: 'Trabajamos tarifas dinámicas desde $780 según destino y temporada. Comparte fechas para cotizar.',
  promociones: 'Tenemos 4 promociones activas con descuentos de hasta 14%. ¿Cuál te interesa?',
  contacto: 'Puedes escribirnos al WhatsApp o dejar tu email en el formulario de contacto.',
  disponibilidad: 'Confirmamos disponibilidad en menos de 10 minutos hábiles.',
  operadores: 'Nuestros operadores humanos atienden 24/7 en español e inglés.'
};

function createChatbot() {
  const toggle = document.createElement('button');
  toggle.className = 'chatbot-toggle';
  toggle.textContent = 'Chat';

  const windowEl = document.createElement('div');
  windowEl.className = 'chatbot-window';
  windowEl.innerHTML = `
    <div class="chatbot-header">
      <strong>Asistente</strong>
      <button class="close" aria-label="Cerrar">×</button>
    </div>
    <div class="chatbot-messages"></div>
    <div class="chatbot-input">
      <input type="text" placeholder="Escribe: precios, promociones..." />
      <button>Enviar</button>
    </div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(windowEl);

  const messages = windowEl.querySelector('.chatbot-messages');
  const input = windowEl.querySelector('input');
  const sendBtn = windowEl.querySelector('.chatbot-input button');
  const closeBtn = windowEl.querySelector('.chatbot-header .close');

  function addMessage(text, from = 'bot') {
    const msg = document.createElement('div');
    msg.className = `msg ${from}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function respond(value) {
    const key = value.toLowerCase();
    const found = Object.keys(chatbotResponses).find(k => key.includes(k));
    addMessage(value, 'user');
    if (found) {
      addMessage(chatbotResponses[found], 'bot');
    } else {
      addMessage('Soy un bot. Pregunta por precios, promociones, contacto, disponibilidad u operadores humanos.', 'bot');
    }
  }

  sendBtn.addEventListener('click', () => {
    if (!input.value.trim()) return;
    respond(input.value.trim());
    input.value = '';
  });
  input.addEventListener('keypress', e => { if (e.key === 'Enter') sendBtn.click(); });
  toggle.addEventListener('click', () => windowEl.classList.toggle('open'));
  closeBtn.addEventListener('click', () => windowEl.classList.remove('open'));

  addMessage('Hola, soy tu asistente de viajes. Pregunta por precios, promociones o disponibilidad.', 'bot');
}

document.addEventListener('DOMContentLoaded', createChatbot);
