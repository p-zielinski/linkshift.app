---
source: shared/docs/pages/guides/dashboard/domain-groups-in-dashboard.md
generatedAt: 2026-06-14T15:24:39.667Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing domain groups in the LinkShift dashboard, explaining how to create, edit, and delete these groups.

## What this doc covers
- Accessing Domain Groups in the dashboard
- Listing domain groups and their attributes
- Creating a new domain group
- Editing an existing domain group
- Permanently deleting a domain group
- Next steps after creating a domain group
- Automation options via the Management API

## Key workflows and rules
### List Domain Groups
1. Select **Domain Groups** from the sidebar.
2. Review the displayed table with columns for name, redirect type, robots.txt policy, ID, domains, creation date, and available actions.

### Create a Domain Group
1. Click **Add group** in the Domain Groups section.
2. **Details**: Enter a name and select a redirect behavior:
   - **Instant redirect**: Immediate redirection.
   - **Redirect with notice**: Displays a notice page before redirecting (includes a 10-second countdown and a "Continue now" option).
3. **Robots.txt**: Choose a policy:
   - None
   - Allow all
   - Disallow all
   - Disallow bad bots
   - Custom (input robots.txt content within allowed length).
4. Click **Create** to save the group.

### Edit a Domain Group
1. Open the edit action for the desired group in the table.
2. Review and modify the **Details** and **Robots.txt** sections as needed.
3. Save changes.

### Delete a Domain Group
1. Open the delete action for the desired group.
2. Confirm deletion in the dialog titled **Delete domain group** (this action is permanent).

## Limits and constraints
- **Robots.txt Custom Content**: Must adhere to a specified length limit (not detailed in the source).
- **Permanent Deletion**: Deleting a domain group is irreversible and will remove all associated domains, rules, link maps, and tests.

## Related docs and API areas
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups (API)](../domains-and-groups.md)
- Management API: `GET/POST/PUT/DELETE /api/v1/domain-groups`
- [Dashboard overview](./dashboard-overview.md)
