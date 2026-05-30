---
source: shared/docs/pages/guides/account-and-access.md
generatedAt: 2026-05-30T06:59:21.799Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift and explains account management tasks such as signing in, registering, verifying email, resetting passwords, accepting team invites, and completing legal consent.

## What this doc covers
- **Before you start**: Overview of account flows and programmatic access.
- **Sign in or register**: Steps to log in or create a new account at `/auth`.
- **Verify your email**: Process for verifying email addresses after registration or changes.
- **Change your email**: Instructions for updating your email address in the profile.
- **Reset your password**: Steps to request and set a new password.
- **Accept an invitation**: How to accept team invitations and create an account.
- **Legal consent**: Process for accepting updated terms and privacy policies.
- **End your session**: Instructions for logging out of the dashboard.

## Key workflows and rules
### Sign in or Register
1. Navigate to `/auth`.
2. Choose **Login** or **Register**:
   - For Login: Enter **Email** and **Password**, then click **Sign in**.
   - For Registration: Fill in **Email**, **Password**, **Confirm password**, and optionally **Organization name**. Accept terms and click **Create account**.

### Verify Your Email
1. Click the verification link in your email, which routes to `/verify-email`.
2. If successful, you will see **Email verified** and can log in.

### Change Your Email
1. Sign in and go to `/profile`.
2. Enter **New email** and follow the verification process based on current email status.

### Reset Your Password
1. Go to `/reset-password`.
2. Enter your **Email** and click **Send reset link**.
3. Use the link from your email to set a new password.

### Accept an Invitation
1. Open the invite link from your email, which routes to `/invite`.
2. Complete the setup by entering a **Password**, accepting terms, and clicking **Create account**.

### Legal Consent
1. If terms change, you will be redirected to `/legal/consent`.
2. Accept the updated terms and select **Continue**.

## Limits and constraints
- **Invitation Expiration**: Invitations expire after **30 minutes**.
- **Email Verification**: If your email is **Unverified**, you must complete the verification process to change it.
- **Legal Consent**: Access to authenticated routes is blocked until legal consent is accepted.

## Related docs and API areas
- **Dashboard overview**: [Dashboard overview](./dashboard/dashboard-overview.md)
- **Organization and API keys in the dashboard**: [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md)
- **Getting started**: [Getting started](./getting-started.md)
- **Billing and plans in the dashboard**: [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md)
