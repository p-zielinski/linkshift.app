---
source: shared/docs/pages/guides/faq.md
generatedAt: 2026-05-30T07:01:18.383Z
model: gpt-4o-mini
---

## Purpose
This document is for users seeking quick answers to frequently asked questions about LinkShift, covering various aspects of account management, billing, public tools, and troubleshooting.

## What this doc covers
- **Where to look**: Guides for account management, billing, public tools, dashboard UI, quick routing Q&A, how-to recipes, and advanced engineering FAQs.
- **Overview FAQ**: Topics include short links, `queryMatch`, device/time routing, link map misses, and a troubleshooting matrix for live traffic.
- **How-To cookbook**: Step-by-step guides for creating short links, A/B tests, scheduled launches, and stripping `www` from URLs.
- **Advanced engineering FAQ**: Covers redirect loops, query-string encoding, priority tie-breaks, and same-host re-entry issues.

## Key workflows and rules
- **Account Management**: 
  - Sign-in, email verification, password reset, and legal consent are managed through the [Account and access](./account-and-access.md) guide.
  - Accepting an invitation to a team is detailed in [Account and access — Accept an invitation](./account-and-access.md#accept-an-invitation).
  
- **Billing**: 
  - Upgrading plans and accessing the Paddle portal are covered in [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md).
  
- **Public Tools**: 
  - Usage of QR codes and redirect trace API is detailed in the [Public tools API](./public-tools-api.md).
  
- **Troubleshooting**: 
  - The [Overview FAQ](../overview-faq.md) includes a troubleshooting matrix linking symptoms to causes and fixes for live traffic issues.

- **Redirect Rules**: 
  - The [Redirect rules — How-To cookbook](./redirect-rules-recipes.md#how-to-cookbook) provides JSON examples for creating various rules, including A/B tests and scheduled launches.

## Limits and constraints
- **Redirect Engine**: 
  - Redirect loops are limited to a single hop per request.
  - Query-string encoding must handle duplicate keys appropriately.
  - Priority is determined by `createdAt` and `id` in case of ties.
  
- **Syntax Limits**: 
  - Refer to the [Quick reference card](../concepts/redirect-engine-edge-cases.md#quick-reference-card) for syntax limits and quick reference.

## Related docs and API areas
- [What is LinkShift.app?](../intro/what-is-linkshift.md) — Overview of the platform and request flow.
- [Redirect rules guide](./redirect-rules.md) — Main index for routing rules.
- [API reference](../reference.md) — Detailed endpoints and engine limits, including [engine limits at a glance](../reference.md#engine-limits-at-a-glance).
