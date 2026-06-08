---
llmSlice: shared/docs/openapi/by-tag/link-map-entries.openapi.json
source: shared/docs/openapi/by-tag/link-map-entries.openapi.json
generatedAt: 2026-06-08T20:05:25.211Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Map Entries
---

## Purpose
This OpenAPI tag covers the management of link map entries for API-key clients, allowing for the automation of link mapping configurations.

## Endpoints
- **`GET /api/v1/link-map-entries`** (`listLinkMapEntries`)
  - Lists link map entries for a specified `linkMapId`. Supports pagination with a default `limit` of 20 and a maximum of 100. Optional `search` parameter can be used to filter keys and destinations (max 1024 chars).
  - **Response fields**: `data`, `hasMore`, `moreStartingAfterId`.

- **`POST /api/v1/link-map-entries`** (`createLinkMapEntry`)
  - Creates a single link map entry by adding a key-to-destination mapping. Keys are path/query fragments, not full URLs. Returns a 400 error for invalid key characters or destination URLs, and a 404 error for unknown `linkMapId`.
  - **Request body fields**: `linkMapId`, `key`, `destination`.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-map-entries`** (`deleteManyLinkMapEntries`)
  - Soft-deletes up to 1,000 link map entries in one call, useful for rolling back a bad import. Requires `linkMapId` and `entryIds` from previous responses.
  - **Request body fields**: `linkMapId`, `entryIds`.
  - **Response fields**: `deletedCount`.

- **`POST /api/v1/link-map-entries/import`** (`importLinkMapEntries`)
  - Imports up to 500 link map entries in a single request (create-only). Returns HTTP 200 even if some rows fail; check `importedCount`, `failedCount`, and `errors[]` for details.
  - **Request body fields**: `linkMapId`, `entries`.
  - **Response fields**: `total`, `importedCount`, `failedCount`, `importedEntryIds`, `errors`.

- **`GET /api/v1/link-map-entries/{id}`** (`getLinkMapEntry`)
  - Retrieves a single link map entry by its ID. Returns a 404 error if the entry is soft-deleted or not in the organization.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/link-map-entries/{id}`** (`updateLinkMapEntry`)
  - Updates an existing link map entry by changing its `key` and/or `destination`. Requires at least one field to be sent. Returns a 400 error for validation failures and a 404 error for out-of-scope IDs.
  - **Request body fields**: `key`, `destination`.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-map-entries/{id}`** (`deleteLinkMapEntry`)
  - Soft-deletes a single link map entry by its ID. For bulk deletions, use the bulk-delete endpoint instead.

## Auth, billing, and rate limits
- **Authentication**: Use `X-API-Key: <your_key>` for every request. Alternatively, `Authorization: ApiKey <your_key>` is supported.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access not included in the current plan.
  - `429`: Rate limit exceeded for the API key; check usage via `GET /api/v1/organization/usage`.
  - `400`: Request validation failed; inspect `details` and `requestId` in the response.
  - `404`: Resource not found or not in the organization scope.
- **Rate Limits**: Specific per-key limits apply based on the subscription plan.

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
- **`GET /api/v1/organization/usage`**: Check API key usage.
- Guides: *Getting started*, *Domains and groups*, *Redirect rules*, *Redirect rules — operations*, *Link map entries*.
