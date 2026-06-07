---
source: shared/docs/pages/overview-faq.md
generatedAt: 2026-06-07T10:08:10.258Z
model: gpt-4o-mini
---

## Purpose
This document is intended for users seeking troubleshooting guidance and answers to common questions regarding LinkShift's redirect functionalities.

## What this doc covers
- **Common questions**: Answers to frequently asked questions about creating short links, matching query parameters, and routing based on device or time.
- **Troubleshooting matrix**: A table outlining symptoms of redirect issues and their likely causes, along with recommended actions.
- **Redirect rules**: Information on how to create and manage redirect rules, including specifics on query matching, device routing, and testing.
- **Platform status**: Guidance on checking the current status of the LinkShift platform.

## Key workflows and rules
1. **Creating Short Links**: Use a link map combined with a prefix redirect rule.
2. **Matching Query Parameters**: Set the `queryMatch` field on the rule to `exact`, `ignore`, or `subset`.
3. **Testing Before Deploy**: Use the `POST /api/v1/redirect-rules/simulate` endpoint to simulate redirects.
4. **Handling No Matching Rules**: If no rule matches, the visitor receives a 404 error.
5. **Redirect Based on Device or Time**: Implement conditional destination syntax in the redirect rules.
6. **A/B Testing**: Use `random(0,100) < N ? … : …` in the destination field for A/B testing.
7. **Bulk Path Migration**: Use regex in the `source` field and `$1` in the `destination` field for migrating paths.

## Limits and constraints
- **Redirect Rate Limit**: Organizations are subject to a redirect rate limit of `redirectionLimitPerMinute`. Exceeding this limit results in a 429 error.
- **Simulate Endpoint Access**: The `POST /api/v1/redirect-rules/simulate` endpoint checks organization access; if suspended, it returns a 402 error.
- **Analytics Custom Ranges**: Custom date ranges for analytics can span up to 31 days.
- **Link Map Entries**: Cannot use `{placeholders}` or A/B logic; entries must be static URLs.
- **Query Matching on Wildcards**: Wildcard rules ignore `pathMatch` and `queryMatch` at runtime.

## Related docs and API areas
- [Redirect rules — How-To cookbook](./guides/redirect-rules-recipes.md#how-to-cookbook)
- [Redirect rules — query matching](./guides/redirect-rules-core.md#query-matching-querymatch)
- [Redirect rules — simulate](./guides/redirect-rules-operations.md#simulate-before-rollout)
- [Redirect rules — organization redirect rate limits](./guides/redirect-rules-core.md#organization-redirect-rate-limits-edge-traffic)
- [Redirect rules — propagation and caching](./guides/redirect-rules-core.md#propagation-and-caching)
- [Redirect rules — blocked rules](./guides/redirect-rules-core.md#blocked-rules-isblocked)
- [Redirect engine concepts — path variables](./concepts/redirect-engine-variables.md#path-variables)
- [Redirect engine concepts — request metadata](./concepts/redirect-engine-variables.md#request-metadata)
- [Redirect engine concepts — planned GeoIP](./concepts/redirect-engine-variables.md#planned-country-routing-geoip-addon)
- [Redirect rules — anti-patterns](./guides/redirect-rules-recipes.md#anti-patterns-common-footguns)
- [Redirect rules — simulate vs live](./guides/redirect-rules-operations.md#simulate-vs-live-redirect)
