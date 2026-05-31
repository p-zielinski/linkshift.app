---
source: shared/docs/pages/guides/account-and-access.md
generatedAt: 2026-05-31T12:10:10.508Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift and explains how to manage account access, including sign-in, registration, email verification, password reset, and legal consent.

## What this doc covers
- **Before you start**: Overview of account flows and programmatic access.
- **Sign in or register**: Steps to log in or create an account at `/auth`.
- **Verify your email**: Process for verifying email addresses after registration or changes.
- **Change your email**: Instructions for updating your email address.
- **Reset your password**: Steps to request and set a new password.
- **Accept an invitation**: How to accept team invites and create an account.
- **Legal consent**: Requirements for accepting updated terms and privacy policies.
- **End your session**: Logging out of the dashboard.

## Key workflows and rules
### Sign in or Register
1. Navigate to `/auth`.
2. Use the **Login** tab to enter your **Email** and **Password**.
3. Use the **Register** tab to create an account with:
   - **Email**
   - **Password**
   - **Confirm password**
   - **Organization name** (optional)
   - Accept Terms of Service and Privacy Policy.
   - Choose a plan and billing interval (if available).
4. Click **Create account**.

### Verify Your Email
1. Click the verification link sent to your email, which routes to `/verify-email`.
2. If successful, you will see **Email verified** and can proceed to login.

### Change Your Email
1. Sign in and go to `/profile`.
2. Enter **New email** and follow the verification process based on your current email status.

### Reset Your Password
1. Go to `/reset-password` and enter your **Email**.
2. Click **Send reset link** and follow the instructions in the email to set a new password.

### Accept an Invitation
1. Open the invite link from your email, which routes to `/invite`.
2. Complete the setup by entering a **Password**, accepting terms, and clicking **Create account**.

### Legal Consent
1. If terms change, you will be redirected to `/legal/consent`.
2. Accept the updated terms and confirm your age to continue using the dashboard.

## Limits and constraints
- Registration may be closed temporarily, displaying **Private testing in progress**.
- Invitations expire after **30 minutes**.
- Legal consent must be accepted to access other authenticated routes.
- Authenticated Management API requests are blocked until legal consent is current.

## Related docs and API areas
- **Dashboard overview**: [Dashboard overview](./dashboard/dashboard-overview.md)
- **Organization and API keys in the dashboard**: [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md)
- **Getting started**: [Getting started](./getting-started.md)
- **Billing and plans in the dashboard**: [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md)
