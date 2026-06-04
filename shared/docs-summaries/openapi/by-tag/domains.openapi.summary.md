---
llmSlice: shared/docs/openapi/by-tag/domains.openapi.json
source: shared/docs/openapi/by-tag/domains.openapi.json
generatedAt: 2026-06-04T19:34:15.736Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domains
---

## Purpose
This OpenAPI tag covers operations related to managing custom domains within the LinkShift Management API for API-key clients.

## Endpoints
- **`GET /api/v1/domains`** (`listDomains`)
  - Returns all active custom domains in one response (no cursor pagination). Clients can filter results by `domainGroupId` client-side.
  
- **`POST /api/v1/domains`** (`createDomain`)
  - Registers a custom hostname under `domainGroupId`. The hostname must match the request pattern (lowercase labels). Returns `404` if the group ID is invalid and `409` if the name is already taken in your organization.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`GET /api/v1/domains/{id}`** (`getDomain`)
  - Fetches a single domain record by ID, returning fields such as `name`, `domainGroupId`, and timestamps. Returns `404` if the ID is unknown, soft-deleted, or outside your organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`PUT /api/v1/domains/{id}`** (`updateDomain`)
  - Updates the hostname and/or moves the domain to another group. The `domainGroupId` is required in the request body. Returns `409` if the new hostname conflicts with an existing domain.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`DELETE /api/v1/domains/{id}`** (`deleteDomain`)
  - Soft-deletes the domain, meaning it will no longer match live redirect traffic. Returns `404` if the ID isn't in your organization.

## Auth, billing, and rate limits
- **Authentication**: Send your API key on every request using the header `X-API-Key: <your_key>`. An alternative header supported is `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access isn't on your current plan; upgrade subscription to retry.
  - `429`: Per-key rate limit for your plan; implement backoff with jitter.
  - `400`: Request body or query validation failed; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.
  
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
- **GET /api/v1/organization/usage**: To read current usage and manage rate limits.
