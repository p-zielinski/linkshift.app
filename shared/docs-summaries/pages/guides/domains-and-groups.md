---
source: shared/docs/pages/guides/domains-and-groups.md
generatedAt: 2026-05-30T07:01:05.519Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift who need to understand how to manage domains and domain groups, including their associated redirect rules.

## What this doc covers
- Overview of domains and domain groups
- Dashboard navigation for managing domain groups and domains
- Architecture of domain groups and their components
- API endpoints for managing domain groups, domains, and subdomains
- Robots policy settings for domain groups
- Domain placeholders in redirect rules
- Behavior of LinkShift subdomains
- Organization metadata and usage summary retrieval
- Routing setup checklist
- Multi-domain patterns for rule application

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
   - Create a domain using `POST /api/v1/domains` with JSON body:
     ```json
     {
       "name": "links.example.com",
       "domainGroupId": "dmg_xxx"
     }
     ```
   - Update a domain with `PUT /api/v1/domains/:id`.
   - Delete a domain with `DELETE /api/v1/domains/:id`.

3. **Managing Subdomains**:
   - Create a subdomain using `POST /api/v1/subdomains` with JSON body:
     ```json
     {
       "name": "campaign-2025",
       "domainGroupId": "dmg_xxx"
     }
     ```

4. **Redirect Rule Evaluation**:
   - The first redirect rule that returns a target URL wins.
   - Requests for `robots.txt` are served from the domain group policy before redirect rules are applied.
   - If no rules produce a target URL, a `404` is returned.

5. **Simulating Redirects**:
   - Use the simulation feature to verify routing before DNS cutover.

## Limits and constraints
- **Domain Names**: Must be unique among active records.
- **Subdomain Names**: Limited to `[a-z0-9-]`, max 30 characters; reserved names are blocked.
- **Robots Policy**: 
  - `NONE`: No `robots.txt` served.
  - `ALLOW_ALL`: Allow all crawlers.
  - `DISALLOW_ALL`: Disallow all crawlers.
  - `DISALLOW_BAD_BOTS`: Block known bad bots.
  - `CUSTOM`: Use custom content (max 4,096 characters).
- **Rate Limits**: Redirect requests are subject to an organization redirect rate limit.
- **Plan Limits**: Domain counts, rule counts, and link map entries are validated on creation.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Link maps guide](./link-maps.md)
- [Dashboard overview](./dashboard/dashboard-overview.md#dashboard-home-dashboard)
- [Redirect rules — how routing works](./redirect-rules-core.md#how-routing-works)
- [Redirect engine concepts — domain variables](../concepts/redirect-engine-variables.md#domain-variables)
- [Simulate before rollout](../guides/redirect-rules-operations.md#simulate-before-rollout)
