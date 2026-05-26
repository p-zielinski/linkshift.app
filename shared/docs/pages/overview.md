# LinkShift API and platform docs

Use this documentation to configure redirect routing, manage domains and link maps, and inspect API contracts from OpenAPI.

**New here?** Read [What is LinkShift.app?](./intro/what-is-linkshift.md) for a business-technical overview of the platform and rules engine.

---

## What LinkShift provides

LinkShift is a redirect management platform. You define **where incoming traffic should go** using redirect rules, optionally backed by link maps for thousands of short keys.

Core capabilities:

- **Domain groups** — organize domains, subdomains, and rules together
- **Redirect rules** — path/query/regex matching, dynamic destinations, conditional routing
- **Link maps** — scalable key → destination tables behind a single prefix rule
- **Simulation and tests** — validate routing before and after deploys
- **Analytics** — see which rules and link map keys get traffic

---

## Your first redirect in 5 minutes

### 1. Authenticate

All API calls use header `X-API-Key: <your_key>`. See [Getting started](./guides/getting-started.md).

### 2. Create domain group + domain

```json
POST /api/v1/domain-groups
{ "name": "Production", "robotsPolicy": "NONE" }

POST /api/v1/domains
{ "name": "links.example.com", "domainGroupId": "dmg_xxx" }
```

### 3. Create redirect rule

Simple path redirect:

```json
POST /api/v1/redirect-rules
{
  "domainGroupId": "dmg_xxx",
  "source": "/old-page",
  "destination": "https://example.com/new-page",
  "statusCode": 301,
  "queryMatch": "ignore"
}
```

### 4. Verify with simulate

```json
POST /api/v1/redirect-rules/simulate
{
  "entries": [
    {
      "domainGroupId": "dmg_xxx",
      "path": "/old-page",
      "hostname": "links.example.com"
    }
  ]
}
```

Expected: `matched: true`, `target: https://example.com/new-page`.

---

## Documentation map

### Start here

| Guide | When to read |
|-------|--------------|
| [What is LinkShift.app?](./intro/what-is-linkshift.md) | Platform purpose, engine capabilities, who each doc is for |
| [Getting started](./guides/getting-started.md) | API keys, auth, plans, errors |
| [Redirect rules](./guides/redirect-rules.md) | **Main routing guide** — matching, destinations, link maps |
| [Domains and domain groups](./guides/domains-and-groups.md) | Domain topology |

### Routing depth

