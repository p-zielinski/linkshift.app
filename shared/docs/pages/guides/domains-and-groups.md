# Domains and domain groups

These endpoints define **where redirect logic runs**. Every redirect rule belongs to a **domain group**. Domains and LinkShift subdomains in that group share the same rule set.

For how rules match requests, see [Redirect rules guide](./redirect-rules.md).

---

## Architecture

```
Organization
    └── Domain group (dmg_prod)
            ├── Domains: links.example.com, go.example.com
            ├── Subdomains: testing-for-abby.linkshift.app
            ├── Redirect rules (ordered by priority)
            ├── Link maps
            └── Redirect tests
```

A visitor hitting `links.example.com/go/summer` triggers rules on the domain group attached to `links.example.com`.

**Before redirect rules:** After the organization redirect rate limit check, `GET /robots.txt` may be served from the domain group `robotsPolicy` (not from redirect rules). All other paths go through the rule list. `robots.txt` requests still count toward `redirectionLimitPerMinute`.

**First redirect wins:** The first rule that **returns a target URL** wins (not merely the first matching `source`). Link map miss with no fallback skips to the next rule; no rule producing a target → `404`. See [Redirect rules — how routing works](./redirect-rules.md#how-routing-works) and the [routing decision flow diagram](../concepts/redirect-engine-concepts.md#routing-decision-flow-diagram).

---

## Domain groups

Base path: `/api/v1/domain-groups`

### List groups

```
GET /api/v1/domain-groups
```

### Create group

```json
POST /api/v1/domain-groups
{
  "name": "Production",
  "robotsPolicy": "NONE",
  "customRobotsContent": null
}
```

### Get / update / delete

- `GET /api/v1/domain-groups/:id`
- `PUT /api/v1/domain-groups/:id`
- `DELETE /api/v1/domain-groups/:id`

### Robots policy

Controls `robots.txt` served for domains in this group:

| Value | Behavior |
|-------|----------|
| `NONE` | No robots.txt served by LinkShift |
| `ALLOW_ALL` | Allow all crawlers |
| `DISALLOW_ALL` | Disallow all crawlers |
| `DISALLOW_BAD_BOTS` | Block known bad bots |
| `CUSTOM` | Use `customRobotsContent` (max 4,096 chars) |

Notes:

- Group ownership enforced by API key organization.
- Soft-delete used internally.

---

## Domains

Base path: `/api/v1/domains`

Custom domains you point to LinkShift (via DNS).

### Create domain

```json
POST /api/v1/domains
{
  "name": "links.example.com",
  "domainGroupId": "dmg_xxx"
}
```

### Operations

- `GET /api/v1/domains` — list
- `GET /api/v1/domains/:id` — get one
- `PUT /api/v1/domains/:id` — update (e.g. move to another group)
- `DELETE /api/v1/domains/:id` — remove

Notes:

- Domain names unique among active records.
- Plan limits validated on create.
- Moving domain between groups changes which rules apply.

### Domain placeholders in rules

Redirect destinations can use hostname-derived placeholders. Values depend on hostname shape (multi-label vs `example.com`):

```
{domain.fqdn}       → links.example.com
{domain.extension}  → example.com (without leftmost label) for links.example.com
{domain.root}       → example (for links.example.com; see concepts table)
```

See [Redirect engine concepts — domain variables](../concepts/redirect-engine-concepts.md#domain-variables) (full tables for `localhost`, two-label hosts, and multi-part TLDs).

**Two-label hosts:** On `example.com`, `{domain.label}` is `example`, `{domain.root}` is `example`, and `{domain.extension}` is `com` — not the registrable apex pair. Use `{domain.fqdn}` or simulate with your real hostname before going live.

Example — redirect www to apex (works well for typical `www.example.com` → `example.com`):

```json
{
  "source": "/^\\/(.*)$/",
  "destination": "https://{domain.extension}/$1"
}
```

Use default `queryMatch` (`exact`) so regex runs on `originalUrl` and query params are preserved in `$1`. See [Redirect rules — strip www to apex](./redirect-rules.md#strip-www-to-apex).

**Multi-part TLD caveat:** On hostnames like `links.brand.co.uk`, `{domain.root}` is `co` and `{domain.extension}` is `brand.co.uk` — neither is a full registrable-apex helper. Inspect placeholders with [simulate](../guides/redirect-rules.md#simulate-before-rollout) for your real hostnames — see [Redirect engine concepts — domain variables](../concepts/redirect-engine-concepts.md#domain-variables).

---

## LinkShift subdomains

Base path: `/api/v1/subdomains`

Hosted subdomains on LinkShift infrastructure (e.g. `your-name.linkshift.app`).

### Create subdomain

```json
POST /api/v1/subdomains
{
  "name": "campaign-2025",
  "domainGroupId": "dmg_xxx"
}
```

### Operations

- `GET /api/v1/subdomains`
- `GET /api/v1/subdomains/:id`
- `PUT /api/v1/subdomains/:id`
- `DELETE /api/v1/subdomains/:id`

Notes:

- Name: `[a-z0-9-]` only, max 30 characters.
- Reserved names blocked (e.g. `support`, `docs`, `admin`).
- Same rule set as other resources in the domain group.

### Unknown or unregistered subdomain hostname

If a request hits the LinkShift subdomain **hosting endpoint** but the hostname is **not** registered as a subdomain in your organization, the edge responds with **`302 Found`** to the platform backend host — **not** your domain group rules and **not** `404`.

| Situation | Edge behavior |
|-----------|----------------|
| Hostname matches a registered subdomain in a domain group | Normal rule evaluation for that group |
| Hostname does not match any registered subdomain | `302` redirect to backend host (no rule loop) |
| Custom domain not in LinkShift | `404` — domain not found (see custom domains above) |

Register the subdomain via API before sending traffic to `your-name.linkshift.app`.

This is different from a **custom domain** that is not attached to LinkShift (`404` on the edge). See [Overview — traffic to linkshift.app but rules never run](../overview.md).

---

## Organization

Base path: `/api/v1/organization`

### Get organization

```
GET /api/v1/organization
```

Returns organization metadata for the API key.

### Get usage summary

```
GET /api/v1/organization/usage
```

Returns plan usage: domain counts, rule counts, link map entries, etc. Use before bulk imports to avoid limit errors.

---

## Routing setup checklist

1. **Create domain group** — production vs staging separation
2. **Add domain or subdomain** — attach to group
3. **Create redirect rules** — see [Redirect rules](./redirect-rules.md)
4. **Optional: link maps** — for short links at scale
5. **Simulate** — verify routing before DNS cutover
6. **Add redirect tests** — lock behavior in CI

---

## Multi-domain patterns

### Same rules on multiple domains

Put all domains in one domain group. Rules apply to every domain in the group.

### Different rules per brand

Use separate domain groups:

- `dmg_brand_a` → `go.brand-a.com`
- `dmg_brand_b` → `go.brand-b.com`

### Staging vs production

- `dmg_staging` — test rules with simulate
- `dmg_prod` — production domains

Copy rules between groups via API (list + create).

---

## Related guides

- [Redirect rules](./redirect-rules.md)
- [Link maps](./link-maps.md)
- [Overview](../overview.md)
