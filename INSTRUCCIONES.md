# OficiosYa — Guía Maestra del Proyecto

> **Documento vivo.** Toda decisión de diseño, tecnología y negocio queda registrada aquí.  
> Antes de tocar cualquier archivo, leer esta guía. Antes de crear cualquier feature, validarla contra estas reglas.

---

## 1. Qué es OficiosYa

**OficiosYa es el marketplace de oficios y servicios profesionales de Argentina.**

Conecta a personas que necesitan un servicio domiciliario (electricista, plomero, gasista, etc.) con prestadores verificados que tienen identidad confirmada, matrícula habilitante y seguro vigente.

### Propuesta de valor central

| Para el cliente | Para el prestador |
|---|---|
| Prestador verificado en minutos | Canal de clientes constante |
| Pago protegido (escrow) | Cobro garantizado y seguro |
| Garantía 30 días obligatoria | Credenciales que aumentan el precio |
| Urgencias 24/7 | Dashboard de KPIs y agenda inteligente |
| Reseñas auténticas | Planes de suscripción que bajan comisión |

### Diferenciadores clave (moat)
1. **Verificación RENAPER** — El DNI se valida contra base nacional. No es solo "subir una foto".
2. **Escrow real** — El dinero no llega al prestador hasta que el cliente confirma el trabajo.
3. **Matrícula habilitante** — Gasistas, electricistas y climas requieren matrícula CAP/URSEA.
4. **Garantía 30 días** — Obligatoria para todos. El cliente puede reclamar defectos post-trabajo.
5. **Watermark en fotos** — Evidencia de trabajo con hash SHA-256 inmutable.

---

## 2. Arquitectura técnica

### Stack actual (producción)

```
┌─────────────────────────────────────────────────────────┐
│  Frontend: Next.js 16 + React 19 (Pages Router)         │
│  Deploy: Vercel (oficiosya-theta.vercel.app)             │
│  Repo: github.com/rinssog/oficiosyanew                   │
├─────────────────────────────────────────────────────────┤
│  Backend: Express + TypeScript (server-node/)            │
│  Deploy: Railway (pendiente)                             │
│  DB: JSON files → Prisma/Postgres (próximo sprint)       │
├─────────────────────────────────────────────────────────┤
│  Búsqueda: Meilisearch (integrado, activar en prod)      │
│  Pagos: MercadoPago (preapproval suscripciones + escrow) │
│  Push: Web Push API (VAPID keys)                         │
│  Logging: Pino (structured JSON)                         │
└─────────────────────────────────────────────────────────┘
```

### Carpetas del monorepo

```
oficiosyanew/
├── pages/              # Frontend Next.js (Pages Router — usar esto)
│   ├── index.js        # Landing pública
│   ├── planes.js       # Planes y precios
│   ├── auth/           # Login + registro
│   ├── client/         # Panel del cliente (requiere rol CLIENT)
│   ├── providers/      # Panel del prestador (requiere rol PROVIDER)
│   ├── admin/          # Backoffice (requiere rol ADMIN)
│   ├── solicitar/      # Flujo de contratación
│   └── requests/       # Detalle de solicitudes
├── app/                # Solo para /chat (App Router) — NO crear rutas aquí
├── components/         # Componentes compartidos
├── contexts/           # AuthContext (fuente de verdad del usuario)
├── data/               # Datos estáticos del frontend (rubros.js, etc.)
├── hooks/              # usePWAInstall, usePushNotifications
├── styles/             # CSS Modules + globals.css
├── public/             # Assets estáticos (favicon, manifest, sw.js)
├── server-node/        # Backend completo
│   ├── src/
│   │   ├── routes/     # Un archivo por dominio
│   │   ├── services/   # Lógica de negocio
│   │   ├── repositories/ # Acceso a datos (JSON o Prisma)
│   │   ├── security/   # JWT, middleware, roles
│   │   └── utils/      # Helpers transversales
│   ├── data/           # JSON seed files
│   ├── prisma/         # Schema Prisma (Postgres para prod)
│   └── uploads/        # Archivos subidos (excluir de git)
└── docs/               # Documentación y auditorías
```

### Reglas de arquitectura

