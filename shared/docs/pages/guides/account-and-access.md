# Account and access

Sign in, register, verify email, reset your password, accept team invites, and complete legal consent before you use the dashboard shell.

## Before you start

- Account flows run in the **web app** at dedicated routes — not inside the dashboard sidebar and not through the Management API.
- After sign-in, you may need to accept updated terms at `/legal/consent` before other shell routes load.
- Programmatic access starts after you have an account and an API key — see [Getting started](./getting-started.md).

## Sign in or register

Open `/auth` (page title **Access Control**). This page is outside the authenticated app shell.

1. Use the **Login** tab to sign in:
   - **Email**
   - **Password**
   - **Sign in**
2. Or use the **Register** tab to create an account:
   - **Email**
   - **Password**
   - **Confirm password**
   - **Organization name (optional)** — leave empty to use your email prefix as the initial organization name
   - Choose a plan and billing interval when registration is open
   - Accept Terms of Service, Privacy Policy, and age confirmation
   - **Create account**

From the **Login** tab, select **Forgot password?** to open `/reset-password`.

If registration is temporarily closed, the page shows **Private testing in progress** instead of the tabs.

## Verify your email

When you register or change email, LinkShift sends a verification link.

1. Open the link from your email — it routes to `/verify-email`.
2. While the link is processed, you see **Verifying your email**.
3. On success: **Email verified** — then **Go to login** or sign in at `/auth`.

If verification fails, follow the message on the page or resend from the dashboard:

1. Sign in and open **Profile** (`/profile`).
2. When your email is **Unverified**, select **Resend verification email** (browser only).

## Change your email

1. Sign in and open **Profile** in the sidebar (`/profile`).
2. Enter **New email**.
3. If your current email is **Verified**, select **Send verification code**, enter **Verification code**, then **Confirm email**.
4. If **Unverified**, select **Update email and send verification** instead.

## Reset your password

Open `/reset-password`.

**Request a reset link**

1. Enter **Email**.
2. Select **Send reset link**.
3. Use the link from your email — it returns you to `/reset-password` with a token.

**Set a new password** (from the email link)

1. Page title **Set a new password**.
2. Enter **New password** and **Confirm password**.
3. Select **Update password**.
4. Sign in at `/auth`.

There is no in-dashboard password change. Use this flow from **Forgot password?** on the login tab.

## Accept an invitation

Organization owners send invites from **Organization** — see [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md#invite-a-teammate).

1. Open the invite link from email — route `/invite`.
2. Page title **Join {organizationName}** — complete setup for the invited email.
3. Enter **Password** and **Confirm password**.
4. Accept Terms of Service, Privacy Policy, and age confirmation.
5. Select **Create account**.

On success: **Invitation accepted** — verify your email. If your access is blocked, ask an organization owner to **Unblock** you from [Organization and API keys in the dashboard — Members](./dashboard/organization-and-api-keys-in-dashboard.md#members-table) (**Block** / **Unblock** on the member row).

Invitations expire after **30 minutes**. If the invite is invalid, you see **Invite unavailable**.

## Legal consent

When terms or privacy policy change, LinkShift blocks other authenticated routes until you accept the update. The legal basis and process are described in the [Terms of Service](/terms) (**Acceptance**, **Changes to these Terms**) and [Privacy Policy](/privacy) (**Changes to this Privacy Policy**).

1. You are redirected to `/legal/consent` (title **Review updated terms**).
2. Accept [Terms of Service](/terms), [Privacy Policy](/privacy), and confirm minimum age.
3. Select **Continue**.

LinkShift records the version identifier and acceptance timestamps on your account.

You can also open consent from **Profile** via **Review and accept updates** when an update is pending.

Other dashboard routes and sidebar links stay blocked until you select **Continue**. The app shell only allows `/legal/consent` and **Log out** until consent is recorded. Authenticated Management API requests with your user session are also blocked until acceptance is current.

## End your session

In the dashboard sidebar footer, select **Log out**. You return to `/auth`.

## Related

- [Dashboard overview](./dashboard/dashboard-overview.md) — shell, profile, billing summary
- [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) — invites and API keys
- [Getting started](./getting-started.md) — Management API keys after sign-in
- [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md) — upgrade and subscription on `/dashboard`
