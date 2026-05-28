---
source: shared/docs/pages/overview-faq.md
generatedAt: 2026-05-28T15:51:12.250Z
model: gpt-4o-mini
---

## Purpose
This document is for LinkShift users seeking quick answers to common questions and troubleshooting guidance related to redirect rules and link management.

## What this doc covers
- Common questions about creating short links, matching query parameters, and routing based on device or time.
- Troubleshooting matrix for live redirects, detailing symptoms, likely causes, and recommended actions.
- Information on redirect rules, including how to simulate redirects, handle blocked rules, and manage link map entries.

## Key workflows and rules
1. **Creating Short Links**: Use a link map with a prefix redirect rule. Refer to [How-To — short links](./guides/redirect-rules-recipes.md#how-do-i-make-short-links).
2. **Simulating Redirects**: Use `POST /api/v1/redirect-rules/simulate` to test rules before deployment.
3. **Handling No Matches**: If no rule matches, the visitor receives a 404 error.
4. **Blocked Rules**: If a rule is blocked (`isBlocked: true`), it may be due to unsafe URLs detected during scans. Fix URLs and perform a successful `PUT` to unblock.
5. **Routing Based on Conditions**: Use conditional syntax for routing based on device or time.
6. **Testing A/B Logic**: Implement A/B tests in the `destination` using `random(0,100) < N ? … : …`.

## Limits and constraints
- **Rate Limits**: The organization has a redirect rate limit (`redirectionLimitPerMinute`). Exceeding this limit results in a 429 error.
- **Analytics Range**: Custom date ranges for analytics can be up to 31 days.
- **Simulate Requests**: Simulate requests are subject to the same organization access checks as live redirects.
- **URL Fragment Routing**: Routing on URL fragments (`#section`) is not supported as they are not sent to the server.
- **Cookie Routing**: Cookie-based routing is not supported; only certain request metadata can be used.

## Related docs and API areas
- [Redirect rules — How-To cookbook](./guides/redirect-rules-recipes.md#how-to-cookbook)
- [Redirect rules — simulate](./guides/redirect-rules-operations.md#simulate-before-rollout)
- [Redirect rules — blocked rules](./guides/redirect-rules-core.md#blocked-rules-isblocked)
- [Redirect rules — propagation and caching](./guides/redirect-rules-core.md#propagation-and-caching)
- [Redirect rules — analytics](./guides/redirect-rules-operations.md#analytics)
- [Redirect engine concepts — path variables](./concepts/redirect-engine-variables.md#path-variables)
- [Redirect engine concepts — request metadata](./concepts/redirect-engine-variables.md#request-metadata)
- [Redirect engine concepts — planned GeoIP](./concepts/redirect-engine-variables.md#planned-country-routing-geoip-addon)
