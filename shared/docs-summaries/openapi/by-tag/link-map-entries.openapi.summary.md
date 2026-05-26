---
llmSlice: shared/docs/openapi/by-tag/link-map-entries.openapi.json
source: shared/docs/openapi/by-tag/link-map-entries.openapi.json
generatedAt: 2026-05-26T21:07:08.649Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Map Entries
---

## Purpose
This OpenAPI tag covers the CRUD and bulk import operations for link map entries accessible via organization API keys.

## Endpoints
- **`GET /api/v1/link-map-entries`** (`listLinkMapEntries`)
  - Lists entries of one link map using cursor pagination and optional search parameters: `linkMapId`, `limit`, `search`, `startAfterId`.
  
- **`POST /api/v1/link-map-entries`** (`createLinkMapEntry`)
  - Creates one key-to-destination mapping in a link map. Requires request body fields: `linkMapId`, `key`, `destination`. Response includes fields: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-map-entries`** (`deleteManyLinkMapEntries`)
  - Bulk-deletes selected entries in a single request. Requires request body fields: `linkMapId`, `entryIds`. Response includes `deletedCount`.

- **`POST /api/v1/link-map-entries/import`** (`importLinkMapEntries`)
  - Bulk upserts entries for a link map and returns import totals plus row-level failures. Requires request body fields: `linkMapId`, `entries`. Response includes fields: `total`, `created`, `updated`, `failed`, `failures`.

- **`GET /api/v1/link-map-entries/{id}`** (`getLinkMapEntry`)
  - Returns one link-map entry by ID. Response includes fields: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/link-map-entries/{id}`** (`updateLinkMapEntry`)
  - Updates key or destination for a link-map entry. Requires request body fields: `key`, `destination`. Response includes fields: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-map-entries/{id}`** (`deleteLinkMapEntry`)
  - Soft-deletes one link-map entry by ID.

## Auth, billing, and rate limits
- Authentication is preferred via `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- API keys are organization-scoped, and API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.
- Management API requests are rate-limited per API key according to the organization's plan. Use `GET /api/v1/organization/usage` to check current limits. Exceeding limits results in a 429 response; implement backoff strategies.

## Data shapes
- **LinkMapEntryQueryResult**: Paginated response for link map entries.
- **CreateLinkMapEntryRequest**: Payload for creating a link map entry with fields: `linkMapId`, `key`, `destination`.
- **LinkMapEntry**: Represents a key-to-destination mapping with fields: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.
- **DeleteLinkMapEntriesByIdRequest**: Payload for bulk deletion with fields: `linkMapId`, `entryIds`.
- **ImportLinkMapEntriesRequest**: Payload for bulk import/upsert with fields: `linkMapId`, `entries`.
- **ImportLinkMapEntriesResponse**: Summary of import results with fields: `total`, `created`, `updated`, `failed`, `failures`.
- **UpdateLinkMapEntryRequest**: Payload for updating a link map entry with fields: `key`, `destination`.
- **QueryResultMeta**: Metadata for paginated query responses with fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standardized error payload with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`GET /api/v1/api-keys`** (API Key Management) - Excluded from this tag but relevant for API key management.
