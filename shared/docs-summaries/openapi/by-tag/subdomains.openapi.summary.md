---
llmSlice: shared/docs/openapi/by-tag/subdomains.openapi.json
source: shared/docs/openapi/by-tag/subdomains.openapi.json
generatedAt: 2026-06-27T00:00:00.000Z
model: manual
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Subdomains
---

## Purpose
This OpenAPI tag covers the management of LinkShift-hosted subdomains for API-key clients.

## Endpoints
- **`GET /api/v1/subdomains`** (`listSubdomains`)
  - Returns all active LinkShift-hosted subdomain labels in one response (no cursor pagination). Each row includes `domainGroupId` for filtering in automation scripts.

- **`POST /api/v1/subdomains`** (`createSubdomain`)
  - Reserves a lowercase label (max 30 chars) on LinkShift infrastructure under `domainGroupId`. Labels must already be lowercase in the request.
  - Returns `404` when the group is invalid; `409` when the label is already taken or in a 7-day release cooldown after deletion (`Subdomain name {label} was recently deleted and is in a 7-day release cooldown until {iso8601}`).
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/subdomains/{id}`** (`getSubdomain`)
  - Fetches one subdomain label and its `domainGroupId`. Returns 404 when unknown or outside your organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/subdomains/{id}`** (`updateSubdomain`)
  - Reassigns `domainGroupId` only. Label is immutable; sending `name` returns `400` (strict schema).
  - To use a new label, delete and create a new subdomain.
  - **Request Body Fields**: `domainGroupId` (required)
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/subdomains/{id}`** (`deleteSubdomain`)
  - Soft-deletes the label. Published links stop working immediately; label reserved globally for 7 days.
  - Returns `404` when out of scope.

## Auth, billing, and rate limits
- **Authentication**: Send your key on every request using `X-API-Key: <your_key>` (preferred) or `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or wrong organization.
  - `402`: API access isn't on your current plan.
  - `429`: Per-key rate limit for your plan; back off with jitter.
  - `400`: Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.
  - `409`: Label already taken or in 7-day release cooldown after deletion.
- **Rate Limits**: Read current usage via `GET /api/v1/organization/usage`.

## Data shapes
- **LinkShiftSubdomainQueryResult**: Paginated LinkShift-subdomain query response.
- **CreateLinkShiftSubdomainRequest**: Payload for creating a LinkShift subdomain.
  - **Fields**: `name`, `domainGroupId`
- **LinkShiftSubdomain**: LinkShift-hosted subdomain label assigned to a domain group.
  - **Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateLinkShiftSubdomainRequest**: Payload for updating a LinkShift subdomain (group reassignment only).
  - **Fields**: `domainGroupId`
- **QueryResultMeta**: Metadata envelope shared by cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage** (not part of the Subdomains tag but relevant for rate limit checks).
