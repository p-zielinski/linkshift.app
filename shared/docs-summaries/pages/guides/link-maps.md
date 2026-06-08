---
source: shared/docs/pages/guides/link-maps.md
generatedAt: 2026-06-08T20:10:20.734Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators who need to understand how to create and manage link maps for URL redirection.

## What this doc covers
- Overview of link maps and their benefits
- Dashboard management of link maps
- End-to-end workflow for creating link maps
- Key extraction methods for link map entries
- Query matching strategies for link maps
- Case sensitivity rules for link map keys
- Fallback destination behavior
- Examples of link map use cases
- API endpoints for managing link maps
- Constraints and limits related to link maps

## Key workflows and rules
### Step 1 — Create link map
- **Endpoint:** `POST /api/v1/link-maps`
- **Fields:**
  - `name`: Name of the link map
  - `domainGroupId`: ID of the domain group
  - `queryMatch`: How entries match request query (default is `ignore`)
  - `caseSensitive`: Boolean for key normalization (default is `false`)
  - `fallbackDestination`: URL used when no entry matches (optional but recommended)

### Step 2 — Add entries
- **Endpoint:** `POST /api/v1/link-map-entries`
- **Fields:**
  - `linkMapId`: ID of the link map
  - `key`: The key for the entry
  - `destination`: The static URL destination for the key
- **Bulk Import:** Up to 500 entries via `POST /api/v1/link-map-entries/import`.

### Step 3 — Create redirect rule
- **Endpoint:** `POST /api/v1/redirect-rules`
- **Fields:**
  - `domainGroupId`: ID of the domain group
  - `source`: Path prefix for the rule
  - `pathMatch`: Must be `prefix`
  - `queryMatch`: Must be `ignore`
  - `linkMapId`: ID of the link map
  - `destination`: Must be `null`
  - `statusCode`: HTTP status code for the redirect
  - `priority`: Priority of the rule

### Step 4 — Test
- Use `GET` requests to verify link map functionality.

### Key Extraction
- The key is extracted from the request path after the defined `source` prefix.
- Trailing slashes on the `source` can affect matching behavior.

### Query Matching
- `ignore`: Only the path is considered.
- `exact`: Path and full query must match.
- `subset`: Entry query must be contained in the request query.

### Fallback Destination
- If no entry matches, the `fallbackDestination` is used if set; otherwise, the next redirect rule is evaluated.

## Limits and constraints
- Maps are organization-scoped via domain group ownership.
- Plan limits apply to the number of maps and total entries.
- Cannot delete a map referenced by active redirect rules.
- Destinations must pass URL safety checks (`http://` or `https://` only).
- Cache behavior includes a 5-minute cache for successful loads and a 60-second negative cache for deleted or unknown `linkMapId`.

## Related docs and API areas
- [Redirect rules](./redirect-rules.md)
- [Link map entries](./link-map-entries.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- API Endpoints:
  - `GET /api/v1/link-maps?domainGroupId=...`: List all maps in the group.
  - `GET /api/v1/link-maps/:id`: Get one map.
  - `PUT /api/v1/link-maps/:id`: Update map.
  - `DELETE /api/v1/link-maps/:id`: Delete map.
