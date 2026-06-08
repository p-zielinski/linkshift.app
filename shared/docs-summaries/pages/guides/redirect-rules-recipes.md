---
source: shared/docs/pages/guides/redirect-rules-recipes.md
generatedAt: 2026-06-08T20:11:30.704Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to implement redirect rules in LinkShift, providing recipes, anti-patterns, and API endpoints.

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

3. **Running an A/B Test**:
   - Use a ternary with `random()` in `destination` to randomly route traffic.

4. **Routing by User-Agent**:
   - Use `~=` or `includes` in a ternary to check the User-Agent.

5. **Routing by Browser Language**:
   - Use `{accept-language.primary}` in a ternary to route based on the user's language.

6. **Routing by Date or Time**:
   - Use `time()` and `datetime()` in the condition to control routing based on time.

7. **Handling Link Map Misses**:
   - If a key is not found in the link map, the rule does not redirect, and the engine tries the next rule by priority.

8. **Migrating a Blog with Regex**:
   - Use regex in the `source` to match and redirect blog URLs.

9. **Stripping `www` to Apex Domain**:
   - Use regex to redirect from `www` to the apex domain while preserving query parameters.

## Limits and constraints
- **Query Parameters**: The `limit` for listing rules is 1–100 (default 20).
- **Field Requirements**: `domainGroupId` is required for API requests.
- **Regex Limitations**: Regex sources must use capturing groups for `$1` substitution.
- **Redirect Method Limitations**: The `destination` must start with `http://`, `https://`, or `/`.
- **Empty Ternary Branches**: Must not be empty to avoid unexpected behavior.

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
