---
llmSlice: shared/docs/openapi/by-tag/organization.openapi.json
source: shared/docs/openapi/by-tag/organization.openapi.json
generatedAt: 2026-06-07T10:02:29.678Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Organization
---

## Purpose
This OpenAPI tag covers the Organization-scoped Management API for redirect configuration, link maps, and operational checks for API-key clients.

## Endpoints
- **`GET /api/v1/organization`** (`getOrganization`)
  - Retrieves the organization profile associated with the provided API key. The response includes fields such as `id`, `name`, `configuration`, `createdAt`, `updatedAt`, and `deletedAt`. This endpoint is useful for connectivity checks after key rotations or during deployment tests.

- **`GET /api/v1/organization/usage`** (`getOrganizationUsage`)
  - Returns active resource counts for the organization, including `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, and `linkMapEntries`. This information helps compare resource counts against plan limits in the dashboard and is recommended to be polled before large imports or rule batches.

## Auth, billing, and rate limits
- **Authentication**: Include your API key in every request using the header `X-API-Key: <your_key>`. An alternative header is `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization. Create or rotate a key in the dashboard.
  - `402`: API access is not available on the current plan. Upgrade your subscription to resolve.
  - `429`: Rate limit exceeded for your plan. Implement backoff with jitter and check current usage via `GET /api/v1/organization/usage`.
  - `400`: Request body or query validation failed; check `details` and `requestId` in the JSON body.
  - `404`: Resource ID does not exist or is outside your organization scope.
- **Dashboard-only**: API key CRUD, billing checkout, and some analytics views require signed-in dashboard authentication and are not included in this spec.

## Data shapes
- **Organization**: Represents a tenant record for your API key. Key fields include `id`, `name`, `configuration`, `createdAt`, `updatedAt`, and `deletedAt`.
- **OrganizationUsage**: Contains counts of active resources in your organization, excluding soft-deleted items. Key fields include `domainGroups`, `domains`, `subdomains`, `rules`, `tests`, `users`, `apiKeys`, `linkMaps`, and `linkMapEntries`.
- **ErrorResponse**: Standard error envelope with fields `code`, `key`, `message`, `details`, `requestId`, and `feature`.

## Related endpoints outside this tag
- **Dashboard-only**: API key CRUD, billing checkout, and some analytics views (not specified in this document).
