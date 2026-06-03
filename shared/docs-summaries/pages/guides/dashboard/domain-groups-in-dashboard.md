---
source: shared/docs/pages/guides/dashboard/domain-groups-in-dashboard.md
generatedAt: 2026-06-03T16:57:43.254Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard and explains how to create and manage domain groups.

## What this doc covers
- **List domain groups**: Instructions on how to view existing domain groups and their details.
- **Create a domain group**: Steps to add a new domain group, including setting a name and robots.txt policy.
- **Edit a domain group**: Process for modifying an existing domain group's details.
- **Delete a domain group**: Guidelines for permanently removing a domain group and its associated resources.
- **What you should see**: Expected outcomes after creating or modifying domain groups.
- **Automate instead**: Information on managing domain groups via the Management API.

## Key workflows and rules
### List Domain Groups
1. Select **Domain Groups** from the sidebar.
2. Review the displayed table for group names, domain counts, and available actions.

### Create a Domain Group
1. Click **Add group** on the **Domain Groups** page.
2. In **Domain group details**, enter a name for the group.
3. In **Robots.txt policy**, select one of the following:
   - Do not use (None)
   - Allow all
   - Disallow all
   - Disallow bad bots
   - Custom (input robots.txt content within the allowed length)
4. Click **Create** to finalize the group creation.

### Edit a Domain Group
1. Access the edit action from the desired domain group's table row.
2. Review and modify the **Details** and **Robots.txt** sections as needed.
3. Save the changes.

### Delete a Domain Group
1. Open the delete action from the table row of the domain group.
2. Confirm deletion in the dialog titled **Delete domain group**. Note that this action is permanent and will remove all tied domains, rules, link maps, and tests.

## Limits and constraints
- The robots.txt content for custom policies must adhere to a specified length limit (not explicitly stated in the source).
- Deleting a domain group is irreversible and will affect all associated resources, including domains, redirect rules, and link maps.

## Related docs and API areas
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups — Domain groups (API)](../domains-and-groups.md#domain-groups)
- Management API endpoints: `GET/POST/PUT/DELETE /api/v1/domain-groups`
- [Dashboard overview](./dashboard-overview.md)
