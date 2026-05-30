---
source: shared/docs/pages/reference.md
generatedAt: 2026-05-30T07:04:05.234Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of the LinkShift API, providing detailed reference information about API endpoints, parameters, and workflows.

## What this doc covers
- **API Reference**: Overview of endpoint pages and their structure.
- **Guides vs Reference**: Differentiation between guides for behavior and OpenAPI pages for contracts.
- **Routing Cheat Sheet**: Quick reference for routing features and their corresponding guides.
- **Routing Decision Index**: A decision-making flow for selecting routing features.
- **Engine Limits**: Overview of limits related to routing rules and analytics.
- **List Pagination Defaults**: Default pagination settings for various resources.
- **Tags**: Description of tags related to different API operations.
- **Key Operations for Routing**: List of key operations with their HTTP methods and paths.

## Key workflows and rules
1. **Creating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules` to create a new redirect rule.
   - Define `source`, `pathMatch`, and `destination` fields according to the routing decision index.

2. **Simulating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules/simulate` to test redirect rules.
   - Input a maximum of 100 entries per request.

3. **Analytics for Redirect Rules**:
   - Retrieve analytics using `GET /api/v1/redirect-rules/analytics`.

4. **Creating Link Maps**:
   - Use `POST /api/v1/link-maps` to create a new link map.

5. **Importing Link Map Entries**:
   - Use `POST /api/v1/link-map-entries/import` to import up to 500 entries in a single request.

6. **Creating Redirect Tests**:
   - Use `POST /api/v1/redirect-tests` to create a new redirect test.

## Limits and constraints
- **Field Limits**:
  - `source` and `destination` lengths: 16,384 characters each.
  - Conditional nesting: Up to 32 levels.
  - `priority`: Range from 0 to 1000 (higher values evaluated first).
  - `matchMethod`: Up to 6 explicit values; includes all 7 methods except `CONNECT` and `TRACE`.

- **Analytics Limits**:
  - Maximum of 50 rules returned in analytics queries.
  - Custom date ranges for analytics must not exceed 31 days.

- **Redirect Test Limits**:
  - `pathWithQuery`: Maximum 16,384 characters.
  - `target`: Maximum 4,096 characters.
  - Redirect test list limit: 1-100 per page (default 100).

- **Link Map Entry Limits**:
  - Entry `key`: Maximum 1,024 characters.
  - Entry `destination`: Maximum 16,384 characters; must start with `http://` or `https://`.

- **Propagation and Caching**: Redirect rules may have a brief caching period of up to 5 minutes if invalidation fails.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](./concepts/redirect-engine-concepts.md)
- **Link Maps Guide**: [Link maps guide](./guides/link-maps.md)
- **FAQ Index**: [FAQ index](./guides/faq.md)
- **Troubleshooting Matrix**: [Troubleshooting matrix](./overview-faq.md#troubleshooting-matrix-live-redirects)
- **Routing Decision Flow Diagram**: [Routing decision flow](./concepts/redirect-engine-conditionals.md#routing-decision-flow-diagram)
