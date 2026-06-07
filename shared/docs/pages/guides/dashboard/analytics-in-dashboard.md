# Analytics in the dashboard

View redirect traffic for a time window, filter by site or domain group, and open rule details from analytics results.

The sidebar label is **Analytics** in both dashboard modes, but the route and workspace filter differ:

- **Campaign** view — `/analytics` with a **Site** filter on the page
- **Advanced** view — `/redirect-rules-analytics` with a **Domain group** filter on the page (the shell **Workspace** selector also applies when shown)

You need at least one domain group with rules receiving traffic. Analytics retention depends on your plan — the dashboard shows **Current plan retention days** at the top of the page.

:::info
In **Advanced** view, **Analytics** needs at least one domain group; without one, the app redirects you to **Dashboard**. In **Campaign** view, open **Analytics** even before a host exists — you see a guided empty state with **Connect your domain** instead of a redirect. Data older than **Current plan retention days** may not appear even if you pick a wider custom range.
:::

## Analytics differs by dashboard mode

| View | Route | Page header | Workspace filter |
|------|--------|-------------|------------------|
| **Campaign** | `/analytics` | **Analytics** — *See how your short links perform over time.* | **Site** on the page |
| **Advanced** | `/redirect-rules-analytics` | **Redirect rules analytics** — *Traffic distribution for the selected time window.* | **Domain group** on the page; shell **Workspace** selector when shown |

In **Campaign** view, the results section uses the **Link performance** heading. Deep links from **Links** (Stats action) open `/analytics` with site, rule, link map, and key query parameters.

## Open analytics

In the sidebar, select **Analytics** (same label in both views). The nav item is always visible.

## Filter by site or domain group

In **Campaign** view, use the **Site** control on the page.

In **Advanced** view, use the **Domain group** control on the page (or the shell **Workspace** selector when shown). When you have multiple groups, you can pick **All domain groups** or a single group.

## Choose a time range

### Quick ranges

Under **Quick ranges**, select:

- Last 3 days
- Last 7 days
- Last 14 days
- Last 30 days

### Custom range

1. Set **Start date & time** and **End date & time**.
2. Select **Apply range**.

Data outside your plan retention window may not appear even if you pick an older custom range.

## Read results

The results area includes:

- A traffic chart for the selected window
- A table of top rules with traffic

Select a rule row to open **Rule analytics details** (*Full rule information with hit count.*). The dialog shows **Hits in range** for your selected window.

## What you should see

- **Current plan retention days** matching your subscription.
- Chart and table updating after you change group or range.
- Empty or loading states when no traffic exists for the filter.

## Automate instead

Use `GET /api/v1/redirect-rules/analytics` for programmatic traffic reports — see [Redirect rules — operations](../redirect-rules-operations.md#analytics).

:::ai-only
Campaign analytics route `/analytics`; Advanced `/redirect-rules-analytics`. Campaign empty state: connect domain dialog (no redirect). Dashboard quick ranges (Last 3/7/14/30 days) use calendar-style day counts in the UI. API preset `range` values (`day`, `week`, `month`) use UTC hourly rolling buckets (24 / 168 / 720 hours), not calendar months. To mirror a dashboard quick range or custom picker in code, pass matching `start` and `end` (both required, UTC, floored to the hour) instead of relying on presets alone. Simulate: POST /api/v1/redirect-rules/simulate in the same guide.
:::

## Related

- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Dashboard overview](./dashboard-overview.md)
