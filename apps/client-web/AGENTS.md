Purpose

- This file guides agents contributing to this repo.
- Scope: applies to the entire `apps/backoffice` app unless an AGENTS.md in a subdirectory overrides it.

Tech Stack

- Next.js App Router (SSR/SSG/ISR; React Server Components by default)
- tRPC for type-safe API calls
- Better-Auth for authentication
- TailwindCSS for styling; shadcn/ui for components
- TypeScript everywhere (no implicit any)

Repository Layout

- App Router: `src/app`
  - Route groups: `src/app/(group)/...`
  - Protected pages: `src/app/(protected)/...`
  - API route handlers: `src/app/api/...`
- UI Components: `src/components`
  - shadcn components: `src/components/ui`
  - App-specific components: `src/components/{feature}/*.tsx`
- Styles: `src/styles` (global CSS, Tailwind layer files if needed)
- tRPC:
  - Routers: `src/server/api/routers/*.ts`
  - Root router: `src/server/api/root.ts`
  - tRPC context: `src/server/api/trpc.ts`
  - Adapter handler (App Router): `src/app/api/trpc/[trpc]/route.ts`
- Auth (Better-Auth):
  - Server config/session helpers: `src/server/auth/*.ts`
  - Client hooks/helpers: `src/lib/auth-client.ts`
  - Middleware and route guards: `src/middleware.ts` and/or server components
- Utilities: `src/lib/*.ts`
- Types: `src/types/*.ts`
- Env helpers: `src/env.mjs` or `src/env.ts` (use Zod to validate)

Conventions

- Server-first: files are server components by default; add `use client` only where necessary (stateful UI, event handlers, effects).
- Do not import server-only modules into client components. Keep server-only code in `src/server/**` or files marked server-only.
- File and directory names: kebab-case for folders, file names. Exports use PascalCase for components, camelCase for functions/vars.
- Co-locate tests next to code: `*.test.ts` / `*.test.tsx`.
- Keep tRPC procedures small and composable; avoid overloading a single router.
- Prefer Zod schemas for all external boundaries (env, forms, inputs to tRPC).
- Favor composition over inheritance; keep components narrow in scope.

Environment

- Required env vars (example names; keep in `.env.local`, never commit):
  - `NEXT_PUBLIC_APP_URL`
  - `BETTER_AUTH_SECRET` (server)
  - `BETTER_AUTH_*` provider keys as required (server)
  - Any DB or upstream API keys as needed
- Validate env in `src/env.ts` using Zod; fail fast on invalid/missing vars.

Local Development

- Runtime: `bun`
- Install: `bun install` (preferred)
- Dev server: `bun dev`
- Type check: `bun types`
- Lint: `bun lint`
- Format: `bun fmt`
- Build: `bun build`
- Start: `bun start`
- Add shadcn component: `bunx shadcn@latest add`
- Generate tRPC types if applicable to your setup; ensure editor TypeScript server is picking up project references.

App Router Guidelines

- Data fetching:
  - Use server components for data reads (async components).
  - Use tRPC server calls inside server components or route handlers when possible.
  - Client components should call tRPC via React Query hooks for interactive UX.
- Caching:
  - For route handlers, use Next.js caching primitives or fetch cache options.
  - For server components, prefer fetch with cache options or tRPC with explicit cache boundaries.
- Navigation:
  - Use `next/navigation` (`useRouter`, `redirect`, `notFound`).
- Error boundaries:
  - Use `error.tsx` and `loading.tsx` at route segment level.

tRPC Setup

- Router structure:
  - Each feature gets a router in `src/server/api/routers/feature.ts`.
  - Export them via `src/server/api/root.ts` using `createTRPCRouter`.
- Context:
  - Create request-scoped context in `src/server/api/trpc.ts` (e.g., user session from Better-Auth).
- Adapters:
  - Add a Next.js App Router handler at `src/app/api/trpc/[trpc]/route.ts`.
- Input/Output:
  - Validate inputs with Zod. Never trust client input.
- Client usage:
  - Client hooks from tRPC + React Query for mutations and client-side queries.
  - In server components, call tRPC procedures via server helpers or directly if configured; do not import client hooks in server files.

Better-Auth Guidelines

