---
source: shared/docs/pages/guides/dashboard/dashboard-overview.md
generatedAt: 2026-06-03T16:57:34.078Z
model: gpt-4o-mini
---

## Purpose
This document is for LinkShift users and explains how to navigate the app shell, utilize redirect features, and monitor plan usage on the home dashboard.

## What this doc covers
- **Account access**: Overview of sign-in, registration, email verification, team invites, password reset, and legal consent.
- **App shell layout**: Description of the app shell components, including sidebar navigation and the Ask docs feature.
- **Dashboard home**: Details on the dashboard's summary view, including plan status and usage meters.
- **First-run onboarding**: Steps for the onboarding wizard that may appear after signup.
- **Profile management**: Instructions for managing account email and verification status.

## Key workflows and rules
1. **Sign-in and account management**:
   - Access account management tasks through the web app, not the Management API.
   - For tasks like email verification and password reset, refer to the [Account and access](../account-and-access.md) guide.

2. **Sidebar navigation**:
   - Access various sections via the sidebar, which includes Dashboard, Analytics, Profile, Organization, Domain Groups, and more.
   - Items like Domains, Subdomains, Redirect Rules, and Link Maps require at least one domain group to be created.

3. **Creating a domain group**:
   - Navigate to **Domain Groups** → **Add group** to create a domain group, which unlocks additional sidebar features.

4. **Using Ask docs**:
   - Type a task question in the Ask docs feature to receive linked guides from the documentation.

5. **Dashboard usage**:
   - The dashboard summarizes organization details, including current plan, usage meters, and options to manage subscriptions.

6. **First-run onboarding**:
   - The onboarding wizard provides steps to set up domains and redirect rules, which can be skipped or completed later.

7. **Profile management**:
   - Manage your email verification status and change your email through the Profile section.

## Limits and constraints
- Redirect-heavy sidebar items remain disabled until at least one domain group is created.
- Exact usage limits depend on the user's subscription plan; when a meter reaches capacity, it may display a "Limit reached" message.
- Password reset must be done outside the dashboard through the sign-in flow.

## Related docs and API areas
- [Account and access](../account-and-access.md)
- [Billing and plans in the dashboard](../billing-and-plans-in-dashboard.md)
- [Domain groups in the dashboard](./domain-groups-in-dashboard.md)
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Getting started (API)](../getting-started.md)
- API endpoint for usage: `GET /api/v1/organization/usage`
