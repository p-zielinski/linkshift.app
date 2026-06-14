---
llmSlice: shared/docs/openapi/by-tag/link-maps.openapi.json
source: shared/docs/openapi/by-tag/link-maps.openapi.json
generatedAt: 2026-06-14T15:26:16.411Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Maps
---

## Purpose
This OpenAPI tag covers the management of link maps for redirect configuration in the LinkShift API, allowing API-key clients to automate tasks typically performed in the LinkShift dashboard.

## Endpoints
- **`GET /api/v1/link-maps`** (`listLinkMaps`) 
  - Returns all link maps in a specified domain group as a JSON array. Each item includes `entriesCount` to identify empty maps.

- **`POST /api/v1/link-maps`** (`createLinkMap`) 
  - Creates an empty key→URL table under a specified `domainGroupId`. Returns a 404 error if the domain group does not exist. Notable request fields include `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, and `fallbackDestination`. The response includes fields such as `id`, `name`, `entriesCount`, and timestamps.

- **`GET /api/v1/link-maps/{id}`** (`getLinkMap`) 
  - Fetches the settings of a link map by its ID, including `caseSensitive`, `queryMatch`, and `fallbackDestination`. Returns a 404 error if the map is deleted or not within the organization.

- **`PUT /api/v1/link-maps/{id}`** (`updateLinkMap`) 
  - Updates the matching behavior or fallback URL of an existing link map. Returns a 400 error if `fallbackDestination` is not a valid URL. Notable request fields include `name`, `caseSensitive`, `queryMatch`, and `fallbackDestination`.

- **`DELETE /api/v1/link-maps/{id}`** (`deleteLinkMap`) 
  - Soft-deletes a link map if it has zero entries and no active redirect rules referencing it. Returns a 400 error if entries remain or rules still point to the `linkMapId`.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing, revoked, or incorrect API key.
- A `402` error signifies that API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been exceeded.
- A `400` error occurs when the request body or query fails validation, and a `404` error indicates that the specified ID does not exist or is not in the organization scope.

## Data shapes
- **LinkMap**: Represents a named lookup table with fields: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`.
- **CreateLinkMapRequest**: Payload for creating a link map with fields: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
- **UpdateLinkMapRequest**: Payload for updating a link map with fields: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
- **ErrorResponse**: Standard error envelope with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To read current API usage and avoid hitting rate limits.
