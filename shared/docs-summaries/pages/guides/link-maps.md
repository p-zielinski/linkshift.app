---
source: shared/docs/pages/guides/link-maps.md
generatedAt: 2026-05-30T07:01:55.285Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing link maps in LinkShift, explaining how to create and utilize link maps for efficient URL redirection.

## What this doc covers
- Overview of link maps as keyed lookup tables.
- Dashboard navigation for managing link maps.
- Scenarios for using link maps versus traditional redirect rules.
- Step-by-step end-to-end workflow for creating link maps and entries.
- Key extraction methods from request paths.
- Query matching strategies for link map entries.
- Case sensitivity settings and their implications.
- Fallback destination behavior when no entry matches.
- Examples of use cases for different query match strategies.
- API endpoints for managing link maps.

## Key workflows and rules
1. **Create Link Map**
   - Endpoint: `POST /api/v1/link-maps`
   - Required fields: 
     - `name`: Name of the link map.
     - `domainGroupId`: ID of the domain group.
     - `queryMatch`: Matching strategy (default is `ignore`).
     - `caseSensitive`: Boolean for case sensitivity (default is `false`).
     - `fallbackDestination`: Optional URL for unmatched entries.
   - Important: Changing `caseSensitive` from `true` to `false` is not allowed.

2. **Add Entries**
   - Endpoint: `POST /api/v1/link-map-entries`
   - Required fields:
     - `linkMapId`: ID of the link map.
     - `key`: The suffix key for the entry.
     - `destination`: The static URL for the entry.
   - Bulk import allowed via `POST /api/v1/link-map-entries/import` (up to 500 entries).

3. **Create Redirect Rule**
   - Endpoint: `POST /api/v1/redirect-rules`
   - Required fields:
     - `domainGroupId`: ID of the domain group.
     - `source`: Path prefix for the rule.
     - `pathMatch`: Must be `prefix`.
     - `queryMatch`: Must be `ignore`.
     - `linkMapId`: ID of the link map.
     - `statusCode`: HTTP status code for the redirect.
     - `priority`: Rule priority.

4. **Testing Redirects**
   - Use `GET` requests to test the redirect behavior and verify entries.

## Limits and constraints
- Organization-scoped maps based on domain group ownership.
- Plan limits apply to the number of maps and total entries.
- Cannot delete a map that is referenced by active redirect rules.
- Destinations must be valid URLs (`http://` or `https://`); unsafe URLs return a `400 Bad Request`.
- Cache behavior: Successful loads are cached for up to 5 minutes; mutations invalidate the cache immediately.

## Related docs and API areas
- [Redirect rules](./redirect-rules.md)
- [Link map entries](./link-map-entries.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- API endpoints:
  - `GET /api/v1/link-maps?domainGroupId=...`: List all maps in the group.
  - `GET /api/v1/link-maps/:id`: Get a specific map.
  - `PUT /api/v1/link-maps/:id`: Update a map.
  - `DELETE /api/v1/link-maps/:id`: Delete a map.
