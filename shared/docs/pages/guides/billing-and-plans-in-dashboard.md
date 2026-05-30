# Billing and plans in the dashboard

View plan usage, upgrade, open the Paddle customer portal, or cancel subscription from the home dashboard.

## Before you start

- Sign in and open **Dashboard** (`/dashboard`).
- Billing actions are **dashboard-only**. They are not in the Management API OpenAPI (`linkshift-api-keys`).
- Usage quotas also appear in `GET /api/v1/organization/usage` where documented — see [Domains and domain groups — usage](./domains-and-groups.md#get-usage-summary).

## Where to see usage and limits

On **Dashboard** (*Operational overview for the active organization.*):

| Block | What it shows |
|-------|----------------|
| Session details | Email, role (Owner / Member), **User ID** (copy when truncated) |
| Organization profile | Name, **Organization ID** (copy when truncated) |
| Subscription snapshot | Plan, status, amount/currency, interval, active from/until |
| Subscription limits and analytics retention | Usage vs limits per resource — domain groups, domains, rules, link maps, tests, seats, API rates, retention days |

When a meter is at capacity, the card may show **Limit reached** and **Upgrade plan to increase this limit.**

If the organization is over limits or suspended, a suspension banner appears at the top of the page.

Engine-level caps (for example per-group domain limits) are described in [Domains and domain groups](./domains-and-groups.md) — the dashboard meters reflect your organization's plan assignment.

## Upgrade your plan

1. On `/dashboard`, select **Upgrade**.
2. The dialog title is **Change your subscription**.
3. Choose a plan and complete checkout when billing is enabled for your organization.

**Upgrade** is hidden when your plan is **UNMETERED** (no subscription change through this dialog).

After checkout, a status dialog may open from the Paddle flow (not a separate dashboard button).

## Manage or cancel subscription

When your plan is not **FREE**:

| Action | What happens |
|--------|----------------|
| **Manage subscription** | Opens the Paddle customer portal (payment method, invoices, and related billing tasks) |
| **Cancel subscription** | Confirm dialog titled **Cancel subscription** — then continues through the Paddle portal flow |

**Manage subscription** and **Cancel subscription** are not shown on the **FREE** plan.

## Plan behavior (qualitative)

| Plan | Typical dashboard behavior |
|------|----------------------------|
| **FREE** | Usage meters and limits apply; no **Manage subscription** or **Cancel subscription**; API calls may return `402 Payment Required` on the Free paywall — see [Getting started](./getting-started.md#free-plan-paywall) |
| Paid plans | **Upgrade**, **Manage subscription**, and **Cancel subscription** follow Paddle setup; exact prices and tiers depend on your checkout configuration |
| **UNMETERED** | **Upgrade** is not offered; limits use unmetered caps in the UI |

Do not rely on this page for dollar amounts or SKU lists — use the checkout and portal screens for current pricing.

## No Management API for billing

Subscription changes, Paddle portal access, and cancellation are not exposed as Management API endpoints in `linkshift-api-keys.openapi.yaml`.

For automation, use:

- `GET /api/v1/organization/usage` — current usage vs plan limits (documented in [Domains and domain groups](./domains-and-groups.md#get-usage-summary))
- Dashboard **Dashboard** page for human billing actions

## Related

- [Dashboard overview](./dashboard/dashboard-overview.md) — shell navigation and first-run onboarding
- [Domains and domain groups](./domains-and-groups.md) — usage API and routing limits
- [Getting started](./getting-started.md) — API key scope and Free plan paywall
- [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) — seat limits and **Upgrade to invite more teammates**
