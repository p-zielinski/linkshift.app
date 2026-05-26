# API Keys Testing Plan

This plan documents concrete unit and E2E cases for API key security, rate limiting, and cache invalidation.

## Implemented Unit Tests

### Cache and Rate Limiting

- `backend/src/cache/cache-manager.service.spec.ts`
  - verifies scoped rate-limit namespace for API keys (`RATE_LIMIT:api_key:<apiKeyId>:<minute>`)
  - verifies L1 block short-circuiting and Redis expiry behavior

### API Key Domain Logic

- `backend/src/api-key/api-key.service.spec.ts`
  - enforces key quota limits for finite plans (Basic/Pro)
  - returns `402` for Free-plan API usage
  - applies per-key limiter (`RateLimitScope.API_KEY`)
  - invalidates both Redis/L1 key caches on expiration updates and key delete

### Guard Layer

- `backend/src/auth/api-or-user-auth.guard.spec.ts`
  - accepts `X-API-Key` auth context
  - accepts valid user bearer token context
  - rejects requests without supported credentials

## Recommended E2E Cases

### 1) Free-tier API key paywall

1. Create API key via user-auth dashboard endpoint.
2. Perform API-key-authenticated call to `GET /api/v1/domains`.
3. Assert `402 Payment Required` with `feature=api_access`.

### 2) Per-key rate-limit isolation

1. Create two API keys in one paid organization.
2. Burst key A over its plan limit (Basic: >10/min).
3. Assert key A receives `429` while key B can still call successfully in the same minute.

### 3) Immediate invalidation on `expiresAt` update

1. Create API key with future expiration and confirm successful call.
2. Update key expiration to near-future (or immediate invalid state, if allowed).
3. Assert subsequent calls fail immediately (`401` when expired).

### 4) Immediate invalidation on delete

1. Create API key and verify endpoint access.
2. Delete key via user-auth `/api/v1/api-keys/:id`.
3. Assert next API-key-authenticated request fails (`401`).

### 5) Endpoint isolation

Using API key auth, assert access is denied for:

- `/api/v1/api-keys*`
- `/api/v1/auth/session`
- `/api/v1/organization/members`
- `/api/v1/billing/portal`

Expected: `401` (or `403` where applicable), never `200`.

### 6) Allowed resource coverage

Using API key auth, assert success for allowed resources:

- domain groups
- domains
- redirect rules (including simulate/analytics)
- redirect tests
- link maps
- link map entries
- organization usage

This ensures the guard split remains correct through regressions.
