---
llmSlice: shared/docs/openapi/by-tag/link-maps.openapi.json
source: shared/docs/openapi/by-tag/link-maps.openapi.json
generatedAt: 2026-06-04T19:34:46.849Z
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
  - Creates an empty key→URL table under a specified `domainGroupId`. Notable request fields include `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, and `fallbackDestination`. Returns a 404 error if the domain group does not exist.

- **`GET /api/v1/link-maps/{id}`** (`getLinkMap`)
  - Fetches the settings of a link map by its ID, including `caseSensitive`, `queryMatch`, `fallbackDestination`, and `entriesCount`. Returns a 404 error if the map is deleted or not within the organization.

- **`PUT /api/v1/link-maps/{id}`** (`updateLinkMap`)
  - Updates the matching behavior or fallback URL for an existing link map. Notable request fields include `name`, `caseSensitive`, `queryMatch`, and `fallbackDestination`. Returns a 400 error if `fallbackDestination` is not a valid URL.

- **`DELETE /api/v1/link-maps/{id}`** (`deleteLinkMap`)
  - Soft-deletes a link map if it has zero entries and no active redirect rules referencing it. Returns a 400 error if entries remain or rules still point to the `linkMapId`.

## Auth, billing, and rate limits
- Authentication is required on every request using `X-API-Key: <your_key>` or `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing, revoked, or incorrect API key.
- A `402` error indicates that API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been reached.
- A `400` error indicates that the request body or query failed validation.
- A `404` error indicates that the specified ID does not exist or is not within the organization scope.

## Data shapes
- **LinkMap**
  - Fields: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`, `entriesCount`, `createdAt`, `updatedAt`, `deletedAt`.

- **CreateLinkMapRequest**
  - Fields: `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`.

- **UpdateLinkMapRequest**
  - Fields: `name`, `caseSensitive`, `queryMatch`, `fallbackDestination`.

- **ErrorResponse**
  - Fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage** — for checking current usage and rate limits.
