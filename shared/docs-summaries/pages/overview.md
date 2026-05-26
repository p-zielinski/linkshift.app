---
source: shared/docs/pages/overview.md
generatedAt: 2026-05-26T21:11:51.957Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift platform and explains how to configure redirect routing, manage domains and link maps, and inspect API contracts.

## What this doc covers
- Overview of LinkShift capabilities
- Steps to create a redirect in 5 minutes
- Documentation map for related guides
- Common questions and troubleshooting matrix for live redirects

## Key workflows and rules
1. **Authenticate**: Use header `X-API-Key: <your_key>` for all API calls.
2. **Create Domain Group and Domain**:
   - `POST /api/v1/domain-groups` with body `{ "name": "Production", "robotsPolicy": "NONE" }`
   - `POST /api/v1/domains` with body `{ "name": "links.example.com", "domainGroupId": "dmg_xxx" }`
3. **Create Redirect Rule**:
   - `POST /api/v1/redirect-rules` with body:
     ```json
     {
       "domainGroupId": "dmg_xxx",
       "source": "/old-page",
       "destination": "https://example.com/new-page",
       "statusCode": 301,
       "queryMatch": "ignore"
     }
     ```
4. **Verify with Simulation**:
   - `POST /api/v1/redirect-rules/simulate` with body:
     ```json
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
   - Expected response: `matched: true`, `target: https://example.com/new-page`.

## Limits and constraints
- **Rate Limits**: Organization redirect rate limit is `redirectionLimitPerMinute`.
- **Field Limits**: Analytics custom ranges can be up to **31 days**.
- **Authentication**: All API calls require an API key in the header.
- **Redirect Behavior**: If no rule matches, a 404 error is returned. If a rule is blocked, it will not execute until unblocked.

## Related docs and API areas
- [What is LinkShift.app?](./intro/what-is-linkshift.md) - Overview of the platform
- [Getting started](./guides/getting-started.md) - API keys, auth, plans, errors
- [Redirect rules](./guides/redirect-rules.md) - Main routing guide
- [Domains and domain groups](./guides/domains-and-groups.md) - Domain management
- [Redirect tests](./guides/redirect-tests.md) - CI regression testing
- [API reference](./reference.md) - Endpoint index and routing cheat sheet
- OpenAPI pages (`/docs/api/:operationId`) - Schema trees and interactive API testing
