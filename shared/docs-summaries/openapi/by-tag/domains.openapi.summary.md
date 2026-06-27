---
llmSlice: shared/docs/openapi/by-tag/domains.openapi.json
source: shared/docs/openapi/by-tag/domains.openapi.json
generatedAt: 2026-06-27T00:00:00.000Z
model: manual
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domains
---

## Purpose
This OpenAPI tag covers the management of custom domains within the LinkShift platform for API-key clients, including DNS verification before on-demand TLS.

## Endpoints
- **`GET /api/v1/domains`** (`listDomains`)
  - Returns all active custom domains in one response (no cursor pagination). Clients can filter results client-side by `domainGroupId`.

- **`POST /api/v1/domains`** (`createDomain`)
  - Registers a custom hostname under `domainGroupId`. Hostname must match the request pattern; it is stored in lowercase (mixed-case input is normalized).
  - Response includes `dnsStatus: PENDING` until DNS points at the LinkShift target IP.
  - **Request Body Fields**: `name`, `domainGroupId`
  - **Response Fields**: `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`
  - Returns `404` when the group ID is invalid; `409` when the name is already taken or in a 7-day release cooldown after deletion (`Domain name {hostname} was recently deleted and is in a 7-day release cooldown until {iso8601}`).

- **`GET /api/v1/domains/{id}`** (`getDomain`)
  - Fetches a single domain record by its ID, including DNS verification fields.
  - **Response Fields**: `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`
  - Returns `404` when the ID is unknown, soft-deleted, or outside your organization.

- **`POST /api/v1/domains/{id}/verify-dns`** (`verifyDomainDns`)
  - Live DNS lookup (A records, CNAME chain) against `APP_DOMAIN_TARGET_IP`. Updates `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`.
  - Sets `VERIFIED` on success, `FAILED` on failure. Clears edge `check-domain` gate when verified.
  - **Response Fields**: updated `Domain` object
  - Returns `404` when the domain ID is unknown or outside your organization.

- **`PUT /api/v1/domains/{id}`** (`updateDomain`)
  - Moves the domain to another group only. Hostname is immutable; sending `name` returns `400` (strict schema).
  - To use a new hostname, delete and create a new domain (new TLS certificate required for custom domains).
  - **Request Body Fields**: `domainGroupId` (required)
  - **Response Fields**: `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/domains/{id}`** (`deleteDomain`)
  - Soft-deletes the domain. Published links stop working immediately; hostname reserved globally for 7 days.
  - Returns `404` when the ID isn't in your organization.

## Internal edge endpoint (not in this tag)
- **`GET /check-domain?domain={hostname}`** — Caddy-only. Returns **403** when hostname is unknown, group inactive, or DNS not verified (`dns_pending`). LinkShift subdomains skip DNS verification.

## Auth, billing, and rate limits
- **Authentication**: Send your key on every request using `X-API-Key: <your_key>` (preferred) or `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or wrong organization. Create or rotate a key in the dashboard (Organization → API keys).
  - `402`: API access isn't on your current plan. Upgrade subscription, then retry.
  - `429`: Per-key rate limit for your plan. Back off with jitter; read current usage via `GET /api/v1/organization/usage`.
  - `400`: Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.
  - `409`: Hostname already taken or in 7-day release cooldown after deletion.
- **Dashboard-only**: API key CRUD, billing checkout, and some analytics views require signed-in dashboard authentication.

## Data shapes
- **DomainQueryResult**: Paginated domain query response.
- **CreateDomainRequest**: Payload for creating a domain (hostnames stored lowercase).
  - **Fields**: `name`, `domainGroupId`
- **Domain**: Domain entity assigned to a domain group.
  - **Fields**: `id`, `name`, `domainGroupId`, `dnsStatus`, `dnsVerifiedAt`, `dnsLastCheckedAt`, `createdAt`, `updatedAt`, `deletedAt`
- **DomainDnsStatus**: `PENDING` | `VERIFIED` | `FAILED`
- **UpdateDomainRequest**: Payload for updating a domain (group reassignment only).
  - **Fields**: `domainGroupId`
- **QueryResultMeta**: Metadata envelope shared by cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: To read current usage and manage rate limits.
