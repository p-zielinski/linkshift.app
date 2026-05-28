---
source: shared/docs/pages/reference.md
generatedAt: 2026-05-28T15:51:37.037Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of LinkShift, explaining the API reference, including endpoint details, parameters, and workflows.

## What this doc covers
- **API reference**: Overview of endpoint pages and interactive request execution.
- **Endpoint pages**: Accessing operations via `/docs/reference` or `/docs/api/:operationId`.
- **Guides vs reference**: Differentiation between behavior guides and contract definitions in OpenAPI.
- **Routing cheat sheet**: Quick reference for routing topics and associated guides.
- **Routing decision index**: Overview of routing goals and corresponding features.
- **Engine limits (at a glance)**: Summary of various limits related to routing rules and link maps.
- **List pagination defaults**: Default pagination settings for various resources.
- **Tags**: Description of tags related to different API operations.
- **Key operations for routing**: Listing of important API operations with their methods and paths.

## Key workflows and rules
1. **Creating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules` to create a redirect rule.
   - Define `source`, `pathMatch`, `queryMatch`, and `destination`.
   
2. **Simulating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules/simulate` to test redirect rules.
   - Submit up to 100 entries per request.

3. **Importing Link Map Entries**:
   - Use `POST /api/v1/link-map-entries/import` to import entries.
   - Limit of 500 entries per request.

4. **Getting Redirect Rule Analytics**:
   - Use `GET /api/v1/redirect-rules/analytics` to retrieve analytics for redirect rules.

## Limits and constraints
- **Source/Destination Length**: Maximum of 16,384 characters each.
- **Conditional Nesting**: Up to 32 levels.
- **Priority**: Values range from 0 to 1000, with higher values evaluated first.
- **Match Method**: Supports all 7 HTTP methods; max 6 explicit values.
- **Redirect Test Limits**: 
  - `pathWithQuery`: Max 16,384 characters.
  - `target`: Max 4,096 characters.
  - List limit: 1–100 per page (default 100).
- **Link Map Entry Key**: Max 1,024 characters; destination max 16,384 characters.
- **Link Maps List**: No pagination; retrieves all maps in a group.
- **Edge Cache TTL**: Up to 5 minutes if invalidation fails.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](./concepts/redirect-engine-concepts.md)
- **Link Maps Guide**: [Link maps guide](./guides/link-maps.md)
- **Troubleshooting Matrix**: [Overview — troubleshooting matrix](./overview-faq.md#troubleshooting-matrix-live-redirects)
- **Key Operations**: 
  - `POST /api/v1/redirect-rules`
  - `POST /api/v1/link-maps`
  - `POST /api/v1/redirect-tests`
