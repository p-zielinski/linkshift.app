# Redirect rules — link maps

Connect redirect rules to link maps — API constraints, two-layer query matching, lookup misses, and testing dynamic logic.

Part of the [Redirect rules guide](./redirect-rules.md). For matching basics, see [Matching and destinations](./redirect-rules-core.md).

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
| API destination validation | Validates `source` path matching only — **not** conditional or placeholder destinations on the rule |
| Safety scan on create/update | **Not** applied to rule `destination` (it is null). Entry and `fallbackDestination` URLs are scanned on link map writes |
| Runtime vs API | API persists `destination: null` only. The edge never evaluates a rule-level `destination` when `linkMapId` is set — only map entry / `fallbackDestination` URLs |

**How to validate conditional routing before go-live:**

1. **`POST /api/v1/redirect-rules/simulate`** with the same path/query/method you expect in production.
2. Create a temporary rule **without** `linkMapId` that uses the same `destination` string, run simulate, then delete the rule.
3. Use [redirect tests](./redirect-tests.md) for fixed expected outcomes in CI.

---

