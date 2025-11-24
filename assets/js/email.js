const emailEndpoint = 'https://formsubmit.co/ajax/hola@visitingworld.com';

async function sendForm(form, statusEl) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.nombre || !data.email || !data.destino) {
    statusEl.textContent = 'Por favor completa los campos obligatorios.';
    return;
  }
  statusEl.textContent = 'Enviando...';
  try {
    const response = await fetch(emailEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error en el envío');
    statusEl.textContent = 'Mensaje enviado. Revisa tu correo para la confirmación.';
    form.reset();
  } catch (e) {
    statusEl.textContent = 'No pudimos enviar tu mensaje. Intenta nuevamente.';
  }
}

function initEmailForms() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendForm(contactForm, document.getElementById('contact-status'));
    });
  }

  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendForm(quoteForm, document.getElementById('quote-status'));
    });
  }
}

document.addEventListener('DOMContentLoaded', initEmailForms);
