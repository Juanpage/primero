(function enhanceSEO() {
  document.addEventListener('DOMContentLoaded', () => {
    const meta = [
      { property: 'og:title', content: 'Visiting World | Viajes curados y sostenibles' },
      { property: 'og:description', content: 'Reservas seguras, pagos con WeTravel y experiencias inmersivas en todo el mundo.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: location.href },
      { property: 'og:image', content: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Visiting World' },
      { name: 'twitter:description', content: 'Destinos premium, sostenibles y seguros.' },
      { name: 'twitter:image', content: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' }
    ];
    meta.forEach(entry => {
      const tag = document.createElement('meta');
      Object.entries(entry).forEach(([k, v]) => tag.setAttribute(k, v));
      document.head.appendChild(tag);
    });
  });
})();
