---
llmSlice: shared/docs/openapi/by-tag/organization.openapi.json
source: shared/docs/openapi/by-tag/organization.openapi.json
generatedAt: 2026-06-03T16:55:42.932Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Organization
---

## Purpose
This OpenAPI tag covers the Organization-scoped Management API for redirect configuration, link maps, and operational checks for API-key clients.

## Endpoints
- **`GET /api/v1/organization`** (`getOrganization`)
  - Retrieves the organization profile associated with the API key, including fields such as `id`, `name`, `createdAt`, `updatedAt`, and `deletedAt`. This call is useful for connectivity checks after key rotations or during deployment smoke tests.

- **`GET /api/v1/organization/usage`** (`getOrganizationUsage`)
  - Returns active resource counts for the organization, including `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, and `linkMapEntries`. This information helps compare current usage against plan limits, although it does not provide limit ceilings or billing state.

## Auth, billing, and rate limits
- **Authentication**: Include the API key in every request using the header `X-API-Key: <your_key>`. An alternative header is `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key is missing, revoked, or incorrect for the organization. Create or rotate a key in the dashboard.
  - `402`: API access is not available on the current plan; an upgrade is required.
  - `429`: Indicates a per-key rate limit for the plan. Clients should implement backoff strategies and can check current usage via `GET /api/v1/organization/usage`.
  - `400`: Indicates validation failure of the request body or query; details can be found in the JSON response.
  - `404`: Indicates that the requested ID does not exist or is outside the organization scope.
- **Dashboard-only**: Certain operations, such as API key CRUD and billing checkout, require signed-in dashboard authentication and are not included in this spec.

## Data shapes
- **Organization**: Represents the tenant record for the API key. Key fields include:
  - `id`
  - `name`
  - `configuration` (read-only in integrations)
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

- **ErrorResponse**: Standard error envelope with fields:
  - `code`
  - `key`
  - `message`
  - `details`
  - `requestId`
  - `feature`

## Related endpoints outside this tag
- **Dashboard-only**: API key CRUD, billing checkout, and some analytics views (not specified in this document).
