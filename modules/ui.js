export function initModalSystem(modals = []) {
  modals.forEach((modal) => {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    modal.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        closeModal(modal);
      });
    });

    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal(modal);
      }
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });
}

export function openModal(modal, trigger) {
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  const focusable = Array.from(
    modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  );

  const previouslyFocused = document.activeElement;
  if (trigger) {
    modal.dataset.triggerId = trigger.id || "";
  }

  const firstFocusable = focusable[0];
  firstFocusable?.focus({ preventScroll: true });

  const handleTab = (event) => {
    if (event.key !== "Tab" || focusable.length < 2) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  modal.addEventListener("keydown", handleTab);
  modal._trapHandler = handleTab;
  modal.dataset.returnFocus = previouslyFocused && previouslyFocused.focus ? "true" : "";
  modal._previouslyFocused = previouslyFocused;
}

export function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  if (modal._trapHandler) {
    modal.removeEventListener("keydown", modal._trapHandler);
    modal._trapHandler = undefined;
  }

  const previouslyFocused = modal._previouslyFocused;
  if (previouslyFocused && typeof previouslyFocused.focus === "function") {
    previouslyFocused.focus({ preventScroll: true });
  }
}

export function setQuoteFeedback(element, message, isError = false) {
  if (!element) return;
  element.textContent = message || "";
  element.classList.remove("error", "success");
  if (!message) return;
  element.classList.add(isError ? "error" : "success");
}
