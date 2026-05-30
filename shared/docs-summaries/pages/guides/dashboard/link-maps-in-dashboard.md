---
source: shared/docs/pages/guides/dashboard/link-maps-in-dashboard.md
generatedAt: 2026-05-30T07:00:07.448Z
model: gpt-4o-mini
---

## Purpose
This document is for users who want to create and manage link maps in the dashboard without using the API.

## What this doc covers
- **Before you start**: Requirements for creating link maps, including domain groups and redirect rules.
- **List link maps**: Steps to view existing link maps in the dashboard.
- **Create a link map**: Instructions for adding a new link map and its settings.
- **Map detail page**: Overview of the map detail page and its functionalities.
- **Edit map settings**: How to edit or delete link maps.
- **Add an entry**: Steps to add entries to a link map.
- **Import entries (CSV)**: Instructions for bulk importing entries from a CSV file.
- **Rollback imported entries**: Process for rolling back entries after a bulk import.
- **Delete entries**: Steps to delete selected entries from a link map.
- **Search and paginate**: How to search for entries and navigate through pages of results.
- **What you should see**: Expected outcomes after creating or modifying link maps.
- **Automate instead**: Links to API methods for automating link map management.

## Key workflows and rules
1. **List link maps**:
   - Navigate to **Link Maps** (`/link-maps`).
   - Select a **Domain group** (required).
   - Click on a map to view its details.

2. **Create a link map**:
   - Click **Add link map**.
   - Fill in **Link map settings**: Name, Parent redirect rule, Query match mode, Case sensitivity, Fallback behavior.
   - Save the map.

3. **Add an entry**:
   - On the map detail page, click **Add entry**.
   - Fill in **Entry details**: Key and destination.
   - Save the entry.

4. **Import entries (CSV)**:
   - Click **Import entries**.
   - Paste or upload a CSV file (up to **500 rows**).
   - Click **Import entries** to complete the import.

5. **Rollback imported entries**:
   - After an import, review the summary.
   - Click **Rollback imported entries** and confirm.

6. **Delete entries**:
   - Select entries in the table.
   - Click **Delete selected (N)** and confirm.

## Limits and constraints
- A **Domain group** and at least one **redirect rule** are required to create a link map.
- The CSV import can handle up to **500 rows** per import.
- The table paginator allows viewing **20, 50, or 100 entries** per page.
- Selection of entries can span multiple pages until cleared.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — link maps](../redirect-rules-link-maps.md)
- [Link map entries (API)](../link-map-entries.md)
- API methods:
  - `GET` / `POST` / `PUT` / `DELETE` `/api/v1/link-maps`
  - `GET` / `POST` / `PUT` / `DELETE` `/api/v1/link-map-entries`
  - `POST /api/v1/link-map-entries/import`
  - `DELETE /api/v1/link-map-entries` (bulk rollback by entry IDs)
