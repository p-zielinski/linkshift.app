---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-06-30T19:41:34.348Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Rules
---

## Purpose
This OpenAPI tag covers the management of redirect rules for API-key clients, allowing automation of redirect configurations and operational checks.

## Endpoints
- **`GET /api/v1/redirect-rules`** (`listRedirectRules`)
  - Lists redirect rules for a specified `domainGroupId`, ordered by `priority`. Supports pagination with `limit` (default 20, max 100) and `startAfterId`. Optional `search` parameter filters results by source/destination text. Returns a 400 error for invalid query parameters.

- **`POST /api/v1/redirect-rules`** (`createRedirectRule`)
  - Creates a new redirect rule for live matching within a domain group. Not idempotent; duplicate sources may lead to unpredictable behavior. Requires fields such as `source`, `destination`, `statusCode`, and `domainGroupId`. Returns a 200 response with the created rule's details or a 400 error for validation failures.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit counts for redirect rules, allowing monitoring of traffic. Supports a preset time window or a custom range (max 31 days). Optional `domainGroupId` narrows results. Returns a 200 response with analytics data.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates redirect rule matching for up to 100 request samples without issuing actual redirects. Useful for CI testing. Requires `entries` in the request body and can check destination blacklists. Returns a 200 response with simulation results.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a redirect rule by its ID, returning full details. Returns a 404 error if the rule is soft-deleted or not in the organization.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates an existing redirect rule's mutable fields. Changes take effect on the next request. Returns a 200 response with updated rule details or a 400/404 error for invalid input or out-of-scope IDs.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft deletes a redirect rule, removing it from live matching. Idempotent; repeated deletes on the same ID return a 404 once the rule is gone.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing or invalid API key, while a `402` error signifies that API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been exceeded. Clients should implement back-off strategies and can check usage via `GET /api/v1/organization/usage`.
- A `400` error indicates validation failures in the request body or query parameters, while a `404` error indicates that the specified ID does not exist or is out of the organization scope.

## Data shapes
- **RedirectRuleQueryResult**: Paginated response for redirect rule queries.
- **CreateRedirectRuleRequest**: Payload for creating a redirect rule, including fields such as `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, and `domainGroupId`.
- **RedirectRule**: Represents a live redirect matcher with fields like `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, and `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Contains aggregated traffic analytics data.
- **SimulateRedirectsRequest**: Payload for simulating redirect rules, including `checkDestinationBlacklist` and `entries`.
- **RedirectSimulationResponse**: Contains results of the simulation for each request sample.
- **UpdateRedirectRuleRequest**: Payload for updating a redirect rule, similar to the creation request.
- **ErrorResponse**: Standard error response format with fields for error code, key, message, details, requestId, and feature.
- **HttpMethod**: Represents HTTP request methods.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Check API usage for the organization.
