---
source: shared/docs/pages/guides/link-maps.md
generatedAt: 2026-06-07T10:06:55.243Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators who need to understand how to implement and manage link maps for URL redirection in LinkShift.

## What this doc covers
- Overview of link maps as keyed lookup tables for URL redirection.
- Instructions for creating and managing link maps in the dashboard.
- Scenarios for using link maps versus traditional redirect rules.
- Detailed end-to-end workflow for creating link maps, adding entries, and setting up redirect rules.
- Explanation of how keys are extracted from requests.
- Query matching options for link maps.
- Case sensitivity settings and their implications.
- Handling of fallback destinations when no entry matches.
- Examples of use cases for different query matching scenarios.
- API endpoints for managing link maps.

## Key workflows and rules
1. **Create Link Map**:
   - Endpoint: `POST /api/v1/link-maps`
   - Required fields: `name`, `domainGroupId`, `queryMatch`, `caseSensitive`, `fallbackDestination`.
   - Note: `caseSensitive` cannot be changed from `true` to `false` after creation.

2. **Add Entries**:
   - Endpoint: `POST /api/v1/link-map-entries`
   - Required fields: `linkMapId`, `key`, `destination`.
   - Bulk import is allowed via `POST /api/v1/link-map-entries/import` (up to 500 entries).

3. **Create Redirect Rule**:
   - Endpoint: `POST /api/v1/redirect-rules`
   - Required fields: `domainGroupId`, `source`, `pathMatch`, `queryMatch`, `linkMapId`, `statusCode`, `priority`.
   - The `statusCode` applies to redirects from map entries and `fallbackDestination`.

4. **Test Redirects**:
   - Use `GET` requests to test the redirection behavior and verify entries.

5. **Key Extraction**:
   - The key is extracted from the request path after the defined `source` prefix.

6. **Query Matching**:
   - Options include `ignore`, `exact`, and `subset`, which determine how query parameters affect entry matching.

7. **Fallback Destination**:
   - If no entry matches, the `fallbackDestination` is used if set; otherwise, the next redirect rule is evaluated.

## Limits and constraints
- Each link map can have a maximum of 500 entries per bulk import.
- Maps are organization-scoped and subject to plan limits on count and total entries.
- Cannot delete a map that is still referenced by active redirect rules.
- Destinations must be valid URLs (`http://` or `https://`).
- Cache behavior includes a 5-minute cache for successful loads and a 60-second negative cache for deleted or unknown `linkMapId`.

## Related docs and API areas
- [Redirect rules](./redirect-rules.md)
- [Link map entries](./link-map-entries.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- API endpoints:
  - `GET /api/v1/link-maps?domainGroupId=...`
  - `GET /api/v1/link-maps/:id`
  - `POST /api/v1/link-maps`
  - `PUT /api/v1/link-maps/:id`
  - `DELETE /api/v1/link-maps/:id`
