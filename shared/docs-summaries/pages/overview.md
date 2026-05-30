---
source: shared/docs/pages/overview.md
generatedAt: 2026-05-30T07:03:47.003Z
model: gpt-4o-mini
---

## Purpose
This documentation is for users of the LinkShift platform, explaining how to configure redirect routing, manage domains and link maps, and inspect API contracts.

## What this doc covers
- Overview of LinkShift capabilities
- Tutorial for creating your first redirect
- Documentation map for navigating additional resources
- Common questions and troubleshooting

## Key workflows and rules
### Dashboard Workflow
1. Sign in and access the dashboard.
2. Create a **domain group**.
3. Add a **domain** or subdomain to the group.
4. Create a **redirect rule** for a specific path to a new URL.
5. Validate the redirect using testing features.

### API Automation Workflow
1. Authenticate using `X-API-Key: <your_key>`.
2. Create a domain group:
   ```json
   POST /api/v1/domain-groups
   { "name": "Production", "robotsPolicy": "NONE" }
   ```
3. Create a domain:
   ```json
   POST /api/v1/domains
   { "name": "links.example.com", "domainGroupId": "dmg_xxx" }
   ```
4. Create a redirect rule:
   ```json
   POST /api/v1/redirect-rules
   {
     "domainGroupId": "dmg_xxx",
     "source": "/old-page",
     "destination": "https://example.com/new-page",
     "statusCode": 301,
     "queryMatch": "ignore"
   }
   ```
5. Verify the redirect with simulation:
   ```json
   POST /api/v1/redirect-rules/simulate
   {
     "entries": [
       {
         "domainGroupId": "dmg_xxx",
         "path": "/old-page",
         "hostname": "links.example.com"
       }
     ]
   }
   ```
   Expected response: `matched: true`, `target: https://example.com/new-page`.

## Limits and constraints
- All API calls require authentication via the header `X-API-Key`.
- The tutorial emphasizes the need to point DNS at LinkShift for live traffic after configuration.

## Related docs and API areas
- [What is LinkShift.app?](./intro/what-is-linkshift.md) - Overview of the platform and capabilities.
- [Getting started](./guides/getting-started.md) - Information on API keys, authentication, and error handling.
- [Redirect rules](./guides/redirect-rules.md) - Main guide for routing, including matching and link maps.
- [FAQ and troubleshooting](./guides/faq.md) - Common questions and troubleshooting tips.
- [API reference](./reference.md) - Endpoint index and routing cheat sheet.
