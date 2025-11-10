import {
  loadData,
  getRegions,
  getFilteredDestinations,
  getPromos
} from "./modules/data.js";
import {
  initModalSystem,
  openModal,
  closeModal,
  setQuoteFeedback
} from "./modules/ui.js";
import {
  populateRegionFilter,
  renderDestinations,
  renderPromos,
  mountFloatingDock,
  openDetailModalFromCard
} from "./modules/components.js";
import {
  bindFilterHandlers,
  bindDestinationActions,
  bindPromoActions,
  bindContactForm,
  bindQuoteForm,
  bindHeroButtons,
  bindScrollHandlers,
  bindToTop,
  bindNavbarScroll,
  bindDetailModal
} from "./modules/events.js";

const destinosContainer = document.getElementById("destinosContainer");
const regionFilter = document.getElementById("regionFilter");
const countrySearch = document.getElementById("countrySearch");
const promoSlides = document.getElementById("promoSlides");
const toTop = document.getElementById("toTop");
const navbar = document.querySelector(".navbar");

const modalDetalles = document.getElementById("modalDetalles");
const modalCotizar = document.getElementById("modalCotizar");

const quoteForm = document.getElementById("quoteForm");
const quoteFeedback = document.getElementById("quoteFeedback");
const contactForm = document.getElementById("contactForm");
const contactFeedback = document.getElementById("contactFeedback");

const btnCotizarTop = document.getElementById("btnCotizarTop");
const btnCotizacionHero = document.getElementById("btnCotizacionHero");

const panelDetalle = document.getElementById("panelDetalle");
const panelPDF = document.getElementById("panelPDF");
const pdfFrame = document.getElementById("pdfFrame");
const pdfVolver = document.getElementById("pdfVolver");

const quoteSubmitBtn = quoteForm?.querySelector("button[type='submit'], input[type='submit']");
if (quoteSubmitBtn && !quoteSubmitBtn.dataset.originalMarkup) {
  quoteSubmitBtn.dataset.originalMarkup = quoteSubmitBtn.tagName === "BUTTON"
    ? quoteSubmitBtn.innerHTML
    : quoteSubmitBtn.value || "Enviar";
}

initModalSystem([modalDetalles, modalCotizar].filter(Boolean));

if (toTop) {
  mountFloatingDock(toTop);
  bindToTop(toTop);
}

if (pdfVolver) {
  pdfVolver.addEventListener("click", () => {
    panelPDF?.classList.add("hidden");
    panelDetalle?.classList.remove("hidden");
    if (pdfFrame) pdfFrame.src = "";
  });
}

if (modalDetalles) {
  bindDetailModal(modalDetalles, (detail) => {
    closeModal(modalDetalles);
    if (detail?.title) {
      openCotizar(detail.title);
    }
  });
}

bindNavbarScroll(navbar);

bindScrollHandlers({
  toTop,
  onScroll: () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  }
});

bindHeroButtons({ topButton: btnCotizarTop, heroButton: btnCotizacionHero }, (destino, trigger, focusName) => {
  openCotizar(destino, trigger, focusName);
});

bindFilterHandlers({ regionFilter, countrySearch }, () => updateDestinos());

bindDestinationActions(destinosContainer, {
  onDetail: (button) => handleDetail(button),
  onQuote: (button) => {
    const destino = button.dataset.destino || "Cotización general";
    openCotizar(destino, button);
  }
});

bindPromoActions(promoSlides, (button) => {
  const destino = button.dataset.destino || "Cotización general";
  openCotizar(destino, button);
});

bindContactForm(contactForm, (event) => {
  const form = event.currentTarget;
  if (contactFeedback) {
    contactFeedback.textContent = "✅ Mensaje enviado correctamente.";
  }
  form.reset();
});

bindQuoteForm(quoteForm, async (event) => {
  const form = event.currentTarget;
  await handleQuoteSubmission(form);
});

function updateDestinos() {
  const groups = getFilteredDestinations({
    region: regionFilter?.value || "all",
    query: countrySearch?.value || ""
  });
  renderDestinations(destinosContainer, groups);
}

function handleDetail(button) {
  if (!modalDetalles) return;
  const payload = {
    img: button.dataset.img,
    title: button.dataset.title,
    desc: button.dataset.desc,
    pdf: button.dataset.pdf,
    trigger: button
  };
  openDetailModalFromCard(modalDetalles, payload);
}

function openCotizar(destino = "Cotización general", trigger, focusName = false) {
  if (!modalCotizar) return;
  const destinoLbl = document.getElementById("cotizarDestinoLbl");
  const destinoField = document.getElementById("qDestino");

  if (destinoLbl) {
    destinoLbl.textContent = `Destino seleccionado: ${destino}`;
  }
  if (destinoField) {
    destinoField.value = destino;
  }

  if (quoteSubmitBtn) {
    quoteSubmitBtn.classList.remove("hidden");
    quoteSubmitBtn.disabled = false;
    quoteSubmitBtn.removeAttribute("data-loading");
    const original = quoteSubmitBtn.dataset.originalMarkup;
    if (original) {
      if (quoteSubmitBtn.tagName === "BUTTON") {
        quoteSubmitBtn.innerHTML = original;
      } else {
        quoteSubmitBtn.value = original;
      }
    }
  }

  setQuoteFeedback(quoteFeedback, "");
  openModal(modalCotizar, trigger);

  if (focusName) {
    requestAnimationFrame(() => {
      document.getElementById("qNombre")?.focus();
    });
  }
}

