---
source: shared/docs/pages/concepts/redirect-engine-concepts.md
generatedAt: 2026-05-26T21:09:33.708Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers using the LinkShift redirect engine, explaining its concepts, placeholders, modifiers, and workflows.

## What this doc covers
- **Request variables**: Details on domain, path, and query variables.
- **Modifiers**: How to apply transformations to placeholders.
- **Function placeholders**: Using functions like `{time()}` and `{random(min,max)}` in destinations.
- **Conditional routing syntax**: Ternary expressions for dynamic destinations.
- **Validation summary**: Rules for creating and updating redirect rules.
- **Link map concepts**: Handling link maps and their rules.
- **Routing decision flow**: Detailed steps in the redirect process.
- **Regex and plain path rules**: Differences in how they are processed.
- **Advanced engineering FAQ**: Common issues and their resolutions.

## Key workflows and rules
1. **Request Variable Extraction**:
   - Domain variables are extracted from the hostname.
   - Path variables are derived from the request path.
   - Query variables are mapped to `{query.paramName}`.

2. **Modifiers**:
   - Use syntax like `{query.code:to_upper_case.url_encode}`.
   - Modifiers are applied left to right.

3. **Function Placeholders**:
   - `{time()}` returns the current timestamp.
   - `{random(min,max)}` generates a random integer within specified bounds.

4. **Conditional Routing**:
   - Use ternary expressions for dynamic routing: `Condition ? TrueBranch : FalseBranch`.

5. **Redirect Pipeline**:
   - Incoming requests are checked against organization limits, rules are loaded, and matches are processed sequentially.

## Limits and constraints
- **Source/Destination Length**: Maximum of 16,384 characters each.
- **Nesting Limit**: Maximum of 32 levels for nested conditionals.
- **Rate Limits**: Redirects are limited to `redirectionLimitPerMinute` per organization.
- **Blocked Rules**: Rules marked as `isBlocked` are excluded from matching.
- **Blacklist Checks**: Absolute URLs are checked against a domain blacklist; root-relative paths are exempt.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [Redirect tests guide](../guides/redirect-tests.md)
- Simulate endpoint: `POST /api/v1/redirect-rules/simulate` for testing without enforcing rate limits.
