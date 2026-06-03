---
source: shared/docs/pages/guides/domains-and-groups.md
generatedAt: 2026-06-03T16:58:45.038Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift who need to understand how to manage domains and domain groups, including redirect logic.

## What this doc covers
- Overview of domains and domain groups
- Dashboard navigation for managing domain groups and domains
- Architecture of domain groups and their components
- API endpoints for domain groups, domains, and subdomains
- Robots policy and its configurations
- Domain placeholders in redirect rules
- Handling unknown or unregistered subdomain hostnames
- Organization metadata and usage summary
- Routing setup checklist
- Multi-domain patterns and strategies

## Key workflows and rules
1. **Creating a Domain Group**:
   - Use `POST /api/v1/domain-groups` with JSON body:
     ```json
     {
       "name": "Production",
       "robotsPolicy": "NONE",
       "customRobotsContent": null
     }
     ```

2. **Managing Domains**:
   - Create a domain: `POST /api/v1/domains` with JSON body:
     ```json
     {
       "name": "links.example.com",
       "domainGroupId": "dmg_xxx"
     }
     ```
   - Update a domain: `PUT /api/v1/domains/:id`
   - Delete a domain: `DELETE /api/v1/domains/:id`

3. **Redirect Rule Execution**:
   - The first redirect rule that returns a target URL wins.
   - If no rule produces a target, a `404` is returned.
   - Requests to `GET /robots.txt` may serve from the domain group policy.

4. **Handling Subdomains**:
   - Create a subdomain: `POST /api/v1/subdomains` with JSON body:
     ```json
     {
       "name": "campaign-2025",
       "domainGroupId": "dmg_xxx"
     }
     ```
   - If a request hits an unregistered subdomain, it responds with `302 Found`.

5. **Routing Setup Checklist**:
   - Create domain group
   - Add domain or subdomain
   - Create redirect rules
   - Optionally create link maps
   - Simulate routing
   - Add redirect tests

## Limits and constraints
- **Domain Names**: Must be unique among active records.
- **Subdomain Names**: Limited to `[a-z0-9-]`, max 30 characters, with reserved names blocked (e.g., `support`, `docs`).
- **Robots Policy**: 
  - `NONE`: No `robots.txt` served.
  - `ALLOW_ALL`: Allow all crawlers.
  - `DISALLOW_ALL`: Disallow all crawlers.
  - `DISALLOW_BAD_BOTS`: Block known bad bots.
  - `CUSTOM`: Use custom content (max 4,096 characters).
- **Rate Limits**: Organization redirect rate limits apply before redirect rules.
- **Plan Limits**: Must be validated on create, especially for domains and rules.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps guide](./link-maps.md)
- [Dashboard overview](./dashboard/dashboard-overview.md#dashboard-home)
- [Redirect rules operations](../guides/redirect-rules-operations.md#simulate-before-rollout)
- [Redirect engine concepts — domain variables](../concepts/redirect-engine-variables.md#domain-variables)
