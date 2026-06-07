# Links in the dashboard

Create and manage short links from **Links** in the sidebar (`/links`).

**Campaign** and **Advanced** view share the same route. Workspace scope works differently — see [Campaign vs Advanced workspace](#campaign-vs-advanced-workspace) below.

:::info
You need at least one site and a connected host before the link table appears. Until then, the page shows a guided empty state with **Connect your domain** or **Add host**. In **Advanced** view, opening `/links` directly without any sites redirects to **Domain Groups** with snackbar **Add a site to continue** — unless you switched modes while already on `/links`.
:::

## Open Links

In the sidebar, select **Links** (`/links`).

## Filter by site

When you have at least one site, a **Site** control appears in the page header (menu popover next to the title).

| Selection | Effect |
|-----------|--------|
| A single site | List shows short links for that site only |
| **All sites** | Available when you have multiple sites — aggregates links across every site |

In **Advanced** view, **Links** is the only scoped page that offers **All sites** when you have multiple sites. In both views, scope comes from the page header **Site** menu — there is no shell-level workspace control above the content.

## Empty and loading states

| State | What you see |
|-------|----------------|
| No sites yet | **Set up your domain to create short links** with **Connect your domain** |
| Sites loading | **Loading sites… Create link opens when your sites finish loading** |
| Sites but no hosts | **Add host to create short links** with **Add host** |
| Table loading | **Loading links…** in the table area |
| No links in scope | **No links yet** with *Create your first short link to start sharing* and **Create link**, or **No links in this site** with *Switch site in the page header Site menu, or choose All sites, to see everything.* when another site has links |

## Primary actions

Header actions depend on setup progress:

| Condition | Primary action |
|-----------|----------------|
| No sites | **Connect your domain** (empty state) |
| Sites, no hosts | **Add host** (header or empty state) |
| Hosts connected | **Create link** (header) |

You can also open **Create link** or **Connect your domain** from **Overview** quick actions.

For domain setup (site name, subdomain or custom domain, DNS), see [Domains and domain groups — In the dashboard](../domains-and-groups.md#in-the-dashboard).

### Create link wizard

Select **Create link** and walk through **Site** (pick site and review hosts), **Path** (short key — lowercase letters, numbers, hyphens), **Destination** (HTTPS URL), and **Summary**. After save, copy the short URL, open analytics, or create a QR code.

The same wizard opens from **Overview** → **Create link**.

## Link map filter

When you switch from **Campaign** to **Advanced** while viewing a link map (`/link-maps/{id}` maps to `/links?linkMapId={id}`), **Links** shows a filter banner:

- *Viewing links from {name}* (or *Viewing links from selected link map* while the name loads)
- **Show all links** — clears the filter and lists all links in the current site scope

## Search links

When the table is visible, use **Search links** (*Search by key or destination*).

- Matches short path keys and destination URLs
- Enter at least **2 characters** before results filter
- Search combines with the active **Site** filter
- No matches: **No links match this search**

## Browse and paginate

The links table shows **Short path** and **Destination** in **Campaign** view (**Link map** column appears in **Advanced** view).

Use the table footer paginator to change pages and rows per page.

## Row actions

Each row includes:

| Action | Behavior |
|--------|----------|
| **Edit link** | Opens the edit flow for your dashboard mode — see [Edit link](#edit-link) below |
| **Copy short URL** | Copies one short URL, or **Copy all short URLs** when multiple hosts apply |
| **Open analytics** | Opens **Analytics** scoped to the link's site and rule |

### Edit link

**Edit link** opens a different editor depending on dashboard mode.

#### Campaign view — simplified editor

Edit **Link path** and **Destination URL**; short path and full URLs per host are read-only. **Save changes** updates the entry; snackbar **Link updated.**
- **Open in advanced** — confirm dialog **Switch to advanced view?** (*You'll leave this editor and open redirect rules in Advanced view…*) → **Switch to advanced** opens **Redirect Rules** in Advanced view

Validation hints match **Create link**: lowercase letters, numbers, and hyphens for path; `https://` destination.

#### Advanced view — link map entry form

Opens the same **Edit entry** wizard used on **Link Maps** detail pages — set **Key** (URL-safe characters; query strings allowed) and **Destination** (full URL; `https://` added if missing). **Save entry** refreshes the table without a separate snackbar.

For entry validation rules and bulk operations, see [Link maps in the dashboard](./link-maps-in-dashboard.md#add-an-entry).

## Campaign vs Advanced workspace

| | **Campaign** | **Advanced** |
|---|--------------|----------------|
| Route | `/links` | `/links` |
| Workspace scope | Page header **Site** menu on this page | **Site** menu remembers your last selection across scoped pages |
| **All sites** | Available when you have multiple sites | Available on **Links** when you have multiple sites |
| Table columns | Short path, destination, actions | Short path, destination, link map, actions |
| Info banner | *Short paths work on every connected host for the selected site* | *Short paths use each site's link map path prefix and work on every connected host* |
| Sidebar gate | Always available | Disabled until at least one site exists — tooltip **Add a site to continue** |

## Related

- [Domains and domain groups — In the dashboard](../domains-and-groups.md#in-the-dashboard) — connect-domain wizard
- [Analytics in the dashboard](./analytics-in-dashboard.md) — traffic from **Open analytics**
- [Dashboard overview](./dashboard-overview.md) — Campaign vs Advanced views
- [Settings in the dashboard](./settings-in-dashboard.md) — plan limits and **Domains & hosts**

:::ai-only
Route `/links`. Both modes: page-level Site filter via `attachPageWorkspaceFilter` (no shell workspace selector). Campaign active scope from page filter; Advanced may sync from dashboard context via `resolveLinksSyncFromDashboardContext`. All sites on `/links` when multiple groups (only Advanced scoped page with All sites). Search min 2 chars (`buildLinksListBaseFilter`). Cursor pagination via `startAfterId`. Query params: `openCreate=1`, `openConnectDomain=1`, `linkMapId` (link map filter banner). Advanced sidebar: `requiresDomainGroups` gate, tooltip `Add a site to continue`. Row actions: edit link Campaign → EditLinkDialogComponent (Short link details, Open in advanced); Advanced → LinkMapEntryFormDialogComponent (Edit entry / Entry details). Copy short URL, open analytics.
:::
