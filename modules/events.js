import { closeModal } from "./ui.js";

function delegate(container, selector, type, handler) {
  if (!container) return;
  container.addEventListener(type, (event) => {
    const target = event.target.closest(selector);
    if (!target || !container.contains(target)) return;
    handler(target, event);
  });
}

export function bindFilterHandlers({ regionFilter, countrySearch } = {}, onFilter = () => {}) {
  if (regionFilter) {
    regionFilter.addEventListener("change", () => onFilter());
  }
  if (countrySearch) {
    countrySearch.addEventListener("input", () => onFilter());
  }
}

export function bindDestinationActions(container, { onDetail, onQuote } = {}) {
  delegate(container, "[data-action='detail']", "click", (target, event) => {
    event.preventDefault();
    onDetail?.(target, event);
  });
  delegate(container, "[data-action='quote']", "click", (target, event) => {
    event.preventDefault();
    onQuote?.(target, event);
  });
}

export function bindPromoActions(container, onQuote) {
  delegate(container, "[data-action='promo-quote']", "click", (target, event) => {
    event.preventDefault();
    onQuote?.(target, event);
  });
}

export function bindContactForm(form, handler) {
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handler?.(event);
  });
}

export function bindQuoteForm(form, handler) {
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handler?.(event);
  });
}

export function bindHeroButtons({ topButton, heroButton } = {}, callback) {
  const handler = (event) => {
    event.preventDefault();
    const destino = event.currentTarget.dataset.destino;
    callback?.(destino, event.currentTarget, event.currentTarget.dataset.focusName === "true");
  };
  if (topButton) {
    topButton.dataset.destino = topButton.dataset.destino || "Cotización general";
    topButton.dataset.focusName = "true";
    topButton.addEventListener("click", handler);
  }
  if (heroButton) {
    heroButton.dataset.destino = heroButton.dataset.destino || "Cotización general";
    heroButton.dataset.focusName = "true";
    heroButton.addEventListener("click", handler);
  }
}

export function bindScrollHandlers({ toTop, onScroll } = {}) {
  const updateDock = () => {
    if (toTop) {
      const threshold = 300;
      const visible = window.scrollY > threshold;
      toTop.classList.toggle("visible", visible);
    }
    onScroll?.();
  };

  window.addEventListener("scroll", updateDock, { passive: true });
  updateDock();
}

export function bindToTop(button) {
  if (!button) return;
  button.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

export function bindNavbarScroll(navbar) {
  if (!navbar) return;
  const toggle = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  };
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

export function bindDetailModal(modal, onQuote) {
  if (!modal) return;
  const panel = modal.querySelector(".panel");
  if (!panel) return;

  delegate(panel, "#detalleCotizar", "click", (target, event) => {
    event.preventDefault();
    onQuote?.({
      title: target.dataset.destino,
      trigger: target
    });
  });

  delegate(panel, "#detalleVerPDF", "click", (target, event) => {
    event.preventDefault();
    const pdf = target.dataset.pdf;
    const panelDetalle = modal.querySelector("#panelDetalle");
    const panelPDF = modal.querySelector("#panelPDF");
    const pdfFrame = modal.querySelector("#pdfFrame");

    if (pdf) {
      panelDetalle?.classList.add("hidden");
      panelPDF?.classList.remove("hidden");
      if (pdfFrame) {
        pdfFrame.src = pdf;
      }
    }
  });

  delegate(modal, "[data-close]", "click", (target, event) => {
    event.preventDefault();
    closeModal(modal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
}
