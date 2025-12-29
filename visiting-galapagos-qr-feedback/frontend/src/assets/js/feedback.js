const params = new URLSearchParams(window.location.search);
const vesselParam = params.get('v');
const VESSELS = ['LETTY', 'CALIPSO', 'NAREL'];

const vesselField = document.getElementById('vessel_id');
const starsContainer = document.getElementById('rating_general');
const npsContainer = document.getElementById('nps-options');
const form = document.getElementById('feedback-form');

const redirectToThanks = () => {
  window.location.href = './thanks.html';
};

const renderStars = () => {
  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement('span');
    star.textContent = '★';
    star.classList.add('star');
    star.dataset.value = i;
    star.addEventListener('click', () => {
      document.querySelectorAll('.star').forEach((el) => el.classList.toggle('active', Number(el.dataset.value) <= i));
      starsContainer.dataset.value = i;
    });
    starsContainer.appendChild(star);
  }
};

const renderNps = () => {
  for (let i = 0; i <= 10; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = i;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nps button').forEach((el) => el.classList.remove('selected'));
      btn.classList.add('selected');
      npsContainer.dataset.value = i;
    });
    npsContainer.appendChild(btn);
  }
};

const init = () => {
  const vesselId = vesselParam ? vesselParam.toUpperCase() : '';
  if (!VESSELS.includes(vesselId)) {
    alert('QR inválido. Usa el enlace del barco.');
    return;
  }
  vesselField.value = vesselId;
  renderStars();
  renderNps();
};

const submitFeedback = async (payload) => {
  const response = await fetch(`${window.APP_CONFIG.API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('No se pudo enviar. Intenta de nuevo.');
  }
  return response.json();
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const rating = Number(starsContainer.dataset.value);
  const npsValue = Number(npsContainer.dataset.value);

  if (!rating || Number.isNaN(rating)) {
    alert('Selecciona tu calificación general.');
    return;
  }
  if (Number.isNaN(npsValue)) {
    alert('Selecciona tu NPS.');
    return;
  }

  const payload = {
    vessel_id: vesselField.value,
    rating_general: rating,
    nps: npsValue,
    guide_score: form.guide_score.value || null,
    punctuality_score: form.punctuality_score.value || null,
    organization_score: form.organization_score.value || null,
    safety_score: form.safety_score.value || null,
    best_part: form.best_part.value.trim() || null,
    improvement: form.improvement.value.trim() || null,
  };

  try {
    form.querySelector('button[type="submit"]').disabled = true;
    await submitFeedback(payload);
    redirectToThanks();
  } catch (error) {
    alert(error.message);
  } finally {
    form.querySelector('button[type="submit"]').disabled = false;
  }
});

init();
