---
source: shared/docs/pages/guides/domains-and-groups.md
generatedAt: 2026-06-08T20:09:20.200Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift who need to understand how to manage domains and domain groups for redirect logic.

## What this doc covers
- Overview of domains and domain groups
- Dashboard navigation for domain management in Campaign and Advanced views
- Domain group architecture and organization
- API endpoints for managing domain groups, domains, and subdomains
- Robots policy settings for domain groups
- Placeholder usage in redirect rules
- Handling unknown or unregistered subdomain hostnames
- Routing setup checklist
- Multi-domain patterns for rule application

## Key workflows and rules
1. **Campaign View (Short Links)**
   - Navigate to **Links** or **Overview** and select **Connect your domain**.
   - In the wizard, set a **Site name** and add a LinkShift **subdomain** or **custom domain**.
   - Create short links via **Links** → **Create link**.

2. **Advanced View (Full Routing Stack)**
   - Navigate to **Domain Groups** → **Add group**.
   - Then go to **Domains** → **Add domain** or **Subdomains** → **Add subdomain**.
   - Add redirect rules, link maps, and tests as needed.

3. **Domain Group Management**
   - Use `GET /api/v1/domain-groups` to list groups.
   - Use `POST /api/v1/domain-groups` to create a group with fields: `name`, `robotsPolicy`, and `customRobotsContent`.
   - Use `GET`, `PUT`, and `DELETE` for managing specific groups by ID.

4. **Domain Management**
   - Use `POST /api/v1/domains` to create a domain with fields: `name`, `domainGroupId`.
   - Use `GET`, `PUT`, and `DELETE` for managing specific domains by ID.

5. **Subdomain Management**
   - Use `POST /api/v1/subdomains` to create a subdomain with fields: `name`, `domainGroupId`.
   - Use `GET`, `PUT`, and `DELETE` for managing specific subdomains by ID.

6. **Routing Setup Checklist**
   - Create domain group, add domain/subdomain, create redirect rules, optionally add link maps, simulate routing, and add redirect tests.

## Limits and constraints
- **Domain Names**: Must be unique among active records.
- **Subdomain Names**: Must consist of `[a-z0-9-]`, max 30 characters, with reserved names blocked.
- **Robots Policy**: Options include `NONE`, `ALLOW_ALL`, `DISALLOW_ALL`, `DISALLOW_BAD_BOTS`, and `CUSTOM` (max 4,096 chars).
- **Rate Limits**: Before redirect rules run, organization rate limits and access checks are applied.
- **Redirect Rules**: The first rule that returns a target URL wins; a matching source alone is not sufficient.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps guide](./link-maps.md)
- [Dashboard overview — Campaign and Advanced views](./dashboard/dashboard-overview.md#campaign-and-advanced-views)
- [Redirect rules — how routing works](./redirect-rules-core.md#how-routing-works)
- [Redirect engine concepts — domain variables](../concepts/redirect-engine-variables.md#domain-variables)
- [Overview — traffic to linkshift.app but rules never run](../overview.md)
