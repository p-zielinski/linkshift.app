---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-05-28T15:47:40.181Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Rules
---

## Purpose
This OpenAPI tag covers the LinkShift endpoints related to managing redirect rules for API-key clients.

## Endpoints
- **`GET /api/v1/redirect-rules`** (`listRedirectRules`)
  - Lists redirect rules with cursor-style pagination ordered by `priority desc, createdAt desc, id desc`. Accepts parameters: `domainGroupId`, `limit`, `search`, `startAfterId`.

- **`POST /api/v1/redirect-rules`** (`createRedirectRule`)
  - Creates a new redirect rule with backend validation on various constraints including source regex, destination URL structure, and conditional expressions. Request body fields include: `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, `domainGroupId`. Response includes fields: `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, `updatedAt`.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit statistics for redirect rules within a specified time window. Accepts parameters: `limit`, `range`, `domainGroupId`, `start`, `end`. Response includes a `data` field.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates matching of redirect rules against request samples without applying live redirects. The request body can include `checkDestinationBlacklist` and `entries`. Response includes `results`.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a specific redirect rule by its ID. Response includes fields: `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, `updatedAt`.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates an existing redirect rule and re-validates it against backend constraints. Request body fields include: `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`. Response includes fields: `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, `updatedAt`.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft-deletes a redirect rule, preventing it from participating in future matches.

## Auth, billing, and rate limits
- Authentication is done using `X-API-Key: <your_key>` or `Authorization: ApiKey <your_key>`.
- API keys are organization-scoped, and API key management endpoints (`/api/v1/api-keys`) require dashboard user authentication.
- Requests are rate-limited per API key based on the organization's plan. Use `GET /api/v1/organization/usage` to check current limits. Exceeding limits results in a 429 response; implement backoff strategies.

## Data shapes
- **RedirectRuleQueryResult**: Paginated response for redirect rule queries.
- **CreateRedirectRuleRequest**: Payload for creating a redirect rule with fields: `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, `domainGroupId`.
- **RedirectRule**: Represents a redirect rule with fields: `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Contains aggregated analytics data.
- **SimulateRedirectsRequest**: Request payload for simulation with fields: `checkDestinationBlacklist`, `entries`.
- **RedirectSimulationResponse**: Contains simulation results for input request samples.
- **UpdateRedirectRuleRequest**: Payload for updating a redirect rule with fields: `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`.
- **QueryResultMeta**: Metadata for cursor-paginated responses.
- **ErrorResponse**: Standardized error payload with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`GET /api/v1/organization/usage`** (Organization Management) - For checking API key usage limits.
