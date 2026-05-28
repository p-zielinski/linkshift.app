# Redirect rules — validation, simulate, and analytics

Validate redirect rules, run simulate before rollout, and interpret redirect rule analytics.

Part of the [Redirect rules guide](./redirect-rules.md). For matching, see [Matching and destinations](./redirect-rules-core.md).

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

