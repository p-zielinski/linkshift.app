---
llmSlice: shared/docs/openapi/by-tag/redirect-tests.openapi.json
source: shared/docs/openapi/by-tag/redirect-tests.openapi.json
generatedAt: 2026-06-03T16:56:04.737Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Tests
---

## Purpose
This OpenAPI tag covers the management of redirect tests for API-key clients, allowing for the automation of redirect configurations and operational checks.

## Endpoints
- **`GET /api/v1/redirect-tests`** (`listRedirectTests`) 
  - Lists stored CI/regression fixtures for a specified `domainGroupId`. The default `limit` is 100 (maximum 100). Use `startAfterId` from `moreStartingAfterId` to paginate through results.
  - **Parameters**: `domainGroupId`, `limit`, `search`, `startAfterId`.

- **`POST /api/v1/redirect-tests`** (`createRedirectTest`) 
  - Creates a redirect test fixture that persists an expected outcome (`expectedResult`) for a `pathWithQuery` under a domain group. This does not run the test but allows for assertions in CI when simulating requests.
  - **Request Body Fields**: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`GET /api/v1/redirect-tests/{id}`** (`getRedirectTest`) 
  - Retrieves a single redirect test fixture by its ID, including `pathWithQuery`, `requestData`, and `expectedResult`. Returns a 404 error if the test is deleted or not within the organization scope.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/redirect-tests/{id}`** (`updateRedirectTest`) 
  - Updates an existing redirect test fixture's path, request metadata, or expected outcome. Returns a 400 error for invalid requests and a 404 error if the test ID is out of scope.
  - **Request Body Fields**: `pathWithQuery`, `requestData`, `expectedResult`.
  - **Response Fields**: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/redirect-tests/{id}`** (`deleteRedirectTest`) 
  - Soft deletes a redirect test fixture from the catalog, useful for retiring CI cases. Simulated history is not stored per test.

## Auth, billing, and rate limits
- **Authentication**: Include `X-API-Key: <your_key>` in every request. An alternative header `Authorization: ApiKey <your_key>` is also supported.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access not included in the current plan.
  - `429`: Rate limit exceeded for the key; implement backoff with jitter.
  - `400`: Request validation failed; check `details` and `requestId` in the response.
  - `404`: ID does not exist or is not within the organization scope.

## Data shapes
- **RedirectTestQueryResult**: Paginated response for redirect test queries.
- **CreateRedirectTestRequest**: Payload for creating a redirect test fixture, containing `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
- **RedirectTest**: Schema for a CI fixture that includes `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateRedirectTestRequest**: Payload for updating a redirect test fixture, including `pathWithQuery`, `requestData`, `expectedResult`.
- **QueryResultMeta**: Metadata for cursor-paginated query responses, including `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standard error envelope with fields `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`POST /api/v1/redirect-rules/simulate`**: Used to evaluate redirect tests in CI pipelines against live rule configurations.
