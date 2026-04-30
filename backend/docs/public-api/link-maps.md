# Link Maps API

Link maps let you resolve many short keys with fewer redirect rules.

Base path: `/api/v1/link-maps`

## Endpoints

- `GET /api/v1/link-maps?domainGroupId=...`
- `GET /api/v1/link-maps/:id`
- `POST /api/v1/link-maps`
- `PUT /api/v1/link-maps/:id`
- `DELETE /api/v1/link-maps/:id`

## Why Link Maps Matter

A single redirect rule can point to a link map, allowing many key -> destination mappings without rule explosion.

## Core Behavior

- `queryMatch`: `ignore`, `exact`, `subset`
- `caseSensitive`: controls key normalization and matching behavior
- `fallbackDestination`: optional fallback when key lookup misses

## Constraints and Operational Notes

- Link maps are organization-scoped through domain-group ownership checks.
- Plan limits are enforced for map count and entry counts.
- Deleting a map that is still referenced by active redirect rules is blocked.
- Destination safety checks are enforced in backend services before writes.
