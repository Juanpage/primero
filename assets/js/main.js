/* Main interactions: destinations, filters, promotions, partners, blog, animations */
const state = {
  regions: [],
  promotions: [],
  partners: [],
  blog: [],
  partnerIndex: 0,
  selectedRegion: '',
  selectedCountry: '',
  selectedCity: ''
};

let partnerTimer;

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Error cargando ' + path);
  return response.json();
}

async function loadData() {
  const [travelData, blogPosts, partners] = await Promise.all([
    fetchJSON('/assets/data/travel-data.json'),
    fetchJSON('/assets/data/blog-posts.json'),
    fetchJSON('/assets/data/partners.json')
  ]);
  state.regions = travelData.regions;
  state.promotions = travelData.promotions;
  state.blog = blogPosts;
  state.partners = partners;
  renderRegions();
  renderDestinations();
  renderPromotions();
  renderBlog();
  renderPartners();
  injectSchema(travelData);
}

function renderRegions() {
  const regionSelect = document.querySelector('#filter-region');
  if (!regionSelect) return;
  regionSelect.innerHTML = '<option value="">Todas las regiones</option>' +
    state.regions.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
}

function renderCountries() {
  const countrySelect = document.querySelector('#filter-country');
  const region = state.selectedRegion;
  if (!countrySelect) return;
  const countries = region ? state.regions.find(r => r.name === region)?.countries ?? [] : state.regions.flatMap(r => r.countries);
  countrySelect.innerHTML = '<option value="">Todos los países</option>' + countries.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function renderCities() {
  const citySelect = document.querySelector('#filter-city');
  if (!citySelect) return;
  const destinations = getFilteredDestinations();
  const cities = [...new Set(destinations.map(d => d.city))];
  citySelect.innerHTML = '<option value="">Todas las ciudades</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
}

function getFilteredDestinations() {
  const destinations = state.regions.flatMap(r => r.countries.flatMap(c => c.destinations.map(d => ({ ...d, region: r.name, country: c.name }))));
  return destinations.filter(d => {
    const byRegion = state.selectedRegion ? d.region === state.selectedRegion : true;
    const byCountry = state.selectedCountry ? d.country === state.selectedCountry : true;
    const byCity = state.selectedCity ? d.city === state.selectedCity : true;
    return byRegion && byCountry && byCity;
  });
}

function renderDestinations() {
  const container = document.querySelector('#destinations-grid');
  if (!container) return;
  const template = document.querySelector('#card-destination-template');
  container.innerHTML = '';
  getFilteredDestinations().forEach(dest => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('article');
    const img = node.querySelector('img');
    img.src = dest.image;
    img.alt = `${dest.city}, ${dest.country}`;
    node.querySelector('.card__badge').textContent = dest.city;
    node.querySelector('.card__title').textContent = dest.title;
    node.querySelector('.card__meta').textContent = `${dest.country} • ${dest.region}`;
    node.querySelector('.card__description').textContent = dest.shortDescription;
    node.querySelector('[itemprop="price"]').textContent = `$${dest.priceFrom}`;
    const link = node.querySelector('.card__cta');
    link.href = `/pages/destination.html?id=${dest.id}`;
    const quoteBtn = node.querySelector('.js-quote');
    quoteBtn.addEventListener('click', () => openQuoteModal(dest));
    const payBtn = node.querySelector('.js-wetravel');
    payBtn.href = dest.checkout_url;
    payBtn.setAttribute('aria-hidden', 'true');
    article.dataset.animate = '';
    container.appendChild(node);
  });
  observeAnimations();
  renderCities();
}

function renderPromotions() {
  const container = document.querySelector('#promo-slider');
  if (!container) return;
  container.innerHTML = '';
  state.promotions.forEach(promo => {
    const card = document.createElement('article');
    card.className = 'promo';
    card.innerHTML = `
      <div class="card__media">
        <img class="card__image" src="${promo.image}" alt="${promo.title}" loading="lazy" />
        <span class="promo__discount">${promo.discount}</span>
      </div>
      <div class="promo__body">
        <h3 class="card__title">${promo.title}</h3>
        <p class="card__description">${promo.description}</p>
        <div class="promo__price">
          <span>Desde $${promo.price}</span>
          <span class="promo__price-old">$${promo.oldPrice}</span>
        </div>
        <div class="card__actions">
          <button class="btn btn--ghost js-quote" type="button">Cotizar</button>
          <a class="btn btn--primary js-wetravel" href="${promo.checkout_url}" target="_blank" rel="noopener" aria-hidden="true" style="display:none;">Pagar con WeTravel</a>
        </div>
      </div>`;
    card.querySelector('.js-quote').addEventListener('click', () => openQuoteModal({ title: promo.title }));
    container.appendChild(card);
  });
}

