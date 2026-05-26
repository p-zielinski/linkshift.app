# Link map entries — guide

Link map entries are individual **key → destination** rows inside a link map. This guide covers CRUD, bulk import, key format rules, and operational patterns.

For map-level settings (`queryMatch`, `fallbackDestination`), see [Link maps guide](./link-maps.md).

Base path: `/api/v1/link-map-entries`

---

## Entry structure

| Field | Description |
|-------|-------------|
| `id` | Entry ID (assigned on create) |
| `linkMapId` | Parent map |
| `key` | Lookup key (path, optionally with `?query`) |
| `keyNormalized` | Canonical form stored for uniqueness (read-only in API responses) |
| `destination` | Target URL (`http://` or `https://` only); max **16,384** characters (same as redirect rule `destination`) |

---

## Destinations are static URLs

Link map entry `destination` and map `fallbackDestination` are returned **as stored**. The engine does **not** apply:

- `{placeholders}` (`{path}`, `{query.utm}`, …)
- Ternary / `random()` / `time()` conditionals
- Regex `$1` substitution from the redirect rule

Use a **redirect rule** `destination` for dynamic routing, or create **one entry per variant** (e.g. separate keys for UTM-specific static targets). Rule-level regex capture applies only to rule `destination`, not map rows.

---

## Key format rules

Keys are **paths or path+query**, not full URLs.

| Rule | Detail |
|------|--------|
| Max length | 1,024 characters |
| Allowed chars | Letters, numbers, `-._~!$&'()*+,;=:@/?` |
| Forbidden | Spaces, `%`, `#`, full URLs (`http://…`) |
| Leading slash | Optional — normalized on save |
| Empty key | Rejected |

### Valid key examples

```
summer
promo
partner/acme
docs/api/v2
promo?utm=email
launch?utm_source=email&utm_medium=newsletter
/summer
```

### Invalid key examples

```
https://example.com/page     ← full URL
summer sale                  ← space
promo#section                ← hash
promo%20sale                 ← percent-encoding (% forbidden)
```

### Percent-encoding and non-ASCII slugs

Keys must use **literal** path and query characters from the allowed set. **`%` is not allowed** — you cannot store URL-encoded keys such as `promo%20sale`.

| Goal | Approach |
|------|----------|
| Human-readable slug with spaces | Use a different slug (`promo-summer`) or encode meaning in the path (`promo/summer`) |
| Unicode in the public URL | Visitors may send percent-encoded paths; the redirect rule extracts the **decoded** path segment — store the entry key in the same decoded form you expect after normalization |
| UTM in the key | Use literal `?` and `=` (for example `promo?utm=email`) on maps with `queryMatch: exact` or `subset`, not `%3F` / `%3D` |

### Normalization (when `caseSensitive: false` on map)

- Path and query lowercased
- Query params sorted by key, then value
- `Promo?utm=Email` and `promo?utm=email` → same canonical key

Duplicate keys after normalization return `400` conflict.

---

## Single entry CRUD

### Create

```json
POST /api/v1/link-map-entries
{
  "linkMapId": "lmap_abc123",
  "key": "summer",
  "destination": "https://shop.example.com/summer-sale"
}
```

### Update

```json
PUT /api/v1/link-map-entries/:id
{
  "destination": "https://shop.example.com/summer-extended"
}
```

Or change key:

```json
PUT /api/v1/link-map-entries/:id
{
  "key": "summer-2025",
  "destination": "https://shop.example.com/summer-2025"
}
```

### Delete one

```
DELETE /api/v1/link-map-entries/:id
```

---

## List entries

```
GET /api/v1/link-map-entries?linkMapId=lmap_abc123&limit=50&search=summer
```

| Param | Description |
|-------|-------------|
| `linkMapId` | Required |
| `limit` | 1–100 (default 20) |
| `search` | Filter keys (optional) |
| `startAfterId` | Cursor for pagination |

---

## Bulk import

`POST /api/v1/link-map-entries/import` — upsert up to **500 entries** per request.

> **Note:** The public import endpoint is capped at **500** entries per call (`ImportLinkMapEntriesSchema`). Older internal bulk-upsert shapes in the codebase may allow up to **1000** rows — use **`POST /api/v1/link-map-entries/import`** for API-key workflows, not legacy upsert endpoints.

```json
{
  "linkMapId": "lmap_abc123",
  "entries": [
    {
      "key": "summer",
      "destination": "https://shop.example.com/summer"
    },
    {
      "key": "winter",
      "destination": "https://shop.example.com/winter"
    },
    {
      "key": "launch?utm_source=email",
      "destination": "https://shop.example.com/email-launch"
    }
  ]
}
```

Response:

```json
{
  "created": 2,
  "updated": 1,
  "failed": 0,
  "failures": []
}
```

Partial failure example:

```json
{
  "created": 1,
  "updated": 0,
  "failed": 1,
  "failures": [
    {
      "index": 1,
      "key": "bad key with spaces",
      "error": "Key may not contain spaces, %, or # characters"
    }
  ]
}
```

Import upserts by normalized key — existing keys get destination updated.

---

## Bulk delete (rollback)

After import, revert by entry IDs:

```json
DELETE /api/v1/link-map-entries
{
  "linkMapId": "lmap_abc123",
  "entryIds": ["lentry_1", "lentry_2", "lentry_3"]
}
```

Up to **1,000** `entryIds` per request.

Keep import response or list entries before delete to capture IDs for rollback.

---

## Key design patterns

### Path-only keys (map `queryMatch: ignore`)

```
summer          → https://…/summer
winter          → https://…/winter
partner/acme    → https://…/acme-landing
```

Request query does not affect lookup. Keys are stored as **path-only** on `ignore` maps — query in the key string is stripped on create, update, and import (for example `promo?utm=email` → `promo`). Use `exact` or `subset` when query belongs in the key identity.

For UTM-specific **static** targets on an `ignore` map, use separate path keys (`promo-email`, `promo-social`) or switch the map to `subset`.

### Query-qualified keys (map `queryMatch: exact` or `subset`)

```
promo                    → default promo page
promo?utm=email          → email variant
promo?utm=email&lang=pl  → Polish email variant (subset: most specific wins)
```

Embed query in key string exactly as visitors will send it (after normalization).

### Nested path keys

```
docs/getting-started
docs/api/authentication
docs/api/rate-limits
```

Works with rule source `/help` → keys `docs/…`.

---

## Operational workflows

### Launch campaign

1. Create map with `fallbackDestination`.
2. Import entries CSV-equivalent via `/import` (max **500** per request; check plan via `GET /api/v1/organization/usage`).
3. Attach redirect rule with prefix `/c`.
4. Run [simulate](./redirect-rules.md#simulate-before-rollout) on sample URLs.
5. Monitor [analytics](./redirect-rules.md#analytics) `topLinkMapKeys`.

### Update destinations mid-campaign

Single entry PUT or re-import with same keys (upsert updates destinations).

### Retire campaign

1. Delete entries or update fallback.
2. Optionally lower rule priority or delete rule.

---

## Safety validation

Every destination is scanned before write:

- Must start with `http://` or `https://`
- Must pass safety scanner (malware/phishing checks)
- Scanner failure → `500` (fail-closed)

Applies to: create, update, import.

---

## Error reference

| Status | Typical cause |
|--------|---------------|
| `400` | Invalid key format, duplicate key, unsafe destination |
| `404` | Map or entry not found / wrong organization |
| `500` | Safety scanner unavailable |

---

## Related guides

- [Link maps](./link-maps.md)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect rules](./redirect-rules.md)