- Server:
  - Centralize Better-Auth config in `src/server/auth/config.ts`.
  - Provide server utilities `getSession()`, `requireUser()`, etc., in `src/server/auth/session.ts`.
  - Use these utilities in server components and route handlers.
- Client:
  - Expose minimal client helpers or hooks in `src/lib/auth-client.ts` for sign-in/out flows.
- Protection patterns:
  - Server component guard: fetch session; if absent, `redirect('/sign-in')`.
  - Route handlers: check session in handler; return `401` for unauthenticated.
  - Middleware: optional for coarse-grained protection; prefer server checks for accuracy with App Router.
- Tokens/secrets:
  - All secrets must be server-only; never expose in `NEXT_PUBLIC_*`.
- Avoid coupling auth logic to UI; keep logic in `src/server/auth/**` and small client adapters.

shadcn/ui + Tailwind

- Tailwind config:
  - `tailwind.config.ts`: ensure `content` includes `src/app/**/*`, `src/components/**/*`, and shadcn paths.
  - Keep design tokens via CSS variables where possible (colors, radii).
- Components:
  - Place generated shadcn components under `src/components/ui`.
  - Do not modify shadcn base components heavily; wrap them for app-specific needs in `src/components/{feature}`.
  - UI imports rule: import UI components only from `@/components/**`. Do not import Radix primitives directly in app code; prefer the wrapped shadcn components under `src/components/**`.
- Styling:
  - Use Tailwind utility classes; avoid inline styles except for dynamic cases.
  - Prefer `class-variance-authority` patterns if present, otherwise stick to simple props.
- Accessibility:
  - Favor accessible primitives; ensure interactive elements have roles, labels, and focus states.

State Management

- Prefer server data + React Query (via tRPC) for client state.
- Use local component state for ephemeral UI state.
- Avoid global stores unless justified; if needed, keep minimal and typed.

Error Handling and Logging

- Validate all inputs with Zod at tRPC boundaries and forms.
- Use `try/catch` at route handlers; return typed error shapes from tRPC.
- Log server-side errors with a single logger util in `src/lib/logger.ts`.
- Never leak internal error messages to clients; map to safe messages.

Testing

<!-- - Unit tests: `vitest` in `*.test.ts(x)` adjacent to code. -->
<!-- - Component tests: `vitest` + `@testing-library/react`. -->
<!-- - e2e (optional): `playwright` under `e2e/` with an isolated test DB if applicable. -->
- For tRPC, test routers by calling procedures with a mocked context.
- CI should run typecheck, lint, tests, and build.

Performance

- Default to server components to reduce client JS.
<!-- - Split critical above-the-fold UI carefully; use `loading.tsx` for skeletons. -->
- Memoize expensive client components; avoid unnecessary `useEffect`.
- Use `dynamic()` with `ssr: false` only when strictly necessary.

Security

- Never trust client input; always validate via Zod.
- Ensure auth checks on all mutations and protected queries.
- Sanitize/escape user-generated content before render.
- Do not log Enviroment variables
- Do not log secrets.
- Do not log tokens.
- Keep dependencies updated and minimal.

Git and Reviews

- Small, focused PRs. Link to issue or include a concise rationale.
- Commit messages: type(scope): summary (e.g., feat(auth): add session guard).
- Do not mix refactors with feature/bugfix changes unless necessary and documented.

Do/Don’t

- Do:
  - Keep components small, accessible, and typed.
  - Centralize cross-cutting concerns (auth, env, logging).
  - Write Zod schemas for every external boundary.
- Don’t:
  - Put server-only logic in client bundles.
  - Add new global state without discussing trade-offs.
  - Hardcode URLs, secrets, or feature flags.

Release Checklist

- Env vars documented and present.
- Typecheck, lint, tests, and build pass.
- Protected routes verified with and without session.
- tRPC inputs validated; breaking changes noted.
- UI uses stable shadcn components; no dev-only styles ship.

Notes for Future Agents

- If you need to introduce new infra (DB, queues, file storage), add a focused section to this AGENTS.md near “Tech Stack” and update env validation and local dev steps.
- If Better-Auth or tRPC require config updates across server/client, document the contract and entrypoints in “Auth” and “tRPC Setup” sections.
