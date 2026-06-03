---
source: shared/docs/pages/guides/faq.md
generatedAt: 2026-06-03T21:34:53.395Z
model: gpt-4o-mini
---

## Purpose
This document is for users seeking quick answers to frequently asked questions about LinkShift's features and functionalities.

## What this doc covers
- **Where to look**: Guides for account management, billing, public tools, platform status, dashboard UI, quick routing Q&A, how-to recipes, and advanced engineering FAQs.
- **Overview FAQ**: Topics including short links, query matching, platform status, and troubleshooting matrix.
- **How-To cookbook**: Step-by-step guides with JSON examples for various redirect rules and scenarios.
- **Advanced engineering FAQ**: Detailed behaviors of the redirect engine, including redirect loops and query-string encoding.

## Key workflows and rules
- **Troubleshooting matrix**: A symptom → cause → fix approach for live traffic issues.
- **How-To recipes**: 
  - Creating short links and managing trailing slashes.
  - Implementing A/B tests using `random()`.
  - Scheduling launches with `datetime()`.
  - Stripping `www` using `{domain.*}` placeholders.

## Limits and constraints
- Redirect loops are limited to a single hop per request.
- Query-string encoding must handle duplicate keys appropriately.
- Tie-break order for priority is determined by `createdAt` and `id`.
- Specific syntax limits are referenced in the quick reference card.

## Related docs and API areas
- [Account and access](./account-and-access.md)
- [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md)
- [Public tools API](./public-tools-api.md)
- [Platform status](../overview.md#platform-status)
- [Dashboard overview](./dashboard/dashboard-overview.md)
- [Overview FAQ](../overview-faq.md)
- [Redirect rules — How-To cookbook](./redirect-rules-recipes.md#how-to-cookbook)
- [Redirect engine — Advanced engineering FAQ](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq)
- [API reference](../reference.md)
