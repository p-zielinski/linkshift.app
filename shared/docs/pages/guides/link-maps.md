# Link maps — routing guide

Link maps are keyed lookup tables: **short key → destination URL**. One redirect rule with a prefix source can resolve thousands of keys without thousands of rules.

For how rules extract keys from paths, see [Redirect rules — link maps section](./redirect-rules.md#link-maps--redirect-rules).  
For normalization and resolution internals, see [Link map concepts](../concepts/link-map-concepts.md).

Base path: `/api/v1/link-maps`

---

## When to use link maps

| Scenario | Without link map | With link map |
|----------|------------------|---------------|
| 500 campaign short URLs | 500 redirect rules | 1 rule + 500 entries |
| Partner-specific links | New rule per partner | New entry per partner |
| Frequent URL updates | Edit rules constantly | Edit entries (or bulk import) |

Link maps are ideal when **path prefix is fixed** but **suffix keys change often**.

**Important:** Entry `destination` values are **static** URLs. The redirect engine does not expand `{placeholders}` or evaluate ternaries inside link map rows — only redirect rule `destination` fields support that. See [Link map entries — static destinations](./link-map-entries.md#destinations-are-static-urls).

---

## End-to-end workflow

### Step 1 — Create link map

```json
POST /api/v1/link-maps
{
  "name": "Summer campaign",
  "domainGroupId": "dmg_prod",
  "queryMatch": "ignore",
  "caseSensitive": false,
  "fallbackDestination": "https://example.com/link-expired"
}
```

| Field | Purpose |
|-------|---------|
| `queryMatch` | How entries match request query (see below) |
| `caseSensitive` | Key normalization — choose carefully at create (see below) |
| `fallbackDestination` | Used when no entry matches (optional but recommended) |

**`caseSensitive` at create:** Default `false` (recommended for short links). You **cannot** change `caseSensitive` from `true` → `false` later (blocked to avoid silent key collisions). Changing `false` → `true` is allowed but re-normalizes all entry keys — review entries after update.

### Step 2 — Add entries

```json
POST /api/v1/link-map-entries
{
  "linkMapId": "lmap_abc123",
  "key": "summer",
  "destination": "https://shop.example.com/summer-sale"
}
```

Or bulk import — up to **500** entries per `POST /api/v1/link-map-entries/import` (see [Link map entries guide](./link-map-entries.md#import)).

### Step 3 — Create redirect rule

```json
POST /api/v1/redirect-rules
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

The rule’s `statusCode` (`301`, `302`, `307`, `308`) applies to redirects from map entries and `fallbackDestination`. Entry URLs do not carry their own status code.

**`matchMethod` on the redirect rule:** Link map rules still respect `matchMethod`. Use `matchMethod: ["GET"]` when short links should redirect only on GET and other methods (POST, OPTIONS, …) should fall through to the next rule or `404`:

```json
{
  "source": "/go",
  "pathMatch": "prefix",
  "queryMatch": "ignore",
  "linkMapId": "lmap_abc123",
  "destination": null,
  "matchMethod": ["GET"],
  "priority": 100
}
```

Request `POST /go/summer` → rule does not match → engine tries the next rule.

**`matchMethod` runs before link map lookup:** The engine checks path, query (on the rule), and HTTP method first. If `matchMethod` rejects the request, **no key is extracted** and the map is not consulted — the next rule in priority order is tried.

### Step 4 — Test

```
GET https://links.example.com/go/summer?utm=email
→ https://shop.example.com/summer-sale
```

Use [simulate](./redirect-rules.md#simulate-before-rollout) to verify before traffic hits.

---

## How keys are extracted

The redirect rule's `source` is a **path prefix**. Everything after it becomes the link map lookup key.

```
Rule source:    /go
Request:        /go/summer
Key:            summer

Rule source:    /go
Request:        /go/partner/acme/deal
Key:            partner/acme/deal

Rule source:    /s
Request:        /s/docs/api/v2
Key:            docs/api/v2
```

**Trailing slash on rule `source` (`pathMatch: prefix`):**

| Rule source | Request | Rule matches? | Extracted key |
|-------------|---------|---------------|---------------|
| `/go` | `/go/summer` | Yes | `summer` |
| `/go/` | `/go/summer` | Yes | `summer` |
| `/go` | `/go` | Yes | `""` (empty) — use fallback or a catch-all rule below |
| `/go` | `/go/` | Yes | `""` |
| `/go/` | `/go` only | **No** | — |
| `/long/` | `/long` only | **No** | — (same asymmetric rule as `/go/`) |
| `/long/` | `/long/abc` | Yes | `abc` |

Prefer `/go` without a trailing slash unless you require `/go/…` paths only. Covered by `redirect.service.spec.ts` (`/long/` vs bare `/long`).


**Rule-side constraints** (enforced by API):

- `pathMatch` must be `prefix`
- `queryMatch` must be `ignore` on the rule
- `destination` must be `null`
- Source cannot be `*`, regex, or contain `?`
- Source must be a plain path (e.g. `/go`, `/v2/go`) — not `/pattern/flags` regex

**Regex footgun on link map `source`:** Values like `/c/i` or `/campaign/i` are parsed as **regex** (`pattern` + flag `i`), not literal paths. The API returns `Link map rules do not support regex sources`. Use segments such as `/c/i` only if you rename them (for example `/c/iphone`) or use a safe prefix like `/go`.

Query handling for keys happens at the **link map** level via map's `queryMatch`, using the **incoming request query** (not query embedded in the rule `source`).

### Two rules on the same prefix

Avoid two active rules with the same `source` prefix and different `linkMapId` values unless you intend overlapping behavior. The engine evaluates rules by **`priority` desc**, then **`createdAt` desc**, then **`id` desc** — the **first rule that produces a redirect target** wins. A higher-priority link map rule consumes all matching traffic; a lower-priority rule on `/go` never runs its lookup for those requests.

Use distinct prefixes (`/go`, `/p`) or different priorities with non-overlapping `matchMethod` / paths instead of duplicating the same prefix.

---

## Query matching on link maps

This is separate from redirect rule `queryMatch`. The map controls how **entries** match.

### `ignore` (default)

Only the path portion of the key matters. Request query is ignored for lookup.

```
Entry key:   summer
Request:     /go/summer?utm=email&cid=1
Lookup key:  summer
Match:       entry "summer"
```

Best for: simple short links, opaque codes.

### `exact`

Path + full query must match entry key exactly.

```
Entry key:   promo?lang=pl
Request:     /c/promo?lang=pl     → match
Request:     /c/promo?lang=pl&x=1 → no match (extra param)
Request:     /c/promo             → no match (missing query)
```

Best for: query params are part of link identity.

### `subset`

Entry query must be contained in request query. More specific entries win.

```
Entry 1 key: promo?utm=email
Entry 2 key: promo
Request:     /c/promo?utm=email&cid=42 → Entry 1 (more specific)
Request:     /c/promo?cid=42           → Entry 2
```

Best for: base short link + UTM-specific variants.

---

## Case sensitivity

| `caseSensitive` | Behavior |
|-----------------|----------|
| `false` (default) | Keys and query normalized to lowercase on write and lookup |
| `true` | Exact case preserved |

`Summer` and `summer` collapse to one entry when `caseSensitive: false`.

**Guardrail:** changing `caseSensitive` from `true` to `false` is blocked after creation to prevent silent key collisions.

### Updating map settings

A `PUT` that changes `queryMatch` or `caseSensitive` re-normalizes **all entry keys** in the map (destinations stay the same). Check `GET /api/v1/organization/usage` before large imports; plan limits apply to entry counts.

---

## When visitors hit the prefix only

Rule `source: /go` with `pathMatch: prefix` matches both `/go/summer` and bare `/go` (or `/go/`). The extracted link map key for `/go` alone is an **empty string** — most maps have no entry for `""`.

| Request | Extracted key | Typical outcome |
|---------|---------------|-----------------|
| `/go/summer` | `summer` | Entry lookup |
| `/go` | `""` | Miss unless you add a special entry or fallback |
| `/go/` | `""` | Same as `/go` when rule source is `/go` |

**Recommended:**

1. Set `fallbackDestination` on the map (e.g. marketing home or “pick a link” page), **or**
2. Add a lower-priority redirect rule on the same prefix with a static `destination`, **or**
3. Redirect `/go` at the CDN/DNS layer to a canonical path with a code.

Avoid rule `source: /go/` unless you intentionally want to **reject** bare `/go` (asymmetric trailing-slash matching). Prefer `source: /go` without a trailing slash.

---

## Fallback destination

When no entry resolves:

1. **`subset`:** Path has entries, but **no entry’s query is a subset** of the request query → `fallbackDestination` (if set), else skip rule.
2. **`subset` / `exact`:** Path has **no entries at all** → same: fallback, else skip rule.
3. **`ignore`:** Unknown path key → fallback, else skip rule.

If `fallbackDestination` is not set → link map rule produces **no redirect**; the next redirect rule in priority order is evaluated.

**`subset` examples** (rule `source: /c`, map `queryMatch: subset`, `fallbackDestination: https://example.com/default`):

| Entries | Request | Result |
|---------|---------|--------|
| `deal?utm=email`, `deal` | `/c/deal?utm=social` | `https://example.com/default` (query mismatch — not “try next rule” unless fallback is null) |
| `deal?utm=email` only | `/c/deal?utm=email&ref=1` | Entry `deal?utm=email` |
| (no entries for path `orphan`) | `/c/orphan?x=1` | `https://example.com/default` |

**Simulate and analytics:** A fallback redirect still sets **`linkMapKey`** to the extracted path suffix (for example `unknown-code`). Use that to see which keys miss entries. Analytics `topLinkMapKeys` counts non-empty keys on fallback hits but excludes empty keys (`/go` with no suffix).

Recommended patterns:

```json
// On the map — branded "link expired" page
"fallbackDestination": "https://example.com/expired"

// OR a catch-all rule below the link map rule
{
  "source": "/go",
  "pathMatch": "prefix",
  "destination": "https://example.com/not-found",
  "priority": 90
}
```

---

## Examples by use case

### Simple short links (`queryMatch: ignore`)

```json
// Map
{ "name": "Short links", "domainGroupId": "dmg_1", "queryMatch": "ignore" }

// Entries
{ "key": "abc", "destination": "https://target.example/a" }
{ "key": "xyz", "destination": "https://target.example/b" }

// Rule
{ "source": "/s", "pathMatch": "prefix", "queryMatch": "ignore", "linkMapId": "...", "destination": null }
```

`/s/abc` → first destination, `/s/xyz` → second.

### UTM-specific destinations (`queryMatch: subset`)

```json
// Map
{ "queryMatch": "subset", "fallbackDestination": "https://example.com/default" }

// Entries
{ "key": "launch?utm_source=email", "destination": "https://example.com/email-offer" }
{ "key": "launch?utm_source=social", "destination": "https://example.com/social-offer" }
{ "key": "launch", "destination": "https://example.com/launch" }

// Rule source /c with prefix
```

| Request | Resolved destination |
|---------|---------------------|
| `/c/launch?utm_source=email` | email offer |
| `/c/launch?utm_source=social&ref=fb` | social offer |
| `/c/launch` | default launch page |

### Exact query keys (`queryMatch: exact`)

```json
{ "key": "promo?x=1", "destination": "https://example.com/promo-x1" }
```

Only `/…/promo?x=1` with no extra params matches.

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/link-maps?domainGroupId=...` | List **all** maps in the group (no `limit` / cursor — typically a small set per group) |
| `GET` | `/api/v1/link-maps/:id` | Get one map |
| `POST` | `/api/v1/link-maps` | Create map |
| `PUT` | `/api/v1/link-maps/:id` | Update map |
| `DELETE` | `/api/v1/link-maps/:id` | Delete map |

---

## Constraints and limits

- Maps are organization-scoped via domain group ownership.
- Plan limits apply to map count and total entries.
- **Cannot delete** a map still referenced by active redirect rules — remove or update rules first.
- Destinations (entries + fallback) must pass URL safety checks (`http://` or `https://` only).
- Unsafe destinations return `400 Bad Request`.

---

## Cache behavior

Link map data is cached per map ID on the edge. Successful loads are cached for **up to 5 minutes**; mutations invalidate cache immediately on success under normal operation.

**Negative cache (60 seconds):** If a redirect rule still references a **deleted** or unknown `linkMapId`, lookups return miss without hitting the database on every request. That negative entry can last up to **60 seconds** even if you recreate a map with the same ID. Fix: wait for TTL, update the rule to refresh context, or touch the rule via API.

Details: [Link map concepts — cache model](../concepts/link-map-concepts.md#cache-model).

---

## Related guides

- [Redirect rules](./redirect-rules.md)
- [Link map entries](./link-map-entries.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
