# Analytics in the dashboard

View redirect traffic for a time window, filter by site, and open rule details from analytics results.

The sidebar label is **Analytics** in both dashboard modes. Routes differ; the page header **Site** menu scopes data in both views:

- **Campaign** view — `/analytics`
- **Advanced** view — `/redirect-rules-analytics`

You need at least one site with a connected host and rules receiving traffic before charts load. Analytics retention depends on your plan — the analytics page shows **Click data retention** (*Based on your plan*) at the top. The Advanced **Dashboard** (`/dashboard`) uses the label **Current plan analytics retention days** for the same limit in the usage grid — see [Dashboard overview — Subscription limits](./dashboard-overview.md#subscription-limits-and-analytics-retention).

:::info
**Campaign** view: open **Analytics** even before a site or host exists — you see a guided empty state on the page instead of a redirect. **Advanced** view: **Analytics** stays disabled in the sidebar until at least one site exists; opening `/redirect-rules-analytics` directly without a site redirects to **Domain Groups** with snackbar **Add a site to continue**. Data older than your plan retention window may not appear even if you pick a wider custom range.
:::

## Analytics differs by dashboard mode

| View | Route | Site filter |
|------|--------|-------------|
| **Campaign** | `/analytics` | **Site** in the page header menu; **All sites** when you have multiple sites |
| **Advanced** | `/redirect-rules-analytics` | **Site** in the page header menu; single site only (no **All sites**) |

In **Campaign** view, deep links from **Links** (**Open analytics** row action) open `/analytics` with site, rule, link map, and key query parameters.

Switching from **Campaign** to **Advanced** while on `/analytics` maps to `/redirect-rules-analytics`. If you have no sites yet, that redirect sends you to **Domain Groups** to add your first site — not to an on-page empty state.

## Open analytics

In the sidebar, select **Analytics** (same label in both views). The nav item is always visible in **Campaign** view. In **Advanced** view, the item is disabled until at least one site exists — see [Dashboard overview — Domain-group gate](./dashboard-overview.md#domain-group-gate).

## Empty states

When prerequisites are missing, behavior differs by mode.

### Campaign view (`/analytics`)

The page shows a guided empty state — it does not redirect elsewhere.

| State | What you see |
|-------|----------------|
| No sites yet | **Set up your domain to see analytics** — *Add a site and host first. Analytics appear after traffic hits your short links.* with **Connect your domain** |
| Sites but no hosts | **Add host to see analytics** — *Add subdomain or custom domain on your site first* with **Add host** |

### Advanced view (`/redirect-rules-analytics`)

| State | What you see |
|-------|----------------|
| No sites yet | Sidebar **Analytics** disabled. Opening **Analytics** directly without a site redirects to **Domain Groups** with snackbar **Add a site to continue** (not an on-page empty state). |
| Sites but no hosts | On-page empty state: **Add host to see analytics** with **Add host** — routes you to **Domains** (`/domains`) |

## Filter by site

When you have at least one site, use the **Site** control in the page header menu (popover next to the title).

| View | **All sites** | Site selection |
|------|---------------|----------------|
| **Campaign** | Available when you have multiple sites; hidden when you have only one site (menu still appears, scoped automatically) | Page header **Site** menu |
| **Advanced** | Not available — pick one site; with a single site the menu shows that site only | **Site** menu remembers your last selection across **Links** and **Analytics** |

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

The results area includes a traffic chart and a table of top rules.

### Campaign view

Under **Link performance**, each row is a short link path. **Top keys** shows which slug drove the most traffic.

| Row label | Meaning |
|-----------|---------|
| **Short link** | Rule source path |
| **Destination** | Resolved destination |
| **Top keys** | Top link-map keys by hits |

Select **Details** on a row to open **Rule analytics details** with **Hits in range** for your selected window.

### Advanced view

No **Link performance** heading. Table row labels differ:

| Row label | Meaning |
|-----------|---------|
| **Source** | Rule source path |
| **Destination** | Resolved destination |
| **Link keys** | Top link-map keys by hits |
| **Top requests** | Top request variants (method, URL, destination) — when available |

Select **Details** on a row for the same rule analytics dialog as Campaign view.

### Loading and no-traffic states

| State | Campaign | Advanced |
|-------|----------|----------|
| Loading | **Loading analytics…** | **Loading analytics…** |
| No hits in range | *No short link hits in the selected period…* with **Create link** | *No redirect rule hits in the selected period…* with **View redirect rules** |
| Load error | Error message with **Try again** | Error message with **Try again** |

## Automate instead

Use `GET /api/v1/redirect-rules/analytics` for programmatic traffic reports — see [Redirect rules — operations](../redirect-rules-operations.md#analytics).

:::ai-only
Campaign analytics route `/analytics`; Advanced `/redirect-rules-analytics`. Both modes: page-level Site filter via `attachPageWorkspaceFilter` (no shell workspace selector). Campaign empty state: connect domain / add host on page (no redirect). Advanced empty state without sites: `domainGroupsRequiredGuard` → `/domain-groups?openCreate=1` + snackbar `Add a site to continue`; with sites but no hosts: on-page empty state via `openAdvancedOnboarding`. Campaign results heading: Link performance (`campaignMode` on results component). Row labels Campaign: Short link / Top keys; Advanced: Source / Link keys + Top requests. Retention UI label: Click data retention. Dashboard quick ranges (Last 3/7/14/30 days) use calendar-style day counts in the UI. API preset `range` values (`day`, `week`, `month`) use UTC hourly rolling buckets (24 / 168 / 720 hours), not calendar months. To mirror a dashboard quick range or custom picker in code, pass matching `start` and `end` (both required, UTC, floored to the hour) instead of relying on presets alone. Simulate: POST /api/v1/redirect-rules/simulate in the same guide.
:::

## Related

- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Links in the dashboard](./links-in-dashboard.md) — **Open analytics** from link rows
- [Dashboard overview](./dashboard-overview.md)
