---
source: shared/docs/pages/guides/dashboard/domain-groups-in-dashboard.md
generatedAt: 2026-06-07T10:04:44.528Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard who need to understand how to create, manage, and delete domain groups.

## What this doc covers
- Overview of accessing Domain Groups in the dashboard.
- Steps to list existing domain groups.
- Instructions for creating a new domain group.
- Guidelines for editing an existing domain group.
- Procedures for permanently deleting a domain group.
- Next steps after creating a domain group.
- Automation options via the Management API.

## Key workflows and rules
### List Domain Groups
1. Select **Domain Groups** from the sidebar.
2. Review the displayed table containing:
   - Name
   - ID
   - Robots policy
   - Domain count
   - Row actions
3. Use the footer paginator to navigate through pages.

### Create a Domain Group
1. Select **Add group** on the **Domain Groups** page.
2. **Details** step: Enter a name for the group.
3. **Robots.txt** step: Choose a policy from the following options:
   - None
   - Allow all
   - Disallow all
   - Disallow bad bots
   - Custom (paste robots.txt content within the allowed length)
4. Select **Create** to save the new group.

### Edit a Domain Group
1. Open the edit action for the desired domain group in the table.
2. Review and modify values in the **Details** and **Robots.txt** sections.
3. Save changes.

### Delete a Domain Group
1. Open the delete action for the desired domain group in the table.
2. Confirm deletion in the dialog titled **Delete domain group** (note that this action is permanent).

## Limits and constraints
- Deleting a domain group is a **permanent** action that removes all tied domains, rules, link maps, and tests.
- When creating a custom robots.txt policy, ensure the content is within the allowed length (specific length not provided in the source).

## Related docs and API areas
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups — Domain groups (API)](../domains-and-groups.md#domain-groups)
- Management API: `GET/POST/PUT/DELETE /api/v1/domain-groups`
- [Dashboard overview](./dashboard-overview.md)
