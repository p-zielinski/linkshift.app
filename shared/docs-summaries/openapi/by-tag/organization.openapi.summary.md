---
llmSlice: shared/docs/openapi/by-tag/organization.openapi.json
source: shared/docs/openapi/by-tag/organization.openapi.json
generatedAt: 2026-06-30T19:41:19.998Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Organization
---

## Purpose
This OpenAPI tag covers the Organization-scoped Management API for redirect configuration, link maps, and operational checks, allowing API-key clients to automate tasks typically performed in the LinkShift dashboard.

## Endpoints
- **`GET /api/v1/organization`** (`getOrganization`)
  - Retrieves the organization profile associated with the API key, including fields such as `id`, `name`, `createdAt`, `updatedAt`, and `deletedAt`. This endpoint is useful for connectivity checks after key rotations or during deployment tests.

- **`GET /api/v1/organization/usage`** (`getOrganizationUsage`)
  - Returns active resource counts for the organization, including `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, and `linkMapEntries`. This information helps clients compare their resource usage against plan limits, especially before large imports or rule batches.

## Auth, billing, and rate limits
- **Authentication**: Include the API key in every request using the header `X-API-Key: <your_key>`. An alternative header is `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key is missing, revoked, or incorrect for the organization. Users should create or rotate a key in the dashboard.
  - `402`: API access is not included in the current subscription plan. Users need to upgrade their subscription.
  - `429`: Indicates a per-key rate limit for the current plan. Clients should implement backoff strategies and can check current usage via `GET /api/v1/organization/usage`.
  - `400`: Request validation failed; clients should inspect the `details` and `requestId` in the JSON response.
  - `404`: Indicates that the requested ID does not exist or is outside the organization scope.

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

- **ErrorResponse**: Standard error envelope for API responses. Important fields include:
  - `code`
  - `key`
  - `message`
  - `details`
  - `requestId`
  - `feature`

## Related endpoints outside this tag
- **Dashboard-only** API key CRUD, billing checkout, and some analytics views are not included in this spec and require signed-in dashboard authentication.
- Guides: *Getting started*, *Domains and groups*, *Redirect rules*, *Redirect rules — operations*, *Link map entries*.