| Guide | When to read |
|-------|--------------|
| [Redirect engine concepts](./concepts/redirect-engine-concepts.md) | Placeholders, modifiers, conditionals, [routing flow diagram](./concepts/redirect-engine-concepts.md#routing-decision-flow-diagram) |
| [Link maps](./guides/link-maps.md) | Short links at scale |
| [Link map entries](./guides/link-map-entries.md) | Bulk import, key format |
| [Link map concepts](./concepts/link-map-concepts.md) | Normalization, cache, resolution |
| [Redirect tests](./guides/redirect-tests.md) | CI regression testing |

### API reference

| Resource | Description |
|----------|-------------|
| [API reference](./reference.md) | Endpoint index + routing cheat sheet |
| OpenAPI pages (`/docs/api/:operationId`) | Schema trees, Try me |

### Engine cheat sheet

One-page limits and syntax: [Redirect engine concepts — quick reference](./concepts/redirect-engine-concepts.md#quick-reference-card).

**Routing decision index** (which `source` / link map / regex to use): [API reference — routing decision index](./reference.md#routing-decision-index).

---

## Common questions

For step-by-step answers with examples, see the [Redirect rules — How-To cookbook](./guides/redirect-rules.md#how-to-cookbook).

**How do I create short links?**  
Link map + prefix redirect rule. See [How-To — short links](./guides/redirect-rules.md#how-do-i-make-short-links).

**How do I match query parameters?**  
Set `queryMatch` on the rule (`exact`, `ignore`, `subset`). See [Redirect rules — query matching](./guides/redirect-rules.md#query-matching-querymatch).

**Can I route on URL fragments (`#section`)?**  
No. Fragments are not sent to the server, so `{path}` and `{query.*}` never see them. See [Redirect engine concepts — path variables](./concepts/redirect-engine-concepts.md#path-variables).

**How do I redirect based on device or time?**  
Use conditional destination syntax. See [Redirect engine concepts](./concepts/redirect-engine-concepts.md#conditional-routing-syntax).

**How do I test before deploy?**  
`POST /api/v1/redirect-rules/simulate`. See [Redirect rules — simulate](./guides/redirect-rules.md#simulate-before-rollout).

**What happens when no rule matches?**  
No redirect — visitor gets 404 from LinkShift edge. A rule can match the path but still be skipped (for example link map miss with no fallback); the engine then tries the next rule.

**What does “first matching rule” mean?**  
The first rule that **returns a redirect target** wins, not merely the first rule whose `source` matches.

**What if I use `source` `/long/` on a link map rule?**  
See [How-To — `/long/` trailing slash](./guides/redirect-rules.md#what-if-i-set-source-to-long).

**Can link map entries use `{placeholders}` or A/B logic?**  
No — entry destinations are static URLs. Use redirect rule `destination` for dynamic logic, or multiple entries.

**Why was my rule blocked (`isBlocked`)?**  
Create/update scans destinations for unsafe URLs. The platform also runs **ongoing automated safety monitoring** on redirect destinations; unsafe targets can set `isBlocked: true` and notify the organization owner. Link map rules (`destination: null`) are not blocked on the rule record itself — entry URLs are checked on map writes. Clear with any successful `PUT` after fixing URLs. See [Redirect rules — blocked rules](./guides/redirect-rules.md#blocked-rules-isblocked).

**Can I route on cookies or `Accept-Language`?**  
Use `{accept-language}` and `{accept-language.primary}` for browser language — see [Redirect engine concepts — request metadata](./concepts/redirect-engine-concepts.md#request-metadata). Cookie-based routing is **not** supported (no `{cookie.*}` or generic `{header.*}` placeholders).

**Why 403 instead of redirect?**  
Resolved **absolute** target (`http://` / `https://`) host may be on platform blacklist. Root-relative `/path` targets skip blacklist. See [Redirect engine concepts](./concepts/redirect-engine-concepts.md#destination-domain-blacklist-runtime).

**Why 503 instead of redirect?**  
Blacklist verification failed (infrastructure error). Live traffic is fail-closed — no redirect until checks work again.

**Why 429 on my short links?**  
Organization redirect rate limit (`redirectionLimitPerMinute`) exceeded for the current minute. API simulate does not count toward this limit. The limit is checked **before** `robots.txt` and redirect rules.

**When do rule or link map changes go live?**  
Normally immediately after a successful API write (edge cache invalidation). Stale routing can persist up to **5 minutes** only if cache invalidation fails. See [Redirect rules — propagation and caching](./guides/redirect-rules.md#propagation-and-caching).

**Why does simulate return 402?**  
`POST /api/v1/redirect-rules/simulate` calls the same organization access check as live redirects (`checkRedirectionAccess`). Suspended organizations or edge paywall states fail the **entire** simulate request before any entry runs. See [Redirect rules — simulate vs live](./guides/redirect-rules.md#simulate-vs-live-redirect).

**Why does simulate return 400 (no results)?**  
Often an invalid `hostname` for the given `domainGroupId`, or a missing domain group. One bad entry fails the **whole** batch — validate hostnames before CI. See [Redirect tests — CI pitfalls](./guides/redirect-tests.md#ci-workflow).

**Traffic to `*.linkshift.app` but rules never run?**  
The hostname may not be registered as a LinkShift subdomain. Unregistered subdomain hostnames get **`302`** to the platform backend — not your domain group rules. See [Domains and groups — unknown subdomain](./guides/domains-and-groups.md#unknown-or-unregistered-subdomain-hostname).

**Can my path `/campaign/i` be a literal URL?**  
Only if it is not parsed as regex. `/campaign/i` is treated as regex pattern `campaign` with flag `i`. Use a plain segment or explicit `/^…$/` form. See [Redirect engine concepts](./concepts/redirect-engine-concepts.md#plain-path-vs-regex--do-not-confuse-them).

**Visitor opened `/go` with no short code — what happens?**  
Prefix matches but extracted key is empty; map lookup usually misses. Set map `fallbackDestination` or a lower-priority rule. See [Link maps — prefix-only requests](./guides/link-maps.md#when-visitors-hit-the-prefix-only).

**Should short links accept only GET?**  
Redirects are usually GET, but the engine supports all **seven** HTTP methods when `matchMethod` is `[]`. Set `matchMethod: ["GET"]` on the prefix rule if POST or other methods must hit your origin. See [Redirect rules — HTTP method matching](./guides/redirect-rules.md#http-method-matching-matchmethod).

**Can I route by country (`{geo.country}`)?**  
Not yet — planned GeoIP addon only. There is no placeholder or test stub today. Use `{ip}`, User-Agent, or other conditionals until then. Interested? Contact LinkShift support. See [Redirect engine concepts — planned GeoIP](./concepts/redirect-engine-concepts.md#planned-country-routing-geoip-addon).

**Does `queryMatch` on a catch-all (`source: *`) filter traffic?**  
No. Wildcard rules ignore both `pathMatch` and `queryMatch` at runtime — only `matchMethod` limits them. Use a plain path `source` or conditionals in `destination` instead. See [Redirect rules — wildcard](./guides/redirect-rules.md#4-wildcard-catch-all).

**How do I run an A/B test on a landing page?**  
Use `random(0,100) < N ? … : …` in `destination` (bounds are **inclusive**). See [Redirect rules — recipe book](./guides/redirect-rules.md#a-b-test-landing-page). For CI, see [Redirect tests — non-deterministic rules](./guides/redirect-tests.md#testing-dynamic-destinations).

**How do I migrate `/blog/old-slug` paths in bulk?**  
Use a regex `source` and `$1` in `destination`. See [Redirect rules — migrate blog posts](./guides/redirect-rules.md#migrate-blog-posts-with-regex).

**Can I send a draft `destination` on a link map rule to validate ternaries?**  
No. With `linkMapId`, `destination` must be `null`. Use [simulate](./guides/redirect-rules.md#simulate-before-rollout) or a temporary rule without a link map. See [Redirect rules — link map validation](./guides/redirect-rules.md#link-map-rule-validation-and-testing-dynamic-logic).

**How long can analytics custom ranges be?**  
Up to **31 days** when both `start` and `end` are set. See [Redirect rules — analytics](./guides/redirect-rules.md#analytics).

**Common routing mistakes?**  
See [Redirect rules — anti-patterns](./guides/redirect-rules.md#anti-patterns-common-footguns) (`/campaign/i`, catch-all + `queryMatch`, empty ternary branches, A/B in CI).

**Redirect loops, query encoding, or priority ties?**  
See [Redirect engine concepts — Advanced engineering FAQ](./concepts/redirect-engine-concepts.md#advanced-engineering-faq).

---

## Troubleshooting matrix (live redirects)

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| **404** — no redirect | No rule returned a target | Add catch-all or fix priority; check soft-delete / `isBlocked` |
| **404** after link map prefix match | Map miss, no `fallbackDestination`, no lower rule | Set map fallback or a second rule on same prefix |
| **403** | Resolved `http(s)://` host on platform blacklist | Change destination host; root-relative `/path` skips blacklist |
| **503** | Blacklist check infrastructure error (fail-closed) | Retry; no redirect until check succeeds |
| **429** | Organization `redirectionLimitPerMinute` exceeded | Check [usage](./guides/getting-started.md); simulate does not hit this limit |
| **402** | Organization redirect access suspended / plan limit | Fix billing; simulate also returns 402 for whole batch |
| Rule “exists” but never runs | `isBlocked: true` or wrong domain group / hostname | `PUT` to unblock after fixing URLs; verify domain on group |
| Rule blocked again after `PUT` | Automated safety monitoring found unsafe URL in `destination` | Remove or fix URLs in destination branches |
| `POST /go/code` does not redirect | `matchMethod: ["GET"]` on link map rule | Widen `matchMethod` or accept POST on next rule |
| Simulate `matched: true`, live **403** | Simulate skips blacklist by default | Pass `checkDestinationBlacklist: true` on simulate, or test absolute URL host against production policy |
| Simulate **400**, no `results` | Bad `hostname` or `domainGroupId` in batch | One invalid entry fails entire simulate request |
| List API missing a rule | Rule soft-deleted | Deleted rules are excluded from list — not returned by `GET` list |

More detail: [Redirect rules — simulate vs live](./guides/redirect-rules.md#simulate-vs-live-redirect), [engine pipeline](./concepts/redirect-engine-concepts.md#live-redirect-pipeline-end-to-end).

---

## How this docs section is built

- OpenAPI 3.1 as source of truth for endpoint pages
- Markdown guides for routing concepts and workflows
- Schema tree for request/response inspection
- Built-in Try me with session-level API key persistence
- Guides synced via `npm run docs:sync` from repository root
