# Link maps in the dashboard

Create link maps, manage entries on the detail page, and import keys in bulk—without using the API first.

## Before you start

- A domain group and at least one redirect rule that can host a link map (see [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)).
- For engine behavior (query modes, fallbacks, key extraction), see [Link maps](../link-maps.md) and [Link map concepts](../../concepts/link-map-concepts.md).

## List link maps

1. In the sidebar, select **Link Maps** (`/link-maps`).
2. Choose a **Domain group** in the filter (required — **Add link map** stays disabled until you do).
3. Open a map by selecting its row (navigates to `/link-maps/:id`).

The list has no table paginator; all maps for the selected group appear in one table.

## Create a link map

1. On **Link Maps**, select **Add link map**.
2. In the **Details** step (**Link map settings**), set:
   - Name
   - Parent redirect rule
   - Query match mode, case sensitivity, and fallback behavior
3. Save.

Entries are managed on the map detail page, not in this wizard.

## Map detail page (`/link-maps/:id`)

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

After a bulk import, when the result dialog offers **Rollback imported entries**:

1. Review the import summary in **Bulk import entries**.
2. Select **Rollback imported entries** to remove the rows from that import (button availability depends on import outcome).
3. Confirm in the dialog. This removes the imported keys from the map; it does not change redirect rules.

For API-side rollback by entry IDs, see [Link map entries — bulk delete (rollback)](../link-map-entries.md#bulk-delete-rollback).

### Delete entries

1. Select rows in the table (selection can span pages).
2. Select **Delete selected (N)** and confirm in **Delete selected entries** (**Confirm** step).

### Search and paginate

Use **Search by key or destination**. Change pages with the table paginator (20, 50, or 100 per page); selected rows stay selected across pages until you clear them.

## What you should see

- The map in the list with the correct domain group.
- On the detail page, new or imported entries in the table.
- Short-link behavior on live traffic once the parent rule and DNS are in place (validate with [Tests in the dashboard](./tests-in-dashboard.md)).

## Automate instead

See [Link maps](../link-maps.md) and [Link map entries](../link-map-entries.md) for:

- `GET` / `POST` / `PUT` / `DELETE` `/api/v1/link-maps`
- `GET` / `POST` / `PUT` / `DELETE` `/api/v1/link-map-entries`
- `POST /api/v1/link-map-entries/import` and `DELETE /api/v1/link-map-entries` (bulk rollback by entry IDs)

## Related

- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — link maps](../redirect-rules-link-maps.md)
- [Link map entries (API)](../link-map-entries.md)
