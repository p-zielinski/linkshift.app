---
source: shared/docs/pages/guides/redirect-rules.md
generatedAt: 2026-05-26T21:11:04.005Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how to create and manage redirect rules for routing requests.

## What this doc covers
- How routing works
- Organization redirect rate limits
- Propagation and caching
- Rule fields and their purposes
- Path matching and query matching
- HTTP method matching
- Priority and rule ordering
- Static and dynamic destinations
- Link maps and redirect rules
- Validation of rules
- Simulate before rollout
- Analytics for redirect rules
- Common scenarios and recipes

## Key workflows and rules
1. **Creating a Redirect Rule**:
   - Define `source`, `destination`, `statusCode`, `pathMatch`, `queryMatch`, and `matchMethod`.
   - Use `POST /api/v1/redirect-rules` to create a rule.

2. **Testing Redirects**:
   - Use `POST /api/v1/redirect-rules/simulate` to evaluate sample requests against current live rules.

3. **Link Map Integration**:
   - Create a link map with key-value pairs.
   - Set `linkMapId` in the redirect rule to use the link map.

4. **Handling Rate Limits**:
   - Monitor `redirectionLimitPerMinute` to avoid `429 Too Many Requests`.

5. **Dynamic Destinations**:
   - Use placeholders and conditionals in the `destination` field for dynamic routing.

## Limits and constraints
- **Rate Limits**: `redirectionLimitPerMinute` applies to all live requests.
- **Field Limits**: 
  - `source` and `destination` max length: 16,384 characters.
  - Maximum 6 methods allowed in `matchMethod`.
- **Validation Rules**: Rules are validated on creation, checking for proper syntax and limits.
- **Simulate Requests**: Does not consume rate limits and can return `402` for access issues.

## Related docs and API areas
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- [Link maps guide](./link-maps.md)
- [Redirect tests](./redirect-tests.md)
- `GET /api/v1/redirect-rules`
- `GET /api/v1/organization/usage`
- `GET /api/v1/redirect-rules/analytics`
