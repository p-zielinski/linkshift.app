---
llmSlice: shared/docs/openapi/by-tag/link-maps.openapi.json
source: shared/docs/openapi/by-tag/link-maps.openapi.json
generatedAt: 2026-05-26T21:07:35.259Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Maps
---

## Purpose
This OpenAPI tag covers the LinkShift endpoints that can be accessed with organization API keys, specifically for managing key-value routing maps referenced by redirect rules.

## Endpoints
- **`GET /api/v1/link-maps`** (`listLinkMaps`) 
  - Lists link maps for a domain group, including matching behavior settings. Requires `domainGroupId` as a parameter.

- **`POST /api/v1/link-maps`** (`createLinkMap`) 
  - Creates a link map that can be referenced by redirect rules for key-based resolution. 
  - **Request Body Fields**: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`GET /api/v1/link-maps/{id}`** (`getLinkMap`) 
  - Returns one link map by ID. 
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/link-maps/{id}`** (`updateLinkMap`) 
  - Updates link-map behavior such as case sensitivity, query matching, or fallback destination. 
  - **Request Body Fields**: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-maps/{id}`** (`deleteLinkMap`) 
  - Soft-deletes a link map. Deletion may be blocked when the map is used by active rules.

## Auth, billing, and rate limits
- **Authentication**: 
  - Preferred: `X-API-Key: <your_key>`
  - Alternative: `Authorization: ApiKey <your_key>` (supported by backend, not modeled as a separate OpenAPI scheme).
  
- **Billing Behavior**: 
  - API keys are organization-scoped. 
  - API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.

- **Rate Limiting**: 
  - Management API requests are rate-limited per API key according to the organization's plan (not per organization aggregate).
  - Use `GET /api/v1/organization/usage` for current limits. When limits are exceeded, the API returns a 429 status code — implement backoff; do not hard-code thresholds in integrations.

## Data shapes
- **LinkMapQueryResult**: Paginated link-map query response.
- **CreateLinkMapRequest**: Payload for creating a link map. 
  - **Fields**: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
  
- **LinkMap**: Represents a link map used to resolve short keys to destinations. 
  - **Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `createdAt`, `updatedAt`, `deletedAt`.
  
- **UpdateLinkMapRequest**: Payload for updating a link map. 
  - **Fields**: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
  
- **QueryResultMeta**: Metadata envelope shared by cursor-paginated query responses. 
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`.
  
- **ErrorResponse**: Standardized error payload returned by API endpoints. 
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`GET /api/v1/organization/usage`** (not part of Link Maps tag but related to rate limits).
