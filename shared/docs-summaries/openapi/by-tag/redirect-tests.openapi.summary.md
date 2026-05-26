---
llmSlice: shared/docs/openapi/by-tag/redirect-tests.openapi.json
source: shared/docs/openapi/by-tag/redirect-tests.openapi.json
generatedAt: 2026-05-26T21:08:34.931Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Tests
---

## Purpose
This OpenAPI tag covers the LinkShift endpoints related to managing stored redirect test fixtures for regression and CI validation, accessible via API keys.

## Endpoints
- **`GET /api/v1/redirect-tests`** (`listRedirectTests`)
  - Lists stored redirect test cases for a domain group with cursor pagination.
  - **Parameters**: `domainGroupId`, `limit`, `search`, `startAfterId`.

- **`POST /api/v1/redirect-tests`** (`createRedirectTest`)
  - Stores a redirect expectation fixture used for simulation-based regression checks.
  - **Request Body Fields**: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`GET /api/v1/redirect-tests/{id}`** (`getRedirectTest`)
  - Returns one stored redirect test fixture by ID.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/redirect-tests/{id}`** (`updateRedirectTest`)
  - Updates mutable fields of a stored redirect test fixture.
  - **Request Body Fields**: `pathWithQuery`, `requestData`, `expectedResult`.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/redirect-tests/{id}`** (`deleteRedirectTest`)
  - Soft-deletes a redirect test fixture.

## Auth, billing, and rate limits
- **Authentication**: Use `X-API-Key: <your_key>` or `Authorization: ApiKey <your_key>`.
- **Billing Behavior**: API keys are organization-scoped. API key management endpoints (`/api/v1/api-keys`) require dashboard user authentication and are excluded from this API.
- **Rate Limiting**: Requests are rate-limited per API key based on the organization's plan. Use `GET /api/v1/organization/usage` to check current limits. If limits are exceeded, a 429 status code is returned; implement backoff strategies and avoid hard-coding thresholds.

## Data shapes
- **RedirectTestQueryResult**: Paginated redirect-test query response.
- **CreateRedirectTestRequest**: Payload for creating a redirect test fixture with fields: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
- **RedirectTest**: Represents a stored redirect test fixture with fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateRedirectTestRequest**: Payload for updating a redirect test fixture with fields: `pathWithQuery`, `requestData`, `expectedResult`.
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses with fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standardized error payload with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage** (not part of Redirect Tests) for checking rate limits.
