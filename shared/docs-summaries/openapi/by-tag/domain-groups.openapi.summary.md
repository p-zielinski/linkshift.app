---
llmSlice: shared/docs/openapi/by-tag/domain-groups.openapi.json
source: shared/docs/openapi/by-tag/domain-groups.openapi.json
generatedAt: 2026-05-26T21:06:19.036Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domain Groups
---

## Purpose
This OpenAPI tag covers the management of domain groups, including operations for creating, updating, retrieving, and deleting domain groups in LinkShift.

## Endpoints
- **`GET /api/v1/domain-groups`** (`listDomainGroups`)
  - Returns all active domain groups owned by the authenticated organization.
  
- **`POST /api/v1/domain-groups`** (`createDomainGroup`)
  - Creates a domain group and optionally configures robots policy defaults.
  - **Request Body Fields**: `name`, `robotsPolicy`, `customRobotsContent`
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`GET /api/v1/domain-groups/{id}`** (`getDomainGroup`)
  - Returns one domain group by ID when it belongs to the authenticated organization.
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`PUT /api/v1/domain-groups/{id}`** (`updateDomainGroup`)
  - Updates mutable domain-group fields such as name and robots policy options.
  - **Request Body Fields**: `name`, `robotsPolicy`, `customRobotsContent`
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`DELETE /api/v1/domain-groups/{id}`** (`deleteDomainGroup`)
  - Marks a domain group as deleted without physically removing historical records.

## Auth, billing, and rate limits
- **Authentication**: 
  - Preferred: `X-API-Key: <your_key>`
  - Alternative: `Authorization: ApiKey <your_key>`
  
- **Billing Behavior**: 
  - API keys are organization-scoped.
  - API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.
  
- **Rate Limiting**: 
  - Management API requests are rate-limited per API key according to the organization's plan.
  - Use `GET /api/v1/organization/usage` for current limits.
  - When limits are exceeded, the API returns a 429 status code; implement backoff strategies.

## Data shapes
- **DomainGroupQueryResult**: Paginated domain-group query response.
- **CreateDomainGroupRequest**: Payload for creating a domain group.
  - **Fields**: `name`, `robotsPolicy`, `customRobotsContent`
  
- **DomainGroup**: Domain-group entity used to scope domains, rules, tests, and link maps.
  - **Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`
  
- **UpdateDomainGroupRequest**: Payload for updating a domain group.
  - **Fields**: `name`, `robotsPolicy`, `customRobotsContent`
  
- **QueryResultMeta**: Metadata envelope shared by cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
  
- **ErrorResponse**: Standardized error payload returned by API endpoints.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`
  
- **RobotsPolicy**: Controls robots.txt behavior for all domains in a domain group. CUSTOM requires `customRobotsContent`.

## Related endpoints outside this tag
- **`GET /api/v1/organization/usage`** (not explicitly part of Domain Groups but related to rate limits)
