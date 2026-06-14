---
source: shared/docs/pages/reference.md
generatedAt: 2026-06-14T15:25:22.502Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and technical users who need detailed information about the LinkShift API endpoints, including parameters, security requirements, and request/response schemas.

## What this doc covers
- **API Reference**: Overview of endpoint pages and OpenAPI contract.
- **Guides vs Reference**: Differentiation between guides that explain behavior and OpenAPI pages that define contracts.
- **Routing Cheat Sheet**: Quick reference for routing topics and links to detailed guides.
- **Routing Decision Index**: Overview of routing goals and corresponding features.
- **Engine Limits**: Summary of hard caps for validation and API query parameters.
- **List Pagination Defaults**: Default pagination settings for various resources.
- **Tags**: Description of tags related to different API areas.
- **Key Operations for Routing**: List of key operations with their HTTP methods and paths.

## Key workflows and rules
1. **Creating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules` to create a new redirect rule.
   - Specify `source`, `pathMatch`, `destination`, and optional fields like `priority` and `matchMethod`.

2. **Simulating Redirect Rules**:
   - Use `POST /api/v1/redirect-rules/simulate` to test redirect rules before applying them.

3. **Getting Redirect Rule Analytics**:
   - Use `GET /api/v1/redirect-rules/analytics` to retrieve analytics for existing redirect rules.

4. **Creating Link Maps**:
   - Use `POST /api/v1/link-maps` to create a new link map.

5. **Importing Link Map Entries**:
   - Use `POST /api/v1/link-map-entries/import` to import multiple link map entries (up to 500 per request).

6. **Creating Redirect Tests**:
   - Use `POST /api/v1/redirect-tests` to create a test fixture for redirect rules.

## Limits and constraints
- **Field Limits**:
  - `source` / `destination` length: 16,384 characters each.
  - Conditional nesting: 32 levels.
  - `priority`: 0–1000 (higher values evaluated first).
  - `matchMethod`: Up to 6 explicit values; includes all 7 HTTP methods.
  - `linkMapEntry key`: Max 1,024 characters.
  - `linkMapEntry destination`: Max 16,384 characters; must start with `http://` or `https://`.

- **Analytics Limits**:
  - Maximum of 50 rules returned; `topLinkMapKeys` / `topRequestVariants` max 10 per rule.
  - Custom analytics range: Both `start` and `end` required, max 31 days apart.

- **Redirect Test Limits**:
  - `pathWithQuery`: Max 16,384 characters.
  - `target`: Max 4,096 characters.
  - List limit: 1–100 per page (default 100).

- **Link Map Import Limits**:
  - Max 500 entries per `POST` request.

- **Edge Cache TTL**: Up to 5 minutes if invalidation fails.

## Related docs and API areas
- **Redirect Rules Guide**: [Redirect rules guide](./guides/redirect-rules.md)
- **Redirect Engine Concepts**: [Redirect engine concepts](./concepts/redirect-engine-concepts.md)
- **Link Maps Guide**: [Link maps guide](./guides/link-maps.md)
- **FAQ Index**: [FAQ index](./guides/faq.md)
- **Troubleshooting Matrix**: [Troubleshooting matrix](./overview-faq.md#troubleshooting-matrix-live-redirects)
- **OpenAPI Contract**: Downloadable as `linkshift-api-keys.openapi.yaml` from the docs site.