async function handleQuoteSubmission(form) {
  if (!form) return;

  const getValue = (...selectors) => {
    for (const selector of selectors) {
      if (!selector) continue;
      const el = selector.startsWith("#") || selector.startsWith("[")
        ? form.querySelector(selector)
        : form.elements.namedItem?.(selector);
      if (el && typeof el.value === "string") {
        const value = el.value.trim();
        if (value) return value;
      }
    }
    return "";
  };

  const resolveByHeuristic = (candidates) => {
    for (const selector of candidates) {
      const el = form.querySelector(selector);
      if (el && typeof el.value === "string" && el.value.trim()) {
        return el.value.trim();
      }
    }
    return "";
  };

  const nombre =
    getValue("#qNombre", "qNombre", "nombre", "name", "[name='qNombre']") ||
    resolveByHeuristic([
      "input[name*='nombre' i]",
      "input[id*='nombre' i]",
      "input[placeholder*='nombre' i]",
      "input[name*='name' i]",
      "input[id*='name' i]"
    ]);

  const correo =
    getValue("#qCorreo", "qCorreo", "correo", "email", "[name='qCorreo']") ||
    resolveByHeuristic([
      "input[type='email']",
      "input[name*='correo' i]",
      "input[id*='correo' i]",
      "input[placeholder*='correo' i]",
      "input[name*='email' i]",
      "input[id*='email' i]"
    ]);

  const destino = getValue("#qDestino", "qDestino", "destino") || "Cotización general";
  const fecha = getValue("#qFecha", "qFecha", "fecha");
  const personas = getValue("#qPersonas", "qPersonas", "personas");
  const preferencias = getValue("#qPreferencias", "qPreferencias", "preferencias");

  if (!nombre || !correo) {
    setQuoteFeedback(quoteFeedback, "Por favor ingresa tu nombre y correo para continuar.", true);
    return;
  }

  const emailPattern = /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(\.[\w-]+)+$/;
  if (!emailPattern.test(correo)) {
    setQuoteFeedback(quoteFeedback, "El correo electrónico ingresado no es válido.", true);
    return;
  }

  const submitBtn = quoteSubmitBtn;
  const setSubmitLabel = (btn, label) => {
    if (!btn) return;
    if (btn.tagName === "BUTTON") {
      btn.innerHTML = label;
    } else {
      btn.value = label;
    }
  };

  submitBtn?.setAttribute("data-loading", "true");
  if (submitBtn) {
    submitBtn.disabled = true;
    setSubmitLabel(submitBtn, "Enviando...");
  }

  setQuoteFeedback(quoteFeedback, "Estamos enviando tu solicitud...");

  const payload = new FormData();
  payload.append("Nombre", nombre);
  payload.append("Correo", correo);
  payload.append("_replyto", correo);
  payload.append("Destino", destino);
  payload.append("Fecha", fecha || "No especificada");
  payload.append("Personas", personas || "No especificado");
  payload.append("Preferencias", preferencias || "No especificadas");
  payload.append("_subject", `Solicitud de cotización - ${destino}`);
  payload.append("_template", "table");
  payload.append("_captcha", "false");

  let succeeded = false;

  try {
    const response = await fetch("https://formsubmit.co/ajax/webmaster@visitingalapagos.com", {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Estado inesperado: ${response.status}`);
    }

    await response.json().catch(() => ({}));

    setQuoteFeedback(
      quoteFeedback,
      "Su requerimiento fue procesado, pronto una persona se pondrá en contacto contigo."
    );
    form.reset();
    succeeded = true;
  } catch (error) {
    console.error("No se pudo enviar la solicitud de cotización", error);
    setQuoteFeedback(
      quoteFeedback,
      "No pudimos enviar tu solicitud. Inténtalo nuevamente o contáctanos por WhatsApp.",
      true
    );
  } finally {
    const destinoField = form.querySelector("#qDestino");
    if (destinoField) destinoField.value = destino;

    if (submitBtn) {
      submitBtn.removeAttribute("data-loading");
      submitBtn.disabled = false;
      const original = submitBtn.dataset.originalMarkup;
      if (original) {
        if (submitBtn.tagName === "BUTTON") {
          submitBtn.innerHTML = original;
        } else {
          submitBtn.value = original;
        }
      }
      if (succeeded) {
        submitBtn.classList.add("hidden");
      }
    }
  }
}

function renderPromotions() {
  const promos = getPromos();
  renderPromos(promoSlides, promos);
}

function initYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

async function init() {
  await loadData();
  populateRegionFilter(regionFilter, getRegions());
  updateDestinos();
  renderPromotions();
  initYear();
}

init();
