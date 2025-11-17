/* --------------------------------------------------------------------------
 * Visiting World – scripts principales
 * Mantiene la lógica original con mejoras de estilo y legibilidad.
 * -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Base de nodos y elementos interactivos                                */
/* -------------------------------------------------------------------------- */
const destinosContainer = document.getElementById("destinosContainer");
const regionFilter = document.getElementById("regionFilter");
const countrySearch = document.getElementById("countrySearch");
const toTop = document.getElementById("toTop");
const contactForm = document.getElementById("contactForm");
const contactFeedback = document.getElementById("contactFeedback");
const formSubmitRelay = document.getElementById("formSubmitRelay");
const navbar = document.querySelector(".navbar");
const yearEl = document.getElementById("year");

/* Modales y paneles */
const modalDetalles = document.getElementById("modalDetalles");
const modalCotizar = document.getElementById("modalCotizar");
const panelDetalle = document.getElementById("panelDetalle");
const panelPDF = document.getElementById("panelPDF");
const detalleImg = document.getElementById("detalleImg");
const detalleTitulo = document.getElementById("detalleTitulo");
const detalleDescripcion = document.getElementById("detalleDescripcion");
const detallePDFBtn = document.getElementById("detallePDF");
const detalleCotizarBtn = document.getElementById("detalleCotizar");
const pdfFrame = document.getElementById("pdfFrame");
const pdfAbrirNueva = document.getElementById("pdfAbrirNueva");
const pdfVolver = document.getElementById("pdfVolver");
const cotizarDestinoLbl = document.getElementById("cotizarDestinoLbl");
const qDestinoInput = document.getElementById("qDestino");

/* Secciones dinámicas */
const promoSlides = document.getElementById("promoSlides");
const btnCotizarTop = document.getElementById("btnCotizarTop");
const btnCotizacionHero = document.getElementById("btnCotizacionHero");
const heroVideo = document.getElementById("heroVideo");

/* Formularios de cotización */
const quoteForm = document.getElementById("quoteForm");
const quoteFeedbackEl = document.getElementById("quoteFeedback");
const qNombreInput = document.getElementById("qNombre");
const quoteSubmitBtn = quoteForm?.querySelector("button[type='submit'], input[type='submit']");
const contactSubmitBtn = contactForm?.querySelector("button[type='submit'], input[type='submit']");
const FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/commercial@visitingalapagos.com";
const FORM_SUBMIT_CC = "webmaster@visitingalapagos.com";

if (quoteSubmitBtn && !quoteSubmitBtn.dataset.originalMarkup) {
  if (quoteSubmitBtn.tagName === "BUTTON") {
    quoteSubmitBtn.dataset.originalMarkup = quoteSubmitBtn.innerHTML;
  } else {
    quoteSubmitBtn.dataset.originalMarkup = quoteSubmitBtn.value || "Enviar";
  }
}

if (contactSubmitBtn && !contactSubmitBtn.dataset.originalMarkup) {
  if (contactSubmitBtn.tagName === "BUTTON") {
    contactSubmitBtn.dataset.originalMarkup = contactSubmitBtn.innerHTML;
  } else {
    contactSubmitBtn.dataset.originalMarkup = contactSubmitBtn.value || "Enviar";
  }
}

// El modal de detalle no utiliza la equis de cierre incluida en el HTML.
modalDetalles?.querySelector(".close-x")?.remove();

