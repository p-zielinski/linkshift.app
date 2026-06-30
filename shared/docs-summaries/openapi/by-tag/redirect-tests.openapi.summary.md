---
llmSlice: shared/docs/openapi/by-tag/redirect-tests.openapi.json
source: shared/docs/openapi/by-tag/redirect-tests.openapi.json
generatedAt: 2026-06-30T19:41:50.316Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Tests
---

## Purpose
This OpenAPI tag covers the management of redirect tests for API-key clients, allowing for the creation, retrieval, updating, and deletion of redirect test fixtures.

## Endpoints
- **`GET /api/v1/redirect-tests`** (`listRedirectTests`)
  - Lists stored CI/regression fixtures for a specified `domainGroupId`. The default `limit` is 100 (maximum 100). Pagination can be handled using `startAfterId` from `moreStartingAfterId`.

- **`POST /api/v1/redirect-tests`** (`createRedirectTest`)
  - Creates a redirect test fixture by persisting an expected outcome (`expectedResult`) for a specified `pathWithQuery` under a `domainGroupId`. This operation does not execute the test; it is intended for CI use with `POST redirect-rules/simulate`. Returns a 404 error if the `domainGroupId` is invalid.
  - Request body fields: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
  - Response fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`GET /api/v1/redirect-tests/{id}`** (`getRedirectTest`)
  - Retrieves a specific redirect test fixture by its ID, including `pathWithQuery`, `requestData`, and `expectedResult`. Returns a 404 error if the test is deleted or not within the organization scope.
  - Response fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/redirect-tests/{id}`** (`updateRedirectTest`)
  - Updates an existing redirect test fixture, allowing changes to the `pathWithQuery`, `requestData`, or `expectedResult`. Returns a 400 error for invalid request bodies and a 404 error if the test ID is out of scope.
  - Request body fields: `pathWithQuery`, `requestData`, `expectedResult`.
  - Response fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/redirect-tests/{id}`** (`deleteRedirectTest`)
  - Soft deletes a redirect test fixture from the catalog. This operation is used when retiring CI cases; historical simulation data is not stored per test.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- Error codes:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access not included in the current subscription plan.
  - `429`: Rate limit exceeded for the API key; implement backoff with jitter.
  - `400`: Request body or query validation failure; check `details` and `requestId` in the response.
  - `404`: Resource ID does not exist or is not within the organization scope.

## Data shapes
- **RedirectTestQueryResult**: Paginated response for redirect test queries.
- **CreateRedirectTestRequest**: Payload for creating a redirect test fixture.
  - Fields: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
- **RedirectTest**: Represents a CI fixture storing input and expected output for simulations.
  - Fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateRedirectTestRequest**: Payload for updating a redirect test fixture.
  - Fields: `pathWithQuery`, `requestData`, `expectedResult`.
- **QueryResultMeta**: Metadata for cursor-paginated query responses.
  - Fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standard error response structure.
  - Fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`POST /api/v1/redirect-rules/simulate`**: Used to evaluate redirect test fixtures in CI pipelines.
