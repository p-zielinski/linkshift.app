---
source: shared/docs/pages/guides/redirect-rules-core.md
generatedAt: 2026-06-08T20:10:55.652Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how to configure and manage redirect rules, including matching requests and resolving destinations.

## What this doc covers
- **How routing works**: Overview of request handling and rule evaluation order.
- **Organization redirect rate limits (edge traffic)**: Details on rate limits for live requests.
- **Propagation and caching**: Information on caching behavior and invalidation.
- **Rule fields**: Catalog of fields used in redirect rules and their purposes.
- **Path matching (`pathMatch`)**: Explanation of path matching modes and their behaviors.
- **Query matching (`queryMatch`)**: Overview of query matching modes and how they function.
- **HTTP method matching (`matchMethod`)**: Supported HTTP methods and their configuration.
- **Priority and rule ordering**: How to prioritize rules and the order of evaluation.
- **Static destinations**: Configuration of fixed URL redirects.
- **Dynamic destinations — placeholders**: Using placeholders to create dynamic URLs.
- **Dynamic destinations — conditional routing**: Implementing conditional logic in destination routing.

## Key workflows and rules
1. **Request Handling**:
   - Requests are processed in a pipeline: rate limit → access check → rule evaluation.
   - The first rule that produces a redirect is applied; if none match, a `404` is returned.

2. **Rate Limiting**:
   - Each live request counts against `redirectionLimitPerMinute`.
   - Exceeding limits results in a `429 Too Many Requests` response.

3. **Rule Creation**:
   - Rules are created with fields like `source`, `destination`, `statusCode`, `pathMatch`, `queryMatch`, and `matchMethod`.
   - Rules are evaluated based on `priority`, with higher numbers evaluated first.

4. **Dynamic Destinations**:
   - Use placeholders in the `destination` field to inject request data.
   - Conditional routing can be implemented using ternary syntax.

5. **Simulate Requests**:
   - Use `POST /api/v1/redirect-rules/simulate` to test rules without consuming rate limits.

## Limits and constraints
- **Rate Limits**: Each organization has a `redirectionLimitPerMinute` based on the active plan. Exceeding this limit results in a `429` error.
- **Field Limits**:
  - `matchMethod` can include a maximum of 6 methods.
  - The `priority` field can range from 0 to 1000.
- **Caching**: Cached routing data may persist for up to 5 minutes if invalidation fails.
- **Blocked Rules**: Rules marked as `isBlocked: true` are never evaluated and must be unblocked via a successful `PUT` request.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./redirect-rules.md)
- **Link Maps**: [Link maps and redirect rules](./redirect-rules-link-maps.md)
- **Operations**: [Operations](./redirect-rules-operations.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- **Simulate vs Live Redirect**: [Simulate vs live redirect](./redirect-rules-operations.md#simulate-vs-live-redirect)
- **Usage API**: `GET /api/v1/organization/usage` for checking current plan limits.
