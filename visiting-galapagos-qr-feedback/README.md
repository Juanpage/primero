# Visiting Galapagos QR Feedback

MVP para recolectar feedback de las embarcaciones Letty, Calipso y Narel usando códigos QR que apuntan a `/feedback?v=VESSEL`.

## Estructura
```
frontend/
  src/pages -> feedback, thanks y admin
  src/assets/css -> estilos base
  src/assets/js -> lógica de formularios y panel
backend/
  src/server.js -> servidor Express y rutas API
  src/controllers -> lógica de feedback y métricas
  src/db -> pool PG y esquema
```

## Requisitos
- Node.js 18+
- PostgreSQL 13+

## Configuración
1. Copia `.env.example` en `backend/.env` y ajusta las variables:
```
PORT=4000
DATABASE_URL=postgres://user:password@localhost:5432/visiting_galapagos
FRONTEND_PATH=../frontend/src
```
2. Crea la base y la tabla:
```bash
psql $DATABASE_URL -f backend/src/db/schema.sql
```
3. Instala dependencias y levanta el backend:
```bash
cd backend
npm install
npm start
```
4. Abre `frontend/src/pages/feedback.html` con el parámetro correcto, por ejemplo:
- `http://localhost:4000/feedback?v=LETTY`
- `http://localhost:4000/feedback?v=CALIPSO`
- `http://localhost:4000/feedback?v=NAREL`

El panel admin está en `http://localhost:4000/admin.html` con contraseña demo `alapagos-demo`.
