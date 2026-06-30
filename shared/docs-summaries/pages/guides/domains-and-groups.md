---
source: shared/docs/pages/guides/domains-and-groups.md
generatedAt: 2026-06-27T00:00:00.000Z
model: manual
---

## Purpose
This document is for users of LinkShift who need to understand how to manage domains and domain groups for redirect logic, including DNS verification for custom domains.

## What this doc covers
- Overview of domains and domain groups
- Dashboard navigation for domain management in Campaign and Advanced views
- Architecture of domain groups and their components
- API endpoints for managing domain groups, domains, and subdomains
- Robots policy and redirect delivery modes
- Domain and subdomain creation and management
- Hostname lifecycle (immutable names, release cooldown, TLS models, DNS verification)
- Routing setup checklist
- Multi-domain patterns for rule application

## Key workflows and rules
1. **Campaign View (Short Links)**
   - Navigate to **Links** or **Overview** and select **Connect your domain**.
   - In the wizard, set a **Site name** and add a LinkShift **subdomain** or **custom domain**.
   - Create short links from **Links** → **Create link**.

2. **Advanced View (Full Routing Stack)**
   - Go to **Domain Groups** → **Add group**.
   - Then navigate to **Domains** → **Add domain** or **Subdomains** → **Add subdomain**.
   - Add redirect rules, link maps, and tests as needed.

3. **Domain Group Management**
   - **Create Group:** `POST /api/v1/domain-groups` with fields `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`.
   - **Update Group:** `PUT /api/v1/domain-groups/:id` to modify group attributes.
   - **Delete Group:** `DELETE /api/v1/domain-groups/:id`.

4. **Domain Management**
   - **Create Domain:** `POST /api/v1/domains` with `name` and `domainGroupId` — starts `dnsStatus: PENDING`.
   - **Verify DNS:** `POST /api/v1/domains/:id/verify-dns` — live lookup; sets `VERIFIED` or `FAILED`.
   - **Move Domain:** `PUT /api/v1/domains/:id` with `domainGroupId` only — hostname immutable.
   - **Delete Domain:** `DELETE /api/v1/domains/:id` — 7-day global name reservation (release cooldown).

5. **Subdomain Management**
   - **Create Subdomain:** `POST /api/v1/subdomains` with `name` and `domainGroupId`.
   - **Move Subdomain:** `PUT /api/v1/subdomains/:id` with `domainGroupId` only — label immutable.
   - **Delete Subdomain:** `DELETE /api/v1/subdomains/:id` — 7-day global name reservation.

6. **Hostname lifecycle**
   - Hostnames (custom domains + LinkShift subdomain labels) cannot be renamed after creation.
   - To change a hostname: delete, wait out cooldown if reusing the name, then create new.
   - LinkShift subdomains: wildcard TLS (`*.linkshift.app`), no per-label cert limit, no DNS verification.
   - Custom domains: on-demand TLS via Let's Encrypt; DNS must verify before `check-domain` allows cert issuance.

7. **DNS verification (custom domains only)**
   - `PENDING` — default on create; edge TLS blocked.
   - `VERIFIED` — A/CNAME chain points at LinkShift target IP.
   - `FAILED` — last check failed; retry after DNS update.
   - Internal `GET /check-domain` auto-promotes to `VERIFIED` on successful probe.

## Limits and constraints
- **Domain Names:** Must be unique among active records; stored lowercase on create; immutable after creation (`PUT` accepts `domainGroupId` only).
- **DNS verification:** Required for custom domain TLS; subdomains exempt.
- **Subdomain Names:** Must match `[a-z0-9-]` and be a maximum of 30 characters; immutable after creation.
- **Release cooldown:** Deleted domain or subdomain names are globally reserved for 7 days before reuse.
- **TLS:** LinkShift subdomains use wildcard cert; custom domains use on-demand Let's Encrypt (rate limits apply).
- **Robots Policy:** Options include `NONE`, `ALLOW_ALL`, `DISALLOW_ALL`, `DISALLOW_BAD_BOTS`, and `CUSTOM` (max 4,096 chars).
- **Redirect Delivery Modes:** Options include `INSTANT` (default) and `WITH_NOTICE`.
- **Rate Limits:** Applied before redirect rules run, affecting how many redirects can occur per minute.
- **Domain Group Ownership:** Enforced by API key organization.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps guide](./link-maps.md)
- [Dashboard overview — Campaign and Advanced views](./dashboard/dashboard-overview.md#campaign-and-advanced-views)
- [Redirect rules — how routing works](./redirect-rules-core.md#how-routing-works)
- [Redirect engine concepts — domain variables](../concepts/redirect-engine-variables.md#domain-variables)
- [Overview — traffic to linkshift.app but rules never run](../overview.md)
