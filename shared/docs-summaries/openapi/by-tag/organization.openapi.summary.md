---
llmSlice: shared/docs/openapi/by-tag/organization.openapi.json
source: shared/docs/openapi/by-tag/organization.openapi.json
generatedAt: 2026-06-14T15:26:26.920Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Organization
---

## Purpose
This OpenAPI tag covers the Organization-scoped Management API for redirect configuration, link maps, and operational checks, allowing API-key clients to automate tasks typically performed in the LinkShift dashboard.

## Endpoints
- **`GET /api/v1/organization`** (`getOrganization`)
  - Retrieves the organization profile associated with the API key, including fields such as `id`, `name`, `createdAt`, `updatedAt`, and `deletedAt`. This endpoint serves as a connectivity check after key rotation or during deployment tests.

- **`GET /api/v1/organization/usage`** (`getOrganizationUsage`)
  - Returns active resource counts for the organization, including `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, and `linkMapEntries`. This information is useful for comparing against plan limits and should be polled before large imports or rule batches to avoid exceeding plan caps.

## Auth, billing, and rate limits
- **Authentication**: Include the API key in every request using the header `X-API-Key: <your_key>`. An alternative header is `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key is missing, revoked, or does not match the organization.
  - `402`: API access is not included in the current subscription plan.
  - `429`: Rate limit exceeded for the API key; implement backoff with jitter and check current usage via `GET /api/v1/organization/usage`.
  - `400`: Request validation failed; inspect `details` and `requestId` in the response.
  - `404`: Resource ID does not exist or is outside the organization scope.
- **Dashboard-only Operations**: API key CRUD, billing checkout, and some analytics views are not available through this API and require signed-in dashboard authentication.

## Data shapes
- **Organization**: Represents the tenant record for the API key. Key fields include:
  - `id`
  - `name`
  - `configuration` (read-only)
  - `createdAt`
  - `updatedAt`
  - `deletedAt`

- **OrganizationUsage**: Contains counts of active resources in the organization, excluding soft-deleted items. Key fields include:
  - `domainGroups`
  - `domains`
  - `subdomains`
  - `rules`
  - `tests`
  - `users`
  - `apiKeys`
  - `linkMaps`
  - `linkMapEntries`

- **ErrorResponse**: Standard error envelope for handling errors. Key fields include:
  - `code`
  - `key`
  - `message`
  - `details`
  - `requestId`
  - `feature`

## Related endpoints outside this tag
- **Dashboard Operations**: API key CRUD, billing checkout, and some analytics views (not specified in this source).
