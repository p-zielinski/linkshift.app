---
source: shared/docs/pages/guides/account-and-access.md
generatedAt: 2026-06-30T19:39:51.526Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift and explains the processes for account management, including sign-in, registration, email verification, password reset, and legal consent.

## What this doc covers
- **Bot protection**: Details on Cloudflare Turnstile for sign-in and registration.
- **Sign in or register**: Steps for signing in and creating an account, including fields required.
- **What registration creates**: Overview of what is set up upon registration.
- **Verify your email**: Steps to verify your email after registration or change.
- **Change your email**: Process for changing your email address.
- **Reset your password**: Steps to reset your password through the login tab.
- **Accept an invitation**: Instructions for accepting team invitations.
- **Legal consent**: Process for accepting updated terms and privacy policies.
- **End your session**: How to log out of the dashboard.

## Key workflows and rules
### Sign in or Register
1. **Sign in**:
   - Navigate to the **Login** tab.
   - Enter **Email** and **Password**.
   - Click **Sign in**.
2. **Register**:
   - Navigate to the **Register** tab.
   - Fill in **Email**, **Password**, **Confirm password**, and **Organization name** (optional).
   - Choose a plan and billing interval.
   - Accept Terms of Service and Privacy Policy.
   - Click **Create account**.

### Verify Your Email
1. Click the verification link in the email.
2. Wait for the verification process.
3. If successful, proceed to login.

### Change Your Email
1. Sign in and go to **Profile**.
2. Enter **New email**.
3. If current email is verified, send a verification code and confirm.
4. If unverified, update email and send verification.

### Reset Your Password
1. Click **Forgot password?** on the **Login** tab.
2. Enter **Email** and click **Send reset link**.
3. Use the link from the email to set a new password.

### Accept an Invitation
1. Open the invite link from your email.
2. Enter **Password** and **Confirm password**.
3. Accept Terms of Service and Privacy Policy.
4. Click **Create account**.

### Legal Consent
1. Redirected to **Review updated terms** upon changes.
2. Accept the updated terms and confirm minimum age.
3. Click **Continue** to unblock other routes.

## Limits and constraints
- **Invitations** expire after **30 minutes**.
- Registration does not assign a public short-link hostname.
- Bot protection via Cloudflare Turnstile is required for sign-in, registration, and password reset.
- Until legal consent is accepted, access to other authenticated routes is blocked.

## Related docs and API areas
- [Getting started](./getting-started.md) — Information on obtaining Management API keys.
- [Dashboard overview](./dashboard/dashboard-overview.md) — Overview of the dashboard shell and profile.
- [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) — Managing team invites and API keys.
- [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md) — Information on upgrading and subscription limits.
