const dataPath = '../assets/data/travel-data.json';

async function loadDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  const res = await fetch(dataPath);
  const data = await res.json();
  const destination = data.destinations.find(d => d.id === id);
  if (!destination) return;
  document.getElementById('detail-image').src = `../${destination.image}`;
  document.getElementById('detail-title').textContent = destination.name;
  document.getElementById('detail-description').textContent = destination.long_description;
  document.getElementById('detail-location').textContent = `${destination.city} — ${destination.country} — ${destination.region}`;
  document.getElementById('detail-price').textContent = `Desde $${destination.price_from}`;
  document.getElementById('detail-pay').href = destination.checkout_url;
  const pdfBtn = document.getElementById('detail-pdf');
  if (destination.pdf) {
    pdfBtn.dataset.pdf = `../${destination.pdf}`;
  } else {
    pdfBtn.style.display = 'none';
  }
  document.getElementById('detail-quote').addEventListener('click', () => {
    openQuoteModal(destination.name);
  });
}

function openQuoteModal(prefill) {
  const modal = document.getElementById('quote-modal');
  if (!modal) {
    const quoteModal = document.createElement('div');
    quoteModal.className = 'modal';
    quoteModal.id = 'quote-modal';
    quoteModal.setAttribute('aria-hidden', 'true');
    quoteModal.innerHTML = `
      <div class="modal-content">
        <button class="close" data-close>&times;</button>
        <h3>Solicitar cotización</h3>
        <form id="quote-form">
          <div class="form-group">
            <label for="quote-name">Nombre</label>
            <input type="text" id="quote-name" name="name" required>
          </div>
          <div class="form-group">
            <label for="quote-email">Email</label>
            <input type="email" id="quote-email" name="email" required>
          </div>
          <div class="form-group">
            <label for="quote-destination">Destino</label>
            <input type="text" id="quote-destination" name="destination" required>
          </div>
          <div class="form-group two-cols">
            <div>
              <label for="quote-date">Fecha</label>
              <input type="date" id="quote-date" name="date" required>
            </div>
            <div>
              <label for="quote-people">Personas</label>
              <input type="number" id="quote-people" name="people" min="1" value="2" required>
            </div>
          </div>
          <button type="submit" class="btn">Enviar solicitud</button>
          <div class="alert" id="quote-alert">Solicitud enviada correctamente.</div>
        </form>
      </div>`;
    document.body.appendChild(quoteModal);
    setupModals();
    handleQuoteForm();
  }
  document.getElementById('quote-destination').value = prefill;
  document.getElementById('quote-modal').setAttribute('aria-hidden', 'false');
}

function setupModals() {
  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
  });
}

function closeModal(modal) { modal.setAttribute('aria-hidden', 'true'); }

function setupPDFButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-pdf]');
    if (!btn) return;
    const url = btn.dataset.pdf;
    if (!url) return;
    const modal = document.getElementById('pdf-modal');
    const frame = document.getElementById('pdf-frame');
    frame.src = url;
    modal.setAttribute('aria-hidden', 'false');
  });
}

function handleQuoteForm() {
  const form = document.getElementById('quote-form');
  const alertBox = document.getElementById('quote-alert');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    alertBox.style.display = 'block';
    setTimeout(() => alertBox.style.display = 'none', 3000);
    closeModal(document.getElementById('quote-modal'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadDetail();
  setupModals();
  setupPDFButtons();
  handleQuoteForm();
});
