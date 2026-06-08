---
llmSlice: shared/docs/openapi/by-tag/link-maps.openapi.json
source: shared/docs/openapi/by-tag/link-maps.openapi.json
generatedAt: 2026-06-08T20:05:35.660Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Maps
---

## Purpose
This OpenAPI tag covers the management of link maps for redirect configuration and operational checks in the LinkShift API.

## Endpoints
- **`GET /api/v1/link-maps`** (`listLinkMaps`)
  - Returns all link maps in a specified domain group as a JSON array. Each item includes `entriesCount` to identify empty maps.
  - **Parameters**: `domainGroupId`

- **`POST /api/v1/link-maps`** (`createLinkMap`)
  - Creates an empty key→URL table under a specified `domainGroupId`. Returns a 404 error if the domain group does not exist.
  - **Request Body Fields**: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/link-maps/{id}`** (`getLinkMap`)
  - Fetches the settings of a link map by its ID, including `caseSensitive`, `queryMatch`, and `fallbackDestination`. Returns a 404 error if the map is deleted or not in the organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/link-maps/{id}`** (`updateLinkMap`)
  - Updates the matching behavior or fallback URL for an existing link map. Does not modify entries. Returns a 400 error if `fallbackDestination` is not a valid URL.
  - **Request Body Fields**: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/link-maps/{id}`** (`deleteLinkMap`)
  - Soft-deletes a link map if it has zero entries and no active redirect rules referencing it. Returns a 400 error if entries remain or rules still point to the `linkMapId`.

## Auth, billing, and rate limits
- **Authentication**: Include `X-API-Key: <your_key>` in every request. Alternatively, use `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access not included in the current plan.
  - `429`: Per-key rate limit exceeded; back off with jitter.
  - `400`: Request validation failed; check `details` and `requestId` in the response.
  - `404`: Resource ID does not exist or is outside the organization scope.

## Data shapes
- **LinkMap**: Represents a named lookup table for redirect rules.
  - **Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`
  
- **CreateLinkMapRequest**: Payload for creating a link map.
  - **Fields**: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  
- **UpdateLinkMapRequest**: Payload for updating a link map.
  - **Fields**: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  
- **ErrorResponse**: Standard error envelope for API responses.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Check current API usage to manage rate limits.
