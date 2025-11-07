# Consumer App (Client) Guidelines

Scope: This document governs all files under `app/app/client/**`.

Goals
- UX-first, friendly navigation for end users.
- Clear copy, helpful empty states, and guidance.
- Reuse shared primitives from `@/components/app` and shadcn from `@/components/ui`.

Layout & Shell
- Use the consumer shell/layout for all pages in this tree.
- Sidebar shows a minimal, task-oriented nav (examples: Panel, Servicios, Facturación, Preferencias).
- Topbar can include: role switcher, main CTA (Solicitar servicio), and help link.
- Spacing: prefer comfortable defaults (larger hit areas, `space-y-5` scale).

Components
- Prefer shadcn UI (`Card`, `Tabs`, `Accordion`, `Dialog`, `Button`, `Badge`, `Alert`).
- Use Tailwind utilities for extra styling; keep classes readable and consistent.
- Favor wizards and progressive disclosure for multi-step flows.

Content Patterns
- KPIs are simple and informative; emphasize next actions over raw metrics.
- Recommendations and upcoming bookings are prominent on the home page.
- Timeline is concise; favor human-readable copy.
- Provide rich empty states with clear calls to action.

Routing
- All consumer-facing routes live under `app/app/client/**`.
- Keep links literal in nav arrays (no computed paths).

Session & Authorization
- Fetch session via a cached server util (React `cache()`), not in client components.
- Layout validates the user has the consumer role; pages may add finer-grained checks.

Role Switching
- If the user has multiple roles, provide a role switcher in the topbar.
- Switching should persist a cookie (e.g., `activeRole`) and navigate to the analogous consumer route when possible.

Accessibility & Performance
- Use semantic headings and labels; maintain generous contrast.
- Stream RSC where possible; keep client islands narrow.
- Avoid large client bundles; paginate and defer heavy work.

Do/Don’t
- Do keep copy friendly and concise.
- Do optimize for clarity and next steps.
- Don’t mirror provider density; avoid overwhelming the user.

