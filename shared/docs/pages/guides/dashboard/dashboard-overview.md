# Dashboard overview

Use this guide to orient yourself in the LinkShift app shell, unlock redirect features after your first domain group, and find plan usage on the home dashboard.

## Before you start

- You need a LinkShift account and completed legal consent (`/legal/consent` if prompted after sign-in).
- Redirect-heavy sidebar items stay disabled until you create at least one domain group.

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

| Label | Route | Notes |
|-------|-------|--------|
| Dashboard | `/dashboard` | Plan, usage, billing |
| Analytics | `/redirect-rules-analytics` | Clickable before you have a group; the page needs at least one group |
| Profile | `/profile` | Email verification and change |
| Organization | `/organization` | Team and API key summary |
| Domain Groups | `/domain-groups` | Always available |
| Domains | `/domains` | Requires a domain group |
| Subdomains | `/subdomains` | Requires a domain group |
| Redirect Rules | `/redirect-rules` | Requires a domain group |
| Link Maps | `/link-maps` | Requires a domain group |
| Tests | `/tests` | Requires a domain group |
| Tools | `/tools` | QR and redirect tester |
| Docs | `/docs` | Full documentation site |

On viewports **1023px wide or less**, the sidebar opens as an overlay; use the menu control in the header to open it.

### Domain-group gate

Until you have at least one domain group, these sidebar items are disabled. Hover shows: **Create a domain group to access this section.**

Create a group under **Domain Groups** → **Add group** (see [Domain groups in the dashboard](./domain-groups-in-dashboard.md)).

### Ask docs

At the top of the sidebar, select **Ask docs** (subtitle: *Answers from documentation*).

1. Type a task question (for example “create a redirect rule” or “rollback link map import”).
2. Open linked guides in the response — they are the same pages as `/docs`.
3. Keep the drawer open while you work in the dashboard, or select **Docs** in the sidebar to browse the full site at `/docs` without leaving the shell.

The assistant answers from published guides only; for API paths, follow links to [Getting started](../getting-started.md) or [API reference](../../reference.md).

### Account footer

The sidebar footer shows your email and **Log out**.

## Dashboard home (`/dashboard`)

The home dashboard summarizes your organization:

- Current plan and subscription status
- Usage meters for domain groups, domains, redirect rules, link maps, tests, and seats
- **Upgrade**, **Manage subscription**, and **Cancel subscription** — see [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- Copy actions for your user ID and organization ID (support and billing)

Exact limits depend on your plan. When a meter is at capacity, the card may show **Limit reached** and **Upgrade plan to increase this limit.**

The same usage fields are available programmatically as `GET /api/v1/organization/usage` — see [Domains and domain groups — usage](../domains-and-groups.md#get-usage-summary).

### First-run onboarding

Shortly after signup, an onboarding wizard may open automatically (title **Welcome to LinkShift, {organizationName}**, unless you skipped it or confirmed earlier). Wizard steps:

1. **Welcome** — step title **You are ready to ship redirects**
2. **Domains** — **Domain groups and hosts**
3. **Rules** — **Redirect hierarchy**
4. **Next steps** — **What to do now**

- **Confirm and continue** — closes the wizard for this account
- **Skip for now** — dismisses without blocking the app

You can complete setup later via **Domain Groups**, **Domains**, and **Redirect Rules** in the sidebar.

## Profile (`/profile`)

Open **Profile** (*Manage your account email and verification status.*) for:

- Account email with **Verified** or **Unverified** status
- **Resend verification email** when unverified (browser only)
- **Change email** — enter **New email**; if verified, use **Send verification code**, then **Verification code**, then **Confirm email**; if unverified, use **Update email and send verification**
- **Review and accept updates** when legal consent needs refresh (opens `/legal/consent`)

Password reset is outside the dashboard (for example `/reset-password` from the sign-in flow). There is no in-dashboard password change.

## What you should see

- Sidebar labels match the table above.
- After your first domain group, previously disabled items become clickable.
- `/dashboard` shows plan name and usage cards for your organization.

## Related

- [Account and access](../account-and-access.md)
- [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Getting started (API)](../getting-started.md)
- [What is LinkShift.app?](../../intro/what-is-linkshift.md)
