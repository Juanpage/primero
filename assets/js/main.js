const dataUrl = 'assets/data/data.json';
const destinationsGrid = document.getElementById('destinations-grid');
const promotionsWrapper = document.getElementById('promotions-wrapper');
const backgroundEl = document.getElementById('destinations-background');
const partnerTrack = document.getElementById('partner-track');
const partnerTrackDuplicate = document.getElementById('partner-track-duplicate');

const destinationModal = document.getElementById('destination-modal');
const destinationModalBody = document.getElementById('destination-modal-body');
const quoteModal = document.getElementById('quote-modal');
const pdfModal = document.getElementById('pdf-modal');
const pdfFrame = document.getElementById('pdf-frame');

let swiperInstance;
let backgroundIndex = 0;
let backgroundImages = [];

async function loadData() {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error('No se pudo cargar el catálogo');
    const data = await response.json();
    renderDestinations(data.destinations);
    renderPromotions(data.promotions);
    renderPartners(data.partners);
    startBackgroundSlider();
  } catch (error) {
    console.error(error);
    destinationsGrid.innerHTML = '<p>Error al cargar destinos.</p>';
  }
}

function renderDestinations(destinations) {
  destinationsGrid.innerHTML = '';
  backgroundImages = destinations.map(dest => dest.background || dest.image);

  destinations.forEach((dest, index) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${dest.image}" alt="${dest.name}">
      <h3>${dest.name}</h3>
      <p>${dest.description}</p>
      <div class="actions">
        <button class="ghost-button" data-detail="${index}">Ver más</button>
        <a href="${dest.checkout_url}" target="_blank" class="pay-button">Reservar ahora</a>
      </div>
    `;
    destinationsGrid.appendChild(card);
  });

  destinationsGrid.addEventListener('click', (event) => {
    const detailBtn = event.target.closest('[data-detail]');
    if (detailBtn) {
      const dest = destinations[Number(detailBtn.dataset.detail)];
      openDestinationModal(dest);
    }
  });
}

function renderPromotions(promotions) {
  promotionsWrapper.innerHTML = '';
  promotions.forEach((promo) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
      <article class="card">
        <img src="${promo.image}" alt="${promo.title}">
        <h3>${promo.title}</h3>
        <p>${promo.description}</p>
        <div class="price-tag">$${promo.price} USD</div>
        <div class="actions">
          <button class="ghost-button" data-quote="${promo.title}">Cotizar</button>
          <a href="${promo.checkout_url}" target="_blank" class="pay-button">Pagar con WeTravel</a>
        </div>
      </article>
    `;
    promotionsWrapper.appendChild(slide);
  });

  swiperInstance = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    breakpoints: {
      768: { slidesPerView: 2 }
    }
  });

  promotionsWrapper.addEventListener('click', (event) => {
    const quoteBtn = event.target.closest('[data-quote]');
    if (quoteBtn) {
      openQuoteModal(quoteBtn.dataset.quote);
    }
  });
}

function renderPartners(partners) {
  partnerTrack.innerHTML = '';
  partnerTrackDuplicate.innerHTML = '';

  partners.forEach((logo) => {
    const img = document.createElement('img');
    img.src = logo;
    img.alt = 'Logo de socio';
    partnerTrack.appendChild(img);
  });

  partnerTrackDuplicate.innerHTML = partnerTrack.innerHTML;
}

function startBackgroundSlider() {
  if (!backgroundImages.length) return;
  backgroundEl.style.backgroundImage = `url(${backgroundImages[0]})`;
  backgroundEl.classList.add('fade-in');

  setInterval(() => {
    backgroundIndex = (backgroundIndex + 1) % backgroundImages.length;
    backgroundEl.classList.remove('fade-in');
    setTimeout(() => {
      backgroundEl.style.backgroundImage = `url(${backgroundImages[backgroundIndex]})`;
      backgroundEl.classList.add('fade-in');
    }, 300);
  }, 5500);
}

function openDestinationModal(dest) {
  destinationModalBody.innerHTML = `
    <h3>${dest.name}</h3>
    <p>${dest.description}</p>
    <div class="actions" style="margin-top:16px;">
      <a class="pay-button" href="${dest.checkout_url}" target="_blank">Reservar ahora</a>
      <button class="ghost-button" id="view-itinerary">Ver itinerario PDF</button>
    </div>
  `;
  destinationModal.classList.add('active');
  destinationModal.setAttribute('aria-hidden', 'false');

  const itineraryBtn = document.getElementById('view-itinerary');
  itineraryBtn?.addEventListener('click', () => openPdfModal('assets/data/itinerary.pdf'));
}

function openQuoteModal(title) {
  quoteModal.querySelector('h3').textContent = `Cotizar: ${title}`;
  quoteModal.classList.add('active');
  quoteModal.setAttribute('aria-hidden', 'false');
}

function openPdfModal(url) {
  pdfFrame.src = url;
  pdfModal.classList.add('active');
  pdfModal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  if (modal === pdfModal) pdfFrame.src = '';
}

function initModals() {
  document.body.addEventListener('click', (event) => {
    if (event.target.matches('[data-close]') || event.target.classList.contains('modal')) {
      const modal = event.target.closest('.modal') || event.target;
      closeModal(modal);
    }
  });
}

function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const contactAlert = document.getElementById('contact-alert');
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const hasEmpty = [...formData.values()].some((value) => !String(value).trim());
    if (hasEmpty) {
      contactAlert.textContent = 'Completa todos los campos.';
      contactAlert.style.display = 'block';
      contactAlert.style.color = '#fbbf24';
      return;
    }
    contactAlert.textContent = 'Mensaje listo. Nuestro concierge te contactará.';
    contactAlert.style.color = '#22c55e';
    contactAlert.style.display = 'block';
    contactForm.reset();
  });
}

function initQuoteForm() {
  const quoteForm = document.getElementById('quote-form');
  const quoteAlert = document.getElementById('quote-alert');
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(quoteForm);
    const hasEmpty = [...formData.values()].some((value) => !String(value).trim());
    if (hasEmpty) {
      quoteAlert.textContent = 'Completa la información para cotizar.';
      quoteAlert.style.color = '#fbbf24';
      quoteAlert.style.display = 'block';
      return;
    }
    quoteAlert.textContent = 'Cotización registrada. Responderemos con prioridad.';
    quoteAlert.style.color = '#22c55e';
    quoteAlert.style.display = 'block';
    quoteForm.reset();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadData();
  initModals();
  initContactForm();
  initQuoteForm();
});
