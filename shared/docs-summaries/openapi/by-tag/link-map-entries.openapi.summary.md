---
llmSlice: shared/docs/openapi/by-tag/link-map-entries.openapi.json
source: shared/docs/openapi/by-tag/link-map-entries.openapi.json
generatedAt: 2026-05-30T06:57:45.237Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Map Entries
---

## Purpose
This OpenAPI tag covers the management of link map entries for API-key clients, allowing for the automation of link mapping configurations.

## Endpoints
- **`GET /api/v1/link-map-entries`** (`listLinkMapEntries`) 
  - Lists link map entries for a specified `linkMapId`, supporting pagination with a default limit of 20 and a maximum of 100 entries. Optional `search` parameter allows for scanning keys and destinations (max 1024 chars).
  
- **`POST /api/v1/link-map-entries`** (`createLinkMapEntry`) 
  - Creates a single link map entry, mapping a key to a destination. Keys are path/query fragments, not full URLs. Returns a 400 error for invalid characters or URLs, and a 404 error for unknown `linkMapId`.

- **`DELETE /api/v1/link-map-entries`** (`deleteManyLinkMapEntries`) 
  - Soft-deletes up to 1,000 link map entries in one call, useful for rolling back a bad import. Requires `linkMapId` and a list of `entryIds`. Returns a 404 error for invalid map IDs.

- **`POST /api/v1/link-map-entries/import`** (`importLinkMapEntries`) 
  - Imports up to 500 link map entries in a single request. Returns a summary of the import process, including counts of imported and failed entries. Duplicate keys will appear in the `errors[]` array.

- **`GET /api/v1/link-map-entries/{id}`** (`getLinkMapEntry`) 
  - Retrieves a single link map entry by its ID. Returns a 404 error if the entry is soft-deleted or not within the organization scope.

- **`PUT /api/v1/link-map-entries/{id}`** (`updateLinkMapEntry`) 
  - Updates an existing link map entry by changing its `key` and/or `destination`. Returns a 400 error for validation failures and a 404 error for out-of-scope IDs.

- **`DELETE /api/v1/link-map-entries/{id}`** (`deleteLinkMapEntry`) 
  - Soft-deletes a single link map entry by its ID. For bulk deletions, use the bulk-delete endpoint instead.

## Auth, billing, and rate limits
- Authentication is required on every request using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing, revoked, or incorrect API key.
- A `402` error indicates that API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been exceeded.
- For validation errors, a `400` error will be returned, with details provided in the response body.
- A `404` error indicates that the requested ID does not exist or is not within the organization scope.

## Data shapes
- **LinkMapEntryListResult**: 
  - Fields: `data`, `hasMore`, `moreStartingAfterId`
  
- **CreateLinkMapEntryRequest**: 
  - Fields: `linkMapId`, `key`, `destination`
  
- **LinkMapEntry**: 
  - Fields: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`
  
- **DeleteLinkMapEntriesByIdRequest**: 
  - Fields: `linkMapId`, `entryIds`
  
- **ImportLinkMapEntriesRequest**: 
  - Fields: `linkMapId`, `entries`
  
- **ImportLinkMapEntriesResponse**: 
  - Fields: `total`, `importedCount`, `failedCount`, `importedEntryIds`, `errors`
  
- **UpdateLinkMapEntryRequest**: 
  - Fields: `key`, `destination`
  
- **ErrorResponse**: 
  - Fields: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Related to monitoring API usage and rate limits.
