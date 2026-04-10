# Redirect Master

Redirect Master is a multi-tenant redirection platform with a NestJS backend,
Angular frontend, and shared models. It includes plan-based limits, billing via
Lemon Squeezy, Redis-backed caching and rate limiting, and an ngrok-based local
testing flow for webhooks and redirects.

## Repository layout
- `backend/`: NestJS API, billing, subscriptions, redirects, caching.
- `frontend/`: Angular 21 UI (SSR-ready).
- `shared/`: shared models and types used by backend and frontend.
- `documentation.html`: end-user guide for redirect rule syntax.

## Quick start (local)
1) Start dependencies (Postgres + Redis) using Docker Compose:
```bash
docker compose up -d
```

2) Configure env files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3) Install dependencies:
```bash
cd backend && bun install
cd ../frontend && npm install
```

4) Run backend:
```bash
cd backend
bun run start:dev
```
`start:dev` runs migrations, starts NestJS in watch mode, and launches ngrok.
Use `bun run start:dev-offline` if you do not want ngrok.

5) Run frontend:
```bash
cd frontend
npm run start
```

## Environment variables

### Backend (`backend/.env`)
Core:
- `NODE_ENV`: `development` or `production`. Controls logging and security headers.
- `PORT`: API port (default `3000`).
- `API_HOSTNAME`: Hostname used to distinguish API traffic from redirect traffic.
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins.
- `TRUST_PROXY`: Set `true` behind a proxy or load balancer so IP-based logic is correct.
- `HOST_ID`: Optional fingerprint used for CUIDs; keep stable per environment.

Database:
- `DATABASE_URL`: Postgres connection string used by Prisma.

Redis:
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`: Redis connection.
  Redis is used for caching, rate limiting, and token blacklisting.

Auth:
- `JWT_SECRET`: Access token signing secret.
- `JWT_REFRESH_SECRET`: Refresh token signing secret.
- `JWT_REFRESH_EXPIRES_IN`: Refresh token TTL (e.g. `7d`, `12h`).
  Refresh tokens are stored in an HttpOnly cookie.

Billing (Lemon Squeezy):
- `LEMON_SQUEEZY_API_KEY`: API token (in Swarm, use secret `lemon_squeezy_api_key`).
- `LEMON_SQUEEZY_STORE_ID`: Store identifier.
- `LEMON_SQUEEZY_PRODUCT_ID`: Optional product ID to speed up variant price lookups.
- `LEMON_SQUEEZY_WEBHOOK_SECRET`: Webhook signing secret (in Swarm, use secret `lemon_squeezy_webhook_secret`).
- `LEMON_SQUEEZY_SUCCESS_URL`: Base redirect URL after checkout.
  The app appends `checkout_session=<id>` to both URLs automatically.
- `LEMON_SQUEEZY_VARIANT_BASIC_MONTHLY_ID`: Variant ID for the Basic (monthly) plan.
- `LEMON_SQUEEZY_VARIANT_BASIC_YEARLY_ID`: Variant ID for the Basic (yearly) plan.
- `LEMON_SQUEEZY_VARIANT_PRO_MONTHLY_ID`: Variant ID for the Pro (monthly) plan.
- `LEMON_SQUEEZY_VARIANT_PRO_YEARLY_ID`: Variant ID for the Pro (yearly) plan.

Ngrok (local dev only):
- `NGROK_AUTH_TOKEN`: Ngrok auth token used by `start:dev`.
- `NGROK_URL`: Automatically injected by the ngrok wrapper.
- `DEV_NGROK_ORG_ID`: Organization to receive the ngrok domain.
- `DEV_NGROK_ORG_EMAIL`: Alternative to org ID (owner email).
- `DEV_NGROK_DOMAIN_GROUP_ID`: Optional domain group to attach the ngrok domain.
  On each dev startup, any existing `*ngrok*` domains for that org are removed
  and replaced with the new ngrok hostname.

### Frontend (`frontend/.env`)
- `PORT`: SSR server port (when running `serve:ssr:frontend`).
- `APP_BASE_URL`: Base URL for API calls, exposed to the browser.

## Docker Compose defaults
The provided `docker-compose.yml` exposes:
- Postgres on port `5454`
- Redis on port `6767`

If you use Docker Compose, update `DATABASE_URL` and `REDIS_PORT` accordingly.

## Docker Swarm (Stack Deployment)
We deploy **two stacks** to keep Traefik stable during app updates:
- **Infra stack**: Traefik + Postgres + Redis + Loki/Promtail + Grafana + Dozzle
- **App stack**: Backend + Frontend

Both stacks connect to the same external overlay network so Traefik can route
to the app without restarting when you deploy the app stack.

### 1) Build and push images (registry login required)
Login to your registry (example: GHCR):
```bash
docker login ghcr.io
```

Build and push images from the repo root:
```bash
docker build -f backend/Dockerfile -t ghcr.io/your-org/linkshift-backend:latest .
docker build -f frontend/Dockerfile -t ghcr.io/your-org/linkshift-frontend:latest .

