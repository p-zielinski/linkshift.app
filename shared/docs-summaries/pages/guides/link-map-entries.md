---
source: shared/docs/pages/guides/link-map-entries.md
generatedAt: 2026-06-03T16:59:13.641Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators managing link map entries, explaining how to perform CRUD operations, bulk imports, and key format rules.

## What this doc covers
- Overview of link map entries and their structure
- CRUD operations for link map entries
- Bulk import and rollback of entries
- Key format rules and validation
- Operational workflows for campaigns
- Safety validation for destinations
- Error reference for common issues

## Key workflows and rules
### Single Entry CRUD
1. **Create Entry**
   - Endpoint: `POST /api/v1/link-map-entries`
   - Request Body:
     ```json
     {
       "linkMapId": "lmap_abc123",
       "key": "summer",
       "destination": "https://shop.example.com/summer-sale"
     }
     ```

2. **Update Entry**
   - Endpoint: `PUT /api/v1/link-map-entries/:id`
   - Request Body:
     ```json
     {
       "destination": "https://shop.example.com/summer-extended"
     }
     ```
   - To change the key:
     ```json
     {
       "key": "summer-2025",
       "destination": "https://shop.example.com/summer-2025"
     }
     ```

3. **Delete Entry**
   - Endpoint: `DELETE /api/v1/link-map-entries/:id`

### Bulk Import
- Endpoint: `POST /api/v1/link-map-entries/import`
- Upsert up to **500 entries** per request.
- Request Body Example:
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
- Request Body:
  ```json
  {
    "linkMapId": "lmap_abc123",
    "entryIds": ["lentry_1", "lentry_2", "lentry_3"]
  }
  ```
- Up to **1,000** `entryIds` per request.

### Launch Campaign Workflow
1. Create a map with `fallbackDestination`.
2. Import entries via `/import`.
3. Attach redirect rule with prefix.
4. Simulate on sample URLs.
5. Monitor analytics.

## Limits and constraints
- **Key Length**: Maximum of **1,024** characters.
- **Destination Length**: Maximum of **16,384** characters.
- **Bulk Import Limit**: Up to **500 entries** per request.
- **Bulk Delete Limit**: Up to **1,000 entry IDs** per request.
- **Key Format Rules**:
  - Must not contain spaces, `%`, `#`, or full URLs.
  - Must be a path or path+query, not a full URL.
- **Safety Validation**: Every destination must start with `http://` or `https://` and pass a safety scanner.

## Related docs and API areas
- [Link maps guide](./link-maps.md)
- [Link maps in the dashboard](./dashboard/link-maps-in-dashboard.md)
- [Redirect rules](./redirect-rules.md)
- [Simulate before rollout](./redirect-rules-operations.md#simulate-before-rollout)
- [Analytics](./redirect-rules-operations.md#analytics)
