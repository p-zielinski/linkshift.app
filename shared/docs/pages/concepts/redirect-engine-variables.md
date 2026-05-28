# Redirect engine — variables and modifiers

Request variables, modifiers, function placeholders, escaping, and missing placeholder behavior.

Part of [Redirect engine concepts](./redirect-engine-concepts.md). For conditionals and pipeline, see [Conditionals](./redirect-engine-conditionals.md). For regex and edge cases, see [Edge cases](./redirect-engine-edge-cases.md).

For rule configuration and matching, see the [Redirect rules guide](../guides/redirect-rules.md).

---

## Request variables

When a rule matches, the engine builds a variable map from the incoming request. Use these in `{placeholder}` syntax inside destinations and conditions.

### Domain variables

Parsed from request hostname (`Host` header).

| Placeholder | Example hostname | Example value |
|-------------|------------------|---------------|
| `{domain.fqdn}` | `deep.sub.example.co.uk` | `deep.sub.example.co.uk` |
| `{domain.label}` | `deep.sub.example.co.uk` | `deep.sub.example.co` |
| `{domain.root}` | `deep.sub.example.co.uk` | `co` |
| `{domain.extension}` | `deep.sub.example.co.uk` | `sub.example.co.uk` |
| `{domain.subdomain}` | `deep.sub.example.co.uk` | `deep.sub.example` |
| `{domain.subdomains.0}` | `deep.sub.example.co.uk` | `deep` |
| `{domain.subdomains.1}` | `deep.sub.example.co.uk` | `sub` |

#### How labels are derived (important)

The engine splits the hostname on `.` and assigns:

- `{domain.root}` — second-to-last label when there are at least two labels; otherwise the only label (e.g. `localhost`).
- `{domain.label}` — all labels **except the last** (`hostParts.slice(0, -1).join('.')`).
- `{domain.extension}` — all labels **except the first** (`hostParts.slice(1).join('.')`).
- `{domain.subdomain}` / `{domain.subdomains.N}` — labels before the last two (empty when the host has only one or two labels).

