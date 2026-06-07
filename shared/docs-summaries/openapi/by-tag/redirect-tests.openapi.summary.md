---
llmSlice: shared/docs/openapi/by-tag/redirect-tests.openapi.json
source: shared/docs/openapi/by-tag/redirect-tests.openapi.json
generatedAt: 2026-06-07T10:02:49.930Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Tests
---

## Purpose
This OpenAPI tag covers the management of redirect test configurations for API-key clients, allowing automation of redirect tests similar to actions performed in the LinkShift dashboard.

## Endpoints
- **`GET /api/v1/redirect-tests`** (`listRedirectTests`)
  - Lists stored CI/regression fixtures for a specified `domainGroupId`. The default `limit` is 100, with a maximum of 100. Pagination can be managed using `startAfterId`.

- **`POST /api/v1/redirect-tests`** (`createRedirectTest`)
  - Creates a redirect test fixture by persisting an expected outcome (`expectedResult`) for a specified `pathWithQuery` under a `domainGroupId`. This does not execute the test; it is used in conjunction with `POST redirect-rules/simulate` for CI. Returns a 404 error if `domainGroupId` is invalid.
  - **Request Body Fields**: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`GET /api/v1/redirect-tests/{id}`** (`getRedirectTest`)
  - Retrieves a redirect test fixture by its ID, including `pathWithQuery`, `requestData`, and `expectedResult`. Returns a 404 error if the test is deleted or not within the organization scope.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/redirect-tests/{id}`** (`updateRedirectTest`)
  - Updates an existing redirect test fixture, allowing changes to the path, request metadata, or expected outcome. Returns a 400 error for invalid requests and a 404 error if the test ID is out of scope.
  - **Request Body Fields**: `pathWithQuery`, `requestData`, `expectedResult`.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/redirect-tests/{id}`** (`deleteRedirectTest`)
  - Soft deletes a redirect test fixture from the catalog, useful for retiring CI cases. Simulated history is not stored per test.

## Auth, billing, and rate limits
- **Authentication**: Each request must include the API key in the header as `X-API-Key: <your_key>` or alternatively as `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key is missing, revoked, or incorrect for the organization.
  - `402`: API access is not included in the current subscription plan.
  - `429`: Rate limit exceeded for the API key; clients should implement backoff strategies.
  - `400`: Request body or query validation failed; check `details` and `requestId` in the response.
  - `404`: Resource ID does not exist or is not within the organization scope.

## Data shapes
- **RedirectTestQueryResult**: Response schema for paginated redirect test queries.
- **CreateRedirectTestRequest**: Request payload for creating a redirect test fixture, containing fields: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
- **RedirectTest**: Schema for a CI fixture that includes fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateRedirectTestRequest**: Request payload for updating a redirect test fixture, containing fields: `pathWithQuery`, `requestData`, `expectedResult`.
- **QueryResultMeta**: Metadata for cursor-paginated query responses, including fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standard error response schema with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`POST /api/v1/redirect-rules/simulate`**: Used to evaluate redirect test fixtures in CI pipelines against live rule configurations.