function renderBlog() {
  const container = document.querySelector('#blog-grid');
  if (!container) return;
  container.innerHTML = '';
  state.blog.forEach(post => {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.innerHTML = `
      <div class="card__media">
        <img class="card__image" src="${post.image}" alt="${post.title}" loading="lazy" />
      </div>
      <div class="blog-card__body">
        <p class="card__meta">${new Date(post.date).toLocaleDateString('es-ES')} · ${post.author}</p>
        <h3 class="card__title">${post.title}</h3>
        <p class="card__description">${post.excerpt}</p>
        <a class="btn btn--ghost" href="/pages/blog.html#${post.id}">Leer más</a>
      </div>`;
    container.appendChild(card);
  });
}

function renderPartners() {
  const track = document.querySelector('#partners-track');
  const dots = document.querySelector('#partners-dots');
  if (!track) return;
  track.innerHTML = '';
  state.partners.forEach(partner => {
    const link = document.createElement('a');
    link.href = partner.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'partners__item';
    link.innerHTML = `<img class="partners__logo" src="${partner.logo}" alt="${partner.name}" loading="lazy" />`;
    track.appendChild(link);
  });
  if (dots) {
    dots.innerHTML = '';
    state.partners.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'partners__dot' + (index === state.partnerIndex ? ' is-active' : '');
      dot.setAttribute('aria-label', `Ir a socio ${index + 1}`);
      dot.addEventListener('click', () => goToPartner(index));
      dots.appendChild(dot);
    });
  }
  setupPartnerControls();
}

function setupPartnerControls() {
  const prev = document.getElementById('partners-prev');
  const next = document.getElementById('partners-next');
  prev?.addEventListener('click', () => movePartner(-1));
  next?.addEventListener('click', () => movePartner(1));
  startPartnerAuto();
}

function movePartner(step) {
  const total = state.partners.length;
  state.partnerIndex = (state.partnerIndex + step + total) % total;
  applyPartnerTransform();
}

function goToPartner(index) {
  state.partnerIndex = index;
  applyPartnerTransform();
}

function applyPartnerTransform() {
  const track = document.getElementById('partners-track');
  const dots = document.querySelectorAll('.partners__dot');
  const STEP = 190;
  if (track) {
    track.style.transform = `translateX(-${state.partnerIndex * STEP}px)`;
  }
  dots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === state.partnerIndex);
  });
  startPartnerAuto();
}

function startPartnerAuto() {
  clearInterval(partnerTimer);
  partnerTimer = setInterval(() => movePartner(1), 4500);
}

function setupFilters() {
  const regionSelect = document.querySelector('#filter-region');
  const countrySelect = document.querySelector('#filter-country');
  const citySelect = document.querySelector('#filter-city');
  regionSelect?.addEventListener('change', (e) => {
    state.selectedRegion = e.target.value;
    state.selectedCountry = '';
    renderCountries();
    renderDestinations();
  });
  countrySelect?.addEventListener('change', (e) => {
    state.selectedCountry = e.target.value;
    renderDestinations();
  });
  citySelect?.addEventListener('change', (e) => {
    state.selectedCity = e.target.value;
    renderDestinations();
  });
}

function observeAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

function openQuoteModal(dest) {
  const modal = document.getElementById('quote-modal');
  if (!modal) return;
  modal.classList.add('modal--open');
  const destinationField = modal.querySelector('#quote-destination');
  if (destinationField && dest.title) destinationField.value = dest.title;
  modal.querySelector('#quote-status').textContent = '';
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  modal?.classList.remove('modal--open');
}

function setupModals() {
  document.querySelectorAll('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeQuoteModal));
  document.getElementById('quote-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'quote-modal') closeQuoteModal();
  });
}

function injectSchema(travelData) {
  const offers = travelData.regions.flatMap(r => r.countries.flatMap(c => c.destinations.map(d => ({
    '@type': 'Offer',
    name: d.title,
    price: d.priceFrom,
    priceCurrency: 'USD',
    url: `${location.origin}/pages/destination.html?id=${d.id}`,
    description: d.shortDescription,
    areaServed: d.region,
    image: d.image
  }))));
  const promos = travelData.promotions.map(p => ({
    '@type': 'Offer',
    name: p.title,
    price: p.price,
    priceCurrency: 'USD',
    url: p.checkout_url,
    description: p.description,
    image: p.image
  }));
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Visiting World',
    url: location.origin,
    makesOffer: [...offers, ...promos]
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
  setupFilters();
  setupModals();
  loadData().catch(err => console.error(err));
});
