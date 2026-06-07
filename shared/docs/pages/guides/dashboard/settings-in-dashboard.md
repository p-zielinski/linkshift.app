# Settings in the dashboard

Manage your site, plan, team, and account from **Settings** (`/settings`).

The same route is shared across dashboard modes. How you open it depends on your view:

| View | Sidebar label | Route |
|------|----------------|-------|
| **Campaign** | **Settings** | `/settings` |
| **Advanced** | **Plan and account** (under **Workspace**) | `/settings` |

Organization and profile pages are shared across both views.

:::info
**Settings** is your home for plan limits, domain setup, and billing shortcuts in both views. In **Advanced** view, **Dashboard** (`/dashboard`) also shows the full subscription snapshot and usage meters — see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md).
:::

## Open Settings

| View | How to open |
|------|-------------|
| **Campaign** | Select **Settings** in the sidebar |
| **Advanced** | Select **Plan and account** under **Workspace** in the sidebar |

## Plan and usage

Tiles depend on your dashboard mode.

### Campaign view

| Tile | Measures |
|------|----------|
| **Short link hosts** | Custom domains across your organization (uses the domains usage meter; subdomains are tracked separately) |
| **Active links** | Link map entries (short links) |
| **Team seats** | Active organization members |

Expand **Technical limits** for infrastructure meters:

| Tile | Measures |
|------|----------|
| **Redirect rules** | Rules across your organization |
| **Link maps** | Link maps across your organization |

### Advanced view

| Tile | Measures |
|------|----------|
| **Domains** | Domains across your organization |
| **Rules** | Redirect rules across your organization |
| **Active users** | Active organization members |
| **Link maps** | Link maps across your organization |

No **Technical limits** section appears in **Advanced** view.

When a tile reaches capacity, it shows **Limit reached** and **Upgrade plan to increase this limit.** On **Settings**, that upgrade line is a clickable action that opens the **Change your subscription** dialog. On **Dashboard** in **Advanced** view, the same text appears as static copy (use **Upgrade** in the subscription snapshot to change plans).

Usage loads from your organization subscription. If loading fails, you see **Couldn't load usage. Try again or refresh the page.** with **Try again**.

## Domains & hosts

Lists each **Site** and its connected hosts. Select **Connect domain** to open the connect-domain wizard (same flow as **Links** — see [Domains and domain groups — In the dashboard](../domains-and-groups.md#in-the-dashboard)).

When no hosts exist anywhere in your organization, a hint appears: *Add a subdomain or custom domain before creating short links.*

| State | What you see |
|-------|----------------|
| Loading | **Loading sites and hosts…** |
| No sites | **No sites yet. Connect a domain to create short links.** |
| Site without hosts | **No hosts connected on this site** |

## Team

The **Team** card shows your active user count and links to **Manage team** (`/organization`) for invites, seats, and API keys — see [Organization and API keys in the dashboard](./organization-and-api-keys-in-dashboard.md).

## Plan and billing

The **Plan and billing** card shows your current plan name and subscription status.

**Upgrade**, **Manage subscription**, and **Cancel subscription** appear on **Settings** → **Plan and billing** in both **Campaign** and **Advanced** view.

| Action | When shown |
|--------|------------|
| **Upgrade** | When checkout is available for your plan |
| **Manage subscription** | Paid plans (not **FREE**) |
| **Cancel subscription** | Paid plans (not **FREE**) |

**Upgrade** opens the **Change your subscription** dialog. **Manage subscription** and **Cancel subscription** open the Paddle customer portal.

In **Advanced** view, **Dashboard** (`/dashboard`) also shows the full subscription snapshot and all usage meters — see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md).

## Profile

The **Profile** card shows your sign-in email and links to **Open profile** (`/profile`) for email verification and account updates — see [Dashboard overview — Profile](./dashboard-overview.md#profile).

## Shortcut cards

The bottom row of **Settings** shows mode-specific shortcuts alongside **Team**, **Plan and billing**, and **Profile**.

### Campaign view

| Card | Action |
|------|--------|
| **Advanced** | **Switch to advanced view** — enables **Advanced** view and opens **Dashboard** (`/dashboard`) |

### Advanced view

| Card | Action |
|------|--------|
| **Operations dashboard** | **Open dashboard** → `/dashboard` |
| **Routing** | **Domain groups** → `/domain-groups`, **Redirect rules** → `/redirect-rules` |

## Related

- [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- [Organization and API keys in the dashboard](./organization-and-api-keys-in-dashboard.md)
- [Links in the dashboard](./links-in-dashboard.md)
- [Domains and domain groups — In the dashboard](../domains-and-groups.md#in-the-dashboard)
- [Dashboard overview](./dashboard-overview.md)

:::ai-only
Settings route `/settings` (Campaign: sidebar Settings; Advanced: Plan and account under Workspace). Section anchors: `#plan-usage`, `#hosts`. Campaign plan tiles: Short link hosts (domains meter only), Active links, Team seats; technical: Redirect rules, Link maps. Advanced plan tiles: Domains, Rules, Active users, Link maps (no technical section). Billing on Settings in both modes. Campaign shortcut: Advanced card → Switch to advanced view → `/dashboard`. Advanced shortcuts: Operations dashboard → `/dashboard`; Routing → domain-groups, redirect-rules.
:::
