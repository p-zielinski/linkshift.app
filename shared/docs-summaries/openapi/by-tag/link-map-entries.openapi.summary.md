---
llmSlice: shared/docs/openapi/by-tag/link-map-entries.openapi.json
source: shared/docs/openapi/by-tag/link-map-entries.openapi.json
generatedAt: 2026-05-28T15:47:05.978Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Map Entries
---

## Purpose
This OpenAPI tag covers the entry-level CRUD and bulk import operations for link maps accessible via API keys.

## Endpoints
- **GET `/api/v1/link-map-entries`** (`listLinkMapEntries`)
  - Lists entries of one link map using cursor pagination and optional search. Notable parameters include `linkMapId`, `limit`, `search`, and `startAfterId`.

- **POST `/api/v1/link-map-entries`** (`createLinkMapEntry`)
  - Creates one key-to-destination mapping in a link map. Request body fields include `linkMapId`, `key`, and `destination`. Response includes `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, and `deletedAt`.

- **DELETE `/api/v1/link-map-entries`** (`deleteManyLinkMapEntries`)
  - Bulk-deletes selected entries in a single request. Request body fields include `linkMapId` and `entryIds`. Response includes `deletedCount`.

- **POST `/api/v1/link-map-entries/import`** (`importLinkMapEntries`)
  - Bulk upserts entries for a link map and returns import totals plus row-level failures. Request body fields include `linkMapId` and `entries`. Response includes `total`, `created`, `updated`, `failed`, and `failures`.

- **GET `/api/v1/link-map-entries/{id}`** (`getLinkMapEntry`)
  - Returns one link-map entry by ID. Response includes `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, and `deletedAt`.

- **PUT `/api/v1/link-map-entries/{id}`** (`updateLinkMapEntry`)
  - Updates key or destination for a link-map entry. Request body fields include `key` and `destination`. Response includes `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, and `deletedAt`.

- **DELETE `/api/v1/link-map-entries/{id}`** (`deleteLinkMapEntry`)
  - Soft-deletes one link-map entry by ID.

## Auth, billing, and rate limits
- Authentication is preferred via `X-API-Key: <your_key>` or alternatively via `Authorization: ApiKey <your_key>`.
- API keys are organization-scoped, and API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.
- Management API requests are rate-limited per API key according to the organization's plan. Use `GET /api/v1/organization/usage` to check current limits. If limits are exceeded, a 429 status code is returned; clients should implement backoff strategies.

## Data shapes
- **LinkMapEntryQueryResult**: Paginated link-map-entry query response.
- **CreateLinkMapEntryRequest**: Payload for creating one link-map entry with fields `linkMapId`, `key`, and `destination`.
- **LinkMapEntry**: Represents one key-to-destination mapping inside a link map with fields `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, and `deletedAt`.
- **DeleteLinkMapEntriesByIdRequest**: Payload for bulk deletion of link-map entries with fields `linkMapId` and `entryIds`.
- **ImportLinkMapEntriesRequest**: Payload for bulk import/upsert of link-map entries with fields `linkMapId` and `entries`.
- **ImportLinkMapEntriesResponse**: Import summary including totals and row-level failures with fields `total`, `created`, `updated`, `failed`, and `failures`.
- **UpdateLinkMapEntryRequest**: Payload for updating one link-map entry with fields `key` and `destination`.
- **QueryResultMeta**: Metadata envelope shared by cursor-paginated query responses with fields `dataType`, `hasMore`, and `moreStartingAfterId`.
- **ErrorResponse**: Standardized error payload returned by API endpoints with fields `code`, `key`, `message`, `details`, `requestId`, and `feature`.

## Related endpoints outside this tag
- **GET `/api/v1/api-keys`** (API Key Management) - Excluded from this tag but relevant for API key management.
