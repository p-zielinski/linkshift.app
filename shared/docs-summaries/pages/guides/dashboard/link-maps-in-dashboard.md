---
source: shared/docs/pages/guides/dashboard/link-maps-in-dashboard.md
generatedAt: 2026-06-03T16:57:59.358Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing link maps in the dashboard, explaining how to create, edit, and import link maps and their entries.

## What this doc covers
- **List link maps**: Instructions for viewing link maps in the sidebar.
- **Create a link map**: Steps to add a new link map with required settings.
- **Map detail page**: Overview of the functionalities available on the map detail page.
- **Edit map settings**: How to edit settings and delete a link map.
- **Add an entry**: Steps to add entries to a link map.
- **Import entries (CSV)**: Instructions for bulk importing entries from a CSV file.
- **Rollback imported entries**: Process for rolling back entries added by a bulk import.
- **Delete entries**: Steps to delete selected entries from a link map.
- **Search and paginate**: Methods for searching and paginating through entries.

## Key workflows and rules
### List link maps
1. Select **Link Maps** in the sidebar.
2. Choose a **Domain group** (required).
3. Open a map by selecting its row.

### Create a link map
1. Select **Add link map**.
2. Set **Name**, **Parent redirect rule**, **Query match mode**, **Case sensitivity**, and **Fallback behavior** in the **Details** step.
3. Save the link map.

### Add an entry
1. Select **Add entry**.
2. Complete the **Entry** step with **key** and **destination**.
3. Save the entry.

### Import entries (CSV)
1. Select **Import entries**.
2. Paste or upload a CSV file (up to **500** rows).
3. Select **Import entries** or **Close** after reviewing.

### Rollback imported entries
1. Review the import summary after a bulk import.
2. Select **Rollback imported entries** to remove the rows from that import.
3. Confirm in the dialog.

### Delete entries
1. Select rows in the table.
2. Select **Delete selected (N)** and confirm.

## Limits and constraints
- **Domain group** must be selected to enable **Add link map**.
- Bulk import allows up to **500** rows per import.
- Rollback only removes keys added by the last bulk import; it does not affect redirect rules.

## Related docs and API areas
- [Link maps](../link-maps.md) for CRUD and bulk operations.
- [Link map entries](../link-map-entries.md) for API operations related to link map entries.
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md) for managing redirect rules.
- [Redirect rules — link maps](../redirect-rules-link-maps.md) for specific link map redirect rules.
- Management API endpoints:
  - `GET /api/v1/link-maps`
  - `POST /api/v1/link-maps`
  - `PUT /api/v1/link-maps`
  - `DELETE /api/v1/link-maps`
  - `POST /api/v1/link-map-entries/import`
  - `DELETE /api/v1/link-map-entries` (bulk delete by entry IDs).
