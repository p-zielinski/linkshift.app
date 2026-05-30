---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-05-30T06:58:16.061Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Rules
---

## Purpose
This OpenAPI tag covers the management of redirect rules for API-key clients, allowing automation of redirect configurations and operational checks.

## Endpoints
- **`GET /api/v1/redirect-rules`** (`listRedirectRules`)
  - Lists redirect rules for a specified `domainGroupId`, ordered by `priority`. Supports pagination with `limit` (default 20, max 100) and `startAfterId`. Optional `search` parameter filters results by source or destination text. Returns a 400 error for invalid query parameters.

- **`POST /api/v1/redirect-rules`** (`createRedirectRule`)
  - Creates a new redirect rule for live matching within a domain group. Not idempotent; duplicate sources may be rejected. Requires fields such as `source`, `destination`, `statusCode`, and `domainGroupId`. Returns 200 with details of the created rule or 400 for validation errors.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit counts for redirect rules, with optional filtering by `domainGroupId` and time range. Supports preset (`day`, `week`, `month`) and custom date ranges. Returns a 200 response with analytics data.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates matching of up to 100 request samples against current redirect rules without issuing actual redirects. Requires `entries` in the request body and can check destination blacklists. Returns 200 with simulation results.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a redirect rule by its ID, returning full details including `source`, `destination`, and `priority`. Returns 404 if the rule is soft-deleted or not in the organization.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates an existing redirect rule's mutable fields. Changes take effect on the next request. Returns 200 with updated rule details or 400/404 for validation errors or out-of-scope IDs.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft deletes a redirect rule, removing it from live matching. Idempotent; repeated deletes on the same ID return 404 once the rule is gone.

## Auth, billing, and rate limits
- Authentication is required for all requests using `X-API-Key: <your_key>` or `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing, revoked, or incorrect key.
- A `402` error occurs if API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been exceeded; clients should implement backoff strategies.
- A `400` error indicates validation failures in request bodies or query parameters, with details provided in the response.
- A `404` error indicates that the requested ID does not exist or is not within the organization scope.

## Data shapes
- **RedirectRuleQueryResult**: Response schema for paginated redirect rule queries.
- **CreateRedirectRuleRequest**: Request payload for creating a redirect rule, including fields like `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, and `domainGroupId`.
- **RedirectRule**: Represents a live redirect matcher, with fields such as `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, and `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Response schema for aggregated rule-level traffic analytics, containing a `data` field.
- **SimulateRedirectsRequest**: Request payload for simulating redirects, including `checkDestinationBlacklist` and `entries`.
- **RedirectSimulationResponse**: Response schema for simulation results, containing `results`.
- **UpdateRedirectRuleRequest**: Request payload for updating a redirect rule, including fields like `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, and `priority`.
- **ErrorResponse**: Standard error response schema with fields for `code`, `key`, `message`, `details`, `requestId`, and `feature`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To check current API usage and limits.
- Guides: *Getting started*, *Domains and groups*, *Redirect rules*, *Redirect rules — operations*, *Link map entries*.
