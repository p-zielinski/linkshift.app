---
llmSlice: shared/docs/openapi/by-tag/link-maps.openapi.json
source: shared/docs/openapi/by-tag/link-maps.openapi.json
generatedAt: 2026-06-07T10:02:23.960Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Maps
---

## Purpose
This OpenAPI tag covers the management of link maps for API-key clients, allowing for the configuration of redirect rules and operational checks without requiring dashboard session cookies.

## Endpoints
- **`GET /api/v1/link-maps`** (`listLinkMaps`)
  - Returns all link maps in a specified domain group as a JSON array. Each item includes `entriesCount` to identify empty maps.
  - **Parameters**: `domainGroupId`

- **`POST /api/v1/link-maps`** (`createLinkMap`)
  - Creates an empty key→URL table under the specified `domainGroupId`. Must add entries before linking to a redirect rule. Returns a 404 error if the domain group does not exist.
  - **Request Body Fields**: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/link-maps/{id}`** (`getLinkMap`)
  - Fetches the settings of a link map by its ID, including `caseSensitive`, `queryMatch`, and `fallbackDestination`. Returns a 404 error if the map is deleted or not in the organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/link-maps/{id}`** (`updateLinkMap`)
  - Updates the matching behavior or fallback URL for an existing link map. Does not modify entries. Returns a 400 error if `fallbackDestination` is not a valid HTTP(S) URL.
  - **Request Body Fields**: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/link-maps/{id}`** (`deleteLinkMap`)
  - Soft-deletes the link map if it has zero entries and no active redirect rules referencing it. Returns a 400 error if entries remain or rules still point to `linkMapId`.

## Auth, billing, and rate limits
- **Authentication**: Include `X-API-Key: <your_key>` in every request. Alternatively, use `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization. Create or rotate a key in the dashboard.
  - `402`: API access not included in the current plan. Upgrade subscription to retry.
  - `429`: Per-key rate limit exceeded. Implement backoff with jitter; check usage via `GET /api/v1/organization/usage`.
  - `400`: Request body or query validation failed; inspect `details` and `requestId` in the JSON body.
  - `404`: ID does not exist or is not within the organization scope.
- **Dashboard-only**: API key CRUD, billing checkout, and some analytics views require signed-in dashboard authentication.

## Data shapes
- **LinkMap**: A named lookup table referenced by redirect rules via `linkMapId`.
  - **Fields**: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`
  
- **CreateLinkMapRequest**: Payload for creating a link map.
  - **Fields**: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  
- **UpdateLinkMapRequest**: Payload for updating a link map.
  - **Fields**: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`
  
- **ErrorResponse**: Standard error envelope for API responses.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To check current usage and avoid rate limits.
