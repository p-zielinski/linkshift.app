# LinkShift internal documentation

**Not published** to the public docs site (`/docs`). This folder is for engineers and operators only.

| Document | Contents |
|----------|----------|
| [rate-limiting.md](./rate-limiting.md) | Redis/L1 rate limiter implementation, keys, plan thresholds |
| [security-checks.md](./security-checks.md) | Safety scanner, domain blacklist, daily rescan pipeline |
| [cache-and-data-layer.md](./cache-and-data-layer.md) | Redirect/link map cache keys, TTLs, invalidation |
| [observability.md](./observability.md) | Critical errors, logging fields, operator alerts |

Public customer-facing behavior (status codes, limits at a glance) stays in [`shared/docs/`](../docs/README.md).

**Do not copy from this folder into public guides:** rescan schedules/selection, Web Risk quotas, Redis rate-limit keys, cache key prefixes, or log catalogs. Public docs use controlled imprecision (“ongoing safety monitoring”, “up to 5 minutes stale”, “plan-based limits”).
