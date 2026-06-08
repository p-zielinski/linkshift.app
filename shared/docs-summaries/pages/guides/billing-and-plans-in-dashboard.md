---
source: shared/docs/pages/guides/billing-and-plans-in-dashboard.md
generatedAt: 2026-06-08T20:07:22.201Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to view plan usage, upgrade plans, access the Paddle customer portal, and cancel subscriptions.

## What this doc covers
- Overview of billing actions in the dashboard.
- Instructions for viewing usage and limits in both Campaign and Advanced views.
- Steps to upgrade plans in both views.
- Managing or canceling subscriptions for paid plans.
- Qualitative behavior of different plan types (Free and Paid).
- Clarification that billing actions are dashboard-only and not available via the Management API.

## Key workflows and rules
1. **Viewing Usage and Limits**:
   - **Campaign View**: Navigate to **Settings** (`/settings`) → **Plan and usage** (`#plan-usage`).
   - **Advanced View**: Go to **Settings** (`/settings`) → **Plan and account** or **Dashboard** (`/dashboard`).
   - Check primary limit tiles for short link hosts, active links, and team seats.
   - Expand **Technical limits** for additional metrics.

2. **Upgrading Your Plan**:
   - **Campaign View**: Go to **Settings** → **Plan and billing** → **Upgrade**.
   - **Advanced View**: Go to **Settings** → **Plan and billing** or **Dashboard** → **Upgrade**.
   - Complete checkout in the dialog titled **Change your subscription**.

3. **Managing or Canceling Subscription**:
   - **Campaign View**: Navigate to **Settings** → **Plan and billing** → **Manage subscription** or **Cancel subscription**.
   - **Advanced View**: Same options available in **Settings** or **Dashboard**.
   - Confirm cancellation in the dialog titled **Cancel subscription**.

## Limits and constraints
- **Usage Quotas**: Limits on short link hosts, active links, and team seats are displayed in the dashboard.
- **Plan Capacity**: At capacity or if the organization is suspended, redirects and API calls may fail with errors `402` or `429`.
- **Free Plan Restrictions**: Users on the Free plan cannot access **Manage subscription** or **Cancel subscription** options, and may encounter `402 Payment Required` errors for API calls.
- **Paddle Portal Access**: Subscription changes and cancellation are only available through the dashboard, not via the Management API.

## Related docs and API areas
- [Settings in the dashboard](./dashboard/settings-in-dashboard.md) - for plan usage and billing details.
- [Dashboard overview](./dashboard/dashboard-overview.md) - for navigation and mode switching.
- [Domains and domain groups](./domains-and-groups.md) - for usage API and routing limits.
- [Getting started](./getting-started.md) - for API key scope and Free plan paywall.
- [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) - for seat limits and upgrade options.
