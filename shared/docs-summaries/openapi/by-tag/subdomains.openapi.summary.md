---
llmSlice: shared/docs/openapi/by-tag/subdomains.openapi.json
source: shared/docs/openapi/by-tag/subdomains.openapi.json
generatedAt: 2026-06-04T19:35:24.123Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Subdomains
---

## Purpose
This OpenAPI tag covers the management of LinkShift-hosted subdomains for API-key clients.

## Endpoints
- **`GET /api/v1/subdomains`** (`listSubdomains`)
  - Returns all active LinkShift-hosted subdomain labels in one response. Each row includes `domainGroupId` for filtering in automation scripts.

- **`POST /api/v1/subdomains`** (`createSubdomain`)
  - Reserves a lowercase label (max 30 characters) on LinkShift infrastructure under `domainGroupId`. Returns a 404 when the group is invalid and a 409 when the label is already taken.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/subdomains/{id}`** (`getSubdomain`)
  - Fetches one subdomain label and its `domainGroupId`. Returns a 404 when the ID is unknown or outside your organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/subdomains/{id}`** (`updateSubdomain`)
  - Renames the label and/or reassigns `domainGroupId` (required in the body). Returns a 409 on label conflict.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/subdomains/{id}`** (`deleteSubdomain`)
  - Soft-deletes the label, stopping it from serving redirect traffic. Returns a 404 when out of scope.

## Auth, billing, and rate limits
- **Authentication**: Send your key on every request using `X-API-Key: <your_key>` (preferred) or `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or wrong organization.
  - `402`: API access isn't on your current plan.
  - `429`: Per-key rate limit for your plan; back off with jitter.
  - `400`: Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.

## Data shapes
- **LinkShiftSubdomainQueryResult**: Paginated response for LinkShift subdomain queries.
- **CreateLinkShiftSubdomainRequest**: Payload for creating a LinkShift subdomain.
  - **Fields**: `name`, `domainGroupId`
- **LinkShiftSubdomain**: Represents a LinkShift-hosted subdomain label assigned to a domain group.
  - **Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateLinkShiftSubdomainRequest**: Payload for updating a LinkShift subdomain.
  - **Fields**: `name`, `domainGroupId`
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To read current usage and manage rate limits.
