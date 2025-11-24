# Visiting World

Sitio web profesional y accesible para la marca **Visiting World**, con frontend HTML5/CSS3/JS y datos dinámicos en JSON.

## Estructura
- `index.html`: home con hero cinematográfico, pilares, destinos, promociones, socios, blog y contacto.
- `pages/`: subpáginas (destinations, blog, partners, contact, reservations, about, destination detail).
- `assets/`: CSS (mobile-first), JS modular, datos JSON, imágenes, video, PDFs.
- `components/`: header, footer, navbar y plantilla de tarjetas.
- `api/`: mocks de WeTravel y servicio de correo.
- `bootstrap.bat`: script para generar la estructura básica si se desea replicar.

## Ejecutar localmente
1. Instala dependencias opcionales:
   ```bash
   npm install
   ```
2. Inicia un servidor estático (ejemplo con `npx serve`):
   ```bash
   npx serve .
   ```
3. Abre `http://localhost:3000` (o el puerto indicado) en tu navegador.

## Accesibilidad y SEO
- WCAG 2.1 AA: navegación por teclado, textos alternativos, contraste y jerarquías claras.
- Metadatos: Open Graph, Twitter Cards y JSON-LD con ofertas.
- Rendimiento: lazy loading en imágenes, animaciones ligeras y diseño mobile-first.

## Formularios y envíos de correo
- `contact-form` y `quote-form` envían datos a Formsubmit mediante `assets/js/email.js`.
- Validaciones básicas en frontend; backends simulados en `api/email-service.js`.

## Pagos WeTravel
- Botones de pago están presentes pero ocultos hasta activar la pasarela; la lógica de redirección está en `assets/js/payment.js` y `api/weTravel.js`.

## WhatsApp y chatbot
- Botón flotante permanente hacia `wa.me/593999999999`.
- Chatbot modular con respuestas frecuentes y soporte ES/EN en `assets/js/chatbot.js`.
