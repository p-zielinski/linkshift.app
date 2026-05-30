---
llmSlice: shared/docs/openapi/by-tag/link-maps.openapi.json
source: shared/docs/openapi/by-tag/link-maps.openapi.json
generatedAt: 2026-05-30T06:57:53.936Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Link Maps
---

## Purpose
This OpenAPI tag covers the management of link maps for redirect configuration in the LinkShift API, allowing API-key clients to automate tasks typically performed in the LinkShift dashboard.

## Endpoints
- **`GET /api/v1/link-maps`** (`listLinkMaps`)
  - Returns all link maps in a specified domain group as a JSON array. Each item includes `entriesCount` to identify empty maps before wiring rules. Requires `domainGroupId` as a parameter.

- **`POST /api/v1/link-maps`** (`createLinkMap`)
  - Creates an empty key→URL table under the specified `domainGroupId`. Returns a 404 error if the domain group does not exist. Request body fields include `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, and `fallbackDestination`. Response includes fields such as `id`, `name`, `entriesCount`, and timestamps.

- **`GET /api/v1/link-maps/{id}`** (`getLinkMap`)
  - Fetches the settings of a link map by its ID, including `caseSensitive`, `queryMatch`, and `fallbackDestination`. Returns a 404 error if the map is deleted or not within the organization. Response includes fields like `id`, `name`, and `entriesCount`.

- **`PUT /api/v1/link-maps/{id}`** (`updateLinkMap`)
  - Updates the matching behavior or fallback URL for an existing link map. Does not modify entries. Returns a 400 error if `fallbackDestination` is not a valid URL. Request body fields include `name`, `caseSensitive`, `queryMatch`, and `fallbackDestination`. Response includes updated fields.

- **`DELETE /api/v1/link-maps/{id}`** (`deleteLinkMap`)
  - Soft-deletes a link map if it has zero entries and no active redirect rules referencing it. Returns a 400 error if entries remain or rules still point to the `linkMapId`.

## Auth, billing, and rate limits
- Authentication is required for all requests using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- A `401` error indicates a missing, revoked, or incorrect API key. 
- A `402` error indicates that API access is not included in the current subscription plan.
- A `429` error indicates that the per-key rate limit for the plan has been exceeded. Clients should implement backoff strategies and can check usage via `GET /api/v1/organization/usage`.
- A `400` error indicates validation failures in the request body or query parameters, while a `404` error indicates that the specified ID does not exist or is not within the organization scope.

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
- **`GET /api/v1/organization/usage`** (not explicitly part of the Link Maps tag but relevant for rate limit checks).
