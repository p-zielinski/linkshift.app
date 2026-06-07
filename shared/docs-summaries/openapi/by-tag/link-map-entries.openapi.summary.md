---
llmSlice: shared/docs/openapi/by-tag/link-map-entries.openapi.json
source: shared/docs/openapi/by-tag/link-map-entries.openapi.json
generatedAt: 2026-06-07T10:02:13.962Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Map Entries
---

## Purpose
This OpenAPI tag covers the management of link map entries within the LinkShift API, allowing API-key clients to automate link mapping configurations.

## Endpoints
- **`GET /api/v1/link-map-entries`** (`listLinkMapEntries`)
  - Lists link map entries for a specified `linkMapId`. Supports pagination with a default limit of 20 and a maximum of 100 entries. Optional `search` parameter allows for scanning keys and destinations (max 1024 chars).
  - **Response fields**: `data`, `hasMore`, `moreStartingAfterId`.

- **`POST /api/v1/link-map-entries`** (`createLinkMapEntry`)
  - Creates a new link map entry by adding a key-to-destination mapping. Keys are path/query fragments, not full URLs. Returns a 400 error for invalid characters or URLs, and a 404 error if the `linkMapId` is unknown.
  - **Request body fields**: `linkMapId`, `key`, `destination`.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-map-entries`** (`deleteManyLinkMapEntries`)
  - Soft-deletes up to 1,000 link map entries in one call, useful for rolling back a bad import. Requires `linkMapId` and `entryIds` from previous responses. May return a lower `deletedCount` than requested if some IDs were already deleted.
  - **Request body fields**: `linkMapId`, `entryIds`.
  - **Response fields**: `deletedCount`.

- **`POST /api/v1/link-map-entries/import`** (`importLinkMapEntries`)
  - Imports up to 500 link map entries in a single request (create-only). Returns HTTP 200 even if some rows fail; check `importedCount`, `failedCount`, and `errors[]` for details. Rollback of partial imports can be done using the bulk delete endpoint.
  - **Request body fields**: `linkMapId`, `entries`.
  - **Response fields**: `total`, `importedCount`, `failedCount`, `importedEntryIds`, `errors`.

- **`GET /api/v1/link-map-entries/{id}`** (`getLinkMapEntry`)
  - Retrieves a single link map entry by its ID. Returns a 404 error if the entry is soft-deleted or not within the organization.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/link-map-entries/{id}`** (`updateLinkMapEntry`)
  - Updates an existing link map entry by changing its `key` and/or `destination`. Requires at least one field to be sent. Returns a 400 error for validation failures (e.g., duplicate keys) and a 404 error if the entry ID is out of scope.
  - **Request body fields**: `key`, `destination`.
  - **Response fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/link-map-entries/{id}`** (`deleteLinkMapEntry`)
  - Soft-deletes a single link map entry identified by its path `{id}`. For bulk deletions, use the bulk delete endpoint instead.

## Auth, billing, and rate limits
- **Authentication**: Include `X-API-Key: <your_key>` in every request. Alternatively, use `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access not included in the current plan.
  - `429`: Rate limit exceeded for the API key; back off with jitter.
  - `400`: Request body or query validation failed.
  - `404`: Resource ID does not exist or is out of organization scope.
- **Rate Limits**: Specific limits are not hard-coded; check usage via `GET /api/v1/organization/usage`.

## Data shapes
- **LinkMapEntryListResult**: Cursor-paginated list of link map entries.
  - **Fields**: `data`, `hasMore`, `moreStartingAfterId`.
  
- **CreateLinkMapEntryRequest**: Payload for creating a link map entry.
  - **Fields**: `linkMapId`, `key`, `destination`.

- **LinkMapEntry**: Represents a key-to-destination mapping.
  - **Fields**: `id`, `linkMapId`, `key`, `keyNormalized`, `destination`, `createdAt`, `updatedAt`, `deletedAt`.

- **DeleteLinkMapEntriesByIdRequest**: Identifies entries to soft-delete.
  - **Fields**: `linkMapId`, `entryIds`.

- **ImportLinkMapEntriesRequest**: Payload for bulk creation of link map entries.
  - **Fields**: `linkMapId`, `entries`.

- **ImportLinkMapEntriesResponse**: Summary of the import operation.
  - **Fields**: `total`, `importedCount`, `failedCount`, `importedEntryIds`, `errors`.

- **UpdateLinkMapEntryRequest**: Payload for updating a link map entry.
  - **Fields**: `key`, `destination`.

- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **`GET /api/v1/organization/usage`**: Check API usage for rate limits.
- Guides: *Getting started*, *Domains and groups*, *Redirect rules*, *Redirect rules — operations*, *Link map entries*.
