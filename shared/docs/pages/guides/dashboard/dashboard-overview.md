# Dashboard overview

Use this guide to orient yourself in the LinkShift app shell. After sign-in you land in **Campaign** view by default — a task-focused sidebar for short links. Switch to **Advanced** view when you need full routing infrastructure, grouped navigation, and the operational **Dashboard** at `/dashboard`.

:::info
You need a LinkShift account (and legal consent if prompted after sign-in). In **Advanced** view, sidebar items that need at least one site are disabled until domain groups finish loading and one exists — see [Domain-group gate](#domain-group-gate) below. **Campaign** sidebar items are never disabled by this gate. **Domain Groups** in Advanced stays available so you can add your first site.
:::

## Account access

Sign-in, registration, email verification, team invites, password reset, and legal consent run in the **web app**, not through the Management API.

| Task | Guide |
|------|--------|
| Sign in, register, verify email, reset password, legal consent (`/legal/consent`) | [Account and access](../account-and-access.md) |
| Team invites and seats | [Organization and API keys in the dashboard](./organization-and-api-keys-in-dashboard.md) |
| API keys and automation | [Getting started (API)](../getting-started.md) |

## Campaign and Advanced views

LinkShift offers two sidebar layouts. Your choice is saved in the browser for your account on that device.

| | **Campaign** (default) | **Advanced** |
|---|------------------------|----------------|
| Tagline | *Short links on your domain* | *Environment-ready routing* |
| Primary tasks | Overview, links, analytics, tools | Full routing stack, tests, org admin |
| Docs assistant | **Need help?** | **Ask docs** |
| Workspace scope | Page-level **Site** filter on **Links** and **Analytics** | Page-level **Site** filter on scoped routing and quality pages |
| Analytics | `/analytics` — **Site** filter on the page | `/redirect-rules-analytics` — **Site** filter on the page — see [Analytics in the dashboard](./analytics-in-dashboard.md) |
| Plan, usage, billing | **Settings** → [Plan and usage](#plan-and-usage) | **Dashboard** at `/dashboard`; account shortcuts also under **Plan and account** (`/settings`) |

### Campaign sidebar

| Label | Route | Notes |
|-------|--------|--------|
| **Overview** | `/overview` | Recent links and setup checklist |
| **Links** | `/links` | Create and manage short links — [Links in the dashboard](./links-in-dashboard.md) |
| **Analytics** | `/analytics` | Traffic for the selected site |
| **QR & Tools** | `/tools` | QR generator and redirect tester |
| **Settings** | `/settings` | Site, plan, team, profile shortcuts — [Settings in the dashboard](./settings-in-dashboard.md) |

### Advanced sidebar

Grouped sections (top to bottom):

| Section | Labels |
|---------|--------|
| **Overview** | **Dashboard** (plan, usage, billing), **Links**, **Analytics** |
| **Routing** | **Domain Groups**, **Domains**, **Subdomains**, **Redirect Rules**, **Link Maps** |
| **Quality** | **Tests**, **Tools** |
| **Workspace** | **Organization** (team and API keys), **Plan and account** (`/settings`) |
| **Help** | **Docs** (opens in a new tab) |

### Switch views

Use any of these controls:

1. **Sidebar header** (desktop) — persistent **Campaign** or **Advanced** badge with tagline (*Short links on your domain* / *Environment-ready routing*).
2. **Sidebar footer** (desktop only) — **Switch to advanced** (in Campaign) or **Switch to campaign** (in Advanced).
3. **Mobile header** — tap the **Campaign** or **Advanced** pill next to the logo.
4. **Settings** → **Advanced** card → **Switch to advanced view** — enables Advanced view and opens **Dashboard** (`/dashboard`).

To return to Campaign from Advanced, use **Switch to campaign** in the sidebar footer.

When the current route exists in both modes (for example **Links** or **Settings**), toggling keeps you on that page. Otherwise the app maps your route to the closest equivalent or lands on the default home for the target mode.

### Switch views — route mapping

| Current route (switching to Advanced) | Lands on |
|---------------------------------------|----------|
| `/overview` | `/dashboard` |
| `/analytics` | `/redirect-rules-analytics` |
| Shared routes (`/links`, `/settings`, `/tools`, `/tools/qr-code-generator`, `/tools/redirect-tester`, `/organization`, `/organization/api-keys`, `/profile`, …) | Same path |

| Current route (switching to Campaign) | Lands on |
|---------------------------------------|----------|
| `/dashboard` | `/overview` |
| `/redirect-rules-analytics` | `/analytics` |
| `/redirect-rules` | `/links` |
| `/domain-groups`, `/domains`, `/subdomains` | `/settings#hosts` |
| `/link-maps` | `/links` |
| `/link-maps/{id}` | `/links?linkMapId={id}` |
| `/tests` | `/tools/redirect-tester` |
| Shared routes | Same path |

If no mapping applies, you land on **Overview** (Campaign) or **Dashboard** (Advanced).

### Plan and usage

| View | Where to open | What you get |
|------|----------------|--------------|
| **Campaign** | **Settings** → **Plan and usage** — [Settings in the dashboard](./settings-in-dashboard.md#plan-and-usage) | Compact limit tiles: **Short link hosts** (custom domains count toward this meter), **Active links**, **Team seats**; expand **Technical limits** for redirect rules and link maps. **Upgrade**, **Manage subscription**, and **Cancel subscription** are on **Settings** → **Plan and billing**. |
| **Advanced** | **Dashboard** in the sidebar (`/dashboard`) | Full operational overview: subscription snapshot, usage meters, **Upgrade**, **Manage subscription**, **Cancel subscription** — see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md) |

The same usage fields are available programmatically — see [Domains and domain groups — usage](../domains-and-groups.md#get-usage-summary).

:::ai-only
Usage API: GET `/api/v1/organization/usage`. Campaign usage destination: `/settings#plan-usage`. Advanced usage destination: `/dashboard`.
:::

## App shell layout

After sign-in you work inside the **app shell**: a left sidebar, main content area, and optional documentation assistant drawer on the right.

On smaller screens, the sidebar opens as an overlay. A compact **mobile header** replaces the sidebar footer mode toggle:

| Control | Position | Action |
|---------|----------|--------|
| **Menu** | Left | Open or close the sidebar overlay |
| **Campaign** or **Advanced** | Center (next to logo) | Switch dashboard mode — same route mapping as [Switch views — route mapping](#switch-views--route-mapping) |
| Docs assistant icon | Right | Opens the same drawer as **Need help?** / **Ask docs** |

When legal consent is required, **all sidebar navigation** stays disabled with tooltip **Accept updated terms to continue.** until you accept updated terms on `/legal/consent`.

### Need help? and Ask docs

At the top of the sidebar:

| View | Control |
|------|---------|
| **Campaign** | **Need help?** |
| **Advanced** | **Ask docs** (shows **AI** tag) |

1. Type a task question (for example “create a redirect rule” or “rollback link map import”).
2. Open linked guides in the response — they are the same pages as the public docs site.
3. Keep the drawer open while you work, or in Advanced select **Docs** in the sidebar to browse the full site without leaving the shell.

The assistant answers from published guides only; for API paths, follow links to [Getting started](../getting-started.md) or [API reference](../../reference.md).

### Site filter on scoped pages

There is no shell-level workspace control above the main content. Scoped pages show a **Site** menu in the page header (popover next to the title).

Which pages include the **Site** filter depends on your dashboard mode:

| View | Pages with **Site** filter |
|------|--------------------------|
| **Campaign** | **Links**, **Analytics** |
| **Advanced** | **Links**, **Analytics**, **Domains**, **Subdomains**, **Redirect Rules**, **Link Maps**, **Tests** |

| View | **All sites** |
|------|---------------|
| **Campaign** | **Links** and **Analytics** when you have multiple sites |
| **Advanced** | **Links** only when you have multiple sites; other scoped pages require one site |

When **All sites** is not available, pick one site from the menu. With only one site, the menu auto-scopes to that site.

On scoped pages without a site selected, tables prompt you to choose a site in the page header **Site** menu. If a site has no rows but another site does, switch site in that menu — or choose **All sites** on **Links** when available.

### Domain-group gate

In **Advanced** view only: sidebar items that need at least one site stay disabled until sites finish loading and at least one exists. Affected items:

- **Links**
- **Analytics**
- **Domains**
- **Subdomains**
- **Redirect Rules**
- **Link Maps**
- **Tests**

| State | Tooltip on disabled items |
|-------|---------------------------|
| Sites still loading | **Loading sites…** |
| No sites yet | **Add a site to continue** |

**Domain Groups**, **Tools**, **Organization**, **Plan and account**, and **Docs** are not gated. Add your first site under **Domain Groups** → **Add group** (see [Domain groups in the dashboard](./domain-groups-in-dashboard.md)).

### Direct URL access in Advanced view

Several Advanced pages (**Links**, **Analytics**, **Domains**, **Subdomains**, **Redirect Rules**, **Link Maps**, **Tests**) require at least one site. If you open one directly without a site, you redirect to **Domain Groups** with snackbar **Add a site to continue**.

**Exception:** switching from **Campaign** to **Advanced** while already on a shared route such as `/links` keeps you on the same page — the empty state still appears when prerequisites are missing.

### Account footer

The sidebar footer shows your email, **Profile**, and **Log out** in both views.

## Marketing site vs Campaign overview

| URL | Audience | Purpose |
|-----|----------|---------|
| `/` | Signed-out visitors | Marketing site (product pages, public tools links) |
| `/overview` | Signed-in app (**Campaign** view) | Campaign overview — recent links, setup checklist, quick actions |

Do not confuse marketing `/` with app **Overview** at `/overview`. Legacy `/home` redirects to `/overview`.

## Campaign overview

Open **Overview** in the sidebar (`/overview`).

### Quick actions

The top row adapts to your setup:

| Setup state | Primary quick action |
|-------------|----------------------|
| No sites | **Connect your domain** — opens connect-domain wizard |
| Sites, no hosts | **Add host** — opens connect-domain wizard |
| Hosts connected | **Create link** |

**Open analytics** and **QR generator** always appear in the row. Until hosts are connected, selecting either opens the connect-domain wizard instead of navigating away.

### Recent links

The **Recent links** section shows up to five latest short links (*Latest short links from your recently updated sites*). Each row supports **Copy short URL** and **Open analytics**. Select **View all** to open **Links**.

Empty states mirror **Links**: connect domain, add host, no links yet, or loading. If recent links fail to load, you see **Couldn't load recent links. Try again or open Links for the full list.** with a **Try again** button (no inline link to **Links**). See [Links in the dashboard](./links-in-dashboard.md).

### Setup checklist

The checklist on **Overview** (and a banner on **Dashboard** in Advanced view) tracks onboarding. Header shows progress (*N of M complete*).

| View | Steps shown |
|------|-------------|
| **Campaign** (no hosts) | **Connect your domain**, **Test a link**, **Invite teammate** — 3 steps |
| **Campaign** (hosts connected) | **Create link**, **Test a link**, **Invite teammate** — 3 steps |
| **Advanced** | **Confirm your domain**, **Create link**, **Run redirect test**, **Invite teammate** — 4 steps |

Select **Dismiss** to hide the checklist; **Show setup checklist** reopens it. Progress is saved in the browser on this device. Items can auto-complete when you finish the underlying action (for example sending an invite or using the redirect tester) and show **Completed automatically**.

Campaign overview does not replace the full usage and billing blocks on **Dashboard** in Advanced view. For plan limits in Campaign view, use **Settings** → **Plan and usage** — [Settings in the dashboard](./settings-in-dashboard.md).

## Advanced dashboard home

Open **Dashboard** in the sidebar (`/dashboard`).

### Setup checklist

The same onboarding checklist as **Overview** appears at the top. See [Setup checklist](#setup-checklist) under Campaign overview.

### Summary cards

| Card | Contents |
|------|----------|
| **Plan and account** | Shortcut to **Open settings** (`/settings`) — plan, team, profile, and connected domains |
| **Session details** | Email, role (Owner / Member); expand **Technical details** for **User ID** (copy when truncated) |
| **Organization profile** | Organization name and **Organization ID** (copy when truncated) |
| **Subscription snapshot** | Plan, status, amount/currency, interval, active from/until; **Upgrade**, **Manage subscription**, **Cancel subscription** — see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md) |

### Subscription limits and analytics retention

Below the summary cards, a usage grid lists organization limits — domain groups, hosts, rules, link maps, tests, seats, API rates, and **Current plan analytics retention days**. Usage meters show current count vs limit; per-group caps show the limit only.

When a meter is at capacity, the tile shows **Limit reached** and **Upgrade plan to increase this limit.** When the organization is over limits or suspended, a suspension banner appears at the top of this block on **Dashboard** only (not on **Settings** or other pages). For billing actions and tile details by mode, see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md).

Visiting `/dashboard` while in **Campaign** view redirects you to **Overview**.

### First-run onboarding

Within 24 hours of signup, a two-step onboarding wizard may open automatically on **Overview** in **Campaign** view or **Dashboard** in **Advanced** view. Step 1 introduces core concepts; step 2 lists recommended first actions with shortcuts.

The wizard defers when you are mid-flow elsewhere (for example **Create link** or **Connect your domain** from a bookmarked link). Dismissal is remembered on this device — **Confirm and continue**, **Skip for now**, or closing the backdrop all count as dismissed.

Complete setup from **Overview** and **Settings** in Campaign view, or from **Domain Groups**, **Domains**, and **Redirect Rules** in Advanced view.

## Profile

Open **Profile** from the sidebar footer for:

- Account email with **Verified** or **Unverified** status
- **Resend verification email** when unverified (browser only)
- **Change email** — enter **New email**; if verified, use **Send verification code**, then **Verification code**, then **Confirm email**; if unverified, use **Update email and send verification**
- **Review and accept updates** when legal consent needs refresh

Password reset is outside the dashboard (from the sign-in flow). There is no in-dashboard password change.

:::ai-only
Campaign routes: Overview `/overview`, Links `/links`, Analytics `/analytics`, QR & Tools `/tools`, Settings `/settings`. Advanced: Dashboard `/dashboard`, Links `/links`, Analytics `/redirect-rules-analytics`, Domain Groups `/domain-groups`, Domains `/domains`, Subdomains `/subdomains`, Redirect Rules `/redirect-rules`, Link Maps `/link-maps`, Tests `/tests`, Tools `/tools`, Organization `/organization`, Plan and account `/settings`, Docs `/docs`. API keys: `/organization/api-keys`. Mode storage key `linkshift-dashboard-mode` (`campaign` | `advanced`). Workspace storage key `linkshift-active-domain-group`. Setup checklist storage `linkshift-setup-checklist`. Onboarding dismissed `dashboard-onboarding-confirmed`. Landing: Campaign `/overview`, Advanced `/dashboard`. No shell-level workspace selector; page header Site menu via `attachPageWorkspaceFilter`. Advanced gated routes use `requiresDomainGroups` / `domainGroupsRequiredGuard` → `/domain-groups?openCreate=1`. Deep links: `/links?openCreate=1`, `/links?openConnectDomain=1`. Profile `/profile`, legal consent `/legal/consent`, password reset `/reset-password`, sign-in `/auth`. Mobile overlay breakpoint: 1023px. Page subtitles: Overview *Create links, review performance, and share QR codes from one place.*; Dashboard *Health, billing, and organization limits.*; onboarding *Short walkthrough to help you get value quickly.* Campaign quick-action subtitles when gated: analytics *Set up your domain first* / *Add a host to see analytics*; QR *Works with any URL…* / *Add a host to link QR codes…*. Dashboard usage grid meters: domain groups, domains/subdomains per group, domains, subdomains, rules per group, link map entries per map, rules, link maps, link map entries, tests, active users, redirections/min, API keys, API calls/min per key, analytics retention days. Domains/Subdomains empty states may quote *choose All sites* in shared copy even though All sites is Links-only — switch site in the header menu instead.
:::

## Related

- [Account and access](../account-and-access.md)
- [Analytics in the dashboard](./analytics-in-dashboard.md) — routes and filters by dashboard mode
- [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- [Links in the dashboard](./links-in-dashboard.md)
- [Settings in the dashboard](./settings-in-dashboard.md)
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Getting started (API)](../getting-started.md)
- [Docs overview](../../overview.md#what-is-linkshiftapp)
