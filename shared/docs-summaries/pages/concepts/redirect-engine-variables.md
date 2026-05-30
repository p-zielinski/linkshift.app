---
source: shared/docs/pages/concepts/redirect-engine-variables.md
generatedAt: 2026-05-30T06:59:14.442Z
model: gpt-4o-mini
---

## Purpose
This document is for developers configuring the redirect engine, explaining request variables, modifiers, and function placeholders used in redirect rules.

## What this doc covers
- **Request variables**: Overview of variables derived from incoming requests, including domain, path, query, and metadata variables.
- **Domain variables**: Detailed breakdown of placeholders for domain components (e.g., `{domain.fqdn}`, `{domain.label}`).
- **Path variables**: Explanation of placeholders for request path segments (e.g., `{path}`, `{segments.N}`).
- **Query variables**: Description of how query parameters are represented (e.g., `{query.paramName}`).
- **Request metadata**: List of placeholders for request metadata (e.g., `{method}`, `{ip}`, `{user-agent}`).
- **Modifiers**: How to apply modifiers to placeholders (e.g., `to_lower_case`, `url_encode`).
- **Function placeholders**: Use of functions like `{time()}` and `{random(min,max)}` in destination strings.
- **Functions in conditions**: Syntax for using functions directly in ternary conditions.
- **Escaping literal braces**: Method to include literal `{` or `}` in destination strings.
- **Missing placeholders**: Behavior when placeholders are not found in the request.

## Key workflows and rules
1. **Using Request Variables**:
   - Placeholders are used in the format `{placeholder}` within destination URLs and conditions.
   - Domain variables are derived from the request hostname, with specific rules for each placeholder.
   - Path and query variables are derived from the request path and query string, respectively.

2. **Modifiers**:
   - Modifiers are appended after a colon (e.g., `{query.code:to_upper_case}`).
   - They are applied in left-to-right order and can be chained.

3. **Function Placeholders**:
   - Functions like `{time()}` and `{random(min,max)}` can be used in destination strings.
   - In conditions, functions are called without curly braces (e.g., `random(0,100)`).

4. **Handling Missing Placeholders**:
   - If a placeholder is missing and has no modifiers, it remains unchanged in the output.
   - If a modifier is present but the value is missing, the raw key name may be passed into the modifier.

## Limits and constraints
- **Domain Variables**: The `{domain.root}` is derived from the second-to-last label of the hostname, which may not be the registrable apex.
- **Path Variables**: Only existing segments are set; missing segments remain as literal placeholders if no modifiers are applied.
- **Query Variables**: In case of duplicate query parameters, the last occurrence is used in `{query.paramName}`.
- **Modifiers**: Non-numeric input with math modifiers may produce `NaN`. Invalid modifier names result in a validation error during API create/update.
- **Country Routing**: The planned feature for country-based routing via `{geo.country}` is not currently available.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Conditionals](./redirect-engine-conditionals.md)
- [Edge cases](./redirect-engine-edge-cases.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Simulate before rollout](../guides/redirect-rules-operations.md#simulate-before-rollout)
