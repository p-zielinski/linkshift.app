---
source: shared/docs/pages/guides/faq.md
generatedAt: 2026-06-03T16:58:55.275Z
model: gpt-4o-mini
---

## Purpose
This document is for users seeking quick answers to frequently asked questions about LinkShift, covering account management, billing, public tools, dashboard usage, and troubleshooting.

## What this doc covers
- **Where to look**: Guides for account issues, billing, public tools, dashboard UI, quick routing Q&A, how-to recipes, and engine edge cases.
- **Overview FAQ**: Topics including short links, query matching, redirect errors, and a troubleshooting matrix for live traffic.
- **How-To cookbook**: Step-by-step guides with JSON examples for various redirect rules and scenarios.
- **Advanced engineering FAQ**: Detailed behavior of the redirect engine, including loops, query-string handling, and priority tie-breaking.

## Key workflows and rules
1. **Account Management**:
   - Sign-in, email verification, password reset, and legal consent handled in the [Account and access](./account-and-access.md) guide.
   - Accepting team invitations and owner unblocking processes detailed in [Account and access — Accept an invitation](./account-and-access.md#accept-an-invitation).

2. **Billing**:
   - Upgrading plans and accessing the Paddle portal are covered in [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md).

3. **Public Tools**:
   - Usage of QR codes and the redirect trace API is explained in the [Public tools API](./public-tools-api.md).

4. **Dashboard UI**:
   - Sidebar tasks, wizards, and analytics filters are outlined in the [Dashboard overview](./dashboard/dashboard-overview.md).

5. **Redirect Rules**:
   - A/B testing, User-Agent routing, and scheduled launches are detailed in the [Redirect rules — How-To cookbook](./redirect-rules-recipes.md#how-to-cookbook).

6. **Troubleshooting**:
   - The [Overview FAQ](../overview-faq.md) includes a troubleshooting matrix linking symptoms to causes and fixes for live traffic issues.

## Limits and constraints
- Redirect loops are limited to a single hop per request.
- Query-string encoding must handle duplicate keys appropriately.
- Priority tie-breaking is determined by `createdAt` and `id`.
- Syntax limits and quick reference available in the [Quick reference card](../concepts/redirect-engine-edge-cases.md#quick-reference-card).

## Related docs and API areas
- [Account and access](./account-and-access.md) for account-related queries.
- [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md) for billing inquiries.
- [Public tools API](./public-tools-api.md) for public tool usage.
- [Dashboard overview](./dashboard/dashboard-overview.md) for UI navigation.
- [Overview FAQ](../overview-faq.md) for quick routing questions and troubleshooting.
- [Redirect rules guide](./redirect-rules.md) for main routing index.
- [API reference](../reference.md) for endpoints and engine limits.
