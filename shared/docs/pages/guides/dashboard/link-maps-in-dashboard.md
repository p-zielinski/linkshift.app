# Link maps in the dashboard

**Advanced** view only. Open **Link Maps** from the sidebar under **Routing**.

Create link maps, manage entries on the detail page, and import keys in bulk — without using the API first.

:::info
You need a **site** selected in the page header **Site** menu and a **parent redirect rule** before **Add link map** is enabled. Engine behavior (query modes, fallbacks, key extraction): [Link maps](../link-maps.md).
:::

## List link maps

1. In the sidebar, select **Link Maps**.
2. Choose a **Site** in the page header menu (required — **Add link map** stays disabled until you do).
3. Select **Manage entries** (row action) to open the map detail page.

An info banner above the table explains that link maps turn short keys into destinations and that a redirect rule with a path prefix (for example `/short`) routes to a chosen map.

The table shows name, entry count, query match mode, case sensitivity, fallback URL, and row actions (**Manage entries**, **Edit link map**, **Delete link map** — delete stays disabled while a parent rule references the map). Use the footer paginator to change pages.

### Table empty states

| State | What you see |
|-------|----------------|
| No site selected | *Choose a site in the page header Site menu to view link maps.* |
| Site selected, loading | **Loading link maps…** |
| Site selected, no maps | **No link maps found.** |

**All sites** is not available on this page — pick one site in the page header **Site** menu.

## Create a link map

1. On **Link Maps**, select **Add link map**.
2. In the **Details** step (**Link map settings**), set:
   - Name
   - Parent redirect rule
   - Query match mode, case sensitivity, and fallback behavior
3. Save.

Entries are managed on the map detail page, not in this wizard.

## Map detail page

Use **Back to list** to return to **Link Maps**. The header shows the map name (or **Link map** as a fallback).

### Edit map settings

Select **Edit settings** to reopen **Link map settings** (**Details** step). Delete a map from the list with confirmation **Delete link map**.

### Add an entry

1. Select **Add entry**.
2. Complete the **Entry** step (**Entry details**) with key and destination.
3. Save.

### Import entries (CSV)

1. Select **Import entries**.
2. In **Bulk import entries**, paste or upload CSV per the on-screen format (the dialog describes row limits, commonly up to **500** rows per import).
3. Select **Import entries** to run the import, or **Close** after reviewing the result.

### Rollback imported entries

:::warning
**Rollback imported entries** removes keys added by that bulk import from the map. It does not change redirect rules. Confirm the import summary before you roll back.
:::

After a bulk import, when the result dialog offers **Rollback imported entries**:

1. Review the import summary in **Bulk import entries**.
2. Select **Rollback imported entries** (availability depends on import outcome).
3. Confirm in the dialog.

For API-side rollback by entry IDs, see [Link map entries — bulk delete (rollback)](../link-map-entries.md#bulk-delete-rollback).

### Delete entries

1. Select rows in the table (selection can span pages).
2. Select **Delete selected (N)** and confirm in **Delete selected entries** (**Confirm** step).

### Search and paginate

Use **Search by key or destination**. Selected rows stay selected across paginator pages until you clear them.

## Automate instead

See [Link maps](../link-maps.md) and [Link map entries](../link-map-entries.md) for CRUD, CSV import, and bulk delete.

:::ai-only
Management API: GET/POST/PUT/DELETE `/api/v1/link-maps` and `/api/v1/link-map-entries`; POST `/api/v1/link-map-entries/import`; bulk DELETE `/api/v1/link-map-entries` by entry IDs.
:::

## Related

- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — link maps](../redirect-rules-link-maps.md)
- [Link map entries (API)](../link-map-entries.md)
