# Link Maps: Purpose, Behavior, and Safety

## What Link Maps Are
A link map is a keyed routing table used by redirect rules.
It maps an incoming key (path, optionally with query parameters) to a destination URL.

Typical usage:
- A redirect rule captures a short key from request path.
- The key is looked up in the assigned link map.
- The resolved destination is used as redirect target.
- If no entry matches, an optional map-level fallback destination is used.

## Why They Exist
Link maps allow large, dynamic key -> destination catalogs without creating one redirect rule per key.
This keeps redirect rules simple while enabling bulk operations on mappings.

## Data Model
A link map contains:
- `id`, `name`, `domainGroupId`
- `caseSensitive` (boolean)
- `queryMatch` (`ignore` | `exact` | `subset`)
- `fallbackDestination`
- many `LinkMapEntry` records

A link map entry contains:
- `key` (normalized persisted key)
- `keyNormalized` (canonical lookup key)
- `destination`

Database-level uniqueness:
- `@@unique([linkMapId, keyNormalized])`

This guarantees no duplicate effective keys inside a map.

## Key Normalization Rules
On create/update/import/upsert, entries are normalized before persistence:
- leading slash is tolerated in input but not required
- path is trimmed
- when `caseSensitive = false`, path and query keys/values are lowercased
- query parameters are canonicalized by key, then by value (sorted)
- full URLs are rejected as keys (`http://` / `https://`)
- empty keys are rejected

Result:
- equivalent keys collapse to one canonical key
- duplicate detection is deterministic

## Query Matching Modes
### `ignore`
- Only path is used for lookup.
- Request query parameters are ignored.

### `exact`
- Path + canonicalized full query must match exactly.
- Extra or missing request query parameters break the match.

### `subset`
- Entry query must be a subset of request query.
- Entries are evaluated by specificity (more query params first).
- The first matching (most specific) entry wins.

## Resolution Flow
When resolving `resolveLinkMapDestination(linkMapId, keyPath, query)`:
1. Load map context from cache (or DB if cache miss).
2. Normalize incoming path/query using map settings.
3. Apply `queryMatch` strategy (`ignore`, `exact`, or `subset`).
4. Return matched entry destination.
5. If no match, return `fallbackDestination` if configured, otherwise `null`.

## Safety and Security
Destinations are safety-checked before write operations:
- URL-like values are extracted from destinations.
- URLs are verified by `SafetyScannerService`.
- Unsafe destinations are rejected with `400 Bad Request`.
- Scanner failures return `500 Internal Server Error` (fail-closed behavior).

This applies to:
- map fallback destination validation
- entry create/update
- bulk upsert/import

## Cache Model
Link map context is cached under:
- `LINK_MAP_CONTEXT:<linkMapId>`

Behavior:
- cache miss -> DB read -> raw serialized context cached
- cache hit -> raw context hydrated into in-memory lookup maps
- missing map is negatively cached for short TTL

Cache invalidation occurs after any mutating operation (map or entries).

## Operational Constraints and Guardrails
- map/entry limits are enforced via `OrganizationService`
- deleting a map is blocked when linked redirect rules exist
- changing `caseSensitive` from `true` to `false` is forbidden
  - this prevents ambiguous collisions in existing keys

## Error Semantics
Main HTTP errors:
- `404` when map/entry/domain group is not accessible
- `400` for duplicate keys, invalid state transitions, unsafe destinations
- `500` when safety scan infrastructure fails

## Unit Test Coverage (current)
`backend/src/link-map/link-map.service.spec.ts` covers:
- map create/update/delete guardrails
- entry create normalization and duplicate protection
- import partial success/failure behavior
- upsert replace behavior
- cache invalidation behavior
- destination resolution across `ignore` / `exact` / `subset`
- cache hydration and context reuse behavior

## Practical Guidance
For predictable behavior:
- choose `exact` when query parameters are part of identity
- choose `subset` when query parameters are qualifiers
- choose `ignore` for pure path-based mapping
- keep keys normalized in bulk imports to minimize conflict surprises
