---
source: shared/docs/pages/concepts/redirect-engine-variables.md
generatedAt: 2026-06-07T10:03:50.051Z
model: gpt-4o-mini
---

## Purpose
This document is for developers working with the LinkShift redirect engine, explaining how to use request variables, modifiers, and function placeholders in redirect rules.

## What this doc covers
- **Request variables**: Overview of how variables are derived from incoming requests.
- **Domain variables**: Detailed placeholders for domain-related data.
- **Path variables**: Placeholders for segments of the request path.
- **Query variables**: Placeholders for query parameters in the request.
- **Request metadata**: Placeholders for metadata like HTTP method and client IP.
- **Modifiers**: How to apply modifiers to placeholders.
- **Function placeholders**: Usage of functions like `{time()}` and `{random(min,max)}` in destinations.
- **Functions in conditions**: Syntax for using functions directly in ternary conditions.
- **Escaping literal braces**: How to include literal braces in destination strings.
- **Missing placeholders**: Behavior when placeholders are missing in the output.

## Key workflows and rules
1. **Using Request Variables**:
   - Placeholders are defined using `{placeholder}` syntax.
   - Domain variables are derived from the `Host` header and include `{domain.fqdn}`, `{domain.label}`, `{domain.root}`, `{domain.extension}`, and `{domain.subdomain}`.
   - Path variables are derived from the request path, e.g., `{path}` and `{segments.N}`.
   - Query variables are derived from query parameters, e.g., `{query.paramName}`.

2. **Modifiers**:
   - Modifiers are appended after a colon and can be chained, e.g., `{query.code:to_upper_case.url_encode}`.
   - Modifiers include `to_lower_case`, `url_encode`, `multiply_10`, etc.
   - The order of modifiers is left to right.

3. **Function Placeholders**:
   - Functions like `{time()}` and `{random(min,max)}` can be used in destination strings.
   - In conditions, use `time()` and `random(min,max)` without curly braces.

4. **Escaping Braces**:
   - To include literal braces, double them: `{{` becomes `{` and `}}` becomes `}`.

5. **Handling Missing Placeholders**:
   - If a placeholder is missing and has no modifiers, it remains unchanged in the output.

## Limits and constraints
- **Domain Variables**: The engine splits hostnames based on `.` and assigns values accordingly. For example, `{domain.root}` is the second-to-last label unless there are fewer than two labels.
- **Path Variables**: Only existing segments are set; missing segments remain unchanged unless a modifier chain is present.
- **Query Variables**: If a query parameter appears multiple times, the last occurrence is used for substitution.
- **Modifiers**: Non-numeric input with math modifiers may produce `NaN`. Invalid percent-sequences in `url_decode` keep the previous value.
- **Function Placeholders**: Invalid arguments for functions like `{random(min,max)}` will fail validation at rule save time.
- **Country Routing**: The `{geo.country}` placeholder is planned but not currently available.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Conditionals](./redirect-engine-conditionals.md)
- [Edge cases](./redirect-engine-edge-cases.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Simulate before rollout](../guides/redirect-rules-operations.md#simulate-before-rollout)
