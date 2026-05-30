# Cache and data layer (redirect path)

## Redirect context

| Item | Detail |
|------|--------|
| Key | `REDIRECT_CONTEXT:{hostname}` (lowercased hostname at call sites) |
| Payload | Domain/subdomain + domain group + active redirect rules (`isBlocked: false`, `deletedAt: null`) |
| L1 | Process-local LRU (`CacheManagerService.localCache`) |
| L2 | Redis, TTL **5 minutes** (`minutesToTtl(5)` in `setRedirectContext`) |
| Miss | DB load in `RedirectService`, then `setRedirectContext` |
| Invalidation | `invalidateRedirectContext(hostname)` on domain/subdomain/group/rule mutations affecting that host |

Simulate and redirect tests read **Postgres directly** for rules/maps — not edge `REDIRECT_CONTEXT`.

## Link map context

| Item | Detail |
|------|--------|
| Key | `LINK_MAP_CONTEXT:{linkMapId}` |
| Positive TTL | **300s** (`LINK_MAP_CACHE_TTL_SECONDS` in `link-map.service.ts`) |
| Negative TTL | **60s** when map ID missing (`setCustomCache(cacheKey, null, 60)`) |
| Invalidation | `invalidateLinkMapCache` on map/entry create/update/delete/import |

Hydration builds in-memory maps: `entriesByKey`, subset sorting by `countQueryParams` descending.

## Caddy / edge hostname routing

Separate hostname→routing cache (~5 min) invalidated alongside redirect context on domain changes (see `AI_CONTEXT.md`). Public docs: “normally immediate after API write; up to 5 minutes if invalidation fails.”

## Rule evaluation order (DB + cache)

Loaded rules ordered: `priority DESC`, `createdAt DESC`, `id DESC` (`REDIRECT_RULE_EVALUATION_ORDER` in `redirect.service.ts`) — same order for live routing, simulate, list API, and cache hydration.

## Link map resolution (hot path)

`resolveLinkMapDestination(linkMapId, keyPath, requestQuery)`:

1. `getLinkMapContext` (cache → DB)
2. Normalize key per `caseSensitive` + query canonicalization
3. Branch on map `queryMatch` (`ignore` / `exact` / `subset`)
4. Return static URL or `fallbackDestination` or `null`

Miss → redirect rule does not win; next rule evaluated.

## Performance notes for operators

- Rate limit L1 block keys reduce Redis load for hot orgs after first `429` in a minute.
- Negative link-map cache prevents DB storms on deleted `linkMapId` references for 60s.
- Global safety rescan uses analytics aggregate, not live request path.
