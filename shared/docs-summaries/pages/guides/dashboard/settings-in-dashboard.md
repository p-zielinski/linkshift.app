---
source: shared/docs/pages/guides/dashboard/settings-in-dashboard.md
generatedAt: 2026-06-07T10:05:38.310Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing their site settings, plan, team, and account within the LinkShift dashboard.

## What this doc covers
- Overview of accessing **Settings** in both **Campaign** and **Advanced** views.
- Details on **Plan and usage** tiles and their metrics in both views.
- Information on managing **Domains & hosts** and connecting domains.
- Overview of the **Team** card and its functionalities.
- Description of the **Plan and billing** card and available actions.
- Information on the **Profile** card and its link to account updates.
- Details on **Shortcut cards** for navigating between views.

## Key workflows and rules
1. **Open Settings**:
   - **Campaign View**: Select **Settings** in the sidebar.
   - **Advanced View**: Select **Plan and account** under **Workspace** in the sidebar.

2. **Plan and Usage**:
   - In **Campaign View**:
     - Tiles display metrics for **Short link hosts**, **Active links**, and **Team seats**.
     - Expand **Technical limits** for metrics on **Redirect rules** and **Link maps**.
   - In **Advanced View**:
     - Tiles display metrics for **Domains**, **Rules**, **Active users**, and **Link maps**.
     - No **Technical limits** section is available.

3. **Domains & Hosts**:
   - Select **Connect domain** to open the domain connection wizard.
   - Messages displayed based on the state of sites and hosts (loading, no sites, site without hosts).

4. **Team Management**:
   - Access **Manage team** via the **Team** card for invites, seats, and API keys.

5. **Plan and Billing Management**:
   - Actions available in the **Plan and billing** card:
     - **Upgrade**: Shown when checkout is available for your plan.
     - **Manage subscription**: Available for paid plans.
     - **Cancel subscription**: Available for paid plans.
   - **Upgrade** opens the **Change your subscription** dialog; **Manage subscription** and **Cancel subscription** open the Paddle customer portal.

6. **Profile Management**:
   - Access **Open profile** for email verification and account updates.

## Limits and constraints
- When a tile reaches its capacity, it displays **Limit reached** and prompts to **Upgrade plan to increase this limit**.
- Usage loads from the organization subscription; if it fails, a message appears: **Couldn't load usage. Try again or refresh the page.**
- The **Plan and billing** card actions are only available for paid plans, not for the **FREE** plan.

## Related docs and API areas
- [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- [Organization and API keys in the dashboard](./organization-and-api-keys-in-dashboard.md)
- [Links in the dashboard](./links-in-dashboard.md)
- [Domains and domain groups — In the dashboard](../domains-and-groups.md#in-the-dashboard)
- [Dashboard overview](./dashboard-overview.md)
