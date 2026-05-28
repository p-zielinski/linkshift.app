---
source: shared/docs/pages/guides/redirect-rules-core.md
generatedAt: 2026-05-28T15:49:40.205Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how redirect rules match requests and resolve destinations.

## What this doc covers
- **How routing works**: Overview of request handling and rule evaluation.
- **Organization redirect rate limits (edge traffic)**: Details on rate limits and access checks.
- **Propagation and caching**: Information on caching behavior and invalidation.
- **Rule fields**: Description of fields used in redirect rules.
- **Path matching (`pathMatch`)**: Explanation of path matching options.
- **Query matching (`queryMatch`)**: Overview of query matching modes.
- **HTTP method matching (`matchMethod`)**: Supported HTTP methods and their behavior.
- **Priority and rule ordering**: How rules are prioritized and ordered.
- **Static destinations**: Definition and examples of static URL redirects.
- **Dynamic destinations — placeholders**: Use of placeholders in destination URLs.
- **Dynamic destinations — conditional routing**: Syntax for conditional routing based on request data.

## Key workflows and rules
1. **Request Handling**:
   - Requests hit a domain group, which checks rate limits and access before evaluating redirect rules.
   - Rules are evaluated in order of priority; the first rule that matches the request is applied.
   - If no rule matches, a `404 Not Found` response is returned.

2. **Rate Limiting**:
   - Each organization has a `redirectionLimitPerMinute` that counts all live requests.
   - Exceeding this limit results in a `429 Too Many Requests` response.

3. **Rule Evaluation**:
   - Rules can be soft-deleted (`deletedAt` set) and are excluded from evaluations.
   - Rules marked as `isBlocked` are skipped entirely during runtime.

4. **Path and Query Matching**:
   - Path matching can be `exact` or `prefix`, affecting how requests are matched.
   - Query matching modes include `exact`, `ignore`, and `subset`, determining how query parameters are evaluated.

5. **Dynamic Destinations**:
   - Placeholders can be used in destination URLs to inject request data.
   - Conditional routing allows for dynamic destination selection based on conditions.

## Limits and constraints
- **Rate Limits**: Each organization has a per-minute limit on redirects, leading to `429` responses if exceeded.
- **Field Limits**: `matchMethod` can list a maximum of 6 HTTP methods; exceeding this results in a `400` error.
- **Rule Priority**: Rules are evaluated based on priority (0-1000), with higher numbers evaluated first.
- **Caching**: Cached routing data can be stale for up to 5 minutes if invalidation fails.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Operations](./redirect-rules-operations.md)
- [Link maps and redirect rules](./redirect-rules-link-maps.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- [Simulate vs live redirect](#simulate-vs-live-redirect)
- [Getting started — redirect rate limits](../guides/getting-started.md#redirect-rate-limits-edge-traffic)
