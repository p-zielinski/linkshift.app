---
llmSlice: shared/docs/openapi/by-tag/subdomains.openapi.json
source: shared/docs/openapi/by-tag/subdomains.openapi.json
generatedAt: 2026-05-28T15:48:01.388Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Subdomains
---

## Purpose
This OpenAPI tag covers the LinkShift endpoints related to managing subdomains for API-key clients.

## Endpoints
- **`GET /api/v1/subdomains`** (`listSubdomains`)
  - Returns all active LinkShift subdomains for the authenticated organization.
  
- **`POST /api/v1/subdomains`** (`createSubdomain`)
  - Creates a LinkShift-hosted subdomain label in a target domain group.
  - **Request Body Fields:** `name`, `domainGroupId`
  - **Response Fields:** `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`GET /api/v1/subdomains/{id}`** (`getSubdomain`)
  - Returns one LinkShift subdomain by ID when it belongs to the authenticated organization.
  - **Response Fields:** `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`PUT /api/v1/subdomains/{id}`** (`updateSubdomain`)
  - Updates mutable subdomain fields such as name or assigned domain group.
  - **Request Body Fields:** `name`, `domainGroupId`
  - **Response Fields:** `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`DELETE /api/v1/subdomains/{id}`** (`deleteSubdomain`)
  - Marks a LinkShift subdomain as deleted without hard-removing it from storage.

## Auth, billing, and rate limits
- **Authentication:** 
  - Preferred: `X-API-Key: <your_key>`
  - Alternative: `Authorization: ApiKey <your_key>`
  
- **Billing Behavior:**
  - API keys are organization-scoped.
  - API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.
  
- **Rate Limiting:**
  - Management API requests are rate-limited per API key according to the organization's plan.
  - Use `GET /api/v1/organization/usage` for current limits.
  - When limits are exceeded, the API returns a 429 status code; implement backoff strategies.

## Data shapes
- **LinkShiftSubdomainQueryResult** — Paginated LinkShift-subdomain query response.
- **CreateLinkShiftSubdomainRequest** — Payload for creating a LinkShift subdomain.
  - **Fields:** `name`, `domainGroupId`
- **LinkShiftSubdomain** — Represents a LinkShift-hosted subdomain label assigned to a domain group.
  - **Fields:** `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateLinkShiftSubdomainRequest** — Payload for updating a LinkShift subdomain.
  - **Fields:** `name`, `domainGroupId`
- **QueryResultMeta** — Metadata envelope for cursor-paginated query responses.
  - **Fields:** `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse** — Standardized error payload returned by API endpoints.
  - **Fields:** `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **`GET /api/v1/organization/usage`** (not explicitly under Subdomains but related to rate limits).
