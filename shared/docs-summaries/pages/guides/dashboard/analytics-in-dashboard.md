---
source: shared/docs/pages/guides/dashboard/analytics-in-dashboard.md
generatedAt: 2026-06-07T10:04:24.246Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to view and analyze redirect traffic through the analytics features available in both Campaign and Advanced views.

## What this doc covers
- Overview of the **Analytics** feature in both dashboard modes.
- Differences in analytics views: **Campaign** (`/analytics`) vs. **Advanced** (`/redirect-rules-analytics`).
- Requirements for loading analytics data, including site and host prerequisites.
- Description of empty states and user prompts based on missing prerequisites.
- Filtering options by site and time range for analytics data.
- Details on reading analytics results, including traffic charts and tables.
- Automation options for retrieving traffic reports via API.

## Key workflows and rules
1. **Accessing Analytics**:
   - Select **Analytics** from the sidebar.
   - In **Campaign** view, the link is always visible. In **Advanced** view, it is disabled until at least one site exists.

2. **Handling Empty States**:
   - **Campaign View**:
     - If no sites exist: Guided empty state prompts to set up a domain.
     - If sites exist but no hosts: Prompts to add a host.
   - **Advanced View**:
     - If no sites exist: Sidebar disabled; redirects to **Domain Groups**.
     - If sites exist but no hosts: On-page empty state prompts to add a host.

3. **Filtering by Site**:
   - In **Campaign** view, select from the **Site** menu if multiple sites exist.
   - In **Advanced** view, the menu shows only the single site available.

4. **Choosing a Time Range**:
   - Quick ranges available: Last 3, 7, 14, or 30 days.
   - For a custom range, set **Start date & time** and **End date & time**, then select **Apply range**.

5. **Reading Results**:
   - **Campaign View**: Displays a traffic chart and a table under **Link performance** with short link paths and top keys.
   - **Advanced View**: Displays a table with source paths, resolved destinations, and top requests.

## Limits and constraints
- Analytics data requires at least one site with a connected host to load.
- Data retention is based on the user's plan, with limits displayed at the top of the analytics page.
- Data older than the retention window may not appear, even if a wider custom range is selected.
- The **Site** filter in **Campaign** view is hidden if only one site exists.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md) - for API traffic reports.
- [Links in the dashboard](./links-in-dashboard.md) - includes how to open analytics from link rows.
- [Dashboard overview](./dashboard-overview.md) - provides context on subscription limits and analytics retention.
