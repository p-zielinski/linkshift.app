# Dashboard overview

Use this guide to orient yourself in the LinkShift app shell. After sign-in you land in **Campaign** view by default — a task-focused sidebar for short links. Switch to **Advanced** view when you need full routing infrastructure, grouped navigation, and the operational **Dashboard** at `/dashboard`.

:::info
You need a LinkShift account (and legal consent if prompted after sign-in). In **Advanced** view, redirect-heavy sidebar items stay disabled until you create at least one domain group — see [Domain-group gate](#domain-group-gate) below. **Campaign** view does not use that gate on sidebar items.
:::

## Account access

Sign-in, registration, email verification, team invites, password reset, and legal consent run in the **web app**, not through the Management API.

| Task | Guide |
|------|--------|
| Sign in, register, verify email, reset password, legal consent | [Account and access](../account-and-access.md) |
| Team invites and seats | [Organization and API keys in the dashboard](./organization-and-api-keys-in-dashboard.md) |
| API keys and automation | [Getting started (API)](../getting-started.md) |

## Campaign and Advanced views

LinkShift offers two sidebar layouts. Your choice is saved in the browser for your account on that device.

| | **Campaign** (default) | **Advanced** |
|---|------------------------|----------------|
| Tagline | *Short links on your domain* | *Environment-ready routing* |
| Primary tasks | Overview, links, analytics, tools | Full routing stack, tests, org admin |
| Docs assistant | **Need help?** | **Ask docs** |
| Workspace scope | Filter on each page | **Workspace** selector above main content |
| Analytics | `/analytics` — **Site** filter on the page | `/redirect-rules-analytics` — **Domain group** filter (shell **Workspace** when shown) — see [Analytics in the dashboard](./analytics-in-dashboard.md) |
| Plan, usage, billing | **Settings** → [Plan and usage](#plan-and-usage) | **Dashboard** at `/dashboard` |

### Campaign sidebar

| Label | Route | Notes |
|-------|--------|--------|
| **Overview** | `/overview` | Recent links and setup checklist |
| **Links** | `/links` | Create and manage short links |
| **Analytics** | `/analytics` | Traffic for the selected site |
| **QR & Tools** | `/tools` | QR generator and redirect tester |
| **Settings** | `/settings` | Site, plan, team, profile shortcuts |

### Advanced sidebar

Grouped sections (top to bottom):

| Section | Labels |
|---------|--------|
| **Overview** | **Dashboard** (plan, usage, billing), **Links**, **Analytics** |
| **Routing** | **Domain Groups**, **Domains**, **Subdomains**, **Redirect Rules**, **Link Maps** |
| **Quality** | **Tests**, **Tools** |
| **Workspace** | **Organization** (team and API keys) |
| **Help** | **Docs** |

Key routes in **Advanced** view (sidebar label → path):

| Label | Route | Notes |
|-------|--------|--------|
| **Dashboard** | `/dashboard` | Plan, usage, billing |
| **Links** | `/links` | Short links |
| **Analytics** | `/redirect-rules-analytics` | Traffic for the selected domain group |
| **Domain Groups** | `/domain-groups` | Create and manage groups |

:::ai-only
Campaign routes: Overview `/overview`, Links `/links`, Analytics `/analytics`, Tools `/tools`, Settings `/settings`. Advanced: Dashboard `/dashboard`, Links `/links`, Analytics `/redirect-rules-analytics`, Domain Groups `/domain-groups`, Domains `/domains`, Subdomains `/subdomains`, Redirect Rules `/redirect-rules`, Link Maps `/link-maps`, Tests `/tests`, Tools `/tools`, Organization `/organization`, Docs `/docs`. API keys: `/organization/api-keys`. Mode storage key `linkshift-dashboard-mode` (`campaign` | `advanced`). Landing: Campaign `/overview`, Advanced `/dashboard`.
:::

### Switch views

Use either control:

1. **Sidebar footer** — **Switch to advanced** (in Campaign) or **Switch to campaign** (in Advanced). You land on **Overview** or **Dashboard**, respectively.
2. **Settings** → **Advanced** → **Switch to advanced view** — enables Advanced view and opens the full infrastructure sidebar.

To return to Campaign from Advanced, use **Switch to campaign** in the sidebar footer.

### Plan and usage

| View | Where to open | What you get |
|------|----------------|--------------|
| **Campaign** | **Settings** → **Plan and usage** (section id `plan-usage`) | Compact limit tiles (domains, rules, users, link maps). **View full usage** on the **Organization** page (via **Settings** → **Manage team**) opens this section. |
| **Advanced** | **Dashboard** in the sidebar (`/dashboard`) | Full operational overview: subscription snapshot, usage meters, **Upgrade**, **Manage subscription**, **Cancel subscription** — see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md) |

The same usage fields are available programmatically — see [Domains and domain groups — usage](../domains-and-groups.md#get-usage-summary).

:::ai-only
Usage API: GET `/api/v1/organization/usage`. Campaign usage destination: `/settings#plan-usage`. Advanced usage destination: `/dashboard`.
:::

## App shell layout

After sign-in you work inside the **app shell**: a left sidebar, main content area, and optional documentation assistant drawer on the right.

On viewports **1023px wide or less**, the sidebar opens as an overlay; use the menu control in the header to open it.

### Need help? and Ask docs

At the top of the sidebar:

| View | Control | Subtitle |
|------|---------|----------|
| **Campaign** | **Need help?** | *Answers from documentation* |
| **Advanced** | **Ask docs** | *Answers from documentation* (shows **AI** tag) |

1. Type a task question (for example “create a redirect rule” or “rollback link map import”).
2. Open linked guides in the response — they are the same pages as the public docs site.
3. Keep the drawer open while you work, or in Advanced select **Docs** in the sidebar to browse the full site without leaving the shell.

The assistant answers from published guides only; for API paths, follow links to [Getting started](../getting-started.md) or [API reference](../../reference.md).

### Workspace selector (Advanced only)

In **Advanced** view, when you have at least one domain group, a **Workspace** control appears above the main content. It sets the active domain group for pages that respect the shell selection.

In **Campaign** view, use the workspace filter on individual pages (for example **Links** or **Analytics**) instead of the shell control.

### Domain-group gate

In **Advanced** view only: until you have at least one domain group, these sidebar items are disabled: **Domains**, **Subdomains**, **Redirect Rules**, **Link Maps**, and **Tests**. Hover shows: **Create a domain group to access this section.**

Create a group under **Domain Groups** → **Add group** (see [Domain groups in the dashboard](./domain-groups-in-dashboard.md)).

### Account footer

The sidebar footer shows your email, **Profile**, and **Log out** in both views.

## Marketing site vs Campaign overview

| URL | Audience | Purpose |
|-----|----------|---------|
| `/` | Signed-out visitors | Marketing site (product pages, public tools links) |
| `/overview` | Signed-in app (**Campaign** view) | Campaign overview — recent links, setup checklist, quick actions |

Do not confuse marketing `/` with app **Overview** at `/overview`. Legacy `/home` redirects to `/overview`.

## Campaign overview

Open **Overview** in the sidebar (`/overview`). The page highlights recent links, setup progress, and quick actions:

| Quick action | Destination |
|--------------|-------------|
| **Create link** | `/links?openCreate=1` |
| **Open analytics** | `/analytics` |
| **QR generator** | `/tools/qr-code-generator` |

### Setup checklist

The checklist on **Overview** (and a banner on **Dashboard** in Advanced view) tracks onboarding:

| Step | Campaign | Advanced |
|------|----------|----------|
| Connect or confirm domain | **Connect your domain** → `/links?openConnectDomain=1` | **Confirm your domain** → `/domain-groups` |
| Create link | `/links?openCreate=1` | Same |
| Test routing | **Test a link** → `/tools/redirect-tester` | **Run redirect test** → `/tests` |
| Invite teammate | `/organization` | Same |

Progress is stored in the browser (`linkshift-setup-checklist`). Items can auto-complete when you finish the underlying action.

Campaign overview does not replace the full usage and billing blocks on **Dashboard** in Advanced view. For plan limits in Campaign view, use **Settings** → **Plan and usage**.

## Advanced dashboard home

Open **Dashboard** in the sidebar (`/dashboard`). The home view summarizes your organization:

- Current plan and subscription status
- Usage meters for domain groups, domains, redirect rules, link maps, tests, and seats
- **Upgrade**, **Manage subscription**, and **Cancel subscription** — see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- Copy actions for your user ID and organization ID (support and billing)

Exact limits depend on your plan. When a meter is at capacity, the card may show **Limit reached** and **Upgrade plan to increase this limit.**

Visiting `/dashboard` while in **Campaign** view redirects you to **Overview**.

### First-run onboarding

Shortly after signup, an onboarding wizard may open automatically (title **Welcome to LinkShift, {organizationName}**). You can skip it or confirm later — setup is not blocked.

Wizard steps:

1. **Welcome** — **You are ready to ship redirects**
2. **Domains** — **Domain groups and hosts**
3. **Rules** — **Redirect hierarchy**
4. **Next steps** — **What to do now**

- **Confirm and continue** — closes the wizard for this account
- **Skip for now** — dismisses without blocking the app

Complete setup from **Overview** and **Settings** in Campaign view, or from **Domain Groups**, **Domains**, and **Redirect Rules** in Advanced view.

## Profile

Open **Profile** from the sidebar footer (*Manage your account email and verification status.*) for:

- Account email with **Verified** or **Unverified** status
- **Resend verification email** when unverified (browser only)
- **Change email** — enter **New email**; if verified, use **Send verification code**, then **Verification code**, then **Confirm email**; if unverified, use **Update email and send verification**
- **Review and accept updates** when legal consent needs refresh

Password reset is outside the dashboard (from the sign-in flow). There is no in-dashboard password change.

:::ai-only
Profile `/profile`, legal consent `/legal/consent`, password reset `/reset-password`, sign-in `/auth`.
:::

## What you should see

- **Campaign** (default): sidebar shows **Overview**, **Links**, **Analytics**, **QR & Tools**, **Settings**, and **Need help?**
- **Advanced**: grouped sidebar matches the table above; **Ask docs** shows the **AI** tag; **Workspace** selector appears when groups exist
- After your first domain group, previously disabled **Advanced** items become clickable
- **Campaign** plan limits on **Settings**; **Advanced** plan name and full usage cards on **Dashboard**

## Related

- [Account and access](../account-and-access.md)
- [Analytics in the dashboard](./analytics-in-dashboard.md) — routes and filters by dashboard mode
- [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Getting started (API)](../getting-started.md)
- [Docs overview](../../overview.md#what-is-linkshiftapp)
