---
source: shared/docs/pages/guides/dashboard/domain-groups-in-dashboard.md
generatedAt: 2026-05-30T06:59:48.729Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard and explains how to create and manage domain groups.

## What this doc covers
- **Before you start**: Requirements for accessing Domain Groups.
- **List domain groups**: Instructions for viewing existing domain groups and their details.
- **Create a domain group**: Step-by-step process for adding a new domain group.
- **Edit a domain group**: How to modify an existing domain group's details.
- **Delete a domain group**: Steps to permanently remove a domain group and its implications.
- **What you should see**: Expected outcomes after creating or modifying domain groups.
- **Automate instead**: Information on using the Management API for domain groups.
- **Related**: Links to additional documentation relevant to domain groups.

## Key workflows and rules
### List Domain Groups
1. Navigate to **Domain Groups** (`/domain-groups`).
2. Review the displayed table for group names, domain counts, and available actions.
3. Adjust page size (10, 20, or 50) or navigate between pages using the table footer.

### Create a Domain Group
1. Click **Add group** on the **Domain Groups** page.
2. In the **Details** step, enter a name for the group.
3. In the **Robots.txt** step, select a policy:
   - None
   - Allow all
   - Disallow all
   - Disallow bad bots
   - Custom (with a character limit for content)
4. Click **Create** to finalize the group creation.

### Edit a Domain Group
1. Access the edit action from the desired row in the table.
2. Review and modify the **Details** and **Robots.txt** as needed.
3. Save the changes.

### Delete a Domain Group
1. Select the delete action from the table row.
2. Confirm deletion in the dialog titled **Delete domain group**.
3. Note that deleting a group will affect associated domains and redirect resources.

## Limits and constraints
- The **Robots.txt** custom content must adhere to a specified character limit (not detailed in the source).
- Deleting a domain group is permanent and will impact any domains, redirect rules, and link maps associated with that group.

## Related docs and API areas
- **Dashboard Documentation**:
  - [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
  - [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
  - [Dashboard overview](./dashboard-overview.md)
  
- **Management API**:
  - For domain groups, see [Domains and domain groups](../domains-and-groups.md#domain-groups) for `GET`, `POST`, `PUT`, and `DELETE` operations on `/api/v1/domain-groups`.
