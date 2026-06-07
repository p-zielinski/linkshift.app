---
llmSlice: shared/docs/openapi/by-tag/redirect-rules.openapi.json
source: shared/docs/openapi/by-tag/redirect-rules.openapi.json
generatedAt: 2026-06-07T10:02:39.986Z
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
  - Creates a new redirect rule for live matching within the specified domain group. The request is not idempotent; duplicate sources may be rejected. The `linkMapId` can only be set if `destination` is null or empty. Returns a 400 error for validation failures. Response includes fields such as `id`, `source`, `destination`, `statusCode`, and `createdAt`.

- **`GET /api/v1/redirect-rules/analytics`** (`getRedirectRuleAnalytics`)
  - Retrieves aggregated hit counts for redirect rules over a specified time range. Supports preset (`day`, `week`, `month`) and custom date ranges (max 31 days). Optional `domainGroupId` narrows results. Returns a 200 response with analytics data.

- **`POST /api/v1/redirect-rules/simulate`** (`simulateRedirectRules`)
  - Simulates matching of up to 100 request samples against current redirect rules without issuing actual redirects. Returns results for each input request sample. Requires `checkDestinationBlacklist` to surface potential blocking behaviors. Returns a 400 error for unknown `domainGroupId`.

- **`GET /api/v1/redirect-rules/{id}`** (`getRedirectRule`)
  - Fetches a redirect rule by its ID. Returns a 404 error if the rule is soft-deleted or not within the organization scope. Response includes full rule details such as `source`, `destination`, and `priority`.

- **`PUT /api/v1/redirect-rules/{id}`** (`updateRedirectRule`)
  - Updates mutable fields of an existing redirect rule. Changes take effect on the next request. Returns a 400 error for invalid payloads and a 404 error if the rule ID is out of scope.

- **`DELETE /api/v1/redirect-rules/{id}`** (`deleteRedirectRule`)
  - Soft deletes a redirect rule, removing it from live matching. The operation is idempotent; repeated deletes on the same ID will return a 404 once the rule is deleted.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing, revoked, or incorrect API key.
- A `402` error occurs if API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been exceeded; clients should implement backoff strategies.
- A `400` error indicates validation failures in request bodies or query parameters, while a `404` error signifies that the requested ID does not exist or is not within the organization scope.

## Data shapes
- **RedirectRuleQueryResult**: Paginated response for redirect rule queries.
- **CreateRedirectRuleRequest**: Payload for creating a redirect rule, including fields like `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `priority`, and `domainGroupId`.
- **RedirectRule**: Represents a live redirect matcher with fields such as `id`, `source`, `destination`, `statusCode`, `matchMethod`, `queryMatch`, `pathMatch`, `linkMapId`, `isBlocked`, `blockedAt`, `priority`, `domainGroupId`, `createdAt`, and `updatedAt`.
- **RedirectRuleAnalyticsResponse**: Contains aggregated analytics data.
- **SimulateRedirectsRequest**: Batch request payload for simulating redirects, including `checkDestinationBlacklist` and `entries`.
- **RedirectSimulationResponse**: Contains results of the simulation for each input request sample.
- **UpdateRedirectRuleRequest**: Payload for updating a redirect rule, similar to the creation request.
- **ErrorResponse**: Standard error envelope with fields for error handling.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To read current usage and monitor rate limits.
- **POST redirect-rules/simulate**: For dry-run matching without traffic impact.
- **Guides**: Refer to *Getting started*, *Domains and groups*, *Redirect rules*, *Redirect rules — operations*, and *Link map entries* for more information.
