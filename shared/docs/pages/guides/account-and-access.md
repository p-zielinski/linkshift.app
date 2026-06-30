# Account and access

Sign in, register, verify email, reset your password, accept team invites, and complete legal consent before you use the dashboard shell.

:::info
Account flows run in the **web app** — not inside the dashboard sidebar and not through the Management API. After sign-in, you may need to accept updated terms on the **Review updated terms** screen before other shell routes load.
:::

Programmatic access starts after you have an account and an API key — see [Getting started](./getting-started.md).

## Bot protection

Sign-in, registration, password reset requests, and team invite acceptance use **Cloudflare Turnstile** bot protection. The challenge usually runs invisibly in the browser before your request is sent. If Turnstile cannot load (for example, because a browser extension blocks third-party scripts), the form may fail — try another browser or disable the blocker for this site.

## Sign in or register

Open **Sign in** from the sign-in link (marketing site or after sign-out). This page is outside the authenticated app shell.

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

Turnstile runs automatically when you select **Sign in** or **Create account**; no separate step is shown in most cases.

From the **Login** tab, select **Forgot password?** to open the password reset flow.

After sign-in, LinkShift opens the authenticated app shell. By default you land on **Overview** (`/overview`) in **Campaign** view. Switch to **Advanced** view for the operational **Dashboard** at `/dashboard` — see [Dashboard overview](./dashboard/dashboard-overview.md#campaign-and-advanced-views).

The public marketing site uses `/` for visitors who are not signed in. That URL is separate from app **Overview** at `/overview`.

If registration is temporarily closed, the page shows **Private testing in progress** instead of the tabs.

### What registration creates

Registration sets up your organization workspace — it does **not** assign a public short-link hostname yet.

LinkShift creates:

- Your **organization** and owner account
- A **Default** domain group
- A starter **link map** and **redirect rule** in that group

It does **not** automatically create a LinkShift subdomain (for example `yourname.linkshift.app`) or add a custom domain. Connect your first host when you are ready:

1. Complete the **onboarding** wizard after sign-in, or
2. Open **Connect your domain** from the dashboard (for example from **Links** or **Domains**)

See [Domains and subdomains in the dashboard](./dashboard/domains-and-subdomains-in-dashboard.md) for adding a subdomain or custom domain and verifying DNS.

## Verify your email

When you register or change email, LinkShift sends a verification link.

1. Open the link from your email (verification page).
2. While the link is processed, you see **Verifying your email**.
3. On success: **Email verified** — then **Go to login** or open **Sign in**.

If verification fails, follow the message on the page or resend from the dashboard:

1. Sign in and open **Profile** in the sidebar.
2. When your email is **Unverified**, select **Resend verification email** (browser only).

## Change your email

1. Sign in and open **Profile** in the sidebar.
2. Enter **New email**.
3. If your current email is **Verified**, select **Send verification code**, enter **Verification code**, then **Confirm email**.
4. If **Unverified**, select **Update email and send verification** instead.

## Reset your password

Open the password reset flow from **Forgot password?** on the **Login** tab.

**Request a reset link**

1. Enter **Email**.
2. Select **Send reset link** — protected by Turnstile the same way as sign-in.
3. Use the link from your email to continue on the reset page.

**Set a new password** (from the email link)

1. On the reset page, enter **New password** and **Confirm password**.
3. Select **Update password**.
4. Open **Sign in** and sign in with your new password.

There is no in-dashboard password change. Use this flow from **Forgot password?** on the login tab.

## Accept an invitation

Organization owners send invites from **Organization** (Advanced view) or **Settings** → **Manage team** (Campaign view) — see [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md#invite-a-teammate).

1. Open the invite link from your email.
2. On **Join {organizationName}**, enter **Password** and **Confirm password**.
4. Accept Terms of Service, Privacy Policy, and age confirmation.
5. Select **Create account** — protected by Turnstile before your password is submitted.

On success: **Invitation accepted** — verify your email. If your access is blocked, ask an organization owner to **Unblock** you from [Organization and API keys in the dashboard — Members](./dashboard/organization-and-api-keys-in-dashboard.md#members-table) (**Block** / **Unblock** on the member row).

Invitations expire after **30 minutes**. If the invite is invalid, you see **Invite unavailable**.

## Legal consent

When terms or privacy policy change, LinkShift blocks other authenticated routes until you accept the update. The legal basis and process are described in the [Terms of Service](/terms) (**Acceptance**, **Changes to these Terms**) and [Privacy Policy](/privacy) (**Changes to this Privacy Policy**).

1. You are redirected to **Review updated terms**.
2. Accept [Terms of Service](/terms), [Privacy Policy](/privacy), and confirm minimum age.
3. Select **Continue**.

LinkShift records the version identifier and acceptance timestamps on your account.

You can also open consent from **Profile** via **Review and accept updates** when an update is pending.

Other dashboard routes and sidebar links stay blocked until you select **Continue**. The app shell only allows the consent screen and **Log out** until consent is recorded.

## End your session

In the dashboard sidebar footer, select **Log out**. You return to **Sign in**.

:::ai-only
Web app routes: sign-in `/auth` (page title Sign in), password reset `/reset-password`, email verification `/verify-email`, invites `/invite`, legal consent `/legal/consent`, dashboard shell after sign-in. Profile `/profile`. Marketing site root `/` (signed out). Campaign landing `/overview`; Advanced landing `/dashboard`. Mode key `linkshift-dashboard-mode` (`campaign` | `advanced`). Log out returns to `/auth`. Auth POSTs send `X-Turnstile-Token` when `APP_TURNSTILE_SITE_KEY` is configured. Until legal consent is current, authenticated Management API calls using the user session are blocked (not API-key calls).
:::

## Related

- [Dashboard overview](./dashboard/dashboard-overview.md) — shell, profile, billing summary
- [Organization and API keys in the dashboard](./dashboard/organization-and-api-keys-in-dashboard.md) — invites and API keys
- [Getting started](./getting-started.md) — Management API keys after sign-in
- [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md) — upgrade and subscription from **Dashboard** (Advanced) or limits on **Settings** (Campaign)