- **Nunca importar desde `server-node/` en el frontend.** Si necesitás datos compartidos (ej: lista de rubros), poné el archivo en `data/` y usálo en ambos lados.
- **Pages Router es el canónico.** El App Router solo existe para `/chat`. No mezclar.
- **`AuthContext` es la única fuente de verdad** del usuario en el frontend. Nunca leer `localStorage` directamente fuera del contexto.
- **`apiRequest` del AuthContext** para todas las llamadas autenticadas al backend. Nunca `fetch` crudo con token hardcodeado.
- **`NEXT_PUBLIC_API_BASE`** en `.env.local` apunta al backend. En producción Vercel, configurar en Environment Variables.

---

## 3. Sistema de design (UI/UX)

### Paleta de colores

```css
/* Colores institucionales — NO cambiar sin aprobación */
--verde-oscuro:     #0D3B1F;   /* Fondo hero, navbar, textos título */
--verde-principal:  #16A34A;   /* Botones primarios, bordes activos, checks */
--dorado:           #C9A227;   /* Acentos premium, shields gold, stats */
--dorado-claro:     #F0D875;   /* Texto sobre fondo oscuro */
--verde-menta:      #BBF7D0;   /* Texto secundario sobre verde */
--fondo-suave:      #F7F9F5;   /* Background de secciones pares */
--borde-suave:      #D4E0D6;   /* Bordes de cards */
--texto-secundario: #6B7C6E;   /* Subtítulos, helpers */
```

### Tipografía

```css
/* Títulos */  font-family: "Georgia", "Times New Roman", serif;
/* Cuerpo */   font-family: system-ui, -apple-system, sans-serif;
/* Código */   font-family: "Courier New", monospace;
```

### Logo / Shield

El shield SVG con "Ya" es el logo institucional. Existe en 3 versiones según el tier del prestador:
- `base`: gris oscuro `#6B7C6E` — prestador sin verificación
- `verified`: verde `#16A34A` — identidad verificada
- `gold`: dorado `#C9A227` — plan Elite / mejor ranking

### Componentes clave

| Componente | Cuándo usarlo |
|---|---|
| `NavBar` | Todas las páginas públicas y de usuario |
| `Footer` | Todas las páginas |
| `DashboardShell` | Paneles de cliente/prestador/admin |
| `KpiCard` | Métricas en dashboards |
| `RequireRole` | Wrapper para páginas con rol específico |
| `TermsModal` | Al primer login y cuando se actualicen T&C |
| `ChatWindow` | En páginas de detalle de solicitud |
| `ProviderAvailability` | Agenda del prestador |

### Patrones de UX

- **Feedback inmediato**: Todo botón que hace async debe tener estado de loading.
- **Error handling visible**: Nunca dejar al usuario sin saber qué pasó. Usar mensajes en rojo `#DC2626`.
- **Estados vacíos**: Toda lista vacía tiene icono + texto + acción sugerida. Nunca pantalla en blanco.
- **Urgencias en rojo**: El banner de urgencias 24/7 siempre en rojo `#DC2626` para máxima atención.
- **Mobile-first**: Todos los grids usan `auto-fit, minmax()`. Testear en 390px antes de desktop.

---

## 4. Modelo de negocio

### Planes de prestadores

| Plan | Precio mensual | Comisión | Lead fee | Urgencias |
|---|---|---|---|---|
| Base | $0 | 15% | $700 | No |
| Profesional | $11.900 | 10% | $350 | Sí |
| Empresas | $34.900 | 8% | $0 | Sí |

### Planes de clientes

| Plan | Precio mensual | Beneficios |
|---|---|---|
| Esencial | $0 | Funcionalidad base |
| Plus | $3.200 | Visita preventiva anual + soporte 7x24 |
| Premium | $6.900 | Gestor asignado + multi-propiedad |

### Flujo de pago (escrow)

```
Cliente confirma solicitud
       ↓
MercadoPago carga el monto total
       ↓
OficiosYa retiene el dinero (HELD)
       ↓
Prestador realiza el trabajo
       ↓
Cliente confirma finalización
       ↓
OficiosYa libera (RELEASED):
  - Prestador recibe: precio - comisión%
  - OficiosYa retiene: comisión%
       ↓
(Si disputa → estado DISPUTED → intervención admin)
```

### Política de cancelación

- **Cancelación con +24hs de anticipación**: Sin costo. Devolución total al cliente.
- **Cancelación con -24hs**: Retención operativa del **50%** como compensación al prestador por el turno bloqueado. Esta retención **NO es una seña** — es compensación por lucro cesante.
- **No presentación del prestador**: Devolución total + penalidad al prestador (suspensión temporal).
- **Cancelación admin**: Solo en casos de fuerza mayor documentados.

