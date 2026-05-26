---
llmSlice: shared/docs/openapi/by-tag/domains.openapi.json
source: shared/docs/openapi/by-tag/domains.openapi.json
generatedAt: 2026-05-26T21:06:42.604Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domains
---

## Purpose
This OpenAPI tag covers the LinkShift endpoints related to domain management accessible via API keys.

## Endpoints
- **`GET /api/v1/domains`** (`listDomains`)
  - Returns all active domains for the authenticated organization.
  
- **`POST /api/v1/domains`** (`createDomain`)
  - Creates a new domain in a target domain group after performing uniqueness and ownership checks.
  - **Request Body Fields:** `name`, `domainGroupId`
  - **Response Fields:** `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`GET /api/v1/domains/{id}`** (`getDomain`)
  - Returns a specific domain by ID, provided it belongs to the authenticated organization.
  - **Response Fields:** `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`PUT /api/v1/domains/{id}`** (`updateDomain`)
  - Updates mutable fields of a domain, such as `name` or `assigned domain group`.
  - **Request Body Fields:** `name`, `domainGroupId`
  - **Response Fields:** `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **`DELETE /api/v1/domains/{id}`** (`deleteDomain`)
  - Marks a domain as deleted without permanently removing it from storage.

## Auth, billing, and rate limits
- **Authentication:** 
  - Preferred: `X-API-Key: <your_key>`
  - Alternative: `Authorization: ApiKey <your_key>`
  
- **Billing Behavior:**
  - API keys are organization-scoped.
  - API key management endpoints (`/api/v1/api-keys`) are excluded and require dashboard user authentication.
  
- **Rate Limiting:**
  - Management API requests are rate-limited per API key according to the organization's plan.
  - Use `GET /api/v1/organization/usage` to check current limits.
  - Exceeding limits results in a 429 response; implement backoff strategies.

## Data shapes
- **DomainQueryResult**: Paginated domain query response.
- **CreateDomainRequest**: Payload for creating a domain.
  - **Fields:** `name`, `domainGroupId`
  
- **Domain**: Domain entity assigned to a domain group.
  - **Fields:** `id`, `name`, `domainGroupId`, `createdAt`, `updatedAt`, `deletedAt`
  
- **UpdateDomainRequest**: Payload for updating a domain.
  - **Fields:** `name`, `domainGroupId`
  
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses.
  - **Fields:** `dataType`, `hasMore`, `moreStartingAfterId`
  
- **ErrorResponse**: Standardized error payload returned by API endpoints.
  - **Fields:** `code`, `key`, `message`, `details`, `requestId`, `feature`

## Related endpoints outside this tag
- **`GET /api/v1/organization/usage`** (not tagged with Domains) - To check current rate limits.
