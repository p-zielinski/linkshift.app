---
source: shared/docs/pages/guides/redirect-rules-recipes.md
generatedAt: 2026-05-28T15:50:25.578Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to implement and manage redirect rules in LinkShift, providing recipes, anti-patterns, and API endpoints.

## What this doc covers
- **How-To cookbook**: Quick answers to common routing questions.
- **Recipe book**: Common scenarios for redirect rules.
- **Anti-patterns**: Common mistakes and better approaches.
- **API endpoints**: Details on available API methods for managing redirect rules.

## Key workflows and rules
1. **Creating Short Links**:
   - Create a link map with entries.
   - Define a redirect rule with `source`, `pathMatch`, `queryMatch`, `linkMapId`, and `destination`.
   - Verify using the simulate endpoint.

2. **Redirecting Only GET Requests**:
   - Set `matchMethod: ["GET"]` on the rule.

3. **Running A/B Tests**:
   - Use a ternary with `random()` in the `destination`.

4. **Routing by User-Agent**:
   - Use `~=` or `includes` in a ternary for User-Agent detection.

5. **Routing by Browser Language**:
   - Use `{accept-language.primary}` with modifiers in a ternary.

6. **Routing by Date or Time**:
   - Use `time()` and `datetime()` in the condition.

7. **Handling Link Map Misses**:
   - If a key is not found, the rule does not redirect; the engine tries the next rule.

8. **Migrating Blogs with Regex**:
   - Use regex in the `source` to match and redirect.

9. **Stripping `www` to Apex Domain**:
   - Use regex to redirect from `www` to the apex domain.

## Limits and constraints
- **API Limits**:
  - `limit` for listing rules: 1–100 (default 20).
- **Field Requirements**:
  - `domainGroupId` is required for API calls.
  - `destination` must start with `http://`, `https://`, or `/`.
- **Regex Constraints**:
  - `$N` placeholders only work with regex `source`.
- **Query Matching**:
  - Wildcards ignore `pathMatch` and `queryMatch`.

## Related docs and API areas
- **API Endpoints**:
  - `GET /api/v1/redirect-rules`: List rules.
  - `GET /api/v1/redirect-rules/:id`: Get a specific rule.
  - `POST /api/v1/redirect-rules`: Create a new rule.
  - `PUT /api/v1/redirect-rules/:id`: Update an existing rule.
  - `DELETE /api/v1/redirect-rules/:id`: Soft-delete a rule.
  - `GET /api/v1/redirect-rules/analytics`: Get traffic analytics.
  - `POST /api/v1/redirect-rules/simulate`: Batch simulation of rules.

- **Related Guides**:
  - [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
  - [Link maps](./link-maps.md)
  - [Link map entries](./link-map-entries.md)
  - [Redirect tests](./redirect-tests.md)
  - [Domains and domain groups](./domains-and-groups.md)
