---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-06-08T20:05:56.073Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Rules
---

## Purpose
This OpenAPI tag covers the management of redirect rules for API-key clients, allowing automation of redirect configurations and operational checks.

## Endpoints
- **`GET /api/v1/redirect-rules`** (`listRedirectRules`)
  - Lists redirect rules for a specified `domainGroupId`, ordered by `priority`. Supports pagination with `limit` (default 20, max 100) and `startAfterId`. Optional `search` parameter filters results based on source or destination text. Returns a 400 status for invalid query parameters.

- **`POST /api/v1/redirect-rules`** (`createRedirectRule`)
  - Creates a new redirect rule for live matching within a domain group. The request is not idempotent; duplicate sources may be rejected. Requires fields such as `source`, `destination`, `statusCode`, and `domainGroupId`. Returns the created rule's details, including `id`, `createdAt`, and `updatedAt`. A 400 status is returned for validation failures.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit counts for redirect rules over a specified time range. Supports preset (`day`, `week`, `month`) and custom date ranges (max 31 days). Optional `domainGroupId` narrows results. Returns a 200 status with analytics data.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates matching against up to 100 request samples without issuing actual redirects. Useful for testing new rules. Requires `entries` and can check destination blacklists. Returns simulation results in a 200 response.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a redirect rule by its ID, returning its full details. Returns a 404 status if the rule is soft-deleted or not within the organization scope.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates an existing redirect rule's mutable fields. Changes take effect on the next request. Returns a 200 status with updated rule details or a 400/404 status for invalid inputs or out-of-scope IDs.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft deletes a redirect rule, removing it from live matching. This operation is idempotent; repeating it on the same ID will return a 404 once the rule is deleted.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- A `401` status indicates a missing, revoked, or incorrect API key. 
- A `402` status indicates that API access is not available on the current subscription plan.
- A `429` status indicates that the per-key rate limit for the plan has been exceeded. Clients should implement backoff strategies and can check usage via `GET /api/v1/organization/usage`.
- A `400` status indicates validation errors in the request body or query parameters, while a `404` status indicates that the specified ID does not exist or is not within the organization scope.

## Data shapes
- **RedirectRuleQueryResult**: Paginated response for redirect rule queries.
- **CreateRedirectRuleRequest**: Payload for creating a redirect rule, including fields like `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, and `domainGroupId`.
- **RedirectRule**: Represents a live redirect matcher with fields such as `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, and `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Response containing aggregated traffic analytics data.
- **SimulateRedirectsRequest**: Payload for simulating redirect rules, including `checkDestinationBlacklist` and `entries`.
- **RedirectSimulationResponse**: Contains results of the simulation for each input request sample.
- **UpdateRedirectRuleRequest**: Payload for updating a redirect rule, similar to the creation request.
- **ErrorResponse**: Standard error response structure with fields for error details.

## Related endpoints outside this tag
- `GET /api/v1/organization/usage` (for checking API usage)
- Guides: *Getting started*, *Domains and groups*, *Redirect rules*, *Redirect rules — operations*, *Link map entries*.
