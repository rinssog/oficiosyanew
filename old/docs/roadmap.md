# OficiosYa Roadmap (Sprint Backlog)

1. Centralizar logging y trazas del backend (`server-node/src/index.ts`).
2. Publicar calificaciones y métricas de prestadores (`services/ratings.ts`, `/api/admin/metrics`).
3. Motor de *feature flags* para experimentos (`utils/featureFlags.ts`).
4. Pipeline de evidencias con watermark (`services/evidence.ts`).
5. Integración RENAPER / CAP mock (`services/renaper.ts`).
6. Simulación de *escrow* y pagos por hitos (`services/escrow.ts`).
7. Chat interno cliente–prestador (`services/chat.ts`).
8. Cola de notificaciones *push* (`services/push.ts`).
9. Exportación CSV de métricas admin (`/api/admin/metrics/export`).
10. Gestión de planes desde admin (`pages/admin/paginas.js`, `/api/admin/plans`).
11. Landing de planes dinámica (`pages/planes.js`, `/api/admin/plans`).
12. Contratos y seguros dinámicos (`pages/client/contratos.js`, `/api/client/*`).
13. Backoffice de documentación en vivo (`pages/admin/documentacion.js`, `/api/admin/documents/pending`).
14. Agenda y disponibilidad con slots dinámicos (`components/ProviderAvailability.jsx`, endpoints `/api/providers/*`).
15. Tests unitarios base (agenda/documentos) – Vitest (`server-node/src/__tests__`).
16. Motor de auditoría para cambios sensibles (`services/audit.ts`).
17. Registro de consentimientos y privacidad (`services/privacy.ts`).
18. Catálogo multirregional (`AVAILABLE_REGIONS`).
19. FAQ/Chatbot con contenido estructurado (`services/faq.ts`).
20. Orquestador de emails transaccionales (`services/mailer.ts`).
