---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-05-26T21:08:15.876Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Rules
---

## Purpose
This OpenAPI tag covers the LinkShift endpoints related to managing redirect rules for API-key clients.

## Endpoints
- **`GET /api/v1/redirect-rules`** (`listRedirectRules`)
  - Lists redirect rules with cursor-style pagination ordered by `priority desc, createdAt desc, id desc`. Notable parameters include `domainGroupId`, `limit`, `search`, and `startAfterId`.

- **`POST /api/v1/redirect-rules`** (`createRedirectRule`)
  - Creates a new redirect rule with deep backend validation. Key request fields include `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, and `domainGroupId`. The response includes fields such as `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, and `updatedAt`.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit statistics for redirect rules within a specified time window. Notable parameters include `limit`, `range`, `domainGroupId`, `start`, and `end`. The response contains a `data` field.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates redirect rule matching against request samples without applying live redirects. The request body can include `checkDestinationBlacklist` and `entries`. The response contains `results`.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a specific redirect rule by its ID. The response includes fields such as `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, and `updatedAt`.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates an existing redirect rule and re-runs backend validation. The request body includes `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, and `priority`. The response mirrors the fields of the `getRedirectRule` response.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft-deletes a redirect rule, preventing it from participating in future matching.

## Auth, billing, and rate limits
- Authentication is performed using `X-API-Key: <your_key>` or `Authorization: ApiKey <your_key>`.
- API keys are organization-scoped, and API key management endpoints (`/api/v1/api-keys`) are excluded from this API and require dashboard user authentication.
- Requests are rate-limited per API key according to the organization's plan. Use `GET /api/v1/organization/usage` to check current limits. If limits are exceeded, a 429 status code is returned; clients should implement backoff strategies.

## Data shapes
- **RedirectRuleQueryResult**: Paginated response for redirect rule queries.
- **CreateRedirectRuleRequest**: Payload for creating a redirect rule, including fields like `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, and `domainGroupId`.
- **RedirectRule**: Represents a redirect rule with fields such as `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, and `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Contains aggregated analytics data.
- **SimulateRedirectsRequest**: Payload for simulating redirect rules, including `checkDestinationBlacklist` and `entries`.
- **RedirectSimulationResponse**: Contains simulation results for each input request sample.
- **UpdateRedirectRuleRequest**: Payload for updating a redirect rule, similar to `CreateRedirectRuleRequest`.
- **QueryResultMeta**: Metadata for cursor-paginated query responses.
- **ErrorResponse**: Standardized error payload with fields like `code`, `key`, `message`, `details`, `requestId`, and `feature`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage** (Organization Usage) - to check current rate limits.
