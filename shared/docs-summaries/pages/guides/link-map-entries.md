---
source: shared/docs/pages/guides/link-map-entries.md
generatedAt: 2026-06-08T20:10:08.220Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators managing link maps, explaining how to create, read, update, delete, and import link map entries.

## What this doc covers
- Overview of link map entries and their structure
- CRUD operations for single entries
- Bulk import and delete operations
- Key format rules and validation
- Operational workflows for managing campaigns
- Safety validation for destinations
- Error reference for common issues

## Key workflows and rules
### Single Entry CRUD
1. **Create Entry**: 
   - Endpoint: `POST /api/v1/link-map-entries`
   - Request Body:
     ```json
     {
       "linkMapId": "lmap_abc123",
       "key": "summer",
       "destination": "https://shop.example.com/summer-sale"
     }
     ```
   
2. **Update Entry**:
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

3. **Delete Entry**:
   - Endpoint: `DELETE /api/v1/link-map-entries/:id`

### Bulk Operations
- **Bulk Import**:
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

- **Bulk Delete (Rollback)**:
  - Endpoint: `DELETE /api/v1/link-map-entries`
  - Request Body:
    ```json
    {
      "linkMapId": "lmap_abc123",
      "entryIds": ["lentry_1", "lentry_2", "lentry_3"]
    }
    ```
  - Up to **1,000** `entryIds` per request.

### Campaign Management
1. **Launch Campaign**:
   - Create a map with `fallbackDestination`.
   - Import entries.
   - Attach redirect rule.
   - Simulate and monitor analytics.

2. **Update Destinations**: Use single entry PUT or re-import with existing keys.

3. **Retire Campaign**: Delete entries or update fallback.

## Limits and constraints
- **Key Length**: Max **1,024 characters**.
- **Destination Length**: Max **16,384 characters**.
- **Bulk Import**: Up to **500 entries** per request.
- **Bulk Delete**: Up to **1,000 entry IDs** per request.
- **Entry Search Limit**: `limit` parameter can be set between **1–100** (default is **20**).
- **Key Format**: Must not contain spaces, `%`, `#`, or be a full URL. Must use allowed characters only.

## Related docs and API areas
- [Link maps guide](./link-maps.md)
- [Link maps in the dashboard](./dashboard/link-maps-in-dashboard.md)
- [Redirect rules](./redirect-rules.md)
- [Simulate before rollout](./redirect-rules-operations.md#simulate-before-rollout)
- [Analytics](./redirect-rules-operations.md#analytics)
