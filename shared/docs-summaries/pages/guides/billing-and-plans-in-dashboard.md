---
source: shared/docs/pages/guides/billing-and-plans-in-dashboard.md
generatedAt: 2026-06-03T16:57:15.274Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing billing and subscription plans within the LinkShift dashboard, explaining how to view usage, upgrade plans, and manage subscriptions.

## What this doc covers
- Overview of billing actions available in the dashboard.
- Details on where to see usage and limits.
- Steps to upgrade your plan.
- Instructions for managing or canceling subscriptions.
- Qualitative behavior of different plan types.
- Clarification that billing actions are dashboard-only and not available via the Management API.

## Key workflows and rules
### Viewing Usage and Limits
1. Sign in and open the **Dashboard**.
2. Review the following blocks:
   - **Session details**: Displays email, role, and **User ID**.
   - **Organization profile**: Shows organization name and **Organization ID**.
   - **Subscription snapshot**: Includes plan, status, amount/currency, and active dates.
   - **Subscription limits and analytics retention**: Compares usage vs limits for various resources.

### Upgrading Your Plan
1. On the **Dashboard**, click **Upgrade**.
2. In the dialog titled **Change your subscription**, select a plan.
3. Complete the checkout process if billing is enabled.

### Managing or Canceling Subscription
- If on a paid plan:
  - Click **Manage subscription** to access the Paddle customer portal.
  - Click **Cancel subscription** to confirm cancellation through the Paddle portal.

## Limits and constraints
- Billing actions are only available in the dashboard, not through the Management API.
- If the organization exceeds limits or is suspended, a suspension banner appears, and redirects or API calls may fail with `402` or `429` errors.
- The **FREE** plan does not allow for **Manage subscription** or **Cancel subscription** actions, and API calls may return `402 Payment Required`.
- The document advises against relying on it for current pricing; users should check the checkout and portal screens for accurate amounts.

## Related docs and API areas
- [Domains and domain groups](./domains-and-groups.md) — for usage API and routing limits.
- [Getting started](./getting-started.md) — for API key scope and Free plan paywall.
- [Dashboard overview](./dashboard/dashboard-overview.md) — for navigation and onboarding.
- [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) — for seat limits and upgrading to invite more teammates.
- `GET /api/v1/organization/usage` — for programmatic quota checks.
