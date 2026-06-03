---
llmSlice: shared/docs/openapi/by-tag/link-map-entries.openapi.json
source: shared/docs/openapi/by-tag/link-map-entries.openapi.json
generatedAt: 2026-06-03T16:55:25.033Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Map Entries
---

## Purpose
This OpenAPI tag covers the management of link map entries for API-key clients, allowing for the automation of link mapping configurations.

## Endpoints
- **`GET /api/v1/link-map-entries`** (`listLinkMapEntries`) 
  - Lists link map entries for a specified `linkMapId`, supporting pagination with a default limit of 20 and a maximum of 100 entries. Optional `search` parameter allows for filtering keys and destinations (max 1024 chars).
  - **Response fields**: `data`, `hasMore`, `moreStartingAfterId`.

- **`POST /api/v1/link-map-entries`** (`createLinkMapEntry`) 
  - Creates a new link map entry by adding a key-to-destination mapping. Keys are path/query fragments, not full URLs. Returns errors for invalid characters or unknown `linkMapId`.
  - **Request fields**: `linkMapId`, `key`, `destination`.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-map-entries`** (`deleteManyLinkMapEntries`) 
  - Soft-deletes up to 1,000 link map entries in one call, useful for rolling back a bad import. Requires `linkMapId` and `entryIds`.
  - **Request fields**: `linkMapId`, `entryIds`.
  - **Response fields**: `deletedCount`.

- **`POST /api/v1/link-map-entries/import`** (`importLinkMapEntries`) 
  - Imports up to 500 link map entries in a single request, creating new entries only. Returns a summary of the import process, including counts of successful and failed imports.
  - **Request fields**: `linkMapId`, `entries`.
  - **Response fields**: `total`, `importedCount`, `failedCount`, `importedEntryIds`, `errors`.

- **`GET /api/v1/link-map-entries/{id}`** (`getLinkMapEntry`) 
  - Retrieves a specific link map entry by its ID, returning details about the key and destination. Returns a 404 error if the entry is soft-deleted or not in the organization.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/link-map-entries/{id}`** (`updateLinkMapEntry`) 
  - Updates an existing link map entry by changing its key and/or destination. Requires at least one field to be sent. Returns errors for validation failures or out-of-scope IDs.
  - **Request fields**: `key`, `destination`.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-map-entries/{id}`** (`deleteLinkMapEntry`) 
  - Soft-deletes a single link map entry identified by its ID.

## Auth, billing, and rate limits
- Authentication is required for all requests using `X-API-Key: <your_key>` or `Authorization: ApiKey <your_key>`.
- Rate limits apply per API key; clients should implement backoff strategies upon receiving a `429` status code.
- Errors include:
  - `401` — Missing, revoked, or incorrect API key.
  - `402` — API access not included in the current subscription plan.
  - `400` — Validation errors in request body or query.
  - `404` — Resource not found or not in the organization scope.

## Data shapes
- **LinkMapEntryListResult**: 
  - Fields: `data`, `hasMore`, `moreStartingAfterId`.
  
- **CreateLinkMapEntryRequest**: 
  - Fields: `linkMapId`, `key`, `destination`.
  
- **LinkMapEntry**: 
  - Fields: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.
  
- **DeleteLinkMapEntriesByIdRequest**: 
  - Fields: `linkMapId`, `entryIds`.
  
- **ImportLinkMapEntriesRequest**: 
  - Fields: `linkMapId`, `entries`.
  
- **ImportLinkMapEntriesResponse**: 
  - Fields: `total`, `importedCount`, `failedCount`, `importedEntryIds`, `errors`.
  
- **UpdateLinkMapEntryRequest**: 
  - Fields: `key`, `destination`.
  
- **ErrorResponse**: 
  - Fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`GET /api/v1/organization/usage`** — To check current API usage and limits.
