---
source: shared/docs/pages/guides/domains-and-groups.md
generatedAt: 2026-05-26T21:09:51.005Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how to manage domains and domain groups for redirect logic.

## What this doc covers
- **Architecture**: Overview of domain groups and their components.
- **Domain groups**: API endpoints for managing domain groups.
- **Domains**: API endpoints for managing custom domains.
- **LinkShift subdomains**: API endpoints for managing hosted subdomains.
- **Organization**: API endpoints for retrieving organization metadata and usage.
- **Routing setup checklist**: Steps to configure routing effectively.
- **Multi-domain patterns**: Strategies for applying rules across multiple domains.

## Key workflows and rules
1. **Create Domain Group**:
   - Use `POST /api/v1/domain-groups` with JSON body:
     ```json
     {
       "name": "Production",
       "robotsPolicy": "NONE",
       "customRobotsContent": null
     }
     ```

2. **Create Domain**:
   - Use `POST /api/v1/domains` with JSON body:
     ```json
     {
       "name": "links.example.com",
       "domainGroupId": "dmg_xxx"
     }
     ```

3. **Create Subdomain**:
   - Use `POST /api/v1/subdomains` with JSON body:
     ```json
     {
       "name": "campaign-2025",
       "domainGroupId": "dmg_xxx"
     }
     ```

4. **Redirect Logic**:
   - The first redirect rule that returns a target URL wins.
   - Requests for `robots.txt` may bypass redirect rules but still count towards the rate limit.
   - If no rules produce a target, a `404` is returned.

5. **Simulate Routing**: Verify routing behavior before DNS cutover.

## Limits and constraints
- **Domain Names**: Must be unique among active records.
- **Robots Policy**: 
  - `customRobotsContent` max length is 4,096 characters.
- **Subdomain Names**: Must consist of `[a-z0-9-]`, max 30 characters, and cannot use reserved names (e.g., `support`, `docs`).
- **Rate Limits**: Redirect requests are subject to a rate limit per minute.
- **Plan Limits**: Domain and rule counts are validated upon creation.

## Related docs and API areas
- [Redirect rules](./redirect-rules.md)
- [Link maps](./link-maps.md)
- [Overview](../overview.md)
- `GET /api/v1/domain-groups`
- `GET /api/v1/domains`
- `GET /api/v1/subdomains`
- `GET /api/v1/organization`
- `GET /api/v1/organization/usage`
