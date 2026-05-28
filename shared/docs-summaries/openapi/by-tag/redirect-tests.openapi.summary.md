---
llmSlice: shared/docs/openapi/by-tag/redirect-tests.openapi.json
source: shared/docs/openapi/by-tag/redirect-tests.openapi.json
generatedAt: 2026-05-28T15:47:50.515Z
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
  - Notable request parameters: `domainGroupId`, `limit`, `search`, `startAfterId`.

- **`POST /api/v1/redirect-tests`** (`createRedirectTest`)
  - Stores a redirect expectation fixture used for simulation-based regression checks.
  - Request body fields: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
  - Response fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`GET /api/v1/redirect-tests/{id}`** (`getRedirectTest`)
  - Returns one stored redirect test fixture by ID.
  - Response fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/redirect-tests/{id}`** (`updateRedirectTest`)
  - Updates mutable fields of a stored redirect test fixture.
  - Request body fields: `pathWithQuery`, `requestData`, `expectedResult`.
  - Response fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/redirect-tests/{id}`** (`deleteRedirectTest`)
  - Soft-deletes a redirect test fixture.

## Auth, billing, and rate limits
- Authentication is done via `X-API-Key: <your_key>` or `Authorization: ApiKey <your_key>`.
- API keys are organization-scoped.
- API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.
- Management API requests are rate-limited per API key according to the organization's plan.
- Use `GET /api/v1/organization/usage` for current limits; exceeding limits results in a 429 status code.

## Data shapes
- **RedirectTestQueryResult**: Paginated redirect-test query response.
- **CreateRedirectTestRequest**: Payload for creating a redirect test fixture, with fields: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
- **RedirectTest**: Stored redirect test fixture used for regression checks, with fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateRedirectTestRequest**: Payload for updating a redirect test fixture, with fields: `pathWithQuery`, `requestData`, `expectedResult`.
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses, with fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standardized error payload returned by API endpoints, with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- `GET /api/v1/organization/usage` (for rate limits)
