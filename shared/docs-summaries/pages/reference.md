---
source: shared/docs/pages/reference.md
generatedAt: 2026-06-08T20:12:12.258Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of the LinkShift API, providing detailed reference information about API endpoints, parameters, and usage.

## What this doc covers
- **API reference**: Overview of endpoint pages and OpenAPI contract.
- **Guides vs reference**: Differentiation between guides and OpenAPI pages.
- **Routing cheat sheet**: Quick reference for routing features and rules.
- **Routing decision index**: Overview of routing goals and corresponding features.
- **Engine limits (at a glance)**: Summary of limits for various fields and operations.
- **List pagination defaults**: Default pagination settings for various resources.
- **Tags**: Description of tags related to API operations.
- **Key operations for routing**: List of key operations with their HTTP methods and paths.

## Key workflows and rules
1. **Creating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules` to create a new redirect rule.
   - Define `source`, `pathMatch`, `queryMatch`, and `destination` fields.
   
2. **Simulating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules/simulate` to test redirect rules.
   - Submit a list of rules to simulate their behavior.

3. **Getting Redirect Rule Analytics**:
   - Use `GET /api/v1/redirect-rules/analytics` to retrieve analytics for redirect rules.

4. **Creating Link Maps**:
   - Use `POST /api/v1/link-maps` to create a new link map.
   - Specify the `key` and `destination` fields.

5. **Importing Link Map Entries**:
   - Use `POST /api/v1/link-map-entries/import` to import multiple link map entries.
   - Limit of 500 entries per request.

6. **Creating Redirect Tests**:
   - Use `POST /api/v1/redirect-tests` to create a new redirect test.

## Limits and constraints
- **Field Limits**:
  - `source` and `destination` length: 16,384 characters each.
  - `priority`: Range from 0 to 1000.
  - `matchMethod`: Maximum of 6 explicit values; supports all 7 HTTP methods.
  - `linkMap entry key`: Maximum of 1,024 characters.
  - `linkMap entry destination`: Maximum of 16,384 characters; must be `http://` or `https://`.

- **Conditional Nesting**: Up to 32 levels.

- **Analytics Limits**:
  - Maximum of 50 rules returned; `topLinkMapKeys` and `topRequestVariants` max 10 per rule.
  - Custom analytics range: Maximum of 31 days between start and end.

- **Redirect Test Limits**:
  - `pathWithQuery`: Maximum of 16,384 characters.
  - `target`: Maximum of 4,096 characters.
  - List limit: 1-100 per page (default 100).

- **Link Map Import**: Maximum of 500 entries per `POST` request.

- **Edge Cache TTL**: Up to 5 minutes if invalidation fails.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](./concepts/redirect-engine-concepts.md)
- **Link Maps Guide**: [Link maps guide](./guides/link-maps.md)
- **Routing Decision Flow**: [Routing decision flow](./concepts/redirect-engine-conditionals.md#routing-decision-flow-diagram)
- **Troubleshooting Matrix**: [Troubleshooting matrix](./overview-faq.md#troubleshooting-matrix-live-redirects)
- **OpenAPI Contract**: Downloadable as `linkshift-api-keys.openapi.yaml`.
