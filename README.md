# Visiting World landing

Sitio informativo de una sola página que carga destinos, promociones y socios desde archivos JSON y muestra la experiencia completa descrita en el brief.

## Desarrollo local
1. Instala un servidor estático como `serve` o usa la extensión "Live Server" de tu editor.
2. Inicia el servidor desde la raíz del repositorio para que `/assets` quede disponible.
3. Abre `http://localhost:3000` (o el puerto que utilices) y navega la landing.

## Formularios
Los formularios de contacto y cotización envían la misma información tanto a `commercial@visitingalapagos.com` como a `webmaster@visitingalapagos.com` a través de [FormSubmit](https://formsubmit.co/). Si necesitas personalizar los destinatarios o la copia, ajusta las constantes `FORM_SUBMIT_ENDPOINT` y `FORM_SUBMIT_CC` en `assets/js/main.js`.
