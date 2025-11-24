const dummyEndpoint = 'https://httpbin.org/post';

function sendFormData(form) {
  const data = Object.fromEntries(new FormData(form));
  return fetch(dummyEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.ok);
}

function setupEmailForms() {
  const contactForm = document.getElementById('contact-form');
  const contactAlert = document.getElementById('contact-alert');
  contactForm?.addEventListener('submit', async e => {
    e.preventDefault();
    await sendFormData(contactForm);
    contactAlert.style.display = 'block';
    setTimeout(() => contactAlert.style.display = 'none', 3200);
    contactForm.reset();
  });

  const quoteForm = document.getElementById('quote-form');
  const quoteAlert = document.getElementById('quote-alert');
  quoteForm?.addEventListener('submit', async e => {
    e.preventDefault();
    await sendFormData(quoteForm);
    quoteAlert.style.display = 'block';
    setTimeout(() => quoteAlert.style.display = 'none', 3200);
    document.getElementById('quote-modal')?.setAttribute('aria-hidden', 'true');
    quoteForm.reset();
  });
}

document.addEventListener('DOMContentLoaded', setupEmailForms);
