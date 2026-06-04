---
llmSlice: shared/docs/openapi/by-tag/domain-groups.openapi.json
source: shared/docs/openapi/by-tag/domain-groups.openapi.json
generatedAt: 2026-06-04T19:34:01.857Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domain Groups
---

## Purpose
This OpenAPI tag covers the management of domain groups for API-key clients, enabling automation of domain configurations, redirect rules, and link maps.

## Endpoints
- **`GET /api/v1/domain-groups`** (`listDomainGroups`)
  - Returns every active domain group in one response (no cursor pagination). Use `data[].id` as `domainGroupId` on domains, rules, tests, and link maps.

- **`POST /api/v1/domain-groups`** (`createDomainGroup`)
  - Creates a domain group, which serves as a scope container for domains, rules, and link maps. Optional fields `robotsPolicy` and `customRobotsContent` apply to all domains attached later. Returns a 400 error when the name is invalid or robots content is missing for a CUSTOM policy.
  - **Request Body Fields**: `name`, `robotsPolicy`, `customRobotsContent`
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/domain-groups/{id}`** (`getDomainGroup`)
  - Fetches a specific domain group by ID, including robots policy fields. Returns a 404 error when the ID is unknown or soft-deleted outside your organization.
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/domain-groups/{id}`** (`updateDomainGroup`)
  - Updates the name and/or robots policy for an existing group. Changing the robots policy impacts all domains in the group on the next request. Returns a 404 error when the group doesn't exist in your organization.
  - **Request Body Fields**: `name`, `robotsPolicy`, `customRobotsContent`
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/domain-groups/{id}`** (`deleteDomainGroup`)
  - Soft-deletes the specified domain group; it will stop appearing in lists and cannot receive new resources. Historical analytics may still reference the ID. Returns a 404 error when the group is already deleted or out of scope.

## Auth, billing, and rate limits
- **Authentication**: Send your API key on every request using the header `X-API-Key: <your_key>`. An alternative header supported by the backend is `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401` — Key missing, revoked, or incorrect organization. Create or rotate a key in the dashboard.
  - `402` — API access isn't on your current plan; upgrade your subscription and retry.
  - `429` — Per-key rate limit for your plan; implement backoff with jitter and read current usage via `GET /api/v1/organization/usage`.
  - `400` — Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404` — ID doesn't exist or isn't in your organization scope.
- **Dashboard-only**: API key CRUD, billing checkout, and some analytics views are not included in this spec and require signed-in dashboard authentication.

## Data shapes
- **DomainGroupQueryResult**: Paginated domain-group query response.
- **CreateDomainGroupRequest**: Payload for creating a domain group.
  - **Fields**: `name`, `robotsPolicy`, `customRobotsContent`
- **DomainGroup**: Scope boundary for redirect configuration.
  - **Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateDomainGroupRequest**: Payload for updating a domain group.
  - **Fields**: `name`, `robotsPolicy`, `customRobotsContent`
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`
- **RobotsPolicy**: Controls robots.txt behavior for all domains in a domain group; CUSTOM requires `customRobotsContent`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage** (not explicitly tagged but referenced for rate limit usage).
