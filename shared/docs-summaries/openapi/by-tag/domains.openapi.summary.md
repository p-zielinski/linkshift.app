---
llmSlice: shared/docs/openapi/by-tag/domains.openapi.json
source: shared/docs/openapi/by-tag/domains.openapi.json
generatedAt: 2026-06-14T15:25:49.405Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domains
---

## Purpose
This OpenAPI tag covers the management of custom domains within the LinkShift platform for API-key clients.

## Endpoints
- **`GET /api/v1/domains`** (`listDomains`)
  - Returns all active custom domains in one response (no cursor pagination). Clients can filter results client-side by `domainGroupId`.

- **`POST /api/v1/domains`** (`createDomain`)
  - Registers a custom hostname under `domainGroupId`. The hostname must match the request pattern (lowercase labels). 
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  - Returns `404` when the group ID is invalid; `409` when the name is already taken in your organization.

- **`GET /api/v1/domains/{id}`** (`getDomain`)
  - Fetches a single domain record by its ID, including `name`, `domainGroupId`, and timestamps.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  - Returns `404` when the ID is unknown, soft-deleted, or outside your organization.

- **`PUT /api/v1/domains/{id}`** (`updateDomain`)
  - Updates the hostname and/or moves the domain to another group. The `domainGroupId` is required in the request body.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  - Returns `409` when the new hostname conflicts with an existing domain.

- **`DELETE /api/v1/domains/{id}`** (`deleteDomain`)
  - Soft-deletes the domain, meaning it will no longer match live redirect traffic.
  - Returns `404` when the ID isn't in your organization.

## Auth, billing, and rate limits
- **Authentication**: Send your key on every request using `X-API-Key: <your_key>` (preferred) or `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or wrong organization. Create or rotate a key in the dashboard (Organization → API keys).
  - `402`: API access isn't on your current plan. Upgrade subscription, then retry.
  - `429`: Per-key rate limit for your plan. Back off with jitter; read current usage via `GET /api/v1/organization/usage`.
  - `400`: Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.
- **Dashboard-only**: API key CRUD, billing checkout, and some analytics views require signed-in dashboard authentication.

## Data shapes
- **DomainQueryResult**: Paginated domain query response.
- **CreateDomainRequest**: Payload for creating a domain.
  - **Fields**: `name`, `domainGroupId`
- **Domain**: Domain entity assigned to a domain group.
  - **Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateDomainRequest**: Payload for updating a domain.
  - **Fields**: `name`, `domainGroupId`
- **QueryResultMeta**: Metadata envelope shared by cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To read current usage and manage rate limits.
