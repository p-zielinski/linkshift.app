---
source: shared/docs/pages/guides/link-map-entries.md
generatedAt: 2026-05-28T15:49:22.623Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of the LinkShift API, explaining how to manage link map entries through CRUD operations, bulk imports, and key formatting rules.

## What this doc covers
- **Entry structure**: Details on fields such as `id`, `linkMapId`, `key`, `keyNormalized`, and `destination`.
- **Destinations are static URLs**: Explanation of how destination URLs are treated.
- **Key format rules**: Specifications on valid key formats, including length and character restrictions.
- **Single entry CRUD**: Instructions for creating, updating, and deleting individual link map entries.
- **List entries**: How to retrieve a list of link map entries with filtering and pagination.
- **Bulk import**: Guidelines for importing multiple entries at once.
- **Bulk delete (rollback)**: Instructions for reverting entries after an import.
- **Key design patterns**: Examples of effective key structures for different use cases.
- **Operational workflows**: Step-by-step processes for launching and managing campaigns.
- **Safety validation**: Requirements for destination URLs to ensure safety.
- **Error reference**: Common error statuses and their causes.

## Key workflows and rules
### Single Entry CRUD
1. **Create**: 
   - Endpoint: `POST /api/v1/link-map-entries`
   - Payload: 
     ```json
     {
       "linkMapId": "lmap_abc123",
       "key": "summer",
       "destination": "https://shop.example.com/summer-sale"
     }
     ```
2. **Update**: 
   - Endpoint: `PUT /api/v1/link-map-entries/:id`
   - Payload for destination update:
     ```json
     {
       "destination": "https://shop.example.com/summer-extended"
     }
     ```
   - Payload for key change:
     ```json
     {
       "key": "summer-2025",
       "destination": "https://shop.example.com/summer-2025"
     }
     ```
3. **Delete**: 
   - Endpoint: `DELETE /api/v1/link-map-entries/:id`

### Bulk Import
- Endpoint: `POST /api/v1/link-map-entries/import`
- Upsert up to **500 entries** per request.

### Launch Campaign
1. Create a map with `fallbackDestination`.
2. Import entries via `/import`.
3. Attach redirect rule.
4. Simulate URLs.
5. Monitor analytics.

## Limits and constraints
- **Destination URL**: Must be `http://` or `https://`, max **16,384** characters.
- **Key length**: Max **1,024** characters.
- **Key character restrictions**: No spaces, `%`, `#`, or full URLs.
- **Bulk import limit**: Up to **500 entries** per request.
- **Bulk delete limit**: Up to **1,000** `entryIds` per request.
- **Error handling**: 
  - `400` for invalid formats or unsafe destinations.
  - `404` for not found entries.
  - `500` for safety scanner failures.

## Related docs and API areas
- [Link maps guide](./link-maps.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect rules](./redirect-rules.md)
- `GET /api/v1/organization/usage` for checking plan limits.
