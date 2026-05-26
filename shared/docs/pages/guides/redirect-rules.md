# Redirect rules — routing guide

Redirect rules are the core of LinkShift routing. Each rule answers one question: **when a request looks like this, where should it go?**

This guide explains how matching works, what you can put in a destination, how link maps connect to rules, and how to test changes before they go live.

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

Full pipeline and destination resolution order: [Redirect engine concepts — live redirect pipeline](../concepts/redirect-engine-concepts.md#live-redirect-pipeline-end-to-end).

**Visual overview:** [Routing decision flow (Mermaid)](../concepts/redirect-engine-concepts.md#routing-decision-flow-diagram) and [queryMatch decision tree](../concepts/redirect-engine-concepts.md#choosing-querymatch-rule-vs-link-map).

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

Simulate and redirect tests **read current database state** for rules and maps (they do not use edge redirect/link-map caches), but they still run `checkRedirectionAccess` — see [Simulate vs live redirect](#simulate-vs-live-redirect).

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

See [Redirect engine concepts — blocked rules](../concepts/redirect-engine-concepts.md#blocked-rules-isblocked).

### Runtime safety after a match

| Outcome | When |
|---------|------|
| Redirect (`301`/`302`/…) | Rule (or link map entry) resolved a target and safety checks passed |
| `403 Forbidden` | Resolved **absolute** target (`http://` / `https://`) host is on platform domain blacklist |
| `503 Service Unavailable` | Blacklist check failed (infrastructure error); **no redirect** (fail-closed) |
| `429 Too Many Requests` | Organization redirect rate limit exceeded for the current minute |
| Skip rule | Link map miss with no fallback (try next rule); malformed rule at runtime; recursion limit exceeded |
| `404 Not Found` | No rule produced a redirect |

Root-relative destinations (`/mobile`, `/path`) are **not** sent through domain blacklist (no host to verify). See [Redirect engine concepts — blacklist](../concepts/redirect-engine-concepts.md#destination-domain-blacklist-runtime).

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

Capture groups `$0` (full match), `$1`, `$2`, … work **only when `source` is stored as `/pattern/flags` regex**. Plain-path and wildcard rules do not substitute `$N`; the API rejects any `$N` in `destination` on create/update. See [Redirect engine concepts — regex capture groups](../concepts/redirect-engine-concepts.md#regex-sources).

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

Details: [Redirect engine concepts — plain path vs regex](../concepts/redirect-engine-concepts.md#plain-path-vs-regex--do-not-confuse-them).

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

**Duplicate params:** Matching compares all values per key (sorted). Placeholders `{query.x}` use the **last** value for that key in the query string (see [Redirect engine concepts — query variables](../concepts/redirect-engine-concepts.md#query-variables)).

**Percent-encoding:** Paths and query values are compared after URL parsing (decoded form). Prefer testing non-ASCII or encoded segments with [simulate](#simulate-before-rollout).

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

Link map `queryMatch` is independent — see [Link map concepts — choosing queryMatch](../concepts/link-map-concepts.md#choosing-querymatch--decision-guide) and the [rule vs map diagram](../concepts/redirect-engine-concepts.md#choosing-querymatch-rule-vs-link-map).

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

Country routing via `{geo.country}` is a **planned** feature — not available today (no placeholder, no dev stub). See [Redirect engine concepts — planned GeoIP](../concepts/redirect-engine-concepts.md#planned-country-routing-geoip-addon).

Supported condition operators: `==`, `!=`, `<`, `>`, `<=`, `>=`, `~=`, `includes` (`includes` is **case-sensitive** — combine with `{user-agent:to_lower_case}` when needed).  
No `&&` / `||` — use nested ternaries instead. One operator per condition; `===` / `!==` are rejected at validation.

Maximum nesting depth: **32** levels. Deeper logic is skipped at runtime (next rule is tried).

Full semantics: [Redirect engine concepts — conditional routing](../concepts/redirect-engine-concepts.md#conditional-routing-syntax).

---

## Link maps + redirect rules

Link maps hold thousands of `key → destination` pairs. One redirect rule with a prefix source can serve all of them.

### How it works

1. Rule matches request path (rule's `pathMatch` / `queryMatch`).
2. Engine strips source prefix → **link map key** (remainder of path).
3. Key + request query go to link map lookup (map's own `queryMatch` applies).
4. Matched entry destination becomes redirect target (HTTP status comes from the **redirect rule** `statusCode`, not from the map or entry).

Example:

```
Rule source:     /go          (pathMatch: prefix, queryMatch: ignore)
Request:         /go/summer?utm=email
Extracted key:   summer
Map entry:       key "summer" → https://shop.example/sale
Result:          redirect to https://shop.example/sale
```

Multi-segment keys work too:

```
Rule source:     /long
Request:         /long/docs/api/v2
Extracted key:   docs/api/v2
```

### API requirements for link map rules

When `linkMapId` is set:

| Field | Required value |
|-------|----------------|
| `destination` | Omit or JSON `null` (stored as `null`). Any other value (including `""`) → `400` on create and update |
| `pathMatch` | `prefix` |
| `queryMatch` | `ignore` |
| `source` | Plain path (single- or multi-segment), e.g. `/go`, `/v2/go`, `/partner/acme`; no `*`, no `/pattern/flags` regex, no `?` |

Link map must belong to same `domainGroupId` as the rule.

**Entry destinations** are static URLs only (no `{placeholders}` or ternaries in map rows). See [Link map entries](./link-map-entries.md#destinations-are-static-urls).

### Two layers of query matching

| Layer | Field | Controls |
|-------|-------|----------|
| Redirect rule | `queryMatch` | Must be `ignore` for link map rules |
| Link map | `queryMatch` | How keys with query params resolve |

Example — UTM-specific destinations via map:

```json
// Link map (queryMatch: subset)
{
  "name": "Campaign links",
  "domainGroupId": "dmg_1",
  "queryMatch": "subset",
  "fallbackDestination": "https://example.com"
}

// Entry
{ "key": "promo?utm=email", "destination": "https://example.com/email-offer" }

// Redirect rule
{
  "source": "/c",
  "pathMatch": "prefix",
  "queryMatch": "ignore",
  "linkMapId": "lmap_1",
  "destination": null
}
```

Request `/c/promo?utm=email&cid=42` → path key `promo`, request query `utm=email&cid=42` passed to map → subset entry `promo?utm=email` wins.

### When lookup fails

If link map returns no entry and no `fallbackDestination`:

- **This rule does not redirect** — engine continues to next rule.
- Useful pattern: put a specific fallback rule below the link map rule.

**Empty extracted key:** Request `/go` or `/go/` with rule `source: /go` matches the prefix but extracts key `""`. Few maps have an entry for an empty key — set `fallbackDestination` on the map or add a lower-priority catch-all rule:

```json
[
  {
    "source": "/go",
    "pathMatch": "prefix",
    "queryMatch": "ignore",
    "linkMapId": "lmap_1",
    "destination": null,
    "priority": 100
  },
  {
    "source": "/go",
    "pathMatch": "prefix",
    "queryMatch": "ignore",
    "destination": "https://example.com/link-not-found",
    "priority": 90
  }
]
```

See also: [Link maps guide](./link-maps.md#when-visitors-hit-the-prefix-only), [Link map concepts](../concepts/link-map-concepts.md).

### Link map rule validation and testing dynamic logic

When `linkMapId` is set:

| Topic | Behavior |
|-------|----------|
| Stored `destination` | Always `null` in the database |
| Request body | Omit `destination` or send JSON `null`. Any other value (including `""`) returns **`400`** on create and update |
| API destination validation | Runs on internal stub `https://linkmap.local` plus your `source` — **not** on ternaries/placeholders you might use on non–link-map rules |
| Safety scan on create/update | **Not** applied to rule `destination` (it is null). Entry and `fallbackDestination` URLs are scanned on link map writes |
| Runtime vs API | API persists `destination: null` only. The edge never evaluates a rule-level `destination` when `linkMapId` is set — only map entry / `fallbackDestination` URLs |

**How to validate conditional routing before go-live:**

1. **`POST /api/v1/redirect-rules/simulate`** with the same path/query/method you expect in production.
2. Create a temporary rule **without** `linkMapId` that uses the same `destination` string, run simulate, then delete the rule.
3. Use [redirect tests](./redirect-tests.md) for fixed expected outcomes in CI.

---

## Validation

Rules are validated on create/update. Invalid rules return `400 Bad Request` with error details.

Checks include:

1. **Source** — non-empty, max 16,384 chars; valid regex if `/pattern/flags` format.
2. **Capture groups** — `$1`, `$2`, … must exist in source regex (capturing groups only).
3. **Destination** — max 16,384 chars; valid URL structure; known placeholders and modifiers; valid conditional syntax.
4. **Recursion depth** — conditional nesting ≤ 32 levels.
5. **Link map rules** — constraints in table above; stored `destination` is `null`; no draft `destination` in the same payload.
6. **Destination safety** — URLs scanned for unsafe targets on rules **with** a non-null `destination`. Link map rules skip rule-level safety scan; link map entries and `fallbackDestination` are validated on entry/map write.
7. **Plain path vs regex** — accidental `/path/i` forms may compile as regex; see [Plain path or regex?](#plain-path-or-regex).
8. **Multiline `destination`** — newlines inside the JSON string are allowed; the validator parses the full value as one program. Example:

```json
{
  "source": "/x",
  "destination": "'{method}' == 'GET' ? https://a.example.com\n: https://b.example.com"
}
```

Keep quoted condition operands on one line when possible — accidental `\n` inside quotes changes the condition string.

Common errors:

| Error | Cause |
|-------|-------|
| `Destination must be empty when linkMapId is provided` | Omit `destination` or set JSON `null` on create/update (do not send `""`) |
| `Condition uses unsupported operator "==="` | Use `==` only (strict `===` / `!==` are rejected at validation) |
| `Link map rules require pathMatch set to prefix` | Add `"pathMatch": "prefix"` |
| `Link map rules require queryMatch set to ignore` | Add `"queryMatch": "ignore"` |
| `Link map rules do not support regex sources` | Use plain path like `/go` |
| `Unknown variable: "foo"` | Typo in placeholder name |
| `Destination uses group $2, but source only has 1 capturing group(s)` | Fix `$N` references |
| `Destination uses $0, but capture groups ($N) require a regex source in /pattern/flags form` | Plain path or wildcard `source` with `$N` in `destination` — use `/pattern/flags` `source` |
| `Destination is required when linkMapId is removed` | Set `destination` when clearing `linkMapId` on update |
| `Maximum 6 methods allowed` | Use `matchMethod: []` for all methods, or list at most 6 |

---

## Simulate before rollout

`POST /api/v1/redirect-rules/simulate` evaluates sample requests against **current live rules** without affecting production traffic.

Simulate does **not** apply organization redirect rate limits (`429`). Domain blacklist checks are **off by default**; pass `"checkDestinationBlacklist": true` on the request body to mirror live **403** / **503** behavior for absolute `http://` / `https://` targets (see [Simulate vs live redirect](#simulate-vs-live-redirect)). It **does** call `checkRedirectionAccess` — the whole request can return **`402 Payment Required`** when the organization cannot use redirects on the edge (same as live traffic).

**Batch behavior:** Each object in `entries` is evaluated **independently** (the API processes them concurrently). Order of objects in the request does not affect results. **Within one entry**, rules run in `priority` desc, then `createdAt` desc, then `id` desc — same as live traffic.

**HTTPS only:** Simulate has **no** `protocol` field. The engine always evaluates each entry as **HTTPS** (`req.protocol` is fixed internally), which matches live redirect traffic on LinkShift domains. Pass `hostname`, `path`, and `query` only — not a scheme. Absolute URLs in rule `destination` are unchanged.

```json
{
  "entries": [
    {
      "domainGroupId": "dmg_prod",
      "hostname": "links.example.com",
      "path": "/go/summer",
      "method": "GET",
      "query": { "utm": "email" },
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
    },
    {
      "domainGroupId": "dmg_prod",
      "path": "/blog/old-post",
      "ip": "8.8.8.8"
    }
  ]
}
```

Response (per entry):

```json
{
  "results": [
    {
      "index": 0,
      "domainGroupId": "dmg_prod",
      "method": "GET",
      "path": "/go/summer",
      "hostname": "links.example.com",
      "matched": true,
      "statusCode": 302,
      "target": "https://shop.example/sale",
      "linkMapKey": "summer"
    },
    {
      "index": 1,
      "matched": false,
      "statusCode": 404,
      "target": null,
      "linkMapKey": null
    }
  ]
}
```

Use `hostname`, `ip`, `userAgent`, and `headers` to test domain placeholders and conditional routing. Up to **100 entries** per request. `userAgent` is limited to **512** characters per entry.

**Response fields:** Each result includes `matched`, `statusCode`, `target`, and `linkMapKey` (when a link map rule produces a redirect). Simulate does **not** return which rule ID matched — infer from `target` / `linkMapKey` or use rule analytics.

**CI parity — destination blacklist:** Add `"checkDestinationBlacklist": true` at the **request** level (not per entry) to run the same absolute-URL blacklist gate as live traffic. When a rule matches but the resolved target host is blocked, the result keeps **`matched: true`** (routing succeeded) and sets **`statusCode: 403`** plus **`blacklistBlocked: true`** — the same outcome a visitor would get instead of a redirect. Blacklist infrastructure errors set **`statusCode: 503`** and **`blacklistCheckFailed: true`**. Root-relative targets (`/path`) skip the check (no host). Omit the flag or set it to `false` for legacy behavior (no blacklist call).

For link map rules, `linkMapKey` is set whenever the rule **wins** (produces a redirect) — including when the target comes from **`fallbackDestination`**, not only from a matching entry.

**`linkMapKey` format:** The value is the **raw path suffix** after the rule prefix (before map normalization). Example: request `/go/Summer` → `linkMapKey: "Summer"` even when the map uses `caseSensitive: false` and resolves entry `summer`.

**Fallback example:** Rule `source: /go`, map has `fallbackDestination` but no entry `unknown-code`. Request `/go/unknown-code` → `matched: true`, `target` = fallback URL, `linkMapKey: "unknown-code"`.

Use analytics `topLinkMapKeys` to see what visitors actually send. Analytics **omits** empty extracted keys (`""`) from `topLinkMapKeys`; simulate still returns `linkMapKey: ""` when the prefix matched with no suffix (for example bare `/go`).

### Query merging (`path` + `query`)

If an entry includes both `path` (optionally with `?…` in the string) and a `query` object, parameters are **merged** (appended). The `query` object does not replace params already in `path`.

```json
{
  "path": "/go/summer?utm=email",
  "query": { "cid": "42" }
}
```

→ effective request query: `utm=email` and `cid=42`. Duplicate keys can produce multiple values for the same param (same as a URL with repeated keys).

### Link map miss in simulate

When a link map rule matches the path but lookup returns no entry and no `fallbackDestination`:

```json
{
  "matched": false,
  "statusCode": 404,
  "target": null,
  "linkMapKey": null
}
```

Same as live traffic: the rule does not win — the engine would try the next rule (simulate evaluates the full rule list the same way).

### Hostname and defaults

| Field | Behavior |
|-------|----------|
| `hostname` omitted | Uses the **first domain** in the group (oldest `createdAt`). If the group has no domains, uses synthetic `group-{domainGroupId}.local`. |
| `hostname` set | Must match a domain in that `domainGroupId` (case-insensitive). Otherwise the **entire** `POST` returns **`400 Bad Request`** (no per-entry results) — split batches in CI if hostnames differ |
| `ip` omitted | Defaults to `127.0.0.1` (available as `{ip}` in destinations). |
| `method` omitted | `GET` |
| Request scheme | Always **HTTPS** (not configurable) |
| `headers` | Passed through mock request. **`user-agent`** maps to `{user-agent}`; **`accept-language`** maps to `{accept-language}` / `{accept-language.primary}`. Other headers do not affect matching — no generic `{header.*}` placeholders. |

### Simulate vs live redirect

| Behavior | Live redirect | `simulate` |
|----------|---------------|------------|
| Rule matching, placeholders, conditionals, link maps | Yes | Yes |
| Excludes `isBlocked` and soft-deleted rules | Yes | Yes |
| `linkMapKey` in response | N/A (analytics only) | Yes |
| Domain blacklist → `403` | Yes (absolute URLs only) | **Only when** `checkDestinationBlacklist: true` — then `matched: true`, `statusCode: 403`, `blacklistBlocked: true` |
| Blacklist check infrastructure error → `503` | Yes — **no redirect** (fail-closed) | **Only when** `checkDestinationBlacklist: true` — then `matched: true`, `statusCode: 503`, `blacklistCheckFailed: true` |
| Organization redirect rate limits → `429` | Yes | No |
| Organization access / plan (`checkRedirectionAccess`) → `402` | Yes (suspended org, plan overage) | **Yes** — entire simulate call fails before any entry is evaluated |
| Invalid `hostname` or unknown `domainGroupId` in batch → `400` | N/A | **Yes** — whole `POST` fails (no `results` array); one bad entry fails the batch |
| Link map path match + lookup miss | Skip rule (next rule) | `matched: false`, `404`, `linkMapKey: null` |
| Link map hit via `fallbackDestination` | Redirect to fallback URL | `linkMapKey` = extracted path suffix (same as entry hit) |
| Returns matched rule ID | N/A | **No** — only `target` / `linkMapKey` |

Pass explicit `ip` when testing rules that branch on `{ip}`.

---

## Analytics

`GET /api/v1/redirect-rules/analytics` returns hit counts per rule.

Query parameters:

- `limit` (1–50, default 50)
- `range` — `day`, `week`, or `month`
- `start` / `end` — custom ISO-8601 UTC window (**both required together**; providing only one returns `400`)
- `domainGroupId` — optional. When set, limits hits to rules in that domain group. When **omitted**, returns top rules by traffic across **all domain groups** in your organization (still scoped to your API key’s org)

**Custom window limits:** `start` and `end` are both floored to the **start of their UTC hour**. The span between those hour boundaries cannot exceed **31 days** (`400` — `Range cannot exceed 31 days`). If `start` is after `end`, the API returns `400` (`Start must be before end`).

**Inclusive hour range:** Aggregation includes every hourly bucket where `bucketStart >= start` **and** `bucketStart <= end` (both boundaries **inclusive** at hour granularity). There is no “+1 hour” extension beyond `end`.

| You want buckets for… | Pass `start` | Pass `end` | Included UTC hours (example) |
|------------------------|--------------|------------|------------------------------|
| One hour only | `2026-05-01T14:30:00Z` | `2026-05-01T14:59:59Z` | `2026-05-01T14:00` only |
| Four consecutive hours | `2026-05-01T10:00:00Z` | `2026-05-01T13:00:00Z` | `10:00`, `11:00`, `12:00`, `13:00` |
| Through end of May 1, **not** May 2 00:00 | `2026-05-01T00:00:00Z` | `2026-05-01T23:00:00Z` | All May 1 hours; **not** `2026-05-02T00:00` |

Minutes and seconds on `start` / `end` are ignored after normalization — only the UTC hour matters.

**Time buckets:** Hit data is stored in **UTC hourly** buckets. Preset `range` values use rolling windows from the current UTC hour: `day` = **24** hours, `week` = **168** hours (7×24), `month` = **720** hours (30×24) — not calendar weeks or months.

Response includes per rule:

- `hits` — total matches
- `topLinkMapKeys` — up to **10** most frequent **non-empty** keys per rule (link map rules). Keys are counted whether the hit used an **entry** or **`fallbackDestination`**. Empty extracted keys (`/go` with no suffix) are **excluded** from this list but still appear in `topRequestVariants` when they redirect
- `topRequestVariants` — up to **10** variants per rule (method, path, query, destination, `linkMapKey`)

The `limit` query parameter (1–50) controls how many **rules** appear in the response, not the length of `topLinkMapKeys` / `topRequestVariants`.

Blocked rules (`isBlocked: true`) are excluded from analytics aggregation.

Use analytics to find unexpected traffic patterns or unused short-link keys.

**Example response shape** (one rule in the array; fields may be `null` when not applicable):

```json
{
  "data": [
    {
      "ruleId": "rrule_abc",
      "hits": 12840,
      "topLinkMapKeys": [
        { "key": "summer", "hits": 5200 },
        { "key": "winter", "hits": 1100 }
      ],
      "topRequestVariants": [
        {
          "requestMethod": "GET",
          "requestPath": "/go/summer",
          "requestQuery": "utm=email",
          "requestUrl": "/go/summer?utm=email",
          "destination": "https://shop.example.com/summer-sale",
          "linkMapKey": "summer",
          "hits": 4800
        },
        {
          "requestMethod": "GET",
          "requestPath": "/landing",
          "requestQuery": "",
          "requestUrl": "/landing",
          "destination": "https://example.com/landing-a",
          "linkMapKey": null,
          "hits": 900
        }
      ]
    }
  ]
}
```

`topRequestVariants` groups by method, path, query, resolved destination URL, and `linkMapKey` (when the winning rule used a link map). Up to **10** variants per rule, independent of the analytics `limit` query param (which caps how many **rules** are returned).

---

## How-To cookbook

Quick answers to common routing questions. Each item links to full detail below.

**Advanced edge cases** (redirect loops, encoding, priority ties, empty ternary branches): [Redirect engine concepts — Advanced engineering FAQ](../concepts/redirect-engine-concepts.md#advanced-engineering-faq).

### How do I make short links?

1. Create a [link map](./link-maps.md) with entries (`key` → `https://…` URL).
2. Create a redirect rule: `source: "/go"` (or your prefix), `pathMatch: "prefix"`, `queryMatch: "ignore"`, `linkMapId`, `destination: null`.
3. Verify with [simulate](#simulate-before-rollout): path `/go/your-key`.

Request `/go/summer` → key `summer` → entry destination. See [Link maps — end-to-end](./link-maps.md#end-to-end-workflow).

### What if I set `source` to `/long/`?

With `pathMatch: prefix`, a trailing slash on the rule source is **asymmetric**:

| Rule `source` | Request | Matches? |
|---------------|---------|----------|
| `/long/` | `/long/abc` | Yes → key `abc` |
| `/long/` | `/long` only | **No** |
| `/long` | `/long` | Yes → key `""` (empty) |
| `/long` | `/long/abc` | Yes → key `abc` |

Prefer `/go` or `/long` **without** a trailing slash unless you only want `/long/…` paths. See [Path matching — trailing slash](#prefix).

### How do I redirect only GET?

Set `matchMethod: ["GET"]` on the rule. Empty `[]` allows all seven methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`). Example in [HTTP method matching](#http-method-matching-matchmethod).

### How do I run an A/B test?

Put a ternary with `random()` in `destination` (bounds are **inclusive**):

```json
{
  "source": "/landing",
  "destination": "random(0,100) < 50 ? https://example.com/a : https://example.com/b",
  "queryMatch": "ignore"
}
```

Values `0`–`49` take the first branch. Use [redirect tests](./redirect-tests.md#testing-dynamic-destinations) carefully in CI (non-deterministic). See [Recipe — A/B test](#a-b-test-landing-page).

### How do I route by User-Agent?

Use `~=` or `includes` in a ternary (`includes` is case-sensitive):

```json
{
  "source": "*",
  "destination": "'{user-agent:to_lower_case}' includes 'iphone' ? /mobile : /desktop",
  "queryMatch": "ignore",
  "priority": 20
}
```

No generic `{header.*}` placeholders — `{user-agent}` and `{accept-language}` read from the request. See [Redirect engine concepts — request metadata](../concepts/redirect-engine-concepts.md#request-metadata).

### How do I route by browser language?

Use `{accept-language.primary}` with modifiers in a ternary (`includes` is case-sensitive unless you lower-case):

```json
{
  "source": "*",
  "destination": "'{accept-language.primary:to_lower_case}' includes 'pl' ? /pl : /en",
  "queryMatch": "ignore",
  "priority": 20
}
```

Request with `Accept-Language: pl-PL,pl;q=0.9,en;q=0.8` → `/pl`. The engine uses the **first listed** language range (before `;`), not q-value ranking. Pass `headers.accept-language` in [simulate](#simulate-before-rollout) and [redirect tests](./redirect-tests.md).

### How do I route by date or time?

Use `time()` and `datetime()` in the **condition** (no curly braces):

```json
{
  "source": "/sale",
  "destination": "time() >= datetime('2025-12-01') ? https://example.com/live : https://example.com/soon"
}
```

Timezone example: `datetime('2025-06-01 09:00', 'Europe/Warsaw')`. Invalid dates at save time → `400`; at runtime → false branch.

### What if the link map does not find a key?

The link map rule **does not redirect**. The engine tries the **next** rule by `priority`. Fix options:

- Add an entry for the key
- Set map `fallbackDestination`
- Add a lower-priority rule on the same prefix (e.g. “not found” URL)

Simulate miss: `matched: false`, `404`, `linkMapKey: null`. See [When lookup fails](#when-lookup-fails).

### How do I migrate a blog with regex?

```json
{
  "source": "/^\\/blog\\/(.+)$/",
  "destination": "https://new.example.com/posts/$1",
  "statusCode": 301,
  "queryMatch": "ignore"
}
```

`$1` is substituted **before** `{placeholders}`. Requires regex `source` — plain paths do not substitute `$1`. See [Regex sources](../concepts/redirect-engine-concepts.md#regex-sources).

### How do I strip `www` to the apex domain?

```json
{
  "source": "/^\\/(.*)$/",
  "destination": "https://{domain.extension}/$1"
}
```

Keep default `queryMatch: exact` (not `ignore`) so regex runs on `originalUrl` and query stays in `$1`. Verified in `redirect.service.spec.ts` (www host → apex with query).

---

## Recipe book — common scenarios

### Migrate blog posts with regex

```json
{
  "source": "/^\\/blog\\/(.+)$/",
  "destination": "https://new-blog.example.com/posts/$1",
  "statusCode": 301,
  "queryMatch": "ignore"
}
```

### Strip www to apex

```json
{
  "source": "/^\\/(.*)$/",
  "destination": "https://{domain.extension}/$1"
}
```

Do not set `queryMatch: ignore` here — regex would run on path only and drop query strings. Default `exact` matches `originalUrl` (path + query in `$1`).

### Same-host path redirect (no full URL)

Keep visitors on the same hostname; only change the path:

```json
{
  "source": "/legacy-dashboard",
  "destination": "/dashboard",
  "statusCode": 301,
  "queryMatch": "ignore"
}
```

Request `https://links.example.com/legacy-dashboard` → `301` to `https://links.example.com/dashboard`. Root-relative targets skip domain blacklist (no absolute host to check).

### Campaign short links at scale

1. Create link map — see [Link maps guide](./link-maps.md)
2. Import entries — see [Link map entries guide](./link-map-entries.md)
3. Create rule:

```json
{
  "domainGroupId": "dmg_1",
  "source": "/s",
  "pathMatch": "prefix",
  "queryMatch": "ignore",
  "linkMapId": "lmap_campaign",
  "destination": null,
  "priority": 100
}
```

### A/B test landing page

```json
{
  "source": "/landing",
  "destination": "random(0,100) < 50 ? https://example.com/landing-a : https://example.com/landing-b",
  "queryMatch": "ignore"
}
```

### Route by User-Agent (Chrome detection)

```json
{
  "source": "*",
  "destination": "'{user-agent:to_lower_case}' includes 'chrome' ? /chrome-flow : /default-flow",
  "queryMatch": "ignore",
  "priority": 20
}
```

### Scheduled launch

```json
{
  "source": "/product",
  "destination": "time() >= datetime('2025-06-01 09:00', 'Europe/Warsaw') ? https://example.com/product-live : https://example.com/coming-soon"
}
```

### Preserve query params in redirect

```json
{
  "source": "/old",
  "pathMatch": "prefix",
  "queryMatch": "ignore",
  "destination": "https://new.example.com/{path}?utm={query.utm}&ref=migrated"
}
```

Note: `{path}` has **no** leading slash. For full query passthrough, list `{query.param}` placeholders or use regex `$1` on the path.

---

## Anti-patterns (common footguns)

| Mistake | Why it fails | Better approach |
|---------|--------------|-----------------|
| `source: "/campaign/i"` as a literal path | Parsed as **regex** (`campaign`, flag `i`) | Use `/campaign/i` only inside `/^…$/`, or rename the segment |
| `destination: "example.com/page"` (no scheme) | Validator requires `http://`, `https://`, or `/` prefix | `https://example.com/page` or root-relative `/page` |
| `destination: "javascript:alert(1)"` or other non-http(s) schemes | Leaf must start with `http://`, `https://`, or `/` | Use `https://…` or root-relative `/path` only |
| `source: "*"` with `linkMapId` | API rejects: link map rules cannot use `*` source | Plain prefix `source` (e.g. `/go`) + `linkMapId` |
| `source: "*"` with `queryMatch: "exact"` expecting query gating | Wildcard **ignores** `pathMatch` and `queryMatch` | Plain `source` with `?…` in path, or conditionals with `{query.*}` |
| Empty ternary branch (`… ? : https://…`) | Rule can **win** with `res.redirect(statusCode, "")` | Explicit URL on every branch, or lower-priority fallback rule |
| A/B with `random()` as a **hard CI gate** | Non-deterministic per request | Test deterministic branches (UA, path, IP) or use [redirect tests — non-deterministic patterns](./redirect-tests.md#testing-dynamic-destinations) |
| Two link map rules on the same `/go` prefix | Higher `priority` consumes all matches | One prefix rule per map, or different prefixes / `matchMethod` split |
| Expecting `{geo.country}` or cookie routing | Not implemented | `{accept-language}`, `{ip}`, `{user-agent}`, path/query conditionals |
| `$0` or `$1` in `destination` without regex `source` | API rejects any `$N` on plain path or wildcard `source` | Regex `source` with capturing groups |
| `PUT` to clear `isBlocked` without fixing URLs | Unblocks immediately; ongoing safety monitoring may block again | Fix or remove unsafe URLs in `destination`, then `PUT` |
| Regex `source` with flag `g` | `match()` + global regex can surprise capture behavior | Drop `g` from stored redirect regex sources |

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/redirect-rules` | List rules (cursor pagination, filter by `domainGroupId`) |
| `GET` | `/api/v1/redirect-rules/:id` | Get one rule |
| `POST` | `/api/v1/redirect-rules` | Create rule |
| `PUT` | `/api/v1/redirect-rules/:id` | Update rule |
| `DELETE` | `/api/v1/redirect-rules/:id` | Soft-delete rule |
| `GET` | `/api/v1/redirect-rules/analytics` | Traffic analytics |
| `POST` | `/api/v1/redirect-rules/simulate` | Batch simulation |

List query params:

| Param | Description |
|-------|-------------|
| `domainGroupId` | **Required** — scope to one domain group |
| `limit` | 1–100 (default 20) |
| `search` | Optional case-insensitive substring on rule **`source`** and **`destination`** only (not `linkMapId` or `priority`). Soft-deleted rules are never listed. Blocked rules (`isBlocked: true`) **can** appear in list results |
| `startAfterId` | Cursor for pagination (uses `priority` desc, `createdAt` desc, `id` desc ordering) |

---

## Related guides

- [Redirect engine concepts](../concepts/redirect-engine-concepts.md) — placeholders, modifiers, conditionals, limits
- [Link maps](./link-maps.md) — keyed destination tables
- [Link map entries](./link-map-entries.md) — bulk import and entry management
- [Redirect tests](./redirect-tests.md) — CI regression fixtures
- [Domains and domain groups](./domains-and-groups.md) — where rules attach
