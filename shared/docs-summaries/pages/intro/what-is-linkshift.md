---
source: shared/docs/pages/intro/what-is-linkshift.md
generatedAt: 2026-05-26T21:11:34.442Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and API integrators, explaining the features and functionalities of LinkShift.app, a programmable redirect and link-mapping platform.

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
   - Incoming request is checked against rate limits and access permissions.
   - Redirect rules are sorted by priority (highest first), then by `createdAt`, and finally by `id`.
   - The first rule that returns a redirect target is applied; if a link map misses without a fallback, the next rule is evaluated.

2. **Examples of Redirects**:
   - **Static Redirect**:
     ```json
     {
       "source": "/old",
       "destination": "https://example.com/new",
       "statusCode": 301,
       "queryMatch": "ignore"
     }
     ```
   - **Conditional Redirect**:
     ```json
     {
       "source": "*",
       "destination": "'{user-agent:to_lower_case}' includes 'mobile' ? /m : /d",
       "queryMatch": "ignore",
       "priority": 10
     }
     ```
   - **Short Link**:
     ```json
     {
       "source": "/go",
       "pathMatch": "prefix",
       "queryMatch": "ignore",
       "linkMapId": "lmap_xxx",
       "destination": null
     }
     ```

## Limits and constraints
- **Multi-Tenant Architecture**: API keys and redirect traffic are scoped to an organization.
- **Redirect Rules**: Up to 100 entries can be simulated using `POST /redirect-rules/simulate`.
- **Safety Features**: Includes destination scanning on write and ongoing automated monitoring.

## Related docs and API areas
- **Getting Started**: [Getting started](../guides/getting-started.md)
- **Redirect Rules**: [Redirect rules](../guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- **Link Maps**: [Link maps](../guides/link-maps.md)
- **Redirect Tests**: [Redirect tests](../guides/redirect-tests.md)
- **API Reference**: [API reference](../reference.md) and OpenAPI pages under `/docs/api/…`
- **Management API Contract**: OpenAPI at `/docs/reference` and `linkshift-api-keys.openapi.yaml` in the repository.
