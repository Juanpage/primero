/* ===================================================
   VISITING WORLD - MAIN.JS
   100% funcional con index + CSS provistos
=================================================== */

// ---------- Elementos base
const destinosContainer = document.getElementById("destinosContainer");
const regionFilter       = document.getElementById("regionFilter");
const countrySearch      = document.getElementById("countrySearch");
const toTop              = document.getElementById("toTop");

// Modales
const modalDetalles = document.getElementById("modalDetalles");
const modalCotizar  = document.getElementById("modalCotizar");

// Datos globales
let DATA = { destinos: [], promos: [] };

// Estado de modales
let activeModal = null;
let lastFocusedTrigger = null;

// ================ Utilidades UI ================
const focusableSelector = [
  "button",
  "[href]",
  "input",
  "select",
  "textarea",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

const openModal = (el, trigger) => {
  if (!el) return;
  lastFocusedTrigger = trigger || document.activeElement;
  el.setAttribute("aria-hidden", "false");
  activeModal = el;

  const focusTarget = el.querySelector("[data-autofocus]") || el.querySelector(focusableSelector);
  if (focusTarget) {
    focusTarget.focus();
  } else {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus();
  }
};

const closeModal = (el) => {
  if (!el) return;
  el.setAttribute("aria-hidden", "true");
  if (activeModal === el) activeModal = null;

  if (el === modalDetalles) {
    document.getElementById("panelPDF").classList.add("hidden");
    document.getElementById("panelDetalle").classList.remove("hidden");
    document.getElementById("pdfFrame").src = "";
  }

  if (lastFocusedTrigger) {
    lastFocusedTrigger.focus();
    lastFocusedTrigger = null;
  }
};

// Cerrar por botón [data-close]
document.addEventListener("click", (event) => {
  const closeBtn = event.target.closest("[data-close]");
  if (!closeBtn) return;

  event.preventDefault();

  const targetId = closeBtn.getAttribute("data-close")?.trim();
  const modal = targetId ? document.getElementById(targetId) : null;
  const resolvedModal = modal || closeBtn.closest(".modal") || activeModal;

  if (resolvedModal) closeModal(resolvedModal);
});

// Cerrar al pulsar sobre el overlay
[modalDetalles, modalCotizar].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
});

