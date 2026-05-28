---
source: shared/docs/pages/overview.md
generatedAt: 2026-05-28T15:51:22.011Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift platform, explaining how to configure redirect routing, manage domains and link maps, and inspect API contracts.

## What this doc covers
- Overview of LinkShift capabilities
- Steps to create a redirect in 5 minutes
- Authentication requirements for API calls
- Documentation map for further reading
- Common questions and troubleshooting resources

## Key workflows and rules
1. **Authenticate**: Use the header `X-API-Key: <your_key>` for all API calls.
2. **Create a Domain Group**:
   - Endpoint: `POST /api/v1/domain-groups`
   - Request Body: `{ "name": "Production", "robotsPolicy": "NONE" }`
3. **Create a Domain**:
   - Endpoint: `POST /api/v1/domains`
   - Request Body: `{ "name": "links.example.com", "domainGroupId": "dmg_xxx" }`
4. **Create a Redirect Rule**:
   - Endpoint: `POST /api/v1/redirect-rules`
   - Request Body: 
     ```json
     {
       "domainGroupId": "dmg_xxx",
       "source": "/old-page",
       "destination": "https://example.com/new-page",
       "statusCode": 301,
       "queryMatch": "ignore"
     }
     ```
5. **Verify Redirect with Simulation**:
   - Endpoint: `POST /api/v1/redirect-rules/simulate`
   - Request Body: 
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
   - Expected Response: `matched: true`, `target: https://example.com/new-page`.

## Limits and constraints
- All API calls require the `X-API-Key` for authentication.
- The `robotsPolicy` field in domain group creation accepts values like "NONE".
- Redirect rules must specify a valid `domainGroupId`, `source`, `destination`, and `statusCode`.

## Related docs and API areas
- [What is LinkShift.app?](./intro/what-is-linkshift.md) - Overview of platform purpose and capabilities.
- [Getting started](./guides/getting-started.md) - Information on API keys, authentication, and error handling.
- [Redirect rules](./guides/redirect-rules.md) - Main guide for routing, including matching and link maps.
- [Overview FAQ](./overview-faq.md) - Common questions and troubleshooting.
- [API reference](./reference.md) - Endpoint index and routing cheat sheet.
