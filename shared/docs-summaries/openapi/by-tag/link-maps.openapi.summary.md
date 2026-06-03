---
llmSlice: shared/docs/openapi/by-tag/link-maps.openapi.json
source: shared/docs/openapi/by-tag/link-maps.openapi.json
generatedAt: 2026-06-03T16:55:36.276Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Maps
---

## Purpose
This OpenAPI tag covers the management of link maps for redirect configuration in the LinkShift API, allowing API-key clients to automate tasks typically performed in the LinkShift dashboard.

## Endpoints
- **`GET /api/v1/link-maps`** (`listLinkMaps`)
  - Returns all link maps in a specified domain group as a JSON array. Each item includes `entriesCount` to identify empty maps before linking them to rules.
  - **Parameters**: `domainGroupId`

- **`POST /api/v1/link-maps`** (`createLinkMap`)
  - Creates an empty key→URL table under a specified `domainGroupId`. Users must add entries before linking the map to a redirect rule. Returns a 404 error if the domain group does not exist.
  - **Request Body Fields**: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/link-maps/{id}`** (`getLinkMap`)
  - Fetches the settings of a link map by its ID, including `caseSensitive`, `queryMatch`, and `fallbackDestination`, along with `entriesCount`. Returns a 404 error if the map is deleted or not within the organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/link-maps/{id}`** (`updateLinkMap`)
  - Updates the matching behavior or fallback URL of an existing link map. Does not modify entries; use separate endpoints for that. Returns a 400 error if `fallbackDestination` is not a valid URL.
  - **Request Body Fields**: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/link-maps/{id}`** (`deleteLinkMap`)
  - Soft-deletes a link map if it has zero entries and is not referenced by any active redirect rules. Returns a 400 error with `details` if entries remain or rules still point to the `linkMapId`, requiring deletion of entries or detachment of rules first.

## Auth, billing, and rate limits
- **Authentication**: Include `X-API-Key: <your_key>` in every request. An alternative header is `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key is missing, revoked, or incorrect organization.
  - `402`: API access is not included in the current plan.
  - `429`: Rate limit exceeded for the API key; implement backoff with jitter.
  - `400`: Request body or query validation failed; check `details` and `requestId` in the response.
  - `404`: Resource ID does not exist or is outside the organization scope.
- **Rate Limits**: Per-key limits apply based on the subscription plan; use `GET /api/v1/organization/usage` to check current usage.

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
- **GET /api/v1/organization/usage** (not part of Link Maps) - Check current API usage and limits.