### Garantía 30 días

Todos los prestadores deben ofrecer garantía de 30 días corridos sobre el trabajo realizado. Defectos atribuibles al prestador (no al cliente ni a terceros) deben ser corregidos sin costo adicional. La plataforma puede retener el pago si hay reclamación válida dentro del período.

---

## 5. Roles y permisos

### Roles del sistema

```typescript
enum UserRole {
  CLIENT   = "CLIENT",    // Solicita servicios
  PROVIDER = "PROVIDER",  // Presta servicios
  ADMIN    = "ADMIN",     // Backoffice completo
}
```

### Permisos por rol

| Acción | CLIENT | PROVIDER | ADMIN |
|---|---|---|---|
| Ver landing / planes | ✅ | ✅ | ✅ |
| Buscar prestadores | ✅ | ✅ | ✅ |
| Crear solicitud | ✅ | ❌ | ✅ |
| Emitir presupuesto | ❌ | ✅ | ✅ |
| Ver dashboard propio | ✅ | ✅ | N/A |
| Ver admin backoffice | ❌ | ❌ | ✅ |
| Aprobar documentos | ❌ | ❌ | ✅ |
| Modificar planes | ❌ | ❌ | ✅ |
| Ver todas las solicitudes | ❌ | ❌ | ✅ |

### Verificación de prestadores

Proceso obligatorio antes de aparecer en resultados de búsqueda:

1. **DNI** — Frente y dorso, validado contra RENAPER (mock en MVP, real en prod)
2. **Selfie con DNI** — Verificación facial
3. **Matrícula** (si el rubro la requiere) — Electricistas: CAP | Gasistas: ENARGAS | Climas: certificación fabricante
4. **Seguro de responsabilidad civil** — Vigente, con OficiosYa como beneficiario adicional
5. **AFIP** — Constancia de inscripción (Monotributo o autónomo)

Estado de verificación: `PENDING → SUBMITTED → APPROVED | REJECTED`

---

## 6. Rubros y catálogo

### 27 rubros activos (agrupados por categoría)

| Categoría | Rubros |
|---|---|
| Construcción | Albañilería, Pintura, Carpintería, Herrería, Techista, Vidriería |
| Instalaciones | Electricista, Plomería, Gasista, Climatización |
| Seguridad | Cerrajería, Alarmas y CCTV |
| Jardín | Jardinería, Paisajista, Poda en Altura, Piletero |
| Tecnología | Técnico Informático, Redes y Cableado |
| Electrodomésticos | Técnico en Electrodomésticos |
| Limpieza | Limpieza del Hogar, Fumigación, Lavado de Tapizados |
| Logística | Mudanzas, Flete y Cadetería |
| Automotor | Mecánico a Domicilio, Cerrajero de Autos |
| Salud | Enfermería a Domicilio, Veterinaria a Domicilio |
| Eventos | Fotógrafo / Videógrafo |
| Servicios profesionales | Contador / Gestor |
| Otros | Planchado y Costura |

**Fuente de verdad**: `data/rubros.js` (frontend) y `server-node/src/data/rubros.ts` (backend).  
Ambos archivos deben estar sincronizados. Cualquier cambio en uno se replica en el otro.

### Rubros que requieren matrícula habilitante

`electricidad`, `gas`, `climatizacion`, `enfermeria`, `veterinaria`, `fumigacion`, `contabilidad`

---

## 7. Seguridad

### Backend

- **JWT obligatorio** en todas las rutas protegidas. Secret en `JWT_SECRET` env var.
- **CORS estricto**: Solo el origen de Vercel y `localhost:3000` en desarrollo.
- **Rate limiting**: 300 requests / 15 min por IP.
- **Helmet**: Headers de seguridad habilitados.
- **Zod**: Validación estricta en todos los endpoints de mutación.
- **ADMIN_TOKEN**: Header `x-admin-token` requerido en rutas admin.

### Frontend

- **No guardar tokens sensibles en `localStorage`** más allá del JWT de sesión.
- **Nunca hardcodear credenciales** en el código. Usar variables de entorno.
- **CSP headers** configurados en `next.config.js` (X-Frame-Options: DENY, etc.).
- **T&C acceptance**: Guardar hash SHA-256 del contenido aceptado + IP + timestamp.

### Variables de entorno requeridas

**Frontend (Vercel):**
```env
NEXT_PUBLIC_API_BASE=https://tu-api.railway.app
OPENAI_API_KEY=sk-...  # Para el chat IA
```

