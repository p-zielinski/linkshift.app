---
llmSlice: shared/docs/openapi/by-tag/domains.openapi.json
source: shared/docs/openapi/by-tag/domains.openapi.json
generatedAt: 2026-06-07T10:02:00.942Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domains
---

## Purpose
This OpenAPI tag covers the management of custom domains within the LinkShift API, allowing API-key clients to automate domain configuration and redirect rules.

## Endpoints
- **`GET /api/v1/domains`** (`listDomains`)
  - Returns all active custom domains in one response (no cursor pagination). Clients can filter results by `domainGroupId` client-side.

- **`POST /api/v1/domains`** (`createDomain`)
  - Registers a custom hostname under a specified `domainGroupId`. The hostname must be in lowercase and match the request pattern. Returns a 404 if the group ID is invalid and a 409 if the name is already taken in the organization.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/domains/{id}`** (`getDomain`)
  - Fetches a single domain record based on the provided ID. Returns a 404 if the ID is unknown, soft-deleted, or outside the organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/domains/{id}`** (`updateDomain`)
  - Updates the hostname and/or moves the domain to another group. The `domainGroupId` is required in the request body. Returns a 409 if the new hostname conflicts with an existing domain.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/domains/{id}`** (`deleteDomain`)
  - Soft-deletes the specified domain, meaning it will no longer match live redirect traffic. Returns a 404 if the ID is not in the organization.

## Auth, billing, and rate limits
- **Authentication**: Send your API key with every request using the header `X-API-Key: <your_key>` (preferred) or `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access not included in the current plan; upgrade subscription to retry.
  - `429`: Per-key rate limit for your plan; implement backoff with jitter.
  - `400`: Request body or query validation failed; check `details` and `requestId` in the JSON body.
  - `404`: ID does not exist or is not in your organization scope.
- **Rate Limits**: Clients should read current usage via `GET /api/v1/organization/usage` and avoid hard-coding limits.

## Data shapes
- **DomainQueryResult**: Paginated domain query response.
- **CreateDomainRequest**: Payload for creating a domain.
  - **Fields**: `name`, `domainGroupId`
- **Domain**: Represents a domain entity assigned to a domain group.
  - **Fields**: `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateDomainRequest**: Payload for updating a domain.
  - **Fields**: `name`, `domainGroupId`
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Retrieve current API usage statistics.
