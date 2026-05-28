---
source: shared/docs/pages/guides/domains-and-groups.md
generatedAt: 2026-05-28T15:49:05.495Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how to manage domains and domain groups for redirect logic.

## What this doc covers
- **Architecture**: Overview of organization structure and redirect logic.
- **Domain groups**: API endpoints for managing domain groups.
- **Domains**: API endpoints for managing custom domains.
- **LinkShift subdomains**: API endpoints for managing hosted subdomains.
- **Organization**: API endpoints for retrieving organization metadata and usage.
- **Routing setup checklist**: Steps for setting up routing.
- **Multi-domain patterns**: Strategies for applying rules across multiple domains.

## Key workflows and rules
1. **Create Domain Group**:
   - Endpoint: `POST /api/v1/domain-groups`
   - Payload: 
     ```json
     {
       "name": "Production",
       "robotsPolicy": "NONE",
       "customRobotsContent": null
     }
     ```

2. **Create Domain**:
   - Endpoint: `POST /api/v1/domains`
   - Payload:
     ```json
     {
       "name": "links.example.com",
       "domainGroupId": "dmg_xxx"
     }
     ```

3. **Create Subdomain**:
   - Endpoint: `POST /api/v1/subdomains`
   - Payload:
     ```json
     {
       "name": "campaign-2025",
       "domainGroupId": "dmg_xxx"
     }
     ```

4. **Redirect Logic**:
   - First redirect rule that returns a target URL wins.
   - Requests to `robots.txt` may bypass redirect rules but count towards rate limits.

5. **Domain Placeholders**: Use placeholders like `{domain.fqdn}`, `{domain.extension}`, and `{domain.root}` in redirect rules.

## Limits and constraints
- **Domain Names**: Must be unique among active records.
- **Subdomain Names**: Limited to `[a-z0-9-]`, max 30 characters; reserved names are blocked.
- **Robots Policy**: Options include `NONE`, `ALLOW_ALL`, `DISALLOW_ALL`, `DISALLOW_BAD_BOTS`, and `CUSTOM` (max 4,096 characters).
- **Rate Limits**: Redirect requests are subject to a rate limit per minute.

## Related docs and API areas
- [Redirect rules](./redirect-rules.md)
- [Link maps](./link-maps.md)
- [Redirect rules — how routing works](./redirect-rules-core.md#how-routing-works)
- [Redirect engine concepts — domain variables](../concepts/redirect-engine-variables.md#domain-variables)
- [Overview — traffic to linkshift.app but rules never run](../overview.md)
