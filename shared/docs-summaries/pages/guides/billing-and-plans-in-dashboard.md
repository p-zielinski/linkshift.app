---
source: shared/docs/pages/guides/billing-and-plans-in-dashboard.md
generatedAt: 2026-05-30T06:59:27.876Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to view plan usage, upgrade subscriptions, access the Paddle customer portal, and cancel subscriptions.

## What this doc covers
- **Before you start**: Instructions for signing in and limitations of billing actions.
- **Where to see usage and limits**: Overview of dashboard blocks showing session details, organization profile, subscription snapshot, and usage limits.
- **Upgrade your plan**: Steps to upgrade the subscription plan through the dashboard.
- **Manage or cancel subscription**: Actions available for managing or canceling subscriptions for non-free plans.
- **Plan behavior (qualitative)**: Descriptions of behaviors associated with different plan types (FREE, Paid, UNMETERED).
- **No Management API for billing**: Clarification that billing actions are not available via the Management API.

## Key workflows and rules
### Upgrade your plan
1. Navigate to `/dashboard` and select **Upgrade**.
2. A dialog titled **Change your subscription** will appear.
3. Choose a plan and complete the checkout process.

### Manage or cancel subscription
- **Manage subscription**: Opens the Paddle customer portal for payment methods and invoices.
- **Cancel subscription**: Triggers a confirmation dialog titled **Cancel subscription**, then proceeds through the Paddle portal flow.

### Plan behavior
- **FREE Plan**: Usage meters apply; no options to manage or cancel subscriptions; API may return `402 Payment Required` for certain calls.
- **Paid Plans**: Options to upgrade, manage, and cancel subscriptions available.
- **UNMETERED Plan**: No upgrade option; limits are based on unmetered caps.

## Limits and constraints
- Billing actions are **dashboard-only** and not available in the Management API.
- Usage quotas can be viewed via `GET /api/v1/organization/usage`.
- The **Upgrade** option is hidden for organizations on the **UNMETERED** plan.
- If the organization exceeds limits or is suspended, a suspension banner will appear on the dashboard.

## Related docs and API areas
- **Dashboard overview**: [Dashboard overview](./dashboard/dashboard-overview.md)
- **Domains and domain groups**: [Domains and domain groups](./domains-and-groups.md)
- **Getting started**: [Getting started](./getting-started.md)
- **Organization and API keys in the dashboard**: [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md)
