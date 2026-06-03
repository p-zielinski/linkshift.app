---
source: shared/docs/pages/guides/redirect-rules-core.md
generatedAt: 2026-06-03T16:59:42.718Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how redirect rules match requests and resolve destinations.

## What this doc covers
- **How routing works**: Overview of request handling and rule evaluation.
- **Organization redirect rate limits (edge traffic)**: Details on rate limits for live requests.
- **Propagation and caching**: Information on how routing data is cached and invalidated.
- **Rule fields**: Catalog of fields used in redirect rules and their purposes.
- **Path matching (`pathMatch`)**: Explanation of path matching modes.
- **Query matching (`queryMatch`)**: Overview of query matching modes.
- **HTTP method matching (`matchMethod`)**: Supported HTTP methods and their matching behavior.
- **Priority and rule ordering**: How rules are prioritized and ordered.
- **Static destinations**: Definition and examples of static URL redirects.
- **Dynamic destinations — placeholders**: Using request data in destination URLs.
- **Dynamic destinations — conditional routing**: Implementing routing logic based on conditions.

## Key workflows and rules
1. **Request Handling**:
   - Requests are processed through a live redirect pipeline, which includes rate limiting, access checks, and rule evaluation.
   - The first rule that produces a redirect wins; if a rule matches but has no valid destination, the next rule is evaluated.

2. **Rate Limiting**:
   - Each live request counts against the `redirectionLimitPerMinute`.
   - Exceeding the limit results in a `429 Too Many Requests` response.

3. **Rule Deletion and Blocking**:
   - Soft-deleted rules are excluded from routing.
   - Blocked rules (`isBlocked: true`) are skipped during evaluation.

4. **Rule Creation**:
   - Rules must specify a `source` and `destination`.
   - The `priority` field determines the order of rule evaluation.

5. **Dynamic Destinations**:
   - Use placeholders in destination URLs to inject request data.
   - Conditional routing allows for dynamic decision-making based on request attributes.

## Limits and constraints
- **Rate Limits**: Each organization has a `redirectionLimitPerMinute` based on their plan, affecting all live requests.
- **Field Limits**: The `matchMethod` array can contain a maximum of 6 methods; exceeding this results in a `400` error.
- **Caching**: Cached routing data may persist for up to 5 minutes if invalidation fails.
- **Rule Priority**: Rules are evaluated based on priority, with a maximum priority value of 1000.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./redirect-rules.md)
- **Link Maps and Redirect Rules**: [Link maps and redirect rules](./redirect-rules-link-maps.md)
- **Operations**: [Operations](./redirect-rules-operations.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- **Simulate vs Live Redirect**: [Simulate vs live redirect](./redirect-rules-operations.md#simulate-vs-live-redirect)
- **Getting Started with Redirect Rate Limits**: [Getting started — redirect rate limits](../guides/getting-started.md#redirect-rate-limits-edge-traffic)
