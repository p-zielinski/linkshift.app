---
source: shared/docs/pages/guides/dashboard/dashboard-overview.md
generatedAt: 2026-05-30T06:59:41.684Z
model: gpt-4o-mini
---

## Purpose
This document is for LinkShift users and explains how to navigate the app shell, utilize redirect features, and monitor plan usage on the dashboard.

## What this doc covers
- **Before you start**: Requirements for using the LinkShift app.
- **Account access**: Overview of account-related tasks and links to guides.
- **App shell layout**: Description of the app shell components and sidebar navigation.
- **Dashboard home (`/dashboard`)**: Details on the dashboard's summary features and usage meters.
- **First-run onboarding**: Steps in the onboarding wizard for new users.
- **Profile (`/profile`)**: Managing account email and verification status.

## Key workflows and rules
1. **Creating a Domain Group**:
   - Navigate to **Domain Groups** → **Add group** to create a domain group.
   - Sidebar items related to domains and redirects remain disabled until at least one domain group is created.

2. **Using the Ask Docs Feature**:
   - Select **Ask docs** in the sidebar.
   - Type a task question (e.g., “create a redirect rule”).
   - Open linked guides from the response or browse the full documentation via **Docs**.

3. **Onboarding Wizard**:
   - Automatically opens after signup unless skipped.
   - Steps include:
     1. Welcome
     2. Domains
     3. Rules
     4. Next steps
   - Options to confirm and continue or skip for now.

4. **Profile Management**:
   - Access the **Profile** section to manage email verification and change email.
   - Resend verification email if the account is unverified.

## Limits and constraints
- Redirect-heavy sidebar items are disabled until at least one domain group is created.
- Usage meters on the dashboard reflect limits based on the user's subscription plan; when at capacity, a card may display **Limit reached**.
- The exact limits for usage depend on the user's plan, which can be checked programmatically via `GET /api/v1/organization/usage`.

## Related docs and API areas
- [Account and access](../account-and-access.md)
- [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Getting started (API)](../getting-started.md)
- [What is LinkShift.app?](../../intro/what-is-linkshift.md)