/* -------------------------------------------------------------------------- */
/* Hero animado generado con canvas                                           */
/* -------------------------------------------------------------------------- */
if (heroVideo) {
  heroVideo.classList.add("is-paused");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const canStream = ctx && typeof canvas.captureStream === "function";

  if (!canStream) {
    heroVideo.classList.add("is-paused");
  } else {
    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    const stream = canvas.captureStream(30);
    heroVideo.srcObject = stream;
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;

    const ensurePlaying = () => {
      const playPromise = heroVideo.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    };

    heroVideo.addEventListener("loadedmetadata", ensurePlaying, { once: true });
    heroVideo.addEventListener("play", () => heroVideo.classList.remove("is-paused"));
    heroVideo.addEventListener("pause", () => heroVideo.classList.add("is-paused"));

    const drawFrame = (time) => {
      const t = time / 1000;

      ctx.clearRect(0, 0, width, height);

      const baseGradient = ctx.createLinearGradient(0, 0, width, height);
      baseGradient.addColorStop(0, `hsl(${(205 + Math.sin(t * 0.6) * 18 + 360) % 360}, 72%, 34%)`);
      baseGradient.addColorStop(0.55, `hsl(${(190 + Math.cos(t * 0.45) * 24 + 360) % 360}, 68%, 38%)`);
      baseGradient.addColorStop(1, `hsl(${(170 + Math.sin(t * 0.35) * 20 + 360) % 360}, 60%, 36%)`);
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 3; i += 1) {
        const phase = t * (0.3 + i * 0.1);
        const centerX = width * (0.3 + i * 0.25 + Math.sin(phase) * 0.08);
        const centerY = height * (0.4 + Math.cos(phase * 1.3) * 0.12);
        const radius = height * (0.55 + i * 0.12);

        const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        glow.addColorStop(0, `hsla(${(220 + i * 28 + t * 20) % 360}, 85%, 68%, 0.55)`);
        glow.addColorStop(0.6, `hsla(${(200 + i * 22 + t * 12) % 360}, 72%, 58%, 0.32)`);
        glow.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      const waveHeight = height * 0.18;
      const waveOffset = t * 1.4;
      ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 16) {
        const progress = (x / width) * Math.PI * 2;
        const y = height - waveHeight + Math.sin(progress + waveOffset) * 22;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      requestAnimationFrame(drawFrame);
    };

    ensurePlaying();
    requestAnimationFrame(drawFrame);
  }
}

/* -------------------------------------------------------------------------- */
/* Estado y datos cargados desde el JSON                                    */
/* -------------------------------------------------------------------------- */
let DATA = { destinos: [], promos: [] };

let activeModal = null;
let lastFocusedTrigger = null;
let contactFeedbackTimeoutId;

/* -------------------------------------------------------------------------- */
/* Utilidades de feedback y lectura de campos                               */
/* -------------------------------------------------------------------------- */
const setQuoteFeedback = (message = "", isError = false) => {
  if (!quoteFeedbackEl) return;

  if (!message.trim()) {
    quoteFeedbackEl.textContent = "";
    quoteFeedbackEl.classList.remove("is-visible", "is-error");
    return;
  }

  quoteFeedbackEl.textContent = message;
  quoteFeedbackEl.classList.add("is-visible");

  if (isError) quoteFeedbackEl.classList.add("is-error");
  else quoteFeedbackEl.classList.remove("is-error");
};

const readFieldValue = (form, ...lookups) => {
  if (!form) return "";

  for (const lookupRaw of lookups) {
    if (!lookupRaw) continue;

    const lookup = lookupRaw.trim();
    if (!lookup) continue;

    if (lookup.startsWith("#") || lookup.startsWith("[")) {
      const node = form.querySelector(lookup);
      if (node && typeof node.value === "string") return node.value.trim();
      continue;
    }

    const control = form.elements.namedItem?.(lookup);
    if (control && typeof control.value === "string") return control.value.trim();
  }

  return "";
};

const resolveFieldValue = (form, fallbackSelectors) => {
  if (!form) return "";
  for (const selector of fallbackSelectors) {
    const node = form.querySelector(selector);
    if (node && typeof node.value === "string") {
      const value = node.value.trim();
      if (value) return value;
    }
  }
  return "";
};

const setContactFeedback = (message = "", type = "") => {
  if (!contactFeedback) return;

  clearTimeout(contactFeedbackTimeoutId);

  contactFeedback.classList.remove("is-success", "is-error", "is-visible");

  if (!message.trim()) {
    contactFeedback.textContent = "";
    return;
  }

  contactFeedback.textContent = message;

  if (type === "success") {
    contactFeedback.classList.add("is-success");
  } else if (type === "error") {
    contactFeedback.classList.add("is-error");
  }

  contactFeedback.classList.add("is-visible");

  if (type === "success") {
    contactFeedbackTimeoutId = window.setTimeout(() => {
      contactFeedback.classList.remove("is-visible", "is-success", "is-error");
      contactFeedback.textContent = "";
    }, 6000);
  }
};

