---
source: shared/docs/pages/guides/dashboard/domain-groups-in-dashboard.md
generatedAt: 2026-06-08T20:07:53.210Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing domain groups in the LinkShift dashboard, explaining how to create, edit, and delete these groups.

## What this doc covers
- **List domain groups**: Instructions for viewing existing domain groups and their details.
- **Create a domain group**: Steps to add a new domain group, including setting a name and robots.txt policy.
- **Edit a domain group**: Process for modifying an existing domain group's details and robots.txt policy.
- **Delete a domain group**: Guidelines for permanently removing a domain group and its associated elements.
- **Next steps**: Recommendations for attaching domains and creating redirect rules after group creation.
- **Automate instead**: Information on accessing domain groups via the Management API.

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
2. In the **Details** step, enter a name for the group.
3. In the **Robots.txt** step, choose a policy:
   - None
   - Allow all
   - Disallow all
   - Disallow bad bots
   - Custom (paste robots.txt content within the allowed length)
4. Click **Create** to save the group.

### Edit a Domain Group
1. Open the edit action in the desired table row.
2. Review and modify the **Details** and **Robots.txt** sections as needed.
3. Save the changes.

### Delete a Domain Group
1. Open the delete action in the desired table row.
2. Confirm the deletion in the dialog titled **Delete domain group** (note that this action is permanent).

## Limits and constraints
- The deletion of a domain group is **permanent**, which also removes all tied domains, redirect rules, link maps, and tests.
- When creating a custom robots.txt policy, ensure the content is within the allowed length (specific length not detailed in the source).

## Related docs and API areas
- [Domains and subdomains in the dashboard](./domains-and-subdomains-in-dashboard.md)
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Domains and domain groups — Domain groups](../domains-and-groups.md#domain-groups) (Management API: GET/POST/PUT/DELETE `/api/v1/domain-groups`)
- [Dashboard overview](./dashboard-overview.md)
