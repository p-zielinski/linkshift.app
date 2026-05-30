# FAQ and troubleshooting — index

Use this page to find answers fast. Content lives in three focused guides so details stay accurate and linkable.

---

## Where to look

| Need | Guide |
|------|--------|
| **Account** (sign-in, verify email, password reset, invites, legal consent) | [Account and access](./account-and-access.md) |
| **Invited to a team?** (accept invite, verify email, owner unblock) | [Account and access — Accept an invitation](./account-and-access.md#accept-an-invitation) |
| **Billing** (upgrade, Paddle portal, usage meters) | [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md) |
| **Public tools** (QR, redirect trace API) | [Public tools API](./public-tools-api.md) |
| **Dashboard UI** (sidebar tasks, wizards, **Run tests**, analytics filters) | [Dashboard overview](./dashboard/dashboard-overview.md) and task guides under [Overview — Dashboard map](../overview.md#dashboard-authenticated-app) |
| **Quick routing Q&A** (short links, query match, 403/429/503, simulate, blocked rules) | [Overview FAQ](../overview-faq.md) |
| **How-To recipes** (A/B tests, User-Agent, regex migration, anti-patterns) | [Redirect rules — recipes](./redirect-rules-recipes.md#how-to-cookbook) |
| **Engine edge cases** (loops, encoding, priority ties, empty ternaries) | [Redirect engine — Advanced engineering FAQ](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) |

---

## Overview FAQ (start here)

[Overview FAQ](../overview-faq.md) covers:

- Short links, `queryMatch`, fragments, device/time routing  
- Link map misses, `isBlocked`, blacklist **403** / **503**, redirect **429**  
- Simulate **402** / **400**, unregistered subdomains, `/campaign/i` regex footgun  
- **[Troubleshooting matrix](../overview-faq.md#troubleshooting-matrix-live-redirects)** — symptom → cause → fix for live traffic  

---

## How-To cookbook

[Redirect rules — How-To cookbook](./redirect-rules-recipes.md#how-to-cookbook) — step-by-step answers with JSON examples:

- Short links, trailing slash on `source`, GET-only rules  
- A/B tests with `random()`, User-Agent and language routing  
- Scheduled launches with `datetime()`, blog migration with regex  
- Stripping `www` with `{domain.*}` placeholders  

Full recipes and anti-patterns: [Recipe book](./redirect-rules-recipes.md#recipe-book--common-scenarios).

---

## Advanced engineering FAQ

[Redirect engine — Advanced engineering FAQ](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) — behavior verified against `redirect.service.ts` and tests:

- Redirect loops (single hop per request)  
- Query-string encoding and duplicate keys  
- Priority / `createdAt` / `id` tie-break order  
- Same-host re-entry and empty ternary branches  

Syntax limits and quick reference: [Quick reference card](../concepts/redirect-engine-edge-cases.md#quick-reference-card).

---

## Related

- [What is LinkShift.app?](../intro/what-is-linkshift.md) — platform overview and request flow diagram  
- [Redirect rules guide](./redirect-rules.md) — main routing index  
- [API reference](../reference.md) — endpoints and [engine limits](../reference.md#engine-limits-at-a-glance)  
