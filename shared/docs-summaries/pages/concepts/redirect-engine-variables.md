---
source: shared/docs/pages/concepts/redirect-engine-variables.md
generatedAt: 2026-06-08T20:07:07.272Z
model: gpt-4o-mini
---

## Purpose
This document is for developers using the LinkShift redirect engine, explaining the request variables, modifiers, and function placeholders available for configuring redirects.

## What this doc covers
- **Request variables**: Overview of variables derived from incoming requests, including:
  - **Domain variables**: `{domain.fqdn}`, `{domain.label}`, `{domain.root}`, `{domain.extension}`, `{domain.subdomain}`, `{domain.subdomains.N}`
  - **Path variables**: `{path}`, `{segments.N}`
  - **Query variables**: `{query.paramName}`
  - **Request metadata**: `{method}`, `{ip}`, `{user-agent}`, `{accept-language}`, `{accept-language.primary}`
- **Modifiers**: How to apply modifiers to placeholders, including:
  - Examples of modifiers like `to_lower_case`, `url_encode`, `multiply_10`, etc.
- **Function placeholders**: Usage of `{time()}` and `{random(min,max)}` in destination strings.
- **Functions in conditions**: Syntax for using functions like `time()` and `random()` directly in ternary conditions.
- **Escaping literal braces**: How to include literal `{` or `}` in destination strings.
- **Missing placeholders**: Behavior when placeholders do not exist.

## Key workflows and rules
1. **Using Request Variables**:
   - Placeholders are used in `{placeholder}` syntax within destination URLs and conditions.
   - Domain variables are derived from the request hostname, with specific rules for how labels are assigned.
   - Path and query variables are extracted from the request path and query string, respectively.

2. **Applying Modifiers**:
   - Modifiers are appended after a colon and can be chained together.
   - Example: `{query.code:to_upper_case.url_encode}` applies `to_upper_case` and then `url_encode`.

3. **Using Function Placeholders**:
   - Functions like `{time()}` and `{random(min,max)}` can be used in destination strings.
   - In conditions, use `time()` and `random(min,max)` without curly braces.

4. **Escaping Braces**:
   - To include literal braces in a destination, double them: `{{` becomes `{` and `}}` becomes `}`.

5. **Handling Missing Placeholders**:
   - If a placeholder is missing and has no modifiers, it remains unchanged in the output.
   - If a modifier chain is present but the value is missing, the raw key name may be passed to the modifiers.

## Limits and constraints
- **Domain Variables**: The engine does not support generic `{header.*}` or `{cookie.*}` placeholders; cookie-based routing is not supported.
- **Modifiers**: Invalid modifiers result in a validation error during API create/update; at runtime, they are skipped with a warning.
- **Function Placeholders**: Arguments for functions like `{random(min,max)}` must be safe integers; invalid arguments fail validation.
- **Country Routing**: The planned feature for country-based routing via `{geo.country}` is not available and has no current implementation.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Conditionals](./redirect-engine-conditionals.md)
- [Edge cases](./redirect-engine-edge-cases.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Simulate before rollout](../guides/redirect-rules-operations.md#simulate-before-rollout)
