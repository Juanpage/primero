const dataUrl = 'assets/data/data.json';
const destinationsGrid = document.getElementById('destinations-grid');
const promotionsWrapper = document.getElementById('promotions-wrapper');
const backgroundEl = document.getElementById('destinations-background');
const partnerTrack = document.getElementById('partner-track');
const partnerTrackDuplicate = document.getElementById('partner-track-duplicate');
const countryFilter = document.getElementById('country-filter');
const cityFilter = document.getElementById('city-filter');

const destinationModal = document.getElementById('destination-modal');
const destinationModalBody = document.getElementById('destination-modal-body');
const quoteModal = document.getElementById('quote-modal');
const pdfModal = document.getElementById('pdf-modal');
const pdfFrame = document.getElementById('pdf-frame');

let swiperInstance;
let backgroundIndex = 0;
let backgroundImages = [];
let backgroundInterval;
let allDestinations = [];
let filteredDestinations = [];

async function loadData() {
  try {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error('No se pudo cargar el catálogo');
    const data = await response.json();
    allDestinations = data.destinations;
    filteredDestinations = [...allDestinations];
    renderFilters(allDestinations);
    renderDestinations(filteredDestinations);
    renderPromotions(data.promotions);
    renderPartners(data.partners);
    startBackgroundSlider(filteredDestinations);
  } catch (error) {
    console.error(error);
    destinationsGrid.innerHTML = '<p>Error al cargar destinos.</p>';
  }
}

function renderDestinations(destinations) {
  destinationsGrid.innerHTML = '';
  backgroundImages = destinations.map((dest) => dest.background || dest.image);

  if (!destinations.length) {
    destinationsGrid.innerHTML = '<p>No hay resultados para los filtros seleccionados.</p>';
    return;
  }

  destinations.forEach((dest, index) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${dest.image}" alt="${dest.name}">
      <div class="eyebrow">
        <span class="pill">${dest.region}</span>
        <span>${dest.city}, ${dest.country}</span>
      </div>
      <h3>${dest.name}</h3>
      <p>${dest.description}</p>
      <div class="actions">
        <button class="ghost-button" data-detail="${index}">Ver más detalles</button>
        <button class="ghost-button" data-quote="${dest.name}">Cotizar</button>
        <a href="${dest.checkout_url}" target="_blank" class="pay-button">Pagar con WeTravel</a>
      </div>
    `;
    destinationsGrid.appendChild(card);
  });
}

function renderFilters(destinations) {
  const countries = Array.from(new Set(destinations.map((dest) => dest.country))).sort();
  const cities = Array.from(new Set(destinations.map((dest) => dest.city))).sort();

  countryFilter.innerHTML = '<option value="all">Todos los países</option>' + countries.map((country) => `<option value="${country}">${country}</option>`).join('');
  cityFilter.innerHTML = '<option value="all">Todas las ciudades</option>' + cities.map((city) => `<option value="${city}">${city}</option>`).join('');

  countryFilter.addEventListener('change', () => {
    const selectedCountry = countryFilter.value;
    const scopedCities = Array.from(new Set(
      allDestinations
        .filter((dest) => selectedCountry === 'all' || dest.country === selectedCountry)
        .map((dest) => dest.city)
    )).sort();

    cityFilter.innerHTML = '<option value="all">Todas las ciudades</option>' + scopedCities.map((city) => `<option value="${city}">${city}</option>`).join('');
    applyFilters();
  });

  cityFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
  const selectedCountry = countryFilter.value;
  const selectedCity = cityFilter.value;

  filteredDestinations = allDestinations.filter((dest) => {
    const matchesCountry = selectedCountry === 'all' || dest.country === selectedCountry;
    const matchesCity = selectedCity === 'all' || dest.city === selectedCity;
    return matchesCountry && matchesCity;
  });

  renderDestinations(filteredDestinations);
  startBackgroundSlider(filteredDestinations);
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
  if (backgroundInterval) clearInterval(backgroundInterval);
  if (!backgroundImages.length) {
    backgroundEl.style.backgroundImage = '';
    backgroundEl.classList.remove('fade-in');
    return;
  }

  backgroundIndex = 0;
  backgroundEl.style.backgroundImage = `url(${backgroundImages[0]})`;
  backgroundEl.classList.add('fade-in');

  backgroundInterval = setInterval(() => {
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
    <p style="color: #94a3b8; font-weight:600;">${dest.city}, ${dest.country} · ${dest.region}</p>
    <p>${dest.description}</p>
    <div class="actions" style="margin-top:16px;">
      <a class="pay-button" href="${dest.checkout_url}" target="_blank">Pagar con WeTravel</a>
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
    const detailBtn = event.target.closest('[data-detail]');
    const quoteBtn = event.target.closest('[data-quote]');
    if (event.target.matches('[data-close]') || event.target.classList.contains('modal')) {
      const modal = event.target.closest('.modal') || event.target;
      closeModal(modal);
    }

    if (detailBtn && filteredDestinations.length) {
      const dest = filteredDestinations[Number(detailBtn.dataset.detail)];
      if (dest) openDestinationModal(dest);
    }

    if (quoteBtn) {
      openQuoteModal(quoteBtn.dataset.quote);
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
