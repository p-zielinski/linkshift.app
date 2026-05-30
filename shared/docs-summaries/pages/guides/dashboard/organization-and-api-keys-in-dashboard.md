---
source: shared/docs/pages/guides/dashboard/organization-and-api-keys-in-dashboard.md
generatedAt: 2026-05-30T07:00:12.294Z
model: gpt-4o-mini
---

## Purpose
This document is for organization owners and members, explaining how to manage team seats and API keys within the LinkShift dashboard.

## What this doc covers
- **Before you start**: Requirements for signing in and sending invites.
- **Organization (`/organization`)**: Overview of team seats, members table, and inviting teammates.
- **API keys summary**: Information on API key management and usage policies.
- **API keys (`/organization/api-keys`)**: Steps for creating, editing, and deleting API keys, along with usage cards and integration links.

## Key workflows and rules
### Inviting a Teammate
1. Navigate to **Invite a teammate** section.
2. Enter the email in **Invite email**.
3. Click **Send invite**.
   - Note: Invitations expire after 30 minutes. Only organization owners can send invites.

### Creating an API Key
1. Click **Create API key**.
2. In the **Create API key** dialog, set **Key name** and choose expiration options.
3. After saving, copy the secret from the one-time reveal dialog.
4. Use row actions to **Edit API key** or delete it.

### Deleting an API Key
1. In the API keys table, select **Delete API key**.
2. Confirm the deletion in the dialog.

## Limits and constraints
- **Team Seats**: Only active members count toward the limit. Owners see a message if all seats are used.
- **API Usage**: Requires a paid plan; free organizations receive a `402 Payment Required` error on API calls.
- **Invitations**: Expire after 30 minutes.

## Related docs and API areas
- [Getting started (API)](../getting-started.md)
- [API reference](../../reference.md)
- [Dashboard overview](./dashboard-overview.md)
- API key lifecycle management is available at `/api/v1/api-keys`.