// Teclas de accesibilidad (Escape + Tab)
window.addEventListener("keydown", (event)=>{
  if (!activeModal) return;

  if (event.key === "Escape") {
    closeModal(activeModal);
    return;
  }

  if (event.key !== "Tab") return;

  const focusables = Array.from(activeModal.querySelectorAll(focusableSelector))
    .filter(el => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
  if (!focusables.length) {
    event.preventDefault();
    activeModal.focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const isShift = event.shiftKey;
  const active = document.activeElement;

  if (isShift) {
    if (active === first || !activeModal.contains(active)) {
      event.preventDefault();
      last.focus();
    }
    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus();
  }
});

// ================ Cargar datos (JSON) ================
async function cargarDatos(){
  try{
    const res = await fetch("assets/data/destinations.json", {cache:"no-cache"});
    if(!res.ok) throw new Error("No se pudo cargar el JSON");
    DATA = await res.json();
  }catch(err){
    console.error("Error cargando datos:", err);
    DATA = {destinos:[],promos:[]};
  }
}

// ================ Filtros dinámicos ================
function cargarFiltros(){
  const regiones = [...new Set(DATA.destinos.map(d=>d.region))];
  regiones.sort().forEach(r=>{
    const opt = document.createElement("option");
    opt.value = r; opt.textContent = r;
    regionFilter.appendChild(opt);
  });
}

// ================ Render Destinos (agrupado por país) ================
function renderDestinos(){
  const filtro = regionFilter.value;
  const q = (countrySearch.value||"").toLowerCase();

  // Filtrar
  let items = DATA.destinos.filter(d=>{
    const matchRegion = (filtro==="all" || d.region===filtro);
    const matchText   = d.country.toLowerCase().includes(q) || d.items.some(i=>i.city.toLowerCase().includes(q));
    return matchRegion && matchText;
  });

  // Agrupar por país
  destinosContainer.innerHTML = "";
  if (!items.length){
    destinosContainer.innerHTML = `<p class="muted" style="text-align:center">No se encontraron destinos.</p>`;
    return;
  }

  items.forEach(pais=>{
    const group = document.createElement("div");
    group.className = "country-group";

    const title = document.createElement("h3");
    title.innerHTML = `<span class="muted">${abreviaPais(pais.country)}</span> ${pais.country}`;
    group.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid-destinos";

    pais.items.forEach(i=>{
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${i.img}" alt="${i.city}">
        <div class="card-body">
          <div>
            <h4>${i.city}</h4>
            <p>${i.desc}</p>
          </div>
          <div class="card-buttons">
            <button class="btn btn-outline"
              data-action="detalle"
              data-img="${i.img}"
              data-title="${i.city}, ${pais.country}"
              data-desc="${i.desc}"
              data-pdf="${i.pdf}">
              <i class="fa-regular fa-eye"></i> Ver más detalles
            </button>
            <button class="btn btn-primary"
              data-action="cotizar"
              data-destino="${i.city}, ${pais.country}">
              <i class="fa-solid fa-bolt"></i> Cotizar
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    group.appendChild(grid);
    destinosContainer.appendChild(group);
  });
}

function abreviaPais(nombre){
  // Abreviación simple (2 letras). Puedes personalizar si quieres ISO.
  return nombre.slice(0,2).toUpperCase();
}

// ================ Delegación de eventos en tarjetas ================
destinosContainer.addEventListener("click", (e)=>{
  const btn = e.target.closest("button[data-action]");
  if(!btn) return;
  const action = btn.getAttribute("data-action");

  if (action === "detalle"){
    const img   = btn.getAttribute("data-img");
    const title = btn.getAttribute("data-title");
    const desc  = btn.getAttribute("data-desc");
    const pdf   = btn.getAttribute("data-pdf");

    document.getElementById("panelPDF").classList.add("hidden");
    document.getElementById("panelDetalle").classList.remove("hidden");

    const detalleImg = document.getElementById("detalleImg");
    detalleImg.src = img;
    detalleImg.alt = title;
    document.getElementById("detalleTitulo").textContent = title;
    document.getElementById("detalleDescripcion").textContent = desc;

    // Configurar PDF
    const verPDFBtn = document.getElementById("detallePDF");
    verPDFBtn.onclick = ()=>{
      document.getElementById("panelDetalle").classList.add("hidden");
      document.getElementById("panelPDF").classList.remove("hidden");
      const pdfFrame = document.getElementById("pdfFrame");
      pdfFrame.src = pdf;
      document.getElementById("pdfAbrirNueva").href = pdf;
    };

    // Cotizar desde modal
    const cotBtn = document.getElementById("detalleCotizar");
    cotBtn.onclick = ()=>{
      closeModal(modalDetalles);
      abrirCotizar(title, cotBtn);
    };

    openModal(modalDetalles, btn);
  }

  if (action === "cotizar"){
    abrirCotizar(btn.getAttribute("data-destino"), btn);
  }
});

// ================ Cotización ================
function abrirCotizar(destino, trigger){
  document.getElementById("cotizarDestinoLbl").textContent = `Destino seleccionado: ${destino}`;
  const destinoInput = document.getElementById("qDestino");
  destinoInput.value = destino;
  openModal(modalCotizar, trigger);
}

// Volver desde PDF a detalle
document.getElementById("pdfVolver").addEventListener("click", ()=>{
  document.getElementById("panelPDF").classList.add("hidden");
  document.getElementById("panelDetalle").classList.remove("hidden");
  document.getElementById("pdfFrame").src = "";
});

// Form de contacto
document.getElementById("contactForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  document.getElementById("contactFeedback").textContent = "✅ Mensaje enviado correctamente.";
  e.target.reset();
});

// Form de cotización
document.getElementById("quoteForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  document.getElementById("quoteFeedback").textContent = "✅ Cotización enviada con éxito.";
  e.target.reset();
});

// ================ Swiper Promos ================
function renderPromos(){
  const wrapper = document.getElementById("promoSlides");
  wrapper.innerHTML = "";

  DATA.promos.forEach(p=>{
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `
      <div class="promo-card">
        <img src="${p.img}" alt="${p.title}">
        <div class="promo-info">
          <h3>${p.title}</h3>
          <p>${p.text}</p>
          <strong>${p.price||""}</strong>
          <div style="margin-top:.7rem;display:flex;gap:.5rem;justify-content:center">
            <a class="btn btn-outline" href="${p.linkPDF}" target="_blank"><i class="fa-regular fa-file-pdf"></i> Ver PDF</a>
            <button class="btn btn-primary" data-action="cotizar" data-destino="${p.destino}"><i class="fa-solid fa-bolt"></i> Cotizar</button>
          </div>
        </div>
      </div>
    `;
    wrapper.appendChild(slide);
  });

  // Inicializa Swiper
  new Swiper(".swiper",{
    loop:true,
    autoplay:{delay:3500},
    spaceBetween:20,
    slidesPerView:1,
    pagination:{el:".swiper-pagination",clickable:true},
    navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"},
    breakpoints:{768:{slidesPerView:2},1024:{slidesPerView:3}}
  });
}

// ================ Interacciones adic. ================
const btnCotizarTop = document.getElementById("btnCotizarTop");
btnCotizarTop.addEventListener("click", ()=> abrirCotizar("Cotización general", btnCotizarTop));

const btnCotizacionHero = document.getElementById("btnCotizacionHero");
btnCotizacionHero.addEventListener("click", ()=> {
  document.getElementById("qNombre")?.focus();
  abrirCotizar("Cotización general", btnCotizacionHero);
});

// Filtros
regionFilter.addEventListener("change", renderDestinos);
countrySearch.addEventListener("input", renderDestinos);

// To top
window.addEventListener("scroll", ()=>{
  if (window.scrollY > 420) toTop.classList.add("show");
  else toTop.classList.remove("show");
});
toTop.addEventListener("click", ()=> window.scrollTo({top:0,behavior:"smooth"}));

// Año footer
document.getElementById("year").textContent = new Date().getFullYear();

// ================ Init ================
(async function init(){
  await cargarDatos();
  cargarFiltros();
  renderDestinos();
  renderPromos();
})();
// === NAVBAR SCROLL EFFECT ===
// Navbar scroll visual
window.addEventListener("scroll", ()=>{
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 60) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
});
