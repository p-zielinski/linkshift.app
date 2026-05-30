---
source: shared/docs/pages/guides/redirect-rules-core.md
generatedAt: 2026-05-30T07:02:19.647Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how redirect rules match requests and resolve destinations.

## What this doc covers
- **How matching works**: Evaluation, rate-limiting, and caching of requests.
- **How routing works**: The process of handling requests through domain groups and redirect rules.
- **Organization redirect rate limits**: Details on rate limits for redirect traffic.
- **Propagation and caching**: How changes to rules and link maps propagate through the system.
- **Rule fields reference**: Catalog of fields used in redirect rules.
- **Static and dynamic destinations**: How to set fixed and variable destinations for redirects.
- **Conditional routing**: Using conditions to determine redirect destinations.

## Key workflows and rules
1. **Request Evaluation**:
   - Requests are evaluated against the organization's redirect rate limit.
   - If exceeded, a `429 Too Many Requests` response is returned.
   - If access is suspended, a `402 Payment Required` response is issued.
   - The system loads active redirect rules in order of priority.
   - Each rule is checked for a match based on `source`, `pathMatch`, `queryMatch`, and `matchMethod`.
   - If a rule matches, it resolves the destination; if the destination is an absolute URL on a blacklist, a `403 Forbidden` is returned.
   - If no rules match, a `404 Not Found` is returned.

2. **Rate Limiting**:
   - Rate limits are enforced per organization per minute.
   - The limit is checked before evaluating rules and handling `robots.txt`.
   - `GET /api/v1/organization/usage` can be used to check current plan limits.

3. **Caching**:
   - Changes to rules or link maps invalidate cached data immediately.
   - Cached data may persist for up to 5 minutes if invalidation fails.

4. **Rule Creation**:
   - Rules must specify a `source`, `destination`, and `domainGroupId`.
   - The `statusCode` defaults to `302`, and `priority` ranges from 0 to 1000.

5. **Dynamic Destinations**:
   - Use placeholders in the destination field to inject request data.
   - Conditional routing can be implemented using ternary syntax.

## Limits and constraints
- **Rate Limits**: `redirectionLimitPerMinute` is enforced per organization.
- **Field Limits**: 
  - `matchMethod` can have a maximum of 6 explicit methods.
  - Priority must be between 0 and 1000.
- **Rule Visibility**: Soft-deleted rules are excluded from live routing and API lists.
- **Blocked Rules**: Rules with `isBlocked: true` are never evaluated at runtime.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps and redirect rules](./redirect-rules-link-maps.md)
- [Operations](./redirect-rules-operations.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- [Simulate vs live redirect](./redirect-rules-operations.md#simulate-vs-live-redirect)
- `GET /api/v1/redirect-rules`
- `GET /api/v1/organization/usage`
- `POST /api/v1/redirect-rules/simulate`
