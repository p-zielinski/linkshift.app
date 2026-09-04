# LinkShift.app

> **DISCONTINUED — hosted service shut down.**  
> The SaaS at linkshift.app is no longer available. This repository remains open source (MIT) for archival use, self-hosting, and forks.  
> Questions or contact: [LinkedIn](https://www.linkedin.com/in/p-zielinski96/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Multi-tenant redirect management platform — NestJS API, Angular UI, Redis caching/rate limits, plan limits, and Paddle billing for the (former) hosted service.

**Hosted service:** discontinued  
**Source:** [https://github.com/p-zielinski/linkshift.app](https://github.com/p-zielinski/linkshift.app)

## Status

This repository is **open source (MIT)**. The previously hosted product is shut down; there is no public hosted instance and no commercial support. You can still run the stack yourself from this codebase.

## Repository layout

- `backend/` — NestJS API, billing, subscriptions, redirects, caching
- `frontend/` — Angular UI (SSR-ready), marketing site, dashboard, docs UI
- `backend-tools/` — public tools API (QR, redirect trace, docs assistant, MCP)
- `shared/` — shared models, public docs sources, operator notes (`shared/not-public/`)
- `INFRASTRUCTURE.md` — runtime notes for cache and CORS
- `Deployment.Readme.md` — production Docker Swarm / CI details

## Quick start (local)

1. Start dependencies (Postgres + Redis):

```bash
docker compose up -d
```

2. Configure env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp backend-tools/.env.example backend-tools/.env
```

3. Install dependencies:

```bash
cd backend && bun install
corepack enable
cd ../frontend && npm install
cd ../backend-tools && bun install
```

> **Backend:** after changing `backend/package.json`, run `bun install` in `backend/` and commit `backend/bun.lock`. CI uses `bun install --frozen-lockfile` (Bun 1.3.11). Details: [Deployment.Readme.md — Backend dependencies (Bun)](Deployment.Readme.md#backend-dependencies-bun--very-important).

> **Frontend:** use npm **10.9.4** (via Corepack / `packageManager` in `frontend/package.json`). Other npm versions can desync `package-lock.json`. Details: [Deployment.Readme.md — Frontend dependencies (npm)](Deployment.Readme.md#frontend-dependencies-npm--very-important).

4. Run backend:

```bash
cd backend
bun run start:dev
```

`start:dev` runs migrations, starts NestJS in watch mode, and launches ngrok. Use `bun run start:dev-offline` without ngrok.

5. Run frontend:

```bash
cd frontend
npm run start
```

6. (Optional) Run public tools API:

```bash
cd backend-tools
bun run start:dev
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for tests, PR hygiene, and coding standards. Report vulnerabilities via [SECURITY.md](./SECURITY.md).

## Environment variables

### Backend (`backend/.env`)

Core:

- `NODE_ENV`: `development` or `production`
- `PORT`: API port (default `3000`)
- `API_HOSTNAME`: Hostname used to distinguish API traffic from redirect traffic
- `CORS_ORIGINS`: Comma-separated allowed frontend origins
- `TRUST_PROXY`: Set `true` behind a proxy/load balancer
- `HOST_ID`: Optional fingerprint used for CUIDs; keep stable per environment

Database:

- `DATABASE_URL`: Postgres connection string (Prisma)

Redis:

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD` — cache, rate limiting, token blacklist

Auth:

- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` (e.g. `7d`)
  Refresh tokens use an HttpOnly cookie.

Billing (Paddle — hosted / optional self-host):

- `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_SUCCESS_URL`
- `PADDLE_API_VERSION` (optional)
- `PADDLE_PRICE_BASIC_MONTHLY_ID`, `PADDLE_PRICE_BASIC_YEARLY_ID`
- `PADDLE_PRICE_PRO_MONTHLY_ID`, `PADDLE_PRICE_PRO_YEARLY_ID`

Ngrok (local dev only):

- `NGROK_AUTH_TOKEN`, `NGROK_URL` (injected by wrapper)
- `DEV_NGROK_ORG_ID` or `DEV_NGROK_ORG_EMAIL`
- `DEV_NGROK_DOMAIN_GROUP_ID` (optional)

### Frontend (`frontend/.env`)

- `PORT`: SSR server port (when running `serve:ssr:frontend`)
- `APP_BASE_URL`: Base URL for API calls, exposed to the browser

### Backend tools (`backend-tools/.env`)

See `backend-tools/.env.example` (port, CORS, Turnstile, rate limits, optional Supabase for docs-assistant logs).

## Docker Compose defaults

`docker-compose.yml` exposes:

- Postgres on port `5454`
- Redis on port `6767`

Update `DATABASE_URL` and `REDIS_PORT` accordingly.

## Production (Docker Swarm)

Full production deploy (Caddy, secrets, Swarm stacks, CI) is documented in **[Deployment.Readme.md](Deployment.Readme.md)**. Summary:

1. Copy `deploy/stack.env.example` → `deploy/stack.env` and set hosts/images.
2. Build/push images (`backend`, `frontend`, `backend-tools`, Caddy).
3. Create Docker secrets and the shared overlay network.
4. Deploy infra + app (+ tools) stacks from the root `docker-stack.*.yml` files.

Do not commit `deploy/stack.env` or Dozzle user YAML — use the `.example` files and Swarm/GitHub secrets.

### Custom plans (per organization)

Custom plans live in Postgres (`CustomPlan`) and appear in the upgrade dialog for that organization only. Fields match `PlanLimits` in `backend/src/billing/billing.config.ts`. See older notes in git history or insert via SQL against your DB; checkout includes `customPlanId` for webhook mapping. Catalog cache is ~10 minutes.

## Observability

- NestJS JSON logs (`nestjs-pino`) → Promtail → Loki → Grafana (Swarm infra stack)
- Dozzle for container logs
- Optional Sentry/GlitchTip (`GET /debug-sentry` for a deliberate error in non-prod setups)

Operator-oriented notes: [`shared/not-public/`](./shared/not-public/).

## Billing flow (high level)

- Checkout creates a local `BillingCheckoutSession`
- Paddle webhooks update subscription status
- UI shows a processing dialog and polls session status

## Testing

```bash
cd backend && bun run test
cd frontend && npm run test
cd backend-tools && bun run test
```

## Formatting and pre-commit

```bash
cd frontend
npm run format:templates
```

Pre-commit formats staged HTML via Husky + lint-staged.

## Additional docs

- Public product docs: sources under `shared/docs/` (synced into the app docs UI)
- API contract: `shared/docs/openapi/linkshift-api-keys.openapi.yaml`
- `backend/README.md` — API overview notes
- `AI_CONTEXT.md` — architecture map for contributors and agents
