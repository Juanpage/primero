const form = document.getElementById('feedback-form');
const errorBox = document.getElementById('qr-error');

const params = new URLSearchParams(window.location.search);
const vesselSlug = params.get('vessel');
const token = params.get('token');

const showError = (message) => {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
};

if (!vesselSlug || !token) {
  showError('El QR no es válido. Solicita un nuevo código para enviar tu feedback.');
  form.querySelector('button').disabled = true;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const rating = Number(formData.get('rating'));
  const comment = formData.get('comment');
  const email = formData.get('email');

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        vessel_slug: vesselSlug,
        qr_token: token,
        rating,
        comment,
        email
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'No se pudo enviar el feedback');
    }

    window.location.href = '../pages/thanks.html';
  } catch (error) {
    showError(error.message);
  }
});
