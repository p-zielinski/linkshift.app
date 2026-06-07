# Billing and plans in the dashboard

View plan usage, upgrade, open the Paddle customer portal, or cancel subscription from the dashboard. Where those controls live depends on whether you use **Campaign** or **Advanced** view — see [Dashboard overview — Campaign and Advanced views](./dashboard/dashboard-overview.md#campaign-and-advanced-views).

Sign in to the web app. Billing actions are dashboard-only (not in the Management API). Usage quotas also appear in `GET /api/v1/organization/usage` — see [Domains and domain groups — usage](./domains-and-groups.md#get-usage-summary).

## Where to see usage and limits

### Campaign view

Open **Settings** in the sidebar, then the **Plan and usage** section (`#plan-usage`). You see compact limit tiles for domains, rules, active users, and link maps.

**Upgrade** and **Manage subscription** are on **Settings** → **Plan and billing** in Campaign view. **Cancel subscription** is on **Dashboard** in Advanced view only (or switch views from **Settings** → **Switch to advanced view**).

### Advanced view

Open **Dashboard** in the sidebar (`/dashboard`, *Operational overview for the active organization.*):

| Block | What it shows |
|-------|----------------|
| Session details | Email, role (Owner / Member), **User ID** (copy when truncated) |
| Organization profile | Name, **Organization ID** (copy when truncated) |
| Subscription snapshot | Plan, status, amount/currency, interval, active from/until |
| Subscription limits and analytics retention | Usage vs limits per resource — domain groups, domains, rules, link maps, tests, seats, API rates, retention days |

When a meter is at capacity, the card may show **Limit reached** and **Upgrade plan to increase this limit.**

:::warning
At plan capacity or when the organization is suspended, redirects and API calls may fail (`402`, `429`, or blocked sidebar actions) until you upgrade or reduce usage. Fix billing on **Dashboard** (Advanced) before high-traffic launches.
:::

If the organization is over limits or suspended, a suspension banner appears at the top of the page.

Engine-level caps (for example per-group domain limits) are described in [Domains and domain groups](./domains-and-groups.md) — the dashboard meters reflect your organization's plan assignment.

## Upgrade your plan

1. Switch to **Advanced** view if you are in **Campaign** view (**Switch to advanced** in the sidebar, or **Settings** → **Switch to advanced view**).
2. On **Dashboard**, select **Upgrade**.
3. The dialog title is **Change your subscription**.
4. Choose a plan and complete checkout when billing is enabled for your organization.

If you do not see **Upgrade**, your organization may already be on a plan that does not use self-serve checkout through this dialog. Use **Manage subscription** when it is available, or contact support for billing questions.

After checkout, a status dialog may open from the Paddle flow (not a separate dashboard button).

## Manage or cancel subscription

When your plan is not **FREE** (from **Dashboard** in Advanced view):

| Action | What happens |
|--------|----------------|
| **Manage subscription** | Opens the Paddle customer portal (payment method, invoices, and related billing tasks) |
| **Cancel subscription** | Confirm dialog titled **Cancel subscription** — then continues through the Paddle portal flow |

**Manage subscription** and **Cancel subscription** are not shown on the **FREE** plan.

## Plan behavior (qualitative)

- **Free** — usage meters apply; no **Manage subscription** or **Cancel subscription**; API calls may return `402 Payment Required` ([Getting started — Free plan paywall](./getting-started.md#free-plan-paywall))
- **Paid plans** — **Upgrade**, **Manage subscription**, and **Cancel subscription** follow Paddle setup; exact prices depend on checkout configuration

Do not rely on this page for dollar amounts or SKU lists — use the checkout and portal screens for current pricing.

:::hidden-on-purpose
Internal plan tiers (not for public docs or Ask docs):

- **UNMETERED** — **Upgrade** is not offered; limits use unmetered caps in the UI

Plan behavior table (qualitative): FREE → usage meters, no Manage/Cancel subscription, API 402 paywall; Paid → Upgrade/Manage/Cancel via Paddle; UNMETERED → no Upgrade, unmetered caps in UI.
:::

## No Management API for billing

:::info
Subscription changes, Paddle portal access, and cancellation are **dashboard-only** — they are not in `linkshift-api-keys.openapi.yaml`. Use `GET /api/v1/organization/usage` for programmatic quota checks.
:::

Subscription changes, Paddle portal access, and cancellation are not exposed as Management API endpoints in `linkshift-api-keys.openapi.yaml`.

For automation, use:

- `GET /api/v1/organization/usage` — current usage vs plan limits (documented in [Domains and domain groups](./domains-and-groups.md#get-usage-summary))
- **Dashboard** (Advanced) or **Settings** → **Plan and usage** (Campaign) for human billing and limit review

## Related

- [Dashboard overview](./dashboard/dashboard-overview.md) — shell navigation, mode switching, and first-run onboarding
- [Domains and domain groups](./domains-and-groups.md) — usage API and routing limits
- [Getting started](./getting-started.md) — API key scope and Free plan paywall
- [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) — seat limits and **Upgrade to invite more teammates**
