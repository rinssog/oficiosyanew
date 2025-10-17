# OficiosYa – Revisión Técnica (08 Oct 2025)

Repositorio auditado: `C:\Users\grecc\OneDrive\Documentos\OficiosYa - vs code chatgpt editor agent`.

El objetivo de este documento es dejar constancia del estado actual del proyecto y las tareas prioritarias para garantizar continuidad operativa, seguridad legal y alineamiento con los lineamientos de negocio vigentes.

---

## 1. Resumen de la estructura

- `pages/`, `components/`, `contexts/`, `styles/` → Frontend Next.js (landing, paneles de cliente/prestador/admin).
- `app/` → pruebas con el app router (no imprescindible para el flujo actual).
- `server-node/` → Backend Express/TypeScript (API oficial para la demo). Persiste datos en `data/*.json`, archivos en `uploads/` y expone endpoints `/api/...` compatibles con el frontend.
- `server/` → Prototipo FastAPI (no se usa en la demo vigente, queda apartado para exploración).
- `docs/` → lineamientos funcionales, roadmap y esta auditoría.
- `.vscode/`, `.continue/`, etc. → tooling local.

---

## 2. Observaciones principales

### 2.1 Backend Express (`server-node/`)
- **Cobertura de endpoints**: expone `/api/auth`, `/api/catalog`, `/api/providers`, `/api/requests`, `/api/admin`, `/api/files`, etc., alineados con las llamadas del frontend. Falta robustecer validaciones de negocio (p.ej. límites de agenda, control de cancelaciones y retención operativa del 50 %).
- **Persistencia**: combina archivos JSON (catálogo, planes, contratos, solicitudes, documentación) con SQLite vía Prisma para auditorías. Necesitamos definir política de backups, bloqueo concurrente y crecimiento de archivos.
- **Documentación y KYC**: existen modelos `Document`, `TermsAcceptance`, `InsuranceProduct`, pero falta UI completa para que el backoffice apruebe/rechace y registre motivos. Las reglas de evidencias (hash, timestamp, IP) deben aplicarse en todos los flujos legales.
- **Seguridad**: se utiliza un rate limiter básico y `ADMIN_TOKEN`, pero aún no hay JWT ni separación estricta de roles. Registrar trazas con IP/UA cuando se trate de TyC, cancelaciones y denuncias.

### 2.2 Backend FastAPI (`server/`)
- Prototipo de la migración. Expone rutas `/api/v1/*` distintas del frontend actual, por lo que no se levanta en esta rama. Mantenerlo aislado hasta definir plan de migración o reemplazo gradual.

### 2.3 Frontend Next.js
- **AuthContext** apunta a `/api/...` (Express). Debe reforzarse la gestión de roles, logout seguro y sincronización de datos del prestador tras cambios.
- **Paneles**: los dashboards de cliente, proveedor y admin muestran datos mock. Para pasar a productivo falta conectar métricas reales, urgencias 24/7, agenda inteligente y gestión de presupuestos/materiales con upload.
- **Textos legales**: ya se aclara el rol de intermediario y la retención operativa, pero hay que revisar copy en TyC, modales y FAQ para asegurar que no se interprete como “seña”.
- **Accesibilidad/branding**: la paleta actual cumple con el diseño institucional. Ajustar contraste en botones secundarios y badges si se necesita más impacto visual.

### 2.4 Infraestructura y repo
- `node_modules/`, `.next/`, `server-node/dist/` y `server-node/uploads/` quedaron fuera del control de versiones (limpieza completada).
- Falta script de arranque unificado (p.ej. vía `npm run dev:all` o `make dev`) y documentación de despliegue (Docker, CI/CD).
- Debemos documentar gestión de archivos sensibles (por ejemplo, equivalentes a GEDO para antecedentes) y almacenar evidencia cifrada si se escala a producción.

---

## 3. Recomendaciones inmediatas

1. **Fortalecer el backoffice**
   - Completar vistas y endpoints que permitan aprobar/rechazar documentación, monitorear tickets de soporte y gestionar cancelaciones con la lógica de retención del 50 % (no seña).
   - Incluir auditoría de acciones críticas (quién cambió qué y cuándo).

2. **Formalizar flujos legales**
   - Asegurar que `POST /api/terms/accept` guarde hash, IP y timestamp.
   - Incorporar cláusulas de intermediación, penalidades y disclaimers en todas las pantallas relevantes (modal de cancelación, urgencias, carga de presupuestos, etc.).

3. **Agenda y urgencias 24/7**
   - Implementar la agenda inteligente: reglas recurrentes, slots manuales, cancelaciones con propuesta de reprogramación, y comunicación clara de la retención operativa.
   - Registrar métricas de respuesta para urgencias y soporte humano (9–19 hs).

4. **Presupuestos, materiales y evidencias**
   - Consolidar los formularios de presupuestos/materiales en `/provider-console` con viewer PDF/imagen inline.
   - Guardar toda la evidencia en JSON estructurado + archivo opcional. Evitar “texto libre” sin estructura.

5. **Datos maestros**
   - Mantener un catálogo estándar de rubros/subrubros/servicios (nomenclatura fija). Asegurar sinónimos y ranking semántico para búsquedas.
   - Versionar planes, precios y comisiones para soportar split billing, overrides y campañas.

6. **Infraestructura**
   - Preparar scripts de despliegue (Docker compose o equivalente) para front + API + base de datos.
   - Definir estrategia de backup para los JSON y la base SQLite (ideal migrar a Postgres cuando escale).

---

## 4. Variables y credenciales demo

- **Frontend `.env.local`**
  ```env
  NEXT_PUBLIC_API_BASE=http://localhost:4000
  NEXT_PUBLIC_ADMIN_TOKEN=MasterToken
  ```
- **Backend `server-node/.env`**
  ```env
  PORT=4000
  ADMIN_TOKEN=MasterToken
  DATABASE_URL="file:./dev.db"
  ```
- **Usuario admin sembrado**  
  `email: admin@oficiosya.com` (establecer contraseña manualmente al crear usuarios reales).

---

## 5. Próximos pasos sugeridos

1. **Publicar esta base**: confirmar que toda la tribu técnica use `server-node/` y documentar que FastAPI queda fuera del alcance inmediato.
2. **Sprint Backoffice**: priorizar verificación documental, agenda, cancelaciones y trazabilidad de TyC para blindaje legal.
3. **Sprint Pagos**: planificar integración con Mercado Pago (crear preference, webhooks, split billing) y definir políticas contables.
4. **Beta operativa**: antes de abrir a usuarios externos, ejecutar pruebas internas con los flujos end-to-end (cliente pide servicio → prestador presupuesta → admin verifica → agenda → cancelación/urgencia).
5. **Monitor y métricas**: agregar logging estructurado (nivel INFO/WARN/ERROR), generar reportes de SLA y preparar dashboards para soporte/reclamos.

---

**Fin del informe – 08/10/2025**
