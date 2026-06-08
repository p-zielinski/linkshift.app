---
source: shared/docs/pages/guides/dashboard/organization-and-api-keys-in-dashboard.md
generatedAt: 2026-06-08T20:08:38.493Z
model: gpt-4o-mini
---

## Purpose
This document is for organization owners and members, explaining how to manage team members and API keys within the LinkShift dashboard.

## What this doc covers
- **Organization Overview**: Accessing organization settings and usage metrics.
- **Plan and Usage**: Viewing limits on domains, rules, active users, and link maps.
- **Team Seats**: Managing active users and seat limits.
- **Members Table**: Viewing and managing organization members.
- **Invite a Teammate**: Steps to invite new members to the organization.
- **API Keys Summary**: Overview of API key usage and management.
- **Create a Key**: Steps to create a new API key.
- **Usage Cards**: Information on API key limits and policies.
- **API Integration**: Accessing the API server base URL and documentation links.
- **Delete a Key**: Steps to delete an API key.

## Key workflows and rules
### Invite a Teammate
1. Enter an email in the **Invite email** field.
2. Click **Send invite**.
   - Invitations expire in 30 minutes and require owner approval to activate.

### Create an API Key
1. Click **Create API key**.
2. In the dialog, set the **Key name** and choose expiration options.
3. Copy the secret from the one-time reveal dialog before closing it.

### Delete an API Key
1. In the API keys table, select **Delete API key**.
2. Confirm deletion in the dialog.

## Limits and constraints
- **Team Seats**: Only active members count towards the seat limit. Owners see a message if all seats are used.
- **API Usage**: Requires a paid plan; free organizations receive a `402 Payment Required` error on Management API calls.
- **API Key Secret**: The secret is shown only once after creation and cannot be retrieved later.

## Related docs and API areas
- [Getting started (API)](../getting-started.md)
- [API reference](../../reference.md)
- [Dashboard overview](./dashboard-overview.md)
