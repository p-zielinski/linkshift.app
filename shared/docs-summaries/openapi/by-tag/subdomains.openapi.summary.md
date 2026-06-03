---
llmSlice: shared/docs/openapi/by-tag/subdomains.openapi.json
source: shared/docs/openapi/by-tag/subdomains.openapi.json
generatedAt: 2026-06-03T16:56:13.144Z
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
  - Reserves a lowercase label (max 30 chars) on LinkShift infrastructure under `domainGroupId`. Returns `404` when the group is invalid; `409` when the label is already taken.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/subdomains/{id}`** (`getSubdomain`)
  - Fetches one subdomain label and its `domainGroupId`. Returns `404` when the ID is unknown or outside your organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/subdomains/{id}`** (`updateSubdomain`)
  - Renames the label and/or reassigns `domainGroupId` (required in body). Returns `409` on label conflict.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/subdomains/{id}`** (`deleteSubdomain`)
  - Soft-deletes the label; it stops serving redirect traffic. Returns `404` when out of scope.

## Auth, billing, and rate limits
- **Authentication**: Send your key on every request using `X-API-Key: <your_key>` (preferred) or `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or wrong organization.
  - `402`: API access isn't on your current plan.
  - `429`: Per-key rate limit for your plan; back off with jitter.
  - `400`: Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.

## Data shapes
- **LinkShiftSubdomainQueryResult**: Paginated response for subdomain queries.
- **CreateLinkShiftSubdomainRequest**: Payload for creating a subdomain.
  - **Fields**: `name`, `domainGroupId`
- **LinkShiftSubdomain**: Represents a LinkShift-hosted subdomain.
  - **Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateLinkShiftSubdomainRequest**: Payload for updating a subdomain.
  - **Fields**: `name`, `domainGroupId`
- **QueryResultMeta**: Metadata for cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To read current usage and avoid hitting rate limits.
