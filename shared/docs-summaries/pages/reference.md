---
source: shared/docs/pages/reference.md
generatedAt: 2026-05-26T21:12:07.028Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of the LinkShift API, explaining the available endpoints, parameters, and workflows for managing redirects and link maps.

## What this doc covers
- **API reference**: Overview of endpoint pages and OpenAPI source.
- **Guides vs reference**: Differentiation between guides for behavior and OpenAPI pages for contracts.
- **Routing cheat sheet**: Quick reference for routing features and their corresponding guides.
- **Routing decision index**: Summary of routing goals and their configurations.
- **Engine limits (at a glance)**: Overview of various limits related to sources, destinations, and analytics.
- **List pagination defaults**: Default pagination settings for various resources.
- **Tags**: Description of tags related to different API functionalities.
- **Key operations for routing**: List of key operations with their HTTP methods and paths.

## Key workflows and rules
1. **Creating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules` to create a new redirect rule.
2. **Simulating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules/simulate` to test redirect rules.
3. **Getting Redirect Rule Analytics**:
   - Use `GET /api/v1/redirect-rules/analytics` to retrieve analytics for redirect rules.
4. **Creating Link Maps**:
   - Use `POST /api/v1/link-maps` to create a new link map.
5. **Importing Link Map Entries**:
   - Use `POST /api/v1/link-map-entries/import` to import multiple link map entries.
6. **Creating Redirect Tests**:
   - Use `POST /api/v1/redirect-tests` to create tests for redirects.

## Limits and constraints
- **Source/Destination Length**: Maximum of 16,384 characters each.
- **Conditional Nesting**: Up to 32 levels.
- **Priority**: Values range from 0 to 1000 (higher values evaluated first).
- **Match Method**: Supports all 7 HTTP methods; max 6 explicit values.
- **Analytics Limits**: Returns 1-50 rules; `topLinkMapKeys` and `topRequestVariants` max 10 per rule.
- **Redirect Test Limits**: 
  - `pathWithQuery`: Max 16,384 characters.
  - `target`: Max 4,096 characters.
  - List limit: 1-100 per page (default 100).
- **Link Map Entry Key**: Max 1,024 characters; destination max 16,384 characters (must be `http://` or `https://`).
- **Link Map Import**: Max 500 entries per request.
- **Edge Cache TTL**: Up to 5 minutes if invalidation fails.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](./concepts/redirect-engine-concepts.md)
- **Link Maps Guide**: [Link maps guide](./guides/link-maps.md)
- **Troubleshooting Matrix**: [Overview — troubleshooting matrix](./overview.md#troubleshooting-matrix-live-redirects)
- **OpenAPI Source**: `linkshift-api-keys.openapi.yaml` for detailed request/response schemas.
