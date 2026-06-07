---
source: shared/docs/pages/guides/redirect-rules-recipes.md
generatedAt: 2026-06-07T10:07:47.636Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers looking to implement and troubleshoot redirect rules in LinkShift, providing recipes and anti-patterns for effective routing.

## What this doc covers
- **How-To cookbook**: Quick answers to common routing questions.
- **Recipe book**: Common scenarios for implementing redirects.
- **Anti-patterns**: Common mistakes and better approaches.
- **API endpoints**: Details on available API methods for managing redirect rules.

## Key workflows and rules
1. **Creating Short Links**:
   - Create a link map with entries (`key` → `https://…` URL).
   - Create a redirect rule with:
     - `source: "/go"`
     - `pathMatch: "prefix"`
     - `queryMatch: "ignore"`
     - `linkMapId`
     - `destination: null`
   - Verify with a simulation.

2. **Redirecting Only GET Requests**:
   - Set `matchMethod: ["GET"]` on the rule.

3. **Running A/B Tests**:
   - Use a ternary with `random()` in `destination`:
     ```json
     {
       "source": "/landing",
       "destination": "random(0,100) < 50 ? https://example.com/a : https://example.com/b",
       "queryMatch": "ignore"
     }
     ```

4. **Routing by User-Agent**:
   - Use `~=` or `includes` in a ternary:
     ```json
     {
       "source": "*",
       "destination": "'{user-agent:to_lower_case}' includes 'iphone' ? /mobile : /desktop",
       "queryMatch": "ignore",
       "priority": 20
     }
     ```

5. **Routing by Browser Language**:
   - Use `{accept-language.primary}` in a ternary:
     ```json
     {
       "source": "*",
       "destination": "'{accept-language.primary:to_lower_case}' includes 'pl' ? /pl : /en",
       "queryMatch": "ignore",
       "priority": 20
     }
     ```

6. **Routing by Date or Time**:
   - Use `time()` and `datetime()` in the condition:
     ```json
     {
       "source": "/sale",
       "destination": "time() >= datetime('2025-12-01') ? https://example.com/live : https://example.com/soon"
     }
     ```

7. **Handling Missing Link Map Keys**:
   - If a key is not found, the rule does not redirect. Options include adding an entry, setting a fallback destination, or adding a lower-priority rule.

8. **Migrating Blogs with Regex**:
   - Use regex in `source`:
     ```json
     {
       "source": "/^\\/blog\\/(.+)$/",
       "destination": "https://new.example.com/posts/$1",
       "statusCode": 301,
       "queryMatch": "ignore"
     }
     ```

## Limits and constraints
- **API Limits**:
  - `limit` for listing rules: 1–100 (default 20).
  - `domainGroupId` is required for API calls.
- **Redirect Rule Constraints**:
  - `source` cannot be `*` when using `linkMapId`.
  - Trailing slashes in `source` can lead to asymmetric matching.
  - Regex `source` must not use the `g` flag.
  - Empty ternary branches can lead to unexpected behavior.

## Related docs and API areas
- **API Endpoints**:
  - `GET /api/v1/redirect-rules`: List rules.
  - `GET /api/v1/redirect-rules/:id`: Get one rule.
  - `POST /api/v1/redirect-rules`: Create rule.
  - `PUT /api/v1/redirect-rules/:id`: Update rule.
  - `DELETE /api/v1/redirect-rules/:id`: Soft-delete rule.
  - `GET /api/v1/redirect-rules/analytics`: Traffic analytics.
  - `POST /api/v1/redirect-rules/simulate`: Batch simulation.

- **Related Guides**:
  - [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
  - [Link maps](./link-maps.md)
  - [Link map entries](./link-map-entries.md)
  - [Redirect tests](./redirect-tests.md)
  - [Domains and domain groups](./domains-and-groups.md)
