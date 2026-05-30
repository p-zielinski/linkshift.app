# Organization and API keys in the dashboard

Invite teammates, review seat usage, and create organization API keys for the Management API.

## Before you start

- Sign in as a member of the organization.
- **Send invite** is available only to organization **owners** with a free seat.

## Organization (`/organization`)

Open **Organization** in the sidebar.

### Team seats

The **Team seats** card shows **Active users: N / max** and a usage bar. Only active members count toward the limit.

If all seats are used, owners see: **All seats are currently used. Upgrade to invite more teammates.**

### Members table

Columns include **Email**, **Role**, **Status**, and **Email verified**. Organization owners can **Block** or **Unblock** non-owner members from row actions.

### Invite a teammate

1. Under **Invite a teammate**, enter an email in **Invite email**.
2. Select **Send invite**.

Invitations expire after 30 minutes (shown on the page). Non-owners see: **Only organization owners can send invites.**

### API keys summary

The **API keys** card shows quota and rate (**calls/min per key**). Select **Manage API keys** to open `/organization/api-keys`.

On-page policy:

- Key management is available on all plans.
- **API usage requires a paid plan** (Free organizations receive `402 Payment Required` on API calls—see [Getting started](../getting-started.md#free-plan-paywall)).

## API keys (`/organization/api-keys`)

### Create a key

1. Select **Create API key**.
2. In the dialog (**Create API key**), set **Key name**, and optionally **Never expires** or **Expires at**.
3. After save, copy the secret from the one-time reveal dialog — it may not appear again.

Use row actions to **Edit API key** (same fields) or delete.

### Usage cards

The page shows **API keys** (created vs allowed), **Rate limit** (calls per minute per key), and **Policy** notes.

### Integration links

- **Go to documentation** — opens `/docs`
- **Download OpenAPI spec** — saves the public contract

### Delete a key

In the table, use the delete action (**Delete API key**), confirm **Delete** in the dialog.

## What you should see

- New invites listed in the members table after send.
- New keys in the table within plan limits; cards turn emphasis when the key limit is reached.

## Automate instead

API key lifecycle (`/api/v1/api-keys`) is dashboard-only. Resource management uses keys documented in [Getting started](../getting-started.md).

## Related

- [Getting started (API)](../getting-started.md)
- [API reference](../../reference.md)
- [Dashboard overview](./dashboard-overview.md)
