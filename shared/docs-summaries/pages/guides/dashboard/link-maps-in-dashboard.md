---
source: shared/docs/pages/guides/dashboard/link-maps-in-dashboard.md
generatedAt: 2026-06-07T10:05:03.311Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing link maps in the LinkShift dashboard, explaining how to create, edit, and manage link maps and their entries.

## What this doc covers
- **List link maps**: Steps to view existing link maps and their details.
- **Create a link map**: Instructions for adding a new link map.
- **Map detail page**: Overview of the functionalities available on the map detail page.
- **Edit map settings**: How to modify existing link map settings.
- **Add an entry**: Steps to add a new entry to a link map.
- **Import entries (CSV)**: Guidelines for bulk importing entries via CSV.
- **Rollback imported entries**: Process for rolling back entries added by a bulk import.
- **Delete entries**: Instructions for deleting selected entries from a link map.
- **Search and paginate**: Features for searching and navigating through entries.
- **Automate instead**: References to API capabilities for CRUD operations and bulk actions.

## Key workflows and rules
1. **List link maps**:
   - Select **Link Maps** from the sidebar.
   - Choose a **Site** from the header menu (required).
   - Click **Manage entries** to view details.

2. **Create a link map**:
   - Click **Add link map**.
   - Fill in **Link map settings**: Name, Parent redirect rule, Query match mode, Case sensitivity, Fallback behavior.
   - Save the map.

3. **Add an entry**:
   - On the map detail page, select **Add entry**.
   - Complete the **Entry details** with key and destination.
   - Save the entry.

4. **Import entries (CSV)**:
   - Click **Import entries**.
   - Paste or upload a CSV file (up to **500** rows).
   - Confirm import or close the dialog.

5. **Rollback imported entries**:
   - After a bulk import, review the import summary.
   - Select **Rollback imported entries** and confirm.

6. **Delete entries**:
   - Select rows in the entries table.
   - Click **Delete selected (N)** and confirm deletion.

## Limits and constraints
- A **site** must be selected in the page header before the **Add link map** option is enabled.
- The **Import entries** feature allows a maximum of **500 rows** per import.
- Deleting a link map is disabled if it is referenced by a parent redirect rule.
- Rollback of imported entries only affects keys added by the bulk import and does not alter redirect rules.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — link maps](../redirect-rules-link-maps.md)
- [Link map entries (API)](../link-map-entries.md)
- API endpoints:
  - `GET /api/v1/link-maps`
  - `POST /api/v1/link-maps`
  - `PUT /api/v1/link-maps`
  - `DELETE /api/v1/link-maps`
  - `POST /api/v1/link-map-entries/import`
  - `DELETE /api/v1/link-map-entries` (bulk delete by entry IDs)
