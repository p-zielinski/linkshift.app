# Redirect rules — matching and destinations

How redirect rules match requests and resolve destinations — fields, source types, `pathMatch`, `queryMatch`, methods, priority, and static or dynamic targets.

Part of the [Redirect rules guide](./redirect-rules.md). For link maps on rules, see [Link maps and redirect rules](./redirect-rules-link-maps.md). For simulate and analytics, see [Operations](./redirect-rules-operations.md). For recipes, see [Recipes](./redirect-rules-recipes.md).

For placeholder syntax, conditional operators, and engine limits, see [Redirect engine concepts](../concepts/redirect-engine-concepts.md).

Base path: `/api/v1/redirect-rules`

---

## How routing works

Every request to a domain or LinkShift subdomain in your organization hits a **domain group**. That group owns an ordered list of redirect rules.

```
Request arrives
    → Organization redirect rate limit (redirectionLimitPerMinute) → 429 if exceeded
    → Organization redirect access (checkRedirectionAccess) → 402 if suspended or over plan limits
    → Optional: GET /robots.txt from domain group policy (not a redirect rule; still counts toward rate limit)
    → Load domain group + active, non-deleted, non-blocked rules (priority desc, then newest first)
    → For each rule in order:
         → Does source match path/query/method?
         → If linkMapId: extract key → lookup in link map
              → Miss (no entry, no fallback) → try next rule
              → Hit → use static entry or map fallback URL
         → Else resolve rule destination ($N → placeholders → conditionals)
         → If target is absolute URL and host is on blacklist → 403
         → If blacklist check fails (infrastructure) → 503, no redirect
         → Else redirect with statusCode
    → No rule produced a target → 404 (no redirect)
```

