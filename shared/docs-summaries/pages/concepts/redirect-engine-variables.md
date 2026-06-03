---
source: shared/docs/pages/concepts/redirect-engine-variables.md
generatedAt: 2026-06-03T16:56:58.719Z
model: gpt-4o-mini
---

## Purpose
This document is for developers working with the LinkShift redirect engine, explaining how to use request variables, modifiers, and function placeholders in redirect rules.

## What this doc covers
- **Request variables**: Overview of how to use variables derived from incoming requests.
- **Domain variables**: Detailed placeholders for domain-related data extracted from the request hostname.
- **Path variables**: Placeholders for segments of the request path.
- **Query variables**: How to access query parameters as placeholders.
- **Request metadata**: Placeholders for various request metadata like HTTP method and client IP.
- **Modifiers**: How to apply modifiers to placeholders for data transformation.
- **Function placeholders**: Usage of functions like `{time()}` and `{random(min,max)}` in destination strings.
- **Functions in conditions**: Syntax for using functions directly in ternary conditions.
- **Escaping literal braces**: How to include literal `{` or `}` in destination strings.
- **Missing placeholders**: Behavior when placeholders are missing in the output.

## Key workflows and rules
1. **Using Request Variables**:
   - Placeholders are defined using `{placeholder}` syntax.
   - Domain, path, and query variables can be accessed based on the incoming request.

2. **Modifiers**:
   - Modifiers are appended after a colon (e.g., `{query.code:to_upper_case.url_encode}`).
   - They operate on the result of the placeholder, applied in left-to-right order.

3. **Function Placeholders**:
   - Functions like `{time()}` and `{random(min,max)}` can be used in destination strings.
   - In ternary conditions, call functions without curly braces (e.g., `random(0,100) < 30`).

4. **Handling Missing Placeholders**:
   - If a placeholder is missing and has no modifiers, it remains unchanged in the output.
   - If a modifier chain is present but the value is missing, the raw key name may be used as input.

## Limits and constraints
- **Domain Variables**: The `{domain.root}` is derived as the second-to-last label from the hostname, which may not correspond to the registrable apex.
- **Path Variables**: Only existing segments are set; if a segment is missing and there is no modifier chain, it remains unchanged.
- **Query Variables**: The last occurrence of a query parameter is used if it appears multiple times.
- **Modifiers**: Non-numeric input with math modifiers may produce `NaN`. Invalid percent-sequences in `url_decode` keep the previous value.
- **Function Placeholders**: Invalid arguments for functions like `{random(min,max)}` fail validation at rule save time.
- **Country Routing**: The `{geo.country}` placeholder is planned but not currently available.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Conditionals](./redirect-engine-conditionals.md)
- [Edge cases](./redirect-engine-edge-cases.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Simulate before rollout](../guides/redirect-rules-operations.md#simulate-before-rollout)