docker push ghcr.io/your-org/linkshift-backend:latest
docker push ghcr.io/your-org/linkshift-frontend:latest
```

### 2) Prepare the stack environment
Copy the env template and set values for your domains and runtime config:
```bash
cp deploy/stack.env.example deploy/stack.env
```

Export it for `docker stack deploy`:
```bash
set -a
source deploy/stack.env
set +a
```

### 3) Create the shared Swarm network
Create the external overlay network once (manager node):
```bash
docker network create --driver overlay --attachable ${TRAEFIK_SWARM_NETWORK}
```

### 4) Create Docker secrets (sensitive keys)
Swarm stores secrets internally and mounts them into containers. Backend loads
them at runtime via `backend/docker-entrypoint.sh`.

Required secrets (create once on the Swarm manager):
```bash
printf "postgres-password" | docker secret create postgres_password -
printf "redis-password" | docker secret create redis_password -
printf "postgresql://postgres:postgres-password@postgres:5432/linkshift?schema=public" | docker secret create database_url -
printf "jwt-secret" | docker secret create jwt_secret -
printf "jwt-refresh-secret" | docker secret create jwt_refresh_secret -
printf "sentry-dsn" | docker secret create sentry_dsn -
```

Billing + email + safe browsing secrets (if enabled):
```bash
printf "lemon-api-key" | docker secret create lemon_squeezy_api_key -
printf "lemon-webhook-secret" | docker secret create lemon_squeezy_webhook_secret -
printf "zeptomail-api-key" | docker secret create zeptomail_api_key -
printf "web-risk-browsing-api-key" | docker secret create web_risk_api_key -
```

### 5) Initialize Swarm and deploy
Initialize Swarm on the manager node (run once):
```bash
docker swarm init
```

Deploy infra stack (Traefik + data + observability):
```bash
docker stack deploy -c docker-stack.infra.yml --with-registry-auth ${INFRA_STACK_NAME}
```

Deploy app stack (backend + frontend):
```bash
docker stack deploy -c docker-stack.app.yml --with-registry-auth ${APP_STACK_NAME}
```

Check status:
```bash
docker stack services ${INFRA_STACK_NAME}
docker stack services ${APP_STACK_NAME}
```

### 6) Routing notes (Traefik)
Set DNS (or `/etc/hosts`) for:
- `FRONTEND_HOST` (app)
- `BACKEND_HOST` (api)
- `GRAFANA_HOST` (grafana)
- `DOZZLE_HOST` (dozzle)

For local testing, add:
```
127.0.0.1 app.localhost api.localhost grafana.localhost dozzle.localhost
```

### 7) Dynamic domain updates (Traefik labels)
Backend can update Traefik router rules when domains change:
- Enable with `TRAEFIK_UPDATE_ENABLED=true`.

## Custom plans (per organization)
Custom plans are stored in Postgres and are visible only to the owning organization.
They show up inside the upgrade dialog and can be purchased like any other plan.

### Table schema
Custom plans live in the `CustomPlan` table with these fields:
- `id`: Custom plan ID (string).
- `organizationId`: Owning organization ID.
- `name`: Plan display name shown in the UI.
- `description`: Optional short description.
- `monthlyVariantId`: Lemon Squeezy variant ID for monthly billing.
- `yearlyVariantId`: Lemon Squeezy variant ID for yearly billing.
- `limits`: JSON payload matching `PlanLimits` in `backend/src/billing/billing.config.ts`.

### Create a custom plan (manual)
Insert a record with limits tailored to the organization. Example:
```sql
INSERT INTO "CustomPlan" (
  "id",
  "organizationId",
  "name",
  "description",
  "monthlyVariantId",
  "yearlyVariantId",
  "limits",
  "createdAt",
  "updatedAt"
)
VALUES (
  'cpl_custom_001',
  'org_123',
  'Enterprise',
  'Higher limits for the enterprise rollout',
  '1299001',
  '1299002',
  '{
     "maxDomainGroups": 5,
     "maxDomainsPerGroup": 50,
     "maxTotalDomains": 50,
     "maxRulesPerGroup": 2000,
     "maxTotalRules": 2000,
     "maxTestsPerGroup": 4000,
     "maxTotalTests": 4000,
     "maxUsers": 20,
     "redirectionLimitPerMinute": 500
   }'::jsonb,
  NOW(),
  NOW()
);
```

Tip: you can run the insert directly via `psql`:
```bash
psql "$DATABASE_URL" -c "INSERT INTO \"CustomPlan\" (\"id\",\"organizationId\",\"name\",\"description\",\"monthlyVariantId\",\"yearlyVariantId\",\"limits\",\"createdAt\",\"updatedAt\") VALUES ('cpl_custom_001','org_123','Enterprise','Higher limits for the enterprise rollout','1299001','1299002','{\"maxDomainGroups\":5,\"maxDomainsPerGroup\":50,\"maxTotalDomains\":50,\"maxRulesPerGroup\":2000,\"maxTotalRules\":2000,\"maxTestsPerGroup\":4000,\"maxTotalTests\":4000,\"maxUsers\":20,\"redirectionLimitPerMinute\":500}'::jsonb,NOW(),NOW());"
```

### Purchase flow
1) Log in as a user in the organization that owns the custom plan.
2) Open the upgrade dialog (Dashboard → Upgrade).
3) Choose the custom plan card and select monthly or yearly billing.

The checkout payload includes `customPlanId` so webhooks map the subscription
back to the plan and apply the custom limits.
Custom plan catalogs are cached for ~10 minutes, so allow a short delay after
inserting a new record.
- Set `TRAEFIK_TARGET_SERVICE` to the Swarm service name
  (e.g. `${APP_STACK_NAME}_backend`).
- Set `TRAEFIK_BASE_HOSTS` to include your API host.

This requires mounting `/var/run/docker.sock` into the backend container
and running in production mode. Expect a short rolling update when the rule
changes.

## Secret management notes
- Use `docker login` and deploy with `--with-registry-auth` so Swarm can pull
  private images.
- Manage secrets with `docker secret ls` and `docker secret rm <name>`.
- Backend secrets are mounted at `/run/secrets/*` and loaded by
  `backend/docker-entrypoint.sh`.

## Observability & Monitoring
Architecture:
- NestJS emits JSON logs via `nestjs-pino` -> Promtail tails Docker logs -> Loki stores them -> Grafana queries them.

Services:
- Grafana: `http://localhost:4000` (User: `admin`, Password: `GF_SECURITY_ADMIN_PASSWORD` from `.env`).
- Dozzle: `http://localhost:8888`.

Testing:
- Call `GET /debug-sentry` to trigger a deliberate error and verify GlitchTip/Sentry alerts.

Startup:
```bash
docker compose up -d
```

## Billing flow (high level)
- Checkout creates a local `BillingCheckoutSession` record.
- Lemon Squeezy webhooks update subscription status.
- The UI shows a "Processing" dialog and polls the backend for the session status.

## Testing
Backend:
```bash
cd backend
bun run test
```

Frontend:
```bash
cd frontend
npm run test
```

## Formatting and pre-commit
Angular templates are formatted and linted via ESLint + Prettier:
```bash
cd frontend
npm run format:templates 
```

Pre-commit runs template formatting on staged HTML via Husky + lint-staged.

## Additional docs
- `documentation.html` contains the redirect rules syntax guide.
- `backend/README.md` documents the API endpoints.
