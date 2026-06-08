---
llmSlice: shared/docs/openapi/by-tag/redirect-tests.openapi.json
source: shared/docs/openapi/by-tag/redirect-tests.openapi.json
generatedAt: 2026-06-08T20:06:05.575Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Redirect Tests
---

## Purpose
This OpenAPI tag covers the management of redirect tests for API-key clients, allowing for the automation of redirect configurations and operational checks.

## Endpoints
- **`GET /api/v1/redirect-tests`** (`listRedirectTests`)
  - Lists stored CI/regression fixtures for a specified `domainGroupId`. The default `limit` is 100, with a maximum of 100. Pagination can be managed using `startAfterId`.

- **`POST /api/v1/redirect-tests`** (`createRedirectTest`)
  - Creates a redirect test fixture by persisting an expected outcome (`expectedResult`) for a specified `pathWithQuery` under a `domainGroupId`. Returns a 404 error if `domainGroupId` is invalid. The request body includes `domainGroupId`, `pathWithQuery`, `requestData`, and `expectedResult`. On success, it returns fields such as `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, and `deletedAt`.

- **`GET /api/v1/redirect-tests/{id}`** (`getRedirectTest`)
  - Fetches a redirect test fixture by its ID, including `pathWithQuery`, `requestData`, and `expectedResult`. Returns a 404 error if the test is deleted or outside the organization. The response includes fields like `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, and `deletedAt`.

- **`PUT /api/v1/redirect-tests/{id}`** (`updateRedirectTest`)
  - Updates an existing redirect test fixture, allowing changes to `pathWithQuery`, `requestData`, or `expectedResult`. Returns a 400 error for invalid requests and a 404 error if the test ID is out of scope. The request body includes `pathWithQuery`, `requestData`, and `expectedResult`. On success, it returns the same fields as the create operation.

- **`DELETE /api/v1/redirect-tests/{id}`** (`deleteRedirectTest`)
  - Soft deletes a redirect test fixture from the catalog. This is used when retiring CI cases, and the simulate history is not stored per test.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- Error responses include:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access not included in the current plan.
  - `429`: Per-key rate limit exceeded; clients should back off with jitter.
  - `400`: Request body or query validation failure.
  - `404`: ID does not exist or is outside the organization scope.

## Data shapes
- **RedirectTestQueryResult**: Paginated response for redirect test queries.
- **CreateRedirectTestRequest**: Payload for creating a redirect test fixture with fields: `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`.
- **RedirectTest**: Schema for storing CI fixture data, including fields: `id`, `organizationId`, `domainGroupId`, `pathWithQuery`, `requestData`, `expectedResult`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateRedirectTestRequest**: Payload for updating a redirect test fixture with fields: `pathWithQuery`, `requestData`, `expectedResult`.
- **QueryResultMeta**: Metadata for cursor-paginated query responses, including fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standard error envelope with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`POST /api/v1/redirect-rules/simulate`**: Used to evaluate redirect test fixtures in CI pipelines against live rule configurations.
