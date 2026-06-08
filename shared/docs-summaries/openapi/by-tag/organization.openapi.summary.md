---
llmSlice: shared/docs/openapi/by-tag/organization.openapi.json
source: shared/docs/openapi/by-tag/organization.openapi.json
generatedAt: 2026-06-08T20:05:42.881Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Organization
---

## Purpose
This OpenAPI tag covers the Organization-scoped Management API for redirect configuration, link maps, and operational checks, allowing API-key clients to automate tasks typically performed in the LinkShift dashboard.

## Endpoints
- **`GET /api/v1/organization`** (`getOrganization`)
  - Retrieves the organization profile associated with the provided API key. Returns fields such as `id`, `name`, `configuration`, `createdAt`, `updatedAt`, and `deletedAt`. This call is useful for connectivity checks after key rotations or during deployment tests.

- **`GET /api/v1/organization/usage`** (`getOrganizationUsage`)
  - Returns active resource counts for the organization, including `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, and `linkMapEntries`. This information helps clients compare their resource usage against plan limits, especially before large imports or rule batches.

## Auth, billing, and rate limits
- Authentication is required for every request using the header `X-API-Key: <your_key>`. An alternative header is `Authorization: ApiKey <your_key>`.
- Error responses include:
  - `401` — Key is missing, revoked, or incorrect for the organization.
  - `402` — API access is not included in the current subscription plan.
  - `429` — Rate limit exceeded for the API key; clients should implement backoff strategies and can check usage via `GET /api/v1/organization/usage`.
  - `400` — Request validation failed; details can be found in the response body.
  - `404` — Requested ID does not exist or is not within the organization scope.
- Some operations, such as API key CRUD and billing checkout, are only available through the dashboard and require signed-in authentication.

## Data shapes
- **Organization**
  - Fields: `id`, `name`, `configuration`, `createdAt`, `updatedAt`, `deletedAt`
  
- **OrganizationUsage**
  - Fields: `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, `linkMapEntries`
  
- **ErrorResponse**
  - Fields: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **Dashboard-only** operations for API key CRUD, billing checkout, and some analytics views are not included in this spec and require dashboard authentication.
