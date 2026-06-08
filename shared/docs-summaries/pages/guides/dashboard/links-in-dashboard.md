---
source: shared/docs/pages/guides/dashboard/links-in-dashboard.md
generatedAt: 2026-06-08T20:08:32.929Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to create and manage short links through the Links section.

## What this doc covers
- Overview of the Links section (`/links`) in the dashboard.
- Filtering links by site.
- Handling empty and loading states.
- Primary actions based on setup progress.
- Creating links using the Create link wizard.
- Searching and browsing links.
- Row actions available for each link.
- Differences between Campaign and Advanced workspace views.

## Key workflows and rules
1. **Accessing Links**: Navigate to the Links section via the sidebar (`/links`).
2. **Filtering by Site**: Use the Site control in the page header to filter links by a specific site or view all sites.
3. **Creating a Link**:
   - Click **Create link**.
   - Select a site and review hosts.
   - Enter a short path (lowercase letters, numbers, hyphens) and a destination URL (must start with `https://`).
   - Review the summary and save the link.
4. **Editing a Link**:
   - Click **Edit link** in the row actions.
   - Depending on the view (Campaign or Advanced), follow the respective editor flow.
5. **Searching Links**: Use the **Search links** feature, requiring at least 2 characters to filter results.
6. **Pagination**: Use the table footer paginator to navigate through pages of links.

## Limits and constraints
- At least one site and a connected host are required for the link table to appear.
- The Create link wizard requires a valid short path (lowercase letters, numbers, hyphens) and a destination URL starting with `https://`.
- The search function requires a minimum of 2 characters.
- The Advanced view remembers the last site selection across scoped pages.

## Related docs and API areas
- [Domains and domain groups — In the dashboard](../domains-and-groups.md#in-the-dashboard) — for connecting domains.
- [Analytics in the dashboard](./analytics-in-dashboard.md) — for viewing traffic analytics.
- [Dashboard overview](./dashboard-overview.md) — for understanding Campaign vs Advanced views.
- [Settings in the dashboard](./settings-in-dashboard.md) — for plan limits and domain/host settings.
