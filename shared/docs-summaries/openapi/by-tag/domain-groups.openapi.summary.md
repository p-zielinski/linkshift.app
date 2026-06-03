---
llmSlice: shared/docs/openapi/by-tag/domain-groups.openapi.json
source: shared/docs/openapi/by-tag/domain-groups.openapi.json
generatedAt: 2026-06-03T16:55:00.147Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domain Groups
---

## Purpose
This OpenAPI tag covers the management of domain groups within the LinkShift API, allowing API-key clients to automate domain configuration and redirect rules.

## Endpoints
- **`GET /api/v1/domain-groups`** (`listDomainGroups`)
  - Returns every active domain group in one response (no cursor pagination). Use `data[].id` as `domainGroupId` for domains, rules, tests, and link maps.

- **`POST /api/v1/domain-groups`** (`createDomainGroup`)
  - Creates a domain group, which serves as a scope container for domains, rules, and link maps. Optional `robotsPolicy` and `customRobotsContent` can be applied to all attached domains. Returns a 400 error when the name is invalid or robots content is missing for a CUSTOM policy.
  - **Request Body Fields:** `name`, `robotsPolicy`, `customRobotsContent`
  - **Response Fields:** `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/domain-groups/{id}`** (`getDomainGroup`)
  - Fetches a specific domain group by ID, including robots policy fields. Returns a 404 error when the ID is unknown or soft-deleted outside the organization.
  - **Response Fields:** `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/domain-groups/{id}`** (`updateDomainGroup`)
  - Updates the name and/or robots policy for an existing domain group. Changing the robots policy impacts all domains in the group on the next request. Returns a 404 error when the group doesn't exist in the organization.
  - **Request Body Fields:** `name`, `robotsPolicy`, `customRobotsContent`
  - **Response Fields:** `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/domain-groups/{id}`** (`deleteDomainGroup`)
  - Soft-deletes the specified domain group, preventing it from appearing in lists and from receiving new resources. Historical analytics may still reference the ID. Returns a 404 error when the group is already deleted or out of scope.

## Auth, billing, and rate limits
- **Authentication:** Include your API key in every request using the header `X-API-Key: <your_key>`. An alternative header is `Authorization: ApiKey <your_key>`.
- **Error Codes:**
  - `401` — Key is missing, revoked, or incorrect organization.
  - `402` — API access isn't available on the current plan.
  - `429` — Rate limit exceeded for the API key; back off with jitter and check usage via `GET /api/v1/organization/usage`.
  - `400` — Request body or query validation failed; inspect `details` and `requestId` in the JSON body.
  - `404` — ID does not exist or is not in the organization scope.
- **Dashboard-only Operations:** API key CRUD, billing checkout, and some analytics views require signed-in dashboard authentication and are not included in this spec.

## Data shapes
- **DomainGroupQueryResult** — Paginated response for domain group queries.
- **CreateDomainGroupRequest** — Payload for creating a domain group with fields: `name`, `robotsPolicy`, `customRobotsContent`.
- **DomainGroup** — Represents a scope boundary for redirect configuration, with fields: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `createdAt`, `updatedAt`, `deletedAt`.
- **UpdateDomainGroupRequest** — Payload for updating a domain group with fields: `name`, `robotsPolicy`, `customRobotsContent`.
- **QueryResultMeta** — Metadata envelope for cursor-paginated query responses, with fields: `dataType`, `hasMore`, `moreStartingAfterId`.
- **ErrorResponse** — Standard error envelope with fields: `code`, `key`, `message`, `details`, `requestId`, `feature`.
- **RobotsPolicy** — Controls the behavior of `robots.txt` for all domains in a domain group; CUSTOM requires `customRobotsContent`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage** — Check current API usage.
