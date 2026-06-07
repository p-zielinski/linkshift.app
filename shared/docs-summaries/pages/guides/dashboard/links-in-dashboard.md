---
source: shared/docs/pages/guides/dashboard/links-in-dashboard.md
generatedAt: 2026-06-07T10:05:11.325Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to create and manage short links through the Links section.

## What this doc covers
- Overview of the Links section in the dashboard (`/links`)
- Filtering links by site
- Handling empty and loading states
- Primary actions available based on setup progress
- Creating a short link using the Create link wizard
- Link map filtering when switching views
- Searching for links
- Browsing and paginating through the links table
- Row actions for individual links
- Editing links in Campaign and Advanced views
- Differences between Campaign and Advanced workspace modes

## Key workflows and rules
1. **Accessing Links**: Navigate to the Links section via the sidebar (`/links`).
2. **Filtering by Site**: Use the Site control in the page header to filter links by a specific site or view all sites if multiple are available.
3. **Creating a Link**:
   - Click **Create link**.
   - Follow the wizard to select a site, enter a short path (lowercase letters, numbers, hyphens), and specify a destination URL (must start with `https://`).
   - After saving, options to copy the short URL, view analytics, or create a QR code are available.
4. **Editing a Link**:
   - In Campaign view, use the simplified editor to change the link path and destination URL.
   - In Advanced view, use the link map entry form to edit the key and destination.
5. **Searching Links**: Use the **Search links** feature, requiring at least 2 characters for filtering results based on short path keys or destination URLs.
6. **Row Actions**: Each link row allows for editing, copying the short URL, or opening analytics.

## Limits and constraints
- At least one site and a connected host are required for the Links table to appear.
- The **Search links** feature requires a minimum of 2 characters to filter results.
- The Create link wizard enforces validation rules for the short path (lowercase letters, numbers, hyphens) and destination URL (must start with `https://`).
- The Campaign view has a simplified editor, while the Advanced view provides a more detailed link map entry form.

## Related docs and API areas
- [Domains and domain groups — In the dashboard](../domains-and-groups.md#in-the-dashboard) — for connecting domains.
- [Analytics in the dashboard](./analytics-in-dashboard.md) — for accessing traffic analytics from links.
- [Dashboard overview](./dashboard-overview.md) — for understanding the differences between Campaign and Advanced views.
- [Settings in the dashboard](./settings-in-dashboard.md) — for information on plan limits and domain/host settings.
