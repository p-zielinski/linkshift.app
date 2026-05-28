---
source: shared/docs/pages/guides/link-maps.md
generatedAt: 2026-05-28T15:49:30.665Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and system administrators who need to understand how to implement and manage link maps for URL redirection in their applications.

## What this doc covers
- Overview of link maps and their benefits
- When to use link maps
- End-to-end workflow for creating and managing link maps
- How keys are extracted from requests
- Query matching strategies for link maps
- Case sensitivity options
- Fallback destination behavior
- Examples of use cases for link maps
- API endpoints related to link maps
- Constraints and limits on link maps

## Key workflows and rules
1. **Create Link Map**: 
   - Endpoint: `POST /api/v1/link-maps`
   - Required fields: `name`, `domainGroupId`, `queryMatch`, `caseSensitive`, `fallbackDestination`.
   - Important: `caseSensitive` cannot be changed from `true` to `false` after creation.

2. **Add Entries**:
   - Endpoint: `POST /api/v1/link-map-entries`
   - Bulk import: `POST /api/v1/link-map-entries/import` (up to 500 entries).

3. **Create Redirect Rule**:
   - Endpoint: `POST /api/v1/redirect-rules`
   - Required fields: `domainGroupId`, `source`, `pathMatch`, `queryMatch`, `linkMapId`, `statusCode`, `priority`.

4. **Testing**:
   - Use `GET` requests to verify link map functionality and simulate redirects.

5. **Key Extraction**:
   - The key is extracted from the request path after the defined `source` prefix.

6. **Fallback Behavior**:
   - If no entry matches, the `fallbackDestination` is used if set; otherwise, the next rule is evaluated.

## Limits and constraints
- Organization-scoped ownership of link maps via domain groups.
- Plan limits apply to the number of maps and total entries.
- Cannot delete a map referenced by active redirect rules.
- Destinations must be valid URLs (`http://` or `https://`).
- Cache behavior: successful loads are cached for up to 5 minutes; negative cache lasts 60 seconds for deleted or unknown `linkMapId`.

## Related docs and API areas
- [Redirect rules](./redirect-rules.md)
- [Link map entries](./link-map-entries.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- API endpoints:
  - `GET /api/v1/link-maps?domainGroupId=...`
  - `GET /api/v1/link-maps/:id`
  - `PUT /api/v1/link-maps/:id`
  - `DELETE /api/v1/link-maps/:id`
