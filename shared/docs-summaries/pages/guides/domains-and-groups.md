---
source: shared/docs/pages/guides/domains-and-groups.md
generatedAt: 2026-06-30T19:40:20.356Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift who need to understand how to manage domains and domain groups for redirect logic.

## What this doc covers
- Overview of domains and domain groups
- Dashboard navigation for domain management
- Architecture of domain groups and their components
- API endpoints for managing domain groups, domains, and subdomains
- Robots policy and redirect delivery modes
- DNS verification for custom domains
- Hostname lifecycle and constraints
- Routing setup checklist
- Multi-domain patterns and best practices

## Key workflows and rules
1. **Campaign View (Short Links)**
   - Navigate to **Links** or **Overview** and select **Connect your domain**.
   - In the wizard, set a **Site name** and add a LinkShift **subdomain** or **custom domain**.
   - Create short links from **Links** → **Create link** or **Overview** → **Create link**.

2. **Advanced View (Full Routing Stack)**
   - Navigate in this order: **Domain Groups** → **Add group** → **Domains** → **Add domain** or **Subdomains** → **Add subdomain**.
   - Add redirect rules, link maps, and tests as needed.

3. **Domain Group Management**
   - **Create Group**: `POST /api/v1/domain-groups` with fields `name`, `robotsPolicy`, `customRobotsContent`, `redirectDeliveryMode`.
   - **Update Group**: `PUT /api/v1/domain-groups/:id` to modify `name`, `robots fields`, or `redirectDeliveryMode`.
   - **Delete Group**: `DELETE /api/v1/domain-groups/:id`.

4. **Domain Management**
   - **Create Domain**: `POST /api/v1/domains` with fields `name`, `domainGroupId`.
   - **Verify DNS**: `POST /api/v1/domains/:id/verify-dns` to check DNS status.
   - **Move Domain**: `PUT /api/v1/domains/:id` with `domainGroupId`.
   - **Delete Domain**: `DELETE /api/v1/domains/:id`.

5. **Subdomain Management**
   - **Create Subdomain**: `POST /api/v1/subdomains` with fields `name`, `domainGroupId`.
   - **Move Subdomain**: `PUT /api/v1/subdomains/:id` with `domainGroupId`.
   - **Delete Subdomain**: `DELETE /api/v1/subdomains/:id`.

## Limits and constraints
- **Domain Names**: Must be unique among active records and stored in lowercase.
- **Subdomain Names**: Must match `[a-z0-9-]` and be a maximum of 30 characters.
- **Robots Policy**: Options include `NONE`, `ALLOW_ALL`, `DISALLOW_ALL`, `DISALLOW_BAD_BOTS`, and `CUSTOM` (max 4,096 chars).
- **Redirect Delivery Mode**: Options are `INSTANT` (default) and `WITH_NOTICE`.
- **Release Cooldown**: After deletion, hostnames are reserved for 7 days before reuse.
- **DNS Verification**: Custom domains must have DNS pointing to LinkShift before they can be verified.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps guide](./link-maps.md)
- [Dashboard overview — Campaign and Advanced views](./dashboard/dashboard-overview.md#campaign-and-advanced-views)
- [Routing decision flow diagram](../concepts/redirect-engine-conditionals.md#routing-decision-flow-diagram)
- [DNS verification section](#dns-verification-for-custom-domains)
- [Hostname lifecycle section](#hostname-lifecycle)
