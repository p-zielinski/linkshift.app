---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-06-04T19:35:04.942Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Rules
---

## Purpose
This OpenAPI tag covers the management of redirect rules for API-key clients, allowing automation of redirect configurations without requiring dashboard session cookies.

## Endpoints
- **`GET /api/v1/redirect-rules`** (`listRedirectRules`)
  - Lists redirect rules for a specified `domainGroupId`, ordered by `priority`. Supports pagination with `limit` (default 20, max 100) and `startAfterId`. Optional `search` parameter filters results based on source or destination text. Returns a 400 status for invalid query parameters.

- **`POST /api/v1/redirect-rules`** (`createRedirectRule`)
  - Creates a new redirect rule for live matching within the specified domain group. Not idempotent; duplicate sources may be rejected. Requires fields such as `source`, `destination`, `statusCode`, and `domainGroupId`. Returns the created rule's details upon success, or a 400 error with `details` on validation failure.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit counts for redirect rules over a specified time range. Supports preset (`day`, `week`, `month`) and custom time windows. Optional `domainGroupId` narrows results. Returns a 200 response with analytics data.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates redirect rule matching for up to 100 request samples without issuing actual HTTP redirects. Requires `entries` built from `pathWithQuery` and `requestData`. Returns simulation results or a 400 error for invalid `domainGroupId`.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a redirect rule by its ID, returning full details including `source`, `destination`, and `priority`. Returns a 404 error if the rule is soft-deleted or not in the organization scope.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates an existing redirect rule's mutable fields. Changes take effect on the next request. Returns a 200 response with updated rule details or a 400/404 error for invalid input or out-of-scope IDs.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft deletes a redirect rule, removing it from live matching. Idempotent; repeated deletes on the same ID return a 404 once the rule is gone.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing, revoked, or incorrect API key.
- A `402` error occurs if API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been exceeded. Clients should implement backoff strategies and can check usage via `GET /api/v1/organization/usage`.
- A `400` error is returned for invalid request bodies or query parameters, while a `404` error indicates that the specified ID does not exist or is not within the organization scope.

## Data shapes
- **RedirectRuleQueryResult**: Response for paginated redirect rule queries.
- **CreateRedirectRuleRequest**: Payload for creating a redirect rule, including fields like `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, `domainGroupId`.
- **RedirectRule**: Represents a live redirect matcher with fields such as `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Contains aggregated traffic analytics data.
- **SimulateRedirectsRequest**: Batch request payload for simulating redirect rules, including `checkDestinationBlacklist` and `entries`.
- **RedirectSimulationResponse**: Contains results of the simulation for each input request sample.
- **UpdateRedirectRuleRequest**: Payload for updating a redirect rule, similar to the creation request.
- **QueryResultMeta**: Metadata for cursor-paginated query responses.
- **ErrorResponse**: Standard error response structure with fields for error code, key, message, details, requestId, and feature.
- **HttpMethod**: Represents the HTTP request method.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Check API usage for rate limiting.
- Guides: *Getting started*, *Domains and groups*, *Redirect rules*, *Redirect rules — operations*, *Link map entries*.
