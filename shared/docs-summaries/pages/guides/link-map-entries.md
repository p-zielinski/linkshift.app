---
source: shared/docs/pages/guides/link-map-entries.md
generatedAt: 2026-05-26T21:10:30.066Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators who need to manage link map entries, detailing how to create, read, update, and delete these entries.

## What this doc covers
- **Entry structure**: Details on fields such as `id`, `linkMapId`, `key`, `keyNormalized`, and `destination`.
- **Destinations are static URLs**: Explanation of how destinations are stored and limitations on dynamic routing.
- **Key format rules**: Guidelines on valid key formats, including length and character restrictions.
- **Single entry CRUD**: Instructions for creating, updating, and deleting individual link map entries.
- **List entries**: How to retrieve entries with pagination and filtering options.
- **Bulk import**: Process for importing multiple entries at once, including request and response formats.
- **Bulk delete (rollback)**: Method for reverting entries after an import.
- **Key design patterns**: Examples of effective key structuring for different query match scenarios.
- **Operational workflows**: Step-by-step processes for launching and managing campaigns.
- **Safety validation**: Checks performed on destinations before they are written.
- **Error reference**: Common error statuses and their causes.
- **Related guides**: Links to additional documentation on related topics.

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
   - Payload: 
     ```json
     {
       "destination": "https://shop.example.com/summer-extended"
     }
     ```
3. **Delete**: 
   - Endpoint: `DELETE /api/v1/link-map-entries/:id`

### Bulk Import
- Endpoint: `POST /api/v1/link-map-entries/import`
- Upsert up to **500 entries** per request.

### Bulk Delete
- Endpoint: `DELETE /api/v1/link-map-entries`
- Payload includes `linkMapId` and up to **1,000** `entryIds`.

### Launch Campaign
1. Create a map with `fallbackDestination`.
2. Import entries via `/import`.
3. Attach a redirect rule.
4. Simulate URLs before rollout.
5. Monitor analytics.

## Limits and constraints
- **Key Length**: Max **1,024** characters.
- **Destination Length**: Max **16,384** characters.
- **Bulk Import Limit**: Up to **500 entries** per request.
- **Bulk Delete Limit**: Up to **1,000 entryIds** per request.
- **Key Format Restrictions**: No spaces, `%`, `#`, or full URLs; must be paths or path+query.
- **Safety Validation**: Destinations must start with `http://` or `https://` and pass safety checks.

## Related docs and API areas
- [Link maps guide](./link-maps.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect rules](./redirect-rules.md)
- `POST /api/v1/link-map-entries/import`
- `DELETE /api/v1/link-map-entries`
