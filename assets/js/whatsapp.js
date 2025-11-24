(function initWhatsApp() {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('#whatsapp-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        window.open('https://wa.me/593999999999?text=Hola%20quiero%20más%20información', '_blank', 'noopener');
      });
    }
  });
})();
