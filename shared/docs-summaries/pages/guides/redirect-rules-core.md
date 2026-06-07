---
source: shared/docs/pages/guides/redirect-rules-core.md
generatedAt: 2026-06-07T10:07:16.400Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how redirect rules match requests and resolve destinations.

## What this doc covers
- **How routing works**: Overview of the redirect engine's request handling and rule evaluation.
- **Organization redirect rate limits**: Details on rate limits for live requests and their implications.
- **Propagation and caching**: Information on how routing data is cached and invalidated.
- **Rule fields**: Catalog of fields used in redirect rules, including their purposes and defaults.
- **Path matching (`pathMatch`)**: Explanation of path matching modes and their behaviors.
- **Query matching (`queryMatch`)**: Overview of query matching modes and their behaviors.
- **HTTP method matching (`matchMethod`)**: Supported HTTP methods and their matching behavior.
- **Priority and rule ordering**: How rules are prioritized and ordered during evaluation.
- **Static destinations**: Guidelines for defining static redirect destinations.
- **Dynamic destinations — placeholders**: Using placeholders in redirect destinations for dynamic content.
- **Dynamic destinations — conditional routing**: Implementing conditional logic in redirect destinations.

## Key workflows and rules
1. **Request Handling**:
   - Every request is processed through a domain group, which applies rate limits and access checks before evaluating redirect rules.
   - Rules are evaluated in the order of `priority` (descending), `createdAt` (descending), and `id` (descending).

2. **Redirect Rule Creation**:
   - Rules must specify `source`, `destination`, and `domainGroupId`. Optional fields include `statusCode`, `pathMatch`, `queryMatch`, `matchMethod`, `priority`, and `linkMapId`.
   - The first rule that matches a request produces a redirect; if no match is found, a `404 Not Found` is returned.

3. **Rate Limiting**:
   - Each live request counts against the `redirectionLimitPerMinute` for the organization. Exceeding this limit results in a `429 Too Many Requests` response.

4. **Caching Behavior**:
   - Routing data is cached for up to 5 minutes. Changes to rules or link maps invalidate the cache immediately upon successful API writes.

5. **Blocked Rules**:
   - Rules marked as `isBlocked: true` are never evaluated. They can be unblocked by updating the rule.

## Limits and constraints
- **Rate Limits**: Each organization has a `redirectionLimitPerMinute` based on their plan, affecting all live requests, including those that do not match any rules.
- **Field Limits**: The `matchMethod` array can contain a maximum of 6 HTTP methods. Listing all 7 methods results in a `400 Bad Request`.
- **Caching Duration**: Cached routing data can be stale for up to 5 minutes if invalidation fails.
- **Dynamic Destinations**: Maximum nesting depth for conditional routing is 32 levels.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps and redirect rules](./redirect-rules-link-maps.md)
- [Operations](./redirect-rules-operations.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- [Getting started — redirect rate limits](../guides/getting-started.md#redirect-rate-limits-edge-traffic)
- [Simulate vs live redirect](./redirect-rules-operations.md#simulate-vs-live-redirect)
- [Link map concepts — cache model](../concepts/link-map-concepts.md#cache-model)
