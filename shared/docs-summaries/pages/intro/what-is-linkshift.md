---
source: shared/docs/pages/intro/what-is-linkshift.md
generatedAt: 2026-05-28T15:51:00.933Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and API integrators, explaining the capabilities and functionalities of LinkShift.app, a programmable redirect and link-mapping platform.

## What this doc covers
- **What is LinkShift.app?**
- **What you get**
- **How a redirect is decided**
- **Who this documentation is for**
- **Programmable routing in practice**
- **What LinkShift is not**
- **Next steps**

## Key workflows and rules
1. **Redirect Decision Process**:
   - Incoming request is evaluated.
   - Rate limit and access check are performed.
   - Rules are sorted by priority (highest first), then by `createdAt`, then by `id`.
   - The first rule that returns a redirect target is applied; if a link map misses without a fallback, it skips to the next rule.

2. **Static Redirect Example**:
   ```json
   {
     "source": "/old",
     "destination": "https://example.com/new",
     "statusCode": 301,
     "queryMatch": "ignore"
   }
   ```

3. **Conditional Redirect Example**:
   ```json
   {
     "source": "*",
     "destination": "'{user-agent:to_lower_case}' includes 'mobile' ? /m : /d",
     "queryMatch": "ignore",
     "priority": 10
   }
   ```

4. **Short Link Example**:
   ```json
   {
     "source": "/go",
     "pathMatch": "prefix",
     "queryMatch": "ignore",
     "linkMapId": "lmap_xxx",
     "destination": null
   }
   ```
   - Requesting `/go/summer` resolves to the key `summer` in the link map.

## Limits and constraints
- **Multi-Tenant Architecture**: API keys and redirect traffic are scoped to an organization.
- **Domain Groups**: Bundle domains, subdomains, and rules for isolation between production and staging.
- **Redirect Rules**: Supports path, query, regex, and wildcard matching with priorities and various HTTP status codes (`301`, `302`, `307`, `308`).
- **Dynamic Destinations**: Utilizes placeholders and modifiers, with a limit of 12 text/numeric modifiers.
- **Simulation Limit**: Up to 100 entries can be simulated using the `POST /redirect-rules/simulate` endpoint.

## Related docs and API areas
- **Getting Started**: [Getting started](../guides/getting-started.md)
- **Redirect Rules**: [Redirect rules guide](../guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- **API Reference**: [API reference](../reference.md) and OpenAPI pages under `/docs/api/…`
- **Link Maps**: [Link maps](../guides/link-maps.md) and [Link map entries](../guides/link-map-entries.md)
- **Redirect Tests**: [Redirect tests](../guides/redirect-tests.md) and simulation with `checkDestinationBlacklist`
- **Management API Contract**: OpenAPI at `/docs/reference` and `linkshift-api-keys.openapi.yaml` in the repository.
