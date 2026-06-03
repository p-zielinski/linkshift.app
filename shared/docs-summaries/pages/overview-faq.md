---
source: shared/docs/pages/overview-faq.md
generatedAt: 2026-06-03T21:35:05.706Z
model: gpt-4o-mini
---

## Purpose
This document is for users seeking troubleshooting guidance and answers to common questions regarding LinkShift's redirect functionality.

## What this doc covers
- **Common questions**: Answers to frequently asked questions about creating short links, matching query parameters, and routing based on device or time.
- **Troubleshooting matrix**: A table outlining symptoms of redirect issues and their likely causes, along with recommended actions.
- **Redirect rules**: Information on how to create and manage redirect rules, including specifics on query matching, device routing, and testing before deployment.

## Key workflows and rules
1. **Creating Short Links**: Use a link map combined with a prefix redirect rule. Refer to the [How-To — short links](./guides/redirect-rules-recipes.md#how-do-i-make-short-links).
2. **Matching Query Parameters**: Set `queryMatch` on the rule to `exact`, `ignore`, or `subset`. See [Redirect rules — query matching](./guides/redirect-rules-core.md#query-matching-querymatch).
3. **Testing Redirects**: Use the `POST /api/v1/redirect-rules/simulate` endpoint to simulate redirects before deployment. Refer to [Redirect rules — simulate](./guides/redirect-rules-operations.md#simulate-before-rollout).
4. **Handling 404 Errors**: If no rule matches, the visitor receives a 404 error. Ensure rules are prioritized correctly to avoid misses.
5. **Using Conditional Destinations**: Implement conditional syntax for routing based on device or time. See [Redirect engine concepts](./concepts/redirect-engine-conditionals.md#conditional-routing-syntax).
6. **A/B Testing**: Use `random(0,100) < N ? … : …` in the destination for A/B testing. Refer to [Redirect rules — recipe book](./guides/redirect-rules-recipes.md#ab-test-landing-page).

## Limits and constraints
- **Redirect Rate Limits**: Organizations are limited to a certain number of redirects per minute. Exceeding this limit results in a 429 error. See [Redirect rules — organization redirect rate limits](./guides/redirect-rules-core.md#organization-redirect-rate-limits-edge-traffic).
- **Simulate Endpoint Limitations**: The `POST /api/v1/redirect-rules/simulate` endpoint checks organization access and may return a 402 error if access is suspended.
- **Query Matching on Wildcards**: Wildcard rules ignore `pathMatch` and `queryMatch` at runtime; only `matchMethod` applies.
- **Analytics Custom Ranges**: Custom date ranges for analytics can be set up to a maximum of 31 days.

## Related docs and API areas
- [Redirect rules — How-To cookbook](./guides/redirect-rules-recipes.md#how-to-cookbook)
- [Redirect rules — simulate](./guides/redirect-rules-operations.md#simulate-before-rollout)
- [Redirect rules — organization redirect rate limits](./guides/redirect-rules-core.md#organization-redirect-rate-limits-edge-traffic)
- [Redirect rules — analytics](./guides/redirect-rules-operations.md#analytics)
- [Redirect rules — blocked rules](./guides/redirect-rules-core.md#blocked-rules-isblocked)
- [Redirect engine concepts — path variables](./concepts/redirect-engine-variables.md#path-variables)
- [Redirect engine concepts — request metadata](./concepts/redirect-engine-variables.md#request-metadata)
- [Redirect engine concepts — planned GeoIP](./concepts/redirect-engine-variables.md#planned-country-routing-geoip-addon)
- [Redirect rules — anti-patterns](./guides/redirect-rules-recipes.md#anti-patterns-common-footguns)