**Backend (Railway):**
```env
PORT=4000
NODE_ENV=production
ADMIN_TOKEN=token-secreto-largo-y-aleatorio
JWT_SECRET=secreto-jwt-muy-largo-y-aleatorio
CORS_ORIGINS=https://oficiosya-theta.vercel.app,https://www.oficiosya.com.ar
STORAGE_DRIVER=prisma   # json para MVP, prisma para prod
DATABASE_URL=postgresql://...
```

---

## 8. Convenciones de código

### Frontend

- **Archivos**: `.jsx` para componentes con JSX. `.js` para lógica pura.
- **No duplicar**: Si existe `buscar.jsx` y `buscar.js`, eliminar el `.js` y quedarse con `.jsx`.
- **Estilos**: CSS en línea para estilos únicos de página. CSS Modules para componentes reutilizables.
- **Estado async**: Siempre `try/catch` con estado de error explícito. Nunca silenciar errores sin informar al usuario.
- **Colores**: Siempre usar las variables de la paleta. Nunca hardcodear un color que no esté en el design system.

### Backend

- **Un router por dominio** en `src/routes/`. No crear rutas en `index.ts`.
- **Un service por dominio** en `src/services/`. Los routers llaman services, no repos directo.
- **Logging con Pino**: `logger.info()`, `logger.warn()`, `logger.error()`. No usar `console.log` en producción.
- **Zod en toda mutación**: `POST`, `PUT`, `PATCH` deben validar body con schema Zod.
- **Audit trail**: Toda acción admin o sensible debe llamar `audit.log()`.

### Git

- **Branches**: `main` (producción), `develop` (staging), `feature/xxx` para features.
- **Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` como prefijos.
- **No commitear**: `node_modules/`, `.next/`, `server-node/dist/`, `server-node/uploads/`, `.env` real.

---

## 9. Cobertura geográfica

### Zonas activas (MVP)

- **CABA**: Todas las comunas (46 barrios)
- **GBA Norte**: San Isidro, Vicente López, Tigre, San Martín
- **GBA Oeste**: Morón, Ituzaingó, Merlo, Moreno, La Matanza (zona norte)
- **GBA Sur**: Quilmes, Avellaneda, Lanús, Lomas de Zamora, Esteban Echeverría

### Expansión planificada (Q2-Q3)

- Córdoba capital
- Rosario
- Mendoza capital
- Mar del Plata

---

## 10. Roadmap priorizado (next sprints)

### Sprint 1 — Backend online (Railway)
- [ ] Deploy `server-node/` en Railway
- [ ] Configurar variables de entorno en Vercel + Railway
- [ ] Testear flujo completo: registro → login → dashboard
- [ ] Setear admin@oficiosya.com con contraseña segura

### Sprint 2 — Datos reales
- [ ] Migrar storage de JSON a Prisma/Postgres
- [ ] Poblar catálogo con seed real de rubros
- [ ] Activar Meilisearch para búsqueda semántica
- [ ] Conectar dashboards de cliente/prestador con API real

### Sprint 3 — Pagos
- [ ] Integrar MercadoPago Checkout Pro (preference + webhook)
- [ ] Implementar escrow real (HELD → RELEASED)
- [ ] Split billing: retención de comisión automática
- [ ] Notificación email al cliente y prestador post-pago

### Sprint 4 — Verificación y compliance
- [ ] RENAPER real (API o proveedor de onboarding)
- [ ] Aceptación de T&C con hash + IP + timestamp en DB
- [ ] Upload de documentos con validación y watermark
- [ ] Panel admin para aprobar/rechazar prestadores

### Sprint 5 — Beta operativa
- [ ] Urgencias 24/7 con SLA medido
- [ ] Chat en tiempo real (WebSocket o polling)
- [ ] Calificaciones post-trabajo con foto de evidencia
- [ ] Notificaciones push (Web Push)
- [ ] Deploy en dominio oficial oficiosya.com.ar

---

## 11. Contacto y soporte

- **Admin**: admin@oficiosya.com
- **Soporte clientes**: soporte@oficiosya.com
- **Soporte prestadores**: prestadores@oficiosya.com
- **Legal**: legal@oficiosya.com
- **Horario soporte humano**: Lunes a viernes 9:00–19:00 hs (Argentina)
- **Urgencias plataforma**: soporte@oficiosya.com (respuesta < 4hs)

---

*Última actualización: mayo 2026 — Versión 1.2.0*
