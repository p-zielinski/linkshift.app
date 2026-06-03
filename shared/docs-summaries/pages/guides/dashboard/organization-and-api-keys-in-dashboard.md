---
source: shared/docs/pages/guides/dashboard/organization-and-api-keys-in-dashboard.md
generatedAt: 2026-06-03T16:58:06.895Z
model: gpt-4o-mini
---

## Purpose
This document is for organization owners and members, explaining how to manage team seats and API keys within the dashboard.

## What this doc covers
- **Organization**: Overview of managing team seats and member roles.
- **Team seats**: Information on active users and usage limits.
- **Members table**: Details on member roles, status, and actions available to owners.
- **Invite a teammate**: Steps to invite new members to the organization.
- **API keys summary**: Overview of API key management and usage policies.
- **API keys**: Instructions for creating, editing, and deleting API keys.
- **Usage cards**: Information displayed regarding API keys and rate limits.
- **Integration links**: Options for accessing documentation and downloading the OpenAPI specification.
- **What you should see**: Expected outcomes after actions are performed.
- **Automate instead**: Information on API key lifecycle management.

## Key workflows and rules
### Invite a teammate
1. Navigate to **Invite a teammate** section.
2. Enter the email in **Invite email**.
3. Click **Send invite**.
   - Note: Invitations expire after 30 minutes. Only organization owners can send invites.

### Create an API key
1. Go to **Organization** → **Manage API keys**.
2. Click **Create API key**.
3. In the dialog, set **Key name**, and choose options for expiration.
4. After saving, copy the secret from the one-time reveal dialog.

### Delete an API key
1. In the API keys table, select **Delete API key**.
2. Confirm deletion in the dialog.

## Limits and constraints
- **Team seats**: Only active members count toward the maximum limit. Owners see a message if all seats are used.
- **API usage**: Requires a paid plan; free organizations receive a `402 Payment Required` error on Management API calls.
- **API key secret**: The secret is shown only once after creation and cannot be retrieved later.

## Related docs and API areas
- [Getting started (API)](../getting-started.md)
- [API reference](../../reference.md)
- [Dashboard overview](./dashboard-overview.md)