Full pipeline and destination resolution order: [Redirect engine concepts — live redirect pipeline](../concepts/redirect-engine-conditionals.md#live-redirect-pipeline-end-to-end).

**Visual overview:** [Routing decision flow (Mermaid)](../concepts/redirect-engine-conditionals.md#routing-decision-flow-diagram) and [queryMatch decision tree](../concepts/redirect-engine-conditionals.md#choosing-querymatch-rule-vs-link-map).

**First rule that produces a redirect wins.** A rule can match the request (path, method, etc.) but still be skipped — for example when a link map lookup returns no entry and no `fallbackDestination`. In that case the engine tries the **next** rule.

Soft-deleted rules (`deletedAt` set) are excluded from live routing, simulate, and **`GET /api/v1/redirect-rules` list** (the list API always filters `deletedAt: null`). Use `GET /api/v1/redirect-rules/:id` only if you still have the rule ID after delete — otherwise treat deleted rules as gone from management views.

Rules with `isBlocked: true` are skipped entirely at runtime (but may still appear on GET/list). See [Blocked rules](#blocked-rules-isblocked).

Public redirect traffic is also subject to **organization redirect rate limits** (plan-based, per minute). This is separate from API key rate limits — see [Getting started — redirect rate limits](../guides/getting-started.md#redirect-rate-limits-edge-traffic).

After you change rules or link maps, edge behavior updates when [redirect and link map caches](#propagation-and-caching) invalidate (normally immediately after a successful API write).

---

## Organization redirect rate limits (edge traffic)

Every **live** request to a custom domain or LinkShift subdomain in your organization counts against `redirectionLimitPerMinute` from the active plan — including traffic that never reaches redirect rules.

| Topic | Behavior |
|-------|----------|
| Scope | Per organization, per UTC minute bucket |
| When checked | **Before** `robots.txt` handling and **before** rule evaluation (first rate limit, then `checkRedirectionAccess`) |
| On exceed (rate) | **`429 Too Many Requests`** — JSON error (`too_many_requests`, details: `Organization rate limit exceeded`). **No redirect** is issued. |
| On fail (access) | **`402 Payment Required`** — suspended organization or plan limit overage (`checkRedirectionAccess`). **No redirect** is issued. |
| `GET /robots.txt` | Still subject to rate limit and access checks (both run before robots handling) |
| Simulate / redirect tests | Do **not** consume redirect rate limit; simulate **does** run `checkRedirectionAccess` (can return **`402`**) |
| API key calls | Separate limit — see [Getting started](../guides/getting-started.md#per-key-rate-limits) |

Use `GET /api/v1/organization/usage` to see current plan limits before high-traffic launches.

---

## Propagation and caching

LinkShift caches routing data on the edge to keep redirects fast. Under normal operation, successful Management API writes invalidate cached routing for the affected hostname or link map immediately.

| Layer | What is cached | Typical stale window if invalidation fails |
|-------|----------------|--------------------------------------------|
| Redirect context | Domain group, rules, and domains for a hostname | Up to **5 minutes** |
| Link map context | Entries, `queryMatch`, `caseSensitive` for a map ID | Up to **5 minutes** |
| Missing link map ID | Short-lived “not found” cache when a rule references a deleted map | Up to **~1 minute** |
| Edge hostname routing | Which organization serves a hostname | Up to **5 minutes** |

**What to expect after deploy:**

1. **Redirect rule or domain change** — the next request on that host should load fresh rules. Rare infrastructure errors can leave stale rules for up to **5 minutes**.
2. **Link map entry change** — successful writes normally clear map cache immediately; stale entry data can persist up to **5 minutes** only if invalidation does not run.
3. **Deleted link map still referenced by a rule** — lookups miss (same as key miss); a brief negative cache can repeat that miss even if you recreate a map with the same ID. Update the rule or wait for the cache window to expire.

Simulate and redirect tests **read current database state** for rules and maps (they do not use edge redirect/link-map caches), but they still run `checkRedirectionAccess` — see [Simulate vs live redirect](./redirect-rules-operations.md#simulate-vs-live-redirect).

Operator runbooks (cache key names, Redis/L1 layout): [`shared/not-public/cache-and-data-layer.md`](../../../not-public/cache-and-data-layer.md).

More detail on link map resolution cache: [Link map concepts — cache model](../concepts/link-map-concepts.md#cache-model).

---

## Rule fields

| Field | Purpose | Default |
|-------|---------|---------|
| `source` | What incoming requests must look like | required |
| `destination` | Where to send the visitor (static URL or routing logic) | required unless `linkMapId` is set |
| `statusCode` | HTTP redirect code (`301`, `302`, `307`, `308`) | `302` |
| `pathMatch` | `exact` or `prefix` path comparison | `exact` |
| `queryMatch` | `exact`, `ignore`, or `subset` query comparison | `exact` |
| `matchMethod` | Allowed HTTP methods; empty array = all methods | `[]` |
| `priority` | Higher number = evaluated first (0–1000) | `0` |
| `linkMapId` | Optional link map for key-based destinations | `null` |
| `domainGroupId` | Group this rule belongs to | required |

### Status codes — when to use which

| Code | Meaning | Typical use |
|------|---------|---------------|
| `301` | Moved permanently | SEO migrations, old domain retirement |
| `302` | Found (temporary) | Campaign links, short-term redirects |
| `307` | Temporary, preserve method | API redirects where POST must stay POST |
| `308` | Permanent, preserve method | Permanent API endpoint moves |

Browsers may change `POST` to `GET` on `301`/`302`. Use `307`/`308` when the client must keep the same HTTP method. For short links that should accept only `GET`, set `matchMethod: ["GET"]` on the rule so `POST`/`PUT` fall through to the next rule or `404`.

### Blocked rules (`isBlocked`)

| Topic | Detail |
|-------|--------|
| Runtime | `isBlocked: true` → rule never evaluated (live, simulate, analytics) |
| API write | Not set via create/update body; returned on GET/list |
| Create/update scan | Rules with a non-null `destination` are scanned for unsafe static URLs when saved |
| Ongoing safety monitoring | Platform may **re-check** redirect destinations over time (rules with a non-null `destination`). Unsafe URLs → `isBlocked: true`, optional domain blacklist update, **email to that rule’s organization owner**. **Link map rules** (`destination: null`) are not monitored on the rule record — entry and `fallbackDestination` URLs are validated on map writes |
| Unblock | Any successful `PUT` on the rule clears `isBlocked` and `blockedAt` (even if you only change `priority`). Fix destinations first — ongoing safety monitoring can block again |

See [Redirect engine concepts — blocked rules](../concepts/redirect-engine-edge-cases.md#blocked-rules-isblocked).

### Runtime safety after a match

| Outcome | When |
|---------|------|
| Redirect (`301`/`302`/…) | Rule (or link map entry) resolved a target and safety checks passed |
| `403 Forbidden` | Resolved **absolute** target (`http://` / `https://`) host is on platform domain blacklist |
| `503 Service Unavailable` | Blacklist check failed (infrastructure error); **no redirect** (fail-closed) |
| `429 Too Many Requests` | Organization redirect rate limit exceeded for the current minute |
| Skip rule | Link map miss with no fallback (try next rule); malformed rule at runtime; recursion limit exceeded |
| `404 Not Found` | No rule produced a redirect |

Root-relative destinations (`/mobile`, `/path`) are **not** sent through domain blacklist (no host to verify). See [Redirect engine concepts — blacklist](../concepts/redirect-engine-edge-cases.md#destination-domain-blacklist-runtime).

---

## Source types

Your `source` can be one of four forms.

**Always use a leading `/` on path sources** (for example `/go`, not `go`). The API does not strictly require it, but `parseSourceForMatch` uses `new URL(source, 'http://localhost')`, so a missing slash changes how the path is interpreted.

| `source` (avoid) | Parsed path used for matching | Request `/go` matches? |
|------------------|-------------------------------|-------------------------|
| `go` | `/go` (browser base URL normalizes) | Unreliable — always send `/go` |
| `/go` | `/go` | Yes (with correct `pathMatch` / `queryMatch`) |

Prefer `/go` in every create/update payload and in redirect tests.

### 1. Plain path

Match a specific path (and optionally query string embedded in source).

```json
{ "source": "/pricing", "destination": "https://example.com/plans" }
```

With default `queryMatch: exact`, request `/pricing?utm=email` does **not** match source `/pricing`.

### 2. Path with query in source

Embed expected query parameters directly in source:

```json
{
  "source": "/promo?utm=email",
  "queryMatch": "subset",
  "destination": "https://example.com/email-offer"
}
```

| Request | `queryMatch` | Match? |
|---------|--------------|--------|
| `/promo?utm=email` | `exact` | Yes |
| `/promo?utm=email&cid=123` | `subset` | Yes |
| `/promo?utm=email&cid=123` | `exact` | No (extra param) |
| `/promo?cid=123` | `subset` | No (missing `utm=email`) |
| `/promo?utm=email` | `ignore` | Yes (query ignored) |

### 3. Regex

Store regex as a string: `/pattern/flags`

```json
{
  "source": "/^\\/blog\\/(.+)$/",
  "destination": "https://new-blog.example.com/posts/$1"
}
```

Request `/blog/my-post` → `https://new-blog.example.com/posts/my-post`

Capture groups `$0` (full match), `$1`, `$2`, … work **only when `source` is stored as `/pattern/flags` regex**. Plain-path and wildcard rules do not substitute `$N`; the API rejects any `$N` in `destination` on create/update. See [Redirect engine concepts — regex capture groups](../concepts/redirect-engine-edge-cases.md#regex-sources).

Substitution runs before placeholders. Validation counts **capturing** groups only (`(?:…)` does not count toward `$N` limits).

With `queryMatch: ignore`, regex runs against path only. Otherwise it runs against path + query (`originalUrl`).

**`pathMatch` is not used for regex sources.** The API accepts `pathMatch` on create/update, but at runtime only `queryMatch` affects regex rules (path-only vs `originalUrl`). Use the pattern itself to anchor paths (for example `^\\/blog\\/`) — do not rely on `pathMatch: prefix` with a regex `source`.

#### Plain path or regex?

If `source` ends with `/` followed by **only** valid RegExp flag letters (`d`, `g`, `i`, `m`, `s`, `u`, `v`, `y`), the engine treats it as **regex**, not a literal path.

| `source` | Result |
|----------|--------|
| `/v2/go` | Plain path (safe for link map prefixes) |
| `/campaign/i` | Regex `campaign`, case-insensitive — **not** literal `/campaign/i` |
| `/^\\/blog\\/(.+)$/` | Regex (recommended form) |

Details: [Redirect engine concepts — plain path vs regex](../concepts/redirect-engine-edge-cases.md#plain-path-vs-regex--do-not-confuse-them).

### 4. Wildcard catch-all

Source `*` matches every request (after `matchMethod` filter only). Use low priority so specific rules run first:

```json
{
  "source": "*",
  "destination": "https://www.example.com/{path}",
  "priority": 0
}
```

**`pathMatch` and `queryMatch` do not affect wildcard rules.** At runtime the engine sets a match for `*` without reading those fields. Setting `queryMatch: "exact"` on a catch-all does **not** restrict which query strings match — only `matchMethod` limits the rule. To require specific query params, use a plain `source` with `?…` embedded or filter inside the `destination` with conditionals and `{query.*}` placeholders.

Cannot be combined with `linkMapId`.

---

## Path matching (`pathMatch`)

Applies to **plain path** `source` values only (not `/pattern/flags` regex, not `*`). See [Regex](#3-regex) and [Wildcard](#4-wildcard-catch-all) above.

### `exact` (default)

Request path must equal source path (query handled separately by `queryMatch`). Matching is strict string equality — trailing slashes matter.

| Rule `source` | Request path | Match? |
|---------------|--------------|--------|
| `/go` | `/go` | Yes |
| `/go/` | `/go/` | Yes |
| `/go` | `/go/` | **No** |
| `/go/` | `/go` | **No** |

### `prefix`

Request path must start with source path **at a segment boundary**.

| Source | Request | Match? |
|--------|---------|--------|
| `/v1` | `/v1/users` | Yes |
| `/v1` | `/v1` | Yes |
| `/v1` | `/v11/users` | No (`/v11` is not `/v1/…`) |
| `/articles` | `/articles/guide/setup` | Yes |

**Trailing slash on `source` (prefix):** Matching is not symmetric. A source **without** a trailing slash also matches request paths that add one; a source **with** a trailing slash does not match the prefix alone.

| `pathMatch` | Rule `source` | Request path | Match? |
|-------------|---------------|--------------|--------|
| `prefix` | `/go` | `/go/summer` | Yes |
| `prefix` | `/go` | `/go/` | Yes |
| `prefix` | `/go` | `/go` | Yes |
| `prefix` | `/go/` | `/go/summer` | Yes |
| `prefix` | `/go/` | `/go` | **No** |

Prefer `/go` (no trailing slash) for short-link prefixes unless you intentionally require `/go/…`.

**Segment boundary:** After the prefix, the next character must be `/` or end-of-path. `/v1` does not match `/v11/…`. In rare cases a `?` immediately after the prefix can satisfy the boundary check — prefer normalized paths without embedding `?` in the pathname.

**Prefix + query in `source`:** You can embed query params in `source` (same as exact path rules). The path prefix and query in `source` are evaluated separately: `pathMatch: prefix` applies to the path portion; `queryMatch` applies to the query portion embedded in `source`.

```json
{
  "source": "/v1?333=1",
  "pathMatch": "prefix",
  "queryMatch": "exact",
  "destination": "https://api.example.com/legacy-v1"
}
```

| Request | Match? | Redirect when this rule wins |
|---------|--------|------------------------------|
| `GET /v1/users?333=1` | Yes | `302` → `https://api.example.com/legacy-v1` |
| `GET /v1?333=1` | Yes | `302` → `https://api.example.com/legacy-v1` |
| `GET /v1/users?333=1&x=2` | **No** | — (extra query param under `exact`; engine tries the next rule, or `404`) |
| `GET /v2/users?333=1` | **No** | — (path fails segment boundary; next rule or `404`) |

**Simulate check** (same rule on `domainGroupId` `dmg_1`, default `statusCode` `302`):

```json
POST /api/v1/redirect-rules/simulate
{
  "entries": [
    {
      "domainGroupId": "dmg_1",
      "hostname": "links.example.com",
      "path": "/v1/users",
      "query": { "333": "1" }
    }
  ]
}
```

```json
{
  "results": [
    {
      "index": 0,
      "matched": true,
      "statusCode": 302,
      "target": "https://api.example.com/legacy-v1",
      "linkMapKey": null
    }
  ]
}
```

**Case sensitivity:** Path matching is **case-sensitive**. Source `/Go` does not match request `/go/summer`. Normalize casing in your `source` to match how visitors and CDNs send paths.

Prefix + path passthrough example:

```json
{
  "source": "/articles",
  "pathMatch": "prefix",
  "queryMatch": "ignore",
  "destination": "https://docs.example.com/integrations/articles/{segments.2}"
}
```

Request `https://support.example.com/articles/integrations/slack-guide?utm=legacy`  
→ `https://docs.example.com/integrations/articles/slack-guide`

---

## Query matching (`queryMatch`)

| Mode | Behavior |
|------|----------|
| `exact` | Request query must match source query exactly (same keys and values). No extra params. |
| `ignore` | Query string ignored for matching. |
| `subset` | Every query param in source must appear in request with matching values. Extra request params allowed. |

**Subset edge case:** If the source has **no** query string, `subset` matches any request query (same as “path matched, query unrestricted”).

**Duplicate params:** Matching compares all values per key (sorted). Placeholders `{query.x}` use the **last** value for that key in the query string (see [Redirect engine concepts — query variables](../concepts/redirect-engine-variables.md#query-variables)).

**Percent-encoding:** Paths and query values are compared after URL parsing (decoded form). Prefer testing non-ASCII or encoded segments with [simulate](./redirect-rules-operations.md#simulate-before-rollout).

**Duplicate params (`exact` mode):**

| Source query | Request query | Match? |
|--------------|---------------|--------|
| `?tag=a&tag=b` | `?tag=b&tag=a` | Yes (same multiset of values) |
| `?tag=a` | `?tag=a&tag=b` | No (extra value for `tag`) |
| `?tag=a&tag=b` | `?tag=a` | No (missing value `b` for `tag`) |

**Choosing a mode (redirect rule — not link map):**

| Goal | `queryMatch` | Example `source` | Request |
|------|--------------|------------------|---------|
| Path only; ignore all query params | `ignore` | `/pricing` | `/pricing?utm=x` → match |
| Campaign URL is exact identity | `exact` | `/promo?utm=email` | `/promo?utm=email` → match; extra `&cid=1` → no match |
| Require minimum params; allow extras | `subset` | `/promo?utm=email` | `/promo?utm=email&cid=1` → match |
| Path gate only; any query OK | `subset` | `/promo` (no `?` in source) | `/promo?any=value` → match |
| Link map prefix rule | **`ignore`** (required) | `/go` | Query handled on the **map** — see [Link maps](./link-maps.md) |

Link map `queryMatch` is independent — see [Link map concepts — choosing queryMatch](../concepts/link-map-concepts.md#choosing-querymatch--decision-guide) and the [rule vs map diagram](../concepts/redirect-engine-conditionals.md#choosing-querymatch-rule-vs-link-map).

---

## HTTP method matching (`matchMethod`)

Only these **seven** HTTP methods are supported: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`. There is no `CONNECT`, `TRACE`, or other method — requests using unsupported methods never match rules that list explicit methods, and are not part of the “all methods” set when `matchMethod` is `[]`.

No duplicates in the array.

| `matchMethod` | Behavior |
|---------------|----------|
| `[]` (empty) | All **7** methods match |
| `["GET"]` | Only GET |
| `["GET", "HEAD"]` | GET and HEAD only (up to **6** explicit values) |

You cannot list all 7 methods explicitly — use `[]` instead. Listing 7 values returns `400` (`Maximum 6 methods allowed`).

Example — redirect GET only, let POST hit origin:

```json
{
  "source": "/api/legacy",
  "destination": "https://api.example.com/v2",
  "matchMethod": ["GET"],
  "priority": 100
}
```

---

## Priority and rule ordering

At **redirect runtime**, **simulate**, and in the dashboard list (`GET /api/v1/redirect-rules`), rules sort by **`priority` descending**, then **`createdAt` descending** (newer rule wins when priority ties), then **`id` descending** when both still tie.

The list endpoint uses the same ordering for cursor pagination (`startAfterId` follows `priority`, `createdAt`, `id`).

Put specific rules high, catch-alls low:

| Priority | Source | Role |
|----------|--------|------|
| 200 | `/admin` | Admin redirect |
| 100 | `/go` + link map | Short links |
| 50 | `/^\\/blog\\/` | Blog migration |
| 0 | `*` | Default fallback |

---

## Static destinations

Simplest form — fixed URL:

```json
{
  "source": "/legacy",
  "destination": "https://example.com/new-home",
  "statusCode": 308,
  "queryMatch": "ignore",
  "pathMatch": "prefix"
}
```

Destinations must start with `http://`, `https://`, or `/` (root-relative path on the same host). Use `/new-page` for same-host redirects without repeating the domain; use full URLs when crossing domains.

---

## Dynamic destinations — placeholders

Inject request data into destination with `{variable}` syntax. Chain modifiers with colons:

```
{variable:modifier1.modifier2}
```

Quick examples:

```json
{
  "source": "/^\\/blog\\/(.+)$/",
  "destination": "https://new-blog.example.com/posts/$1?from={domain.root:to_upper_case.url_encode}"
}
```

Request `http://sub.my-domain.com/blog/cool-article`  
→ `https://new-blog.example.com/posts/cool-article?from=MY-DOMAIN`

```json
{
  "source": "/^\\/(.*)$/",
  "destination": "https://{domain.extension}/$1"
}
```

Request `https://www.example.com/pricing?utm=ad`  
→ `https://example.com/pricing?utm=ad` (apex redirect preserving path)

Leave `queryMatch` at default (`exact`) for this regex so the pattern runs against `originalUrl` and query stays in `$1`. With `queryMatch: ignore`, only the path is matched and query params are dropped (verified in `redirect.service.spec.ts` — www→apex with `queryMatch: exact`).

Full placeholder and modifier reference: [Redirect engine concepts](../concepts/redirect-engine-concepts.md).

---

## Dynamic destinations — conditional routing

Destination can be a **routing program** using ternary syntax:

```
Condition ? TrueDestination : FalseDestination
```

Nested example (mobile vs desktop):

```json
{
  "source": "*",
  "destination": "'{user-agent}' ~= 'iPhone' ? /mobile-site : /desktop-site",
  "queryMatch": "ignore",
  "priority": 10
}
```

Traffic split (30% variant A):

```json
{
  "source": "*",
  "destination": "random(0,100) < 30 ? https://variant-a.example.com : https://variant-b.example.com"
}
```

Time-based routing:

```json
{
  "source": "/sale",
  "destination": "time() > datetime('2025-12-01') ? https://example.com/sale-live : https://example.com/sale-soon"
}
```

If-else-if by HTTP method:

```json
{
  "source": "*",
  "destination": "'{method}' == 'GET' ? /get : ('{method}' == 'POST' ? /post : /other)"
}
```

Country routing via `{geo.country}` is a **planned** feature — not available today (no placeholder, no dev stub). See [Redirect engine concepts — planned GeoIP](../concepts/redirect-engine-variables.md#planned-country-routing-geoip-addon).

Supported condition operators: `==`, `!=`, `<`, `>`, `<=`, `>=`, `~=`, `includes` (`includes` is **case-sensitive** — combine with `{user-agent:to_lower_case}` when needed).  
No `&&` / `||` — use nested ternaries instead. One operator per condition; `===` / `!==` are rejected at validation.

Maximum nesting depth: **32** levels. Deeper logic is skipped at runtime (next rule is tried).

Full semantics: [Redirect engine concepts — conditional routing](../concepts/redirect-engine-conditionals.md#conditional-routing-syntax).

---

