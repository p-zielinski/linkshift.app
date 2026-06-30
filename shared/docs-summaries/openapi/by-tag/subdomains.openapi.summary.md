---
llmSlice: shared/docs/openapi/by-tag/subdomains.openapi.json
source: shared/docs/openapi/by-tag/subdomains.openapi.json
generatedAt: 2026-06-30T19:39:32.629Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Subdomains
---

## Purpose
This OpenAPI tag covers operations related to managing LinkShift-hosted subdomains for API-key clients.

## Endpoints
- **`GET /api/v1/subdomains`** (`listSubdomains`)
  - Returns all active LinkShift-hosted subdomain labels in one response (no cursor pagination). Each row includes `domainGroupId` for filtering in automation scripts.

- **`POST /api/v1/subdomains`** (`createSubdomain`)
  - Reserves a lowercase label (max 30 chars) on LinkShift infrastructure under `domainGroupId`. Labels must be lowercase in the request body. Returns 404 for invalid groups, 409 if the label is already registered, reserved, or in a 7-day release cooldown.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  - **409 Response Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

- **`GET /api/v1/subdomains/{id}`** (`getSubdomain`)
  - Fetches one subdomain label and its `domainGroupId`. Returns 404 when the ID is unknown or outside the organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/subdomains/{id}`** (`updateSubdomain`)
  - Reassigns `domainGroupId` only. The subdomain label (`name`) is immutable after creation; sending `name` in the body returns 400. To use a new label, delete this subdomain and create a new one.
  - **Request Body Fields**: `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/subdomains/{id}`** (`deleteSubdomain`)
  - Soft-deletes the label. Published links on this subdomain stop working immediately. The label remains reserved globally for 7 days before it can be created again. Returns 404 when out of scope.

## Auth, billing, and rate limits
- **Authentication**: Send your key on every request using `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or wrong organization.
  - `402`: API access isn't on your current plan.
  - `429`: Per-key rate limit for your plan; back off with jitter.
  - `400`: Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.
- **Rate Limits**: Read current usage via `GET /api/v1/organization/usage`.

## Data shapes
- **LinkShiftSubdomainQueryResult**: Paginated query response for LinkShift subdomains.
- **CreateLinkShiftSubdomainRequest**: Payload for creating a LinkShift subdomain.
  - **Fields**: `name`, `domainGroupId`
- **LinkShiftSubdomain**: Represents a LinkShift-hosted subdomain label.
  - **Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`
- **UpdateLinkShiftSubdomainRequest**: Payload for updating a LinkShift subdomain.
  - **Fields**: `domainGroupId`
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To read current usage and check rate limits.
