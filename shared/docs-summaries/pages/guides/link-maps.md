---
source: shared/docs/pages/guides/link-maps.md
generatedAt: 2026-05-26T21:10:38.955Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators who need to understand how to implement and manage link maps for URL redirection.

## What this doc covers
- Overview of link maps and their use cases
- End-to-end workflow for creating link maps and entries
- Key extraction rules for link maps
- Query matching strategies for link maps
- Case sensitivity options for link keys
- Fallback destination behavior
- API endpoints for managing link maps
- Constraints and limits related to link maps

## Key workflows and rules
1. **Create Link Map**: 
   - Endpoint: `POST /api/v1/link-maps`
   - Fields: 
     - `name`: Name of the link map
     - `domainGroupId`: ID of the domain group
     - `queryMatch`: Matching strategy for query parameters (default: `ignore`)
     - `caseSensitive`: Boolean for case sensitivity (default: `false`)
     - `fallbackDestination`: URL to redirect to if no entry matches (optional)
   - Important: Changing `caseSensitive` from `true` to `false` is blocked.

2. **Add Entries**: 
   - Endpoint: `POST /api/v1/link-map-entries`
   - Fields:
     - `linkMapId`: ID of the link map
     - `key`: Lookup key for the entry
     - `destination`: Static URL for redirection
   - Bulk import allowed via `POST /api/v1/link-map-entries/import` (up to 500 entries).

3. **Create Redirect Rule**: 
   - Endpoint: `POST /api/v1/redirect-rules`
   - Fields:
     - `domainGroupId`: ID of the domain group
     - `source`: Path prefix for the rule
     - `pathMatch`: Must be `prefix`
     - `queryMatch`: Must be `ignore`
     - `linkMapId`: ID of the associated link map
     - `statusCode`: HTTP status code for redirection
     - `priority`: Priority of the rule

4. **Testing**: 
   - Use `GET` requests to test the redirection behavior.

## Limits and constraints
- **Entry Limits**: Up to 500 entries can be added in a single bulk import.
- **Map Limits**: Organization-scoped with limits on the number of maps and total entries based on the plan.
- **Deletion Restrictions**: Cannot delete a map that is referenced by active redirect rules.
- **URL Safety**: Destinations must be valid URLs (http or https); unsafe URLs return a `400 Bad Request`.
- **Cache Behavior**: Link map data is cached for up to 5 minutes; negative cache entries can last up to 60 seconds.

## Related docs and API areas
- [Redirect rules](./redirect-rules.md)
- [Link map entries](./link-map-entries.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- API Endpoints:
  - `GET /api/v1/link-maps?domainGroupId=...`
  - `GET /api/v1/link-maps/:id`
  - `POST /api/v1/link-maps`
  - `PUT /api/v1/link-maps/:id`
  - `DELETE /api/v1/link-maps/:id`
