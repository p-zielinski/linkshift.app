---
source: shared/docs/pages/reference.md
generatedAt: 2026-06-03T17:01:01.268Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of LinkShift, explaining the API reference for routing and redirect rules.

## What this doc covers
- **API reference**: Overview of endpoint pages and interactive request execution.
- **Endpoint pages**: Accessing individual operations via `/docs/api/:operationId`.
- **Guides vs reference**: Differentiation between behavior explanations and contract definitions.
- **Routing cheat sheet**: Quick references for routing features and their corresponding guides.
- **Routing decision index**: Overview of routing goals and their requirements.
- **Engine limits (at a glance)**: Summary of validation and API query parameter limits.
- **List pagination defaults**: Default pagination settings for various resources.
- **Tags**: Categorization of API operations by functionality.
- **Key operations for routing**: List of key API operations with their methods and paths.

## Key workflows and rules
1. **Creating a Redirect Rule**:
   - Use `POST /api/v1/redirect-rules` to create a new redirect rule.
   - Specify `source`, `destination`, and other parameters in the request body.

2. **Simulating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules/simulate` to test redirect rules.
   - Include multiple entries in the request body for batch simulation.

3. **Getting Redirect Rule Analytics**:
   - Use `GET /api/v1/redirect-rules/analytics` to retrieve analytics for redirect rules.

4. **Creating a Link Map**:
   - Use `POST /api/v1/link-maps` to create a new link map.
   - Define the link map properties in the request body.

5. **Importing Link Map Entries**:
   - Use `POST /api/v1/link-map-entries/import` to import multiple link map entries.
   - Limit of 500 entries per request.

6. **Creating a Redirect Test**:
   - Use `POST /api/v1/redirect-tests` to create a new redirect test.

## Limits and constraints
- **Field Limits**:
  - `source` / `destination` length: 16,384 characters each.
  - Link map entry `key`: Max 1,024 characters.
  - Link map entry `destination`: Max 16,384 characters; must start with `http://` or `https://`.
  
- **Conditional Nesting**: Up to 32 levels.
- **Priority**: Values range from 0 to 1000 (higher values evaluated first).
- **Match Methods**: Up to 6 explicit values allowed; supports all 7 HTTP methods except `CONNECT` and `TRACE`.
- **Redirect Test Limits**:
  - `pathWithQuery`: Max 16,384 characters.
  - `target`: Max 4,096 characters.
  - List limit: 1-100 per page (default 100).
  
- **Analytics Limits**:
  - Maximum of 50 rules returned; `topLinkMapKeys` and `topRequestVariants` max 10 per rule.
  - Custom analytics range: Max 31 days between start and end.

- **Link Map Import**: Max 500 entries per `POST` request.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](./concepts/redirect-engine-concepts.md)
- **Link Maps Guide**: [Link maps guide](./guides/link-maps.md)
- **Routing Decision Flow**: [Routing decision flow](./concepts/redirect-engine-conditionals.md#routing-decision-flow-diagram)
- **Troubleshooting Matrix**: [Troubleshooting matrix](./overview-faq.md#troubleshooting-matrix-live-redirects)
- **OpenAPI Source**: `linkshift-api-keys.openapi.yaml` for detailed request and response schemas.
