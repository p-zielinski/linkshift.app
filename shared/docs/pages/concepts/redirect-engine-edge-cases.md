# Redirect engine — regex, link maps, and edge cases

Regex and wildcard sources, link map key extraction, runtime edge cases, validation summary, quick reference, and advanced FAQ.

Part of [Redirect engine concepts](./redirect-engine-concepts.md).

---

## Regex sources

Store as string: `/pattern/flags`

Valid flags: `d`, `g`, `i`, `m`, `s`, `u`, `v`, `y` (JavaScript RegExp flags).

Examples:

| Source | Matches |
|--------|---------|
| `/^\\/blog\\/(.+)$/` | `/blog/any-slug` |
| `/^\\/go\\/([^/]+)\\/([^/]+)$/` | `/go/docs/api` |
| `/^\\/(.*)$/` | Any path |

Capture groups populate `$0` (full match), `$1`, `$2`, … in destination **before** placeholder resolution. Validation counts **capturing** groups only (`(?:…)` non-capturing groups are not counted toward `$N` limits).

:::error
**`$N` capture substitution requires a regex `source`** (`/pattern/flags`). Plain path, wildcard, and link map rules return **`400`** if `destination` contains `$0`, `$1`, …
:::

**`$N` only on regex `source`:** Substitution runs only when `source` is stored as `/pattern/flags`. On a **plain path** or wildcard rule, any `$N` in `destination` (including `$0`) returns `400` validation — use a regex `source` when you need capture substitution.

**Missing or non-participating `$N` at runtime:**

| Case | Result |
|------|--------|
| `$N` in `destination` where `N` exceeds capturing groups in `source` | **`400` at save** — `Destination uses group $N, but source only has …` |
| `$N` on plain path / `*` / link map rule | **`400` at save** — capture substitution requires regex `source` |
| Optional group did not match this request (e.g. `(…)?` absent) | Replaced with the literal text **`undefined`** in the URL (`redirect.service.ts` — `String.replace` with `undefined`) |
| `{placeholder}` missing (no modifier chain) | Left **unchanged** as `{placeholder}` — different from `$N` |

