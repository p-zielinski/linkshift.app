---
source: shared/docs/pages/guides/billing-and-plans-in-dashboard.md
generatedAt: 2026-06-07T10:04:11.284Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to view plan usage, upgrade plans, manage subscriptions, and access billing features.

## What this doc covers
- Overview of accessing billing and plan features in the dashboard.
- Differences in billing features between Campaign and Advanced views.
- Instructions for viewing usage and limits in both views.
- Steps to upgrade a plan and manage or cancel subscriptions.
- Explanation of plan behaviors, including limitations for Free and Paid plans.
- Clarification that billing actions are dashboard-only and not available via the Management API.

## Key workflows and rules
### Viewing Usage and Limits
1. **Campaign View**: 
   - Navigate to **Settings** (`/settings`) and select **Plan and usage** (`#plan-usage`).
   - View primary limit tiles for Short link hosts, Active links, and Team seats.
   - Expand **Technical limits** for Redirect rules and Link maps meters.

2. **Advanced View**: 
   - Access **Plan and account** (`/settings`) to see compact usage tiles.
   - Open **Dashboard** (`/dashboard`) for a comprehensive subscription snapshot and usage meters.

### Upgrading Your Plan
1. **Campaign View**: 
   - Go to **Settings** → **Plan and billing** → **Upgrade**.
2. **Advanced View**: 
   - Navigate to **Settings** → **Plan and billing** or **Dashboard** → **Upgrade**.
3. Complete the checkout process when billing is enabled.

### Managing or Canceling Subscription
1. **Campaign View**: 
   - Access **Settings** → **Plan and billing** for **Manage subscription** and **Cancel subscription** options.
2. **Advanced View**: 
   - Use **Settings** → **Plan and billing** or **Dashboard** for the same options.
3. Confirm cancellation through the Paddle portal.

## Limits and constraints
- At plan capacity or if the organization is suspended, redirects and API calls may fail, resulting in `402`, `429` errors, or blocked actions until the plan is upgraded or usage is reduced.
- The **FREE** plan does not allow **Manage subscription** or **Cancel subscription** actions, and API calls may return `402 Payment Required`.
- Engine-level caps for domain limits are detailed in the [Domains and domain groups](./domains-and-groups.md) documentation.

## Related docs and API areas
- [Settings in the dashboard](./dashboard/settings-in-dashboard.md) — for plan usage and billing management.
- [Dashboard overview](./dashboard/dashboard-overview.md) — for navigation and mode switching.
- [Domains and domain groups](./domains-and-groups.md) — for usage API and routing limits.
- [Getting started](./getting-started.md) — for API key scope and Free plan paywall information.
- [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) — for seat limits and upgrade options.
