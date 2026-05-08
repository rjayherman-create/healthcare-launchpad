# Healthcare Launchpad

A full-stack healthcare career platform connecting students with clinical internships and jobs, and giving employers a place to post and manage positions — focused on Long Island, NY.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, preview at `/api`)
- `pnpm --filter @workspace/healthcare-frontend run dev` — run the React frontend (port 26071, preview at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` — server Clerk auth
- Required env: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PROXY_URL` — frontend Clerk auth

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Wouter routing, @clerk/react, @tanstack/react-query
- API: Express 5 with Clerk middleware
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/healthcare-frontend/` — React + Vite frontend
- `artifacts/api-server/` — Express API server
- `artifacts/api-server/src/routes/` — route handlers (jobs, profiles, employers, applications, dashboard)
- `lib/api-spec/` — OpenAPI spec (`openapi.yaml`) — source of truth for API contract
- `lib/api-client-react/` — generated React Query hooks (`src/generated/api.ts`)
- `lib/api-zod/` — generated Zod schemas (`src/generated/api.ts`) — index.ts must stay as single `export *` line
- `lib/db/` — Drizzle ORM schema and migrations

## Architecture decisions

- Contract-first API: OpenAPI spec drives code generation for both client hooks and server validators
- Clerk auth proxied through the Express server so cookies work cross-origin in the Replit iframe preview
- x-clerk-user-id header pattern: frontend passes the Clerk user ID as a header for authenticated API calls (no JWT decoding needed server-side since Clerk middleware validates sessions)
- Row-level scoping: profile/employer/application routes filter by clerkUserId extracted from the request header
- Dashboard stats are computed server-side with SQL aggregate queries; recent-activity is a union of job/application events

## Product

- **Students**: Browse jobs, filter by specialty/type/location, create a profile, apply with a cover letter, track application status
- **Employers**: Set up an organization profile, post positions, manage listings, browse candidate profiles
- **Public**: Landing page with featured jobs and platform stats, job browser (no login required)

## Gotchas

- `lib/api-zod/src/index.ts` must remain `export * from "./generated/api";` only — codegen regenerates it and adds extra exports that cause duplicates if the file has other content
- The Clerk publishable key is resolved per-host (supports Replit preview proxy) via `publishableKeyFromHost` from `@clerk/react/internal`
- Do NOT use `afterSignOutUrl` on `<UserButton>` — that prop was removed in newer Clerk versions
- Always use `localhost:80` (shared proxy) for curl/testing, never the raw service ports

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
