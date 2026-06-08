---
source: shared/docs/pages/overview-faq.md
generatedAt: 2026-06-08T20:11:57.212Z
model: gpt-4o-mini
---

## Purpose
This document is for users seeking troubleshooting guidance and answers to common questions regarding LinkShift's redirect functionalities.

## What this doc covers
- **Common questions**: Answers to frequently asked questions about creating short links, matching query parameters, and more.
- **Troubleshooting matrix**: A table outlining symptoms, likely causes, and recommended actions for live redirects.

## Key workflows and rules
1. **Creating Short Links**: Use a link map combined with a prefix redirect rule.
2. **Matching Query Parameters**: Set `queryMatch` on the rule to values like `exact`, `ignore`, or `subset`.
3. **Redirect Testing**: Use the `POST /api/v1/redirect-rules/simulate` endpoint to test redirects before deployment.
4. **Handling No Matches**: If no rule matches, the visitor receives a 404 error.
5. **First Matching Rule**: The first rule that returns a redirect target is the one that is executed.
6. **Routing Based on Device or Time**: Use conditional destination syntax.
7. **Handling 404 Errors**: Check for catch-all rules or lower-priority rules if a 404 occurs after a prefix match.
8. **Simulating Redirects**: Ensure that the `hostname` and `domainGroupId` are valid to avoid errors during simulation.

## Limits and constraints
- **Redirect Rate Limit**: Organizations can exceed a redirect rate limit of **1 per minute**, leading to a 429 error.
- **Analytics Custom Ranges**: Custom date ranges for analytics can be up to **31 days**.
- **Simulate Endpoint**: The `POST /api/v1/redirect-rules/simulate` endpoint checks organization access, and suspended organizations will receive a 402 error.
- **Link Map Rules**: Cannot use `{placeholders}` or A/B logic; destinations must be static URLs.
- **Query Matching on Wildcards**: Wildcard rules ignore `pathMatch` and `queryMatch` at runtime.

## Related docs and API areas
- **Redirect Rules — How-To Cookbook**: [Redirect rules — How-To cookbook](./guides/redirect-rules-recipes.md#how-to-cookbook)
- **Redirect Rules — Simulate**: [Redirect rules — simulate](./guides/redirect-rules-operations.md#simulate-before-rollout)
- **Redirect Rules — Blocked Rules**: [Redirect rules — blocked rules](./guides/redirect-rules-core.md#blocked-rules-isblocked)
- **Redirect Rules — Organization Redirect Rate Limits**: [Redirect rules — organization redirect rate limits](./guides/redirect-rules-core.md#organization-redirect-rate-limits-edge-traffic)
- **Redirect Rules — Propagation and Caching**: [Redirect rules — propagation and caching](./guides/redirect-rules-core.md#propagation-and-caching)
- **Redirect Rules — Anti-Patterns**: [Redirect rules — anti-patterns](./guides/redirect-rules-recipes.md#anti-patterns-common-footguns)
- **Redirect Engine Concepts**: [Redirect engine concepts](./concepts/redirect-engine-conditionals.md#conditional-routing-syntax)
