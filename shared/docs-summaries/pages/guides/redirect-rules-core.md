---
source: shared/docs/pages/guides/redirect-rules-core.md
generatedAt: 2026-06-14T15:24:59.018Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how to configure and manage redirect rules for requests.

## What this doc covers
- **How routing works**: Overview of the redirect engine and rule evaluation order.
- **Organization redirect rate limits**: Details on rate limits for live requests.
- **Propagation and caching**: Information on how routing data is cached and updated.
- **Rule fields**: Catalog of fields used in redirect rules and their purposes.
- **Path matching**: Explanation of `pathMatch` options for source paths.
- **Query matching**: Details on `queryMatch` modes and their behaviors.
- **HTTP method matching**: Supported HTTP methods and their configurations.
- **Priority and rule ordering**: How to set and evaluate rule priorities.
- **Static destinations**: Configuration of fixed URL redirects.
- **Dynamic destinations**: Use of placeholders and conditional routing in destinations.

## Key workflows and rules
1. **Redirect Rule Evaluation**:
   - Requests are evaluated in the order of `priority` (descending), `createdAt` (descending), and `id` (descending).
   - The first rule that matches a request will trigger a redirect.

2. **Rate Limiting**:
   - Each live request counts against `redirectionLimitPerMinute`.
   - Exceeding the limit results in a `429 Too Many Requests` response.

3. **Caching Behavior**:
   - Changes to redirect rules or link maps invalidate cached data immediately.
   - Cached data can remain stale for up to 5 minutes if invalidation fails.

4. **Rule Creation**:
   - Required fields include `source`, `destination`, and `domainGroupId`.
   - Optional fields include `linkMapId`, `statusCode`, `pathMatch`, `queryMatch`, and `matchMethod`.

5. **Blocked Rules**:
   - Rules marked as `isBlocked: true` are never evaluated.
   - Unblocking a rule requires a successful `PUT` request on the rule.

6. **Dynamic Destinations**:
   - Use placeholders in the destination URL to inject request data.
   - Conditional routing can be implemented using ternary syntax.

## Limits and constraints
- **Rate Limits**: Each organization has a `redirectionLimitPerMinute` based on their plan, affecting all live requests.
- **Field Limits**:
  - `matchMethod` can include a maximum of 6 methods.
  - The `priority` field can range from 0 to 1000.
- **Caching Limits**: Cached routing data can be stale for up to 5 minutes.
- **Blocked Rules**: Rules with a non-null `destination` are monitored for unsafe URLs, which can lead to blocking.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps and redirect rules](./redirect-rules-link-maps.md)
- [Operations](./redirect-rules-operations.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- [Getting started — redirect rate limits](../guides/getting-started.md#redirect-rate-limits-edge-traffic)
- [Simulate vs live redirect](./redirect-rules-operations.md#simulate-vs-live-redirect)
- [Link map concepts — cache model](../concepts/link-map-concepts.md#cache-model)
