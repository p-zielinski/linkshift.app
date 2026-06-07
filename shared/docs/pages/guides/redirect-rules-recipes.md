# Redirect rules — recipes and anti-patterns

Redirect rule recipes, How-To answers, anti-patterns, and related API endpoints.

Part of the [Redirect rules guide](./redirect-rules.md). For field reference, see [Matching and destinations](./redirect-rules-core.md).

---

## How-To cookbook

Quick answers to common routing questions. Each item links to full detail below.

**Advanced edge cases** (redirect loops, encoding, priority ties, empty ternary branches): [Redirect engine concepts — Advanced engineering FAQ](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq).

### How do I make short links?

1. Create a [link map](./link-maps.md) with entries (`key` → `https://…` URL).
2. Create a redirect rule: `source: "/go"` (or your prefix), `pathMatch: "prefix"`, `queryMatch: "ignore"`, `linkMapId`, `destination: null`.
3. Verify with [simulate](./redirect-rules-operations.md#simulate-before-rollout): path `/go/your-key`.

Request `/go/summer` → key `summer` → entry destination. See [Link maps — end-to-end](./link-maps.md#end-to-end-workflow).

### What if I set `source` to `/long/`?

With `pathMatch: prefix`, a trailing slash on the rule source is **asymmetric**:

| Rule `source` | Request | Matches? |
|---------------|---------|----------|
| `/long/` | `/long/abc` | Yes → key `abc` |
| `/long/` | `/long` only | **No** |
| `/long` | `/long` | Yes → key `""` (empty) |
| `/long` | `/long/abc` | Yes → key `abc` |

Prefer `/go` or `/long` **without** a trailing slash unless you only want `/long/…` paths. See [Path matching — `prefix`](./redirect-rules-core.md#prefix).

### How do I redirect only GET?

Set `matchMethod: ["GET"]` on the rule. Empty `[]` allows all seven methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`). Example in [HTTP method matching](./redirect-rules-core.md#http-method-matching-matchmethod).

### How do I run an A/B test?

Put a ternary with `random()` in `destination` (bounds are **inclusive**):

```json
{
  "source": "/landing",
  "destination": "random(0,100) < 50 ? https://example.com/a : https://example.com/b",
  "queryMatch": "ignore"
}
```

Values `0`–`49` take the first branch. Use [redirect tests](./redirect-tests.md#testing-dynamic-destinations) carefully in CI (non-deterministic). See [Recipe — A/B test](#ab-test-landing-page).

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

No generic `{header.*}` placeholders — `{user-agent}` and `{accept-language}` read from the request. See [Redirect engine concepts — request metadata](../concepts/redirect-engine-variables.md#request-metadata).

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

Request with `Accept-Language: pl-PL,pl;q=0.9,en;q=0.8` → `/pl`. The engine uses the **first listed** language range (before `;`), not q-value ranking. Pass `headers.accept-language` in [simulate](./redirect-rules-operations.md#simulate-before-rollout) and [redirect tests](./redirect-tests.md).

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

Simulate miss: `matched: false`, `404`, `linkMapKey: null`. See [When lookup fails](./redirect-rules-link-maps.md#when-lookup-fails).

### How do I migrate a blog with regex?

```json
{
  "source": "/^\\/blog\\/(.+)$/",
  "destination": "https://new.example.com/posts/$1",
  "statusCode": 301,
  "queryMatch": "ignore"
}
```

`$1` is substituted **before** `{placeholders}`. Requires regex `source` — plain paths do not substitute `$1`. See [Regex sources](../concepts/redirect-engine-edge-cases.md#regex-sources).

### How do I strip `www` to the apex domain?

```json
{
  "source": "/^\\/(.*)$/",
  "destination": "https://{domain.extension}/$1"
}
```

Keep default `queryMatch: exact` (not `ignore`) so regex runs on `originalUrl` and query stays in `$1`.

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
