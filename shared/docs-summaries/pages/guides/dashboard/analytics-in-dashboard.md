---
source: shared/docs/pages/guides/dashboard/analytics-in-dashboard.md
generatedAt: 2026-05-30T06:59:34.377Z
model: gpt-4o-mini
---

## Purpose
This document is for users who want to view and analyze redirect traffic data in the dashboard.

## What this doc covers
- **Before you start**: Requirements for viewing analytics, including the need for at least one domain group.
- **Open analytics**: Instructions for accessing the analytics page at `/redirect-rules-analytics`.
- **Filter by domain group**: How to select a specific domain group or view all groups.
- **Choose a time range**: Options for selecting quick ranges or a custom date range for analytics.
- **Read results**: Description of the results area, including traffic charts and rule details.
- **What you should see**: Expected outcomes when using the analytics feature.
- **Automate instead**: Information on using the API for programmatic access to traffic reports.

## Key workflows and rules
1. **Accessing Analytics**:
   - Navigate to **Analytics** in the sidebar (`/redirect-rules-analytics`).
   - Ensure at least one domain group exists; otherwise, you will be redirected to the **Dashboard**.

2. **Filtering Data**:
   - Use the **Domain group** control to select either **All domain groups** or a specific group.
   - Choose a time range using either:
     - **Quick ranges**: Last 3, 7, 14, or 30 days.
     - **Custom range**: Set **Start date & time** and **End date & time**, then select **Apply range**.

3. **Viewing Results**:
   - The results area displays a traffic chart and a table of top rules with traffic.
   - Click on a rule row to view **Rule analytics details**, which includes hit counts for the selected window.

4. **Automating Reports**:
   - Use `GET /api/v1/redirect-rules/analytics` for traffic reports.
   - For simulation, use `POST /api/v1/redirect-rules/simulate`.

## Limits and constraints
- Analytics retention is dependent on the user's subscription plan, indicated by **Current plan retention days** at the top of the page.
- Data outside the retention window may not appear, even if an older custom range is selected.
- API time windows differ from UI quick ranges; API presets (`day`, `week`, `month`) use UTC hourly rolling buckets (24 / 168 / 720 hours). To match dashboard selections, provide specific `start` and `end` parameters in UTC.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Dashboard overview](./dashboard-overview.md)
