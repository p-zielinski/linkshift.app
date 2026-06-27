# Domains and domain groups

These endpoints define **where redirect logic runs**. Every redirect rule belongs to a **domain group**. Domains and LinkShift subdomains in that group share the same rule set.

For how rules match requests, see [Redirect rules guide](./redirect-rules.md).

---

## In the dashboard

Prefer the UI? The path depends on your sidebar layout — see [Dashboard overview — Campaign and Advanced views](./dashboard/dashboard-overview.md#campaign-and-advanced-views).

### Campaign view (short links)

1. Open **Links** (`/links`) or **Overview** (`/overview`) and select **Connect your domain**, or follow **Connect your domain** on the setup checklist.
2. In the **Connect your domain** wizard, set a **Site name**, then add a LinkShift **subdomain** or **custom domain**. LinkShift creates the domain group and host for you.
3. Create short links from **Links** → **Create link** (or **Overview** → **Create link**). The create flow can provision a default link map and `/go` prefix rule when needed.

Campaign onboarding does not require opening **Domain Groups** in the sidebar. Infrastructure pages stay in **Advanced** view.

### Advanced view (full routing stack)

Use the sidebar in this order:

- **Domain Groups** → **Add group** — [Domain groups in the dashboard](./dashboard/domain-groups-in-dashboard.md)
- **Domains** → **Add domain** or **Subdomains** → **Add subdomain** — [Domains and subdomains in the dashboard](./dashboard/domains-and-subdomains-in-dashboard.md)

Then add redirect rules, link maps, and tests as needed.

:::ai-only
Campaign connect-domain wizard: route `/links` with query `openConnectDomain=1` (also from setup checklist). Creates domain group + subdomain or custom domain. Advanced domain setup: `/domain-groups` → `/domains` or `/subdomains`. Checklist confirm-domain Campaign → connect flow; Advanced → `/domain-groups`.
:::

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

:::info
Before redirect rules run, the edge applies organization **rate limits** and **access checks**, and may serve **`robots.txt`** from the domain group policy. The first rule that **returns a target URL** wins — a matching `source` alone is not enough (link map miss with no fallback skips to the next rule). When a rule returns a target, the group's **redirect delivery mode** controls whether the visitor gets an immediate HTTP redirect or a notice page first. `robots.txt` requests still count toward `redirectionLimitPerMinute`.
:::

See [Redirect rules — how routing works](./redirect-rules-core.md#how-routing-works) and the [routing decision flow diagram](../concepts/redirect-engine-conditionals.md#routing-decision-flow-diagram).

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
  "customRobotsContent": null,
  "redirectDeliveryMode": "INSTANT"
}
```

### Get / update / delete

- `GET /api/v1/domain-groups/:id` — response includes `redirectDeliveryMode`
- `PUT /api/v1/domain-groups/:id` — update `name`, robots fields, and/or `redirectDeliveryMode`
- `DELETE /api/v1/domain-groups/:id`

Example update:

```json
PUT /api/v1/domain-groups/:id
{
  "name": "Production",
  "redirectDeliveryMode": "WITH_NOTICE"
}
```

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

### Redirect delivery mode

Controls how visitors reach the destination after a rule match. Applies to every domain and subdomain in the group.

| Value | Behavior |
|-------|----------|
| `INSTANT` (default) | HTTP redirect using the matching rule's `statusCode` (default `302`) |
| `WITH_NOTICE` | Returns `200` HTML notice page showing the destination, a 10-second countdown, and a **Continue now** button; JavaScript completes the redirect after the countdown or when the button is clicked. The rule's `statusCode` is not used on live traffic. |

Notes:

- **Simulate** and **redirect tests** still report the rule's `statusCode` and `target` — they do not model the notice page. Validate `WITH_NOTICE` with live requests or the redirect tester, not simulate alone.

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
- `POST /api/v1/domains/:id/verify-dns` — check DNS and update `dnsStatus` (see [DNS verification](#dns-verification-for-custom-domains))
- `PUT /api/v1/domains/:id` — move to another domain group (`domainGroupId` only; see [Hostname lifecycle](#hostname-lifecycle))
- `DELETE /api/v1/domains/:id` — remove

Example — move to another group:

```json
PUT /api/v1/domains/:id
{
  "domainGroupId": "dmg_other"
}
```

Notes:

- Domain names unique among active records; stored **lowercase** on create.
- New domains start with **`dnsStatus: PENDING`** until DNS points at the LinkShift target IP.
- Plan limits validated on create.
- Moving domain between groups changes which rules apply.
- The domain **name cannot be changed** after creation — delete and create a new domain to use a different hostname.

### Domain placeholders in rules

Redirect destinations can use hostname-derived placeholders. Values depend on hostname shape (multi-label vs `example.com`):

```
{domain.fqdn}       → links.example.com
{domain.extension}  → example.com (without leftmost label) for links.example.com
{domain.root}       → example (for links.example.com; see concepts table)
```

See [Redirect engine concepts — domain variables](../concepts/redirect-engine-variables.md#domain-variables) (full tables for `localhost`, two-label hosts, and multi-part TLDs).

**Two-label hosts:** On `example.com`, `{domain.label}` is `example`, `{domain.root}` is `example`, and `{domain.extension}` is `com` — not the registrable apex pair. Use `{domain.fqdn}` or simulate with your real hostname before going live.

Example — redirect www to apex (works well for typical `www.example.com` → `example.com`):

```json
{
  "source": "/^/(.*)$/",
  "destination": "https://{domain.extension}/$1"
}
```

Use default `queryMatch` (`exact`) so regex runs on `originalUrl` and query params are preserved in `$1`. See [Redirect rules — strip www to apex](./redirect-rules-recipes.md#strip-www-to-apex).

**Multi-part TLD caveat:** On hostnames like `links.brand.co.uk`, `{domain.root}` is `co` and `{domain.extension}` is `brand.co.uk` — neither is a full registrable-apex helper. Inspect placeholders with [simulate](../guides/redirect-rules-operations.md#simulate-before-rollout) for your real hostnames — see [Redirect engine concepts — domain variables](../concepts/redirect-engine-variables.md#domain-variables).

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
- `PUT /api/v1/subdomains/:id` — move to another domain group (`domainGroupId` only; see [Hostname lifecycle](#hostname-lifecycle))
- `DELETE /api/v1/subdomains/:id`

Example — move to another group:

```json
PUT /api/v1/subdomains/:id
{
  "domainGroupId": "dmg_other"
}
```

Notes:

- Name: `[a-z0-9-]` only, max 30 characters.
- Reserved names blocked (e.g. `support`, `docs`, `admin`).
- Same rule set as other resources in the domain group.
- The subdomain **label cannot be changed** after creation — delete and create a new subdomain to use a different name.

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

## Hostname lifecycle

Custom domains and LinkShift subdomain labels share the same lifecycle rules.

### Immutable hostnames

After creation, the hostname (custom domain FQDN or subdomain label) is **immutable**. The only field you can change via `PUT` is `domainGroupId` — moving the host to another group changes which redirect rules apply.

To use a different hostname:

1. `DELETE` the existing domain or subdomain.
2. Wait out the [release cooldown](#release-cooldown) if reusing the same name.
3. `POST` a new domain or subdomain with the desired name.

Sending `name` in a `PUT` body returns **400** (strict schema). The API rejects name changes even if the value matches the existing record.

### Release cooldown

After `DELETE`, the hostname is **globally reserved for 7 days** before anyone in any organization can register it again. `POST` with that name during the cooldown returns **409 Conflict** with the cooldown end time.

Active domain and subdomain names are also **globally unique** across the platform (not per organization). Two organizations cannot register the same hostname or label while either record is active.

Subdomain labels on the reserved platform list (for example `admin`, `api`, `www`, `support`) return **409 Conflict** on create.

This applies to both custom domains and LinkShift subdomain labels.

### Normalization

Custom domain names are trimmed, lowercased, and stored without a trailing dot on create. Use lowercase in API requests; mixed case in `POST` is accepted and normalized.

Subdomain labels must already match `[a-z0-9-]` (lowercase only).

### DNS verification for custom domains

Custom domains require DNS pointing at LinkShift before the edge issues on-demand TLS or serves HTTPS traffic.

| `dnsStatus` | Meaning |
|-------------|---------|
| `PENDING` | Domain registered; DNS not yet confirmed. Default on `POST /api/v1/domains`. |
| `VERIFIED` | A record (or CNAME chain) resolves to the LinkShift target IP (`APP_DOMAIN_TARGET_IP`). |
| `FAILED` | Last check did not find the target IP — update DNS and retry. |

**Manual check:** `POST /api/v1/domains/:id/verify-dns` performs a live lookup (3s timeout, follows CNAME chains) and updates `dnsStatus`, `dnsVerifiedAt`, and `dnsLastCheckedAt`. Safe to retry after propagation.

**Automatic check:** When Caddy requests on-demand TLS, it calls the internal `GET /check-domain?domain={hostname}` endpoint. For registered custom domains that are not yet `VERIFIED`, the backend performs the same DNS lookup. Success promotes the domain to `VERIFIED`; failure returns **403** (`dns_pending`) so Let's Encrypt is not triggered prematurely.

LinkShift subdomains (`*.linkshift.app`) skip DNS verification — they use wildcard TLS.

### TLS and edge routing

LinkShift's edge (`config/Caddyfile`) uses two TLS models:

| Host type | TLS model | Implication |
|-----------|-----------|-------------|
| LinkShift subdomains (`*.linkshift.app`) | Wildcard certificate via DNS (Cloudflare) | One cert covers all subdomain labels. Creating or deleting a subdomain does **not** consume a Let's Encrypt per-hostname slot. |
| Custom domains | On-demand TLS (Let's Encrypt) | Each new hostname triggers a separate certificate order when traffic arrives. Subject to [Let's Encrypt rate limits](https://letsencrypt.org/docs/rate-limits/) (~50 new certificates per registered domain per week). |

Custom domains are authorized through internal `GET /check-domain?domain={hostname}` before Caddy issues a certificate. That endpoint returns **403** when the hostname is unknown, the domain group is inactive, or DNS is not verified yet. Deleting a custom domain stops redirect routing for that host; DNS may still point at LinkShift until you update your provider.

Renaming is blocked because a new hostname would require a new on-demand certificate for custom domains and would break published short links. Delete + create is the supported path.

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

**In the dashboard:** open **Settings** → **Plan and usage** in **Campaign** view, or **Dashboard** in **Advanced** view, for the same meters (domain groups, domains, rules, link maps, tests, seats, API keys, redirection rate, analytics retention). See [Dashboard overview — Plan and usage](./dashboard/dashboard-overview.md#plan-and-usage).

---

## Routing setup checklist

**API path**

1. **Create domain group** — production vs staging separation
2. **Add domain or subdomain** — attach to group
3. **Create redirect rules** — see [Redirect rules](./redirect-rules.md)
4. **Optional: link maps** — for short links at scale
5. **Simulate** — verify routing before DNS cutover
6. **Add redirect tests** — lock behavior in CI

**Dashboard path (Advanced)** — same order in the app: [Domain groups](./dashboard/domain-groups-in-dashboard.md) → [Domains and subdomains](./dashboard/domains-and-subdomains-in-dashboard.md) → [Redirect rules](./dashboard/redirect-rules-in-dashboard.md) → [Link maps](./dashboard/link-maps-in-dashboard.md) (optional) → [Tests](./dashboard/tests-in-dashboard.md) (**Run tests** or **Fetch expected result** instead of simulate).

**Dashboard path (Campaign)** — [Connect your domain](#in-the-dashboard) from **Links** or **Overview** (`/overview`), then **Create link** on **Links**. Validate with **Tools** → **Redirect tester** (setup checklist **Test a link**) or switch to **Advanced** for redirect tests.

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
