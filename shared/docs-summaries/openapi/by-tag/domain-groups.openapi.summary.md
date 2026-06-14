---
llmSlice: shared/docs/openapi/by-tag/domain-groups.openapi.json
source: shared/docs/openapi/by-tag/domain-groups.openapi.json
generatedAt: 2026-06-14T15:25:36.534Z
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
  - Creates a domain group, which serves as a scope container for domains, rules, and link maps. Optional fields include `robotsPolicy` and `customRobotsContent`, which apply to all attached domains. The `redirectDeliveryMode` can be set to `INSTANT` (default) or `WITH_NOTICE`. Returns a 400 error for invalid names or missing robots content for CUSTOM policy.
  - **Request Body Fields**: `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`, `createdAt`, `updatedAt`, `deletedAt`

- **`GET /api/v1/domain-groups/{id}`** (`getDomainGroup`)
  - Fetches a single domain group by ID, including fields for robots policy and redirect delivery mode. Returns a 404 error if the ID is unknown or the group is soft-deleted outside the organization.
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`, `createdAt`, `updatedAt`, `deletedAt`

- **`PUT /api/v1/domain-groups/{id}`** (`updateDomainGroup`)
  - Updates the name, robots policy, and/or redirect delivery mode for an existing group. Changes to robots policy or redirect delivery mode affect all domains in the group on the next request. Returns a 404 error if the group does not exist in the organization.
  - **Request Body Fields**: `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`
  - **Response Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`, `createdAt`, `updatedAt`, `deletedAt`

- **`DELETE /api/v1/domain-groups/{id}`** (`deleteDomainGroup`)
  - Soft-deletes the specified domain group, preventing it from appearing in lists and from receiving new resources. Historical analytics may still reference the ID. Returns a 404 error if the group is already deleted or out of scope.

## Auth, billing, and rate limits
- **Authentication**: Send your key on every request using `X-API-Key: <your_key>` (preferred) or `Authorization: ApiKey <your_key>`.
- **Error Codes**:
  - `401`: Key missing, revoked, or incorrect organization.
  - `402`: API access isn't on the current plan; upgrade subscription to retry.
  - `429`: Per-key rate limit for your plan; implement backoff with jitter.
  - `400`: Request body or query validation failed; check `details` and `requestId` in the JSON body.
  - `404`: ID does not exist or is not in your organization scope.
- **Note**: Dashboard-only API key CRUD, billing checkout, and some analytics views are not included in this spec and require signed-in dashboard authentication.

## Data shapes
- **DomainGroupQueryResult**: Paginated domain-group query response.
- **CreateDomainGroupRequest**: Payload for creating a domain group.
  - **Fields**: `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`
- **DomainGroup**: Represents a scope boundary for redirect configuration.
  - **Fields**: `id`, `name`, `organizationId`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`, `createdAt`, `updatedAt`, `deletedAt`
- **UpdateDomainGroupRequest**: Payload for updating a domain group.
  - **Fields**: `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`
- **QueryResultMeta**: Metadata envelope for cursor-paginated query responses.
  - **Fields**: `dataType`, `hasMore`, `moreStartingAfterId`
- **ErrorResponse**: Standard error envelope.
  - **Fields**: `code`, `key`, `message`, `details`, `requestId`, `feature`
- **RobotsPolicy**: Controls robots.txt behavior for all domains in a domain group; CUSTOM requires `customRobotsContent`.
- **RedirectDeliveryMode**: Controls how visitors reach the redirect destination after a rule match; options include `INSTANT` and `WITH_NOTICE`.

## Related endpoints outside this tag
- **GET /api/v1/organization/usage**: Retrieve current usage to monitor rate limits.