**Not the registrable apex:** For `deep.sub.example.co.uk`, `{domain.root}` is `co`, not `example.co.uk`. For apex-style redirects on complex TLDs, prefer `{domain.extension}` or `{domain.fqdn}` and verify with [simulate](../guides/redirect-rules-operations.md#simulate-before-rollout).

**IDN / punycode hostnames:** The engine parses whatever hostname the edge receives (usually punycode ASCII, for example `xn--…`). `{domain.*}` placeholders reflect that string — not the Unicode display form visitors see in the browser bar. Test with the same hostname shape you configure on the domain (`links.example.com` vs punycode) via [simulate](../guides/redirect-rules-operations.md#simulate-before-rollout).

For single-part hostnames like `localhost`:

| Placeholder | Value |
|-------------|-------|
| `{domain.fqdn}` | `localhost` |
| `{domain.root}` | `localhost` |
| `{domain.label}` | *(empty)* |
| `{domain.extension}` | *(empty)* |
| `{domain.subdomain}` | *(empty)* |

For a standard two-label hostname (`example.com`):

| Placeholder | Value |
|-------------|-------|
| `{domain.fqdn}` | `example.com` |
| `{domain.label}` | `example` |
| `{domain.root}` | `example` |
| `{domain.extension}` | `com` |
| `{domain.subdomain}` | *(empty)* |

For `links.example.com` (three labels):

| Placeholder | Value |
|-------------|-------|
| `{domain.fqdn}` | `links.example.com` |
| `{domain.root}` | `example` |
| `{domain.extension}` | `example.com` |
| `{domain.subdomain}` | `links` |

### Path variables

| Placeholder | Request path | Value |
|-------------|--------------|-------|
| `{path}` | `/user/123/profile` | `user/123/profile` (no leading slash) |
| `{segments.0}` | `/user/123/profile` | `user` |
| `{segments.1}` | `/user/123/profile` | `123` |
| `{segments.2}` | `/user/123/profile` | `profile` |

Segment index starts at `0`. Only segments that exist in the request path are set. If `{segments.N}` is missing and there is **no modifier chain**, the placeholder is left **unchanged** in the output (literal `{segments.N}`). With a modifier chain but no value, the raw key name may be passed into modifiers.

**URL fragments (`#…`):** Browsers do not send the fragment to the server. `{path}`, `{segments.N}`, and `{query.*}` never see `#section` — only the path and query the edge receives. Route on fragments in the browser (client-side), not in redirect rules.

### Query variables

Each query parameter becomes `{query.paramName}`:

Request `/search?q=shoes&color=red`  
→ `{query.q}` = `shoes`, `{query.color}` = `red`

**Placeholders vs matching:** In `{query.*}` substitution, when a param appears multiple times, the engine walks `URLSearchParams` in order and **overwrites** the same key — the **last** occurrence in the query string wins (not the first).

Request `/promo?u=1&u=2` with `destination: "https://example.com/?u={query.u}"`  
→ `https://example.com/?u=2`

Rule **matching** (`queryMatch`) uses a separate map that keeps **all** values per key (sorted) and supports duplicate values in `exact` / `subset` checks.

### Request metadata

| Placeholder | Source |
|-------------|--------|
| `{method}` | HTTP method (`GET`, `POST`, …) |
| `{ip}` | Client IP from the edge request (`req.ip` or socket address) |
| `{user-agent}` | User-Agent header |
| `{accept-language}` | Raw `Accept-Language` header (empty string if absent) |
| `{accept-language.primary}` | First language range from the header (tag before `;`, list order — not q-value ranking) |

There are **no** generic `{header.*}` or `{cookie.*}` placeholders. Route on browser language via `{accept-language}` / `{accept-language.primary}`, on User-Agent or IP via `{user-agent}` / `{ip}`, or with path/query conditionals. Custom request headers (including `Cookie`) are not available — **cookie-based routing is not supported**.

**`{accept-language.primary}` parsing:** The engine takes the first comma-separated range and strips any `;q=…` suffix. Example: `pl-PL,pl;q=0.9,en;q=0.8` → `pl-PL`. Use modifiers such as `to_lower_case` and `includes` in conditionals — same pattern as `{user-agent}`. Values are client-controlled (browsers can spoof them); do not use language routing for authorization.

**Simulate and redirect tests:** Pass `headers.accept-language` (or rely on the browser header on live traffic). Omitted header → empty `{accept-language}` and `{accept-language.primary}`.

**`{ip}` on live traffic:** The engine sets `ip` from `req.ip`, then `req.socket.remoteAddress`. With `trust proxy` enabled on the edge, `req.ip` often reflects the client IP from `X-Forwarded-For` when the proxy is configured correctly. If both are missing (unusual proxy or local setup), `{ip}` is **undefined** — without a modifier chain the literal `{ip}` is left in the output; with modifiers the raw key name may be passed into the chain.

**IPv6:** `{ip}` can be an IPv6 address (for example `2001:db8::1`) when the edge provides one. There is no special normalization — use the same format you expect in production when testing with [simulate](../guides/redirect-rules-operations.md#simulate-before-rollout).

**Simulate:** When `ip` is omitted on a simulate entry, it defaults to **`127.0.0.1`**. Always pass explicit `ip` when testing IP-based conditionals so simulate matches production expectations.

### Planned: country routing (GeoIP addon)

Country-based routing via `{geo.country}` is a **planned feature** — it is **not available** today.

| Topic | Status |
|-------|--------|
| `{geo.country}` placeholder | **Rejected** at API validation (`Unknown variable: "geo.country"`) — see `rule-validator.service.spec.ts` |
| Runtime / simulate | No GeoIP lookup; `extractVariables` has no `geo` branch (comment-only future hook in `redirect.service.ts`) |
| Dev / localhost stub | **None** — do not assume `PL` on `localhost` or `US` as a default in simulate or live traffic |
| Workarounds today | `{accept-language}`, `{ip}`, `{user-agent}`, path/query conditionals, or separate rules per domain |

Interested in country-based routing for your organization? Contact LinkShift support — we use demand to prioritize the GeoIP addon.

---

## Modifiers

Append modifiers after a colon. Chain with dots:

```
{query.code:to_upper_case.url_encode}
```

The engine splits placeholder content on the **last** colon: `{query.utm:source:to_lower_case}` uses key `query.utm:source` and modifier chain `to_lower_case`. Placeholder names cannot contain `:`.

Modifiers work on **function placeholders** in destinations too, for example `{random(0,9):divide_10.divide_10}`.

**Chain order:** Modifiers run **left to right** in the dot chain (`:first.second.third` → apply `first`, then `second`, then `third` on the result).

| Modifier | Effect | Example input → output |
|----------|--------|------------------------|
| `to_lower_case` | Lowercase | `HELLO` → `hello` |
| `to_upper_case` | Uppercase | `hello` → `HELLO` |
| `url_encode` | URI encode | `a b` → `a%20b` |
| `url_decode` | URI decode | `a%20b` → `a b` |
| `base64_encode` | Base64 encode | `test` → `dGVzdA==` |
| `to_iso_string` | ISO-8601 timestamp | `1700000000000` → `2023-11-14T22:13:20.000Z`; empty or unparseable input → **current time** as ISO |
| `auto_trailing_slash` | Add `/` if missing | `path` → `path/` |
| `multiply_10` | × 10 | `5` → `50` |
| `divide_10` | ÷ 10 | `50` → `5`, `123` → `12.3` (decimal-string logic for digit inputs; other shapes fall back to `Number(value)/10`) |
| `add_10` | + 10 | `5` → `15` |
| `multiply_2` | × 2 | `10` → `20` |
| `round` | Round to integer | `10.6` → `11` |

| Phase | Unknown modifier |
|-------|------------------|
| **API create/update** | Validation error (`400`) — fix before save |
| **Runtime** | Skipped with a warning; previous value kept |

Non-numeric input with math modifiers may produce `NaN`. `url_decode` on invalid percent-sequences keeps the previous value (same as other runtime manipulator errors). `divide_10` uses decimal-string shifting for digit-only inputs; other shapes use floating `Number(value)/10`.

**Numeric modifier examples (destinations):**

```json
{
  "source": "/score/42",
  "destination": "https://api.example.com/v{segments.1:multiply_2}"
}
```

Request `/score/42` → `https://api.example.com/v84` (`42` × 2).

```json
{
  "source": "/tier/5",
  "destination": "https://billing.example.com/plan-{segments.1:add_10}"
}
```

Request `/tier/5` → `https://billing.example.com/plan-15`.

```json
{
  "source": "/rating/4.7",
  "destination": "https://reviews.example.com/stars-{segments.1:round}"
}
```

Request `/rating/4.7` → `https://reviews.example.com/stars-5`.

**`random()` in conditions vs destinations:** `{random(0,100)}` in a destination and `random(0,100)` inside a ternary condition are resolved in **separate steps** — each draw is independent within one redirect.

**Do not use `{random(...)}` inside the condition segment** of a ternary. Conditions call `random(min,max)` **without** curly braces (see [Functions in conditions](#functions-in-conditions-no-curly-braces)). `{random(0,100)}` in the condition part is treated as a destination-style placeholder during step 2 of resolution, not as the condition function.

---

## Function placeholders (in destinations)

Use inside `{…}` in destination strings. Resolved at redirect time (not pre-extracted from the request).

### `{time()}`

Returns current timestamp in milliseconds.

```json
{ "destination": "https://example.com?t={time()}" }
```

With modifier:

```json
{ "destination": "https://example.com?t={time():to_iso_string}" }
```

### `{random(min,max)}`

Returns a random integer. **Both bounds are inclusive** (`random(0,9)` can return `0` or `9`).

| Syntax | Range (inclusive) |
|--------|-------------------|
| `{random()}` | `0` to `Number.MAX_SAFE_INTEGER` |
| `{random(100)}` | `0` to `100` |
| `{random(-10,20)}` | `-10` to `20` |

Arguments must be safe integers. Invalid args fail validation at rule save time.

If `min > max`, the engine **swaps** the bounds before drawing.

Used heavily in A/B routing conditions (see below — condition syntax is **without** curly braces). For `random(0,100) < 30`, values `0`–`29` take the true branch; `30` and above take the false branch.

---

## Functions in conditions (no curly braces)

In ternary **conditions**, call `time()`, `random(min,max)`, and `datetime('…')` directly — not as `{time()}`:

```
random(0,100) < 30 ? https://a.example.com : https://b.example.com
time() > datetime('2025-12-01') ? /live : /soon
```

| Context | Syntax | Example |
|---------|--------|---------|
| Destination URL | `{time()}`, `{random(0,100)}` | `https://x.com?t={time()}` |
| Ternary condition | `time()`, `random(0,100)` | `random(0,100) < 50 ? … : …` |

**`datetime('…')` is condition-only.** There is no `{datetime(...)}` placeholder in destinations. Use `time() > datetime('2025-06-01') ? …` in the ternary condition, not inside `{…}`.

---

## Escaping literal braces

To output literal `{` or `}` in destination, double them:

```
https://example.com/{{not-a-placeholder}}
```

→ `https://example.com/{not-a-placeholder}`

The placeholder regex only matches single braces (`{…}`), so doubled braces are not treated as variables. Unescaping runs **after** placeholder substitution (`{{` → `{`, `}}` → `}`). Covered by `redirect.service.spec.ts` (double-brace destination).

This applies anywhere in the destination string, including inside ternary branches.

---

## Missing placeholders

If a placeholder key does not exist and has no modifier chain, it is **left unchanged** in output:

```
Destination: https://example.com/{missing_var}
Result:      https://example.com/{missing_var}
```

If a modifier chain is present but value is missing, the raw key name may be used as input to modifiers.

---

