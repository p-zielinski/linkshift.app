---
llmSlice: shared/docs/openapi/by-tag/domain-groups.openapi.json
source: shared/docs/openapi/by-tag/domain-groups.openapi.json
generatedAt: 2026-06-30T19:40:36.668Z
model: gpt-4o-mini
sliceType: openapi-by-tag
canonicalOpenApi: shared/docs/openapi/linkshift-api-keys.openapi.yaml
openApiTag: Domain Groups
---

## Purpose
This OpenAPI tag covers the management of domain groups within the LinkShift API, allowing API-key clients to automate domain configuration and redirect rules.

## Endpoints
- **`GET /api/v1/domain-groups`** (`listDomainGroups`)
  - Returns every active domain group in one response (no cursor pagination). Use `data[].id` as `domainGroupId` on domains, rules, tests, and link maps.

- **`POST /api/v1/domain-groups`** (`createDomainGroup`)
  - Creates a domain group, which serves as a scope container for domains, rules, and link maps. Optional fields include `robotsPolicy` and `customRobotsContent`, which apply to all attached domains, and `redirectDeliveryMode` (default is `INSTANT`, or `WITH_NOTICE` for a notice page before redirect). Returns a 400 error when the name is invalid or robots content is missing for a CUSTOM policy.
  - **Request Body Fields**: `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/domain-groups/{id}`** (`getDomainGroup`)
  - Fetches a specific domain group by ID, including robots policy and redirect delivery mode fields. Returns a 404 error when the ID is unknown or soft-deleted outside your organization.
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/domain-groups/{id}`** (`updateDomainGroup`)
  - Updates the name, robots policy, and/or redirect delivery mode for an existing group. Changes to robots policy or redirect delivery mode will impact all domains in the group on the next request. Returns a 404 error when the group doesn't exist in your organization.
  - **Request Body Fields**: `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/domain-groups/{id}`** (`deleteDomainGroup`)
  - Soft-deletes the specified domain group; it will no longer appear in lists and cannot receive new resources. Historical analytics may still reference the ID. Returns a 404 error when the group is already deleted or out of scope.

## Auth, billing, and rate limits
- **Authentication**: Send your key on every request using `X-API-Key: <your_key>` (preferred) or `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access isn't on your current plan; upgrade your subscription.
  - `429`: Per-key rate limit for your plan; back off with jitter and read current usage via `GET /api/v1/organization/usage`.
  - `400`: Request body or query failed validation; inspect `details` and `requestId` in the JSON body.
  - `404`: ID doesn't exist or isn't in your organization scope.
- **Dashboard-only**: API key CRUD, billing checkout, and some analytics views require signed-in dashboard authentication.

## Data shapes
- **DomainGroupQueryResult**: Paginated domain-group query response.
- **CreateDomainGroupRequest**: Payload for creating a domain group.
  - **Fields**: `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`
- **DomainGroup**: Scope boundary for redirect configuration.
  - **Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateDomainGroupRequest**: Payload for updating a domain group.
  - **Fields**: `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`
- **RobotsPolicy**: Controls robots.txt behavior for all domains in a domain group.
- **RedirectDeliveryMode**: Controls how visitors reach the redirect destination after a rule match.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Check current API usage.
