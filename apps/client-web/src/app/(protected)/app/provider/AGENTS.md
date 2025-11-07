# Provider App (Service Provider) Guidelines

Scope: This document governs all files under `app/app/provider/**`.

Goals
- Data-dense, operations-focused dashboard for providers.
- Fast triage, filtering, and batch actions.
- Reuse shared primitives from `@/components/app` and shadcn from `@/components/ui`.

Layout & Shell
- Use the provider shell/layout for all pages in this tree.
- Sidebar emphasizes operational sections (e.g., Hoy, Órdenes, Agenda, Mensajes, Facturación, Reportes).
- Topbar should include quick filters, global search, notifications, and primary actions (e.g., Crear orden).
- Spacing: compact defaults (e.g., `gap-3`) to maximize information density.

Components
- Prefer shadcn UI (`Table`, `DropdownMenu`, `Popover`, `Select`, `Tabs`, `Badge`, `AlertDialog`, `Menubar`, `Progress`).
- Tables should include pagination, sorting, filtering, and toolbar actions.
- Charts and calendars belong in client islands; keep SSR surfaces light.

Content Patterns
- Home dashboard: KPI header row + queue/alerts + agenda/messages panels.
- Drill-down pages: strong filters, saved views, bulk actions.
- Status is always visible (badges/colors), with quick edits and inline actions.

Routing
- All provider routes live under `app/app/provider/**`.
- Keep links literal in nav arrays; avoid indirection.

Session & Authorization
- Fetch session via a cached server util (React `cache()`), not in client components.
- Layout validates the user has the provider role; pages add granular permission checks when needed.

Dual-Role Users
- If a user is both consumer and provider, use a topbar role switcher.
- Persist selection (cookie `activeRole`) and map to the analogous provider route when possible.

Accessibility & Performance
- Keyboard-friendly controls; visible focus; aria labels for tables/filters.
- Virtualize large datasets; paginate aggressively.
- Defer heavy client libraries to islands; stream the rest via RSC.

Do/Don’t
- Do optimize for speed, clarity, and batch operations.
- Do surface anomalies and alerts prominently.
- Don’t hide critical actions behind deep menus.

