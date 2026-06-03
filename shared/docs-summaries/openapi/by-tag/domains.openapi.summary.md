---
llmSlice: shared/docs/openapi/by-tag/domains.openapi.json
source: shared/docs/openapi/by-tag/domains.openapi.json
generatedAt: 2026-06-03T16:55:11.930Z
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
  - Registers a custom hostname under `domainGroupId`. The hostname must match the request pattern (lowercase labels). Returns a `404` when the group ID is invalid and a `409` when the name is already taken in your organization.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/domains/{id}`** (`getDomain`)
  - Fetches one domain record identified by `id`. Returns a `404` when the ID is unknown, soft-deleted, or outside your organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/domains/{id}`** (`updateDomain`)
  - Changes the hostname and/or moves the domain to another group. The `domainGroupId` is required in the request body. Returns a `409` when the new hostname conflicts with an existing domain.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/domains/{id}`** (`deleteDomain`)
  - Soft-deletes the domain, meaning it no longer matches live redirect traffic. Returns a `404` when the ID isn't in your organization.

## Auth, billing, and rate limits
- **Authentication**: Send your API key on every request using the header `X-API-Key: <your_key>`. An alternative header is `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401` — Key missing, revoked, or incorrect organization.
  - `402` — API access isn't on your current plan.
  - `429` — Per-key rate limit for your plan; clients should back off with jitter and can read current usage via `GET /api/v1/organization/usage`.
  - `400` — Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404` — ID doesn't exist or isn't in your organization scope.
- **Dashboard-only Operations**: API key CRUD, billing checkout, and some analytics views are not included in this spec and require signed-in dashboard authentication.

## Data shapes
- **DomainQueryResult**: Paginated domain query response.
- **CreateDomainRequest**: Payload for creating a domain.
  - **Fields**: `name`, `domainGroupId`
- **Domain**: Domain entity assigned to a domain group.
  - **Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateDomainRequest**: Payload for updating a domain.
  - **Fields**: `name`, `domainGroupId`
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Related to API usage tracking.
