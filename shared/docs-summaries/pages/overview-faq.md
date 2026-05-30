---
source: shared/docs/pages/overview-faq.md
generatedAt: 2026-05-30T07:03:37.201Z
model: gpt-4o-mini
---

## Purpose
This document is for users seeking quick answers to common questions and troubleshooting related to LinkShift's redirect rules and functionalities.

## What this doc covers
- Common questions about creating short links, matching query parameters, and routing based on device or time.
- Details on testing redirects before deployment using the `POST /api/v1/redirect-rules/simulate` endpoint.
- Information on tracing URLs and generating QR codes through dashboard tools and public API endpoints.
- Explanation of behaviors when no rules match, including 404 responses and the concept of the "first matching rule."
- Insights into why certain rules may be blocked and how to resolve issues related to unsafe URLs.
- Clarifications on routing capabilities, including limitations on cookies and URL fragments.
- Troubleshooting matrix for live redirects, detailing symptoms, likely causes, and recommended actions.

## Key workflows and rules
1. **Creating Short Links**: Use a link map combined with a prefix redirect rule.
2. **Matching Query Parameters**: Set `queryMatch` to `exact`, `ignore`, or `subset` on the redirect rule.
3. **Testing Redirects**: Use `POST /api/v1/redirect-rules/simulate` to simulate redirects before deployment.
4. **Handling 404 Responses**: If no rule matches, the visitor receives a 404 error. Ensure fallback destinations or lower-priority rules are set.
5. **Blocked Rules**: If a rule is blocked (`isBlocked: true`), it may be due to unsafe URLs. Fix the URLs and perform a successful `PUT` to unblock.
6. **Routing on Cookies**: Currently not supported; use `{accept-language}` for browser language routing.
7. **Simulating Redirects**: Simulate requests may return 402 if the organization is suspended or if there are plan limits.

## Limits and constraints
- **Rate Limit**: Organizations are limited to `redirectionLimitPerMinute` for redirects.
- **Simulate Requests**: Simulations do not count against the rate limit.
- **Analytics Custom Ranges**: Custom ranges can be set for up to 31 days.
- **Cache Invalidation**: Changes to rules typically go live immediately after a successful API write, but stale routing may persist for up to 5 minutes if cache invalidation fails.
- **HTTP Methods**: Redirects support all HTTP methods, but specific rules can restrict methods using `matchMethod`.

## Related docs and API areas
- [How-To — short links](./guides/redirect-rules-recipes.md#how-do-i-make-short-links)
- [Redirect rules — simulate](./guides/redirect-rules-operations.md#simulate-before-rollout)
- [Public tools API](./guides/public-tools-api.md)
- [Redirect rules — blocked rules](./guides/redirect-rules-core.md#blocked-rules-isblocked)
- [Redirect rules — propagation and caching](./guides/redirect-rules-core.md#propagation-and-caching)
- [Redirect rules — anti-patterns](./guides/redirect-rules-recipes.md#anti-patterns-common-footguns)
- [Redirect rules — simulate vs live](./guides/redirect-rules-operations.md#simulate-vs-live-redirect)
