---
source: shared/docs/pages/guides/redirect-rules-recipes.md
generatedAt: 2026-06-03T17:00:15.548Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers looking to implement and troubleshoot redirect rules in LinkShift, providing recipes and anti-patterns for effective routing.

## What this doc covers
- **How-To cookbook**: Quick answers to common routing questions.
- **Recipe book**: Common scenarios for implementing redirect rules.
- **Anti-patterns**: Common mistakes and better approaches.
- **API endpoints**: Details on available API methods for managing redirect rules.

## Key workflows and rules
1. **Creating Short Links**:
   - Create a link map with entries (`key` → `https://…` URL).
   - Create a redirect rule with `source: "/go"`, `pathMatch: "prefix"`, `queryMatch: "ignore"`, `linkMapId`, `destination: null`.
   - Verify with a simulation for path `/go/your-key`.

2. **Redirecting Only GET Requests**:
   - Set `matchMethod: ["GET"]` on the rule.

3. **Running A/B Tests**:
   - Use a ternary in `destination` with `random()`, e.g., `random(0,100) < 50 ? https://example.com/a : https://example.com/b`.

4. **Routing by User-Agent**:
   - Use `~=` or `includes` in a ternary to check the `{user-agent}`.

5. **Routing by Browser Language**:
   - Use `{accept-language.primary}` in a ternary to determine the destination based on the request's `Accept-Language` header.

6. **Routing by Date or Time**:
   - Use `time()` and `datetime()` in the condition to check the current date/time.

7. **Handling Missing Link Map Keys**:
   - If a key is not found, the rule does not redirect; the engine tries the next rule by priority.

8. **Migrating Blogs with Regex**:
   - Use regex in `source` to match and redirect, e.g., `source: "/^\\/blog\\/(.+)$/"`.

9. **Stripping `www` to Apex Domain**:
   - Use regex to redirect from `www` to the apex domain while preserving query parameters.

## Limits and constraints
- **API Limits**:
  - `limit` for listing rules is between 1–100 (default is 20).
- **Field Requirements**:
  - `domainGroupId` is required for API requests.
  - `destination` must start with `http://`, `https://`, or `/`.
- **Regex Constraints**:
  - Regex `source` must not use the `g` flag.
  - `$0` or `$1` in `destination` requires a regex `source`.
- **Query Matching**:
  - Wildcard `source` with `queryMatch: "exact"` ignores query gating.
- **Non-Deterministic A/B Tests**:
  - Avoid using `random()` as a hard CI gate due to non-deterministic behavior.

## Related docs and API areas
- **API Endpoints**:
  - `GET /api/v1/redirect-rules`: List rules.
  - `GET /api/v1/redirect-rules/:id`: Get a specific rule.
  - `POST /api/v1/redirect-rules`: Create a new rule.
  - `PUT /api/v1/redirect-rules/:id`: Update an existing rule.
  - `DELETE /api/v1/redirect-rules/:id`: Soft-delete a rule.
  - `GET /api/v1/redirect-rules/analytics`: Get traffic analytics.
  - `POST /api/v1/redirect-rules/simulate`: Batch simulation of redirect rules.
- **Related Guides**:
  - [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
  - [Link maps](./link-maps.md)
  - [Link map entries](./link-map-entries.md)
  - [Redirect tests](./redirect-tests.md)
  - [Domains and domain groups](./domains-and-groups.md)
