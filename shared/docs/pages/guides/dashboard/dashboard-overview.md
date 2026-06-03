# Dashboard overview

Use this guide to orient yourself in the LinkShift app shell, unlock redirect features after your first domain group, and find plan usage on the home dashboard.

:::info
You need a LinkShift account (and legal consent if prompted after sign-in). Redirect-heavy sidebar items stay disabled until you create at least one domain group — see [Domain-group gate](#domain-group-gate) below.
:::

## Account access

Sign-in, registration, email verification, team invites, password reset, and legal consent run in the **web app**, not through the Management API.

| Task | Guide |
|------|--------|
| Sign in, register, verify email, reset password, legal consent | [Account and access](../account-and-access.md) |
| Team invites and seats | [Organization and API keys in the dashboard](./organization-and-api-keys-in-dashboard.md) |
| API keys and automation | [Getting started (API)](../getting-started.md) |

## App shell layout

After sign-in you work inside the **app shell**: a left sidebar, main content area, and optional **Ask docs** drawer on the right.

### Sidebar navigation

Open sections from the sidebar (top to bottom):

| Label | Notes |
|-------|--------|
| **Dashboard** | Plan, usage, billing |
| **Analytics** | Clickable before you have a group; the page needs at least one group |
| **Profile** | Email verification and change |
| **Organization** | Team and API key summary |
| **Domain Groups** | Always available |
| **Domains** | Requires a domain group |
| **Subdomains** | Requires a domain group |
| **Redirect Rules** | Requires a domain group |
| **Link Maps** | Requires a domain group |
| **Tests** | Requires a domain group |
| **Tools** | QR and redirect tester |
| **Docs** | Full documentation site |

:::ai-only
Sidebar route map: Dashboard `/dashboard`, Analytics `/redirect-rules-analytics`, Profile `/profile`, Organization `/organization`, Domain Groups `/domain-groups`, Domains `/domains`, Subdomains `/subdomains`, Redirect Rules `/redirect-rules`, Link Maps `/link-maps`, Tests `/tests`, Tools `/tools`, Docs `/docs`. API keys: `/organization/api-keys`.
:::

On viewports **1023px wide or less**, the sidebar opens as an overlay; use the menu control in the header to open it.

### Domain-group gate

Until you have at least one domain group, these sidebar items are disabled. Hover shows: **Create a domain group to access this section.**

Create a group under **Domain Groups** → **Add group** (see [Domain groups in the dashboard](./domain-groups-in-dashboard.md)).

### Ask docs

At the top of the sidebar, select **Ask docs** (subtitle: *Answers from documentation*).

1. Type a task question (for example “create a redirect rule” or “rollback link map import”).
2. Open linked guides in the response — they are the same pages as the public docs site.
3. Keep the drawer open while you work in the dashboard, or select **Docs** in the sidebar to browse the full site without leaving the shell.

The assistant answers from published guides only; for API paths, follow links to [Getting started](../getting-started.md) or [API reference](../../reference.md).

### Account footer

The sidebar footer shows your email and **Log out**.

## Dashboard home

Open **Dashboard** in the sidebar. The home view summarizes your organization:

- Current plan and subscription status
- Usage meters for domain groups, domains, redirect rules, link maps, tests, and seats
- **Upgrade**, **Manage subscription**, and **Cancel subscription** — see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- Copy actions for your user ID and organization ID (support and billing)

Exact limits depend on your plan. When a meter is at capacity, the card may show **Limit reached** and **Upgrade plan to increase this limit.**

The same usage fields are available programmatically — see [Domains and domain groups — usage](../domains-and-groups.md#get-usage-summary).

:::ai-only
Usage API: GET `/api/v1/organization/usage`.
:::

### First-run onboarding

Shortly after signup, an onboarding wizard may open automatically (title **Welcome to LinkShift, {organizationName}**). You can skip it or confirm later — setup is not blocked.

Wizard steps:

1. **Welcome** — **You are ready to ship redirects**
2. **Domains** — **Domain groups and hosts**
3. **Rules** — **Redirect hierarchy**
4. **Next steps** — **What to do now**

- **Confirm and continue** — closes the wizard for this account
- **Skip for now** — dismisses without blocking the app

Complete setup anytime via **Domain Groups**, **Domains**, and **Redirect Rules** in the sidebar.

## Profile

Open **Profile** in the sidebar (*Manage your account email and verification status.*) for:

- Account email with **Verified** or **Unverified** status
- **Resend verification email** when unverified (browser only)
- **Change email** — enter **New email**; if verified, use **Send verification code**, then **Verification code**, then **Confirm email**; if unverified, use **Update email and send verification**
- **Review and accept updates** when legal consent needs refresh

Password reset is outside the dashboard (from the sign-in flow). There is no in-dashboard password change.

:::ai-only
Profile `/profile`, legal consent `/legal/consent`, password reset `/reset-password`, sign-in `/auth`.
:::

## What you should see

- Sidebar labels match the table above.
- After your first domain group, previously disabled items become clickable.
- **Dashboard** shows plan name and usage cards for your organization.

## Related

- [Account and access](../account-and-access.md)
- [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Getting started (API)](../getting-started.md)
- [Docs overview](../../overview.md#what-is-linkshiftapp)
