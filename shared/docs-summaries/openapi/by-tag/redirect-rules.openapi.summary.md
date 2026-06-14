---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-06-14T15:26:41.114Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Rules
---

## Purpose
This OpenAPI tag covers the management of redirect rules for API-key clients, allowing automation of redirect configurations and operational checks.

## Endpoints
- **`GET /api/v1/redirect-rules`** (`listRedirectRules`)
  - Lists redirect rules for a specified `domainGroupId`, ordered by `priority`. Supports pagination with `limit` (default 20, max 100) and `startAfterId`. Optional `search` parameter filters results based on source/destination text. Returns a 400 error for invalid query parameters.

- **`POST /api/v1/redirect-rules`** (`createRedirectRule`)
  - Creates a new redirect rule for live matching within a domain group. Not idempotent; duplicate sources may be rejected. Requires `domainGroupId` and can include fields like `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, and `priority`. Returns 200 with details of the created rule or 400 for validation errors.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit counts for redirect rules over a specified time window. Supports preset (`day`, `week`, `month`) and custom date ranges (max 31 days). Optional `domainGroupId` narrows results. Returns a 200 response with analytics data.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates matching of up to 100 request samples against current redirect rules without issuing actual redirects. Accepts `checkDestinationBlacklist` and an array of `entries`. Returns a 200 response with simulation results.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a redirect rule by its ID, returning full details including `source`, `destination`, and `priority`. Returns 404 if the rule is soft-deleted or not within the organization.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates an existing redirect rule's mutable fields. Requires the same validation as the creation process. Returns 200 on success or 400/404 for invalid payloads or out-of-scope IDs.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft deletes a redirect rule, removing it from live matching. Idempotent; repeated deletes on the same ID return 404 once the rule is gone.

## Auth, billing, and rate limits
- Authentication is required for all requests via `X-API-Key: <your_key>` or `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing, revoked, or incorrect key. 
- A `402` error signifies that API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been exceeded. Clients should implement backoff strategies and can check usage via `GET /api/v1/organization/usage`.
- A `400` error is returned for invalid request bodies or query parameters, while a `404` error indicates that the requested ID does not exist or is not within the organization scope.

## Data shapes
- **RedirectRuleQueryResult**: Paginated response for redirect rule queries.
- **CreateRedirectRuleRequest**: Payload for creating a redirect rule with fields such as `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, and `domainGroupId`.
- **RedirectRule**: Represents a live redirect matcher with fields including `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, and `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Contains aggregated analytics data.
- **SimulateRedirectsRequest**: Request payload for simulating redirects, including `checkDestinationBlacklist` and `entries`.
- **RedirectSimulationResponse**: Contains results of the simulation for each input request sample.
- **UpdateRedirectRuleRequest**: Payload for updating a redirect rule with similar fields as the creation request.
- **ErrorResponse**: Standard error response structure with fields for error handling.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To check API usage and limits.
- Guides: *Getting started*, *Domains and groups*, *Redirect rules*, *Redirect rules — operations*, *Link map entries*.