Prefer required capturing groups or separate rules when a suffix is optional; test edge paths with [simulate](../guides/redirect-rules-operations.md#simulate-before-rollout).

Example — `$0` is the full path match:

```json
{
  "source": "/^\\/archive\\/(.+)$/",
  "destination": "https://archive.example.com/redirect?matched=$0&slug=$1",
  "queryMatch": "ignore"
}
```

Request `/archive/2024/post` → `matched=/archive/2024/post`, `slug=2024/post`.

With `queryMatch: ignore`, regex matches path only. Otherwise matches full path + query (`originalUrl`).

**Flag `g` (global):** Avoid storing regex sources with a `g` flag unless you intend it. `String.match()` on a global regex can behave differently with capture groups than a non-global pattern. Prefer patterns without `g` for redirect `source` values.

**Preserve query on www → apex:** For `source: /^\\/(.*)$/` and `destination: https://{domain.extension}/$1`, do not use `queryMatch: ignore` — use default `exact` so `$1` includes the query string. See `redirect.service.spec.ts` (www host → apex with query).

### Plain path vs regex — do not confuse them

Any `source` that looks like `/pattern/flags` (leading `/`, another `/`, then **only** valid RegExp flag letters `d`, `g`, `i`, `m`, `s`, `u`, `v`, `y`) is stored and executed as a **regex**, not a literal path.

| `source` | Interpreted as |
|----------|----------------|
| `/^\\/blog\\/(.+)$/` | Regex (intended) |
| `/v2/go` | Plain prefix path (suffix `go` is not valid flags) |
| `/campaign/i` | **Regex** pattern `campaign`, flag `i` — not path `/campaign/i` |
| `/api/v1/g` | **Regex** pattern `api/v1`, flag `g` |

Use explicit regex syntax (`/^\\/campaign\\/i$/` or similar) when you need metacharacters. Use plain segments without a trailing `/flags` suffix for literal paths. Link map rule sources must be plain paths (regex form is rejected at validation).

---

## Wildcard source (`*`)

Matches all requests (subject to `matchMethod` only). Typical pattern:

```json
{ "source": "*", "destination": "...", "priority": 0 }
```

**`pathMatch` and `queryMatch` are ignored** for `source: "*"`. The API still stores those fields, but runtime always treats the rule as matched (before destination resolution). Use a plain path `source` with embedded `?…` or conditional logic when query params must gate matching.

Cannot be combined with `linkMapId`.

---

## Regex and plain path — which fields apply

| `source` form | `pathMatch` | `queryMatch` | `$N` in `destination` | `linkMapId` | `matchMethod` |
|---------------|-------------|--------------|------------------------|-------------|---------------|
| Plain path (e.g. `/go`, `/promo?utm=x`) | Used (`exact` or `prefix`) | Used | **No** — API rejects any `$N` in `destination` (see [regex sources](#regex-sources)) | Allowed — see link map row | Used |
| `/pattern/flags` regex | **Ignored** (anchor in pattern) | Used (`ignore` → path only; else `originalUrl`) | **Yes** — substituted before `{placeholders}` | **No** — cannot combine with `*`; API rejects regex for link map rules | Used |
| `*` wildcard | **Ignored** | **Ignored** | **No** (not a regex `source`) | **No** | **Only** gate besides destination logic |
| Link map rule (plain `source` + `linkMapId`) | **`prefix` only** (API) | **`ignore` only** (API) | **No** on rule (`destination: null`); map URLs are static | **Required**; `destination` must be `null` | Used — e.g. `["GET"]` so `POST /go/x` falls through |

### Regex match target (`originalUrl`)

For regex rules with `queryMatch` other than `ignore`, the engine matches against **`originalUrl`** (path + query as on the request). That value comes from `req.originalUrl` when present, otherwise `pathname + search`. With `queryMatch: ignore`, only `pathname` is matched.

Capture groups `$0` (full match), `$1`, … are substituted **only** when `source` is stored as `/pattern/flags`. Plain-path and wildcard rules do not substitute `$N`; the API rejects any `$N` in `destination` on create/update.

---

## Link map key extraction

For link map rules only:

```
sourcePath = path portion of rule source (no query)
keyPath    = requestPath with sourcePath prefix removed (leading slash stripped from remainder)
```

**Order matters:** The rule must **match** first (`pathMatch: prefix` with segment boundaries via `isPrefixMatch`, plus `queryMatch: ignore` on the rule). Only then is `keyPath` extracted. A request like `/golang/summer` does **not** match rule `source: /go`, so no key is extracted.

Simulate and analytics return this **raw** `keyPath` (for example `Summer`). The link map resolver then **normalizes** it per map `caseSensitive` (for example `summer`) before lookup.

| Rule source | Request path | Extracted key |
|-------------|--------------|---------------|
| `/go` | `/go/summer` | `summer` |
| `/go` | `/go/summer/extra` | `summer/extra` |
| `/long` | `/long/abc` | `abc` |
| `/long/` | `/long/abc` | `abc` |
| `/go` | `/go` only (no suffix) | `""` (empty string) — lookup rarely useful; prefer a named key or fallback rule |
| `/go` | `/go/` only | Matches (prefix); key `""` |
| `/long/` | `/long` only (no trailing segment) | rule does **not** match |
| `/long/` | `/long/` | Matches; key `""` |

**Trailing slash on rule `source` (prefix):** For suffixed paths (`/go/summer`), `/go` and `/go/` usually extract the same key. Asymmetric matching: `source=/go` matches request `/go/`; `source=/go/` does **not** match request `/go` alone. Prefer `/go` without a trailing slash for short-link prefixes.

**Plain path only:** Multi-segment prefixes are allowed (e.g. rule `source: /v2/go`, request `/v2/go/summer` → key `summer`). Stored `/pattern/flags` regex form is rejected. You can also use a short rule prefix and multi-segment **entry keys** (rule `/s`, key `docs/api/v2`).

Extracted key + **request query** (not query embedded in rule `source`) are passed to link map resolver. See [Link map concepts](./link-map-concepts.md).

---

## Rule processing edge cases

### Malformed rule at runtime

If a rule throws during processing (recursion limit, unexpected error), it is **skipped** and the next rule is tried. The server keeps responding.

### Blocked rules (`isBlocked`)

Rules with `isBlocked: true` are excluded from matching entirely.

| Topic | Behavior |
|-------|----------|
| Public API | `isBlocked` is returned on rule GET/list; it is **not** a create/update field |
| On create/update | Destination safety scan runs on rules **with** a non-null `destination` (see [Redirect rules — validation](../guides/redirect-rules-operations.md#validation)) |
| Ongoing safety monitoring | The platform runs **automated destination safety checks** on create/update and may re-check rules with a non-null `destination` over time. Unsafe URLs → `isBlocked: true`, possible domain blacklist update, **email to the rule’s organization owner**. Link map rules (`destination: null`) are not monitored on the rule record — entry and `fallbackDestination` URLs are validated on map/entry write instead. |
| Unblock via API | Any successful `PUT` on the rule sets `isBlocked: false` and clears `blockedAt` — even if you only change unrelated fields. Fix unsafe URLs first; ongoing monitoring can block the rule again if destinations stay unsafe. |

`isBlocked` on the rule record is separate from runtime **403** when a resolved redirect target host is on the domain blacklist (see below).

### Destination domain blacklist (runtime)

After a rule produces a target, the edge may block the redirect based on the **destination host**:

| Resolved target | Blacklist check |
|-----------------|-----------------|
| `https://…` or `http://…` | Host extracted and checked against platform domain blacklist |
| Root-relative `/path` | **Skipped** — no absolute host to check |
| Link map static URL | Same as `https://` — host is checked |

If the host is blacklisted, the visitor gets **`403 Forbidden`** (`Destination domain is blocked`) instead of a redirect. This is separate from `isBlocked` on the rule record.

**Blacklist service errors:** If the blacklist check throws (infrastructure error), the visitor gets **`503 Service Unavailable`** (`Couldn't verify redirect destination. Try again in a moment.`) and **no redirect** is issued (fail-closed). Live traffic never falls through to an unverified redirect when the check fails.

Simulate does **not** run blacklist checks by default — it can return `matched: true` with a target that live traffic would block with **403** or **503**. Pass **`checkDestinationBlacklist: true`** on the simulate request for CI parity (see [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)).

### Link map match pipeline

For rules with `linkMapId`, stored `destination` is always `null`. Runtime still runs `processRule` first (path/`matchMethod`/`queryMatch` on the rule):

1. If the rule does not match → skip rule (`null`).
2. If it matches → `processRule` resolves placeholders/conditionals on an empty string (yields `""`, which is **not** `null`).
3. `getRedirectMatch` then calls link map lookup (`resolveLinkMapTarget`) and uses the **static** entry or `fallbackDestination` URL.
4. If lookup returns `null` (no entry, no fallback) → **no redirect from this rule** — next rule in priority order.

Dynamic `destination` logic on the rule record itself is never used when `linkMapId` is set.

### Link map miss

When link map returns `null` (no entry, no fallback), the link map rule **does not produce a redirect** — evaluation continues to the next rule.

### Link map entry destinations

Destinations stored in link map **entries** and `fallbackDestination` are **static** `http://` or `https://` URLs. They are **not** processed by the redirect engine template (no `{placeholders}`, no ternary conditionals, no `$1` from rule regex). Dynamic routing belongs on the **redirect rule** `destination`, or use separate entries per variant.

### Empty or whitespace-only target

API validation requires a non-empty `destination` string on create/update (for rules without `linkMapId`). At **runtime**, a conditional can still resolve to `""` after matching — that rule **wins** and the edge issues `res.redirect(statusCode, "")` (broken redirect). Avoid empty branches; use an explicit URL or root-relative path, or a lower-priority fallback rule.

### Root-relative destinations (`/path`)

Branches (and static destinations) may start with `/` for same-host redirects:

```
random(0,1) < 1 ? /variant-a : /variant-b
'{user-agent}' ~= 'iPhone' ? /mobile-site : /desktop-site
```

API validation accepts `http://`, `https://`, or `/` prefixes. Bare hostnames like `example.com/path` are rejected.

---

## Validation summary

On create/update, the API validates:

| Check | Detail |
|-------|--------|
| Source / destination length | Max **16,384** characters each |
| Source regex | Compilable; capture group count for `$N` |
| Destination placeholders | `domain.fqdn`, `domain.label`, `domain.root`, `domain.extension`, `domain.subdomain`, `domain.subdomains.N`, `path`, `segments.N`, `query.*`, `method`, `ip`, `user-agent`, `accept-language`, `accept-language.primary`; plus `{time()}`, `{random(...)}`. **`{geo.country}` rejected** until GeoIP ships |
| Modifiers | Must exist in supported list |
| Functions | `time()`, `random(...)` with valid numeric args |
| Conditionals | Valid operators (`==` not `===`); one operator per condition; nesting ≤ 32 |
| URL structure | Leaf must start with `http://`, `https://`, or `/` |
| Multiline `destination` | Allowed — validation runs on the full string (JSON may contain `\n` in the value). Avoid accidental newlines inside quoted condition operands. Example: `"destination": "'{method}' == 'GET' ? https://a.example.com\\n: https://b.example.com"` — the newline is part of the stored string; keep condition operands on one line when possible. |
| Link map exclusivity | `linkMapId` + `destination: null` + prefix/ignore + plain path `source` (no regex) |
| Link map + destination on write | **`destination` must be omitted or JSON `null`.** Any other value (including `""`) with `linkMapId` returns `400` on create and update. |
| Link map rule validation | Validator runs on `source` plus internal stub `https://linkmap.local` (static URL only). It does **not** validate your conditional/placeholder program on the rule, because stored `destination` is always `null`. Test dynamic logic with a separate rule (no `linkMapId`) or [simulate](../guides/redirect-rules-operations.md#simulate-before-rollout). Entry URLs are validated on link map entry write. |

Validation errors return `400` with an `errors.details` array.

---

## Quick reference card

```
Source types:     plain path | path?query | /regex/flags | *
pathMatch:          exact | prefix (plain path only; ignored for regex and *)
queryMatch:         exact | ignore | subset (plain path + regex; ignored for *)
matchMethod:        [] = all 7 methods | up to 6 listed explicitly
priority:           higher first (0–1000)
includes:           case-sensitive (use to_lower_case on operand)
modifier chains:    left-to-right after last :

Destinations:       https://… or root-relative /path (same host)
Placeholders:       {domain.*} {path} {segments.N} {query.X} {method} {ip} {user-agent} {accept-language*}
Functions:          {time()} {random(min,max)}  (inclusive min/max)
Modifiers:          :to_lower_case.to_upper_case.url_encode.url_decode.base64_encode.to_iso_string.auto_trailing_slash.multiply_10.divide_10.add_10.multiply_2.round

Conditionals:       Cond ? True : False
Operators:          == != <= >= ~= includes < >  (first match in that order)
Condition funcs:    time() random() datetime('date','TZ')  (datetime: conditions only)
Simulate:           no 429; blacklist opt-in (checkDestinationBlacklist); yes 402 (org access) — whole request

Link map rules:     pathMatch=prefix, queryMatch=ignore, destination=null only
Link map API:       no draft destination; validate source + stub URL only
Link map entries:   static https URLs only (no engine templates)
Nesting limit:      32
GeoIP (planned):    {geo.country} — not available; contact support if interested
Blacklist:          absolute https? targets only; hit → 403; check error → 503, no redirect
isBlocked:          rule skipped; ongoing safety monitoring; cleared on successful PUT
Source footgun:     /path/i may be regex — use /^...$/ for intentional regex
```

---

## Advanced engineering FAQ

Edge cases that often appear in production debugging. Each answer is aligned with `redirect.service.ts` and `redirect.service.spec.ts`.

### What happens with an infinite redirect loop?

LinkShift issues **one HTTP redirect per incoming request** (`Location` + `statusCode`). It does **not** follow redirect chains on live traffic the way a browser or the public [redirect trace tool](https://linkshift.app/tools/redirect-trace) does.

If rule A sends visitors to a URL that hits rule B, which sends them back to A, the **browser** (or API client) loops — not the edge engine in a single request. Design destinations so the next hop leaves the matched prefix, use different paths, or lower-priority fallbacks. Test multi-hop journeys with the trace tool (hop limit and loop detection live in the tools frontend, not in `redirect.service`).

### How does the engine handle query-string encoding (`%20`, `+`, Unicode)?

Matching and `queryMatch` use `URL` / `URLSearchParams` parsing on the request URL — values are compared in **decoded** form. A rule `source` with `?q=hello%20world` matches a request whose decoded `q` is `hello world`.

For **placeholders**, `{query.*}` uses the same `URLSearchParams` walk; duplicate keys keep the **last** value. Prefer [simulate](../guides/redirect-rules-operations.md#simulate-before-rollout) with the exact `query` object you expect in production. Entry keys in link maps cannot contain raw `%` — see [Link map entries — percent-encoding](../guides/link-map-entries.md#percent-encoding-and-non-ascii-slugs).

### Two rules share the same `priority` and `createdAt` — which wins?

Runtime, simulate, and list pagination all use the same order: **`priority` desc → `createdAt` desc → `id` desc**. If two rules were created in the same millisecond (rare), the rule with the **lexicographically greater `id`** (newer CUID) wins. Do not rely on tie-breaks for business logic — set explicit `priority` values.

### Can a redirect target point back to the same host and re-enter the engine?

Yes. A root-relative destination (`/other-path`) or absolute URL on the same domain is a **new HTTP request**; the full rule list runs again. That is how you chain internal paths — and how accidental loops appear if two rules keep matching each other. Link map misses **skip** the current rule without redirecting; they do not count as a loop.

### What if a ternary resolves to an empty string after the rule already matched?

The rule **still wins**: the edge calls `res.redirect(statusCode, "")`, which browsers treat as a broken redirect. The engine does not fall through to the next rule. Avoid empty branches; use an explicit URL, root-relative path, or a lower-priority catch-all. See [Empty or whitespace-only target](#empty-or-whitespace-only-target).

---

## Related guides

- [Docs overview](../overview.md#what-is-linkshiftapp)
- [Redirect rules guide](../guides/redirect-rules.md) — [routing decision flow (diagram)](./redirect-engine-conditionals.md#routing-decision-flow-diagram)
- [Link map concepts](./link-map-concepts.md)
- [Redirect tests guide](../guides/redirect-tests.md)
