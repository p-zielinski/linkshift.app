---
source: shared/docs/pages/overview-faq.md
generatedAt: 2026-06-03T17:00:41.183Z
model: gpt-4o-mini
---

## Purpose
This document is intended for users of LinkShift who need quick answers to common troubleshooting questions regarding redirect rules and their configurations.

## What this doc covers
- **Common questions**: Answers to frequently asked questions about creating short links, matching query parameters, and more.
- **Troubleshooting matrix**: A table summarizing symptoms of redirect issues and their likely causes along with recommended actions.

## Key workflows and rules
1. **Creating Short Links**: Use a link map combined with a prefix redirect rule.
2. **Matching Query Parameters**: Set `queryMatch` on the rule to `exact`, `ignore`, or `subset`.
3. **Redirecting Based on Device or Time**: Utilize conditional destination syntax.
4. **Testing Before Deploy**: Use the `POST /api/v1/redirect-rules/simulate` endpoint in the Management API.
5. **Handling No Matching Rules**: If no rule matches, a 404 error is returned.
6. **Understanding "First Matching Rule"**: The first rule that returns a redirect target is applied, regardless of other matches.
7. **Blocked Rules**: Rules can be blocked due to unsafe URLs or validation failures.
8. **Simulating Redirects**: Use the simulate feature to test redirects before they go live.

## Limits and constraints
- **Redirect Rate Limit**: Organizations are limited to a certain number of redirects per minute (`redirectionLimitPerMinute`).
- **Analytics Custom Ranges**: Can be set for up to 31 days.
- **HTTP Methods**: Redirects can support all seven HTTP methods if `matchMethod` is set to `[]`. If restricted to `["GET"]`, other methods will not be processed.
- **Link Map Entries**: Cannot use `{placeholders}` or A/B logic; destinations must be static URLs.
- **Simulate Endpoint**: Returns a 402 error if the organization is suspended or if there are billing issues.

## Related docs and API areas
- **Redirect rules — How-To cookbook**: [Redirect rules — How-To cookbook](./guides/redirect-rules-recipes.md#how-to-cookbook)
- **Redirect rules — query matching**: [Redirect rules — query matching](./guides/redirect-rules-core.md#query-matching-querymatch)
- **Redirect rules — simulate**: [Redirect rules — simulate](./guides/redirect-rules-operations.md#simulate-before-rollout)
- **Redirect rules — organization redirect rate limits**: [Redirect rules — organization redirect rate limits](./guides/redirect-rules-core.md#organization-redirect-rate-limits-edge-traffic)
- **Redirect rules — propagation and caching**: [Redirect rules — propagation and caching](./guides/redirect-rules-core.md#propagation-and-caching)
- **Redirect engine concepts**: [Redirect engine concepts](./concepts/redirect-engine-variables.md#request-metadata)
