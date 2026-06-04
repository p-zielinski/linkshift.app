---
llmSlice: shared/docs/openapi/by-tag/organization.openapi.json
source: shared/docs/openapi/by-tag/organization.openapi.json
generatedAt: 2026-06-04T19:34:53.742Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Organization
---

## Purpose
This OpenAPI tag covers the Organization-scoped Management API for redirect configuration, link maps, and operational checks, allowing API-key clients to automate tasks typically performed in the LinkShift dashboard.

## Endpoints
- **`GET /api/v1/organization`** (`getOrganization`)
  - Retrieves the organization profile associated with the API key, including fields such as `id`, `name`, `createdAt`, `updatedAt`, and `deletedAt`. This endpoint serves as a connectivity check after key rotation or during deployment smoke tests.

- **`GET /api/v1/organization/usage`** (`getOrganizationUsage`)
  - Returns active resource counts for the organization, including `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, and `linkMapEntries`. This information is useful for comparing against plan limits and should be polled before large imports or rule batches to avoid exceeding plan caps.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- Error responses include:
  - `401` — Key is missing, revoked, or incorrect for the organization.
  - `402` — API access is not included in the current subscription plan.
  - `429` — Rate limit exceeded for the API key; clients should implement back-off strategies.
  - `400` — Request validation failed; details will be provided in the response.
  - `404` — Requested ID does not exist or is outside the organization scope.
- Dashboard-only operations such as API key CRUD and billing checkout are not accessible via this API.

## Data shapes
- **Organization**: Represents the tenant record for the API key with fields:
  - `id`
  - `name`
  - `configuration` (read-only)
  - `createdAt`
  - `updatedAt`
  - `deletedAt`

- **OrganizationUsage**: Contains counts of active resources in the organization, excluding soft-deleted items, with fields:
  - `domainGroups`
  - `domains`
  - `subdomains`
  - `rules`
  - `tests`
  - `users`
  - `apiKeys`
  - `linkMaps`
  - `linkMapEntries`

- **ErrorResponse**: Standard error envelope with fields:
  - `code`
  - `key`
  - `message`
  - `details`
  - `requestId`
  - `feature`

## Related endpoints outside this tag
- **Dashboard-only** operations for API key CRUD and billing checkout are not included in this spec and require signed-in dashboard authentication.