const setButtonLabel = (btn, label) => {
  if (!btn) return;
  if (btn.tagName === "BUTTON") {
    btn.innerHTML = label;
  } else {
    btn.value = label;
  }
};

const setButtonLoadingState = (btn, isLoading, loadingLabel = "Enviando...") => {
  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.setAttribute("data-loading", "true");
    setButtonLabel(btn, loadingLabel);
    return;
  }

  btn.removeAttribute("data-loading");
  btn.disabled = false;
  const originalMarkup = btn.dataset.originalMarkup;
  if (originalMarkup) {
    setButtonLabel(btn, originalMarkup);
  } else {
    setButtonLabel(btn, "Enviar");
  }
};

const escapeAttrValue = (value = "") => {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return String(value).replace(/"/g, '\\"');
};

const setHiddenInputValue = (form, name, value = "") => {
  if (!form || !name) return null;

  const selector = `input[name="${escapeAttrValue(name)}"]`;
  let input = form.querySelector(selector);

  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    form.appendChild(input);
  }

  input.value = typeof value === "string" ? value : value ?? "";
  return input;
};

const submitViaHiddenRelay = (entries = []) => {
  if (!formSubmitRelay) return false;

  entries.forEach(([name, value]) => {
    setHiddenInputValue(formSubmitRelay, name, value);
  });

  try {
    formSubmitRelay.submit();
    return true;
  } catch (err) {
    console.error("No se pudo ejecutar el formulario oculto de respaldo", err);
    return false;
  }
};

const submitFormSubmitRequest = async (formData, { contextLabel = "el formulario" } = {}) => {
  if (formData && FORM_SUBMIT_CC) {
    formData.set("_cc", FORM_SUBMIT_CC);
  }

  const entries = Array.from(formData.entries());

  try {
    const response = await fetch(FORM_SUBMIT_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) throw new Error(`Estado inesperado: ${response.status}`);

    await response.json().catch(() => ({}));
    return { ok: true, usedFallback: false };
  } catch (err) {
    console.error(`No se pudo enviar ${contextLabel}`, err);
    const fallbackUsed = submitViaHiddenRelay(entries);
    return { ok: fallbackUsed, usedFallback: fallbackUsed, error: err };
  }
};

/* -------------------------------------------------------------------------- */
/* Utilidades de interfaz y accesibilidad                                   */
/* -------------------------------------------------------------------------- */
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
    panelPDF?.classList.add("hidden");
    panelDetalle?.classList.remove("hidden");
    if (pdfFrame) pdfFrame.src = "";
  }

  if (lastFocusedTrigger) {
    lastFocusedTrigger.focus();
    lastFocusedTrigger = null;
  }
};

const modalCloseSelectors = "[data-close], [data-role='close'], .close-x";

function setupModal(modal) {
  if (!modal) return;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
      return;
    }

    const closeTrigger = event.target.closest(modalCloseSelectors);
    if (!closeTrigger) return;

    event.preventDefault();

    if (
      closeTrigger.tagName === "BUTTON" &&
      !closeTrigger.hasAttribute("type")
    ) {
      closeTrigger.type = "button";
    }

    const targetId = closeTrigger.getAttribute("data-close");
    const normalizedId = targetId ? targetId.replace(/^#/, "").trim() : "";
    const targetModal = normalizedId ? document.getElementById(normalizedId) : null;

    closeModal(targetModal || modal);
  });
}

[modalDetalles, modalCotizar].forEach(setupModal);

// Teclas de accesibilidad (Escape + Tab)
const handleGlobalKeydown = (event) => {
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
};

window.addEventListener("keydown", handleGlobalKeydown);

/* -------------------------------------------------------------------------- */
/* Carga de datos desde el JSON                                               */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* Construcción dinámica de filtros                                          */
/* -------------------------------------------------------------------------- */
function cargarFiltros(){
  if (!regionFilter || !Array.isArray(DATA.destinos)) return;

  const regiones = [...new Set(DATA.destinos.map(d=>d.region).filter(Boolean))].sort();
  const fragment = document.createDocumentFragment();

  regiones.forEach((region)=>{
    if (!region) return;
    const opt = document.createElement("option");
    opt.value = region;
    opt.textContent = region;
    fragment.appendChild(opt);
  });

  regionFilter.appendChild(fragment);
}

