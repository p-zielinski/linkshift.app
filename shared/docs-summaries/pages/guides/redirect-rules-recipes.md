---
source: shared/docs/pages/guides/redirect-rules-recipes.md
generatedAt: 2026-05-30T07:03:00.386Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing redirect rules in LinkShift and provides recipes, anti-patterns, and related API endpoints.

## What this doc covers
- **How-To cookbook**
  - Creating short links
  - Handling trailing slashes in `source`
  - Redirecting only GET requests
  - Running A/B tests
  - Routing by User-Agent
  - Routing by browser language
  - Routing by date or time
  - Handling link map key misses
  - Migrating blogs with regex
  - Stripping `www` to the apex domain
- **Recipe book — common scenarios**
  - Migrating blog posts with regex
  - Stripping www to apex
  - Same-host path redirect
  - Campaign short links at scale
  - A/B test landing page
  - Routing by User-Agent (Chrome detection)
  - Scheduled launch
  - Preserving query params in redirect
- **Anti-patterns**
  - Common mistakes and better approaches
- **API endpoints**
  - List, get, create, update, delete redirect rules
  - Traffic analytics and simulation

## Key workflows and rules
1. **Creating Short Links**
   - Create a link map with entries.
   - Create a redirect rule with `source`, `pathMatch`, `queryMatch`, `linkMapId`, and `destination`.
   - Verify using the simulate endpoint.

2. **Handling Trailing Slashes**
   - Be aware of asymmetric matching with trailing slashes in `source`.

3. **Redirecting Only GET Requests**
   - Set `matchMethod: ["GET"]` on the rule.

4. **Running A/B Tests**
   - Use a ternary with `random()` in `destination`.

5. **Routing by User-Agent**
   - Use `~=` or `includes` in a ternary for user-agent detection.

6. **Routing by Browser Language**
   - Use `{accept-language.primary}` in a ternary.

7. **Routing by Date or Time**
   - Use `time()` and `datetime()` in conditions.

8. **Handling Link Map Key Misses**
   - If a key is not found, the rule does not redirect; the engine tries the next rule.

9. **Migrating Blogs with Regex**
   - Use regex in `source` for URL transformations.

10. **Stripping `www` to Apex Domain**
    - Use regex to redirect to the apex domain.

## Limits and constraints
- **API Rate Limits**: Not specified in the source.
- **Field Limits**: 
  - `limit` query parameter can be between 1–100 (default 20).
- **Auth Requirements**: Not specified in the source.
- **Gotchas**:
  - Trailing slashes in `source` can lead to unexpected matches.
  - Wildcard `source` cannot be used with `linkMapId`.
  - Regex `source` must not include the `g` flag.

## Related docs and API areas
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md) — for placeholders, modifiers, and limits.
- [Link maps](./link-maps.md) — for creating and managing keyed destination tables.
- [Link map entries](./link-map-entries.md) — for bulk import and entry management.
- [Redirect tests](./redirect-tests.md) — for CI regression testing.
- [Domains and domain groups](./domains-and-groups.md) — for understanding where rules attach.
- **API Endpoints**:
  - `GET /api/v1/redirect-rules`
  - `GET /api/v1/redirect-rules/:id`
  - `POST /api/v1/redirect-rules`
  - `PUT /api/v1/redirect-rules/:id`
  - `DELETE /api/v1/redirect-rules/:id`
  - `GET /api/v1/redirect-rules/analytics`
  - `POST /api/v1/redirect-rules/simulate`
