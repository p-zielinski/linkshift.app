---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-06-03T16:55:54.555Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Rules
---

## Purpose
This OpenAPI tag covers the management of redirect rules for API-key clients, allowing for configuration and operational checks without requiring dashboard session cookies.

## Endpoints
- **`GET /api/v1/redirect-rules`** (`listRedirectRules`)
  - Lists redirect rules for a specified `domainGroupId`, ordered by `priority`. Supports pagination with `limit` (default 20, max 100) and `startAfterId`. Optional `search` filters can be applied to source/destination text. Returns a `400` status for invalid query parameters.

- **`POST /api/v1/redirect-rules`** (`createRedirectRule`)
  - Creates a new redirect rule that participates in live redirect matching for the domain group. This operation is not idempotent; duplicate sources may be rejected. The request body can include fields such as `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, and `domainGroupId`. A successful response returns the created rule's details.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit counts for redirect rules, with optional filtering by `domainGroupId`. Supports a preset time window (`day`, `week`, `month`) or a custom range defined by `start` and `end` parameters. The response includes aggregated data.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates the matching of up to 100 request samples against current redirect rules without issuing actual HTTP redirects. The request body can include `checkDestinationBlacklist` and an array of `entries`. The response contains the results of the simulation.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a redirect rule by its ID, returning its complete details. A `404` status is returned if the rule is soft-deleted or not within the organization scope.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates an existing redirect rule, allowing for changes to mutable fields. The request body includes similar fields as the creation request. Returns a `400` status for invalid payloads and a `404` if the rule ID is out of scope.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft deletes a redirect rule, removing it from live matching. This operation is idempotent; repeating the delete on the same ID will return a `404` once the rule is gone.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- A `401` status indicates a missing, revoked, or incorrect API key.
- A `402` status indicates that API access is not included in the current subscription plan.
- A `429` status indicates that the per-key rate limit for the plan has been exceeded; clients should implement backoff strategies.
- A `400` status indicates validation failures in request bodies or query parameters.
- A `404` status indicates that the requested ID does not exist or is outside the organization scope.

## Data shapes
- **RedirectRuleQueryResult**: Paginated response for redirect rule queries.
- **CreateRedirectRuleRequest**: Payload for creating a redirect rule, including fields such as `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, `domainGroupId`.
- **RedirectRule**: Represents a live redirect matcher with fields like `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Contains aggregated traffic analytics data.
- **SimulateRedirectsRequest**: Payload for simulating redirect rules, including `checkDestinationBlacklist` and `entries`.
- **RedirectSimulationResponse**: Contains results of the simulation for each input request sample.
- **UpdateRedirectRuleRequest**: Payload for updating a redirect rule, similar to the creation request.
- **QueryResultMeta**: Metadata for cursor-paginated query responses.
- **ErrorResponse**: Standard error response structure with fields for error handling.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To read current usage and monitor rate limits.
- **POST /api/v1/redirect-rules/simulate**: Related to testing redirect rules without live traffic.
