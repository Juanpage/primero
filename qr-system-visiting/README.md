# QR Feedback System - Visiting Galápagos

Sistema de feedback por QR con backend Node.js/Express y frontend vanilla. Multi-tenant ligero con 3 embarcaciones iniciales (Vessel A/B/C) y soporte para N embarcaciones.

## Estructura

```
qr-system-visiting/
├── backend/
├── frontend/
└── README.md
```

## Base de datos (PostgreSQL)

1. Crea la base de datos.
2. Ejecuta el SQL de inicialización:

```bash
psql "$DATABASE_URL" -f backend/sql/init.sql
```

Esto crea las tablas, índices y realiza seed de las 3 embarcaciones con tokens fuertes.

## Variables de entorno

Configura `backend/.env` (ejemplo incluido):

- `PORT`
- `DATABASE_URL`
- `CORS_ORIGIN`
- `QR_TOKEN_SALT`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `SMTP_*`
- `NOTIFY_FROM_NAME`
- `NOTIFY_TO_EMAIL`
- `ALERT_RATING_THRESHOLD`

## Backend

```bash
cd backend
npm install
npm run dev
```

El servidor expone:
- `POST /api/feedback`
- `GET /api/feedback`
- `PATCH /api/feedback/:id/manage`
- `GET /api/metrics/summary`
- `GET /api/metrics/ratings-timeseries`
- `GET /api/metrics/alerts-timeseries`

## Frontend

El frontend es estático. Puedes servirlo con cualquier servidor estático:

```bash
cd frontend
npx serve src -l 5173
```

Actualiza `CORS_ORIGIN` para permitir el origen donde sirvas el frontend.

## Uso QR

Ejemplo de URL en el QR:

```
/frontend/src/pages/feedback.html?vessel=vessel-a&token=<qr_token>
```

El backend valida `vessel_slug` + `qr_token` en cada envío.

## Alertas por email

Cuando el rating es menor o igual al umbral (`ALERT_RATING_THRESHOLD`), se guarda como `Pending` y se envía un email. Si el envío falla, el feedback permanece guardado y el error se registra en logs.

## Producción

1. Configura variables de entorno seguras.
2. Ejecuta migraciones SQL.
3. Arranca backend con `npm start`.
4. Sirve el frontend con un servidor estático (Nginx, S3, etc.).
