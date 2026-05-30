---
source: shared/docs/pages/guides/link-map-entries.md
generatedAt: 2026-05-30T07:01:44.413Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators managing link maps, explaining how to create, update, delete, and import link map entries.

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
- **Create Entry**: 
  ```json
  POST /api/v1/link-map-entries
  {
    "linkMapId": "lmap_abc123",
    "key": "summer",
    "destination": "https://shop.example.com/summer-sale"
  }
  ```
- **Update Entry**: 
  ```json
  PUT /api/v1/link-map-entries/:id
  {
    "destination": "https://shop.example.com/summer-extended"
  }
  ```
  or change the key:
  ```json
  PUT /api/v1/link-map-entries/:id
  {
    "key": "summer-2025",
    "destination": "https://shop.example.com/summer-2025"
  }
  ```
- **Delete Entry**: 
  ```
  DELETE /api/v1/link-map-entries/:id
  ```

### Bulk Operations
- **Bulk Import**: 
  ```json
  POST /api/v1/link-map-entries/import
  {
    "linkMapId": "lmap_abc123",
    "entries": [
      {
        "key": "summer",
        "destination": "https://shop.example.com/summer"
      },
      {
        "key": "winter",
        "destination": "https://shop.example.com/winter"
      }
    ]
  }
  ```
  Up to **500 entries** can be imported per request.
  
- **Bulk Delete (Rollback)**: 
  ```json
  DELETE /api/v1/link-map-entries
  {
    "linkMapId": "lmap_abc123",
    "entryIds": ["lentry_1", "lentry_2"]
  }
  ```
  Up to **1,000 entryIds** can be deleted per request.

### Campaign Management
1. Create a map with `fallbackDestination`.
2. Import entries via `/import`.
3. Attach a redirect rule.
4. Simulate on sample URLs.
5. Monitor analytics for performance.

## Limits and constraints
- **Key Length**: Maximum of **1,024 characters**.
- **Destination Length**: Maximum of **16,384 characters**.
- **Bulk Import Limit**: Up to **500 entries** per request.
- **Bulk Delete Limit**: Up to **1,000 entryIds** per request.
- **Key Format**: Must not contain spaces, `%`, `#`, or be a full URL. Must be a path or path+query.
- **Safety Validation**: Every destination must start with `http://` or `https://` and pass a safety scanner.

## Related docs and API areas
- [Link maps guide](./link-maps.md)
- [Link maps in the dashboard](./dashboard/link-maps-in-dashboard.md)
- [Redirect rules](./redirect-rules.md)
- [Simulate before rollout](./redirect-rules-operations.md#simulate-before-rollout)
- [Analytics for link maps](./redirect-rules-operations.md#analytics)
