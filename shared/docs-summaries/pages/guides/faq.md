---
source: shared/docs/pages/guides/faq.md
generatedAt: 2026-06-08T20:09:44.985Z
model: gpt-4o-mini
---

## Purpose
This document is for users seeking quick answers to frequently asked questions about LinkShift's features and functionalities.

## What this doc covers
- **Where to look**: Guides for account management, billing, public tools, platform status, dashboard UI, quick routing Q&A, how-to recipes, engine edge cases, and visitor privacy.
- **Overview FAQ**: Topics including short links, query matching, platform status, link map issues, and a troubleshooting matrix.
- **How-To cookbook**: Step-by-step guides with JSON examples for various redirect rules and scenarios.
- **Advanced engineering FAQ**: Information on redirect loops, query-string encoding, priority tie-breaks, and syntax limits.

## Key workflows and rules
- **Account Management**: 
  - Sign-in, email verification, password reset, and legal consent are managed through the [Account and access](./account-and-access.md) guide.
  - Accepting team invitations and owner unblocking processes are detailed in [Account and access — Accept an invitation](./account-and-access.md#accept-an-invitation).
  
- **Billing**: 
  - Upgrading plans and accessing the Paddle portal are covered in [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md).
  
- **Redirect Rules**: 
  - Short links and trailing slashes are managed through specific JSON rules.
  - A/B testing can be implemented using the `random()` function.
  - Scheduled launches can be set up using `datetime()`.
  
- **Troubleshooting**: 
  - The [Troubleshooting matrix](../overview-faq.md#troubleshooting-matrix-live-redirects) provides a symptom-to-cause-to-fix mapping for live traffic issues.

## Limits and constraints
- Redirect loops are limited to a single hop per request.
- Query-string encoding must handle duplicate keys appropriately.
- Priority ties are resolved based on `createdAt` timestamps and `id`.
- There are specific syntax limits outlined in the [Quick reference card](../concepts/redirect-engine-edge-cases.md#quick-reference-card).

## Related docs and API areas
- [Overview FAQ](../overview-faq.md) for general questions about LinkShift.
- [Redirect rules guide](./redirect-rules.md) for comprehensive routing information.
- [API reference](../reference.md) for detailed endpoint information and engine limits.
