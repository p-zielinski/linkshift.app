---
source: shared/docs/pages/guides/link-maps.md
generatedAt: 2026-06-03T16:59:23.195Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators who need to understand how to implement and manage link maps for URL redirection in the LinkShift platform.

## What this doc covers
- Overview of link maps as keyed lookup tables for URL redirection.
- Dashboard management for link maps.
- Scenarios for using link maps versus traditional redirect rules.
- End-to-end workflow for creating link maps and adding entries.
- Key extraction methods for link map lookups.
- Query matching strategies for link maps.
- Case sensitivity settings for link map keys.
- Handling requests that hit only the prefix of a link map.
- Fallback destination behavior when no entry matches.
- Examples of use cases for link maps.
- API endpoints related to link maps.
- Constraints and limits on link maps.

## Key workflows and rules
### Step 1 — Create link map
- **Endpoint:** `POST /api/v1/link-maps`
- **Request Body:**
  ```json
  {
    "name": "Summer campaign",
    "domainGroupId": "dmg_prod",
    "queryMatch": "ignore",
    "caseSensitive": false,
    "fallbackDestination": "https://example.com/link-expired"
  }
  ```
- **Fields:**
  - `queryMatch`: Determines how entries match request queries.
  - `caseSensitive`: Normalization of keys (default is `false`).
  - `fallbackDestination`: URL used when no entry matches (recommended).

### Step 2 — Add entries
- **Endpoint:** `POST /api/v1/link-map-entries`
- **Request Body:**
  ```json
  {
    "linkMapId": "lmap_abc123",
    "key": "summer",
    "destination": "https://shop.example.com/summer-sale"
  }
  ```
- **Bulk Import:** Up to **500** entries via `POST /api/v1/link-map-entries/import`.

### Step 3 — Create redirect rule
- **Endpoint:** `POST /api/v1/redirect-rules`
- **Request Body:**
  ```json
  {
    "domainGroupId": "dmg_prod",
    "source": "/go",
    "pathMatch": "prefix",
    "queryMatch": "ignore",
    "linkMapId": "lmap_abc123",
    "destination": null,
    "statusCode": 302,
    "priority": 100
  }
  ```

### Step 4 — Test
- **Example Request:** `GET https://links.example.com/go/summer?utm=email`
- **Expected Outcome:** Redirects to `https://shop.example.com/summer-sale`.

## Limits and constraints
- **Organization Scope:** Maps are scoped to domain groups.
- **Plan Limits:** Apply to the number of maps and total entries.
- **Deletion Restrictions:** Cannot delete a map referenced by active redirect rules.
- **URL Safety Checks:** Destinations must be valid URLs (`http://` or `https://`).
- **Cache Behavior:** Link map data is cached for up to 5 minutes; negative cache for deleted maps lasts up to 60 seconds.

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
