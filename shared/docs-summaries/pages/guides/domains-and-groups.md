---
source: shared/docs/pages/guides/domains-and-groups.md
generatedAt: 2026-06-07T10:06:09.168Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift who need to understand how to manage domains and domain groups for redirect logic.

## What this doc covers
- Overview of domains and domain groups
- Dashboard navigation for domain management
- Domain group architecture
- API endpoints for domain groups, domains, and subdomains
- Robots policy settings
- Domain and subdomain creation and management
- Routing setup checklist
- Multi-domain patterns

## Key workflows and rules
1. **Campaign View (Short Links)**
   - Navigate to **Links** (`/links`) or **Overview** (`/overview`).
   - Select **Connect your domain**.
   - In the wizard, set a **Site name** and add a LinkShift **subdomain** or **custom domain**.
   - Create short links from **Links** → **Create link**.

2. **Advanced View (Full Routing Stack)**
   - Navigate to **Domain Groups** → **Add group**.
   - Then go to **Domains** → **Add domain** or **Subdomains** → **Add subdomain**.
   - Add redirect rules, link maps, and tests as needed.

3. **Domain Group Creation**
   - Use `POST /api/v1/domain-groups` with JSON body:
     ```json
     {
       "name": "Production",
       "robotsPolicy": "NONE",
       "customRobotsContent": null
     }
     ```

4. **Domain Creation**
   - Use `POST /api/v1/domains` with JSON body:
     ```json
     {
       "name": "links.example.com",
       "domainGroupId": "dmg_xxx"
     }
     ```

5. **Subdomain Creation**
   - Use `POST /api/v1/subdomains` with JSON body:
     ```json
     {
       "name": "campaign-2025",
       "domainGroupId": "dmg_xxx"
     }
     ```

## Limits and constraints
- **Domain Names**: Must be unique among active records.
- **Subdomain Names**: Must match `[a-z0-9-]` only, max 30 characters; reserved names are blocked.
- **Robots Policy**: Options include `NONE`, `ALLOW_ALL`, `DISALLOW_ALL`, `DISALLOW_BAD_BOTS`, and `CUSTOM` (max 4,096 chars).
- **Rate Limits**: Before redirect rules run, organization rate limits and access checks apply.
- **Redirect Rules**: The first rule that returns a target URL wins; a matching source alone is insufficient.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps guide](./link-maps.md)
- [Dashboard overview — Campaign and Advanced views](./dashboard/dashboard-overview.md#campaign-and-advanced-views)
- API endpoints:
  - `GET /api/v1/domain-groups`
  - `POST /api/v1/domain-groups`
  - `GET /api/v1/domains`
  - `POST /api/v1/domains`
  - `GET /api/v1/subdomains`
  - `POST /api/v1/subdomains`
  - `GET /api/v1/organization`
  - `GET /api/v1/organization/usage`
