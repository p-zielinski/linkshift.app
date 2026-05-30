# Getting started

This guide explains how to use LinkShift programmatically with organization API keys.

---

## Authentication

Send your API key with this header:

```http
X-API-Key: <your_api_key>
```

User sign-in, registration, email verification, password reset, and team invite acceptance are **web app flows** (`/auth`, `/invite`, and related routes). They are not part of the Management API. See [Account and access](./account-and-access.md).

Subscription changes, Paddle portal access, and cancellation are also **dashboard-only** — see [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md). QR and redirect trace use the separate [Public tools API](./public-tools-api.md), not `X-API-Key`.

### Create an API key

API keys are created in the dashboard, not via the Management API. One-time setup (~2 minutes); the rest of the checklist stays in API docs below.

1. Sign in and open the dashboard.
2. Sidebar **Organization** → **Manage API keys** (`/organization/api-keys`).
3. Select **Create API key**.
4. In the dialog (**Create API key**), set **Key name**, and optionally **Never expires** or **Expires at**.
5. After save, copy the secret from the one-time reveal dialog — it may not appear again.

Optional detail: [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md#create-a-key).

**OpenAPI contract:** browse operations at [API reference](../reference.md) and `/docs/api/:operationId`, or use **Download OpenAPI spec** on the API keys page.

---

## API automation checklist

Use this sequence when you automate routing with the Management API. API keys are created in the dashboard only; steps 2–5 use the Management API.

1. Create an API key in the dashboard (same steps as [Create an API key](#create-an-api-key) above): **Organization** → **Manage API keys** → **Create API key** → copy the one-time secret
2. `POST /api/v1/domain-groups` — [Domains and domain groups — Domain groups](./domains-and-groups.md#domain-groups)
3. `POST /api/v1/subdomains` or `POST /api/v1/domains` — [Domains](./domains-and-groups.md#domains) or [LinkShift subdomains](./domains-and-groups.md#linkshift-subdomains)
4. `POST /api/v1/redirect-rules` — [Redirect rules — matching and destinations](./redirect-rules-core.md#rule-fields)
5. `POST /api/v1/redirect-rules/simulate` — [Redirect rules — simulate before rollout](./redirect-rules-operations.md#simulate-before-rollout)

---

## API key scope and plan behavior

- API keys are scoped to an **organization**, not a single user.
- API keys can manage redirect resources: domains, domain groups, redirect rules, link maps, link map entries, redirect tests.
- API keys **cannot** access:
  - `/api/v1/api-keys` (key lifecycle is dashboard-only)
  - User-centric auth endpoints
  - Billing and member-management endpoints

### Free plan paywall

- Free organizations can create API keys in the dashboard.
- Any API-key-authenticated call on Free plan returns `402 Payment Required`.

### Per-key rate limits

Management API calls are rate-limited **per API key** according to your organization’s plan. When exceeded, the API returns **`429 Too Many Requests`**.

| Plan | Behavior |
|------|----------|
| Free | Blocked by paywall (`402`) |
| Paid | Plan-based per-key limit — see `GET /api/v1/organization/usage` and your subscription limits |

Exact thresholds can change with plan tier; do not hard-code them in integrations — handle `429` with backoff.

This is separate from **redirect runtime rate limiting** on public redirect traffic (organization-level limits on the edge). Simulate and redirect-test fixtures do not consume redirect rate limits.

### Redirect rate limits (edge traffic)

Applied to **live redirect requests** (visitors hitting your domains or LinkShift subdomains), not to Management API calls.

| Topic | Detail |
|-------|--------|
| Limit field | Plan `redirectionLimitPerMinute` (per organization) |
| Bucket | UTC calendar minute |
| On exceed | **`429 Too Many Requests`** — `Organization rate limit exceeded`; no redirect |
| When checked | Before `robots.txt` and before redirect rules |
| Not counted | `POST /api/v1/redirect-rules/simulate`, redirect test fixtures, API key CRUD |
| Simulate vs live | Simulate skips this limit but still runs `checkRedirectionAccess` (can return **`402`**) |

See [Redirect rules — organization redirect rate limits](./redirect-rules-core.md#organization-redirect-rate-limits-edge-traffic) and [propagation and caching](./redirect-rules-core.md#propagation-and-caching).

---

## Routing documentation — start here

LinkShift routing is more than CRUD endpoints. Read these in order:

1. **[What is LinkShift.app?](../intro/what-is-linkshift.md)** — platform overview and rules engine
2. **[Redirect rules](./redirect-rules.md)** — matching, destinations, priorities, link map integration, recipes
3. **[Redirect engine concepts](../concepts/redirect-engine-concepts.md)** — placeholders, modifiers, conditional logic
4. **[Link maps](./link-maps.md)** — short links at scale
5. **[Link map entries](./link-map-entries.md)** — bulk import and key format
6. **[Redirect tests](./redirect-tests.md)** — CI regression fixtures for routing (`/api/v1/redirect-tests` + simulate)

> **Not the same doc:** Internal API key rate-limit and paywall test plans are not published here. Use the [redirect tests guide](./redirect-tests.md) for routing CI and regression fixtures.

Infrastructure and topology:

- **[Domains and domain groups](./domains-and-groups.md)** — where rules attach

Concept deep dives:

- **[Link map concepts](../concepts/link-map-concepts.md)** — normalization, cache, resolution

Limits cheat sheet (simulate batch size, analytics window, nesting depth): **[API reference — engine limits](../reference.md#engine-limits-at-a-glance)**.

Routing decision index (plain path vs regex vs link map vs wildcard): **[API reference — routing decision index](../reference.md#routing-decision-index)**.

When redirects fail in production (404, 403, 429, blocked rules): **[FAQ and troubleshooting](./faq.md)** → [troubleshooting matrix](../overview-faq.md#troubleshooting-matrix-live-redirects) and [Redirect rules — blocked rules](./redirect-rules-core.md#blocked-rules-isblocked) (`isBlocked`, ongoing safety monitoring).

---

## API surface

| Area | Base path | Guide |
|------|-----------|-------|
| Domain groups | `/api/v1/domain-groups` | [Domains and groups](./domains-and-groups.md) |
| Domains | `/api/v1/domains` | [Domains and groups](./domains-and-groups.md) |
| Subdomains | `/api/v1/subdomains` | [Domains and groups](./domains-and-groups.md) |
| Redirect rules | `/api/v1/redirect-rules` | [Redirect rules](./redirect-rules.md) |
| Link maps | `/api/v1/link-maps` | [Link maps](./link-maps.md) |
| Link map entries | `/api/v1/link-map-entries` | [Link map entries](./link-map-entries.md) |
| Redirect tests | `/api/v1/redirect-tests` | [Redirect tests](./redirect-tests.md) |
| Organization | `/api/v1/organization` | [Domains and groups](./domains-and-groups.md) |

Interactive endpoint docs: [API reference](../reference.md) and `/docs/api/:operationId` pages.

---

## Error model

Error payloads include:

| Field | Description |
|-------|-------------|
| `code` | HTTP-like numeric code |
| `key` | Machine-readable key (e.g. `payment_required`) |
| `message` | Short message |
| `details` | Human-readable explanation |
| `requestId` | Correlation ID |

Common status codes:

| Code | Meaning |
|------|---------|
| `401` | Invalid or missing API key |
| `402` | Free plan or subscription restriction |
| `404` | Resource not found or out of scope |
| `409` | Conflict (e.g. duplicate domain) |
| `429` | Per-key rate limit exceeded |
| `400` | Validation error — check `errors.details` for rule validation |

Rule validation errors often include an array of specific messages (unknown placeholder, invalid regex, link map constraint violation).

---

## Quick API example

```bash
# List redirect rules in a domain group
curl -s -H "X-API-Key: $KEY" \
  "$BASE/api/v1/redirect-rules?domainGroupId=dmg_prod&limit=20"

# Simulate a request
curl -s -X POST -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"entries":[{"domainGroupId":"dmg_prod","path":"/go/summer"}]}' \
  "$BASE/api/v1/redirect-rules/simulate"
```

See [Redirect rules guide](./redirect-rules.md) for full routing examples.
