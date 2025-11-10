import { openModal } from "./ui.js";

const REGION_OPTION_ALL_VALUE = "all";

function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className !== undefined) el.className = options.className;
  if (options.text !== undefined) el.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        el.setAttribute(key, value);
      }
    });
  }
  return el;
}

export function populateRegionFilter(select, regions = []) {
  if (!select) return;
  select.querySelectorAll("option:not([value='all'])").forEach((option) => option.remove());
  regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region ? region.toLowerCase() : REGION_OPTION_ALL_VALUE;
    option.textContent = region;
    select.appendChild(option);
  });
  if (!select.value) {
    select.value = REGION_OPTION_ALL_VALUE;
  }
}

export function renderDestinations(container, groups = []) {
  if (!container) return;
  container.innerHTML = "";

  if (!groups.length) {
    const empty = createElement("p", {
      className: "feedback",
      text: "No encontramos destinos que coincidan con tu búsqueda."
    });
    container.appendChild(empty);
    return;
  }

  groups.forEach(({ label, destinations }) => {
    const group = createElement("section", { className: "destino-group" });
    const heading = createElement("h3", { text: label });
    const grid = createElement("div", { className: "destino-cards" });

    (destinations || []).forEach((destino) => {
      const card = createElement("article", {
        className: "destino-card",
        attrs: {
          "data-id": destino.id || ""
        }
      });

      if (destino.image) {
        const img = createElement("img", {
          attrs: {
            src: destino.image,
            alt: destino.name || "Destino"
          }
        });
        card.appendChild(img);
      }

      const content = createElement("div", { className: "content" });
      content.appendChild(createElement("h4", { text: destino.name || "Destino" }));
      content.appendChild(createElement("p", { text: destino.summary || "" }));

      const actions = createElement("div", { className: "actions" });
      const detailBtn = createElement("button", {
        text: "Ver detalles",
        attrs: {
          "data-action": "detail",
          "data-title": destino.name || "",
          "data-img": destino.image || "",
          "data-desc": destino.description || destino.summary || "",
          "data-pdf": destino.pdf || ""
        }
      });
      const quoteBtn = createElement("button", {
        text: "Solicitar cotización",
        attrs: {
          class: "secondary",
          "data-action": "quote",
          "data-destino": destino.name || "",
          "data-title": destino.name || ""
        }
      });

      actions.appendChild(detailBtn);
      actions.appendChild(quoteBtn);
      content.appendChild(actions);
      card.appendChild(content);
      grid.appendChild(card);
    });

    group.appendChild(heading);
    group.appendChild(grid);
    container.appendChild(group);
  });
}

export function renderPromos(container, promos = []) {
  if (!container) return;
  container.innerHTML = "";

  if (!promos.length) {
    container.appendChild(
      createElement("p", { text: "No hay promociones activas en este momento. Vuelve pronto." })
    );
    return;
  }

  promos.forEach((promo) => {
    const card = createElement("article", { className: "promo-card" });
    if (promo.highlight) {
      card.appendChild(createElement("span", { className: "badge", text: promo.highlight }));
    }
    card.appendChild(createElement("strong", { text: promo.title }));
    card.appendChild(createElement("p", { text: promo.description }));
    const btn = createElement("button", {
      text: "Cotizar",
      attrs: {
        "data-destino": promo.destino || promo.title || "Cotización",
        "data-action": "promo-quote"
      }
    });
    card.appendChild(btn);
    container.appendChild(card);
  });
}

export function mountFloatingDock(button) {
  if (!button) return;
  button.classList.remove("visible");
}

export function openDetailModalFromCard(modal, payload = {}) {
  if (!modal) return;
  const panel = modal.querySelector(".panel");
  if (!panel) return;

  const img = modal.querySelector("#detalleImg");
  const title = modal.querySelector("#detalleTitulo");
  const description = modal.querySelector("#detalleDescripcion");
  const cotizarBtn = modal.querySelector("#detalleCotizar");
  const pdfBtn = modal.querySelector("#detalleVerPDF");
  const pdfFrame = modal.querySelector("#pdfFrame");
  const panelDetalle = modal.querySelector("#panelDetalle");
  const panelPDF = modal.querySelector("#panelPDF");

  if (img) {
    if (payload.img) {
      img.src = payload.img;
      img.classList.remove("hidden");
    } else {
      img.classList.add("hidden");
    }
  }
  if (title) title.textContent = payload.title || "";
  if (description) description.textContent = payload.desc || "";

  if (cotizarBtn) {
    cotizarBtn.dataset.destino = payload.title || "Cotización";
    cotizarBtn.dataset.title = payload.title || "";
    cotizarBtn.dataset.action = "quote";
    cotizarBtn.dataset.source = "modal";
  }

  if (pdfBtn) {
    if (payload.pdf) {
      pdfBtn.dataset.pdf = payload.pdf;
      pdfBtn.classList.remove("hidden");
    } else {
      pdfBtn.dataset.pdf = "";
      pdfBtn.classList.add("hidden");
    }
  }

  if (panelDetalle && panelPDF) {
    panelDetalle.classList.remove("hidden");
    panelPDF.classList.add("hidden");
  }
  if (pdfFrame) pdfFrame.src = "";

  openModal(modal, payload.trigger);
}
