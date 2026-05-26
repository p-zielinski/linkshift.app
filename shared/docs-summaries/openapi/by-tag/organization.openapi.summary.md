---
llmSlice: shared/docs/openapi/by-tag/organization.openapi.json
source: shared/docs/openapi/by-tag/organization.openapi.json
generatedAt: 2026-05-26T21:07:46.548Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Organization
---

## Purpose
This OpenAPI tag covers the LinkShift endpoints that can be accessed with organization API keys.

## Endpoints
- **`GET /api/v1/organization`** (`getOrganization`)
  - Returns organization details for the authenticated organization context.
  - Notable response fields: `id`, `name`, `configuration`, `createdAt`, `updatedAt`, `deletedAt`.

- **`GET /api/v1/organization/usage`** (`getOrganizationUsage`)
  - Returns current resource usage for the authenticated organization.
  - Notable response fields: `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, `linkMapEntries`.

## Auth, billing, and rate limits
- Preferred authentication method: `X-API-Key: <your_key>`.
- Alternative authentication method: `Authorization: ApiKey <your_key>`.
- API keys are organization-scoped.
- API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.
- Management API requests are rate-limited per API key according to the organization's plan.
- Use `GET /api/v1/organization/usage` to check current limits.
- When rate limits are exceeded, the API returns a 429 status code; implement backoff strategies and avoid hard-coding thresholds in integrations.

## Data shapes
- **Organization**
  - Fields: `id`, `name`, `configuration`, `createdAt`, `updatedAt`, `deletedAt`.

- **OrganizationUsage**
  - Fields: `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, `linkMapEntries`.

- **ErrorResponse**
  - Fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`GET /api/v1/api-keys`** (not accessible with organization API keys, requires dashboard user auth).
