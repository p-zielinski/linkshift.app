---
llmSlice: shared/docs/openapi/by-tag/domain-groups.openapi.json
source: shared/docs/openapi/by-tag/domain-groups.openapi.json
generatedAt: 2026-06-07T10:01:51.042Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domain Groups
---

## Purpose
This OpenAPI tag covers the management of domain groups for API-key clients, allowing for the configuration of domains, rules, and link maps without dashboard session cookies.

## Endpoints
- **`GET /api/v1/domain-groups`** (`listDomainGroups`)
  - Returns every active domain group in one response (no cursor pagination). Use `data[].id` as `domainGroupId` on domains, rules, tests, and link maps.
  
- **`POST /api/v1/domain-groups`** (`createDomainGroup`)
  - Creates a domain group, which serves as a scope container for domains, rules, and link maps. Optional `robotsPolicy` and `customRobotsContent` can be applied to all domains attached later. Returns a 400 error when the name is invalid or robots content is missing for a CUSTOM policy.
  - Request body fields: `name`, `robotsPolicy`, `customRobotsContent`.
  - Response fields: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`.

- **`GET /api/v1/domain-groups/{id}`** (`getDomainGroup`)
  - Fetches a specific domain group by ID, including robots policy fields. Returns a 404 error when the ID is unknown or soft-deleted outside your organization.
  - Response fields: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`.

- **`PUT /api/v1/domain-groups/{id}`** (`updateDomainGroup`)
  - Updates the name and/or robots policy for an existing domain group. Changing the robots policy impacts all domains in the group on the next request. Returns a 404 error when the group doesn't exist in your organization.
  - Request body fields: `name`, `robotsPolicy`, `customRobotsContent`.
  - Response fields: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`.

- **`DELETE /api/v1/domain-groups/{id}`** (`deleteDomainGroup`)
  - Soft-deletes the specified domain group; it will stop appearing in lists and cannot receive new resources. Historical analytics may still reference the ID. Returns a 404 error when the group is already deleted or out of scope.

## Auth, billing, and rate limits
- Authentication is required on every request using the header: `X-API-Key: <your_key>` (preferred) or alternatively `Authorization: ApiKey <your_key>`.
- Error codes:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access isn't on the current plan; upgrade subscription to retry.
  - `429`: Per-key rate limit for your plan; back off with jitter and read current usage via `GET /api/v1/organization/usage`.
  - `400`: Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.
- Dashboard-only operations (API key CRUD, billing checkout, and some analytics views) are not included in this spec and require signed-in dashboard authentication.

## Data shapes
- **DomainGroupQueryResult**: Paginated domain-group query response.
- **CreateDomainGroupRequest**: Payload for creating a domain group with fields: `name`, `robotsPolicy`, `customRobotsContent`.
- **DomainGroup**: Represents a scope boundary for redirect configuration with fields: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateDomainGroupRequest**: Payload for updating a domain group with fields: `name`, `robotsPolicy`, `customRobotsContent`.
- **QueryResultMeta**: Metadata envelope shared by cursor-paginated query responses with fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse**: Standard error envelope with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.
- **RobotsPolicy**: Controls robots.txt behavior for all domains in a domain group; CUSTOM requires `customRobotsContent`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Related to rate limits and usage tracking.
