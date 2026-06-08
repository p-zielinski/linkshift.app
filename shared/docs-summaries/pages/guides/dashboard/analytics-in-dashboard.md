---
source: shared/docs/pages/guides/dashboard/analytics-in-dashboard.md
generatedAt: 2026-06-08T20:07:29.627Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to view and analyze redirect traffic through the analytics features.

## What this doc covers
- Overview of the **Analytics** feature in both **Campaign** and **Advanced** dashboard views.
- Differences in analytics access and data display based on the dashboard mode.
- Instructions for opening analytics and handling empty states.
- Filtering analytics data by site and selecting time ranges.
- Reading and interpreting analytics results, including traffic charts and tables.
- Automation options for retrieving traffic reports via API.

## Key workflows and rules
1. **Accessing Analytics**:
   - Select **Analytics** from the sidebar.
   - In **Campaign** view, the sidebar item is always visible. In **Advanced** view, it is disabled until at least one site exists.

2. **Handling Empty States**:
   - **Campaign View**:
     - No sites: Displays a guided empty state prompting to set up a domain.
     - Sites but no hosts: Prompts to add a host.
   - **Advanced View**:
     - No sites: Sidebar item disabled; redirects to **Domain Groups**.
     - Sites but no hosts: Displays an empty state prompting to add a host.

3. **Filtering by Site**:
   - **Campaign View**: Allows filtering by site when multiple sites exist.
   - **Advanced View**: Only allows selection of a single site.

4. **Choosing a Time Range**:
   - Quick ranges: Last 3, 7, 14, or 30 days.
   - Custom range: Set start and end date & time, then select **Apply range**.

5. **Reading Results**:
   - **Campaign View**: Displays a traffic chart and a table under **Link performance**.
   - **Advanced View**: Displays a table without a specific heading, showing source paths and top requests.

## Limits and constraints
- Analytics data retention depends on the user's subscription plan, with specific limits displayed on the analytics page.
- Data older than the retention window may not appear, even if a wider custom date range is selected.
- At least one site with a connected host is required for analytics data to load.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md) - includes API for programmatic traffic reports via `GET /api/v1/redirect-rules/analytics`.
- [Links in the dashboard](./links-in-dashboard.md) - includes information on opening analytics from link rows.
- [Dashboard overview](./dashboard-overview.md) - provides context on subscription limits and analytics retention.
