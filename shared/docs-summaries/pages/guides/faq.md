---
source: shared/docs/pages/guides/faq.md
generatedAt: 2026-06-07T10:06:21.550Z
model: gpt-4o-mini
---

## Purpose
This document is for users seeking quick answers to frequently asked questions about LinkShift's functionalities and troubleshooting.

## What this doc covers
- **Where to look**: Guides for account management, billing, public tools, platform status, dashboard UI, quick routing Q&A, how-to recipes, and engine edge cases.
- **Overview FAQ**: Topics including short links, query matching, platform status, link map issues, and a troubleshooting matrix.
- **How-To cookbook**: Step-by-step guides for implementing redirect rules, including JSON examples for various scenarios.
- **Advanced engineering FAQ**: Information on redirect loops, query-string encoding, priority tie-breaks, and syntax limits.

## Key workflows and rules
1. **Account Management**: 
   - Sign-in, verify email, password reset, and legal consent are handled in the [Account and access](./account-and-access.md) guide.
   - Accepting an invitation to a team is detailed in [Account and access — Accept an invitation](./account-and-access.md#accept-an-invitation).

2. **Billing**: 
   - Upgrading and accessing the Paddle portal is covered in [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md).

3. **Redirect Rules**: 
   - Implementing A/B tests using `random()`, routing based on User-Agent and language, and scheduling launches with `datetime()` are outlined in the [Redirect rules — How-To cookbook](./redirect-rules-recipes.md#how-to-cookbook).

4. **Troubleshooting**: 
   - The [Troubleshooting matrix](../overview-faq.md#troubleshooting-matrix-live-redirects) provides a symptom-to-cause-to-fix approach for live traffic issues.

## Limits and constraints
- Redirect loops are limited to a single hop per request.
- Query-string encoding must handle duplicate keys appropriately.
- Priority tie-breaks are determined by `createdAt` and `id`.
- Specific syntax limits are outlined in the [Quick reference card](../concepts/redirect-engine-edge-cases.md#quick-reference-card).

## Related docs and API areas
- [Docs overview](../overview.md#what-is-linkshiftapp): Provides a platform overview and request flow diagram.
- [Redirect rules guide](./redirect-rules.md): Main routing index for redirect rules.
- [API reference](../reference.md): Contains endpoints and details on [engine limits](../reference.md#engine-limits-at-a-glance).
