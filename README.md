# OficiosYa – Demo

Base web + API para el marketplace de oficios y servicios profesionales.  
Esta rama prioriza la experiencia estable para el equipo: el frontend Next.js consume el backend Express incluido en `server-node/`. El backend FastAPI previo se mantiene en `server/` solo como laboratorio.

## Estructura principal
- `pages/`, `components/`, `contexts/`, `styles/`: Frontend Next.js.
- `app/`: pruebas con app router (no es obligatorio para el flujo actual).
- `server-node/`: API Express/TypeScript robusta con opción de persistencia en Postgres (Prisma) o JSON.
  - Seguridad: JWT (`JWT_SECRET`), CORS estricto (`CORS_ORIGINS`), rate limiting y `helmet`.
  - Validaciones: zod en endpoints críticos (login/registro/solicitudes/presupuestos/cancelaciones).
  - Repositorios: interruptor `STORAGE_DRIVER=json|prisma` para migrar a DB relacional sin romper el front.
- `server/`: prototipo FastAPI (no usado en la demo).
- `docs/`: lineamientos funcionales y auditorías.

## Requisitos
- Node.js 18 o superior.
- npm 9+ (o pnpm/yarn equivalente).
- Opcional: Python 3.11+ si querés levantar el prototipo FastAPI.

## Variables de entorno
Frontend (`.env.local`, ya provisto):
```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_ADMIN_TOKEN=MasterToken
```

Backend Express (`server-node/.env`):
```bash
cp server-node/.env.example server-node/.env
```
Variables disponibles:
- `PORT` (por defecto 4000).
- `ADMIN_TOKEN`: token que valida las rutas administrativas.
- `DATABASE_URL`: apuntando al archivo SQLite (se usa para auditorías vía Prisma; los datos principales siguen en JSON).

## Puesta en marcha rápida

### 1. API Node/Express (con Postgres recomendado)
```bash
cd server-node
cp .env.example .env   # ajustar ADMIN_TOKEN si hace falta
npm install
# usar Prisma (Postgres por defecto)
npm run db:generate
npm run db:migrate
npm run db:seed:prisma
npm run dev
```
La API queda disponible en `http://localhost:4000`. Al iniciar:
- Se generan semillas de catálogo, planes, contratos y términos.
- Se asegura la existencia de un usuario admin (`admin@oficiosya.com`).
- La carpeta `server-node/data/` y `server-node/uploads/` se crean automáticamente.
 - JWT activo: los endpoints protegidos requieren `Authorization: Bearer <token>`.

### 2. Frontend Next.js
En otra terminal, desde la raíz del repo:
```bash
npm install
npm run dev
```
Abrí `http://localhost:3000` para ver la landing, login, paneles y flujos demo.

### 3. Levantar todo con Docker Compose (API + Web + Postgres)
```bash
docker compose up --build
```
Variables relevantes en compose:
- `STORAGE_DRIVER=prisma` para usar Postgres (por defecto ya `prisma`).
- `DATABASE_URL` apunta a `postgresql://oficiosya:oficiosya@db:5432/oficiosya?schema=public`.

## Scripts útiles
- `npm run build` / `npm run start`: build y arranque del frontend en modo producción.
- `cd server-node && npm run build`: compila la API a `dist/`.
- `cd server-node && npm run test`: ejecuta los tests de Vitest existentes.

## Limpieza del repo
`node_modules/`, `.next/`, `server-node/dist/` y `server-node/uploads/` se ignoran de Git. Si clonás el proyecto limpio, seguí los pasos anteriores para reinstalar dependencias.

## Documentación adicional
- `docs/system-audit-2025-10-08.md`: auditoría técnica y checklist de compliance.
- `docs/roadmap.md`: backlog y líneas estratégicas.

## Seguridad y cumplimiento
- Usa `ADMIN_TOKEN` para operaciones administrativas (header `x-admin-token`).
- JWT obligatorio para crear solicitudes, presupuestos y cancelaciones.
- Los TyC deben aceptarse y quedar registrados con hash, IP y timestamp (ver módulos de términos y backoffice).

## Conmutar almacenamiento (JSON ↔ Prisma)
En `server-node/.env` define `STORAGE_DRIVER=prisma` y ajusta `DATABASE_URL`. Los repositorios usan Prisma de forma transparente para:
- Usuarios (registro/login)
- Solicitudes (`/api/requests`)
- Presupuestos (`/api/quotes`)
Los demás módulos quedan listos para migrar en siguientes sprints.

Para dudas de negocio, TyC o backoffice, consultá los lineamientos compartidos en este repositorio o coordiná con el equipo legal. Cualquier ajuste adicional se realiza sobre ramas de trabajo (por ejemplo `feature/xxxx`) sin tocar `main` hasta validación técnica.
