# What is LinkShift.app?

LinkShift.app is an ultra-fast, programmable redirect and link-mapping platform. You define **where traffic should go** using redirect rules — with optional link maps for thousands of short keys — instead of hard-coding URLs in application code or CDN configs.

Every request is evaluated by a **rules engine** on the edge: match path, query, HTTP method, and optional regex; resolve dynamic destinations with placeholders and conditionals; or look up a key in a link map. The same engine powers live redirects, batch simulation, redirect tests, and analytics.

---

## What you get

| Capability | What it means for you |
|------------|------------------------|
| **Redirect rules** | Path, query, regex, and wildcard matching; priorities; `301`/`302`/`307`/`308` |
| **Dynamic destinations** | Placeholders (`{path}`, `{query.*}`, `{domain.*}`, …), 12 text/numeric modifiers, nested conditionals, `time()` / `random()` |
| **Link maps** | One prefix rule + a table of keys → static HTTPS URLs (short links at scale) |
| **Domains and groups** | Custom domains, LinkShift subdomains, robots policy, organization scoping |
| **Simulation and tests** | `POST /redirect-rules/simulate` (up to 100 entries) and stored redirect tests for CI |
| **Analytics** | Traffic per rule, link map key, and top request variants |
| **Safety** | Destination scanning on write, ongoing automated monitoring, platform blacklist on absolute targets |

LinkShift is **multi-tenant**: API keys and redirect traffic belong to an **organization**. Domain groups bundle domains, subdomains, and rules so production and staging stay isolated.

---

## How a redirect is decided (one sentence)

Incoming request → rate limit and access check → rules sorted by **priority** (highest first), then **newest** `createdAt`, then **`id`** → first rule that **returns a redirect target** wins; link map miss without fallback skips to the next rule.

Detail: [Redirect rules — how routing works](../guides/redirect-rules-core.md#how-routing-works) and [Redirect engine concepts — pipeline](../concepts/redirect-engine-conditionals.md#live-redirect-pipeline-end-to-end).

---

## Who this documentation is for

| Reader | Start here |
|--------|------------|
| **New developer** | [Getting started](../guides/getting-started.md) → [Redirect rules](../guides/redirect-rules.md) → [Redirect engine concepts](../concepts/redirect-engine-concepts.md) |
| **API integrator** | [API reference](../reference.md) and OpenAPI pages under `/docs/api/…` |
| **Short-link operator** | [Link maps](../guides/link-maps.md) + [Link map entries](../guides/link-map-entries.md) |
| **CI owner** | [Redirect tests](../guides/redirect-tests.md) + simulate with optional `checkDestinationBlacklist` |

---

## Programmable routing in practice

**Static redirect** — move `/old` to a new URL:

```json
{
  "source": "/old",
  "destination": "https://example.com/new",
  "statusCode": 301,
  "queryMatch": "ignore"
}
```

**Conditional** — mobile vs desktop from User-Agent:

```json
{
  "source": "*",
  "destination": "'{user-agent:to_lower_case}' includes 'mobile' ? /m : /d",
  "queryMatch": "ignore",
  "priority": 10
}
```

**Short link** — prefix rule + link map (`destination: null` on the rule):

```json
{
  "source": "/go",
  "pathMatch": "prefix",
  "queryMatch": "ignore",
  "linkMapId": "lmap_xxx",
  "destination": null
}
```

Request `/go/summer` → key `summer` → entry URL from the map.

---

## What LinkShift is not

- **Not a CDN or origin host** — it issues HTTP redirects (and serves `robots.txt` per domain group policy); your apps stay on your infrastructure.
- **Not a full edge compute platform** — no arbitrary JavaScript at the edge; routing logic uses the built-in template and conditional language.
- **Not cookie or generic header routing** — use `{user-agent}`, `{accept-language}`, `{ip}`, path, and query; `{geo.country}` is planned, not shipped.
- **Not a redirect chain follower on live traffic** — each visit gets **one** redirect response from LinkShift; the browser or client follows further hops separately.

---

## Next steps

1. [Overview](../overview.md) — five-minute first redirect and documentation map  
2. [Redirect rules guide](../guides/redirect-rules.md) — matching, priorities, link maps, How-To cookbook  
3. [Redirect engine concepts](../concepts/redirect-engine-concepts.md) — placeholders, modifiers, limits, advanced FAQ  

Management API contract: OpenAPI at `/docs/reference` and `linkshift-api-keys.openapi.yaml` in the repository.
