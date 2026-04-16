# Infrastructure Notes

This document describes infrastructure-relevant runtime behavior for caching and CORS.

## Redirect Caching (`backend`)

Path:
- `backend/src/redirect/redirect.service.ts`
- `backend/src/cache/cache-manager.service.ts`
- `backend/src/redis/redis.service.ts`

### Redirect context flow

`applyRedirect()` resolves domain context through:
1. L1 in-memory cache (`LRUCache`)
2. Redis (L2)
3. Prisma DB query on cache miss

Cache key:
- `REDIRECT_CONTEXT:<normalized-hostname>`
- Hostname normalization is lowercase, without port, and without trailing dot.

### TTL and units

- L1 cache default TTL: `15 * 1000` -> **15 seconds** (milliseconds in code).
- Redirect context L2 TTL: `minutesToTtl(5)` -> **300 seconds**.
- Redis TTL is set using `SET key value EX <seconds>` -> **seconds**.

There is no millisecond/second mismatch in Redis TTL for redirect context.

### Negative caching

Redirect context supports negative caching (`null` means domain not found):
- `undefined` = cache miss
- `null` = cached "not found"

This prevents repeated DB hits for non-existent domains.

### Invalidation rules

Redirect/caddy caches are invalidated after:
- domain create/update/delete
- redirect rule create/update/delete
- domain group update/delete

Invalidation is done for all hostnames in the affected domain group and uses normalized hostnames.

## CORS (`backend` and `backend-tools`)

Paths:
- `backend/src/main.ts`
- `backend-tools/src/main.ts`

Both services allow request headers needed by browser preflight for public tools and app API calls:
- `Authorization`
- `Content-Type`
- `Accept`
- `X-Requested-With`
- `X-XSRF-TOKEN`
- `Cache-Control`
- `Pragma`
- `Expires`

`backend-tools` additionally allows:
- `User-Agent`

This prevents preflight rejection when frontend sends cache-control request headers (including `Expires`).
