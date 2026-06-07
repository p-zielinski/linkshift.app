---
source: shared/docs/pages/guides/link-map-entries.md
generatedAt: 2026-06-07T10:06:44.796Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators managing link map entries, explaining how to perform CRUD operations, bulk imports, and key format rules.

## What this doc covers
- Overview of link map entries
- Entry structure and fields
- Static URL requirements for destinations
- Key format rules and examples
- CRUD operations for single entries
- Listing entries with pagination
- Bulk import and delete operations
- Key design patterns and operational workflows
- Safety validation and error reference

## Key workflows and rules
### Single Entry CRUD
1. **Create Entry**
   - Endpoint: `POST /api/v1/link-map-entries`
   - Request body:
     ```json
     {
       "linkMapId": "lmap_abc123",
       "key": "summer",
       "destination": "https://shop.example.com/summer-sale"
     }
     ```

2. **Update Entry**
   - Endpoint: `PUT /api/v1/link-map-entries/:id`
   - Request body can include:
     ```json
     {
       "destination": "https://shop.example.com/summer-extended"
     }
     ```
   - Or change key:
     ```json
     {
       "key": "summer-2025",
       "destination": "https://shop.example.com/summer-2025"
     }
     ```

3. **Delete Entry**
   - Endpoint: `DELETE /api/v1/link-map-entries/:id`

### List Entries
- Endpoint: `GET /api/v1/link-map-entries?linkMapId=lmap_abc123&limit=50&search=summer`
- Parameters:
  - `linkMapId`: Required
  - `limit`: 1–100 (default 20)
  - `search`: Optional filter for keys
  - `startAfterId`: Cursor for pagination

### Bulk Import
- Endpoint: `POST /api/v1/link-map-entries/import`
- Upsert up to **500 entries** per request.
- Request body example:
  ```json
  {
    "linkMapId": "lmap_abc123",
    "entries": [
      {
        "key": "summer",
        "destination": "https://shop.example.com/summer"
      }
    ]
  }
  ```

### Bulk Delete (Rollback)
- Endpoint: `DELETE /api/v1/link-map-entries`
- Request body:
  ```json
  {
    "linkMapId": "lmap_abc123",
    "entryIds": ["lentry_1", "lentry_2", "lentry_3"]
  }
  ```
- Up to **1,000** `entryIds` per request.

### Safety Validation
- Every destination must start with `http://` or `https://` and pass a safety scanner. If it fails, a `500` error is returned.

## Limits and constraints
- **Entry ID**: Assigned on create.
- **Key Length**: Max **1,024** characters.
- **Destination Length**: Max **16,384** characters.
- **Bulk Import**: Up to **500 entries** per request.
- **Bulk Delete**: Up to **1,000** `entryIds` per request.
- **Key Format**: Must not contain spaces, `%`, `#`, or be a full URL.
- **Duplicate Keys**: Return `400` conflict if duplicates exist after normalization.

## Related docs and API areas
- [Link maps guide](./link-maps.md)
- [Link maps in the dashboard](./dashboard/link-maps-in-dashboard.md)
- [Redirect rules](./redirect-rules.md)
- [Simulate before rollout](./redirect-rules-operations.md#simulate-before-rollout)
- [Analytics for top link map keys](./redirect-rules-operations.md#analytics)
