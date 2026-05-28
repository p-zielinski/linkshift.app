---
llmSlice: shared/docs/openapi/by-tag/link-maps.openapi.json
source: shared/docs/openapi/by-tag/link-maps.openapi.json
generatedAt: 2026-05-28T15:47:16.960Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Maps
---

## Purpose
This OpenAPI tag covers the LinkShift endpoints that can be accessed with organization API keys for managing key-value routing maps referenced by redirect rules.

## Endpoints
- **GET `/api/v1/link-maps`** (`listLinkMaps`) 
  - Lists link maps for a domain group, including matching behavior settings. Requires `domainGroupId` as a parameter.

- **POST `/api/v1/link-maps`** (`createLinkMap`) 
  - Creates a link map that can be referenced by redirect rules for key-based resolution. Request body fields include `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, and `fallbackDestination`. Response includes fields: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `createdAt`, `updatedAt`, and `deletedAt`.

- **GET `/api/v1/link-maps/{id}`** (`getLinkMap`) 
  - Returns one link map by ID. Response includes fields: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `createdAt`, `updatedAt`, and `deletedAt`.

- **PUT `/api/v1/link-maps/{id}`** (`updateLinkMap`) 
  - Updates link-map behavior such as case sensitivity, query matching, or fallback destination. Request body fields include `name`, `caseSensitive`, `queryMatch`, and `fallbackDestination`. Response includes fields: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `createdAt`, `updatedAt`, and `deletedAt`.

- **DELETE `/api/v1/link-maps/{id}`** (`deleteLinkMap`) 
  - Soft-deletes a link map. Deletion may be blocked when the map is used by active rules.

## Auth, billing, and rate limits
- Authentication is preferred via `X-API-Key: <your_key>` or alternatively via `Authorization: ApiKey <your_key>`.
- API keys are organization-scoped.
- API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.
- Management API requests are rate-limited per API key according to the organization's plan. Use `GET /api/v1/organization/usage` to check current limits. If limits are exceeded, the API returns a 429 status code; implement backoff strategies and avoid hard-coding thresholds.

## Data shapes
- **LinkMapQueryResult**: Paginated link-map query response.
- **CreateLinkMapRequest**: Payload for creating a link map with fields: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
- **LinkMap**: Represents a link map with fields: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateLinkMapRequest**: Payload for updating a link map with fields: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses with fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standardized error payload returned by API endpoints with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **GET `/api/v1/api-keys`** (API Key Management) - Excluded from this tag but relevant for API key management.
