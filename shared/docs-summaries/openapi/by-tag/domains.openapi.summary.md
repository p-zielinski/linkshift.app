---
llmSlice: shared/docs/openapi/by-tag/domains.openapi.json
source: shared/docs/openapi/by-tag/domains.openapi.json
generatedAt: 2026-06-30T19:39:21.730Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domains
---

## Purpose
This OpenAPI tag covers the management of custom domains within the LinkShift platform for API-key clients.

## Endpoints
- **`GET /api/v1/domains`** (`listDomains`)
  - Returns all active custom domains in one response (no cursor pagination). Clients can filter results by `domainGroupId`.

- **`POST /api/v1/domains`** (`createDomain`)
  - Registers a custom hostname under `domainGroupId`. The hostname must match the request pattern and is stored in lowercase. The response includes `dnsStatus: PENDING` until DNS verification succeeds. Returns `404` for invalid group IDs and `409` if the hostname is already registered.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/domains/{id}`** (`getDomain`)
  - Fetches a domain record by ID, including `name`, `domainGroupId`, and DNS verification fields. Returns `404` if the ID is unknown or outside the organization.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/domains/{id}`** (`updateDomain`)
  - Moves the domain to another group only; the hostname is immutable after creation. Sending `name` in the body results in a `400` error. `domainGroupId` is required in the body.
  - **Request Body Fields**: `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/domains/{id}`** (`deleteDomain`)
  - Soft-deletes the domain, stopping published links immediately. The hostname remains reserved globally for 7 days before it can be recreated. Returns `404` if the ID is not in the organization.

- **`POST /api/v1/domains/{id}/verify-dns`** (`verifyDomainDns`)
  - Performs a live DNS lookup for the domain's hostname, updating `dnsStatus`, `dnsVerifiedAt`, and `dnsLastCheckedAt`. On success, sets `dnsStatus` to `VERIFIED`. This operation is idempotent.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`

## Auth, billing, and rate limits
- **Authentication**: Send your API key on every request using the header `X-API-Key: <your_key>` or alternatively `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or wrong organization.
  - `402`: API access isn't on your current plan.
  - `429`: Per-key rate limit for your plan; clients should back off with jitter.
  - `400`: Request body or query failed validation.
  - `404`: ID doesn't exist or isn't in your organization scope.
- **Rate Limits**: Clients should read current usage via `GET /api/v1/organization/usage` and avoid hard-coding limits.

## Data shapes
- **DomainQueryResult**: Paginated domain query response.
- **CreateDomainRequest**: Payload for creating a domain with fields `name`, `domainGroupId`.
- **Domain**: Represents a domain entity with fields `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`.
- **ErrorResponse**: Standard error envelope with fields `code`, `key`, `message`, `details`, `requestId`, `feature`.
- **UpdateDomainRequest**: Payload for updating a domain, accepting only `domainGroupId`.
- **DomainDnsStatus**: DNS verification state for custom domains with values `PENDING` and `VERIFIED`.

## Related endpoints outside this tag
- **`GET /check-domain?domain={hostname}`**: Internal endpoint for checking domain status before on-demand TLS. Returns `403` for unknown hostnames or inactive domain groups.
