---
source: shared/docs/pages/guides/dashboard/organization-and-api-keys-in-dashboard.md
generatedAt: 2026-06-07T10:05:16.136Z
model: gpt-4o-mini
---

## Purpose
This document is for organization owners and members, explaining how to manage team members and API keys within the LinkShift dashboard.

## What this doc covers
- **Organization Overview**: Accessing organization settings and usage metrics.
- **Plan and Usage**: Viewing limits on domains, rules, active users, and link maps.
- **Team Seats**: Managing active user limits and inviting new members.
- **Members Table**: Overview of organization members and their roles.
- **Invite a Teammate**: Steps to invite new members to the organization.
- **API Keys Summary**: Overview of API key usage and management.
- **API Keys Management**: Creating, editing, and deleting API keys.
- **API Integration**: Accessing the API server base URL and documentation links.

## Key workflows and rules
### Invite a Teammate
1. Enter an email in the **Invite email** field.
2. Click **Send invite**.
   - Invitations expire in 30 minutes and require owner approval to activate.

### Create an API Key
1. Click **Create API key**.
2. Fill in the **Key name** and set expiration options.
3. Copy the secret from the one-time reveal dialog after saving.

### Delete an API Key
1. Select the API key in the table.
2. Click **Delete API key** and confirm in the dialog.

## Limits and constraints
- **Team Seats**: Only active members count towards the limit. Owners see a message if all seats are used.
- **API Usage**: Requires a paid plan; free organizations receive a `402 Payment Required` error on Management API calls.
- **API Key Secret**: The secret is shown only once upon creation and cannot be retrieved later.

## Related docs and API areas
- [Getting started (API)](../getting-started.md)
- [API reference](../../reference.md)
- [Dashboard overview](./dashboard-overview.md)
