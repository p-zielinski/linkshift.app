# AI Context: LinkShift

This file is a fast onboarding map for future AI agents working in this repository.

## Product Purpose

LinkShift is a multi-tenant redirect management platform.

- Tenant boundary: **Organization**.
- Users belong to one organization and collaborate on shared redirect infrastructure.
- Primary entities: `DomainGroup`, `Domain`, `RedirectRule`, `LinkMap`, `LinkMapEntry`, `RedirectTest`.

## Architecture Overview

## Backend (NestJS + Prisma + Redis)

Key paths:

- API controllers: `backend/src/api/*.controller.ts`
- Core redirect engine: `backend/src/redirect/redirect.service.ts`
- Rule validation: `backend/src/rule-validator/rule-validator.service.ts`
- Organization limits/subscription logic: `backend/src/organization/organization.service.ts`
- Billing/plan catalog: `backend/src/billing/*`
- Cache manager (L1 + Redis, plus rate limiting): `backend/src/cache/cache-manager.service.ts`

Important backend behaviors:

1. Redirect rule validation is strict and centralized in `rule-validator.service.ts`.
2. Redirect runtime context is cached (`REDIRECT_CONTEXT:*`) with L1 and Redis.
3. Rate limiting is scope-aware (`RateLimitScope`):
   - redirect traffic (organization-level)
   - API key traffic (per key)
4. API key auth is organization-scoped:
   - service: `backend/src/api-key/api-key.service.ts`
   - guard allowing user OR API key: `backend/src/auth/api-or-user-auth.guard.ts`
   - user-only guard: `backend/src/auth/auth.guard.ts`
5. API-key authenticated calls are blocked on Free plan with `402 Payment Required`.

## Backend Tools (NestJS + Redis)

Public marketing tools are served by a dedicated service:

- Service path: `backend-tools/*`
- Stacks:
  - `docker-stack.tools.infa.yml` (caddy-tools + redis-tools + dozzle-tools)
  - `docker-stack.tools.app.yml` (backend-tools)
- Caddy config: `config/Caddyfile.tools`
- Public controller: `backend-tools/src/api/public-tools.controller.ts`
- Endpoints:
  - `GET /api/v1/public/qr-code`
  - `GET /api/v1/public/trace` (single-step trace)
  - `GET /trace` (single-step alias)
  - `POST /api/v1/public/docs/search` — docs assistant (Turnstile + rate limits)
  - `POST /api/v1/public/docs/rate` — thumbs up/down on answers
  - `POST /api/v1/public/mcp` — MCP Streamable HTTP (read-only docs tools + `trace_redirect` + `generate_qr_code`; public, per-IP rate limit `MCP_RATE_LIMIT_PER_MINUTE` only)
- Redirect trace behavior:
  - One API call returns one hop (`maxRedirects: 0`)
  - Frontend decides whether to continue and applies hop limit/loop detection
  - SSRF guard blocks localhost and private IP ranges
  - Per-hop metrics include status, latency, destination, and headers
  - Response caching disabled (`Cache-Control: no-store`) for trace

## Frontend (Angular standalone + Signals Store)

Key paths:

- Routes: `frontend/src/app/app.routes.ts`
- API clients: `frontend/src/app/core/api/*`
- Tools API config token: `frontend/src/app/core/config/tools-api-config.ts`
- Signal stores: `frontend/src/app/core/store/*`
- Shared UI shell/components: `frontend/src/app/shared/components/*`

State-management conventions:

1. Server-backed entity lists/details use `createEntityStore` (`core/store/entity`).
2. Resource pages should read/write via stores, not hold long-lived API arrays locally.
3. Usage metrics are centralized in `OrganizationUsageStore`.
4. Store reset on logout is mandatory:
   - `AuthStore.logout()` resets all stores, including `ApiKeyStore`.

Relevant new API-key UI:

- Organization page button: `frontend/src/app/features/organization/organization-page.component.*`
- API key management page: `frontend/src/app/features/organization/organization-api-keys-page.component.*`
- API key dialog/table components under `frontend/src/app/features/organization/components/`.

SSR/CSR routing checklist for dashboard pages:

1. Add the Angular route in `frontend/src/app/app.routes.ts`.
2. Add matching `RenderMode.Client` entry in `frontend/src/app/app.routes.server.ts`.
3. If using custom Node SSR server path handling, verify `frontend/src/server.ts` (`CSR_ROUTES` and explicit static file routes).
4. If this is missed, refresh can execute server-side API calls without auth and trigger repeated unauthorized toasts.

## File-Tree Conventions

- Shared documentation (markdown + OpenAPI): `shared/docs/*`
- Docs sync script: `scripts/docs-sync.mjs` (`npm run docs:sync` from repo root)
- Docs AI agent: `agents/docs-assistant/` (implementation in `backend-tools/src/docs-assistant/`)
- Internal backend notes (non-public): `backend/docs/*` (e.g. testing plans, `redirect-engine-code-review-queue.md` for engine TDD follow-ups)
- Shared cross-runtime models: `shared/models/*`

## Development Notes

- **Frontend npm (VERY IMPORTANT):** lockfile must be updated with npm **10.9.4** only (`frontend/package.json` → `packageManager`). See [Deployment.Readme.md — Frontend dependencies (npm)](Deployment.Readme.md#frontend-dependencies-npm--very-important).
- **Backend Bun (VERY IMPORTANT):** after any `backend/package.json` change, run `bun install` in `backend/` and commit `backend/bun.lock`. CI and `backend/Dockerfile` use `bun install --frozen-lockfile` (Bun **1.3.11**). See [Deployment.Readme.md — Backend dependencies (Bun)](Deployment.Readme.md#backend-dependencies-bun--very-important).
- **Backend-tools Bun (VERY IMPORTANT):** after any `backend-tools/package.json` change, run `bun install` in `backend-tools/` and commit `backend-tools/bun.lock`. `backend-tools/Dockerfile` and `.github/workflows/deploy-tools-app.yml` use `bun install --frozen-lockfile` (Bun **1.3.11**). Verify with `cd backend-tools && bun install --frozen-lockfile` before deploy. See [Deployment.Readme.md — Backend-tools dependencies (Bun)](Deployment.Readme.md#backend-tools-dependencies-bun--very-important).
- Prisma schema source: `backend/prisma/schema.prisma`
- Shared Prisma client output: `shared/prisma-client`
- When schema changes, run backend build/generate to refresh Prisma clients.
- Frontend standards are documented in `frontend/CODING_STANDARDS.md` and should be followed for new pages/components.
- Frontend runtime config supports `APP_TOOLS_BASE_URL`; default local tools API is `http://localhost:3030`.
