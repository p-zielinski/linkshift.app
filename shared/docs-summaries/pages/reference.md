---
source: shared/docs/pages/reference.md
generatedAt: 2026-06-07T10:08:28.527Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of LinkShift, providing detailed API reference information about endpoints, parameters, and workflows.

## What this doc covers
- **API reference**: Overview of dedicated pages for each endpoint with parameters, security requirements, and request/response schemas.
- **Endpoint pages**: Access individual operations at `/docs/api/:operationId` and download the OpenAPI contract as `linkshift-api-keys.openapi.yaml`.
- **Guides vs reference**: Differentiation between behavior explanations in guides and contract definitions in OpenAPI pages.
- **Routing cheat sheet**: Quick reference for routing topics, including matching, recipes, and analytics.
- **Routing decision index**: Overview of routing goals and corresponding features.
- **Engine limits (at a glance)**: Summary of validation limits and API query parameters.
- **List pagination defaults**: Default pagination settings for various resources.
- **Tags**: Description of tags related to domain groups, domains, subdomains, redirect rules, link maps, and organization.

## Key workflows and rules
1. **Creating a Redirect Rule**:
   - Use `POST /api/v1/redirect-rules` to create a new redirect rule.
   - Define `source`, `destination`, and other parameters as required.

2. **Simulating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules/simulate` to test redirect rules.
   - Provide a list of entries to simulate.

3. **Getting Redirect Rule Analytics**:
   - Use `GET /api/v1/redirect-rules/analytics` to retrieve analytics data for redirect rules.

4. **Creating a Link Map**:
   - Use `POST /api/v1/link-maps` to create a new link map.

5. **Importing Link Map Entries**:
   - Use `POST /api/v1/link-map-entries/import` to import multiple link map entries (max 500 per request).

6. **Creating a Redirect Test**:
   - Use `POST /api/v1/redirect-tests` to create a new redirect test.

## Limits and constraints
- **Source/Destination Length**: Maximum of 16,384 characters each.
- **Conditional Nesting**: Up to 32 levels.
- **Priority**: Values range from 0 to 1000 (higher values are evaluated first).
- **Match Method**: Supports all 7 HTTP methods; max 6 explicit values.
- **Redirect Test Limits**: 
  - `pathWithQuery`: Max 16,384 characters.
  - `target`: Max 4,096 characters.
  - List limit: 1-100 per page (default 100).
- **Link Map Entry Key**: Max 1,024 characters.
- **Link Map Entry Destination**: Max 16,384 characters; must start with `http://` or `https://`.
- **Link Maps List**: No pagination; retrieves all maps in a group.
- **Edge Cache TTL**: Up to 5 minutes if invalidation fails.
- **Analytics Limits**: 
  - 1-50 rules returned.
  - `topLinkMapKeys` / `topRequestVariants` max 10 per rule.
- **Analytics Custom Range**: Max 31 days between start and end.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](./concepts/redirect-engine-concepts.md)
- **Link Maps Guide**: [Link maps guide](./guides/link-maps.md)
- **FAQ Index**: [FAQ index](./guides/faq.md)
- **Troubleshooting Matrix**: [Troubleshooting matrix](./overview-faq.md#troubleshooting-matrix-live-redirects)
- **Routing Decision Flow Diagram**: [Routing decision flow](./concepts/redirect-engine-conditionals.md#routing-decision-flow-diagram)