/* -------------------------------------------------------------------------- */
/* Renderizado de destinos agrupados por país                                */
/* -------------------------------------------------------------------------- */
function renderDestinos(){
  if (!destinosContainer) return;

  const filtro = regionFilter?.value || "all";
  const q = (countrySearch?.value || "").toLowerCase();

  // Filtrar
  const items = (DATA.destinos || []).filter(d=>{
    if (!d || !d.country || !Array.isArray(d.items)) return false;
    const matchRegion = (filtro==="all" || d.region===filtro);
    const searchTarget = `${d.country} ${d.items.map(i=>i.city).join(" ")}`.toLowerCase();
    const matchText   = !q || searchTarget.includes(q);
    return matchRegion && matchText;
  });

  // Agrupar por país
  destinosContainer.innerHTML = "";
  if (!items.length){
    destinosContainer.innerHTML = `<p class="muted" style="text-align:center">No se encontraron destinos.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach(pais=>{
    const group = document.createElement("div");
    group.className = "country-group";

    const title = document.createElement("h3");
    const flagText = pais.flag || abreviaPais(pais.country);
    const flagClass = pais.flag ? "" : " class=\"muted\"";
    title.innerHTML = `<span${flagClass}>${flagText}</span> ${pais.country}`;
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
    fragment.appendChild(group);
  });

  destinosContainer.appendChild(fragment);
}

function abreviaPais(nombre){
  // Abreviación simple (2 letras). Puedes personalizar si quieres ISO.
  return (nombre || "").slice(0,2).toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* Delegación de eventos en tarjetas y promociones                            */
/* -------------------------------------------------------------------------- */
const handleActionClick = (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.getAttribute("data-action");

  if (action === "detalle") {
    const img = btn.getAttribute("data-img");
    const title = btn.getAttribute("data-title");
    const desc = btn.getAttribute("data-desc");
    const pdf = btn.getAttribute("data-pdf");

    panelPDF?.classList.add("hidden");
    panelDetalle?.classList.remove("hidden");

    if (detalleImg) {
      detalleImg.src = img;
      detalleImg.alt = title || "";
    }

    if (detalleTitulo) detalleTitulo.textContent = title || "";
    if (detalleDescripcion) detalleDescripcion.textContent = desc || "";

    if (detallePDFBtn) {
      detallePDFBtn.onclick = () => {
        panelDetalle?.classList.add("hidden");
        panelPDF?.classList.remove("hidden");
        if (pdfFrame) pdfFrame.src = pdf;
        if (pdfAbrirNueva) pdfAbrirNueva.href = pdf || "";
      };
    }

    if (detalleCotizarBtn) {
      detalleCotizarBtn.onclick = () => {
        closeModal(modalDetalles);
        abrirCotizar(title, detalleCotizarBtn);
      };
    }

    openModal(modalDetalles, btn);
    return;
  }

  if (action === "cotizar") {
    const destino = btn.getAttribute("data-destino") || btn.getAttribute("data-title") || "Cotización general";
    abrirCotizar(destino, btn);
  }
};

destinosContainer?.addEventListener("click", handleActionClick);
promoSlides?.addEventListener("click", handleActionClick);

/* -------------------------------------------------------------------------- */
/* Flujo del modal de cotización                                             */
/* -------------------------------------------------------------------------- */
function abrirCotizar(destino, trigger){
  if (cotizarDestinoLbl) {
    cotizarDestinoLbl.textContent = `Destino seleccionado: ${destino}`;
  }
  if (qDestinoInput) {
    qDestinoInput.value = destino;
  }
  setQuoteFeedback("");

  if (quoteSubmitBtn) {
    quoteSubmitBtn.classList.remove("hidden");
    quoteSubmitBtn.disabled = false;
    quoteSubmitBtn.removeAttribute("data-loading");
    const originalMarkup = quoteSubmitBtn.dataset.originalMarkup;
    if (originalMarkup) {
      if (quoteSubmitBtn.tagName === "BUTTON") {
        quoteSubmitBtn.innerHTML = originalMarkup;
      } else {
        quoteSubmitBtn.value = originalMarkup;
      }
    }
  }

  openModal(modalCotizar, trigger);

  if (qNombreInput) {
    requestAnimationFrame(()=> qNombreInput.focus());
  }
}

// Volver desde PDF a detalle
pdfVolver?.addEventListener("click", ()=>{
  panelPDF?.classList.add("hidden");
  panelDetalle?.classList.remove("hidden");
  if (pdfFrame) pdfFrame.src = "";
});

// Form de contacto
contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.currentTarget;

  const nombre = readFieldValue(form, "nombre", "#name");
  const correo = readFieldValue(form, "email", "#email");
  const asunto = readFieldValue(form, "subject", "#subject");
  const mensaje = readFieldValue(form, "mensaje", "#message");

  if (!nombre || !correo || !mensaje) {
    setContactFeedback("Por favor completa los campos requeridos antes de enviar.", "error");
    return;
  }

  setContactFeedback("Enviando mensaje...", "pending");
  setButtonLoadingState(contactSubmitBtn, true, "Enviando...");

  const payload = new FormData();
  payload.append("Nombre", nombre);
  payload.append("Correo", correo);
  payload.append("_replyto", correo);
  payload.append("Asunto", asunto || "Sin asunto");
  payload.append("Mensaje", mensaje);
  payload.append("_subject", `Nuevo mensaje de contacto - ${nombre || "Visiting World"}`);
  payload.append("_template", "table");
  payload.append("_captcha", "false");

  const { ok } = await submitFormSubmitRequest(payload, { contextLabel: "el mensaje de contacto" });

  if (ok) {
    form.reset();
    setContactFeedback("Mensaje enviado correctamente.", "success");
  } else {
    setContactFeedback("No pudimos enviar tu mensaje. Inténtalo nuevamente o escríbenos por WhatsApp.", "error");
  }

  setButtonLoadingState(contactSubmitBtn, false);
});

// Form de cotización
quoteForm?.addEventListener("submit", async (e)=>{
  e.preventDefault();

  setQuoteFeedback("");

  const form = e.currentTarget;
  const nombre =
    readFieldValue(
      form,
      "#qNombre",
      "[name='qNombre']",
      "[name='nombre']",
      "[name='name']",
      "qNombre",
      "nombre",
      "name"
    ) ||
    resolveFieldValue(form, [
      "input[name*='nombre' i]",
      "input[id*='nombre' i]",
      "input[placeholder*='nombre' i]",
      "input[name*='name' i]",
      "input[id*='name' i]"
    ]);

  const correo =
    readFieldValue(
      form,
      "#qEmail",
      "#qCorreo",
      "[name='qCorreo']",
      "[name='correo']",
      "[name='email']",
      "qCorreo",
      "correo",
      "email"
    ) ||
    resolveFieldValue(form, [
      "input[type='email']",
      "input[name*='correo' i]",
      "input[id*='correo' i]",
      "input[placeholder*='correo' i]",
      "input[name*='email' i]",
      "input[id*='email' i]",
      "input[placeholder*='email' i]"
    ]);
  const destino = readFieldValue(form, "#qDestino", "[name='qDestino']", "qDestino", "destino") || "";
  const fecha = readFieldValue(form, "#qFecha", "[name='qFecha']", "qFecha", "fecha") || "";
  const personas = readFieldValue(form, "#qPersonas", "[name='qPersonas']", "qPersonas", "personas") || "";
  const preferencias =
    readFieldValue(
      form,
      "#qPreferencias",
      "[name='qPreferencias']",
      "#qNotas",
      "[name='qNotas']",
      "qPreferencias",
      "preferencias",
      "qNotas",
      "notas"
    ) ||
    resolveFieldValue(form, [
      "textarea[name*='preferenc' i]",
      "textarea[id*='preferenc' i]",
      "textarea[name*='nota' i]",
      "textarea[id*='nota' i]"
    ]);

  if (!nombre || !correo) {
    setQuoteFeedback("Por favor ingresa tu nombre y correo para continuar.", true);
    return;
  }

  const emailPattern = /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(\.[\w-]+)+$/;
  if (!emailPattern.test(correo)) {
    setQuoteFeedback("El correo electrónico ingresado no es válido.", true);
    return;
  }

  const safeDestino = destino || "Cotización general";
  const submitBtn = form.querySelector("button[type='submit'], input[type='submit']");

  if (submitBtn && !submitBtn.dataset.originalMarkup) {
    if (submitBtn.tagName === "BUTTON") {
      submitBtn.dataset.originalMarkup = submitBtn.innerHTML;
    } else {
      submitBtn.dataset.originalMarkup = submitBtn.value || "Enviar";
    }
  }

  setButtonLoadingState(submitBtn, true, "Enviando...");

  setQuoteFeedback("Estamos enviando tu solicitud...", false);

  const payload = new FormData();
  payload.append("Nombre", nombre);
  payload.append("Correo", correo);
  payload.append("_replyto", correo);
  payload.append("Destino", safeDestino);
  payload.append("Fecha", fecha || "No especificada");
  payload.append("Personas", personas || "No especificado");
  payload.append("Preferencias", preferencias || "No especificadas");
  payload.append("_subject", `Solicitud de cotización - ${safeDestino}`);
  payload.append("_template", "table");
  payload.append("_captcha", "false");

  const { ok } = await submitFormSubmitRequest(payload, { contextLabel: "la solicitud de cotización" });

  if (ok) {
    setQuoteFeedback("Su requerimiento fue procesado, pronto una persona se pondrá en contacto contigo.");
    form.reset();
  } else {
    setQuoteFeedback("No pudimos enviar tu solicitud. Inténtalo nuevamente o contáctanos por WhatsApp.", true);
  }

  if (qDestinoInput) qDestinoInput.value = safeDestino;

  setButtonLoadingState(submitBtn, false);

  if (submitBtn) {
    if (ok) {
      submitBtn.classList.add("hidden");
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Carrusel de promociones (Swiper)                                          */
/* -------------------------------------------------------------------------- */
function renderPromos(){
  if (!promoSlides) return;

  promoSlides.innerHTML = "";
  const fragment = document.createDocumentFragment();

  (DATA.promos || []).forEach(p=>{
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
    fragment.appendChild(slide);
  });

  promoSlides.appendChild(fragment);

  // Inicializa Swiper
  if (typeof Swiper === "function") {
    new Swiper(".swiper",{
      loop: true,
      speed: 8000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      spaceBetween: 24,
      slidesPerView: 1,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Widgets flotantes: WhatsApp y chatbot                                     */
/* -------------------------------------------------------------------------- */
function createWhatsAppButton(){
  const anchor = document.createElement("a");
  anchor.className = "floating-button whatsapp-button";

  const rawNumber = document.body?.dataset?.whatsapp || "+593987770604";
  const digits = rawNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent("Hola, me gustaría recibir más información sobre los destinos de Visiting World.");
  const targetUrl = digits ? `https://wa.me/${digits}?text=${encodedMessage}` : `https://wa.me/?text=${encodedMessage}`;

  anchor.href = targetUrl;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.setAttribute("aria-label", "Abrir conversación de WhatsApp");
  anchor.innerHTML = "<i class=\"fa-brands fa-whatsapp\"></i>";

  return anchor;
}

function createChatbotWidget(){
  const wrapper = document.createElement("div");
  wrapper.className = "chatbot";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "floating-button chatbot-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "chatbotWindow");
  toggle.setAttribute("aria-label", "Abrir asistente virtual");
  toggle.innerHTML = "<i class=\"fa-solid fa-comments\"></i>";

  const windowEl = document.createElement("div");
  windowEl.className = "chatbot-window";
  windowEl.id = "chatbotWindow";
  windowEl.setAttribute("role", "dialog");
  windowEl.setAttribute("aria-modal", "false");
  windowEl.setAttribute("aria-hidden", "true");
  windowEl.setAttribute("aria-label", "Asistente virtual Visiting World");

  const header = document.createElement("div");
  header.className = "chatbot-header";

  const titleBox = document.createElement("div");
  titleBox.innerHTML = "<strong>Asistente virtual</strong><span>Respondemos tus dudas en segundos</span>";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "chatbot-close";
  closeBtn.setAttribute("aria-label", "Cerrar asistente virtual");
  closeBtn.innerHTML = "<i class=\"fa-solid fa-xmark\"></i>";

  header.appendChild(titleBox);
  header.appendChild(closeBtn);

  const messages = document.createElement("div");
  messages.className = "chatbot-messages";
  messages.id = "chatbotMessages";
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-live", "polite");
  messages.setAttribute("aria-relevant", "additions");

  const form = document.createElement("form");
  form.className = "chatbot-form";
  form.setAttribute("autocomplete", "off");

  const input = document.createElement("input");
  input.type = "text";
  input.name = "chatbotMessage";
  input.placeholder = "Escribe tu mensaje...";
  input.setAttribute("aria-label", "Mensaje para el asistente virtual");

  const sendBtn = document.createElement("button");
  sendBtn.type = "submit";
  sendBtn.textContent = "Enviar";

  form.appendChild(input);
  form.appendChild(sendBtn);

  windowEl.appendChild(header);
  windowEl.appendChild(messages);
  windowEl.appendChild(form);

  wrapper.appendChild(windowEl);
  wrapper.appendChild(toggle);

  let isOpen = false;
  let greeted = false;

  const conversationState = {
    stage: "idle",
    name: "",
    email: "",
    inquiry: ""
  };

  const timeFormatter = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const scrollToBottom = () => {
    messages.scrollTop = messages.scrollHeight;
  };

  const appendMessage = (role, text) => {
    const message = document.createElement("div");
    message.className = `chatbot-message ${role}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    message.appendChild(paragraph);

    const time = document.createElement("time");
    const now = new Date();
    time.dateTime = now.toISOString();
    time.textContent = timeFormatter.format(now);
    message.appendChild(time);

    messages.appendChild(message);
    scrollToBottom();
  };

  const resetConversation = () => {
    conversationState.stage = "idle";
    conversationState.name = "";
    conversationState.email = "";
    conversationState.inquiry = "";
  };

  const sendSummaryToWhatsApp = () => {
    const number = "593987770604";
    const summary = [
      conversationState.name ? `Hola, soy ${conversationState.name}.` : "Hola, soy un viajero interesado en Visiting World.",
      conversationState.inquiry ? `Estoy interesado en: ${conversationState.inquiry}.` : "Quisiera recibir más información sobre sus servicios.",
      conversationState.email ? `Mi correo es: ${conversationState.email}.` : ""
    ].filter(Boolean).join(" ");

    const encoded = encodeURIComponent(`${summary}\n(Mensaje enviado desde el asistente virtual de Visiting World)`);
    const url = `https://wa.me/${number}?text=${encoded}`;
    window.open(url, "_blank", "noopener");
    resetConversation();
  };

  const respondToMessage = (text) => {
    const normalized = text.trim();

    switch (conversationState.stage) {
      case "awaitingIdentity": {
        const emailMatch = normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

        if (!emailMatch) {
          appendMessage(
            "bot",
            "Necesito tu nombre y correo electrónico en un solo mensaje. Ejemplo: Laura Martínez - laura@example.com"
          );
          return;
        }

        conversationState.email = emailMatch[0];

        const namePart = normalized
          .replace(emailMatch[0], "")
          .replace(/[\-,:;]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        conversationState.name = namePart || "Viajero";
        appendMessage("bot", `Gracias, ${conversationState.name}. Cuéntame brevemente qué tipo de viaje o destino te interesa.`);
        conversationState.stage = "awaitingInquiry";
        return;
      }
      case "awaitingInquiry": {
        conversationState.inquiry = normalized || "Consulta general";
        appendMessage("bot", "Perfecto, voy a compartir tu información con nuestro equipo por WhatsApp para continuar la conversación.");
        conversationState.stage = "completed";
        setTimeout(()=>{
          sendSummaryToWhatsApp();
          appendMessage("bot", "¡Gracias por la información! He abierto una ventana con nuestro WhatsApp oficial (+593 98 777 0604). Pronto una persona se pondrá en contacto contigo.");
        }, 600);
        return;
      }
      default:
        break;
    }

    const fallback = normalized.toLowerCase();
    let response = "Gracias por escribirnos. Para ayudarte necesito tu nombre y correo electrónico en un solo mensaje.";

    if (/hola|buenas|saludos/.test(fallback)) {
      response = "¡Hola! Por favor envíame tu nombre y correo electrónico en un solo mensaje.";
      conversationState.stage = "awaitingIdentity";
    } else if (conversationState.stage === "idle") {
      response = "Para comenzar, indícame tu nombre y correo electrónico en un solo mensaje.";
      conversationState.stage = "awaitingIdentity";
    }

    appendMessage("bot", response);
  };

  const openChat = () => {
    if (isOpen) return;
    isOpen = true;
    windowEl.classList.add("is-open");
    windowEl.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar asistente virtual");

    if (!greeted) {
      appendMessage("bot", "Hola 👋, soy tu asistente de Visiting World. Para ayudarte mejor, ¿podrías decirme tu nombre y correo electrónico en un solo mensaje?");
      conversationState.stage = "awaitingIdentity";
      greeted = true;
    } else if (conversationState.stage === "idle") {
      appendMessage("bot", "Bienvenido de nuevo. Recuérdame tu nombre y correo electrónico en un solo mensaje para continuar.");
      conversationState.stage = "awaitingIdentity";
    }

    requestAnimationFrame(()=> input.focus());
  };

  const closeChat = (focusToggle = true) => {
    if (!isOpen) return;
    isOpen = false;
    windowEl.classList.remove("is-open");
    windowEl.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir asistente virtual");
    if (focusToggle) {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", ()=>{
    if (isOpen) closeChat(false);
    else openChat();
  });

  closeBtn.addEventListener("click", ()=> closeChat());

  form.addEventListener("submit", (event)=>{
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    appendMessage("user", value);
    input.value = "";
    respondToMessage(value);
  });

  document.addEventListener("click", (event)=>{
    if (!isOpen) return;
    if (wrapper.contains(event.target)) return;
    closeChat(false);
  });

  window.addEventListener("keydown", (event)=>{
    if (!isOpen) return;
    if (event.key === "Escape") {
      closeChat();
    }
  });

  return wrapper;
}

function setupFloatingWidgets(){
  if (!document.body) return;

  const dock = document.createElement("div");
  dock.className = "floating-dock";

  const whatsappButton = createWhatsAppButton();
  const chatbotWidget = createChatbotWidget();

  dock.appendChild(whatsappButton);
  dock.appendChild(chatbotWidget);

  if (toTop) {
    dock.appendChild(toTop);
  }

  document.body.appendChild(dock);
}

/* -------------------------------------------------------------------------- */
/* Interacciones adicionales                                                 */
/* -------------------------------------------------------------------------- */
btnCotizarTop?.addEventListener("click", ()=> abrirCotizar("Cotización general", btnCotizarTop));

btnCotizacionHero?.addEventListener("click", ()=> {
  abrirCotizar("Cotización general", btnCotizacionHero);
});

/* Eventos de filtros */
regionFilter?.addEventListener("change", renderDestinos);
countrySearch?.addEventListener("input", renderDestinos);

/* Botón subir */
window.addEventListener("scroll", ()=>{
  if (!toTop) return;
  if (window.scrollY > 420) toTop.classList.add("show");
  else toTop.classList.remove("show");
});
toTop?.addEventListener("click", ()=> window.scrollTo({top:0,behavior:"smooth"}));

setupFloatingWidgets();

/* Año dinámico en footer */
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* -------------------------------------------------------------------------- */
/* Inicialización                                                             */
/* -------------------------------------------------------------------------- */
(async function init(){
  await cargarDatos();
  cargarFiltros();
  renderDestinos();
  renderPromos();
})();
/* Efecto visual de la barra de navegación al hacer scroll */
window.addEventListener("scroll", ()=>{
  if (!navbar) return;
  if (window.scrollY > 60) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
});
