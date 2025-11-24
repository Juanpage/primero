const dataUrl = 'assets/data/travel-data.json';
let catalog = { destinations: [], promotions: [], partners: [] };
let activeBackgrounds = [];
let bgTimer;

async function loadData() {
  const response = await fetch(dataUrl);
  catalog = await response.json();
  setupFilters();
  renderDestinations(catalog.destinations);
  renderPromotions();
  renderPartners();
  initFadeIn();
}

function setupFilters() {
  const regionSelect = document.getElementById('region-filter');
  const countrySelect = document.getElementById('country-filter');
  const citySelect = document.getElementById('city-filter');

  const regions = ['Todas las regiones', ...new Set(catalog.destinations.map(d => d.region))];
  regionSelect.innerHTML = regions.map(r => `<option value="${r}">${r}</option>`).join('');

  function populateCountries(region) {
    const filtered = catalog.destinations.filter(d => region === 'Todas las regiones' || d.region === region);
    const countries = ['Todos los países', ...new Set(filtered.map(d => d.country))];
    countrySelect.innerHTML = countries.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function populateCities(region, country) {
    const filtered = catalog.destinations.filter(d => {
      const regionMatch = region === 'Todas las regiones' || d.region === region;
      const countryMatch = country === 'Todos los países' || d.country === country;
      return regionMatch && countryMatch;
    });
    const cities = ['Todas las ciudades', ...new Set(filtered.map(d => d.city))];
    citySelect.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  populateCountries('Todas las regiones');
  populateCities('Todas las regiones', 'Todos los países');

  function applyFilters() {
    const region = regionSelect.value;
    const country = countrySelect.value;
    const city = citySelect.value;
    const results = catalog.destinations.filter(d => {
      const matchRegion = region === 'Todas las regiones' || d.region === region;
      const matchCountry = country === 'Todos los países' || d.country === country;
      const matchCity = city === 'Todas las ciudades' || d.city === city;
      return matchRegion && matchCountry && matchCity;
    });
    renderDestinations(results);
  }

  regionSelect.addEventListener('change', () => {
    populateCountries(regionSelect.value);
    populateCities(regionSelect.value, 'Todos los países');
    applyFilters();
  });

  countrySelect.addEventListener('change', () => {
    populateCities(regionSelect.value, countrySelect.value);
    applyFilters();
  });

  citySelect.addEventListener('change', applyFilters);
}

function renderDestinations(list) {
  const grid = document.getElementById('destinations-grid');
  const bg = document.getElementById('destinations-background');
  grid.innerHTML = '';
  activeBackgrounds = list.map(d => d.image);
  bg.style.backgroundImage = activeBackgrounds.length ? `url(${activeBackgrounds[0]})` : 'none';
  let bgIndex = 0;
  if (bgTimer) clearInterval(bgTimer);
  if (activeBackgrounds.length > 1) {
    bgTimer = setInterval(() => {
      bgIndex = (bgIndex + 1) % activeBackgrounds.length;
      bg.style.opacity = 0.3;
      setTimeout(() => {
        bg.style.backgroundImage = `url(${activeBackgrounds[bgIndex]})`;
        bg.style.opacity = 0.6;
      }, 250);
    }, 4500);
  }

  list.forEach(dest => {
    const card = document.createElement('article');
    card.className = 'destination-card fade-in';
    card.innerHTML = `
      <img src="${dest.image}" alt="${dest.name}">
      <div class="destination-body">
        <div class="meta"><span class="badge city">${dest.city}</span><span>${dest.country} · ${dest.region}</span></div>
        <h3>${dest.name}</h3>
        <p class="muted">${dest.short_description}</p>
        <div class="meta"><span class="price">Desde $${dest.price_from}</span></div>
        <div class="actions">
          <a class="action-link" href="pages/destination.html?id=${dest.id}">Ver más</a>
          <button class="action-link" data-quote="${dest.name}">Cotizar</button>
          <a class="action-link" href="${dest.checkout_url}" target="_blank">Pagar con WeTravel</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  observeFade();
  attachQuoteButtons();
}

function renderPromotions() {
  const wrapper = document.getElementById('promotions-wrapper');
  wrapper.innerHTML = '';
  catalog.promotions.forEach(promo => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
      <article class="promo-card">
        <img src="${promo.image}" alt="${promo.title}">
        <div class="promo-body">
          <div class="promo-meta">
            <span class="discount">${promo.discount_label}</span>
            <span class="old-price">Antes $${promo.previous_price}</span>
          </div>
          <h3>${promo.title}</h3>
          <p class="muted">${promo.description}</p>
          <div class="meta"><span class="price">Ahora $${promo.price}</span></div>
          <div class="actions">
            <button class="action-link" data-quote="${promo.title}">Cotizar</button>
            <a class="action-link" href="${promo.checkout_url}" target="_blank">Pagar con WeTravel</a>
          </div>
        </div>
      </article>
    `;
    wrapper.appendChild(slide);
  });
  new Swiper('.promo-swiper', {
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
  });
  attachQuoteButtons();
}

function renderPartners() {
  const track = document.getElementById('partner-track');
  const dup = document.getElementById('partner-track-duplicate');
  const logos = catalog.partners.map(src => `<img src="${src}" alt="Partner">`).join('');
  track.innerHTML = logos;
  dup.innerHTML = logos;
}

function attachQuoteButtons() {
  document.querySelectorAll('[data-quote]').forEach(btn => {
    btn.onclick = () => openQuoteModal(btn.dataset.quote);
  });
}

function openQuoteModal(prefill = '') {
  const modal = document.getElementById('quote-modal');
  const field = document.getElementById('quote-destination');
  field.value = prefill;
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.setAttribute('aria-hidden', 'true');
}

function setupModals() {
  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal);
    });
  });
}

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

function handleForms() {
  const contactForm = document.getElementById('contact-form');
  const contactAlert = document.getElementById('contact-alert');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    contactAlert.style.display = 'block';
    setTimeout(() => contactAlert.style.display = 'none', 3200);
  });

  const quoteForm = document.getElementById('quote-form');
  const quoteAlert = document.getElementById('quote-alert');
  quoteForm?.addEventListener('submit', e => {
    e.preventDefault();
    quoteAlert.style.display = 'block';
    setTimeout(() => quoteAlert.style.display = 'none', 3200);
    closeModal(document.getElementById('quote-modal'));
  });
}

function initFadeIn() {
  observeFade();
  document.addEventListener('scroll', observeFade, { passive: true });
}

function observeFade() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  setupModals();
  setupPDFButtons();
  handleForms();
  loadData();
});
