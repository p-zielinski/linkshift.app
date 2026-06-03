---
source: shared/docs/pages/guides/dashboard/analytics-in-dashboard.md
generatedAt: 2026-06-03T16:57:23.003Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard who want to view and analyze redirect traffic data.

## What this doc covers
- Overview of accessing analytics in the dashboard.
- Instructions for filtering analytics by domain group.
- Options for selecting a time range for traffic data.
- Details on reading and interpreting analytics results.
- Information on automating traffic reports via API.

## Key workflows and rules
1. **Accessing Analytics:**
   - Navigate to **Analytics** in the sidebar.
   - Note: You must have at least one domain group created; otherwise, you will be redirected to the **Dashboard**.

2. **Filtering by Domain Group:**
   - Use the **Domain group** control to select either **All domain groups** or a specific group.

3. **Choosing a Time Range:**
   - **Quick Ranges:** Select from predefined options (Last 3, 7, 14, or 30 days).
   - **Custom Range:**
     1. Set **Start date & time** and **End date & time**.
     2. Click **Apply range**.

4. **Reading Results:**
   - View a traffic chart and a table of top rules with traffic.
   - Click on a rule row to access **Rule analytics details**, which shows **Hits in range**.

## Limits and constraints
- At least one domain group is required to access analytics; otherwise, users are redirected to the dashboard.
- Analytics retention is dependent on the user's subscription plan, with data older than the **Current plan retention days** potentially not appearing, even if a wider custom range is selected.
- The dashboard's quick ranges use calendar-style day counts, while the API uses UTC hourly rolling buckets (24 / 168 / 720 hours). To replicate dashboard ranges in API calls, provide matching `start` and `end` parameters.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md#analytics) (for programmatic traffic reports using `GET /api/v1/redirect-rules/analytics`)
- [Dashboard overview](./dashboard-overview.md)
