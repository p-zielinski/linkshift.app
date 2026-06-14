---
source: shared/docs/pages/guides/redirect-rules-recipes.md
generatedAt: 2026-06-14T15:25:10.592Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers looking to implement and manage redirect rules in LinkShift, providing recipes, anti-patterns, and related API endpoints.

## What this doc covers
- **How-To cookbook**: Quick answers to common routing questions.
- **Recipe book**: Common scenarios for redirect rules.
- **Anti-patterns**: Common mistakes and better approaches.
- **API endpoints**: Details on available API methods for managing redirect rules.

## Key workflows and rules
1. **Creating Short Links**:
   - Create a link map with entries (`key` → `https://…` URL).
   - Create a redirect rule with `source: "/go"`, `pathMatch: "prefix"`, `queryMatch: "ignore"`, `linkMapId`, `destination: null`.
   - Verify with a simulation.

2. **Redirecting Only GET Requests**:
   - Set `matchMethod: ["GET"]` on the rule.

3. **Running A/B Tests**:
   - Use a ternary with `random()` in `destination` to randomly route traffic.

4. **Routing by User-Agent**:
   - Use `~=` or `includes` in a ternary to check the `{user-agent}`.

5. **Routing by Browser Language**:
   - Use `{accept-language.primary}` with modifiers in a ternary.

6. **Routing by Date or Time**:
   - Use `time()` and `datetime()` in the condition.

7. **Handling Missing Link Map Keys**:
   - If a key is not found, the rule does not redirect, and the engine tries the next rule by priority.

8. **Migrating Blogs with Regex**:
   - Use regex in the `source` to redirect old blog paths to new ones.

9. **Stripping `www` to Apex Domain**:
   - Use regex to redirect from `www` to the apex domain while preserving query parameters.

## Limits and constraints
- **Field Limits**: 
  - `limit` query parameter can be set from 1 to 100 (default is 20).
- **Authentication**: 
  - `domainGroupId` is required for API calls.
- **Redirect Rules**: 
  - Wildcard `source` cannot be used with `linkMapId`.
  - Empty ternary branches can lead to unexpected behavior.
- **Regex Constraints**: 
  - Regex `source` must not use the `g` flag.

## Related docs and API areas
- **API Endpoints**:
  - `GET /api/v1/redirect-rules`: List rules.
  - `GET /api/v1/redirect-rules/:id`: Get a specific rule.
  - `POST /api/v1/redirect-rules`: Create a new rule.
  - `PUT /api/v1/redirect-rules/:id`: Update an existing rule.
  - `DELETE /api/v1/redirect-rules/:id`: Soft-delete a rule.
  - `GET /api/v1/redirect-rules/analytics`: Retrieve traffic analytics.
  - `POST /api/v1/redirect-rules/simulate`: Batch simulation of redirect rules.

- **Related Guides**:
  - [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
  - [Link maps](./link-maps.md)
  - [Link map entries](./link-map-entries.md)
  - [Redirect tests](./redirect-tests.md)
  - [Domains and domain groups](./domains-and-groups.md)
